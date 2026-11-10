"""Delivery API: ADA, the dispatch assistant.

The browser sends the conversation (last 8 turns) and a small picture of the workspace: vendors, products with
their unit price and what is in the warehouse, riders with their zone and how many units they carry today, open
orders and deliveries awaiting payment. Claude answers with a draft plan in names only (stock to receive,
deliveries to create, whether to dispatch the open orders, messages to riders) or with an answer. The browser
matches the names to real records, checks stock and each rider's daily allocation, and nothing is saved until a
person taps Approve.

Run:  pip install -r requirements.txt && uvicorn server:app --port 8001
Env:  ANTHROPIC_API_KEY (or an `ant auth login` profile), optional ADA_MODEL and CORS_ORIGINS.
      STATIC_DIR (optional): a built frontend to serve from the same site, as on Render (see Dockerfile).
"""
import json
import logging
import os
import re
from typing import Any, Dict, List

import anthropic
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

import auth
import workspace
from db import db

log = logging.getLogger("ada")
logging.basicConfig(level=logging.INFO)

MODEL = os.environ.get("ADA_MODEL", "claude-opus-5-5")

# Fixed text, so it is cached between requests; only the conversation and the workspace picture change.
SYSTEM = """You are ADA, the dispatch assistant inside a delivery company's app. Vendors hand the company products, each with a unit price. The company gives each bike rider a daily allocation of units and a list of customers to deliver to. A delivery counts as done when the rider has delivered it and the payment is confirmed; then the units leave "left" and join "delivered".

Your job is to turn what the company says into a plan the app can show for approval, or to answer questions from the workspace data you are given. You never save anything yourself.

Rules:
- kind "plan" when they tell you about stock that came in, deliveries to make, orders to dispatch, or messages to send to riders.
- stock: every product a vendor dropped off. vendor is the vendor's name as listed (or as said if new), product as said, qty as a number, unit (bottle, pair, box...), price is the unit price in naira only if they said it, else 0.
- deliveries: only one-off deliveries they describe (customer, phone, address, zone if obvious, items with product and qty, time as 24-hour HH:MM if they said one, rider name only if they named one, vendor only if they said it).
- dispatch_orders: true when they ask to dispatch, assign, send out or plan the open orders, or when they tell you stock came in and say to take it from there. Do not copy open orders into deliveries; the app assigns them.
- messages: text to send to riders. rider is a rider's first name, or "all".
- kind "answer" for questions. Answer only from the workspace data: delivered, paid, left, in the warehouse, with riders, awaiting payment, open orders. If the data doesn't say, say you can't see it.
- kind "other" for anything not about this delivery business; reply briefly that you can only help with deliveries, stock, riders and vendors.
- Never invent products, riders, customers, prices or numbers.
- reply: one or two short plain sentences. No markdown, no lists."""

STR = {"type": "string"}
SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "kind": {"type": "string", "enum": ["plan", "answer", "other"]},
        "reply": STR,
        "stock": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"vendor": STR, "product": STR, "qty": {"type": "number"}, "unit": STR, "price": {"type": "number"}},
                "required": ["vendor", "product", "qty", "unit", "price"],
                "additionalProperties": False,
            },
        },
        "deliveries": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "customer": STR, "phone": STR, "address": STR, "zone": STR, "time": STR, "rider": STR, "vendor": STR, "note": STR,
                    "items": {
                        "type": "array",
                        "items": {"type": "object", "properties": {"product": STR, "qty": {"type": "number"}}, "required": ["product", "qty"], "additionalProperties": False},
                    },
                },
                "required": ["customer", "phone", "address", "zone", "time", "rider", "vendor", "note", "items"],
                "additionalProperties": False,
            },
        },
        "dispatch_orders": {"type": "boolean"},
        "messages": {
            "type": "array",
            "items": {"type": "object", "properties": {"rider": STR, "text": STR}, "required": ["rider", "text"], "additionalProperties": False},
        },
    },
    "required": ["kind", "reply", "stock", "deliveries", "dispatch_orders", "messages"],
    "additionalProperties": False,
}

TIME = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class Turn(BaseModel):
    role: str
    text: str


class AdaRequest(BaseModel):
    messages: List[Turn]
    context: Dict[str, Any] = Field(default_factory=dict)


def cut(value: Any, n: int) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()[:n]


def clean(r: Dict[str, Any]) -> Dict[str, Any]:
    """Keep only what the app can use: known kinds, real numbers, real times, short strings."""
    kind = r.get("kind") if r.get("kind") in ("plan", "answer", "other") else "other"
    out: Dict[str, Any] = {"kind": kind, "reply": cut(r.get("reply"), 500), "stock": [], "deliveries": [], "dispatchOrders": False, "messages": []}
    if kind != "plan":
        return out
    for s in r.get("stock", [])[:40]:
        qty = max(0, int(s.get("qty") or 0))
        if qty and cut(s.get("product"), 80):
            out["stock"].append({"vendor": cut(s.get("vendor"), 80), "product": cut(s.get("product"), 80), "qty": qty, "unit": cut(s.get("unit"), 20), "price": max(0, float(s.get("price") or 0))})
    for d in r.get("deliveries", [])[:30]:
        items = [{"product": cut(i.get("product"), 80), "qty": max(0, int(i.get("qty") or 0))} for i in d.get("items", [])[:20]]
        items = [i for i in items if i["qty"] and i["product"]]
        if items:
            out["deliveries"].append({
                "customer": cut(d.get("customer"), 80), "phone": cut(d.get("phone"), 30), "address": cut(d.get("address"), 160), "zone": cut(d.get("zone"), 40),
                "time": d.get("time") if TIME.match(d.get("time") or "") else "", "rider": cut(d.get("rider"), 40), "vendor": cut(d.get("vendor"), 80),
                "note": cut(d.get("note"), 200), "items": items,
            })
    out["dispatchOrders"] = bool(r.get("dispatch_orders"))
    out["messages"] = [{"rider": cut(m.get("rider"), 40), "text": cut(m.get("text"), 600)} for m in r.get("messages", [])[:20] if cut(m.get("text"), 600)]
    return out


HAS_KEY = bool(os.environ.get("ANTHROPIC_API_KEY"))
try:
    client = anthropic.Anthropic(timeout=60.0, max_retries=1)
except Exception as err:  # no key and no profile: the browser's own ADA answers instead
    log.warning("ADA has no Claude access (%s); the app will use the in-browser assistant", err)
    client = None

app = FastAPI(title="Delivery API")
# The app and the API share one address on Render, so cross-site access is off unless CORS_ORIGINS lists sites.
if os.environ.get("CORS_ORIGINS"):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.environ["CORS_ORIGINS"].split(","),
        allow_credentials=True,
        allow_methods=["POST", "GET", "PUT", "DELETE"],
        allow_headers=["Content-Type"],
    )


app.include_router(auth.router(workspace.new_workspace))
app.include_router(workspace.router())


@app.on_event("startup")
def prepare_database() -> None:
    try:
        db.setup()
    except Exception as err:  # a brand new Render database can take a minute; requests retry setup
        log.warning("Database not ready yet: %s", err)


@app.get("/api/health")
def health() -> Dict[str, str]:
    try:
        db.setup()
        storage = "ok"
    except Exception:
        storage = "starting"
    return {"status": "ok", "storage": storage, "model": MODEL, "claude": "on" if client is not None and HAS_KEY else "off"}


@app.post("/api/ada")
def ada(body: AdaRequest, user=Depends(auth.require_company)):
    if client is None:
        return {"kind": "error"}
    turns = [{"role": "assistant" if t.role == "assistant" else "user", "text": cut(t.text, 1200)} for t in body.messages[-8:]]
    turns = [t for t in turns if t["text"]]
    while turns and turns[0]["role"] != "user":
        turns.pop(0)
    if not turns or turns[-1]["role"] != "user":
        return {"kind": "other", "reply": ""}

    workspace = json.dumps(body.context, sort_keys=True)[:20000]
    messages = [{"role": t["role"], "content": t["text"]} for t in turns]
    messages[-1]["content"] = f"Workspace (JSON):\n{workspace}\n\nThe company says: {turns[-1]['text']}"

    try:
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=4000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}},
            system=[{"type": "text", "text": SYSTEM, "cache_control": {"type": "ephemeral"}}],
            messages=messages,
        )
    except anthropic.RateLimitError:
        log.warning("ADA rate limited")
        return {"kind": "error"}
    except anthropic.APIStatusError as err:
        log.error("ADA API error %s: %s", err.status_code, err.message)
        return {"kind": "error"}
    except anthropic.APIConnectionError as err:
        log.error("ADA connection error: %s", err)
        return {"kind": "error"}
    except TypeError as err:  # no API key set: the browser's own ADA answers instead
        log.warning("ADA has no Claude access: %s", err)
        return {"kind": "error"}

    if response.usage:
        log.info("ADA: %s input, %s cached, %s output tokens", response.usage.input_tokens, response.usage.cache_read_input_tokens or 0, response.usage.output_tokens)
    if response.stop_reason in ("refusal", "max_tokens"):
        return {"kind": "error"}
    text = next((b.text for b in response.content if b.type == "text"), "")
    try:
        return clean(json.loads(text))
    except (ValueError, TypeError):
        return {"kind": "error"}


# On Render the built app is served from here too, so the app and /api share one address.
# Every other address is a page of the app (/, /signin, /company, /rider ...), so it gets index.html.
STATIC_DIR = os.environ.get("STATIC_DIR")
if STATIC_DIR and os.path.isdir(STATIC_DIR):
    ROOT = os.path.realpath(STATIC_DIR)

    @app.get("/{path:path}", include_in_schema=False)
    def app_page(path: str):
        if path.startswith("api/"):
            raise HTTPException(404, "Not found.")
        file = os.path.realpath(os.path.join(ROOT, path))
        if path and file.startswith(ROOT + os.sep) and os.path.isfile(file):
            cache = "public, max-age=31536000, immutable" if path.startswith("static/") else "no-cache"
            return FileResponse(file, headers={"Cache-Control": cache})
        return FileResponse(os.path.join(ROOT, "index.html"), headers={"Cache-Control": "no-cache"})

"""WhatsApp: ADA talks to riders and vendors where they already are.

Everything the office tells a rider or vendor in the app goes to their WhatsApp too, and what they answer on WhatsApp
updates the app live. Nothing new to learn for a rider: they get their drops on WhatsApp, reply YES, COLLECTED,
ARRIVED, DELIVERED, and tap one link to take the doorstep photo in the app.

  Riders   new drops (Accept / Can't take it), collect, arrive, deliver with the amount, problems, earnings, cash paid in
  Vendors  send orders or stock as a chat message; get "delivered", "couldn't deliver", stock counted and payouts back
  Company  every conversation shows on the WhatsApp page; staff can step in, and ADA goes quiet in that chat

How it fits: workspace.py calls on_change() after every save. New office messages and things worth telling someone
(a drop given to a rider, a delivery done, a payout) become WhatsApp messages marked "queued" in the workspace; the
next pass sends them and records sent / delivered / read / failed. Messages that arrive (webhook or the simulator)
go through receive(), which updates the workspace the same way the app does and writes ADA's answer.
"""
import asyncio
import base64
import json
import logging
import os
import re
import secrets
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import parse_qsl

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel, Field

import auth
import intake
import wa_providers
import workspace
from db import db, now

try:
    from zoneinfo import ZoneInfo

    TZ = ZoneInfo(os.environ.get("APP_TIMEZONE", "Africa/Lagos"))
except Exception:  # no tz database: Lagos is UTC+1 all year
    TZ = timezone(timedelta(hours=1))

log = logging.getLogger("whatsapp")
OFFICE = ("dispatcher", "ada", "company")
WINDOW = 24 * 3600
_base_urls: Dict[int, str] = {}


# ---------- small helpers, the same rules as the app's store.js ----------

def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z"


def today_iso() -> str:
    return datetime.now(TZ).date().isoformat()


def week_days(day: Optional[date] = None) -> List[str]:
    d = day or datetime.now(TZ).date()
    monday = d - timedelta(days=d.weekday())
    return [(monday + timedelta(days=i)).isoformat() for i in range(7)]


def clock(iso: Optional[str]) -> str:
    if not iso:
        return ""
    try:
        t = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(TZ)
    except ValueError:
        return ""
    return t.strftime("%I:%M %p").lstrip("0")


def time12(hhmm: str) -> str:
    if not re.match(r"^\d{2}:\d{2}$", hhmm or ""):
        return ""
    h, m = map(int, hhmm.split(":"))
    return f"{(h + 11) % 12 + 1}:{m:02d} {'PM' if h >= 12 else 'AM'}"


money = intake.money


def uid(prefix: str) -> str:
    return f"{prefix}-{secrets.token_hex(5)}"


def fees(state) -> Dict[str, int]:
    return {"delivery": 2000, "rider": 1000, **((state.get("company") or {}).get("fees") or {})}


def units(t) -> int:
    return sum((l.get("qty") or 0) + (l.get("free") or 0) for l in t.get("items", []))


def value(t) -> int:
    if t.get("amount") not in (None, ""):
        return int(float(t["amount"]))
    return int(sum((l.get("qty") or 0) * (l.get("price") or 0) for l in t.get("items", [])))


def collected(t) -> int:
    p = t.get("payment") or {}
    return int(p.get("amount") or 0) if p.get("method") != "unpaid" else 0


def is_paid(t) -> bool:
    return t.get("status") == "delivered" and bool((t.get("payment") or {}).get("confirmed"))


def cash_held(t) -> int:
    p = t.get("payment") or {}
    return collected(t) if t.get("status") == "delivered" and p.get("method") == "cash" and not p.get("handedIn") else 0


def vendor_payable(state, t) -> int:
    if t.get("status") != "delivered":
        return 0
    return max(0, ((collected(t) or value(t)) if is_paid(t) else 0) - fees(state)["delivery"])


def product(state, pid) -> Dict[str, Any]:
    return next((p for p in state.get("products", []) if p.get("id") == pid), {})


def line_label(state, l) -> str:
    name = product(state, l.get("productId")).get("name") or "item"
    if not l.get("qty") and l.get("free"):
        return f"{l['free']} free {name}"
    return f"{l.get('qty')} × {name}" + (f" + {l['free']} free" if l.get("free") else "")


def items_text(state, t) -> str:
    return ", ".join(line_label(state, l) for l in t.get("items", []))


def stamp(t, status) -> None:
    t["status"] = status
    t["history"] = list(t.get("history") or []) + [{"status": status, "at": now_iso()}]


def by_time(t) -> Tuple:
    return (0 if t.get("urgent") else 1, t.get("time") or t.get("end") or "99:99", t.get("ref") or "")


def settings(state) -> Dict[str, Any]:
    w = (state.get("company") or {}).get("whatsapp") or {}
    notify = {"drops": True, "riderUpdates": True, "vendorDeliveries": True, "vendorPayouts": True, "vendorStock": True, **(w.get("notify") or {})}
    return {"enabled": w.get("enabled", True), "autoReply": w.get("autoReply", True), "paused": w.get("paused") or {}, "notify": notify}


def key_of(m) -> Optional[str]:
    if m.get("riderId"):
        return f"rider:{m['riderId']}"
    if m.get("vendorId"):
        return f"vendor:{m['vendorId']}"
    return None


def person(state, key: str) -> Optional[Dict[str, Any]]:
    role, _, ref = key.partition(":")
    lst = state.get("riders" if role == "rider" else "vendors", [])
    rec = next((x for x in lst if x.get("id") == ref), None)
    if not rec:
        return None
    first = (rec.get("short") or rec.get("contact") or rec.get("name") or "").split(" ")[0]
    return {"role": role, "ref": ref, "name": rec.get("name", ""), "first": first, "phone": intake.phone_digits(rec.get("phone"))}


def contacts(state) -> Dict[str, Any]:
    c = state.get("waContacts")
    if not isinstance(c, dict):
        c = state["waContacts"] = {}
    return c


def base_url(wid: int, fallback: str = "") -> str:
    return (os.environ.get("APP_URL") or os.environ.get("RENDER_EXTERNAL_URL") or _base_urls.get(wid) or fallback or "http://localhost:3000").rstrip("/")


def link(wid: int, role: str, ref: str, target: str, name: str = "") -> str:
    try:
        return auth.make_link(wid, role, ref, target, base_url(wid), name)
    except Exception as err:  # the link is a convenience; the message still goes
        log.warning("Could not make a sign-in link: %s", err)
        return f"{base_url(wid)}{target}"


def office_message(key: str, text: str, kind: str = "", buttons=None, wa_text: str = "", **extra) -> Dict[str, Any]:
    role, _, ref = key.partition(":")
    m = {"id": uid("m"), "at": now_iso(), "read": False, "from": "ada", "text": text, "channel": "whatsapp", "wa": {"status": "queued"}, **extra}
    m["riderId" if role == "rider" else "vendorId"] = ref
    if kind:
        m["kind"] = kind
    if buttons:
        m["buttons"] = buttons
    if wa_text:
        m["waText"] = wa_text
    return m


# ---------- what ADA tells riders ----------

ACCEPT_BUTTONS = [{"id": "ACCEPT", "title": "Accept"}, {"id": "DECLINE", "title": "Can't take it"}]


def run_sheet(state, rider, tasks) -> str:
    rate = fees(state)["rider"]
    lines = []
    for n, t in enumerate(sorted(tasks, key=by_time), 1):
        when = f" by {time12(t.get('time'))}" if t.get("time") else ""
        lines.append(f"{n}) {'URGENT ' if t.get('urgent') else ''}{t.get('customer')}, {t.get('address')}: {items_text(state, t)}{when}. Collect {money(value(t))}.")
    u = sum(units(t) for t in tasks)
    return (f"Hi {rider['first']}, ADA here. {len(tasks)} new {'drop' if len(tasks) == 1 else 'drops'} for you today "
            f"({u} {'unit' if u == 1 else 'units'}, you earn {money(rate * len(tasks))}):\n" + "\n".join(lines))


def stop_text(state, t) -> str:
    bits = [f"*{t.get('ref')}* · {t.get('customer')}", t.get("address") or ""]
    if t.get("landmark"):
        bits.append(f"Landmark: {t['landmark']}")
    if t.get("phone"):
        bits.append(f"Call: {t['phone']}")
    bits.append(f"{items_text(state, t)}. Collect {money(value(t))}.")
    if t.get("note"):
        bits.append(f"Note: {t['note']}")
    return "\n".join(b for b in bits if b)


def next_stop_reply(state, rid) -> Tuple[str, Optional[List]]:
    on_road = sorted([t for t in state["tasks"] if t.get("riderId") == rid and t.get("date") == today_iso() and t.get("status") == "picked_up"], key=by_time)
    if on_road:
        return f"Next stop:\n{stop_text(state, on_road[0])}\n\nReply ARRIVED when you get there.", [{"id": "ARRIVED", "title": "Arrived"}, {"id": "PROBLEM", "title": "Problem"}]
    held = sum(cash_held(t) for t in state["tasks"] if t.get("riderId") == rid)
    if held:
        return f"That was your last drop today. 🎉 Please pay the {money(held)} cash you're holding into the company account, then reply PAID IN with the transfer ref.", [{"id": "EARNINGS", "title": "My earnings"}]
    return "That was your last drop today. 🎉 Great work.", [{"id": "EARNINGS", "title": "My earnings"}]


# ---------- on every save: what to send ----------

def plan(state_before, after, wid) -> Tuple[List[str], List[Dict[str, Any]]]:
    """Office messages to send on WhatsApp too, and new messages for things worth telling someone."""
    s = settings(after)
    before_ids = {m.get("id") for m in state_before.get("messages", [])}
    # A drop message is often saved a moment before or after the drops themselves: one WhatsApp per batch, not two.
    cutoff = (datetime.now(timezone.utc) - timedelta(seconds=120)).strftime("%Y-%m-%dT%H:%M:%S")
    recent_auto = {m.get("riderId") for m in after.get("messages", []) if m.get("kind") == "drop" and m.get("taskIds") and str(m.get("at") or "") >= cutoff}
    forward = [m["id"] for m in after.get("messages", []) if m.get("id") not in before_ids and m.get("from") in OFFICE and "wa" not in m and key_of(m)
               and not (m.get("kind") == "drop" and not m.get("taskIds") and m.get("riderId") in recent_auto)]
    covered = {m.get("riderId") for m in after.get("messages", []) if m.get("kind") == "drop" and not m.get("taskIds") and str(m.get("at") or "") >= cutoff and (m.get("id") in forward or "wa" in m)}
    new: List[Dict[str, Any]] = []
    old_tasks = {t.get("id"): t for t in state_before.get("tasks", [])}
    offers: Dict[str, List] = {}
    settled: Dict[str, List] = {}
    verified: Dict[str, List] = {}
    for t in after.get("tasks", []):
        o = old_tasks.get(t.get("id"))
        rid, vid = t.get("riderId"), t.get("vendorId")
        if t.get("status") == "assigned" and rid and not t.get("acceptedAt") and not t.get("declined") and (o is None or o.get("riderId") != rid):
            offers.setdefault(rid, []).append(t)
        if not o:
            continue
        if o.get("status") != "delivered" and t.get("status") == "delivered":
            if vid and s["notify"]["vendorDeliveries"]:
                rider = person(after, f"rider:{rid}") or {}
                pay = t.get("payment") or {}
                got = "Not paid at the door." if pay.get("method") == "unpaid" else f"Collected {money(collected(t))} ({pay.get('method', 'cash')})."
                new.append(office_message(f"vendor:{vid}", f"✅ Delivered to {t.get('customer')}{' (' + t['orderId'] + ')' if t.get('orderId') else ''}: {items_text(after, t)}. {got} Rider: {rider.get('first', '')}, {clock(now_iso())}.", kind="update", taskId=t["id"]))
            proof = t.get("proof") or {}
            if rid and proof.get("via") != "whatsapp" and s["notify"]["riderUpdates"]:
                text, buttons = next_stop_reply(after, rid)
                new.append(office_message(f"rider:{rid}", f"✅ {t.get('ref')} confirmed: {money(collected(t))} from {t.get('customer')}.\n\n{text}", kind="update", buttons=buttons, taskId=t["id"]))
        if o.get("status") != "failed" and t.get("status") == "failed" and vid and s["notify"]["vendorDeliveries"]:
            new.append(office_message(f"vendor:{vid}", f"⚠️ Couldn't deliver to {t.get('customer')}: {t.get('failReason') or 'no reason given'}. The office will try again or bring it back to stock.", kind="update", taskId=t["id"]))
        if not o.get("settled") and t.get("settled") and vid:
            settled.setdefault(vid, []).append(t)
        if not (o.get("payment") or {}).get("handInVerified") and (t.get("payment") or {}).get("handInVerified") and rid:
            verified.setdefault(rid, []).append(t)
    if s["notify"]["drops"]:
        for rid, tasks in offers.items():
            r = person(after, f"rider:{rid}")
            if not r or rid in covered:
                continue
            new.append(office_message(f"rider:{rid}", run_sheet(after, r, tasks), kind="drop", buttons=ACCEPT_BUTTONS, taskIds=[t["id"] for t in tasks]))
    if s["notify"]["vendorPayouts"]:
        for vid, tasks in settled.items():
            total = sum(vendor_payable(after, t) for t in tasks)
            ref = (tasks[0].get("settled") or {}).get("ref") or ""
            new.append(office_message(f"vendor:{vid}", f"💸 Payout sent: {money(total)} for {len(tasks)} {'order' if len(tasks) == 1 else 'orders'}{'. Ref: ' + ref if ref else ''}. Reply BALANCE any time to see what's owed.", kind="update"))
    for rid, tasks in verified.items():
        new.append(office_message(f"rider:{rid}", f"🏦 The office confirmed the {money(sum(collected(t) for t in tasks))} you paid in. Thank you!", kind="update"))
    if s["notify"]["vendorStock"]:
        old_in = {i.get("id"): i for i in state_before.get("intake", [])}
        for i in after.get("intake", []):
            o = old_in.get(i.get("id"))
            if o and o.get("status") == "sent" and i.get("status") == "received":
                name = product(after, i.get("productId")).get("name", "item")
                note = f" (you sent {o.get('qty')})" if o.get("qty") != i.get("qty") else ""
                new.append(office_message(f"vendor:{i.get('vendorId')}", f"📦 The office counted in {i.get('qty')} × {name}{note}. They're in stock now.", kind="update"))
    return forward, new


def drop_footer(wid, state, m) -> str:
    r = person(state, f"rider:{m['riderId']}") or {}
    return f"\n\nReply YES to accept, or NO if you can't take them.\nOpen in the app: {link(wid, 'rider', m['riderId'], '/rider', r.get('name', ''))}"


async def on_change(wid: int, before: Optional[Dict[str, Any]], after: Dict[str, Any], url: str = "") -> None:
    try:
        if url:
            _base_urls[wid] = url.rstrip("/")
        if before is None or not settings(after)["enabled"]:
            return
        forward, new = plan(before, after, wid)
        if forward or new:
            footers = {}
            for m in after.get("messages", []):
                if m.get("id") in forward and m.get("kind") == "drop" and m.get("riderId"):
                    footers[m["id"]] = await asyncio.to_thread(drop_footer, wid, after, m)
            for m in new:
                if m.get("kind") == "drop":
                    m["waText"] = m["text"] + await asyncio.to_thread(drop_footer, wid, after, m)

            def enqueue(st):
                ids = set(forward)
                for m in st.get("messages", []):
                    if m.get("id") in ids and "wa" not in m:
                        m["wa"] = {"status": "queued"}
                        if m["id"] in footers:
                            m["waText"] = m["text"] + footers[m["id"]]
                            m["buttons"] = ACCEPT_BUTTONS
                have = {m.get("id") for m in st.get("messages", [])}
                st.setdefault("messages", []).extend(m for m in new if m["id"] not in have)

            await workspace.mutate(wid, enqueue)
        was = {m.get("id"): (m.get("wa") or {}).get("status") for m in before.get("messages", [])}
        queued = [m for m in after.get("messages", []) if (m.get("wa") or {}).get("status") == "queued" and was.get(m.get("id")) != "queued"]
        if queued:
            await send(wid, after, queued)
    except Exception:
        log.exception("WhatsApp update failed")


async def send(wid: int, state, msgs: List[Dict[str, Any]]) -> None:
    line = wa_providers.line
    seen = contacts(state)
    results = {}
    for m in msgs:
        key = key_of(m)
        p = person(state, key) if key else None
        if not p or not p["phone"]:
            results[m["id"]] = {"status": "no_number", "at": now_iso()}
            continue
        last_in = (seen.get(key) or {}).get("lastIn") or 0
        res = await asyncio.to_thread(line.send, p["phone"], m.get("waText") or m["text"], m.get("buttons"), now() - last_in > WINDOW)
        results[m["id"]] = {"status": res.get("status"), "id": res.get("id", ""), "at": now_iso(), **({"error": res["error"]} if res.get("error") else {})}

    def record(st):
        for m in st.get("messages", []):
            if m.get("id") in results:
                m["wa"] = {**(m.get("wa") or {}), **results[m["id"]]}
                k = key_of(m)
                if k:
                    contacts(st).setdefault(k, {})["lastOut"] = now()

    await workspace.mutate(wid, record)


# ---------- what riders and vendors send ----------

BUTTON_INTENTS = {"ACCEPT": "accept", "DECLINE": "decline", "COLLECTED": "collected", "ARRIVED": "arrived", "DELIVERED": "delivered",
                  "PROBLEM": "problem", "EARNINGS": "earnings", "NEXT": "next", "HELP": "help", "PAID_CASH": "amount", "PAID_TRANSFER": "amount",
                  "NOT_PAID": "amount", "BALANCE": "balance", "TODAY": "today", "REASON_1": "reason", "REASON_2": "reason", "REASON_3": "reason"}
REASONS = {"REASON_1": "Customer not picking calls", "REASON_2": "Wrong or unclear address", "REASON_3": "Customer refused the order"}


def _amount(t: str) -> Optional[int]:
    t = re.sub(r"\bdl-?\d+\b|\bord-?\d+\b", " ", t, flags=re.I)
    t = intake.PHONE.sub(" ", t)
    m = re.search(r"(?:₦|\bn|\bngn\s?)?\s?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s?(k\b)?", t, re.I)
    if not m:
        return None
    n = float(m.group(1).replace(",", "")) * (1000 if m.group(2) else 1)
    return int(round(n)) if n >= 50 else None


def _method(t: str) -> Optional[str]:
    if re.search(r"\b(not paid|didn'?t pay|did not pay|no pay|never pay|owes?|unpaid|pay later)\b", t):
        return "unpaid"
    if re.search(r"\b(transfer|transferred|trf|bank|sent to account)\b", t):
        return "transfer"
    if re.search(r"\b(pos|card)\b", t):
        return "pos"
    if re.search(r"\b(cash|kudi|owo)\b", t):
        return "cash"
    return None


def rider_intent(text: str, button: str = "") -> Dict[str, Any]:
    t = re.sub(r"\s+", " ", (text or "").lower()).strip()
    ref = re.search(r"\bdl-?(\d+)\b", t)
    out: Dict[str, Any] = {"intent": "unknown", "amount": _amount(t), "method": _method(t), "reason": "", "ref": f"DL-{ref.group(1)}" if ref else ""}
    if button:
        out["intent"] = BUTTON_INTENTS.get(button, "unknown")
        if button == "PAID_CASH":
            out["method"] = "cash"
        elif button == "PAID_TRANSFER":
            out["method"] = "transfer"
        elif button == "NOT_PAID":
            out["method"], out["amount"] = "unpaid", 0
        if button in REASONS:
            out["reason"] = REASONS[button]
        return out
    w = re.sub(r"[^\w\s']", " ", t).strip()
    if re.fullmatch(r"(help|menu|hi|hello|hey|start|options|good (morning|afternoon|evening))", w):
        out["intent"] = "help"
    elif re.search(r"\b(paid in|i have paid|i don pay|i've paid|sent the money|remit+ed|remit|paid the cash|deposited)\b", t):
        out["intent"] = "paid_in"
        r = re.search(r"\b(?:ref(?:erence)?|trf|transaction)\s*[:#-]?\s*([a-z0-9-]{4,})", t)
        out["reason"] = r.group(1).upper() if r else ""
    elif re.search(r"\b(earn|earning|earnings|my pay|how much (did|have|do) i|wallet|salary|my money|commission)\b", t):
        out["intent"] = "earnings"
    elif re.search(r"\b(not picking|no answer|not answering|unreachable|switched off|not reachable|refused|rejected|reject|cancel+ed|wrong address|can'?t find|cannot find|couldn'?t find|not around|not at home|not delivered|couldn'?t deliver|can'?t deliver|cannot deliver|failed|problem|issue|e no work|no dey)\b", t):
        out["intent"] = "problem"
        out["reason"] = "" if re.fullmatch(r"(problem|issue|i have a problem|there'?s a problem)", w) else text.strip()
    elif re.fullmatch(r"(1|yes|y|yeah|yep|ok|okay|accept|accepted|i accept|i'?ll take (it|them)|i will take (it|them)|sure|no wahala|i dey|confirm|confirmed|oya)", w):
        out["intent"] = "accept"
    elif re.match(r"^(2|no|nope|decline|can'?t|cannot|not available|i no fit|busy|i'?m busy)\b", w):
        out["intent"] = "decline"
        out["reason"] = text.strip() if len(w.split()) > 1 else ""
    elif re.search(r"\b(collected|picked up|picked|i have (the|them|it)|got (them|it|the goods)|i don collect|have collected|pickup done|picked them)\b", t):
        out["intent"] = "collected"
    elif re.search(r"\b(arrived|arrive|i'?m here|i am here|at the (location|gate|door|house|address|office)|reached|i don reach|don reach|outside)\b", t):
        out["intent"] = "arrived"
    elif re.search(r"\b(delivered|deliver|done|completed|complete|i don deliver|don deliver|dropped|handed (it )?over|customer (has )?(collected|received|got it)|received it)\b", t):
        out["intent"] = "delivered"
    elif re.search(r"\b(next|my drops|drops|list|route|where next|what'?s next|today)\b", t):
        out["intent"] = "next"
    elif out["amount"] is not None or out["method"]:
        out["intent"] = "amount"
    return out


def vendor_intent(state, vendor_id: str, text: str, button: str = "") -> Dict[str, Any]:
    t = re.sub(r"\s+", " ", (text or "").lower()).strip()
    if button:
        return {"intent": BUTTON_INTENTS.get(button, "unknown")}
    w = re.sub(r"[^\w\s']", " ", t).strip()
    cancel = re.search(r"\bcancel\b.*\b(ord-?\d+)\b", t)
    if cancel:
        return {"intent": "cancel", "ref": "ORD-" + re.sub(r"\D", "", cancel.group(1))}
    if intake.looks_like_orders(text) and intake.PHONE.search(text):
        return {"intent": "orders"}
    if re.fullmatch(r"(help|menu|hi|hello|hey|start|options|good (morning|afternoon|evening))", w):
        return {"intent": "help"}
    if re.search(r"\b(balance|payout|pay ?out|owed|owe me|how much|my money|settle|settlement|paid me|payment)\b", t):
        return {"intent": "balance"}
    if intake.STOCK_WORDS.search(t):
        lines, _ = intake.read_stock(state, text, vendor_id)
        if lines:
            return {"intent": "stock"}
    if re.search(r"\b(today|status|report|update|deliveries|how far|summary)\b", t):
        return {"intent": "today"}
    return {"intent": "unknown"}


CLAUDE_SYSTEM = """You read one WhatsApp message a {role} sent to a delivery company's assistant and say what they mean.
Rider intents: accept (takes the new drops), decline (can't take them), collected (picked up the parcels at the office), arrived (at the customer), delivered (handed over; amount and method if said), amount (only says how much was collected), problem (could not deliver; reason), earnings, next (what's next / my drops), paid_in (paid cash into the company account; ref), help, unknown.
Vendor intents: orders (customer orders with name, phone, address), stock (stock being sent to the office), balance (money owed or payouts), today (how today's deliveries are going), help, unknown.
The message may be in Nigerian Pidgin, Yoruba, Igbo or Hausa mixed with English. amount is in naira (25k = 25000), 0 if not said. method is cash, transfer, pos, unpaid or none."""


def claude_intent(role: str, text: str) -> Optional[Dict[str, Any]]:
    if not os.environ.get("ANTHROPIC_API_KEY") or not text.strip():
        return None
    try:
        import anthropic

        client = anthropic.Anthropic(timeout=20.0, max_retries=0)
        schema = {"type": "object", "additionalProperties": False, "required": ["intent", "amount", "method", "reason"], "properties": {
            "intent": {"type": "string", "enum": ["accept", "decline", "collected", "arrived", "delivered", "amount", "problem", "earnings", "next", "paid_in", "orders", "stock", "balance", "today", "help", "unknown"]},
            "amount": {"type": "number"}, "method": {"type": "string", "enum": ["cash", "transfer", "pos", "unpaid", "none"]}, "reason": {"type": "string"}}}
        res = client.messages.create(
            model=os.environ.get("ADA_MODEL", "claude-opus-5-5"), max_tokens=300,
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": schema}},
            system=CLAUDE_SYSTEM.format(role=role), messages=[{"role": "user", "content": text[:1500]}],
        )
        out = json.loads(next((b.text for b in res.content if b.type == "text"), "{}"))
        return {"intent": out.get("intent", "unknown"), "amount": int(out["amount"]) if out.get("amount") else None,
                "method": None if out.get("method") in (None, "none") else out["method"], "reason": out.get("reason", ""), "ref": ""}
    except Exception as err:
        log.info("Claude couldn't read a WhatsApp message: %s", err)
        return None


# ---------- ADA and a rider ----------

RIDER_HELP = ("Hi {first}, I'm ADA, the office assistant. You can reply:\n"
              "YES / NO — take or turn down new drops\nCOLLECTED — you have the parcels\nARRIVED — you're at the customer\n"
              "DELIVERED 25000 CASH — done, with what you collected\nPROBLEM — couldn't deliver\nNEXT — your drops today\n"
              "EARNINGS — what you've made\nPAID IN — you paid cash into the company account\nAnything else goes to the office.")


def amount_buttons(t) -> List[Dict[str, str]]:
    v = money(value(t))
    return [{"id": "PAID_CASH", "title": f"{v} cash"[:20]}, {"id": "PAID_TRANSFER", "title": f"{v} transfer"[:20]}, {"id": "NOT_PAID", "title": "Not paid"}]


def deliver(t, amount: int, method: str, photo: Optional[str]) -> None:
    stamp(t, "delivered")
    t["proof"] = {"photo": photo, "receivedBy": "", "note": "", "at": now_iso(), "via": "whatsapp", **({} if photo else {"photoPending": True})}
    unpaid = method == "unpaid"
    t["payment"] = {"method": method, "amount": 0 if unpaid else amount, "confirmed": not unpaid, "at": None if unpaid else now_iso()}
    if unpaid:
        t["proof"]["note"] = f"Not paid at the door. Owes {money(value(t))}."
    t.pop("waPhoto", None)


def rider_turn(st, wid: int, rid: str, it: Dict[str, Any], photo: Optional[str], memo: Dict[str, Any]) -> Optional[Tuple[str, Optional[List]]]:
    r = person(st, f"rider:{rid}")
    today = today_iso()
    mine = [t for t in st["tasks"] if t.get("riderId") == rid]
    active = sorted([t for t in mine if t.get("date") == today and t.get("status") in ("assigned", "picked_up")], key=by_time)
    offers = [t for t in active if t["status"] == "assigned" and not t.get("acceptedAt") and not t.get("declined")]
    to_collect = [t for t in active if t["status"] == "assigned" and t.get("acceptedAt")]
    on_road = [t for t in active if t["status"] == "picked_up"]
    by_ref = next((t for t in mine if it.get("ref") and t.get("ref") == it["ref"]), None)
    current = by_ref or next((t for t in on_road if t.get("arrivedAt")), None) or (on_road[0] if on_road else None)
    aw = memo.get("awaiting") or {}
    waiting_task = next((t for t in mine if t.get("id") == aw.get("taskId")), None)
    intent = it["intent"]
    deep = lambda t, what="deliver": link(wid, "rider", rid, f"/rider?drop={t['id']}&do={what}", r["name"])  # noqa: E731

    # An answer to the question ADA just asked.
    if aw.get("what") == "reason" and waiting_task and waiting_task["status"] == "picked_up" and intent in ("unknown", "reason", "problem") and (it.get("reason") or intent == "unknown"):
        intent, it = "problem", {**it, "reason": it.get("reason") or it.get("text", "")}
        current = waiting_task
    if aw.get("what") == "amount" and waiting_task and waiting_task["status"] == "picked_up" and intent in ("amount", "delivered") and (it.get("amount") is not None or it.get("method")):
        intent, current = "delivered", waiting_task
    if photo and intent in ("unknown", "delivered", "amount", "photo"):
        pending = sorted([t for t in mine if t.get("status") == "delivered" and (t.get("proof") or {}).get("photoPending")], key=lambda t: (t.get("proof") or {}).get("at") or "", reverse=True)
        if pending and intent not in ("delivered", "amount"):
            t = pending[0]
            t["proof"] = {**t["proof"], "photo": photo, "photoPending": False}
            memo.pop("awaiting", None)
            return f"📸 Photo saved for {t.get('customer')} ({t.get('ref')}). Thank you!", None
        if current and intent not in ("delivered", "amount"):
            current["waPhoto"] = photo
            memo["awaiting"] = {"what": "amount", "taskId": current["id"]}
            return f"📸 Got the photo for {current.get('customer')}. How much did you collect?", amount_buttons(current)

    if intent == "help":
        return RIDER_HELP.format(first=r["first"]), [{"id": "NEXT", "title": "My drops"}, {"id": "EARNINGS", "title": "My earnings"}]

    if intent == "accept":
        if offers:
            for t in offers:
                t["acceptedAt"] = now_iso()
                t["declined"] = None
            u = sum(units(t) for t in offers)
            return (f"Thanks {r['first']}! {len(offers)} {'drop' if len(offers) == 1 else 'drops'} accepted ({u} {'unit' if u == 1 else 'units'}). "
                    "Collect them at the office, then reply COLLECTED."), [{"id": "COLLECTED", "title": "Collected"}]
        if to_collect:
            return "You've already accepted these. Collect them at the office, then reply COLLECTED.", [{"id": "COLLECTED", "title": "Collected"}]
        return "You have no new drops to accept right now. I'll message you when the office sends some.", None

    if intent == "decline" and offers:
        for t in offers:
            t["declined"] = {"reasons": [it.get("reason") or "Said no on WhatsApp"], "note": "", "at": now_iso()}
        return "No problem, I've told the office you can't take them. They'll give them to someone else.", None
    if intent == "decline" and not current:
        return "You have no new drops to turn down right now.", None
    if intent == "decline":
        intent = "problem"

    if intent == "collected":
        targets = offers + to_collect
        if not targets:
            return ("You've already collected today's drops." if on_road else "There's nothing to collect right now."), None
        for t in targets:
            t["acceptedAt"] = t.get("acceptedAt") or now_iso()
            stamp(t, "picked_up")
        text, buttons = next_stop_reply(st, rid)
        return f"Great, {len(targets)} {'drop' if len(targets) == 1 else 'drops'} on the way. {text}", buttons

    if intent == "arrived":
        if not current:
            if to_collect or offers:
                return "Collect your parcels at the office first, then reply COLLECTED.", [{"id": "COLLECTED", "title": "Collected"}]
            return "I don't see a drop on the road for you. Reply NEXT to see your drops.", None
        current["arrivedAt"] = now_iso()
        return (f"You're at {current.get('customer')}. Collect {money(value(current))}.\n\n"
                f"Tap to take the photo and confirm payment:\n{deep(current)}\n\nOr reply DELIVERED with the amount, e.g. DELIVERED {value(current)} CASH."), [{"id": "DELIVERED", "title": "Delivered"}, {"id": "PROBLEM", "title": "Problem"}]

    if intent in ("delivered", "amount"):
        t = current
        if not t:
            if intent == "amount":
                return None
            return "I don't see a drop on the road for you. Reply NEXT to see your drops.", None
        amount, method = it.get("amount"), it.get("method")
        if method == "unpaid":
            amount = 0
        if amount is None and method:
            amount = value(t)
        if amount is None:
            memo["awaiting"] = {"what": "amount", "taskId": t["id"]}
            return f"Nice! How much did you collect from {t.get('customer')}?", amount_buttons(t)
        photo_now = photo or t.get("waPhoto")
        deliver(t, amount, method or "cash", photo_now)
        memo.pop("awaiting", None)
        paid = "Not paid at the door — the office will follow up." if method == "unpaid" else f"{money(amount)} {method or 'cash'} recorded."
        extra = "" if photo_now else f"\n\nLast step: add the doorstep photo. Tap {deep(t, 'photo')} or send the photo here."
        text, buttons = next_stop_reply(st, rid)
        return f"✅ {t.get('ref')} delivered to {t.get('customer')}. {paid}{extra}\n\n{text}", buttons

    if intent in ("problem", "reason"):
        t = current
        if not t:
            return "I don't see a drop on the road for you. I've passed your message to the office.", None
        reason = (it.get("reason") or "").strip()
        if not reason:
            memo["awaiting"] = {"what": "reason", "taskId": t["id"]}
            return f"Sorry about that. What happened with {t.get('customer')}?", [{"id": "REASON_1", "title": "Not picking calls"}, {"id": "REASON_2", "title": "Wrong address"}, {"id": "REASON_3", "title": "Customer refused"}]
        stamp(t, "failed")
        t["failReason"] = reason[:200]
        memo.pop("awaiting", None)
        text, buttons = next_stop_reply(st, rid)
        return f"OK, I've marked {t.get('customer')} as not delivered: \"{reason[:120]}\". Keep the parcel safe; the office will tell you what to do with it.\n\n{text}", buttons

    if intent == "earnings":
        rate = fees(st)["rider"]
        days = week_days()
        done_today = [t for t in mine if t.get("date") == today and t.get("status") == "delivered"]
        week = [t for t in mine if t.get("date") in days and t.get("status") == "delivered"]
        held = sum(cash_held(t) for t in mine)
        left = len([t for t in active if not (t["status"] == "assigned" and not t.get("acceptedAt"))])
        lines = [f"💰 Today: {money(len(done_today) * rate)} for {len(done_today)} {'drop' if len(done_today) == 1 else 'drops'}" + (f", {left} still to go" if left else "") + ".",
                 f"This week: {money(len(week) * rate)} for {len(week)} drops."]
        if held:
            lines.append(f"Cash you're holding: {money(held)}. Pay it into the company account and reply PAID IN.")
        lines.append(f"See it all in the app: {link(wid, 'rider', rid, '/rider?tab=earnings', r['name'])}")
        return "\n".join(lines), None

    if intent == "next":
        if offers:
            return run_sheet(st, r, offers) + "\n\nReply YES to accept, or NO if you can't take them.", ACCEPT_BUTTONS
        if to_collect:
            return f"Collect {sum(units(t) for t in to_collect)} units at the office for {len(to_collect)} {'drop' if len(to_collect) == 1 else 'drops'}, then reply COLLECTED.", [{"id": "COLLECTED", "title": "Collected"}]
        if on_road:
            rest = "\n".join(f"{n}) {t.get('customer')}, {t.get('address')}" for n, t in enumerate(on_road[1:], 2))
            return f"Next stop:\n{stop_text(st, on_road[0])}" + (f"\n\nAfter that:\n{rest}" if rest else "") + "\n\nReply ARRIVED when you get there.", [{"id": "ARRIVED", "title": "Arrived"}, {"id": "PROBLEM", "title": "Problem"}]
        return "No drops for you right now. I'll message you when the office sends some.", None

    if intent == "paid_in":
        held = [t for t in mine if cash_held(t) > 0]
        if not held:
            return "You're not holding any cash for the office right now. Thank you!", None
        total = sum(cash_held(t) for t in held)
        for t in held:
            t["payment"] = {**t["payment"], "handedIn": {"at": now_iso(), "ref": it.get("reason") or ""}}
        return f"Thanks! I've told the office you paid in {money(total)}{' (ref ' + it['reason'] + ')' if it.get('reason') else ''}. They'll confirm once it's in the bank.", None

    return None


# ---------- ADA and a vendor ----------

VENDOR_HELP = ("Hi {first}, I'm ADA from {company}. Send me:\n"
               "• Your orders, as you'd normally type them (name, phone, address, item, amount). One or many in a message.\n"
               "• Stock you're sending, e.g. \"Sending 50 serum and 20 black soap\".\n"
               "BALANCE — what we owe you and payouts\nTODAY — how today's deliveries are going\nCANCEL ORD-3310 — call off an order\n"
               "Anything else goes to the office.")


def vendor_turn(st, wid: int, vid: str, it: Dict[str, Any], text: str, who: Dict[str, Any]) -> Optional[Tuple[str, Optional[List]]]:
    v = person(st, f"vendor:{vid}")
    vrec = next((x for x in st.get("vendors", []) if x.get("id") == vid), {})
    who = {"id": who.get("id"), "name": who.get("name") or vrec.get("contact") or vrec.get("name")}
    company = (st.get("company") or {}).get("name") or "the office"
    intent = it["intent"]
    if intent == "help":
        return VENDOR_HELP.format(first=v["first"], company=company), [{"id": "BALANCE", "title": "Balance"}, {"id": "TODAY", "title": "Today"}]

    if intent == "orders":
        found = intake.read_orders(st, text, vid, today=datetime.now(TZ).date())
        if not found:
            return None
        top = 3300
        for o in st.get("orders", []):
            d = re.sub(r"\D", "", str(o.get("id")))
            if d:
                top = max(top, int(d))
        lines, fixes = [], []
        for n, raw in enumerate(found, 1):
            o = intake.to_order(st, raw)
            top += 1
            o.update({"id": f"ORD-{top}", "createdAt": now_iso(), "placedBy": "vendor", "via": "whatsapp", "by": {"id": who.get("id"), "name": who.get("name"), "role": "vendor"}})
            st.setdefault("orders", []).insert(0, o)
            what = ", ".join(line_label(st, l) for l in o["items"]) or "no item"
            label = f"{o['id']} {o.get('customer') or 'no name'}" + (f", {o['zone']}" if o.get("zone") else "")
            if o["status"] == "open":
                lines.append(f"✅ {label}: {what}. Collect {money(o.get('amount'))}.")
            else:
                fixes.append(f"⚠️ {label}: {' '.join(o['issues'])}")
        reply = f"Got {len(found)} {'order' if len(found) == 1 else 'orders'}. " + ("They're with the office for a rider." if not fixes else "")
        reply += "\n" + "\n".join(lines + fixes)
        if fixes:
            reply += "\n\nSend the orders marked ⚠️ again with what's missing, or fix them in the app."
        return reply.strip(), None

    if intent == "stock":
        lines, unknown = intake.read_stock(st, text, vid)
        for l in lines:
            p = product(st, l["productId"])
            st.setdefault("intake", []).insert(0, {"id": uid("in"), "vendorId": vid, "productId": l["productId"], "qty": l["qty"], "price": p.get("price") or 0,
                                                   "at": now_iso(), "note": "Sent on WhatsApp", "status": "sent", "by": {"id": who.get("id"), "name": who.get("name"), "role": "vendor"}})
        got = ", ".join(f"{l['qty']} × {product(st, l['productId']).get('name')}" for l in lines)
        extra = f"\nI don't have {', '.join(unknown)} in your products yet. Add it in the app first." if unknown else ""
        return f"📦 Noted: {got}. The office will count it in when it arrives, and I'll tell you.{extra}", None

    if intent == "balance":
        mine = [t for t in st.get("tasks", []) if t.get("vendorId") == vid and t.get("status") == "delivered"]
        owed = [t for t in mine if is_paid(t) and not t.get("settled")]
        waiting = [t for t in mine if not is_paid(t)]
        days = week_days()
        paid = [t for t in mine if t.get("settled") and (t["settled"].get("at") or "")[:10] in days]
        lines = [f"💸 We owe you {money(sum(vendor_payable(st, t) for t in owed))} for {len(owed)} delivered {'order' if len(owed) == 1 else 'orders'} (after the {money(fees(st)['delivery'])} delivery fee each)."]
        if waiting:
            lines.append(f"{len(waiting)} more delivered, payment still being checked.")
        if paid:
            lines.append(f"Paid out this week: {money(sum(vendor_payable(st, t) for t in paid))}.")
        lines.append(f"Details: {link(wid, 'vendor', vid, '/vendor', v['name'])}")
        return "\n".join(lines), None

    if intent == "today":
        today = today_iso()
        mine = [t for t in st.get("tasks", []) if t.get("vendorId") == vid and t.get("date") == today]
        done = [t for t in mine if t.get("status") == "delivered"]
        road = [t for t in mine if t.get("status") in ("assigned", "picked_up")]
        failed = [t for t in mine if t.get("status") == "failed"]
        waiting = [o for o in st.get("orders", []) if o.get("vendorId") == vid and o.get("status") == "open"]
        fix = [o for o in st.get("orders", []) if o.get("vendorId") == vid and o.get("status") == "needs_fix"]
        lines = [f"Today so far: {len(done)} delivered ({money(sum(collected(t) for t in done))} collected), {len(road)} on the way, {len(failed)} not delivered."]
        if waiting:
            lines.append(f"{len(waiting)} {'order is' if len(waiting) == 1 else 'orders are'} waiting for a rider.")
        if fix:
            lines.append(f"{len(fix)} {'order needs' if len(fix) == 1 else 'orders need'} a fix: " + "; ".join(f"{o['id']} {o.get('customer') or ''}: {' '.join(o.get('issues') or [])}" for o in fix[:3]))
        return "\n".join(lines), None

    if intent == "cancel":
        o = next((o for o in st.get("orders", []) if o.get("id") == it.get("ref") and o.get("vendorId") == vid), None)
        if not o:
            return f"I can't find {it.get('ref')} among your orders.", None
        if o.get("status") not in ("open", "needs_fix"):
            return f"{o['id']} is already with a rider, so I've passed your message to the office.", None
        o["status"] = "cancelled"
        return f"Done, {o['id']} for {o.get('customer')} is cancelled.", None
    return None


# ---------- receiving ----------

def find_contact(digits: str) -> Optional[Tuple[int, str, str, Dict[str, Any]]]:
    """Which company, and which rider or vendor, a WhatsApp number belongs to."""
    if not digits:
        return None
    row = db.one("SELECT id, workspace_id, role, ref, name FROM users WHERE phone = %s AND role IN ('rider', 'vendor') ORDER BY last_seen DESC", ("+" + digits,))
    if row and row[3]:
        return row[1], row[2], row[3], {"id": row[0], "name": row[4]}
    for wid, text in db.all("SELECT id, state::text FROM workspace"):
        try:
            st = json.loads(text)
        except ValueError:
            continue
        for role, lst in (("rider", st.get("riders", [])), ("vendor", st.get("vendors", []))):
            for x in lst:
                if intake.phone_digits(x.get("phone")) == digits:
                    return int(wid), role, x["id"], {"id": None, "name": x.get("contact") or x.get("name")}
    return None


def store_photo(wid: int, mime: str, data: bytes) -> str:
    pid = secrets.token_urlsafe(12)
    db.execute("INSERT INTO photos (id, workspace_id, mime, data, created_at) VALUES (%s, %s, %s, %s, %s)", (pid, wid, mime, db.blob(data), now()))
    return f"/api/photos/{pid}"


def first_time(digits: str) -> bool:
    """False if this WhatsApp message id was already handled."""
    try:
        db.execute("INSERT INTO wa_seen (id, created_at) VALUES (%s, %s)", (digits, now()))
        return True
    except Exception:
        return False


async def receive(wid: int, role: str, ref: str, text: str = "", photo: Optional[str] = None, button: str = "", wa_id: str = "", who: Optional[Dict[str, Any]] = None, url: str = "") -> None:
    """One message from a rider or vendor: shown in the office's inbox, acted on by ADA, answered."""
    if url:
        _base_urls[wid] = url.rstrip("/")
    who = who or {}
    key = f"{role}:{ref}"
    rough = rider_intent(text, button) if role == "rider" else None
    if role == "rider" and rough["intent"] == "unknown" and text and not photo:
        smart = await asyncio.to_thread(claude_intent, "rider", text)
        if smart and smart["intent"] != "unknown":
            rough = {**rough, **{k: v for k, v in smart.items() if v not in (None, "")}}
    if rough is not None:
        rough["text"] = text

    def apply(st):
        if not person(st, key):
            return False
        msg = {"id": uid("m"), "at": now_iso(), "read": False, "from": role, "text": text or ("📷 Photo" if photo else ""), "channel": "whatsapp", "wa": {"status": "received", "id": wa_id}}
        msg["riderId" if role == "rider" else "vendorId"] = ref
        if photo:
            msg["photo"] = photo
        if button:
            msg["button"] = button
        if who.get("name") and role == "vendor":
            msg["by"] = {"id": who.get("id"), "name": who.get("name"), "role": "vendor"}
        st.setdefault("messages", []).append(msg)
        memo = contacts(st).setdefault(key, {})
        memo["lastIn"] = now()
        s = settings(st)
        if not s["enabled"] or not s["autoReply"] or s["paused"].get(key):
            return
        if role == "rider":
            out = rider_turn(st, wid, ref, rough, photo, memo)
        else:
            it = vendor_intent(st, ref, text, button)
            out = vendor_turn(st, wid, ref, it, text, who)
        if out is None:
            last = memo.get("passedAt") or 0
            if now() - last < 600:
                return  # don't say "passed to the office" after every line of a chat
            memo["passedAt"] = now()
            out = ("Thanks, I've passed your message to the office. Reply HELP to see what I can do.", None)
        reply, buttons = out
        st["messages"].append(office_message(key, reply, kind="reply", buttons=buttons))

    await workspace.mutate(wid, apply, url)


async def receive_from(digits: str, text: str = "", media: Optional[Tuple[str, bytes]] = None, button: str = "", wa_id: str = "", url: str = "") -> None:
    found = await asyncio.to_thread(find_contact, digits)
    if not found:
        log.info("WhatsApp from a number that isn't linked to anyone")
        await asyncio.to_thread(wa_providers.line.send, digits, "Hi! This number isn't linked to a Delivery account yet. Ask the delivery company you work with to add your WhatsApp number to your profile.")
        return
    wid, role, ref, who = found
    photo = await asyncio.to_thread(store_photo, wid, media[0], media[1]) if media and media[1] else None
    await receive(wid, role, ref, text, photo, button, wa_id, who, url)


# ---------- routes ----------

class Simulated(BaseModel):
    contact: str = Field(max_length=80)
    text: str = Field(default="", max_length=4000)
    button: str = Field(default="", max_length=40)
    image: Optional[str] = Field(default=None, max_length=9_000_000)


class Settings(BaseModel):
    enabled: Optional[bool] = None
    autoReply: Optional[bool] = None
    paused: Optional[Dict[str, bool]] = None
    notify: Optional[Dict[str, bool]] = None


DATA_URL = re.compile(r"^data:(image/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$")


def router() -> APIRouter:
    api = APIRouter(prefix="/api")

    @api.get("/whatsapp/status")
    def status(request: Request, user=Depends(auth.require_company)):
        line = wa_providers.line
        base = base_url(user["workspaceId"], str(request.base_url))
        return {
            "provider": line.name, "live": line.live, "ready": line.ready(), "missing": line.missing(),
            "number": wa_providers.DISPLAY_NUMBER, "simulator": not line.live,
            "webhook": f"{base}/api/whatsapp/{'twilio' if line.name == 'twilio' else 'webhook'}",
            "claude": bool(os.environ.get("ANTHROPIC_API_KEY")),
        }

    @api.post("/whatsapp/simulate")
    async def simulate(body: Simulated, request: Request, user=Depends(auth.require_company)):
        """The phone simulator on the company's WhatsApp page: a message as if this rider or vendor sent it."""
        if wa_providers.line.live:
            raise HTTPException(409, "The simulator is off while a real WhatsApp number is connected.")
        role, _, ref = body.contact.partition(":")
        if role not in ("rider", "vendor") or not ref:
            raise HTTPException(400, "Pick a rider or vendor.")
        photo = None
        if body.image:
            m = DATA_URL.match(body.image)
            if not m:
                raise HTTPException(400, "That photo can't be read.")
            photo = await asyncio.to_thread(store_photo, user["workspaceId"], m.group(1), base64.b64decode(m.group(2)))
        if not (body.text.strip() or body.button or photo):
            raise HTTPException(400, "Type a message.")
        await receive(user["workspaceId"], role, ref, body.text.strip(), photo, body.button, f"sim-{secrets.token_hex(6)}", {}, str(request.base_url))
        return {"ok": True}

    @api.put("/whatsapp/settings")
    async def save_settings(body: Settings, user=Depends(auth.require_company)):
        patch = body.model_dump(exclude_none=True)

        def apply(st):
            w = dict((st.setdefault("company", {})).get("whatsapp") or {})
            for k, v in patch.items():
                w[k] = {**(w.get(k) or {}), **v} if isinstance(v, dict) else v
            if "paused" in w:
                w["paused"] = {k: True for k, v in w["paused"].items() if v}
            st["company"]["whatsapp"] = w

        await workspace.mutate(user["workspaceId"], apply)
        return {"ok": True}

    # Meta: the one-time check when the webhook is set up in the Meta app dashboard.
    @api.get("/whatsapp/webhook")
    def verify(request: Request):
        q = request.query_params
        line = wa_providers.line
        if q.get("hub.mode") == "subscribe" and isinstance(line, wa_providers.Meta) and line.verify_token and q.get("hub.verify_token") == line.verify_token:
            return PlainTextResponse(q.get("hub.challenge", ""))
        raise HTTPException(403, "Wrong verify token.")

    @api.post("/whatsapp/webhook")
    async def meta_events(request: Request):
        line = wa_providers.line
        raw = await request.body()
        if not isinstance(line, wa_providers.Meta) or not line.check_signature(raw, request.headers.get("x-hub-signature-256")):
            raise HTTPException(403, "Bad signature.")
        try:
            body = json.loads(raw)
        except ValueError:
            return {"ok": True}
        url = base_url(0, str(request.base_url))
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                val = change.get("value") or {}
                for st in val.get("statuses", []):
                    await status_update(st.get("id", ""), st.get("status", ""), (st.get("errors") or [{}])[0].get("title", ""))
                for m in val.get("messages", []):
                    if not await asyncio.to_thread(first_time, m.get("id", "")):
                        continue
                    kind = m.get("type")
                    text, button, media = "", "", None
                    if kind == "text":
                        text = (m.get("text") or {}).get("body", "")
                    elif kind == "interactive":
                        rep = (m.get("interactive") or {}).get("button_reply") or (m.get("interactive") or {}).get("list_reply") or {}
                        text, button = rep.get("title", ""), rep.get("id", "")
                    elif kind == "button":
                        text = button = (m.get("button") or {}).get("payload", "")
                    elif kind == "image":
                        text = (m.get("image") or {}).get("caption", "")
                        media = await asyncio.to_thread(line.media, (m.get("image") or {}).get("id", ""))
                    else:
                        text = f"[{kind} message]"
                    asyncio.get_running_loop().create_task(receive_from(intake.phone_digits(m.get("from")), text, media, button, m.get("id", ""), url))
        return {"ok": True}

    # Twilio: messages and delivery reports both arrive here as a form.
    @api.post("/whatsapp/twilio")
    async def twilio_events(request: Request):
        line = wa_providers.line
        raw = (await request.body()).decode()
        params = dict(parse_qsl(raw, keep_blank_values=True))
        url = str(request.url)
        if request.headers.get("x-forwarded-proto") == "https":
            url = url.replace("http://", "https://", 1)
        if not isinstance(line, wa_providers.Twilio) or not line.check_signature(url, params, request.headers.get("x-twilio-signature")):
            raise HTTPException(403, "Bad signature.")
        if params.get("MessageStatus") and not params.get("Body") and not params.get("NumMedia"):
            await status_update(params.get("MessageSid", ""), params["MessageStatus"], params.get("ErrorMessage", ""))
            return Response(status_code=204)
        sid = params.get("MessageSid", "")
        if not await asyncio.to_thread(first_time, sid):
            return Response(status_code=204)
        media = None
        if int(params.get("NumMedia") or 0) and params.get("MediaContentType0", "").startswith("image/"):
            media = await asyncio.to_thread(line.media, params.get("MediaUrl0", ""))
        digits = intake.phone_digits(params.get("From", "").replace("whatsapp:", ""))
        base = base_url(0, str(request.base_url))
        asyncio.get_running_loop().create_task(receive_from(digits, params.get("Body", ""), media, params.get("ButtonPayload", ""), sid, base))
        return Response(status_code=204)

    return api


STATUS_ORDER = {"queued": 0, "sent": 1, "delivered": 2, "read": 3, "failed": 4, "undelivered": 4}


async def status_update(provider_id: str, status: str, error: str = "") -> None:
    """sent -> delivered -> read (or failed), from Meta or Twilio, onto the message in the workspace."""
    if not provider_id or not status:
        return
    status = "failed" if status == "undelivered" else status
    if status not in STATUS_ORDER:
        return
    rows = await asyncio.to_thread(db.all, "SELECT id FROM workspace WHERE state::text LIKE %s", (f"%{provider_id}%",))
    for (wid,) in rows:
        def apply(st):
            hit = False
            for m in st.get("messages", []):
                wa = m.get("wa") or {}
                if wa.get("id") == provider_id and STATUS_ORDER.get(status, 0) > STATUS_ORDER.get(wa.get("status"), 0):
                    m["wa"] = {**wa, "status": status, **({"error": error} if error else {})}
                    hit = True
            return hit

        await workspace.mutate(int(wid), apply)


workspace.hooks.append(on_change)

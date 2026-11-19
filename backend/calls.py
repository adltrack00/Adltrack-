"""Phone calls: ADA rings a rider, vendor or customer, and picks up when they call, through Twilio Voice.

WhatsApp's own calling needs a WebRTC audio stack, so calls go over the normal phone network, which every phone in
Nigeria has anyway. ADA speaks, listens (Twilio types out what the person says, or they press 1 for yes, 2 for no),
acts on it exactly as if they had typed it on WhatsApp, and says the answer back. Everything said is kept in that
person's chat with channel "call", so it shows on the WhatsApp page and in the day record.

  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN   the Twilio account (the same one as WhatsApp, if Twilio is used for that)
  TWILIO_VOICE_FROM                        the Twilio phone number ADA calls from, e.g. +2342013300000
  VOICE_LANG                               speech recognition language, default en-NG
In Twilio, point the number's "A call comes in" webhook at /api/voice/incoming.
Without these, calls are simulated: the call shows in the person's chat and the office can answer it in the simulator.

Calls start from the office ("CALL TUNDE: are you taking the drops?", approved first) or, with notify.calls on, when a
rider still hasn't answered new drops after the WhatsApp nudge.
"""
import asyncio
import base64
import hashlib
import hmac
import logging
import os
import re
import secrets
import urllib.parse
from typing import Any, Dict, List, Optional
from xml.sax.saxutils import escape

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

import wa_providers
import workspace
import whatsapp as W

log = logging.getLogger("whatsapp")
LIVE_STATES = ("queued", "ringing", "in-progress")


def ready() -> bool:
    return all(os.environ.get(k) for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VOICE_FROM"))


def calls_on(st) -> bool:
    return bool((((st.get("company") or {}).get("whatsapp") or {}).get("notify") or {}).get("calls", False))


def spoken(text: str) -> str:
    """A WhatsApp reply, as something a voice can say."""
    t = re.sub(r"https?://\S+", "", text or "")
    t = re.sub(r"\bReply\b", "Say", t)
    t = re.sub(r"\breply\b", "say", t)
    t = re.sub(r"[^\w\s₦.,:;?!'()/-]", " ", t)  # emoji and symbols
    t = t.replace("₦", "naira ").replace("•", "")
    t = re.sub(r"\s*\n+\s*", ". ", t)
    t = re.sub(r"\s+", " ", t).replace(" .", ".").replace("..", ".")
    return t.strip(" .")[:900] + "."


def queue(st, key: str, say: str, by: Optional[Dict[str, Any]] = None, why: str = "", inbound: bool = False) -> Dict[str, Any]:
    """A call to make (or one that just came in), kept on the workspace; the hook below places it."""
    call = {"id": secrets.token_urlsafe(12), "key": key, "say": say, "why": why, "status": "in-progress" if inbound else "queued",
            "direction": "inbound" if inbound else "outbound", "at": W.now_iso(), "by": by or {}, "live": ready()}
    st.setdefault("calls", []).insert(0, call)
    del st["calls"][200:]
    m = W.office_message(key, ("📞 " + ("Answered a call: " if inbound else "Call: ") + say), kind="call", callId=call["id"])
    m["channel"], m["wa"] = "call", {"status": "spoken" if inbound or call["live"] else "simulated"}
    st.setdefault("messages", []).append(m)
    return call


def find_call(st, call_id: str) -> Optional[Dict[str, Any]]:
    return next((c for c in st.get("calls", []) if c.get("id") == call_id), None)


# ---------- placing calls ----------

def dial(to: str, answer_url: str, status_url: str) -> Dict[str, Any]:
    """Ask Twilio to ring this number. Returns {"sid"} or {"error"}."""
    sid, token = os.environ["TWILIO_ACCOUNT_SID"], os.environ["TWILIO_AUTH_TOKEN"]
    form = {"To": "+" + to, "From": os.environ["TWILIO_VOICE_FROM"], "Url": answer_url, "StatusCallback": status_url,
            "StatusCallbackEvent": "completed", "Timeout": "30", "MachineDetection": "Enable"}
    auth_header = "Basic " + base64.b64encode(f"{sid}:{token}".encode()).decode()
    status, raw = wa_providers.http("POST", f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Calls.json", urllib.parse.urlencode(form, doseq=True).encode(),
                                    {"Authorization": auth_header, "Content-Type": "application/x-www-form-urlencoded"})
    import json

    try:
        data = json.loads(raw or b"{}")
    except ValueError:
        data = {}
    if 200 <= status < 300 and data.get("sid"):
        return {"sid": data["sid"]}
    return {"error": data.get("message") or raw[:200].decode(errors="replace")}


async def on_change(wid: int, before: Optional[Dict[str, Any]], after: Dict[str, Any], url: str = "") -> None:
    if before is None:
        return
    seen = {c.get("id") for c in before.get("calls", [])}
    fresh = [c for c in after.get("calls", []) if c.get("id") not in seen and c.get("status") == "queued"]
    for call in fresh:
        p = W.person(after, call["key"]) or {}
        if not ready():
            result = {"status": "simulated"}
        elif not p.get("phone"):
            result = {"status": "failed", "error": "No phone number"}
        else:
            base = W.base_url(wid, url)
            q = f"k={wid}.{call['id']}"
            got = await asyncio.to_thread(dial, p["phone"], f"{base}/api/voice/answer?{q}", f"{base}/api/voice/status?{q}")
            result = {"status": "ringing", "sid": got["sid"]} if got.get("sid") else {"status": "failed", "error": got.get("error", "")}
            if got.get("error"):
                log.warning("Call failed: %s", got["error"])

        def record(st, call_id=call["id"], result=result):
            c = find_call(st, call_id)
            if c:
                c.update(result)

        await workspace.mutate(wid, record)


workspace.hooks.append(on_change)


# ---------- talking ----------

def twiml(say: str, gather_url: str = "", bye: str = "") -> Response:
    lang = os.environ.get("VOICE_LANG") or "en-NG"
    body = f"<Say>{escape(say)}</Say>"
    if gather_url:
        body = (f'<Gather input="speech dtmf" numDigits="1" speechTimeout="auto" language="{lang}" action="{escape(gather_url)}" method="POST">{body}</Gather>'
                f"<Say>{escape(bye or 'I did not hear anything. I will send you a WhatsApp instead. Goodbye.')}</Say>")
    elif bye:
        body += f"<Say>{escape(bye)}</Say>"
    return Response(f'<?xml version="1.0" encoding="UTF-8"?><Response>{body}<Hangup/></Response>' if not gather_url else
                    f'<?xml version="1.0" encoding="UTF-8"?><Response>{body}</Response>', media_type="application/xml")


def check_signature(url: str, params: Dict[str, str], header: Optional[str]) -> bool:
    token = os.environ.get("TWILIO_AUTH_TOKEN", "")
    if not token:
        return False
    payload = url + "".join(k + params[k] for k in sorted(params))
    want = base64.b64encode(hmac.new(token.encode(), payload.encode(), hashlib.sha1).digest()).decode()
    return hmac.compare_digest(want, header or "")


DONE = re.compile(r"^\W*(bye|goodbye|that'?s all|nothing|no thanks|thank you|thanks|ok bye|okay bye)\W*$", re.I)


async def heard(wid: int, call_id: str, text: str, url: str) -> str:
    """What the person said on the call: acted on like a WhatsApp message; returns what ADA says back."""
    _, st = await asyncio.to_thread(workspace.Hub.load, wid)
    call = find_call(st or {}, call_id)
    if not call:
        return "Sorry, this call has ended. Goodbye."
    role, _, ref = call["key"].partition(":")
    who = {}
    if role == "staff":
        who = {"id": ref}
    reply = await W.receive(wid, role, ref, text, wa_id=f"call-{call_id}", who=who, url=url, channel="call")
    return spoken(reply) if reply else "Thank you, I've passed that to the office."


def router() -> APIRouter:
    api = APIRouter(prefix="/api/voice")

    async def form(request: Request) -> Dict[str, str]:
        raw = (await request.body()).decode()
        params = dict(urllib.parse.parse_qsl(raw, keep_blank_values=True))
        url = str(request.url)
        if request.headers.get("x-forwarded-proto") == "https":
            url = url.replace("http://", "https://", 1)
        if not check_signature(url, params, request.headers.get("x-twilio-signature")):
            raise HTTPException(403, "Bad signature.")
        return params

    def parse_k(k: str):
        wid, _, call_id = (k or "").partition(".")
        if not wid.isdigit() or not call_id:
            raise HTTPException(404, "No such call.")
        return int(wid), call_id

    def turn_url(request: Request, wid: int, call_id: str) -> str:
        return f"{W.base_url(wid, str(request.base_url))}/api/voice/turn?k={wid}.{call_id}"

    @api.post("/answer")
    async def answer(request: Request, k: str = ""):
        """They picked up ADA's call."""
        params = await form(request)
        wid, call_id = parse_k(k)
        _, st = await asyncio.to_thread(workspace.Hub.load, wid)
        call = find_call(st or {}, call_id)
        if not call:
            return twiml("Sorry, wrong call. Goodbye.")
        if params.get("AnsweredBy", "").startswith("machine"):
            return twiml(spoken(call["say"]) + " I'll send this on WhatsApp too.", bye="Goodbye.")

        def live(s):
            c = find_call(s, call_id)
            if c:
                c["status"] = "in-progress"

        await workspace.mutate(wid, live)
        return twiml(spoken(call["say"]), turn_url(request, wid, call_id))

    @api.post("/incoming")
    async def incoming(request: Request):
        """Someone calls ADA's number."""
        params = await form(request)
        digits = W.intake.phone_digits(params.get("From", ""))
        found = await asyncio.to_thread(W.find_contact, digits)
        if not found:
            return twiml("Hello, this is ADA. This number isn't linked to a delivery account yet. Please ask your delivery company to add it. Goodbye.")
        wid, role, ref, who = found
        name = (who.get("name") or "").split(" ")[0]
        greeting = f"Hello{' ' + name if name else ''}, this is ADA. How can I help? You can say things like delivered, where is my order, or what's next."
        box: List[str] = []

        def take(st):
            company = (st.get("company") or {}).get("name") or ""
            box.append(queue(st, f"{role}:{ref}", greeting.replace("this is ADA", f"this is ADA from {company}") if company else greeting, inbound=True)["id"])
            st["calls"][0]["sid"] = params.get("CallSid", "")

        await workspace.mutate(wid, take)
        if not box:
            return twiml("Sorry, something went wrong. Please send a WhatsApp instead. Goodbye.")
        return twiml(greeting, turn_url(request, wid, box[0]))

    @api.post("/turn")
    async def turn(request: Request, k: str = ""):
        params = await form(request)
        wid, call_id = parse_k(k)
        digit = params.get("Digits", "")
        text = {"1": "yes", "2": "no"}.get(digit, digit) or (params.get("SpeechResult") or "").strip()
        if not text:
            return twiml("Sorry, I didn't catch that. Please say it again.", turn_url(request, wid, call_id))
        if DONE.match(text):
            return twiml("Thank you. Goodbye.")
        reply = await heard(wid, call_id, text, str(request.base_url))
        return twiml(reply + " Anything else?", turn_url(request, wid, call_id), bye="Thank you. Goodbye.")

    @api.post("/status")
    async def status(request: Request, k: str = ""):
        params = await form(request)
        wid, call_id = parse_k(k)
        result = params.get("CallStatus", "")

        def done(st):
            c = find_call(st, call_id)
            if not c:
                return False
            c.update({"status": "completed" if result == "completed" else "failed" if result in ("failed", "busy", "no-answer", "canceled") else result,
                      "seconds": int(params.get("CallDuration") or 0), **({"error": result} if result in ("busy", "no-answer", "failed") else {})})
            staff = (c.get("by") or {}).get("id")
            if staff and c.get("direction") == "outbound":
                name = (W.person(st, c["key"]) or {}).get("first") or "them"
                if result == "completed":
                    said = [m["text"] for m in st.get("messages", []) if W.key_of(m) == c["key"] and m.get("channel") == "call" and m.get("from") not in W.OFFICE and m.get("at", "") >= c.get("at", "")]
                    text = f"📞 Call with {name} ended ({max(1, round((c['seconds'] or 0) / 60))} min)." + (" They said: " + " / ".join(f'"{s}"' for s in said[-4:]) if said else " They didn't say anything I could act on.")
                else:
                    text = f"📞 {name} didn't pick up ({result.replace('-', ' ')}). Reply CALL {name.upper()} to try again."
                st.setdefault("messages", []).append(W.office_message(f"staff:{staff}", text, kind="nudge"))

        await workspace.mutate(wid, done)
        return Response(status_code=204)

    return api


def staff_calls(st) -> List[Dict[str, Any]]:
    return [c for c in st.get("calls", []) if c.get("status") in LIVE_STATES]


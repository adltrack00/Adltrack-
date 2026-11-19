"""How WhatsApp messages leave and arrive: the WhatsApp Business Cloud API from Meta, Twilio, or a test line.

Pick one with WHATSAPP_PROVIDER = meta | twilio | test. Left unset, the first one with credentials is used, and with
none the app runs on the test line: nothing leaves the server, every message is shown in the app and in the phone
simulator on the company's WhatsApp page, so the whole flow can be tried before a number is verified.

Meta (Cloud API)                       Twilio
  WHATSAPP_TOKEN          permanent token   TWILIO_ACCOUNT_SID
  WHATSAPP_PHONE_NUMBER_ID                  TWILIO_AUTH_TOKEN
  WHATSAPP_VERIFY_TOKEN   webhook check     TWILIO_WHATSAPP_FROM   e.g. whatsapp:+2348000000000
  WHATSAPP_APP_SECRET     signs webhooks    TWILIO_CONTENT_SID     approved template, for messages after 24 hours
  WHATSAPP_TEMPLATE       approved template, for messages after 24 hours (default ada_update, one {{1}} body field)
  WHATSAPP_TEMPLATE_LANG  default en
Both: WHATSAPP_DISPLAY_NUMBER, the number shown to riders and vendors (e.g. +234 800 000 0000).
"""
import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

log = logging.getLogger("whatsapp")

Button = Dict[str, str]  # {"id": "ACCEPT", "title": "Accept"}


def http(method: str, url: str, data: Optional[bytes] = None, headers: Optional[Dict[str, str]] = None, timeout: float = 20) -> Tuple[int, bytes]:
    req = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.status, res.read()
    except urllib.error.HTTPError as err:
        return err.code, err.read()
    except Exception as err:  # network down, DNS...
        return 0, str(err).encode()


def with_choices(text: str, buttons: Optional[List[Button]]) -> str:
    """Lines to reply with, for lines that can't show buttons."""
    if not buttons:
        return text
    return text + "\n\n" + "\n".join(f"Reply *{b['title'].upper()}*" for b in buttons)


class Result(dict):
    """{"id": provider message id, "status": "sent" | "delivered" | "failed", "error": text}"""


class TestLine:
    name = "test"
    live = False

    def ready(self) -> bool:
        return True

    def missing(self) -> List[str]:
        return []

    def send(self, to: str, text: str, buttons: Optional[List[Button]] = None, outside_window: bool = False, image: str = "") -> Result:
        return Result(id=f"test-{secrets.token_hex(6)}", status="delivered")

    def mark_read(self, message_id: str) -> None:
        return None

    def create_group(self, subject: str, description: str = "") -> Dict[str, str]:
        gid = f"sim-group-{secrets.token_hex(4)}"
        return {"id": gid, "invite": f"https://chat.whatsapp.com/{gid}"}

    def send_group(self, group_id: str, text: str, buttons: Optional[List[Button]] = None) -> Result:
        return Result(id=f"test-{secrets.token_hex(6)}", status="delivered")


class Meta:
    name = "meta"
    live = True
    NEEDS = ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_VERIFY_TOKEN"]

    def __init__(self):
        self.token = os.environ.get("WHATSAPP_TOKEN", "")
        self.phone_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "")
        self.verify_token = os.environ.get("WHATSAPP_VERIFY_TOKEN", "")
        self.secret = os.environ.get("WHATSAPP_APP_SECRET", "")
        self.version = os.environ.get("WHATSAPP_API_VERSION", "v21.0")
        self.template = os.environ.get("WHATSAPP_TEMPLATE", "ada_update")
        self.lang = os.environ.get("WHATSAPP_TEMPLATE_LANG", "en")

    def missing(self) -> List[str]:
        return [k for k in self.NEEDS if not os.environ.get(k)]

    def ready(self) -> bool:
        return not self.missing()

    def payload(self, to: str, text: str, buttons: Optional[List[Button]], outside_window: bool, image: str = "") -> Dict[str, Any]:
        base = {"messaging_product": "whatsapp", "recipient_type": "individual", "to": to}
        if outside_window and self.template:
            # Outside the 24-hour window WhatsApp only delivers approved templates. Template fields can't hold new lines.
            flat = " · ".join(l.strip() for l in text.splitlines() if l.strip())[:1000]
            return {**base, "type": "template", "template": {"name": self.template, "language": {"code": self.lang},
                    "components": [{"type": "body", "parameters": [{"type": "text", "text": flat}]}]}}
        if buttons:
            inter = {"type": "button", "body": {"text": text[:1024]},
                     "action": {"buttons": [{"type": "reply", "reply": {"id": b["id"], "title": b["title"][:20]}} for b in buttons[:3]]}}
            if image:
                inter["header"] = {"type": "image", "image": {"link": image}}
            return {**base, "type": "interactive", "interactive": inter}
        if image:
            return {**base, "type": "image", "image": {"link": image, "caption": text[:1024]}}
        return {**base, "type": "text", "text": {"body": text[:4096], "preview_url": False}}

    def send(self, to: str, text: str, buttons: Optional[List[Button]] = None, outside_window: bool = False, image: str = "") -> Result:
        url = f"https://graph.facebook.com/{self.version}/{self.phone_id}/messages"
        body = json.dumps(self.payload(to, text, buttons, outside_window, image)).encode()
        status, raw = http("POST", url, body, {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"})
        try:
            data = json.loads(raw or b"{}")
        except ValueError:
            data = {}
        if 200 <= status < 300 and data.get("messages"):
            return Result(id=data["messages"][0].get("id", ""), status="sent")
        err = (data.get("error") or {}).get("message") or raw[:200].decode(errors="replace")
        log.warning("WhatsApp (Meta) send failed %s: %s", status, err)
        return Result(id="", status="failed", error=err)

    def _post(self, path: str, body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
        status, raw = http("POST", f"https://graph.facebook.com/{self.version}/{path}", json.dumps(body).encode(), {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"})
        try:
            return status, json.loads(raw or b"{}")
        except ValueError:
            return status, {"error": {"message": raw[:200].decode(errors="replace")}}

    def create_group(self, subject: str, description: str = "") -> Dict[str, str]:
        """Groups API (official business accounts): the id and invite link come back now or in a group_lifecycle_update webhook."""
        status, data = self._post(f"{self.phone_id}/groups", {"messaging_product": "whatsapp", "subject": subject[:128], "description": description[:2048], "join_approval_mode": "auto_approve"})
        if not 200 <= status < 300:
            return {"error": (data.get("error") or {}).get("message") or f"HTTP {status}"}
        gid = data.get("id") or data.get("group_id") or ""
        invite = data.get("invite_link") or ""
        if gid and not invite:
            st, raw = http("GET", f"https://graph.facebook.com/{self.version}/{gid}/invite_link", headers={"Authorization": f"Bearer {self.token}"})
            try:
                invite = json.loads(raw or b"{}").get("invite_link", "") if st == 200 else ""
            except ValueError:
                invite = ""
        return {"id": gid, "requestId": data.get("request_id") or "", "invite": invite}

    def send_group(self, group_id: str, text: str, buttons: Optional[List[Button]] = None) -> Result:
        """Groups can't show reply buttons, so the choices are written out."""
        status, data = self._post(f"{self.phone_id}/messages", {"messaging_product": "whatsapp", "recipient_type": "group", "to": group_id, "type": "text",
                                                                 "text": {"body": with_choices(text, buttons)[:4096], "preview_url": False}})
        if 200 <= status < 300 and data.get("messages"):
            return Result(id=data["messages"][0].get("id", ""), status="sent")
        err = (data.get("error") or {}).get("message") or f"HTTP {status}"
        log.warning("WhatsApp (Meta) group send failed %s: %s", status, err)
        return Result(id="", status="failed", error=err)

    def mark_read(self, message_id: str) -> None:
        """Blue ticks on the sender's phone, so they can see ADA has read it."""
        if not message_id:
            return
        url = f"https://graph.facebook.com/{self.version}/{self.phone_id}/messages"
        body = json.dumps({"messaging_product": "whatsapp", "status": "read", "message_id": message_id}).encode()
        status, raw = http("POST", url, body, {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}, timeout=10)
        if not 200 <= status < 300:
            log.info("WhatsApp (Meta) mark read failed %s", status)

    def check_signature(self, raw: bytes, header: Optional[str]) -> bool:
        if not self.secret:
            return True
        want = "sha256=" + hmac.new(self.secret.encode(), raw, hashlib.sha256).hexdigest()
        return hmac.compare_digest(want, header or "")

    def media(self, media_id: str) -> Optional[Tuple[str, bytes]]:
        status, raw = http("GET", f"https://graph.facebook.com/{self.version}/{media_id}", headers={"Authorization": f"Bearer {self.token}"})
        if status != 200:
            return None
        info = json.loads(raw)
        status, data = http("GET", info.get("url", ""), headers={"Authorization": f"Bearer {self.token}"}, timeout=40)
        return (info.get("mime_type", "image/jpeg"), data) if status == 200 else None


class Twilio:
    name = "twilio"
    live = True
    NEEDS = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM"]

    def __init__(self):
        self.sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
        self.auth = os.environ.get("TWILIO_AUTH_TOKEN", "")
        self.sender = os.environ.get("TWILIO_WHATSAPP_FROM", "")
        if self.sender and not self.sender.startswith("whatsapp:"):
            self.sender = "whatsapp:" + self.sender
        self.content_sid = os.environ.get("TWILIO_CONTENT_SID", "")
        self.status_url = ""

    def missing(self) -> List[str]:
        return [k for k in self.NEEDS if not os.environ.get(k)]

    def ready(self) -> bool:
        return not self.missing()

    def _basic(self) -> str:
        return "Basic " + base64.b64encode(f"{self.sid}:{self.auth}".encode()).decode()

    def send(self, to: str, text: str, buttons: Optional[List[Button]] = None, outside_window: bool = False, image: str = "") -> Result:
        form = {"From": self.sender, "To": f"whatsapp:+{to}"}
        if outside_window and self.content_sid:
            form["ContentSid"] = self.content_sid
            form["ContentVariables"] = json.dumps({"1": " · ".join(l.strip() for l in text.splitlines() if l.strip())[:1000]})
        else:
            form["Body"] = with_choices(text, buttons)[:1600]
            if image:
                form["MediaUrl"] = image
        if self.status_url:
            form["StatusCallback"] = self.status_url
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.sid}/Messages.json"
        status, raw = http("POST", url, urllib.parse.urlencode(form).encode(), {"Authorization": self._basic(), "Content-Type": "application/x-www-form-urlencoded"})
        try:
            data = json.loads(raw or b"{}")
        except ValueError:
            data = {}
        if 200 <= status < 300 and data.get("sid"):
            return Result(id=data["sid"], status="sent")
        err = data.get("message") or raw[:200].decode(errors="replace")
        log.warning("WhatsApp (Twilio) send failed %s: %s", status, err)
        return Result(id="", status="failed", error=err)

    def mark_read(self, message_id: str) -> None:
        return None  # Twilio shows read receipts by itself

    def create_group(self, subject: str, description: str = "") -> Dict[str, str]:
        return {"error": "Twilio can't make WhatsApp groups; groups need the Meta Cloud API"}

    def send_group(self, group_id: str, text: str, buttons: Optional[List[Button]] = None) -> Result:
        return Result(id="", status="failed", error="Twilio can't send to WhatsApp groups")

    def check_signature(self, url: str, params: Dict[str, str], header: Optional[str]) -> bool:
        payload = url + "".join(k + params[k] for k in sorted(params))
        want = base64.b64encode(hmac.new(self.auth.encode(), payload.encode(), hashlib.sha1).digest()).decode()
        return hmac.compare_digest(want, header or "")

    def media(self, url: str) -> Optional[Tuple[str, bytes]]:
        status, data = http("GET", url, headers={"Authorization": self._basic()}, timeout=40)
        return ("image/jpeg", data) if status == 200 else None


def choose():
    wanted = (os.environ.get("WHATSAPP_PROVIDER") or "").strip().lower()
    if wanted == "test":
        return TestLine()
    if wanted == "meta":
        return Meta()
    if wanted == "twilio":
        return Twilio()
    if Meta().ready():
        return Meta()
    if Twilio().ready():
        return Twilio()
    return TestLine()


line = choose()
DISPLAY_NUMBER = os.environ.get("WHATSAPP_DISPLAY_NUMBER", "")

# Claude reading with the chat so far, pictures read, phone calls and team groups, on the test line.
# Claude is swapped for a fake here (no key, nothing leaves the machine). Run: python3 backend/tests/test_brain.py
import os, sys, json, tempfile, time, hmac, hashlib, base64
from urllib.parse import urlencode
os.environ["DATA_DIR"] = tempfile.mkdtemp()
os.environ.pop("DATABASE_URL", None); os.environ.pop("ANTHROPIC_API_KEY", None); os.environ["NUDGES"] = "off"
for k in ("WHATSAPP_TOKEN", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VOICE_FROM", "WHATSAPP_PROVIDER", "STT_API_KEY", "OPENAI_API_KEY"):
    os.environ.pop(k, None)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
import server, whatsapp, wa_providers, brain, calls, office

def ok(r, code=200):
    assert r.status_code == code, (r.status_code, r.text[:400]); return r.json() if r.content else None

def wait(c, pred, what, secs=5):
    end = time.time() + secs
    while time.time() < end:
        st = c.get("/api/workspace").json()["state"]
        if pred(st):
            return st
        time.sleep(0.05)
    raise AssertionError(f"timed out waiting for {what}: {json.dumps(st['messages'][-3:], indent=1)[:1800]}")

# Speech: links and emoji go, "Reply" becomes "Say"
assert calls.spoken("✅ Done.\nReply NEXT for more: https://x.y/z") == "Done. Say NEXT for more:."

# ---- a fake Claude: answers by looking at the chat it was given ----
seen = []
def fake_understand(role, text, chat, known):
    seen.append((role, text, chat, known))
    t = text.lower()
    last_ada = next((h["text"] for h in reversed(chat) if h["who"] == "ADA"), "")
    if role == "staff" and t.startswith("and the one for"):          # a follow-up only the chat explains
        return {"intent": "track", "command": "where is Bola", "amount": None, "method": None, "reason": "", "ref": "", "answer": ""}
    if role == "staff" and "how much" in t:
        return {"intent": "answer", "command": text, "amount": None, "method": None, "reason": "", "ref": "", "answer": "Tunde is holding ₦25,000 from Chioma."}
    if role == "rider" and t == "she don collect am" and "Chioma" in last_ada:
        return {"intent": "delivered", "command": "delivered DL-1001", "amount": 25000, "method": "cash", "reason": "", "ref": "DL-1001", "answer": ""}
    if role == "rider" and "address" in t:
        return {"intent": "answer", "command": text, "amount": None, "method": None, "reason": "", "ref": "", "answer": "Bola Ade: 9 Ogunlana Drive, Surulere."}
    return {"intent": "unknown", "command": text, "amount": None, "method": None, "reason": "", "ref": "", "answer": ""}

pictures = {}
def fake_read(mime, data, role, caption=""):
    return pictures.get(data)

brain.ready = lambda: True
brain.understand = fake_understand
brain.read_image = fake_read
png = lambda tag: "data:image/png;base64," + base64.b64encode(tag).decode()

DEMO = json.load(open(os.path.join(os.path.dirname(__file__), "demo_state.json")))
with TestClient(server.app) as c:
    ok(c.post("/api/auth/signup/company", json={"company": "Swift", "name": "George Okoro", "phone": "0807 555 0101", "password": "password1", "city": "Lagos"}))
    uid = c.get("/api/auth/me").json()["user"]["id"]
    ws = ok(c.get("/api/workspace")); st = ws["state"]
    st.update(vendors=DEMO["vendors"], riders=DEMO["riders"], products=DEMO["products"])
    today = whatsapp.today_iso()
    st["tasks"] = [
        {"id": "t1", "ref": "DL-1001", "riderId": "r-tunde", "vendorId": "v-glow", "customer": "Chioma Okafor", "phone": "+234 802 000 4411", "address": "12 Allen Avenue, Ikeja", "date": today,
         "items": [{"productId": "p-serum", "qty": 2, "free": 0, "price": 12500}], "status": "picked_up", "acceptedAt": "2026-01-01T08:00:00Z", "history": []},
        {"id": "t3", "ref": "DL-1003", "riderId": "r-tunde", "vendorId": "v-glow", "customer": "Bola Ade", "phone": "07031234567", "address": "9 Ogunlana Drive, Surulere", "date": today,
         "items": [{"productId": "p-soap", "qty": 1, "free": 0, "price": 3500}], "status": "picked_up", "acceptedAt": "2026-01-01T08:00:00Z", "history": []},
        {"id": "t5", "ref": "DL-1005", "riderId": "r-amaka", "vendorId": "v-glow", "customer": "Ngozi Eze", "phone": "08033334444", "address": "3 Bode Thomas, Surulere", "date": today,
         "items": [{"productId": "p-soap", "qty": 1, "free": 0, "price": 3500}], "status": "assigned", "history": []},
    ]
    ok(c.put("/api/workspace", json={"base_rev": ws["rev"], "state": st}))
    sim = lambda contact, text="", **kw: ok(c.post("/api/whatsapp/simulate", json={"contact": contact, "text": text, **kw}))
    chat = lambda s, key: [m for m in s["messages"] if whatsapp.key_of(m) == key]
    last = lambda s, key: chat(s, key)[-1]
    task = lambda s, i: next(t for t in s["tasks"] if t["id"] == i)

    # 1. Conversation memory: a follow-up that only makes sense with the line before
    r = sim("staff:me", "Where is Chioma?")
    assert "Chioma" in r["reply"], r
    r = sim("staff:me", "and the one for Bola?")
    assert "Bola" in r["reply"] and "DL-1003" in r["reply"], r
    role, text, hist, known = seen[-1]
    assert role == "staff" and [h["who"] for h in hist][-2:] == ["Them", "ADA"] and "Chioma" in hist[-1]["text"], hist
    assert "DL-1003 Bola Ade" in known and "Riders:" in known, known
    # ...and a question answered from what ADA knows, without a command
    assert sim("staff:me", "How much cash is Tunde holding?")["reply"] == "Tunde is holding ₦25,000 from Chioma."

    # A rider in Pidgin, after ADA named the customer: "she don collect am" is the delivery, with the amount Claude read
    sim("rider:r-tunde", "", button="ARRIVED")
    st = wait(c, lambda s: "You're at Chioma" in last(s, "rider:r-tunde")["text"], "arrived")
    sim("rider:r-tunde", "she don collect am")
    st = wait(c, lambda s: task(s, "t1")["status"] == "delivered", "delivered from a follow-up")
    assert task(st, "t1")["payment"] == {**task(st, "t1")["payment"], "amount": 25000, "method": "cash"}
    assert sim("rider:r-tunde", "What's the next address?")["reply"].startswith("Bola Ade")

    # 2. Pictures. A rider's transfer receipt: paid in, with the receipt kept and the amount checked
    pictures[b"receipt-tunde"] = {"kind": "receipt", "amount": 20000, "ref": "2411190045", "bank": "Opay", "date": "", "text": "", "summary": "Opay transfer of ₦20,000"}
    r = sim("rider:r-tunde", "", image=png(b"receipt-tunde"))
    assert "paid in ₦25,000" in r["reply"] and "receipt shows ₦20,000" in r["reply"] and "₦5,000 less" in r["reply"], r
    st = c.get("/api/workspace").json()["state"]
    h = task(st, "t1")["payment"]["handedIn"]
    assert h["ref"] == "2411190045" and h["receipt"].startswith("/api/photos/") and h["receiptAmount"] == 20000, h
    got = next(m for m in chat(st, "rider:r-tunde") if m.get("photoRead"))
    assert got["photoRead"]["kind"] == "receipt" and got["photoRead"]["amount"] == 20000

    # The office sends a receipt: ADA finds whose cash it is by the amount and asks before confirming
    pictures[b"receipt-office"] = {"kind": "receipt", "amount": 25000, "ref": "TRF77", "bank": "GTBank", "date": "", "text": "", "summary": "GTBank transfer ₦25,000"}
    r = sim("staff:me", "", image=png(b"receipt-office"))
    assert "Confirm ₦25,000 paid in by Tunde" in r["reply"] and "it matches" in r["reply"], r
    sim("staff:me", "yes")
    st = wait(c, lambda s: task(s, "t1")["payment"].get("handInVerified"), "verified from a receipt")

    # A handwritten order list from a vendor: typed out and read in as orders
    pictures[b"orders-glow"] = {"kind": "order_list", "amount": 0, "ref": "", "bank": "", "date": "", "summary": "Handwritten list of 2 orders",
                                "text": "Funke Ola\n08051112222\n5 Admiralty Way Lekki\n2 serum 25000\n\nEmeka Obi\n08063334444\n14 Awolowo Rd Ikoyi\n1 black soap 3500"}
    r = sim("vendor:v-glow", "today's orders", image=png(b"orders-glow"))
    assert "Got 2 orders" in r["reply"], r
    st = c.get("/api/workspace").json()["state"]
    names = {o.get("customer") for o in st["orders"]}
    assert {"Funke Ola", "Emeka Obi"} <= names, names
    # ...and one the office photographs, then says whose it is
    pictures[b"orders-office"] = {"kind": "order_list", "amount": 0, "ref": "", "bank": "", "date": "", "summary": "Screenshot of an order", "text": "Tolu Bello\n08077778888\n2 Allen Ave Ikeja\n1 serum 12500"}
    r = sim("staff:me", "", image=png(b"orders-office"))
    assert "Whose orders" in r["reply"], r
    r = sim("staff:me", "GlowSkin")
    assert "Read 1 order for GlowSkin" in r["reply"], r

    # 3. Calls. On the test line: the office asks, approves, and the call shows in Amaka's chat
    r = sim("staff:me", "call Amaka: are you taking DL-1005?")
    assert "Call Amaka now?" in r["reply"] and "are you taking DL-1005?" in r["reply"], r
    r = sim("staff:me", "yes")
    assert "Calling Amaka now" in r["reply"] and "Test line" in r["reply"], r
    st = wait(c, lambda s: (s.get("calls") or [{}])[0].get("status") == "simulated", "simulated call")
    assert any(m.get("kind") == "call" and m["channel"] == "call" for m in chat(st, "rider:r-amaka"))
    # Answering it in the simulator: what Amaka says is acted on, and the reply is spoken, not sent on WhatsApp
    r = sim("rider:r-amaka", "yes", channel="call")
    assert "accepted" in r["reply"], r
    st = c.get("/api/workspace").json()["state"]
    assert task(st, "t5")["acceptedAt"] and last(st, "rider:r-amaka")["wa"]["status"] == "spoken" and last(st, "rider:r-amaka")["channel"] == "call"

    # Live calls through Twilio Voice (the dial is faked; the webhooks are signed like Twilio signs them)
    os.environ.update(TWILIO_ACCOUNT_SID="AC1", TWILIO_AUTH_TOKEN="tok", TWILIO_VOICE_FROM="+2342013300000")
    dialled = []
    calls.dial = lambda to, answer, status: dialled.append((to, answer, status)) or {"sid": "CA1"}
    def twilio(path, params):
        url = "http://testserver" + path
        sig = base64.b64encode(hmac.new(b"tok", (url + "".join(k + params[k] for k in sorted(params))).encode(), hashlib.sha1).digest()).decode()
        return c.post(path, content=urlencode(params), headers={"x-twilio-signature": sig, "content-type": "application/x-www-form-urlencoded"})
    sim("staff:me", "call Tunde"); sim("staff:me", "yes")
    st = wait(c, lambda s: s["calls"][0].get("status") == "ringing", "ringing")
    to, answer, status = dialled[-1]
    assert to == "2348031112041" and "/api/voice/answer?k=" in answer
    path = answer[answer.index("/api/"):]
    assert c.post(path, content="CallSid=CA1").status_code == 403  # unsigned: refused
    res = twilio(path, {"CallSid": "CA1", "AnsweredBy": "human"})
    assert res.status_code == 200 and "<Gather" in res.text and "Hello Tunde" in res.text, res.text
    turn = res.text[res.text.index("/api/voice/turn"):].split('"')[0].replace("&amp;", "&")
    res = twilio(turn, {"CallSid": "CA1", "SpeechResult": "Delivered, 3500 cash"})
    assert "delivered to Bola Ade" in res.text and "<Gather" in res.text and "http" not in res.text.split("<Say>")[1], res.text
    st = c.get("/api/workspace").json()["state"]
    assert task(st, "t3")["status"] == "delivered" and task(st, "t3")["payment"]["amount"] == 3500
    assert any(m["from"] == "rider" and m["channel"] == "call" and m["text"] == "Delivered, 3500 cash" for m in chat(st, "rider:r-tunde"))
    res = twilio(status[status.index("/api/"):], {"CallSid": "CA1", "CallStatus": "completed", "CallDuration": "75"})
    assert res.status_code == 204
    st = wait(c, lambda s: "Call with Tunde ended" in last(s, f"staff:{uid}")["text"], "call summary")
    assert "Delivered, 3500 cash" in last(st, f"staff:{uid}")["text"] and st["calls"][0]["status"] == "completed"
    # Someone calls ADA's number
    res = twilio("/api/voice/incoming", {"CallSid": "CA2", "From": "+2348031112041"})
    assert "Hello Tunde" in res.text and "<Gather" in res.text, res.text
    res = twilio("/api/voice/incoming", {"CallSid": "CA3", "From": "+2340000000000"})
    assert "isn't linked" in res.text and "<Hangup/>" in res.text
    for k in ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VOICE_FROM"):
        os.environ.pop(k)

    # 4. Groups: made after the office says yes, link sent back
    r = sim("staff:me", "make a team group")
    assert "Make a WhatsApp group" in r["reply"] and "8 people" in r["reply"], r
    sim("staff:me", "yes")
    st = wait(c, lambda s: any(g.get("status") == "ready" for g in whatsapp.groups(s)), "group made")
    g = whatsapp.groups(st)[0]
    st = wait(c, lambda s: "chat.whatsapp.com" in last(s, f"staff:{uid}")["text"], "invite link")
    # In the group: chat that isn't for ADA is kept, not answered
    gkey = f"group:{g['id']}"
    r = sim("rider:r-amaka", "Morning everyone", group=g["id"])
    assert r["reply"] is None
    st = c.get("/api/workspace").json()["state"]
    m = last(st, gkey)
    assert m["from"] == "rider" and m["author"] == "rider:r-amaka" and m["authorName"] == "Amaka Obi" and "riderId" not in m, m
    # "ADA, ..." is: answered in the group, as Amaka
    r = sim("rider:r-amaka", "ADA, what's next?", group=g["id"])
    assert r["reply"] and ("Ngozi" in r["reply"] or "Collect" in r["reply"]), r
    st = c.get("/api/workspace").json()["state"]
    assert last(st, gkey)["from"] == "ada" and last(st, gkey)["groupId"] == g["id"] and last(st, gkey)["wa"]["status"] in ("queued", "delivered")
    # The office tells the group, approved first
    r = sim("staff:me", "tell the group: stock count at 5pm")
    assert "Send to the" in r["reply"] and "group" in r["reply"], r
    sim("staff:me", "yes")
    st = wait(c, lambda s: any(m.get("from") == "dispatcher" and m.get("groupId") == g["id"] for m in s["messages"]), "told the group")
    st = wait(c, lambda s: next(m for m in s["messages"] if m.get("from") == "dispatcher" and m.get("groupId") == g["id"])["wa"]["status"] == "delivered", "group send")

    # Meta: a group message arrives through the webhook
    sent = []
    class FakeMeta(wa_providers.Meta):
        def __init__(self):
            super().__init__(); self.secret = "s3cret"
        def send(self, to, text, buttons=None, outside_window=False, image=""):
            sent.append((to, text)); return wa_providers.Result(id="w1", status="sent")
        def send_group(self, group_id, text, buttons=None):
            sent.append((group_id, text)); return wa_providers.Result(id="w2", status="sent")
        def mark_read(self, message_id):
            pass
    wa_providers.line = FakeMeta()
    body = json.dumps({"entry": [{"changes": [{"field": "messages", "value": {"contacts": [{"wa_id": "2348065529010", "profile": {"name": "Amaka"}}],
                       "messages": [{"from": "2348065529010", "id": "wamid.g1", "type": "text", "group_id": g["id"], "text": {"body": "@ADA help"}}]}}]}]}).encode()
    ok(c.post("/api/whatsapp/webhook", content=body, headers={"x-hub-signature-256": "sha256=" + hmac.new(b"s3cret", body, hashlib.sha256).hexdigest(), "content-type": "application/json"}))
    end = time.time() + 5
    while time.time() < end and not any(x[0] == g["id"] for x in sent):
        time.sleep(0.05)
    assert any(x[0] == g["id"] and "I'm ADA" in x[1] for x in sent), sent
print("brain ok")

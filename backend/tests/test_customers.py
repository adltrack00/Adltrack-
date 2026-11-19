# Phase 2 on the test line: customers on WhatsApp, joining with an invite code, voice notes typed out.
# Run: python3 backend/tests/test_customers.py
import os, sys, json, tempfile, time, hmac, hashlib
os.environ["DATA_DIR"] = tempfile.mkdtemp()
os.environ.pop("DATABASE_URL", None); os.environ.pop("ANTHROPIC_API_KEY", None); os.environ["NUDGES"] = "off"
for k in ("WHATSAPP_TOKEN", "TWILIO_ACCOUNT_SID", "WHATSAPP_PROVIDER", "STT_API_KEY", "OPENAI_API_KEY"):
    os.environ.pop(k, None)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
import server, whatsapp, wa_providers, customers, stt

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

C = customers.intent
assert C("Where is my order?") == "where" and C("Yes, I got it") == "confirm" and C("", "C_OK") == "confirm"
assert C("The serum is damaged") == "problem" and C("I haven't received it") == "problem"
assert C("I won't be home, bring it tomorrow after 2pm") == "reschedule" and C("come back by 5pm") == "reschedule"

DEMO = json.load(open(os.path.join(os.path.dirname(__file__), "demo_state.json")))
CHIOMA, BOLA = "2348020004411", "2347031234567"
with TestClient(server.app) as c:
    ok(c.post("/api/auth/signup/company", json={"company": "Swift", "name": "George Okoro", "phone": "0807 555 0101", "password": "password1", "city": "Lagos"}))
    uid = c.get("/api/auth/me").json()["user"]["id"]
    ws = ok(c.get("/api/workspace")); st = ws["state"]
    st.update(vendors=DEMO["vendors"], riders=DEMO["riders"], products=DEMO["products"])
    today = whatsapp.today_iso()
    st["tasks"] = [
        {"id": "t1", "ref": "DL-1001", "riderId": "r-tunde", "vendorId": "v-glow", "customer": "Chioma Okafor", "phone": "+234 802 000 4411", "address": "12 Allen Avenue, Ikeja", "date": today,
         "items": [{"productId": "p-serum", "qty": 2, "free": 0, "price": 12500}], "status": "assigned", "acceptedAt": "2026-01-01T08:00:00Z", "history": []},
        {"id": "t3", "ref": "DL-1003", "riderId": "r-kwame", "vendorId": "v-glow", "customer": "Bola Ade", "phone": "07031234567", "address": "9 Ogunlana Drive, Surulere", "date": today,
         "items": [{"productId": "p-soap", "qty": 1, "free": 0, "price": 3500}], "status": "assigned", "history": []},
    ]
    ok(c.put("/api/workspace", json={"base_rev": ws["rev"], "state": st}))
    chat = lambda s, d: [m for m in s["messages"] if m.get("customerId") == d]
    rider = lambda text="", **kw: ok(c.post("/api/whatsapp/simulate", json={"contact": "rider:r-tunde", "text": text, **kw}))
    cust = lambda d, text="", **kw: ok(c.post("/api/whatsapp/simulate", json={"contact": f"customer:{d}", "text": text, **kw}))

    # 0. Off by default: Tunde collects, Chioma hears nothing
    rider("Collected"); st = wait(c, lambda s: s["tasks"][0]["status"] == "picked_up", "collected")
    time.sleep(0.3); assert not chat(c.get("/api/workspace").json()["state"], CHIOMA)
    # ...and if she writes, it's kept for the office without a reply
    cust(CHIOMA, "Hello?"); st = wait(c, lambda s: chat(s, CHIOMA), "kept")
    time.sleep(0.3); assert [m["from"] for m in chat(c.get("/api/workspace").json()["state"], CHIOMA)] == ["customer"]

    # 1. Turned on: arrival and delivery reach Chioma, with buttons
    ok(c.put("/api/whatsapp/settings", json={"notify": {"customers": True}}))
    rider("", button="ARRIVED")
    st = wait(c, lambda s: any("is at your address now" in m["text"] for m in chat(s, CHIOMA)), "at the door")
    cust(CHIOMA, "Where is my order?")
    st = wait(c, lambda s: chat(s, CHIOMA)[-1]["from"] == "ada" and "on the way" in chat(s, CHIOMA)[-1]["text"], "where")
    rider("Delivered 25000 cash")
    st = wait(c, lambda s: any(m["text"].startswith("✅ Delivered") for m in chat(s, CHIOMA)), "delivered notice")
    d = next(m for m in chat(st, CHIOMA) if m["text"].startswith("✅ Delivered"))
    assert [b["id"] for b in d["buttons"]] == ["C_OK", "C_PROBLEM"] and d["taskId"] == "t1" and d["wa"]["status"] in ("queued", "delivered"), d
    cust(CHIOMA, "Yes, I got it", button="C_OK")
    st = wait(c, lambda s: (s["tasks"][0].get("proof") or {}).get("customerConfirmed"), "confirmed")

    # 2. A problem: logged, the office and the vendor hear at once
    cust(CHIOMA, "", button="C_PROBLEM")
    st = wait(c, lambda s: "What went wrong" in chat(s, CHIOMA)[-1]["text"], "what went wrong")
    cust(CHIOMA, "One serum bottle is cracked")
    st = wait(c, lambda s: any(e.get("taskId") == "t1" for e in s.get("log", [])), "incident")
    inc = next(e for e in st["log"] if e.get("taskId") == "t1")
    assert inc["kind"] == "incident" and inc["status"] == "open" and "cracked" in inc["text"]
    assert any("reports a problem with DL-1001" in m["text"] for m in st["messages"] if m.get("staffId") == uid)
    assert any("cracked" in m["text"] for m in st["messages"] if m.get("vendorId") == "v-glow")

    # 3. Bola can't be home: the drop not yet collected moves to tomorrow after 2pm; Kwame is told
    cust(BOLA, "I won't be home today, bring it tomorrow after 2pm")
    st = wait(c, lambda s: next(t for t in s["tasks"] if t["id"] == "t3").get("rescheduled"), "rescheduled")
    t3 = next(t for t in st["tasks"] if t["id"] == "t3")
    assert t3["date"] > today and t3["time"] == "14:00" and t3["rescheduled"]["by"] == "customer", t3
    assert "tomorrow after 2:00" in chat(st, BOLA)[-1]["text"] or "tomorrow after 2" in chat(st, BOLA)[-1]["text"], chat(st, BOLA)[-1]["text"]
    assert any("Bola Ade moved DL-1003" in m["text"] for m in st["messages"] if m.get("riderId") == "r-kwame")

    # 4. Joining by WhatsApp with an invite code, through the Meta webhook
    sent, read = [], []
    class FakeMeta(wa_providers.Meta):
        def __init__(self):
            super().__init__(); self.secret = "s3cret"
        def send(self, to, text, buttons=None, outside_window=False, image=""):
            sent.append((to, text)); return wa_providers.Result(id=f"wamid.out{len(sent)}", status="sent")
        def media(self, media_id):
            return ("audio/ogg", b"OggS-fake")
        def mark_read(self, message_id):
            read.append(message_id)
    wa_providers.line = FakeMeta()
    def hook(msg):
        body = json.dumps({"entry": [{"changes": [{"value": {"messages": [msg]}}]}]}).encode()
        ok(c.post("/api/whatsapp/webhook", content=body, headers={"x-hub-signature-256": "sha256=" + hmac.new(b"s3cret", body, hashlib.sha256).hexdigest(), "content-type": "application/json"}))
    def wait_sent(pred, what):
        end = time.time() + 5
        while time.time() < end:
            if any(pred(x) for x in sent): return next(x for x in sent if pred(x))
            time.sleep(0.05)
        raise AssertionError(f"{what}: {sent[-3:]}")
    inv = ok(c.post("/api/invites", json={"role": "rider", "ref": "r-amaka", "name": "Amaka Obi"}))
    NEW = "2348099990001"
    hook({"from": NEW, "id": "wamid.j1", "type": "text", "text": {"body": f"join {inv['code'].lower()}"}})
    to, text = wait_sent(lambda x: x[0] == NEW and "Welcome to Swift, Amaka" in x[1], "welcome")
    url = text[text.index("http"):].split()[0]
    phone = TestClient(server.app)
    res = phone.get(url[url.index("/api/"):], follow_redirects=False)
    assert res.status_code == 303 and res.headers["location"] == "/rider", res.headers
    me = ok(phone.get("/api/auth/me"))["user"]; assert me["role"] == "rider" and me["ref"] == "r-amaka" and me["phone"] == "+" + NEW, me
    # used again: told plainly
    hook({"from": "2348099990002", "id": "wamid.j2", "type": "text", "text": {"body": inv["code"]}})
    wait_sent(lambda x: x[0] == "2348099990002" and "already been used" in x[1], "used code")
    # Amaka's next message is hers: ADA knows her by the new number
    hook({"from": NEW, "id": "wamid.j3", "type": "text", "text": {"body": "help"}})
    wait(c, lambda s: any(m.get("riderId") == "r-amaka" and m["from"] == "rider" and m["text"] == "help" for m in s["messages"]), "Amaka known")

    # 5. Voice notes typed out (a speech-to-text key is set): Tunde's voice note is read like a typed message
    ws = ok(c.get("/api/workspace")); s = ws["state"]
    s["tasks"].append({"id": "t4", "ref": "DL-1004", "riderId": "r-tunde", "vendorId": "v-glow", "customer": "Halima Yusuf", "phone": "", "address": "14 Adebola St", "date": today,
                       "items": [{"productId": "p-soap", "qty": 1, "free": 0, "price": 3500}], "status": "picked_up", "acceptedAt": "2026-01-01T08:00:00Z", "history": []})
    ok(c.put("/api/workspace", json={"base_rev": ws["rev"], "state": s}))
    os.environ["STT_API_KEY"] = "test"
    stt.transcribe = lambda mime, data: "I don deliver am, 3500 cash"
    hook({"from": "2348031112041", "id": "wamid.v1", "type": "audio", "audio": {"id": "m1"}})
    st = wait(c, lambda s: next(t for t in s["tasks"] if t["id"] == "t4")["status"] == "delivered", "voice delivered")
    v = next(m for m in st["messages"] if m.get("audio"))
    assert v["transcribed"] and v["text"] == "I don deliver am, 3500 cash" and v["riderId"] == "r-tunde", v
    assert next(t for t in st["tasks"] if t["id"] == "t4")["payment"]["amount"] == 3500
print("customers ok")

# ADA on WhatsApp, end to end on the test line. Run: python3 backend/tests/test_whatsapp.py
import os, sys, json, tempfile, time, base64, hmac, hashlib
os.environ["DATA_DIR"] = tempfile.mkdtemp()
os.environ.pop("DATABASE_URL", None); os.environ.pop("ANTHROPIC_API_KEY", None)
for k in ("WHATSAPP_TOKEN", "TWILIO_ACCOUNT_SID", "WHATSAPP_PROVIDER"):
    os.environ.pop(k, None)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
import server, whatsapp, wa_providers

def ok(r, code=200):
    assert r.status_code == code, (r.status_code, r.text[:400]); return r.json() if r.content else None

def wait(c, pred, what, secs=5):
    end = time.time() + secs
    while time.time() < end:
        st = c.get("/api/workspace").json()["state"]
        if pred(st):
            return st
        time.sleep(0.05)
    raise AssertionError(f"timed out waiting for {what}: {json.dumps(st['messages'][-3:], indent=1)[:1500]}")

msgs_to = lambda st, key, ref: [m for m in st["messages"] if m.get(key) == ref]
last = lambda st, key, ref: msgs_to(st, key, ref)[-1]

DEMO = json.load(open(os.path.join(os.path.dirname(__file__), "demo_state.json")))
with TestClient(server.app) as c:
    ok(c.post("/api/auth/signup/company", json={"company": "Swift", "name": "George", "email": "g@x.com", "password": "password1", "city": "Lagos"}))
    ws = ok(c.get("/api/workspace")); st = ws["state"]
    st.update(vendors=DEMO["vendors"], riders=DEMO["riders"], products=DEMO["products"])
    st["company"]["fees"] = {"delivery": 2000, "rider": 1000}
    ws = ok(c.put("/api/workspace", json={"base_rev": ws["rev"], "state": st})); st = ws["state"]
    inv = ok(c.post("/api/invites", json={"role": "rider", "ref": "r-tunde", "name": "Tunde"}))
    ok(TestClient(server.app).post("/api/auth/join", json={"code": inv["code"], "name": "Tunde Bakare", "phone": "0803 111 2041", "password": "ridepass1"}))
    today = whatsapp.today_iso()
    st["tasks"] = [
        {"id": "t1", "ref": "DL-1001", "riderId": "r-tunde", "vendorId": "v-glow", "customer": "Chioma Okafor", "phone": "+234 802 000 4411", "address": "12 Allen Avenue, Ikeja", "date": today, "time": "13:00",
         "items": [{"productId": "p-serum", "qty": 2, "free": 0, "price": 12500}], "status": "assigned", "history": [{"status": "assigned", "at": "x"}], "orderId": "ORD-3301"},
        {"id": "t2", "ref": "DL-1002", "riderId": "r-tunde", "vendorId": "v-glow", "customer": "Halima Yusuf", "address": "14 Adebola St, Surulere", "date": today,
         "items": [{"productId": "p-soap", "qty": 1, "free": 0, "price": 3500}], "status": "assigned", "history": []},
    ]
    ok(c.put("/api/workspace", json={"base_rev": ws["rev"], "state": st}))

    # 1. The drops reach Tunde's WhatsApp, with Accept / Can't take it and a one-tap link
    st = wait(c, lambda s: any(m.get("kind") == "drop" and (m.get("wa") or {}).get("status") == "delivered" for m in s["messages"]), "drop message")
    drop = next(m for m in st["messages"] if m.get("kind") == "drop")
    assert drop["riderId"] == "r-tunde" and "2 new drops" in drop["text"] and "Chioma Okafor" in drop["text"] and "/api/auth/link/" in drop["waText"], drop
    assert [b["id"] for b in drop["buttons"]] == ["ACCEPT", "DECLINE"]
    status = ok(c.get("/api/whatsapp/status")); assert status["provider"] == "test" and status["simulator"]

    say = lambda contact, text="", **kw: ok(c.post("/api/whatsapp/simulate", json={"contact": contact, "text": text, **kw}))
    # 2. YES accepts both drops
    say("rider:r-tunde", "Yes")
    st = wait(c, lambda s: all(t.get("acceptedAt") for t in s["tasks"]), "accept")
    assert "accepted" in last(st, "riderId", "r-tunde")["text"]
    # 3. Collected -> on the road, next stop
    say("rider:r-tunde", "I don collect am")
    st = wait(c, lambda s: all(t["status"] == "picked_up" for t in s["tasks"]), "collected")
    assert "Next stop" in last(st, "riderId", "r-tunde")["text"]
    # 4. Arrived -> the link that opens the app at this drop's photo and payment step
    say("rider:r-tunde", "", button="ARRIVED")
    st = wait(c, lambda s: s["tasks"][0].get("arrivedAt"), "arrived")
    reply = last(st, "riderId", "r-tunde")["text"]
    url = reply[reply.index("http"):].split()[0]
    assert "/api/auth/link/" in url, reply
    phone = TestClient(server.app)
    res = phone.get(url[url.index("/api/"):], follow_redirects=False)
    assert res.status_code == 303 and res.headers["location"] == "/rider?drop=t1&do=deliver", res.headers
    me = ok(phone.get("/api/auth/me")); assert me["user"]["role"] == "rider" and me["user"]["ref"] == "r-tunde", me
    # 5. Delivered without an amount -> ADA asks; the button answers
    say("rider:r-tunde", "Delivered")
    st = wait(c, lambda s: "How much" in last(s, "riderId", "r-tunde")["text"], "amount question")
    assert last(st, "riderId", "r-tunde")["buttons"][0]["title"] == "₦25,000 cash"
    say("rider:r-tunde", "₦25,000 cash", button="PAID_CASH")
    st = wait(c, lambda s: s["tasks"][0]["status"] == "delivered", "delivered")
    t1 = st["tasks"][0]
    assert t1["payment"] == {**t1["payment"], "method": "cash", "amount": 25000, "confirmed": True} and t1["proof"]["photoPending"], t1
    assert "add the doorstep photo" in last(st, "riderId", "r-tunde")["text"]
    # the vendor hears about it on WhatsApp
    st = wait(c, lambda s: any("Delivered to Chioma" in m["text"] for m in msgs_to(s, "vendorId", "v-glow")), "vendor delivered")
    # 6. A photo sent on WhatsApp goes on that drop
    png = "data:image/png;base64," + base64.b64encode(b"\x89PNG\r\n\x1a\n" + os.urandom(64)).decode()
    say("rider:r-tunde", "", image=png)
    st = wait(c, lambda s: (s["tasks"][0]["proof"] or {}).get("photo"), "photo")
    assert not st["tasks"][0]["proof"]["photoPending"] and st["tasks"][0]["proof"]["photo"].startswith("/api/photos/")
    # 7. A problem at the second stop, with the reason
    say("rider:r-tunde", "Customer not picking calls")
    st = wait(c, lambda s: s["tasks"][1]["status"] == "failed", "failed")
    assert st["tasks"][1]["failReason"] == "Customer not picking calls"
    assert any("Couldn't deliver to Halima" in m["text"] for m in msgs_to(st, "vendorId", "v-glow")) or wait(c, lambda s: any("Couldn't deliver to Halima" in m["text"] for m in msgs_to(s, "vendorId", "v-glow")), "vendor failed")
    # 8. Earnings and paying in cash
    say("rider:r-tunde", "how much did I earn today?")
    st = wait(c, lambda s: last(s, "riderId", "r-tunde")["text"].startswith("💰 Today: ₦1,000 for 1 drop"), "earnings")
    say("rider:r-tunde", "paid in ref TRF12345")
    st = wait(c, lambda s: (s["tasks"][0]["payment"].get("handedIn") or {}).get("ref") == "TRF12345", "paid in")
    # 9. The office confirms the cash -> rider is told
    cw = ok(c.get("/api/workspace")); cs = cw["state"]; cs["tasks"][0]["payment"]["handInVerified"] = "now"
    ok(c.put("/api/workspace", json={"base_rev": cw["rev"], "state": cs}))
    wait(c, lambda s: "confirmed the ₦25,000" in last(s, "riderId", "r-tunde")["text"], "verified")

    # 10. A vendor sends orders on WhatsApp
    say("vendor:v-glow", "Tuesday orders\n1. Adaeze Nnaji 08035551234, 15 Adeniran Ogunsanya St Surulere, 2 serum, 25k\n2. Tayo 08123456677, 07012345678, 3 black soap, 10,500")
    st = wait(c, lambda s: len([o for o in s["orders"] if o.get("via") == "whatsapp"]) == 2, "orders")
    a, b = sorted([o for o in st["orders"] if o.get("via") == "whatsapp"], key=lambda o: o["id"])
    assert a["status"] == "open" and a["customer"] == "Adaeze Nnaji" and a["by"]["name"] == "Funmi Ade", a
    assert b["status"] == "needs_fix", b
    r = last(st, "vendorId", "v-glow")["text"]
    assert "Got 2 orders" in r and "⚠️" in r and a["id"] in r, r
    # 11. Stock on the way, then counted in by the office
    say("vendor:v-glow", "Sending 40 serum tomorrow")
    st = wait(c, lambda s: any(i.get("status") == "sent" and i["qty"] == 40 for i in s["intake"]), "stock")
    assert "Noted: 40 × Vitamin C face serum" in last(st, "vendorId", "v-glow")["text"]
    cw = ok(c.get("/api/workspace")); cs = cw["state"]
    i = next(i for i in cs["intake"] if i.get("status") == "sent"); i.update(status="received", qty=38)
    ok(c.put("/api/workspace", json={"base_rev": cw["rev"], "state": cs}))
    wait(c, lambda s: "counted in 38 × Vitamin C face serum (you sent 40)" in last(s, "vendorId", "v-glow")["text"], "counted")
    say("vendor:v-glow", "balance?")
    wait(c, lambda s: last(s, "vendorId", "v-glow")["text"].startswith("💸 We owe you ₦23,000 for 1 delivered order"), "balance")

    # 12. Office message in the app -> WhatsApp too
    cw = ok(c.get("/api/workspace")); cs = cw["state"]
    cs["messages"].append({"id": "office-1", "riderId": "r-amaka", "from": "dispatcher", "text": "Come to the office by 9", "read": False, "at": "x"})
    ok(c.put("/api/workspace", json={"base_rev": cw["rev"], "state": cs}))
    wait(c, lambda s: (next(m for m in s["messages"] if m["id"] == "office-1").get("wa") or {}).get("status") == "delivered", "forward")

    # 13. Staff step in: ADA stays quiet in that chat
    ok(c.put("/api/whatsapp/settings", json={"paused": {"rider:r-amaka": True}}))
    say("rider:r-amaka", "hello")
    st = wait(c, lambda s: last(s, "riderId", "r-amaka")["from"] == "rider", "inbound")
    time.sleep(0.3); st = ok(c.get("/api/workspace"))["state"]
    assert last(st, "riderId", "r-amaka")["from"] == "rider" and st["company"]["whatsapp"]["paused"] == {"rider:r-amaka": True}

    # 14. The paste box uses the same reader
    res = ok(c.post("/api/intake/read", json={"text": "Tuesday\nName: Bola\nPhone: 07031234567\nAddress: 9 Ogunlana Drive, Surulere\nItem: 1 serum\nAmount: 12500", "vendorId": "v-glow"}))
    assert res["orders"][0]["customer"] == "Bola" and res["orders"][0]["items"][0]["productId"] == "p-serum"

    # 15. A real Meta webhook: signature, number lookup, button reply
    sent = []
    class FakeMeta(wa_providers.Meta):
        def __init__(self):
            super().__init__(); self.verify_token = "vt"; self.secret = "s3cret"
        def send(self, to, text, buttons=None, outside_window=False):
            sent.append((to, text, outside_window)); return wa_providers.Result(id=f"wamid.{len(sent)}", status="sent")
    wa_providers.line = FakeMeta()
    assert c.get("/api/whatsapp/webhook", params={"hub.mode": "subscribe", "hub.verify_token": "vt", "hub.challenge": "42"}).text == "42"
    body = json.dumps({"entry": [{"changes": [{"value": {"messages": [{"from": "2348065529010", "id": "wamid.in1", "type": "text", "text": {"body": "help"}}]}}]}]}).encode()
    ok(c.post("/api/whatsapp/webhook", content=body, headers={"x-hub-signature-256": "sha256=bad"}), 403)
    sig = "sha256=" + hmac.new(b"s3cret", body, hashlib.sha256).hexdigest()
    ok(c.post("/api/whatsapp/webhook", content=body, headers={"x-hub-signature-256": sig, "content-type": "application/json"}))
    ok(c.post("/api/whatsapp/webhook", content=body, headers={"x-hub-signature-256": sig, "content-type": "application/json"}))  # retry: ignored
    st = wait(c, lambda s: len([m for m in msgs_to(s, "riderId", "r-amaka") if m["from"] == "rider"]) == 2, "webhook in")
    # Amaka is paused, so no reply; unpause and she gets the menu
    ok(c.put("/api/whatsapp/settings", json={"paused": {"rider:r-amaka": False}}))
    body2 = json.dumps({"entry": [{"changes": [{"value": {"messages": [{"from": "2348065529010", "id": "wamid.in2", "type": "text", "text": {"body": "menu"}}]}}]}]}).encode()
    ok(c.post("/api/whatsapp/webhook", content=body2, headers={"x-hub-signature-256": "sha256=" + hmac.new(b"s3cret", body2, hashlib.sha256).hexdigest(), "content-type": "application/json"}))
    st = wait(c, lambda s: last(s, "riderId", "r-amaka")["from"] == "ada" and (last(s, "riderId", "r-amaka").get("wa") or {}).get("status") == "sent", "webhook reply")
    assert sent and sent[-1][0] == "2348065529010" and "I'm ADA" in sent[-1][1] and not sent[-1][2], sent
    wid = last(st, "riderId", "r-amaka")["wa"]["id"]
    body3 = json.dumps({"entry": [{"changes": [{"value": {"statuses": [{"id": wid, "status": "read"}]}}]}]}).encode()
    ok(c.post("/api/whatsapp/webhook", content=body3, headers={"x-hub-signature-256": "sha256=" + hmac.new(b"s3cret", body3, hashlib.sha256).hexdigest(), "content-type": "application/json"}))
    wait(c, lambda s: last(s, "riderId", "r-amaka")["wa"]["status"] == "read", "read receipt")
    # template outside the 24-hour window
    p = wa_providers.Meta().payload("234", "Line one\nLine two", None, True)
    assert p["type"] == "template" and p["template"]["components"][0]["parameters"][0]["text"] == "Line one · Line two"
    ok(c.post("/api/whatsapp/simulate", json={"contact": "rider:r-amaka", "text": "hi"}), 409)
print("whatsapp ok")

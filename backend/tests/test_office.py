# The office on WhatsApp, ADA's own follow-ups, LOGIN links and voice notes, on the test line.
# Run: python3 backend/tests/test_office.py
import os, sys, json, tempfile, time, asyncio, hmac, hashlib
from datetime import datetime, timedelta, timezone
os.environ["DATA_DIR"] = tempfile.mkdtemp()
os.environ.pop("DATABASE_URL", None); os.environ.pop("ANTHROPIC_API_KEY", None)
os.environ["NUDGES"] = "off"  # the test runs the follow-ups itself, at chosen times
for k in ("WHATSAPP_TOKEN", "TWILIO_ACCOUNT_SID", "WHATSAPP_PROVIDER"):
    os.environ.pop(k, None)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
import server, whatsapp, wa_providers, office, nudges

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

# The intents, without a server
I = office.office_intent
assert I("How far today?") == "today" and I("dispatch") == "dispatch" and I("send today's orders out") == "dispatch"
assert I("GlowSkin dropped 40 serum") == "receive" and I("count in") == "count" and I("who has cash") == "cash"
assert I("verify Tunde") == "verify" and I("confirm Tunde's cash") == "verify" and I("what do we owe vendors") == "owed"
assert I("pay GlowSkin ref TRF9") == "payout" and I("Tunde paid in") != "payout" and I("DL-1042") == "track" and I("where is Chioma") == "track"
assert I("move DL-1042 to Amaka") == "move" and I("tell all riders to return unsold items by 6pm") == "tell" and I("Yes") == "approve" and I("no") == "cancel"
assert I("record yesterday") == "record" and I("", "APPROVE") == "approve"

DEMO = json.load(open(os.path.join(os.path.dirname(__file__), "demo_state.json")))
with TestClient(server.app) as c:
    me = ok(c.post("/api/auth/signup/company", json={"company": "Swift", "name": "George Okoro", "phone": "0807 555 0101", "password": "password1", "city": "Lagos"}))
    uid = c.get("/api/auth/me").json()["user"]["id"]
    ws = ok(c.get("/api/workspace")); st = ws["state"]
    st.update(vendors=DEMO["vendors"], riders=DEMO["riders"], products=DEMO["products"])
    st["company"]["fees"] = {"delivery": 2000, "rider": 1000}
    today = whatsapp.today_iso()
    st["orders"] = [
        {"id": "ORD-3401", "vendorId": "v-glow", "customer": "Chioma Okafor", "phone": "+2348020004411", "address": "12 Allen Avenue, Ikeja", "zone": "Ikeja", "date": today, "status": "open",
         "items": [{"productId": "p-serum", "qty": 2, "free": 0}], "amount": 25000},
        {"id": "ORD-3402", "vendorId": "v-glow", "customer": "Halima Yusuf", "phone": "+2348030001122", "address": "14 Adebola St, Surulere", "zone": "Surulere", "date": today, "status": "open",
         "items": [{"productId": "p-soap", "qty": 1, "free": 0}], "amount": 3500},
        {"id": "ORD-3403", "vendorId": "v-glow", "customer": "No Address", "date": today, "status": "needs_fix", "items": [{"productId": "p-soap", "qty": 1, "free": 0}], "issues": ["No address."]},
    ]
    ok(c.put("/api/workspace", json={"base_rev": ws["rev"], "state": st}))

    say = lambda text="", **kw: ok(c.post("/api/whatsapp/simulate", json={"contact": "staff:me", "text": text, **kw}))
    mine = lambda s: [m for m in s["messages"] if m.get("staffId") == uid]
    ada = lambda s: [m for m in mine(s) if m["from"] == "ada"]
    n_ada = lambda: len(ada(c.get("/api/workspace").json()["state"]))
    def ask(text="", **kw):
        n = n_ada(); say(text, **kw)
        return wait(c, lambda s: len(ada(s)) > n, f"ADA's answer to {text or kw}")

    # 1. How's today: what needs the office, with buttons
    st = ask("How far today?")
    r = ada(st)[-1]
    assert "2 orders are waiting for a rider" in r["text"] and "1 order needs fixing" in r["text"], r["text"]
    assert r["buttons"][0]["id"] == "DISPATCH" and r["wa"]["status"] == "no_number" or r["wa"]["status"] in ("delivered", "queued"), r
    assert mine(st)[-2]["from"] == "staff" and mine(st)[-2]["staffName"] == "George Okoro"
    # it reached George's own WhatsApp number (the test line says delivered)
    st = wait(c, lambda s: (ada(s)[-1].get("wa") or {}).get("status") == "delivered", "sent to George")

    # 2. Dispatch is a plan first: nothing changes until YES
    st = ask("dispatch")
    r = ada(st)[-1]
    assert "Dispatch plan: 2 orders" in r["text"] and "Tunde" in r["text"] and "Sade" in r["text"] and [b["id"] for b in r["buttons"]] == ["APPROVE", "CANCEL"], r["text"]
    assert not st["tasks"]
    st = ask("", button="APPROVE")
    assert "2 deliveries created" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    assert {t["orderId"]: t["riderId"] for t in st["tasks"]} == {"ORD-3401": "r-tunde", "ORD-3402": "r-sade"}, st["tasks"]
    assert all(o["status"] == "planned" for o in st["orders"] if o["id"] != "ORD-3403")
    t1 = next(t for t in st["tasks"] if t["orderId"] == "ORD-3401")
    assert t1["ref"].startswith("DL-") and t1["items"][0]["price"] == 12500 and t1["by"]["name"] == "George Okoro"
    # the riders got their run sheets on WhatsApp by themselves
    st = wait(c, lambda s: any(m.get("kind") == "drop" and m.get("riderId") == "r-tunde" for m in s["messages"]), "run sheet")
    # nothing left waiting
    st = ask("yes")
    assert "nothing waiting" in ada(st)[-1]["text"]

    # 3. Stock in: plan, then NO leaves it, then YES adds it
    before = next(p for p in st["products"] if p["id"] == "p-serum")["received"]
    st = ask("GlowSkin dropped 40 serum")
    assert "Add to stock from GlowSkin Naturals: 40 × Vitamin C face serum" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    st = ask("no")
    assert "Nothing changed" in ada(st)[-1]["text"] and next(p for p in st["products"] if p["id"] == "p-serum")["received"] == before
    ask("GlowSkin dropped 40 serum"); st = ask("Yes")
    assert next(p for p in st["products"] if p["id"] == "p-serum")["received"] == before + 40, ada(st)[-1]["text"]
    assert st["intake"][0]["status"] == "received" and st["intake"][0]["by"]["via"] == "whatsapp"

    # 4. A vendor sends stock on WhatsApp; the office counts it in from WhatsApp; the vendor hears
    ok(c.post("/api/whatsapp/simulate", json={"contact": "vendor:v-glow", "text": "Sending 10 black soap"}))
    wait(c, lambda s: any(i.get("status") == "sent" for i in s["intake"]), "stock sent")
    st = ask("count in")
    assert "10 × Black soap bar from GlowSkin Naturals" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    st = ask("", button="APPROVE")
    assert not any(i.get("status") == "sent" for i in st["intake"]) and "Counted in 1" in ada(st)[-1]["text"]
    wait(c, lambda s: any("counted in 10 × Black soap bar" in m["text"] for m in s["messages"] if m.get("vendorId") == "v-glow"), "vendor told")

    # 5. Tunde delivers on WhatsApp; the office sees the cash and verifies it
    rider = lambda text="", **kw: ok(c.post("/api/whatsapp/simulate", json={"contact": "rider:r-tunde", "text": text, **kw}))
    rider("Yes"); wait(c, lambda s: next(t for t in s["tasks"] if t["riderId"] == "r-tunde").get("acceptedAt"), "accept")
    rider("Collected"); wait(c, lambda s: next(t for t in s["tasks"] if t["riderId"] == "r-tunde")["status"] == "picked_up", "collected")
    rider("Delivered 25000 cash"); st = wait(c, lambda s: next(t for t in s["tasks"] if t["riderId"] == "r-tunde")["status"] == "delivered", "delivered")
    st = ask("cash")
    assert "Tunde: holding ₦25,000" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    st = ask("verify Tunde")
    assert "Confirm ₦25,000 handed over by Tunde" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    st = ask("Yes")
    t1 = next(t for t in st["tasks"] if t["riderId"] == "r-tunde")
    assert t1["payment"]["handInVerified"] and t1["payment"]["handedIn"], t1["payment"]
    wait(c, lambda s: any("confirmed the ₦25,000" in m["text"] for m in s["messages"] if m.get("riderId") == "r-tunde"), "rider told")

    # 6. Owed and payout, then the vendor hears
    st = ask("what do we owe")
    assert "GlowSkin Naturals: ₦23,000 for 1 order" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    ask("pay GlowSkin ref TRF9"); st = ask("Yes")
    assert next(t for t in st["tasks"] if t["riderId"] == "r-tunde")["settled"]["ref"] == "TRF9"
    wait(c, lambda s: any("Payout sent: ₦23,000" in m["text"] for m in s["messages"] if m.get("vendorId") == "v-glow"), "vendor payout")

    # 7. Track a drop, then move the other one to Kwame
    t2 = next(t for t in st["tasks"] if t["orderId"] == "ORD-3402")
    st = ask(f"where is Halima")
    assert t2["ref"] in ada(st)[-1]["text"] and "Sade" in ada(st)[-1]["text"] and "not collected yet" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    st = ask(f"move {t2['ref']} to Kwame")
    assert f"Give {t2['ref']} (Halima Yusuf) to Kwame" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    st = ask("ok")
    assert next(t for t in st["tasks"] if t["id"] == t2["id"])["riderId"] == "r-kwame"
    st = wait(c, lambda s: any(m.get("kind") == "drop" and m.get("riderId") == "r-kwame" for m in s["messages"]), "Kwame's run sheet")
    assert any("gone to another rider" in m["text"] for m in st["messages"] if m.get("riderId") == "r-sade")

    # 8. Tell all riders: approve first, then it goes to each rider on WhatsApp
    st = ask("Tell all riders to return unsold items by 6pm")
    assert "Send to all 4 riders on duty" in ada(st)[-1]["text"], ada(st)[-1]["text"]
    st = ask("Yes")
    st = wait(c, lambda s: sum(1 for m in s["messages"] if m.get("text") == "Return unsold items by 6pm" and (m.get("wa") or {}).get("status")) == 4, "broadcast")

    # 9. Orders pasted by the office for a vendor
    st = ask("GlowSkin orders\n1. Adaeze Nnaji 08035551234, 15 Adeniran Ogunsanya St Surulere, 2 serum, 25k")
    assert "Read 1 order for GlowSkin Naturals" in ada(st)[-1]["text"] and st["orders"][0]["via"] == "whatsapp" and st["orders"][0]["placedBy"] == "company", ada(st)[-1]["text"]

    # 10. LOGIN: a one-tap link that signs George in on his phone
    st = ask("login")
    text = ada(st)[-1]["text"]; url = text[text.index("http"):].split()[0]
    phone = TestClient(server.app)
    res = phone.get(url[url.index("/api/"):], follow_redirects=False)
    assert res.status_code == 303 and res.headers["location"] == "/company", res.headers
    assert ok(phone.get("/api/auth/me"))["user"]["id"] == uid
    # riders and vendors too
    rider("login"); st = wait(c, lambda s: "Open your dashboard here: http://testserver/signin?next=/rider" in [m for m in s["messages"] if m.get("riderId") == "r-tunde"][-1]["text"], "rider login (no account yet)")

    # 11. Help, and something ADA can't read
    st = ask("menu"); assert "Run the day from this chat" in ada(st)[-1]["text"]
    st = ask("blah blah"); assert "didn't catch that" in ada(st)[-1]["text"]

    # 12. ADA speaks first: follow-ups at chosen times
    wid = c.get("/api/auth/me").json()["user"]["workspaceId"]
    tick = lambda at: c.portal.call(nudges.tick, wid, at)  # on the app's own event loop
    # Kwame hasn't answered his drop. 25 minutes later: a nudge to Kwame only.
    st = c.get("/api/workspace").json()["state"]
    sent_at = max(datetime.fromisoformat(m["at"].replace("Z", "+00:00")) for m in st["messages"] if m.get("kind") == "drop" and m.get("riderId") == "r-kwame")
    noon = lambda dt: dt.astimezone(whatsapp.TZ).replace(hour=12).astimezone(timezone.utc)
    base = sent_at if 7 <= sent_at.astimezone(whatsapp.TZ).hour < 18 else noon(sent_at)
    # Make the offer look like it was sent at `base` so the clock is in riders' hours.
    def set_offer_time(s, at):
        for m in s["messages"]:
            if m.get("kind") == "drop" and m.get("riderId") == "r-kwame":
                m["at"] = at.isoformat()
    ws = ok(c.get("/api/workspace")); s = ws["state"]; set_offer_time(s, base); ok(c.put("/api/workspace", json={"base_rev": ws["rev"], "state": s}))
    n = tick(base + timedelta(minutes=25))
    st = c.get("/api/workspace").json()["state"]
    assert n == 1 and [m for m in st["messages"] if m.get("riderId") == "r-kwame"][-1]["kind"] == "nudge", n
    assert tick(base + timedelta(minutes=26)) == 0  # only once
    # 50 minutes: the office hears, with who could take it
    assert tick(base + timedelta(minutes=50)) == 1
    st = c.get("/api/workspace").json()["state"]
    alert = ada(st)[-1]
    assert alert["kind"] == "nudge" and "Kwame hasn't answered 1 drop" in alert["text"] and "Reply MOVE" in alert["text"], alert["text"]
    # Evening: the wrap for the office
    evening = (base.astimezone(whatsapp.TZ).replace(hour=19, minute=30)).astimezone(timezone.utc)
    tick(evening)
    st = c.get("/api/workspace").json()["state"]
    assert any(m["text"].startswith("🌙 End of day.") for m in ada(st)), [m["text"][:40] for m in ada(st)[-3:]]
    assert tick(evening + timedelta(minutes=5)) == 0
    # Turned off in settings: nothing more
    ok(c.put("/api/whatsapp/settings", json={"notify": {"nudges": False, "staffBriefs": False}}))
    assert tick(evening + timedelta(days=0, hours=1)) == 0

    # 13. A voice note and a location from a rider, through the Meta webhook; blue ticks
    read = []
    class FakeMeta(wa_providers.Meta):
        def __init__(self):
            super().__init__(); self.secret = "s3cret"
        def send(self, to, text, buttons=None, outside_window=False, image=""):
            return wa_providers.Result(id="wamid.out", status="sent")
        def media(self, media_id):
            return ("audio/ogg; codecs=opus", b"OggS-fake")
        def mark_read(self, message_id):
            read.append(message_id)
    wa_providers.line = FakeMeta()
    def hook(msg):
        body = json.dumps({"entry": [{"changes": [{"value": {"messages": [msg]}}]}]}).encode()
        ok(c.post("/api/whatsapp/webhook", content=body, headers={"x-hub-signature-256": "sha256=" + hmac.new(b"s3cret", body, hashlib.sha256).hexdigest(), "content-type": "application/json"}))
    hook({"from": "2348031112041", "id": "wamid.v1", "type": "audio", "audio": {"id": "m1"}})
    st = wait(c, lambda s: any(m.get("audio") for m in s["messages"]), "voice note")
    v = next(m for m in st["messages"] if m.get("audio"))
    assert v["riderId"] == "r-tunde" and v["text"] == "🎤 Voice note" and v["audio"].startswith("/api/photos/")
    st = wait(c, lambda s: "voice note" in [m for m in s["messages"] if m.get("riderId") == "r-tunde"][-1]["text"].lower() and [m for m in s["messages"] if m.get("riderId") == "r-tunde"][-1]["from"] == "ada", "voice reply")
    hook({"from": "2348031112041", "id": "wamid.l1", "type": "location", "location": {"latitude": 6.6018, "longitude": 3.3515}})
    st = wait(c, lambda s: (next(r for r in s["riders"] if r["id"] == "r-tunde").get("location") or {}).get("lat") == 6.6018, "location")
    end = time.time() + 3
    while time.time() < end and not {"wamid.v1", "wamid.l1"} <= set(read):
        time.sleep(0.05)
    assert {"wamid.v1", "wamid.l1"} <= set(read), read
    # George texts from his own phone: found by the number on his login
    hook({"from": "2348075550101", "id": "wamid.g1", "type": "text", "text": {"body": "cash"}})
    st = wait(c, lambda s: mine(s)[-1]["from"] == "ada" and mine(s)[-2]["wa"]["id"] == "wamid.g1", "George on the real line")
    assert "No cash is with riders" in mine(st)[-1]["text"], mine(st)[-1]["text"]
print("office ok")

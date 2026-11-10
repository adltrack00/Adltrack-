# End-to-end check of accounts, invites and who may see and change what. Run: python3 backend/tests/test_api.py
import os, sys, json, tempfile, base64
os.environ["DATA_DIR"] = tempfile.mkdtemp()
os.environ.pop("DATABASE_URL", None)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
import server
c = TestClient(server.app)
def ok(r, code=200):
    assert r.status_code == code, (r.status_code, r.text[:400]); return r.json()
# company signup
me = ok(c.post("/api/auth/signup/company", json={"company":"Swift Couriers","name":"George N","email":"g@x.com","password":"password1","city":"Lagos"}))
assert me["user"]["role"]=="company", me
ws = ok(c.get("/api/workspace")); st = ws["state"]; assert st["company"]["name"]=="Swift Couriers"
st["vendors"].append({"id":"v1","name":"Glow","color":"#f00"}); st["riders"].append({"id":"r1","name":"Tunde","short":"Tunde","online":True,"dailyUnits":10})
st["riders"].append({"id":"r2","name":"Amaka","short":"Amaka","online":True,"dailyUnits":10})
st["products"].append({"id":"p1","vendorId":"v1","name":"Serum","unit":"bottle","price":1000,"received":50,"aliases":[]})
st["tasks"].append({"id":"t1","ref":"DL-1","riderId":"r1","vendorId":"v1","customer":"Kola","items":[{"productId":"p1","qty":2,"price":1000}],"status":"assigned","history":[]})
st["tasks"].append({"id":"t2","ref":"DL-2","riderId":"r2","vendorId":"v1","customer":"Bisi","items":[{"productId":"p1","qty":1,"price":1000}],"status":"assigned","history":[]})
rev = ok(c.put("/api/workspace", json={"base_rev":ws["rev"],"state":st}))["rev"]
inv = ok(c.post("/api/invites", json={"role":"rider","ref":"r1","name":"Tunde"}))
vinv = ok(c.post("/api/invites", json={"role":"vendor","ref":"v1","name":"Glow"}))
assert ok(c.get(f"/api/invites/{inv['code']}"))["company"]=="Swift Couriers"
# rider joins
r = TestClient(server.app)
ok(r.post("/api/auth/join", json={"code":inv["code"],"name":"Tunde B","phone":"0803 111 2041","password":"ridepass1"}))
rv = ok(r.get("/api/workspace")); s2 = rv["state"]
assert [t["id"] for t in s2["tasks"]]==["t1"] and s2["intake"]==[] and len(s2["riders"])==1
# rider delivers with a big photo
photo = "data:image/jpeg;base64," + base64.b64encode(os.urandom(9000)).decode()
s2["tasks"][0].update(status="delivered", proof={"photo":photo,"at":"x"}, payment={"method":"cash","amount":2000,"confirmed":True})
s2["messages"].append({"id":"m1","riderId":"r1","from":"rider","text":"Done","read":False})
res = ok(r.put("/api/workspace", json={"base_rev":rv["rev"],"state":s2}))
assert res["state"]["tasks"][0]["proof"]["photo"].startswith("/api/photos/")
pr = r.get(res["state"]["tasks"][0]["proof"]["photo"]); assert pr.status_code==200 and len(pr.content)==9000
# rider tries to change price -> refused
s3 = res["state"]; s3["products"][0]["price"]=1
ok(r.put("/api/workspace", json={"base_rev":res["rev"],"state":s3}), 403)
s3 = ok(r.get("/api/workspace")); x = s3["state"]; x["tasks"][0]["riderId"]="r2"
ok(r.put("/api/workspace", json={"base_rev":s3["rev"],"state":x}), 403)
ok(r.post("/api/ada", json={"messages":[],"context":{}}), 403)
ok(r.get("/api/team"), 403)
# vendor joins, adds order with colliding id, sees both tasks
v = TestClient(server.app)
ok(v.post("/api/auth/join", json={"code":vinv["code"],"name":"Funmi","email":"F@glow.com","password":"vendpass1"}))
vv = ok(v.get("/api/workspace")); vs = vv["state"]
assert len(vs["tasks"])==2 and vs["tasks"][0]["proof"]["photo"].startswith("/api/photos/") and vs["messages"]==[]
vs["orders"].insert(0, {"id":"ORD-3301","vendorId":"v1","customer":"New","items":[],"status":"open"})
vs["messages"].append({"id":"mv","vendorId":"v1","from":"vendor","text":"hi"})
ok(v.put("/api/workspace", json={"base_rev":vv["rev"],"state":vs}))
# stale save -> 409
ok(v.put("/api/workspace", json={"base_rev":vv["rev"],"state":vs}), 409)
full = ok(c.get("/api/workspace"))["state"]
assert full["orders"][0]["customer"]=="New" and full["tasks"][0]["status"]=="delivered" and any(m["id"]=="mv" for m in full["messages"]) and any(m["id"]=="m1" for m in full["messages"])
# sign in with other phone format
r2 = TestClient(server.app)
assert ok(r2.post("/api/auth/signin", json={"login":"+234 803 111 2041","password":"ridepass1"}))["user"]["ref"]=="r1"
ok(r2.post("/api/auth/signin", json={"login":"f@glow.com","password":"wrong"}), 401)
team = ok(c.get("/api/team")); assert len(team["members"])==3, team
# reset: new invite replaces old rider login
inv2 = ok(c.post("/api/invites", json={"role":"rider","ref":"r1"}))
ok(TestClient(server.app).post("/api/auth/join", json={"code":inv2["code"],"name":"Tunde","phone":"08031112041","password":"newpass12"}))
ok(r.get("/api/workspace"), 401)
# demo
d = TestClient(server.app)
ok(d.post("/api/auth/demo", json={"role":"rider"}), 409)
seed = {"version":5,"company":{"name":"Delivery"},"vendors":[],"riders":[{"id":"r-tunde"}],"products":[],"intake":[],"orders":[],"tasks":[],"messages":[],"nextRef":1}
assert ok(d.post("/api/auth/demo", json={"role":"rider","seed":seed}))["user"]["demo"]
assert ok(d.get("/api/workspace"))["state"]["riders"][0]["id"]=="r-tunde"
# other company can't see
o = TestClient(server.app)
ok(o.post("/api/auth/signup/company", json={"company":"Other","name":"X","phone":"0812 000 0000","password":"password1"}))
assert ok(o.get("/api/workspace"))["state"]["vendors"]==[]
ok(o.get(res["state"]["tasks"][0]["proof"]["photo"]), 404)
ok(o.post("/api/auth/signup/company", json={"company":"Dup","name":"X","email":"g@x.com","password":"password1"}), 409)
print("ALL OK")

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
# vendor team: the main account invites two teammates; a teammate can't manage the team
vt = ok(v.post("/api/vendor-team/invites", json={"name":"Kemi"}))
vt2 = ok(v.post("/api/vendor-team/invites", json={"name":"Sola"}))
assert ok(c.get(f"/api/invites/{vt['code']}"))["vendor"]=="Glow"
k = TestClient(server.app); ok(k.post("/api/auth/join", json={"code":vt["code"],"name":"Kemi A","phone":"0809 222 3333","password":"kemipass1"}))
s_ = TestClient(server.app); ok(s_.post("/api/auth/join", json={"code":vt2["code"],"name":"Sola B","email":"sola@glow.com","password":"solapass1"}))
assert ok(k.get("/api/auth/me"))["user"]["teammate"] and not ok(v.get("/api/auth/me"))["user"]["teammate"]
ok(k.get("/api/vendor-team"), 403); ok(k.post("/api/vendor-team/invites", json={"name":"x"}), 403)
assert len(ok(v.get("/api/vendor-team"))["members"])==3
# both teammates load the same copy, then save different work at once: neither overwrites the other
kv = ok(k.get("/api/workspace")); sv = ok(s_.get("/api/workspace"))
ks = kv["state"]; ks["products"].append({"id":"p-new","vendorId":"v1","name":"Toner","unit":"bottle","price":2500,"received":0,"aliases":[]})
ks["intake"].insert(0, {"id":"in-k","vendorId":"v1","productId":"p-new","qty":20,"price":2500,"status":"sent","at":"x","by":{"id":"fake","name":"Someone else"}})
ok(k.put("/api/workspace", json={"base_rev":kv["rev"],"state":ks}))
ss = sv["state"]; ss["intake"].insert(0, {"id":"in-s","vendorId":"v1","productId":"p1","qty":5,"price":1000,"status":"sent","at":"y"})
conflict = ok(s_.put("/api/workspace", json={"base_rev":sv["rev"],"state":ss}), 409)
ss = conflict["state"]; ss["intake"].insert(0, {"id":"in-s","vendorId":"v1","productId":"p1","qty":5,"price":1000,"status":"sent","at":"y"})
ok(s_.put("/api/workspace", json={"base_rev":conflict["rev"],"state":ss}))
full = ok(c.get("/api/workspace"))["state"]
ik = next(i for i in full["intake"] if i["id"]=="in-k"); is_ = next(i for i in full["intake"] if i["id"]=="in-s")
assert ik["by"]["name"]=="Kemi A" and is_["by"]["name"]=="Sola B", (ik, is_)
p_new = next(p for p in full["products"] if p["id"]=="p-new"); assert p_new["received"]==0 and p_new["by"]["name"]=="Kemi A"
assert next(p for p in full["products"] if p["id"]=="p1")["received"]==50
# a teammate can't add stock straight into the count, or send stock for another vendor's product
kv = ok(k.get("/api/workspace")); x = kv["state"]; x["products"].append({"id":"p-bad","vendorId":"v1","name":"X","price":1,"received":9,"aliases":[]})
ok(k.put("/api/workspace", json={"base_rev":kv["rev"],"state":x}), 403)
kv = ok(k.get("/api/workspace")); x = kv["state"]; x["intake"].insert(0, {"id":"in-bad","vendorId":"v1","productId":"p-other","qty":1,"status":"sent"})
ok(k.put("/api/workspace", json={"base_rev":kv["rev"],"state":x}), 403)
# removing a teammate signs them out; a new company invite for the vendor keeps the teammates
mid = next(m["id"] for m in ok(v.get("/api/vendor-team"))["members"] if m["name"]=="Sola B")
ok(v.delete(f"/api/vendor-team/{mid}")); ok(s_.get("/api/workspace"), 401)
vinv2 = ok(c.post("/api/invites", json={"role":"vendor","ref":"v1"}))
ok(TestClient(server.app).post("/api/auth/join", json={"code":vinv2["code"],"name":"Funmi","email":"f2@glow.com","password":"vendpass2"}))
ok(v.get("/api/workspace"), 401); ok(k.get("/api/workspace"))
# profile photo: saved on the login, shown to the company's team list, refused if it isn't an image, removable
pic = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ=="
assert ok(k.put("/api/auth/photo", json={"photo":pic}))["user"]["photo"]==pic
assert ok(k.get("/api/auth/me"))["user"]["photo"]==pic
assert any(m.get("photo")==pic for m in ok(c.get("/api/team"))["members"])
ok(k.put("/api/auth/photo", json={"photo":"data:text/html;base64,PGI+"}), 400)
assert ok(k.put("/api/auth/photo", json={"photo":None}))["user"]["photo"] is None
# demo
d = TestClient(server.app)
ok(d.post("/api/auth/demo", json={"role":"rider"}), 409)
seed = {"version":5,"company":{"name":"Delivery"},"vendors":[],"riders":[{"id":"r-tunde"}],"products":[],"intake":[],"orders":[],"tasks":[],"messages":[],"nextRef":1}
assert ok(d.post("/api/auth/demo", json={"role":"rider","seed":seed}))["user"]["demo"]
assert ok(d.get("/api/workspace"))["state"]["riders"][0]["id"]=="r-tunde"
ok(d.put("/api/auth/photo", json={"photo":pic}), 403)
# other company can't see
o = TestClient(server.app)
ok(o.post("/api/auth/signup/company", json={"company":"Other","name":"X","phone":"0812 000 0000","password":"password1"}))
assert ok(o.get("/api/workspace"))["state"]["vendors"]==[]
ok(o.get(res["state"]["tasks"][0]["proof"]["photo"]), 404)
ok(o.post("/api/auth/signup/company", json={"company":"Dup","name":"X","email":"g@x.com","password":"password1"}), 409)
print("ALL OK")

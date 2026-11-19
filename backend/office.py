"""The office on WhatsApp: the company owner and staff run the day by texting ADA, the same way riders and vendors do.

The idea (borrowed from agents people simply text): the chat is the product. Staff write in their own words, ADA does
the work in the same workspace the dashboards show, and anything that moves stock, money or riders, or sends a
message to someone else, is a short plan with Approve / Cancel first. Nothing changes until someone says yes.

  How's today / needs you        what's waiting on the office, in a few lines
  Dispatch                       open orders -> deliveries for riders within their daily allocation   (approve)
  GlowSkin dropped 40 serum      stock received at the office                                         (approve)
  Count in                       stock a vendor sent, counted in as sent                              (approve)
  Cash / verify Tunde            cash with riders, and confirming what a rider paid in                (approve)
  Owed / pay GlowSkin ref X      what each vendor is owed, and marking the payout sent                (approve)
  DL-1042 / where is Chioma      one drop: who has it, where it is, what was collected
  Move DL-1042 to Amaka          give a drop to another rider                                         (approve)
  Tell all riders ... / tell X   a message to riders or a vendor                                      (approve)
  Orders pasted for a vendor     read into orders, like a vendor sending them
  Record yesterday, LOGIN        the day in a few lines, a one-tap link to the dashboard

A staff member is a company login with a WhatsApp number on their profile. Their chat is kept in the workspace
messages with staffId, so the company's WhatsApp page shows it next to the rider and vendor chats.
"""
import json
import logging
import os
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import intake
import whatsapp as W

log = logging.getLogger("whatsapp")

APPROVE = [{"id": "APPROVE", "title": "Approve"}, {"id": "CANCEL", "title": "Cancel"}]
PENDING_SECONDS = 30 * 60
DEFAULT_DAILY_UNITS = 10

OFFICE_HELP = ("Hi {first}, ADA here. Run the day from this chat:\n"
               "TODAY — what needs you\nDISPATCH — send open orders out to riders\n"
               "\"GlowSkin dropped 40 serum\" — stock that came in\nCOUNT IN — stock vendors sent\n"
               "CASH — cash with riders · VERIFY TUNDE — confirm what Tunde paid in\n"
               "OWED — what vendors are owed · PAY GLOWSKIN REF 123 — payout sent\n"
               "DL-1042 or WHERE IS CHIOMA — track a drop · MOVE DL-1042 TO AMAKA\n"
               "TELL ALL RIDERS ... — message riders, a vendor or the team group\n"
               "CALL TUNDE: are you taking the drops? — ADA phones them and brings back the answer\n"
               "MAKE A TEAM GROUP — a WhatsApp group with ADA in it\n"
               "Send a photo of a transfer receipt or an order list and I'll read it.\n"
               "RECORD YESTERDAY — a day in a few lines · LOGIN — open your dashboard\n"
               "Paste a vendor's orders and I'll read them in.\n"
               "Anything that changes stock, money or riders waits for your Approve.")


# ---------- who is who ----------

def clean(s: Any) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9' ]+", " ", str(s or "").lower())).strip()


def find_rider(st, text: str) -> Optional[Dict[str, Any]]:
    t = f" {clean(text)} "
    best, score = None, 0
    for r in st.get("riders", []):
        names = [clean(r.get("short")), clean(r.get("name"))] + [w for w in clean(r.get("name")).split(" ") if len(w) > 2]
        s = max([len(n) for n in names if n and f" {n} " in t] or [0])
        if s > score:
            best, score = r, s
    return best


def find_task(st, text: str) -> Optional[Dict[str, Any]]:
    m = re.search(r"\bdl-?\s?(\d+)\b", text, re.I)
    if m:
        return next((t for t in st.get("tasks", []) if t.get("ref") == f"DL-{m.group(1)}"), None)
    t = f" {clean(text)} "
    today = W.today_iso()
    hits = []
    for x in st.get("tasks", []):
        name = clean(x.get("customer"))
        first = name.split(" ")[0] if name else ""
        if name and (f" {name} " in t or (len(first) > 2 and f" {first} " in t)):
            hits.append(x)
    hits.sort(key=lambda x: (x.get("date") == today, x.get("date") or ""), reverse=True)
    return hits[0] if hits else None


def first_name(name: str) -> str:
    return (name or "").split(" ")[0] or "there"


# ---------- the ledger, as the dashboards count it ----------

def is_active(t) -> bool:
    return t.get("status") in ("assigned", "picked_up")


def free_stock(st) -> Dict[str, int]:
    """Units of each product in the warehouse: received, minus delivered, minus what riders are carrying."""
    out = {p["id"]: int(p.get("received") or 0) for p in st.get("products", [])}
    for t in st.get("tasks", []):
        if t.get("status") == "delivered" or is_active(t):
            for l in t.get("items", []):
                if l.get("productId") in out:
                    out[l["productId"]] -= (l.get("qty") or 0) + (l.get("free") or 0)
    return {k: max(0, v) for k, v in out.items()}


def rider_room(st) -> Dict[str, int]:
    today = W.today_iso()
    room = {}
    for r in st.get("riders", []):
        load = sum(W.units(t) for t in st.get("tasks", []) if t.get("riderId") == r["id"] and t.get("date") == today and t.get("status") != "failed")
        room[r["id"]] = int(r.get("dailyUnits") or DEFAULT_DAILY_UNITS) - load
    return room


def hand_in_to_check(t) -> bool:
    p = t.get("payment") or {}
    return t.get("status") == "delivered" and bool(p.get("handedIn")) and not p.get("handInVerified")


def offers_of(st, rid: str) -> List[Dict[str, Any]]:
    return [t for t in st.get("tasks", []) if t.get("riderId") == rid and t.get("status") == "assigned" and not t.get("acceptedAt") and not t.get("declined")]


# ---------- what needs the office ----------

def today_text(st, day: Optional[str] = None) -> Tuple[str, List[Dict[str, str]]]:
    day = day or W.today_iso()
    tasks = [t for t in st.get("tasks", []) if t.get("date") == day]
    done = [t for t in tasks if t.get("status") == "delivered"]
    road = [t for t in tasks if t.get("status") == "picked_up"]
    waiting = [t for t in tasks if t.get("status") == "assigned"]
    failed = [t for t in tasks if t.get("status") == "failed" and not t.get("handled")]
    open_orders = [o for o in st.get("orders", []) if o.get("status") == "open"]
    fix = [o for o in st.get("orders", []) if o.get("status") == "needs_fix"]
    sent = [i for i in st.get("intake", []) if i.get("status") == "sent"]
    declined = [t for t in st.get("tasks", []) if t.get("status") == "assigned" and t.get("declined")]
    unanswered: Dict[str, int] = {}
    for t in st.get("tasks", []):
        if t.get("status") == "assigned" and not t.get("acceptedAt") and not t.get("declined"):
            unanswered[t.get("riderId")] = unanswered.get(t.get("riderId"), 0) + 1
    held = sum(W.cash_held(t) for t in st.get("tasks", []))
    check = [t for t in st.get("tasks", []) if hand_in_to_check(t)]
    owed = sum(W.vendor_payable(st, t) for t in st.get("tasks", []) if W.is_paid(t) and not t.get("settled"))

    needs = []
    if open_orders:
        needs.append(f"📦 {len(open_orders)} {'order is' if len(open_orders) == 1 else 'orders are'} waiting for a rider. Reply DISPATCH.")
    if fix:
        needs.append(f"✏️ {len(fix)} {'order needs' if len(fix) == 1 else 'orders need'} fixing: " + "; ".join(f"{o['id']} {o.get('customer') or ''}" for o in fix[:3]))
    if declined:
        needs.append(f"🙅 {len(declined)} {'drop was' if len(declined) == 1 else 'drops were'} turned down: " + ", ".join(f"{t.get('ref')}" for t in declined[:4]) + ". Reply MOVE DL-… TO a rider.")
    if unanswered:
        who = ", ".join(f"{(W.person(st, f'rider:{rid}') or {}).get('first', 'a rider')} ({n})" for rid, n in unanswered.items())
        needs.append(f"⏳ Not answered yet: {who}.")
    if sent:
        needs.append(f"🚚 {len(sent)} stock {'delivery' if len(sent) == 1 else 'deliveries'} from vendors to count in. Reply COUNT IN.")
    if failed:
        needs.append(f"⚠️ {len(failed)} not delivered: " + "; ".join(f"{t.get('ref')} {t.get('customer')} ({t.get('failReason') or 'no reason'})" for t in failed[:3]))
    if check:
        needs.append(f"🏦 {len(check)} cash {'payment' if len(check) == 1 else 'payments'} paid in to check ({W.money(sum(W.collected(t) for t in check))}). Reply CASH.")
    head = f"{'Today' if day == W.today_iso() else W.nice_day(day).capitalize()}: {len(done)} delivered ({W.money(sum(W.collected(t) for t in done))} collected), {len(road)} on the road, {len(waiting)} not collected yet."
    tail = []
    if held:
        tail.append(f"Riders are holding {W.money(held)} cash.")
    if owed:
        tail.append(f"Vendors are owed {W.money(owed)}.")
    text = "\n".join([head] + (["", "Needs you:"] + needs if needs else ["Nothing needs you right now. 👍"]) + ([""] + tail if tail else []))
    buttons = []
    if open_orders:
        buttons.append({"id": "DISPATCH", "title": "Dispatch"})
    if sent:
        buttons.append({"id": "COUNT_IN", "title": "Count in"})
    if check or held:
        buttons.append({"id": "CASH", "title": "Cash"})
    return text, buttons[:3] or None


def cash_text(st) -> str:
    by: Dict[str, Dict[str, int]] = {}
    for t in st.get("tasks", []):
        rid = t.get("riderId")
        held, check = W.cash_held(t), W.collected(t) if hand_in_to_check(t) else 0
        if held or check:
            b = by.setdefault(rid, {"held": 0, "check": 0})
            b["held"] += held
            b["check"] += check
    if not by:
        return "No cash is with riders, and nothing paid in is waiting to be checked. 👍"
    lines = ["💵 Cash:"]
    for rid, b in by.items():
        name = (W.person(st, f"rider:{rid}") or {}).get("first") or "A rider"
        bits = []
        if b["check"]:
            bits.append(f"says they paid in {W.money(b['check'])} (check the bank)")
        if b["held"]:
            bits.append(f"holding {W.money(b['held'])}")
        lines.append(f"• {name}: " + ", ".join(bits))
    lines.append("\nReply VERIFY and the rider's name once the money is in the account.")
    return "\n".join(lines)


def owed_text(st) -> str:
    lines = []
    for v in st.get("vendors", []):
        tasks = [t for t in st.get("tasks", []) if t.get("vendorId") == v["id"] and W.is_paid(t) and not t.get("settled")]
        total = sum(W.vendor_payable(st, t) for t in tasks)
        if total:
            lines.append(f"• {v['name']}: {W.money(total)} for {len(tasks)} {'order' if len(tasks) == 1 else 'orders'}")
    if not lines:
        return "No vendor is owed anything right now."
    return "💸 Owed to vendors (after the delivery fee):\n" + "\n".join(lines) + "\n\nReply PAY and the vendor's name (and the transfer ref) once you've paid."


def track_text(st, t) -> str:
    r = W.person(st, f"rider:{t.get('riderId')}") or {}
    v = next((x for x in st.get("vendors", []) if x.get("id") == t.get("vendorId")), {})
    status = {"assigned": "not collected yet" + ("" if t.get("acceptedAt") else ", rider hasn't said yes") + (" (turned down)" if t.get("declined") else ""),
              "picked_up": "on the way" + (f", rider arrived {W.clock(t['arrivedAt'])}" if t.get("arrivedAt") else ""),
              "delivered": "delivered", "failed": f"not delivered: {t.get('failReason') or 'no reason given'}"}.get(t.get("status"), t.get("status"))
    lines = [f"*{t.get('ref')}* · {t.get('customer')}, {t.get('address') or 'no address'}", f"{W.items_text(st, t)} from {v.get('name', 'a vendor')}. Collect {W.money(W.value(t))}.",
             f"Rider: {r.get('name') or 'none'}. Status: {status}."]
    if t.get("status") == "delivered":
        pay = t.get("payment") or {}
        lines.append(f"Delivered {W.clock(W.delivered_at(t))}: " + ("not paid at the door" if pay.get("method") == "unpaid" else f"{W.money(W.collected(t))} {pay.get('method', 'cash')}")
                     + (", photo ✅" if (t.get("proof") or {}).get("photo") else ", no photo yet") + ".")
    steps = [f"{h.get('status').replace('_', ' ')} {W.clock(h.get('at'))}" for h in (t.get("history") or []) if h.get("at") and h.get("at") != "x"]
    if steps:
        lines.append("Timeline: " + " → ".join(steps))
    loc = (next((x for x in st.get("riders", []) if x.get("id") == t.get("riderId")), {}) or {}).get("location")
    if loc and is_active(t):
        lines.append(f"Rider's last location ({W.clock(loc.get('at'))}): https://maps.google.com/?q={loc.get('lat')},{loc.get('lng')}")
    return "\n".join(lines)


# ---------- plans that wait for Approve ----------

def dispatch_plan(st) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Open orders -> deliveries, urgent and earliest first, as far as the stock and the riders' allocation go."""
    free, room, warnings, out = free_stock(st), rider_room(st), [], []
    online = [r for r in st.get("riders", []) if r.get("online")] or list(st.get("riders", []))
    open_orders = sorted([o for o in st.get("orders", []) if o.get("status") == "open"], key=lambda o: (0 if o.get("urgent") else 1, o.get("start") or "99"))
    for o in open_orders:
        short = next((l for l in o.get("items", []) if free.get(l.get("productId"), 0) < (l.get("qty") or 0) + (l.get("free") or 0)), None)
        if short:
            warnings.append(f"{o['id']} ({o.get('customer')}) stays open: only {free.get(short.get('productId'), 0)} {W.product(st, short.get('productId')).get('name', 'units')} in the warehouse.")
            continue
        need = sum((l.get("qty") or 0) + (l.get("free") or 0) for l in o.get("items", []))
        zone = o.get("zone") or intake.zone_of(o.get("address") or "")
        if not online:
            warnings.append("There are no riders to give orders to.")
            break
        rider = max(online, key=lambda r: (100 if r.get("zone") == zone else 0) + min(room[r["id"]], need) * 5 + room[r["id"]] - (200 if room[r["id"]] < need else 0))
        if room[rider["id"]] < need:
            warnings.append(f"{rider.get('short') or rider['name']} goes over today's allocation with {o.get('customer')}.")
        room[rider["id"]] -= need
        for l in o.get("items", []):
            free[l["productId"]] -= (l.get("qty") or 0) + (l.get("free") or 0)
        win = f"Window {W.time12(o['start'])}–{W.time12(o['end'])}" if o.get("start") and o.get("end") else (f"By {W.time12(o['end'])}" if o.get("end") else "")
        out.append({"orderId": o["id"], "riderId": rider["id"], "vendorId": o.get("vendorId"), "customer": o.get("customer"), "phone": o.get("phone") or "", "altPhone": o.get("altPhone") or "",
                    "address": o.get("address") or "", "landmark": o.get("landmark") or "", "zone": zone, "time": o.get("start") or o.get("end") or "", "due": o.get("end") or o.get("start") or "",
                    "urgent": bool(o.get("urgent")), "amount": o.get("amount"), "note": ". ".join(x for x in [win, o.get("note") or ""] if x),
                    "items": [{"productId": l["productId"], "qty": l.get("qty") or 0, "free": l.get("free") or 0} for l in o.get("items", [])]})
    fix = sum(1 for o in st.get("orders", []) if o.get("status") == "needs_fix")
    if fix:
        warnings.append(f"{fix} {'order needs' if fix == 1 else 'orders need'} fixing first, so I left {'it' if fix == 1 else 'them'} out.")
    return out, warnings


def create_deliveries(st, deliveries: List[Dict[str, Any]], by: Dict[str, Any]) -> List[Dict[str, Any]]:
    ref = int(st.get("nextRef") or 1000)
    made = []
    for d in deliveries:
        ref += 1
        t = {"id": W.uid("t"), "ref": f"DL-{ref}", "status": "assigned", "createdBy": "ada", "payment": None, "proof": None, "date": W.today_iso(),
             "history": [{"status": "assigned", "at": W.now_iso(), "via": "whatsapp"}], "by": by, **d}
        t["items"] = [{**l, "price": W.product(st, l["productId"]).get("price") or 0} for l in d["items"]]
        made.append(t)
    st["nextRef"] = ref
    st["tasks"] = made + list(st.get("tasks", []))
    planned = {d.get("orderId") for d in deliveries if d.get("orderId")}
    for o in st.get("orders", []):
        if o.get("id") in planned:
            o["status"] = "planned"
    return made


def propose(memo, kind: str, data: Dict[str, Any], text: str) -> Tuple[str, List[Dict[str, str]]]:
    memo["pending"] = {"kind": kind, "data": data, "at": W.now(), "text": text}
    return text + "\n\nReply YES to go ahead, or NO to leave it.", APPROVE


def plan_dispatch(st, memo) -> Tuple[str, Optional[List]]:
    plan, warnings = dispatch_plan(st)
    if not plan:
        return ("Nothing to dispatch. " + " ".join(warnings or ["There are no open orders waiting for a rider."])).strip(), None
    by_rider: Dict[str, List] = {}
    for d in plan:
        by_rider.setdefault(d["riderId"], []).append(d)
    lines = [f"🛵 Dispatch plan: {len(plan)} {'order' if len(plan) == 1 else 'orders'} to {len(by_rider)} {'rider' if len(by_rider) == 1 else 'riders'}, worth {W.money(sum(W.value({**d, 'items': [{**l, 'price': W.product(st, l['productId']).get('price') or 0} for l in d['items']]}) for d in plan))}."]
    for rid, ds in by_rider.items():
        name = (W.person(st, f"rider:{rid}") or {}).get("first") or rid
        lines.append(f"• {name}: " + ", ".join(f"{d['orderId']} {d['customer']}{' (' + d['zone'] + ')' if d.get('zone') else ''}" for d in ds))
    if warnings:
        lines += [""] + [f"⚠️ {w}" for w in warnings]
    lines.append("\nEach rider gets their run sheet on WhatsApp with Accept / Can't take it.")
    return propose(memo, "dispatch", {"orders": [d["orderId"] for d in plan]}, "\n".join(lines))


def receive_text(text: str) -> bool:
    return bool(re.search(r"\b(dropped|brought|received|came in|arrived|delivered to us|drop(ped)? off|supplied|gave us|just got|we got)\b", text, re.I)) and bool(re.search(r"\d", text))


def plan_receive(st, memo, text: str) -> Optional[Tuple[str, Optional[List]]]:
    v = intake.find_vendor(st, text)
    if not v:
        return None
    lines, unknown = intake.read_stock(st, text, v["id"])
    if not lines:
        return (f"I couldn't tell which of {v['name']}'s products came in. Try \"{v['name']} dropped 40 {next((p['name'] for p in st.get('products', []) if p.get('vendorId') == v['id']), 'units')}\".", None)
    got = ", ".join(f"{l['qty']} × {W.product(st, l['productId']).get('name')}" for l in lines)
    extra = f"\n⚠️ {', '.join(unknown)} isn't one of {v['name']}'s products yet; add it in the app first." if unknown else ""
    return propose(memo, "receive", {"vendorId": v["id"], "lines": lines}, f"📦 Add to stock from {v['name']}: {got}.{extra}")


def plan_count(st, memo) -> Tuple[str, Optional[List]]:
    sent = [i for i in st.get("intake", []) if i.get("status") == "sent"]
    if not sent:
        return "No stock from vendors is waiting to be counted in.", None
    lines = [f"• {i.get('qty')} × {W.product(st, i.get('productId')).get('name', 'item')} from {next((v['name'] for v in st.get('vendors', []) if v.get('id') == i.get('vendorId')), 'a vendor')}" for i in sent]
    return propose(memo, "count", {"ids": [i["id"] for i in sent]}, "🚚 Count in what vendors sent, as sent:\n" + "\n".join(lines) + "\n\nIf a number is different, count that one in the app.")


def receipt_line(receipt: Optional[Dict[str, Any]], total: int) -> str:
    if not receipt:
        return ""
    amount = receipt.get("amount") or 0
    ref = f", ref {receipt['ref']}" if receipt.get("ref") else ""
    if not amount:
        return f"\n🧾 Receipt{ref} (I couldn't read the amount)."
    if amount == total:
        return f"\n🧾 The receipt shows {W.money(amount)}{ref}: it matches."
    return f"\n🧾 The receipt shows {W.money(amount)}{ref}: {W.money(abs(total - amount))} {'short' if amount < total else 'over'}. Check before you approve."


def rider_cash(st, rid: str) -> Tuple[List[Dict[str, Any]], str]:
    tasks = [t for t in st.get("tasks", []) if t.get("riderId") == rid and hand_in_to_check(t)]
    if tasks:
        return tasks, "paid in"
    return [t for t in st.get("tasks", []) if t.get("riderId") == rid and W.cash_held(t)], "handed over"


def plan_verify(st, memo, text: str) -> Tuple[str, Optional[List]]:
    r = find_rider(st, text)
    if not r:
        return "Which rider? Reply VERIFY and their name, e.g. VERIFY TUNDE.", None
    receipt = memo.pop("receipt", None)
    if receipt and W.now() - (receipt.get("at") or 0) > PENDING_SECONDS:
        receipt = None
    tasks, how = rider_cash(st, r["id"])
    if not tasks:
        return f"{r.get('short') or r['name']} has no cash waiting to be checked.", None
    total = sum(W.collected(t) for t in tasks)
    return propose(memo, "verify", {"ids": [t["id"] for t in tasks], "riderId": r["id"], **({"receipt": receipt} if receipt else {})},
                   f"🏦 Confirm {W.money(total)} {how} by {r.get('short') or r['name']} for {len(tasks)} {'drop' if len(tasks) == 1 else 'drops'} is in the company account?"
                   + receipt_line(receipt, total))


def plan_receipt(st, memo, read: Dict[str, Any], photo: Optional[str], text: str) -> Tuple[str, Optional[List]]:
    """A transfer receipt sent to ADA: whose cash it is (named in the caption, or the one rider whose cash matches), then verify."""
    memo["receipt"] = {"amount": read.get("amount") or 0, "ref": read.get("ref") or "", "bank": read.get("bank") or "", "photo": photo, "at": W.now()}
    r = find_rider(st, text) if text else None
    if not r and read.get("amount"):
        hits = [x for x in st.get("riders", []) if rider_cash(st, x["id"])[0] and sum(W.collected(t) for t in rider_cash(st, x["id"])[0]) == read["amount"]]
        r = hits[0] if len(hits) == 1 else None
    if r:
        return plan_verify(st, memo, r.get("short") or r["name"])
    what = f"{W.money(read['amount'])}" if read.get("amount") else "an amount I couldn't read"
    return f"🧾 That's a receipt for {what}{' from ' + read['bank'] if read.get('bank') else ''}{', ref ' + read['ref'] if read.get('ref') else ''}. Whose cash is it? Reply VERIFY and the rider's name.", None


def plan_payout(st, memo, text: str) -> Optional[Tuple[str, Optional[List]]]:
    v = intake.find_vendor(st, text)
    if not v:
        return None
    tasks = [t for t in st.get("tasks", []) if t.get("vendorId") == v["id"] and W.is_paid(t) and not t.get("settled")]
    if not tasks:
        return f"{v['name']} isn't owed anything right now.", None
    m = re.search(r"\b(?:ref(?:erence)?|trf|transaction)\s*[:#-]?\s*([a-z0-9-]{3,})", text, re.I)
    ref = m.group(1).upper() if m else ""
    total = sum(W.vendor_payable(st, t) for t in tasks)
    return propose(memo, "payout", {"vendorId": v["id"], "ids": [t["id"] for t in tasks], "ref": ref},
                   f"💸 Mark {W.money(total)} paid to {v['name']} for {len(tasks)} {'order' if len(tasks) == 1 else 'orders'}{' (ref ' + ref + ')' if ref else ''}? I'll tell {v['name']} on WhatsApp.")


def plan_move(st, memo, text: str) -> Tuple[str, Optional[List]]:
    t = find_task(st, text.split(" to ")[0] if " to " in text.lower() else text)
    target = re.split(r"\bto\b", text, maxsplit=1, flags=re.I)
    r = find_rider(st, target[1]) if len(target) > 1 else None
    if not t:
        return "Which drop? e.g. MOVE DL-1042 TO AMAKA.", None
    if not r:
        return f"Which rider should take {t.get('ref')}? e.g. MOVE {t.get('ref')} TO AMAKA.", None
    if t.get("status") != "assigned":
        return f"{t.get('ref')} is already {'on the road' if t.get('status') == 'picked_up' else t.get('status')}, so it can't move now.", None
    if t.get("riderId") == r["id"] and not t.get("declined"):
        return f"{t.get('ref')} is already with {r.get('short') or r['name']}.", None
    return propose(memo, "move", {"id": t["id"], "riderId": r["id"]}, f"🔁 Give {t.get('ref')} ({t.get('customer')}) to {r.get('short') or r['name']}? They'll get it on WhatsApp to accept.")


TELL = re.compile(r"^\s*(?:please\s+)?(?:tell|message|msg|text|inform|remind|broadcast to|send to|let)\s+(.+?)(?:\s+(?:that|to|know that|know)\b|:|,)\s*(.+)$", re.I | re.S)


def plan_tell(st, memo, text: str) -> Optional[Tuple[str, Optional[List]]]:
    m = TELL.match(text)
    if not m:
        return None
    who, body = m.group(1), m.group(2).strip()
    if re.search(r"\b(all|every|everybody|everyone)\b.*\briders?\b|^riders?$|^(everyone|everybody|all)$", who, re.I):
        targets = [("rider", r["id"]) for r in st.get("riders", []) if r.get("online")] or [("rider", r["id"]) for r in st.get("riders", [])]
        label = f"all {len(targets)} riders on duty"
    elif re.search(r"\b(the )?(team )?group\b", who, re.I) and [g for g in W.groups(st) if g.get("status") == "ready"]:
        g = next(g for g in W.groups(st) if g.get("status") == "ready")
        targets, label = [("group", g["id"])], f"the {g.get('name') or 'team'} group"
    elif re.search(r"\b(all|every)\b.*\bvendors?\b", who, re.I):
        targets = [("vendor", v["id"]) for v in st.get("vendors", [])]
        label = f"all {len(targets)} vendors"
    else:
        r, v = find_rider(st, who), intake.find_vendor(st, who)
        if r:
            targets, label = [("rider", r["id"])], r.get("short") or r["name"]
        elif v:
            targets, label = [("vendor", v["id"])], v["name"]
        else:
            return f"I couldn't find \"{who}\" among your riders or vendors.", None
    if not targets or not body:
        return None
    body = body[0].upper() + body[1:]
    return propose(memo, "tell", {"targets": targets, "text": body}, f"✉️ Send to {label}:\n\"{body}\"")


CALL = re.compile(r"^\s*(?:please\s+)?(?:call|ring|phone|give)\s+(.+?)(?:\s+a (?:call|ring))?\s*(?:(?::|,|\band (?:say|ask|tell (?:him|her|them))|\bto (?:say|ask|tell (?:him|her|them)))\s*(.+))?$", re.I | re.S)


def call_target(st, who: str) -> Optional[Tuple[str, str, Optional[Dict[str, Any]]]]:
    r = find_rider(st, who)
    if r:
        return f"rider:{r['id']}", r.get("short") or r["name"], None
    v = intake.find_vendor(st, who)
    if v:
        return f"vendor:{v['id']}", v.get("contact") or v["name"], None
    t = find_task(st, who)
    if t and intake.phone_digits(t.get("phone")):
        return f"customer:{intake.phone_digits(t['phone'])}", t.get("customer") or "the customer", t
    return None


def call_script(st, key: str, body: str, t: Optional[Dict[str, Any]]) -> str:
    import customers

    role, _, ref = key.partition(":")
    company = (st.get("company") or {}).get("name") or "the delivery company"
    first = (W.person(st, key) or {}).get("first") or ""
    hello = f"Hello {first}, this is ADA from {company}."
    if body:
        return f"{hello} The office asked me to call you: {body.rstrip('?.!')}?" if body.rstrip().endswith("?") else f"{hello} The office says: {body.rstrip('.')}. What would you like to say back?"
    if role == "rider":
        offers = offers_of(st, ref)
        if offers:
            return f"{hello} You have {len(offers)} new {'drop' if len(offers) == 1 else 'drops'} waiting. Say yes to take them, or no if you can't."
        road = [x for x in st.get("tasks", []) if x.get("riderId") == ref and x.get("status") == "picked_up"]
        if road:
            return f"{hello} How is it going with {road[0].get('customer')}? Say delivered with the amount, or tell me the problem."
        return f"{hello} The office asked me to check in. How is your day going?"
    if role == "customer" and t:
        return f"{hello} I'm calling about your order from {customers.vendor_name(st, t)}. {customers.where_text(st, t)} If you'd like it another day, say the day."
    return f"{hello} The office asked me to call you. What would you like to tell them?"


def plan_call(st, memo, text: str) -> Optional[Tuple[str, Optional[List]]]:
    m = CALL.match(text or "")
    if not m:
        return None
    found = call_target(st, m.group(1))
    if not found:
        return f"I couldn't find \"{m.group(1).strip()}\" among your riders, vendors or today's customers.", None
    key, name, t = found
    if not (W.person(st, key) or {}).get("phone"):
        return f"{name} has no phone number on their profile, so I can't call them.", None
    say = call_script(st, key, (m.group(2) or "").strip(), t)
    return propose(memo, "call", {"key": key, "say": say, "why": (m.group(2) or "").strip()}, f"📞 Call {name} now? I'll say:\n\"{say}\"\nTheir answer comes back here.")


def plan_group(st, memo, text: str) -> Tuple[str, Optional[List]]:
    ready = [g for g in W.groups(st) if g.get("status") == "ready"]
    making = [g for g in W.groups(st) if g.get("status") == "creating"]
    if ready and not re.search(r"\b(new|another|second)\b", text or "", re.I):
        return "👥 " + "\n".join(f"{g.get('name')}: {g.get('invite') or 'no invite link yet'}" for g in ready) + "\nShare the link with your riders and staff. In the group, start a message with ADA and I'll answer.", None
    if making:
        return f"👥 \"{making[0].get('name')}\" is still being made. I'll send the link when it's ready.", None
    name = f"{(st.get('company') or {}).get('name') or 'Delivery'} team"
    return propose(memo, "group", {"name": name}, f"👥 Make a WhatsApp group \"{name}\" with ADA in it? You'll get an invite link to share (WhatsApp allows up to 8 people in a business group). "
                   "In the group, anyone can start a message with ADA, e.g. \"ADA, who has DL-1042?\", and I'll answer there.")


def apply_pending(st, wid: int, memo, staff: Dict[str, Any]) -> Tuple[str, Optional[List]]:
    p = memo.pop("pending", None)
    if not p or W.now() - (p.get("at") or 0) > PENDING_SECONDS:
        return "There's nothing waiting for your yes. Reply TODAY to see what needs you.", None
    kind, d = p["kind"], p["data"]
    by = {"id": staff.get("id"), "name": staff.get("name"), "role": "company", "via": "whatsapp"}

    if kind == "dispatch":
        plan, _ = dispatch_plan(st)
        plan = [x for x in plan if x["orderId"] in set(d["orders"])]
        if not plan:
            return "Those orders aren't open any more (or the stock ran out), so nothing went out.", None
        made = create_deliveries(st, plan, by)
        riders = len({t["riderId"] for t in made})
        missed = len(d["orders"]) - len(plan)
        return (f"✅ Done. {len(made)} {'delivery' if len(made) == 1 else 'deliveries'} created and sent to {riders} {'rider' if riders == 1 else 'riders'} on WhatsApp."
                + (f" {missed} couldn't go (things changed since the plan)." if missed else "") + " I'll tell you if anyone doesn't answer."), None

    if kind == "receive":
        got = []
        for l in d["lines"]:
            prod = next((x for x in st.get("products", []) if x.get("id") == l["productId"]), None)
            if not prod:
                continue
            prod["received"] = int(prod.get("received") or 0) + int(l["qty"])
            st.setdefault("intake", []).insert(0, {"id": W.uid("in"), "vendorId": prod.get("vendorId"), "productId": prod["id"], "qty": int(l["qty"]), "price": prod.get("price") or 0,
                                                   "at": W.now_iso(), "note": "Received on WhatsApp", "status": "received", "by": by})
            got.append(f"{l['qty']} × {prod['name']}")
        has_open = any(o.get("status") == "open" for o in st.get("orders", []))
        return f"✅ In stock: {', '.join(got)}." + (" Reply DISPATCH to send open orders out." if has_open else ""), ([{"id": "DISPATCH", "title": "Dispatch"}] if has_open else None)

    if kind == "count":
        n = 0
        for i in st.get("intake", []):
            if i.get("id") in d["ids"] and i.get("status") == "sent":
                prod = next((x for x in st.get("products", []) if x.get("id") == i.get("productId")), None)
                if prod:
                    prod["received"] = int(prod.get("received") or 0) + int(i.get("qty") or 0)
                i.update({"status": "received", "sentQty": i.get("qty"), "countedAt": W.now_iso(), "countedBy": staff.get("name") or "", "countedVia": "whatsapp"})
                n += 1
        return f"✅ Counted in {n} stock {'delivery' if n == 1 else 'deliveries'}. The vendors have been told.", None

    if kind == "verify":
        n, total = 0, 0
        for t in st.get("tasks", []):
            if t.get("id") in d["ids"] and t.get("payment") and not t["payment"].get("handInVerified"):
                handed = t["payment"].get("handedIn") or {"at": W.now_iso(), "ref": ""}
                if d.get("receipt"):
                    handed = {**handed, "receipt": handed.get("receipt") or d["receipt"].get("photo"), "ref": handed.get("ref") or d["receipt"].get("ref") or ""}
                t["payment"] = {**t["payment"], "handedIn": handed, "handInVerified": W.now_iso()}
                n, total = n + 1, total + W.collected(t)
        name = (W.person(st, f"rider:{d['riderId']}") or {}).get("first") or "The rider"
        return f"✅ {W.money(total)} from {name} confirmed. {name} has been told.", None

    if kind == "payout":
        n = 0
        for t in st.get("tasks", []):
            if t.get("id") in d["ids"] and not t.get("settled"):
                t["settled"] = {"at": W.now_iso(), "ref": d.get("ref") or "", "by": by}
                n += 1
        v = next((x for x in st.get("vendors", []) if x.get("id") == d["vendorId"]), {})
        return f"✅ Payout for {n} {'order' if n == 1 else 'orders'} marked sent. {v.get('name', 'The vendor')} has been told.", None

    if kind == "move":
        t = next((x for x in st.get("tasks", []) if x.get("id") == d["id"]), None)
        if not t or t.get("status") != "assigned":
            return "That drop has moved on since, so I left it.", None
        old = t.get("riderId")
        t.update({"riderId": d["riderId"], "acceptedAt": None, "declined": None})
        if old and old != d["riderId"]:
            st.setdefault("messages", []).append(W.office_message(f"rider:{old}", f"{t.get('ref')} ({t.get('customer')}) has gone to another rider. You don't need to take it.", kind="update"))
        name = (W.person(st, f"rider:{d['riderId']}") or {}).get("first") or "the rider"
        return f"✅ {t.get('ref')} is with {name} now. They've got it on WhatsApp to accept.", None

    if kind == "tell":
        for role, ref in d["targets"]:
            m = {"id": W.uid("m"), "at": W.now_iso(), "read": False, "from": "dispatcher", "text": d["text"], "by": by}
            m[{"rider": "riderId", "group": "groupId"}.get(role, "vendorId")] = ref
            st.setdefault("messages", []).append(m)
        return f"✅ Sent to {len(d['targets'])} on WhatsApp. Their answers come to the WhatsApp page, and I'll handle the usual ones.", None

    if kind == "call":
        import calls

        call = calls.queue(st, d["key"], d["say"], by, d.get("why", ""))
        name = (W.person(st, d["key"]) or {}).get("first") or "them"
        return f"📞 Calling {name} now. I'll put what they say here." + ("" if call.get("live") else " (Test line: the call is shown in their chat, and you can answer it in the simulator.)"), None

    if kind == "group":
        g = {"key": W.uid("grp"), "id": "", "name": d["name"], "status": "creating", "at": W.now_iso(), "by": by}
        w = st.setdefault("company", {}).setdefault("whatsapp", {})
        w["groups"] = (w.get("groups") or []) + [g]
        return f"👥 Making the group \"{d['name']}\". I'll send the invite link here in a moment.", None

    return "That plan has expired. Ask me again.", None


# ---------- reading what staff write ----------

YES = re.compile(r"^(1|y|yes|yeah|yep|ok|okay|approve|approved|go|go ahead|do it|send|send it|confirm|confirmed|oya|sure|no wahala|carry go)$")
NO = re.compile(r"^(2|n|no|nope|cancel|stop|leave it|don'?t|abort|not now)$")


def office_intent(text: str, button: str = "") -> str:
    if button:
        return {"APPROVE": "approve", "CANCEL": "cancel", "DISPATCH": "dispatch", "COUNT_IN": "count", "CASH": "cash", "TODAY": "today", "OWED": "owed", "RECORD": "record"}.get(button, "unknown")
    t = re.sub(r"\s+", " ", (text or "").lower()).strip()
    w = re.sub(r"[^\w\s']", " ", t).strip()
    w = re.sub(r"\s+", " ", w)
    if YES.fullmatch(w):
        return "approve"
    if NO.fullmatch(w):
        return "cancel"
    if re.fullmatch(r"(help|menu|hi|hello|hey|start|options|good (morning|afternoon|evening))", w):
        return "help"
    tell = TELL.match(text or "")
    if tell and tell.group(1).strip().lower() not in ("me", "us"):
        return "tell"
    if re.match(r"^(please )?(call|ring|phone)\b|^give \w+ a (call|ring)\b", t):
        return "call"
    if re.search(r"\b(team group|whatsapp group|group link|group invite|invite link|(make|create|start|set up|open) (a |the |our )?(team )?group)\b", t):
        return "group"
    if re.search(r"\b(move|reassign|give|switch|transfer)\b.*\bto\b", t) and (re.search(r"\bdl-?\s?\d+", t) or " to " in t):
        return "move"
    if re.search(r"\b(verify|confirm(ed)?|check(ed)?|received)\b.*\b(cash|money|payment|paid|transfer)\b|^verify\b", t):
        return "verify"
    if re.search(r"^(pay|paid|settle|settled|pay ?out)\b|\b(i|we) (have |just )?(paid|settled)\b|\bpay ?out to\b", t) and not re.search(r"\b(owe|owed)\b", t):
        return "payout"
    if re.search(r"\b(owe|owed|owing|payouts?|vendor balances?)\b", t):
        return "owed"
    if re.search(r"\b(count(ed)? in|count stock|stock sent|stock to count|count)\b", t):
        return "count"
    if receive_text(t):
        return "receive"
    if re.search(r"\b(dispatch|send (them |the |today'?s |all )?(orders? )?out|assign|allocate|plan (the )?day|send out)\b", t):
        return "dispatch"
    if re.search(r"\b(cash|remit|money with|holding)\b", t):
        return "cash"
    if re.search(r"\bdl-?\s?\d+\b|\b(where is|where'?s|track|status of|any update on)\b", t):
        return "track"
    if W.RECORD_WORDS.search(t) and not re.search(r"\btoday\b", t):
        return "record"
    if re.search(r"\b(today|status|how far|how'?s|how is|summary|needs? (me|you)|update|report|brief|what'?s (up|happening|left|pending)|pending)\b", t):
        return "today"
    if intake.looks_like_orders(text) and intake.PHONE.search(text or ""):
        return "orders"
    return "unknown"


def office_turn(st, wid: int, staff: Dict[str, Any], intent: str, text: str, memo: Dict[str, Any], photo: Optional[str] = None,
                read: Optional[Dict[str, Any]] = None, chat: str = "") -> Optional[Tuple[str, Optional[List]]]:
    first = first_name(staff.get("name") or "")
    # Orders read from a photo, waiting to hear whose they are.
    held = memo.pop("ordersText", None)
    if held and W.now() - (held.get("at") or 0) < PENDING_SECONDS and intent not in ("orders", "approve", "cancel") and intake.find_vendor(st, text):
        intent, text = "orders", text.strip() + "\n" + held["text"]
    if intent == "receipt":
        return plan_receipt(st, memo, read or {}, photo, text)
    if intent == "call":
        memo.pop("pending", None)
        return plan_call(st, memo, text) or ("Who should I call? e.g. CALL TUNDE: are you taking the 3 drops?", None)
    if intent == "group":
        return plan_group(st, memo, text)
    if intent == "approve":
        return apply_pending(st, wid, memo, staff)
    if intent == "cancel":
        had = memo.pop("pending", None)
        return ("OK, I've left it. Nothing changed." if had else "Nothing is waiting for your yes."), None
    # A new request replaces a plan that wasn't answered.
    if intent not in ("help", "today", "track", "cash", "owed", "record"):
        memo.pop("pending", None)
    if intent == "help":
        return OFFICE_HELP.format(first=first), [{"id": "TODAY", "title": "Today"}, {"id": "DISPATCH", "title": "Dispatch"}, {"id": "CASH", "title": "Cash"}]
    if intent == "today":
        return today_text(st)
    if intent == "record":
        day = W.parse_day(st, text) or W.today_iso()
        return today_text(st, day)[0] + f"\nSee it with photos: {W.link_user(wid, staff.get('id'), f'/company?day={day}')}", None
    if intent == "dispatch":
        return plan_dispatch(st, memo)
    if intent == "receive":
        return plan_receive(st, memo, text) or ("Which vendor brought it? e.g. \"GlowSkin dropped 40 serum\".", None)
    if intent == "count":
        return plan_count(st, memo)
    if intent == "cash":
        return cash_text(st), None
    if intent == "verify":
        return plan_verify(st, memo, text)
    if intent == "owed":
        return owed_text(st), None
    if intent == "payout":
        return plan_payout(st, memo, text) or ("Which vendor did you pay? e.g. PAY GLOWSKIN REF TRF123.", None)
    if intent == "track":
        t = find_task(st, text)
        return (track_text(st, t) if t else "I can't find that drop. Send its DL number or the customer's name."), None
    if intent == "move":
        return plan_move(st, memo, text)
    if intent == "tell":
        return plan_tell(st, memo, text) or ("Who should I tell, and what? e.g. TELL ALL RIDERS: return unsold items by 6pm.", None)
    if intent == "orders":
        v = intake.find_vendor(st, text.split("\n")[0]) or intake.find_vendor(st, text)
        if not v:
            memo["ordersText"] = {"text": text, "at": W.now()}
            return "Whose orders are these? Reply with the vendor's name, e.g. \"GlowSkin\".", None
        found = intake.read_orders(st, text, v["id"], today=datetime.now(W.TZ).date())
        if not found:
            return None
        top = max([3300] + [int(re.sub(r"\D", "", str(o.get("id"))) or 0) for o in st.get("orders", [])])
        lines, fixes = [], []
        for raw in found:
            o = intake.to_order(st, raw)
            top += 1
            o.update({"id": f"ORD-{top}", "createdAt": W.now_iso(), "placedBy": "company", "via": "whatsapp", "by": {"id": staff.get("id"), "name": staff.get("name"), "role": "company"}})
            st.setdefault("orders", []).insert(0, o)
            what = ", ".join(W.line_label(st, l) for l in o["items"]) or "no item"
            (lines if o["status"] == "open" else fixes).append(f"{'✅' if o['status'] == 'open' else '⚠️'} {o['id']} {o.get('customer') or 'no name'}: " + (what if o["status"] == "open" else " ".join(o.get("issues") or [])))
        return f"Read {len(found)} {'order' if len(found) == 1 else 'orders'} for {v['name']}:\n" + "\n".join(lines + fixes) + ("\n\nReply DISPATCH to send them out." if lines else ""), ([{"id": "DISPATCH", "title": "Dispatch"}] if lines else None)
    return None

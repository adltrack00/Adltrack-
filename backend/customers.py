"""The customer at the door, on WhatsApp. Off until the company turns on "Message customers" in WhatsApp settings,
because these are the vendors' customers, not the company's own people.

  ADA tells them   on the way (with the rider's first name) · the rider is at your door · delivered, please confirm
                   · we couldn't deliver, when suits you?
  They can reply   YES / received          -> the drop is marked confirmed by the customer
                   PROBLEM / not received  -> an incident in the office log; the office and the vendor hear at once
                   tomorrow / Friday / after 5pm / not at home -> a drop not yet collected moves to that day; a rider
                                              already on the way is told the customer's message
                   where / when            -> where the order is now

A customer is known by the phone number on their order. Their chat is kept with customerId (the number's digits)
and taskId, so it shows on the company's WhatsApp page and nowhere else.
"""
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import intake
import whatsapp as W

CONFIRM_BUTTONS = [{"id": "C_OK", "title": "Yes, I got it"}, {"id": "C_PROBLEM", "title": "There's a problem"}]
WHERE_BUTTONS = [{"id": "C_WHERE", "title": "Where is it?"}, {"id": "C_LATER", "title": "Come later"}]


def enabled(state) -> bool:
    return bool((((state.get("company") or {}).get("whatsapp") or {}).get("notify") or {}).get("customers", False))


def digits_of(t) -> str:
    return intake.phone_digits(t.get("phone"))


def tasks_for(state, digits: str) -> List[Dict[str, Any]]:
    return [t for t in state.get("tasks", []) if digits and digits_of(t) == digits]


def current_task(state, digits: str) -> Optional[Dict[str, Any]]:
    """The order a customer is most likely writing about: one still on its way, else the latest."""
    mine = tasks_for(state, digits)
    if not mine:
        return None
    active = [t for t in mine if t.get("status") in ("assigned", "picked_up")]
    pool = active or mine
    return sorted(pool, key=lambda t: (t.get("date") or "", W.delivered_at(t) or "", t.get("ref") or ""))[-1 if not active else 0]


def person(state, digits: str) -> Optional[Dict[str, Any]]:
    mine = tasks_for(state, digits)
    if not mine:
        return None
    name = mine[0].get("customer") or ""
    return {"role": "customer", "ref": digits, "name": name, "first": name.split(" ")[0], "phone": digits}


def vendor_name(state, t) -> str:
    return next((v.get("name") for v in state.get("vendors", []) if v.get("id") == t.get("vendorId")), "") or "your seller"


def company_name(state) -> str:
    return (state.get("company") or {}).get("name") or "the delivery team"


def message(t, text: str, buttons=None, kind: str = "customer") -> Dict[str, Any]:
    return W.office_message(f"customer:{digits_of(t)}", text, kind=kind, buttons=buttons, taskId=t.get("id"))


# ---------- what ADA tells them, from each save ----------

def updates(before, after) -> List[Dict[str, Any]]:
    if not enabled(after):
        return []
    out = []
    old = {t.get("id"): t for t in before.get("tasks", [])}
    for t in after.get("tasks", []):
        o = old.get(t.get("id"))
        if not o or not digits_of(t):
            continue
        first = (t.get("customer") or "").split(" ")[0] or "there"
        rider = (W.person(after, f"rider:{t.get('riderId')}") or {}).get("first") or "our rider"
        what = f"your order from {vendor_name(after, t)} ({W.items_text(after, t)})"
        pay = W.money(W.value(t))
        if o.get("status") != "picked_up" and t.get("status") == "picked_up":
            out.append(message(t, f"Hi {first}, this is ADA from {company_name(after)}. {rider} is on the way with {what}. Please have {pay} ready (cash or transfer). Reply here if you won't be home.", WHERE_BUTTONS))
        if not o.get("arrivedAt") and t.get("arrivedAt") and t.get("status") == "picked_up":
            out.append(message(t, f"📍 {rider} is at your address now with {what}."))
        if o.get("status") != "delivered" and t.get("status") == "delivered":
            out.append(message(t, f"✅ Delivered: {what}. Did you get everything in good condition?", CONFIRM_BUTTONS))
        if o.get("status") != "failed" and t.get("status") == "failed":
            out.append(message(t, f"Sorry {first}, we couldn't deliver {what} today. When suits you? Reply with a day or time (e.g. \"tomorrow after 2pm\").", [{"id": "C_TOMORROW", "title": "Tomorrow"}]))
    return out


# ---------- reading what they write ----------

def intent(text: str, button: str = "") -> str:
    if button:
        return {"C_OK": "confirm", "C_PROBLEM": "problem", "C_WHERE": "where", "C_LATER": "later", "C_TOMORROW": "reschedule"}.get(button, "unknown")
    t = re.sub(r"\s+", " ", (text or "").lower()).strip()
    w = re.sub(r"\s+", " ", re.sub(r"[^\w\s']", " ", t)).strip()
    if re.search(r"\b(not (yet )?(received|delivered|get|gotten)|didn'?t (get|receive)|haven'?t (got|received)|wrong|damaged|broken|missing|spoilt|spoiled|complain|complaint|problem|issue|refund|fake|not complete|incomplete|short)\b", t):
        return "problem"
    if re.fullmatch(r"((yes|yeah|yep|ok|okay) )?(1|y|yes|yeah|yep|ok|okay|received|got it|i got it|i have received( it)?|thanks?|thank you|thank you so much|all good|perfect|confirmed?|e don reach me)( thanks?| thank you)?", w):
        return "confirm"
    if re.search(r"\b(tomorrow|next week|(mon|tues|wednes|thurs|fri|satur|sun)day|reschedule|not (at )?home|not around|come (back )?(later|tomorrow|at|by|after)|later today|after \d|by \d|before \d|\d{1,2} ?(am|pm))\b", t):
        return "reschedule"
    if re.search(r"\b(where|when|how long|eta|status|arriving|coming|how far|track)\b", t):
        return "where"
    if re.fullmatch(r"(2|no)", w):
        return "problem"
    if re.fullmatch(r"(hi|hello|hey|good (morning|afternoon|evening)|help|menu)", w):
        return "help"
    return "unknown"


def where_text(state, t) -> str:
    rider = (W.person(state, f"rider:{t.get('riderId')}") or {}).get("first") or "our rider"
    s = t.get("status")
    if s == "delivered":
        return f"Your order {t.get('ref')} was delivered at {W.clock(W.delivered_at(t))}."
    if s == "failed":
        return "We couldn't deliver it last time. Reply with a day or time that suits you and we'll bring it."
    if s == "picked_up":
        return f"{rider} has your order and is on the way" + (" and is at your address now." if t.get("arrivedAt") else ".") + " You can also call the number that sent it."
    when = f" for {W.nice_day(t['date'])}" if t.get("date") and t["date"] != W.today_iso() else " today"
    return f"Your order is booked{when}" + (f", aiming for {W.time12(t['time'])}" if t.get("time") else "") + ". I'll message you when the rider sets off."


def staff_alert(wid: int, state, text: str) -> List[Dict[str, Any]]:
    return [W.office_message(f"staff:{s['id']}", text, kind="nudge") for s in W.staff_of(wid)]


def turn(st, wid: int, digits: str, it: str, text: str, photo: Optional[str] = None) -> Optional[Tuple[str, Optional[List]]]:
    t = current_task(st, digits)
    if not t:
        return None
    first = (t.get("customer") or "").split(" ")[0] or "there"
    if it == "help":
        return f"Hi {first}, this is ADA from {company_name(st)}, delivering your order from {vendor_name(st, t)}. Reply WHERE to see where it is, a day or time if you want it later, or PROBLEM if something's wrong.", WHERE_BUTTONS
    if it == "where":
        return where_text(st, t), None
    if it == "confirm":
        if t.get("status") != "delivered":
            return where_text(st, t), None
        t["proof"] = {**(t.get("proof") or {}), "customerConfirmed": W.now_iso()}
        return f"Thank you, {first}! Enjoy it. 🙏", None
    if it == "problem":
        note = text.strip() if text and not re.fullmatch(r"\W*(2|no|problem)\W*", text, re.I) else ""
        if note in ("📷 Photo",) and photo:
            note = "Sent a photo"
        if not note:
            t["customerIssue"] = {"at": W.now_iso(), "text": ""}
            W.contacts(st).setdefault(f"customer:{digits}", {})["awaiting"] = {"what": "problem", "taskId": t["id"]}
            return "I'm sorry. What went wrong? Tell me in a few words (or send a photo) and I'll get the team on it now.", None
        return report(st, wid, t, note, photo)
    if it in ("reschedule", "later"):
        if it == "later" or not text:
            W.contacts(st).setdefault(f"customer:{digits}", {})["awaiting"] = {"what": "when", "taskId": t["id"]}
            return "No problem. When suits you? e.g. \"tomorrow after 2pm\" or \"Friday\".", None
        return reschedule(st, t, text)
    return None


def report(st, wid: int, t, note: str, photo: Optional[str] = None) -> Tuple[str, Optional[List]]:
    t["customerIssue"] = {"at": W.now_iso(), "text": note, **({"photo": photo} if photo else {})}
    st.setdefault("log", []).insert(0, {"id": W.uid("log"), "at": W.now_iso(), "kind": "incident", "status": "open", "taskId": t["id"],
                                        "title": f"Customer problem: {t.get('customer')} ({t.get('ref')})", "text": note, "by": {"name": t.get("customer"), "role": "customer", "via": "whatsapp"}, **({"photo": photo} if photo else {})})
    st.setdefault("messages", []).extend(staff_alert(wid, st, f"🚨 {t.get('customer')} reports a problem with {t.get('ref')}: \"{note}\". Logged as an incident."))
    if t.get("vendorId"):
        st["messages"].append(W.office_message(f"vendor:{t['vendorId']}", f"⚠️ {t.get('customer')} ({t.get('ref')}) says: \"{note}\". The office is on it.", kind="update", taskId=t["id"]))
    return "Thank you for telling us. The team has it now and will get back to you today.", None


def reschedule(st, t, text: str) -> Tuple[str, Optional[List]]:
    today = datetime.now(W.TZ).date()
    when = intake.parse_when(text, today)
    day = when.get("date") if (when.get("date") or "") >= today.isoformat() else None
    start = when.get("start") or ""
    rider = t.get("riderId")
    if t.get("status") == "assigned" and (day or start):
        old_day = t.get("date")
        if day:
            t["date"] = day
        if start:
            t["time"] = start
        t["rescheduled"] = {"at": W.now_iso(), "from": old_day, "to": t.get("date"), "time": start, "by": "customer", "text": text}
        if rider:
            st.setdefault("messages", []).append(W.office_message(f"rider:{rider}", f"🔁 {t.get('customer')} moved {t.get('ref')} to {W.nice_day(t['date'])}{' after ' + W.time12(start) if start else ''}.", kind="update", taskId=t["id"]))
        return f"Done. We'll bring it {W.nice_day(t['date'])}{' after ' + W.time12(start) if start else ''}. I'll message you when the rider sets off.", None
    if t.get("status") == "picked_up" and rider:
        st.setdefault("messages", []).append(W.office_message(f"rider:{rider}", f"📞 {t.get('customer')} ({t.get('ref')}) says: \"{text}\". Call them before you go.", kind="update", taskId=t["id"]))
        return "Thanks, I've told the rider, who is already on the way. They'll call you to agree a time.", None
    if t.get("status") == "failed":
        t["rescheduled"] = {"at": W.now_iso(), "by": "customer", "text": text, "to": day or "", "time": start}
        return "Thanks, I've passed that to the team to book your new delivery. They'll confirm with you.", None
    return "Thanks, I've passed that to the team.", None


def awaiting_turn(st, wid: int, digits: str, text: str, photo: Optional[str] = None) -> Optional[Tuple[str, Optional[List]]]:
    memo = W.contacts(st).setdefault(f"customer:{digits}", {})
    aw = memo.pop("awaiting", None)
    if not aw or not text:
        return None
    t = next((x for x in st.get("tasks", []) if x.get("id") == aw.get("taskId")), None)
    if not t:
        return None
    if aw["what"] == "problem":
        return report(st, wid, t, text, photo)
    if aw["what"] == "when":
        return reschedule(st, t, text)
    return None

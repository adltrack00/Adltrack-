"""Who sees what, and who may change what.

The company sees and edits its whole workspace. A vendor sees only their own products, orders, deliveries and
messages; a rider sees only their own drops and messages. When a vendor or rider saves, the server compares what they
sent with what they were shown and accepts only the changes their role allows, then writes them into the full
workspace. Anything else is refused, so a rider's phone can never change stock, prices or another rider's drops.
"""
import copy
from typing import Any, Callable, Dict, List, Optional

LISTS = ["vendors", "riders", "products", "intake", "orders", "tasks", "messages"]
# New records the browser puts at the top of these lists; messages are added at the end.
PREPEND = {"orders", "tasks", "intake"}


class Refused(Exception):
    pass


def _pick(d: Dict[str, Any], keys) -> Dict[str, Any]:
    return {k: d[k] for k in keys if k in d}


COMPANY_PUBLIC = ["name", "dispatcher", "city", "theme", "zones", "deliver", "setupDone"]
RIDER_PUBLIC = ["id", "name", "short", "color", "zone", "online", "vehicle", "phone"]


def view(state: Optional[Dict[str, Any]], role: str, ref: Optional[str]) -> Optional[Dict[str, Any]]:
    """The part of the workspace this person may see."""
    if state is None or role == "company":
        return state
    s = state
    company = _pick(s.get("company") or {}, COMPANY_PUBLIC)
    base = {"version": s.get("version"), "company": company, "nextRef": s.get("nextRef", 1000)}
    if role == "vendor":
        tasks = [t for t in s.get("tasks", []) if t.get("vendorId") == ref]
        rider_ids = {t.get("riderId") for t in tasks}
        return {
            **base,
            "vendors": [v for v in s.get("vendors", []) if v.get("id") == ref],
            "riders": [_pick(r, RIDER_PUBLIC) for r in s.get("riders", []) if r.get("id") in rider_ids],
            "products": [p for p in s.get("products", []) if p.get("vendorId") == ref],
            "intake": [i for i in s.get("intake", []) if i.get("vendorId") == ref],
            "orders": [o for o in s.get("orders", []) if o.get("vendorId") == ref],
            "tasks": tasks,
            "messages": [m for m in s.get("messages", []) if m.get("vendorId") == ref],
        }
    if role == "rider":
        tasks = [t for t in s.get("tasks", []) if t.get("riderId") == ref]
        product_ids = {l.get("productId") for t in tasks for l in t.get("items", [])}
        vendor_ids = {t.get("vendorId") for t in tasks}
        return {
            **base,
            "vendors": [_pick(v, ["id", "name", "color"]) for v in s.get("vendors", []) if v.get("id") in vendor_ids],
            "riders": [r for r in s.get("riders", []) if r.get("id") == ref],
            "products": [_pick(p, ["id", "vendorId", "name", "unit", "price"]) for p in s.get("products", []) if p.get("id") in product_ids],
            "intake": [],
            "orders": [],
            "tasks": tasks,
            "messages": [m for m in s.get("messages", []) if m.get("riderId") == ref],
        }
    return {**base, **{k: [] for k in LISTS}}


def _changed_keys(a: Dict[str, Any], b: Dict[str, Any]) -> set:
    return {k for k in set(a) | set(b) if a.get(k) != b.get(k)}


# Rules: (collection) -> function(kind, old, new, ref) -> bool, where kind is "add", "change" or "remove".
def _rider_rules() -> Dict[str, Callable]:
    def tasks(kind, old, new, ref):
        return kind == "change" and old.get("riderId") == ref and new.get("riderId") == ref and _changed_keys(old, new) <= {"status", "history", "proof", "payment", "failReason"} and new.get("status") in ("assigned", "picked_up", "delivered", "failed")

    def messages(kind, old, new, ref):
        if kind == "add":
            return new.get("riderId") == ref and new.get("from") == "rider" and not new.get("vendorId")
        return kind == "change" and old.get("riderId") == ref and _changed_keys(old, new) <= {"read"}

    def riders(kind, old, new, ref):
        return kind == "change" and old.get("id") == ref and _changed_keys(old, new) <= {"online"}

    return {"tasks": tasks, "messages": messages, "riders": riders}


def _vendor_rules() -> Dict[str, Callable]:
    def orders(kind, old, new, ref):
        if kind == "add":
            return new.get("vendorId") == ref and new.get("status") in ("open", "needs_fix")
        return kind == "change" and old.get("vendorId") == ref and new.get("vendorId") == ref and old.get("status") in ("open", "needs_fix") and new.get("status") in ("open", "needs_fix", "cancelled")

    def messages(kind, old, new, ref):
        if kind == "add":
            return new.get("vendorId") == ref and new.get("from") == "vendor" and not new.get("riderId")
        return kind == "change" and old.get("vendorId") == ref and _changed_keys(old, new) <= {"read"}

    def vendors(kind, old, new, ref):
        return kind == "change" and old.get("id") == ref and _changed_keys(old, new) <= {"contact", "phone"}

    # A vendor (or anyone on its team) can list a new product. It starts with nothing in stock: units only count once
    # the company has received them.
    def products(kind, old, new, ref):
        if kind != "add":
            return False
        price = new.get("price")
        return (new.get("vendorId") == ref and new.get("received") == 0 and isinstance(price, (int, float)) and price >= 0
                and isinstance(new.get("name"), str) and new["name"].strip() != "" and set(new) <= PRODUCT_KEYS)

    # Stock the vendor sends to the office waits as "sent" until the company counts it in. The vendor may call off a
    # shipment the office hasn't counted yet.
    def intake(kind, old, new, ref):
        if kind == "add":
            qty = new.get("qty")
            return new.get("vendorId") == ref and new.get("status") == "sent" and isinstance(qty, int) and 0 < qty <= 100000
        return (kind == "change" and old.get("vendorId") == ref and old.get("status") == "sent" and new.get("status") == "cancelled"
                and _changed_keys(old, new) <= {"status", "cancelledAt", "cancelledBy"})

    return {"orders": orders, "messages": messages, "vendors": vendors, "products": products, "intake": intake}


PRODUCT_KEYS = {"id", "vendorId", "name", "unit", "price", "received", "aliases", "by", "addedAt"}
# What gets stamped with the name of the person who added it.
STAMPED = {"orders", "products", "intake", "messages"}


RULES = {"rider": _rider_rules(), "vendor": _vendor_rules()}


def merge(full: Dict[str, Any], sent: Dict[str, Any], role: str, ref: Optional[str], who: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Applies a vendor's or rider's save to the full workspace, or raises Refused.

    Several people can work for one vendor. Each save carries only that person's changes, applied record by record on
    top of the latest copy, so one teammate sending stock never undoes another's order. Every record they add is
    stamped with who added it, from their login, not from what the browser claims."""
    shown = view(full, role, ref)
    rules = RULES.get(role, {})
    for key in set(shown) | set(sent):
        if key in LISTS:
            continue
        if shown.get(key) != sent.get(key):
            raise Refused(f"{role} cannot change {key}")
    out = copy.deepcopy(full)
    for key in LISTS:
        before = {x.get("id"): x for x in shown.get(key, []) if isinstance(x, dict)}
        after_list = [x for x in (sent.get(key) or []) if isinstance(x, dict)]
        after = {x.get("id"): x for x in after_list}
        rule = rules.get(key)
        added: List[Dict[str, Any]] = []
        changed: Dict[Any, Dict[str, Any]] = {}
        for item_id, item in after.items():
            old = before.get(item_id)
            if old is None:
                if not item_id or not rule or not rule("add", None, item, ref):
                    raise Refused(f"{role} cannot add to {key}")
                added.append(item)
            elif old != item:
                if not rule or not rule("change", old, item, ref):
                    raise Refused(f"{role} cannot change this in {key}")
                changed[item_id] = item
        for item_id in before:
            if item_id not in after:
                raise Refused(f"{role} cannot remove from {key}")
        if not added and not changed:
            continue
        items = [changed.get(x.get("id"), x) for x in out.get(key, [])]
        existing = {x.get("id") for x in items}
        if key == "orders":
            added = _renumber_orders(added, items)
        if key == "intake":
            mine = {p.get("id") for p in out.get("products", []) if p.get("vendorId") == ref}
            for a in added:
                if a.get("productId") not in mine:
                    raise Refused(f"{role} cannot send stock for that product")
        if who and key in STAMPED:
            by = {"id": who.get("id"), "name": who.get("name"), "role": role}
            added = [{**a, "by": by} for a in added]
        added = [a for a in added if a.get("id") not in existing]
        out[key] = added + items if key in PREPEND else items + added
    return out


def _renumber_orders(added: List[Dict[str, Any]], items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """A vendor only sees their own orders, so the number their browser picked may already be used."""
    taken = {o.get("id") for o in items}
    top = 3300
    for o in items:
        digits = "".join(ch for ch in str(o.get("id")) if ch.isdigit())
        if digits:
            top = max(top, int(digits))
    out = []
    for o in added:
        if o.get("id") in taken:
            top += 1
            o = {**o, "id": f"ORD-{top}"}
        taken.add(o["id"])
        out.append(o)
    return out


def empty_state(company: str, dispatcher: str, city: str) -> Dict[str, Any]:
    return {
        "version": 5,
        "company": {"name": company, "dispatcher": dispatcher, "city": city or ""},
        "vendors": [], "riders": [], "products": [], "intake": [], "orders": [], "tasks": [], "messages": [],
        "nextRef": 1000,
    }

"""Reading vendors' WhatsApp orders and stock messages.

Vendors send orders as chat messages, each in their own layout: labelled lines ("Name: ..."), one line with commas,
numbered lists, several orders in one message, a "Tuesday orders" header on top. read_orders() splits the text into
orders and reads each field it can find. It never fills in what the message doesn't say: anything missing or doubtful
is flagged for a person to fix (ops manual: never invent an address, phone number or amount).

The same reader serves the company's "Paste WhatsApp orders" box (POST /api/intake/read) and messages vendors send to
ADA on WhatsApp, so both read an order the same way.
"""
import re
from datetime import date, timedelta
from typing import Any, Dict, List, Optional, Tuple

# ---------- Matching names to what is saved ----------


def clean(s: Any) -> str:
    s = re.sub(r"[’']", "", str(s or "").lower())
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", s)).strip()


def singular(w: str) -> str:
    if w.endswith("ies"):
        return w[:-3] + "y"
    if w.endswith("ses") or w.endswith("xes"):
        return w[:-2]
    return w[:-1] if w.endswith("s") and len(w) > 3 else w


def find_vendor(state: Dict[str, Any], text: str) -> Optional[Dict[str, Any]]:
    t = clean(text)
    if not t:
        return None
    best, score = None, 0
    for v in state.get("vendors", []):
        name = clean(v.get("name"))
        s = 0
        if name and name in t:
            s = 10
        else:
            parts = [w for w in name.split(" ") if len(w) > 3]
            for w in parts:
                if re.search(rf"\b{re.escape(w)}", t):
                    s += 3
            if parts and re.search(rf"\b{re.escape(parts[0])}", t):
                s += 1
        if s > score:
            best, score = v, s
    return best if score >= 3 else None


def find_product(state: Dict[str, Any], text: str, vendor_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    t = " " + " ".join(singular(w) for w in clean(text).split(" ")) + " "
    if not t.strip():
        return None
    best, score = None, 0.0
    for p in state.get("products", []):
        if vendor_id and p.get("vendorId") != vendor_id:
            continue
        names = [" ".join(singular(w) for w in clean(n).split(" ")) for n in [p.get("name", "")] + list(p.get("aliases") or [])]
        s = 0.0
        for n in names:
            if not n:
                continue
            if f" {n} " in t:
                s = max(s, 5 + len(n) / 10)
            ws = [w for w in n.split(" ") if len(w) > 2]
            hits = sum(1 for w in ws if f" {w} " in t)
            if hits:
                s = max(s, hits / len(ws) * 4)
        if s > score:
            best, score = p, s
    return best if score >= 2 else None


ZONES = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island", "Ajah", "Ikoyi", "Maryland", "Gbagada", "Apapa"]


def zone_of(address: str, fallback: str = "") -> str:
    a = clean(address)
    for z in ZONES:
        if clean(z) in a:
            return z
    return "Victoria Island" if re.search(r"\bvi\b", a) else fallback


# ---------- Phones, money, dates ----------

PHONE = re.compile(r"(?:\+?234[\s-]?|\b0)[789][01]\d(?:[\s-]?\d){7}(?!\d)")


def phone_digits(raw: Any) -> str:
    """A Nigerian number as WhatsApp writes it: 2348031234567. Other numbers keep their digits."""
    d = re.sub(r"\D", "", str(raw or ""))
    if d.startswith("234") and len(d) == 13:
        return d
    if d.startswith("0") and len(d) == 11:
        return "234" + d[1:]
    if len(d) == 10 and d[0] in "789":
        return "234" + d
    return d


def normalize_phone(raw: Any) -> str:
    d = phone_digits(raw)
    if not (d.startswith("234") and len(d) == 13):
        return ""
    n = d[3:]
    return f"+234 {n[:3]} {n[3:6]} {n[6:]}"


def _phones(text: str) -> List[str]:
    return [p for p in (normalize_phone(m) for m in PHONE.findall(text)) if p]


def parse_money(text: Any) -> int:
    m = re.search(r"(?:₦|ngn|n(?=\d))?\s*(\d{1,3}(?:[,.]\d{3})+|\d+(?:\.\d+)?)\s*(k)?\b", str(text), re.I)
    if not m:
        return 0
    n = float(re.sub(r"[,.](?=\d{3}\b)", "", m.group(1)))
    return int(round(n * (1000 if m.group(2) else 1)))


# Amounts written loose in a line: "25k", "₦25,000", "N25000", "25,000", "56000 naira".
MONEY_LOOSE = re.compile(
    r"(?:(?:₦|\bngn\s?|\bn)\s?\d[\d,.]*\s?k?\b|\b\d{1,3}(?:\.\d)?\s?k\b|\b\d{1,3}(?:,\d{3})+\b|\b\d[\d,]*\s?(?:naira|nair)\b"
    r"|(?<!plot )(?<!no )(?<!house )(?<!block )(?<!flat )(?<!km )\b\d{4,7}\b(?!\s*(?:,\s*)?[a-z]*\s*(?:street|st\b|road|rd\b|avenue|ave\b|close|crescent|way\b)))",
    re.I,
)

WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
WEEKDAY = re.compile(r"\b(mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sun)(?:day|nesday|sday|rsday|urday)?\b", re.I)
WHEN_WORDS = re.compile(
    r"\b(urgent|asap|immediately|rush|express|today|tonight|tomorrow|tmrw|tmr|this (?:morning|afternoon|evening)|morning|afternoon|evening|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tues|thurs)\b"
    r"|\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|\b(?:by|before|after|around)\s+\d{1,2}(?::\d{2})?\b",
    re.I,
)


def _weekday_date(word: str, today: date) -> str:
    w = word.lower()[:3]
    idx = next(i for i, d in enumerate(WEEKDAYS) if d.startswith(w))
    ahead = (idx - today.weekday()) % 7
    return (today + timedelta(days=ahead)).isoformat()


def _full_weekday(text: str) -> Optional[str]:
    """A weekday named in the text, written out or as a common short form. "sat"/"sun" alone are too risky."""
    for m in WEEKDAY.finditer(text):
        word = m.group(0).lower()
        if word in ("sat", "sun", "mon", "wed", "thu", "fri", "tue"):
            continue
        return word
    return None


def parse_when(text: str, today: Optional[date] = None) -> Dict[str, Any]:
    today = today or date.today()
    t = str(text).lower()
    out: Dict[str, Any] = {}
    if re.search(r"\b(urgent|asap|immediately|rush|express|quick(ly)?)\b", t):
        out["urgent"] = True
    if re.search(r"\b(tomorrow|tmrw|tmr)\b", t):
        out["date"] = (today + timedelta(days=1)).isoformat()
    elif re.search(r"\b(today|tonight|this (morning|afternoon|evening))\b", t):
        out["date"] = today.isoformat()
    else:
        day = _full_weekday(t)
        if day:
            out["date"] = _weekday_date(day, today)
    rng = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to|and)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", t) or re.search(
        r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:-|–|to|and)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", t
    )
    one = re.search(r"(?:by|before|at|around|from|after)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", t) or re.search(r"\b(?:by|before|at|around)\s+(\d{1,2})(?::(\d{2}))?\b", t)

    def hh(h, m, ap, fallback=None):
        n = int(h)
        a = ap or fallback or ("pm" if n < 7 else "")
        if a == "pm" and n < 12:
            n += 12
        if a == "am" and n == 12:
            n = 0
        return f"{n:02d}:{int(m or 0):02d}" if n < 24 else ""

    if rng:
        out["start"] = hh(rng.group(1), rng.group(2), rng.group(3), rng.group(6))
        out["end"] = hh(rng.group(4), rng.group(5), rng.group(6))
    elif one:
        v = hh(one.group(1), one.group(2), one.group(3) if one.lastindex and one.lastindex >= 3 else None)
        if re.search(r"\b(by|before)\b", t):
            out["end"] = v
        else:
            out["start"] = v
    for word, start, end in (("morning", "09:00", "12:00"), ("afternoon", "12:00", "16:00"), ("evening", "16:00", "19:00")):
        if re.search(rf"\b{word}\b", t) and not out.get("start"):
            out["start"], out["end"] = start, out.get("end") or end
    return out


# ---------- Products in free text ----------

UNIT = r"(?:x|pcs?|pieces?|units?|bottles?|pairs?|jars?|box(?:es)?|bars?|packs?|cartons?|bags?|tins?|sachets?|crates?)"
FREE = r"(?:free|bonus|gift|extra)"


def _alias_pattern(name: str) -> str:
    words = [re.escape(w) for w in re.split(r"[\s\-]+", name.strip().lower()) if w]
    if not words:
        return ""
    words[-1] = words[-1] + r"(?:e?s)?"
    return r"[\s\-]*".join(words)


def _product_regex(p: Dict[str, Any]) -> Optional[re.Pattern]:
    names = sorted({n.strip().lower() for n in [p.get("name", "")] + list(p.get("aliases") or []) if n and n.strip()}, key=len, reverse=True)
    alts = "|".join(a for a in (_alias_pattern(n) for n in names) if a)
    if not alts:
        return None
    one = rf"(?:{alts})"
    return re.compile(
        rf"(?:(?<![\d,])(\d{{1,3}})\s*(?:{UNIT}\s*)?(?:of\s+)?)?({FREE}\s+)?\b{one}(?:\s+{one})*\b"
        rf"(?:\s*(?:\(\s*(?:{FREE}\s*)?|x\s*|qty:?\s*|-\s*)(\d{{1,3}})\s*\)?(?![\d,.]|\s*k\b|\s*(?:,\s*)?\d)"
        rf"|\s+(\d{{1,3}})(?![\d,.]|\s*k\b|\s*(?:,\s*)?\d|\s+[a-z]))?"
        rf"(?:\s*\(\s*({FREE})\s*\))?"
        rf"(?:\s*\+\s*(\d{{1,3}})\s*{FREE}\b(?!\s*[a-z]))?",
        re.I,
    )


def scan_products(state: Dict[str, Any], text: str, vendor_id: Optional[str] = None) -> Tuple[List[Dict[str, Any]], str]:
    """Finds the vendor's products named in the text with their quantities. Returns the items and the text with them
    blanked out, so what is left can be read as a name or an address."""
    products = [p for p in state.get("products", []) if not vendor_id or p.get("vendorId") == vendor_id]
    regs = [(p, _product_regex(p)) for p in products]
    found: List[Dict[str, Any]] = []
    rest = text
    for _ in range(40):
        best = None
        for p, rx in regs:
            if not rx:
                continue
            for m in rx.finditer(rest):
                if not m.group(0).strip():
                    continue
                key = (m.start(), -(m.end() - m.start()))
                if best is None or key < best[0]:
                    best = (key, p, m)
                break
        if not best:
            break
        _, p, m = best
        qty = int(m.group(1) or m.group(3) or m.group(4) or 1)
        free = bool(m.group(2) or m.group(5))
        extra_free = int(m.group(6) or 0)
        if 0 < qty < 1000:
            found.append({"productId": p["id"], "name": m.group(0).strip(), "qty": qty, "free": free, "extraFree": extra_free})
        rest = rest[: m.start()] + " " * (m.end() - m.start()) + rest[m.end():]
    found.sort(key=lambda x: text.lower().find(x["name"].lower()))
    return found, rest


def parse_item_text(text: str) -> List[Dict[str, Any]]:
    """Item names with quantities, for products the vendor hasn't given the office: "3 handbags", "wig x2"."""
    out = []
    for part in re.split(r",|\+|&|\band\b|\n|;", str(text), flags=re.I):
        part = re.sub(r"[.!]+$", "", part.strip())
        if not part:
            continue
        free = bool(re.search(rf"\b{FREE}\b", part, re.I))
        part = re.sub(r"\s+", " ", re.sub(rf"\b{FREE}\b", "", part, flags=re.I)).strip()
        m = re.match(rf"^(\d+)\s*{UNIT}?\s*(?:of\s+)?(.+)$", part, re.I)
        if m:
            qty, name = int(m.group(1)), m.group(2)
        else:
            m = re.match(r"^(.+?)\s*(?:x\s*|\(\s*|-\s*|qty:?\s*|\s)(\d{1,3})\)?$", part, re.I)
            qty, name = (int(m.group(2)), m.group(1)) if m else (1, part)
        name = re.sub(r"\s*(?:@|at)\s*(?:₦|n)?\s*[\d,.]+k?.*$", "", name, flags=re.I)
        name = re.sub(r"[(){}]", "", name).strip()
        if name and re.search(r"[a-z]{2}", name, re.I) and 0 < qty < 1000:
            out.append({"name": name, "qty": qty, "free": free})
    return out


# ---------- Splitting a message into orders ----------

LABELS = [
    ("customer", r"^(?:customer(?:s)? name|customers? name|customer|client(?: name)?|name|full name|receiver(?: name)?|recipient|deliver to|to)$"),
    ("phone", r"^(?:phone(?: number| no| num)?|tel|mobile|number|contact|phone no|cust(?:omer)? phone|whatsapp(?: number| no)?|line|ph|phone nos?)$"),
    ("altPhone", r"^(?:alt(?:ernative)?(?: phone| number| no)?|other(?: phone| number)|2nd (?:phone|number)|second (?:phone|number)|backup(?: number)?)$"),
    ("address", r"^(?:address|addr|delivery address|location|area|destination|house address|office address|drop(?: off)?(?: address)?|deliver(?:y)? location)$"),
    ("landmark", r"^(?:landmark|nearest landmark|close to|near|opposite|beside|bus ?stop)$"),
    ("items", r"^(?:product|products|item|items|order|goods|package|qty|quantity|what|pcs|product name|item name)$"),
    ("free", r"^(?:free|bonus|gift|freebie|extra)$"),
    ("amount", r"^(?:amount|price|total|amount to collect|collect|to collect|pay|cost|cod|balance|amt|total amount|payment|cash)$"),
    ("ref", r"^(?:order(?: no| number| id| #)?|ref|reference|order ref|invoice)$"),
    ("when", r"^(?:time|when|delivery time|date|delivery date|deliver(?:y)? by|by|available|availability|day|delivery day|delivery)$"),
    ("note", r"^(?:note|notes|instruction|instructions|comment|comments|remark|remarks|info)$"),
]
LABEL_RX = [(k, re.compile(rx)) for k, rx in LABELS]

# Lines that are chat, not order details: greetings, "Tuesday orders", "below are today's deliveries".
CHATTER = re.compile(
    r"^(?:good\s*(?:morning|afternoon|evening|day)|morning|hello|hi|hey|dear|pls|please|kindly|thanks|thank you|thank u|ok|okay|"
    r"(?:new|my|our|the|today'?s|tomorrow'?s|todays|tomorrows)?\s*(?:orders?|deliveries|delivery list|drops)\b|"
    r"(?:here are|below are|see below|find below|these are|sending)\b.*\b(?:orders?|deliveries)\b)",
    re.I,
)
EXPORT_PREFIX = re.compile(r"^\[?\d{1,2}/\d{1,2}/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]m)?\]?\s*(?:-\s*)?[^:]{1,40}:\s*", re.I)
BULLET = re.compile(r"^[\s*•▪➤✅🔸🔹👉📦📍📞☎️🛵\-]+")


def label_of(line: str) -> Optional[Tuple[str, str]]:
    m = re.match(r"^([a-z][a-z0-9 '#/.?]{0,28}?)\s*[:=\-–]\s*(.*)$", line, re.I)
    if not m:
        return None
    key = re.sub(r"\s+", " ", re.sub(r"[?.]", "", m.group(1).lower())).strip()
    for field, rx in LABEL_RX:
        if rx.match(key):
            return field, m.group(2).strip()
    return None


def _is_chatter(line: str) -> bool:
    if PHONE.search(line) or label_of(line):
        return False
    return bool(CHATTER.match(line)) and len(line.split()) <= 9


def _only_when(line: str) -> bool:
    """A line that only says when: "Tuesday", "Tomorrow 2pm", "URGENT"."""
    rest = WHEN_WORDS.sub("", line)
    rest = re.sub(r"\b(for|on|by|delivery|deliveries|orders?|please|pls|next|-|,|\.|!|:)\b", " ", rest, flags=re.I)
    return bool(WHEN_WORDS.search(line)) and not re.search(r"[a-z0-9]{2}", rest, re.I)


def split_orders(text: str) -> Tuple[List[List[str]], str]:
    """One block of lines per order, and what the message says about all of them (a "Tuesday orders" header)."""
    lines = []
    for raw in str(text).replace("\r", "").split("\n"):
        line = EXPORT_PREFIX.sub("", raw)
        line = BULLET.sub("", line).replace("*", "").replace("_", " ").strip()
        lines.append(line)
    blocks: List[List[str]] = []
    cur: List[str] = []
    has_name = False
    header_when = []
    started = False

    def push():
        nonlocal cur, has_name
        if any(cur):
            blocks.append([l for l in cur if l])
        cur, has_name = [], False

    for raw in lines:
        if not raw:
            if len(cur) > 1:
                push()
            continue
        if _is_chatter(raw):
            if WHEN_WORDS.search(raw):
                header_when.append(raw)
            continue
        if not started and not cur and _only_when(raw):
            header_when.append(raw)
            continue
        header = re.match(r"^(?:order\s*#?\s*\d+|#\s*\d+|\d+\s*[.)])\s*[:\-]?\s*(.*)$", raw, re.I)
        if header and not re.match(r"^\d+\s*[.)]\s*\d", raw):
            push()
            started = True
            if header.group(1):
                cur.append(header.group(1))
            continue
        lab = label_of(raw)
        if lab and lab[0] == "customer" and has_name:
            push()
        if lab and lab[0] == "customer":
            has_name = True
        cur.append(raw)
        started = True
    push()
    return blocks, " ".join(header_when)


# ---------- Reading one order ----------

ADDRESS_WORDS = re.compile(
    r"\b(street|str|st|road|rd|avenue|ave|close|crescent|cres|estate|est|way|drive|lane|ln|junction|phase|plot|block|flat|house|"
    r"plaza|hall|market|bus ?stop|off|opposite|beside|behind|along|gra|ikeja|yaba|lekki|surulere|ikoyi|ajah|island|vi|maryland|"
    r"gbagada|apapa|ikorodu|festac|ojota|ogba|magodo|oshodi|agege|egbeda|ojo|abuja|wuse|garki|maitama|ph|port harcourt|ibadan|"
    r"abeokuta|benin|enugu|kano|lagos|mainland|bridge|roundabout|filling station|church|mosque|school|hospital|hotel|mall|complex|"
    r"no\.?|km)\b",
    re.I,
)
NOT_A_NAME = re.compile(rf"\b(order|orders|deliver|delivery|deliveries|today|tomorrow|urgent|asap|please|pls|free|amount|total|{'|'.join(WEEKDAYS)}|tues|thurs)\b", re.I)


def looks_like_address(s: str) -> bool:
    return bool(re.search(r"[a-z]{3}", s, re.I)) and (bool(ADDRESS_WORDS.search(s)) or bool(re.match(r"^\d+[a-z]?\s+[a-z]", s, re.I)))


def looks_like_name(s: str) -> bool:
    words = s.split()
    return 1 <= len(words) <= 4 and bool(re.match(r"^[a-z][a-z .'\-]{1,40}$", s, re.I)) and not NOT_A_NAME.search(s) and not ADDRESS_WORDS.search(s)


def _tidy(s: str) -> str:
    s = re.sub(r"\s+", " ", s)
    return re.sub(r"^[\s,;:/|\-–.]+|[\s,;:/|\-–]+$", "", s).strip()


def _split_name_address(s: str) -> Tuple[str, str]:
    """ "Femi Bello Plot 3 Admiralty way Lekki" -> ("Femi Bello", "Plot 3 Admiralty way Lekki")."""
    words = s.split()
    for i in range(1, min(4, len(words) - 1) + 1):
        head, tail = " ".join(words[:i]), " ".join(words[i:])
        nxt = words[i]
        if looks_like_name(head) and (re.match(r"^\d", nxt) or ADDRESS_WORDS.match(nxt)) and looks_like_address(tail):
            # take the longest name that still leaves an address
            best = (head, tail)
            for j in range(i + 1, min(4, len(words) - 1) + 1):
                h2, t2 = " ".join(words[:j]), " ".join(words[j:])
                if looks_like_name(h2) and (re.match(r"^\d", words[j]) or ADDRESS_WORDS.match(words[j])) and looks_like_address(t2):
                    best = (h2, t2)
            return best
    return "", s


def _read_block(state: Dict[str, Any], lines: List[str], vendor_id: str, header_when: str, today: date) -> Dict[str, Any]:
    f: Dict[str, Any] = {"customer": "", "phone": "", "altPhone": "", "address": "", "landmark": "", "items": [], "amount": 0, "ref": "",
                         "note": [], "when": "", "unknown": [], "badPhone": "", "freeDelivery": False}

    def add_phones(phones: List[str]):
        for p in phones:
            if not f["phone"]:
                f["phone"] = p
            elif p != f["phone"] and not f["altPhone"]:
                f["altPhone"] = p

    def add_items(found: List[Dict[str, Any]], force_free: bool = False):
        for it in found:
            f["items"].append({**it, "free": it["free"] or force_free})

    def items_from(value: str, force_free: bool = False):
        found, rest = scan_products(state, value, vendor_id or None)
        add_items(found, force_free)
        leftover = _tidy(re.sub(r"(^|\s)[+&,;](\s|$)|\band\b", " ", rest, flags=re.I))
        if leftover and re.search(r"[a-z]{3}", leftover, re.I):
            for x in parse_item_text(leftover):
                f["unknown"].append(x["name"])

    loose: List[str] = []
    for line in lines:
        lab = label_of(line)
        if not lab:
            loose.append(line)
            continue
        key, value = lab
        if key in ("phone", "altPhone"):
            phones = _phones(value)
            if not phones:
                f["badPhone"] = value
                continue
            if key == "altPhone" and f["phone"]:
                f["altPhone"] = f["altPhone"] or phones[0]
            else:
                add_phones(phones)
        elif key == "items":
            items_from(value)
        elif key == "free":
            items_from(value, force_free=True)
        elif key == "amount":
            f["amount"] = parse_money(value) or f["amount"]
        elif key == "note":
            f["note"].append(value)
        elif key == "when":
            if re.search(r"\bfree\b", value, re.I) and re.search(r"deliver", line, re.I):
                f["freeDelivery"] = True
            else:
                f["when"] += " " + value
        elif key == "address":
            phones = _phones(value)
            rest = _tidy(PHONE.sub(" ", value))
            if phones and re.search(r"[a-z]{3}", rest, re.I):
                # "7 Ajose Adeogun Street, VI 08134502299": the number is a phone, the rest is the address
                f["address"] = rest
                add_phones(phones)
            else:
                f["address"] = value  # a phone number alone stays, so the order is flagged for a fix
        elif key == "customer":
            phones = _phones(value)
            add_phones(phones)
            f["customer"] = _tidy(PHONE.sub(" ", value))
        else:
            f[key] = value

    # Lines without a label: take out phones, amounts, times and products, then read what is left as name / address.
    for line in loose:
        text = line
        add_phones(_phones(text))
        text = PHONE.sub(" ", text)
        if re.search(r"\bfree delivery\b", text, re.I):
            f["freeDelivery"] = True
            text = re.sub(r"\bfree delivery\b", " ", text, flags=re.I)
        found, text = scan_products(state, text, vendor_id or None)
        add_items(found)
        m = MONEY_LOOSE.search(text)
        if m and not f["amount"]:
            f["amount"] = parse_money(m.group(0))
            text = text[: m.start()] + " " + text[m.end():]
        if WHEN_WORDS.search(text):
            f["when"] += " " + text
        text = WHEN_WORDS.sub(" ", text)
        text = re.sub(r"\b(?:deliver(?:y)?|for|on|pls|please)\s*(?=[,.]|$)", " ", text, flags=re.I)
        for piece in re.split(r"\s*[,|;]\s*|\s+/\s+|\s+-\s+", text):
            piece = _tidy(piece)
            if not piece or not re.search(r"[a-z]{2}", piece, re.I):
                continue
            if re.match(r"^(near|opposite|beside|close to|after|behind|by)\b", piece, re.I) and f["address"]:
                f["landmark"] = f["landmark"] or piece
            elif not f["customer"] and looks_like_name(piece):
                f["customer"] = piece
            elif looks_like_address(piece):
                name, addr = ("", piece) if f["customer"] else _split_name_address(piece)
                if name:
                    f["customer"] = name
                if not f["address"]:
                    f["address"] = addr
                elif addr != f["address"]:
                    f["address"] = f"{f['address']}, {addr}"
            elif not f["customer"] and re.match(r"^[a-z][a-z .'\-]{1,60}$", piece, re.I) and len(piece.split()) <= 4 and not NOT_A_NAME.search(piece):
                f["customer"] = piece
            else:
                f["note"].append(piece)

    when = parse_when(f"{header_when} {f['when']}", today)
    block_when = parse_when(f["when"], today)
    when.update({k: v for k, v in block_when.items() if v})
    notes = [n for n in f["note"] if not re.search(r"\bfree delivery\b", n, re.I)]
    if any(re.search(r"\bfree delivery\b", n, re.I) for n in f["note"]):
        f["freeDelivery"] = True

    items: List[Dict[str, Any]] = []
    for it in f["items"]:
        same = next((x for x in items if x["productId"] == it["productId"]), None)
        if not same:
            same = {"productId": it["productId"], "qty": 0, "free": 0}
            items.append(same)
        if it["free"]:
            same["free"] += it["qty"]
        else:
            same["qty"] += it["qty"]
        same["free"] += it.get("extraFree", 0)

    vid = vendor_id
    if not vid and items:
        p = next((p for p in state.get("products", []) if p.get("id") == items[0]["productId"]), None)
        vid = (p or {}).get("vendorId", "")
    return {
        "vendorId": vid or "",
        "ref": f["ref"],
        "customer": f["customer"],
        "phone": f["phone"],
        "altPhone": f["altPhone"],
        "badPhone": "" if f["phone"] else f["badPhone"],
        "address": f["address"],
        "landmark": f["landmark"],
        "zone": zone_of(f"{f['address']} {f['landmark']}"),
        "items": items,
        "unknown": f["unknown"],
        "amount": f["amount"],
        "urgent": bool(when.get("urgent")),
        "freeDelivery": bool(f["freeDelivery"]),
        "date": when.get("date") or today.isoformat(),
        "start": when.get("start", ""),
        "end": when.get("end", ""),
        "note": ". ".join(notes),
        "source": "\n".join(lines),
    }


def read_orders(state: Dict[str, Any], text: str, vendor_id: str = "", today: Optional[date] = None) -> List[Dict[str, Any]]:
    """The whole message to a list of orders (not yet checked: see check_order)."""
    today = today or date.today()
    vendor = vendor_id or (find_vendor(state, str(text)[:200]) or {}).get("id", "")
    blocks, header_when = split_orders(text)
    orders = [_read_block(state, b, vendor, header_when, today) for b in blocks]
    return [o for o in orders if o["customer"] or o["phone"] or o["address"] or o["items"] or o["unknown"]]


def looks_like_orders(text: str) -> bool:
    t = str(text)
    phones = len(PHONE.findall(t))
    labels = sum(1 for l in t.split("\n") if label_of(BULLET.sub("", l).replace("*", "").strip()))
    return phones >= 1 and (labels >= 2 or len([l for l in t.split("\n") if l.strip()]) >= 3 or "," in t)


# ---------- Checking an order ----------


def money(n: Any) -> str:
    return "₦" + f"{int(round(float(n or 0))):,}"


def list_value(state: Dict[str, Any], order: Dict[str, Any]) -> int:
    prices = {p["id"]: p.get("price") or 0 for p in state.get("products", [])}
    return int(sum(l.get("qty", 0) * prices.get(l.get("productId"), 0) for l in order.get("items", [])))


def check_order(state: Dict[str, Any], order: Dict[str, Any]) -> List[Dict[str, str]]:
    """What is wrong with an order. "fix" stops it going out; "check" is worth a look. Mirrors checkOrder() in the app."""
    issues: List[Dict[str, str]] = []
    fix = lambda field, text: issues.append({"level": "fix", "field": field, "text": text})  # noqa: E731
    check = lambda field, text: issues.append({"level": "check", "field": field, "text": text})  # noqa: E731
    if not order.get("vendorId"):
        fix("vendor", "Which vendor is this for?")
    if not order.get("customer"):
        fix("customer", "No customer name.")
    if not order.get("phone"):
        fix("phone", f'"{order["badPhone"]}" isn\'t a full phone number.' if order.get("badPhone") else "No phone number.")
    addr = str(order.get("address") or "").strip()
    if not addr:
        fix("address", "No address.")
    elif not re.search(r"[a-z]{3}", PHONE.sub("", addr), re.I):
        fix("address", "The address is a phone number, not a place.")
    elif len(PHONE.sub("", addr).strip()) < 8:
        fix("address", "The address is too short for a rider to find.")
    for u in order.get("unknown") or []:
        fix("items", f'"{u}" isn\'t a product this vendor has given you.')
    if not order.get("items") and not order.get("unknown"):
        fix("items", "No product in the order.")
    lv = list_value(state, order)
    if not order.get("amount") and any(l.get("qty", 0) > 0 for l in order.get("items", [])):
        fix("amount", f"No amount to collect. List price would be {money(lv)}.")
    if order.get("amount") and order.get("items") and order["amount"] != lv:
        check("amount", f"Collect {money(order['amount'])}, list price is {money(lv)}.")
    return issues


def to_order(state: Dict[str, Any], o: Dict[str, Any]) -> Dict[str, Any]:
    issues = check_order(state, o)
    rest = {k: v for k, v in o.items() if k not in ("issues", "unknown", "badPhone")}
    fixes = [i["text"] for i in issues if i["level"] == "fix"]
    return {**rest, "status": "needs_fix" if fixes else "open", "issues": fixes}


# ---------- Stock a vendor says they are sending ----------

STOCK_WORDS = re.compile(r"\b(sending|sent|send(?:ing)? in|dropping|dropped|bringing|brought|restock(?:ing)?|new stock|stock|supply|supplying|delivering to (?:you|the office)|coming with)\b", re.I)


def read_stock(state: Dict[str, Any], text: str, vendor_id: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """ "Sending 50 serum and 20 black soap tomorrow" -> lines for the vendor's own products, and names it doesn't know."""
    body = STOCK_WORDS.sub(" ", str(text))
    found, rest = scan_products(state, body, vendor_id)
    lines: Dict[str, int] = {}
    for it in found:
        lines[it["productId"]] = lines.get(it["productId"], 0) + it["qty"]
    leftover = _tidy(WHEN_WORDS.sub(" ", re.sub(r"\b(and|to|the|office|you|for|of|units?|pcs|today|pls|please|i'?m|we'?re|am|are|is)\b|[+&,;.!]", " ", rest, flags=re.I)))
    unknown = [x["name"] for x in parse_item_text(leftover) if re.match(r"^\d", leftover)] if leftover else []
    return [{"productId": k, "qty": v} for k, v in lines.items()], unknown

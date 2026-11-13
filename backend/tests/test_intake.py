# The WhatsApp order reader on the messages vendors really send. Run: python3 backend/tests/test_intake.py
import json, os, sys
from datetime import date
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import intake

STATE = json.load(open(os.path.join(os.path.dirname(__file__), "demo_state.json")))
STATE.setdefault("orders", []); STATE.setdefault("tasks", [])
TODAY = date(2026, 11, 13)  # a Friday


def read(text, vendor="v-glow"):
    return intake.read_orders(STATE, text, vendor, today=TODAY)


def items(o):
    return sorted((l["productId"], l["qty"], l["free"]) for l in o["items"])


def fixes(o):
    return [i["text"] for i in intake.check_order(STATE, o) if i["level"] == "fix"]


# 1. A "Tuesday" header is the delivery day, not the customer
o, = read("Tuesday\nName: Adaeze Nnaji\nPhone: 0803 555 1234\nAddress: 15 Adeniran Ogunsanya St, Surulere\nItem: 2 serum + 1 free soap\nAmount: 25k")
assert o["customer"] == "Adaeze Nnaji" and o["date"] == "2026-11-17" and o["note"] == "", o
assert items(o) == [("p-serum", 2, 0), ("p-soap", 0, 1)], o["items"]

# 2. Unlabelled lines under "Tuesday orders"
o, = read("Tuesday orders\nAdaeze Nnaji\n08035551234\n15 Adeniran Ogunsanya Street Surulere\n2 serum\n25k")
assert o["customer"] == "Adaeze Nnaji" and o["phone"] == "+234 803 555 1234" and o["address"] == "15 Adeniran Ogunsanya Street Surulere", o
assert o["date"] == "2026-11-17" and o["amount"] == 25000 and items(o) == [("p-serum", 2, 0)] and not fixes(o), (o, fixes(o))

# 3. Numbered one-line orders, no commas between name and phone
a, b = read("Good morning. Orders for Tuesday\n1. Chidi Obi 08031112222 / 07012223333, 4 Isaac John St Ikeja GRA, 1 power bank, 22k\n2. Femi Bello 08025559911 Plot 3 Admiralty way Lekki 2 earbuds 56000", vendor="v-gadget")
assert a["customer"] == "Chidi Obi" and a["altPhone"] == "+234 701 222 3333" and a["address"] == "4 Isaac John St Ikeja GRA" and a["amount"] == 22000, a
assert items(a) == [("p-power", 1, 0)] and a["date"] == "2026-11-17" and a["zone"] == "Ikeja", a
assert b["customer"] == "Femi Bello" and b["address"] == "Plot 3 Admiralty way Lekki" and b["amount"] == 56000 and items(b) == [("p-buds", 2, 0)], b
assert not fixes(a) and not fixes(b), (fixes(a), fixes(b))

# 4. A phone number in the address field stays flagged; "Delivery: Tuesday" is the day
o, = read("Name: Kemi\nNumber: 08031234567, 09087654321\nAddress: 08031234567\nProduct: Vitamin C serum x2\nPrice: 25,000\nDelivery: Tuesday")
assert o["altPhone"] == "+234 908 765 4321" and items(o) == [("p-serum", 2, 0)] and o["date"] == "2026-11-17", o
assert "The address is a phone number, not a place." in fixes(o)

# 5. Phone stuck on the end of an address; quantity after the product
o, = read("Customer: Tolu Ade\nPhone No: 0813 450 2299\nLocation: 7 Ajose Adeogun Street, Victoria Island 08134502299\nBlack soap 3\nTotal: 10500")
assert o["address"] == "7 Ajose Adeogun Street, Victoria Island" and items(o) == [("p-soap", 3, 0)] and o["zone"] == "Victoria Island", o
assert not fixes(o), fixes(o)

# 6. One line with commas
o, = read("Chioma Okafor, 08020004411, 12 Allen Ave Ikeja, 2 serum, 25k")
assert o["customer"] == "Chioma Okafor" and o["address"] == "12 Allen Ave Ikeja" and items(o) == [("p-serum", 2, 0)] and o["amount"] == 25000, o

# 7. Several labelled orders, a free item, tomorrow with a time window, urgent
x, y = read("Name: Adaeze\nPhone: 0803 555 1234\nAddress: 15 Adeniran Ogunsanya St, Surulere\nLandmark: opposite Shoprite\nItem: 2 serum + 1 free soap\nAmount: 25k\nUrgent\n\nName: Tayo\nPhone: 0812 345 6677\nAddress: 07012345678\nProduct: 3 black soap\nAmount: 10,500\nTomorrow 2pm-5pm")
assert x["urgent"] and x["landmark"] == "opposite Shoprite" and items(x) == [("p-serum", 2, 0), ("p-soap", 0, 1)], x
assert y["date"] == "2026-11-14" and y["start"] == "14:00" and y["end"] == "17:00" and items(y) == [("p-soap", 3, 0)], y

# 8. A product the vendor never gave the office is flagged, never guessed
o, = read("Name: Ngozi Eze\nPhone: 08061234567\nAddress: 22 Bode Thomas St, Surulere\nItem: 1 hair dryer\nAmount: 18k")
assert o["unknown"] == ["hair dryer"] and '"hair dryer" isn\'t a product this vendor has given you.' in fixes(o), o

# 9. WhatsApp chat export lines and emoji bullets
o, = read("[13/11/2026, 09:14] Funmi Ade: 📦 Name: Bola\n[13/11/2026, 09:14] Funmi Ade: 📞 07031234567\n[13/11/2026, 09:15] Funmi Ade: 📍 9 Ogunlana Drive, Surulere\n[13/11/2026, 09:15] Funmi Ade: 1 face serum 12500")
assert o["customer"] == "Bola" and o["address"] == "9 Ogunlana Drive, Surulere" and items(o) == [("p-serum", 1, 0)] and o["amount"] == 12500, o

# 10. Stock a vendor says is on the way
lines, unknown = intake.read_stock(STATE, "Sending 50 serum and 20 black soap tomorrow", "v-glow")
assert sorted((l["productId"], l["qty"]) for l in lines) == [("p-serum", 50), ("p-soap", 20)] and not unknown, (lines, unknown)
assert intake.looks_like_orders("Chioma Okafor, 08020004411, 12 Allen Ave Ikeja, 2 serum, 25k")
assert not intake.looks_like_orders("Sending 50 serum and 20 black soap tomorrow")
assert intake.phone_digits("+234 803 111 2041") == "2348031112041" == intake.phone_digits("08031112041")
print("intake ok")

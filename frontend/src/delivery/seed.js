// Demo data for a fresh workspace. Everything lives in the browser until a backend is wired in.
import { addDaysISO, todayISO, uid } from "./utils";

// fees: what the company takes from each delivered order (vendors see it) and pays a rider per drop (riders see it).
export const COMPANY = { name: "Delivery", dispatcher: "George", city: "Lagos", fees: { delivery: 2000, rider: 1000 } };

export const ZONES = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island"];

// How many units a rider is given per day unless the company changes it.
export const DEFAULT_DAILY_UNITS = 10;

export const VENDORS = [
  { id: "v-glow", name: "GlowSkin Naturals", contact: "Funmi Ade", phone: "+234 802 410 7781", color: "#f97316" },
  { id: "v-kicks", name: "Kicks Plug NG", contact: "Daniel Eze", phone: "+234 813 902 1150", color: "#0ea5e9" },
  { id: "v-gadget", name: "Gadget Hub Lagos", contact: "Seyi Martins", phone: "+234 809 776 0034", color: "#10b981" },
  { id: "v-mama", name: "Mama's Pantry", contact: "Mrs. Okon", phone: "+234 705 118 9902", color: "#8b5cf6" },
];

export const RIDERS = [
  { id: "r-tunde", name: "Tunde Bakare", short: "Tunde", phone: "+234 803 111 2041", zone: "Ikeja", vehicle: "Bike · LAG 214 KJA", online: true, dailyUnits: 10, color: "#f97316" },
  { id: "r-amaka", name: "Amaka Obi", short: "Amaka", phone: "+234 806 552 9010", zone: "Lekki", vehicle: "Bike · LAG 908 LKK", online: true, dailyUnits: 10, color: "#0ea5e9" },
  { id: "r-kwame", name: "Kwame Mensah", short: "Kwame", phone: "+234 812 404 7733", zone: "Yaba", vehicle: "Bike · LAG 331 YAB", online: true, dailyUnits: 12, color: "#10b981" },
  { id: "r-sade", name: "Sade Adeyemi", short: "Sade", phone: "+234 809 220 1188", zone: "Surulere", vehicle: "Bike · LAG 552 SRL", online: true, dailyUnits: 10, color: "#8b5cf6" },
];

// What each vendor handed over, with the exact unit price the vendor set.
export const PRODUCTS = [
  { id: "p-serum", vendorId: "v-glow", name: "Vitamin C face serum", unit: "bottle", price: 12500, received: 100, aliases: ["serum", "face serum", "vitamin c"] },
  { id: "p-soap", vendorId: "v-glow", name: "Black soap bar", unit: "bar", price: 3500, received: 60, aliases: ["soap", "black soap"] },
  { id: "p-sneaker", vendorId: "v-kicks", name: "Air runner sneakers", unit: "pair", price: 45000, received: 40, aliases: ["sneaker", "sneakers", "shoe", "shoes", "kicks"] },
  { id: "p-slide", vendorId: "v-kicks", name: "Comfort slides", unit: "pair", price: 15000, received: 50, aliases: ["slide", "slides", "slippers"] },
  { id: "p-buds", vendorId: "v-gadget", name: "Wireless earbuds", unit: "box", price: 28000, received: 30, aliases: ["earbuds", "buds", "airpods", "earpiece"] },
  { id: "p-power", vendorId: "v-gadget", name: "20,000mAh power bank", unit: "box", price: 22000, received: 25, aliases: ["power bank", "powerbank", "power banks"] },
  { id: "p-chinchin", vendorId: "v-mama", name: "Chin chin jar (1kg)", unit: "jar", price: 6000, received: 80, aliases: ["chin chin", "chinchin"] },
  { id: "p-pepper", vendorId: "v-mama", name: "Pepper sauce (500ml)", unit: "jar", price: 4500, received: 45, aliases: ["pepper sauce", "pepper", "sauce"] },
];

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

const PHOTO_COLORS = ["#fde7d4", "#dbeafe", "#dcfce7", "#ede9fe"];
// A drawn stand-in for a rider's doorstep photo, used only for the demo deliveries.
export function demoPhoto(n = 0) {
  const bg = PHOTO_COLORS[n % PHOTO_COLORS.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 240'><rect width='320' height='240' fill='${bg}'/><rect x='0' y='170' width='320' height='70' fill='#00000014'/><rect x='200' y='40' width='80' height='150' rx='4' fill='#ffffffaa' stroke='#0000001f'/><circle cx='266' cy='118' r='4' fill='#00000040'/><g transform='translate(90 112)'><path d='M0 30 L60 0 L120 30 L60 60 Z' fill='#d6a46c'/><path d='M0 30 L60 60 L60 118 L0 88 Z' fill='#b9844e'/><path d='M120 30 L60 60 L60 118 L120 88 Z' fill='#c8925a'/><path d='M30 15 L90 45' stroke='#f3e1c7' stroke-width='8'/></g><text x='16' y='28' font-family='monospace' font-size='12' fill='#00000066'>POD · ${n + 1}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const order = (id, vendorId, customer, phone, address, zone, items, start, end, note = "") => ({
  id, vendorId, customer, phone, address, zone, items, date: todayISO(), start, end, note, status: "open", createdAt: minutesAgo(90), amount: 0, urgent: false,
});

// Delivery requests vendors placed that no rider has yet. ADA turns these into deliveries.
export const ORDERS = [
  order("ORD-3301", "v-glow", "Chioma Okafor", "+234 802 000 4411", "12 Allen Avenue, Ikeja", "Ikeja", [{ productId: "p-serum", qty: 2 }, { productId: "p-soap", qty: 3 }], "11:00", "13:00", "Call on arrival"),
  order("ORD-3302", "v-kicks", "Ibrahim Musa", "+234 805 778 1200", "3 Herbert Macaulay Way, Yaba", "Yaba", [{ productId: "p-sneaker", qty: 1 }], "12:00", "15:00"),
  order("ORD-3303", "v-gadget", "Lola Benson", "+234 818 909 3321", "Admiralty Way, Lekki Phase 1", "Lekki", [{ productId: "p-buds", qty: 1 }, { productId: "p-power", qty: 1 }], "13:00", "16:00", "Ask for Lola at reception"),
  order("ORD-3304", "v-mama", "Green Office Hub", "+234 701 444 1290", "Plot 7, Adeola Odeku, Victoria Island", "Victoria Island", [{ productId: "p-chinchin", qty: 4 }, { productId: "p-pepper", qty: 2 }], "10:00", "12:00", "2nd floor"),
  order("ORD-3305", "v-kicks", "Ifeoma Nwosu", "+234 703 221 0045", "22 Bode Thomas St, Surulere", "Surulere", [{ productId: "p-slide", qty: 2 }], "15:00", "18:00"),
  order("ORD-3306", "v-glow", "Halima Yusuf", "+234 802 664 1902", "14 Adebola St, Surulere", "Surulere", [{ productId: "p-serum", qty: 1 }], "14:00", "17:00"),
  // Read from a vendor's WhatsApp message: the address field holds a phone number, so it waits for a fix.
  {
    ...order("ORD-3307", "v-glow", "Blessing Udo", "+234 813 450 2299", "08134502299", "", [{ productId: "p-soap", qty: 2, free: 1 }], "", "17:00"),
    status: "needs_fix", amount: 7000, issues: ["The address is a phone number, not a place."],
    source: "Name: Blessing Udo\nPhone: 08134502299\nAddress: 08134502299\nItem: 2 black soap + 1 free\nAmount: 7k\nBy 5pm",
  },
];

const delivered = (ref, riderId, vendorId, customer, phone, address, zone, items, time, mins, payment, receivedBy, photoN) => ({
  id: uid("t"), ref, riderId, vendorId, customer, phone, address, zone, items, date: todayISO(), time, status: "delivered", createdBy: "ada",
  payment: { ...payment, confirmed: true, at: minutesAgo(mins) },
  proof: { photo: demoPhoto(photoN), receivedBy, note: "", at: minutesAgo(mins) },
  history: [{ status: "assigned", at: minutesAgo(mins + 120) }, { status: "picked_up", at: minutesAgo(mins + 50) }, { status: "delivered", at: minutesAgo(mins) }],
});

export function seedTasks(products) {
  const price = (id) => products.find((p) => p.id === id).price;
  const line = (productId, qty) => ({ productId, qty, price: price(productId) });
  const sum = (items) => items.reduce((s, l) => s + l.qty * l.price, 0);
  const t1 = [line("p-serum", 3)];
  const t2 = [line("p-sneaker", 1), line("p-slide", 1)];
  const t3 = [line("p-chinchin", 4)];
  const t4 = [line("p-buds", 1)];
  const t5 = [line("p-soap", 4), line("p-serum", 1)];
  const t6 = [line("p-power", 2)];
  return [
    delivered("DL-1036", "r-tunde", "v-glow", "Kola Adewale", "+234 802 555 7710", "45 Obafemi Awolowo Way, Ikeja", "Ikeja", t1, "09:30", 96, { method: "transfer", amount: sum(t1) }, "Kola A.", 0),
    delivered("DL-1037", "r-amaka", "v-kicks", "Tobi Lawal", "+234 809 333 0021", "Bisola Durosinmi-Etti Dr, Lekki", "Lekki", t2, "10:00", 61, { method: "cash", amount: sum(t2) }, "Tobi L.", 1),
    delivered("DL-1038", "r-kwame", "v-mama", "Unilag Hostel Shop", "+234 810 676 4432", "Moremi Hall, University of Lagos, Yaba", "Yaba", t3, "10:30", 34, { method: "pos", amount: sum(t3) }, "Shop attendant", 2),
    {
      id: uid("t"), ref: "DL-1039", riderId: "r-amaka", vendorId: "v-gadget", customer: "Ngozi Eke", phone: "+234 816 220 4510", address: "Chevron Drive, Lekki", zone: "Lekki",
      items: t4, date: todayISO(), time: "11:30", status: "delivered", createdBy: "dispatcher",
      payment: { method: "transfer", amount: sum(t4), confirmed: false, at: null },
      proof: { photo: demoPhoto(3), receivedBy: "Ngozi", note: "Customer says transfer is on the way", at: minutesAgo(9) },
      history: [{ status: "assigned", at: minutesAgo(130) }, { status: "picked_up", at: minutesAgo(60) }, { status: "delivered", at: minutesAgo(9) }],
    },
    {
      id: uid("t"), ref: "DL-1035", riderId: "r-sade", vendorId: "v-kicks", customer: "Kunle Ajayi", phone: "+234 807 310 4466", address: "5 Ojuelegba Road, Surulere", zone: "Surulere",
      items: [line("p-slide", 1)], date: todayISO(), time: "10:00", status: "failed", failReason: "Customer not reachable", createdBy: "ada", payment: null, proof: null,
      history: [{ status: "assigned", at: minutesAgo(180) }, { status: "picked_up", at: minutesAgo(120) }, { status: "failed", at: minutesAgo(25) }],
    },
    {
      id: uid("t"), ref: "DL-1040", riderId: "r-tunde", vendorId: "v-glow", customer: "Bisi Coker", phone: "+234 806 120 9987", address: "8 Toyin Street, Ikeja", zone: "Ikeja",
      items: t5, date: todayISO(), time: "12:30", status: "picked_up", createdBy: "ada", payment: null, proof: null,
      history: [{ status: "assigned", at: minutesAgo(70) }, { status: "picked_up", at: minutesAgo(14) }],
    },
    // A fresh batch ADA just sent Tunde: it waits on his phone as a card to swipe and accept.
    {
      id: uid("t"), ref: "DL-1042", riderId: "r-tunde", vendorId: "v-kicks", customer: "Yemi Alade", phone: "+234 803 909 1123", address: "21 Opebi Road, Ikeja", zone: "Ikeja",
      items: [line("p-sneaker", 1)], date: todayISO(), time: "14:00", status: "assigned", createdBy: "ada", payment: null, proof: null,
      history: [{ status: "assigned", at: minutesAgo(3) }],
    },
    {
      id: uid("t"), ref: "DL-1043", riderId: "r-tunde", vendorId: "v-mama", customer: "Computer Village Stall 14", phone: "+234 805 330 7781", address: "Otigba Street, Ikeja", zone: "Ikeja",
      items: [line("p-chinchin", 2), line("p-pepper", 2)], date: todayISO(), time: "15:30", status: "assigned", createdBy: "ada", payment: null, proof: null, note: "Ask for Mr. Ade",
      history: [{ status: "assigned", at: minutesAgo(3) }],
    },
    ...pastWeek(line, sum),
    {
      id: uid("t"), ref: "DL-1041", riderId: "r-kwame", vendorId: "v-gadget", customer: "Femi Ojo", phone: "+234 812 765 0098", address: "Sabo Market Road, Yaba", zone: "Yaba",
      items: t6, date: todayISO(), time: "13:30", status: "assigned", createdBy: "ada", payment: null, proof: null,
      history: [{ status: "assigned", at: minutesAgo(40) }],
    },
  ];
}

// A few earlier days this week, so riders see their week's pay and the company sees cash handed in and vendors paid.
const PAST = [
  ["r-tunde", "v-glow", "p-serum", 1, "Ikeja", "Adeniyi Jones Ave, Ikeja", "transfer"],
  ["r-tunde", "v-kicks", "p-slide", 1, "Ikeja", "Allen Avenue, Ikeja", "cash"],
  ["r-amaka", "v-gadget", "p-buds", 1, "Lekki", "Admiralty Way, Lekki", "transfer"],
  ["r-amaka", "v-glow", "p-soap", 2, "Lekki", "Freedom Way, Lekki", "cash"],
  ["r-kwame", "v-mama", "p-pepper", 2, "Yaba", "Commercial Ave, Yaba", "cash"],
  ["r-sade", "v-kicks", "p-sneaker", 1, "Surulere", "Adeniran Ogunsanya, Surulere", "pos"],
];
const NAMES = ["Ada Nnamdi", "Segun Bello", "Grace Effiong", "Musa Danjuma", "Kemi Alabi", "Uche Obi", "Rita Okoro", "Tayo Fash"];
function pastWeek(line, sum) {
  const out = [];
  const back = Math.min(3, (new Date().getDay() + 6) % 7); // only days already gone this week
  let n = 1000;
  for (let d = back; d >= 1; d -= 1) {
    PAST.forEach(([riderId, vendorId, productId, qty, zone, address, method], i) => {
      if ((i + d) % 4 === 0) return;
      n += 1;
      const items = [line(productId, qty)];
      const at = new Date(Date.now() - d * 86400000 - (i + 1) * 3600000).toISOString();
      const amount = sum(items);
      out.push({
        id: uid("t"), ref: `DL-${n}`, riderId, vendorId, customer: NAMES[(i + d) % NAMES.length], phone: "", address, zone, items, date: addDaysISO(-d), time: "", status: "delivered", createdBy: "ada",
        payment: { method, amount, confirmed: true, at, ...(method === "cash" ? { handedIn: { at, ref: `TRF-${n}` }, handInVerified: at } : {}) },
        proof: { photo: demoPhoto(i), receivedBy: "", note: "", at },
        history: [{ status: "assigned", at }, { status: "picked_up", at }, { status: "delivered", at }],
        acceptedAt: at,
        ...(d > 1 ? { settled: { at, ref: `PAY-${n}` } } : {}),
      });
    });
  }
  return out;
}

export function seedMessages() {
  return [
    { id: uid("m"), riderId: "r-tunde", from: "ada", text: "Morning Tunde. You have 2 drops in Ikeja today (8 units). First is Kola Adewale by 9:30.", at: minutesAgo(200), read: true },
    { id: uid("m"), riderId: "r-tunde", from: "rider", text: "Got it, heading to the warehouse.", at: minutesAgo(190), read: true },
    { id: uid("m"), riderId: "r-kwame", from: "ada", text: "Kwame, Femi Ojo wants 2 power banks by 1:30 PM at Sabo Market Road. Collect ₦44,000.", at: minutesAgo(40), read: false },
  ];
}

export function seedIntake() {
  return PRODUCTS.map((p) => ({ id: uid("in"), vendorId: p.vendorId, productId: p.id, qty: p.received, price: p.price, at: minutesAgo(60 * 26), note: "Opening stock" }));
}

export function freshState() {
  return {
    version: 5,
    company: COMPANY,
    vendors: VENDORS,
    riders: RIDERS,
    products: PRODUCTS,
    intake: seedIntake(),
    orders: ORDERS,
    tasks: seedTasks(PRODUCTS),
    messages: seedMessages(),
    nextRef: 1044,
  };
}

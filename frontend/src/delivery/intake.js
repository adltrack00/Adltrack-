/* Reading a vendor's WhatsApp orders. Vendors send orders as chat messages, each in their own layout:
   labelled lines ("Name: ..."), one line with commas, numbered lists, several orders in one message.
   readOrders() splits the pasted text into orders, reads each field it can find and checks the result.
   It never fills in what the message doesn't say: anything missing or doubtful is flagged for a person to fix
   (ops manual: never invent an address, phone number or amount). */
import { findProduct, findVendor, zoneOf } from "./ada";
import { productLedger } from "./store";
import { money, todayISO, addDaysISO } from "./utils";

const LABELS = [
  ["customer", /^(?:customer(?:'?s)? name|customer|client(?: name)?|name|receiver|recipient|deliver to|to)$/],
  ["phone", /^(?:phone(?: number| no)?|tel|mobile|number|contact|phone no|cust(?:omer)? phone|whatsapp(?: number)?|line)$/],
  ["altPhone", /^(?:alt(?:ernative)?(?: phone| number| no)?|other(?: phone| number)|2nd (?:phone|number)|second (?:phone|number)|backup(?: number)?)$/],
  ["address", /^(?:address|addr|delivery address|location|area|destination|house address|office address|drop(?: off)?(?: address)?)$/],
  ["landmark", /^(?:landmark|nearest landmark|close to|near|opposite|beside|bus ?stop)$/],
  ["items", /^(?:product|products|item|items|order|goods|package|qty|quantity|what|pcs)$/],
  ["free", /^(?:free|bonus|gift|freebie|extra)$/],
  ["amount", /^(?:amount|price|total|amount to collect|collect|to collect|pay|cost|cod|balance|amt|total amount|payment)$/],
  ["ref", /^(?:order(?: no| number| id| #)?|ref|reference|order ref|invoice)$/],
  ["when", /^(?:time|when|delivery time|date|delivery date|deliver(?:y)? by|by|available|availability|day)$/],
  ["note", /^(?:note|notes|instruction|instructions|comment|comments|remark|remarks|info)$/],
];

const PHONE = /(?:\+?234[\s-]?|0)[789][01]\d(?:[\s-]?\d){7}/g;
const MONEY = /(?:₦|ngn|n(?=\d))?\s*(\d{1,3}(?:[,.]\d{3})+|\d+(?:\.\d+)?)\s*(k)?\b/i;

export function normalizePhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  let n = d;
  if (d.startsWith("234")) n = d.slice(3);
  else if (d.startsWith("0")) n = d.slice(1);
  if (n.length !== 10) return "";
  return `+234 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

function parseMoney(text) {
  const m = String(text).match(MONEY);
  if (!m) return 0;
  const n = Number(m[1].replace(/[,.](?=\d{3}\b)/g, ""));
  return Math.round(n * (m[2] ? 1000 : 1));
}

// "2 serums", "serum x2", "2x serum", "serum (2)", "1 sneakers size 42 + 1 free slides"
function parseItemText(text) {
  const out = [];
  for (let part of String(text).split(/,|\+|&|\band\b|\n|;/i)) {
    part = part.trim().replace(/[.!]+$/, "");
    if (!part) continue;
    const free = /\b(free|bonus|gift|extra)\b/i.test(part);
    part = part.replace(/\b(free|bonus|gift|extra)\b/gi, "").replace(/\s+/g, " ").trim();
    let m = part.match(/^(\d+)\s*(?:x|pcs?|pieces?|units?|bottles?|pairs?|jars?|boxes?|bars?|packs?)?\s*(?:of\s+)?(.+)$/i);
    let qty, name;
    if (m) { qty = Number(m[1]); name = m[2]; }
    else if ((m = part.match(/^(.+?)\s*(?:x\s*|\(\s*|-\s*|qty:?\s*)(\d+)\)?$/i))) { qty = Number(m[2]); name = m[1]; }
    else { qty = 1; name = part; }
    name = name.replace(/\s*(?:@|at)\s*(?:₦|n)?\s*[\d,.]+k?.*$/i, "").replace(/[(){}]/g, "").trim();
    if (name && qty > 0 && qty < 1000) out.push({ name, qty, free });
  }
  return out;
}

function parseWhen(text, base) {
  const t = String(text).toLowerCase();
  const out = {};
  if (/\b(urgent|asap|now|immediately|rush|express|quick(ly)?)\b/.test(t)) out.urgent = true;
  if (/\btomorrow|tmrw|tmr\b/.test(t)) out.date = addDaysISO(1);
  else if (/\btoday|tonight|this (morning|afternoon|evening)\b/.test(t)) out.date = base;
  const range = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to|and)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  const one = t.match(/(?:by|before|at|around|from|after)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/) || t.match(/\b(?:by|before|at|around)\s+(\d{1,2})(?::(\d{2}))?\b/);
  const hh = (h, m, ap, fallbackAp) => {
    let n = Number(h);
    const a = ap || fallbackAp || (n < 7 ? "pm" : "");
    if (a === "pm" && n < 12) n += 12;
    if (a === "am" && n === 12) n = 0;
    return n < 24 ? `${String(n).padStart(2, "0")}:${String(Number(m || 0)).padStart(2, "0")}` : "";
  };
  if (range) { out.start = hh(range[1], range[2], range[3], range[6]); out.end = hh(range[4], range[5], range[6]); }
  else if (one) { const by = /\b(by|before)\b/.test(t); const v = hh(one[1], one[2], one[3]); if (by) out.end = v; else out.start = v; }
  if (/\bmorning\b/.test(t) && !out.start) { out.start = "09:00"; out.end = out.end || "12:00"; }
  if (/\bafternoon\b/.test(t) && !out.start) { out.start = "12:00"; out.end = out.end || "16:00"; }
  if (/\bevening\b/.test(t) && !out.start) { out.start = "16:00"; out.end = out.end || "19:00"; }
  return out;
}

// Split a pasted message into one block of lines per order.
function splitOrders(text) {
  const lines = String(text).replace(/\r/g, "").split("\n").map((l) => l.replace(/^[\s*•▪➤✅🔸🔹👉-]+/u, "").replace(/\*+/g, "").trim());
  const blocks = [];
  let cur = [];
  let hasName = false;
  const push = () => { if (cur.some((l) => l)) blocks.push(cur.filter(Boolean)); cur = []; hasName = false; };
  for (const raw of lines) {
    if (!raw) { if (cur.length > 1) push(); continue; }
    // "Order 2", "#2", "2." or "2)" on its own line, or a numbered line, starts a new order.
    const header = raw.match(/^(?:order\s*#?\s*\d+|#\s*\d+|\d+\s*[.)])\s*[:\-]?\s*(.*)$/i);
    if (header && !/^\d+\s*[.)]\s*\d/.test(raw)) {
      push();
      if (header[1]) cur.push(header[1]);
      continue;
    }
    const label = labelOf(raw);
    if (label && label.key === "customer" && hasName) push();
    if (label && label.key === "customer") hasName = true;
    cur.push(raw);
  }
  push();
  return blocks;
}

function labelOf(line) {
  const m = line.match(/^([a-z][a-z0-9 '#/.?]{1,28}?)\s*[:=\-–]\s*(.*)$/i);
  if (!m) return null;
  const key = m[1].toLowerCase().replace(/[?.]/g, "").replace(/\s+/g, " ").trim();
  for (const [field, re] of LABELS) if (re.test(key)) return { key: field, value: m[2].trim() };
  return null;
}

const looksLikeAddress = (s) => /\d|street|st\b|road|rd\b|avenue|ave\b|close|crescent|estate|way|drive|lane|junction|phase|off |opposite|plaza|hall|market|bus ?stop|ikeja|yaba|lekki|surulere|ikoyi|ajah|island|vi\b|maryland|gbagada|apapa/i.test(s) && /[a-z]{3}/i.test(s);

function readBlock(state, lines, vendorId) {
  const f = { customer: "", phone: "", altPhone: "", address: "", landmark: "", items: [], amount: 0, ref: "", note: [], when: "", unknown: [] };
  const loose = [];
  const takePhones = (s) => (s.match(PHONE) || []).map(normalizePhone).filter(Boolean);

  // A single line with commas: "Chioma Okafor, 08020004411, 12 Allen Ave Ikeja, 2 serum, 25k"
  const parts = lines.length === 1 && !labelOf(lines[0]) ? lines[0].split(/\s*[,|]\s*(?![0-9]{3}\b)/) : lines;

  for (const line of parts) {
    const l = labelOf(line);
    if (l) {
      if (l.key === "phone" || l.key === "altPhone") {
        const phones = takePhones(l.value);
        if (!phones.length) { f.badPhone = l.value; continue; }
        if (l.key === "phone" && !f.phone) { f.phone = phones[0]; if (phones[1]) f.altPhone = phones[1]; } else f.altPhone = f.altPhone || phones[0];
      } else if (l.key === "items") f.items.push(...parseItemText(l.value));
      else if (l.key === "free") f.items.push(...parseItemText(l.value).map((x) => ({ ...x, free: true })));
      else if (l.key === "amount") f.amount = parseMoney(l.value) || f.amount;
      else if (l.key === "note") f.note.push(l.value);
      else if (l.key === "when") f.when += ` ${l.value}`;
      else if (l.key === "address") { f.address = l.value; }
      else f[l.key] = l.value;
      continue;
    }
    loose.push(line);
  }

  // Lines without a label: work out what each one most likely is.
  for (const line of loose) {
    const phones = takePhones(line);
    const rest = line.replace(PHONE, "").replace(/\s+/g, " ").trim().replace(/^[,:\-]+|[,:\-]+$/g, "").trim();
    if (phones.length) {
      if (!f.phone) { f.phone = phones[0]; if (phones[1]) f.altPhone = phones[1]; } else if (!f.altPhone) f.altPhone = phones[0];
      if (!rest) continue;
    }
    const target = rest || line;
    if (/^(?:₦|ngn|n\d)|\b\d+(?:,\d{3})*\s*k?\s*(?:naira)\b|^\d{1,3}(?:,\d{3})+$|^\d+(?:\.\d+)?k$/i.test(target) && !f.amount) { f.amount = parseMoney(target); continue; }
    if (/\b(urgent|asap|tomorrow|today|morning|afternoon|evening|\d\s*(am|pm))\b/i.test(target) && target.split(" ").length <= 8) { f.when += ` ${target}`; continue; }
    if (/\bfree delivery\b/i.test(target)) { f.freeDelivery = true; continue; }
    const items = parseItemText(target).map((x) => ({ ...x, product: findProduct(state, x.name, vendorId) }));
    if (items.length && items.every((x) => x.product)) { f.items.push(...items); continue; }
    if (!f.address && looksLikeAddress(target)) { f.address = target; continue; }
    if (!f.customer && /^[a-z][a-z .'-]{1,40}$/i.test(target) && target.split(" ").length <= 4) { f.customer = target; continue; }
    if (/^(near|opposite|beside|close to|after|behind)\b/i.test(target)) { f.landmark = target; continue; }
    f.note.push(target);
  }

  const when = parseWhen(f.when + " " + f.note.join(" "), todayISO());
  if (/\bfree delivery\b/i.test(f.note.join(" "))) f.freeDelivery = true;

  // Items to products of this vendor.
  const items = [];
  for (const it of f.items) {
    const p = it.product || findProduct(state, it.name, vendorId);
    if (!p) { f.unknown.push(it.name); continue; }
    const same = items.find((x) => x.productId === p.id);
    if (same) { if (it.free) same.free += it.qty; else same.qty += it.qty; }
    else items.push({ productId: p.id, qty: it.free ? 0 : it.qty, free: it.free ? it.qty : 0 });
  }

  return {
    vendorId: vendorId || (items[0] && state.products.find((p) => p.id === items[0].productId).vendorId) || "",
    ref: f.ref,
    customer: f.customer,
    phone: f.phone,
    altPhone: f.altPhone,
    badPhone: f.phone ? "" : f.badPhone || "",
    address: f.address,
    landmark: f.landmark,
    zone: zoneOf(`${f.address} ${f.landmark}`),
    items,
    unknown: f.unknown,
    amount: f.amount,
    urgent: !!when.urgent,
    freeDelivery: !!f.freeDelivery,
    date: when.date || todayISO(),
    start: when.start || "",
    end: when.end || "",
    note: f.note.filter((n) => !/\bfree delivery\b/i.test(n)).join(". "),
    source: lines.join("\n"),
  };
}

export const listValue = (state, order) => order.items.reduce((s, l) => s + l.qty * ((state.products.find((p) => p.id === l.productId) || {}).price || 0), 0);

// What is wrong with an order. "fix" items stop it going out; "check" items are worth a look.
export function checkOrder(state, order, others = []) {
  const issues = [];
  const fix = (field, text) => issues.push({ level: "fix", field, text });
  const check = (field, text) => issues.push({ level: "check", field, text });
  if (!order.vendorId) fix("vendor", "Which vendor is this for?");
  if (!order.customer) fix("customer", "No customer name.");
  if (!order.phone) fix("phone", order.badPhone ? `"${order.badPhone}" isn't a full phone number.` : "No phone number.");
  const addr = String(order.address || "").trim();
  if (!addr) fix("address", "No address.");
  else if (!/[a-z]{3}/i.test(addr.replace(PHONE, ""))) fix("address", "The address is a phone number, not a place.");
  else if (addr.replace(PHONE, "").trim().length < 8) fix("address", "The address is too short for a rider to find.");
  for (const u of order.unknown || []) fix("items", `"${u}" isn't a product this vendor has given you.`);
  if (!order.items.length && !(order.unknown || []).length) fix("items", "No product in the order.");
  if (!order.amount && order.items.some((l) => l.qty > 0)) fix("amount", `No amount to collect. List price would be ${money(listValue(state, order))}.`);
  if (order.amount && order.items.length && order.amount !== listValue(state, order)) check("amount", `Collect ${money(order.amount)}, list price is ${money(listValue(state, order))}.`);
  for (const l of order.items) {
    const p = state.products.find((x) => x.id === l.productId);
    if (!p) continue;
    const free = productLedger(state, p).inWarehouse;
    if (free < l.qty + (l.free || 0)) check("items", `Only ${free} ${p.name} in the warehouse.`);
  }
  const dupe = [...state.orders.filter((o) => o.status !== "cancelled" && o.id !== order.id), ...others.filter((o) => o !== order)]
    .find((o) => o.phone && o.phone === order.phone && o.items.some((a) => order.items.some((b) => a.productId === b.productId)));
  if (dupe) check("phone", `Looks like a repeat of ${dupe.id ? `${dupe.id} for ` : "another order for "}${dupe.customer || "the same number"}.`);
  return issues;
}

export const blocking = (issues) => issues.some((i) => i.level === "fix");

// The whole message to a list of checked orders.
export function readOrders(state, text, vendorId = "") {
  const vendor = vendorId || (findVendor(state, String(text).slice(0, 200)) || {}).id || "";
  const orders = splitOrders(text)
    .map((lines) => readBlock(state, lines, vendor))
    .filter((o) => o.customer || o.phone || o.address || o.items.length || o.unknown.length);
  return orders.map((o) => ({ ...o, issues: checkOrder(state, o, orders) }));
}

// Pasted text that reads like orders rather than an instruction to ADA.
export function looksLikeOrders(text) {
  const t = String(text);
  const phones = (t.match(PHONE) || []).length;
  const labels = t.split("\n").filter((l) => labelOf(l.replace(/^[\s*•-]+/, "").replace(/\*+/g, ""))).length;
  return phones >= 1 && (labels >= 2 || t.split("\n").length >= 3);
}

// Ready to save: drop the working fields.
export function toOrder(o) {
  const { issues, unknown, badPhone, ...rest } = o;
  return { ...rest, status: blocking(issues) ? "needs_fix" : "open", issues: issues.filter((i) => i.level === "fix").map((i) => i.text) };
}

/* Reading a vendor's WhatsApp orders. Vendors send orders as chat messages, each in their own layout:
   labelled lines ("Name: ..."), one line with commas, numbered lists, several orders in one message.
   readOrders() asks the server to read them and checks the result.
   It never fills in what the message doesn't say: anything missing or doubtful is flagged for a person to fix
   (ops manual: never invent an address, phone number or amount). */
import { api } from "./auth";
import { productLedger } from "./store";
import { money } from "./utils";

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

export function normalizePhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  let n = d;
  if (d.startsWith("234")) n = d.slice(3);
  else if (d.startsWith("0")) n = d.slice(1);
  if (n.length !== 10) return "";
  return `+234 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

function labelOf(line) {
  const m = line.match(/^([a-z][a-z0-9 '#/.?]{1,28}?)\s*[:=\-–]\s*(.*)$/i);
  if (!m) return null;
  const key = m[1].toLowerCase().replace(/[?.]/g, "").replace(/\s+/g, " ").trim();
  for (const [field, re] of LABELS) if (re.test(key)) return { key: field, value: m[2].trim() };
  return null;
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

// The whole message to a list of checked orders. The server reads it (backend/intake.py), the same reader ADA uses
// for orders vendors send on WhatsApp; the checks run here so they update as someone fixes a field.
export async function readOrders(state, text, vendorId = "") {
  const { orders } = await api("/api/intake/read", { method: "POST", body: { text, vendorId } });
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

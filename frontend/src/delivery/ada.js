/* ADA, the dispatch assistant. The company tells ADA, in its own words, what stock came in from which vendor and
   what has to go out. ADA answers with a plan: stock to receive, deliveries to create (who, what, where, when, how much
   to collect) and messages to send to riders. Nothing changes until someone taps Approve, and then it is saved through
   the same store actions as the buttons.

   Cheapest first: the usual requests are understood right here in the browser, free. When a backend is configured
   (REACT_APP_BACKEND_URL), ADA asks Claude on the server instead (backend/server.py), and falls back to the
   browser if the server can't answer. Either way the answer is only a draft in names; resolve() below turns it into
   real products, vendors and riders, checks the stock and the riders' daily allocation, and writes the messages. */
import { DEFAULT_DAILY_UNITS } from "./seed";
import { isActive, isAwaitingPayment, productLedger, riderLoad, totals, units as taskUnits, value as taskValue } from "./store";
import { money, num, time12, todayISO } from "./utils";

// "/" means the API is on the same site as the app (how it runs on Render); a full URL points at a separate server.
const USE_SERVER = Boolean(process.env.REACT_APP_BACKEND_URL);
const BACKEND = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");

const clean = (s) => String(s || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => clean(s).split(" ").filter((w) => w.length > 2 && !["the", "and", "for", "pcs", "with"].includes(w));
const singular = (w) => w.replace(/(ies)$/, "y").replace(/(ses|xes)$/, (m) => m.slice(0, -2)).replace(/s$/, "");

/* ---------- Matching names to what is saved ---------- */

export function findVendor(state, text) {
  const t = clean(text);
  if (!t) return null;
  let best = null, score = 0;
  for (const v of state.vendors) {
    const name = clean(v.name);
    let s = 0;
    if (t.includes(name)) s = 10;
    else {
      const parts = name.split(" ").filter((w) => w.length > 3);
      for (const w of parts) if (new RegExp(`\\b${w}`).test(t)) s += 3;
      if (parts[0] && new RegExp(`\\b${parts[0]}`).test(t)) s += 1;
    }
    if (s > score) { score = s; best = v; }
  }
  return score >= 3 ? best : null;
}

export function findProduct(state, text, vendorId = null) {
  const t = ` ${clean(text).split(" ").map(singular).join(" ")} `;
  if (!t.trim()) return null;
  let best = null, score = 0;
  for (const p of state.products) {
    if (vendorId && p.vendorId !== vendorId) continue;
    const names = [p.name, ...(p.aliases || [])].map((n) => clean(n).split(" ").map(singular).join(" "));
    let s = 0;
    for (const n of names) {
      if (t.includes(` ${n} `)) s = Math.max(s, 5 + n.length / 10);
      const ws = n.split(" ").filter((w) => w.length > 2);
      const hits = ws.filter((w) => t.includes(` ${w} `)).length;
      if (hits) s = Math.max(s, (hits / ws.length) * 4);
    }
    if (s > score) { score = s; best = p; }
  }
  return score >= 2 ? best : null;
}

export function findRider(state, text) {
  const t = clean(text);
  return state.riders.find((r) => new RegExp(`\\b${clean(r.short)}\\b`).test(t) || t.includes(clean(r.name))) || null;
}

/* ---------- Understanding a request, in the browser ---------- */

const UNIT = "(?:units?|pcs|pieces?|bottles?|bars?|pairs?|box(?:es)?|jars?|packs?|cartons?|bags?|items?|cylinders?|crates?|cases?|parcels?)";
const ITEM = new RegExp(`(\\d[\\d,]*)\\s*(?:x\\s*)?(?:(${UNIT})\\s+(?:of\\s+)?)?([a-z][a-z0-9 ,'’()\\-]*?)(?:\\s+(?:at|@|for|priced at|costing)\\s*(?:₦|n|ngn|naira)?\\s*([\\d,.]+)\\s*(k)?\\s*(?:naira)?\\s*(?:each|per\\s+\\w+|a\\s+piece|apiece)?)?\\s*$`, "i");

function parseItems(text) {
  return String(text)
    .split(/,(?!\d{3})|;|\band\b|\bplus\b|\n/i)
    .map((s) => s.replace(/^\s*(?:also|then|like|about|around|another)\s+/i, "").replace(/[.!?]+\s*$/, "").trim())
    .map((s) => s.match(ITEM))
    .filter(Boolean)
    .map((m) => ({ qty: Number(m[1].replace(/,/g, "")), unit: (m[2] || "").toLowerCase(), name: m[3].replace(/\s+(?:from|for|to|by)\b.*$/i, "").replace(/^more\s+/i, "").trim(), price: m[4] ? Number(m[4].replace(/,/g, "")) * (m[5] ? 1000 : 1) : 0 }))
    .filter((x) => x.qty > 0 && x.name);
}

function parseTime(text) {
  const m = String(text).match(/\b(?:by|at|before|around|for)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i) || String(text).match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!m) return "";
  let h = Number(m[1]);
  const min = Number(m[2] || 0);
  const ap = (m[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (!ap && h < 7) h += 12;
  if (h > 23 || min > 59) return "";
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

const STOCK_WORDS = /\b(received|receive|got|brought|dropped( off)?|sent (us|in)|gave us|came in|arrived|restock(ed)?|we have|we now have|in stock|new stock|consignment|supplied|delivered to us)\b/i;
const DISPATCH_WORDS = /\b(dispatch|assign|allocate|share|distribute|send (them )?out|go out|plan|sort out|handle|process|give (the )?riders)\b.*\b(orders?|deliver(y|ies)|riders?|today|them|it|everything|all)\b|\b(dispatch|assign) (everything|all|them)\b|\bpending orders\b/i;

function localUnderstand(state, text) {
  const t = String(text).trim();
  const low = t.toLowerCase();
  const draft = { kind: "plan", reply: "", stock: [], deliveries: [], dispatchOrders: false, messages: [] };

  // Questions about the numbers.
  if (/\?$|^(how|what|who|which|where|is|are|did|has|have|show|list)\b/i.test(t) && !STOCK_WORDS.test(t) && !/^(deliver|send|tell|message)\b/i.test(t)) {
    const answer = localAnswer(state, t);
    if (answer) return { kind: "answer", reply: answer };
  }

  // Messages to riders: "tell all riders ...", "message Tunde that ..."
  const msg = t.match(/\b(?:tell|message|text|notify|remind|inform|ping)\s+(all (?:the )?riders|all riders|everyone|the riders|riders|[a-z]+)\s*(?:that|to|:|,)?\s+(.+)$/i);
  if (msg && !/\bdeliver\b.*\bto\b/i.test(msg[2])) {
    const who = /all|everyone|riders/i.test(msg[1]) ? "all" : msg[1];
    draft.messages.push({ rider: who, text: msg[2].replace(/^[a-z]/, (c) => c.toUpperCase()) });
  }

  // Stock that came in: "GlowSkin dropped 50 serums at 12,500 each and 20 soaps"
  for (const sentence of t.split(/(?<=[.!])\s+|\n+/)) {
    if (!STOCK_WORDS.test(sentence)) continue;
    const vendor = findVendor(state, sentence);
    const body = sentence.replace(/^.*?\b(received|receive|got|brought|dropped(?: off)?|sent (?:us|in)|gave us|came in with|restocked|we have|we now have|supplied|consignment of)\b/i, "").replace(/\bfrom\s+[a-z' ]+$/i, "");
    for (const it of parseItems(body)) {
      if (vendor && clean(it.name).includes(clean(vendor.name))) continue;
      draft.stock.push({ vendor: vendor ? vendor.name : "", product: it.name, qty: it.qty, unit: it.unit, price: it.price });
    }
  }

  // One-off deliveries: "Deliver 2 serums to Ada Eze, 5 Ajao Rd, Ikeja by 3pm, give it to Tunde"
  for (const m of t.matchAll(/\b(?:deliver|send|drop|take)\s+(\d.+?)\s+to\s+(.+?)(?=(?:\.\s|\n|$|\s(?:also|then)\s+(?:deliver|send|drop|take)\b))/gi)) {
    const items = parseItems(m[1]);
    if (!items.length) continue;
    let rest = m[2];
    const rider = findRider(state, (rest.match(/\b(?:give (?:it|them) to|assign (?:it |them )?to|with|via|let)\s+([a-z]+)/i) || [])[1] || "");
    rest = rest.replace(/,?\s*\b(?:give (?:it|them) to|assign (?:it |them )?to|with|via|let)\s+[a-z]+.*$/i, "");
    const time = parseTime(rest);
    rest = rest.replace(/,?\s*\b(?:by|at|before|around)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?.*$/i, "").replace(/,?\s*\b(?:today|tomorrow)\b.*$/i, "");
    const phone = (rest.match(/(\+?\d[\d ]{9,15}\d)/) || [])[1] || "";
    rest = rest.replace(phone, "").replace(/\s*,\s*,/g, ",").trim().replace(/,$/, "");
    const [customer, ...addr] = rest.split(/,\s*|\s+at\s+/);
    draft.deliveries.push({ customer: customer.trim(), address: addr.join(", ").trim(), phone: phone.trim(), items: items.map((i) => ({ product: i.name, qty: i.qty })), time, rider: rider ? rider.short : "", vendor: "" });
  }

  if (DISPATCH_WORDS.test(low) || ((draft.stock.length || /\b(go from there|take it from here|handle it|do the rest)\b/i.test(low)) && state.orders.some((o) => o.status === "open"))) {
    draft.dispatchOrders = true;
  }

  if (!draft.stock.length && !draft.deliveries.length && !draft.messages.length && !draft.dispatchOrders) {
    const answer = localAnswer(state, t);
    if (answer) return { kind: "answer", reply: answer };
    return null;
  }
  return draft;
}

/* Answers about what is saved, only from the data. */
function localAnswer(state, text) {
  const t = text.toLowerCase();
  const vendor = findVendor(state, t);
  const product = findProduct(state, t, vendor ? vendor.id : null);
  const rider = findRider(state, t);

  const ref = t.match(/\b(dl|ord)-?\s?(\d{4})\b/i);
  if (ref) {
    const id = `${ref[1].toUpperCase()}-${ref[2]}`;
    const task = state.tasks.find((x) => x.ref === id);
    if (task) {
      const r = state.riders.find((x) => x.id === task.riderId);
      const status = { assigned: "is assigned to", picked_up: "is on the way with", delivered: "was delivered by", failed: "could not be delivered by" }[task.status];
      const paid = task.status === "delivered" ? (task.payment && task.payment.confirmed ? ` Payment of ${money(task.payment.amount)} is confirmed.` : " Payment is not confirmed yet.") : "";
      return `${id} for ${task.customer} ${status} ${r ? r.short : "a rider"}.${task.proof && task.proof.at ? ` Delivered at ${new Date(task.proof.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.` : ""}${paid}`;
    }
    const order = state.orders.find((o) => o.id === id);
    if (order) return `${id} for ${order.customer} is ${order.status === "open" ? "waiting for a rider" : "planned"}.`;
  }

  if (/awaiting|not paid|unpaid|hasn.?t paid|outstanding|owe|payment/.test(t)) {
    const list = state.tasks.filter(isAwaitingPayment);
    if (!list.length) return "Every delivered order is paid. Nothing is waiting for payment.";
    return `${list.length} delivered ${list.length === 1 ? "order is" : "orders are"} waiting for payment: ${list.map((x) => `${x.ref} ${x.customer} (${money(taskValue(x))})`).join(", ")}.`;
  }

  if (rider && /\b(where|how|doing|status|left|deliver|done|load|today)\b/.test(t)) {
    const load = riderLoad(state, rider.id);
    const next = load.tasks.filter(isActive).sort((a, b) => (a.time < b.time ? -1 : 1))[0];
    return `${rider.short} has ${load.tasks.length} drops today (${load.units} of ${rider.dailyUnits || DEFAULT_DAILY_UNITS} units). ${load.done} delivered, ${load.open} still out, ${money(load.collected)} collected.${next ? ` Next: ${next.customer} by ${time12(next.time)}.` : ""}`;
  }

  if (product && /\b(left|remain|delivered|sold|stock|how many|how much)\b/.test(t)) {
    const l = productLedger(state, product);
    return `${product.name}: ${num(l.received)} received, ${num(l.delivered)} delivered (${money(l.deliveredValue)}), ${num(l.left)} left: ${num(l.withRiders)} with riders and ${num(l.inWarehouse)} in the warehouse.${l.awaiting ? ` Payment for ${num(l.awaiting)} delivered units is still to be verified.` : ""}`;
  }

  if (vendor && /\b(left|remain|delivered|sold|stock|how many|how much|status|doing)\b/.test(t)) {
    const s = totals(state, vendor.id);
    return `${vendor.name}: ${num(s.received)} units received, ${num(s.delivered)} delivered (${money(s.deliveredValue)}), ${num(s.left)} left (${money(s.leftValue)}). ${num(s.withRiders)} are out with riders now.`;
  }

  if (/\b(low|running out|finish|reorder)\b/.test(t)) {
    const low = state.products.map((p) => [p, productLedger(state, p)]).filter(([, l]) => l.inWarehouse <= 5);
    if (!low.length) return "Nothing is running low. Every product has more than 5 units in the warehouse.";
    return `Running low in the warehouse: ${low.map(([p, l]) => `${p.name} (${l.inWarehouse} left)`).join(", ")}.`;
  }

  if (/\b(today|summary|status|how are we|overview|report|delivered|left)\b/.test(t)) {
    const s = totals(state);
    const out = state.tasks.filter((x) => x.date === todayISO());
    return `Today: ${out.length} deliveries, ${out.filter((x) => x.status === "delivered").length} delivered. Overall ${num(s.delivered)} of ${num(s.received)} units are delivered (${money(s.deliveredValue)}), ${num(s.left)} are left, ${num(s.withRiders)} are with riders and ${num(s.pendingOrders)} units are in orders waiting for a rider.`;
  }
  return "";
}

/* ---------- Asking Claude on the server ---------- */

function context(state) {
  return {
    today: todayISO(),
    vendors: state.vendors.map((v) => v.name),
    products: state.products.map((p) => {
      const l = productLedger(state, p);
      return { name: p.name, vendor: (state.vendors.find((v) => v.id === p.vendorId) || {}).name, unit: p.unit, price: p.price, in_warehouse: l.inWarehouse, left: l.left };
    }),
    riders: state.riders.map((r) => ({ name: r.short, zone: r.zone, online: r.online, units_today: riderLoad(state, r.id).units, daily_units: r.dailyUnits || DEFAULT_DAILY_UNITS })),
    open_orders: state.orders.filter((o) => o.status === "open").map((o) => ({ id: o.id, customer: o.customer, zone: o.zone, items: o.items.map((l) => `${l.qty} x ${(state.products.find((p) => p.id === l.productId) || {}).name}`).join(", ") })),
    awaiting_payment: state.tasks.filter(isAwaitingPayment).map((t) => ({ ref: t.ref, customer: t.customer, amount: taskValue(t) })),
  };
}

async function askServer(state, turns) {
  if (!USE_SERVER) return null;
  try {
    const res = await fetch(`${BACKEND}/api/ada`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: turns.slice(-8), context: context(state) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && ["plan", "answer", "other"].includes(data.kind) ? data : null;
  } catch (e) {
    return null;
  }
}

/* ---------- From a draft in names to a plan the store can save ---------- */

export function zoneOf(address, fallback = "") {
  const a = clean(address);
  const zones = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island", "Ajah", "Ikoyi", "Maryland", "Gbagada", "Apapa"];
  return zones.find((z) => a.includes(clean(z))) || (/\bvi\b/.test(a) ? "Victoria Island" : fallback);
}

export function resolve(state, draft) {
  const warnings = [];
  const stock = [];
  const deliveries = [];

  // Units still free in the warehouse, plus what this plan receives.
  const free = Object.fromEntries(state.products.map((p) => [p.id, productLedger(state, p).inWarehouse]));
  for (const s of draft.stock || []) {
    const vendor = findVendor(state, s.vendor) || null;
    const product = findProduct(state, s.product, vendor ? vendor.id : null) || (!vendor && findProduct(state, s.product));
    const vendorId = product ? product.vendorId : vendor && vendor.id;
    if (!vendorId) { warnings.push(`I couldn't tell which vendor sent the ${s.product}. Say the vendor's name and I'll add it.`); continue; }
    const qty = Math.max(0, Math.round(Number(s.qty) || 0));
    if (!qty) continue;
    if (!product && !Number(s.price)) warnings.push(`${s.product} is new for ${vendor.name}. Tell me its unit price so deliveries know what to collect (I've left it at ₦0).`);
    stock.push({ vendorId, productId: product ? product.id : null, name: product ? product.name : s.product.replace(/^[a-z]/, (c) => c.toUpperCase()), unit: product ? product.unit : singular(s.unit || "unit"), qty, price: Number(s.price) || (product ? product.price : 0), isNew: !product });
    if (product) free[product.id] = (free[product.id] || 0) + qty;
  }

  // Riders' room left today: their daily allocation minus what they already carry.
  const room = Object.fromEntries(state.riders.map((r) => [r.id, (r.dailyUnits || DEFAULT_DAILY_UNITS) - riderLoad(state, r.id).units]));
  const pickRider = (zone, need, named) => {
    if (named) return named;
    const pool = state.riders.filter((r) => r.online);
    const ranked = (pool.length ? pool : state.riders)
      .map((r) => ({ r, score: (r.zone === zone ? 100 : 0) + Math.min(room[r.id], need) * 5 + room[r.id] - (room[r.id] < need ? 200 : 0) }))
      .sort((a, b) => b.score - a.score);
    return ranked.length ? ranked[0].r : null;
  };

  const addDelivery = (d, vendorId, lines) => {
    const need = lines.reduce((s, l) => s + l.qty + (l.free || 0), 0);
    const named = d.rider ? findRider(state, d.rider) : null;
    const zone = d.zone || zoneOf(d.address);
    const rider = pickRider(zone, need, named);
    if (!rider) { warnings.push("There are no riders to assign."); return; }
    if (room[rider.id] < need) warnings.push(`${rider.short} goes over today's allocation (${rider.dailyUnits || DEFAULT_DAILY_UNITS} units) with ${d.customer}.`);
    room[rider.id] -= need;
    const price = (id) => (state.products.find((p) => p.id === id) || {}).price || 0;
    deliveries.push({
      riderId: rider.id, vendorId, customer: d.customer, phone: d.phone || "", altPhone: d.altPhone || "", address: d.address || "", landmark: d.landmark || "", zone, time: d.time || "", note: d.note || "", orderId: d.orderId || null,
      urgent: !!d.urgent, due: d.due || d.time || "", amount: d.amount ? Number(d.amount) : null,
      items: lines, units: need, value: d.amount ? Number(d.amount) : lines.reduce((s, l) => s + l.qty * price(l.productId), 0),
    });
  };

  // One-off deliveries the person described.
  for (const d of draft.deliveries || []) {
    const byVendor = {};
    for (const it of d.items || []) {
      const vendor = d.vendor ? findVendor(state, d.vendor) : null;
      const product = findProduct(state, it.product, vendor ? vendor.id : null);
      if (!product) { warnings.push(`I couldn't find "${it.product}" in stock, so it's not in the delivery to ${d.customer}.`); continue; }
      const qty = Math.round(Number(it.qty) || 0);
      if ((free[product.id] || 0) < qty) { warnings.push(`Only ${free[product.id] || 0} ${product.name} are in the warehouse; ${d.customer} asked for ${qty}.`); continue; }
      free[product.id] -= qty;
      (byVendor[product.vendorId] = byVendor[product.vendorId] || []).push({ productId: product.id, qty, name: product.name });
    }
    if (!d.customer) warnings.push("One delivery has no customer name. Add it before approving.");
    for (const [vendorId, lines] of Object.entries(byVendor)) addDelivery(d, vendorId, lines);
  }

  // Open orders from vendors, earliest window first, as far as the stock goes.
  if (draft.dispatchOrders) {
    // Urgent orders first, then the earliest window.
    const open = state.orders.filter((o) => o.status === "open").sort((a, b) => (Number(!!b.urgent) - Number(!!a.urgent)) || ((a.start || "99") < (b.start || "99") ? -1 : 1));
    const toFix = state.orders.filter((o) => o.status === "needs_fix").length;
    if (toFix) warnings.push(`${toFix} ${toFix === 1 ? "order needs" : "orders need"} fixing first (missing address, phone or amount), so I left ${toFix === 1 ? "it" : "them"} out.`);
    if (!open.length) warnings.push("There are no open orders waiting for a rider.");
    for (const o of open) {
      const short = o.items.find((l) => (free[l.productId] || 0) < l.qty + (l.free || 0));
      if (short) {
        const p = state.products.find((x) => x.id === short.productId);
        warnings.push(`${o.id} (${o.customer}) stays open: it needs ${short.qty} ${p ? p.name : "units"} and only ${free[short.productId] || 0} are in the warehouse.`);
        continue;
      }
      o.items.forEach((l) => { free[l.productId] -= l.qty + (l.free || 0); });
      const win = o.start && o.end ? `Window ${time12(o.start)}–${time12(o.end)}` : o.end ? `By ${time12(o.end)}` : "";
      addDelivery({ customer: o.customer, phone: o.phone, altPhone: o.altPhone, address: o.address, landmark: o.landmark, zone: o.zone, time: o.start || o.end || "", due: o.end || o.start || "", urgent: o.urgent, amount: o.amount,
        note: [win, o.note].filter(Boolean).join(". "), orderId: o.id },
        o.vendorId, o.items.map((l) => ({ productId: l.productId, qty: l.qty, free: l.free || 0, name: (state.products.find((p) => p.id === l.productId) || {}).name })));
    }
  }

  // Messages: what the person asked to send, plus a run sheet for every rider who gets new drops.
  const messages = [];
  for (const m of draft.messages || []) {
    const targets = /^(all|everyone|riders?)$/i.test(m.rider || "") ? state.riders.filter((r) => r.online) : [findRider(state, m.rider)].filter(Boolean);
    if (!targets.length) warnings.push(`I couldn't find a rider called ${m.rider}.`);
    for (const r of targets) messages.push({ riderId: r.id, text: m.text, from: "ada" });
  }
  const byRider = {};
  deliveries.forEach((d) => (byRider[d.riderId] = byRider[d.riderId] || []).push(d));
  for (const [riderId, list] of Object.entries(byRider)) {
    const r = state.riders.find((x) => x.id === riderId);
    const lines = list
      .sort((a, b) => (Number(!!b.urgent) - Number(!!a.urgent)) || (a.time < b.time ? -1 : 1))
      .map((d, n) => `${n + 1}) ${d.urgent ? "URGENT " : ""}${d.customer}${d.address ? `, ${d.address}` : ""}: ${d.items.map((l) => (l.qty ? `${l.qty} ${l.name}${l.free ? ` + ${l.free} free` : ""}` : `${l.free} free ${l.name}`)).join(", ")}${d.time ? ` by ${time12(d.time)}` : ""}. Collect ${money(d.value)}.`);
    const unitsN = list.reduce((s, d) => s + d.units, 0);
    messages.push({ riderId, from: "ada", text: `Hi ${r.short}, ADA here. ${list.length} new ${list.length === 1 ? "drop" : "drops"} for you today (${unitsN} ${unitsN === 1 ? "unit" : "units"}). Pick up at the warehouse.\n${lines.join("\n")}\nSnap a photo at each door and confirm payment in the app.` });
  }

  const reply = draft.reply || summary(state, stock, deliveries, messages, warnings);
  return { reply, stock, deliveries, messages, warnings };
}

function summary(state, stock, deliveries, messages, warnings) {
  const parts = [];
  if (stock.length) parts.push(`I'll add ${stock.reduce((s, x) => s + x.qty, 0)} units to stock`);
  if (deliveries.length) {
    const riders = new Set(deliveries.map((d) => d.riderId)).size;
    parts.push(`create ${deliveries.length} ${deliveries.length === 1 ? "delivery" : "deliveries"} for ${riders} ${riders === 1 ? "rider" : "riders"} worth ${money(deliveries.reduce((s, d) => s + d.value, 0))}`);
  }
  if (messages.length) parts.push(`message ${new Set(messages.map((m) => m.riderId)).size} ${new Set(messages.map((m) => m.riderId)).size === 1 ? "rider" : "riders"}`);
  if (!parts.length) return warnings.length ? "I couldn't make a plan from that yet." : "There's nothing to change.";
  const s = parts.join(", ").replace(/, ([^,]*)$/, " and $1");
  return `${s[0].toUpperCase()}${s.slice(1)}. Check it and tap Approve.`;
}

/* ---------- The one call the chat makes ---------- */

export async function askAda(state, turns) {
  const last = turns[turns.length - 1].text;
  const draft = (await askServer(state, turns)) || localUnderstand(state, last);
  if (!draft) {
    return {
      kind: "other",
      reply: "I can receive stock from vendors, turn open orders into deliveries, assign riders within their daily allocation, message riders and tell you what's delivered, paid or left. Try: \"GlowSkin dropped 40 serums at 12,500 each. Dispatch today's orders.\"",
    };
  }
  if (draft.kind === "answer" || draft.kind === "other") return { kind: draft.kind, reply: draft.reply };
  const plan = resolve(state, draft);
  if (!plan.stock.length && !plan.deliveries.length && !plan.messages.length) return { kind: "answer", reply: [plan.reply, ...plan.warnings].join(" ") };
  return { kind: "plan", reply: plan.reply, plan };
}

/* Saves an approved plan through the store, in order: stock first, then deliveries, then messages. */
export function applyPlan(act, plan) {
  if (plan.stock.length) act({ type: "stock/receive", lines: plan.stock });
  if (plan.deliveries.length) act({ type: "deliveries/create", by: "ada", deliveries: plan.deliveries.map(({ units, value, ...d }) => d) });
  if (plan.messages.length) act({ type: "messages/send", messages: plan.messages });
}

export const SUGGESTIONS = [
  ["Receive stock and dispatch", "Tell ADA what a vendor dropped off. ADA adds it and sends today's orders out.", "GlowSkin dropped 40 more serums at 12,500 each and 20 black soaps. Dispatch today's orders."],
  ["Send a one-off delivery", "Who, what, where and when. ADA picks the rider.", "Deliver 2 power banks to Ada Eze, 5 Ajao Road, Ikeja by 4pm"],
  ["Message the riders", "ADA sends it to every rider on duty.", "Tell all riders to return unsold items to the warehouse by 6pm"],
  ["Ask about the numbers", "Delivered, paid, left, with riders.", "How many serums are left?"],
];

export { taskUnits };

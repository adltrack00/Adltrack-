// One shared store for the company, vendor and rider dashboards. When the app runs with its server (as on Render) the
// data is kept there and every device hears about each change, so a delivery a rider completes on their phone shows up
// on the company and vendor dashboards at once. Without a server it is saved in this browser and shared between tabs.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { freshState } from "./seed";
import { todayISO, uid } from "./utils";

const KEY = "delivery-workspace-v5";
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("delivery-workspace") : null;

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.version === 5) return saved;
  } catch (e) { /* storage blocked: start fresh */ }
  return freshState();
}

const now = () => new Date().toISOString();
const stamp = (task, status) => ({ ...task, status, history: [...(task.history || []), { status, at: now() }] });
const mapTask = (state, id, fn) => ({ ...state, tasks: state.tasks.map((t) => (t.id === id ? fn(t) : t)) });

function reducer(state, action) {
  switch (action.type) {
    case "replace":
      return action.state;
    case "reset":
      return freshState();

    // The setup flow and the "Look" picker save the company's name, areas and dashboard look here.
    case "company/update":
      return { ...state, company: { ...state.company, ...action.patch } };

    case "vendor/add":
      return { ...state, vendors: [...state.vendors, { id: uid("v"), color: "#64748b", ...action.vendor }] };

    // A vendor drops off stock: an existing product gets more units, a new one is added with its unit price.
    case "stock/receive": {
      let products = state.products;
      const intake = [];
      for (const r of action.lines) {
        let product = r.productId && products.find((p) => p.id === r.productId);
        if (!product) {
          product = { id: uid("p"), vendorId: r.vendorId, name: r.name, unit: r.unit || "unit", price: Number(r.price) || 0, received: 0, aliases: [] };
          products = [...products, product];
        }
        const qty = Math.max(0, Math.round(Number(r.qty) || 0));
        const price = Number(r.price) || product.price;
        products = products.map((p) => (p.id === product.id ? { ...p, received: p.received + qty, price } : p));
        intake.push({ id: uid("in"), vendorId: product.vendorId, productId: product.id, qty, price, at: now(), note: r.note || "" });
      }
      return { ...state, products, intake: [...intake, ...state.intake] };
    }

    // One order from a form, or many read from a vendor's WhatsApp message.
    case "order/add": {
      const list = action.orders || [action.order];
      let n = state.orders.reduce((m, o) => Math.max(m, Number(String(o.id).replace(/\D/g, "")) || 0), 3300);
      const added = list.map((o) => ({ status: "open", createdAt: now(), date: todayISO(), ...o, id: `ORD-${(n += 1)}` }));
      return { ...state, orders: [...added, ...state.orders] };
    }
    case "order/update":
      return { ...state, orders: state.orders.map((o) => (o.id === action.id ? { ...o, ...action.patch } : o)) };
    case "order/cancel":
      return { ...state, orders: state.orders.map((o) => (o.id === action.id ? { ...o, status: "cancelled" } : o)) };

    case "deliveries/create": {
      let ref = state.nextRef;
      const created = action.deliveries.map((d) => {
        ref += 1;
        return {
          id: uid("t"), ref: `DL-${ref}`, status: "assigned", createdBy: action.by || "dispatcher", payment: null, proof: null,
          history: [{ status: "assigned", at: now() }], date: todayISO(), ...d,
          items: d.items.map((l) => ({ productId: l.productId, qty: l.qty, free: l.free || 0, price: (state.products.find((p) => p.id === l.productId) || {}).price || 0 })),
        };
      });
      const planned = new Set(action.deliveries.map((d) => d.orderId).filter(Boolean));
      return {
        ...state,
        nextRef: ref,
        tasks: [...created, ...state.tasks],
        orders: state.orders.map((o) => (planned.has(o.id) ? { ...o, status: "planned" } : o)),
      };
    }

    case "messages/send":
      return {
        ...state,
        messages: [
          ...state.messages,
          ...action.messages.map((m) => ({ id: uid("m"), at: now(), read: false, from: "dispatcher", ...m })),
        ],
      };
    case "messages/read":
      return { ...state, messages: state.messages.map((m) => (m.riderId === action.riderId && m.from !== "rider" ? { ...m, read: true } : m)) };

    case "task/pickup":
      return mapTask(state, action.id, (t) => stamp(t, "picked_up"));
    // The rider collects everything for the day from the office in one go.
    case "task/pickupAll": {
      const ids = new Set(action.ids);
      return { ...state, tasks: state.tasks.map((t) => (ids.has(t.id) && t.status === "assigned" ? stamp(t, "picked_up") : t)) };
    }
    case "task/confirmPayments": {
      const ids = new Set(action.ids);
      return { ...state, tasks: state.tasks.map((t) => (ids.has(t.id) ? { ...t, payment: { ...(t.payment || {}), confirmed: true, at: now() } } : t)) };
    }
    // A failed delivery the office has dealt with: sent again or returned to stock.
    case "task/handled":
      return mapTask(state, action.id, (t) => ({ ...t, handled: action.how || "returned" }));
    case "task/deliver":
      return mapTask(state, action.id, (t) => ({
        ...stamp(t, "delivered"),
        proof: { photo: action.photo || null, receivedBy: action.receivedBy || "", note: action.note || "", at: now() },
        payment: { method: action.method, amount: Number(action.amount) || 0, confirmed: !!action.confirmed, at: action.confirmed ? now() : null },
      }));
    case "task/confirmPayment":
      return mapTask(state, action.id, (t) => ({ ...t, payment: { ...(t.payment || {}), confirmed: true, at: now() } }));
    case "task/fail":
      return mapTask(state, action.id, (t) => ({ ...stamp(t, "failed"), failReason: action.reason || "" }));
    case "task/reassign":
      return mapTask(state, action.id, (t) => ({ ...t, riderId: action.riderId }));

    case "rider/online":
      return { ...state, riders: state.riders.map((r) => (r.id === action.id ? { ...r, online: action.online } : r)) };

    default:
      return state;
  }
}

// Changes made here drop the "came from another tab" mark, so they are saved and shared again.
function root(state, action) {
  const next = reducer(state, action);
  if (action.type !== "replace" && next.__from) {
    const { __from, ...rest } = next;
    return rest;
  }
  return next;
}

const Ctx = createContext(null);

// With a server (REACT_APP_BACKEND_URL, "/" on Render) the workspace lives there and every device shares it.
// Without one (plain `yarn start`) it stays in this browser, shared between its tabs.
const USE_SERVER = Boolean(process.env.REACT_APP_BACKEND_URL);
const SERVER = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const REV_KEY = `${KEY}-rev`;

function loadRev() {
  try { return Number(localStorage.getItem(REV_KEY)) || 0; } catch (e) { return 0; }
}

export function WorkspaceProvider({ children }) {
  return USE_SERVER ? React.createElement(ServerWorkspace, null, children) : React.createElement(LocalWorkspace, null, children);
}

function LocalWorkspace({ children }) {
  const [state, dispatch] = useReducer(root, undefined, load);

  // Save every change and tell other open tabs.
  useEffect(() => {
    if (state.__from === "remote") return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* full or blocked */ }
    if (channel) channel.postMessage(state);
  }, [state]);

  // Pick up changes made in other tabs (the rider's phone view, the vendor view).
  useEffect(() => {
    const apply = (next) => next && next.version === 5 && dispatch({ type: "replace", state: { ...next, __from: "remote" } });
    const onStorage = (e) => { if (e.key === KEY && e.newValue) { try { apply(JSON.parse(e.newValue)); } catch (err) { /* ignore */ } } };
    const onMessage = (e) => apply(e.data);
    window.addEventListener("storage", onStorage);
    if (channel) channel.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (channel) channel.removeEventListener("message", onMessage);
    };
  }, []);

  const act = useCallback((action) => dispatch(action), []);
  const value = useMemo(() => ({ state, act, sync: "local" }), [state, act]);
  return React.createElement(Ctx.Provider, { value }, children);
}

/* The server holds the one copy. A change shows here at once, then is sent with the revision it was made on. If
   someone saved first, the server sends back its newer copy and the change is applied again on top of it, so nobody's
   delivery or order is lost. Every page hears about new revisions and fetches them. */
function ServerWorkspace({ children }) {
  const sync = useRef(null);
  if (!sync.current) {
    const state = load();
    sync.current = { base: { rev: loadRev(), state }, view: state, pending: [], sending: false, latest: 0, ready: false, retry: null };
  }
  const [, render] = useReducer((n) => n + 1, 0);
  const [status, setStatus] = useState("connecting");

  const cache = (s) => {
    try { localStorage.setItem(KEY, JSON.stringify(s.view)); localStorage.setItem(REV_KEY, String(s.base.rev)); } catch (e) { /* full or blocked */ }
  };

  const adopt = useCallback((rev, state) => {
    const s = sync.current;
    s.base = { rev, state };
    s.view = s.pending.reduce(root, state);
    cache(s);
    render();
  }, []);

  const flush = useCallback(async () => {
    const s = sync.current;
    if (!s.ready || s.sending || !s.pending.length) return;
    s.sending = true;
    setStatus("saving");
    const sent = s.pending.length;
    const snapshot = s.view;
    try {
      const res = await fetch(`${SERVER}/api/workspace`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base_rev: s.base.rev, state: snapshot }) });
      if (res.status === 409) {
        const fresh = await res.json();
        adopt(fresh.rev, fresh.state && fresh.state.version === 5 ? fresh.state : freshState());
      } else if (res.ok) {
        const { rev } = await res.json();
        s.base = { rev, state: snapshot };
        s.pending = s.pending.slice(sent);
        cache(s);
      } else {
        throw new Error(`save failed ${res.status}`);
      }
      s.sending = false;
      setStatus("live");
    } catch (e) {
      s.sending = false;
      setStatus("offline");
      clearTimeout(s.retry);
      s.retry = setTimeout(() => flush(), 4000);
      return;
    }
    if (s.pending.length) flush();
    else if (s.latest > s.base.rev) pull();
  }, [adopt]); // eslint-disable-line react-hooks/exhaustive-deps

  const pull = useCallback(async () => {
    const s = sync.current;
    try {
      const res = await fetch(`${SERVER}/api/workspace`, { cache: "no-store" });
      if (!res.ok) throw new Error(`load failed ${res.status}`);
      const { rev, state } = await res.json();
      if (s.sending) return; // the save in flight will catch up
      if (!state || state.version !== 5) {
        // A brand new server: this browser's copy (or the demo data) becomes the shared one.
        s.ready = true;
        s.base = { rev, state: s.base.state };
        if (!s.pending.length) s.pending = [{ type: "replace", state: s.view }];
        flush();
        return;
      }
      s.ready = true;
      adopt(rev, state);
      setStatus("live");
      flush();
    } catch (e) {
      setStatus("offline");
      clearTimeout(s.retry);
      s.retry = setTimeout(() => pullRef.current(), 4000);
    }
  }, [adopt, flush]);
  const pullRef = useRef(pull);
  pullRef.current = pull;

  useEffect(() => {
    let es;
    let timer;
    const connect = () => {
      es = new EventSource(`${SERVER}/api/workspace/stream`);
      es.onmessage = (e) => {
        const rev = Number(e.data) || 0;
        const s = sync.current;
        s.latest = Math.max(s.latest, rev);
        if (!s.ready || (rev > s.base.rev && !s.sending)) pull();
      };
      es.onerror = () => {
        setStatus("offline");
        es.close();
        timer = setTimeout(connect, 3000);
      };
    };
    pull();
    connect();
    const onFocus = () => pull();
    window.addEventListener("focus", onFocus);
    return () => {
      if (es) es.close();
      clearTimeout(timer);
      clearTimeout(sync.current.retry);
      window.removeEventListener("focus", onFocus);
    };
  }, [pull]);

  const act = useCallback((action) => {
    const s = sync.current;
    s.view = root(s.view, action);
    s.pending.push(action);
    cache(s);
    render();
    flush();
  }, [flush]);

  const state = sync.current.view;
  const value = useMemo(() => ({ state, act, sync: status }), [state, act, status]);
  return React.createElement(Ctx.Provider, { value }, children);
}

export function useWorkspace() {
  return useContext(Ctx);
}

/* ---------- The ledger: the numbers every dashboard shows ---------- */

// A unit counts as delivered once the rider confirms the delivery and the amount collected (ops manual, section 7).
// Whether that money has reached the company account is checked separately (section 8).
export const isDelivered = (t) => t.status === "delivered";
export const isPaid = (t) => t.status === "delivered" && t.payment && t.payment.confirmed;
export const isAwaitingPayment = (t) => t.status === "delivered" && !(t.payment && t.payment.confirmed);
export const isActive = (t) => t.status === "assigned" || t.status === "picked_up";
// Units count free items too (they leave the warehouse); the value is what the customer pays: the amount the vendor
// set for the order when there is one, otherwise the list price of the paid units.
export const units = (t) => t.items.reduce((s, l) => s + l.qty + (l.free || 0), 0);
export const value = (t) => (t.amount != null && t.amount !== "" ? Number(t.amount) : t.items.reduce((s, l) => s + l.qty * (l.price || 0), 0));
export const orderValue = (state, o) => (o.amount ? Number(o.amount) : o.items.reduce((s, l) => s + l.qty * ((state.products.find((p) => p.id === l.productId) || {}).price || 0), 0));

// Per product: received from the vendor, delivered, with riders, left, in the warehouse, and delivered units whose payment is still to verify.
export function productLedger(state, product) {
  const out = { received: product.received, delivered: 0, deliveredValue: 0, withRiders: 0, awaiting: 0, pendingOrders: 0 };
  for (const t of state.tasks) {
    for (const l of t.items) {
      if (l.productId !== product.id) continue;
      const n = l.qty + (l.free || 0);
      if (isDelivered(t)) {
        out.delivered += n;
        out.deliveredValue += l.qty * (l.price || product.price);
        if (isAwaitingPayment(t)) out.awaiting += n;
      } else if (isActive(t)) out.withRiders += n;
    }
  }
  for (const o of state.orders) if (o.status === "open" || o.status === "needs_fix") for (const l of o.items) if (l.productId === product.id) out.pendingOrders += l.qty + (l.free || 0);
  out.left = out.received - out.delivered;
  out.inWarehouse = Math.max(0, out.left - out.withRiders);
  out.receivedValue = out.received * product.price;
  out.leftValue = out.left * product.price;
  return out;
}

export function totals(state, vendorId = null) {
  const products = state.products.filter((p) => !vendorId || p.vendorId === vendorId);
  const sum = { received: 0, delivered: 0, deliveredValue: 0, withRiders: 0, awaiting: 0, awaitingValue: 0, left: 0, leftValue: 0, inWarehouse: 0, pendingOrders: 0, receivedValue: 0 };
  for (const p of products) {
    const l = productLedger(state, p);
    for (const k of Object.keys(sum)) if (k in l) sum[k] += l[k];
  }
  for (const t of state.tasks) if (isAwaitingPayment(t) && (!vendorId || t.vendorId === vendorId)) sum.awaitingValue += value(t);
  return sum;
}

export function riderLoad(state, riderId, date = todayISO()) {
  const today = state.tasks.filter((t) => t.riderId === riderId && t.date === date);
  return {
    tasks: today,
    units: today.filter((t) => t.status !== "failed").reduce((s, t) => s + units(t), 0),
    open: today.filter(isActive).length,
    done: today.filter((t) => t.status === "delivered").length,
    collected: today.filter(isDelivered).reduce((s, t) => s + ((t.payment && t.payment.amount) || 0), 0),
  };
}

// "2 × Black soap bar + 1 free", or "1 free Black soap bar" when the whole line is a giveaway.
export function lineLabel(state, l) {
  const name = (state.products.find((p) => p.id === l.productId) || {}).name || "item";
  if (!l.qty && l.free) return `${l.free} free ${name}`;
  return `${l.qty} × ${name}${l.free ? ` + ${l.free} free` : ""}`;
}

export const productById = (state, id) => state.products.find((p) => p.id === id);
export const vendorById = (state, id) => state.vendors.find((v) => v.id === id);
export const riderById = (state, id) => state.riders.find((r) => r.id === id);

export function feed(state, vendorId = null) {
  const events = [];
  for (const t of state.tasks) {
    if (vendorId && t.vendorId !== vendorId) continue;
    for (const h of t.history || []) events.push({ kind: h.status, at: h.at, task: t });
    if (t.payment && t.payment.confirmed && t.payment.at) events.push({ kind: "paid", at: t.payment.at, task: t });
  }
  for (const i of state.intake) if (!vendorId || i.vendorId === vendorId) events.push({ kind: "intake", at: i.at, intake: i });
  return events.sort((a, b) => (a.at < b.at ? 1 : -1));
}

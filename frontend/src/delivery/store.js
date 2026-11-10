// One shared store for the company, vendor and rider dashboards. The data is kept on the server, one workspace per
// company, and every signed-in device hears about each change, so a delivery a rider completes on their phone shows up
// on the company and vendor dashboards at once. Each person gets only their part (see backend/access.py).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import { api, serverUrl } from "./auth";
import { freshState } from "./seed";
import { todayISO, uid } from "./utils";

export const emptyState = (company = {}) => ({
  version: 5, company: { name: "", dispatcher: "", city: "", ...company },
  vendors: [], riders: [], products: [], intake: [], orders: [], tasks: [], messages: [], nextRef: 1000,
});

// This device keeps the last copy it saw, so the app opens at once and works on a weak signal.
function load(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (saved && saved.version === 5) return saved;
  } catch (e) { /* storage blocked: start fresh */ }
  return null;
}
const COLORS = ["#f97316", "#0ea5e9", "#10b981", "#8b5cf6", "#ef4444", "#eab308", "#14b8a6", "#ec4899"];

const now = () => new Date().toISOString();
const stamp = (task, status) => ({ ...task, status, history: [...(task.history || []), { status, at: now() }] });
const mapTask = (state, id, fn) => ({ ...state, tasks: state.tasks.map((t) => (t.id === id ? fn(t) : t)) });

function reducer(state, action) {
  switch (action.type) {
    case "replace":
      return action.state;

    // The setup flow and the "Look" picker save the company's name, areas and dashboard look here.
    case "company/update":
      return { ...state, company: { ...state.company, ...action.patch } };

    case "vendor/add":
      return { ...state, vendors: [...state.vendors, { id: action.id || uid("v"), color: COLORS[state.vendors.length % COLORS.length], ...action.vendor }] };
    case "vendor/update":
      return { ...state, vendors: state.vendors.map((v) => (v.id === action.id ? { ...v, ...action.patch } : v)) };
    case "rider/add": {
      const r = action.rider;
      return { ...state, riders: [...state.riders, { id: action.id || uid("r"), short: (r.name || "").split(" ")[0], online: false, dailyUnits: 10, color: COLORS[state.riders.length % COLORS.length], vehicle: "Bike", ...r }] };
    }
    case "rider/update":
      return { ...state, riders: state.riders.map((r) => (r.id === action.id ? { ...r, ...action.patch, short: (action.patch.name || r.name || "").split(" ")[0] } : r)) };

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
      const added = list.map((o) => ({ status: "open", createdAt: now(), date: todayISO(), placedBy: action.actor || "company", ...o, id: `ORD-${(n += 1)}` }));
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
    // Marks one conversation read by one side: by "rider" or "vendor" (what the office sent), or by "company"
    // (what that rider or vendor sent).
    case "messages/read": {
      const by = action.by || "rider";
      const inThread = (m) => (action.vendorId ? m.vendorId === action.vendorId : m.riderId === action.riderId);
      const theirs = (m) => (by === "company" ? m.from === "rider" || m.from === "vendor" : m.from !== by);
      return { ...state, messages: state.messages.map((m) => (inThread(m) && theirs(m) && !m.read ? { ...m, read: true } : m)) };
    }

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

/* The server holds the one copy. A change shows here at once, then is sent with the revision it was made on. If
   someone saved first, the server sends back its newer copy and the change is applied again on top of it, so nobody's
   delivery or order is lost. Every page hears about new revisions and fetches them. */
export function WorkspaceProvider({ user, onExpired, children }) {
  const KEY = `delivery-ws-${user.id}`;
  const REV_KEY = `${KEY}-rev`;
  const sync = useRef(null);
  if (!sync.current) {
    const cached = load(KEY);
    let rev = 0;
    try { rev = cached ? Number(localStorage.getItem(REV_KEY)) || 0 : 0; } catch (e) { /* blocked */ }
    const state = cached || emptyState();
    sync.current = { base: { rev, state }, view: state, pending: [], sending: false, latest: 0, ready: false, loaded: !!cached, retry: null };
  }
  const [, render] = useReducer((n) => n + 1, 0);
  const [status, setStatus] = useState("connecting");
  const expired = useRef(onExpired);
  expired.current = onExpired;

  const cache = (s) => {
    try { localStorage.setItem(KEY, JSON.stringify(s.view)); localStorage.setItem(REV_KEY, String(s.base.rev)); } catch (e) { /* full or blocked */ }
  };

  const adopt = useCallback((rev, state) => {
    const s = sync.current;
    s.base = { rev, state };
    s.view = s.pending.reduce(root, state);
    s.loaded = true;
    cache(s);
    render();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flush = useCallback(async () => {
    const s = sync.current;
    if (!s.ready || s.sending || !s.pending.length) return;
    s.sending = true;
    setStatus("saving");
    const sent = s.pending.length;
    const snapshot = s.view;
    try {
      const saved = await api("/api/workspace", { method: "PUT", body: { base_rev: s.base.rev, state: snapshot } });
      s.pending = s.pending.slice(sent);
      adopt(saved.rev, saved.state);
      s.sending = false;
      setStatus("live");
    } catch (e) {
      s.sending = false;
      if (e.status === 409 && e.body && e.body.state) {
        adopt(e.body.rev, e.body.state); // someone saved first: our changes are re-applied on top
      } else if (e.status === 403 && e.body && e.body.state) {
        s.pending = [];
        adopt(e.body.rev, e.body.state);
        toast.error(e.message || "Your account can't make that change.");
        setStatus("live");
        return;
      } else if (e.status === 401) {
        expired.current && expired.current();
        return;
      } else if (e.status === 400 || e.status === 413) {
        s.pending = [];
        adopt(s.base.rev, s.base.state);
        toast.error(e.message);
        setStatus("live");
        return;
      } else {
        setStatus("offline");
        clearTimeout(s.retry);
        s.retry = setTimeout(() => flush(), 4000);
        return;
      }
    }
    if (s.pending.length) flush();
    else if (s.latest > s.base.rev) pullRef.current();
  }, [adopt]); // eslint-disable-line react-hooks/exhaustive-deps

  const pull = useCallback(async () => {
    const s = sync.current;
    try {
      const { rev, state } = await api("/api/workspace");
      if (s.sending) return; // the save in flight will catch up
      s.ready = true;
      adopt(rev, state && state.version === 5 ? state : emptyState());
      setStatus("live");
      flush();
    } catch (e) {
      if (e.status === 401) { expired.current && expired.current(); return; }
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
    let closed = false;
    const connect = () => {
      if (closed) return;
      es = new EventSource(serverUrl("/api/workspace/stream"), { withCredentials: true });
      es.onmessage = (e) => {
        const rev = Number(e.data) || 0;
        const s = sync.current;
        s.latest = Math.max(s.latest, rev);
        if (!s.ready || (rev > s.base.rev && !s.sending)) pull();
      };
      es.onerror = () => {
        setStatus("offline");
        es.close();
        clearTimeout(timer);
        timer = setTimeout(() => { pull(); connect(); }, 3000);
      };
    };
    pull();
    connect();
    const onFocus = () => pull();
    const onVisible = () => { if (document.visibilityState === "visible") pull(); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      closed = true;
      if (es) es.close();
      clearTimeout(timer);
      clearTimeout(sync.current.retry);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pull]);

  const act = useCallback((raw) => {
    const action = { ...raw, actor: user.role };
    const s = sync.current;
    s.view = root(s.view, action);
    s.pending.push(action);
    cache(s);
    render();
    flush();
  }, [flush, user.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // The demo can be put back to its sample data (for everyone using the demo).
  const resetDemo = useCallback(async () => {
    await api("/api/workspace/reset-demo", { method: "POST", body: { seed: freshState() } });
    sync.current.pending = [];
    await pull();
  }, [pull]);

  const state = sync.current.view;
  const loaded = sync.current.loaded;
  const fresh = sync.current.ready; // the server has answered at least once (not just this device's last copy)
  const value = useMemo(() => ({ state, act, sync: status, loaded, fresh, resetDemo, user }), [state, act, status, loaded, fresh, resetDemo, user]);
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

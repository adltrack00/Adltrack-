// Live alerts: when something happens on another device that this person should know about, it pops up here
// (and as a phone notification if they allowed it and the app is in the background).
//   Company: a vendor placed orders, a drop was delivered or failed, a rider or vendor wrote.
//   Vendor:  their drops are picked up, delivered (with the amount) or failed, the office wrote.
//   Rider:   new drops were assigned, the office wrote.
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useWorkspace } from "./store";
import { money } from "./utils";

function snapshot(state) {
  return {
    tasks: new Map(state.tasks.map((t) => [t.id, t.status])),
    paid: new Set(state.tasks.filter((t) => t.payment && t.payment.confirmed).map((t) => t.id)),
    orders: new Set(state.orders.map((o) => o.id)),
    messages: new Set(state.messages.map((m) => m.id)),
  };
}

const amount = (t) => (t.payment && t.payment.amount ? ` · ${money(t.payment.amount)} ${t.payment.method || ""}`.trimEnd() : "");

export function alertsFor(prev, state, role) {
  const out = [];
  const vendorName = (id) => (state.vendors.find((v) => v.id === id) || {}).name || "A vendor";
  const riderName = (id) => (state.riders.find((r) => r.id === id) || {}).short || "Your rider";
  for (const t of state.tasks) {
    const before = prev.tasks.get(t.id);
    if (before === t.status) continue;
    if (before === undefined) {
      if (role === "rider") out.push(["info", "New drop for you", `${t.customer}, ${t.address || t.zone || ""}`.replace(/, $/, "")]);
      continue;
    }
    if (t.status === "delivered" && role !== "rider") out.push(["success", `Delivered to ${t.customer}`, `${t.ref} by ${riderName(t.riderId)}${amount(t)}`]);
    if (t.status === "failed" && role !== "rider") out.push(["error", `Not delivered: ${t.customer}`, `${t.ref}: ${t.failReason || "rider reported a problem"}`]);
    if (t.status === "picked_up" && role === "vendor") out.push(["info", `On the way to ${t.customer}`, `${t.ref} picked up by ${riderName(t.riderId)}`]);
  }
  if (role === "vendor") {
    for (const t of state.tasks) if (t.payment && t.payment.confirmed && !prev.paid.has(t.id) && prev.tasks.get(t.id) === "delivered") out.push(["success", "Payment verified", `${t.ref} · ${t.customer}${amount(t)}`]);
  }
  if (role === "company") {
    const placed = state.orders.filter((o) => !prev.orders.has(o.id) && o.placedBy === "vendor");
    const byVendor = placed.reduce((m, o) => ({ ...m, [o.vendorId]: (m[o.vendorId] || 0) + 1 }), {});
    for (const [vid, n] of Object.entries(byVendor)) out.push(["info", `${vendorName(vid)} sent ${n} new ${n === 1 ? "order" : "orders"}`, "They're waiting in Today"]);
  }
  for (const m of state.messages) {
    if (prev.messages.has(m.id)) continue;
    const mine = role === "company" ? m.from === "dispatcher" || m.from === "ada" : m.from === role;
    if (mine) continue;
    const who = role === "company" ? (m.from === "vendor" ? vendorName(m.vendorId) : riderName(m.riderId)) : m.from === "ada" ? "ADA" : "The office";
    out.push(["message", who, m.text]);
  }
  return out;
}

export function LiveAlerts() {
  const { state, user } = useWorkspace();
  const prev = useRef(null);
  useEffect(() => {
    if (!prev.current) { prev.current = snapshot(state); return; }
    const list = alertsFor(prev.current, state, user.role);
    prev.current = snapshot(state);
    for (const [kind, title, body] of list.slice(0, 4)) {
      const fn = kind === "success" ? toast.success : kind === "error" ? toast.error : toast;
      fn(title, { description: body, duration: 6000 });
      notify(title, body);
    }
    if (list.length && user.role === "rider" && navigator.vibrate) { try { navigator.vibrate(150); } catch (e) { /* not supported */ } }
  }, [state, user.role]);
  return null;
}

function notify(title, body) {
  try {
    if (document.visibilityState === "visible" || !("Notification" in window) || Notification.permission !== "granted") return;
    const opts = { body, icon: "/icon-192.png", badge: "/icon-192.png" };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, opts)).catch(() => new Notification(title, opts));
    } else new Notification(title, opts);
  } catch (e) { /* not supported */ }
}

export function askForNotifications() {
  try { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission(); } catch (e) { /* not supported */ }
}

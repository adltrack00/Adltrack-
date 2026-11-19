// Day records: tap a day and see exactly what happened. Who collected, who delivered what to whom and at what time,
// the doorstep photos, the money, and the WhatsApp conversation from that day. A day still to come shows what is
// planned. The same screen sits on the company, vendor and rider dashboards, each seeing only their own part, and the
// links ADA sends on WhatsApp ("RECORD", the end-of-day wrap) open it at the right day.
// On the company's dashboard every person who took part that day is listed (riders, vendors, the office team on
// WhatsApp, customers). Tap one and their whole day opens: every action and the exact WhatsApp transcript, in time
// order, ready to download.
import React, { useMemo, useState } from "react";
import {
  AlertTriangle, Banknote, Bike, Boxes, CalendarClock, Camera, Check, ChevronLeft, ChevronRight, ClipboardPaste, Clock, Download, Image as ImageIcon, MapPin, MessageCircle, Package, PackageCheck, RotateCcw, ThumbsUp, Truck, Wallet, X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { collectedOf, lineLabel, riderById, units, value as taskValue, vendorById, vendorPayable } from "./store";
import { Avatar, Card, Chips, Empty, Modal, StatusPill, statusOf } from "./ui";
import { clock, money, num, time12, todayISO } from "./utils";

const dayOf = (iso) => {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : todayISO(d);
};
const longDay = (day) => new Date(`${day}T12:00`).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortDay = (day) => new Date(`${day}T12:00`).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
const first = (s) => String(s || "").split(" ")[0];
const itemsOf = (state, t) => (t.items || []).map((l) => lineLabel(state, l)).join(", ");
const viaOf = (via) => (via === "whatsapp" ? "WhatsApp" : via === "app" ? "App" : "");
const historyAt = (t, status) => ((t.history || []).filter((h) => h.status === status).pop() || {});
// Phone numbers as WhatsApp writes them (2348020004411): how a customer's chat is keyed.
export const digitsOf = (p) => { let d = String(p || "").replace(/\D/g, ""); if (d.length === 11 && d.startsWith("0")) d = `234${d.slice(1)}`; return d; };
// Which conversation a message belongs to.
export const threadKeyOf = (m) => (m.staffId ? `staff:${m.staffId}` : m.customerId ? `customer:${m.customerId}` : m.riderId ? `rider:${m.riderId}` : m.vendorId ? `vendor:${m.vendorId}` : "");
// What a message is allowed to show on this dashboard: the company sees every conversation; a rider or vendor their own.
const msgInScope = (scope, m) => (scope.role === "company" ? !!threadKeyOf(m) : inScope(scope, m) && !m.staffId && !m.customerId);

// What this dashboard may see: everything (company), one vendor's drops and stock, or one rider's drops.
function inScope(scope, x) {
  if (scope.role === "vendor") return x.vendorId === scope.id;
  if (scope.role === "rider") return x.riderId === scope.id;
  return true;
}

// The day's drops: the ones due that day, and any older drop something happened to that day.
export function dropsOn(state, day, scope) {
  return state.tasks.filter((t) => inScope(scope, t) && (t.date === day || (t.history || []).some((h) => dayOf(h.at) === day)));
}

// Everything that happened on a day, oldest first, each with who did it and how (app or WhatsApp).
export function dayEntries(state, day, scope) {
  const out = [];
  const rider = (id) => riderById(state, id) || {};
  const vendor = (id) => vendorById(state, id) || {};
  const add = (at, e) => { if (dayOf(at) === day) out.push({ at, ...e }); };
  state.tasks.filter((t) => inScope(scope, t)).forEach((t) => {
    const r = rider(t.riderId);
    const who = { name: r.name || "No rider", color: r.color, riderId: t.riderId };
    (t.history || []).forEach((h, i) => {
      const base = { id: `${t.id}-${i}`, task: t, via: h.via };
      if (h.status === "assigned") add(h.at, { ...base, kind: "assigned", icon: Truck, tone: "sky", title: `${t.ref} for ${t.customer} given to ${first(r.name) || "a rider"}`, sub: `${itemsOf(state, t)} · collect ${money(taskValue(t))}`, who: t.by && t.by.name ? { name: t.by.name, id: t.by.id } : { name: t.createdBy === "ada" ? "ADA" : "The office" } });
      if (h.status === "picked_up") add(h.at, { ...base, kind: "picked_up", icon: Package, tone: "sky", title: `${first(r.name)} collected ${t.ref} at the office`, sub: `${num(units(t))} ${units(t) === 1 ? "unit" : "units"} for ${t.customer}`, who });
      if (h.status === "delivered") {
        const pay = t.payment || {};
        const proof = t.proof || {};
        add(h.at, {
          ...base, kind: "delivered", icon: PackageCheck, tone: "green", via: h.via || proof.via,
          title: `${t.ref} delivered to ${t.customer}`,
          sub: `${itemsOf(state, t)} · ${pay.method === "unpaid" ? "not paid at the door" : `${money(collectedOf(t))} ${pay.method || ""}`}${proof.receivedBy ? ` · received by ${proof.receivedBy}` : ""}`,
          photo: proof.photo, photoPending: proof.photoPending, who,
        });
      }
      if (h.status === "failed") add(h.at, { ...base, kind: "failed", icon: AlertTriangle, tone: "rose", title: `${t.ref} not delivered to ${t.customer}`, sub: t.failReason || "No reason given", who });
    });
    if (t.acceptedAt) add(t.acceptedAt, { id: `${t.id}-acc`, task: t, kind: "accepted", icon: Bike, tone: "sky", via: t.acceptedVia, title: `${first(r.name)} accepted ${t.ref}`, sub: t.customer, who });
    if (t.declined && t.declined.at) add(t.declined.at, { id: `${t.id}-dec`, task: t, kind: "declined", icon: AlertTriangle, tone: "amber", title: `${first(r.name)} turned down ${t.ref}`, sub: (t.declined.reasons || []).join(", "), who });
    if (t.arrivedAt) add(t.arrivedAt, { id: `${t.id}-arr`, task: t, kind: "arrived", icon: MapPin, tone: "sky", via: t.arrivedVia, title: `${first(r.name)} arrived at ${t.customer}'s`, sub: t.address, who });
    const pay = t.payment || {};
    if (pay.handedIn && pay.handedIn.at) add(pay.handedIn.at, { id: `${t.id}-hand`, task: t, kind: "money", icon: Banknote, tone: "amber", via: pay.handedIn.via, title: `${first(r.name)} paid in ${money(collectedOf(t))} cash for ${t.ref}`, sub: pay.handedIn.ref ? `Ref ${pay.handedIn.ref}` : "", who });
    if (pay.handInVerified) add(pay.handInVerified, { id: `${t.id}-ok`, task: t, kind: "money", icon: Check, tone: "green", title: `Cash for ${t.ref} found in the bank`, who: { name: "The office" } });
    if (t.settled && t.settled.at && scope.role !== "rider") add(t.settled.at, { id: `${t.id}-set`, task: t, kind: "money", icon: Wallet, tone: "green", via: t.settled.by && t.settled.by.via, title: `${vendor(t.vendorId).name || "Vendor"} paid ${money(vendorPayable(state, t))} for ${t.ref}`, sub: t.settled.ref ? `Ref ${t.settled.ref}` : "", who: t.settled.by && t.settled.by.name ? { name: t.settled.by.name, id: t.settled.by.id } : { name: "The office" } });
    // What the customer said on WhatsApp about this drop.
    const cust = { name: t.customer || "Customer", customer: digitsOf(t.phone) };
    if (t.proof && t.proof.customerConfirmed) add(t.proof.customerConfirmed, { id: `${t.id}-conf`, task: t, kind: "customer", icon: ThumbsUp, tone: "green", via: "whatsapp", title: `${t.customer} confirmed they got ${t.ref}`, who: cust });
    if (t.customerIssue && t.customerIssue.text) add(t.customerIssue.at, { id: `${t.id}-issue`, task: t, kind: "customer", icon: AlertTriangle, tone: "rose", via: "whatsapp", title: `${t.customer} reported a problem with ${t.ref}`, sub: t.customerIssue.text, who: cust });
    if (t.rescheduled && t.rescheduled.at) add(t.rescheduled.at, { id: `${t.id}-move`, task: t, kind: "customer", icon: RotateCcw, tone: "amber", via: "whatsapp", title: `${t.customer} moved ${t.ref}${t.rescheduled.to ? ` to ${shortDay(t.rescheduled.to)}` : ""}${t.rescheduled.time ? ` after ${time12(t.rescheduled.time)}` : ""}`, sub: t.rescheduled.text ? `“${t.rescheduled.text}”` : "", who: cust });
  });
  if (scope.role !== "rider") {
    state.orders.filter((o) => inScope(scope, o)).forEach((o) => {
      const v = vendor(o.vendorId);
      add(o.createdAt, { id: `${o.id}-new`, order: o, kind: "order", icon: ClipboardPaste, tone: "stone", via: o.via, title: `${o.id} for ${o.customer || "a customer"} sent in`, sub: `${(o.items || []).map((l) => lineLabel(state, l)).join(", ")}${scope.role === "company" && v.name ? ` · ${v.name}` : ""}`, who: { name: (o.by && o.by.name) || (o.placedBy === "vendor" ? v.contact || v.name : "The office") } });
    });
    (state.intake || []).filter((i) => inScope(scope, i) && i.status !== "cancelled").forEach((i) => {
      const p = state.products.find((x) => x.id === i.productId) || {};
      add(i.at, { id: `${i.id}-in`, vendorId: i.vendorId, kind: "stock", icon: Boxes, tone: "amber", via: i.note === "Sent on WhatsApp" ? "whatsapp" : "", title: `${i.status === "sent" ? "Stock on the way" : "Stock received"}: ${num(i.qty)} × ${p.name || "item"}`, sub: scope.role === "company" ? vendor(i.vendorId).name : "", who: { name: (i.by && i.by.name) || "The office" } });
      if (i.countedAt) add(i.countedAt, { id: `${i.id}-count`, vendorId: i.vendorId, via: i.countedVia, kind: "stock", icon: Check, tone: "green", title: `Counted in ${num(i.qty)} × ${p.name || "item"}`, who: { name: i.countedBy || "The office" } });
    });
  }
  return out.sort((a, b) => (a.at < b.at ? -1 : 1));
}

// Everyone who took part in a day: each rider, vendor, member of the office team on WhatsApp and customer, with what
// they did and when they were first and last active. A rider's or vendor's own dashboard lists only the riders.
function keysOfEntry(e) {
  const k = [];
  const t = e.task;
  if (t && t.riderId) k.push(`rider:${t.riderId}`);
  if (e.who && e.who.riderId) k.push(`rider:${e.who.riderId}`);
  const vid = (t && t.vendorId) || (e.order && e.order.vendorId) || e.vendorId;
  if (vid) k.push(`vendor:${vid}`);
  if (t && t.phone && (e.kind === "customer" || ["picked_up", "arrived", "delivered", "failed"].includes(e.kind))) k.push(`customer:${digitsOf(t.phone)}`);
  if (e.who && e.who.id) k.push(`staff:${e.who.id}`);
  return k;
}

function peopleOf(state, entries, msgs, scope) {
  const by = {};
  const touch = (key, at, what) => {
    const [role, id] = key.split(":");
    if (scope.role !== "company" && role !== "rider") return;
    let p = by[key];
    if (!p) {
      const r = role === "rider" ? riderById(state, id) : role === "vendor" ? vendorById(state, id) : null;
      const m = role === "staff" ? msgs.find((x) => x.staffId === id && x.staffName) : null;
      const t = role === "customer" ? state.tasks.find((x) => digitsOf(x.phone) === id) : null;
      const e = role === "staff" ? entries.find((x) => x.who && x.who.id === id) : null;
      const name = r ? r.name : role === "staff" ? (m && m.staffName) || (e && e.who.name) || "Office" : role === "customer" ? (t && t.customer) || `+${id}` : "?";
      p = by[key] = { key, role, id, name, color: r ? r.color : role === "staff" ? "#0f1450" : "#64748b", phone: r ? r.phone : role === "customer" ? `+${id}` : "", from: at, to: at, actions: 0, messages: 0, delivered: 0 };
    }
    if (at < p.from) p.from = at;
    if (at > p.to) p.to = at;
    if (what === "message") p.messages += 1; else p.actions += 1;
    if (what === "delivered" && role === "rider") p.delivered += 1;
  };
  entries.forEach((e) => [...new Set(keysOfEntry(e))].forEach((k) => touch(k, e.at, e.kind)));
  msgs.forEach((m) => { const k = threadKeyOf(m); if (k) touch(k, m.at, "message"); });
  const order = { rider: 0, vendor: 1, staff: 2, customer: 3 };
  return Object.values(by).sort((a, b) => order[a.role] - order[b.role] || (a.name < b.name ? -1 : 1));
}

const KIND = { rider: "Rider", vendor: "Vendor", staff: "Office", customer: "Customer" };

const TONES = { rose: "bg-rose-50 text-rose-600", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", sky: "bg-[#aad9fd]/40 text-neutral-800", stone: "bg-neutral-100 text-neutral-600" };

function Via({ via }) {
  const label = viaOf(via);
  if (!label) return null;
  return <span className={cn("ml-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 align-middle text-[10.5px] font-semibold", via === "whatsapp" ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500")}>{via === "whatsapp" && <MessageCircle className="h-3 w-3" />}{label}</span>;
}

/* ---------- a month you can move through, a dot on every day with drops ---------- */

export function RecordCalendar({ state, scope, value, onChange, className }) {
  const [month, setMonth] = useState(() => { const d = new Date(`${value}T12:00`); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const counts = useMemo(() => {
    const c = {};
    state.tasks.filter((t) => inScope(scope, t)).forEach((t) => { c[t.date] = (c[t.date] || 0) + 1; });
    if (scope.role !== "rider") state.orders.filter((o) => inScope(scope, o) && (o.status === "open" || o.status === "needs_fix")).forEach((o) => { if (o.date) c[o.date] = c[o.date] || 0.5; });
    // A day with only conversations, orders or stock on it still gets a dot, so it can be opened.
    state.messages.filter((m) => msgInScope(scope, m)).forEach((m) => { const d = dayOf(m.at); if (d) c[d] = c[d] || 0.5; });
    if (scope.role !== "rider") {
      state.orders.filter((o) => inScope(scope, o)).forEach((o) => { const d = dayOf(o.createdAt); if (d) c[d] = c[d] || 0.5; });
      (state.intake || []).filter((i) => inScope(scope, i)).forEach((i) => { const d = dayOf(i.at); if (d) c[d] = c[d] || 0.5; });
    }
    return c;
  }, [state, scope.role, scope.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = todayISO();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(month.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const iso = (d) => todayISO(new Date(month.getFullYear(), month.getMonth(), d));
  const move = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="text-[20px] font-bold tracking-tight text-neutral-950" data-testid="rec-month">{month.toLocaleDateString([], { month: "long", year: "numeric" })}</div>
        <div className="flex gap-1">
          <button onClick={() => move(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200" aria-label="Last month"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => move(1)} className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}</div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const k = iso(d);
          const c = counts[k] || 0;
          const on = k === value;
          return (
            <button key={k} onClick={() => onChange(k)} data-testid={`rec-day-${k}`}
              className={cn("relative grid aspect-square place-items-center rounded-[14px] text-[14.5px] transition",
                on ? "bg-black font-bold text-white" : k === today ? "bg-[#aad9fd]/60 font-bold text-neutral-950" : "bg-neutral-100/70 text-neutral-800 hover:bg-neutral-200")}>
              {d}
              {c > 0 && <span className={cn("absolute bottom-1.5 h-1.5 w-1.5 rounded-full", k > today ? "bg-amber-500" : on ? "bg-blue-300" : "bg-blue-600")} />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4 text-[11.5px] text-neutral-500">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Done</span>
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Planned</span>
      </div>
    </div>
  );
}

/* ---------- one day ---------- */

export function DayReport({ state, scope, day }) {
  const [tab, setTab] = useState("record");
  const [who, setWho] = useState("all");
  const [open, setOpen] = useState(null);
  const [photo, setPhoto] = useState(null);
  const today = todayISO();
  const future = day > today;
  const all = useMemo(() => dayEntries(state, day, scope), [state, day, scope.role, scope.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const dayMsgs = useMemo(() => state.messages.filter((m) => dayOf(m.at) === day && msgInScope(scope, m)), [state, day, scope.role, scope.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const people = useMemo(() => peopleOf(state, all, dayMsgs, scope), [state, all, dayMsgs, scope.role]); // eslint-disable-line react-hooks/exhaustive-deps
  const person = people.find((p) => p.key === who);
  const entries = all;
  const drops = dropsOn(state, day, scope);
  const due = drops.filter((t) => t.date === day);
  const done = due.filter((t) => t.status === "delivered");
  const failed = due.filter((t) => t.status === "failed");
  const photos = all.filter((e) => e.kind === "delivered" && e.photo);
  const chat = dayMsgs;
  const waiting = scope.role === "rider" ? [] : state.orders.filter((o) => inScope(scope, o) && o.date === day && (o.status === "open" || o.status === "needs_fix"));
  const status = future ? "Coming up" : day === today ? "Today, so far" : "Done";

  return (
    <div className="grid gap-4" data-testid="day-report">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{status}</div>
          <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-neutral-950" data-testid="day-title">{longDay(day)}</h2>
        </div>
      </div>

      {future ? (
        <div className="grid gap-3">
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-[14px] text-amber-900"><CalendarClock className="mt-0.5 h-4 w-4 shrink-0" /> This day is still to come. Here's what's planned so far; the record fills in as each drop happens.</div>
          <Card className="overflow-hidden">
            {due.length || waiting.length ? (
              <>
                {due.sort((a, b) => (a.time || "99") < (b.time || "99") ? -1 : 1).map((t) => <PlannedRow key={t.id} state={state} t={t} scope={scope} onOpen={() => setOpen(t)} />)}
                {waiting.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 border-t border-neutral-100 px-5 py-3 first:border-t-0">
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", TONES.stone)}><ClipboardPaste className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1"><div className="truncate text-[14.5px] font-semibold">{o.customer || o.id}</div><div className="truncate text-[12.5px] text-neutral-500">{o.id} · {(o.items || []).map((l) => lineLabel(state, l)).join(", ")}</div></div>
                    <StatusPill status={o.status} />
                  </div>
                ))}
              </>
            ) : <Empty icon={CalendarClock} title="Nothing planned yet" sub="Drops for this day show here as soon as they're given to a rider." />}
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Mini label="Delivered" value={`${done.length}/${due.length}`} />
            <Mini label="Not delivered" value={failed.length} tone={failed.length ? "rose" : ""} />
            <Mini label="Collected" value={money(done.reduce((s, t) => s + collectedOf(t), 0))} />
            <Mini label="Photos" value={`${done.filter((t) => t.proof && t.proof.photo).length}/${done.length}`} />
          </div>

          {scope.role !== "rider" && people.length > 0 && (
            <div data-testid="day-people">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{scope.role === "company" ? `Who took part · ${people.length}` : "Riders"} <span className="normal-case tracking-normal text-neutral-400">· tap anyone to see their whole day</span></div>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
                <button onClick={() => setWho("all")} className={cn("shrink-0 rounded-[20px] px-4 py-2.5 text-left ring-1", who === "all" ? "bg-black text-white ring-black" : "bg-white text-neutral-900 ring-neutral-200")}>
                  <div className="text-[13.5px] font-semibold">Everyone</div><div className={cn("text-[11.5px]", who === "all" ? "text-white/60" : "text-neutral-500")}>{all.length} {all.length === 1 ? "entry" : "entries"} · {chat.length} messages</div>
                </button>
                {people.map((p) => (
                  <button key={p.key} onClick={() => setWho(p.key)} className={cn("flex shrink-0 items-center gap-2.5 rounded-[20px] px-3 py-2 text-left ring-1", who === p.key ? "bg-black text-white ring-black" : "bg-white text-neutral-900 ring-neutral-200")} data-testid={`day-person-${p.key}`}>
                    <Avatar name={p.name} color={p.color} size={32} />
                    <div>
                      <div className="flex items-center gap-1.5 text-[13.5px] font-semibold">{p.name}<span className={cn("rounded-full px-1.5 text-[9.5px] font-bold uppercase", who === p.key ? "bg-white/15 text-white/70" : "bg-neutral-100 text-neutral-500")}>{KIND[p.role]}</span></div>
                      <div className={cn("text-[11.5px]", who === p.key ? "text-white/60" : "text-neutral-500")}>{p.role === "rider" ? `${p.delivered} delivered · ` : ""}{p.actions} {p.actions === 1 ? "action" : "actions"} · {p.messages} msgs · {clock(p.from)}–{clock(p.to)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {person && <PersonDay state={state} day={day} person={person} entries={all.filter((e) => keysOfEntry(e).includes(person.key))} msgs={chat.filter((m) => threadKeyOf(m) === person.key)} onClose={() => setWho("all")} onOpen={setOpen} onPhoto={setPhoto} />}

          {!person && <Chips options={[["record", "What happened", entries.length], ["photos", "Photos", photos.length], ["chat", "WhatsApp", chat.length]]} value={tab} onChange={setTab} />}

          {!person && tab === "record" && (
            <Card className="overflow-hidden">
              {entries.length ? entries.map((e) => <EntryRow key={e.id} e={e} onOpen={() => (e.task ? setOpen(e.task) : null)} onPhoto={() => setPhoto(e)} />) : <Empty icon={Clock} title="Nothing happened this day" sub="Drops, stock and payments show here with the time and who did them." />}
            </Card>
          )}
          {!person && tab === "photos" && (
            photos.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="day-photos">
                {photos.map((e) => (
                  <button key={e.id} onClick={() => setPhoto(e)} className="overflow-hidden rounded-[22px] bg-white text-left ring-1 ring-black/5">
                    <img src={e.photo} alt={`Doorstep photo for ${e.task.ref}`} className="aspect-square w-full object-cover" />
                    <div className="px-3 py-2"><div className="truncate text-[13px] font-semibold">{e.task.customer}</div><div className="truncate text-[11.5px] text-neutral-500">{clock(e.at)} · {first(e.who.name)}</div></div>
                  </button>
                ))}
              </div>
            ) : <Card><Empty icon={ImageIcon} title="No doorstep photos this day" /></Card>
          )}
          {!person && tab === "chat" && <DayChat state={state} msgs={chat} scope={scope} />}
        </>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? open.ref || "Delivery" : ""}>
        {open && <DropRecord state={state} task={open} scope={scope} />}
      </Modal>
      <Modal open={!!photo} onClose={() => setPhoto(null)} title={photo ? photo.task.customer : ""}>
        {photo && (
          <div className="grid gap-3">
            <img src={photo.photo} alt="" className="w-full rounded-2xl object-cover" />
            <div className="text-[14px] text-neutral-600">{photo.task.ref} · delivered {clock(photo.at)} by {photo.who.name}<Via via={photo.via} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Mini({ label, value, tone }) {
  return (
    <div className="rounded-[20px] bg-neutral-100/80 px-4 py-3">
      <div className="text-[12px] font-semibold text-neutral-500">{label}</div>
      <div className={cn("mt-1 text-[22px] font-extrabold tracking-[-0.03em]", tone === "rose" ? "text-rose-600" : "text-neutral-950")}>{value}</div>
    </div>
  );
}

function EntryRow({ e, onOpen, onPhoto }) {
  const Icon = e.icon;
  return (
    <div className="flex items-start gap-3 border-t border-neutral-100 px-4 py-3 first:border-t-0 sm:px-5" data-testid="day-entry">
      <span className="w-[62px] shrink-0 pt-1.5 text-right text-[12px] font-semibold tabular-nums text-neutral-500">{clock(e.at)}</span>
      <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full", TONES[e.tone])}><Icon className="h-4 w-4" /></span>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="text-[14px] font-semibold leading-snug text-neutral-900">{e.title}<Via via={e.via} /></div>
        {e.sub && <div className="mt-0.5 text-[12.5px] text-neutral-500">{e.sub}</div>}
        {e.who && <div className="mt-0.5 text-[12px] text-neutral-400">by {e.who.name}</div>}
        {e.kind === "delivered" && !e.photo && e.photoPending && <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11.5px] font-semibold text-amber-700"><Camera className="h-3 w-3" /> Photo still to come</div>}
      </button>
      {e.photo && <button onClick={onPhoto} className="shrink-0"><img src={e.photo} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-black/5" /></button>}
    </div>
  );
}

function PlannedRow({ state, t, scope, onOpen }) {
  const r = riderById(state, t.riderId) || {};
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3 border-t border-neutral-100 px-5 py-3 text-left first:border-t-0" data-testid="planned-row">
      <span className="w-[62px] shrink-0 text-right text-[12px] font-semibold text-neutral-500">{time12(t.time) || "Any time"}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-semibold">{t.customer}</div>
        <div className="truncate text-[12.5px] text-neutral-500">{t.ref} · {itemsOf(state, t)}{scope.role !== "rider" ? ` · ${r.name || "no rider yet"}` : ""}</div>
      </div>
      <StatusPill status={statusOf(t)} />
    </button>
  );
}

// The day's WhatsApp messages, by conversation.
function DayChat({ state, msgs, scope }) {
  const threads = {};
  msgs.forEach((m) => { const k = threadKeyOf(m); if (k) (threads[k] = threads[k] || []).push(m); });
  const keys = Object.keys(threads);
  if (!keys.length) return <Card><Empty icon={MessageCircle} title="No messages this day" /></Card>;
  const mineFrom = scope.role === "rider" ? "rider" : scope.role === "vendor" ? "vendor" : null;
  return (
    <div className="grid gap-4" data-testid="day-chat">
      {keys.map((k) => {
        const [role, id] = k.split(":");
        const p = role === "rider" ? riderById(state, id) || {} : role === "vendor" ? vendorById(state, id) || {}
          : role === "staff" ? { name: (threads[k].find((m) => m.staffName) || {}).staffName || "Office", color: "#0f1450" }
          : { name: (state.tasks.find((t) => digitsOf(t.phone) === id) || {}).customer || `+${id}`, color: "#64748b" };
        return (
          <Card key={k} className="overflow-hidden">
            {scope.role === "company" && <div className="flex items-center gap-2.5 border-b border-neutral-100 px-5 py-3"><Avatar name={p.name || "?"} color={p.color} size={28} /><span className="text-[14px] font-semibold">{p.name}</span><span className="text-[12px] text-neutral-400">{KIND[role]}</span></div>}
            <div className="grid gap-2 bg-[#efeae2] p-4">
              {threads[k].map((m) => {
                const theirs = mineFrom ? m.from === mineFrom : PEOPLE_FROM.includes(m.from);
                const right = mineFrom ? theirs : !theirs;
                return <ChatBubble key={m.id} m={m} right={right} />;
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const PEOPLE_FROM = ["rider", "vendor", "staff", "customer"];
const senderOf = (m) => (m.from === "ada" ? "ADA" : m.from === "dispatcher" || m.from === "company" ? (m.by && m.by.name) || "Office" : m.from === "staff" ? m.staffName || "Office" : "");

function ChatBubble({ m, right }) {
  return (
    <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-[13.5px] leading-snug shadow-sm", right ? "ml-auto bg-[#d9fdd3]" : "bg-white")} data-testid="chat-bubble">
      {m.photo && <img src={m.photo} alt="" className="mb-1.5 max-h-44 rounded-lg object-cover" />}
      {m.audio && <audio controls src={m.audio} className="mb-1.5 h-9 w-56 max-w-full" />}
      {m.audio && m.transcribed && <div className="text-[11px] font-semibold text-neutral-500">Voice note, typed out:</div>}
      {m.location && m.location.lat != null && <a href={`https://maps.google.com/?q=${m.location.lat},${m.location.lng}`} target="_blank" rel="noreferrer" className="mb-1 block text-[12.5px] font-semibold text-[#027eb5] underline">Shared location</a>}
      <div className="whitespace-pre-line break-words text-neutral-900">{m.text}</div>
      {!!(m.buttons && m.buttons.length) && <div className="mt-1 text-[11.5px] text-neutral-500">Buttons: {m.buttons.map((b) => b.title).join(" · ")}</div>}
      <div className="mt-0.5 text-right text-[10.5px] text-neutral-500">{senderOf(m) ? `${senderOf(m)} · ` : ""}{clock(m.at)}{m.channel === "whatsapp" ? " · WhatsApp" : " · app"}{m.wa && m.wa.status && !["received", "queued"].includes(m.wa.status) ? ` · ${m.wa.status.replace("_", " ")}` : ""}</div>
    </div>
  );
}

// One person's whole day: every action and every WhatsApp message, in the order they happened.
function PersonDay({ state, day, person: p, entries, msgs, onClose, onOpen, onPhoto }) {
  const items = [...entries.map((e) => ({ at: e.at, e })), ...msgs.map((m) => ({ at: m.at, m }))].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.e ? -1 : 1));
  const download = () => {
    const lines = [`${p.name} (${KIND[p.role]}${p.phone ? `, ${p.phone}` : ""}) · ${longDay(day)}`, `${state.company.name || "Delivery"} · ${entries.length} actions, ${msgs.length} messages`, ""];
    items.forEach(({ at, e, m }) => {
      if (e) lines.push(`${clock(at)}  • ${e.title}${e.sub ? ` (${e.sub})` : ""}${e.who ? ` [by ${e.who.name}${e.via ? `, ${viaOf(e.via)}` : ""}]` : ""}`);
      else lines.push(`${clock(at)}  ${PEOPLE_FROM.includes(m.from) ? p.name : senderOf(m) || "Office"}: ${String(m.text || "").replace(/\n/g, "\n         ")}${m.photo ? " [photo]" : ""}${m.audio ? " [voice note]" : ""}`);
    });
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url; a.download = `${day} ${p.name}.txt`.replace(/[^\w .-]+/g, ""); a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Card className="overflow-hidden" data-testid="person-day">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-5 py-4">
        <Avatar name={p.name} color={p.color} size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-bold">{p.name} <span className="text-[12px] font-semibold text-neutral-400">{KIND[p.role]}{p.phone ? ` · ${p.phone}` : ""}</span></div>
          <div className="text-[12.5px] text-neutral-500">{longDay(day)} · {entries.length} {entries.length === 1 ? "action" : "actions"} · {msgs.length} WhatsApp {msgs.length === 1 ? "message" : "messages"} · {clock(p.from)}–{clock(p.to)}</div>
        </div>
        <button onClick={download} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 text-[13px] font-semibold hover:bg-neutral-200" data-testid="person-download"><Download className="h-4 w-4" /> Transcript</button>
        <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200" aria-label="Back to everyone"><X className="h-4 w-4" /></button>
      </div>
      {items.length ? (
        <div className="grid gap-2 bg-[#f4f1ec] p-3 sm:p-4">
          {items.map(({ e, m }) => (e ? (
            <div key={e.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5"><EntryRow e={e} onOpen={() => (e.task ? onOpen(e.task) : null)} onPhoto={() => onPhoto(e)} /></div>
          ) : <ChatBubble key={m.id} m={m} right={!PEOPLE_FROM.includes(m.from)} />))}
        </div>
      ) : <Empty icon={Clock} title="Nothing for this person on this day" />}
    </Card>
  );
}

/* ---------- one drop, step by step ---------- */

export function DropRecord({ state, task: t, scope = { role: "company" } }) {
  const r = riderById(state, t.riderId) || {};
  const v = vendorById(state, t.vendorId) || {};
  const pay = t.payment || {};
  const proof = t.proof || {};
  const steps = [];
  const step = (at, label, via, extra) => at && dayOf(at) && steps.push({ at, label, via, extra });
  step(historyAt(t, "assigned").at, `Given to ${r.name || "a rider"}`);
  step(t.acceptedAt, `${first(r.name)} accepted`, t.acceptedVia);
  step(historyAt(t, "picked_up").at, `${first(r.name)} collected it at the office`, historyAt(t, "picked_up").via);
  step(t.arrivedAt, `Arrived at ${t.customer}'s`, t.arrivedVia);
  step(historyAt(t, "delivered").at, `Delivered${proof.receivedBy ? `, received by ${proof.receivedBy}` : ""}`, historyAt(t, "delivered").via || proof.via, pay.method === "unpaid" ? "Not paid at the door" : `${money(collectedOf(t))} ${pay.method || ""}`);
  step(historyAt(t, "failed").at, "Not delivered", historyAt(t, "failed").via, t.failReason);
  step(pay.handedIn && pay.handedIn.at, "Cash paid in", pay.handedIn && pay.handedIn.via, pay.handedIn && pay.handedIn.ref ? `Ref ${pay.handedIn.ref}` : "");
  step(pay.handInVerified, "Cash found in the bank");
  if (scope.role !== "rider") step(t.settled && t.settled.at, `${v.name || "Vendor"} paid`, "", money(vendorPayable(state, t)));
  steps.sort((a, b) => (a.at < b.at ? -1 : 1));
  return (
    <div className="grid gap-4 text-[14px]" data-testid="drop-record">
      <div className="flex items-start justify-between gap-3">
        <div><div className="text-[17px] font-bold">{t.customer}</div><div className="text-neutral-500">{t.address}</div></div>
        <StatusPill status={statusOf(t)} />
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-neutral-50 p-3 text-[13px]">
        <span className="text-neutral-500">Day</span><span className="font-semibold">{t.date ? shortDay(t.date) : ""}{t.time ? `, by ${time12(t.time)}` : ""}</span>
        <span className="text-neutral-500">Items</span><span className="font-semibold">{itemsOf(state, t)}</span>
        {scope.role !== "rider" && <><span className="text-neutral-500">Rider</span><span className="font-semibold">{r.name || "None yet"}</span></>}
        {scope.role !== "vendor" && <><span className="text-neutral-500">Vendor</span><span className="font-semibold">{v.name || ""}</span></>}
        <span className="text-neutral-500">To collect</span><span className="font-semibold">{money(taskValue(t))}</span>
        {t.orderId && <><span className="text-neutral-500">Order</span><span className="font-semibold">{t.orderId}</span></>}
      </div>
      {proof.photo ? <img src={proof.photo} alt={`Doorstep photo for ${t.ref}`} className="aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-neutral-200" /> : t.status === "delivered" ? <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-800"><Camera className="h-4 w-4" /> Doorstep photo still to come</div> : null}
      <div>
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Step by step</div>
        {steps.length ? (
          <ol className="relative ml-[7px] border-l-2 border-neutral-100">
            {steps.map((s, i) => (
              <li key={i} className="relative pb-3 pl-5 last:pb-0">
                <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="font-semibold text-neutral-900">{s.label}<Via via={s.via} /></div>
                <div className="text-[12.5px] text-neutral-500">{shortDay(dayOf(s.at))}, {clock(s.at)}{s.extra ? ` · ${s.extra}` : ""}</div>
              </li>
            ))}
          </ol>
        ) : <div className="text-neutral-500">Nothing has happened to this drop yet.</div>}
      </div>
    </div>
  );
}

/* ---------- the page: calendar and the day ---------- */

export function DayRecords({ state, scope, day, onDay, className }) {
  const [own, setOwn] = useState(todayISO());
  const current = day || own;
  const pick = onDay || setOwn;
  return (
    <div className={cn("grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start", className)} data-testid="day-records">
      <Card className="p-5 lg:sticky lg:top-4">
        <RecordCalendar state={state} scope={scope} value={current} onChange={pick} />
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] leading-snug text-emerald-900">
          <MessageCircle className="mb-0.5 mr-1 inline h-4 w-4" />
          {scope.role === "company" ? "Riders and vendors can ask ADA on WhatsApp too: RECORD YESTERDAY, RECORD 12 NOV or RECORD ORD-3310." : "On WhatsApp, reply RECORD to ADA (or RECORD YESTERDAY, RECORD 12 NOV) to get this day with a link here."}
        </div>
      </Card>
      <DayReport key={current} state={state} scope={scope} day={current} />
    </div>
  );
}

// ?day=2026-11-12 in the address: the day a WhatsApp link points at. Read once, then removed from the address bar.
export function dayFromUrl() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  const d = q.get("day");
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  q.delete("day");
  window.history.replaceState(null, "", window.location.pathname + (q.toString() ? `?${q}` : ""));
  return d;
}


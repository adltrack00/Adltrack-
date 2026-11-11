// Office tools for the company dashboard, the kind a property CRM has, rebuilt for deliveries in Delivery's own style:
// a week calendar of drops, one search box for everything, a log book of shift notes and incidents, an activity log
// of who did what, announcements to every rider or vendor at once, and a "+" button to add anything from anywhere.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, Bike, Boxes, Building2, CalendarDays, Check, ChevronLeft, ChevronRight, ClipboardPaste, History, Megaphone, MessageSquare, NotebookPen, Package, Phone, Plus, Search, Truck, UserPlus, User, Wallet,
} from "lucide-react";
import { cn } from "../lib/utils";
import { productLedger, riderById, useWorkspace, value as taskValue, vendorById } from "./store";
import { Avatar, Btn, Card, CardHead, Chips, Empty, Field, inputCls, Modal, StatusPill } from "./ui";
import { ago, clock, money, num, pad, time12, todayISO } from "./utils";

const isoOf = (d) => todayISO(d);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = (d) => addDays(d, -d.getDay());
const hourOf = (hhmm) => (/^\d{2}:\d{2}$/.test(hhmm || "") ? Number(hhmm.slice(0, 2)) + Number(hhmm.slice(3)) / 60 : null);

/* ---------- The "+" button: add anything from any page ---------- */

export function QuickAdd({ onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); window.removeEventListener("keydown", esc); };
  }, [open]);
  const items = [
    ["delivery", "New delivery", Truck],
    ["paste", "Paste WhatsApp orders", ClipboardPaste],
    ["incident", "Log an incident", AlertTriangle],
    ["note", "Shift note", NotebookPen],
    ["announce", "Announcement", Megaphone],
    ["team", "Add a rider or vendor", UserPlus],
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="grid h-11 w-11 place-items-center rounded-full bg-white text-neutral-950 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5 hover:bg-neutral-50" aria-label="Add" aria-expanded={open} data-testid="quick-add">
        <Plus className={cn("h-5 w-5 transition-transform", open && "rotate-45")} strokeWidth={2.2} />
      </button>
      {open && (
        <div className="absolute right-0 top-[52px] z-40 w-[250px] overflow-hidden rounded-[24px] bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(10,14,40,0.35)] ring-1 ring-black/5" role="menu">
          {items.map(([id, label, Icon]) => (
            <button key={id} role="menuitem" onClick={() => { setOpen(false); onPick(id); }} className="flex w-full items-center gap-3 rounded-full px-2 py-1.5 text-left text-[14.5px] font-medium text-neutral-800 hover:bg-[#aad9fd]/30" data-testid={`quick-${id}`}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#aad9fd]/35 text-neutral-900"><Icon className="h-[17px] w-[17px]" /></span>{label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Calendar: every drop of the week, by rider ---------- */

const HOURS = Array.from({ length: 15 }, (_, i) => 7 + i); // 7am to 9pm
const ROW = 56;

export function CalendarPage() {
  const { state } = useWorkspace();
  const [anchor, setAnchor] = useState(new Date());
  const [view, setView] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? "day" : "week"));
  const [hidden, setHidden] = useState(() => new Set());
  const [openTask, setOpenTask] = useState(null);
  const days = view === "week" ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i)) : [anchor];
  const isos = days.map(isoOf);
  const today = todayISO();
  const step = view === "week" ? 7 : 1;
  const waitingOn = !hidden.has("waiting");

  const events = useMemo(() => {
    const out = [];
    state.tasks.forEach((t) => {
      if (!isos.includes(t.date) || hidden.has(t.riderId)) return;
      const r = riderById(state, t.riderId) || {};
      out.push({ id: t.id, day: t.date, at: hourOf(t.time || t.due), color: r.color || "#64748b", title: t.customer, sub: `${time12(t.time || t.due) ? `${time12(t.time || t.due)} · ` : ""}${r.short || r.name || "No rider"} · ${t.ref || ""}`, task: t });
    });
    if (waitingOn) {
      state.orders.filter((o) => (o.status === "open" || o.status === "needs_fix") && isos.includes(o.date)).forEach((o) => {
        out.push({ id: o.id, day: o.date, at: hourOf(o.start || o.end), color: "#94a3b8", title: o.customer, sub: o.status === "needs_fix" ? "Order to fix" : "Waiting for a rider", waiting: true });
      });
    }
    return out;
  }, [state, isos.join(), hidden, waitingOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const mon = (d) => d.toLocaleDateString([], { month: "short" });
  const title = view === "week"
    ? `${mon(days[0])} ${days[0].getDate()} – ${days[0].getMonth() === days[6].getMonth() ? "" : `${mon(days[6])} `}${days[6].getDate()}, ${days[6].getFullYear()}`
    : anchor.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const flip = (id) => setHidden((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const anyTime = (iso) => events.filter((e) => e.day === iso && e.at == null);
  // Drops sit in the row of their hour. A day on its own puts that hour's drops side by side; in a week, where columns
  // are narrow, they stack, and past two there's a "+ more" that opens the day.
  const buckets = (iso) => {
    const byHour = {};
    events.filter((e) => e.day === iso && e.at != null).sort((a, b) => a.at - b.at).forEach((e) => {
      const h = Math.min(Math.max(Math.floor(e.at), HOURS[0]), HOURS[HOURS.length - 1]);
      (byHour[h] = byHour[h] || []).push(e);
    });
    return Object.entries(byHour).map(([h, list]) => [Number(h), list]);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <Card className="h-max px-4 py-3 lg:p-5">
        <div className="hidden text-[15px] font-bold tracking-tight lg:block">Riders</div>
        <div className="mt-1 hidden text-[12.5px] text-neutral-500 lg:block">Tick who to show</div>
        <ul className="flex flex-wrap gap-x-2 lg:mt-3 lg:grid lg:gap-1">
          {state.riders.map((r) => (
            <li key={r.id}><Tick on={!hidden.has(r.id)} color={r.color} label={r.name} onClick={() => flip(r.id)} /></li>
          ))}
          <li className="lg:mt-1 lg:border-t lg:border-neutral-100 lg:pt-2"><Tick on={waitingOn} color="#94a3b8" label="Waiting for a rider" onClick={() => flip("waiting")} /></li>
        </ul>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-5 pt-5">
          <div className="flex items-center gap-1">
            <button onClick={() => setAnchor(addDays(anchor, -step))} className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200" aria-label="Back"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => setAnchor(addDays(anchor, step))} className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 hover:bg-neutral-200" aria-label="Forward"><ChevronRight className="h-5 w-5" /></button>
            <button onClick={() => setAnchor(new Date())} className="h-10 rounded-full bg-neutral-100 px-4 text-[13.5px] font-semibold hover:bg-neutral-200">Today</button>
          </div>
          <div className="mx-auto px-2 text-[19px] font-bold tracking-tight sm:text-[22px]" data-testid="cal-title">{title}</div>
          <Chips className="[&>button]:h-10" options={[["day", "Day"], ["week", "Week"]]} value={view} onChange={setView} />
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className={cn(view === "week" ? "min-w-[760px]" : "min-w-0")}>
            <div className="grid border-b border-neutral-100" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}>
              <span />
              {days.map((d) => {
                const on = isoOf(d) === today;
                return (
                  <button key={isoOf(d)} onClick={() => { setAnchor(d); setView("day"); }} className={cn("py-2.5 text-center text-[13px] font-semibold", on ? "rounded-t-2xl bg-[#aad9fd]/40 text-neutral-950" : "text-neutral-500 hover:text-neutral-900")}>
                    {d.toLocaleDateString([], { weekday: "short" })} <span className={cn(on && "rounded-full bg-neutral-950 px-1.5 py-0.5 text-white")}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            {/* Drops with no time given */}
            <div className="grid border-b border-neutral-100" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}>
              <span className="py-2 pr-2 text-right text-[11px] font-medium text-neutral-400">Any time</span>
              {isos.map((iso) => (
                <div key={iso} className={cn("grid min-h-[36px] content-start gap-1 border-l border-neutral-100 p-1", iso === today && "bg-[#aad9fd]/20")}>
                  {anyTime(iso).map((e) => <Event key={e.id} e={e} onOpen={setOpenTask} />)}
                </div>
              ))}
            </div>
            <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}>
              <div>
                {HOURS.map((h) => <div key={h} style={{ height: ROW }} className="pr-2 pt-1 text-right text-[11px] font-medium text-neutral-400">{time12(`${pad(h)}:00`).replace(":00 ", " ")}</div>)}
              </div>
              {isos.map((iso) => (
                <div key={iso} className={cn("relative border-l border-neutral-100", iso === today && "bg-[#aad9fd]/20")} style={{ height: ROW * HOURS.length }} data-testid={`cal-day-${iso}`}>
                  {HOURS.map((h) => <div key={h} style={{ top: (h - HOURS[0]) * ROW }} className="absolute inset-x-0 border-t border-dashed border-neutral-100" />)}
                  {iso === today && <NowLine />}
                  {buckets(iso).map(([h, list]) => {
                    const top = (h - HOURS[0]) * ROW;
                    if (view === "day") {
                      return list.map((e, i) => (
                        <div key={e.id} className="absolute p-0.5" style={{ top, height: ROW, left: `${(i / list.length) * 100}%`, width: `${100 / list.length}%` }}>
                          <Event e={e} onOpen={setOpenTask} />
                        </div>
                      ));
                    }
                    const more = list.length > 2;
                    const shown = more ? list.slice(0, 1) : list;
                    const slot = ROW / (more ? 2 : list.length);
                    return (
                      <div key={h} className="absolute inset-x-0 grid p-0.5" style={{ top, height: ROW, gridTemplateRows: `repeat(${more ? 2 : list.length}, minmax(0,1fr))`, gap: 2 }}>
                        {shown.map((e) => <Event key={e.id} e={e} onOpen={setOpenTask} compact={slot < ROW} />)}
                        {more && <button onClick={() => { setAnchor(new Date(`${iso}T12:00`)); setView("day"); }} className="rounded-lg bg-neutral-950 px-2 text-left text-[11px] font-semibold text-white hover:bg-neutral-800">+{list.length - 1} more</button>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {!events.length && <div className="border-t border-neutral-100"><Empty icon={CalendarDays} title={view === "week" ? "No drops this week" : "No drops this day"} sub="Deliveries show here at the time they're due, in their rider's colour." /></div>}
      </Card>
      <Modal open={!!openTask} onClose={() => setOpenTask(null)} title={openTask ? openTask.ref || "Delivery" : ""}>
        {openTask && <TaskSummary task={openTask} />}
      </Modal>
    </div>
  );
}

function Tick({ on, color, label, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-full px-1.5 py-1.5 text-left text-[14px] font-medium text-neutral-800 hover:bg-black/[0.03]" aria-pressed={on}>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md ring-2" style={{ background: on ? color : "transparent", "--tw-ring-color": color }}>{on && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function NowLine() {
  const d = new Date();
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < HOURS[0] || h > HOURS[HOURS.length - 1] + 1) return null;
  return <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-rose-500" style={{ top: (h - HOURS[0]) * ROW }}><span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-rose-500" /></div>;
}

function Event({ e, onOpen, compact }) {
  return (
    <button
      onClick={() => e.task && onOpen(e.task)}
      className={cn("flex h-full w-full min-w-0 flex-col justify-center overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left", e.waiting ? "border-dashed bg-neutral-100/80" : "hover:brightness-95", compact && "py-0.5")}
      style={{ borderColor: e.color, background: e.waiting ? undefined : `${e.color}1f` }}
      title={`${e.title} · ${e.sub}`}
    >
      <span className="truncate text-[12px] font-semibold leading-tight text-neutral-900">{e.title}</span>
      {!compact && <span className="truncate text-[11px] text-neutral-500">{e.sub}</span>}
    </button>
  );
}

function TaskSummary({ task }) {
  const { state } = useWorkspace();
  const r = riderById(state, task.riderId) || {};
  const v = vendorById(state, task.vendorId) || {};
  return (
    <div className="grid gap-3 text-[14px]">
      <div className="flex items-center justify-between"><span className="text-[17px] font-bold">{task.customer}</span><StatusPill status={task.status} /></div>
      <div className="text-neutral-600">{task.address}</div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-neutral-50 p-3 text-[13px]">
        <span className="text-neutral-500">Rider</span><span className="font-semibold">{r.name || "None"}</span>
        <span className="text-neutral-500">Vendor</span><span className="font-semibold">{v.name || ""}</span>
        <span className="text-neutral-500">Due</span><span className="font-semibold">{time12(task.time || task.due) || "Any time"}</span>
        <span className="text-neutral-500">To collect</span><span className="font-semibold">{money(taskValue(task))}</span>
      </div>
      {task.phone && <a href={`tel:${task.phone}`} className="inline-flex items-center gap-2 font-semibold text-blue-600"><Phone className="h-4 w-4" /> {task.phone}</a>}
    </div>
  );
}

/* ---------- Search: customers, deliveries, riders, vendors and products in one box ---------- */

const KINDS = [
  ["all", "Everything", Search],
  ["customer", "Customers", User],
  ["delivery", "Deliveries", Truck],
  ["rider", "Riders", Bike],
  ["vendor", "Vendors", Building2],
  ["product", "Products", Package],
];

export function SearchPage({ setTab }) {
  const { state } = useWorkspace();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const all = useMemo(() => {
    const out = [];
    const customers = {};
    [...state.tasks, ...state.orders].forEach((x) => {
      const key = `${(x.customer || "").toLowerCase()}|${x.phone || ""}`;
      if (!x.customer) return;
      const c = customers[key] || (customers[key] = { name: x.customer, phone: x.phone, address: x.address, n: 0 });
      c.n += 1;
    });
    Object.values(customers).forEach((c, i) => out.push({ id: `c${i}`, kind: "customer", title: c.name, sub: c.address, phone: c.phone, meta: `${c.n} ${c.n === 1 ? "order" : "orders"}`, go: "deliveries" }));
    state.tasks.forEach((t) => {
      const r = riderById(state, t.riderId) || {};
      out.push({ id: t.id, kind: "delivery", title: `${t.ref || "Delivery"} · ${t.customer}`, sub: `${t.address} · ${r.short || r.name || "No rider"}`, phone: t.phone, status: t.status, meta: money(taskValue(t)), go: "deliveries", extra: [(vendorById(state, t.vendorId) || {}).name] });
    });
    state.riders.forEach((r) => out.push({ id: r.id, kind: "rider", title: r.name, sub: [r.zone, r.vehicle].filter(Boolean).join(" · "), phone: r.phone, color: r.color, go: "riders" }));
    state.vendors.forEach((v) => out.push({ id: v.id, kind: "vendor", title: v.name, sub: v.contact, phone: v.phone, color: v.color, go: "stock" }));
    state.products.forEach((p) => {
      const l = productLedger(state, p);
      out.push({ id: p.id, kind: "product", title: p.name, sub: (vendorById(state, p.vendorId) || {}).name, meta: `${num(l.inWarehouse)} in stock · ${money(p.price)}`, go: "stock", extra: p.aliases || [] });
    });
    return out;
  }, [state]);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hit = (x) => words.every((w) => [x.title, x.sub, x.phone, x.meta, ...(x.extra || [])].join(" ").toLowerCase().includes(w));
  const shown = all.filter((x) => (kind === "all" || x.kind === kind) && hit(x));
  const count = (k) => all.filter((x) => (k === "all" || x.kind === k) && hit(x)).length;
  const label = { customer: "Customer", delivery: "Delivery", rider: "Rider", vendor: "Vendor", product: "Product" };

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
      <div className="lg:order-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, address, DL number, product…" className="h-14 w-full rounded-full bg-white pl-14 pr-5 text-[16px] text-neutral-950 shadow-[0_10px_40px_-12px_rgba(10,14,40,0.14)] outline-none ring-1 ring-black/[0.04] placeholder:text-neutral-400 focus:ring-4 focus:ring-blue-500/10" data-testid="search-input" />
        </div>
        <Card className="mt-4 overflow-hidden">
          {shown.slice(0, 80).map((x) => (
            <button key={`${x.kind}-${x.id}`} onClick={() => setTab(x.go)} className="flex w-full items-start gap-3 border-t border-neutral-100 px-5 py-4 text-left first:border-t-0 hover:bg-neutral-50/70">
              <Avatar name={x.title.replace(/^DL-\d+ · /, "")} color={x.color || "#94a3b8"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><span className="truncate text-[15.5px] font-semibold text-blue-700">{x.title}</span><span className="rounded-full bg-[#aad9fd]/40 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-700">{label[x.kind]}</span>{x.status && <StatusPill status={x.status} />}</div>
                {x.sub && <div className="mt-0.5 truncate text-[13px] text-neutral-600">{x.sub}</div>}
                <div className="mt-0.5 flex flex-wrap gap-x-4 text-[12.5px] text-neutral-500">
                  {x.phone && <a href={`tel:${x.phone}`} onClick={(e) => e.stopPropagation()} className="font-medium text-blue-600">{x.phone}</a>}
                  {x.meta && <span>{x.meta}</span>}
                </div>
              </div>
            </button>
          ))}
          {!shown.length && <Empty icon={Search} title="Nothing matches" sub="Try a first name, the last digits of a phone number or a DL number." />}
        </Card>
      </div>
      <Card className="h-max p-2 lg:order-1">
        <ul className="flex gap-1 overflow-x-auto lg:grid">
          {KINDS.map(([id, text, Icon]) => (
            <li key={id} className="shrink-0">
              <button onClick={() => setKind(id)} className={cn("flex w-full items-center gap-3 rounded-full p-1 pr-4 text-left text-[14.5px] font-medium", kind === id ? "bg-[#aad9fd]/40 text-neutral-950" : "text-neutral-700 hover:bg-black/[0.03]")} data-testid={`search-kind-${id}`}>
                <span className={cn("grid h-9 w-9 place-items-center rounded-full", kind === id ? "bg-white" : "bg-neutral-100")}><Icon className="h-[17px] w-[17px]" /></span>
                <span className="flex-1">{text}</span><span className="text-[12px] text-neutral-400">{count(id)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- Log book: shift notes and incidents ---------- */

export const INCIDENTS = ["Damaged parcel", "Customer complaint", "Wrong item delivered", "Stock missing", "Rider issue", "Accident", "Other"];

export function LogEntryModal({ kind, onClose }) {
  const { state, act } = useWorkspace();
  const [f, setF] = useState({ type: INCIDENTS[0], taskId: "", text: "" });
  useEffect(() => { if (kind) setF({ type: INCIDENTS[0], taskId: "", text: "" }); }, [kind]);
  const recent = state.tasks.filter((t) => t.date === todayISO() || t.status !== "delivered").slice(0, 60);
  const save = (e) => {
    e.preventDefault();
    const t = state.tasks.find((x) => x.id === f.taskId);
    act({ type: "log/add", entry: { kind, type: kind === "incident" ? f.type : "Shift note", text: f.text.trim(), taskId: t ? t.id : "", taskRef: t ? t.ref : "", riderId: t ? t.riderId : "", vendorId: t ? t.vendorId : "" } });
    onClose();
  };
  return (
    <Modal open={!!kind} onClose={onClose} title={kind === "incident" ? "Log an incident" : "Shift note"}>
      <form onSubmit={save} className="grid gap-3">
        {kind === "incident" && (
          <Field label="What happened">
            <div className="flex flex-wrap gap-1.5">
              {INCIDENTS.map((x) => <button type="button" key={x} onClick={() => setF({ ...f, type: x })} className={cn("h-9 rounded-full px-3.5 text-[13px] font-medium", f.type === x ? "bg-black text-white" : "bg-neutral-100 text-neutral-800")}>{x}</button>)}
            </div>
          </Field>
        )}
        <Field label={kind === "incident" ? "Which delivery (if any)" : "About a delivery (optional)"}>
          <select value={f.taskId} onChange={(e) => setF({ ...f, taskId: e.target.value })} className={inputCls}>
            <option value="">None</option>
            {recent.map((t) => <option key={t.id} value={t.id}>{t.ref} · {t.customer} · {(riderById(state, t.riderId) || {}).short || ""}</option>)}
          </select>
        </Field>
        <Field label={kind === "incident" ? "Details" : "Note for whoever's on next"}>
          <textarea required value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} rows={4} className={cn(inputCls, "h-auto py-3")} placeholder={kind === "incident" ? "What happened, who was involved, what was done." : "Riders still out, cash to check, who to call back…"} data-testid="log-text" />
        </Field>
        <Btn type="submit" size="lg" className="mt-1" data-testid="log-save">{kind === "incident" ? "Log incident" : "Save note"}</Btn>
      </form>
    </Modal>
  );
}

export function LogBook() {
  const { state, act } = useWorkspace();
  const [filter, setFilter] = useState("open");
  const [adding, setAdding] = useState(null);
  const log = state.log || [];
  const tests = { open: (e) => e.status === "open", incident: (e) => e.kind === "incident", note: (e) => e.kind === "note", all: () => true };
  const shown = log.filter(tests[filter]);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chips options={[["open", "Open incidents", log.filter(tests.open).length], ["incident", "All incidents", log.filter(tests.incident).length], ["note", "Shift notes", log.filter(tests.note).length], ["all", "Everything", log.length]]} value={filter} onChange={setFilter} />
        <div className="ml-auto flex gap-2">
          <Btn variant="white" onClick={() => setAdding("note")} className="ring-1 ring-black/5"><NotebookPen className="h-4 w-4" /> Shift note</Btn>
          <Btn onClick={() => setAdding("incident")}><AlertTriangle className="h-4 w-4" /> Log incident</Btn>
        </div>
      </div>
      <Card className="overflow-hidden">
        {shown.map((e) => {
          const r = riderById(state, e.riderId);
          const inc = e.kind === "incident";
          return (
            <div key={e.id} className="flex items-start gap-3 border-t border-neutral-100 px-5 py-4 first:border-t-0" data-testid="log-entry">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", inc ? (e.status === "open" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600") : "bg-[#aad9fd]/40 text-neutral-800")}>
                {inc ? (e.status === "open" ? <AlertTriangle className="h-[18px] w-[18px]" /> : <Check className="h-[18px] w-[18px]" />) : <NotebookPen className="h-[18px] w-[18px]" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">{e.type}{e.taskRef && <span className="font-mono text-[12px] text-neutral-400">{e.taskRef}</span>}{r && <span className="text-[13px] font-medium text-neutral-500">· {r.name}</span>}</div>
                <div className="mt-0.5 whitespace-pre-line text-[14px] text-neutral-700">{e.text}</div>
                <div className="mt-1 text-[12px] text-neutral-400">{e.by && e.by.name ? `${e.by.name} · ` : ""}{ago(e.at)}{e.status === "resolved" ? ` · Sorted ${ago(e.resolvedAt)}${e.resolvedBy ? ` by ${e.resolvedBy}` : ""}` : ""}</div>
              </div>
              {e.status === "open" && <Btn size="sm" variant="ghost" onClick={() => act({ type: "log/resolve", id: e.id })} data-testid="log-resolve">Mark sorted</Btn>}
            </div>
          );
        })}
        {!shown.length && <Empty icon={NotebookPen} title={filter === "open" ? "No open incidents" : "Nothing logged yet"} sub="Log damaged parcels, complaints and missing stock here, and leave shift notes for whoever's on next." />}
      </Card>
      <LogEntryModal kind={adding} onClose={() => setAdding(null)} />
    </div>
  );
}

/* ---------- Activity log: who did what, newest first ---------- */

const WORDS = { assigned: "sent to", picked_up: "picked up by", delivered: "delivered by", failed: "not delivered by" };

export function activity(state) {
  const out = [];
  const riderName = (id) => ((riderById(state, id) || {}).short || (riderById(state, id) || {}).name || "a rider");
  state.tasks.forEach((t) => {
    (t.history || []).forEach((h, i) => {
      if (!WORDS[h.status]) return;
      out.push({ id: `${t.id}-h${i}`, at: h.at, kind: h.status === "delivered" || h.status === "failed" ? "delivery" : "dispatch", icon: h.status === "failed" ? AlertTriangle : Truck, tone: h.status === "failed" ? "rose" : h.status === "delivered" ? "green" : "sky", text: `${t.ref || "Delivery"} for ${t.customer} ${WORDS[h.status]} ${riderName(t.riderId)}`, who: h.status === "assigned" ? "" : riderName(t.riderId) });
    });
    if (t.acceptedAt) out.push({ id: `${t.id}-acc`, at: t.acceptedAt, kind: "dispatch", icon: Bike, tone: "sky", text: `${riderName(t.riderId)} accepted ${t.ref}` });
    if (t.declined && t.declined.at) out.push({ id: `${t.id}-dec`, at: t.declined.at, kind: "dispatch", icon: AlertTriangle, tone: "amber", text: `${riderName(t.riderId)} declined ${t.ref}${(t.declined.reasons || []).length ? `: ${t.declined.reasons.join(", ")}` : ""}` });
    if (t.payment && t.payment.confirmed && t.payment.at) out.push({ id: `${t.id}-pay`, at: t.payment.at, kind: "money", icon: Wallet, tone: "green", text: `${money(t.payment.amount)} ${t.payment.method || ""} payment checked for ${t.ref}` });
    if (t.payment && t.payment.handedIn && t.payment.handedIn.at) out.push({ id: `${t.id}-hand`, at: t.payment.handedIn.at, kind: "money", icon: Wallet, tone: "amber", text: `${riderName(t.riderId)} handed in cash for ${t.ref}` });
    if (t.payment && t.payment.handInVerified) out.push({ id: `${t.id}-handok`, at: t.payment.handInVerified, kind: "money", icon: Check, tone: "green", text: `Cash for ${t.ref} found in the bank` });
    if (t.settled && t.settled.at) out.push({ id: `${t.id}-settle`, at: t.settled.at, kind: "money", icon: Wallet, tone: "green", text: `Paid ${(vendorById(state, t.vendorId) || {}).name || "the vendor"} for ${t.ref}` });
  });
  state.intake.forEach((i) => {
    const p = state.products.find((x) => x.id === i.productId) || {};
    const v = vendorById(state, i.vendorId) || {};
    out.push({ id: `${i.id}-in`, at: i.at, kind: "stock", icon: Boxes, tone: "amber", text: `${i.status === "sent" ? `${v.name || "A vendor"} sent` : "Received"} ${num(i.qty)} × ${p.name || "stock"}${i.status !== "sent" && v.name ? ` from ${v.name}` : ""}`, who: i.by && i.by.name });
    if (i.countedAt) out.push({ id: `${i.id}-count`, at: i.countedAt, kind: "stock", icon: Check, tone: "green", text: `Counted in ${num(i.qty)} × ${p.name || "stock"} from ${v.name || "a vendor"}`, who: i.countedBy });
  });
  state.orders.forEach((o) => o.createdAt && out.push({ id: `${o.id}-ord`, at: o.createdAt, kind: "dispatch", icon: ClipboardPaste, tone: "stone", text: `New request for ${o.customer} from ${(vendorById(state, o.vendorId) || {}).name || "a vendor"}`, who: o.by && o.by.name }));
  state.messages.forEach((m) => {
    const to = m.vendorId ? (vendorById(state, m.vendorId) || {}).name : riderName(m.riderId);
    const from = m.from === "rider" ? riderName(m.riderId) : m.from === "vendor" ? (vendorById(state, m.vendorId) || {}).name : m.from === "ada" ? "ADA" : (m.by && m.by.name) || "The office";
    out.push({ id: m.id, at: m.at, kind: "message", icon: m.campaign ? Megaphone : MessageSquare, tone: "stone", text: m.from === "rider" || m.from === "vendor" ? `${from}: “${m.text}”` : `${from} → ${to}: “${m.text}”` });
  });
  (state.log || []).forEach((e) => {
    out.push({ id: e.id, at: e.at, kind: "log", icon: e.kind === "incident" ? AlertTriangle : NotebookPen, tone: e.kind === "incident" ? "rose" : "sky", text: `${e.type}${e.taskRef ? ` on ${e.taskRef}` : ""}: ${e.text}`, who: e.by && e.by.name });
    if (e.resolvedAt) out.push({ id: `${e.id}-ok`, at: e.resolvedAt, kind: "log", icon: Check, tone: "green", text: `${e.type} sorted`, who: e.resolvedBy });
  });
  return out.filter((x) => x.at).sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function ActivityLog() {
  const { state } = useWorkspace();
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const all = useMemo(() => activity(state), [state]);
  const kinds = [["all", "All"], ["dispatch", "Dispatch"], ["delivery", "Deliveries"], ["money", "Money"], ["stock", "Stock"], ["message", "Messages"], ["log", "Log book"]];
  const shown = all.filter((x) => (kind === "all" || x.kind === kind) && (!q || `${x.text} ${x.who || ""}`.toLowerCase().includes(q.toLowerCase()))).slice(0, 250);
  const days = [];
  shown.forEach((x) => {
    const d = new Date(x.at).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    if (!days.length || days[days.length - 1][0] !== d) days.push([d, []]);
    days[days.length - 1][1].push(x);
  });
  const tones = { rose: "bg-rose-50 text-rose-600", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", sky: "bg-[#aad9fd]/40 text-neutral-800", stone: "bg-neutral-100 text-neutral-600" };
  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Chips options={kinds.map(([id, l]) => [id, l, id === "all" ? all.length : all.filter((x) => x.kind === id).length])} value={kind} onChange={setKind} />
        <div className="relative lg:ml-auto lg:w-[280px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the log" className={cn(inputCls, "rounded-full bg-white pl-10 ring-1 ring-black/5")} />
        </div>
      </div>
      {days.map(([day, items]) => (
        <Card key={day} className="overflow-hidden">
          <CardHead title={day} sub={`${items.length} ${items.length === 1 ? "thing" : "things"} happened`} className="pb-2" />
          {items.map((x) => {
            const Icon = x.icon;
            return (
              <div key={x.id} className="flex items-start gap-3 border-t border-neutral-100 px-5 py-3" data-testid="activity-row">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", tones[x.tone])}><Icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1 text-[14px] text-neutral-800">{x.text}{x.who && <span className="text-neutral-400"> · {x.who}</span>}</div>
                <span className="shrink-0 text-[12px] font-medium text-neutral-400">{clock(x.at)}</span>
              </div>
            );
          })}
        </Card>
      ))}
      {!days.length && <Card><Empty icon={History} title="Nothing here yet" sub="Every dispatch, delivery, payment, stock count and message shows up here as it happens." /></Card>}
    </div>
  );
}

/* ---------- Announcements: one message to every rider or vendor ---------- */

const AUDIENCES = [["riders", "All riders"], ["vendors", "All vendors"], ["everyone", "Everyone"]];

export function AnnounceModal({ open, onClose }) {
  const { state, act } = useWorkspace();
  const [aud, setAud] = useState("riders");
  const [text, setText] = useState("");
  const riders = aud !== "vendors" ? state.riders : [];
  const vendors = aud !== "riders" ? state.vendors : [];
  const send = (e) => {
    e.preventDefault();
    const campaign = { id: `c-${Date.now().toString(36)}`, audience: aud };
    act({ type: "messages/send", messages: [
      ...riders.map((r) => ({ riderId: r.id, from: "dispatcher", text: text.trim(), campaign })),
      ...vendors.map((v) => ({ vendorId: v.id, from: "dispatcher", text: text.trim(), campaign })),
    ] });
    setText("");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Announcement">
      <form onSubmit={send} className="grid gap-3">
        <Field label="Send to"><Chips options={AUDIENCES.map(([id, l]) => [id, l])} value={aud} onChange={setAud} /></Field>
        <Field label="Message"><textarea required rows={5} value={text} onChange={(e) => setText(e.target.value)} className={cn(inputCls, "h-auto py-3")} placeholder="e.g. Office closes at 6pm today. Hand in all cash before 5:30." data-testid="announce-text" /></Field>
        <div className="text-[12.5px] text-neutral-500">Goes into each person's messages: {riders.length} {riders.length === 1 ? "rider" : "riders"}{vendors.length ? `, ${vendors.length} ${vendors.length === 1 ? "vendor" : "vendors"}` : ""}.</div>
        <Btn type="submit" size="lg" disabled={!riders.length && !vendors.length} data-testid="announce-send"><Megaphone className="h-4 w-4" /> Send to {riders.length + vendors.length}</Btn>
      </form>
    </Modal>
  );
}

export function Announcements() {
  const { state } = useWorkspace();
  const [open, setOpen] = useState(false);
  const sent = useMemo(() => {
    const by = {};
    state.messages.filter((m) => m.campaign).forEach((m) => {
      const c = by[m.campaign.id] || (by[m.campaign.id] = { id: m.campaign.id, audience: m.campaign.audience, text: m.text, at: m.at, who: m.by && m.by.name, n: 0, read: 0 });
      c.n += 1; if (m.read) c.read += 1;
    });
    return Object.values(by).sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [state.messages]);
  const label = Object.fromEntries(AUDIENCES);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="max-w-xl text-[14px] text-neutral-600">One message to every rider, every vendor or both. Each person gets it in their messages, and you can see who's read it.</p>
        <Btn className="ml-auto" onClick={() => setOpen(true)} data-testid="announce-new"><Megaphone className="h-4 w-4" /> New announcement</Btn>
      </div>
      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1fr_130px_150px_110px] gap-3 border-b border-neutral-100 px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-neutral-400 md:grid"><span>Message</span><span>Sent to</span><span>Sent</span><span>Read</span></div>
        {sent.map((c) => (
          <div key={c.id} className="grid gap-1 border-t border-neutral-100 px-5 py-4 first:border-t-0 md:grid-cols-[1fr_130px_150px_110px] md:items-center md:gap-3" data-testid="announce-row">
            <div className="min-w-0 text-[14.5px] font-medium text-neutral-900"><span className="line-clamp-2">{c.text}</span></div>
            <span className="text-[13px] text-neutral-600">{label[c.audience] || "Selected"} · {c.n}</span>
            <span className="text-[13px] text-neutral-500">{ago(c.at)}{c.who ? ` · ${c.who}` : ""}</span>
            <span className="flex items-center gap-2 text-[13px] font-semibold"><span className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-100"><span className="block h-full rounded-full bg-emerald-500" style={{ width: `${(c.read / c.n) * 100}%` }} /></span>{c.read}/{c.n}</span>
          </div>
        ))}
        {!sent.length && <Empty icon={Megaphone} title="No announcements yet" sub="Tell every rider about a closing time, a route change or a new rule in one go." />}
      </Card>
      <AnnounceModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

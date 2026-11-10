// The four headline numbers on the company dashboard (delivered, left, with riders, sold) as one segmented pill.
// Tapping a segment lights it up and opens a sheet with what's behind that number.
import React, { useState } from "react";
import { Wallet } from "lucide-react";
import { isActive, isAwaitingPayment, isDelivered, productLedger, riderById, totals, units, value, vendorById } from "./store";
import { Avatar, Card, Empty, Modal } from "./ui";
import { clock, money, num, todayISO } from "./utils";
import { cn } from "../lib/utils";

// ₦12,500 → ₦12.5k, ₦1,250,000 → ₦1.25M, so the amount fits a quarter of a phone screen.
export function shortMoney(n) {
  const v = Math.round(Number(n) || 0);
  if (Math.abs(v) < 10000) return money(v);
  if (Math.abs(v) < 1000000) return `₦${+(v / 1000).toFixed(v < 100000 ? 1 : 0)}k`;
  return `₦${+(v / 1000000).toFixed(2)}M`;
}

const SEGMENTS = [
  ["delivered", "Delivered"],
  ["left", "Left"],
  ["riders", "With riders"],
  ["sold", "Sold"],
];

export function StatPill({ state, className }) {
  const [open, setOpen] = useState(null);
  const t = totals(state);
  const shown = { delivered: num(t.delivered), left: num(t.left), riders: num(t.withRiders), sold: shortMoney(t.deliveredValue) };
  return (
    <>
      <div className={cn("grid grid-cols-4 gap-1 rounded-full bg-white/10 p-1.5 ring-1 ring-white/10 backdrop-blur-md", className)} data-testid="stat-pill">
        {SEGMENTS.map(([id, label]) => {
          const on = open === id;
          return (
            <button
              key={id}
              onClick={() => setOpen(id)}
              className={cn("min-w-0 rounded-full px-1 py-2 text-center transition sm:py-2.5", on ? "bg-white text-neutral-950 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.45)]" : "text-white hover:bg-white/[0.08]")}
              data-testid={`stat-${id}`}
            >
              <div className="truncate text-[17px] font-bold leading-tight tracking-tight sm:text-[22px]">{shown[id]}</div>
              <div className={cn("truncate text-[11px] font-medium sm:text-[12.5px]", on ? "text-neutral-500" : "text-white/55")}>{label}</div>
            </button>
          );
        })}
      </div>
      <StatSheet kind={open} state={state} totals={t} onClose={() => setOpen(null)} />
    </>
  );
}

function Big({ value, label, sub }) {
  return (
    <div className="rounded-[28px] bg-[radial-gradient(120%_80%_at_20%_0%,#141a5c_0%,#0a0d2e_55%,#05061a_100%)] px-6 py-5 text-white">
      <div className="text-[13px] font-medium text-white/55">{label}</div>
      <div className="mt-1 text-[40px] font-extrabold leading-none tracking-[-0.03em]">{value}</div>
      {sub && <div className="mt-2 text-[13.5px] text-white/60">{sub}</div>}
    </div>
  );
}

function Split({ items }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {items.map(([k, v, tone]) => (
        <div key={k} className="rounded-2xl bg-neutral-50 px-4 py-3">
          <div className={cn("text-[18px] font-bold tracking-tight", tone)}>{v}</div>
          <div className="text-[12.5px] text-neutral-500">{k}</div>
        </div>
      ))}
    </div>
  );
}

function List({ title, rows, empty }) {
  return (
    <div className="mt-5">
      <div className="px-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-neutral-400">{title}</div>
      <Card className="mt-2">
        {rows.length ? rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 border-t border-neutral-100 px-4 py-3 first:border-t-0">
            {r.avatar}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold text-neutral-900">{r.name}</div>
              {r.sub && <div className="truncate text-[12.5px] text-neutral-500">{r.sub}</div>}
            </div>
            <div className="text-right">
              <div className="text-[14px] font-bold tabular-nums text-neutral-950">{r.value}</div>
              {r.note && <div className="text-[11.5px] text-neutral-400">{r.note}</div>}
            </div>
          </div>
        )) : <Empty title={empty} />}
      </Card>
    </div>
  );
}

function StatSheet({ kind, state, totals: t, onClose }) {
  if (!kind) return null;
  const delivered = state.tasks.filter(isDelivered);
  const today = todayISO();
  const ledgers = state.products.map((p) => ({ p, l: productLedger(state, p), v: vendorById(state, p.vendorId) }));
  const vendorTag = (v) => v && <Avatar name={v.name} color={v.color} size={34} className="rounded-xl" />;

  if (kind === "delivered") {
    const todays = delivered.filter((x) => x.date === today);
    return (
      <Modal open onClose={onClose} title="Delivered">
        <Big label="Units delivered" value={num(t.delivered)} sub={`${num(delivered.length)} deliveries · ${num(todays.length)} today`} />
        <List title="By product" empty="Nothing delivered yet" rows={ledgers.filter((x) => x.l.delivered).sort((a, b) => b.l.delivered - a.l.delivered).map(({ p, l, v }) => ({ avatar: vendorTag(v), name: p.name, sub: v && v.name, value: num(l.delivered), note: money(l.deliveredValue) }))} />
        <List title="Latest" empty="Nothing delivered yet" rows={[...delivered].sort((a, b) => ((b.proof && b.proof.at) || b.date) > ((a.proof && a.proof.at) || a.date) ? 1 : -1).slice(0, 6).map((x) => {
          const r = riderById(state, x.riderId);
          const at = (x.history || []).filter((h) => h.status === "delivered").pop();
          return { avatar: <Avatar name={r ? r.name : "?"} color={r && r.color} size={34} className="rounded-xl" />, name: x.customer, sub: `${x.ref} · ${r ? r.short || r.name : "Rider"}`, value: `${num(units(x))} unit${units(x) === 1 ? "" : "s"}`, note: at ? clock(at.at) : x.date };
        })} />
      </Modal>
    );
  }

  if (kind === "left") {
    return (
      <Modal open onClose={onClose} title="Left">
        <Big label="Units not delivered yet" value={num(t.left)} sub={`Worth ${money(ledgers.reduce((s, x) => s + x.l.left * (x.p.price || 0), 0))} at today's prices`} />
        <Split items={[["In the office", num(t.inWarehouse)], ["With riders now", num(t.withRiders), "text-blue-600"]]} />
        <List title="By product" empty="No stock yet" rows={ledgers.filter((x) => x.l.left).sort((a, b) => b.l.left - a.l.left).map(({ p, l, v }) => ({
          avatar: vendorTag(v), name: p.name, sub: `${v ? v.name : ""}${l.inWarehouse <= 5 ? " · running low" : ""}`, value: num(l.left), note: `${num(l.inWarehouse)} in office · ${num(l.withRiders)} out`,
        }))} />
      </Modal>
    );
  }

  if (kind === "riders") {
    const rows = state.riders.map((r) => {
      const out = state.tasks.filter((x) => x.riderId === r.id && isActive(x));
      const owed = state.tasks.filter((x) => x.riderId === r.id && isAwaitingPayment(x));
      return { r, out, owed, units: out.reduce((s, x) => s + units(x), 0), collect: out.reduce((s, x) => s + value(x), 0), owedValue: owed.reduce((s, x) => s + value(x), 0) };
    }).filter((x) => x.out.length || x.owed.length).sort((a, b) => b.units - a.units);
    return (
      <Modal open onClose={onClose} title="With riders">
        <Big label="Units out with riders" value={num(t.withRiders)} sub={`${num(rows.filter((x) => x.out.length).length)} riders on the road · ${money(rows.reduce((s, x) => s + x.collect, 0))} to collect`} />
        <List title="Each rider" empty="No rider is carrying stock right now" rows={rows.map((x) => ({
          avatar: <Avatar name={x.r.name} color={x.r.color} size={34} className="rounded-xl" />,
          name: x.r.name,
          sub: `${num(x.out.length)} drop${x.out.length === 1 ? "" : "s"} out${x.owedValue ? ` · ${money(x.owedValue)} collected, to verify` : ""}`,
          value: `${num(x.units)} unit${x.units === 1 ? "" : "s"}`,
          note: `${money(x.collect)} to collect`,
        }))} />
      </Modal>
    );
  }

  // Sold: everything delivered, split by whether the money is checked, how it was paid, and which vendor it belongs to.
  const verified = t.deliveredValue - t.awaitingValue;
  const methods = {};
  for (const x of delivered) {
    const m = (x.payment && x.payment.method) || "not recorded";
    methods[m] = (methods[m] || 0) + value(x);
  }
  const soldToday = delivered.filter((x) => x.date === today).reduce((s, x) => s + value(x), 0);
  const label = { cash: "Cash", transfer: "Bank transfer", pos: "POS", unpaid: "Not paid at the door", "not recorded": "Not recorded" };
  return (
    <Modal open onClose={onClose} title="Sold">
      <Big label="Total sold" value={money(t.deliveredValue)} sub={`${money(soldToday)} today`} />
      <Split items={[["Payment verified", money(verified), "text-emerald-600"], ["Waiting to verify", money(t.awaitingValue), "text-amber-600"]]} />
      <List title="How customers paid" empty="No payments yet" rows={Object.entries(methods).sort((a, b) => b[1] - a[1]).map(([m, v]) => ({
        avatar: <span className="grid h-[34px] w-[34px] place-items-center rounded-xl bg-neutral-100 text-neutral-600"><Wallet className="h-4 w-4" /></span>,
        name: label[m] || m, value: money(v), note: t.deliveredValue ? `${Math.round((v / t.deliveredValue) * 100)}%` : "",
      }))} />
      <List title="By vendor" empty="Nothing sold yet" rows={state.vendors.map((v) => ({ v, s: totals(state, v.id) })).filter((x) => x.s.deliveredValue).sort((a, b) => b.s.deliveredValue - a.s.deliveredValue).map(({ v, s }) => ({
        avatar: vendorTag(v), name: v.name, sub: `${num(s.delivered)} units delivered`, value: money(s.deliveredValue), note: s.awaitingValue ? `${money(s.awaitingValue)} to verify` : "all verified",
      }))} />
    </Modal>
  );
}

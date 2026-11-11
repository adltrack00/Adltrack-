// The live side of the company's home: every rider right now, today's money, and the three money jobs that used to
// live only on paper: batches a rider turned down, cash riders say they paid in, and what each vendor is owed.
import React, { useState } from "react";
import { Banknote, HandCoins, Landmark, MessageSquare, Phone, Undo2, Wallet } from "lucide-react";
import { cashHeld, collectedOf, fees, handInToCheck, isDeclined, isDelivered, isPaid, lineLabel, riderNow, units as taskUnits, useWorkspace, vendorById, vendorPayable } from "./store";
import { Avatar, Btn, Card, CardHead, inputCls, LiveDot, Stars } from "./ui";
import { ago, money, todayISO } from "./utils";
import { cn } from "../lib/utils";

const PHASE = {
  off: ["Off duty", "bg-neutral-100 text-neutral-500"],
  idle: ["Free", "bg-neutral-100 text-neutral-700"],
  offer: ["Deciding", "bg-amber-100 text-amber-800"],
  declined: ["Turned down", "bg-rose-100 text-rose-700"],
  collect: ["At the office", "bg-sky-100 text-sky-800"],
  road: ["On the road", "bg-blue-600 text-white"],
};
const DOT = (t) => (isDelivered(t) ? "bg-emerald-500" : t.status === "failed" ? "bg-rose-500" : t.status === "picked_up" ? "bg-blue-600" : isDeclined(t) ? "bg-rose-300" : "bg-neutral-300");

// Every rider, what they're doing this minute, today's drops as dots, and the cash they're holding.
export function RiderBoard({ onOpen }) {
  const { state } = useWorkspace();
  const order = { road: 0, collect: 1, offer: 2, declined: 3, idle: 4, off: 5 };
  const riders = state.riders.map((r) => ({ r, now: riderNow(state, r) })).sort((a, b) => order[a.now.phase] - order[b.now.phase]);
  const out = riders.filter((x) => x.now.phase === "road").length;
  return (
    <Card data-testid="rider-board">
      <CardHead title="Riders right now" sub={`${out} on the road · ${state.riders.filter((r) => r.online).length} of ${state.riders.length} on duty`} right={<LiveDot />} />
      <div className="mt-3 grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 2xl:grid-cols-4">
        {riders.map(({ r, now }) => (
          <div key={r.id} className="min-w-0 rounded-[24px] bg-neutral-100/80 p-4" data-testid="rider-now">
            <div className="flex items-center gap-3">
              <span className="relative">
                <Avatar name={r.name} color={r.color} size={44} />
                <span className={cn("absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white", r.online ? "bg-emerald-500" : "bg-neutral-300")} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold text-neutral-950">{r.name}</div>
                <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11.5px] font-semibold", PHASE[now.phase][1])}>{PHASE[now.phase][0]}</span>
              </div>
              <a href={`tel:${(r.phone || "").replace(/\s/g, "")}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-neutral-800" aria-label={`Call ${r.short}`}><Phone className="h-4 w-4" /></a>
            </div>
            <button onClick={onOpen} className="mt-3 block w-full truncate text-left text-[13.5px] font-medium text-neutral-800">{now.line}</button>
            <div className="mt-2 flex flex-wrap gap-1">
              {now.today.length ? now.today.map((t) => <span key={t.id} className={cn("h-2 w-5 rounded-full", DOT(t))} title={`${t.customer}: ${t.status}`} />) : <span className="text-[12px] text-neutral-400">No drops</span>}
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-neutral-500">
              <span>{now.done}/{now.today.length} done{now.failed ? ` · ${now.failed} failed` : ""}</span>
              {now.cash > 0 ? <span className="font-semibold text-amber-700">{money(now.cash)} cash</span> : <span>{now.last ? ago(now.last) : ""}</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Today in money: what came in at the door, the company's fees, rider pay, and what is still out with riders.
export function MoneyToday({ onVerify }) {
  const { state } = useWorkspace();
  const f = fees(state);
  const today = state.tasks.filter((t) => t.date === todayISO() && isDelivered(t));
  const collected = today.reduce((s, t) => s + collectedOf(t), 0);
  const owed = state.tasks.filter((t) => isPaid(t) && !t.settled).reduce((s, t) => s + vendorPayable(state, t), 0);
  const withRiders = state.tasks.reduce((s, t) => s + cashHeld(t), 0);
  const toCheck = state.tasks.filter(handInToCheck).reduce((s, t) => s + collectedOf(t), 0);
  const rows = [
    ["Your delivery fees", today.length * f.delivery, `${today.length} × ${money(f.delivery)}`],
    ["Rider pay", today.length * f.rider, `${today.length} × ${money(f.rider)}`],
    ["Owed to vendors", owed, "All days, not paid out yet"],
    ["Cash still with riders", withRiders, toCheck ? `+ ${money(toCheck)} paid in, to check` : "Not paid in yet"],
  ];
  return (
    <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-b from-black to-neutral-900 p-6 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]" data-testid="money-today">
      <Stars />
      <div className="relative flex items-center gap-2 text-[15px] font-semibold text-white/60"><Banknote className="h-4 w-4" /> Collected today</div>
      <div className="relative mt-1 text-[48px] font-extrabold leading-none tracking-[-0.04em]">{money(collected)}</div>
      <div className="relative mt-5 divide-y divide-white/10">
        {rows.map(([label, v, sub]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0"><div className="text-[14.5px] font-semibold">{label}</div><div className="text-[12px] text-white/45">{sub}</div></div>
            <span className="font-mono text-[15px] font-semibold">{money(v)}</span>
          </div>
        ))}
      </div>
      {(withRiders > 0 || toCheck > 0) && <Btn variant="white" className="relative mt-4 w-full" onClick={onVerify}><Landmark className="h-4 w-4" /> Check cash with riders</Btn>}
      <div className="relative mt-3 text-[12px] text-white/40">Rates are set in Settings.</div>
    </div>
  );
}

// Drops a rider turned down: give them to someone else in one tap.
export function DeclinedSection({ Section, Row }) {
  const { state, act } = useWorkspace();
  const declined = state.tasks.filter(isDeclined);
  const [to, setTo] = useState({});
  if (!declined.length) return null;
  const rider = (id) => state.riders.find((r) => r.id === id) || {};
  const give = (t) => {
    const riderId = to[t.id] || (state.riders.find((r) => r.online && r.id !== t.riderId) || {}).id;
    if (!riderId) return;
    act({ type: "task/reassign", id: t.id, riderId });
    act({ type: "messages/send", messages: [{ riderId, from: "dispatcher", text: `New drop for you: ${t.customer}, ${t.address}. ${t.items.map((l) => lineLabel(state, l)).join(", ")}. Accept it on your Home screen.` }] });
  };
  return (
    <Section icon={Undo2} tone="rose" title={`Turned down by a rider (${declined.length})`} sub="Give each one to another rider. They'll get it as a new card to accept.">
      {declined.map((t) => (
        <Row key={t.id}>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-neutral-900">{t.customer} <span className="font-normal text-neutral-400">· {t.zone} · {taskUnits(t)} units</span></div>
            <div className="text-[12.5px] text-rose-700">{rider(t.riderId).short}: {(t.declined.reasons || []).join(", ") || "no reason"}</div>
          </div>
          <select value={to[t.id] || ""} onChange={(e) => setTo({ ...to, [t.id]: e.target.value })} className="h-8 rounded-full border border-neutral-200 bg-white px-2 text-[12.5px]" data-testid="reassign-to">
            <option value="">Best free rider</option>
            {state.riders.filter((r) => r.id !== t.riderId).map((r) => <option key={r.id} value={r.id}>{r.short}{r.online ? "" : " (off)"}</option>)}
          </select>
          <Btn size="sm" onClick={() => give(t)} data-testid="reassign">Give it</Btn>
        </Row>
      ))}
    </Section>
  );
}

// Cash: riders who say they paid in (tick it off against the bank) and riders still holding cash.
export function CashSection({ Section, Row }) {
  const { state, act } = useWorkspace();
  const toCheck = state.tasks.filter(handInToCheck);
  const holders = state.riders.map((r) => ({ r, held: state.tasks.filter((t) => t.riderId === r.id && cashHeld(t) > 0) })).filter((x) => x.held.length);
  if (!toCheck.length && !holders.length) return null;
  const byRider = Object.values(toCheck.reduce((m, t) => { (m[t.riderId] = m[t.riderId] || []).push(t); return m; }, {}));
  return (
    <Section id="cash" icon={HandCoins} tone="amber" title="Cash with riders" sub="Riders pay the full amount into the company account. Tick it off when you see it in the bank.">
      {byRider.map((list) => {
        const r = state.riders.find((x) => x.id === list[0].riderId) || {};
        const refs = [...new Set(list.map((t) => t.payment.handedIn.ref).filter(Boolean))].join(", ");
        return (
          <Row key={`c-${r.id}`}>
            <Avatar name={r.name} color={r.color} size={32} />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-neutral-900">{r.short} says they paid in <span className="font-mono">{money(list.reduce((s, t) => s + collectedOf(t), 0))}</span></div>
              <div className="text-[12.5px] text-neutral-500">{list.length} {list.length === 1 ? "drop" : "drops"}{refs ? ` · ref ${refs}` : ""} · {ago(list[0].payment.handedIn.at)}</div>
            </div>
            <Btn size="sm" variant="green" onClick={() => act({ type: "cash/verify", ids: list.map((t) => t.id) })} data-testid="cash-verify">It's in the bank</Btn>
          </Row>
        );
      })}
      {holders.map(({ r, held }) => (
        <Row key={`h-${r.id}`}>
          <Avatar name={r.name} color={r.color} size={32} />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-neutral-900">{r.short} is holding <span className="font-mono">{money(held.reduce((s, t) => s + cashHeld(t), 0))}</span></div>
            <div className="text-[12.5px] text-neutral-500">From {held.length} cash {held.length === 1 ? "drop" : "drops"}, not paid in yet</div>
          </div>
          <Btn size="sm" variant="ghost" onClick={() => act({ type: "messages/send", messages: [{ riderId: r.id, from: "dispatcher", text: `Hi ${r.short}, please pay the ${money(held.reduce((s, t) => s + cashHeld(t), 0))} cash you're holding into the company account, then tap "I've paid it in" in your Wallet.` }] })}><MessageSquare className="h-3.5 w-3.5" /> Remind</Btn>
          <Btn size="sm" variant="ghost" onClick={() => act({ type: "cash/verify", ids: held.map((t) => t.id) })}>Got it</Btn>
        </Row>
      ))}
    </Section>
  );
}

// What each vendor is owed: collected minus the delivery fee for every paid, delivered order. One tap pays it out.
export function SettleSection({ Section, Row }) {
  const { state, act } = useWorkspace();
  const [ref, setRef] = useState({});
  const owed = state.vendors.map((v) => {
    const list = state.tasks.filter((t) => t.vendorId === v.id && isPaid(t) && !t.settled);
    return { v, list, total: list.reduce((s, t) => s + vendorPayable(state, t), 0) };
  }).filter((x) => x.list.length);
  if (!owed.length) return null;
  return (
    <Section id="settle" icon={Wallet} tone="sky" title="Pay your vendors" sub={`What was collected minus your ${money(fees(state).delivery)} fee per order. Vendors see each payout with its reference.`}>
      {owed.map(({ v, list, total }) => (
        <Row key={v.id}>
          <Avatar name={v.name} color={v.color} size={32} className="rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold text-neutral-900">{v.name}</div>
            <div className="text-[12.5px] text-neutral-500">{list.length} {list.length === 1 ? "order" : "orders"} delivered and paid</div>
          </div>
          <span className="font-mono text-[14px] font-semibold">{money(total)}</span>
          <input value={ref[v.id] || ""} onChange={(e) => setRef({ ...ref, [v.id]: e.target.value })} placeholder="Payment ref" className={cn(inputCls, "h-8 w-32 rounded-full px-3 text-[12.5px]")} />
          <Btn size="sm" onClick={() => { act({ type: "vendor/settle", ids: list.map((t) => t.id), ref: (ref[v.id] || "").trim() || `PAY-${Date.now().toString(36).toUpperCase()}` }); setRef({ ...ref, [v.id]: "" }); }} data-testid="settle">Mark paid</Btn>
        </Row>
      ))}
    </Section>
  );
}


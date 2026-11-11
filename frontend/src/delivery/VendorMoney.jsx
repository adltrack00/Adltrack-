// Two things a vendor checks all day: where each of today's parcels is right now, and the money coming to them.
import React from "react";
import { ArrowUpRight, Bike, Check, Package, Wallet } from "lucide-react";
import { fees, isActive, isDelivered, isPaid, riderById, vendorPayable, value as taskValue } from "./store";
import { Card, CardHead, Empty, Stars } from "./ui";
import { ago, clock, money, todayISO } from "./utils";
import { cn } from "../lib/utils";

const STEPS = [["sent", "Sent"], ["accepted", "Rider said yes"], ["picked_up", "Picked up"], ["delivered", "Delivered"]];

// How far a drop has got: 0 sent to a rider, 1 accepted, 2 on the way, 3 delivered.
export function stepOf(t) {
  if (isDelivered(t)) return 3;
  if (t.status === "picked_up") return 2;
  if (t.acceptedAt) return 1;
  return 0;
}
const stepTime = (t, i) => (i === 0 ? t.history && t.history[0] && t.history[0].at : i === 1 ? t.acceptedAt : (t.history || []).find((h) => h.status === STEPS[i][0])?.at);

// Each parcel out today as a four-step track: sent, accepted, picked up, delivered.
export function LiveTracker({ state, tasks }) {
  const today = tasks.filter((t) => t.date === todayISO() && (isActive(t) || isDelivered(t))).sort((a, b) => stepOf(a) - stepOf(b));
  return (
    <Card id="vendor-live" className="scroll-mt-6">
      <CardHead title="Where your parcels are" sub="Today's drops, step by step. Updates the moment a rider taps." />
      <div className="mt-3 divide-y divide-neutral-100">
        {today.length ? today.slice(0, 8).map((t) => {
          const at = stepOf(t);
          const rider = riderById(state, t.riderId) || {};
          return (
            <div key={t.id} className="px-5 py-4" data-testid="track">
              <div className="flex items-baseline justify-between gap-2">
                <div className="min-w-0 truncate text-[14.5px] font-semibold text-neutral-950">{t.customer} <span className="font-normal text-neutral-400">· {t.zone || t.address}</span></div>
                <span className="shrink-0 font-mono text-[12.5px] text-neutral-500">{money(taskValue(t))}</span>
              </div>
              <div className="mt-3 flex items-center">
                {STEPS.map(([id, label], i) => (
                  <React.Fragment key={id}>
                    {i > 0 && <span className={cn("h-[3px] flex-1 rounded-full", i <= at ? "bg-emerald-500" : "bg-neutral-200")} />}
                    <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-white", i < at || at === 3 ? "bg-emerald-500" : i === at ? "bg-blue-600 ring-4 ring-blue-100" : "bg-neutral-200")} title={label}>
                      {i < at || at === 3 ? <Check className="h-3.5 w-3.5" /> : i === 2 ? <Bike className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[12.5px] text-neutral-500">
                <span><b className="font-semibold text-neutral-800">{STEPS[at][1]}</b>{stepTime(t, at) ? ` · ${clock(stepTime(t, at))}` : ""}</span>
                <span>{rider.short || rider.name || "Rider"}</span>
              </div>
            </div>
          );
        }) : <Empty icon={Package} title="Nothing on the road today" sub="Your parcels show here from the moment a rider gets them." />}
      </div>
    </Card>
  );
}

// What the company owes the vendor: collected minus the delivery fee, per delivered order, and what it already paid.
export function VendorMoney({ state, tasks, company }) {
  const fee = fees(state).delivery;
  const delivered = tasks.filter(isDelivered);
  const owed = delivered.filter((t) => isPaid(t) && !t.settled);
  const owedTotal = owed.reduce((s, t) => s + vendorPayable(state, t), 0);
  const waiting = delivered.filter((t) => !isPaid(t));
  const paid = delivered.filter((t) => t.settled);
  const payouts = Object.values(paid.reduce((m, t) => {
    const key = t.settled.ref || t.settled.at.slice(0, 10);
    const p = m[key] || { ref: t.settled.ref, at: t.settled.at, total: 0, n: 0 };
    p.total += vendorPayable(state, t); p.n += 1;
    m[key] = p;
    return m;
  }, {})).sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 5);
  return (
    <div id="vendor-money" className="grid scroll-mt-6 grid-cols-1 gap-5 lg:grid-cols-2 [&>*]:min-w-0">
      <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-b from-black to-neutral-900 p-7 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]" data-testid="vendor-owed">
        <Stars />
        <div className="relative flex items-center gap-2 text-[15px] font-semibold text-white/60"><Wallet className="h-4 w-4" /> Coming to you</div>
        <div className="relative mt-2 text-[52px] font-extrabold leading-none tracking-[-0.04em]">{money(owedTotal)}</div>
        <div className="relative mt-3 text-[14.5px] text-white/55">From {owed.length} delivered {owed.length === 1 ? "order" : "orders"}, after the {money(fee)} delivery fee each. {company || "The office"} pays out within 24 hours.</div>
        {!!waiting.length && <div className="relative mt-4 rounded-2xl bg-white/10 px-4 py-3 text-[13.5px] text-white/75">{waiting.length} more {waiting.length === 1 ? "order is" : "orders are"} delivered but the customer's payment isn't confirmed yet.</div>}
      </div>
      <Card>
        <CardHead title="Paid to you" sub="Each payout from the office, with its reference" />
        <div className="mt-2 divide-y divide-neutral-100">
          {payouts.length ? payouts.map((p) => (
            <div key={p.ref || p.at} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><ArrowUpRight className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1"><div className="truncate text-[14.5px] font-semibold text-neutral-900">{p.ref || "Payout"}</div><div className="text-[12.5px] text-neutral-500">{p.n} {p.n === 1 ? "order" : "orders"} · {ago(p.at)}</div></div>
              <span className="font-mono text-[14px] font-semibold text-emerald-600">{money(p.total)}</span>
            </div>
          )) : <Empty icon={Wallet} title="No payouts yet" sub="Each payout shows here once the office sends it." />}
        </div>
      </Card>
    </div>
  );
}

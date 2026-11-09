// Pieces both the company dashboard and the vendor portal show, so both always read the same numbers.
import React, { useState } from "react";
import { Camera, ChevronDown, Clock, MapPin, PackagePlus, Phone, Wallet } from "lucide-react";
import { feed, productById, productLedger, riderById, value as taskValue, vendorById } from "./store";
import { Avatar, Btn, Empty, LedgerBar, StatusPill, statusOf, Tag } from "./ui";
import { ago, clock, money, num, time12 } from "./utils";

export function ProductTable({ state, vendorId = null, showVendor = false }) {
  const products = state.products.filter((p) => !vendorId || p.vendorId === vendorId);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] table-fixed text-left text-[13px]">
        <thead>
          <tr className="border-b border-stone-100 text-stone-400">
            <th className="w-[26%] px-5 py-2.5 font-medium">Product</th>
            <th className="px-3 py-2.5 text-right font-medium">Unit price</th>
            <th className="px-3 py-2.5 text-right font-medium">Received</th>
            <th className="px-3 py-2.5 text-right font-medium">Delivered</th>
            <th className="px-3 py-2.5 text-right font-medium">With riders</th>
            <th className="px-3 py-2.5 text-right font-medium">Left</th>
            <th className="px-3 py-2.5 text-right font-medium">Sales</th>
            <th className="w-40 px-5 py-2.5 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const l = productLedger(state, p);
            const v = vendorById(state, p.vendorId);
            return (
              <tr key={p.id} className="border-b border-stone-50 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-semibold text-stone-900">{p.name}</div>
                  {showVendor && <div className="text-[12px] text-stone-400">{v && v.name}</div>}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12.5px] text-stone-600">{money(p.price)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{num(l.received)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-600">{num(l.delivered)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-orange-600">{num(l.withRiders + l.awaiting)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-stone-900">{num(l.left)}</td>
                <td className="px-3 py-3 text-right font-mono text-[12.5px] text-stone-700">{money(l.deliveredValue)}</td>
                <td className="px-5 py-3"><LedgerBar received={l.received} delivered={l.delivered} withRiders={l.withRiders} awaiting={l.awaiting} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function LedgerLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-stone-500">
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Delivered &amp; paid</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Awaiting payment</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-400" /> With riders</span>
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-stone-200" /> In warehouse</span>
    </div>
  );
}

const FEED_TEXT = {
  assigned: (t, r) => `${t.ref} assigned to ${r ? r.short : "a rider"}`,
  picked_up: (t, r) => `${r ? r.short : "Rider"} picked up ${t.ref} for ${t.customer}`,
  delivered: (t, r) => `${r ? r.short : "Rider"} delivered ${t.ref} to ${t.customer}`,
  failed: (t, r) => `${t.ref} to ${t.customer} could not be delivered`,
  paid: (t) => `Payment confirmed for ${t.ref} · ${money(t.payment.amount)}`,
};

export function Feed({ state, vendorId = null, limit = 8 }) {
  const events = feed(state, vendorId).filter((e) => e.kind !== "assigned").slice(0, limit);
  if (!events.length) return <Empty title="Nothing yet today" sub="Deliveries show up here the moment a rider updates them." />;
  return (
    <ol className="divide-y divide-stone-100">
      {events.map((e, i) => {
        if (e.kind === "intake") {
          const p = productById(state, e.intake.productId);
          const v = vendorById(state, e.intake.vendorId);
          return (
            <li key={i} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600"><PackagePlus className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-stone-800">{v && v.name} gave {num(e.intake.qty)} {p && p.name}</div>
                <div className="text-[12px] text-stone-400">{ago(e.at)}{e.intake.note ? ` · ${e.intake.note}` : ""}</div>
              </div>
            </li>
          );
        }
        const r = riderById(state, e.task.riderId);
        const photo = e.kind === "delivered" && e.task.proof && e.task.proof.photo;
        return (
          <li key={i} className="flex items-center gap-3 px-5 py-3">
            {photo ? (
              <img src={photo} alt={`Proof of delivery for ${e.task.ref}`} className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-stone-200" />
            ) : e.kind === "paid" ? (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Wallet className="h-4 w-4" /></span>
            ) : (
              <Avatar name={r ? r.name : "?"} color={r && r.color} size={40} className="rounded-xl" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-stone-800">{FEED_TEXT[e.kind](e.task, r)}</div>
              <div className="text-[12px] text-stone-400">{clock(e.at)} · {ago(e.at)}</div>
            </div>
            {e.kind === "delivered" && <StatusPill status={statusOf(e.task)} className="hidden sm:inline-flex" />}
          </li>
        );
      })}
    </ol>
  );
}

// One delivery, with its items, rider, payment and the doorstep photo once delivered.
export function DeliveryCard({ state, task, actions = null, showVendor = true }) {
  const [open, setOpen] = useState(false);
  const r = riderById(state, task.riderId);
  const v = vendorById(state, task.vendorId);
  const status = statusOf(task);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-stone-50/60">
        <div className="hidden w-16 shrink-0 font-mono text-[12px] text-stone-400 sm:block">{task.ref}</div>
        <Avatar name={r ? r.name : "?"} color={r && r.color} size={30} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-stone-900">{task.customer} <span className="font-normal text-stone-400">· {r && r.short}{task.time ? ` · ${time12(task.time)}` : ""}</span></div>
          <div className="truncate text-[12.5px] text-stone-500">
            {task.items.map((l) => `${l.qty} × ${(productById(state, l.productId) || {}).name}`).join(", ")}
            {showVendor && v ? ` · ${v.name}` : ""}
          </div>
        </div>
        <div className="hidden w-24 shrink-0 text-right font-mono text-[12.5px] text-stone-700 sm:block">{money(taskValue(task))}</div>
        <StatusPill status={status} />
        <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid gap-4 bg-stone-50/60 px-5 pb-5 pt-1 md:grid-cols-[1fr_220px]">
          <div className="space-y-3 text-[13px]">
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-stone-600">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {task.address || "No address"}</span>
              {task.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {task.phone}</span>}
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {task.time ? `Due ${time12(task.time)}` : "Any time today"}</span>
            </div>
            {task.note && <div className="rounded-xl border-l-2 border-orange-300 bg-white px-3 py-2 text-stone-600">{task.note}</div>}
            <div>
              <Tag>Timeline</Tag>
              <ol className="mt-1.5 space-y-1">
                {(task.history || []).map((h, i) => (
                  <li key={i} className="flex gap-3 text-stone-600"><span className="w-16 font-mono text-[12px] text-stone-400">{clock(h.at)}</span>{{ assigned: "Assigned", picked_up: "Picked up from warehouse", delivered: "Delivered", failed: `Not delivered${task.failReason ? `: ${task.failReason}` : ""}` }[h.status]}</li>
                ))}
                {task.payment && (
                  <li className="flex gap-3 text-stone-600">
                    <span className="w-16 font-mono text-[12px] text-stone-400">{task.payment.at ? clock(task.payment.at) : "—"}</span>
                    {task.payment.confirmed ? `Payment confirmed · ${money(task.payment.amount)} by ${task.payment.method}` : `Payment by ${task.payment.method} not confirmed yet`}
                  </li>
                )}
              </ol>
            </div>
            {actions}
          </div>
          <div>
            {task.proof && task.proof.photo ? (
              <figure>
                <img src={task.proof.photo} alt={`Proof of delivery for ${task.ref}`} className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-stone-200" />
                <figcaption className="mt-1.5 text-[12px] text-stone-500">Received by {task.proof.receivedBy || "customer"} · {clock(task.proof.at)}</figcaption>
              </figure>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-stone-200 bg-white text-center text-[12px] text-stone-400">
                <div><Camera className="mx-auto mb-1 h-5 w-5" />Photo appears when delivered</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PaymentActions({ task, act }) {
  if (statusOf(task) !== "awaiting") return null;
  return (
    <Btn size="sm" variant="green" onClick={() => act({ type: "task/confirmPayment", id: task.id })}><Wallet className="h-3.5 w-3.5" /> Confirm {money(task.payment.amount)} received</Btn>
  );
}

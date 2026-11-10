// The vendor portal: a vendor sees their own products, every delivery as it happens (time, photo, payment)
// and can request new deliveries. Same live data as the company and the riders.
import React, { useState } from "react";
import { Boxes, LogOut, Package, PackageCheck, Plus, Truck, Wallet } from "lucide-react";
import { PasteOrders } from "./Intake";
import { DeliveryCard, Feed, LedgerLegend, ProductTable } from "./shared";
import { isActive, isAwaitingPayment, productById, totals, useWorkspace, lineLabel } from "./store";
import { LabelCloud, MonthCal, ProgressScene, Tip } from "./scenes";
import { Avatar, Btn, Card, CardHead, Chips, Empty, Field, HeroCard, inputCls, LiveDot, Logo, Modal, Stat, StatusPill, statusOf } from "./ui";
import { money, num, time12, todayISO } from "./utils";

const ZONES = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island", "Ikoyi", "Ajah", "Gbagada"];

export default function Vendor({ vendorId, go }) {
  const { state } = useWorkspace();
  const vendor = state.vendors.find((v) => v.id === vendorId) || state.vendors[0];
  const [filter, setFilter] = useState("all");
  const [requesting, setRequesting] = useState(false);
  const s = totals(state, vendor.id);
  const tasks = state.tasks.filter((t) => t.vendorId === vendor.id);
  const orders = state.orders.filter((o) => o.vendorId === vendor.id && (o.status === "open" || o.status === "needs_fix"));
  const filters = [
    ["all", "All", () => true],
    ["out", "On the way", isActive],
    ["awaiting", "Payment to verify", isAwaitingPayment],
    ["delivered", "Delivered", (t) => t.status === "delivered"],
  ];
  const todays = tasks.filter((t) => t.date === todayISO());
  const shown = tasks.filter(filters.find((f) => f[0] === filter)[2]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[linear-gradient(180deg,#2b47f0_0%,#6b85ff_45%,#ffffff_100%)] px-4 pb-10 pt-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Logo dark />
          <span className="hidden rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white sm:inline">Vendor portal</span>
          <div className="ml-auto flex items-center gap-2">
            <select value={vendor.id} onChange={(e) => go(`#/vendor/${e.target.value}`)} className="h-10 rounded-full border-0 bg-white/20 px-4 text-[13.5px] font-semibold text-white backdrop-blur [&>option]:text-neutral-900">
              {state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <button onClick={() => go("#/")} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <HeroCard onArrow={() => setRequesting(true)} className="min-h-[250px]">
            Hey {vendor.name.split(" ")[0]}!<br />
            <span className="text-white/45">You've sold</span> {money(s.deliveredValue)}<br />
            <span className="text-white/45">and</span> {num(s.left)} <span className="text-white/45">units are left</span>
          </HeroCard>
          <div className="pb-2">
            <div className="text-[15px] font-semibold text-neutral-900/50">{vendor.name}</div>
            <h1 className="mt-1 text-[40px] font-extrabold leading-[1.03] tracking-[-0.04em] text-neutral-950">Every delivery,<br />the moment it happens.</h1>
            <div className="mt-5 flex flex-wrap items-center gap-2"><Btn size="lg" onClick={() => setRequesting(true)}><Plus className="h-5 w-5" /> Request deliveries</Btn><LiveDot /></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <Stat label="Given to company" value={num(s.received)} sub={money(s.receivedValue)} icon={Package} />
          <Stat label="Delivered" value={num(s.delivered)} sub={money(s.deliveredValue)} icon={PackageCheck} tone="green" />
          <Stat label="Left" value={num(s.left)} sub={money(s.leftValue)} icon={Boxes} tone="orange" />
          <Stat label="With riders now" value={num(s.withRiders)} sub={`${tasks.filter(isActive).length} deliveries out`} icon={Truck} tone="blue" />
          <Stat label="Payment to verify" value={num(s.awaiting)} sub={money(s.awaitingValue)} icon={Wallet} tone="amber" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <LabelCloud labels={[
              ["Waiting", orders.length], ["With riders", tasks.filter(isActive).length], ["Delivered", tasks.filter((t) => t.status === "delivered").length],
              ["To verify", tasks.filter(isAwaitingPayment).length], ["Not delivered", tasks.filter((t) => t.status === "failed").length],
            ]} onPick={() => document.getElementById("vendor-deliveries")?.scrollIntoView({ behavior: "smooth" })} />
            <div className="mt-4 px-1 text-[22px] font-extrabold tracking-[-0.03em] text-neutral-950">See what's due</div>
            <div className="px-1 text-[14px] text-neutral-400">Your orders, by where they are now.</div>
          </div>
          <div>
            <ProgressScene label={`${todays.filter((t) => t.status === "delivered").length} of ${todays.length} of your drops delivered today`} points={todays.length ? [0, 1, 2, 3, 4, 5].map((i) => todays.length - Math.round((todays.filter((t) => t.status === "delivered").length * i) / 5)) : [0, 0]} />
            <div className="mt-4 px-1 text-[22px] font-extrabold tracking-[-0.03em] text-neutral-950">See your progress</div>
            <div className="px-1 text-[14px] text-neutral-400">Today's drops counting down.</div>
          </div>
          <Card className="p-6 md:col-span-2 xl:col-span-1">
            <MonthCal counts={tasks.reduce((m, t) => ({ ...m, [t.date]: (m[t.date] || 0) + 1 }), {})} />
            <Tip className="mt-5 text-[14.5px]">Send all of a day's orders as one WhatsApp message. The office pastes it and ADA reads every order.</Tip>
          </Card>
        </div>

        <Card>
          <CardHead title="Your products" sub="Received, delivered and left, per product" right={<LedgerLegend />} />
          <div className="mt-3"><ProductTable state={state} vendorId={vendor.id} /></div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card id="vendor-deliveries" className="scroll-mt-6">
            <CardHead title="Deliveries" sub="Tap one to see the photo, who received it and the payment" />
            <Chips className="mt-4 px-5" options={filters.map(([id, label, fn]) => [id, label, tasks.filter(fn).length])} value={filter} onChange={setFilter} />
            <div className="mt-3">{shown.length ? shown.map((t) => <DeliveryCard key={t.id} state={state} task={t} showVendor={false} />) : <Empty icon={Truck} title="No deliveries here yet" />}</div>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHead title="Live" sub="As it happens" right={<LiveDot />} />
              <div className="mt-2"><Feed state={state} vendorId={vendor.id} limit={6} /></div>
            </Card>
            <Card>
              <CardHead title={`Waiting for a rider (${orders.length})`} />
              <div className="mt-2 divide-y divide-neutral-100">
                {orders.length ? orders.map((o) => (
                  <div key={o.id} className="px-5 py-3">
                    <div className="flex items-center justify-between"><span className="text-[13.5px] font-semibold">{o.customer}</span><StatusPill status={o.status} /></div>
                    <div className="text-[12.5px] text-neutral-500">{o.items.map((l) => lineLabel(state, l)).join(", ")}{o.start ? ` · ${time12(o.start)}${o.end ? `–${time12(o.end)}` : ""}` : o.end ? ` · by ${time12(o.end)}` : ""}</div>
                    {o.status === "needs_fix" && <div className="mt-0.5 text-[12px] text-rose-700">{(o.issues || []).join(" ")} {state.company.name} will check it with you.</div>}
                  </div>
                )) : <Empty title="All your requests have riders" />}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <RequestDelivery open={requesting} onClose={() => setRequesting(false)} vendor={vendor} />
    </div>
  );
}

function RequestDelivery({ open, onClose, vendor }) {
  const { state, act } = useWorkspace();
  const products = state.products.filter((p) => p.vendorId === vendor.id);
  const blank = { customer: "", phone: "", address: "", zone: "Ikeja", productId: products[0] ? products[0].id : "", qty: 1, start: "12:00", end: "16:00", note: "" };
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const product = products.find((p) => p.id === f.productId) || products[0];
  const [mode, setMode] = useState("paste");
  return (
    <Modal open={open} onClose={onClose} title="Request deliveries" wide={mode === "paste"}>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1 text-[13px] font-semibold">
        {[["paste", "Paste from WhatsApp"], ["form", "Fill a form"]].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setMode(id)} className={`h-9 rounded-full ${mode === id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>{label}</button>
        ))}
      </div>
      {mode === "paste" ? <PasteOrders vendorId={vendor.id} /> : <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); act({ type: "order/add", order: { vendorId: vendor.id, customer: f.customer, phone: f.phone, address: f.address, zone: f.zone, items: [{ productId: product.id, qty: Number(f.qty) }], start: f.start, end: f.end, note: f.note } }); setF(blank); onClose(); }}>
        <Field label="Customer"><input required value={f.customer} onChange={set("customer")} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
          <Field label="Area"><select value={f.zone} onChange={set("zone")} className={inputCls}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></Field>
        </div>
        <Field label="Address"><input required value={f.address} onChange={set("address")} className={inputCls} /></Field>
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <Field label="Product"><select value={f.productId} onChange={set("productId")} className={inputCls}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}</select></Field>
          <Field label="Qty"><input type="number" min="1" value={f.qty} onChange={set("qty")} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From"><input type="time" value={f.start} onChange={set("start")} className={inputCls} /></Field>
          <Field label="Until"><input type="time" value={f.end} onChange={set("end")} className={inputCls} /></Field>
        </div>
        <Field label="Note for the rider"><input value={f.note} onChange={set("note")} className={inputCls} /></Field>
        <div className="text-[12.5px] text-neutral-500">Customer pays {money((product ? product.price : 0) * f.qty)} on delivery.</div>
        <Btn type="submit" size="lg" className="mt-1">Send to {state.company.name}</Btn>
      </form>}
    </Modal>
  );
}

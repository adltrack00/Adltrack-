// The vendor portal: a vendor sees their own products, every delivery as it happens (time, photo, payment)
// and can request new deliveries. Same live data as the company and the riders.
import React, { useState } from "react";
import { Boxes, LogOut, Package, PackageCheck, Plus, Truck, Wallet } from "lucide-react";
import { DeliveryCard, Feed, LedgerLegend, ProductTable } from "./shared";
import { isActive, isAwaitingPayment, productById, totals, useWorkspace } from "./store";
import { Avatar, Btn, Card, CardHead, Empty, Field, inputCls, LiveDot, Logo, Modal, Stat, StatusPill, statusOf } from "./ui";
import { money, num, time12 } from "./utils";

const ZONES = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island", "Ikoyi", "Ajah", "Gbagada"];

export default function Vendor({ vendorId, go }) {
  const { state } = useWorkspace();
  const vendor = state.vendors.find((v) => v.id === vendorId) || state.vendors[0];
  const [filter, setFilter] = useState("all");
  const [requesting, setRequesting] = useState(false);
  const s = totals(state, vendor.id);
  const tasks = state.tasks.filter((t) => t.vendorId === vendor.id);
  const orders = state.orders.filter((o) => o.vendorId === vendor.id && o.status === "open");
  const filters = [
    ["all", "All", () => true],
    ["out", "On the way", isActive],
    ["awaiting", "Payment to verify", isAwaitingPayment],
    ["delivered", "Delivered", (t) => t.status === "delivered"],
  ];
  const shown = tasks.filter(filters.find((f) => f[0] === filter)[2]);

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      <header className="border-b border-stone-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <Logo />
          <span className="hidden rounded-full bg-stone-100 px-2.5 py-1 text-[11.5px] font-semibold text-stone-600 sm:inline">Vendor portal</span>
          <div className="ml-auto flex items-center gap-3">
            <select value={vendor.id} onChange={(e) => go(`#/vendor/${e.target.value}`)} className="h-9 rounded-full border border-stone-200 bg-white px-3 text-[13px] font-semibold text-stone-800">
              {state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <button onClick={() => go("#/")} className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-600" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={vendor.name} color={vendor.color} size={48} className="rounded-2xl" />
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-stone-900">{vendor.name}</h1>
              <div className="text-[13px] text-stone-500">Your stock with {state.company.name} · updated the moment a rider delivers</div>
            </div>
          </div>
          <div className="flex items-center gap-2"><LiveDot /><Btn onClick={() => setRequesting(true)}><Plus className="h-4 w-4" /> Request a delivery</Btn></div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <Stat label="Given to company" value={num(s.received)} sub={money(s.receivedValue)} icon={Package} />
          <Stat label="Delivered" value={num(s.delivered)} sub={money(s.deliveredValue)} icon={PackageCheck} tone="green" />
          <Stat label="Left" value={num(s.left)} sub={money(s.leftValue)} icon={Boxes} tone="orange" />
          <Stat label="With riders now" value={num(s.withRiders)} sub={`${tasks.filter(isActive).length} deliveries out`} icon={Truck} tone="blue" />
          <Stat label="Payment to verify" value={num(s.awaiting)} sub={money(s.awaitingValue)} icon={Wallet} tone="amber" />
        </div>

        <Card>
          <CardHead title="Your products" sub="Received, delivered and left, per product" right={<LedgerLegend />} />
          <div className="mt-3"><ProductTable state={state} vendorId={vendor.id} /></div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHead title="Deliveries" sub="Tap one to see the photo, who received it and the payment" />
            <div className="mt-3 flex flex-wrap gap-2 px-5">
              {filters.map(([id, label, fn]) => (
                <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-3 py-1 text-[12.5px] font-semibold ${filter === id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>{label} <span className="opacity-60">{tasks.filter(fn).length}</span></button>
              ))}
            </div>
            <div className="mt-3">{shown.length ? shown.map((t) => <DeliveryCard key={t.id} state={state} task={t} showVendor={false} />) : <Empty icon={Truck} title="No deliveries here yet" />}</div>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHead title="Live" sub="As it happens" right={<LiveDot />} />
              <div className="mt-2"><Feed state={state} vendorId={vendor.id} limit={6} /></div>
            </Card>
            <Card>
              <CardHead title={`Waiting for a rider (${orders.length})`} />
              <div className="mt-2 divide-y divide-stone-100">
                {orders.length ? orders.map((o) => (
                  <div key={o.id} className="px-5 py-3">
                    <div className="flex items-center justify-between"><span className="text-[13.5px] font-semibold">{o.customer}</span><StatusPill status="open" /></div>
                    <div className="text-[12.5px] text-stone-500">{o.items.map((l) => `${l.qty} × ${(productById(state, l.productId) || {}).name}`).join(", ")} · {time12(o.start)}–{time12(o.end)}</div>
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
  return (
    <Modal open={open} onClose={onClose} title="Request a delivery">
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); act({ type: "order/add", order: { vendorId: vendor.id, customer: f.customer, phone: f.phone, address: f.address, zone: f.zone, items: [{ productId: product.id, qty: Number(f.qty) }], start: f.start, end: f.end, note: f.note } }); setF(blank); onClose(); }}>
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
        <div className="text-[12.5px] text-stone-500">Customer pays {money((product ? product.price : 0) * f.qty)} on delivery.</div>
        <Btn type="submit" size="lg" className="mt-1">Send to {state.company.name}</Btn>
      </form>
    </Modal>
  );
}

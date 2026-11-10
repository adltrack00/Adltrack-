// The vendor portal: a vendor sees their own products, every delivery as it happens (time, photo, payment)
// and can request new deliveries. Same live data as the company and the riders.
import React, { useEffect, useState } from "react";
import { Boxes, MessageSquare, Package, PackageCheck, Plus, Send, Truck, User, Wallet } from "lucide-react";
import { PasteOrders } from "./Intake";
import { DeliveryCard, Feed, LedgerLegend, ProductTable } from "./shared";
import { isActive, isAwaitingPayment, productById, totals, useWorkspace, lineLabel } from "./store";
import { LabelCloud, MonthCal, ProgressScene, Tip } from "./scenes";
import { Avatar, Btn, Card, CardHead, Chips, Empty, Field, HeroCard, inputCls, LiveDot, Logo, Modal, Stat, StatusPill, statusOf } from "./ui";
import { clock, money, num, time12, todayISO } from "./utils";

const ZONES = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island", "Ikoyi", "Ajah", "Gbagada"];

export default function Vendor({ vendorId, go }) {
  const { state } = useWorkspace();
  const vendor = state.vendors.find((v) => v.id === vendorId);
  if (!vendor) return <NotLinked go={go} company={state.company.name} />;
  return <VendorDashboard vendor={vendor} go={go} />;
}

// The company removed this vendor from its list, or the account isn't tied to one yet.
export function NotLinked({ go, company, what = "vendor" }) {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-6 text-center">
      <div className="max-w-sm">
        <Logo />
        <h1 className="mt-8 text-[28px] font-extrabold tracking-tight">Not set up yet</h1>
        <p className="mt-2 text-[15px] text-neutral-500">{company || "Your company"} hasn't linked your account to a {what} yet. Ask them to send you a new invite from their Team page.</p>
        <Btn className="mt-6" onClick={() => go("/account")}>Your account</Btn>
      </div>
    </div>
  );
}

function VendorDashboard({ vendor, go }) {
  const { state } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const [requesting, setRequesting] = useState(false);
  const [chat, setChat] = useState(false);
  const unread = state.messages.filter((m) => m.vendorId === vendor.id && m.from !== "vendor" && !m.read).length;
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
            <span className="hidden max-w-[220px] truncate text-[13.5px] font-semibold text-white/90 sm:inline">{vendor.name}</span>
            <button onClick={() => setChat(true)} className="relative flex h-10 items-center gap-1.5 rounded-full bg-white/20 px-4 text-[13.5px] font-semibold text-white backdrop-blur" data-testid="vendor-messages">
              <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">Message {state.company.name || "the office"}</span><span className="sm:hidden">Messages</span>
              {!!unread && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10.5px] font-bold">{unread}</span>}
            </button>
            <button onClick={() => go("/account")} className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white" aria-label="Your account" data-testid="account"><User className="h-4 w-4" /></button>
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
      <OfficeChat open={chat} onClose={() => setChat(false)} vendor={vendor} />
    </div>
  );
}

// The vendor's conversation with the office.
function OfficeChat({ open, onClose, vendor }) {
  const { state, act } = useWorkspace();
  const [text, setText] = useState("");
  const msgs = state.messages.filter((m) => m.vendorId === vendor.id);
  const unread = msgs.filter((m) => m.from !== "vendor" && !m.read).length;
  useEffect(() => { if (open && unread) act({ type: "messages/read", by: "vendor", vendorId: vendor.id }); }, [open, unread, act, vendor.id]);
  return (
    <Modal open={open} onClose={onClose} title={state.company.name || "The office"}>
      <div className="max-h-[50vh] min-h-[200px] space-y-3 overflow-y-auto">
        {msgs.map((m) => (
          <div key={m.id} className={`max-w-[82%] ${m.from === "vendor" ? "ml-auto" : ""}`}>
            <div className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug ${m.from === "vendor" ? "rounded-br-md bg-neutral-900 text-white" : "rounded-bl-md bg-neutral-100 text-neutral-800"}`}>{m.text}</div>
            <div className={`mt-1 text-[11px] text-neutral-400 ${m.from === "vendor" ? "text-right" : ""}`}>{m.from === "vendor" ? "You · " : ""}{clock(m.at)}</div>
          </div>
        ))}
        {!msgs.length && <Empty icon={MessageSquare} title="No messages yet" sub="Ask about a delivery, a payment or tomorrow's stock." />}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { act({ type: "messages/send", messages: [{ vendorId: vendor.id, from: "vendor", text: text.trim() }] }); setText(""); } }} className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" className={`${inputCls} h-12 rounded-full px-4`} />
        <Btn size="lg" className="h-12" type="submit" aria-label="Send"><Send className="h-4 w-4" /></Btn>
      </form>
    </Modal>
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

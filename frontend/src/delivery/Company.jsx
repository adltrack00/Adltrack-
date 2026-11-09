// The delivery company's dashboard: vendors, riders, stock, deliveries and ADA.
import React, { useMemo, useState } from "react";
import {
  ArrowRight, Bike, Boxes, Building2, ClipboardList, LayoutGrid, LogOut, Menu, MessageSquare, Package, PackageCheck, Plus, Send, Sparkles, Truck, Wallet, X,
} from "lucide-react";
import { AdaPanel } from "./AdaPanel";
import { DeliveryCard, Feed, LedgerLegend, PaymentActions, ProductTable } from "./shared";
import { isActive, isAwaitingPayment, productById, productLedger, riderLoad, totals, units as taskUnits, useWorkspace, vendorById } from "./store";
import { AdaMark, Avatar, Bar, Btn, Card, CardHead, Empty, Field, inputCls, LedgerBar, LiveDot, Logo, Modal, StatusPill, Stat, statusOf, Tag } from "./ui";
import { ago, clock, money, num, time12, todayISO } from "./utils";

const NAV = [
  ["overview", "Overview", LayoutGrid],
  ["deliveries", "Deliveries", Truck],
  ["orders", "Orders", ClipboardList],
  ["stock", "Vendors & stock", Boxes],
  ["riders", "Riders", Bike],
  ["messages", "Messages", MessageSquare],
];

export default function Company({ go }) {
  const { state } = useWorkspace();
  const [tab, setTab] = useState("overview");
  const [ada, setAda] = useState(false);
  const [seed, setSeed] = useState("");
  const [nav, setNav] = useState(false);
  const openAda = (say = "") => { setSeed(say); setAda(true); };
  const openOrders = state.orders.filter((o) => o.status === "open").length;
  const unread = state.messages.filter((m) => m.from === "rider" && !m.read).length;

  const Section = { overview: Overview, deliveries: Deliveries, orders: Orders, stock: Stock, riders: Riders, messages: Messages }[tab];

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200/80 bg-white px-4 py-5 transition-transform lg:translate-x-0 ${nav ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2"><Logo /><button className="lg:hidden" onClick={() => setNav(false)} aria-label="Close menu"><X className="h-5 w-5 text-stone-500" /></button></div>
        <div className="mt-2 px-2 text-[12px] text-stone-400">Company workspace · {state.company.city}</div>
        <nav className="mt-6 grid gap-1">
          {NAV.map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setTab(id); setNav(false); }} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${tab === id ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"}`}>
              <Icon className="h-[18px] w-[18px]" /> {label}
              {id === "orders" && openOrders > 0 && <span className={`ml-auto rounded-full px-2 text-[11px] font-bold ${tab === id ? "bg-white/20" : "bg-orange-100 text-orange-700"}`}>{openOrders}</span>}
              {id === "messages" && unread > 0 && <span className="ml-auto h-2 w-2 rounded-full bg-orange-500" />}
            </button>
          ))}
        </nav>
        <button onClick={() => openAda()} className="mt-6 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 text-left">
          <AdaMark size={32} />
          <div className="mt-3 text-[14px] font-bold text-stone-900">Ask ADA</div>
          <div className="mt-0.5 text-[12.5px] leading-snug text-stone-500">Tell ADA the stock you got. ADA dispatches the rest.</div>
        </button>
        <div className="mt-auto grid gap-1 border-t border-stone-100 pt-4 text-[13px]">
          <button onClick={() => go("#/vendor/v-glow")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100"><Building2 className="h-4 w-4" /> Open a vendor portal</button>
          <button onClick={() => go("#/rider/r-tunde")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100"><Bike className="h-4 w-4" /> Open the rider app</button>
          <button onClick={() => go("#/")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-100"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200/70 bg-[#f6f5f2]/90 px-4 py-3.5 backdrop-blur sm:px-8">
          <button className="lg:hidden" onClick={() => setNav(true)} aria-label="Open menu"><Menu className="h-5 w-5 text-stone-700" /></button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] font-bold tracking-tight text-stone-900">{NAV.find((n) => n[0] === tab)[1]}</h1>
            <div className="text-[12.5px] text-stone-500">{new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          <LiveDot label="Synced with vendors & riders" />
          <Btn onClick={() => openAda()} className="hidden sm:inline-flex"><Sparkles className="h-4 w-4 text-orange-300" /> Ask ADA</Btn>
        </header>
        <main className="px-4 py-6 sm:px-8">
          <Section openAda={openAda} setTab={setTab} />
        </main>
      </div>

      <button onClick={() => openAda()} className="fixed bottom-5 right-5 z-30 sm:hidden" aria-label="Ask ADA"><AdaMark size={56} /></button>
      <AdaPanel open={ada} onClose={() => setAda(false)} seed={seed} onSeedUsed={() => setSeed("")} />
    </div>
  );
}

/* ---------- Overview ---------- */

function Overview({ openAda, setTab }) {
  const { state, act } = useWorkspace();
  const t = totals(state);
  const today = state.tasks.filter((x) => x.date === todayISO());
  const online = state.riders.filter((r) => r.online).length;
  const awaiting = state.tasks.filter(isAwaitingPayment);
  const [say, setSay] = useState("");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Vendors" value={state.vendors.length} sub={`${state.products.length} products`} icon={Building2} tone="violet" />
        <Stat label="Riders" value={state.riders.length} sub={`${online} on duty now`} icon={Bike} tone="blue" />
        <Stat label="Units received" value={num(t.received)} sub={money(t.receivedValue)} icon={Package} />
        <Stat label="Delivered" value={num(t.delivered)} sub={money(t.deliveredValue)} icon={PackageCheck} tone="green" />
        <Stat label="Left" value={num(t.left)} sub={`${num(t.withRiders)} with riders · ${num(t.inWarehouse)} in warehouse`} icon={Boxes} tone="orange" />
        <Stat label="Payment to verify" value={awaiting.length} sub={money(t.awaitingValue)} icon={Wallet} tone="amber" />
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div className="flex gap-4">
            <AdaMark size={48} />
            <div>
              <div className="text-[18px] font-bold tracking-tight text-stone-900">Tell ADA what came in today</div>
              <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-stone-500">Say what each vendor dropped off. ADA adds it to stock, splits today's {state.orders.filter((o) => o.status === "open").length} open orders across riders within their daily allocation, works out what each rider collects and messages them. You approve before anything is sent.</p>
            </div>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); openAda(say || "Dispatch today's orders"); setSay(""); }} className="flex w-full gap-2 md:w-[420px]">
            <input value={say} onChange={(e) => setSay(e.target.value)} placeholder="GlowSkin dropped 40 serums. Dispatch today's orders." className={`${inputCls} h-11 rounded-full px-4`} />
            <Btn size="lg" className="h-11 shrink-0" type="submit"><Send className="h-4 w-4" /></Btn>
          </form>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHead title="Vendors" sub="What each vendor gave you, delivered and left. Updates the moment a rider confirms a delivery." right={<button onClick={() => setTab("stock")} className="text-[13px] font-semibold text-orange-600">Stock <ArrowRight className="inline h-3.5 w-3.5" /></button>} />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[13px]">
              <thead><tr className="border-b border-stone-100 text-stone-400"><th className="px-5 py-2 font-medium">Vendor</th><th className="px-3 py-2 text-right font-medium">Given</th><th className="px-3 py-2 text-right font-medium">Delivered</th><th className="px-3 py-2 text-right font-medium">Left</th><th className="px-3 py-2 text-right font-medium">Sales</th><th className="w-36 px-5 py-2 font-medium" /></tr></thead>
              <tbody>
                {state.vendors.map((v) => {
                  const s = totals(state, v.id);
                  return (
                    <tr key={v.id} className="border-b border-stone-50 last:border-0">
                      <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Avatar name={v.name} color={v.color} size={30} className="rounded-lg" /><div><div className="font-semibold text-stone-900">{v.name}</div><div className="text-[12px] text-stone-400">{v.contact}</div></div></div></td>
                      <td className="px-3 py-3 text-right tabular-nums">{num(s.received)}</td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-600">{num(s.delivered)}</td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">{num(s.left)}</td>
                      <td className="px-3 py-3 text-right font-mono text-[12.5px]">{money(s.deliveredValue)}</td>
                      <td className="px-5 py-3"><LedgerBar received={s.received} delivered={s.delivered} withRiders={s.withRiders} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-4 pt-2"><LedgerLegend /></div>
        </Card>

        <Card>
          <CardHead title="Live activity" sub="Riders' updates, photos and payments" right={<LiveDot />} />
          <div className="mt-2"><Feed state={state} limit={7} /></div>
        </Card>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_1.3fr]">
        <Card>
          <CardHead title="Riders today" sub="Units given against each rider's daily allocation" right={<button onClick={() => setTab("riders")} className="text-[13px] font-semibold text-orange-600">All riders <ArrowRight className="inline h-3.5 w-3.5" /></button>} />
          <div className="mt-3 divide-y divide-stone-100">
            {state.riders.map((r) => {
              const l = riderLoad(state, r.id);
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={r.name} color={r.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="whitespace-nowrap text-[14px] font-semibold text-stone-900">{r.name}</span><span className={`h-1.5 w-1.5 rounded-full ${r.online ? "bg-emerald-500" : "bg-stone-300"}`} /><span className="text-[12px] text-stone-400">{r.zone}</span></div>
                    <div className="mt-1.5 flex items-center gap-3"><Bar value={l.units} max={r.dailyUnits} tone={l.units > r.dailyUnits ? "red" : "orange"} className="max-w-[180px]" /><span className="text-[12px] tabular-nums text-stone-500">{l.units}/{r.dailyUnits} units</span></div>
                  </div>
                  <div className="text-right text-[12.5px]"><div className="font-semibold text-stone-800">{l.done}/{l.tasks.length} done</div><div className="font-mono text-stone-500">{money(l.collected)}</div></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHead title="Today's deliveries" sub={`${today.filter((x) => x.status === "delivered").length} of ${today.length} delivered`} right={<button onClick={() => setTab("deliveries")} className="text-[13px] font-semibold text-orange-600">All <ArrowRight className="inline h-3.5 w-3.5" /></button>} />
          <div className="mt-2">
            {today.slice(0, 5).map((t) => <DeliveryCard key={t.id} state={state} task={t} actions={<PaymentActions task={t} act={act} />} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Deliveries ---------- */

function Deliveries({ openAda }) {
  const { state, act } = useWorkspace();
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);
  const filters = [
    ["all", "All", () => true],
    ["out", "Out now", isActive],
    ["awaiting", "Payment to verify", isAwaitingPayment],
    ["delivered", "Delivered", (t) => t.status === "delivered"],
    ["failed", "Not delivered", (t) => t.status === "failed"],
  ];
  const list = state.tasks.filter(filters.find((f) => f[0] === filter)[2]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map(([id, label, fn]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${filter === id ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"}`}>
            {label} <span className="opacity-60">{state.tasks.filter(fn).length}</span>
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Btn variant="ghost" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> New delivery</Btn>
          <Btn onClick={() => openAda("Dispatch today's orders")}><Sparkles className="h-4 w-4 text-orange-300" /> Dispatch with ADA</Btn>
        </div>
      </div>
      <Card>
        {list.length ? list.map((t) => (
          <DeliveryCard key={t.id} state={state} task={t} actions={
            <div className="flex flex-wrap items-center gap-2">
              <PaymentActions task={t} act={act} />
              {isActive(t) && (
                <label className="flex items-center gap-2 text-[12.5px] text-stone-500">Rider
                  <select value={t.riderId} onChange={(e) => act({ type: "task/reassign", id: t.id, riderId: e.target.value })} className="h-8 rounded-lg border border-stone-200 bg-white px-2 text-[12.5px] text-stone-800">
                    {state.riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </label>
              )}
            </div>
          } />
        )) : <Empty icon={Truck} title="No deliveries here" sub="Ask ADA to dispatch today's orders, or add one yourself." />}
      </Card>
      <NewDelivery open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function NewDelivery({ open, onClose }) {
  const { state, act } = useWorkspace();
  const blank = { customer: "", phone: "", address: "", time: "", riderId: state.riders[0].id, productId: state.products[0].id, qty: 1 };
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const product = productById(state, f.productId);
  const free = product ? productLedger(state, product).inWarehouse : 0;
  const save = (e) => {
    e.preventDefault();
    act({ type: "deliveries/create", by: "dispatcher", deliveries: [{ riderId: f.riderId, vendorId: product.vendorId, customer: f.customer, phone: f.phone, address: f.address, zone: "", time: f.time, items: [{ productId: f.productId, qty: Number(f.qty) }] }] });
    const r = state.riders.find((x) => x.id === f.riderId);
    act({ type: "messages/send", messages: [{ riderId: f.riderId, from: "dispatcher", text: `New drop: ${f.qty} × ${product.name} to ${f.customer}, ${f.address}${f.time ? ` by ${time12(f.time)}` : ""}. Collect ${money(product.price * f.qty)}.` }] });
    setF(blank);
    onClose();
    return r;
  };
  return (
    <Modal open={open} onClose={onClose} title="New delivery">
      <form onSubmit={save} className="grid gap-3">
        <Field label="Customer"><input required value={f.customer} onChange={set("customer")} className={inputCls} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><input value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
          <Field label="Deliver by"><input type="time" value={f.time} onChange={set("time")} className={inputCls} /></Field>
        </div>
        <Field label="Address"><input required value={f.address} onChange={set("address")} className={inputCls} /></Field>
        <div className="grid grid-cols-[1fr_90px] gap-3">
          <Field label="Product">
            <select value={f.productId} onChange={set("productId")} className={inputCls}>
              {state.products.map((p) => <option key={p.id} value={p.id}>{p.name} · {(vendorById(state, p.vendorId) || {}).name}</option>)}
            </select>
          </Field>
          <Field label="Qty"><input type="number" min="1" max={free} value={f.qty} onChange={set("qty")} className={inputCls} /></Field>
        </div>
        <div className="text-[12px] text-stone-500">{free} in the warehouse · collect {money((product ? product.price : 0) * f.qty)}</div>
        <Field label="Rider">
          <select value={f.riderId} onChange={set("riderId")} className={inputCls}>
            {state.riders.map((r) => { const l = riderLoad(state, r.id); return <option key={r.id} value={r.id}>{r.name} · {l.units}/{r.dailyUnits} units today</option>; })}
          </select>
        </Field>
        <Btn type="submit" size="lg" className="mt-2" disabled={!product || f.qty > free}>Create and message rider</Btn>
      </form>
    </Modal>
  );
}

/* ---------- Orders ---------- */

function Orders({ openAda }) {
  const { state } = useWorkspace();
  const open = state.orders.filter((o) => o.status === "open");
  const planned = state.orders.filter((o) => o.status !== "open");
  const Row = ({ o }) => {
    const v = vendorById(state, o.vendorId);
    const value = o.items.reduce((s, l) => s + l.qty * ((productById(state, l.productId) || {}).price || 0), 0);
    return (
      <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 px-5 py-3.5 last:border-0">
        <div className="w-20 font-mono text-[12px] text-stone-400">{o.id}</div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-stone-900">{o.customer} <span className="font-normal text-stone-400">· {o.zone}</span></div>
          <div className="text-[12.5px] text-stone-500">{o.items.map((l) => `${l.qty} × ${(productById(state, l.productId) || {}).name}`).join(", ")} · {v && v.name}</div>
        </div>
        <div className="text-[12.5px] text-stone-500">{time12(o.start)}–{time12(o.end)}</div>
        <div className="w-24 text-right font-mono text-[12.5px]">{money(value)}</div>
        <StatusPill status={o.status} />
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHead title={`Waiting for a rider (${open.length})`} sub="Delivery requests from vendors. ADA assigns them by zone, stock and each rider's daily allocation." right={<Btn onClick={() => openAda("Dispatch today's orders")} disabled={!open.length}><Sparkles className="h-4 w-4 text-orange-300" /> Dispatch all with ADA</Btn>} />
        <div className="mt-3">{open.length ? open.map((o) => <Row key={o.id} o={o} />) : <Empty title="Every order has a rider" sub="New requests from vendors show up here." />}</div>
      </Card>
      {!!planned.length && (
        <Card>
          <CardHead title="Assigned" />
          <div className="mt-3">{planned.map((o) => <Row key={o.id} o={o} />)}</div>
        </Card>
      )}
    </div>
  );
}

/* ---------- Vendors & stock ---------- */

function Stock({ openAda }) {
  const { state, act } = useWorkspace();
  const [receiving, setReceiving] = useState(false);
  const [addingVendor, setAddingVendor] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <LedgerLegend />
        <div className="ml-auto flex gap-2">
          <Btn variant="ghost" onClick={() => setAddingVendor(true)}><Plus className="h-4 w-4" /> Vendor</Btn>
          <Btn variant="ghost" onClick={() => setReceiving(true)}><Package className="h-4 w-4" /> Receive stock</Btn>
          <Btn onClick={() => openAda()}><Sparkles className="h-4 w-4 text-orange-300" /> Tell ADA instead</Btn>
        </div>
      </div>
      {state.vendors.map((v) => {
        const s = totals(state, v.id);
        return (
          <Card key={v.id}>
            <CardHead
              title={<span className="flex items-center gap-2.5"><Avatar name={v.name} color={v.color} size={28} className="rounded-lg" />{v.name}</span>}
              sub={`${v.contact} · ${v.phone}`}
              right={<div className="text-right text-[12.5px] text-stone-500"><div><b className="text-stone-900">{num(s.left)}</b> of {num(s.received)} left</div><div className="font-mono">{money(s.deliveredValue)} sold</div></div>}
            />
            <div className="mt-3"><ProductTable state={state} vendorId={v.id} /></div>
          </Card>
        );
      })}
      <Card>
        <CardHead title="Stock received" sub="Every drop-off from a vendor" />
        <div className="mt-2 divide-y divide-stone-100">
          {state.intake.slice(0, 12).map((i) => {
            const p = productById(state, i.productId);
            return (
              <div key={i.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                <span className="w-20 font-mono text-[12px] text-stone-400">{ago(i.at)}</span>
                <span className="flex-1 text-stone-800">{num(i.qty)} × {p && p.name} <span className="text-stone-400">· {(vendorById(state, i.vendorId) || {}).name}</span></span>
                <span className="font-mono text-[12px] text-stone-500">{money(i.price)} each</span>
              </div>
            );
          })}
        </div>
      </Card>
      <ReceiveStock open={receiving} onClose={() => setReceiving(false)} act={act} state={state} />
      <AddVendor open={addingVendor} onClose={() => setAddingVendor(false)} act={act} />
    </div>
  );
}

function ReceiveStock({ open, onClose, act, state }) {
  const [f, setF] = useState({ vendorId: state.vendors[0].id, productId: "", name: "", unit: "unit", qty: 10, price: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const products = state.products.filter((p) => p.vendorId === f.vendorId);
  const existing = products.find((p) => p.id === f.productId);
  return (
    <Modal open={open} onClose={onClose} title="Receive stock from a vendor">
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); act({ type: "stock/receive", lines: [{ vendorId: f.vendorId, productId: f.productId || null, name: f.name, unit: f.unit, qty: Number(f.qty), price: Number(f.price) || (existing ? existing.price : 0) }] }); onClose(); }}>
        <Field label="Vendor"><select value={f.vendorId} onChange={(e) => setF({ ...f, vendorId: e.target.value, productId: "" })} className={inputCls}>{state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
        <Field label="Product"><select value={f.productId} onChange={set("productId")} className={inputCls}><option value="">New product…</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        {!f.productId && <div className="grid grid-cols-[1fr_100px] gap-3"><Field label="Name"><input required value={f.name} onChange={set("name")} className={inputCls} /></Field><Field label="Unit"><input value={f.unit} onChange={set("unit")} className={inputCls} /></Field></div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity"><input type="number" min="1" required value={f.qty} onChange={set("qty")} className={inputCls} /></Field>
          <Field label="Unit price (₦)"><input type="number" min="0" placeholder={existing ? String(existing.price) : ""} required={!existing} value={f.price} onChange={set("price")} className={inputCls} /></Field>
        </div>
        <Btn type="submit" size="lg" className="mt-2">Add to stock</Btn>
      </form>
    </Modal>
  );
}

function AddVendor({ open, onClose, act }) {
  const [f, setF] = useState({ name: "", contact: "", phone: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={open} onClose={onClose} title="Add a vendor">
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); act({ type: "vendor/add", vendor: f }); setF({ name: "", contact: "", phone: "" }); onClose(); }}>
        <Field label="Business name"><input required value={f.name} onChange={set("name")} className={inputCls} /></Field>
        <Field label="Contact person"><input value={f.contact} onChange={set("contact")} className={inputCls} /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set("phone")} className={inputCls} /></Field>
        <Btn type="submit" size="lg" className="mt-2">Add vendor</Btn>
      </form>
    </Modal>
  );
}

/* ---------- Riders ---------- */

function Riders() {
  const { state, act } = useWorkspace();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {state.riders.map((r) => {
        const l = riderLoad(state, r.id);
        return (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between">
              <Avatar name={r.name} color={r.color} size={48} />
              <button onClick={() => act({ type: "rider/online", id: r.id, online: !r.online })} className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${r.online ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>{r.online ? "On duty" : "Off duty"}</button>
            </div>
            <div className="mt-3 text-[16px] font-bold text-stone-900">{r.name}</div>
            <div className="text-[12.5px] text-stone-500">{r.zone} · {r.vehicle}</div>
            <div className="mt-4 flex items-baseline justify-between"><Tag>Today's allocation</Tag><span className="text-[13px] font-semibold tabular-nums">{l.units}/{r.dailyUnits}</span></div>
            <Bar value={l.units} max={r.dailyUnits} tone={l.units > r.dailyUnits ? "red" : "orange"} className="mt-2" />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-stone-50 py-2"><div className="text-[17px] font-bold">{l.tasks.length}</div><div className="text-[11px] text-stone-500">Drops</div></div>
              <div className="rounded-xl bg-stone-50 py-2"><div className="text-[17px] font-bold text-emerald-600">{l.done}</div><div className="text-[11px] text-stone-500">Done</div></div>
              <div className="rounded-xl bg-stone-50 py-2"><div className="text-[17px] font-bold text-orange-600">{l.open}</div><div className="text-[11px] text-stone-500">Out</div></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12.5px]"><span className="text-stone-500">Collected today</span><span className="font-mono font-semibold">{money(l.collected)}</span></div>
            <div className="mt-3 space-y-1.5">
              {l.tasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-[12.5px]"><span className="truncate text-stone-700">{t.customer}</span><StatusPill status={statusOf(t)} /></div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Messages ---------- */

function Messages() {
  const { state, act } = useWorkspace();
  const [riderId, setRiderId] = useState(state.riders[0].id);
  const [text, setText] = useState("");
  const thread = useMemo(() => state.messages.filter((m) => m.riderId === riderId), [state.messages, riderId]);
  const rider = state.riders.find((r) => r.id === riderId);
  return (
    <Card className="grid min-h-[560px] overflow-hidden md:grid-cols-[260px_1fr]">
      <div className="border-b border-stone-100 md:border-b-0 md:border-r">
        {state.riders.map((r) => {
          const last = [...state.messages].reverse().find((m) => m.riderId === r.id);
          return (
            <button key={r.id} onClick={() => setRiderId(r.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${r.id === riderId ? "bg-stone-50" : "hover:bg-stone-50/60"}`}>
              <Avatar name={r.name} color={r.color} />
              <div className="min-w-0"><div className="text-[14px] font-semibold text-stone-900">{r.name}</div><div className="truncate text-[12px] text-stone-500">{last ? last.text : "No messages yet"}</div></div>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-3"><Avatar name={rider.name} color={rider.color} size={32} /><div><div className="text-[14px] font-semibold">{rider.name}</div><div className="text-[12px] text-stone-500">{rider.phone}</div></div></div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {thread.map((m) => (
            <div key={m.id} className={`max-w-[80%] ${m.from === "rider" ? "" : "ml-auto"}`}>
              <div className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${m.from === "rider" ? "rounded-bl-md bg-stone-100 text-stone-800" : "rounded-br-md bg-stone-900 text-white"}`}>{m.text}</div>
              <div className={`mt-1 text-[11px] text-stone-400 ${m.from === "rider" ? "" : "text-right"}`}>{m.from === "ada" ? "ADA · " : m.from === "dispatcher" ? "You · " : ""}{clock(m.at)}</div>
            </div>
          ))}
          {!thread.length && <Empty icon={MessageSquare} title="No messages yet" />}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { act({ type: "messages/send", messages: [{ riderId, from: "dispatcher", text: text.trim() }] }); setText(""); } }} className="flex gap-2 border-t border-stone-100 p-3">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${rider.short}…`} className={`${inputCls} h-11 rounded-full px-4`} />
          <Btn size="lg" className="h-11" type="submit"><Send className="h-4 w-4" /></Btn>
        </form>
      </div>
    </Card>
  );
}

export { taskUnits };

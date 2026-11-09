// Paste a vendor's WhatsApp orders, check what ADA read, fix what's missing, add them. Used by the company
// ("Needs you"), the vendor portal and the ADA panel.
import React, { useState } from "react";
import { AlertTriangle, Check, ClipboardPaste, Flame, Gift, Plus, Trash2 } from "lucide-react";
import { blocking, checkOrder, listValue, normalizePhone, readOrders, toOrder } from "./intake";
import { useWorkspace } from "./store";
import { AdaMark, Btn, inputCls, Tag } from "./ui";
import { money } from "./utils";
import { zoneOf } from "./ada";

const EXAMPLE = `Name: Adaeze Nnaji
Phone: 0803 555 1234
Address: 15 Adeniran Ogunsanya St, Surulere
Landmark: opposite Shoprite
Item: 2 serum + 1 free soap
Amount: 25k
Urgent

Name: Tayo
Phone: 0812 345 6677
Address: 07012345678
Product: 3 black soap
Amount: 10,500
Tomorrow 2pm-5pm`;

export function PasteOrders({ vendorId = "", onAdded, compact = false }) {
  const { state, act } = useWorkspace();
  const [text, setText] = useState("");
  const [vendor, setVendor] = useState(vendorId);
  const [orders, setOrders] = useState(null);
  const [added, setAdded] = useState(null);

  const read = () => { setAdded(null); setOrders(readOrders(state, text, vendor)); };
  const save = () => {
    const list = orders.map(toOrder);
    act({ type: "order/add", orders: list });
    const ready = list.filter((o) => o.status === "open").length;
    setAdded({ ready, fix: list.length - ready });
    setOrders(null);
    setText("");
    if (onAdded) onAdded({ ready, fix: list.length - ready });
  };

  if (orders) {
    return <IntakeReview orders={orders} setOrders={setOrders} onSave={save} onBack={() => setOrders(null)} vendorFixed={!!vendorId} />;
  }
  return (
    <div className="grid gap-3">
      {added && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Added {added.ready + added.fix} {added.ready + added.fix === 1 ? "order" : "orders"}. {added.ready} ready for a rider{added.fix ? `, ${added.fix} waiting for a fix` : ""}.</span>
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={compact ? 5 : 7}
        placeholder={(vendorId ? "Paste your orders the way you'd send them on WhatsApp. One order or many." : "Paste the vendor's WhatsApp message here, as it came. One order or many.") + "\n\nName: Adaeze Nnaji\nPhone: 0803 555 1234\nAddress: 15 Adeniran Ogunsanya St, Surulere\nItem: 2 serum + 1 free soap\nAmount: 25k"}
        className="w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 font-mono text-[12.5px] leading-relaxed text-stone-800 outline-none focus:border-stone-400"
      />
      <div className="flex flex-wrap items-center gap-2">
        {!vendorId && (
          <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="h-10 rounded-full border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-700">
            <option value="">Vendor: work it out from the products</option>
            {state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}
        <button type="button" onClick={() => setText(EXAMPLE)} className="text-[12.5px] font-medium text-stone-500 underline-offset-2 hover:underline">Try an example</button>
        <Btn className="ml-auto" onClick={read} disabled={!text.trim()}><ClipboardPaste className="h-4 w-4" /> Read orders</Btn>
      </div>
    </div>
  );
}

export function IntakeReview({ orders, setOrders, onSave, onBack, vendorFixed = false, saveLabel }) {
  const { state } = useWorkspace();
  const recheck = (list) => list.map((o) => ({ ...o, issues: checkOrder(state, o, list) }));
  const edit = (i, patch) => setOrders(recheck(orders.map((o, n) => (n === i ? { ...o, ...patch } : o))));
  const remove = (i) => setOrders(recheck(orders.filter((_, n) => n !== i)));
  const ready = orders.filter((o) => !blocking(o.issues)).length;
  const fix = orders.length - ready;

  return (
    <div className="grid gap-3">
      <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-3.5">
        <AdaMark size={30} />
        <div className="text-[13.5px] leading-snug text-stone-700">
          {orders.length ? (
            <>I read <b>{orders.length} {orders.length === 1 ? "order" : "orders"}</b>. {ready} {ready === 1 ? "is" : "are"} ready{fix ? <>, <b className="text-rose-700">{fix} {fix === 1 ? "needs" : "need"} a fix</b> before a rider can go. I didn't guess anything the message doesn't say.</> : "."}</>
          ) : "I couldn't find an order in that message. Each order needs at least a name, a phone or an address."}
        </div>
      </div>
      {orders.map((o, i) => <OrderEditor key={i} order={o} onChange={(patch) => edit(i, patch)} onRemove={() => remove(i)} vendorFixed={vendorFixed} />)}
      <div className="flex gap-2">
        {onBack && <Btn variant="ghost" onClick={onBack}>Back</Btn>}
        <Btn className="flex-1" onClick={onSave} disabled={!orders.length}>
          <Check className="h-4 w-4" /> {saveLabel || (fix ? `Add ${orders.length} (${fix} kept aside to fix)` : `Add ${orders.length} ${orders.length === 1 ? "order" : "orders"}`)}
        </Btn>
      </div>
    </div>
  );
}

// One order, every field editable, with what's wrong next to it.
export function OrderEditor({ order: o, onChange, onRemove, vendorFixed = false }) {
  const { state } = useWorkspace();
  const bad = (field) => o.issues.some((x) => x.field === field && x.level === "fix");
  const cls = (field) => `${inputCls} h-9 text-[13px] ${bad(field) ? "border-rose-300 bg-rose-50/50" : ""}`;
  const products = state.products.filter((p) => !o.vendorId || p.vendorId === o.vendorId);
  const ok = !blocking(o.issues);
  const setItem = (n, patch) => onChange({ items: o.items.map((l, k) => (k === n ? { ...l, ...patch } : l)) });

  return (
    <div className={`overflow-hidden rounded-2xl border bg-white ${ok ? "border-stone-200" : "border-rose-200"}`}>
      <div className={`flex items-center gap-2 px-3.5 py-2 ${ok ? "bg-emerald-50/70" : "bg-rose-50/70"}`}>
        <Tag className={ok ? "text-emerald-700" : "text-rose-700"}>{ok ? "Ready" : "Needs a fix"}</Tag>
        {o.ref && <span className="font-mono text-[11px] text-stone-400">{o.ref}</span>}
        <button type="button" onClick={() => onChange({ urgent: !o.urgent })} className={`ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${o.urgent ? "bg-orange-500 text-white" : "bg-white text-stone-500 ring-1 ring-stone-200"}`}><Flame className="h-3 w-3" /> Urgent</button>
        {onRemove && <button type="button" onClick={onRemove} className="grid h-7 w-7 place-items-center rounded-full text-stone-400 hover:bg-white hover:text-stone-700" aria-label="Remove order"><Trash2 className="h-3.5 w-3.5" /></button>}
      </div>
      <div className="grid gap-2 p-3.5 sm:grid-cols-2">
        {!vendorFixed && (
          <select value={o.vendorId} onChange={(e) => onChange({ vendorId: e.target.value, items: [], unknown: o.unknown })} className={`${cls("vendor")} sm:col-span-2`}>
            <option value="">Which vendor?</option>
            {state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}
        <input value={o.customer} onChange={(e) => onChange({ customer: e.target.value })} placeholder="Customer name" className={cls("customer")} />
        <input value={o.phone} onChange={(e) => onChange({ phone: e.target.value, badPhone: "" })} onBlur={(e) => { const p = normalizePhone(e.target.value); if (p) onChange({ phone: p }); }} placeholder={o.badPhone ? `Phone (message said "${o.badPhone}")` : "Phone"} className={cls("phone")} />
        <input value={o.address} onChange={(e) => onChange({ address: e.target.value, zone: zoneOf(`${e.target.value} ${o.landmark}`) })} placeholder="Address a rider can find" className={`${cls("address")} sm:col-span-2`} />
        <input value={o.landmark} onChange={(e) => onChange({ landmark: e.target.value })} placeholder="Landmark (optional)" className={cls("landmark")} />
        <input value={o.altPhone} onChange={(e) => onChange({ altPhone: e.target.value })} onBlur={(e) => { const p = normalizePhone(e.target.value); if (p) onChange({ altPhone: p }); }} placeholder="Second phone (optional)" className={cls("altPhone")} />
      </div>
      <div className="border-t border-stone-100 px-3.5 py-3">
        {o.items.map((l, n) => (
          <div key={n} className="mb-2 grid grid-cols-[minmax(0,1fr)_60px_84px] items-center gap-2">
            <select value={l.productId} onChange={(e) => setItem(n, { productId: e.target.value })} className={`${inputCls} h-9 text-[13px]`}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} · {money(p.price)}</option>)}
            </select>
            <input type="number" min="0" value={l.qty} onChange={(e) => setItem(n, { qty: Math.max(0, Number(e.target.value) || 0) })} className={`${inputCls} h-9 text-center text-[13px]`} aria-label="Paid units" />
            <label className="flex items-center gap-1 text-[12px] font-semibold text-emerald-700" title="Free units: they leave the warehouse but the customer doesn't pay for them">
              <Gift className="h-3.5 w-3.5 shrink-0" />
              <input type="number" min="0" value={l.free || 0} onChange={(e) => setItem(n, { free: Math.max(0, Number(e.target.value) || 0) })} className={`${inputCls} h-9 px-1 text-center text-[13px]`} aria-label="Free units" />
            </label>
          </div>
        ))}
        {(o.unknown || []).map((u) => (
          <div key={u} className="mb-2 flex items-center justify-between rounded-lg bg-rose-50 px-2.5 py-1.5 text-[12.5px] text-rose-800">
            <span>"{u}" isn't in this vendor's stock</span>
            <button type="button" onClick={() => onChange({ unknown: o.unknown.filter((x) => x !== u) })} className="font-semibold">Remove</button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          {!!products.length && <button type="button" onClick={() => onChange({ items: [...o.items, { productId: products[0].id, qty: 1, free: 0 }] })} className="flex items-center gap-1 text-[12.5px] font-semibold text-stone-600"><Plus className="h-3.5 w-3.5" /> Product</button>}
          <label className="ml-auto flex items-center gap-2 whitespace-nowrap text-[12.5px] font-medium text-stone-600">Collect ₦
            <input type="number" min="0" value={o.amount || ""} onChange={(e) => onChange({ amount: Number(e.target.value) || 0 })} placeholder={String(listValue(state, o))} className={`${cls("amount")} w-28`} />
          </label>
          {!o.amount && o.items.length > 0 && <button type="button" onClick={() => onChange({ amount: listValue(state, o) })} className="text-[12px] font-semibold text-orange-600">Use list price</button>}
        </div>
      </div>
      {!!o.issues.length && (
        <div className="border-t border-stone-100 px-3.5 py-2.5">
          {o.issues.map((x, n) => (
            <div key={n} className={`flex gap-1.5 py-0.5 text-[12.5px] leading-snug ${x.level === "fix" ? "text-rose-700" : "text-amber-700"}`}><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {x.text}</div>
          ))}
        </div>
      )}
      {o.source && (
        <details className="border-t border-stone-100 px-3.5 py-2 text-[12px] text-stone-500">
          <summary className="cursor-pointer select-none">What the vendor sent</summary>
          <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11.5px] text-stone-600">{o.source}</pre>
        </details>
      )}
    </div>
  );
}

// Fixing an order that is already saved but was kept aside.
export function FixOrder({ order, onDone }) {
  const { state, act } = useWorkspace();
  const start = { unknown: [], badPhone: "", landmark: "", altPhone: "", ...order };
  const [o, setO] = useState({ ...start, issues: checkOrder(state, start) });
  const change = (patch) => setO((cur) => { const next = { ...cur, ...patch }; return { ...next, issues: checkOrder(state, next) }; });
  const save = () => {
    const { id, ...rest } = toOrder(o);
    act({ type: "order/update", id: order.id, patch: rest });
    onDone();
  };
  return (
    <div className="grid gap-3">
      <OrderEditor order={o} onChange={change} vendorFixed={false} />
      <div className="flex gap-2">
        <Btn variant="ghost" onClick={() => { act({ type: "order/cancel", id: order.id }); onDone(); }}>Cancel order</Btn>
        <Btn className="flex-1" onClick={save}>{blocking(o.issues) ? "Save, still needs a fix" : <><Check className="h-4 w-4" /> Save, ready for a rider</>}</Btn>
      </div>
    </div>
  );
}

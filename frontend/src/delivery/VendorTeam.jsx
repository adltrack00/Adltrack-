// A vendor's own team: the people who send out its products. The vendor's main account invites them; each one signs in
// to the same vendor dashboard with their own login. Whatever any of them adds (a product, stock sent to the office, an
// order) is saved on its own and stamped with their name, so two people working at once never undo each other, and the
// main account sees the whole picture and who did what.
import React, { useCallback, useEffect, useState } from "react";
import { Check, PackagePlus, Trash2, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { api, useAuth } from "./auth";
import { useWorkspace } from "./store";
import { InviteSheet } from "./Team";
import { Avatar, Btn, Card, CardHead, Empty, Field, inputCls, Modal } from "./ui";
import { ago, num } from "./utils";

const byName = (x) => (x && x.by && x.by.name) || "";

// Stock the vendor's team has sent: on its way until the office counts it in.
export function StockSent({ vendor, onSend }) {
  const { state, act } = useWorkspace();
  const mine = state.intake.filter((i) => i.vendorId === vendor.id && i.status !== "cancelled").slice(0, 12);
  const waiting = mine.filter((i) => i.status === "sent");
  return (
    <Card id="vendor-stock" className="scroll-mt-6">
      <CardHead title="Stock sent to the office" sub={waiting.length ? `${waiting.length} on the way, waiting to be counted in` : "Units join your stock once the office counts them in"} right={<Btn size="sm" className="shrink-0 whitespace-nowrap" onClick={onSend}><PackagePlus className="h-4 w-4" /> Send stock</Btn>} />
      <div className="mt-3">
        {mine.map((i) => {
          const p = state.products.find((x) => x.id === i.productId);
          const sent = i.status === "sent";
          return (
            <div key={i.id} className="flex items-center gap-3 border-t border-neutral-100 px-5 py-3 first:border-t-0">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${sent ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{sent ? <PackagePlus className="h-4 w-4" /> : <Check className="h-4 w-4" />}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold text-neutral-900">{num(i.sentQty ?? i.qty)} × {p ? p.name : "Product"}</div>
                <div className="truncate text-[12.5px] text-neutral-500">
                  {byName(i) ? `Sent by ${byName(i)} · ` : ""}{ago(i.at)}{i.note ? ` · ${i.note}` : ""}
                </div>
              </div>
              {sent ? (
                <>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700">On its way</span>
                  <button onClick={() => { if (window.confirm("Call off this shipment? The office hasn't counted it yet.")) act({ type: "stock/cancelSend", id: i.id }); }} className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100" aria-label="Call off"><X className="h-4 w-4" /></button>
                </>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700" title={i.countedBy ? `Counted by ${i.countedBy}` : ""}>
                  {i.countedAt ? `Counted ${num(i.qty)}${i.sentQty != null && i.sentQty !== i.qty ? ` of ${num(i.sentQty)}` : ""}` : "Received"}
                </span>
              )}
            </div>
          );
        })}
        {!mine.length && <Empty icon={PackagePlus} title="Nothing sent yet" sub="When you hand stock to the office, add it here so both sides count the same units." />}
      </div>
    </Card>
  );
}

// Send stock to the office: pick a product (or list a new one) and how many units.
export function SendStock({ open, onClose, vendor }) {
  const { state, act } = useWorkspace();
  const products = state.products.filter((p) => p.vendorId === vendor.id);
  const blank = { productId: products[0] ? products[0].id : "", name: "", unit: "unit", price: "", qty: 10, note: "" };
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    let productId = f.productId;
    if (!productId) {
      productId = `p-${Math.random().toString(36).slice(2, 9)}`;
      act({ type: "product/add", id: productId, product: { vendorId: vendor.id, name: f.name, unit: f.unit, price: Number(f.price) } });
    }
    const qty = Math.round(Number(f.qty));
    if (qty > 0) act({ type: "stock/send", lines: [{ vendorId: vendor.id, productId, qty, note: f.note.trim() }] });
    toast.success(qty > 0 ? `Sent. ${state.company.name || "The office"} will count it in.` : "Product added");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Send stock to the office">
      <form className="grid gap-3" onSubmit={submit}>
        <Field label="Product">
          <select value={f.productId} onChange={set("productId")} className={inputCls}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="">A new product…</option>
          </select>
        </Field>
        {!f.productId && (
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <Field label="Product name"><input required value={f.name} onChange={set("name")} className={inputCls} /></Field>
            <Field label="Unit"><input value={f.unit} onChange={set("unit")} className={inputCls} /></Field>
            <Field label="Price the customer pays (₦)" className="col-span-2"><input type="number" min="0" required value={f.price} onChange={set("price")} className={inputCls} /></Field>
          </div>
        )}
        <div className="grid grid-cols-[110px_1fr] gap-3">
          <Field label="Units"><input type="number" min="0" required value={f.qty} onChange={set("qty")} className={inputCls} /></Field>
          <Field label="Note (optional)"><input value={f.note} onChange={set("note")} placeholder="e.g. Batch 12, dropped by Kemi" className={inputCls} /></Field>
        </div>
        <p className="text-[12.5px] text-neutral-500">The units show as "on its way" until {state.company.name || "the office"} counts them in. Then they join your stock, so you and the office always balance the same numbers.</p>
        <Btn type="submit" size="lg" className="mt-1">Send stock</Btn>
      </form>
    </Modal>
  );
}

// The main account's view of its team: who has a login, invites, and what each person has added.
export function VendorTeam({ vendor }) {
  const { state } = useWorkspace();
  const { user } = useAuth();
  const [team, setTeam] = useState({ members: [], invites: [] });
  const [invite, setInvite] = useState(null);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const load = useCallback(async () => {
    try { setTeam(await api("/api/vendor-team")); } catch (e) { /* offline: keep what we had */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const send = async (e) => {
    e.preventDefault();
    if (user.demo) { toast("Invites are off in the demo."); return; }
    try {
      const inv = await api("/api/vendor-team/invites", { method: "POST", body: { name } });
      setInvite({ ...inv, name }); setAdding(false); setName(""); load();
    } catch (err) { toast.error(err.message); }
  };
  const remove = async (m) => {
    if (!window.confirm(`Remove ${m.name}'s login? What they added stays.`)) return;
    try { await api(`/api/vendor-team/${m.id}`, { method: "DELETE" }); load(); } catch (err) { toast.error(err.message); }
  };
  const cancel = async (code) => { try { await api(`/api/vendor-team/invites/${code}`, { method: "DELETE" }); load(); } catch (err) { toast.error(err.message); } };

  // What each person added, counted from the shared data.
  const activity = (id) => {
    const orders = state.orders.filter((o) => o.vendorId === vendor.id && o.by && o.by.id === id).length;
    const sent = state.intake.filter((i) => i.vendorId === vendor.id && i.status !== "cancelled" && i.by && i.by.id === id).reduce((s, i) => s + (i.sentQty ?? i.qty), 0);
    const products = state.products.filter((p) => p.vendorId === vendor.id && p.by && p.by.id === id).length;
    return [orders && `${num(orders)} order${orders === 1 ? "" : "s"}`, sent && `${num(sent)} units sent`, products && `${products} product${products === 1 ? "" : "s"} added`].filter(Boolean).join(" · ");
  };

  return (
    <Card id="vendor-team" className="scroll-mt-6">
      <CardHead title="Your team" sub="Everyone who sends out your products. Each person has their own login, and everything they add shows here with their name." right={<Btn size="sm" className="shrink-0 whitespace-nowrap" onClick={() => setAdding(true)}><UserPlus className="h-4 w-4" /> Add someone</Btn>} />
      <div className="mt-3">
        {team.members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 border-t border-neutral-100 px-5 py-3.5 first:border-t-0">
            <Avatar name={m.name} color={m.teammate ? "#8b5cf6" : vendor.color || "#2b47f0"} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-semibold text-neutral-900">{m.name}{m.id === user.id ? " (you)" : ""}<span className="ml-2 text-[12px] font-medium text-neutral-400">{m.teammate ? "Team" : "Main account"}</span></div>
              <div className="truncate text-[12.5px] text-neutral-500">{activity(m.id) || "Nothing added yet"}{m.lastSeen ? ` · seen ${ago(new Date(m.lastSeen * 1000).toISOString())}` : ""}</div>
            </div>
            {m.teammate && <button onClick={() => remove(m)} className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${m.name}'s login`}><Trash2 className="h-4 w-4" /></button>}
          </div>
        ))}
        {team.invites.map((i) => (
          <div key={i.code} className="flex items-center gap-3 border-t border-neutral-100 px-5 py-3.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100"><Users className="h-4 w-4 text-neutral-500" /></span>
            <div className="min-w-0 flex-1 text-[14px] text-neutral-600">{i.name || "Teammate"} · invite <b className="font-mono">{i.code}</b> not used yet</div>
            <Btn size="sm" variant="ghost" onClick={() => setInvite(i)}>Share</Btn>
            <button onClick={() => cancel(i.code)} className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100" aria-label="Cancel invite"><X className="h-4 w-4" /></button>
          </div>
        ))}
        {!team.members.length && <Empty icon={Users} title="Just you so far" />}
      </div>
      <Modal open={adding} onClose={() => setAdding(false)} title="Add someone to your team">
        <form onSubmit={send} className="grid gap-3">
          <Field label="Their name"><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="e.g. Kemi" /></Field>
          <p className="text-[13px] text-neutral-500">They get their own login to {vendor.name}'s dashboard. They can send stock, list products, request deliveries and message the office. Only you can add or remove people.</p>
          <Btn type="submit" size="lg">Create invite</Btn>
        </form>
      </Modal>
      <InviteSheet invite={invite} onClose={() => setInvite(null)} company={vendor.name} />
    </Card>
  );
}

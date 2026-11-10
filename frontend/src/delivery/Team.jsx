// The company's team: every vendor and rider, whether they have a login yet, and the invite to send them.
// Inviting someone again replaces their old login, which is also how a forgotten password is reset.
import React, { useCallback, useEffect, useState } from "react";
import { Bike, Building2, Check, Copy, KeyRound, LayoutGrid, MessageCircle, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { api, useAuth } from "./auth";
import { useWorkspace } from "./store";
import { Avatar, Btn, Card, CardHead, Empty, Field, inputCls, Modal, Tag } from "./ui";
import { ago } from "./utils";

const ZONES = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island", "Ikoyi", "Ajah", "Gbagada"];

export default function Team() {
  const { state } = useWorkspace();
  const { user } = useAuth();
  const [team, setTeam] = useState({ members: [], invites: [] });
  const [invite, setInvite] = useState(null);
  const [adding, setAdding] = useState(null);
  const load = useCallback(async () => {
    try { setTeam(await api("/api/team")); } catch (e) { /* offline: keep what we had */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const memberFor = (role, ref) => team.members.find((m) => m.role === role && m.ref === ref && !m.teammate);
  const teammates = (ref) => team.members.filter((m) => m.role === "vendor" && m.ref === ref && m.teammate).length;
  const inviteFor = (role, ref) => team.invites.find((i) => i.role === role && i.ref === ref);
  const sendInvite = async (role, ref, name) => {
    if (user.demo) { toast("Invites are off in the demo. Sign up your company to invite real people."); return; }
    try {
      const inv = await api("/api/invites", { method: "POST", body: { role, ref, name } });
      setInvite({ ...inv, name });
      load();
    } catch (e) { toast.error(e.message); }
  };
  const remove = async (m) => {
    if (!window.confirm(`Remove ${m.name}'s login? They'll be signed out everywhere.`)) return;
    try { await api(`/api/team/${m.id}`, { method: "DELETE" }); load(); } catch (e) { toast.error(e.message); }
  };
  const office = team.members.filter((m) => m.role === "company");

  const Row = ({ role, rec, sub }) => {
    const m = memberFor(role, rec.id);
    const pending = inviteFor(role, rec.id);
    return (
      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 px-5 py-3.5 first:border-t-0">
        <Avatar name={rec.name} color={rec.color} photo={m && m.photo} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-semibold text-neutral-900">{rec.name}</div>
          <div className="truncate text-[12.5px] text-neutral-500">{sub}</div>
        </div>
        {m ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700" title={m.email || m.phone || ""}><Check className="mr-1 inline h-3 w-3" />Has login{m.lastSeen ? ` · seen ${ago(new Date(m.lastSeen * 1000).toISOString())}` : ""}</span>
        ) : pending ? (
          <button onClick={() => setInvite({ ...pending, name: rec.name })} className="rounded-full bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700">Invite sent · {pending.code}</button>
        ) : (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11.5px] font-semibold text-neutral-500">No login yet</span>
        )}
        <Btn size="sm" variant={m ? "ghost" : "ink"} onClick={() => sendInvite(role, rec.id, rec.name)}>{m ? <><KeyRound className="h-3.5 w-3.5" /> New invite</> : <><UserPlus className="h-3.5 w-3.5" /> Invite</>}</Btn>
        {m && <button onClick={() => remove(m)} className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${rec.name}'s login`}><Trash2 className="h-4 w-4" /></button>}
      </div>
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHead title="Riders" sub="Each rider signs in on their phone and sees only their own drops." right={<Btn size="sm" onClick={() => setAdding("rider")}><Plus className="h-4 w-4" /> Add rider</Btn>} />
        <div className="mt-3">
          {state.riders.map((r) => <Row key={r.id} role="rider" rec={r} sub={[r.zone, r.phone, `${r.dailyUnits} units a day`].filter(Boolean).join(" · ")} />)}
          {!state.riders.length && <Empty icon={Bike} title="No riders yet" sub="Add your riders, then send each one an invite." />}
        </div>
      </Card>
      <Card>
        <CardHead title="Vendors" sub="Each vendor sees only their own stock, orders and deliveries." right={<Btn size="sm" onClick={() => setAdding("vendor")}><Plus className="h-4 w-4" /> Add vendor</Btn>} />
        <div className="mt-3">
          {state.vendors.map((v) => <Row key={v.id} role="vendor" rec={v} sub={[v.contact, v.phone, teammates(v.id) && `${teammates(v.id)} on their team`].filter(Boolean).join(" · ")} />)}
          {!state.vendors.length && <Empty icon={Building2} title="No vendors yet" sub="Add the vendors who hand you stock." />}
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <CardHead title="Office team" sub="People who run the company dashboard with you." right={<Btn size="sm" variant="ghost" onClick={() => sendInvite("company", null, "")}><UserPlus className="h-4 w-4" /> Invite a teammate</Btn>} />
        <div className="mt-3">
          {office.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-t border-neutral-100 px-5 py-3.5 first:border-t-0">
              <Avatar name={m.name} color="#2b47f0" photo={m.photo} />
              <div className="min-w-0 flex-1"><div className="text-[14.5px] font-semibold">{m.name}{m.id === user.id ? " (you)" : ""}</div><div className="text-[12.5px] text-neutral-500">{m.email || m.phone}{m.owner ? " · owner" : ""}</div></div>
              {!m.owner && m.id !== user.id && <button onClick={() => remove(m)} className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>}
            </div>
          ))}
          {team.invites.filter((i) => i.role === "company").map((i) => (
            <div key={i.code} className="flex items-center gap-3 border-t border-neutral-100 px-5 py-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100"><LayoutGrid className="h-4 w-4 text-neutral-500" /></span>
              <div className="flex-1 text-[14px] text-neutral-600">Teammate invite <b className="font-mono">{i.code}</b> not used yet</div>
              <Btn size="sm" variant="ghost" onClick={() => setInvite(i)}>Share</Btn>
            </div>
          ))}
          {!office.length && <Empty icon={LayoutGrid} title="Just you so far" />}
        </div>
      </Card>
      <InviteSheet invite={invite} onClose={() => setInvite(null)} company={state.company.name} />
      <AddPerson kind={adding} onClose={() => setAdding(null)} onAdded={(role, rec) => { setAdding(null); sendInvite(role, rec.id, rec.name); }} />
    </div>
  );
}

export function InviteSheet({ invite, onClose, company }) {
  if (!invite) return null;
  const link = `${window.location.origin}/join/${invite.code}`;
  const who = invite.role === "rider" ? "rider" : invite.role === "vendor" ? "vendor" : "office";
  const text = `Hi${invite.name ? ` ${invite.name.split(" ")[0]}` : ""}, join ${company || "us"} on Delivery to see your ${who === "rider" ? "drops" : who === "vendor" ? "deliveries" : "dashboard"}. Open ${link} or enter code ${invite.code} at ${window.location.origin}/join`;
  const copy = async (s) => { try { await navigator.clipboard.writeText(s); toast.success("Copied"); } catch (e) { toast(s); } };
  return (
    <Modal open onClose={onClose} title="Send the invite">
      <div className="text-center">
        <Tag>Invite code{invite.name ? ` for ${invite.name}` : ""}</Tag>
        <div className="mt-2 font-mono text-[44px] font-bold tracking-[0.25em] text-neutral-950">{invite.code}</div>
        <p className="mx-auto mt-2 max-w-xs text-[14px] text-neutral-500">They open the link (or enter the code), pick a password, and land in their own {who} dashboard.</p>
      </div>
      <div className="mt-5 grid gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] text-[16px] font-semibold text-white"><MessageCircle className="h-5 w-5" /> Send on WhatsApp</a>
        <Btn size="lg" variant="ghost" onClick={() => copy(text)}><Copy className="h-4 w-4" /> Copy message</Btn>
        <button onClick={() => copy(link)} className="truncate rounded-2xl bg-neutral-100 px-4 py-3 font-mono text-[12.5px] text-neutral-600">{link}</button>
      </div>
    </Modal>
  );
}

function AddPerson({ kind, onClose, onAdded }) {
  const { act } = useWorkspace();
  const blank = { name: "", phone: "", zone: ZONES[0], dailyUnits: 10, vehicle: "Bike", contact: "" };
  const [f, setF] = useState(blank);
  useEffect(() => { setF(blank); }, [kind]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!kind) return null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const id = `${kind === "rider" ? "r" : "v"}-${Math.random().toString(36).slice(2, 8)}`;
    if (kind === "rider") act({ type: "rider/add", id, rider: { name: f.name.trim(), phone: f.phone, zone: f.zone, dailyUnits: Number(f.dailyUnits) || 10, vehicle: f.vehicle } });
    else act({ type: "vendor/add", id, vendor: { name: f.name.trim(), contact: f.contact, phone: f.phone } });
    onAdded(kind, { id, name: f.name.trim() });
  };
  return (
    <Modal open onClose={onClose} title={kind === "rider" ? "Add a rider" : "Add a vendor"}>
      <form onSubmit={submit} className="grid gap-3">
        <Field label={kind === "rider" ? "Rider's name" : "Business name"}><input className={inputCls} value={f.name} onChange={set("name")} required /></Field>
        {kind === "vendor" && <Field label="Contact person"><input className={inputCls} value={f.contact} onChange={set("contact")} /></Field>}
        <Field label="Phone"><input className={inputCls} type="tel" value={f.phone} onChange={set("phone")} placeholder="0803 000 0000" /></Field>
        {kind === "rider" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Area"><select className={inputCls} value={f.zone} onChange={set("zone")}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></Field>
            <Field label="Units a day"><input className={inputCls} type="number" min="1" value={f.dailyUnits} onChange={set("dailyUnits")} /></Field>
            <Field label="Vehicle" className="col-span-2"><input className={inputCls} value={f.vehicle} onChange={set("vehicle")} placeholder="Bike · LAG 214 KJA" /></Field>
          </div>
        )}
        <Btn type="submit" size="lg">Add and create invite</Btn>
      </form>
    </Modal>
  );
}

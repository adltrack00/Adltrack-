// The company's WhatsApp page: every rider and vendor conversation in one inbox. ADA answers on WhatsApp by itself
// (drops, "arrived", "delivered", orders, stock, balances); staff can read along, step in, and hand the chat back.
// While no real WhatsApp number is connected, the phone simulator lets anyone try it as a rider or a vendor.
// The office has its own chat with ADA too ("You · Office"): staff run the day from WhatsApp with the number on their
// login, and ADA follows up first (nudges, the morning brief, the evening wrap). See backend/office.py and nudges.py.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, Camera, Check, CheckCheck, Clock, Hand, MessageCircle, Send, Settings2, Smartphone, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { api, useAuth } from "./auth";
import { useWorkspace } from "./store";
import { AdaMark, Avatar, Btn, Card, Empty, inputCls, Modal } from "./ui";
import { clock, shrinkPhoto } from "./utils";

const cn = (...c) => c.filter(Boolean).join(" ");
export const WA_GREEN = "#25D366";

export function waSettings(state) {
  const w = (state.company && state.company.whatsapp) || {};
  return {
    enabled: w.enabled !== false, autoReply: w.autoReply !== false, paused: w.paused || {},
    notify: { drops: true, riderUpdates: true, vendorDeliveries: true, vendorPayouts: true, vendorStock: true, nudges: true, staffBriefs: true, customers: false, calls: false, ...(w.notify || {}) },
  };
}

export function useWaStatus() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    let on = true;
    api("/api/whatsapp/status").then((s) => on && setStatus(s)).catch(() => on && setStatus({ provider: "test", live: false, simulator: true, missing: [] }));
    return () => { on = false; };
  }, []);
  return status;
}

// Sent ✓, delivered ✓✓, read (blue) ✓✓, or why it didn't go.
export function Ticks({ m, dark = false }) {
  const wa = m.wa || {};
  if (!wa.status || wa.status === "received") return null;
  if (wa.status === "queued") return <Clock className="inline h-3 w-3" />;
  if (wa.status === "no_number") return <span className="text-amber-500">No WhatsApp number</span>;
  if (wa.status === "failed") return <span className="text-rose-500" title={wa.error || ""}>Not sent{wa.error ? `: ${wa.error.slice(0, 60)}` : ""}</span>;
  if (wa.status === "sent") return <Check className="inline h-3.5 w-3.5" />;
  return <CheckCheck className={cn("inline h-3.5 w-3.5", wa.status === "read" ? "text-sky-400" : dark ? "text-white/60" : "")} />;
}

const theirs = (m) => m.from === "rider" || m.from === "vendor" || m.from === "staff" || m.from === "customer" || m.from === "guest";
const keyOf = (t) => (t.groupId ? "staff:me" : t.staffId ? "staff:me" : t.customerId ? `customer:${t.customerId}` : t.riderId ? `rider:${t.riderId}` : `vendor:${t.vendorId}`);

function threadsOf(state, user) {
  const office = user && user.role === "company" ? [{ key: `staff:${user.id}`, staffId: user.id, name: `${user.name || "You"} · Office`, color: "#0f1450", phone: user.phone, kind: "Office", first: "you" }] : [];
  return [
    ...office,
    ...state.riders.map((r) => ({ key: `rider:${r.id}`, riderId: r.id, name: r.name, color: r.color, phone: r.phone, kind: "Rider", first: r.short || r.name })),
    ...state.vendors.map((v) => ({ key: `vendor:${v.id}`, vendorId: v.id, name: v.name, color: v.color, phone: v.phone, kind: "Vendor", first: (v.contact || v.name).split(" ")[0] })),
    ...customerThreads(state),
    ...groupThreads(state),
  ];
}

// Team groups ADA is in (made from the office chat: "make a team group").
function groupThreads(state) {
  const groups = (((state.company || {}).whatsapp || {}).groups || []).filter((g) => g.status === "ready" && g.id);
  return groups.map((g) => ({ key: `group:${g.id}`, groupId: g.id, name: g.name || "Team group", color: "#25D366", phone: g.invite || "", kind: "Group", first: "everyone" }));
}

// Customers show up once ADA has written to them or they've written in (with "Message customers" on).
const digitsOf = (p) => { let d = String(p || "").replace(/\D/g, ""); if (d.length === 11 && d.startsWith("0")) d = `234${d.slice(1)}`; return d; };
function customerThreads(state) {
  const seen = new Map();
  for (const m of state.messages) if (m.customerId && !seen.has(m.customerId)) seen.set(m.customerId, m);
  return [...seen.keys()].map((id) => {
    const t = state.tasks.find((x) => digitsOf(x.phone) === id) || {};
    const name = t.customer || `+${id}`;
    return { key: `customer:${id}`, customerId: id, name, color: "#64748b", phone: `+${id}`, kind: "Customer", first: name.split(" ")[0] };
  });
}
const inThread = (m, t) => (t.groupId ? m.groupId === t.groupId : m.groupId ? false : t.staffId ? m.staffId === t.staffId : t.customerId ? m.customerId === t.customerId : t.vendorId ? m.vendorId === t.vendorId : m.riderId === t.riderId && !m.vendorId && !m.staffId && !m.customerId);

export default function WhatsAppInbox({ openDay }) {
  const { state, act } = useWorkspace();
  const status = useWaStatus();
  const { user } = useAuth() || {};
  const s = waSettings(state);
  const threads = useMemo(() => threadsOf(state, user), [state, user]);
  const lastAt = (t) => { const l = [...state.messages].reverse().find((m) => inThread(m, t)); return l ? l.at : ""; };
  const sorted = [...threads].sort((a, b) => (lastAt(a) < lastAt(b) ? 1 : -1));
  const [key, setKey] = useState("");
  const [text, setText] = useState("");
  const [sim, setSim] = useState(false);
  const [setup, setSetup] = useState(false);
  const th = threads.find((t) => t.key === key) || sorted[0];
  const thread = th ? state.messages.filter((m) => inThread(m, th)) : [];
  // The office's own chat has nothing to mark read (and messages/read only knows rider and vendor chats).
  const unreadIn = (t) => (t.staffId || t.customerId ? 0 : state.messages.filter((m) => inThread(m, t) && theirs(m) && !m.read).length);
  const openUnread = th ? unreadIn(th) : 0;
  const body = useRef(null);
  useEffect(() => { if (th && openUnread) act({ type: "messages/read", by: "company", riderId: th.riderId, vendorId: th.vendorId }); }, [th, openUnread, act]);
  const thKey = th ? th.key : "";
  useEffect(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight; }, [thread.length, thKey]);

  const save = async (patch) => {
    try { await api("/api/whatsapp/settings", { method: "PUT", body: patch }); } catch (e) { toast.error(e.message); }
  };
  if (!th) return <Card><Empty icon={MessageCircle} title="No one to message yet" sub="Add riders and vendors under Team." /></Card>;
  const paused = !!s.paused[th.key];
  const live = status && status.live;

  return (
    <div className="grid gap-4">
      <Card className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white" style={{ background: WA_GREEN }}><MessageCircle className="h-6 w-6" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[15px] font-bold text-neutral-950">
            WhatsApp {status ? (live ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Live · {status.provider === "meta" ? "Meta Cloud API" : "Twilio"}</span> : <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Test mode</span>) : null}
            {!s.enabled && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-600">Off</span>}
          </div>
          <div className="text-[12.5px] text-neutral-500">
            {live ? `ADA answers riders and vendors on ${status.number || "your business number"}. Everything you send here goes to their WhatsApp too.` : "Nothing leaves the app yet. Try it with the phone simulator, then connect your business number."}
          </div>
        </div>
        <div className="flex gap-2">
          {status && status.simulator && <Btn size="sm" variant="green" onClick={() => setSim(true)} data-testid="wa-simulator"><Smartphone className="h-4 w-4" /> Phone simulator</Btn>}
          <Btn size="sm" variant="ghost" onClick={() => setSetup(true)} data-testid="wa-settings"><Settings2 className="h-4 w-4" /> Settings</Btn>
        </div>
      </Card>

      <Card className="grid min-h-[600px] overflow-hidden md:grid-cols-[300px_1fr]">
        <div className="max-h-[280px] overflow-y-auto border-b border-neutral-100 md:max-h-[680px] md:border-b-0 md:border-r">
          {sorted.map((t) => {
            const last = [...state.messages].reverse().find((m) => inThread(m, t));
            const n = unreadIn(t);
            return (
              <button key={t.key} onClick={() => setKey(t.key)} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left", t.key === th.key ? "bg-emerald-50/60" : "hover:bg-neutral-50")} data-testid={`wa-thread-${t.key}`}>
                <Avatar name={t.name} color={t.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[14px] font-semibold text-neutral-900">
                    <span className="truncate">{t.name}</span>
                    <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 text-[10px] font-semibold uppercase text-neutral-500">{t.kind}</span>
                    {s.paused[t.key] && <span className="shrink-0 rounded-full bg-amber-100 px-1.5 text-[10px] font-semibold uppercase text-amber-700">Staff</span>}
                  </div>
                  <div className="truncate text-[12px] text-neutral-500">{last ? `${last.from === "ada" ? "ADA: " : last.from === "dispatcher" ? "You: " : ""}${last.text}` : "No messages yet"}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {last && <span className="text-[10.5px] text-neutral-400">{clock(last.at)}</span>}
                  {!!n && <span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10.5px] font-bold text-white" style={{ background: WA_GREEN }}>{n}</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 px-5 py-3">
            <Avatar name={th.name} color={th.color} size={34} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-semibold">{th.name}</div>
              <div className="text-[12px] text-neutral-500">{th.kind}{th.phone ? ` · ${th.phone}` : " · no WhatsApp number"}</div>
            </div>
            {s.autoReply && !th.staffId && !th.customerId && (paused ? (
              <Btn size="sm" variant="ghost" onClick={() => save({ paused: { [th.key]: false } })} data-testid="wa-handback"><Sparkles className="h-4 w-4" /> Hand back to ADA</Btn>
            ) : (
              <Btn size="sm" onClick={() => save({ paused: { [th.key]: true } })} data-testid="wa-stepin"><Hand className="h-4 w-4" /> Step in</Btn>
            ))}
          </div>
          <div className={cn("flex items-center gap-2 px-5 py-2 text-[12.5px]", paused || !s.autoReply ? "bg-amber-50 text-amber-800" : "bg-emerald-50/70 text-emerald-800")}>
            {th.staffId ? <><AdaMark size={16} /> Your own chat with ADA. Text {status && status.number ? status.number : "the business number"} from {th.phone || "the phone on your account"} to run the day: TODAY, DISPATCH, CASH, VERIFY TUNDE… ADA asks before changing anything.</>
              : th.customerId ? <><AdaMark size={16} /> {th.first} is a customer. ADA tells them when their order is on the way, at the door and delivered, and handles confirm, problem and new times.</>
              : paused || !s.autoReply ? <><Hand className="h-3.5 w-3.5" /> You're handling this chat. ADA won't answer {th.first} until you hand it back.</> : <><AdaMark size={16} /> ADA is answering {th.first} on WhatsApp. Step in any time.</>}
          </div>
          <div ref={body} className="flex-1 space-y-2.5 overflow-y-auto bg-[#f4f1ec] p-4 sm:p-5" style={{ maxHeight: 560 }}>
            {thread.map((m) => <Bubble key={m.id} m={m} mine={!theirs(m)} day={dayOfMessage(state, m)} onDay={openDay} />)}
            {!thread.length && <Empty icon={MessageCircle} title="No messages yet" sub={th.phone ? `ADA will message ${th.first} here and on WhatsApp.` : `Add ${th.first}'s WhatsApp number under Team.`} />}
          </div>
          {!th.staffId && !th.customerId && <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { act({ type: "messages/send", messages: [{ riderId: th.riderId, vendorId: th.vendorId, from: "dispatcher", text: text.trim() }] }); setText(""); } }} className="flex gap-2 border-t border-neutral-100 p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`WhatsApp ${th.first}…`} className={`${inputCls} h-11 rounded-full px-4`} data-testid="wa-compose" />
            <Btn size="lg" className="h-11" type="submit" aria-label="Send"><Send className="h-4 w-4" /></Btn>
          </form>}
          {th.staffId && status && status.simulator && <div className="border-t border-neutral-100 p-3"><Btn size="sm" variant="green" onClick={() => setSim(true)}><Smartphone className="h-4 w-4" /> Try it in the phone simulator</Btn></div>}
        </div>
      </Card>

      <SettingsModal open={setup} onClose={() => setSetup(false)} s={s} save={save} status={status} />
      <Simulator open={sim} onClose={() => setSim(false)} threads={threads} start={th.key} />
    </div>
  );
}

// A message about a drop or a day (a delivery notice, the end-of-day wrap) links to that day's record.
export function dayOfMessage(state, m) {
  if (m.day) return m.day;
  const id = m.taskId || (m.taskIds && m.taskIds[0]);
  const t = id && state.tasks.find((x) => x.id === id);
  return t ? t.date : "";
}

function Bubble({ m, mine, day, onDay }) {
  const who = m.from === "ada" ? "ADA" : m.from === "dispatcher" ? (m.by && m.by.name) || "Office" : m.groupId && m.authorName ? m.authorName : null;
  return (
    <div className={cn("max-w-[85%] sm:max-w-[75%]", mine ? "ml-auto" : "")}>
      <div className={cn("rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug shadow-sm", mine ? (m.from === "ada" ? "rounded-br-md bg-[#0f1450] text-white" : "rounded-br-md bg-neutral-900 text-white") : "rounded-bl-md bg-white text-neutral-800")}>
        {who && <div className={cn("mb-0.5 flex items-center gap-1 text-[11px] font-bold", m.from === "ada" ? "text-sky-300" : mine ? "text-white/60" : "text-emerald-700")}>{m.from === "ada" && <AdaMark size={12} />}{who}</div>}
        {m.photo && <img src={m.photo} alt="" className="mb-1.5 max-h-56 rounded-xl object-cover" />}
        <Media m={m} />
        <div className="whitespace-pre-line break-words">{m.text}</div>
        {!!(m.buttons && m.buttons.length) && (
          <div className="mt-2 flex flex-wrap gap-1.5">{m.buttons.map((b) => <span key={b.id} className="rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold text-white/85 ring-1 ring-white/15">{b.title}</span>)}</div>
        )}
        {day && onDay && (
          <button onClick={() => onDay(day)} className={cn("mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold", mine ? "bg-white/15 text-white hover:bg-white/25" : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200")} data-testid="bubble-day">
            <CalendarCheck className="h-3.5 w-3.5" /> Day record
          </button>
        )}
      </div>
      <div className={cn("mt-0.5 flex items-center gap-1 text-[10.5px] text-neutral-400", mine ? "justify-end" : "")}>
        {m.channel === "whatsapp" || m.wa ? <MessageCircle className="h-3 w-3" style={{ color: WA_GREEN }} /> : null}
        {clock(m.at)} {mine && <Ticks m={m} />}
        {!mine && m.from && m.channel !== "whatsapp" && <span>· in the app</span>}
      </div>
    </div>
  );
}

// A voice note to play, or a shared location to open in Maps.
function Media({ m }) {
  return (
    <>
      {m.audio && <audio controls src={m.audio} className="mb-1.5 h-10 w-60 max-w-full" data-testid="wa-audio" />}
      {m.audio && m.transcribed && <div className="mb-0.5 text-[11px] font-semibold opacity-60">Voice note, typed out by ADA:</div>}
      {m.channel === "call" && <div className="mb-0.5 text-[11px] font-semibold opacity-60" data-testid="wa-call">📞 {m.from === "ada" ? "Said on a phone call" : "Said on a phone call, typed out"}{m.wa && m.wa.status === "simulated" ? " (test line)" : ""}</div>}
      {m.photoRead && m.photoRead.summary && <div className="mb-1 rounded-lg bg-black/5 px-2 py-1 text-[11.5px] font-semibold opacity-80" data-testid="wa-photo-read">ADA read: {m.photoRead.summary}</div>}
      {m.location && m.location.lat != null && (
        <a href={`https://maps.google.com/?q=${m.location.lat},${m.location.lng}`} target="_blank" rel="noreferrer" className="mb-1.5 block text-[12.5px] font-semibold underline">Open location in Maps{m.location.name ? ` · ${m.location.name}` : ""}</a>
      )}
    </>
  );
}

function Toggle({ on, onChange, label, sub, testId }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex w-full items-center gap-3 py-3 text-left" data-testid={testId}>
      <div className="min-w-0 flex-1"><div className="text-[14.5px] font-semibold text-neutral-900">{label}</div>{sub && <div className="text-[12.5px] text-neutral-500">{sub}</div>}</div>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "" : "bg-neutral-300")} style={on ? { background: WA_GREEN } : undefined}>
        <span className={cn("absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

function SettingsModal({ open, onClose, s, save, status }) {
  const n = s.notify;
  return (
    <Modal open={open} onClose={onClose} title="WhatsApp settings">
      <div className="divide-y divide-neutral-100">
        <Toggle on={s.enabled} onChange={(v) => save({ enabled: v })} label="Use WhatsApp" sub="Send riders and vendors what you send in the app." />
        <Toggle on={s.autoReply} onChange={(v) => save({ autoReply: v })} label="ADA answers on WhatsApp" sub="Off: every reply waits for your team." />
        <Toggle on={n.drops} onChange={(v) => save({ notify: { drops: v } })} label="New drops to riders" sub="With Accept and Can't take it buttons." />
        <Toggle on={n.riderUpdates} onChange={(v) => save({ notify: { riderUpdates: v } })} label="Next stop after each delivery" />
        <Toggle on={n.vendorDeliveries} onChange={(v) => save({ notify: { vendorDeliveries: v } })} label="Tell vendors each delivery" sub="Delivered, or couldn't deliver and why." />
        <Toggle on={n.vendorStock} onChange={(v) => save({ notify: { vendorStock: v } })} label="Tell vendors when stock is counted in" />
        <Toggle on={n.vendorPayouts} onChange={(v) => save({ notify: { vendorPayouts: v } })} label="Tell vendors about payouts" />
        <Toggle on={n.nudges} onChange={(v) => save({ notify: { nudges: v } })} label="ADA follows up by itself" sub="Nudges riders who haven't answered or gone quiet, reminds them about cash, and tells the office who's still silent." />
        <Toggle on={n.customers} onChange={(v) => save({ notify: { customers: v } })} label="Message customers" sub="On the way, at the door, delivered. Customers can confirm, report a problem or pick a new time." testId="wa-customers" />
        <Toggle on={n.calls} onChange={(v) => save({ notify: { calls: v } })} label="ADA phones riders who don't answer" sub="A short call when new drops are still unanswered after the WhatsApp nudge. Needs a Twilio voice number." testId="wa-calls" />
        <Toggle on={n.staffBriefs} onChange={(v) => save({ notify: { staffBriefs: v } })} label="Morning brief and evening wrap" sub="To everyone at the office with a WhatsApp number on their login." />
      </div>
      {status && !status.live && (
        <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-[13px] leading-relaxed text-neutral-600">
          <div className="mb-1 font-semibold text-neutral-900">Connect your business number</div>
          Verify a WhatsApp Business number with Meta (or Twilio), then add its keys to the server: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_VERIFY_TOKEN. Point the webhook at <span className="break-all font-mono text-[12px]">{status.webhook}</span>.
        </div>
      )}
    </Modal>
  );
}

/* ---------- The phone simulator: be a rider or vendor on WhatsApp ---------- */

const RIDER_TRIES = ["Yes", "Collected", "Arrived", "Delivered", "Customer not picking calls", "How much did I earn today?", "Paid in ref TRF2231"];
const CUSTOMER_TRIES = ["Where is my order?", "I won't be home, bring it tomorrow after 2pm", "Yes, I got it", "The serum is damaged"];
const OFFICE_TRIES = ["How far today?", "Dispatch", "Call Tunde: are you taking the new drops?", "Make a team group", "GlowSkin dropped 40 serum", "Count in", "Cash", "What do we owe?", "Tell all riders to return unsold items by 6pm", "Login"];
const VENDOR_TRIES = [
  "Tuesday orders\n1. Adaeze Nnaji 08035551234, 15 Adeniran Ogunsanya St Surulere, 2 serum, 25k\n2. Tayo 08123456677, 07012345678, 3 black soap, 10,500",
  "Sending 40 serum and 20 black soap tomorrow",
  "Balance",
  "Today",
];

export function Simulator({ open, onClose, threads, start }) {
  const { state } = useWorkspace();
  const [key, setKey] = useState(start);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [onCall, setOnCall] = useState(false);
  const file = useRef(null);
  const body = useRef(null);
  // Pick the contact when the phone opens, not each time a new message moves another chat to the top.
  useEffect(() => { if (open) setKey(start); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const th = threads.find((t) => t.key === key) || threads[0];
  const msgs = th ? state.messages.filter((m) => inThread(m, th) && (m.channel === "whatsapp" || m.wa)) : [];
  useEffect(() => { if (body.current) body.current.scrollTop = body.current.scrollHeight; }, [msgs.length, open, key]);
  if (!open || !th) return null;
  const send = async (payload) => {
    setBusy(true);
    const extra = { ...(th.groupId ? { group: th.groupId } : {}), ...(onCall && !th.groupId ? { channel: "call" } : {}) };
    try { await api("/api/whatsapp/simulate", { method: "POST", body: { contact: keyOf(th), ...extra, ...payload } }); setText(""); } catch (e) { toast.error(e.message); }
    setBusy(false);
  };
  const pick = async (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ""; if (f) send({ image: await shrinkPhoto(f, 1024) }); };
  const tries = th.groupId ? ["ADA, how far today?", "ADA, who has DL-1001?", "Morning everyone"] : th.staffId ? OFFICE_TRIES : th.customerId ? CUSTOMER_TRIES : th.riderId ? RIDER_TRIES : VENDOR_TRIES;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[3px]" onClick={onClose}>
      <div className="flex h-[min(820px,96dvh)] w-full max-w-[400px] flex-col overflow-hidden rounded-[40px] bg-black p-2.5 shadow-2xl" onClick={(e) => e.stopPropagation()} data-testid="wa-phone">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[32px] bg-[#efeae2]">
          <div className="flex items-center gap-3 px-4 pb-3 pt-4 text-white" style={{ background: "#0b6b55" }}>
            <AdaMark size={34} />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold">ADA · {state.company.name || "Delivery"}</div>
              <select value={th.key} onChange={(e) => setKey(e.target.value)} className="mt-0.5 max-w-full rounded-md bg-white/15 px-1.5 py-0.5 text-[12px] text-white outline-none" data-testid="wa-sim-as">
                {threads.map((t) => <option key={t.key} value={t.key} className="text-neutral-900">{t.groupId ? `${t.name} (group, you at the office)` : t.staffId ? "You, at the office" : `You are ${t.name} (${t.kind.toLowerCase()})`}</option>)}
              </select>
            </div>
            {!th.groupId && !th.staffId && (
              <button onClick={() => setOnCall(!onCall)} aria-label="Answer as a phone call" title="Speak as if on a phone call with ADA" className={cn("grid h-9 w-9 place-items-center rounded-full", onCall ? "bg-white text-[#0b6b55]" : "bg-white/10")} data-testid="wa-sim-call">📞</button>
            )}
            <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><X className="h-5 w-5" /></button>
          </div>
          {onCall && !th.groupId && !th.staffId && <div className="bg-[#0b6b55] px-4 pb-2 text-[11.5px] text-white/85">📞 On a call with ADA: what you send is said out loud, and ADA's answer is spoken.</div>}
          <div ref={body} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            <div className="mx-auto w-fit rounded-lg bg-[#fff5c4] px-3 py-1.5 text-center text-[11.5px] text-neutral-600">Test line. This is what {th.first} sees on WhatsApp.</div>
            {msgs.map((m) => {
              const me = theirs(m);
              return (
                <div key={m.id} className={cn("max-w-[86%]", me ? "ml-auto" : "")}>
                  <div className={cn("rounded-xl px-3 py-2 text-[13.5px] leading-snug text-neutral-900 shadow-sm", me ? "rounded-tr-sm bg-[#d9fdd3]" : "rounded-tl-sm bg-white")}>
                    {m.photo && <img src={m.photo} alt="" className="mb-1.5 max-h-48 rounded-lg object-cover" />}
                    <Media m={m} />
                    <Linked text={m.waText || m.text} />
                    <div className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px] text-neutral-500">{clock(m.at)}{me && <CheckCheck className="h-3.5 w-3.5 text-sky-500" />}</div>
                  </div>
                  {!me && !!(m.buttons && m.buttons.length) && (
                    <div className="mt-1 grid gap-1">
                      {m.buttons.map((b) => <button key={b.id} disabled={busy} onClick={() => send({ button: b.id, text: b.title })} className="rounded-xl bg-white py-2 text-center text-[13.5px] font-semibold text-[#0b8a6d] shadow-sm active:bg-neutral-100" data-testid={`wa-btn-${b.id}`}>{b.title}</button>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-3 pb-2">
            {tries.map((t) => <button key={t} onClick={() => setText(t)} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm">{t.split("\n")[0].slice(0, 28)}{t.length > 28 || t.includes("\n") ? "…" : ""}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) send({ text }); }} className="flex items-end gap-2 px-2.5 pb-3">
            <div className="flex flex-1 items-end rounded-3xl bg-white px-3 shadow-sm">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={Math.min(5, Math.max(1, text.split("\n").length))} placeholder="Message" className="max-h-32 flex-1 resize-none bg-transparent py-2.5 text-[16px] outline-none" data-testid="wa-sim-input"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (text.trim()) send({ text }); } }} />
              <input ref={file} type="file" accept="image/*" className="hidden" onChange={pick} />
              {!th.customerId && <button type="button" onClick={() => file.current.click()} className="py-2.5 pl-2 text-neutral-500" aria-label="Send a photo"><Camera className="h-5 w-5" /></button>}
            </div>
            <button type="submit" disabled={busy || !text.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white disabled:opacity-60" style={{ background: "#0b8a6d" }} aria-label="Send" data-testid="wa-sim-send"><Send className="h-5 w-5" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Links in ADA's messages open the app, as they would from WhatsApp.
function Linked({ text }) {
  const parts = String(text).split(/(https?:\/\/\S+)/g);
  return <div className="whitespace-pre-line break-words">{parts.map((p, i) => (/^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noreferrer" className="text-[#027eb5] underline">{p.replace(/^https?:\/\//, "").slice(0, 38)}…</a> : p))}</div>;
}

export function WhatsAppNote({ className, children }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-2xl bg-emerald-50 px-3.5 py-3 text-[13px] leading-snug text-emerald-900", className)}>
      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: WA_GREEN }} />
      <div>{children}</div>
    </div>
  );
}


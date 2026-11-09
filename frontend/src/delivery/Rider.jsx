// The rider app, phone-first: go on duty, see today's drops, pick up, deliver with a doorstep photo and confirm payment.
import React, { useEffect, useRef, useState } from "react";
import { Camera, Check, ChevronDown, Clock, Home, Inbox, LogOut, MapPin, MessageSquare, Navigation, Phone, Power, Send, Wallet, X } from "lucide-react";
import { isActive, productById, riderLoad, useWorkspace, value as taskValue } from "./store";
import { AdaMark, Avatar, Bar, Btn, Empty, Field, inputCls, Modal, StatusPill, statusOf, Tag } from "./ui";
import { clock, money, shrinkPhoto, time12 } from "./utils";

export default function Rider({ riderId, go }) {
  const { state, act } = useWorkspace();
  const rider = state.riders.find((r) => r.id === riderId) || state.riders[0];
  const [tab, setTab] = useState("drops");
  const [delivering, setDelivering] = useState(null);
  const [failing, setFailing] = useState(null);
  const load = riderLoad(state, rider.id);
  const msgs = state.messages.filter((m) => m.riderId === rider.id);
  const unread = msgs.filter((m) => m.from !== "rider" && !m.read).length;
  const open = load.tasks.filter(isActive).sort((a, b) => (a.time < b.time ? -1 : 1));
  const done = load.tasks.filter((t) => !isActive(t));

  useEffect(() => { if (tab === "inbox" && unread) act({ type: "messages/read", riderId: rider.id }); }, [tab, unread, act, rider.id]);

  return (
    <div className="min-h-screen bg-[#ecebe7] sm:py-8">
      <div className="relative mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#f6f5f2] sm:min-h-[860px] sm:overflow-hidden sm:rounded-[40px] sm:shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:ring-8 sm:ring-stone-900">
        <header className="flex items-center gap-3 px-5 pb-3 pt-6">
          <Avatar name={rider.name} color={rider.color} size={42} />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] text-stone-500">{new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" })}</div>
            <div className="truncate text-[17px] font-bold tracking-tight text-stone-900">Hi, {rider.short}</div>
          </div>
          <button onClick={() => act({ type: "rider/online", id: rider.id, online: !rider.online })} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ${rider.online ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-600"}`}>
            <Power className="h-3.5 w-3.5" /> {rider.online ? "On duty" : "Off"}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-28">
          {!rider.online ? (
            <div className="flex flex-col items-center pt-16 text-center">
              <button onClick={() => act({ type: "rider/online", id: rider.id, online: true })} className="relative grid h-40 w-40 place-items-center rounded-full bg-stone-900 text-[28px] font-extrabold tracking-tight text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
                <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/20" />
                GO
              </button>
              <div className="mt-8 text-[18px] font-bold text-stone-900">You're off duty</div>
              <div className="mt-1 text-[14px] text-stone-500">{open.length ? `${open.length} drops are waiting for you today.` : "Go on duty to get today's drops."}</div>
            </div>
          ) : tab === "drops" ? (
            <>
              <div className="rounded-3xl bg-stone-900 p-5 text-white">
                <div className="flex items-center justify-between"><Tag className="text-stone-400">Today</Tag><span className="text-[12px] text-stone-400">{rider.zone}</span></div>
                <div className="mt-3 flex items-end justify-between">
                  <div><div className="text-[34px] font-extrabold leading-none tracking-tight">{load.done}<span className="text-stone-500">/{load.tasks.length}</span></div><div className="mt-1 text-[12.5px] text-stone-400">drops done</div></div>
                  <div className="text-right"><div className="font-mono text-[18px] font-bold">{money(load.collected)}</div><div className="mt-1 text-[12.5px] text-stone-400">collected</div></div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[12px] text-stone-400"><span>Units given today</span><span className="tabular-nums text-white">{load.units} of {rider.dailyUnits}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-orange-400" style={{ width: `${Math.min(100, (load.units / rider.dailyUnits) * 100)}%` }} /></div>
              </div>

              <div className="mt-6 flex items-center justify-between"><h2 className="text-[16px] font-bold text-stone-900">Up next</h2><span className="text-[12.5px] text-stone-500">{open.length} to go</span></div>
              <div className="mt-3 space-y-3">
                {open.length ? open.map((t, i) => <DropCard key={t.id} task={t} first={i === 0} state={state} act={act} onDeliver={() => setDelivering(t)} onFail={() => setFailing(t)} />) : (
                  <div className="rounded-3xl bg-white"><Empty icon={Check} title="All done for now" sub="New drops from the dispatcher or ADA appear here and in your inbox." /></div>
                )}
              </div>

              {!!done.length && (
                <>
                  <h2 className="mt-7 text-[16px] font-bold text-stone-900">Completed</h2>
                  <div className="mt-3 space-y-2">
                    {done.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                        {t.proof && t.proof.photo ? <img src={t.proof.photo} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100"><X className="h-4 w-4 text-stone-400" /></span>}
                        <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-semibold">{t.customer}</div><div className="text-[12px] text-stone-500">{t.proof ? clock(t.proof.at) : t.failReason}</div></div>
                        <StatusPill status={statusOf(t)} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <RiderInbox rider={rider} msgs={msgs} act={act} />
          )}
        </div>

        <nav className="absolute inset-x-4 bottom-4 flex items-center justify-around rounded-[26px] bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.10)] ring-1 ring-stone-200/70">
          {[["drops", "Drops", Home], ["inbox", "Inbox", Inbox]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11.5px] font-semibold ${tab === id ? "bg-orange-50 text-orange-600" : "text-stone-500"}`}>
              <Icon className="h-5 w-5" /> {label}
              {id === "inbox" && unread > 0 && <span className="absolute right-[30%] top-1.5 h-2 w-2 rounded-full bg-orange-500" />}
            </button>
          ))}
          <button onClick={() => go("#/")} className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11.5px] font-semibold text-stone-500"><LogOut className="h-5 w-5" /> Exit</button>
        </nav>
      </div>
      <DeliverSheet task={delivering} onClose={() => setDelivering(null)} act={act} state={state} />
      <FailSheet task={failing} onClose={() => setFailing(null)} act={act} />
    </div>
  );
}

function DropCard({ task, first, state, act, onDeliver, onFail }) {
  const [open, setOpen] = useState(first);
  const amount = taskValue(task);
  return (
    <div className={`overflow-hidden rounded-3xl bg-white ${first ? "ring-2 ring-orange-400/60" : ""}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className="font-mono text-[11px] text-stone-400">{task.ref}</span><StatusPill status={task.status} /></div>
          <div className="mt-1.5 text-[17px] font-bold leading-tight tracking-tight text-stone-900">{task.customer}</div>
          <div className="mt-1 flex items-center gap-3 text-[13px] text-stone-500">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {task.time ? time12(task.time) : "Today"}</span>
            <span className="font-mono font-semibold text-stone-800">{money(amount)}</span>
          </div>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100"><ChevronDown className={`h-4 w-4 text-stone-500 transition ${open ? "rotate-180" : ""}`} /></span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-stone-100 px-4 pb-4 pt-3">
          <div className="flex items-start gap-2 text-[13.5px] text-stone-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" /> {task.address}</div>
          {task.note && <div className="rounded-xl bg-orange-50 px-3 py-2 text-[13px] text-orange-800">{task.note}</div>}
          <div className="rounded-2xl bg-stone-50 p-3">
            {task.items.map((l, i) => {
              const p = productById(state, l.productId) || {};
              return <div key={i} className="flex justify-between py-0.5 text-[13.5px]"><span>{l.qty} × {p.name}</span><span className="font-mono text-stone-500">{money(l.qty * l.price)}</span></div>;
            })}
            <div className="mt-1.5 flex justify-between border-t border-stone-200 pt-1.5 text-[13.5px] font-bold"><span>Collect</span><span className="font-mono">{money(amount)}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {task.phone && <a href={`tel:${task.phone.replace(/\s/g, "")}`} className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-stone-100 text-[13.5px] font-semibold text-stone-800"><Phone className="h-4 w-4" /> Call</a>}
            <a href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-stone-100 text-[13.5px] font-semibold text-stone-800"><Navigation className="h-4 w-4" /> Directions</a>
          </div>
          {task.status === "assigned" ? (
            <Btn size="lg" className="w-full" onClick={() => act({ type: "task/pickup", id: task.id })}>Picked up from warehouse</Btn>
          ) : (
            <Btn size="lg" variant="orange" className="w-full" onClick={onDeliver}><Camera className="h-4 w-4" /> Delivered · take photo</Btn>
          )}
          <button onClick={onFail} className="w-full py-1 text-[13px] font-medium text-stone-500 underline-offset-2 hover:underline">Couldn't deliver</button>
        </div>
      )}
    </div>
  );
}

function DeliverSheet({ task, onClose, act, state }) {
  const [photo, setPhoto] = useState(null);
  const [receivedBy, setReceivedBy] = useState("");
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState(0);
  const [paid, setPaid] = useState(true);
  const file = useRef(null);
  useEffect(() => {
    if (task) { setPhoto(null); setReceivedBy(""); setMethod("cash"); setAmount(taskValue(task)); setPaid(true); }
  }, [task]);
  if (!task) return null;
  const pick = async (e) => { const f = e.target.files && e.target.files[0]; if (f) setPhoto(await shrinkPhoto(f)); };
  const save = () => {
    act({ type: "task/deliver", id: task.id, photo, receivedBy, method, amount, confirmed: paid });
    onClose();
  };
  return (
    <Modal open={!!task} onClose={onClose} title={`Deliver to ${task.customer}`}>
      <div className="grid gap-4">
        <div>
          <Tag>1 · Photo at the door</Tag>
          <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
          <button onClick={() => file.current.click()} className="mt-2 grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 text-stone-500">
            {photo ? <img src={photo} alt="Proof of delivery" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-[13px]"><Camera className="h-7 w-7" /> Take a photo of the package with the customer</span>}
          </button>
        </div>
        <Field label="Received by"><input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder={task.customer} className={inputCls} /></Field>
        <div>
          <Tag>2 · Payment</Tag>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[["cash", "Cash"], ["transfer", "Transfer"], ["pos", "POS"]].map(([id, label]) => (
              <button key={id} onClick={() => setMethod(id)} className={`h-10 rounded-xl text-[13.5px] font-semibold ${method === id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"}`}>{label}</button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
            <Field label="Amount (₦)"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} /></Field>
            <label className="flex h-10 items-center gap-2 rounded-xl bg-emerald-50 px-3 text-[13px] font-semibold text-emerald-800">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="h-4 w-4 accent-emerald-600" /> Payment received
            </label>
          </div>
          {!paid && <div className="mt-2 text-[12.5px] text-amber-700">It will show as awaiting payment until the office confirms it.</div>}
        </div>
        <Btn size="lg" variant="green" disabled={!photo} onClick={save}><Wallet className="h-4 w-4" /> Confirm delivery</Btn>
        {!photo && <div className="-mt-2 text-center text-[12px] text-stone-400">A photo is needed to confirm.</div>}
      </div>
    </Modal>
  );
}

const REASONS = ["Customer not reachable", "Wrong address", "Customer refused", "Customer asked to reschedule", "Bike problem"];

function FailSheet({ task, onClose, act }) {
  const [reason, setReason] = useState(REASONS[0]);
  if (!task) return null;
  return (
    <Modal open={!!task} onClose={onClose} title="Couldn't deliver">
      <div className="grid gap-2">
        {REASONS.map((r) => (
          <button key={r} onClick={() => setReason(r)} className={`rounded-xl px-4 py-3 text-left text-[14px] font-medium ${reason === r ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-700"}`}>{r}</button>
        ))}
        <div className="mt-1 text-[12.5px] text-stone-500">The items go back to the warehouse count and the office is told right away.</div>
        <Btn size="lg" className="mt-2" onClick={() => { act({ type: "task/fail", id: task.id, reason }); onClose(); }}>Report</Btn>
      </div>
    </Modal>
  );
}

function RiderInbox({ rider, msgs, act }) {
  const [text, setText] = useState("");
  return (
    <div className="pt-2">
      <h2 className="text-[16px] font-bold text-stone-900">Inbox</h2>
      <div className="mt-3 space-y-3">
        {msgs.length ? msgs.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.from === "rider" ? "justify-end" : ""}`}>
            {m.from === "ada" && <AdaMark size={28} className="mt-1" />}
            {m.from === "dispatcher" && <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stone-900 text-white"><MessageSquare className="h-3.5 w-3.5" /></span>}
            <div className="max-w-[82%]">
              <div className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${m.from === "rider" ? "rounded-br-md bg-stone-900 text-white" : "rounded-bl-md bg-white text-stone-800"}`}>{m.text}</div>
              <div className={`mt-1 text-[11px] text-stone-400 ${m.from === "rider" ? "text-right" : ""}`}>{m.from === "ada" ? "ADA" : m.from === "dispatcher" ? "Dispatch" : "You"} · {clock(m.at)}</div>
            </div>
          </div>
        )) : <Empty icon={Inbox} title="No messages yet" />}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { act({ type: "messages/send", messages: [{ riderId: rider.id, from: "rider", text: text.trim() }] }); setText(""); } }} className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to dispatch…" className={`${inputCls} h-11 rounded-full px-4`} />
        <Btn size="lg" className="h-11" type="submit"><Send className="h-4 w-4" /></Btn>
      </form>
    </div>
  );
}

export { Bar };

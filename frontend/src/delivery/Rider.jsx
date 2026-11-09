// The rider app, phone-first and one thing at a time: collect everything at the office, then only the next drop is
// shown in full, with Call, Navigate and one big button. Delivered = a photo and what was collected.
import React, { useEffect, useRef, useState } from "react";
import { Camera, Check, Clock, Home, Inbox, LogOut, MapPin, MessageSquare, Navigation, Phone, Power, Send, X } from "lucide-react";
import { isActive, productById, riderLoad, units as taskUnits, useWorkspace, value as taskValue, lineLabel } from "./store";
import { AdaMark, Avatar, Bar, Btn, Empty, inputCls, Modal, StatusPill, statusOf, Tag } from "./ui";
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
  // One list in the order to ride it: urgent first, then by time. Only the first is shown in full.
  const open = load.tasks.filter(isActive).sort((a, b) => (Number(!!b.urgent) - Number(!!a.urgent)) || ((a.time || "99") < (b.time || "99") ? -1 : 1));
  const done = load.tasks.filter((t) => !isActive(t));
  const toCollect = open.filter((t) => t.status === "assigned");
  const collectUnits = toCollect.reduce((s, t) => s + taskUnits(t), 0);
  const collectList = Object.entries(toCollect.reduce((m, t) => {
    for (const l of t.items) { const name = (productById(state, l.productId) || {}).name || "Item"; m[name] = (m[name] || 0) + l.qty + (l.free || 0); }
    return m;
  }, {}));
  const next = open.find((t) => t.status === "picked_up") || open[0];
  const later = open.filter((t) => t !== next);

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
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[12.5px] text-stone-500">
                <span><b className="text-[15px] text-stone-900">{load.done}</b>/{load.tasks.length} done</span>
                <span className="h-4 w-px bg-stone-200" />
                <span><b className="font-mono text-[14px] text-stone-900">{money(load.collected)}</b> collected</span>
                <span className="ml-auto tabular-nums">{load.units}/{rider.dailyUnits} units</span>
              </div>

              {!!toCollect.length && (
                <div className="mt-4 rounded-3xl bg-stone-900 p-5 text-white">
                  <Tag className="text-orange-300">Step 1 · At the office</Tag>
                  <div className="mt-2 text-[20px] font-extrabold leading-tight tracking-tight">Collect {collectUnits} {collectUnits === 1 ? "unit" : "units"} for {toCollect.length} {toCollect.length === 1 ? "drop" : "drops"}</div>
                  <div className="mt-3 space-y-1 text-[13.5px] text-stone-300">
                    {collectList.map(([name, n]) => <div key={name} className="flex justify-between"><span>{name}</span><span className="font-mono text-white">× {n}</span></div>)}
                  </div>
                  <Btn size="lg" variant="orange" className="mt-4 w-full" onClick={() => act({ type: "task/pickupAll", ids: toCollect.map((t) => t.id) })}><Check className="h-4 w-4" /> I have them all</Btn>
                </div>
              )}

              {next ? (
                <NextDrop task={next} state={state} act={act} locked={next.status === "assigned"} onDeliver={() => setDelivering(next)} onFail={() => setFailing(next)} />
              ) : (
                <div className="mt-4 rounded-3xl bg-white"><Empty icon={Check} title="All done for now" sub="New drops from the office show up here and in your inbox." /></div>
              )}

              {later.length > 0 && (
                <div className="mt-6">
                  <div className="text-[13px] font-semibold text-stone-500">Then {later.length} more</div>
                  <div className="mt-2 divide-y divide-stone-100 overflow-hidden rounded-2xl bg-white">
                    {later.map((t, i) => (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-stone-100 font-mono text-[11px] font-semibold text-stone-600">{i + 2}</span>
                        <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold text-stone-900">{t.urgent ? "🔥 " : ""}{t.customer}</div><div className="truncate text-[12px] text-stone-500">{t.zone || t.address} · {t.time ? time12(t.time) : "Today"}</div></div>
                        <span className="font-mono text-[12.5px] text-stone-600">{money(taskValue(t))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!!done.length && (
                <details className="mt-6">
                  <summary className="cursor-pointer select-none text-[13px] font-semibold text-stone-500">Done today ({done.length})</summary>
                  <div className="mt-2 space-y-2">
                    {done.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                        {t.proof && t.proof.photo ? <img src={t.proof.photo} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100"><X className="h-4 w-4 text-stone-400" /></span>}
                        <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-semibold">{t.customer}</div><div className="text-[12px] text-stone-500">{t.proof ? clock(t.proof.at) : t.failReason}</div></div>
                        <StatusPill status={statusOf(t)} />
                      </div>
                    ))}
                  </div>
                </details>
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
      <DeliverSheet task={delivering} onClose={() => setDelivering(null)} act={act} />
      <FailSheet task={failing} onClose={() => setFailing(null)} act={act} />
    </div>
  );
}

// The one drop the rider is doing now: where, who, what to collect, and one big button.
function NextDrop({ task, state, act, locked, onDeliver, onFail }) {
  const amount = taskValue(task);
  const where = [task.address, task.landmark].filter(Boolean).join(" · ");
  return (
    <div className={`mt-4 overflow-hidden rounded-3xl bg-white ring-2 ${locked ? "ring-stone-200" : "ring-orange-400/70"}`}>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <Tag className={locked ? "text-stone-400" : "text-orange-600"}>{locked ? "Step 2 · First drop" : "Now"}</Tag>
          {task.urgent && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10.5px] font-bold text-white">URGENT</span>}
          <span className="ml-auto flex items-center gap-1 text-[13px] font-semibold text-stone-600"><Clock className="h-3.5 w-3.5" /> {task.time ? time12(task.time) : "Today"}</span>
        </div>
        <div className="mt-3 text-[24px] font-extrabold leading-tight tracking-tight text-stone-900">{task.customer}</div>
        <div className="mt-1.5 flex items-start gap-1.5 text-[15px] leading-snug text-stone-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" /> {where}</div>
        {task.note && <div className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-[13px] leading-snug text-orange-800">{task.note}</div>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={task.phone ? `tel:${task.phone.replace(/\s/g, "")}` : undefined} className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-[15px] font-bold ${task.phone ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-400"}`}><Phone className="h-5 w-5" /> Call</a>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-sky-50 text-[15px] font-bold text-sky-700"><Navigation className="h-5 w-5" /> Navigate</a>
        </div>
        <div className="mt-4 flex items-end justify-between rounded-2xl bg-stone-50 px-4 py-3">
          <div className="text-[13px] leading-relaxed text-stone-600">
            {task.items.map((l, i) => <div key={i}>{lineLabel(state, l)}</div>)}
          </div>
          <div className="text-right"><div className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">Collect</div><div className="font-mono text-[22px] font-extrabold text-stone-900">{money(amount)}</div></div>
        </div>
      </div>
      <div className="border-t border-stone-100 p-4">
        {locked ? (
          <Btn size="lg" variant="soft" className="h-14 w-full text-[16px]" onClick={() => act({ type: "task/pickup", id: task.id })}>Picked up just this one</Btn>
        ) : (
          <Btn size="lg" variant="orange" className="h-14 w-full text-[16px]" onClick={onDeliver}><Camera className="h-5 w-5" /> Delivered</Btn>
        )}
        <button onClick={onFail} className="mt-2 w-full py-1.5 text-[13px] font-medium text-stone-500">Couldn't deliver</button>
      </div>
    </div>
  );
}

function DeliverSheet({ task, onClose, act }) {
  const [photo, setPhoto] = useState(null);
  const [receivedBy, setReceivedBy] = useState("");
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(false);
  const file = useRef(null);
  useEffect(() => {
    if (task) { setPhoto(null); setReceivedBy(""); setMethod("cash"); setAmount(taskValue(task)); setChangeAmount(false); }
  }, [task]);
  if (!task) return null;
  const pick = async (e) => { const f = e.target.files && e.target.files[0]; if (f) setPhoto(await shrinkPhoto(f)); };
  const unpaid = method === "unpaid";
  const save = () => {
    act({ type: "task/deliver", id: task.id, photo, receivedBy, method: unpaid ? "unpaid" : method, amount: unpaid ? 0 : amount, confirmed: !unpaid, note: unpaid ? `Not paid at the door. Owes ${money(taskValue(task))}.` : "" });
    onClose();
  };
  return (
    <Modal open={!!task} onClose={onClose} title={`Delivered to ${task.customer}`}>
      <div className="grid gap-4">
        <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
        <button onClick={() => file.current.click()} className={`grid w-full place-items-center overflow-hidden rounded-2xl ${photo ? "aspect-[4/3]" : "h-36 border-2 border-dashed border-orange-300 bg-orange-50 text-orange-700"}`}>
          {photo ? <img src={photo} alt="Proof of delivery" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1.5 text-[14px] font-semibold"><Camera className="h-8 w-8" /> Take a photo at the door</span>}
        </button>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-stone-600">{unpaid ? "Customer still owes" : "You collected"}</span>
            <span className="font-mono text-[24px] font-extrabold text-stone-900">{money(unpaid ? taskValue(task) : amount)}</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[["cash", "Cash"], ["transfer", "Transfer"], ["pos", "POS"], ["unpaid", "Not paid"]].map(([id, label]) => (
              <button key={id} onClick={() => setMethod(id)} className={`h-11 rounded-xl text-[13px] font-semibold ${method === id ? (id === "unpaid" ? "bg-rose-600 text-white" : "bg-stone-900 text-white") : "bg-stone-100 text-stone-700"}`}>{label}</button>
            ))}
          </div>
          {!unpaid && (changeAmount
            ? <input type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputCls} mt-2`} aria-label="Amount collected" />
            : <button onClick={() => setChangeAmount(true)} className="mt-2 text-[12.5px] font-medium text-stone-500 underline-offset-2 hover:underline">Customer paid a different amount?</button>)}
          {unpaid && <div className="mt-2 text-[12.5px] text-rose-700">The delivery still counts. The office follows up the payment.</div>}
        </div>
        <input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder={`Received by (${task.customer})`} className={inputCls} />
        <Btn size="lg" variant="green" className="h-14 text-[16px]" disabled={!photo} onClick={save}><Check className="h-5 w-5" /> Confirm</Btn>
        {!photo && <div className="-mt-2 text-center text-[12px] text-stone-400">Take the photo first.</div>}
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

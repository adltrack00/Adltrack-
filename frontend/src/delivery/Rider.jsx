// The rider app, phone-first and one thing at a time: collect everything at the office, then only the next drop is
// shown in full, with Call, Navigate and one big button. Delivered = a photo and what was collected.
import React, { useEffect, useRef, useState } from "react";
import { Camera, Check, Clock, Delete, Home, Inbox, MapPin, User, MessageSquare, Navigation, Phone, Power, Send, X } from "lucide-react";
import { isActive, productById, riderLoad, units as taskUnits, useWorkspace, value as taskValue, lineLabel } from "./store";
import { SceneCta, themeOf, Tip } from "./scenes";
import { AdaMark, Avatar, Bar, Btn, Empty, HeroCard, inputCls, Modal, OptionList, Stars, StatusPill, statusOf, Tag, WeekStrip } from "./ui";
import { clock, money, shrinkPhoto, time12 } from "./utils";
import { NotLinked } from "./Vendor";

export default function Rider({ riderId, go }) {
  const { state } = useWorkspace();
  const rider = state.riders.find((r) => r.id === riderId);
  if (!rider) return <NotLinked go={go} company={state.company.name} what="rider" />;
  return <RiderApp rider={rider} go={go} />;
}

function RiderApp({ rider, go }) {
  const { state, act } = useWorkspace();
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
    <div className="min-h-screen bg-neutral-200 sm:py-8">
      <div className={`${themeOf(state.company.theme).rider} relative mx-auto flex h-[100dvh] max-w-[430px] flex-col sm:h-[880px] sm:overflow-hidden sm:rounded-[48px] sm:shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:ring-[10px] sm:ring-black`}>
        <div className="flex-1 overflow-y-auto">
        <header className="flex items-start gap-3 px-6 pb-4 pt-8 text-white">
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold leading-tight text-white/50">{new Date().toLocaleDateString([], { weekday: "long" })}<br />{new Date().toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
          <button onClick={() => act({ type: "rider/online", id: rider.id, online: !rider.online })} className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold ${rider.online ? "bg-emerald-400 text-black" : "bg-white/15 text-white"}`}>
            <Power className="h-4 w-4" /> {rider.online ? "On duty" : "Off duty"}
          </button>
          <Avatar name={rider.name} color={rider.color} size={40} className="ring-2 ring-white/30" />
        </header>

        {!rider.online ? (
            <div className="flex flex-col items-center px-6 pt-20 text-center text-white">
              <button onClick={() => act({ type: "rider/online", id: rider.id, online: true })} className="relative grid h-44 w-44 place-items-center rounded-full text-[30px] font-extrabold tracking-tight text-white">
                <span className="absolute inset-0 animate-pulse rounded-full ada-orb opacity-70 blur-xl" />
                <span className="absolute inset-0 rounded-full ada-orb" />
                <span className="relative">GO</span>
              </button>
              <div className="mt-10 text-[34px] font-extrabold tracking-[-0.03em]">You're off duty</div>
              <div className="mt-2 text-[16px] text-white/55">{open.length ? `${open.length} drops are waiting for you today.` : "Go on duty to get today's drops."}</div>
            </div>
        ) : (
        <>
        {tab === "drops" && (
          <div className="px-5 pb-8">
            <WeekStrip className="mb-5" />
            <HeroCard>
              Hey {rider.short}!<br />
              <span className="text-white/45">You have</span> {money(open.reduce((x, t) => x + taskValue(t), 0))}<br />
              <span className="text-white/45">to collect</span> today
              <div className="mt-6 flex gap-6 text-[14px] font-medium tracking-normal text-white/55">
                <span><b className="text-[20px] text-white">{load.done}/{load.tasks.length}</b> done</span>
                <span><b className="text-[20px] text-white">{money(load.collected)}</b> in</span>
                <span><b className="text-[20px] text-white">{load.units}/{rider.dailyUnits}</b> units</span>
              </div>
            </HeroCard>
          </div>
        )}
        <div className="min-h-[60%] rounded-t-[40px] bg-white px-5 pb-36 pt-7">
          {tab === "drops" ? (
            <>

              {!!toCollect.length && (
                <div className="relative overflow-hidden rounded-[30px] bg-black p-6 text-white">
                  <Stars />
                  <Tag className="relative text-blue-300">Step 1 · At the office</Tag>
                  <div className="mt-2 text-[20px] font-extrabold leading-tight tracking-tight">Collect {collectUnits} {collectUnits === 1 ? "unit" : "units"} for {toCollect.length} {toCollect.length === 1 ? "drop" : "drops"}</div>
                  <div className="mt-3 space-y-1 text-[13.5px] text-neutral-300">
                    {collectList.map(([name, n]) => <div key={name} className="flex justify-between"><span>{name}</span><span className="font-mono text-white">× {n}</span></div>)}
                  </div>
                  <Btn size="lg" variant="white" className="relative mt-5 w-full" onClick={() => act({ type: "task/pickupAll", ids: toCollect.map((t) => t.id) })}><Check className="h-4 w-4" /> I have them all</Btn>
                </div>
              )}

              {next ? (
                <NextDrop task={next} state={state} act={act} locked={next.status === "assigned"} onDeliver={() => setDelivering(next)} onFail={() => setFailing(next)} />
              ) : (
                <SceneCta variant={themeOf(state.company.theme).scene} className="mt-4" title="All done for now." sub="New drops from the office show up here and in your inbox." cta={msgs.some((m) => m.from !== "rider" && !m.read) ? "Open inbox" : null} onClick={() => setTab("inbox")} />
              )}

              {later.length > 0 && (
                <div className="mt-6">
                  <div className="text-[13px] font-semibold text-neutral-500">Then {later.length} more</div>
                  <div className="mt-2 divide-y divide-neutral-100 overflow-hidden rounded-2xl bg-white">
                    {later.map((t, i) => (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-100 font-mono text-[11px] font-semibold text-neutral-600">{i + 2}</span>
                        <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold text-neutral-900">{t.urgent ? "🔥 " : ""}{t.customer}</div><div className="truncate text-[12px] text-neutral-500">{t.zone || t.address} · {t.time ? time12(t.time) : "Today"}</div></div>
                        <span className="font-mono text-[12.5px] text-neutral-600">{money(taskValue(t))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Tip className="mt-6 text-[14.5px]">Take the photo at the door before you hand over the parcel, and type the exact amount you collected.</Tip>

              {!!done.length && (
                <details className="mt-6">
                  <summary className="cursor-pointer select-none text-[13px] font-semibold text-neutral-500">Done today ({done.length})</summary>
                  <div className="mt-2 space-y-2">
                    {done.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                        {t.proof && t.proof.photo ? <img src={t.proof.photo} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-xl bg-neutral-100"><X className="h-4 w-4 text-neutral-400" /></span>}
                        <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-semibold">{t.customer}</div><div className="text-[12px] text-neutral-500">{t.proof ? clock(t.proof.at) : t.failReason}</div></div>
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
        </>
        )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-3 px-4">
          <nav className="pointer-events-auto flex flex-1 items-center gap-1 rounded-full bg-white/80 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur-xl">
            {[["drops", "Drops", Home], ["inbox", "Inbox", Inbox]].map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)} className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[12.5px] font-medium ${tab === id ? "bg-white text-blue-600 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)]" : "text-neutral-900"}`}>
                <Icon className="h-[22px] w-[22px]" /> {label}
                {id === "inbox" && unread > 0 && <span className="absolute right-[30%] top-1.5 h-2 w-2 rounded-full bg-blue-600" />}
              </button>
            ))}
            <button onClick={() => go("/account")} className="flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[12.5px] font-medium text-neutral-900" data-testid="account"><User className="h-[22px] w-[22px]" /> Me</button>
          </nav>
          <button onClick={() => (next ? (next.status === "assigned" ? act({ type: "task/pickupAll", ids: toCollect.map((t) => t.id) }) : setDelivering(next)) : setTab("inbox"))} className="pointer-events-auto grid h-[66px] w-[66px] place-items-center rounded-full bg-white/80 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur-xl" aria-label="Next action">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white"><Camera className="h-5 w-5" /></span>
          </button>
        </div>
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
    <div className={`mt-4 overflow-hidden rounded-3xl bg-white ring-2 ${locked ? "ring-neutral-200" : "ring-blue-400/70"}`}>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <Tag className={locked ? "text-neutral-400" : "text-blue-600"}>{locked ? "Step 2 · First drop" : "Now"}</Tag>
          {task.urgent && <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10.5px] font-bold text-white">URGENT</span>}
          <span className="ml-auto flex items-center gap-1 text-[13px] font-semibold text-neutral-600"><Clock className="h-3.5 w-3.5" /> {task.time ? time12(task.time) : "Today"}</span>
        </div>
        <div className="mt-3 text-[24px] font-extrabold leading-tight tracking-tight text-neutral-900">{task.customer}</div>
        <div className="mt-1.5 flex items-start gap-1.5 text-[15px] leading-snug text-neutral-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" /> {where}</div>
        {task.note && <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-[13px] leading-snug text-blue-800">{task.note}</div>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={task.phone ? `tel:${task.phone.replace(/\s/g, "")}` : undefined} className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-[15px] font-bold ${task.phone ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-400"}`}><Phone className="h-5 w-5" /> Call</a>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-sky-50 text-[15px] font-bold text-sky-700"><Navigation className="h-5 w-5" /> Navigate</a>
        </div>
        <div className="mt-4 flex items-end justify-between rounded-2xl bg-neutral-50 px-4 py-3">
          <div className="text-[13px] leading-relaxed text-neutral-600">
            {task.items.map((l, i) => <div key={i}>{lineLabel(state, l)}</div>)}
          </div>
          <div className="text-right"><div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Collect</div><div className="font-mono text-[22px] font-extrabold text-neutral-900">{money(amount)}</div></div>
        </div>
      </div>
      <div className="border-t border-neutral-100 p-4">
        {locked ? (
          <Btn size="lg" variant="soft" className="h-14 w-full text-[16px]" onClick={() => act({ type: "task/pickup", id: task.id })}>Picked up just this one</Btn>
        ) : (
          <Btn size="lg" variant="orange" className="h-14 w-full text-[16px]" onClick={onDeliver}><Camera className="h-5 w-5" /> Delivered</Btn>
        )}
        <button onClick={onFail} className="mt-2 w-full py-1.5 text-[13px] font-medium text-neutral-500">Couldn't deliver</button>
      </div>
    </div>
  );
}

function DeliverSheet({ task, onClose, act }) {
  const [photo, setPhoto] = useState(null);
  const [receivedBy, setReceivedBy] = useState("");
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState("0");
  const [fresh, setFresh] = useState(true);
  const file = useRef(null);
  useEffect(() => {
    if (task) { setPhoto(null); setReceivedBy(""); setMethod("cash"); setAmount(String(taskValue(task))); setFresh(true); }
  }, [task]);
  if (!task) return null;
  const pick = async (e) => { const f = e.target.files && e.target.files[0]; if (f) setPhoto(await shrinkPhoto(f, 1280)); };
  const unpaid = method === "unpaid";
  const press = (k) => {
    setAmount((cur) => {
      const base = fresh ? "0" : cur;
      if (k === "del") return base.length > 1 ? base.slice(0, -1) : "0";
      if (k === "." && base.includes(".")) return base;
      return base === "0" && k !== "." ? k : base + k;
    });
    setFresh(false);
  };
  const save = () => {
    act({ type: "task/deliver", id: task.id, photo, receivedBy, method: unpaid ? "unpaid" : method, amount: unpaid ? 0 : Number(amount) || 0, confirmed: !unpaid, note: unpaid ? `Not paid at the door. Owes ${money(taskValue(task))}.` : "" });
    onClose();
  };
  const shown = unpaid ? taskValue(task) : Number(amount) || 0;
  return (
    <Modal open={!!task} onClose={onClose} title="Confirm delivery">
      <div className="grid gap-4">
        <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
        <button onClick={() => file.current.click()} className={`flex w-full items-center gap-3 overflow-hidden rounded-[22px] ${photo ? "h-40" : "h-16 justify-center bg-black text-white"}`}>
          {photo ? <img src={photo} alt="Proof of delivery" className="h-full w-full object-cover" /> : <><Camera className="h-5 w-5" /><span className="text-[16px] font-medium">Photo at {task.customer.split(" ")[0]}'s door</span></>}
        </button>
        <div className="py-4 text-center">
          <div className="text-[52px] font-bold leading-none tracking-[-0.03em] text-neutral-950">{money(shown)}</div>
          <div className="mt-2 text-[15px] font-semibold text-neutral-400">{unpaid ? "Customer still owes" : "Amount collected"}</div>
        </div>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {[["cash", "Cash"], ["transfer", "Transfer"], ["pos", "POS"], ["unpaid", "Not paid"]].map(([id, label]) => (
            <button key={id} onClick={() => setMethod(id)} className={`h-12 shrink-0 rounded-full px-6 text-[16px] font-medium ${method === id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"}`}>{label}</button>
          ))}
        </div>
        {!unpaid && (
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((k) => (
              <button key={k} onClick={() => press(k)} className="grid h-14 place-items-center rounded-2xl bg-neutral-100 text-[24px] font-medium text-neutral-950 active:bg-neutral-200">{k === "del" ? <Delete className="h-6 w-6" /> : k}</button>
            ))}
          </div>
        )}
        <input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder={`Received by (${task.customer})`} className={inputCls} />
        <Btn size="lg" className="h-[60px] text-[18px]" disabled={!photo} onClick={save}>{photo ? "Save" : "Take the photo first"}</Btn>
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
      <div className="text-[20px] font-medium tracking-tight text-neutral-950">What happened?</div>
      <div className="mt-4 grid gap-3">
        {REASONS.map((r) => (
          <button key={r} onClick={() => setReason(r)} className={`rounded-[20px] px-6 py-5 text-left text-[17px] transition ${reason === r ? "bg-blue-100/80 font-semibold text-neutral-950" : "bg-neutral-100 text-neutral-900"}`}>{r}</button>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-4">
        <p className="flex-1 text-[13.5px] leading-snug text-neutral-400">The items go back to the warehouse count and the office sees it right away.</p>
        <button onClick={() => { act({ type: "task/fail", id: task.id, reason }); onClose(); }} className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-neutral-900 text-white" aria-label="Report"><Check className="h-7 w-7" /></button>
      </div>
    </Modal>
  );
}

function RiderInbox({ rider, msgs, act }) {
  const [text, setText] = useState("");
  return (
    <div className="pt-2">
      <h2 className="text-[16px] font-bold text-neutral-900">Inbox</h2>
      <div className="mt-3 space-y-3">
        {msgs.length ? msgs.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.from === "rider" ? "justify-end" : ""}`}>
            {m.from === "ada" && <AdaMark size={28} className="mt-1" />}
            {m.from === "dispatcher" && <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-900 text-white"><MessageSquare className="h-3.5 w-3.5" /></span>}
            <div className="max-w-[82%]">
              <div className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${m.from === "rider" ? "rounded-br-md bg-neutral-900 text-white" : "rounded-bl-md bg-white text-neutral-800"}`}>{m.text}</div>
              <div className={`mt-1 text-[11px] text-neutral-400 ${m.from === "rider" ? "text-right" : ""}`}>{m.from === "ada" ? "ADA" : m.from === "dispatcher" ? "Dispatch" : "You"} · {clock(m.at)}</div>
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

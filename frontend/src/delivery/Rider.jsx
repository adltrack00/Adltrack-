// The rider app, phone-first. Four tabs, like any app a rider already knows:
//   Home      new batches arrive as an offer card (pay, stops, route) to swipe and accept, then one drop at a time.
//   Earnings  this week's pay, day by day, and the wallet: cash with you, handed in, checked by the office.
//   Inbox     notifications and the chat with dispatch, with unread counts.
//   Menu      big, bold links: earnings, wallet, your level, account.
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownLeft, ArrowLeft, ArrowUpRight, BadgeCheck, Camera, Check, ChevronDown, ChevronRight, ChevronsRight, Clock, Delete, Gem, Home, Inbox, Landmark,
  LogOut, MapPin, Menu as MenuIcon, MessageSquare, Navigation, Package, Phone, Power, Send, Star, Wallet, X,
} from "lucide-react";
import { cashHeld, collectedOf, fees, handInToCheck, isActive, isDeclined, isDelivered, isOffer, LEVELS, productById, riderLevel, riderLoad, riderWeek, units as taskUnits, useWorkspace, value as taskValue, lineLabel } from "./store";
import { SceneCta, themeOf, Tip } from "./scenes";
import { AdaMark, Btn, Empty, HeroCard, inputCls, Modal, Stars, StatusPill, statusOf, Tag, WeekStrip } from "./ui";
import { ago, clock, money, shrinkPhoto, time12, todayISO } from "./utils";
import { NotLinked } from "./Vendor";
import { MeButton } from "./Photo";
import { useAuth } from "./auth";
import { cn } from "../lib/utils";

export default function Rider({ riderId, go }) {
  const { state } = useWorkspace();
  const rider = state.riders.find((r) => r.id === riderId);
  if (!rider) return <NotLinked go={go} company={state.company.name} what="rider" />;
  return <RiderApp rider={rider} go={go} />;
}

const byTime = (a, b) => (Number(!!b.urgent) - Number(!!a.urgent)) || ((a.time || "99") < (b.time || "99") ? -1 : 1);

// Remembers, on this phone, when the rider last looked at their notifications.
function useSeen(key) {
  // On a new phone, only the last day counts as new.
  const since = () => new Date(Date.now() - 86400000).toISOString();
  const [seen, setSeen] = useState(() => { try { return localStorage.getItem(key) || since(); } catch (e) { return since(); } });
  const mark = () => { const at = new Date().toISOString(); setSeen(at); try { localStorage.setItem(key, at); } catch (e) { /* storage blocked */ } };
  return [seen, mark];
}

function RiderApp({ rider, go }) {
  const { state, act } = useWorkspace();
  const { signOut } = useAuth();
  const [tab, setTab] = useState("home");
  const [page, setPage] = useState(null); // a page opened from the menu: "level"
  const [delivering, setDelivering] = useState(null);
  const [failing, setFailing] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [handingIn, setHandingIn] = useState(false);
  const theme = themeOf(state.company.theme);
  const rate = fees(state).rider;

  const load = riderLoad(state, rider.id);
  const week = riderWeek(state, rider.id);
  const { level, next: nextLevel } = riderLevel(week);
  const msgs = state.messages.filter((m) => m.riderId === rider.id);
  const unreadChat = msgs.filter((m) => m.from !== "rider" && !m.read).length;
  const notes = useMemo(() => riderNotes(state, rider, rate), [state, rider, rate]);
  const [seen, markSeen] = useSeen(`delivery-rider-seen:${rider.id}`);
  const unreadNotes = notes.filter((n) => n.at > seen).length;

  const open = load.tasks.filter(isActive).sort(byTime);
  const offers = open.filter(isOffer);
  const declined = open.filter(isDeclined);
  const mine = open.filter((t) => !isOffer(t) && !isDeclined(t));
  const done = load.tasks.filter((t) => !isActive(t));
  const toCollect = mine.filter((t) => t.status === "assigned");
  const next = mine.find((t) => t.status === "picked_up") || mine[0];
  const later = mine.filter((t) => t !== next);
  const todayPay = load.tasks.filter(isDelivered).length * rate;
  const myTasks = state.tasks.filter((t) => t.riderId === rider.id);
  const holding = myTasks.filter((t) => cashHeld(t) > 0);
  const cash = holding.reduce((s, t) => s + cashHeld(t), 0);

  const scroller = useRef(null);
  const goTab = (id) => { setPage(null); setTab(id); if (scroller.current) scroller.current.scrollTop = 0; };
  const openWallet = () => { goTab("earnings"); setTimeout(() => document.getElementById("wallet")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); };

  return (
    <div className="min-h-screen bg-neutral-200 sm:py-8">
      <div className={`${theme.rider} relative mx-auto flex h-[100dvh] max-w-[430px] flex-col sm:h-[880px] sm:overflow-hidden sm:rounded-[48px] sm:shadow-[0_30px_80px_rgba(0,0,0,0.3)] sm:ring-[10px] sm:ring-black`}>
        <div ref={scroller} className="flex flex-1 flex-col overflow-y-auto [&>*]:shrink-0" data-testid="rider-scroll">
          {page === "level" ? (
            <LevelPage week={week} level={level} next={nextLevel} onBack={() => setPage(null)} />
          ) : tab === "menu" ? (
            <MenuPage rider={rider} week={week} level={level} company={state.company} onPick={(id) => (id === "wallet" ? openWallet() : id === "level" ? (setPage("level"), scroller.current && (scroller.current.scrollTop = 0)) : id === "account" ? go("/account") : goTab(id))} onSignOut={async () => { await signOut(); go("/"); }} />
          ) : (
            <>
              <header className="flex items-center gap-3 px-5 pb-4 pt-7 text-white">
                <MeButton onClick={() => goTab("menu")} color={rider.color} testId="rider-photo" />
                <button onClick={() => goTab("earnings")} className="mx-auto flex h-12 items-center gap-1.5 rounded-full bg-black/45 px-5 ring-1 ring-white/10 backdrop-blur" data-testid="pay-pill">
                  <span className="text-[22px] font-extrabold tracking-tight text-emerald-300">{money(todayPay)}</span>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </button>
                <button onClick={() => act({ type: "rider/online", id: rider.id, online: !rider.online })} className={cn("grid h-11 w-11 place-items-center rounded-full ring-1", rider.online ? "bg-emerald-400 text-black ring-emerald-300" : "bg-black/45 text-white ring-white/10")} aria-label={rider.online ? "Go off duty" : "Go on duty"} data-testid="duty">
                  <Power className="h-5 w-5" />
                </button>
              </header>
              <div className="-mt-2 mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{tab === "earnings" ? "Earned today" : rider.online ? "On duty · today" : "Off duty"}</div>

              {tab === "home" && (!rider.online ? (
                <OffDuty rider={rider} act={act} offers={offers} open={open} week={week} />
              ) : (
                <>
                  <div className="px-5 pb-8">
                    {offers.length ? (
                      <OfferCard tasks={offers} state={state} rate={rate} onAccept={() => act({ type: "task/accept", ids: offers.map((t) => t.id) })} onDecline={() => setDeclining(offers)} />
                    ) : (
                      <>
                        <WeekStrip className="mb-5" />
                        <HeroCard>
                          Hey {rider.short}!<br />
                          <span className="text-white/45">You have</span> {money(mine.reduce((x, t) => x + taskValue(t), 0))}<br />
                          <span className="text-white/45">to collect</span> today
                          <div className="mt-6 flex gap-6 text-[14px] font-medium tracking-normal text-white/55">
                            <span><b className="text-[20px] text-white">{load.done}/{load.tasks.length}</b> done</span>
                            <span><b className="text-[20px] text-white">{money(load.collected)}</b> in</span>
                            <span><b className="text-[20px] text-white">{load.units}/{rider.dailyUnits}</b> units</span>
                          </div>
                        </HeroCard>
                      </>
                    )}
                  </div>
                  <div className="flex-1 rounded-t-[40px] bg-white px-5 pb-36 pt-7">
                    {!!declined.length && (
                      <div className="mb-4 flex items-start gap-3 rounded-[22px] bg-neutral-100 p-4">
                        <X className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
                        <div className="text-[14px] leading-snug text-neutral-600">You turned down {declined.length} {declined.length === 1 ? "drop" : "drops"} ({declined[0].declined.reasons.join(", ") || "no reason"}). The office is finding another rider.</div>
                      </div>
                    )}
                    {!!toCollect.length && <CollectCard tasks={toCollect} state={state} onDone={() => act({ type: "task/pickupAll", ids: toCollect.map((t) => t.id) })} />}

                    {next ? (
                      <NextDrop task={next} state={state} act={act} locked={next.status === "assigned"} onDeliver={() => setDelivering(next)} onFail={() => setFailing(next)} />
                    ) : offers.length ? (
                      <div className="rounded-[26px] bg-neutral-100 p-5 text-[15px] text-neutral-600">Swipe the card above to take today's batch. Your first drop shows here.</div>
                    ) : (
                      <SceneCta variant={theme.scene} className="mt-4" title="All done for now." sub="New batches from the office show up here as a card to accept." cta={unreadChat ? "Open inbox" : null} onClick={() => goTab("inbox")} />
                    )}

                    {later.length > 0 && <RouteList tasks={later} start={2} />}

                    {cash > 0 && (
                      <button onClick={openWallet} className="mt-6 flex w-full items-center gap-3 rounded-[22px] bg-amber-50 p-4 text-left">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700"><Wallet className="h-5 w-5" /></span>
                        <span className="flex-1"><span className="block text-[15px] font-bold text-neutral-950">{money(cash)} cash with you</span><span className="block text-[13px] text-neutral-500">Pay it into the company account today.</span></span>
                        <ChevronRight className="h-5 w-5 text-neutral-400" />
                      </button>
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
                  </div>
                </>
              ))}

              {tab === "earnings" && <Earnings rider={rider} week={week} rate={rate} myTasks={myTasks} cash={cash} onHandIn={() => setHandingIn(true)} company={state.company.name} />}

              {tab === "inbox" && (
                <div className="flex-1 rounded-t-[40px] bg-white px-5 pb-36 pt-7">
                  <InboxTabs rider={rider} msgs={msgs} act={act} notes={notes} seen={seen} markSeen={markSeen} unreadNotes={unreadNotes} unreadChat={unreadChat} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-3 px-4">
          <nav className="pointer-events-auto flex flex-1 items-center gap-1 rounded-full bg-white/85 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur-xl" data-testid="rider-tabs">
            {[["home", "Home", Home], ["earnings", "Earnings", Wallet], ["inbox", "Inbox", Inbox], ["menu", "Menu", MenuIcon]].map(([id, label, Icon]) => {
              const badge = id === "inbox" ? unreadNotes + unreadChat : id === "home" ? offers.length : 0;
              const on = tab === id && !page;
              return (
                <button key={id} onClick={() => goTab(id)} className={cn("relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[12px] font-medium", on ? "bg-white text-blue-600 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)]" : "text-neutral-900")} data-testid={`tab-${id}`}>
                  <Icon className="h-[21px] w-[21px]" /> {label}
                  {badge > 0 && <span className="absolute right-[18%] top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-600 px-1 text-[10.5px] font-bold text-white">{badge > 9 ? "9+" : badge}</span>}
                </button>
              );
            })}
          </nav>
          {tab === "home" && !page && next && rider.online && (
            <button onClick={() => (next.status === "assigned" ? act({ type: "task/pickupAll", ids: toCollect.map((t) => t.id) }) : setDelivering(next))} className="pointer-events-auto grid h-[66px] w-[66px] place-items-center rounded-full bg-white/85 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur-xl" aria-label="Next action">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white">{next.status === "assigned" ? <Package className="h-5 w-5" /> : <Camera className="h-5 w-5" />}</span>
            </button>
          )}
        </div>
      </div>
      <DeliverSheet task={delivering} onClose={() => setDelivering(null)} act={act} />
      <ReasonSheet
        open={!!failing} onClose={() => setFailing(null)} title="Couldn't deliver" question="What happened?" sub="The items go back to the warehouse count and the office sees it right away."
        options={FAIL_REASONS} max={1} submit="Report"
        onSubmit={([reason]) => { act({ type: "task/fail", id: failing.id, reason }); setFailing(null); }}
      />
      <ReasonSheet
        open={!!declining} onClose={() => setDeclining(null)} title="Turn down this batch" question="Why are you turning it down?" sub="Your answer goes to the office so they can give these drops to someone else. Pick up to 2."
        options={DECLINE_REASONS} max={2} submit="Send to office"
        onSubmit={(reasons) => { act({ type: "task/decline", ids: declining.map((t) => t.id), reasons }); setDeclining(null); }}
      />
      <HandInSheet open={handingIn} onClose={() => setHandingIn(false)} tasks={holding} total={cash} onSubmit={(ref) => { act({ type: "cash/handIn", ids: holding.map((t) => t.id), ref }); setHandingIn(false); }} />
    </div>
  );
}

/* ---------- Off duty ---------- */

function OffDuty({ rider, act, offers, open, week }) {
  return (
    <div className="flex flex-col items-center px-6 pb-40 pt-12 text-center text-white">
      <button onClick={() => act({ type: "rider/online", id: rider.id, online: true })} className="relative grid h-44 w-44 place-items-center rounded-full text-[30px] font-extrabold tracking-tight text-white" data-testid="go">
        <span className="absolute inset-0 animate-pulse rounded-full ada-orb opacity-70 blur-xl" />
        <span className="absolute inset-0 rounded-full ada-orb" />
        <span className="relative">GO</span>
      </button>
      <div className="mt-10 text-[34px] font-extrabold tracking-[-0.03em]">You're off duty</div>
      <div className="mt-2 text-[16px] text-white/55">{offers.length ? `A new batch of ${offers.length} ${offers.length === 1 ? "drop" : "drops"} is waiting for you.` : open.length ? `${open.length} drops are waiting for you today.` : "Go on duty to get today's batch."}</div>
      <div className="mt-8 grid w-full grid-cols-3 gap-2">
        {[[money(week.earned), "this week"], [week.drops, "drops"], [`${Math.round(week.successRate * 100)}%`, "delivered"]].map(([v, l]) => (
          <div key={l} className="rounded-[20px] bg-black/30 px-2 py-3 ring-1 ring-white/10"><div className="text-[18px] font-extrabold tracking-tight">{v}</div><div className="text-[12px] text-white/50">{l}</div></div>
        ))}
      </div>
    </div>
  );
}

/* ---------- The offer card: a new batch to accept ---------- */

function OfferCard({ tasks, state, rate, onAccept, onDecline }) {
  const sorted = [...tasks].sort(byTime);
  const u = sorted.reduce((s, t) => s + taskUnits(t), 0);
  const toCollect = sorted.reduce((s, t) => s + taskValue(t), 0);
  const zones = [...new Set(sorted.map((t) => t.zone).filter(Boolean))];
  const urgent = sorted.some((t) => t.urgent);
  const first = sorted[0];
  const last = sorted.length > 1 ? sorted[sorted.length - 1] : null;
  const middle = sorted.length - (last ? 2 : 1);
  return (
    <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-b from-black to-neutral-900 p-6 text-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10" data-testid="offer">
      <Stars />
      <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-3.5 text-[14px] font-bold text-neutral-950">
          <AdaMark size={20} /> {urgent ? "Urgent batch" : "New batch"}
        </span>
        <button onClick={onDecline} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white" aria-label="Turn down" data-testid="decline"><X className="h-6 w-6" /></button>
      </div>
      <div className="relative mt-4 text-[54px] font-extrabold leading-none tracking-[-0.04em]">{money(sorted.length * rate)}</div>
      <div className="relative mt-2 text-[16px] text-white/60">{sorted.length} {sorted.length === 1 ? "drop" : "drops"} · {u} units{zones.length ? ` · ${zones.slice(0, 2).join(", ")}${zones.length > 2 ? ` +${zones.length - 2}` : ""}` : ""}</div>
      <div className="relative my-5 h-px bg-white/10" />
      <ol className="relative">
        <Stop dot="start" title="The office" sub={`Collect ${u} ${u === 1 ? "unit" : "units"}`} line />
        <Stop dot="drop" title={`${first.time ? time12(first.time) : "Today"} · ${first.zone || "Drop 1"}`} sub={`${first.customer} · ${first.address}`} line={!!last} />
        {middle > 0 && <li className="relative flex items-center gap-4 pb-3 pl-[3px]"><span className="flex w-[30px] flex-col items-center gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1 w-1 rounded-full bg-white/40" />)}</span><span className="text-[15px] text-white/60">{middle} more {middle === 1 ? "stop" : "stops"}</span></li>}
        {last && <Stop dot="end" title={`${last.time ? time12(last.time) : "Today"} · ${last.zone || "Last drop"}`} sub={`${last.customer} · ${last.address}`} />}
      </ol>
      <div className="relative my-5 h-px bg-white/10" />
      <div className="relative mb-4 flex items-center justify-between text-[14px] text-white/60"><span>You collect from customers</span><span className="font-mono text-[16px] font-bold text-white">{money(toCollect)}</span></div>
      <SwipeToAccept onAccept={onAccept} label="Swipe to accept" />
    </div>
  );
}

function Stop({ dot, title, sub, line }) {
  const Dot = { start: <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-blue-600"><Package className="h-4 w-4" /></span>, drop: <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-white"><span className="h-2.5 w-2.5 rounded-full bg-neutral-950" /></span>, end: <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-white"><span className="h-2.5 w-2.5 bg-neutral-950" /></span> }[dot];
  return (
    <li className="relative flex gap-4 pb-4">
      {line && <span className="absolute left-[14px] top-[30px] h-[calc(100%-30px)] w-[2px] bg-white/25" />}
      <span className="relative shrink-0">{Dot}</span>
      <div className="min-w-0 pt-0.5">
        <div className="text-[18px] font-bold leading-tight tracking-tight">{title}</div>
        <div className="mt-0.5 truncate text-[14.5px] text-white/60">{sub}</div>
      </div>
    </li>
  );
}

// A thumb slides the knob all the way across to say yes; a tap on the knob, Enter or the right arrow key works too.
function SwipeToAccept({ onAccept, label }) {
  const track = useRef(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(null);
  const [doneFlag, setDone] = useState(false);
  const max = () => (track.current ? track.current.clientWidth - 64 : 240);
  const finish = () => { setDone(true); setX(max()); setTimeout(onAccept, 180); };
  const down = (e) => { if (doneFlag) return; e.currentTarget.setPointerCapture?.(e.pointerId); setDrag({ start: e.clientX, from: x, moved: false }); };
  const move = (e) => { if (!drag) return; const dx = e.clientX - drag.start; setX(Math.max(0, Math.min(max(), drag.from + dx))); if (Math.abs(dx) > 4 && !drag.moved) setDrag({ ...drag, moved: true }); };
  const up = () => { if (!drag) return; const moved = drag.moved; setDrag(null); if (x >= max() * 0.82) finish(); else if (!moved) finish(); else setX(0); };
  const pct = Math.min(1, x / max());
  return (
    <div ref={track} className="relative h-16 select-none overflow-hidden rounded-2xl bg-white/90 text-neutral-950" data-testid="swipe">
      <div className="absolute inset-y-0 left-0 rounded-2xl bg-emerald-400" style={{ width: x + 64, transition: drag ? "none" : "width .25s" }} />
      <div className="absolute inset-0 grid place-items-center text-[18px] font-bold" style={{ opacity: 1 - pct * 0.9 }}>{doneFlag ? "Accepted" : label}</div>
      <button
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { setDrag(null); setX(0); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); finish(); } }}
        className="absolute left-0 top-0 grid h-16 w-16 touch-none place-items-center rounded-2xl bg-neutral-950 text-white"
        style={{ transform: `translateX(${x}px)`, transition: drag ? "none" : "transform .25s" }}
        aria-label={label}
        data-testid="swipe-knob"
      >
        {doneFlag ? <Check className="h-6 w-6" /> : <ChevronsRight className="h-7 w-7" />}
      </button>
    </div>
  );
}

/* ---------- Collect, the next drop, and the rest of the route ---------- */

function CollectCard({ tasks, state, onDone }) {
  const n = tasks.reduce((s, t) => s + taskUnits(t), 0);
  const list = Object.entries(tasks.reduce((m, t) => {
    for (const l of t.items) { const name = (productById(state, l.productId) || {}).name || "Item"; m[name] = (m[name] || 0) + l.qty + (l.free || 0); }
    return m;
  }, {}));
  return (
    <div className="relative overflow-hidden rounded-[30px] bg-black p-6 text-white">
      <Stars />
      <Tag className="relative text-blue-300">Step 1 · At the office</Tag>
      <div className="relative mt-2 text-[20px] font-extrabold leading-tight tracking-tight">Collect {n} {n === 1 ? "unit" : "units"} for {tasks.length} {tasks.length === 1 ? "drop" : "drops"}</div>
      <div className="relative mt-3 space-y-1 text-[13.5px] text-neutral-300">
        {list.map(([name, k]) => <div key={name} className="flex justify-between"><span>{name}</span><span className="font-mono text-white">× {k}</span></div>)}
      </div>
      <Btn size="lg" variant="white" className="relative mt-5 w-full" onClick={onDone}><Check className="h-4 w-4" /> I have them all</Btn>
    </div>
  );
}

// The rest of the day as a route line: one dot per stop, in the order to ride it.
function RouteList({ tasks, start }) {
  return (
    <div className="mt-6">
      <div className="text-[13px] font-semibold text-neutral-500">Then {tasks.length} more on your route</div>
      <ol className="mt-3">
        {tasks.map((t, i) => (
          <li key={t.id} className="relative flex gap-3 pb-4">
            {i < tasks.length - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-28px)] w-[2px] bg-neutral-200" />}
            <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-950 font-mono text-[11px] font-semibold text-white">{i + start}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2"><span className="truncate text-[15px] font-bold text-neutral-950">{t.urgent ? "🔥 " : ""}{t.customer}</span><span className="shrink-0 font-mono text-[12.5px] text-neutral-500">{money(taskValue(t))}</span></div>
              <div className="truncate text-[13px] text-neutral-500">{t.time ? time12(t.time) : "Today"} · {t.zone || t.address}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// The one drop the rider is doing now: where, who, what to collect, and one big button.
function NextDrop({ task, state, act, locked, onDeliver, onFail }) {
  const amount = taskValue(task);
  const where = [task.address, task.landmark].filter(Boolean).join(" · ");
  return (
    <div className={`mt-4 overflow-hidden rounded-3xl bg-white ring-2 ${locked ? "ring-neutral-200" : "ring-blue-400/70"}`} data-testid="next-drop">
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

/* ---------- Earnings and wallet ---------- */

const shortDay = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString([], { month: "short", day: "numeric" });

function Earnings({ rider, week, rate, myTasks, cash, onHandIn, company }) {
  const [details, setDetails] = useState(false);
  const today = todayISO();
  const top = Math.max(...week.perDay, rate);
  const checking = myTasks.filter(handInToCheck);
  const checkingTotal = checking.reduce((s, t) => s + collectedOf(t), 0);
  // The wallet's activity: cash collected at a door, handed in, and confirmed by the office.
  const activity = myTasks.filter((t) => isDelivered(t) && t.payment && t.payment.method === "cash").flatMap((t) => [
    { at: t.proof ? t.proof.at : t.date, kind: "in", label: `Cash from ${t.customer}`, amount: collectedOf(t) },
    ...(t.payment.handedIn ? [{ at: t.payment.handedIn.at, kind: "out", label: `Paid in${t.payment.handedIn.ref ? ` · ${t.payment.handedIn.ref}` : ""}`, amount: -collectedOf(t), ok: !!t.payment.handInVerified }] : []),
  ]).sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-5 pb-6">
        <h1 className="text-[40px] font-extrabold leading-none tracking-[-0.04em] text-white">Earnings</h1>
        <div className="relative mt-5 overflow-hidden rounded-[30px] bg-black/40 p-5 text-white ring-1 ring-white/10 backdrop-blur" data-testid="week-card">
          <div className="text-[15px] text-white/60">{shortDay(week.days[0])} – {shortDay(week.days[6])}</div>
          <div className="mt-1 text-[44px] font-extrabold leading-none tracking-[-0.04em]">{money(week.earned)}</div>
          <div className="mt-5 flex items-end gap-2">
            {week.perDay.map((v, i) => (
              <div key={week.days[i]} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="relative h-[88px] w-full"><div className={cn("absolute inset-x-0 bottom-0 rounded-lg", week.days[i] === today ? "bg-emerald-400" : "bg-white/30")} style={{ height: `${Math.max(4, (v / top) * 100)}%` }} title={money(v)} /></div>
                <span className={cn("text-[11px] font-semibold", week.days[i] === today ? "text-white" : "text-white/45")}>{"MTWTFSS"[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-[13px] text-white/60">
            <span><b className="block text-[18px] text-white">{week.drops}</b> drops</span>
            <span><b className="block text-[18px] text-white">{week.units}</b> units</span>
            <span><b className="block text-[18px] text-white">{Math.round(week.successRate * 100)}%</b> delivered</span>
          </div>
          <button onClick={() => setDetails(!details)} className="mt-5 h-12 w-full rounded-2xl bg-white/10 text-[15px] font-semibold">{details ? "Hide details" : "See details"}</button>
        </div>
      </div>
      <div className="flex-1 rounded-t-[40px] bg-white px-5 pb-36 pt-7">
        {details && (
          <div className="mb-7">
            <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">This week, drop by drop</h2>
            <div className="mt-3 divide-y divide-neutral-100">
              {week.delivered.length ? [...week.delivered].sort((a, b) => (a.date < b.date ? 1 : -1)).map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1"><div className="truncate text-[14.5px] font-semibold text-neutral-900">{t.customer}</div><div className="text-[12.5px] text-neutral-500">{shortDay(t.date)} · {t.zone || t.address}</div></div>
                  <span className="font-mono text-[14px] font-semibold text-emerald-600">+{money(rate)}</span>
                </div>
              )) : <div className="py-4 text-[14px] text-neutral-500">No deliveries yet this week.</div>}
            </div>
          </div>
        )}

        <h2 id="wallet" className="scroll-mt-4 text-[28px] font-extrabold tracking-[-0.03em] text-neutral-950">Wallet</h2>
        <div className="mt-3 rounded-[28px] bg-neutral-100/80 p-5" data-testid="wallet">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-neutral-500"><Wallet className="h-4 w-4" /> Cash with you</div>
          <div className="mt-1 text-[44px] font-extrabold leading-none tracking-[-0.04em] text-neutral-950">{money(cash)}</div>
          <p className="mt-2 text-[14px] text-neutral-500">{cash > 0 ? `Pay the full amount into ${company || "the company"}'s account. Your pay is sent after the office sees it.` : "Nothing to hand in. Cash you collect at the door shows here."}</p>
          {cash > 0 && <Btn size="lg" className="mt-4 h-14 w-full text-[16px]" onClick={onHandIn} data-testid="hand-in"><Landmark className="h-5 w-5" /> I've paid it in</Btn>}
          {checkingTotal > 0 && <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[13.5px] text-neutral-600"><Clock className="h-4 w-4 text-amber-500" /> {money(checkingTotal)} waiting for the office to check</div>}
        </div>

        <div className="mt-7 flex items-baseline justify-between"><h3 className="text-[20px] font-extrabold tracking-tight text-neutral-950">Activity</h3><span className="text-[12.5px] text-neutral-400">Pay: {money(rate)} a drop</span></div>
        <div className="mt-2 divide-y divide-neutral-100">
          {activity.length ? activity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", a.kind === "in" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>{a.kind === "in" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}</span>
              <div className="min-w-0 flex-1"><div className="truncate text-[14.5px] font-semibold text-neutral-900">{a.label}</div><div className="text-[12.5px] text-neutral-500">{a.at.length > 10 ? `${clock(a.at)} · ${shortDay(a.at.slice(0, 10))}` : shortDay(a.at)}{a.kind === "out" ? (a.ok ? " · checked" : " · being checked") : ""}</div></div>
              <span className={cn("font-mono text-[14px] font-semibold", a.amount < 0 ? "text-neutral-900" : "text-amber-600")}>{a.amount < 0 ? "−" : "+"}{money(Math.abs(a.amount))}</span>
            </div>
          )) : <div className="py-4 text-[14px] text-neutral-500">No cash yet.</div>}
        </div>
      </div>
    </div>
  );
}

function HandInSheet({ open, onClose, tasks, total, onSubmit }) {
  const [ref, setRef] = useState("");
  useEffect(() => { if (open) setRef(""); }, [open]);
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Hand in cash">
      <div className="py-2 text-center">
        <div className="text-[52px] font-bold leading-none tracking-[-0.03em] text-neutral-950">{money(total)}</div>
        <div className="mt-2 text-[15px] font-semibold text-neutral-400">from {tasks.length} {tasks.length === 1 ? "drop" : "drops"}</div>
      </div>
      <div className="mt-4 max-h-40 divide-y divide-neutral-100 overflow-y-auto rounded-2xl bg-neutral-50 px-4">
        {tasks.map((t) => <div key={t.id} className="flex justify-between py-2.5 text-[14px]"><span className="truncate text-neutral-700">{t.customer}</span><span className="font-mono font-semibold">{money(collectedOf(t))}</span></div>)}
      </div>
      <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Transfer reference (optional)" className={cn(inputCls, "mt-4")} data-testid="hand-in-ref" />
      <p className="mt-3 text-[13px] leading-snug text-neutral-500">Pay the full amount. Don't take your pay out of it: the office pays you once it sees the money.</p>
      <Btn size="lg" className="mt-4 h-[60px] w-full text-[17px]" onClick={() => onSubmit(ref.trim())} data-testid="hand-in-send">I've paid {money(total)} in</Btn>
    </Modal>
  );
}

/* ---------- Inbox ---------- */

// What the rider is told about, newest first: new batches, money earned, cash the office checked.
function riderNotes(state, rider, rate) {
  const mine = state.tasks.filter((t) => t.riderId === rider.id);
  const notes = [];
  const batches = {};
  for (const t of mine) {
    const at = (t.history && t.history[0] && t.history[0].at) || "";
    if (!at) continue;
    const key = at.slice(0, 16);
    (batches[key] = batches[key] || []).push(t);
  }
  for (const [, list] of Object.entries(batches)) {
    const zones = [...new Set(list.map((t) => t.zone).filter(Boolean))].join(", ");
    notes.push({ id: `b-${list[0].id}`, at: list[0].history[0].at, title: list.length === 1 ? `New drop: ${list[0].customer}${zones ? `, ${zones}` : ""}` : `New batch: ${list.length} drops${zones ? ` in ${zones}` : ""}`, icon: Package });
  }
  for (const t of mine) {
    if (isDelivered(t) && t.proof) notes.push({ id: `d-${t.id}`, at: t.proof.at, title: `You earned ${money(rate)} for ${t.customer}`, icon: Star });
    if (t.payment && t.payment.handInVerified) notes.push({ id: `v-${t.id}`, at: t.payment.handInVerified, title: `The office got your ${money(collectedOf(t))} from ${t.customer}`, icon: BadgeCheck });
  }
  return notes.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 30);
}

function InboxTabs({ rider, msgs, act, notes, seen, markSeen, unreadNotes, unreadChat }) {
  const [view, setView] = useState("notes");
  const [shownSeen] = useState(seen); // keep the dots for this visit, then clear the count
  useEffect(() => { if (view === "notes" && unreadNotes) markSeen(); }, [view, unreadNotes, markSeen]);
  useEffect(() => { if (view === "chat" && unreadChat) act({ type: "messages/read", riderId: rider.id }); }, [view, unreadChat, act, rider.id]);
  return (
    <div>
      <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-neutral-950">Inbox</h1>
      <div className="mt-4 grid grid-cols-2 border-b border-neutral-200">
        {[["notes", "Notifications", unreadNotes], ["chat", "Dispatch", unreadChat]].map(([id, label, n]) => (
          <button key={id} onClick={() => setView(id)} className={cn("-mb-px flex items-center justify-center gap-2 border-b-[3px] pb-3 text-[15px] font-semibold", view === id ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400")} data-testid={`inbox-${id}`}>
            {label}{n > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-blue-600 px-1.5 text-[12px] font-bold text-white">{n > 9 ? "9+" : n}</span>}
          </button>
        ))}
      </div>
      {view === "notes" ? (
        <div className="divide-y divide-neutral-100">
          {notes.length ? notes.map((n) => (
            <div key={n.id} className="flex items-start gap-3 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-700"><n.icon className="h-[18px] w-[18px]" /></span>
              <div className="min-w-0 flex-1 pt-0.5 text-[15.5px] font-bold leading-snug text-neutral-950">{n.title}</div>
              <div className="flex shrink-0 flex-col items-end gap-2 pt-1"><span className="text-[12.5px] text-neutral-400">{ago(n.at)}</span>{n.at > shownSeen && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}</div>
            </div>
          )) : <Empty icon={Inbox} title="Nothing yet" sub="New batches and money updates show up here." />}
        </div>
      ) : (
        <RiderChat rider={rider} msgs={msgs} act={act} />
      )}
    </div>
  );
}

function RiderChat({ rider, msgs, act }) {
  const [text, setText] = useState("");
  return (
    <div className="pt-4">
      <div className="space-y-3">
        {msgs.length ? msgs.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.from === "rider" ? "justify-end" : ""}`}>
            {m.from === "ada" && <AdaMark size={28} className="mt-1" />}
            {m.from === "dispatcher" && <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-900 text-white"><MessageSquare className="h-3.5 w-3.5" /></span>}
            <div className="max-w-[82%]">
              <div className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${m.from === "rider" ? "rounded-br-md bg-neutral-900 text-white" : "rounded-bl-md bg-neutral-100 text-neutral-800"}`}>{m.text}</div>
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

/* ---------- Menu and level ---------- */

function LevelGem({ level, size = 96 }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <span className={cn("absolute inset-[14%] rotate-45 rounded-[22%] bg-gradient-to-br shadow-[0_0_50px_rgba(120,150,255,0.6)]", level.gem)} />
      <span className="absolute inset-[14%] rotate-45 rounded-[22%] bg-[linear-gradient(135deg,rgba(255,255,255,0.65)_0%,transparent_45%)]" />
      <Gem className="relative text-white/90" style={{ width: size * 0.32, height: size * 0.32 }} />
    </span>
  );
}

function MenuPage({ rider, week, level, company, onPick, onSignOut }) {
  const { user } = useAuth();
  return (
    <div className="px-6 pb-40 pt-8 text-white">
      <div className="flex items-center gap-4">
        <div className="relative">
          <MeButton onClick={() => onPick("account")} color={rider.color} size={64} testId="menu-photo" />
          <span className="absolute -bottom-1 -left-1"><LevelGem level={level} size={30} /></span>
        </div>
        <div>
          <div className="text-[15px] font-semibold uppercase tracking-[0.12em] text-white/80">{(user && user.name) || rider.name}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[15px] text-white/60"><Star className="h-4 w-4" /> {Math.round(week.successRate * 100)}% delivered · {level.name}</div>
        </div>
      </div>
      <nav className="mt-8 grid gap-1" data-testid="rider-menu">
        {[["earnings", "Earnings"], ["wallet", "Wallet"], ["level", "Your level"], ["inbox", "Inbox"], ["account", "Account"]].map(([id, label]) => (
          <button key={id} onClick={() => onPick(id)} className="py-1.5 text-left text-[44px] font-extrabold leading-[1.1] tracking-[-0.04em] text-white transition hover:text-white/70" data-testid={`menu-${id}`}>{label}</button>
        ))}
      </nav>
      <div className="my-6 h-px bg-white/15" />
      <div className="grid gap-4 text-[17px] text-white/85">
        <div className="text-[13px] text-white/50">{rider.vehicle} · {rider.zone}</div>
        <a href={company.phone ? `tel:${company.phone}` : undefined} onClick={() => !company.phone && onPick("inbox")} className="flex items-center gap-3"><Phone className="h-5 w-5" /> Help from the office</a>
        <button onClick={onSignOut} className="flex items-center gap-3 text-left"><LogOut className="h-5 w-5" /> Sign out</button>
      </div>
    </div>
  );
}

const NEEDS = [
  ["drops", "Drops delivered", (w) => w.drops, (v) => `≥ ${v}`, (v) => String(v)],
  ["successRate", "Delivered first try", (w) => w.successRate, (v) => `≥ ${Math.round(v * 100)}%`, (v) => `${Math.round(v * 100)}%`],
  ["photoRate", "Photo at every door", (w) => w.photoRate, (v) => `${Math.round(v * 100)}%`, (v) => `${Math.round(v * 100)}%`],
  ["handInRate", "Cash in the same day", (w) => w.handInRate, (v) => `≥ ${Math.round(v * 100)}%`, (v) => `${Math.round(v * 100)}%`],
];
const PERKS = {
  new: ["Drops picked by ADA near your area", "Pay sent after each hand-in is checked"],
  trusted: ["Carry extra stock overnight, ready for morning drops", "Bigger batches, so more pay a day"],
  top: ["First pick of urgent batches", "Your name on the office board"],
};

function LevelPage({ week, level, next, onBack }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-5 pb-10 pt-7 text-center text-white">
        <div className="flex items-center justify-between"><button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-full bg-white/10" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button><span className="text-[17px] font-semibold">Your level</span><span className="w-11" /></div>
        <div className="mt-6"><LevelGem level={level} size={120} /></div>
        <div className="mt-4 text-[40px] font-extrabold tracking-[-0.04em]" data-testid="level-name">{level.name}</div>
        <div className="mx-auto mt-3 w-fit rounded-full bg-black/30 px-5 py-2.5 text-[14px] ring-1 ring-white/10">This week · {week.drops} drops · {money(week.earned)}</div>
      </div>
      <div className="flex-1 rounded-t-[40px] bg-white px-5 pb-36 pt-7">
        <h2 className="text-[16px] font-semibold text-neutral-500">What you get now</h2>
        <ul className="mt-2 grid gap-2">{PERKS[level.id].map((p) => <li key={p} className="flex items-start gap-3 rounded-2xl bg-neutral-100/80 px-4 py-3 text-[15px] text-neutral-800"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{p}</li>)}</ul>
        {next ? (
          <>
            <div className="mt-8 flex items-center justify-between">
              <div><h2 className="text-[30px] font-extrabold tracking-[-0.03em] text-neutral-950">Unlock {next.name}</h2><div className="text-[15px] text-neutral-500">Meet all {NEEDS.length} this week</div></div>
              <LevelGem level={next} size={64} />
            </div>
            <div className="mt-4 divide-y divide-neutral-100 rounded-[28px] ring-1 ring-neutral-200">
              {NEEDS.map(([key, label, get, goal, fmt]) => {
                const v = get(week);
                const ok = v >= next.needs[key];
                return (
                  <div key={key} className="flex items-center gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-semibold text-neutral-950">{label}</div>
                      {ok ? <span className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold text-emerald-600"><Check className="h-3.5 w-3.5" /> Done</span> : <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[12px] font-semibold text-amber-700">Focus here</span>}
                    </div>
                    <div className="text-right"><div className="text-[24px] font-extrabold tracking-tight text-neutral-950">{fmt(v)}</div><div className="text-[12.5px] text-neutral-500">Goal: {goal(next.needs[key])}</div></div>
                  </div>
                );
              })}
            </div>
          </>
        ) : <div className="mt-8 rounded-[28px] bg-neutral-100 p-5 text-[15px] text-neutral-700">You're at the top level. Keep it up all week to stay here.</div>}
        <p className="mt-6 text-[13px] leading-snug text-neutral-400">Levels are worked out from Monday to Sunday. {LEVELS.map((l) => l.name).join(", ")}.</p>
      </div>
    </div>
  );
}

/* ---------- Sheets ---------- */

const FAIL_REASONS = ["Customer not reachable", "Wrong address", "Customer refused", "Asked to reschedule", "Bike problem", "Something else"];
const DECLINE_REASONS = ["Too far", "Too many drops", "Bike problem", "Area isn't safe", "Not feeling well", "Something else"];

// A grid of big tiles to pick a reason from, like a survey card: pick up to `max`, then send.
function ReasonSheet({ open, onClose, title, question, sub, options, max, submit, onSubmit }) {
  const [picked, setPicked] = useState([]);
  useEffect(() => { if (open) setPicked([]); }, [open]);
  if (!open) return null;
  const toggle = (r) => setPicked((cur) => (cur.includes(r) ? cur.filter((x) => x !== r) : max === 1 ? [r] : cur.length < max ? [...cur, r] : cur));
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-[22px] font-extrabold tracking-tight text-neutral-950">{question}</div>
      <p className="mt-1 text-[14px] leading-snug text-neutral-500">{sub}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5" data-testid="reasons">
        {options.map((r) => (
          <button key={r} onClick={() => toggle(r)} className={cn("h-24 rounded-[20px] p-4 text-left text-[16px] font-semibold leading-tight ring-2 transition", picked.includes(r) ? "bg-neutral-950 text-white ring-neutral-950" : "bg-white text-neutral-900 ring-neutral-200")}>{r}</button>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-[14px] text-neutral-400">{picked.length} of {max}</span>
        <Btn size="lg" disabled={!picked.length} onClick={() => onSubmit(picked)} data-testid="reason-send">{submit}</Btn>
      </div>
    </Modal>
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
        <input ref={file} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} data-testid="photo-input" />
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

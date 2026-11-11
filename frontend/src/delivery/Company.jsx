// The delivery company's dashboard: vendors, riders, stock, deliveries and ADA.
import React, { useMemo, useState } from "react";
import {
  AlertTriangle, ArrowDownUp, CalendarDays, History, Megaphone, NotebookPen, Search, ArrowLeft, ArrowRight, BellRing, Bike, Boxes, Building2, ClipboardPaste, Clock, Flame, LayoutGrid, LogOut, Menu, MessageSquare, Package, PackageCheck, Palette, Phone, Plus, RotateCcw, Send, Settings, Sparkles, Truck, Users, Wallet, X,
} from "lucide-react";
import { AdaPanel } from "./AdaPanel";
import Team from "./Team";
import { SideMenu } from "./SideMenu";
import { MeButton } from "./Photo";
import { StatPill } from "./Stats";
import { ActivityLog, AnnounceModal, Announcements, CalendarPage, LogBook, LogEntryModal, QuickAdd, SearchPage } from "./Records";
import { useAuth } from "./auth";
import { DeliveryCard, Feed, LedgerLegend, PaymentActions, ProductTable } from "./shared";
import { FixOrder, PasteOrders } from "./Intake";
import { CashSection, DeclinedSection, MoneyToday, RiderBoard, SettleSection } from "./CompanyLive";
import { handInToCheck, isActive, isAwaitingPayment, isDeclined, lineLabel, orderValue, productById, productLedger, riderLoad, totals, units as taskUnits, useWorkspace, value as taskValue, vendorById } from "./store";
import { AlertStack, LabelCloud, ProgressScene, themeOf, ThemePicker, Tip } from "./scenes";
import { AdaBar, AdaMark, ChecklistCard, Chips, HeroCard, Avatar, Bar, Btn, Card, CardHead, Empty, Field, inputCls, OptionList, LedgerBar, LiveDot, Modal, StatusPill, Stat, statusOf, Tag, Tile } from "./ui";
import { ago, clock, money, num, time12, todayISO } from "./utils";

const NAV = [
  ["today", "Today", BellRing],
  ["overview", "Overview", LayoutGrid],
  ["deliveries", "Deliveries", Truck],
  ["stock", "Vendors & stock", Boxes],
  ["riders", "Riders", Bike],
  ["messages", "Messages", MessageSquare],
  ["team", "Team", Users],
  ["calendar", "Calendar", CalendarDays],
  ["search", "Search", Search],
  ["announce", "Announcements", Megaphone],
  ["log", "Log book", NotebookPen],
  ["activity", "Activity log", History],
];

export default function Company({ go }) {
  const { state, act, sync } = useWorkspace();
  const [tab, setTab] = useState("today");
  const [ada, setAda] = useState(false);
  const [seed, setSeed] = useState("");
  const [menu, setMenu] = useState(false);
  // What the "+" button opened: a new delivery, pasted orders, a log book entry or an announcement.
  const [quick, setQuick] = useState("");
  const { user } = useAuth();
  const openAda = (say = "") => { setSeed(say); setAda(true); };
  const needs = needsYou(state);
  const unread = state.messages.filter((m) => (m.from === "rider" || m.from === "vendor") && !m.read).length;
  const t = totals(state);
  const Section = { today: NeedsYou, overview: Overview, deliveries: Deliveries, stock: Stock, riders: Riders, messages: Messages, team: Team, calendar: CalendarPage, search: SearchPage, announce: Announcements, log: LogBook, activity: ActivityLog }[tab];
  const titles = { today: needs.count ? `${needs.count} ${needs.count === 1 ? "thing needs" : "things need"} you` : "All clear", overview: "Overview", deliveries: "Deliveries", stock: "Vendors & stock", riders: "Riders", messages: "Messages", team: "Team & logins", calendar: "Calendar", search: "Search", announce: "Announcements", log: "Log book", activity: "Activity log" };
  const openIncidents = (state.log || []).filter((e) => e.status === "open").length;
  const tabs = NAV.map(([id, label, Icon]) => [id, label, Icon, id === "today" ? needs.count : id === "messages" ? unread : id === "log" ? openIncidents : 0]);
  const go2 = (id) => { setTab(id); window.scrollTo({ top: 0 }); };
  const pickQuick = (id) => (id === "team" ? go2("team") : setQuick(id));

  return (
    <div className="relative min-h-screen bg-white lg:flex">
      {/* Soft sky blue band that blends out to white above and below, the same on every company and vendor page. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[780px] sm:h-[700px] lg:h-[620px] bg-[linear-gradient(180deg,#ffffff_0%,#aad9fd_50%,#ffffff_100%)]" />
      <SideMenu
        open={menu}
        onClose={() => setMenu(false)}
        name={(user && user.name ? user.name : state.company.dispatcher || "there").split(" ")[0]}
        email={user ? user.email || user.phone : ""}
        active={tab}
        items={navItems(tabs, (id) => { setTab(id); window.scrollTo({ top: 0 }); }, () => go("/account"))}
      />
      <div className="relative min-w-0 flex-1">
      <header className="relative px-5 pb-8 pt-6 text-neutral-950 sm:px-10">
        <div className="relative mx-auto flex max-w-7xl items-center gap-3">
          {/* Home has the menu; every other page has a back arrow to home instead. */}
          {tab === "today"
            ? <button onClick={() => setMenu(true)} className="-ml-1.5 grid h-10 lg:hidden w-10 place-items-center text-neutral-950 hover:text-neutral-600" aria-label="Open menu" data-testid="open-menu"><Menu className="h-7 w-7" strokeWidth={2} /></button>
            : <button onClick={() => { setTab("today"); window.scrollTo({ top: 0 }); }} className="grid h-11 w-11 place-items-center rounded-full bg-white text-neutral-950 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5 hover:bg-neutral-50" aria-label="Back to home" data-testid="back-home"><ArrowLeft className="h-5 w-5" /></button>}
          <span className="hidden text-[14px] font-semibold text-neutral-600 sm:inline">· {state.company.name !== "Delivery" ? `${state.company.name}, ` : ""}{state.company.city}</span>
          <div className="ml-auto flex items-center gap-2">
            {sync === "offline" && <LiveDot label="Offline, will save when back" tone="warn" />}
            <QuickAdd onPick={pickQuick} />
            <MeButton onClick={() => go("/account")} />
          </div>
        </div>
        <div className="relative mx-auto mt-5 flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="text-[15px] font-medium text-neutral-500">{new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</div>
            <h1 className="mt-1 text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[52px]">{titles[tab]}{tab === "today" ? <span className="text-neutral-400">, {state.company.dispatcher}.</span> : ""}</h1>
          </div>
          <StatPill state={state} className="w-full lg:w-[540px] lg:shrink-0" />
        </div>
      </header>

      <main className="relative px-4 pb-36 pt-2 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <Section openAda={openAda} setTab={setTab} />
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex items-center justify-end px-5 sm:px-8">
        <button onClick={() => openAda()} className="pointer-events-auto grid h-[68px] w-[68px] place-items-center rounded-full bg-white/80 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-xl" aria-label="Ask ADA"><AdaMark size={44} /></button>
      </div>
      </div>

      <NewDelivery open={quick === "delivery"} onClose={() => setQuick("")} />
      <Modal open={quick === "paste"} onClose={() => setQuick("")} title="Paste orders" wide><PasteOrders /></Modal>
      <LogEntryModal kind={quick === "incident" || quick === "note" ? quick : null} onClose={() => setQuick("")} />
      <AnnounceModal open={quick === "announce"} onClose={() => setQuick("")} />
      <AdaPanel open={ada} onClose={() => setAda(false)} seed={seed} onSeedUsed={() => setSeed("")} />
    </div>
  );
}

// The menu, grouped like a CRM sidebar: home and overview on top, the day's work and the people/stock each in a section.
function navItems(tabs, pick, settings) {
  const t = Object.fromEntries(tabs.map(([id, label, icon, badge]) => [id, { id, label, icon, badge, onClick: () => pick(id) }]));
  return [
    { ...t.today, label: "Home" },
    t.overview,
    t.calendar,
    t.search,
    { id: "g-day", label: "Run the day", icon: Truck, children: [t.deliveries, t.riders, t.messages, t.announce] },
    { id: "g-people", label: "Stock & people", icon: Users, children: [t.stock, { ...t.team, label: "Team & logins" }] },
    { id: "g-records", label: "Records", icon: History, children: [t.log, t.activity] },
    { id: "settings", label: "Settings", icon: Settings, onClick: settings },
  ];
}

/* ---------- Needs you: the company's home. Only what someone has to act on, each with its action. ---------- */

const nowHM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

export function needsYou(state) {
  const ready = state.orders.filter((o) => o.status === "open").sort((a, b) => (Number(!!b.urgent) - Number(!!a.urgent)) || ((a.start || a.end || "99") < (b.start || b.end || "99") ? -1 : 1));
  const toFix = state.orders.filter((o) => o.status === "needs_fix");
  const failed = state.tasks.filter((t) => t.status === "failed" && !t.handled);
  const awaiting = state.tasks.filter(isAwaitingPayment);
  // Late: past the end of the promised window (or the time given), and not handed to the rider in the last half hour.
  const late = state.tasks.filter((t) => isActive(t) && t.date === todayISO() && (t.due || t.time) && (t.due || t.time) < nowHM()
    && Date.now() - new Date((t.history && t.history[0] && t.history[0].at) || 0).getTime() > 30 * 60000);
  const low = state.products
    .map((p) => ({ p, l: productLedger(state, p) }))
    .filter(({ l }) => l.inWarehouse <= 5 || l.pendingOrders > l.inWarehouse);
  const incoming = state.intake.filter((i) => i.status === "sent");
  const declined = state.tasks.filter(isDeclined);
  const handIns = state.tasks.filter(handInToCheck);
  return { ready, toFix, failed, awaiting, late, low, incoming, declined, handIns, count: (ready.length ? 1 : 0) + toFix.length + failed.length + awaiting.length + late.length + (incoming.length ? 1 : 0) + declined.length + (handIns.length ? 1 : 0) };
}

function Section({ id, icon: Icon, tone, title, sub, right, children }) {
  const tones = { rose: "bg-rose-50 text-rose-600", amber: "bg-amber-50 text-amber-600", orange: "bg-blue-50 text-blue-600", sky: "bg-sky-50 text-sky-600", stone: "bg-neutral-100 text-neutral-600" };
  return (
    <Card id={id}>
      <div className="flex items-start gap-3 px-5 pt-5">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tones[tone]}`}><Icon className="h-[18px] w-[18px]" /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-bold tracking-tight text-neutral-950">{title}</div>
          {sub && <div className="text-[12.5px] text-neutral-500">{sub}</div>}
        </div>
        {right}
      </div>
      <div className="mt-2 pb-1">{children}</div>
    </Card>
  );
}

const Row = ({ children }) => <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-neutral-100 px-5 py-3 first:border-t-0">{children}</div>;

// First days: what a new company still has to do before riders and vendors can use their own dashboards.
function GetReady({ state, setTab, onReceive }) {
  const steps = [
    ["Add your riders", "Name, phone, area and how many units a day.", state.riders.length > 0, () => setTab("team")],
    ["Add your vendors", "The businesses that hand you stock.", state.vendors.length > 0, () => setTab("team")],
    ["Receive their stock", "Each product with its unit price.", state.products.length > 0, onReceive],
    ["Send your first delivery", "Or paste the day's orders and let ADA plan it.", state.tasks.length > 0, () => setTab("deliveries")],
  ];
  if (steps.every((x) => x[2])) return null;
  const done = steps.filter((x) => x[2]).length;
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">Get {state.company.name || "your company"} ready</h2>
        <span className="text-[13px] font-semibold text-neutral-500">{done} of {steps.length} done</span>
      </div>
      <p className="mt-1 text-[14px] text-neutral-500">Each rider and vendor gets an invite code from the Team page, and signs in to their own dashboard.</p>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {steps.map(([title, sub, ok, onClick], i) => (
          <button key={title} onClick={onClick} disabled={ok} className={`flex items-start gap-3 rounded-[22px] p-4 text-left ${ok ? "bg-emerald-50" : "bg-neutral-100/80 hover:bg-neutral-100"}`}>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold ${ok ? "bg-emerald-500 text-white" : "bg-black text-white"}`}>{ok ? "✓" : i + 1}</span>
            <span><span className="block text-[15px] font-bold text-neutral-950">{title}</span><span className="block text-[13px] text-neutral-500">{sub}</span></span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function NeedsYou({ openAda, setTab }) {
  const { state, act } = useWorkspace();
  const n = needsYou(state);
  const [fixing, setFixing] = useState(null);
  const [pasting, setPasting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [resend, setResend] = useState({});
  const t = totals(state);
  const today = state.tasks.filter((x) => x.date === todayISO());
  const rider = (id) => state.riders.find((r) => r.id === id) || {};
  const items = (list) => list.map((l) => lineLabel(state, l)).join(", ");
  const [allLate, setAllLate] = useState(false);
  const readyUnits = n.ready.reduce((s, o) => s + o.items.reduce((a, l) => a + l.qty + (l.free || 0), 0), 0);

  const sendAgain = (task) => {
    const riderId = resend[task.id] || task.riderId;
    act({ type: "deliveries/create", by: "dispatcher", deliveries: [{
      riderId, vendorId: task.vendorId, customer: task.customer, phone: task.phone, altPhone: task.altPhone || "", address: task.address, landmark: task.landmark || "", zone: task.zone, time: "",
      amount: task.amount != null ? task.amount : null, note: `Second try. Last time: ${task.failReason || "not delivered"}.`, items: task.items.map((l) => ({ productId: l.productId, qty: l.qty, free: l.free || 0 })),
    }] });
    act({ type: "messages/send", messages: [{ riderId, from: "dispatcher", text: `Second try for ${task.customer}, ${task.address}: ${items(task.items)}. Collect ${money(taskValue(task))}. Call first: last time it was "${task.failReason}".` }] });
    act({ type: "task/handled", id: task.id, how: "resent" });
  };

  const nothing = !n.count && !n.low.length;

  return (
    <div className="space-y-5">
      <GetReady state={state} setTab={setTab} onReceive={() => setReceiving(true)} />
      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <h2 className="text-[40px] font-extrabold leading-[1.02] tracking-[-0.04em] text-neutral-950 sm:text-[48px]">What do you<br />want to do?</h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">Tap a card, or just tell ADA. Today: {today.filter((x) => x.status === "delivered").length} of {today.length} drops delivered. <button onClick={() => setTab("overview")} className="font-semibold text-blue-600">Full overview</button></p>
          <AdaBar className="mt-6" placeholder="Let ADA help you.." onSubmit={(text) => openAda(text)} />
          <Tip className="mt-5">Paste a vendor's whole WhatsApp chat at once. ADA reads every order and holds back any with something missing.</Tip>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Tile icon={ClipboardPaste} title={<>Paste WhatsApp<br />orders</>} onClick={() => setPasting(true)} />
          <Tile icon={Sparkles} title={<>Plan today<br />with ADA</>} badge={n.ready.length} onClick={() => openAda("Dispatch today's orders")} />
          <Tile icon={Truck} title={<>Send a<br />delivery</>} onClick={() => setAdding(true)} />
          <Tile icon={Package} title={<>Receive<br />stock</>} onClick={() => setReceiving(true)} />
          <Tile icon={Wallet} title={<>Verify<br />payments</>} badge={n.awaiting.length} onClick={() => document.getElementById("verify")?.scrollIntoView({ behavior: "smooth", block: "center" })} />
          <Tile icon={MessageSquare} title={<>Message<br />riders</>} onClick={() => setTab("messages")} />
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <RiderBoard onOpen={() => setTab("riders")} />
        <MoneyToday onVerify={() => document.getElementById("cash")?.scrollIntoView({ behavior: "smooth", block: "center" })} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] [&>*]:min-w-0">
        <div className="space-y-5">
          <DeclinedSection Section={Section} Row={Row} />
          <Section icon={Truck} tone="sky" title={`Ready for a rider (${n.ready.length})`} sub={n.ready.length ? `${readyUnits} units · ${money(n.ready.reduce((s, o) => s + orderValue(state, o), 0))} to collect. ADA splits them by area and each rider's daily units.` : "Every order has a rider."}
            right={<Btn onClick={() => openAda("Dispatch today's orders")} disabled={!n.ready.length}><Sparkles className="h-4 w-4 text-blue-300" /> Plan with ADA</Btn>}>
            {n.ready.map((o) => (
              <Row key={o.id}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900">
                    {o.urgent && <span className="flex items-center gap-0.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10.5px] font-bold text-white"><Flame className="h-3 w-3" />URGENT</span>}
                    <span className="truncate">{o.customer}</span><span className="font-normal text-neutral-400">· {o.zone || "No area"}</span>
                  </div>
                  <div className="truncate text-[12.5px] text-neutral-500">{items(o.items)} · {(vendorById(state, o.vendorId) || {}).name}</div>
                </div>
                <div className="text-[12.5px] text-neutral-500">{o.start ? `${time12(o.start)}${o.end ? `–${time12(o.end)}` : ""}` : o.end ? `by ${time12(o.end)}` : "Today"}</div>
                <div className="w-24 text-right font-mono text-[12.5px]">{money(orderValue(state, o))}</div>
              </Row>
            ))}
          </Section>
        </div>

        <div className="space-y-5">
          {!!n.incoming.length && (
            <Section icon={Package} tone="amber" title={`Stock sent by vendors (${n.incoming.length})`} sub="Count it in when it arrives, so you and the vendor balance the same numbers." right={<Btn size="sm" onClick={() => setTab("stock")}>Count in</Btn>}>
              {n.incoming.slice(0, 5).map((i) => (
                <Row key={i.id}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-neutral-900">{num(i.qty)} × {(productById(state, i.productId) || {}).name} <span className="font-normal text-neutral-400">· {(vendorById(state, i.vendorId) || {}).name}</span></div>
                    <div className="truncate text-[12.5px] text-neutral-500">{i.by && i.by.name ? `Sent by ${i.by.name} · ` : ""}{ago(i.at)}</div>
                  </div>
                </Row>
              ))}
            </Section>
          )}
          {!!n.toFix.length && (
            <Section icon={AlertTriangle} tone="rose" title={`Orders to fix (${n.toFix.length})`} sub="No rider goes out until these are right.">
              {n.toFix.map((o) => (
                <Row key={o.id}>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-neutral-900">{o.customer || "No name"} <span className="font-normal text-neutral-400">· {(vendorById(state, o.vendorId) || {}).name || "No vendor"}</span></div>
                    <div className="text-[12.5px] text-rose-700">{(o.issues || []).join(" ") || "Needs checking."}</div>
                  </div>
                  <Btn size="sm" variant="ghost" onClick={() => setFixing(o)}>Fix</Btn>
                </Row>
              ))}
            </Section>
          )}

          {!!n.failed.length && (
            <Section icon={RotateCcw} tone="rose" title={`Couldn't deliver (${n.failed.length})`} sub="Send it again, or put it back in stock.">
              {n.failed.map((task) => (
                <Row key={task.id}>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-neutral-900">{task.customer} <span className="font-normal text-neutral-400">· {rider(task.riderId).short}</span></div>
                    <div className="text-[12.5px] text-neutral-500">{task.failReason} · {items(task.items)}</div>
                  </div>
                  <select value={resend[task.id] || task.riderId} onChange={(e) => setResend({ ...resend, [task.id]: e.target.value })} className="h-8 rounded-full border border-neutral-200 bg-white px-2 text-[12.5px]">
                    {state.riders.map((r) => <option key={r.id} value={r.id}>{r.short}{r.online ? "" : " (off)"}</option>)}
                  </select>
                  <Btn size="sm" onClick={() => sendAgain(task)}>Send again</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => act({ type: "task/handled", id: task.id, how: "returned" })}>Back to stock</Btn>
                </Row>
              ))}
            </Section>
          )}

          {!!n.awaiting.length && (
            <Section id="verify" icon={Wallet} tone="amber" title={`Payment to verify (${n.awaiting.length})`} sub={`${money(t.awaitingValue)} riders collected that isn't checked against the company account yet.`}
              right={<Btn size="sm" variant="green" onClick={() => act({ type: "task/confirmPayments", ids: n.awaiting.map((x) => x.id) })}>Verify all</Btn>}>
              {n.awaiting.map((task) => (
                <Row key={task.id}>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-neutral-900">{task.customer} <span className="font-normal text-neutral-400">· {rider(task.riderId).short} · {(task.payment && task.payment.method) || "cash"}</span></div>
                    <div className="text-[12.5px] text-neutral-500">{task.ref} · delivered {task.proof ? ago(task.proof.at) : ""}{task.proof && task.proof.note ? ` · "${task.proof.note}"` : ""}</div>
                  </div>
                  <span className="font-mono text-[13px] font-semibold">{money((task.payment && task.payment.amount) || taskValue(task))}</span>
                  <Btn size="sm" variant="ghost" onClick={() => act({ type: "task/confirmPayment", id: task.id })}>Verify</Btn>
                </Row>
              ))}
            </Section>
          )}

          <CashSection Section={Section} Row={Row} />
          <SettleSection Section={Section} Row={Row} />

          {!!n.late.length && (
            <Section icon={Clock} tone="orange" title={`Running late (${n.late.length})`} sub="Past the time the customer was promised.">
              {(allLate ? n.late : n.late.slice(0, 4)).map((task) => (
                <Row key={task.id}>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-neutral-900">{task.customer} <span className="font-normal text-neutral-400">· {rider(task.riderId).short}</span></div>
                    <div className="text-[12.5px] text-neutral-500">Due {time12(task.due || task.time)} · {task.status === "assigned" ? "not picked up yet" : "on the way"}</div>
                  </div>
                  <a href={`tel:${(rider(task.riderId).phone || "").replace(/\s/g, "")}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-[12.5px] font-semibold text-neutral-800"><Phone className="h-3.5 w-3.5" /> Call {rider(task.riderId).short}</a>
                </Row>
              ))}
              {n.late.length > 4 && !allLate && <button onClick={() => setAllLate(true)} className="w-full border-t border-neutral-100 py-2.5 text-[12.5px] font-semibold text-neutral-500">Show {n.late.length - 4} more</button>}
            </Section>
          )}

          {!!n.low.length && (
            <Section icon={Package} tone="stone" title="Running low" sub="Ask the vendor for more before orders get stuck.">
              {n.low.map(({ p, l }) => (
                <Row key={p.id}>
                  <div className="min-w-0 flex-1 text-[13.5px]"><span className="font-semibold text-neutral-900">{p.name}</span> <span className="text-neutral-400">· {(vendorById(state, p.vendorId) || {}).name}</span></div>
                  <span className="text-[12.5px] text-neutral-500"><b className="text-neutral-900">{l.inWarehouse}</b> in warehouse{l.pendingOrders ? ` · ${l.pendingOrders} ordered` : ""}</span>
                </Row>
              ))}
            </Section>
          )}

          {nothing && <Card><Empty icon={PackageCheck} title="Nothing needs you right now" sub="New orders, failed drops and payments to check will show up here." /></Card>}
        </div>
      </div>

      <Modal open={pasting} onClose={() => setPasting(false)} title="Paste orders" wide>
        <PasteOrders />
      </Modal>
      <NewDelivery open={adding} onClose={() => setAdding(false)} />
      <ReceiveStock open={receiving} onClose={() => setReceiving(false)} act={act} state={state} />
      <Modal open={!!fixing} onClose={() => setFixing(null)} title={fixing ? `Fix ${fixing.id}` : ""} wide>
        {fixing && <FixOrder order={fixing} onDone={() => setFixing(null)} />}
      </Modal>
    </div>
  );
}

/* ---------- Overview ---------- */

// The short alert lines for the "Stay ahead" card.
function alertLines(state) {
  const n = needsYou(state);
  const rider = (id) => (state.riders.find((r) => r.id === id) || {}).short || "A rider";
  return [
    ...n.late.map((t) => `${rider(t.riderId)} is past the window for ${t.customer}`),
    ...n.toFix.map((o) => `${o.id}: ${(o.issues && o.issues[0]) || "needs a fix"}`),
    ...n.failed.map((t) => `${t.customer} wasn't delivered: ${t.failReason || "no reason"}`),
  ];
}

// How many of today's drops were still not delivered at each hour so far, for the progress line.
function dropsLeftByHour(today) {
  const doneAt = today.filter((t) => t.status === "delivered").map((t) => new Date((t.proof && t.proof.at) || Date.now()).getTime());
  const first = today.reduce((m, t) => Math.min(m, new Date((t.history && t.history[0] && t.history[0].at) || Date.now()).getTime()), Date.now());
  const n = 6;
  const span = Math.max(Date.now() - first, 1);
  return Array.from({ length: n }, (_, i) => {
    const at = first + (span * i) / (n - 1);
    return today.length - doneAt.filter((d) => d <= at).length;
  });
}

function Overview({ openAda, setTab }) {
  const { state, act } = useWorkspace();
  const t = totals(state);
  const today = state.tasks.filter((x) => x.date === todayISO());
  const online = state.riders.filter((r) => r.online).length;
  const awaiting = state.tasks.filter(isAwaitingPayment);
  const [say, setSay] = useState("");
  const theme = themeOf(state.company.theme);

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

      <div className="grid gap-5 lg:grid-cols-2">
        <HeroCard onArrow={() => setTab("deliveries")} className="min-h-[260px]">
          Hey {state.company.dispatcher}!<br />
          <span className="text-white/45">You've sold</span> {money(t.deliveredValue)}<br />
          <span className="text-white/45">and</span> {num(t.withRiders)} units <span className="text-white/45">are out</span>
        </HeroCard>
        <ChecklistCard title="Today's run" items={[
          ["Orders in", !state.orders.some((o) => o.status === "needs_fix"), `${state.orders.filter((o) => o.status === "open").length} ready, ${state.orders.filter((o) => o.status === "needs_fix").length} to fix`],
          ["Riders dispatched", !state.orders.some((o) => o.status === "open"), `${online} riders on duty`],
          ["Drops delivered", today.length > 0 && today.every((x) => !isActive(x)), `${today.filter((x) => x.status === "delivered").length} of ${today.length}`],
          ["Money verified", !awaiting.length, awaiting.length ? `${money(t.awaitingValue)} to check` : "All paid in"],
        ]} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <LabelCloud variant={theme.scene === "sunset" ? "night" : theme.scene} labels={[
            ["Ready", state.orders.filter((o) => o.status === "open").length],
            ["With riders", today.filter(isActive).length],
            ["Delivered", today.filter((x) => x.status === "delivered").length],
            ["To verify", awaiting.length],
            ["To fix", state.orders.filter((o) => o.status === "needs_fix").length],
            ["Not delivered", today.filter((x) => x.status === "failed").length],
          ]} onPick={() => setTab("deliveries")} />
          <div className="mt-4 px-1 text-[22px] font-extrabold tracking-[-0.03em] text-neutral-950">See what's due</div>
          <div className="px-1 text-[14px] text-neutral-400">Every order and drop, by where it is now.</div>
        </div>
        <div>
          <AlertStack items={alertLines(state)} action="Sort it out" onAction={() => setTab("today")} />
          <div className="mt-4 px-1 text-[22px] font-extrabold tracking-[-0.03em] text-neutral-950">Stay ahead</div>
          <div className="px-1 text-[14px] text-neutral-400">Late drops, bad addresses and failed tries.</div>
        </div>
        <div>
          <ProgressScene label={`${today.filter((x) => x.status === "delivered").length} of ${today.length} drops delivered today`} points={dropsLeftByHour(today)} />
          <div className="mt-4 px-1 text-[22px] font-extrabold tracking-[-0.03em] text-neutral-950">See your progress</div>
          <div className="px-1 text-[14px] text-neutral-400">Drops left today, hour by hour.</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHead title="Vendors" sub="What each vendor gave you, delivered and left. Updates the moment a rider confirms a delivery." right={<button onClick={() => setTab("stock")} className="text-[13px] font-semibold text-blue-600">Stock <ArrowRight className="inline h-3.5 w-3.5" /></button>} />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[13px]">
              <thead><tr className="border-b border-neutral-100 text-neutral-400"><th className="px-5 py-2 font-medium">Vendor</th><th className="px-3 py-2 text-right font-medium">Given</th><th className="px-3 py-2 text-right font-medium">Delivered</th><th className="px-3 py-2 text-right font-medium">Left</th><th className="px-3 py-2 text-right font-medium">Sales</th><th className="w-36 px-5 py-2 font-medium" /></tr></thead>
              <tbody>
                {state.vendors.map((v) => {
                  const s = totals(state, v.id);
                  return (
                    <tr key={v.id} className="border-b border-neutral-50 last:border-0">
                      <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Avatar name={v.name} color={v.color} size={30} className="rounded-lg" /><div><div className="font-semibold text-neutral-900">{v.name}</div><div className="text-[12px] text-neutral-400">{v.contact}</div></div></div></td>
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
          <CardHead title="Riders today" sub="Units given against each rider's daily allocation" right={<button onClick={() => setTab("riders")} className="text-[13px] font-semibold text-blue-600">All riders <ArrowRight className="inline h-3.5 w-3.5" /></button>} />
          <div className="mt-3 divide-y divide-neutral-100">
            {state.riders.map((r) => {
              const l = riderLoad(state, r.id);
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={r.name} color={r.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="whitespace-nowrap text-[14px] font-semibold text-neutral-900">{r.name}</span><span className={`h-1.5 w-1.5 rounded-full ${r.online ? "bg-emerald-500" : "bg-neutral-300"}`} /><span className="text-[12px] text-neutral-400">{r.zone}</span></div>
                    <div className="mt-1.5 flex items-center gap-3"><Bar value={l.units} max={r.dailyUnits} tone={l.units > r.dailyUnits ? "red" : "orange"} className="max-w-[180px]" /><span className="text-[12px] tabular-nums text-neutral-500">{l.units}/{r.dailyUnits} units</span></div>
                  </div>
                  <div className="text-right text-[12.5px]"><div className="font-semibold text-neutral-800">{l.done}/{l.tasks.length} done</div><div className="font-mono text-neutral-500">{money(l.collected)}</div></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHead title="Today's deliveries" sub={`${today.filter((x) => x.status === "delivered").length} of ${today.length} delivered`} right={<button onClick={() => setTab("deliveries")} className="text-[13px] font-semibold text-blue-600">All <ArrowRight className="inline h-3.5 w-3.5" /></button>} />
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
  const [sort, setSort] = useState("recent");
  const [sorting, setSorting] = useState(false);
  const sorts = [
    ["recent", "Recently added", Clock],
    ["amount", "Amount", Wallet],
    ["window", "Delivery time", Truck],
    ["customer", "Customer", ArrowDownUp],
  ];
  const by = {
    recent: () => 0,
    amount: (a, b) => taskValue(b) - taskValue(a),
    window: (a, b) => ((a.due || a.time || "99") < (b.due || b.time || "99") ? -1 : 1),
    customer: (a, b) => (a.customer || "").localeCompare(b.customer || ""),
  }[sort];
  const list = state.tasks.filter(filters.find((f) => f[0] === filter)[2]).slice().sort(by);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chips options={filters.map(([id, label, fn]) => [id, label, state.tasks.filter(fn).length])} value={filter} onChange={setFilter} />
        <div className="ml-auto flex gap-2">
          <Btn variant="ghost" onClick={() => setSorting(true)}><ArrowDownUp className="h-4 w-4" /> Sort & filter</Btn>
          <Btn variant="ghost" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> New delivery</Btn>
          <Btn onClick={() => openAda("Dispatch today's orders")}><Sparkles className="h-4 w-4 text-blue-300" /> Dispatch with ADA</Btn>
        </div>
      </div>
      <Card>
        {list.length ? list.map((t) => (
          <DeliveryCard key={t.id} state={state} task={t} actions={
            <div className="flex flex-wrap items-center gap-2">
              <PaymentActions task={t} act={act} />
              {isActive(t) && (
                <label className="flex items-center gap-2 text-[12.5px] text-neutral-500">Rider
                  <select value={t.riderId} onChange={(e) => act({ type: "task/reassign", id: t.id, riderId: e.target.value })} className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-[12.5px] text-neutral-800">
                    {state.riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </label>
              )}
            </div>
          } />
        )) : <Empty icon={Truck} title="No deliveries here" sub="Ask ADA to dispatch today's orders, or add one yourself." />}
      </Card>
      <NewDelivery open={adding} onClose={() => setAdding(false)} />
      <Modal open={sorting} onClose={() => setSorting(false)} title="Sort & Filter">
        <div className="flex items-center justify-between"><Tag>Sort by</Tag><button onClick={() => { setSort("recent"); setFilter("all"); }} className="rounded-full bg-neutral-100 px-3 py-1 text-[13px] text-neutral-500">Reset</button></div>
        <OptionList className="mt-3" options={sorts} value={sort} onChange={setSort} />
        <Tag className="mt-6 block">Type</Tag>
        <Chips className="mt-3" options={filters.map(([id, label, fn]) => [id, label, state.tasks.filter(fn).length])} value={filter} onChange={setFilter} />
        <Btn size="lg" className="mt-6 w-full" onClick={() => setSorting(false)}>Show {list.length} deliveries</Btn>
      </Modal>
    </div>
  );
}

function NewDelivery({ open, onClose }) {
  const { state, act } = useWorkspace();
  const blank = { customer: "", phone: "", address: "", time: "", riderId: (state.riders[0] || {}).id || "", productId: (state.products[0] || {}).id || "", qty: 1 };
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
  if (open && (!state.riders.length || !state.products.length)) {
    return <Modal open onClose={onClose} title="New delivery"><Empty icon={Truck} title={!state.riders.length ? "Add a rider first" : "Receive some stock first"} sub={!state.riders.length ? "Riders are added under Team." : "Products come in under Stock, from a vendor."} /></Modal>;
  }
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
        <div className="text-[12px] text-neutral-500">{free} in the warehouse · collect {money((product ? product.price : 0) * f.qty)}</div>
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
          <Btn onClick={() => openAda()}><Sparkles className="h-4 w-4 text-blue-300" /> Tell ADA instead</Btn>
        </div>
      </div>
      {state.vendors.map((v) => {
        const s = totals(state, v.id);
        return (
          <Card key={v.id}>
            <CardHead
              title={<span className="flex items-center gap-2.5"><Avatar name={v.name} color={v.color} size={28} className="rounded-lg" />{v.name}</span>}
              sub={`${v.contact} · ${v.phone}`}
              right={<div className="text-right text-[12.5px] text-neutral-500"><div><b className="text-neutral-900">{num(s.left)}</b> of {num(s.received)} left</div><div className="font-mono">{money(s.deliveredValue)} sold</div></div>}
            />
            <div className="mt-3"><ProductTable state={state} vendorId={v.id} /></div>
          </Card>
        );
      })}
      <IncomingStock state={state} act={act} />
      <Card>
        <CardHead title="Stock received" sub="Every drop-off from a vendor" />
        <div className="mt-2 divide-y divide-neutral-100">
          {state.intake.filter((i) => !i.status || i.status === "received").slice(0, 12).map((i) => {
            const p = productById(state, i.productId);
            return (
              <div key={i.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                <span className="w-20 font-mono text-[12px] text-neutral-400">{ago(i.at)}</span>
                <span className="flex-1 text-neutral-800">{num(i.qty)} × {p && p.name} <span className="text-neutral-400">· {(vendorById(state, i.vendorId) || {}).name}{i.by && i.by.role === "vendor" ? `, sent by ${i.by.name}` : ""}{i.countedBy ? `, counted by ${i.countedBy.split(" ")[0]}` : ""}</span></span>
                <span className="font-mono text-[12px] text-neutral-500">{money(i.price)} each</span>
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

// Stock a vendor's team says they've sent. It joins the vendor's stock only when someone here counts it in, so the
// office and the vendor always balance the same numbers. If fewer arrived, enter what was actually counted.
function IncomingStock({ state, act }) {
  const [counting, setCounting] = useState(null);
  const [qty, setQty] = useState(0);
  const sent = state.intake.filter((i) => i.status === "sent");
  if (!sent.length) return null;
  return (
    <Card>
      <CardHead title={`Sent by vendors, to count in (${sent.length})`} sub="Count each one when it arrives. Only then does it join the vendor's stock." />
      <div className="mt-2">
        {sent.map((i) => {
          const p = productById(state, i.productId);
          const v = vendorById(state, i.vendorId);
          return (
            <div key={i.id} className="flex flex-wrap items-center gap-3 border-t border-neutral-100 px-5 py-3 first:border-t-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600"><Package className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold text-neutral-900">{num(i.qty)} × {p ? p.name : "Product"} <span className="font-normal text-neutral-500">from {v ? v.name : "a vendor"}</span></div>
                <div className="truncate text-[12.5px] text-neutral-500">{i.by && i.by.name ? `Sent by ${i.by.name} · ` : ""}{ago(i.at)}{i.note ? ` · ${i.note}` : ""}</div>
              </div>
              <Btn size="sm" onClick={() => { setCounting(i); setQty(i.qty); }} data-testid="count-in">Count in</Btn>
            </div>
          );
        })}
      </div>
      <Modal open={!!counting} onClose={() => setCounting(null)} title="Count it in">
        {counting && (
          <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); act({ type: "stock/count", id: counting.id, qty: Number(qty) }); setCounting(null); }}>
            <p className="text-[14px] text-neutral-600">{(vendorById(state, counting.vendorId) || {}).name} sent <b>{num(counting.qty)}</b> × {(productById(state, counting.productId) || {}).name}. How many arrived?</p>
            <Field label="Units counted"><input type="number" min="0" required value={qty} onChange={(e) => setQty(e.target.value)} className={inputCls} /></Field>
            {Number(qty) !== counting.qty && <p className="text-[12.5px] text-amber-700">That's different from what was sent. The vendor will see both numbers.</p>}
            <Btn type="submit" size="lg">Add {num(Number(qty) || 0)} to stock</Btn>
          </form>
        )}
      </Modal>
    </Card>
  );
}

function ReceiveStock({ open, onClose, act, state }) {
  const [f, setF] = useState({ vendorId: (state.vendors[0] || {}).id || "", productId: "", name: "", unit: "unit", qty: 10, price: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const products = state.products.filter((p) => p.vendorId === f.vendorId);
  const existing = products.find((p) => p.id === f.productId);
  if (open && !state.vendors.length) return <Modal open onClose={onClose} title="Receive stock from a vendor"><Empty icon={Building2} title="Add a vendor first" sub="Vendors are added under Team or Stock." /></Modal>;
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
    <div className="space-y-5">
    <RiderBoard onOpen={() => {}} />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {state.riders.map((r) => {
        const l = riderLoad(state, r.id);
        return (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between">
              <Avatar name={r.name} color={r.color} size={48} />
              <button onClick={() => act({ type: "rider/online", id: r.id, online: !r.online })} className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${r.online ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>{r.online ? "On duty" : "Off duty"}</button>
            </div>
            <div className="mt-3 text-[16px] font-bold text-neutral-900">{r.name}</div>
            <div className="text-[12.5px] text-neutral-500">{r.zone} · {r.vehicle}</div>
            <div className="mt-4 flex items-baseline justify-between"><Tag>Today's allocation</Tag><span className="text-[13px] font-semibold tabular-nums">{l.units}/{r.dailyUnits}</span></div>
            <Bar value={l.units} max={r.dailyUnits} tone={l.units > r.dailyUnits ? "red" : "orange"} className="mt-2" />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-neutral-50 py-2"><div className="text-[17px] font-bold">{l.tasks.length}</div><div className="text-[11px] text-neutral-500">Drops</div></div>
              <div className="rounded-xl bg-neutral-50 py-2"><div className="text-[17px] font-bold text-emerald-600">{l.done}</div><div className="text-[11px] text-neutral-500">Done</div></div>
              <div className="rounded-xl bg-neutral-50 py-2"><div className="text-[17px] font-bold text-blue-600">{l.open}</div><div className="text-[11px] text-neutral-500">Out</div></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[12.5px]"><span className="text-neutral-500">Collected today</span><span className="font-mono font-semibold">{money(l.collected)}</span></div>
            <div className="mt-3 space-y-1.5">
              {l.tasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 text-[12.5px]"><span className="truncate text-neutral-700">{t.customer}</span><StatusPill status={statusOf(t)} /></div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
    </div>
  );
}

/* ---------- Messages: one conversation per rider and per vendor ---------- */

function Messages() {
  const { state, act } = useWorkspace();
  const threads = [
    ...state.riders.map((r) => ({ key: `r:${r.id}`, riderId: r.id, name: r.name, color: r.color, sub: r.phone, kind: "Rider", first: r.short || r.name })),
    ...state.vendors.map((v) => ({ key: `v:${v.id}`, vendorId: v.id, name: v.name, color: v.color, sub: v.contact || v.phone, kind: "Vendor", first: v.name })),
  ];
  const [key, setKey] = useState(threads[0] ? threads[0].key : "");
  const [text, setText] = useState("");
  const th = threads.find((t) => t.key === key) || threads[0];
  const inThread = (m, t) => (t.vendorId ? m.vendorId === t.vendorId : m.riderId === t.riderId && !m.vendorId);
  const thread = useMemo(() => (th ? state.messages.filter((m) => inThread(m, th)) : []), [state.messages, th]); // eslint-disable-line react-hooks/exhaustive-deps
  const unreadIn = (t) => state.messages.filter((m) => inThread(m, t) && (m.from === "rider" || m.from === "vendor") && !m.read).length;
  const openUnread = th ? unreadIn(th) : 0;
  React.useEffect(() => {
    if (th && openUnread) act({ type: "messages/read", by: "company", riderId: th.riderId, vendorId: th.vendorId });
  }, [th, openUnread, act]);
  if (!th) return <Card><Empty icon={MessageSquare} title="No one to message yet" sub="Add riders and vendors under Team." /></Card>;
  const theirs = (m) => m.from === "rider" || m.from === "vendor";
  return (
    <Card className="grid min-h-[560px] overflow-hidden md:grid-cols-[280px_1fr]">
      <div className="max-h-[260px] overflow-y-auto border-b border-neutral-100 md:max-h-none md:border-b-0 md:border-r">
        {threads.map((t) => {
          const last = [...state.messages].reverse().find((m) => inThread(m, t));
          const n = unreadIn(t);
          return (
            <button key={t.key} onClick={() => setKey(t.key)} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${t.key === th.key ? "bg-neutral-50" : "hover:bg-neutral-50/60"}`}>
              <Avatar name={t.name} color={t.color} />
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[14px] font-semibold text-neutral-900"><span className="truncate">{t.name}</span><span className="rounded-full bg-neutral-100 px-1.5 text-[10px] font-semibold uppercase text-neutral-500">{t.kind}</span></div><div className="truncate text-[12px] text-neutral-500">{last ? last.text : "No messages yet"}</div></div>
              {!!n && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10.5px] font-bold text-white">{n}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-3"><Avatar name={th.name} color={th.color} size={32} /><div><div className="text-[14px] font-semibold">{th.name}</div><div className="text-[12px] text-neutral-500">{th.kind}{th.sub ? ` · ${th.sub}` : ""}</div></div></div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {thread.map((m) => (
            <div key={m.id} className={`max-w-[80%] ${theirs(m) ? "" : "ml-auto"}`}>
              <div className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug ${theirs(m) ? "rounded-bl-md bg-neutral-100 text-neutral-800" : "rounded-br-md bg-neutral-900 text-white"}`}>{m.text}</div>
              <div className={`mt-1 text-[11px] text-neutral-400 ${theirs(m) ? "" : "text-right"}`}>{m.from === "ada" ? "ADA · " : m.from === "dispatcher" ? "You · " : ""}{clock(m.at)}{!theirs(m) && m.read ? " · Read" : ""}</div>
            </div>
          ))}
          {!thread.length && <Empty icon={MessageSquare} title="No messages yet" />}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { act({ type: "messages/send", messages: [{ riderId: th.riderId, vendorId: th.vendorId, from: "dispatcher", text: text.trim() }] }); setText(""); } }} className="flex gap-2 border-t border-neutral-100 p-3">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${th.first}…`} className={`${inputCls} h-11 rounded-full px-4`} />
          <Btn size="lg" className="h-11" type="submit" aria-label="Send"><Send className="h-4 w-4" /></Btn>
        </form>
      </div>
    </Card>
  );
}

export { taskUnits };

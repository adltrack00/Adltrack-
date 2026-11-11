// The public front page: what Delivery does, who it's for, and the way in (get started, sign in, or try the demo).
import React, { useState } from "react";
import { ArrowRight, Bike, Building2, Camera, Check, ChevronDown, Clock, LayoutGrid, Menu, MessageSquare, Package, ShieldCheck, Smartphone, Sparkles, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { homeFor, useAuth } from "./auth";
import { freshState } from "./seed";
import { AdaBar, AdaMark, HeroCard, LiveDot, Steps } from "./ui";
import { cn } from "../lib/utils";

// Faint binary digits behind the welcome screen.
const DIGITS = Array.from({ length: 26 }, (_, r) => Array.from({ length: 30 }, (_, c) => ((r * 7 + c * 13 + r * c) % 5 < 2 ? "1" : "0")).join("  "));

function Float({ className, size = 84 }) {
  return (
    <span className={`absolute hidden place-items-center rounded-[28%] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-[0_18px_30px_-10px_rgba(120,70,0,0.55),inset_0_2px_6px_rgba(255,255,255,0.7)] sm:grid ${className}`} style={{ width: size, height: size }}>
      <Package className="text-amber-900/70" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.6} />
    </span>
  );
}

const ROLES = [
  {
    id: "company", icon: LayoutGrid, title: "For delivery companies", tone: "from-[#141a5c] to-[#05061a]",
    points: ["Every vendor, rider and drop on one live screen", "Tell ADA what came in; it plans the day and messages riders", "Payments to verify, failed drops and stock left, at a glance"],
  },
  {
    id: "vendor", icon: Building2, title: "For vendors", tone: "from-[#1d2fc0] to-[#5a74ff]",
    points: ["Send orders straight from WhatsApp text", "Watch each delivery happen, with the doorstep photo", "Units given, delivered and left, always up to date"],
  },
  {
    id: "rider", icon: Bike, title: "For riders", tone: "from-[#0f1450] to-[#2a3fe0]",
    points: ["Today's drops, one at a time, in riding order", "Photo, amount collected and done in three taps", "Messages from the office in the same app"],
  },
];

const FAQ = [
  ["Who signs up first?", "The delivery company. It adds its vendors and riders, then sends each one an invite code from the app. They join with that code and get their own login and dashboard."],
  ["Does it work on phones?", "Yes. Open the site on any phone and add it to the home screen: it opens full screen like an app, takes the doorstep photo with the camera, and keeps working on a weak signal."],
  ["How does a delivery get confirmed?", "The rider takes a photo at the door and enters the amount collected and how it was paid. The time is stamped automatically. The company and the vendor see it the same second."],
  ["Can vendors see other vendors' sales?", "No. Each vendor sees only their own products, orders and deliveries. Riders see only their own drops."],
  ["What is ADA?", "ADA is the dispatch assistant. Tell it the stock you received or paste the day's orders, and it drafts the deliveries for each rider by area and daily load. Nothing is saved until you approve it."],
];

export default function Landing({ go }) {
  const { user, demo } = useAuth();
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState("");
  const tryDemo = async (role) => {
    setBusy(role);
    try {
      await demo(role, freshState());
      go(role === "company" ? "/company" : `/${role}`);
    } catch (e) {
      toast.error(e.message);
    }
    setBusy("");
  };
  const links = [["How it works", "#how"], ["Who it's for", "#who"], ["Proof of delivery", "#proof"], ["Questions", "#faq"]];

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-5">
          <nav className="hidden items-center gap-6 text-[14px] font-medium text-white/80 md:flex">
            {links.map(([label, href]) => <a key={href} href={href} className="hover:text-white">{label}</a>)}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            {user ? (
              <button onClick={() => go(homeFor(user))} className="h-11 rounded-full bg-white px-5 text-[14px] font-semibold text-black">Open my dashboard</button>
            ) : (
              <>
                <button onClick={() => go("/signin")} className="h-11 rounded-full px-5 text-[14px] font-semibold text-white hover:bg-white/10" data-testid="nav-signin">Sign in</button>
                <button onClick={() => go("/get-started")} className="h-11 rounded-full bg-white px-5 text-[14px] font-semibold text-black" data-testid="nav-get-started">Get started</button>
              </>
            )}
          </div>
          <button onClick={() => setMenu(true)} className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white md:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></button>
        </div>
      </header>
      {menu && (
        <div className="fixed inset-0 z-50 bg-[#05061a]/95 px-6 py-5 text-white backdrop-blur md:hidden">
          <div className="flex items-center justify-end"><button onClick={() => setMenu(false)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10" aria-label="Close"><X className="h-5 w-5" /></button></div>
          <nav className="mt-10 grid gap-1 text-[22px] font-semibold">
            {links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)} className="rounded-2xl px-2 py-3 hover:bg-white/5">{label}</a>)}
          </nav>
          <div className="mt-10 grid gap-3">
            {user ? <button onClick={() => go(homeFor(user))} className="h-14 rounded-full bg-white text-[17px] font-semibold text-black">Open my dashboard</button> : (
              <>
                <button onClick={() => go("/get-started")} className="h-14 rounded-full bg-white text-[17px] font-semibold text-black">Get started</button>
                <button onClick={() => go("/signin")} className="h-14 rounded-full bg-white/10 text-[17px] font-semibold">Sign in</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#05061a_0%,#141a5c_22%,#2b47f0_48%,#9fb0ff_70%,#ffffff_92%)] pb-16 pt-32 sm:pt-40">
        <pre aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden whitespace-pre font-mono text-[14px] leading-[2.1] text-white/[0.05] [mask-image:linear-gradient(180deg,#000_0%,#000_55%,transparent_80%)]">{DIGITS.join("\n")}</pre>
        <Float className="left-[7%] top-[30%] rotate-[14deg]" size={74} />
        <Float className="right-[8%] top-[22%] rotate-[-18deg]" size={64} />
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white/85 ring-1 ring-white/15"><AdaMark size={20} /> Dispatch run by ADA, your AI assistant</span>
          <h1 className="mx-auto mt-6 max-w-4xl text-[46px] font-black leading-[1] tracking-[-0.045em] text-white sm:text-[80px]">Every delivery,<br />live for everyone.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/75 sm:text-[19px]">Vendors hand over stock. ADA gives each rider their drops. Riders confirm every delivery with a photo, the time and the payment. The office and every vendor see it the same second.</p>
          <div className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <button onClick={() => go(user ? homeFor(user) : "/get-started")} className="flex h-[60px] items-center justify-center gap-2 rounded-full bg-white px-9 text-[17px] font-semibold text-black shadow-[0_18px_40px_-14px_rgba(0,0,0,0.5)]" data-testid="hero-get-started">
              {user ? "Open my dashboard" : "Get started free"} <ArrowRight className="h-5 w-5" />
            </button>
            {!user && <button onClick={() => go("/signin")} className="h-[60px] rounded-full bg-white/15 px-9 text-[17px] font-semibold text-white ring-1 ring-white/25 backdrop-blur">Sign in</button>}
          </div>

          {/* Try the demo */}
          <div className="mx-auto mt-14 max-w-3xl rounded-[34px] bg-black p-5 text-left sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[15px] font-semibold text-white">Try the live demo</div>
              <LiveDot label="Sample data, shared by everyone trying it" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[["company", "As the company", LayoutGrid], ["vendor", "As a vendor", Building2], ["rider", "As a rider", Bike]].map(([role, label, Icon]) => (
                <button key={role} disabled={!!busy} onClick={() => tryDemo(role)} className="flex h-14 items-center justify-between rounded-full bg-neutral-800 pl-5 pr-2 text-[15px] font-medium text-white hover:bg-neutral-700 disabled:opacity-60" data-testid={`demo-${role}`}>
                  <span className="flex items-center gap-2"><Icon className="h-5 w-5 text-white/70" /> {label}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10">{busy === role ? <AdaMark size={22} spin /> : <ArrowRight className="h-4 w-4" />}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[12.5px] text-white/45">Open the rider demo on your phone and the company demo on your laptop: deliver a drop and watch it land.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto grid max-w-6xl scroll-mt-10 gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-blue-600">How it works</div>
          <h2 className="mt-3 text-[38px] font-extrabold leading-[1.05] tracking-[-0.04em] text-neutral-950 sm:text-[44px]">How a day runs on Delivery</h2>
          <Steps className="mt-10" items={[
            ["Vendors hand over stock", "Each product with its exact unit price. It's on the vendor's dashboard straight away."],
            ["Orders come in", "Vendors send them in the app or paste their WhatsApp text. ADA reads each one and flags anything missing."],
            ["ADA plans the day", "Splits the orders across riders by area and daily units, then messages each rider their batch."],
            ["Riders deliver", "One drop at a time: photo at the door, time stamped, amount collected."],
            ["Everyone sees it", "Delivered goes up, left goes down, for the office and the vendor at once."],
          ]} />
        </div>
        <div className="space-y-5">
          <HeroCard className="min-h-[260px]">
            Hey George!<br />
            <span className="text-white/45">You've sold</span> ₦1,284,000<br />
            <span className="text-white/45">and</span> 312 units <span className="text-white/45">are left</span>
          </HeroCard>
          <div className="rounded-[34px] bg-[radial-gradient(120%_80%_at_0%_0%,#16206a_0%,#0a0f3a_45%,#050716_100%)] p-6">
            <div className="flex items-center gap-3 text-white/80"><AdaMark size={34} /><span className="text-[15px] font-medium">ADA, your dispatch assistant</span></div>
            <div className="ml-auto mt-5 w-fit max-w-[85%] rounded-[24px] bg-[#1b3a8f] px-5 py-3 text-[15px] text-white">GlowSkin dropped 40 serums at ₦12,500 each. Dispatch today's orders.</div>
            <div className="mt-3 w-fit max-w-[92%] rounded-[24px] bg-white/10 px-5 py-3 text-[15px] leading-relaxed text-white/90 ring-1 ring-white/10">Added 40 serums. 6 deliveries for 3 riders, ₦206,000 to collect. Approve?</div>
            <AdaBar className="mt-6" onSubmit={() => go(user ? homeFor(user) : "/get-started")} />
          </div>
        </div>
      </section>

      {/* Who it's for: one login and dashboard each */}
      <section id="who" className="scroll-mt-10 bg-neutral-50 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="max-w-2xl">
            <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-blue-600">Who it's for</div>
            <h2 className="mt-3 text-[38px] font-extrabold leading-[1.05] tracking-[-0.04em] text-neutral-950 sm:text-[44px]">Three dashboards. One live ledger.</h2>
            <p className="mt-4 text-[17px] text-neutral-500">Everyone signs in with their own account and sees only their part, updated the moment anything changes.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.id} className="flex flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_10px_40px_-12px_rgba(10,14,40,0.14)] ring-1 ring-black/[0.04]">
                <div className={cn("bg-gradient-to-br p-6 text-white", r.tone)}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><r.icon className="h-6 w-6" /></span>
                  <div className="mt-5 text-[22px] font-bold tracking-tight">{r.title}</div>
                </div>
                <ul className="grid flex-1 gap-3 p-6">
                  {r.points.map((p) => <li key={p} className="flex gap-3 text-[15px] text-neutral-700"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />{p}</li>)}
                </ul>
                <div className="px-6 pb-6">
                  <button onClick={() => go(r.id === "company" ? "/signup/company" : `/join?as=${r.id}`)} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-100 text-[15px] font-semibold text-neutral-900 hover:bg-neutral-200">
                    {r.id === "company" ? "Sign up your company" : "I have an invite code"} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof of delivery and how information moves */}
      <section id="proof" className="mx-auto max-w-6xl scroll-mt-10 px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-blue-600">Proof of delivery</div>
            <h2 className="mt-3 text-[38px] font-extrabold leading-[1.05] tracking-[-0.04em] text-neutral-950 sm:text-[44px]">No more "did it get there?"</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[[Camera, "Doorstep photo", "Taken in the app, kept with the delivery."], [Clock, "Time stamped", "Picked up, delivered or failed, to the minute."], [Wallet, "Payment captured", "Cash, transfer or POS, and the exact amount."], [ShieldCheck, "Payment verified", "The office ticks it off when the money lands."]].map(([Icon, t, s]) => (
                <div key={t} className="rounded-[24px] bg-neutral-100/80 p-5"><Icon className="h-6 w-6 text-blue-600" /><div className="mt-3 text-[16px] font-bold text-neutral-950">{t}</div><div className="mt-1 text-[14px] text-neutral-500">{s}</div></div>
              ))}
            </div>
          </div>
          <div className="rounded-[36px] bg-[radial-gradient(120%_80%_at_20%_0%,#141a5c_0%,#0a0d2e_45%,#05061a_100%)] p-6 text-white sm:p-8">
            <div className="text-[15px] font-semibold text-white/60">What each side sends and gets</div>
            <div className="mt-6 grid gap-3">
              {[
                [Building2, "Vendor", "sends orders and stock", "gets every drop, photo and payment"],
                [LayoutGrid, "Company", "approves ADA's plan, verifies money", "gets new orders, deliveries, problems"],
                [Bike, "Rider", "confirms each drop or reports a problem", "gets their batch and office messages"],
                [MessageSquare, "Everyone", "messages the office in the app", "gets live alerts on their phone"],
              ].map(([Icon, who, sends, gets]) => (
                <div key={who} className="flex gap-4 rounded-[22px] bg-white/[0.06] p-4 ring-1 ring-white/10">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10"><Icon className="h-5 w-5" /></span>
                  <div className="text-[14.5px] leading-snug"><div className="font-semibold">{who}</div><div className="text-white/60"><span className="text-white/90">Sends:</span> {sends}</div><div className="text-white/60"><span className="text-white/90">Gets:</span> {gets}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Phone */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="flex flex-col items-start gap-6 rounded-[36px] bg-neutral-100/80 p-7 sm:flex-row sm:items-center sm:p-10">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-black text-white"><Smartphone className="h-8 w-8" /></span>
          <div className="flex-1">
            <div className="text-[24px] font-extrabold tracking-tight text-neutral-950">On every phone, today</div>
            <div className="mt-1 text-[15.5px] text-neutral-500">Open Delivery in your phone's browser and tap <b className="text-neutral-800">Add to Home Screen</b>. Riders get a full-screen app with the camera built in. Android and iPhone apps are on the way.</div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-10 px-5 pb-24">
        <h2 className="text-center text-[36px] font-extrabold tracking-[-0.04em] text-neutral-950">Questions</h2>
        <div className="mt-8 grid gap-3">{FAQ.map(([q, a]) => <Question key={q} q={q} a={a} />)}</div>
      </section>

      {/* Closing call to action */}
      <section className="bg-black px-5 py-20 text-center text-white">
        <Sparkles className="mx-auto h-8 w-8 text-blue-300" />
        <h2 className="mx-auto mt-5 max-w-2xl text-[38px] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[48px]">Run tomorrow's deliveries on Delivery.</h2>
        <p className="mx-auto mt-4 max-w-xl text-[17px] text-white/60">Sign up your company, add your riders and vendors, and send them their invites. It takes about five minutes.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => go(user ? homeFor(user) : "/signup/company")} className="h-[58px] rounded-full bg-white px-9 text-[17px] font-semibold text-black">{user ? "Open my dashboard" : "Sign up your company"}</button>
          {!user && <button onClick={() => go("/join")} className="h-[58px] rounded-full bg-white/10 px-9 text-[17px] font-semibold">Join with an invite code</button>}
        </div>
      </section>
      <footer className="bg-black px-5 pb-10 text-white/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[13px] sm:flex-row">
          <span>© {new Date().getFullYear()} Delivery. Live logistics for vendors, riders and the office.</span>
        </div>
      </footer>
    </div>
  );
}

function Question({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-[24px] bg-neutral-100/80">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[16.5px] font-semibold text-neutral-950" aria-expanded={open}>
        {q}<ChevronDown className={cn("h-5 w-5 shrink-0 transition", open && "rotate-180")} />
      </button>
      {open && <div className="px-6 pb-5 text-[15px] leading-relaxed text-neutral-600">{a}</div>}
    </div>
  );
}

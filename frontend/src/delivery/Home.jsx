// The front door: a welcome screen with a way into each of the three dashboards, then how it works.
import React, { useState } from "react";
import { ArrowRight, Bike, Building2, LayoutGrid, Package } from "lucide-react";
import { totals, useWorkspace } from "./store";
import { AdaBar, AdaMark, HeroCard, LiveDot, Logo, Steps } from "./ui";
import { money, num } from "./utils";

// Faint binary digits behind the welcome screen.
const DIGITS = Array.from({ length: 26 }, (_, r) => Array.from({ length: 30 }, (_, c) => ((r * 7 + c * 13 + r * c) % 5 < 2 ? "1" : "0")).join("  "));

function Float({ className, size = 84 }) {
  return (
    <span className={`absolute grid place-items-center rounded-[28%] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-[0_18px_30px_-10px_rgba(120,70,0,0.55),inset_0_2px_6px_rgba(255,255,255,0.7)] ${className}`} style={{ width: size, height: size }}>
      <Package className="text-amber-900/70" style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={1.6} />
    </span>
  );
}

export default function Home({ go }) {
  const { state, act } = useWorkspace();
  const [vendorId, setVendorId] = useState(state.vendors[0].id);
  const [riderId, setRiderId] = useState(state.riders[0].id);
  const t = totals(state);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(180deg,#2b47f0_0%,#6b85ff_30%,#c9d3ff_52%,#ffffff_72%)]">
        <pre aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden whitespace-pre font-mono text-[14px] leading-[2.1] text-black/[0.06] [mask-image:linear-gradient(180deg,#000_0%,#000_60%,transparent_85%)]">{DIGITS.join("\n")}</pre>
        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
          <Logo dark />
          <button onClick={() => { if (window.confirm("Reset the demo data?")) act({ type: "reset" }); }} className="h-10 rounded-full bg-white/25 px-4 text-[13px] font-medium text-white backdrop-blur">Reset demo</button>
        </header>

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pb-10 text-center">
          <Float className="left-1/2 top-[8%] -translate-x-1/2 rotate-[-8deg]" size={96} />
          <Float className="left-[8%] top-[52%] rotate-[14deg]" size={74} />
          <Float className="right-[9%] top-[60%] rotate-[-18deg]" size={64} />
          <h1 className="mt-28 text-[56px] font-black leading-[0.98] tracking-[-0.045em] text-black sm:text-[88px]">Welcome to<br />Delivery</h1>
          <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-neutral-600">Tell ADA what's in stock. ADA dispatches the rest. One live ledger for your vendors, your riders and your office.</p>
          <div className="mt-6 flex items-center gap-4 text-[14px] text-neutral-600">
            <LiveDot label="Live now" />
            <span><b className="text-neutral-950">{num(t.delivered)}</b> delivered</span>
            <span><b className="text-neutral-950">{num(t.left)}</b> left</span>
            <span><b className="text-neutral-950">{money(t.deliveredValue)}</b> sold</span>
          </div>
        </div>

        <div className="relative rounded-t-[44px] bg-black px-5 pb-10 pt-8">
          <div className="mx-auto grid max-w-3xl gap-3">
            <button onClick={() => go("#/company")} className="flex h-[66px] items-center justify-center gap-3 rounded-full bg-white text-[19px] font-medium text-black"><LayoutGrid className="h-6 w-6" /> Continue as the company</button>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex h-[66px] items-center gap-2 rounded-full bg-neutral-800 pl-6 pr-2 text-white">
                <Building2 className="h-5 w-5 shrink-0 text-white/70" />
                <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[17px] outline-none [&>option]:text-black" aria-label="Vendor">{state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
                <button onClick={() => go(`#/vendor/${vendorId}`)} className="grid h-12 w-12 place-items-center rounded-full bg-white/15" aria-label="Open vendor portal"><ArrowRight className="h-5 w-5" /></button>
              </div>
              <div className="flex h-[66px] items-center gap-2 rounded-full bg-neutral-800 pl-6 pr-2 text-white">
                <Bike className="h-5 w-5 shrink-0 text-white/70" />
                <select value={riderId} onChange={(e) => setRiderId(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[17px] outline-none [&>option]:text-black" aria-label="Rider">{state.riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                <button onClick={() => go(`#/rider/${riderId}`)} className="grid h-12 w-12 place-items-center rounded-full bg-white/15" aria-label="Open rider app"><ArrowRight className="h-5 w-5" /></button>
              </div>
            </div>
            <p className="mt-4 text-center text-[14px] text-white/45">Company, <span className="text-white/80">vendor</span> &amp; <span className="text-white/80">rider</span> see the same numbers, the same second.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-[40px] font-extrabold leading-[1.05] tracking-[-0.04em] text-neutral-950">How a day runs on Delivery</h2>
          <Steps className="mt-10" items={[
            ["Vendors hand over stock", "Each product with its exact unit price. It's on the vendor's screen straight away."],
            ["Paste their WhatsApp orders", "ADA reads every order and flags anything missing. Nothing is guessed."],
            ["ADA plans the day", "Splits orders across riders by area and daily units, then messages them."],
            ["Riders deliver", "One drop at a time: photo at the door and the amount collected."],
            ["Everyone sees it", "Delivered goes up, left goes down, for the office and the vendor at once."],
          ]} />
          <button onClick={() => go("#/company")} className="mt-12 h-16 w-full rounded-full bg-black text-[19px] font-medium text-white sm:w-auto sm:px-14">Open the dashboard</button>
        </div>
        <div className="space-y-5">
          <HeroCard onArrow={() => go("#/company")} className="min-h-[280px]">
            Hey {state.company.dispatcher}!<br />
            <span className="text-white/45">You've sold</span> {money(t.deliveredValue)}<br />
            <span className="text-white/45">and</span> {num(t.left)} units <span className="text-white/45">are left</span>
          </HeroCard>
          <div className="rounded-[34px] bg-[radial-gradient(120%_80%_at_0%_0%,#16206a_0%,#0a0f3a_45%,#050716_100%)] p-6">
            <div className="flex items-center gap-3 text-white/80"><AdaMark size={34} /><span className="text-[15px] font-medium">ADA, your dispatch assistant</span></div>
            <div className="mt-5 ml-auto w-fit max-w-[85%] rounded-[24px] bg-[#1b3a8f] px-5 py-3 text-[15px] text-white">GlowSkin dropped 40 serums at ₦12,500 each. Dispatch today's orders.</div>
            <div className="mt-3 w-fit max-w-[92%] rounded-[24px] bg-white/10 px-5 py-3 text-[15px] leading-relaxed text-white/90 ring-1 ring-white/10">Added 40 serums. 6 deliveries for 3 riders, {money(206000)} to collect. Approve?</div>
            <AdaBar className="mt-6" onSubmit={() => go("#/company")} />
          </div>
        </div>
      </section>
    </div>
  );
}

// The front door: what the product does, and a way into each of the three dashboards.
import React, { useState } from "react";
import { ArrowRight, Bike, Building2, Camera, LayoutGrid, Wallet } from "lucide-react";
import { totals, useWorkspace } from "./store";
import { AdaMark, Avatar, Btn, Card, LiveDot, Logo, Tag } from "./ui";
import { money, num } from "./utils";

export default function Home({ go }) {
  const { state, act } = useWorkspace();
  const [vendorId, setVendorId] = useState(state.vendors[0].id);
  const [riderId, setRiderId] = useState(state.riders[0].id);
  const t = totals(state);

  return (
    <div className="min-h-screen bg-[#f6f5f2]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <button onClick={() => { if (window.confirm("Reset the demo data?")) act({ type: "reset" }); }} className="hidden text-[13px] font-medium text-stone-500 hover:text-stone-800 sm:block">Reset demo</button>
          <Btn onClick={() => go("#/company")}>Open dashboard <ArrowRight className="h-4 w-4" /></Btn>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-6 lg:grid-cols-[1.05fr_1fr] lg:pt-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-semibold text-stone-600 ring-1 ring-stone-200"><AdaMark size={18} /> Meet ADA, your dispatch assistant</span>
          <h1 className="mt-5 text-[44px] font-extrabold leading-[1.02] tracking-[-0.03em] text-stone-900 sm:text-[60px]">
            Tell ADA what's in stock.<br /><span className="text-orange-500">ADA dispatches the rest.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-stone-600">
            One live ledger for your vendors, your riders and your office. Every unit a vendor gives you, every drop a rider makes, every photo at the door and every naira collected, the same second, for everyone.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Btn size="lg" onClick={() => go("#/company")}>Company dashboard <ArrowRight className="h-4 w-4" /></Btn>
            <Btn size="lg" variant="ghost" onClick={() => go(`#/rider/${riderId}`)}>Rider app</Btn>
          </div>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between"><Tag>Today, live</Tag><LiveDot /></div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div><div className="text-[28px] font-extrabold tracking-tight">{num(t.received)}</div><div className="text-[12px] text-stone-500">units from vendors</div></div>
            <div><div className="text-[28px] font-extrabold tracking-tight text-emerald-600">{num(t.delivered)}</div><div className="text-[12px] text-stone-500">delivered &amp; paid</div></div>
            <div><div className="text-[28px] font-extrabold tracking-tight text-orange-500">{num(t.left)}</div><div className="text-[12px] text-stone-500">left</div></div>
          </div>
          <div className="mt-5 space-y-3 rounded-2xl bg-stone-50 p-4">
            <div className="ml-auto w-fit max-w-[85%] rounded-[18px] rounded-br-md bg-stone-900 px-4 py-2.5 text-[13.5px] text-white">GlowSkin dropped 40 serums at ₦12,500 each. Dispatch today's orders.</div>
            <div className="flex gap-2.5">
              <AdaMark size={28} />
              <div className="rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[13.5px] leading-snug text-stone-700 ring-1 ring-stone-200/80">
                Added 40 serums. 6 deliveries for 3 riders, {money(206000)} to collect. Sade takes Surulere and VI, Amaka takes Lekki and Ikeja, Kwame takes Yaba. <b>Approve?</b>
              </div>
            </div>
          </div>
          <div className="mt-4 text-[12.5px] text-stone-500">Sales so far: <b className="font-mono text-stone-800">{money(t.deliveredValue)}</b></div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="flex flex-col p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-900 text-white"><LayoutGrid className="h-5 w-5" /></span>
            <div className="mt-4 text-[18px] font-bold tracking-tight">Company</div>
            <p className="mt-1 flex-1 text-[14px] leading-relaxed text-stone-500">All vendors and riders, stock in and out, payments to confirm, and ADA to do the dispatching.</p>
            <Btn className="mt-5 w-full" onClick={() => go("#/company")}>Open</Btn>
          </Card>
          <Card className="flex flex-col p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Building2 className="h-5 w-5" /></span>
            <div className="mt-4 text-[18px] font-bold tracking-tight">Vendor portal</div>
            <p className="mt-1 flex-1 text-[14px] leading-relaxed text-stone-500">Vendors see what they gave, what's delivered and paid, what's left, and the photo of every drop.</p>
            <div className="mt-5 flex gap-2">
              <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="h-10 min-w-0 flex-1 rounded-full border border-stone-200 bg-white px-3 text-[13px] font-medium">{state.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
              <Btn onClick={() => go(`#/vendor/${vendorId}`)}>Open</Btn>
            </div>
          </Card>
          <Card className="flex flex-col p-6">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-orange-700"><Bike className="h-5 w-5" /></span>
            <div className="mt-4 text-[18px] font-bold tracking-tight">Rider app</div>
            <p className="mt-1 flex-1 text-[14px] leading-relaxed text-stone-500">Today's drops in order, call and directions, a photo at the door and payment in two taps.</p>
            <div className="mt-5 flex gap-2">
              <select value={riderId} onChange={(e) => setRiderId(e.target.value)} className="h-10 min-w-0 flex-1 rounded-full border border-stone-200 bg-white px-3 text-[13px] font-medium">{state.riders.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
              <Btn onClick={() => go(`#/rider/${riderId}`)}>Open</Btn>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-t border-stone-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <Tag>How it works</Tag>
          <h2 className="mt-2 max-w-2xl text-[30px] font-extrabold leading-tight tracking-tight">From a vendor's drop-off to money in the bank, without a spreadsheet.</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["Vendors hand over stock", "Each product with its exact unit price. It's on the vendor's dashboard straight away.", Building2],
              ["ADA plans the day", "Tell ADA what came in. It matches open orders, respects each rider's daily units and messages them.", null],
              ["Riders deliver", "A photo at the door, who received it, and cash, transfer or POS confirmed on the spot.", Camera],
              ["Everyone sees it", "Delivered goes up, left goes down, for the office and the vendor, the moment payment is confirmed.", Wallet],
            ].map(([title, sub, Icon], n) => (
              <li key={title} className="rounded-2xl border border-stone-200/80 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[12px] font-semibold text-orange-600">{String(n + 1).padStart(2, "0")}</span>
                  {Icon ? <Icon className="h-5 w-5 text-stone-400" /> : <AdaMark size={22} />}
                </div>
                <div className="mt-4 text-[16px] font-bold">{title}</div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-stone-500">{sub}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-[13px] text-stone-500">
            <span>Riders on duty:</span>
            {state.riders.filter((r) => r.online).map((r) => <span key={r.id} className="flex items-center gap-1.5 rounded-full bg-stone-50 py-1 pl-1 pr-3 ring-1 ring-stone-200"><Avatar name={r.name} color={r.color} size={22} />{r.short}</span>)}
          </div>
        </div>
      </section>
    </div>
  );
}

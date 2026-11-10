// First-time setup for a new delivery company: a few full-screen steps that show what the app does,
// ask about the business, and save the company's name, areas and dashboard look.
import React, { useState } from "react";
import { BellRing, Building2, User } from "lucide-react";
import { useWorkspace } from "./store";
import { AlertStack, BackBtn, Bubbles, ChoiceList, Digits, Faces, LabelCloud, NextBtn, ProgressScene, Scene, StopSlider, themeOf, ThemePicker, Tip } from "./scenes";
import { cn } from "../lib/utils";

const AREAS = ["Ikeja", "Yaba", "Lekki", "Surulere", "Victoria Island", "Ikoyi", "Ajah", "Gbagada", "Maryland", "Magodo", "Festac", "Apapa", "Ogba", "Oshodi", "Agege", "Ikorodu"];
const VOLUME = ["Under 20", "20 to 50", "50 to 150", "150 to 500", "500+"];
const MOOD_TIP = {
  stressed: <><b>You're not alone.</b> Most of a dispatcher's day goes on chasing riders and re-typing orders. ADA takes that over.</>,
  unsure: <><b>That's normal.</b> When orders live in WhatsApp chats, nobody sees the whole day at once. Delivery puts it on one screen.</>,
  good: <><b>Nice.</b> Delivery keeps it that way as you grow, with every drop, photo and payment in one place.</>,
};

export default function Setup({ go }) {
  const { state, act } = useWorkspace();
  const c = state.company;
  const [i, setI] = useState(0);
  const [a, setA] = useState({
    company: c.name === "Delivery" ? "" : c.name, name: c.dispatcher || "", deliver: c.deliver || "", intake: c.intake || "",
    mood: "", volume: c.volume != null ? c.volume : 1, zones: c.zones || ["Ikeja", "Yaba", "Lekki", "Surulere"], theme: c.theme || "night",
  });
  const set = (k) => (v) => setA((x) => ({ ...x, [k]: v }));

  const finish = () => {
    act({ type: "company/update", patch: { name: a.company.trim() || c.name, dispatcher: a.name.trim() || c.dispatcher, deliver: a.deliver, intake: a.intake, volume: a.volume, zones: a.zones, theme: a.theme, setupDone: true } });
    go("/company");
  };
  const notify = () => {
    try { const N = window.Notification; if (N && N.permission === "default") N.requestPermission(); } catch (e) { /* not supported */ }
    setI(i + 1);
  };

  const steps = [
    {
      art: <LabelCloud labels={[["Pending", 7], ["With riders", 12], ["Delivered", 18], ["To verify", 3], ["Returned", 1]]} className="h-[400px]" />,
      title: "See every drop", sub: "What's pending, out with riders and paid, the second it happens",
    },
    {
      art: <AlertStack items={["Tunde is 20 min past the window", "Order 3307 has no real address"]} action="Hold it back" className="h-[400px]" />,
      title: "Stay ahead", sub: "ADA flags trouble before a rider leaves the office",
    },
    {
      art: <ProgressScene label="18 of 24 drops delivered today" points={[24, 20, 15, 11, 6, 2]} className="h-[400px]" />,
      title: "See your progress", sub: "Watch the day count down to zero, rider by rider",
    },
    {
      art: (
        <Scene variant="dusk" className="h-[400px]">
          <div className="mx-auto mt-14 w-[78%] rounded-[22px] bg-white px-6 py-5 text-center shadow-xl">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-neutral-400">From ADA</div>
            <div className="mt-2 text-[18px] font-semibold leading-snug text-neutral-950">Today's plan is ready. 24 drops, 4 riders, all messaged.</div>
          </div>
        </Scene>
      ),
      title: "Finally, breathe", sub: "ADA plans the day so you don't have to", next: "Let's go",
    },
    {
      q: "What's your company called?",
      body: (
        <div className="grid gap-3">
          <label className="flex h-[72px] items-center gap-4 rounded-[22px] bg-neutral-100 px-6 focus-within:ring-2 focus-within:ring-blue-400"><Building2 className="h-6 w-6 text-neutral-400" /><input autoFocus value={a.company} onChange={(e) => set("company")(e.target.value)} placeholder="Company name" className="min-w-0 flex-1 bg-transparent text-[18px] outline-none placeholder:text-neutral-400" /></label>
          <label className="flex h-[72px] items-center gap-4 rounded-[22px] bg-neutral-100 px-6 focus-within:ring-2 focus-within:ring-blue-400"><User className="h-6 w-6 text-neutral-400" /><input value={a.name} onChange={(e) => set("name")(e.target.value)} placeholder="Your first name" className="min-w-0 flex-1 bg-transparent text-[18px] outline-none placeholder:text-neutral-400" /></label>
        </div>
      ),
      ok: a.company.trim() && a.name.trim(),
    },
    { q: "What do you mostly deliver?", body: <ChoiceList options={["Beauty & skincare", "Fashion & shoes", "Phones & gadgets", "Food & groceries", "A bit of everything"]} value={a.deliver} onChange={set("deliver")} />, ok: a.deliver },
    { q: "How do vendors send you orders today?", body: <ChoiceList options={["WhatsApp messages", "Phone calls", "A spreadsheet", "Another app"]} value={a.intake} onChange={set("intake")} />, ok: a.intake },
    {
      q: "How does dispatch make you feel?",
      body: (
        <div>
          <div className="mb-6 text-center text-[16px] text-neutral-400">Tap to select</div>
          <Faces options={[["stressed", "Stressed", "bad"], ["unsure", "Uncertain", "meh"], ["good", "Good", "good"]]} value={a.mood} onChange={set("mood")} />
          {a.mood && <Tip tone="amber" className="mt-10 justify-center text-center">{MOOD_TIP[a.mood]}</Tip>}
        </div>
      ),
      ok: a.mood,
    },
    { q: "How many deliveries a day?", body: <StopSlider className="mt-8" stops={VOLUME} value={a.volume} onChange={set("volume")} left="A few" right="Hundreds" /> },
    { q: "Tap the areas you deliver to", body: <Bubbles options={AREAS} value={a.zones} onChange={set("zones")} className="-mx-3" />, ok: a.zones.length },
    {
      q: "ADA also warns you before things go wrong", skip: true,
      body: (
        <div>
          <div className="relative mx-auto grid h-56 w-56 place-items-center">
            <span className="absolute inset-6 rounded-full bg-blue-400/20 blur-2xl" />
            <BellRing className="relative h-36 w-36 -rotate-12 text-neutral-900" strokeWidth={1.1} />
          </div>
          <Tip className="mt-6 rotate-[0.6deg]">A drop is flagged the moment its delivery window passes, not when the customer calls.</Tip>
          <Tip className="mt-3 -rotate-[0.4deg]">Orders with a missing address are held back before a rider sets off.</Tip>
        </div>
      ),
      next: "Turn on notifications", onNext: notify,
    },
    {
      q: "Pick a look to match your vibe", tinted: true,
      body: (
        <div>
          <ThemePicker value={a.theme} onChange={set("theme")} />
          <Tip>The look colours your dashboard and your riders' app. You can change it any time.</Tip>
        </div>
      ),
      next: "Let's do this", onNext: finish,
    },
  ];
  const s = steps[i];
  const next = s.onNext || (() => setI(i + 1));
  const tint = themeOf(a.theme).tint;

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-white" style={s.tinted ? { background: `linear-gradient(180deg, ${tint} 0%, ${tint}55 35%, #fff 60%)` } : undefined}>
      <Digits light={s.tinted} />
      <div className="relative mx-auto flex min-h-[100svh] max-w-[520px] flex-col px-5 pb-8 pt-6">
        <div className="flex h-14 items-center justify-between">
          <BackBtn light={s.tinted} onClick={() => (i ? setI(i - 1) : go("/"))} />
          <div className="flex gap-1.5">{steps.map((_, n) => <span key={n} className={cn("h-1.5 rounded-full transition-all", n === i ? "w-6 bg-neutral-900" : "w-1.5 bg-neutral-300")} />)}</div>
          {s.skip ? <button onClick={() => setI(i + 1)} className="w-[52px] text-[17px] text-neutral-400">Skip</button> : <span className="w-[52px]" />}
        </div>

        {s.art ? (
          <div className="flex flex-1 flex-col items-center pt-8 text-center">
            <div className="w-full max-w-[400px]">{s.art}</div>
            <h1 className="mt-8 text-[54px] font-black leading-[0.95] tracking-[-0.06em] text-black">{s.title}</h1>
            <p className="mt-4 max-w-sm text-[20px] leading-snug text-neutral-400">{s.sub}</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col pt-10">
            <h1 className="text-center text-[36px] font-extrabold leading-[1.08] tracking-[-0.035em] text-black">{s.q}</h1>
            <div className="mt-10">{s.body}</div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <NextBtn onClick={next} disabled={s.ok !== undefined && !s.ok}>{s.next || "Next"}</NextBtn>
        </div>
      </div>
    </div>
  );
}

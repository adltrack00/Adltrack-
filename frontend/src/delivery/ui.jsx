// Small building blocks shared by the company, vendor and rider screens.
import React from "react";
import { ArrowRight, ArrowUp, Bike, Check, CircleDashed, Clock, Mic, PackageCheck, Sparkles, Truck, Wallet, X, XCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { initials } from "./utils";

export function Card({ className, children, ...rest }) {
  return <div className={cn("min-w-0 rounded-[28px] bg-white shadow-[0_10px_40px_-12px_rgba(10,14,40,0.14)] ring-1 ring-black/[0.04]", className)} {...rest}>{children}</div>;
}

export function CardHead({ title, sub, right, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pt-5", className)}>
      <div>
        <h3 className="text-[17px] font-bold tracking-tight text-neutral-950">{title}</h3>
        {sub && <p className="mt-0.5 text-[13px] text-neutral-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// The small uppercase monospace labels used across the app.
export function Tag({ children, className }) {
  return <span className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400", className)}>{children}</span>;
}

export function Stat({ label, value, sub, icon: Icon, tone = "stone", className }) {
  const tones = {
    stone: "bg-neutral-100 text-neutral-700",
    orange: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className={cn("min-w-0 rounded-[24px] bg-neutral-100/80 p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="truncate text-[12.5px] font-semibold text-neutral-500">{label}</span>
        {Icon && <span className={cn("grid h-8 w-8 place-items-center rounded-full bg-white", tones[tone])}><Icon className="h-4 w-4" /></span>}
      </div>
      <div className="mt-3 text-[30px] font-extrabold leading-none tracking-[-0.03em] text-neutral-950">{value}</div>
      {sub && <div className="mt-1.5 text-[12.5px] text-neutral-500">{sub}</div>}
    </div>
  );
}

export function Bar({ value, max, tone = "orange", className }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = { orange: "bg-blue-500", green: "bg-emerald-500", ink: "bg-neutral-900", red: "bg-rose-500" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-neutral-100", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Delivered / with riders / in the warehouse, as one stacked bar.
export function LedgerBar({ received, delivered, withRiders }) {
  const w = (n) => `${received > 0 ? (n / received) * 100 : 0}%`;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <div className="h-full bg-emerald-500" style={{ width: w(delivered) }} />
      <div className="h-full bg-blue-400" style={{ width: w(withRiders) }} />
    </div>
  );
}

export function Avatar({ name, color = "#a8a29e", size = 36, className, photo }) {
  if (photo) return <img src={photo} alt="" className={cn("shrink-0 rounded-full object-cover", className)} style={{ width: size, height: size }} />;
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-white", className)} style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

const STATUS = {
  open: { label: "Waiting for rider", cls: "bg-neutral-100 text-neutral-600", icon: CircleDashed },
  needs_fix: { label: "Needs a fix", cls: "bg-rose-50 text-rose-700", icon: XCircle },
  cancelled: { label: "Cancelled", cls: "bg-neutral-100 text-neutral-400", icon: XCircle },
  planned: { label: "Assigned", cls: "bg-sky-50 text-sky-700", icon: Bike },
  assigned: { label: "Assigned", cls: "bg-sky-50 text-sky-700", icon: Bike },
  picked_up: { label: "On the way", cls: "bg-blue-50 text-blue-700", icon: Truck },
  awaiting: { label: "Delivered · payment to verify", cls: "bg-amber-50 text-amber-700", icon: Clock },
  delivered: { label: "Delivered · paid in", cls: "bg-emerald-50 text-emerald-700", icon: PackageCheck },
  failed: { label: "Not delivered", cls: "bg-rose-50 text-rose-700", icon: XCircle },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700", icon: Wallet },
};

export function statusOf(task) {
  if (task.status === "delivered" && !(task.payment && task.payment.confirmed)) return "awaiting";
  return task.status;
}

export function StatusPill({ status, className }) {
  const s = STATUS[status] || STATUS.open;
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold", s.cls, className)}>
      <Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}

export function Btn({ variant = "ink", size = "md", className, children, ...rest }) {
  const v = {
    ink: "bg-gradient-to-b from-neutral-800 to-black text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.5)] hover:from-neutral-700 disabled:from-neutral-300 disabled:to-neutral-300 disabled:shadow-none",
    orange: "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(43,78,240,0.7)] hover:from-blue-400 disabled:from-blue-200 disabled:to-blue-200",
    ghost: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    soft: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    green: "bg-emerald-600 text-white hover:bg-emerald-700",
    white: "bg-white text-neutral-950 hover:bg-neutral-100",
  }[variant];
  const s = { sm: "h-9 px-3.5 text-[13px]", md: "h-11 px-5 text-[14px]", lg: "h-14 px-6 text-[16px]" }[size];
  return (
    <button className={cn("inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:cursor-not-allowed", v, s, className)} {...rest}>
      {children}
    </button>
  );
}

// ADA's mark: a glowing colour orb, the same light as the "Let ADA help you" bar.
export function AdaMark({ size = 36, className, spin = false }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center rounded-full", className)} style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full opacity-70 blur-[6px] ada-orb" />
      <span className={cn("absolute inset-0 rounded-full ada-orb ring-1 ring-white/30", spin && "animate-[spin_6s_linear_infinite]")} />
      <Sparkles className="relative text-white drop-shadow" style={{ width: size * 0.42, height: size * 0.42 }} />
    </span>
  );
}

// The deep navy-to-blue backdrop every screen opens on.
export const GRADIENT = "bg-[radial-gradient(120%_80%_at_20%_0%,#141a5c_0%,#0a0d2e_45%,#05061a_100%)]";
export const GRADIENT_UP = "bg-[linear-gradient(180deg,#05061a_0%,#0f1450_45%,#2a3fe0_100%)]";

// The glowing "Let ADA help you" bar.
export function AdaBar({ onSubmit, placeholder = "Let ADA help you..", className, value, onChange }) {
  const [own, setOwn] = React.useState("");
  const text = value != null ? value : own;
  const set = onChange || setOwn;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(text); set(""); }} className={cn("relative rounded-full p-[2px] ada-ring", className)}>
      <div className="flex h-[62px] items-center gap-2 rounded-full bg-black pl-6 pr-2 shadow-[0_12px_40px_-10px_rgba(80,90,255,0.6)]">
        <input value={text} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-white outline-none placeholder:text-white/90" />
        <button type="submit" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)]" aria-label="Ask ADA">
          {text ? <ArrowUp className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>
    </form>
  );
}

// A soft grey option tile, as in "What do you want to do?".
export function Tile({ icon: Icon, title, badge, onClick, className }) {
  return (
    <button onClick={onClick} className={cn("relative flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-[26px] bg-neutral-100 px-4 py-5 text-center shadow-[0_8px_24px_-14px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-neutral-50", className)}>
      {badge != null && badge !== 0 && <span className="absolute right-3 top-3 rounded-full bg-neutral-200 px-2.5 py-0.5 text-[12.5px] font-semibold text-neutral-800">{badge}</span>}
      {Icon && <Icon className="h-7 w-7 text-neutral-950" strokeWidth={1.9} />}
      <span className="text-[15px] font-medium leading-snug text-neutral-900">{title}</span>
    </button>
  );
}

// The floating pill tab bar with a round action button beside it.
export function TabBar({ tabs, active, onChange, action, className }) {
  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4", className)}>
      <div className="pointer-events-auto flex items-center gap-3">
        <nav className="flex max-w-[calc(100vw-110px)] items-center gap-1 overflow-x-auto rounded-full bg-white/80 p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-xl">
          {tabs.map(([id, label, Icon, badge]) => (
            <button key={id} onClick={() => onChange(id)} className={cn("relative flex min-w-[76px] shrink-0 flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[12px] font-medium transition", active === id ? "bg-white text-blue-600 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.2)]" : "text-neutral-900 hover:bg-white/60")}>
              <Icon className="h-[22px] w-[22px]" strokeWidth={active === id ? 2.2 : 1.9} />
              {label}
              {!!badge && <span className="absolute right-3 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">{badge}</span>}
            </button>
          ))}
        </nav>
        {action}
      </div>
    </div>
  );
}

// Numbered how-to steps with black circles.
export function Steps({ items, className }) {
  return (
    <ol className={cn("grid gap-6", className)}>
      {items.map(([title, sub], n) => (
        <li key={title} className="flex gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-[16px] font-bold text-white">{n + 1}</span>
          <div><div className="text-[18px] font-bold tracking-tight text-neutral-950">{title}</div><div className="mt-0.5 text-[15px] leading-snug text-neutral-400">{sub}</div></div>
        </li>
      ))}
    </ol>
  );
}

export function Logo({ className, dark = false }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className={cn("grid h-8 w-8 place-items-center rounded-[10px]", dark ? "bg-white/10 ring-1 ring-white/20" : "bg-black")}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 15.5 12 4l8 11.5" stroke="#6b8bff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="18.5" r="2.4" fill="#fff" />
        </svg>
      </span>
      <span className={cn("text-[17px] font-extrabold tracking-tight", dark ? "text-white" : "text-neutral-900")}>Delivery</span>
    </span>
  );
}

export function Empty({ icon: Icon = Check, title, sub }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-neutral-100 text-neutral-500"><Icon className="h-5 w-5" /></span>
      <div className="mt-3 text-[14px] font-semibold text-neutral-800">{title}</div>
      {sub && <div className="mt-1 max-w-xs text-[13px] text-neutral-500">{sub}</div>}
    </div>
  );
}

export function LiveDot({ label = "Live", tone = "live" }) {
  const warn = tone === "warn";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${warn ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}`}>
      <span className="relative flex h-2 w-2"><span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${warn ? "bg-amber-400" : "animate-ping bg-emerald-400"}`} /><span className={`relative inline-flex h-2 w-2 rounded-full ${warn ? "bg-amber-500" : "bg-emerald-500"}`} /></span>
      {label}
    </span>
  );
}

export function Field({ label, children, className }) {
  return (
    <label className={cn("grid gap-1.5 text-[12.5px] font-medium text-neutral-600", className)}>
      {label}
      {children}
    </label>
  );
}

export const inputCls = "h-11 w-full rounded-2xl border border-transparent bg-neutral-100 px-4 text-[15px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-6" onClick={onClose}>
      <div className={cn("max-h-[94vh] w-full overflow-y-auto rounded-t-[36px] bg-white px-5 pb-6 pt-4 shadow-2xl sm:rounded-[36px]", wide ? "sm:max-w-2xl" : "sm:max-w-md")} onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 grid grid-cols-[40px_1fr_40px] items-center">
          <span />
          <h3 className="text-center text-[20px] font-bold tracking-tight text-neutral-950">{title}</h3>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center text-neutral-950" aria-label="Close"><X className="h-7 w-7" strokeWidth={1.8} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// A field of faint stars for the black cards.
const STARS = Array.from({ length: 34 }, (_, i) => [((i * 37) % 97) + 1.5, ((i * 61) % 89) + 4, (i % 3) + 1]);
export function Stars({ className }) {
  return (
    <span className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {STARS.map(([x, y, s], i) => <span key={i} className="absolute rounded-[1px] bg-white/25" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s }} />)}
    </span>
  );
}

// The big black greeting card: "Hey George! You have ₦0 to collect today".
export function HeroCard({ children, onArrow, className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[34px] bg-gradient-to-b from-black to-neutral-900 p-7 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]", className)}>
      <Stars />
      <span className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-white/10" />
      <div className="relative text-[30px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[36px]">{children}</div>
      {onArrow && <button onClick={onArrow} className="absolute bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full border border-white/25 text-white/80 hover:bg-white/10" aria-label="Open"><ArrowRight className="h-6 w-6" /></button>}
    </div>
  );
}

// A black card holding a white checklist sheet, as in "You're off to a great start".
export function ChecklistCard({ title, items, className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[34px] bg-black p-2.5 pt-0 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]", className)}>
      <Stars />
      <div className="relative flex items-center justify-between px-5 py-5 text-[18px] font-medium text-white/85">{title}<Sparkles className="h-5 w-5 text-white/40" /></div>
      <ol className="relative divide-y divide-neutral-200 rounded-[26px] bg-white px-5">
        {items.map(([label, done, sub], n) => (
          <li key={label} className="flex items-center gap-4 py-4">
            <span className="w-6 font-[cursive] text-[18px] text-neutral-900">{n + 1}.</span>
            <div className="min-w-0 flex-1"><div className={cn("text-[16px]", done ? "text-neutral-400 line-through" : "text-neutral-950")}>{label}</div>{sub && <div className="text-[12.5px] text-neutral-400">{sub}</div>}</div>
            {done ? <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-white"><Check className="h-4 w-4" strokeWidth={3} /></span> : <span className="h-7 w-7 rounded-full border-2 border-neutral-300" />}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Filter pills: soft grey, the chosen one black.
export function Chips({ options, value, onChange, className }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map(([id, label, count, Icon]) => (
        <button key={id} onClick={() => onChange(id)} className={cn("flex h-11 items-center gap-2 rounded-full px-4 text-[14.5px] font-medium transition", value === id ? "bg-black text-white" : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200")}>
          {Icon && <Icon className="h-4 w-4" />}{label}{count != null && <span className={value === id ? "text-white/50" : "text-neutral-400"}>{count}</span>}
        </button>
      ))}
    </div>
  );
}

// A week strip: today highlighted, as in the calendar header.
export function WeekStrip({ className, dark = true }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() - today.getDay() + i); return d; });
  return (
    <div className={cn("grid grid-cols-7 gap-1 text-center", className)}>
      {days.map((d) => {
        const on = d.toDateString() === today.toDateString();
        return (
          <div key={d.toISOString()} className={cn("rounded-2xl py-2.5", on && (dark ? "bg-blue-500/25" : "bg-blue-50"))}>
            <div className={cn("text-[12px] font-semibold uppercase tracking-wide", dark ? (on ? "text-white/80" : "text-white/45") : "text-neutral-400")}>{d.toLocaleDateString([], { weekday: "short" })}</div>
            <div className={cn("mt-1 text-[20px] font-semibold", dark ? (on ? "text-white" : "text-white/70") : "text-neutral-900")}>{String(d.getDate()).padStart(2, "0")}</div>
          </div>
        );
      })}
    </div>
  );
}

// A grouped option list with icons, the chosen row tinted, as in "Sort & Filter".
export function OptionList({ options, value, onChange, className }) {
  return (
    <div className={cn("overflow-hidden rounded-[22px] bg-neutral-100", className)}>
      {options.map(([id, label, Icon]) => (
        <button key={id} onClick={() => onChange(id)} className={cn("flex w-full items-center gap-4 px-5 py-4 text-left text-[17px] transition", value === id ? "bg-blue-100/80 font-semibold text-neutral-950" : "text-neutral-900 hover:bg-neutral-200/60")}>
          {Icon && <Icon className={cn("h-6 w-6", value === id ? "text-blue-600" : "text-neutral-400")} strokeWidth={1.7} />}
          <span className="flex-1">{label}</span>
          {value === id && <Check className="h-5 w-5 text-blue-600" />}
        </button>
      ))}
    </div>
  );
}

// Small building blocks shared by the company, vendor and rider screens.
import React from "react";
import { Bike, Check, CircleDashed, Clock, PackageCheck, Truck, Wallet, XCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { initials } from "./utils";

export function Card({ className, children, ...rest }) {
  return <div className={cn("min-w-0 rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)]", className)} {...rest}>{children}</div>;
}

export function CardHead({ title, sub, right, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 px-5 pt-5", className)}>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight text-stone-900">{title}</h3>
        {sub && <p className="mt-0.5 text-[13px] text-stone-500">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// The small uppercase monospace labels used across the app.
export function Tag({ children, className }) {
  return <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.12em] text-stone-400", className)}>{children}</span>;
}

export function Stat({ label, value, sub, icon: Icon, tone = "stone", className }) {
  const tones = {
    stone: "bg-stone-100 text-stone-700",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <span className="truncate text-[12px] font-semibold text-stone-500">{label}</span>
        {Icon && <span className={cn("grid h-8 w-8 place-items-center rounded-xl", tones[tone])}><Icon className="h-4 w-4" /></span>}
      </div>
      <div className="mt-3 text-[26px] font-bold leading-none tracking-tight text-stone-900">{value}</div>
      {sub && <div className="mt-1.5 text-[12.5px] text-stone-500">{sub}</div>}
    </Card>
  );
}

export function Bar({ value, max, tone = "orange", className }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = { orange: "bg-orange-500", green: "bg-emerald-500", ink: "bg-stone-900", red: "bg-rose-500" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-stone-100", className)}>
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Delivered / with riders / in the warehouse, as one stacked bar.
export function LedgerBar({ received, delivered, withRiders }) {
  const w = (n) => `${received > 0 ? (n / received) * 100 : 0}%`;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div className="h-full bg-emerald-500" style={{ width: w(delivered) }} />
      <div className="h-full bg-orange-400" style={{ width: w(withRiders) }} />
    </div>
  );
}

export function Avatar({ name, color = "#a8a29e", size = 36, className }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-white", className)} style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

const STATUS = {
  open: { label: "Waiting for rider", cls: "bg-stone-100 text-stone-600", icon: CircleDashed },
  needs_fix: { label: "Needs a fix", cls: "bg-rose-50 text-rose-700", icon: XCircle },
  cancelled: { label: "Cancelled", cls: "bg-stone-100 text-stone-400", icon: XCircle },
  planned: { label: "Assigned", cls: "bg-sky-50 text-sky-700", icon: Bike },
  assigned: { label: "Assigned", cls: "bg-sky-50 text-sky-700", icon: Bike },
  picked_up: { label: "On the way", cls: "bg-orange-50 text-orange-700", icon: Truck },
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
    ink: "bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300",
    orange: "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-200",
    ghost: "bg-white text-stone-800 border border-stone-200 hover:bg-stone-50",
    soft: "bg-stone-100 text-stone-800 hover:bg-stone-200",
    green: "bg-emerald-600 text-white hover:bg-emerald-700",
  }[variant];
  const s = { sm: "h-8 px-3 text-[12.5px]", md: "h-10 px-4 text-[13.5px]", lg: "h-12 px-5 text-[15px]" }[size];
  return (
    <button className={cn("inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:cursor-not-allowed", v, s, className)} {...rest}>
      {children}
    </button>
  );
}

// ADA's mark: an original orange tile with a route line and a spark. Not a face.
export function AdaMark({ size = 36, className }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-[30%] bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_4px_14px_rgba(249,115,22,0.35)]", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size * 0.7} height={size * 0.7} aria-hidden="true">
        <path d="M7 29c6 0 6-9 13-9s7-9 13-9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="0.1 5.5" />
        <circle cx="7" cy="29" r="3.2" fill="#fff" />
        <path d="M31 6l1.4 3.6L36 11l-3.6 1.4L31 16l-1.4-3.6L26 11l3.6-1.4z" fill="#fff" />
      </svg>
    </span>
  );
}

export function Logo({ className, dark = false }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-stone-900">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 15.5 12 4l8 11.5" stroke="#fb923c" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="18.5" r="2.4" fill="#fff" />
        </svg>
      </span>
      <span className={cn("text-[17px] font-extrabold tracking-tight", dark ? "text-white" : "text-stone-900")}>Delivery</span>
    </span>
  );
}

export function Empty({ icon: Icon = Check, title, sub }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-500"><Icon className="h-5 w-5" /></span>
      <div className="mt-3 text-[14px] font-semibold text-stone-800">{title}</div>
      {sub && <div className="mt-1 max-w-xs text-[13px] text-stone-500">{sub}</div>}
    </div>
  );
}

export function LiveDot({ label = "Live" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11.5px] font-semibold text-emerald-700">
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
      {label}
    </span>
  );
}

export function Field({ label, children, className }) {
  return (
    <label className={cn("grid gap-1.5 text-[12.5px] font-medium text-stone-600", className)}>
      {label}
      {children}
    </label>
  );
}

export const inputCls = "h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-[14px] text-stone-900 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-900/5";

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div className={cn("max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl", wide ? "sm:max-w-2xl" : "sm:max-w-md")} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-bold tracking-tight text-stone-900">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// The company's main menu: a cream panel that slides in from the left over a blurred dashboard,
// with a welcome, the signed-in email, each section on a round white icon, and the brand with its version.
import React, { useEffect } from "react";
import { cn } from "../lib/utils";

export const APP_VERSION = "1.0.0";

export function SideMenu({ open, onClose, name, email, items, active, footer }) {
  // Esc closes it, and the page behind doesn't scroll while it's open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div onClick={onClose} className={cn("absolute inset-0 bg-neutral-900/20 backdrop-blur-md transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
      <nav
        aria-label="Main menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col overflow-y-auto rounded-r-[32px] bg-[#faf7f1] px-7 pb-7 pt-12 shadow-[20px_0_60px_-20px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        data-testid="side-menu"
      >
        <h2 className="font-serif-display text-[42px] leading-[1.04] text-neutral-900">Welcome,<br />{name}!</h2>
        {email && <div className="mt-5 truncate text-[14px] text-neutral-500" data-testid="menu-email">{email}</div>}
        <ul className="mt-7 grid gap-0.5">
          {items.map(({ id, label, icon: Icon, badge, onClick }) => (
            <li key={id}>
              <button
                onClick={() => { onClick(); onClose(); }}
                className={cn("flex w-full items-center gap-4 rounded-full py-1.5 pr-3 text-left text-[17px] transition hover:bg-black/[0.03]", active === id ? "font-semibold text-neutral-950" : "text-neutral-800")}
                data-testid={`menu-${id}`}
              >
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.12)]", active === id && "ring-2 ring-blue-500/70")}>
                  <Icon className="h-5 w-5 text-neutral-800" strokeWidth={1.8} />
                </span>
                <span className="flex-1">{label}</span>
                {!!badge && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-blue-600 px-1.5 text-[12px] font-bold text-white">{badge}</span>}
              </button>
            </li>
          ))}
        </ul>
        {footer}
        <div className="mt-auto flex items-baseline gap-3 pt-8">
          <span className="font-serif-display text-[34px] text-neutral-900">Delivery.</span>
          <span className="font-mono text-[12px] tracking-[0.15em] text-neutral-400">v.{APP_VERSION}</span>
        </div>
      </nav>
    </div>
  );
}

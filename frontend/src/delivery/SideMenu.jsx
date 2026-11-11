// The dashboards' main menu, in Delivery's own style: a light grey panel (the white-grey under the page's blue) that slides in from the left over a blurred
// dashboard, with ADA's orb, a welcome, the signed-in email, every section on a glass icon (the open one as a white
// pill, like the tab bar), and the Delivery mark with its version at the bottom.
import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";
import { AdaMark, Logo } from "./ui";

export const APP_VERSION = "1.0.0";

export function SideMenu({ open, onClose, name, email, items, active, panel }) {
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
      <div onClick={onClose} className={cn("absolute inset-0 bg-[#05061a]/30 backdrop-blur-md transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
      <nav
        aria-label="Main menu"
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col overflow-hidden rounded-r-[36px] text-neutral-950 shadow-[24px_0_70px_-20px_rgba(5,6,26,0.45)] transition-transform duration-300 ease-out",
          panel || "bg-[#f5f6f8]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        data-testid="side-menu"
      >
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6 pt-7 [&>*]:shrink-0">
          <div className="flex items-center justify-between">
            <AdaMark size={40} />
            <button onClick={onClose} className="grid h-10 w-10 place-items-center text-neutral-500 hover:text-neutral-950" aria-label="Close menu"><X className="h-6 w-6" strokeWidth={1.8} /></button>
          </div>
          <h2 className="mt-7 text-[36px] font-extrabold leading-[1.02] tracking-[-0.04em]">Welcome,<br /><span className="text-neutral-400">{name}!</span></h2>
          {email && <div className="mt-3 truncate text-[14px] text-neutral-500" data-testid="menu-email">{email}</div>}
          <ul className="mt-7 grid gap-1">
            {items.map(({ id, label, icon: Icon, badge, onClick }) => {
              const on = active === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => { onClick(); onClose(); }}
                    className={cn("flex w-full items-center gap-3.5 rounded-full p-1.5 pr-4 text-left text-[16px] font-medium transition", on ? "bg-white text-blue-600 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]" : "text-neutral-800 hover:bg-black/[0.04]")}
                    data-testid={`menu-${id}`}
                  >
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", on ? "bg-blue-50" : "bg-white ring-1 ring-black/5")}>
                      <Icon className="h-[19px] w-[19px]" strokeWidth={on ? 2.2 : 1.9} />
                    </span>
                    <span className="flex-1">{label}</span>
                    {!!badge && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-blue-600 px-1.5 text-[12px] font-bold text-white">{badge}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex items-center justify-between pt-8">
            <Logo />
            <span className="font-mono text-[11.5px] tracking-[0.15em] text-neutral-400">v.{APP_VERSION}</span>
          </div>
        </div>
      </nav>
    </div>
  );
}

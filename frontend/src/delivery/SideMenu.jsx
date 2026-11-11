// The dashboards' main menu, in Delivery's own style (light grey-white panel, dark text, each section on a round icon,
// the open one as a white pill).
// - Laptop and wider: a sidebar built into the page, always there. A toggle at its top shrinks it to a rail of icons
//   and back; the choice is remembered on this device.
// - Phone and tablet: the same menu slides in from the left over a blurred dashboard, opened by the page's menu button.
// Items can be a group with `children`: it opens and closes in place, and starts open when one of its pages is showing.
import React, { useEffect, useState } from "react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "../lib/utils";
import { AdaMark } from "./ui";

export const APP_VERSION = "1.0.0";

const KEY = "delivery-nav-collapsed";
const readCollapsed = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };
const saveCollapsed = (v) => { try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* private window */ } };

const hasActive = (item, active) => item.id === active || (item.children || []).some((c) => c.id === active);

export function SideMenu({ open, onClose, name, email, items, active, panel }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const toggle = () => setCollapsed((c) => { saveCollapsed(!c); return !c; });

  // Esc closes the phone drawer, and the page behind doesn't scroll while it's open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  // Close the drawer if the window grows into laptop size while it's open.
  useEffect(() => {
    if (!open || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => { if (e.matches) onClose(); };
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => { mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange); };
  }, [open, onClose]);

  return (
    <>
      {/* Laptop: built into the page. */}
      <aside
        aria-label="Main menu"
        className={cn(
          "sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-black/[0.06] text-neutral-950 transition-[width] duration-300 ease-out lg:flex",
          panel || "bg-[#f5f6f8]",
          collapsed ? "w-[84px]" : "w-[272px]",
        )}
        data-testid="side-nav"
        data-collapsed={collapsed ? "true" : "false"}
      >
        <div className={cn("flex items-center pt-6", collapsed ? "flex-col gap-3 px-0" : "justify-between px-5")}>
          <AdaMark size={collapsed ? 34 : 38} />
          <button
            onClick={toggle}
            className="grid h-10 w-10 place-items-center rounded-full text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-950"
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand menu" : "Collapse menu"}
            data-testid="nav-toggle"
          >
            {collapsed ? <PanelLeftOpen className="h-[21px] w-[21px]" strokeWidth={1.9} /> : <PanelLeftClose className="h-[21px] w-[21px]" strokeWidth={1.9} />}
          </button>
        </div>
        {!collapsed && (
          <div className="px-5 pt-5">
            <div className="text-[22px] font-extrabold leading-tight tracking-[-0.03em]">Hi, <span className="text-neutral-400">{name}</span></div>
            {email && <div className="mt-0.5 truncate text-[12.5px] text-neutral-500">{email}</div>}
          </div>
        )}
        <div className={cn("mt-5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4", collapsed ? "px-3" : "px-3.5")}>
          <MenuList items={items} active={active} compact collapsed={collapsed} onExpand={() => { saveCollapsed(false); setCollapsed(false); }} />
        </div>
        <div className={cn("pb-5 pt-2", collapsed ? "text-center" : "px-6")}>
          <span className="font-mono text-[11px] tracking-[0.15em] text-neutral-400">{collapsed ? `v${APP_VERSION.split(".")[0]}` : `v.${APP_VERSION}`}</span>
        </div>
      </aside>

      {/* Phone and tablet: slides in from the left. */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div onClick={onClose} className={cn("absolute inset-0 bg-[#05061a]/30 backdrop-blur-md transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} />
        <nav
          aria-label="Main menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col overflow-hidden rounded-r-[36px] text-neutral-950 transition-[transform,box-shadow] duration-300 ease-out",
            panel || "bg-[#f5f6f8]",
            open ? "translate-x-0 shadow-[24px_0_70px_-20px_rgba(5,6,26,0.45)]" : "-translate-x-full shadow-none",
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
            <div className="mt-7">
              <MenuList items={items} active={active} onPick={onClose} testPrefix="menu" />
            </div>
            <div className="mt-auto flex items-center pt-8">
              <span className="font-mono text-[11.5px] tracking-[0.15em] text-neutral-400">v.{APP_VERSION}</span>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}

function MenuList({ items, active, onPick = () => {}, compact, collapsed, onExpand, testPrefix = "nav" }) {
  // Groups that hold the open page start open; the rest start closed.
  const [openGroups, setOpenGroups] = useState(() => new Set(items.filter((i) => i.children && hasActive(i, active)).map((i) => i.id)));
  useEffect(() => {
    const g = items.find((i) => i.children && hasActive(i, active));
    if (g) setOpenGroups((s) => (s.has(g.id) ? s : new Set([...s, g.id])));
  }, [active, items]);
  const flip = (id) => setOpenGroups((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <ul className={cn("grid", compact ? "gap-0.5" : "gap-1")}>
      {items.map((item) => {
        const { id, label, icon: Icon, badge, onClick, children } = item;
        const on = children ? hasActive(item, active) : active === id;
        const isOpen = children && openGroups.has(id) && !collapsed;
        const groupBadge = children ? children.reduce((n, c) => n + (c.badge || 0), 0) : badge;
        const press = () => {
          if (children) {
            if (collapsed) { onExpand(); setOpenGroups((s) => new Set([...s, id])); } else flip(id);
            return;
          }
          onClick(); onPick();
        };
        return (
          <li key={id}>
            <button
              onClick={press}
              title={collapsed ? label : undefined}
              aria-expanded={children ? !!isOpen : undefined}
              aria-current={!children && on ? "page" : undefined}
              className={cn(
                "relative flex w-full items-center rounded-full text-left font-medium transition",
                compact ? "gap-3 p-1 pr-3 text-[14.5px]" : "gap-3.5 p-1.5 pr-4 text-[16px]",
                collapsed && "justify-center pr-1",
                on && !children ? "bg-white text-blue-600 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]" : on ? "text-blue-600 hover:bg-black/[0.04]" : "text-neutral-800 hover:bg-black/[0.04]",
              )}
              data-testid={`${testPrefix}-${id}`}
            >
              <span className={cn("grid shrink-0 place-items-center rounded-full", compact ? "h-9 w-9" : "h-10 w-10", on ? "bg-blue-50" : "bg-white ring-1 ring-black/5")}>
                <Icon className={compact ? "h-[17px] w-[17px]" : "h-[19px] w-[19px]"} strokeWidth={on ? 2.2 : 1.9} />
              </span>
              {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
              {!collapsed && !!groupBadge && !isOpen && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-blue-600 px-1.5 text-[12px] font-bold text-white">{groupBadge}</span>}
              {collapsed && !!groupBadge && <span className="absolute right-0.5 top-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">{groupBadge}</span>}
              {!collapsed && children && <ChevronDown className={cn("h-4 w-4 shrink-0 text-neutral-400 transition-transform", isOpen && "rotate-180")} />}
            </button>
            {isOpen && (
              <ul className={cn("mt-0.5 grid gap-0.5 border-l-2 border-black/[0.06] pl-3", compact ? "mb-1 ml-[22px]" : "mb-1.5 ml-[26px]")}>
                {children.map((c) => {
                  const cOn = active === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => { c.onClick(); onPick(); }}
                        aria-current={cOn ? "page" : undefined}
                        className={cn("flex w-full items-center gap-2 rounded-full px-3 text-left font-medium transition", compact ? "py-2 text-[14px]" : "py-2.5 text-[15px]", cOn ? "bg-white text-blue-600 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]" : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-950")}
                        data-testid={`${testPrefix}-${c.id}`}
                      >
                        <span className="min-w-0 flex-1 truncate">{c.label}</span>
                        {!!c.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">{c.badge}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

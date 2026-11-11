// Illustrated pieces: painted scene cards, the digit backdrop, tips, mood faces, bubbles, a stop slider,
// alert stacks, a progress line and the dashboard looks. All drawn in code, no image files.
import React from "react";
import { ArrowLeft, Check, ChevronRight, Eye, Lightbulb } from "lucide-react";
import { cn } from "../lib/utils";

/* ---------- Looks: the company picks one and it colours the dashboard background, menu and rider app. page = the dashboard
   background, same shape as the vendor page (strong colour, lighter at 45%, white at the bottom) in the menu's colour. ---------- */

export const THEMES = {
  night: { name: "Night run", scene: "night", header: "bg-[radial-gradient(120%_80%_at_20%_0%,#141a5c_0%,#0a0d2e_45%,#05061a_100%)]", rider: "bg-[linear-gradient(180deg,#05061a_0%,#0f1450_45%,#2a3fe0_100%)]", page: "bg-[linear-gradient(180deg,#0a0d2e_0%,#141a5c_45%,#ffffff_100%)]", tint: "#2b47f0" },
  blue: { name: "Blue hour", scene: "blue", header: "bg-[linear-gradient(160deg,#1d2fc0_0%,#2b47f0_45%,#5a74ff_100%)]", rider: "bg-[linear-gradient(180deg,#14209a_0%,#2b47f0_55%,#7d93ff_100%)]", page: "bg-[linear-gradient(180deg,#1d2fc0_0%,#2b47f0_45%,#ffffff_100%)]", tint: "#3d5cff" },
  dusk: { name: "Dusk", scene: "dusk", header: "bg-[linear-gradient(160deg,#2a1a6e_0%,#5b3fd0_50%,#9a7bff_100%)]", rider: "bg-[linear-gradient(180deg,#1c1250_0%,#5b3fd0_55%,#b39cff_100%)]", page: "bg-[linear-gradient(180deg,#2a1a6e_0%,#5b3fd0_45%,#ffffff_100%)]", tint: "#7b5cff" },
  sunset: { name: "Sunset", scene: "sunset", header: "bg-[linear-gradient(160deg,#3a1410_0%,#9a3a24_50%,#e2803f_100%)]", rider: "bg-[linear-gradient(180deg,#2a0f0c_0%,#9a3a24_55%,#f0a058_100%)]", page: "bg-[linear-gradient(180deg,#3a1410_0%,#9a3a24_45%,#ffffff_100%)]", tint: "#e2803f" },
  mint: { name: "Mint", scene: "mint", header: "bg-[linear-gradient(160deg,#0b3b2c_0%,#147a55_50%,#4cc38a_100%)]", rider: "bg-[linear-gradient(180deg,#082a20_0%,#147a55_55%,#7fdcaa_100%)]", page: "bg-[linear-gradient(180deg,#0b3b2c_0%,#147a55_45%,#ffffff_100%)]", tint: "#22a06b" },
};
export const themeOf = (id) => THEMES[id] || THEMES.night;

/* ---------- Painted scenes ---------- */

const STAR_PTS = Array.from({ length: 26 }, (_, i) => [((i * 53) % 390) + 5, ((i * 37) % 170) + 8, (i % 3) * 0.5 + 0.7]);
const LIGHTS = Array.from({ length: 70 }, (_, i) => [((i * 47) % 380) + 10, 318 + ((i * 29) % 46), (i % 4) * 0.25 + 0.6]);

const PAINT = {
  night: { sky: ["#1b34c8", "#2c4ff0", "#3a5cff"], orb: "#ffffff", orbY: 120, hills: ["#2a47d8", "#1f39b8", "#152b92", "#0c1d6a"], glow: "rgba(70,100,255,0.45)", lights: true, stars: true },
  blue: { sky: ["#3355ff", "#5574ff", "#8ea2ff"], orb: "#ffffff", orbY: 105, hills: ["#4a66f5", "#3552e0", "#2340c0", "#16299a"], glow: "rgba(80,110,255,0.4)", lights: true, stars: true },
  dusk: { sky: ["#6d5cf0", "#9b86ff", "#c9b8ff"], orb: "#fff6ff", orbY: 95, hills: ["#a08cff", "#7a62e6", "#5a44c4", "#3d2d96"], glow: "rgba(130,100,255,0.45)", peak: true, water: true, stars: true },
  sunset: { sky: ["#b24a3a", "#e07a4f", "#f4b06a"], orb: "#ffe9a8", orbY: 170, hills: ["#a8503c", "#86392c", "#5e2620", "#3a1612"], glow: "rgba(240,130,70,0.45)", peak: true },
  mint: { sky: ["#9fe0b8", "#c8f0d4", "#eafbef"], orb: "#ffffff", orbY: 110, hills: ["#7fd4a0", "#4fb87e", "#2f9a62", "#1c7448"], glow: "rgba(60,190,120,0.35)" },
};

export function Scene({ variant = "night", className, children, glow = true }) {
  const p = PAINT[variant] || PAINT.night;
  const id = `sky-${variant}`;
  return (
    <div className={cn("relative overflow-hidden rounded-[40px]", className)} style={glow ? { boxShadow: `0 30px 70px -20px ${p.glow}, 0 0 0 1px rgba(0,0,0,0.03)` } : undefined}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.sky[0]} /><stop offset="0.55" stopColor={p.sky[1]} /><stop offset="1" stopColor={p.sky[2]} /></linearGradient>
          <radialGradient id={`${id}-orb`}><stop offset="0" stopColor={p.orb} stopOpacity="0.9" /><stop offset="1" stopColor={p.orb} stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="400" height="480" fill={`url(#${id})`} />
        {p.stars && STAR_PTS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.7" />)}
        <circle cx="210" cy={p.orbY} r="60" fill={`url(#${id}-orb)`} />
        <circle cx="210" cy={p.orbY} r={variant === "sunset" ? 46 : 16} fill={p.orb} />
        <path d="M30 70 q40 -10 80 0 M250 60 q50 -12 110 2 M60 150 q30 -6 70 0" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round" />
        {p.peak && <path d="M60 300 L200 170 L340 300 Z" fill={p.hills[1]} />}
        {p.peak && <path d="M180 188 L200 170 L222 190 L210 196 L200 188 L190 196 Z" fill="#fff" opacity="0.8" />}
        <path d="M0 270 C80 240 150 250 220 262 S340 250 400 240 V480 H0Z" fill={p.hills[0]} opacity={p.peak ? 0.6 : 1} />
        <path d="M0 310 C90 285 170 300 250 296 S360 280 400 286 V480 H0Z" fill={p.hills[1]} />
        {p.lights && LIGHTS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff8c8" opacity="0.85" />)}
        {p.water ? (
          <>
            <rect x="0" y="330" width="400" height="150" fill={p.sky[2]} opacity="0.75" />
            <path d="M60 330 L200 440 L340 330 Z" fill={p.hills[1]} opacity="0.35" />
            <path d="M40 380 h90 M220 400 h120 M90 430 h70" stroke="#fff" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M0 370 C100 340 180 360 260 350 S360 330 400 340 V480 H0Z" fill={p.hills[2]} />
            <path d="M0 420 C80 400 160 420 240 410 S350 395 400 405 V480 H0Z" fill={p.hills[3]} />
          </>
        )}
      </svg>
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* ---------- Faint binary digits behind onboarding and welcome screens ---------- */

const DIGIT_ROWS = Array.from({ length: 30 }, (_, r) => Array.from({ length: 34 }, (_, c) => ((r * 7 + c * 13 + r * c) % 5 < 2 ? "1" : "0")).join("  "));
export function Digits({ className, light = false }) {
  return (
    <pre aria-hidden="true" className={cn("pointer-events-none absolute inset-0 select-none overflow-hidden whitespace-pre font-mono text-[14px] leading-[2.1] [mask-image:linear-gradient(180deg,#000_0%,#000_45%,transparent_70%)]", light ? "text-white/[0.12]" : "text-black/[0.07]", className)}>{DIGIT_ROWS.join("\n")}</pre>
  );
}

/* ---------- Small pieces ---------- */

export function BackBtn({ onClick, light = false, className }) {
  return <button onClick={onClick} className={cn("grid h-[52px] w-[52px] place-items-center rounded-full ring-1", light ? "bg-white/25 ring-white/30 text-neutral-950" : "bg-neutral-100 ring-neutral-200 text-neutral-950", className)} aria-label="Back"><ArrowLeft className="h-6 w-6" strokeWidth={1.6} /></button>;
}

export function NextBtn({ children = "Next", className, ...rest }) {
  return (
    <button className={cn("inline-flex h-[64px] items-center justify-center gap-3 rounded-full bg-neutral-900 px-12 text-[19px] font-medium text-white shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)] transition hover:bg-black disabled:opacity-30", className)} {...rest}>
      {children} <ChevronRight className="h-5 w-5" />
    </button>
  );
}

// "💡 Gamification makes habits stick" style hint box.
export function Tip({ children, className, tone = "grey" }) {
  const tones = { grey: "bg-neutral-100 text-neutral-800", amber: "bg-amber-50 text-neutral-900 ring-1 ring-amber-300/70", blue: "bg-blue-50 text-neutral-900" };
  return (
    <div className={cn("flex items-start gap-4 rounded-[24px] px-6 py-5 text-[16px] leading-snug", tones[tone], className)}>
      <Lightbulb className="mt-0.5 h-6 w-6 shrink-0" strokeWidth={1.6} />
      <div>{children}</div>
    </div>
  );
}

// A tall grey answer card; the chosen one tinted.
export function ChoiceList({ options, value, onChange, className }) {
  return (
    <div className={cn("grid gap-3", className)}>
      {options.map((o) => {
        const [id, label] = Array.isArray(o) ? o : [o, o];
        const on = Array.isArray(value) ? value.includes(id) : value === id;
        return (
          <button key={id} onClick={() => onChange(id)} className={cn("flex min-h-[72px] items-center justify-between rounded-[22px] px-6 py-4 text-left text-[17px] ring-1 transition", on ? "bg-blue-50 text-neutral-950 ring-blue-400" : "bg-neutral-100 text-neutral-900 ring-transparent hover:bg-neutral-200/70")}>
            {label}{on && <Check className="h-5 w-5 text-blue-600" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Mood faces ---------- */

const MOUTH = { bad: "M-12 10 Q0 2 12 10", meh: "M-11 8 H11", good: "M-12 4 Q0 14 12 4" };
export function Faces({ options, value, onChange, className }) {
  return (
    <div className={cn("flex items-end justify-center gap-4 sm:gap-8", className)}>
      {options.map(([id, label, mood]) => {
        const on = value === id;
        return (
          <button key={id} onClick={() => onChange(id)} className={cn("flex flex-col items-center gap-4 transition", on && "-translate-y-5")}>
            <span className={cn("grid h-[92px] w-[92px] place-items-center rounded-full transition sm:h-[104px] sm:w-[104px]", on ? "bg-amber-100 ring-2 ring-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.45)]" : "bg-neutral-100")}>
              <svg viewBox="-30 -30 60 60" className="h-14 w-14" aria-hidden="true">
                <circle cx="-9" cy="-6" r="3.6" fill={on ? "#d9622b" : "#000"} /><circle cx="9" cy="-6" r="3.6" fill={on ? "#d9622b" : "#000"} />
                <path d={MOUTH[mood]} stroke={on ? "#d9622b" : "#000"} strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-[17px] text-neutral-600">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Bubbles you tap to pick, as in "Tap to select some of your expenses" ---------- */

const SIZES = [132, 112, 124, 98, 118, 104, 128, 96, 116, 108];
export function Bubbles({ options, value, onChange, className }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className={cn("flex flex-wrap items-center justify-center py-4", className)}>
      {options.map((id, i) => {
        const on = value.includes(id);
        const s = SIZES[i % SIZES.length];
        return (
          <button key={id} onClick={() => toggle(id)} style={{ width: s, height: s, margin: -3, marginTop: i % 2 ? 8 : -8, fontSize: id.length > 9 ? 13.5 : undefined }}
            className={cn("relative grid shrink-0 place-items-center rounded-full px-2 text-center text-[15.5px] leading-tight transition duration-200", on
              ? "z-10 scale-[1.04] bg-gradient-to-br from-blue-500 to-blue-700 font-semibold text-white ring-1 ring-blue-300 shadow-[0_0_34px_rgba(43,71,240,0.55)]"
              : "bg-white text-neutral-500 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.04] hover:text-neutral-800")}>
            {id}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- A slider that snaps to stops, as in "How satisfied are you" ---------- */

export function StopSlider({ stops, value, onChange, left, right, className }) {
  const pct = (value / (stops.length - 1)) * 100;
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex justify-between text-[16px] text-neutral-500"><span>{left}</span><span>{right}</span></div>
      <div className="relative h-10">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-neutral-200" />
        <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black" style={{ width: `${pct}%` }} />
        <div className="pointer-events-none absolute top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] ring-1 ring-black/5" style={{ left: `${pct}%` }} />
        <input type="range" min="0" max={stops.length - 1} step="1" value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label={`${left} to ${right}`} />
      </div>
      <div className="mt-4 flex justify-between">
        {stops.map((s, i) => (
          <button key={s} onClick={() => onChange(i)} className="flex w-0 flex-1 flex-col items-center gap-2 first:items-start last:items-end">
            <span className={cn("h-4 w-4 rounded-full", i <= value ? "bg-neutral-900" : "bg-neutral-200")} />
            <span className={cn("whitespace-nowrap text-[13px]", i === value ? "font-semibold text-neutral-950" : "text-neutral-400")}>{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scene cards for dashboards ---------- */

// White labels floating over a night scene, as in "See what's due".
export function LabelCloud({ labels, variant = "night", className, onPick }) {
  return (
    <Scene variant={variant} className={cn("min-h-[340px]", className)}>
      <div className="flex h-full min-h-[340px] flex-col">
      <div className="flex flex-wrap content-start justify-center gap-x-3 gap-y-3 px-5 pt-8">
        {labels.slice(0, 6).map(([label, count, id], i) => (
          <button key={label} onClick={() => onPick && onPick(id)} style={{ transform: `rotate(${(i % 3) - 1}deg) translateY(${i % 2 ? 8 : 0}px)` }}
            className="whitespace-nowrap rounded-[18px] bg-white px-4 py-3 text-left text-[15px] font-semibold text-neutral-950 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5">
            {label}{count != null && <span className="ml-2 text-neutral-400">{count}</span>}
          </button>
        ))}
      </div>
      <span className="mx-auto mb-10 mt-auto grid h-16 w-24 shrink-0 place-items-center rounded-[50%] bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)]"><Eye className="h-9 w-9 text-neutral-950" strokeWidth={1.6} /></span>
      </div>
    </Scene>
  );
}

// Tilted alert cards with a red action pill, as in "Stay ahead".
export function AlertStack({ items, action, onAction, variant = "dusk", className, empty = "Nothing needs you right now." }) {
  const list = items.slice(0, 2);
  return (
    <Scene variant={variant} className={cn("min-h-[340px]", className)}>
      <div className="flex h-full min-h-[340px] flex-col justify-center px-5 py-10">
        {list.length ? list.map((text, i) => (
          <div key={text} className={cn("w-[88%] rounded-[18px] bg-white px-5 py-4 text-[15.5px] font-semibold text-neutral-950 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.4)]", i % 2 ? "-mt-1 ml-auto -rotate-1" : "mx-auto rotate-[-2deg]")}>{text}</div>
        )) : <div className="mx-auto rounded-[18px] bg-white px-5 py-4 text-[15.5px] font-semibold text-neutral-950">{empty}</div>}
        {list.length > 0 && action && (
          <button onClick={onAction} className="mx-auto -mt-1 w-[92%] rotate-[-2deg] rounded-full bg-[#7a1f4a]/80 py-4 text-center text-[16px] font-semibold text-rose-400 ring-1 ring-rose-400/30 backdrop-blur hover:bg-[#7a1f4a]">{action}</button>
        )}
      </div>
    </Scene>
  );
}

const DOT_COLORS = ["#e53935", "#f07b3f", "#e8c547", "#a5e25a", "#6ee7b7", "#22a06b"];
// A line of coloured rings stepping down to zero, as in "See your progress".
export function ProgressScene({ label, points, variant = "sunset", className, children }) {
  const max = Math.max(1, ...points);
  const n = Math.max(points.length - 1, 1);
  const xy = points.map((v, i) => [30 + (i / n) * 340, 40 + (1 - v / max) * 150]);
  return (
    <Scene variant={variant} className={cn("min-h-[340px]", className)}>
      <div className="p-5">
        <div className="rounded-[20px] bg-white px-5 py-4 text-[16px] font-semibold text-neutral-950 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)]">{label}</div>
        <svg viewBox="0 0 400 220" className="mt-3 w-full" aria-hidden="true">
          <polyline points={xy.map((p) => p.join(",")).join(" ")} fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
          {xy.map(([x, y], i) => (
            <g key={i}><circle cx={x} cy={y} r="13" fill="#fff" /><circle cx={x} cy={y} r="9" fill={DOT_COLORS[Math.round((i / n) * (DOT_COLORS.length - 1))]} /><circle cx={x} cy={y} r="4" fill="#fff" /></g>
          ))}
        </svg>
        {children}
      </div>
    </Scene>
  );
}

// A scene with a short call to action, as in "Add a debt to start seeing your progress".
export function SceneCta({ variant = "night", title, sub, cta, onClick, className }) {
  return (
    <Scene variant={variant} className={cn("min-h-[300px]", className)}>
      <div className="flex min-h-[300px] flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 text-white">
        <div className="text-[18px] leading-snug"><b>{title}</b> <span className="text-white/75">{sub}</span></div>
        {cta && <button onClick={onClick} className="mt-4 w-fit rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-neutral-950 hover:bg-neutral-100">{cta}</button>}
      </div>
    </Scene>
  );
}

/* ---------- Picking a look ---------- */

export function ThemePicker({ value, onChange, className }) {
  return (
    <div className={cn("-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-8 pt-2", className)}>
      {Object.entries(THEMES).map(([id, t]) => (
        <button key={id} onClick={() => onChange(id)} className="snap-start shrink-0 text-left">
          <Scene variant={t.scene} glow={value === id} className={cn("h-[300px] w-[230px] rounded-[30px] ring-[3px] transition", value === id ? "ring-blue-500" : "ring-transparent grayscale-[0.85] hover:grayscale-0")} />
          <div className={cn("mt-3 px-1 text-[15px] font-semibold", value === id ? "text-neutral-950" : "text-neutral-400")}>{t.name}</div>
        </button>
      ))}
    </div>
  );
}

/* ---------- A month calendar with a dot on busy days ---------- */

export function MonthCal({ counts = {}, className, dark = false }) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const key = (d) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return (
    <div className={className}>
      <div className={cn("text-[22px] font-bold tracking-tight", dark ? "text-white" : "text-neutral-950")}>{now.toLocaleDateString([], { month: "long", year: "numeric" })}</div>
      <div className={cn("mt-4 grid grid-cols-7 text-center text-[11.5px] font-semibold uppercase tracking-wide", dark ? "text-white/50" : "text-neutral-400")}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}</div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          if (!d) return <span key={`b${i}`} />;
          const c = counts[key(d)] || 0;
          const today = d === now.getDate();
          return (
            <div key={d} className={cn("relative grid aspect-square place-items-center rounded-[14px] text-[15px]",
              today ? (dark ? "bg-white/15 font-bold text-white ring-1 ring-white/40" : "bg-black font-bold text-white") : dark ? "text-white/80" : "bg-neutral-100/70 text-neutral-800")}>
              {d}
              {c > 0 && <span className={cn("absolute bottom-1.5 h-1.5 w-1.5 rounded-full", today ? "bg-blue-300" : "bg-blue-600")} title={`${c} deliveries`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

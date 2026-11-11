// Getting in: pick who you are, sign up your company, join with an invite code, or sign in.
import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bike, Building2, Eye, EyeOff, KeyRound, LayoutGrid, Lock, Mail, Phone, User } from "lucide-react";
import { api, homeFor, useAuth } from "./auth";
import { AdaMark } from "./ui";
import { cn } from "../lib/utils";

const field = "h-14 w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-12 pr-4 text-[16px] text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

// Navy panel with ADA on the left on a laptop, a navy header on a phone; the form sits on white.
function Shell({ title, sub, children, go, back = "/" }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-[radial-gradient(120%_80%_at_20%_0%,#141a5c_0%,#0a0d2e_45%,#05061a_100%)] p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="relative mt-auto">
          <AdaMark size={64} />
          <div className="mt-8 max-w-md text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em]">Every delivery, live for everyone.</div>
          <p className="mt-4 max-w-md text-[16px] text-white/60">The company, every vendor and every rider see the same numbers the same second: given, delivered, left and paid.</p>
        </div>
      </aside>
      <main className="flex min-h-screen flex-col">
        <div className="bg-[radial-gradient(120%_80%_at_20%_0%,#141a5c_0%,#0a0d2e_45%,#05061a_100%)] px-5 pb-14 pt-5 lg:hidden">
          <div className="flex items-center justify-between">
            <button onClick={() => go(back)} className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="-mt-8 flex flex-1 flex-col rounded-t-[36px] bg-white px-5 pb-10 pt-8 lg:mt-0 lg:justify-center lg:rounded-none lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <button onClick={() => go(back)} className="mb-8 hidden items-center gap-2 text-[14px] font-medium text-neutral-500 hover:text-neutral-900 lg:inline-flex"><ArrowLeft className="h-4 w-4" /> Back</button>
            <h1 className="text-[32px] font-extrabold leading-tight tracking-[-0.035em] text-neutral-950 sm:text-[38px]">{title}</h1>
            {sub && <p className="mt-2 text-[16px] text-neutral-500">{sub}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Input({ icon: Icon, label, type = "text", ...rest }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-semibold text-neutral-700">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        <input type={isPass && show ? "text" : type} className={cn(field, isPass && "pr-12")} {...rest} />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-neutral-400" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </span>
    </label>
  );
}

function Submit({ busy, children }) {
  return (
    <button type="submit" disabled={busy} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-neutral-800 to-black text-[17px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] disabled:opacity-60">
      {busy ? <AdaMark size={26} spin /> : <>{children} <ArrowRight className="h-5 w-5" /></>}
    </button>
  );
}

function ErrorNote({ text }) {
  return text ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-[14px] font-medium text-rose-700" role="alert">{text}</div> : null;
}

function useForm(initial) {
  const [f, setF] = useState(initial);
  const bind = (k) => ({ value: f[k] || "", onChange: (e) => setF((x) => ({ ...x, [k]: e.target.value })) });
  return [f, setF, bind];
}

/* ---------- Pick who you are ---------- */

const CHOICES = [
  { id: "company", title: "I run a delivery company", sub: "Manage vendors, riders, stock and every drop", icon: LayoutGrid, to: "/signup/company", tone: "bg-blue-50 text-blue-600" },
  { id: "vendor", title: "I'm a vendor", sub: "Send orders and watch each delivery happen", icon: Building2, to: "/join?as=vendor", tone: "bg-amber-50 text-amber-600" },
  { id: "rider", title: "I'm a rider", sub: "See today's drops and confirm each delivery", icon: Bike, to: "/join?as=rider", tone: "bg-emerald-50 text-emerald-600" },
];

export function GetStarted({ go }) {
  return (
    <Shell go={go} title="Get started" sub="Who are you? Each of you gets your own login and dashboard.">
      <div className="grid gap-3">
        {CHOICES.map((c) => (
          <button key={c.id} onClick={() => go(c.to)} className="group flex items-center gap-4 rounded-[24px] border-2 border-neutral-100 bg-white p-5 text-left transition hover:border-blue-500" data-testid={`role-${c.id}`}>
            <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", c.tone)}><c.icon className="h-7 w-7" /></span>
            <span className="min-w-0 flex-1"><span className="block text-[17px] font-bold text-neutral-950">{c.title}</span><span className="mt-0.5 block text-[14px] text-neutral-500">{c.sub}</span></span>
            <ArrowRight className="h-5 w-5 text-neutral-300 transition group-hover:text-blue-600" />
          </button>
        ))}
      </div>
      <p className="mt-8 text-center text-[15px] text-neutral-500">Already have an account? <button onClick={() => go("/signin")} className="font-semibold text-blue-600">Sign in</button></p>
    </Shell>
  );
}

/* ---------- Sign in ---------- */

export function SignIn({ go }) {
  const { signIn, user } = useAuth();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next");
  const [f, , bind] = useForm({ login: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (user) go(next && next.startsWith("/") ? next : homeFor(user)); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await signIn(f.login, f.password); } catch (err) { setError(err.message); }
    setBusy(false);
  };
  return (
    <Shell go={go} title="Welcome back" sub="Sign in to your dashboard.">
      <form onSubmit={submit} className="grid gap-5">
        <Input icon={Mail} label="Email or phone number" autoComplete="username" placeholder="you@company.com or 0803 000 0000" required {...bind("login")} />
        <Input icon={Lock} label="Password" type="password" autoComplete="current-password" placeholder="Your password" required {...bind("password")} />
        <ErrorNote text={error} />
        <Submit busy={busy}>Sign in</Submit>
      </form>
      <p className="mt-6 text-center text-[14px] text-neutral-500">Forgot your password? Riders and vendors: ask your delivery company for a new invite. Company: ask a teammate to invite you again.</p>
      <p className="mt-6 text-center text-[15px] text-neutral-500">New here? <button onClick={() => go("/get-started")} className="font-semibold text-blue-600">Get started</button></p>
    </Shell>
  );
}

/* ---------- A delivery company signs up ---------- */

export function SignUpCompany({ go }) {
  const { signUpCompany } = useAuth();
  const [f, , bind] = useForm({ company: "", name: "", city: "Lagos", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try { await signUpCompany(f); go("/setup"); } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <Shell go={go} back="/get-started" title="Sign up your company" sub="You'll add your vendors and riders next, and send each of them an invite.">
      <form onSubmit={submit} className="grid gap-5">
        <Input icon={LayoutGrid} label="Company name" placeholder="e.g. Swift Couriers" required {...bind("company")} />
        <Input icon={User} label="Your name" autoComplete="name" placeholder="Full name" required {...bind("name")} />
        <Input icon={Building2} label="City" placeholder="Lagos" {...bind("city")} />
        <Input icon={Mail} label="Email" type="email" autoComplete="email" placeholder="you@company.com" {...bind("email")} />
        <Input icon={Phone} label="Phone (optional)" type="tel" autoComplete="tel" placeholder="0803 000 0000" {...bind("phone")} />
        <Input icon={Lock} label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} required {...bind("password")} />
        <ErrorNote text={error} />
        <Submit busy={busy}>Create account</Submit>
      </form>
      <p className="mt-6 text-center text-[15px] text-neutral-500">Already have an account? <button onClick={() => go("/signin")} className="font-semibold text-blue-600">Sign in</button></p>
    </Shell>
  );
}

/* ---------- A vendor or rider joins with their invite code ---------- */

export function Join({ go }) {
  const { join } = useAuth();
  const params = useParams();
  const location = useLocation();
  const as = new URLSearchParams(location.search).get("as");
  const [code, setCode] = useState((params.code || "").toUpperCase());
  const [invite, setInvite] = useState(null);
  const [f, setF, bind] = useForm({ name: "", phone: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const check = async (c = code) => {
    setBusy(true); setError("");
    try {
      const inv = await api(`/api/invites/${encodeURIComponent(c.trim().toUpperCase())}`);
      setInvite(inv);
      setF((x) => ({ ...x, name: x.name || inv.name || "" }));
    } catch (err) { setError(err.message); }
    setBusy(false);
  };
  useEffect(() => { if (params.code) check(params.code); }, [params.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const me = await join({ code, ...f });
      go(homeFor(me ? me.user : { role: invite.role }));
    } catch (err) { setError(err.message); setBusy(false); }
  };
  const roleWord = (invite && invite.role) || as || "";
  const label = roleWord === "rider" ? "rider" : roleWord === "vendor" ? "vendor" : roleWord === "company" ? "teammate" : "";

  if (!invite) {
    return (
      <Shell go={go} back="/get-started" title={label ? `Join as a ${label}` : "Join your company"} sub="Enter the invite code your delivery company sent you.">
        <form onSubmit={(e) => { e.preventDefault(); check(); }} className="grid gap-5">
          <Input icon={KeyRound} label="Invite code" placeholder="e.g. K7Q2XM" autoCapitalize="characters" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={cn(field, "font-mono text-[20px] tracking-[0.3em]")} />
          <ErrorNote text={error} />
          <Submit busy={busy}>Continue</Submit>
        </form>
        <p className="mt-6 text-center text-[14px] text-neutral-500">No code yet? Your delivery company creates it in their dashboard under Team.</p>
        <p className="mt-4 text-center text-[15px] text-neutral-500">Already have an account? <button onClick={() => go("/signin")} className="font-semibold text-blue-600">Sign in</button></p>
      </Shell>
    );
  }
  return (
    <Shell go={go} back="/get-started" title={`Join ${invite.company}`} sub={`You're joining as ${invite.role === "company" ? "part of the office team" : `a ${label}`}${invite.name ? `: ${invite.name}` : ""}. Create your login.`}>
      <form onSubmit={submit} className="grid gap-5">
        <Input icon={User} label="Your name" autoComplete="name" required {...bind("name")} />
        <Input icon={Phone} label="Phone number" type="tel" autoComplete="tel" placeholder="0803 000 0000" {...bind("phone")} />
        <Input icon={Mail} label="Email (optional)" type="email" autoComplete="email" placeholder="you@example.com" {...bind("email")} />
        <Input icon={Lock} label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters" minLength={8} required {...bind("password")} />
        <p className="-mt-2 text-[13px] text-neutral-500">You'll sign in with your phone number or email and this password.</p>
        <ErrorNote text={error} />
        <Submit busy={busy}>Join and open my dashboard</Submit>
      </form>
    </Shell>
  );
}

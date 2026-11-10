// Your account: name and sign-in details, password, phone notifications, installing the app, signing out.
import React, { useEffect, useState } from "react";
import { ArrowLeft, Bell, LogOut, RotateCcw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { api, homeFor, useAuth } from "./auth";
import { askForNotifications } from "./alerts";
import { useWorkspace } from "./store";
import { Avatar, Btn, Card, CardHead, Field, inputCls, Logo } from "./ui";
import { themeOf, ThemePicker } from "./scenes";

const ROLE = { company: "Company", vendor: "Vendor", rider: "Rider" };

export default function Account({ go }) {
  const { user, company, signOut, updateProfile } = useAuth();
  const { state, act, resetDemo } = useWorkspace();
  const [f, setF] = useState({ name: user.name, email: user.email || "", phone: user.phone || "" });
  const [pw, setPw] = useState({ current: "", new: "" });
  const [notif, setNotif] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const install = useInstallPrompt();
  const theme = themeOf(state.company.theme);

  const save = async (e) => {
    e.preventDefault();
    try { await updateProfile(f); toast.success("Saved"); } catch (err) { toast.error(err.message); }
  };
  const changePassword = async (e) => {
    e.preventDefault();
    try { await api("/api/auth/password", { method: "POST", body: pw }); setPw({ current: "", new: "" }); toast.success("Password changed. Other devices were signed out."); } catch (err) { toast.error(err.message); }
  };
  const out = async () => { await signOut(); go("/"); };

  return (
    <div className="min-h-screen bg-white">
      <header className={`${theme.header} px-5 pb-16 pt-6 text-white sm:px-10`}>
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button onClick={() => go(homeFor(user))} className="grid h-11 w-11 place-items-center rounded-full bg-white/10" aria-label="Back to dashboard"><ArrowLeft className="h-5 w-5" /></button>
          <Logo dark />
        </div>
        <div className="mx-auto mt-8 flex max-w-3xl items-center gap-4">
          <Avatar name={user.name} size={64} color="#2b47f0" className="ring-2 ring-white/30" />
          <div>
            <h1 className="text-[32px] font-extrabold leading-tight tracking-[-0.03em]">{user.name}</h1>
            <div className="text-[15px] text-white/60">{ROLE[user.role]} · {company}</div>
          </div>
        </div>
      </header>
      <main className="relative -mt-10 rounded-t-[40px] bg-white px-4 pb-20 pt-8 sm:px-10">
        <div className="mx-auto grid max-w-3xl gap-5">
          {user.demo && (
            <Card className="p-5">
              <div className="text-[16px] font-bold text-neutral-950">You're in the demo</div>
              <p className="mt-1 text-[14px] text-neutral-500">Everyone trying the demo shares this sample data. Sign up to get your own company.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn onClick={async () => { await signOut(); go("/signup/company"); }}>Sign up your company</Btn>
                {user.role === "company" && <Btn variant="ghost" onClick={async () => { if (window.confirm("Put the demo back to its sample data for everyone?")) { await resetDemo(); toast.success("Demo reset"); } }}><RotateCcw className="h-4 w-4" /> Reset demo data</Btn>}
              </div>
            </Card>
          )}
          {!user.demo && (
            <Card>
              <CardHead title="Your details" sub="You sign in with your email or phone." />
              <form onSubmit={save} className="grid gap-3 p-5">
                <Field label="Name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email"><input className={inputCls} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
                  <Field label="Phone"><input className={inputCls} type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
                </div>
                <Btn type="submit" className="w-fit">Save</Btn>
              </form>
            </Card>
          )}
          {!user.demo && (
            <Card>
              <CardHead title="Password" />
              <form onSubmit={changePassword} className="grid gap-3 p-5 sm:grid-cols-2">
                <Field label="Current password"><input className={inputCls} type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required /></Field>
                <Field label="New password"><input className={inputCls} type="password" autoComplete="new-password" minLength={8} value={pw.new} onChange={(e) => setPw({ ...pw, new: e.target.value })} required /></Field>
                <Btn type="submit" className="w-fit">Change password</Btn>
              </form>
            </Card>
          )}
          {user.role === "company" && (
            <Card data-testid="pick-a-look">
              <CardHead title="Pick a look" sub="Colours this dashboard and your riders' app, for everyone in your company." />
              <div className="p-5"><ThemePicker value={state.company.theme || "night"} onChange={(id) => { act({ type: "company/update", patch: { theme: id } }); toast.success("Look changed"); }} /></div>
            </Card>
          )}
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Bell className="h-6 w-6" /></span>
              <div className="flex-1">
                <div className="text-[16px] font-bold text-neutral-950">Phone notifications</div>
                <p className="mt-1 text-[14px] text-neutral-500">{notif === "granted" ? "On. You'll get an alert for new drops, deliveries and messages when the app is in the background." : notif === "denied" ? "Blocked in your browser settings for this site." : notif === "unsupported" ? "This browser doesn't support notifications. Add the app to your home screen first." : "Get an alert for new drops, deliveries and messages."}</p>
                {notif === "default" && <Btn size="sm" className="mt-3" onClick={async () => { askForNotifications(); setTimeout(() => setNotif(Notification.permission), 1500); }}>Turn on</Btn>}
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-neutral-100 text-neutral-800"><Smartphone className="h-6 w-6" /></span>
              <div className="flex-1">
                <div className="text-[16px] font-bold text-neutral-950">Put Delivery on your home screen</div>
                <p className="mt-1 text-[14px] text-neutral-500">It opens full screen like any other app. On iPhone: tap Share, then <b>Add to Home Screen</b>. On Android: tap the menu, then <b>Install app</b>.</p>
                {install && <Btn size="sm" className="mt-3" onClick={install}>Install now</Btn>}
              </div>
            </div>
          </Card>
          <Btn variant="ghost" size="lg" onClick={out} className="w-full" data-testid="sign-out"><LogOut className="h-5 w-5" /> Sign out</Btn>
        </div>
      </main>
    </div>
  );
}

// Android/desktop Chrome offer an install prompt; iPhone uses Share > Add to Home Screen.
function useInstallPrompt() {
  const [evt, setEvt] = useState(() => window.__installPrompt || null);
  useEffect(() => {
    const on = (e) => { e.preventDefault(); window.__installPrompt = e; setEvt(e); };
    window.addEventListener("beforeinstallprompt", on);
    return () => window.removeEventListener("beforeinstallprompt", on);
  }, []);
  if (!evt) return null;
  return async () => { evt.prompt(); try { await evt.userChoice; } catch (e) { /* closed */ } window.__installPrompt = null; setEvt(null); };
}

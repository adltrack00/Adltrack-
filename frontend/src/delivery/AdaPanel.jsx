// ADA in a side panel: the company types (or picks a suggestion), ADA answers or shows a plan to approve.
import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUp, Check, ChevronLeft, MessageSquare, Mic, PackagePlus, Route, Sparkles } from "lucide-react";
import { applyPlan, askAda, SUGGESTIONS } from "./ada";
import { looksLikeOrders, readOrders, toOrder } from "./intake";
import { IntakeReview } from "./Intake";
import { useWorkspace } from "./store";
import { Avatar, Btn, Tag } from "./ui";
import { money, time12 } from "./utils";

export function AdaPanel({ open, onClose, seed, onSeedUsed }) {
  const { state, act } = useWorkspace();
  const [turns, setTurns] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const body = useRef(null);
  const input = useRef(null);

  const send = async (said) => {
    const words = String(said || "").trim();
    if (!words || busy) return;
    const next = [...turns, { role: "user", text: words }];
    setTurns(next);
    setText("");
    // A pasted WhatsApp message with orders: read them and let the person check each one.
    if (looksLikeOrders(words)) {
      const orders = readOrders(state, words);
      if (orders.length) {
        setTurns((cur) => [...cur, { role: "assistant", text: "Here's what I read from that message. Fix anything in red, then add them.", intake: orders, state: "ready" }]);
        return;
      }
    }
    setBusy(true);
    const answer = await askAda(state, next.map((t) => ({ role: t.role, text: t.text })));
    setBusy(false);
    setTurns((cur) => [...cur, { role: "assistant", text: answer.reply, plan: answer.plan || null, state: answer.plan ? "ready" : null }]);
  };

  useEffect(() => {
    if (open && seed) { send(seed); onSeedUsed && onSeedUsed(); }
    if (open) setTimeout(() => input.current && input.current.focus(), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seed]);

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [turns, busy]);

  const setPlanState = (i, value) => setTurns((cur) => cur.map((t, n) => (n === i ? { ...t, state: value } : t)));
  const editPlan = (i, fn) => setTurns((cur) => cur.map((t, n) => (n === i ? { ...t, plan: fn(t.plan) } : t)));

  const approve = (i) => {
    applyPlan(act, turns[i].plan);
    setPlanState(i, "done");
  };

  // Speak instead of typing, where the browser can listen.
  const [listening, setListening] = useState(false);
  const SpeechRec = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const listen = () => {
    if (!SpeechRec || listening) { if (input.current) input.current.focus(); return; }
    const rec = new SpeechRec();
    rec.lang = "en-NG";
    rec.interimResults = false;
    rec.onresult = (e) => { const said = Array.from(e.results).map((r) => r[0].transcript).join(" "); setText(said); };
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-[radial-gradient(120%_70%_at_0%_0%,#16206a_0%,#0a0f3a_40%,#050716_100%)] text-white shadow-[-20px_0_60px_rgba(0,0,0,0.4)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!open}>
        <header className="grid grid-cols-[44px_1fr_44px] items-center px-4 pb-2 pt-5">
          <button onClick={onClose} className="grid h-11 w-11 place-items-center text-white/80 hover:text-white" aria-label="Close ADA"><ChevronLeft className="h-7 w-7" strokeWidth={1.8} /></button>
          <div className="text-center text-[17px] font-semibold tracking-tight text-white/90">ADA</div>
          <span className="grid h-11 w-11 place-items-center"><Sparkles className="h-6 w-6 text-white/80" /></span>
        </header>

        <div ref={body} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {!turns.length && (
            <div className="pt-8">
              <h2 className="text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em] text-white/80">Ask me anything about your deliveries..</h2>
              <div className="mt-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-white/40">Examples:</div>
              <div className="mt-3 flex flex-col items-start gap-3">
                {SUGGESTIONS.map(([title, , say]) => (
                  <button key={title} onClick={() => send(say)} className="rounded-full bg-white/[0.12] px-5 py-3 text-left text-[15.5px] leading-snug text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.18]">“{say}”</button>
                ))}
                <button onClick={() => setText("Name: Femi Bello\nPhone: 08025559911\nAddress: 4 Isaac John Street, Ikeja GRA\nItem: 1 power bank\nAmount: 22k")} className="rounded-full bg-white/[0.12] px-5 py-3 text-left text-[15.5px] text-white/80 ring-1 ring-white/10 hover:bg-white/[0.18]">“Paste a vendor's WhatsApp orders”</button>
              </div>
            </div>
          )}

          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-[26px] bg-[#1b3a8f] px-5 py-3 text-[15.5px] leading-snug text-white">{t.text}</div>
            ) : (
              <div key={i} className="space-y-3">
                <div className="w-fit max-w-[92%] rounded-[24px] bg-white/[0.1] px-5 py-3.5 text-[15.5px] leading-relaxed text-white/90 ring-1 ring-white/10">{t.text}</div>
                {t.intake && t.state === "ready" && (
                  <div className="rounded-[28px] bg-white p-3 text-neutral-900">
                    <IntakeReview
                      orders={t.intake}
                      setOrders={(list) => setTurns((cur) => cur.map((x, n) => (n === i ? { ...x, intake: list } : x)))}
                      onSave={() => {
                        const list = t.intake.map(toOrder);
                        act({ type: "order/add", orders: list });
                        const ready = list.filter((o) => o.status === "open").length;
                        setTurns((cur) => [...cur.map((x, n) => (n === i ? { ...x, state: "done" } : x)), { role: "assistant", text: `Added ${list.length} ${list.length === 1 ? "order" : "orders"}. ${ready} ready for a rider${list.length - ready ? `, ${list.length - ready} kept aside under "Today" until they're fixed` : ""}.`, offer: ready ? "Dispatch today's orders" : null }]);
                      }}
                    />
                  </div>
                )}
                {t.intake && t.state === "done" && <div className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-300"><Check className="h-4 w-4" /> {t.intake.length} orders added</div>}
                {t.offer && i === turns.length - 1 && <button onClick={() => send(t.offer)} className="rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-neutral-950">Dispatch them now</button>}
                {t.plan && <PlanCard plan={t.plan} state={t.state} onApprove={() => approve(i)} onDiscard={() => setPlanState(i, "discarded")} onEdit={(fn) => editPlan(i, fn)} />}
              </div>
            ),
          )}
          {busy && (
            <div className="flex w-fit gap-1.5 rounded-full bg-white/[0.08] px-5 py-3.5 ring-1 ring-white/10">
              {[0, 1, 2].map((n) => <span key={n} className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: `${n * 0.12}s` }} />)}
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-3 px-5 pb-6 pt-2">
          <div className="flex min-h-[64px] flex-1 items-end gap-2 rounded-[32px] bg-white/[0.1] py-2 pl-5 pr-2 shadow-[0_8px_30px_-6px_rgba(61,92,255,0.45)] ring-1 ring-white/15">
            <textarea
              ref={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
              rows={1}
              placeholder={listening ? "Listening…" : "e.g. GlowSkin dropped 40 serums"}
              className="max-h-36 min-h-[48px] flex-1 resize-none bg-transparent py-3 text-[16px] text-white outline-none placeholder:text-white/45"
            />
            <button type="submit" disabled={!text.trim() || busy} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 text-white disabled:opacity-60" aria-label="Send">{text.trim() ? <ArrowUp className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}</button>
          </div>
          <button type="button" onClick={listen} className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${listening ? "ada-orb shadow-[0_0_30px_rgba(120,120,255,0.8)]" : "bg-white/[0.12] ring-1 ring-white/10"}`} aria-label="Speak to ADA"><Mic className="h-6 w-6" /></button>
        </form>
      </aside>
    </>
  );
}

// The plan ADA wants to carry out. Nothing is saved until Approve.
function PlanCard({ plan, state: planState, onApprove, onDiscard, onEdit }) {
  const { state } = useWorkspace();
  const done = planState === "done";
  const dropped = planState === "discarded";
  const rider = (id) => state.riders.find((r) => r.id === id) || {};
  const vendor = (id) => state.vendors.find((v) => v.id === id) || {};
  const total = plan.deliveries.reduce((s, d) => s + d.value, 0);

  return (
    <div className={`overflow-hidden rounded-[28px] border bg-white text-neutral-900 ${done ? "border-emerald-200" : "border-neutral-200"} ${dropped ? "opacity-50" : ""}`}>
      <div className={`flex items-center justify-between px-4 py-2.5 ${done ? "bg-emerald-50" : "bg-neutral-50"}`}>
        <Tag className={done ? "text-emerald-700" : "text-neutral-500"}>{done ? "Approved · sent" : dropped ? "Discarded" : "Ready to approve"}</Tag>
        {done && <Check className="h-4 w-4 text-emerald-600" />}
      </div>

      {!!plan.stock.length && (
        <section className="border-t border-neutral-100 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-neutral-700"><PackagePlus className="h-3.5 w-3.5" /> Stock in</div>
          {plan.stock.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-[13px]">
              <span className="text-neutral-800">+{s.qty} {s.name} <span className="text-neutral-400">· {vendor(s.vendorId).name}</span>{s.isNew && <span className="ml-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-blue-600">NEW</span>}</span>
              <span className="font-mono text-[12px] text-neutral-500">{money(s.price)}</span>
            </div>
          ))}
        </section>
      )}

      {!!plan.deliveries.length && (
        <section className="border-t border-neutral-100 px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-[12.5px] font-semibold text-neutral-700">
            <span className="flex items-center gap-1.5"><Route className="h-3.5 w-3.5" /> {plan.deliveries.length} deliveries</span>
            <span className="font-mono text-[12px] text-neutral-500">{money(total)} to collect</span>
          </div>
          <div className="space-y-2">
            {plan.deliveries.map((d, i) => (
              <div key={i} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-neutral-900">{d.customer || "No name yet"}</div>
                    <div className="truncate text-[12px] text-neutral-500">{d.address}{d.time ? ` · by ${time12(d.time)}` : ""}</div>
                    <div className="mt-1 text-[12px] text-neutral-700">{d.items.map((l) => (l.qty ? `${l.qty} × ${l.name}${l.free ? ` + ${l.free} free` : ""}` : `${l.free} free ${l.name}`)).join(", ")}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[12px] text-neutral-700">{money(d.value)}</div>
                    <div className="text-[11px] text-neutral-400">{vendor(d.vendorId).name}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Avatar name={rider(d.riderId).name} color={rider(d.riderId).color} size={22} />
                  <select
                    disabled={done || dropped}
                    value={d.riderId}
                    onChange={(e) => onEdit((p) => ({ ...p, deliveries: p.deliveries.map((x, n) => (n === i ? { ...x, riderId: e.target.value } : x)) }))}
                    className="h-7 rounded-lg border border-neutral-200 bg-white px-2 text-[12.5px] font-medium text-neutral-800"
                  >
                    {state.riders.map((r) => <option key={r.id} value={r.id}>{r.short} · {r.zone}{r.online ? "" : " (off)"}</option>)}
                  </select>
                  <span className="text-[11.5px] text-neutral-400">{d.units} {d.units === 1 ? "unit" : "units"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!plan.messages.length && (
        <section className="border-t border-neutral-100 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-neutral-700"><MessageSquare className="h-3.5 w-3.5" /> Messages to riders</div>
          {plan.messages.map((m, i) => (
            <div key={i} className="mb-1.5 flex gap-2 text-[12.5px]">
              <span className="w-14 shrink-0 font-semibold text-neutral-800">{rider(m.riderId).short}</span>
              <span className="line-clamp-2 whitespace-pre-line text-neutral-600">{m.text}</span>
            </div>
          ))}
        </section>
      )}

      {!!plan.warnings.length && (
        <section className="border-t border-amber-100 bg-amber-50/70 px-4 py-3">
          {plan.warnings.map((w, i) => (
            <div key={i} className="flex gap-2 py-0.5 text-[12.5px] leading-snug text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}</div>
          ))}
        </section>
      )}

      {!done && !dropped && (
        <div className="flex gap-2 border-t border-neutral-100 p-3">
          <Btn className="flex-1" onClick={onApprove}><Check className="h-4 w-4" /> Approve &amp; send</Btn>
          <Btn variant="ghost" onClick={onDiscard}>Discard</Btn>
        </div>
      )}
    </div>
  );
}

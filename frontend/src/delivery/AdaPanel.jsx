// ADA in a side panel: the company types (or picks a suggestion), ADA answers or shows a plan to approve.
import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUp, Check, MessageSquare, PackagePlus, Route, X } from "lucide-react";
import { applyPlan, askAda, SUGGESTIONS } from "./ada";
import { looksLikeOrders, readOrders, toOrder } from "./intake";
import { IntakeReview } from "./Intake";
import { useWorkspace } from "./store";
import { AdaMark, Avatar, Btn, Tag } from "./ui";
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

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-stone-900/20 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-stone-200 bg-[#fbfaf8] shadow-[-12px_0_40px_rgba(20,20,20,0.08)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} aria-hidden={!open}>
        <header className="flex items-center gap-3 border-b border-stone-200/80 bg-white px-5 py-4">
          <AdaMark size={40} />
          <div className="flex-1">
            <div className="text-[15px] font-bold tracking-tight text-stone-900">ADA</div>
            <div className="flex items-center gap-1.5 text-[12px] text-stone-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Dispatch assistant · online</div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200" aria-label="Close ADA"><X className="h-4 w-4" /></button>
        </header>

        <div ref={body} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {!turns.length && (
            <div>
              <h2 className="text-[26px] font-bold leading-tight tracking-tight text-stone-900">Hi {state.company.dispatcher}, tell me what came in.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-stone-600">Say what a vendor dropped off and what has to go out. I'll add the stock, give each rider their drops within their daily allocation, work out what to collect and message them. You check it and tap Approve.</p>
              <ol className="mt-5 grid gap-2.5">
                {SUGGESTIONS.map(([title, sub, say], n) => (
                  <li key={title}>
                    <button onClick={() => send(say)} className="group flex w-full items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-3.5 text-left transition hover:border-stone-300 hover:shadow-sm">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-50 font-mono text-[11px] font-semibold text-orange-600">{String(n + 1).padStart(2, "0")}</span>
                      <span>
                        <span className="block text-[14px] font-semibold text-stone-900">{title}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-stone-500">{sub}</span>
                        <span className="mt-1.5 block text-[12.5px] italic text-stone-700">“{say}”</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-[18px] rounded-br-md bg-stone-900 px-4 py-2.5 text-[14px] leading-snug text-white">{t.text}</div>
            ) : (
              <div key={i} className="space-y-2.5">
                <Tag>ADA</Tag>
                <p className="text-[14px] leading-relaxed text-stone-800">{t.text}</p>
                {t.intake && t.state === "ready" && (
                  <IntakeReview
                    orders={t.intake}
                    setOrders={(list) => setTurns((cur) => cur.map((x, n) => (n === i ? { ...x, intake: list } : x)))}
                    onSave={() => {
                      const list = t.intake.map(toOrder);
                      act({ type: "order/add", orders: list });
                      const ready = list.filter((o) => o.status === "open").length;
                      setTurns((cur) => [...cur.map((x, n) => (n === i ? { ...x, state: "done" } : x)), { role: "assistant", text: `Added ${list.length} ${list.length === 1 ? "order" : "orders"}. ${ready} ready for a rider${list.length - ready ? `, ${list.length - ready} kept aside under "Needs you" until they're fixed` : ""}.`, offer: ready ? "Dispatch today's orders" : null }]);
                    }}
                  />
                )}
                {t.intake && t.state === "done" && <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700"><Check className="h-3.5 w-3.5" /> {t.intake.length} orders added</div>}
                {t.offer && i === turns.length - 1 && <Btn variant="orange" onClick={() => send(t.offer)}>Dispatch them now</Btn>}
                {t.plan && <PlanCard plan={t.plan} state={t.state} onApprove={() => approve(i)} onDiscard={() => setPlanState(i, "discarded")} onEdit={(fn) => editPlan(i, fn)} />}
              </div>
            ),
          )}
          {busy && (
            <div className="flex gap-1.5 py-2">
              {[0, 1, 2].map((n) => <span key={n} className="h-2 w-2 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: `${n * 0.12}s` }} />)}
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2 border-t border-stone-200/80 bg-white p-3">
          <textarea
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
            rows={1}
            placeholder="e.g. Kicks Plug brought 20 sneakers. Send out today's orders."
            className="max-h-32 min-h-[46px] flex-1 resize-none rounded-[22px] border border-stone-200 bg-stone-50 px-4 py-3 text-[14px] text-stone-900 outline-none focus:border-stone-300 focus:bg-white"
          />
          <button type="submit" disabled={!text.trim() || busy} className="grid h-[46px] w-[46px] place-items-center rounded-full bg-stone-900 text-white disabled:bg-stone-300" aria-label="Send"><ArrowUp className="h-5 w-5" /></button>
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
    <div className={`overflow-hidden rounded-2xl border bg-white ${done ? "border-emerald-200" : "border-stone-200"} ${dropped ? "opacity-50" : ""}`}>
      <div className={`flex items-center justify-between px-4 py-2.5 ${done ? "bg-emerald-50" : "bg-stone-50"}`}>
        <Tag className={done ? "text-emerald-700" : "text-stone-500"}>{done ? "Approved · sent" : dropped ? "Discarded" : "Ready to approve"}</Tag>
        {done && <Check className="h-4 w-4 text-emerald-600" />}
      </div>

      {!!plan.stock.length && (
        <section className="border-t border-stone-100 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-stone-700"><PackagePlus className="h-3.5 w-3.5" /> Stock in</div>
          {plan.stock.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-[13px]">
              <span className="text-stone-800">+{s.qty} {s.name} <span className="text-stone-400">· {vendor(s.vendorId).name}</span>{s.isNew && <span className="ml-1 rounded bg-orange-50 px-1.5 py-0.5 text-[10.5px] font-semibold text-orange-600">NEW</span>}</span>
              <span className="font-mono text-[12px] text-stone-500">{money(s.price)}</span>
            </div>
          ))}
        </section>
      )}

      {!!plan.deliveries.length && (
        <section className="border-t border-stone-100 px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-[12.5px] font-semibold text-stone-700">
            <span className="flex items-center gap-1.5"><Route className="h-3.5 w-3.5" /> {plan.deliveries.length} deliveries</span>
            <span className="font-mono text-[12px] text-stone-500">{money(total)} to collect</span>
          </div>
          <div className="space-y-2">
            {plan.deliveries.map((d, i) => (
              <div key={i} className="rounded-xl border border-stone-100 bg-stone-50/60 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-stone-900">{d.customer || "No name yet"}</div>
                    <div className="truncate text-[12px] text-stone-500">{d.address}{d.time ? ` · by ${time12(d.time)}` : ""}</div>
                    <div className="mt-1 text-[12px] text-stone-700">{d.items.map((l) => (l.qty ? `${l.qty} × ${l.name}${l.free ? ` + ${l.free} free` : ""}` : `${l.free} free ${l.name}`)).join(", ")}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[12px] text-stone-700">{money(d.value)}</div>
                    <div className="text-[11px] text-stone-400">{vendor(d.vendorId).name}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Avatar name={rider(d.riderId).name} color={rider(d.riderId).color} size={22} />
                  <select
                    disabled={done || dropped}
                    value={d.riderId}
                    onChange={(e) => onEdit((p) => ({ ...p, deliveries: p.deliveries.map((x, n) => (n === i ? { ...x, riderId: e.target.value } : x)) }))}
                    className="h-7 rounded-lg border border-stone-200 bg-white px-2 text-[12.5px] font-medium text-stone-800"
                  >
                    {state.riders.map((r) => <option key={r.id} value={r.id}>{r.short} · {r.zone}{r.online ? "" : " (off)"}</option>)}
                  </select>
                  <span className="text-[11.5px] text-stone-400">{d.units} {d.units === 1 ? "unit" : "units"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!plan.messages.length && (
        <section className="border-t border-stone-100 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-stone-700"><MessageSquare className="h-3.5 w-3.5" /> Messages to riders</div>
          {plan.messages.map((m, i) => (
            <div key={i} className="mb-1.5 flex gap-2 text-[12.5px]">
              <span className="w-14 shrink-0 font-semibold text-stone-800">{rider(m.riderId).short}</span>
              <span className="line-clamp-2 whitespace-pre-line text-stone-600">{m.text}</span>
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
        <div className="flex gap-2 border-t border-stone-100 p-3">
          <Btn className="flex-1" onClick={onApprove}><Check className="h-4 w-4" /> Approve &amp; send</Btn>
          <Btn variant="ghost" onClick={onDiscard}>Discard</Btn>
        </div>
      )}
    </div>
  );
}

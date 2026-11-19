"""ADA speaks first. Every few minutes the server looks at each company's day and sends the follow-ups a good
dispatcher would, on WhatsApp, each one only once:

  Riders   drops not answered after 20 minutes · no news on a drop for 3 hours · cash still held after 6 pm
  Office   a rider still silent after 45 minutes (with who could take it) · drops turned down · a delivery that
           failed · the morning brief at 8 · the evening wrap at 7

Riders hear nothing before 7 am or after 9 pm. What was sent is kept in the workspace under waNudges, so a restart
doesn't send it twice. Turn them off in WhatsApp settings (notify.nudges, notify.staffBriefs).
"""
import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import auth
import office
import whatsapp as W
import workspace
from db import db

log = logging.getLogger("whatsapp")

OFFER_NUDGE = timedelta(minutes=20)
OFFER_ESCALATE = timedelta(minutes=45)
OFFER_CALL = timedelta(minutes=35)  # with notify.calls on: ring the rider before telling the office
QUIET_DROP = timedelta(hours=3)


def when(iso: Optional[str]) -> Optional[datetime]:
    if not iso:
        return None
    try:
        d = datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def offered_at(st, t) -> Optional[datetime]:
    """When the rider was sent this drop: the run sheet's time, else when it was made."""
    sent = [when(m.get("at")) for m in st.get("messages", []) if m.get("kind") == "drop" and t.get("id") in (m.get("taskIds") or []) and m.get("riderId") == t.get("riderId")]
    sent = [s for s in sent if s]
    if sent:
        return max(sent)
    hist = [when(h.get("at")) for h in (t.get("history") or []) if h.get("status") == "assigned"]
    hist = [h for h in hist if h]
    return max(hist) if hist else None


def last_news(t) -> Optional[datetime]:
    stamps = [when(h.get("at")) for h in (t.get("history") or [])] + [when(t.get("arrivedAt")), when(t.get("acceptedAt"))]
    stamps = [s for s in stamps if s]
    return max(stamps) if stamps else None


def nudge_settings(st) -> Dict[str, bool]:
    n = ((st.get("company") or {}).get("whatsapp") or {}).get("notify") or {}
    return {"nudges": n.get("nudges", True), "staffBriefs": n.get("staffBriefs", True), "calls": n.get("calls", False)}


def due(st, staff: List[Dict[str, Any]], now: datetime) -> List[Dict[str, Any]]:
    """The follow-ups to send now. Marks each in st["waNudges"] so it goes once."""
    sent = st.setdefault("waNudges", {})
    local = now.astimezone(W.TZ)
    today = local.date().isoformat()
    rider_hours = 7 <= local.hour < 21
    cfg = nudge_settings(st)
    out: List[Dict[str, Any]] = []

    def once(key: str) -> bool:
        if key in sent:
            return False
        sent[key] = now.isoformat()
        return True

    def to_staff(key: str, text: str, buttons=None) -> None:
        for s in staff:
            if once(f"{key}:{s['id']}"):
                out.append(W.office_message(f"staff:{s['id']}", text, kind="nudge", buttons=buttons))

    tasks = [t for t in st.get("tasks", []) if t.get("date") == today]
    room = office.rider_room(st)

    if cfg["nudges"]:
        # Drops a rider hasn't said yes or no to.
        by_rider: Dict[str, List] = {}
        for t in tasks:
            if t.get("status") == "assigned" and not t.get("acceptedAt") and not t.get("declined") and t.get("riderId"):
                by_rider.setdefault(t["riderId"], []).append(t)
        for rid, ts in by_rider.items():
            at = max((offered_at(st, t) for t in ts if offered_at(st, t)), default=None)
            if not at:
                continue
            r = W.person(st, f"rider:{rid}") or {}
            batch = at.strftime("%H%M")
            if rider_hours and now - at >= OFFER_NUDGE and once(f"offer:{rid}:{today}:{batch}"):
                out.append(W.office_message(f"rider:{rid}", f"Hi {r.get('first', '')}, are you taking the {len(ts)} {'drop' if len(ts) == 1 else 'drops'} I sent at {W.clock(at.isoformat())}? Reply YES or NO so the office can plan.",
                                            kind="nudge", buttons=W.ACCEPT_BUTTONS))
            if cfg["calls"] and rider_hours and now - at >= OFFER_CALL and once(f"call:{rid}:{today}:{batch}"):
                import calls

                company = (st.get("company") or {}).get("name") or "the office"
                calls.queue(st, f"rider:{rid}", f"Hello {r.get('first', '')}, this is ADA from {company}. You have {len(ts)} new {'drop' if len(ts) == 1 else 'drops'} waiting since "
                            f"{W.clock(at.isoformat())}. Say yes to take them, or no if you can't.", why="No answer to new drops on WhatsApp")
            if staff and now - at >= OFFER_ESCALATE:
                need = sum(W.units(t) for t in ts)
                others = sorted([x for x in st.get("riders", []) if x.get("id") != rid and x.get("online") and room.get(x["id"], 0) >= need], key=lambda x: -room.get(x["id"], 0))
                hint = f" Reply MOVE {ts[0].get('ref')} TO {(others[0].get('short') or others[0]['name']).upper()} to give it to someone else." if others else ""
                to_staff(f"silent:{rid}:{today}:{batch}", f"⏳ {r.get('first', 'A rider')} hasn't answered {len(ts)} {'drop' if len(ts) == 1 else 'drops'} sent at {W.clock(at.isoformat())} ({', '.join(t.get('ref', '') for t in ts[:4])}).{hint}")

        # Out on the road with no news for a while.
        for t in tasks:
            if t.get("status") == "picked_up" and rider_hours:
                news = last_news(t)
                if news and now - news >= QUIET_DROP and once(f"quiet:{t['id']}"):
                    out.append(W.office_message(f"rider:{t['riderId']}", f"How is it going with {t.get('customer')} ({t.get('ref')})? Reply DELIVERED with the amount, or PROBLEM if it can't go.",
                                                kind="nudge", buttons=[{"id": "DELIVERED", "title": "Delivered"}, {"id": "PROBLEM", "title": "Problem"}]))

        # Cash still with riders in the evening.
        if 18 <= local.hour < 21:
            held: Dict[str, int] = {}
            for t in st.get("tasks", []):
                if W.cash_held(t) and t.get("riderId"):
                    held[t["riderId"]] = held.get(t["riderId"], 0) + W.cash_held(t)
            for rid, amount in held.items():
                if once(f"cash:{rid}:{today}"):
                    r = W.person(st, f"rider:{rid}") or {}
                    out.append(W.office_message(f"rider:{rid}", f"Hi {r.get('first', '')}, you're holding {W.money(amount)} cash. Please pay it into the company account today and reply PAID IN with the transfer ref.", kind="nudge"))

    if staff:
        # Problems the office should hear about straight away.
        for t in st.get("tasks", []):
            r = (W.person(st, f"rider:{t.get('riderId')}") or {}).get("first") or "A rider"
            if t.get("status") == "assigned" and t.get("declined"):
                why = ", ".join((t["declined"].get("reasons") or [])) or t["declined"].get("note") or "no reason given"
                to_staff(f"declined:{t['id']}:{t['declined'].get('at', '')}", f"🙅 {r} can't take {t.get('ref')} ({t.get('customer')}): {why}. Reply MOVE {t.get('ref')} TO and a rider's name.")
            if t.get("status") == "failed" and not t.get("handled") and t.get("date") == today:
                to_staff(f"failed:{t['id']}", f"⚠️ {t.get('ref')} to {t.get('customer')} wasn't delivered: {t.get('failReason') or 'no reason given'}. Rider: {r}. Reply {t.get('ref')} for details.")

        if cfg["staffBriefs"]:
            busy = tasks or any(o.get("status") in ("open", "needs_fix") for o in st.get("orders", [])) or any(i.get("status") == "sent" for i in st.get("intake", []))
            if 8 <= local.hour < 11 and busy:
                text, buttons = office.today_text(st)
                to_staff(f"brief:{today}", "☀️ Good morning. " + text, buttons)
            if 19 <= local.hour < 23 and tasks:
                text, buttons = office.today_text(st)
                tomorrow = (local.date() + timedelta(days=1)).isoformat()
                planned = sum(1 for t in st.get("tasks", []) if t.get("date") == tomorrow) + sum(1 for o in st.get("orders", []) if o.get("date") == tomorrow and o.get("status") == "open")
                to_staff(f"wrap:{today}", "🌙 End of day. " + text + (f"\n\nTomorrow: {planned} planned so far." if planned else ""), buttons)

    # Forget follow-ups older than three days.
    cutoff = (now - timedelta(days=3)).isoformat()
    for k in [k for k, v in sent.items() if str(v) < cutoff]:
        sent.pop(k, None)
    return out


async def tick(wid: int, now: Optional[datetime] = None) -> int:
    now = now or datetime.now(timezone.utc)
    staff = await asyncio.to_thread(W.staff_of, wid)
    count = 0

    def apply(st):
        nonlocal count
        if not W.settings(st)["enabled"]:
            return False
        msgs = due(st, staff, now)
        count = len(msgs)
        st.setdefault("messages", []).extend(msgs)

    await workspace.mutate(wid, apply)
    return count


async def run_forever() -> None:
    every = int(os.environ.get("NUDGE_SECONDS") or 300)
    while True:
        await asyncio.sleep(every)
        try:
            rows = await asyncio.to_thread(db.all, "SELECT id FROM workspace")
            for (wid,) in rows:
                if int(wid) != auth.DEMO_WORKSPACE:  # the shared demo's riders aren't real people
                    await tick(int(wid))
        except Exception:
            log.exception("Follow-ups failed")


def start() -> None:
    if (os.environ.get("NUDGES") or "on").lower() in ("off", "0", "false", "no"):
        return
    asyncio.get_running_loop().create_task(run_forever())

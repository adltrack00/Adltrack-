"""Team groups on WhatsApp: a group with ADA in it, for the office, riders and vendors.

The office says "make a team group" (approved first). ADA asks WhatsApp to make it and posts the invite link to whoever
asked. In the group everything is kept for the office; ADA only answers a message that starts with "ADA" (e.g.
"ADA, who has DL-1042?"), as the person who wrote it, and answers in the group. Only office staff can approve plans.

WhatsApp's Groups API is for businesses on the official business account (the blue tick, "OBA") and allows up to 8
people in a group, with no buttons: choices are written out instead. On Meta the group id and link arrive a moment later
in a group_lifecycle_update webhook. On the test line groups are simulated so the flow can be tried in the simulator.
"""
import asyncio
import logging
from typing import Any, Dict, Optional

import wa_providers
import workspace
import whatsapp as W

log = logging.getLogger("whatsapp")


def ready_text(g: Dict[str, Any]) -> str:
    return (f"👥 \"{g.get('name')}\" is ready. Invite link: {g.get('invite') or '(WhatsApp will send it shortly)'}\n"
            "Share it with your riders and staff (up to 8 people). In the group, start a message with ADA and I'll answer, e.g. \"ADA, who has DL-1042?\"")


async def on_change(wid: int, before: Optional[Dict[str, Any]], after: Dict[str, Any], url: str = "") -> None:
    if before is None:
        return
    had = {g.get("key") for g in W.groups(before)}
    for g in W.groups(after):
        if g.get("key") in had or g.get("status") != "creating":
            continue
        line = wa_providers.line
        got = await asyncio.to_thread(line.create_group, g.get("name") or "Team", "Deliveries, run with ADA.") if hasattr(line, "create_group") else {"error": "This WhatsApp line can't make groups."}

        def record(st, key=g["key"], got=got):
            for x in W.groups(st):
                if x.get("key") != key:
                    continue
                staff = (x.get("by") or {}).get("id")
                if got.get("error"):
                    x.update(status="failed", error=got["error"])
                    text = f"👥 WhatsApp couldn't make the group: {got['error']}. Groups need the official business account (blue tick) on your WhatsApp number."
                else:
                    x.update(id=got.get("id") or "", requestId=got.get("requestId") or "", invite=got.get("invite") or "", status="ready" if got.get("id") else "creating")
                    text = ready_text(x) if got.get("id") else ""
                if staff and text:
                    st.setdefault("messages", []).append(W.office_message(f"staff:{staff}", text, kind="reply"))

        await workspace.mutate(wid, record)


async def lifecycle(value: Dict[str, Any]) -> None:
    """Meta's group_lifecycle_update: the group a request made now has its id and invite link."""
    for g in value.get("groups", []) or []:
        req, gid = g.get("request_id"), g.get("group_id")
        if not req or not gid:
            continue
        rows = await asyncio.to_thread(W.db.all, "SELECT id FROM workspace WHERE state::text LIKE %s", (f"%{req}%",))
        for (wid,) in rows:
            def apply(st):
                for x in W.groups(st):
                    if x.get("requestId") == req and x.get("status") == "creating":
                        ok = g.get("type", "group_create") == "group_create" and not g.get("errors")
                        x.update(id=gid, invite=g.get("invite_link") or x.get("invite") or "", status="ready" if ok else "failed")
                        staff = (x.get("by") or {}).get("id")
                        if staff:
                            st.setdefault("messages", []).append(W.office_message(f"staff:{staff}", ready_text(x) if ok else "👥 WhatsApp couldn't make the group.", kind="reply"))
                        return
                return False

            await workspace.mutate(int(wid), apply)


workspace.hooks.append(on_change)

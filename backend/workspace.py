"""Each company's workspace: one copy of its delivery data on the server, so the company, its vendors and its riders
see the same thing on any device, live.

The browser keeps the business rules (frontend/src/delivery/store.js). It sends its copy back with the revision it
started from; if someone saved in between, the server answers 409 with the newer copy and the browser re-applies its
change on top. Vendors and riders get only their part of the workspace and may change only what their role allows
(see access.py). Open pages hear about every new revision over Server-Sent Events.

Delivery photos arrive inside the saved data as data: URLs; the server moves them into the photos table and puts a
short /api/photos/<id> link in their place, so the workspace stays small.
"""
import asyncio
import base64
import json
import logging
import re
import secrets
from typing import Any, Dict, Optional, Tuple

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, Response, StreamingResponse

import access
from auth import DEMO_WORKSPACE, require_user
from db import db, now

log = logging.getLogger("workspace")
MAX_BYTES = 25 * 1024 * 1024
DATA_URL = re.compile(r"^data:(image/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$")


class Hub:
    """Saves workspaces and tells open pages about new revisions."""

    def __init__(self):
        self.locks: Dict[int, asyncio.Lock] = {}
        self.listeners: Dict[int, set] = {}

    def lock(self, wid: int) -> asyncio.Lock:
        return self.locks.setdefault(wid, asyncio.Lock())

    @staticmethod
    def load(wid: int) -> Tuple[int, Optional[Dict[str, Any]]]:
        row = db.one("SELECT rev, state::text FROM workspace WHERE id = %s", (wid,))
        return (int(row[0]), json.loads(row[1])) if row else (0, None)

    @staticmethod
    def create(wid: int, state: Dict[str, Any]) -> None:
        db.execute("INSERT INTO workspace (id, rev, state, updated_at) VALUES (%s, 1, %s::jsonb, now())", (wid, json.dumps(state, separators=(",", ":"))))

    @staticmethod
    def write(wid: int, base_rev: int, state: Dict[str, Any]) -> bool:
        text = json.dumps(state, separators=(",", ":"))
        if base_rev == 0:
            try:
                db.execute("INSERT INTO workspace (id, rev, state, updated_at) VALUES (%s, 1, %s::jsonb, now())", (wid, text))
                return True
            except Exception:  # someone else created it first
                return False
        return db.execute("UPDATE workspace SET rev = rev + 1, state = %s::jsonb, updated_at = now() WHERE id = %s AND rev = %s", (text, wid, base_rev)) == 1

    def announce(self, wid: int, rev: int) -> None:
        for q in list(self.listeners.get(wid, ())):
            q.put_nowait(rev)


hub = Hub()


def new_workspace(wid: int, state: Dict[str, Any]) -> None:
    Hub.create(wid, state)


def _store_photos(state: Dict[str, Any], wid: int) -> None:
    for t in state.get("tasks") or []:
        proof = t.get("proof") if isinstance(t, dict) else None
        photo = proof.get("photo") if isinstance(proof, dict) else None
        if not isinstance(photo, str) or len(photo) < 4000:
            continue  # small drawings (the demo's) stay inline
        m = DATA_URL.match(photo)
        if not m:
            continue
        data = base64.b64decode(m.group(2))
        if len(data) > 6 * 1024 * 1024:
            raise HTTPException(413, "That photo is too large.")
        pid = secrets.token_urlsafe(12)
        db.execute("INSERT INTO photos (id, workspace_id, mime, data, created_at) VALUES (%s, %s, %s, %s, %s)", (pid, wid, m.group(1), db.blob(data), now()))
        proof["photo"] = f"/api/photos/{pid}"


def _json(body: Any, status: int = 200) -> Response:
    return Response(content=json.dumps(body, separators=(",", ":")), status_code=status, media_type="application/json", headers={"Cache-Control": "no-store"})


def router() -> APIRouter:
    api = APIRouter(prefix="/api")

    @api.get("/workspace")
    async def get_workspace(user=Depends(require_user)):
        rev, state = await asyncio.to_thread(Hub.load, user["workspaceId"])
        return _json({"rev": rev, "state": access.view(state, user["role"], user["ref"])})

    @api.put("/workspace")
    async def put_workspace(request: Request, user=Depends(require_user)):
        raw = await request.body()
        if len(raw) > MAX_BYTES:
            return JSONResponse({"error": "too large"}, status_code=413)
        try:
            body = json.loads(raw)
            base_rev, sent = int(body["base_rev"]), body["state"]
        except (ValueError, KeyError, TypeError):
            raise HTTPException(400, "Bad save.")
        if not isinstance(sent, dict) or sent.get("version") != 5:
            raise HTTPException(400, "Not a workspace.")
        wid, role, ref = user["workspaceId"], user["role"], user["ref"]
        async with hub.lock(wid):
            rev, full = await asyncio.to_thread(Hub.load, wid)
            if base_rev != rev:
                return _json({"rev": rev, "state": access.view(full, role, ref)}, status=409)
            await asyncio.to_thread(_store_photos, sent, wid)
            if role == "company":
                nxt = sent
            elif full is None:
                raise HTTPException(409, "Your company hasn't set up yet.")
            else:
                try:
                    nxt = access.merge(full, sent, role, ref)
                except access.Refused as err:
                    log.warning("Refused save from %s %s: %s", role, user["id"], err)
                    return _json({"error": "Your account can't make that change.", "rev": rev, "state": access.view(full, role, ref)}, status=403)
            ok = await asyncio.to_thread(Hub.write, wid, rev, nxt)
            if not ok:
                rev, full = await asyncio.to_thread(Hub.load, wid)
                return _json({"rev": rev, "state": access.view(full, role, ref)}, status=409)
            rev += 1
        hub.announce(wid, rev)
        # Photos may have been moved out; the browser adopts this copy so it shows the short links.
        return _json({"rev": rev, "state": access.view(nxt, role, ref)})

    @api.get("/workspace/stream")
    async def stream(request: Request, user=Depends(require_user)):
        wid = user["workspaceId"]
        q: asyncio.Queue = asyncio.Queue()
        hub.listeners.setdefault(wid, set()).add(q)
        rev, _ = await asyncio.to_thread(Hub.load, wid)

        async def events():
            try:
                yield f"data: {rev}\n\n"
                while not await request.is_disconnected():
                    try:
                        latest = await asyncio.wait_for(q.get(), timeout=20)
                        yield f"data: {latest}\n\n"
                    except asyncio.TimeoutError:
                        yield ": ping\n\n"  # keeps the connection open through proxies
            finally:
                hub.listeners.get(wid, set()).discard(q)

        return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    @api.post("/workspace/reset-demo")
    async def reset_demo(request: Request, user=Depends(require_user)):
        if user["workspaceId"] != DEMO_WORKSPACE or user["role"] != "company":
            raise HTTPException(403, "Only the demo can be reset.")
        body = await request.json()
        seed = body.get("seed")
        if not isinstance(seed, dict) or seed.get("version") != 5:
            raise HTTPException(400, "Bad seed.")
        async with hub.lock(DEMO_WORKSPACE):
            rev, _ = await asyncio.to_thread(Hub.load, DEMO_WORKSPACE)
            await asyncio.to_thread(Hub.write, DEMO_WORKSPACE, rev, seed)
        hub.announce(DEMO_WORKSPACE, rev + 1)
        return {"rev": rev + 1}

    @api.get("/photos/{pid}")
    def photo(pid: str, user=Depends(require_user)):
        row = db.one("SELECT mime, data, workspace_id FROM photos WHERE id = %s", (pid,))
        if not row or row[2] != user["workspaceId"]:
            raise HTTPException(404, "Not found.")
        return Response(content=bytes(row[1]), media_type=row[0], headers={"Cache-Control": "private, max-age=31536000, immutable"})

    return api

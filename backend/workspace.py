"""The shared workspace: one copy of the delivery data on the server, so the company, every vendor and every rider see
the same thing on any device.

The browser keeps the business rules (frontend/src/delivery/store.js). It sends the whole workspace back with the
revision it started from; if someone else saved in between, the server answers 409 with the newer copy and the browser
re-applies its change on top. Open pages hear about every new revision over Server-Sent Events.

Storage: Postgres when DATABASE_URL is set (Render database), otherwise a JSON file at DATA_FILE (default
./data/workspace.json), which is fine on a laptop but is wiped when a free Render service restarts.
"""
import asyncio
import json
import logging
import os
from typing import Any, Dict, Optional, Tuple

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

log = logging.getLogger("workspace")
MAX_BYTES = 25 * 1024 * 1024


class FileStore:
    def __init__(self, path: str):
        self.path = path
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)

    def load(self) -> Tuple[int, Optional[str]]:
        try:
            with open(self.path, encoding="utf-8") as f:
                saved = json.load(f)
            return int(saved["rev"]), json.dumps(saved["state"])
        except (OSError, ValueError, KeyError):
            return 0, None

    def save(self, rev: int, state: str) -> None:
        tmp = self.path + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write('{"rev": %d, "state": %s}' % (rev, state))
        os.replace(tmp, self.path)


class PostgresStore:
    def __init__(self, url: str):
        import psycopg  # only needed when a database is configured

        self.psycopg = psycopg
        self.url = url
        with self.connect() as conn:
            conn.execute("CREATE TABLE IF NOT EXISTS workspace (id INT PRIMARY KEY, rev INT NOT NULL, state JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())")

    def connect(self):
        return self.psycopg.connect(self.url, autocommit=True)

    def load(self) -> Tuple[int, Optional[str]]:
        with self.connect() as conn:
            row = conn.execute("SELECT rev, state::text FROM workspace WHERE id = 1").fetchone()
        return (int(row[0]), row[1]) if row else (0, None)

    def save(self, rev: int, state: str) -> None:
        with self.connect() as conn:
            conn.execute(
                "INSERT INTO workspace (id, rev, state, updated_at) VALUES (1, %s, %s::jsonb, now()) "
                "ON CONFLICT (id) DO UPDATE SET rev = EXCLUDED.rev, state = EXCLUDED.state, updated_at = now()",
                (rev, state),
            )


def make_store():
    url = os.environ.get("DATABASE_URL")
    if url:
        log.info("Workspace saved in Postgres")
        return PostgresStore(url)
    path = os.environ.get("DATA_FILE", os.path.join(os.path.dirname(__file__), "data", "workspace.json"))
    log.info("Workspace saved in %s", path)
    return FileStore(path)


class Workspace:
    def __init__(self):
        self.store = make_store()
        self.rev, self.state = self.store.load()
        self.lock = asyncio.Lock()
        self.listeners: set = set()

    def snapshot(self) -> str:
        return '{"rev": %d, "state": %s}' % (self.rev, self.state or "null")

    async def save(self, base_rev: int, state: str) -> Optional[int]:
        async with self.lock:
            if base_rev != self.rev:
                return None
            rev = self.rev + 1
            await asyncio.to_thread(self.store.save, rev, state)
            self.rev, self.state = rev, state
        for q in list(self.listeners):
            q.put_nowait(rev)
        return rev


class SaveBody(BaseModel):
    base_rev: int
    state: Dict[str, Any]


def router() -> APIRouter:
    ws = Workspace()
    api = APIRouter(prefix="/api/workspace")

    @api.get("")
    async def get_workspace():
        return _raw(ws.snapshot())

    @api.put("")
    async def put_workspace(request: Request):
        raw = await request.body()
        if len(raw) > MAX_BYTES:
            return JSONResponse({"error": "too large"}, status_code=413)
        body = SaveBody.model_validate_json(raw)
        if body.state.get("version") is None:
            return JSONResponse({"error": "not a workspace"}, status_code=400)
        rev = await ws.save(body.base_rev, json.dumps(body.state, separators=(",", ":")))
        if rev is None:
            return _raw(ws.snapshot(), status=409)
        return {"rev": rev}

    @api.get("/stream")
    async def stream(request: Request):
        q: asyncio.Queue = asyncio.Queue()
        ws.listeners.add(q)

        async def events():
            try:
                yield f"data: {ws.rev}\n\n"
                while not await request.is_disconnected():
                    try:
                        rev = await asyncio.wait_for(q.get(), timeout=20)
                        yield f"data: {rev}\n\n"
                    except asyncio.TimeoutError:
                        yield ": ping\n\n"  # keeps the connection open through proxies
            finally:
                ws.listeners.discard(q)

        return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})

    return api


def _raw(body: str, status: int = 200):
    from fastapi import Response

    return Response(content=body, status_code=status, media_type="application/json", headers={"Cache-Control": "no-store"})

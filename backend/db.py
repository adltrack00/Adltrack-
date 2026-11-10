"""Storage for the Delivery server: Postgres when DATABASE_URL is set (Render), otherwise a SQLite file on disk
(DATA_DIR, default ./data), which is fine on a laptop.

Every query is written once with %s placeholders; SQLite gets them turned into ?.
"""
import logging
import os
import sqlite3
import threading
import time
from contextlib import contextmanager
from typing import Any, Iterable, List, Optional, Tuple

log = logging.getLogger("db")


def now() -> int:
    return int(time.time())


SCHEMA = [
    # One row per company. state is the whole delivery workspace (vendors, products, riders, orders, deliveries...).
    "CREATE TABLE IF NOT EXISTS workspace (id INT PRIMARY KEY, rev INT NOT NULL, state {json} NOT NULL, updated_at {ts} NOT NULL DEFAULT {now})",
    """CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, workspace_id INT NOT NULL, role TEXT NOT NULL, ref TEXT, name TEXT NOT NULL,
        email TEXT UNIQUE, phone TEXT UNIQUE, password_hash TEXT, owner INT NOT NULL DEFAULT 0, demo INT NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL, last_seen BIGINT)""",
    "CREATE INDEX IF NOT EXISTS users_workspace ON users (workspace_id)",
    "CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at BIGINT NOT NULL, expires_at BIGINT NOT NULL)",
    "CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id)",
    """CREATE TABLE IF NOT EXISTS invites (
        code TEXT PRIMARY KEY, workspace_id INT NOT NULL, role TEXT NOT NULL, ref TEXT, name TEXT,
        created_by TEXT, created_at BIGINT NOT NULL, used_at BIGINT, used_by TEXT)""",
    "CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, workspace_id INT NOT NULL, mime TEXT NOT NULL, data {blob} NOT NULL, created_at BIGINT NOT NULL)",
]


# Columns added after the first release. A vendor's teammates log in to the vendor's dashboard with team = 1; the
# vendor's main account (the one the company invited) has team = 0.
MIGRATIONS = [
    ("users", "team", "INT NOT NULL DEFAULT 0"),
    ("invites", "team", "INT NOT NULL DEFAULT 0"),
]


class Database:
    def __init__(self):
        url = os.environ.get("DATABASE_URL")
        self.pg = bool(url)
        self.ready = False
        self.setup_lock = threading.Lock()
        if self.pg:
            from psycopg_pool import ConnectionPool

            self.pool = ConnectionPool(url, min_size=1, max_size=8, open=False, kwargs={"autocommit": True, "connect_timeout": 10})
            log.info("Data kept in Postgres")
        else:
            folder = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "data"))
            os.makedirs(folder, exist_ok=True)
            path = os.path.join(folder, "delivery.sqlite3")
            self.lite = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
            self.lite.execute("PRAGMA journal_mode=WAL")
            self.lite_lock = threading.RLock()
            log.info("Data kept in %s", path)

    def setup(self) -> None:
        """Creates the tables. Safe to call again; raises while the database cannot be reached yet."""
        if self.ready:
            return
        with self.setup_lock:
            if self.ready:
                return
            if self.pg:
                self.pool.open(wait=True, timeout=15)
            kinds = {"json": "JSONB", "ts": "TIMESTAMPTZ", "now": "now()", "blob": "BYTEA"} if self.pg else {"json": "TEXT", "ts": "TEXT", "now": "CURRENT_TIMESTAMP", "blob": "BLOB"}
            for sql in SCHEMA:
                self.execute(sql.format(**kinds))
            for table, column, kind in MIGRATIONS:
                if self.pg:
                    self.execute(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {kind}")
                else:
                    have = [r[1] for r in self.all(f"PRAGMA table_info({table})")]
                    if column not in have:
                        self.execute(f"ALTER TABLE {table} ADD COLUMN {column} {kind}")
            self.ready = True

    @contextmanager
    def _cursor(self):
        if self.pg:
            with self.pool.connection() as conn:
                with conn.cursor() as cur:
                    yield cur
        else:
            with self.lite_lock:
                cur = self.lite.cursor()
                try:
                    yield cur
                finally:
                    cur.close()

    def _sql(self, sql: str) -> str:
        if self.pg:
            return sql
        return sql.replace("%s", "?").replace("::jsonb", "").replace("::text", "").replace("now()", "CURRENT_TIMESTAMP")

    def execute(self, sql: str, params: Iterable[Any] = ()) -> int:
        with self._cursor() as cur:
            cur.execute(self._sql(sql), tuple(params))
            return cur.rowcount

    def one(self, sql: str, params: Iterable[Any] = ()) -> Optional[Tuple]:
        with self._cursor() as cur:
            cur.execute(self._sql(sql), tuple(params))
            return cur.fetchone()

    def all(self, sql: str, params: Iterable[Any] = ()) -> List[Tuple]:
        with self._cursor() as cur:
            cur.execute(self._sql(sql), tuple(params))
            return cur.fetchall()

    def blob(self, data: bytes):
        return data if self.pg else sqlite3.Binary(data)


db = Database()

"""Accounts: sign up, sign in, sessions, invites and the company's team.

- A company signs up and gets its own workspace (its own vendors, riders, stock and deliveries).
- The company invites each vendor and rider with a short code (or link). Joining with it creates their login,
  tied to that vendor or rider, so each person signs in to their own dashboard.
- Sessions are random tokens in an HttpOnly cookie; only a hash of the token is stored.
- Passwords are hashed with PBKDF2-SHA256 (Python standard library).
- The demo workspace (id 1) has one demo login per role, opened from the landing page without a password.
"""
import base64
import hashlib
import hmac
import json
import logging
import re
import secrets
import threading
import time
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

import access
from db import db, now

log = logging.getLogger("auth")

COOKIE = "delivery_session"
SESSION_DAYS = 60
DEMO_WORKSPACE = 1
DEMO_USERS = {
    "company": {"id": "demo-company", "name": "George (demo)", "ref": None},
    "vendor": {"id": "demo-vendor", "name": "GlowSkin Naturals (demo)", "ref": "v-glow"},
    "rider": {"id": "demo-rider", "name": "Tunde Bakare (demo)", "ref": "r-tunde"},
}
ROLES = ("company", "vendor", "rider")


# ---------- passwords and tokens ----------

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    rounds = 240_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, rounds)
    return f"pbkdf2_sha256${rounds}${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def check_password(password: str, stored: Optional[str]) -> bool:
    try:
        _, rounds, salt, digest = (stored or "").split("$")
        test = hashlib.pbkdf2_hmac("sha256", password.encode(), base64.b64decode(salt), int(rounds))
        return hmac.compare_digest(test, base64.b64decode(digest))
    except (ValueError, TypeError):
        return False


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_hex(8)}"


def invite_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O or 1/I to misread
    return "".join(secrets.choice(alphabet) for _ in range(6))


def clean_email(email: Optional[str]) -> Optional[str]:
    e = (email or "").strip().lower()
    if not e:
        return None
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", e):
        raise HTTPException(400, "That email doesn't look right.")
    return e


def clean_phone(phone: Optional[str]) -> Optional[str]:
    digits = re.sub(r"\D", "", phone or "")
    if not digits:
        return None
    if len(digits) < 7:
        raise HTTPException(400, "That phone number looks too short.")
    # Nigerian numbers are written both as 0803... and +234 803...; keep one form so either signs in.
    if digits.startswith("0") and len(digits) == 11:
        digits = "234" + digits[1:]
    return "+" + digits


# ---------- slowing down password guessing ----------

_fails: Dict[str, list] = {}
_fails_lock = threading.Lock()


def _too_many(key: str) -> bool:
    with _fails_lock:
        recent = [t for t in _fails.get(key, []) if t > time.time() - 900]
        _fails[key] = recent
        return len(recent) >= 8


def _failed(key: str) -> None:
    with _fails_lock:
        _fails.setdefault(key, []).append(time.time())


# ---------- users and sessions ----------

PHOTO_RE = re.compile(r"^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$")

USER_COLS = "id, workspace_id, role, ref, name, email, phone, owner, demo, created_at, last_seen, team, photo"


def user_dict(row) -> Dict[str, Any]:
    return {
        "id": row[0], "workspaceId": row[1], "role": row[2], "ref": row[3], "name": row[4], "email": row[5], "phone": row[6],
        "owner": bool(row[7]), "demo": bool(row[8]), "createdAt": row[9], "lastSeen": row[10], "teammate": bool(row[11]), "photo": row[12],
    }


def start_session(response: Response, request: Request, user_id: str) -> None:
    token = secrets.token_urlsafe(32)
    db.execute("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (%s, %s, %s, %s)", (token_hash(token), user_id, now(), now() + SESSION_DAYS * 86400))
    secure = request.headers.get("x-forwarded-proto", request.url.scheme) == "https"
    response.set_cookie(COOKIE, token, max_age=SESSION_DAYS * 86400, httponly=True, samesite="lax", secure=secure, path="/")


def current_user(request: Request) -> Optional[Dict[str, Any]]:
    token = request.cookies.get(COOKIE)
    if not token:
        return None
    db.setup()
    row = db.one(f"SELECT {', '.join('u.' + c.strip() for c in USER_COLS.split(','))}, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = %s", (token_hash(token),))
    if not row or row[-1] < now():
        return None
    user = user_dict(row)
    if not user["lastSeen"] or now() - user["lastSeen"] > 300:
        db.execute("UPDATE users SET last_seen = %s WHERE id = %s", (now(), user["id"]))
    return user


def require_user(request: Request) -> Dict[str, Any]:
    try:
        user = current_user(request)
    except HTTPException:
        raise
    except Exception as err:  # database not reachable yet
        log.warning("Sign-in check failed: %s", err)
        raise HTTPException(503, "The server is starting up. Try again in a moment.")
    if not user:
        raise HTTPException(401, "Please sign in.")
    return user


def require_company(user: Dict[str, Any] = Depends(require_user)) -> Dict[str, Any]:
    if user["role"] != "company":
        raise HTTPException(403, "Only the company can do this.")
    return user


def _find_login(login: str):
    login = (login or "").strip()
    if "@" in login:
        return db.one(f"SELECT {USER_COLS}, password_hash FROM users WHERE email = %s", (clean_email(login),))
    phone = clean_phone(login)
    return db.one(f"SELECT {USER_COLS}, password_hash FROM users WHERE phone = %s", (phone,)) if phone else None


def _check_unique(email: Optional[str], phone: Optional[str], except_id: Optional[str] = None) -> None:
    if email and db.one("SELECT id FROM users WHERE email = %s AND id <> %s", (email, except_id or "")):
        raise HTTPException(409, "An account with this email already exists. Sign in instead.")
    if phone and db.one("SELECT id FROM users WHERE phone = %s AND id <> %s", (phone, except_id or "")):
        raise HTTPException(409, "An account with this phone number already exists. Sign in instead.")


def _password_ok(password: str) -> None:
    if len(password or "") < 8:
        raise HTTPException(400, "Use a password of at least 8 characters.")


def company_name(workspace_id: int) -> str:
    row = db.one("SELECT state::text FROM workspace WHERE id = %s", (workspace_id,))
    try:
        return (json.loads(row[0]).get("company") or {}).get("name") or "Your company"
    except (TypeError, ValueError, AttributeError):
        return "Delivery demo" if workspace_id == DEMO_WORKSPACE else "Your company"


def me_payload(user: Dict[str, Any]) -> Dict[str, Any]:
    return {"user": user, "company": company_name(user["workspaceId"])}


# ---------- request bodies ----------

class CompanySignup(BaseModel):
    company: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=80)
    email: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=30)
    city: Optional[str] = Field(default="", max_length=60)
    password: str = Field(max_length=200)


class Join(BaseModel):
    code: str = Field(max_length=20)
    name: str = Field(min_length=1, max_length=80)
    email: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=30)
    password: str = Field(max_length=200)


class SignIn(BaseModel):
    login: str = Field(max_length=120)
    password: str = Field(max_length=200)


class Demo(BaseModel):
    role: str
    seed: Optional[Dict[str, Any]] = None


class NewPassword(BaseModel):
    current: str = Field(max_length=200)
    new: str = Field(max_length=200)


class Profile(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=30)


class Photo(BaseModel):
    photo: Optional[str] = Field(default=None, max_length=400000)


class TeamInvite(BaseModel):
    name: Optional[str] = Field(default="", max_length=80)


class NewInvite(BaseModel):
    role: str
    ref: Optional[str] = Field(default=None, max_length=60)
    name: Optional[str] = Field(default="", max_length=80)


def router(on_new_workspace) -> APIRouter:
    """on_new_workspace(workspace_id, state) saves the first copy of a new company's workspace."""
    api = APIRouter(prefix="/api")

    @api.post("/auth/signup/company")
    def signup_company(body: CompanySignup, request: Request, response: Response):
        db.setup()
        email, phone = clean_email(body.email), clean_phone(body.phone)
        if not email and not phone:
            raise HTTPException(400, "Add an email or a phone number to sign in with.")
        _password_ok(body.password)
        _check_unique(email, phone)
        top = db.one("SELECT MAX(id) FROM workspace")
        workspace_id = max(int((top and top[0]) or 0), DEMO_WORKSPACE) + 1
        state = access.empty_state(body.company.strip(), body.name.strip().split(" ")[0], (body.city or "").strip())
        on_new_workspace(workspace_id, state)
        user_id = new_id("u")
        db.execute(
            "INSERT INTO users (id, workspace_id, role, ref, name, email, phone, password_hash, owner, demo, created_at) VALUES (%s, %s, 'company', NULL, %s, %s, %s, %s, 1, 0, %s)",
            (user_id, workspace_id, body.name.strip(), email, phone, hash_password(body.password), now()),
        )
        start_session(response, request, user_id)
        log.info("New company %s (workspace %s)", body.company, workspace_id)
        return me_payload(_get_user(user_id))

    @api.get("/invites/{code}")
    def read_invite(code: str):
        db.setup()
        row = db.one("SELECT workspace_id, role, ref, name, used_at, team FROM invites WHERE code = %s", (code.strip().upper(),))
        if not row:
            raise HTTPException(404, "That invite code isn't valid. Check it with your delivery company.")
        if row[4]:
            raise HTTPException(410, "This invite has already been used. Ask your delivery company for a new one.")
        out = {"company": company_name(row[0]), "role": row[1], "name": row[3] or "", "teammate": bool(row[5])}
        if row[5]:
            out["vendor"] = vendor_name(row[0], row[2])
        return out

    @api.post("/auth/join")
    def join(body: Join, request: Request, response: Response):
        db.setup()
        code = body.code.strip().upper()
        if _too_many("join:" + (request.client.host if request.client else "")):
            raise HTTPException(429, "Too many tries. Wait a few minutes and try again.")
        row = db.one("SELECT workspace_id, role, ref, used_at, team FROM invites WHERE code = %s", (code,))
        if not row:
            _failed("join:" + (request.client.host if request.client else ""))
            raise HTTPException(404, "That invite code isn't valid. Check it with your delivery company.")
        if row[3]:
            raise HTTPException(410, "This invite has already been used. Ask your delivery company for a new one.")
        workspace_id, role, ref, team = row[0], row[1], row[2], 1 if row[4] else 0
        email, phone = clean_email(body.email), clean_phone(body.phone)
        if not email and not phone:
            raise HTTPException(400, "Add an email or a phone number to sign in with.")
        _password_ok(body.password)
        # A new invite from the company for the same vendor or rider replaces their main login (this is how a lost
        # password is reset). A vendor's teammates each have their own login and are left alone.
        if ref and not team:
            for (old_id,) in db.all("SELECT id FROM users WHERE workspace_id = %s AND role = %s AND ref = %s AND team = 0", (workspace_id, role, ref)):
                _delete_user(old_id)
        _check_unique(email, phone)
        user_id = new_id("u")
        db.execute(
            "INSERT INTO users (id, workspace_id, role, ref, name, email, phone, password_hash, owner, demo, created_at, team) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0, 0, %s, %s)",
            (user_id, workspace_id, role, ref, body.name.strip(), email, phone, hash_password(body.password), now(), team),
        )
        db.execute("UPDATE invites SET used_at = %s, used_by = %s WHERE code = %s", (now(), user_id, code))
        start_session(response, request, user_id)
        return me_payload(_get_user(user_id))

    @api.post("/auth/signin")
    def signin(body: SignIn, request: Request, response: Response):
        db.setup()
        key = "login:" + body.login.strip().lower()
        if _too_many(key):
            raise HTTPException(429, "Too many tries. Wait a few minutes and try again.")
        try:
            row = _find_login(body.login)
        except HTTPException:
            row = None
        if not row or not check_password(body.password, row[-1]):
            _failed(key)
            raise HTTPException(401, "That email or phone and password don't match.")
        start_session(response, request, row[0])
        return me_payload(user_dict(row))

    @api.post("/auth/demo")
    def demo(body: Demo, request: Request, response: Response):
        db.setup()
        if body.role not in DEMO_USERS:
            raise HTTPException(400, "Unknown role.")
        has = db.one("SELECT rev FROM workspace WHERE id = %s", (DEMO_WORKSPACE,))
        if not has:
            if not body.seed or body.seed.get("version") != 5:
                raise HTTPException(409, "The demo needs its sample data first.")
            on_new_workspace(DEMO_WORKSPACE, body.seed)
        d = DEMO_USERS[body.role]
        if not db.one("SELECT id FROM users WHERE id = %s", (d["id"],)):
            db.execute(
                "INSERT INTO users (id, workspace_id, role, ref, name, email, phone, password_hash, owner, demo, created_at) VALUES (%s, %s, %s, %s, %s, NULL, NULL, NULL, %s, 1, %s)",
                (d["id"], DEMO_WORKSPACE, body.role, d["ref"], d["name"], 1 if body.role == "company" else 0, now()),
            )
        start_session(response, request, d["id"])
        return me_payload(_get_user(d["id"]))

    @api.post("/auth/signout")
    def signout(request: Request, response: Response):
        token = request.cookies.get(COOKIE)
        if token:
            db.execute("DELETE FROM sessions WHERE token_hash = %s", (token_hash(token),))
        response.delete_cookie(COOKIE, path="/")
        return {"ok": True}

    @api.get("/auth/me")
    def me(user=Depends(require_user)):
        return me_payload(user)

    @api.put("/auth/profile")
    def profile(body: Profile, user=Depends(require_user)):
        if user["demo"]:
            raise HTTPException(403, "The demo account can't be changed. Create your own account to do this.")
        email, phone = clean_email(body.email), clean_phone(body.phone)
        if not email and not phone:
            raise HTTPException(400, "Keep an email or a phone number to sign in with.")
        _check_unique(email, phone, user["id"])
        db.execute("UPDATE users SET name = %s, email = %s, phone = %s WHERE id = %s", (body.name.strip(), email, phone, user["id"]))
        return me_payload(_get_user(user["id"]))

    # The profile photo, already cropped to a square on the phone. None takes it off.
    @api.put("/auth/photo")
    def photo(body: Photo, user=Depends(require_user)):
        if user["demo"]:
            raise HTTPException(403, "The demo account keeps its photo on this device only.")
        if body.photo and not PHOTO_RE.match(body.photo):
            raise HTTPException(400, "Use a JPG, PNG or WebP photo.")
        db.execute("UPDATE users SET photo = %s WHERE id = %s", (body.photo or None, user["id"]))
        return me_payload(_get_user(user["id"]))

    @api.post("/auth/password")
    def password(body: NewPassword, request: Request, user=Depends(require_user)):
        if user["demo"]:
            raise HTTPException(403, "The demo account has no password.")
        row = db.one("SELECT password_hash FROM users WHERE id = %s", (user["id"],))
        if not row or not check_password(body.current, row[0]):
            raise HTTPException(400, "Your current password isn't right.")
        _password_ok(body.new)
        db.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(body.new), user["id"]))
        # Sign out every other device.
        token = request.cookies.get(COOKIE) or ""
        db.execute("DELETE FROM sessions WHERE user_id = %s AND token_hash <> %s", (user["id"], token_hash(token)))
        return {"ok": True}

    # ---------- the company's team ----------

    @api.get("/team")
    def team(user=Depends(require_company)):
        members = [user_dict(r) for r in db.all(f"SELECT {USER_COLS} FROM users WHERE workspace_id = %s ORDER BY created_at", (user["workspaceId"],))]
        invites = [
            {"code": r[0], "role": r[1], "ref": r[2], "name": r[3], "createdAt": r[4]}
            for r in db.all("SELECT code, role, ref, name, created_at FROM invites WHERE workspace_id = %s AND used_at IS NULL AND team = 0 ORDER BY created_at DESC", (user["workspaceId"],))
        ]
        return {"members": members, "invites": invites}

    @api.post("/invites")
    def create_invite(body: NewInvite, user=Depends(require_company)):
        if body.role not in ROLES:
            raise HTTPException(400, "Unknown role.")
        if body.role != "company" and not body.ref:
            raise HTTPException(400, "Pick the vendor or rider this invite is for.")
        # One open invite per person: a new one replaces the old.
        if body.ref:
            db.execute("DELETE FROM invites WHERE workspace_id = %s AND ref = %s AND role = %s AND used_at IS NULL AND team = 0", (user["workspaceId"], body.ref, body.role))
        for _ in range(10):
            code = invite_code()
            if not db.one("SELECT code FROM invites WHERE code = %s", (code,)):
                break
        db.execute(
            "INSERT INTO invites (code, workspace_id, role, ref, name, created_by, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (code, user["workspaceId"], body.role, body.ref if body.role != "company" else None, (body.name or "").strip(), user["id"], now()),
        )
        return {"code": code, "role": body.role, "ref": body.ref, "name": body.name}

    @api.delete("/invites/{code}")
    def delete_invite(code: str, user=Depends(require_company)):
        db.execute("DELETE FROM invites WHERE code = %s AND workspace_id = %s", (code.upper(), user["workspaceId"]))
        return {"ok": True}

    @api.delete("/team/{member_id}")
    def remove_member(member_id: str, user=Depends(require_company)):
        row = db.one("SELECT workspace_id, owner FROM users WHERE id = %s", (member_id,))
        if not row or row[0] != user["workspaceId"]:
            raise HTTPException(404, "Not found.")
        if row[1] or member_id == user["id"]:
            raise HTTPException(400, "The account owner can't be removed.")
        _delete_user(member_id)
        return {"ok": True}

    # ---------- a vendor's own team ----------
    # The vendor's main account invites the people who send out its products. Each teammate has their own login to
    # the same vendor dashboard; everything they add is stamped with their name (see access.merge).

    @api.get("/vendor-team")
    def vendor_team(user=Depends(require_vendor_main)):
        members = [user_dict(r) for r in db.all(f"SELECT {USER_COLS} FROM users WHERE workspace_id = %s AND role = 'vendor' AND ref = %s ORDER BY team, created_at", (user["workspaceId"], user["ref"]))]
        invites = [
            {"code": r[0], "role": "vendor", "ref": r[1], "name": r[2], "createdAt": r[3]}
            for r in db.all("SELECT code, ref, name, created_at FROM invites WHERE workspace_id = %s AND role = 'vendor' AND ref = %s AND team = 1 AND used_at IS NULL ORDER BY created_at DESC", (user["workspaceId"], user["ref"]))
        ]
        return {"members": members, "invites": invites}

    @api.post("/vendor-team/invites")
    def vendor_team_invite(body: TeamInvite, user=Depends(require_vendor_main)):
        if user["demo"]:
            raise HTTPException(403, "Invites are off in the demo.")
        for _ in range(10):
            code = invite_code()
            if not db.one("SELECT code FROM invites WHERE code = %s", (code,)):
                break
        db.execute(
            "INSERT INTO invites (code, workspace_id, role, ref, name, created_by, created_at, team) VALUES (%s, %s, 'vendor', %s, %s, %s, %s, 1)",
            (code, user["workspaceId"], user["ref"], (body.name or "").strip(), user["id"], now()),
        )
        return {"code": code, "role": "vendor", "ref": user["ref"], "name": body.name, "teammate": True}

    @api.delete("/vendor-team/invites/{code}")
    def vendor_team_uninvite(code: str, user=Depends(require_vendor_main)):
        db.execute("DELETE FROM invites WHERE code = %s AND workspace_id = %s AND ref = %s AND team = 1", (code.upper(), user["workspaceId"], user["ref"]))
        return {"ok": True}

    @api.delete("/vendor-team/{member_id}")
    def vendor_team_remove(member_id: str, user=Depends(require_vendor_main)):
        row = db.one("SELECT workspace_id, role, ref, team FROM users WHERE id = %s", (member_id,))
        if not row or row[0] != user["workspaceId"] or row[1] != "vendor" or row[2] != user["ref"] or not row[3]:
            raise HTTPException(404, "Not found.")
        _delete_user(member_id)
        return {"ok": True}

    return api


def require_vendor_main(user: Dict[str, Any] = Depends(require_user)) -> Dict[str, Any]:
    if user["role"] != "vendor" or user.get("teammate") or not user.get("ref"):
        raise HTTPException(403, "Only the vendor's main account can manage its team.")
    return user


def vendor_name(workspace_id: int, ref: Optional[str]) -> str:
    row = db.one("SELECT state::text FROM workspace WHERE id = %s", (workspace_id,))
    try:
        for v in json.loads(row[0]).get("vendors") or []:
            if v.get("id") == ref:
                return v.get("name") or ""
    except (TypeError, ValueError, AttributeError):
        pass
    return ""


def _get_user(user_id: str) -> Dict[str, Any]:
    return user_dict(db.one(f"SELECT {USER_COLS} FROM users WHERE id = %s", (user_id,)))


def _delete_user(user_id: str) -> None:
    db.execute("DELETE FROM sessions WHERE user_id = %s", (user_id,))
    db.execute("DELETE FROM users WHERE id = %s", (user_id,))

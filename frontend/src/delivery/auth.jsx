// Accounts: who is signed in on this device. The server keeps the session in a cookie; this only mirrors it.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SERVER = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// Every call to the server goes through here, with the session cookie.
export async function api(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${SERVER}${path}`, {
      method, signal, credentials: "include", cache: "no-store",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, "Can't reach the server. Check your connection and try again.");
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok) {
    const detail = data && (typeof data.detail === "string" ? data.detail : Array.isArray(data.detail) ? "Please check the form." : data.error);
    throw new ApiError(res.status, detail || "Something went wrong. Try again.", data);
  }
  return data;
}

export const serverUrl = (path) => `${SERVER}${path}`;

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [me, setMe] = useState(undefined); // undefined = still checking, null = signed out
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api("/api/auth/me");
      setMe(data);
      setOffline(false);
    } catch (e) {
      if (e.status === 401) setMe(null);
      else { setOffline(true); setMe((cur) => (cur === undefined ? remembered() : cur)); }
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (me) remember(me); }, [me]);

  const keep = useCallback((data) => { setMe(data); return data; }, []);
  const value = useMemo(() => ({
    me, offline,
    user: me ? me.user : null,
    company: me ? me.company : "",
    refresh,
    signIn: async (login, password) => keep(await api("/api/auth/signin", { method: "POST", body: { login, password } })),
    signUpCompany: async (form) => keep(await api("/api/auth/signup/company", { method: "POST", body: form })),
    join: async (form) => keep(await api("/api/auth/join", { method: "POST", body: form })),
    demo: async (role, seed) => keep(await api("/api/auth/demo", { method: "POST", body: { role, seed } })),
    updateProfile: async (form) => keep(await api("/api/auth/profile", { method: "PUT", body: form })),
    signOut: async () => {
      try { await api("/api/auth/signout", { method: "POST" }); } catch (e) { /* signed out here anyway */ }
      forget();
      setMe(null);
    },
    // A save or load answered 401: the session ended (password changed, removed by the company).
    expired: () => { forget(); setMe(null); },
  }), [me, offline, refresh, keep]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

// Where each role lands after signing in.
export function homeFor(user, company) {
  if (!user) return "/";
  if (user.role === "vendor") return "/vendor";
  if (user.role === "rider") return "/rider";
  return "/company";
}

// So a rider with a weak signal still opens the app on their last data.
const ME_KEY = "delivery-me";
function remember(me) { try { localStorage.setItem(ME_KEY, JSON.stringify(me)); } catch (e) { /* blocked */ } }
function remembered() { try { return JSON.parse(localStorage.getItem(ME_KEY) || "null"); } catch (e) { return null; } }
function forget() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("delivery-")) localStorage.removeItem(k);
  } catch (e) { /* blocked */ }
}

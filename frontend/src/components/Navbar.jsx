import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

const INTER = "'Inter', -apple-system, sans-serif";
const NAV_LINKS = ["Features", "About", "Caregivers", "For Agencies", "Blog"];

export default function Navbar({ onNavigateToAuth }) {
  const [open,     setOpen]     = useState(false);
  const [overHero, setOverHero] = useState(false);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      // White tray is 10px → hero card starts sliding under navbar at scrollY ≥ 10
      // Hero card height = 100vh - 74px → it's fully gone at scrollY ≥ (100vh - 64px)
      const heroStart = 10;
      const heroEnd   = window.innerHeight - 64;
      setOverHero(y >= heroStart && y < heroEnd);
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <>
      <style>{`
        .nav-link-item {
          font-family: ${INTER};
          font-size:   0.875rem;
          font-weight: 500;
          text-decoration: none;
          cursor:      pointer;
          white-space: nowrap;
          transition:  color 0.25s;
        }
        .nav-link-item:hover { opacity: 0.70; }

        .nav-hamburger {
          display:    none;
          background: none;
          border:     none;
          cursor:     pointer;
          padding:    4px;
          align-items: center;
          justify-content: center;
        }
        .nav-desktop { display: flex; }

        @media (max-width: 860px) {
          .nav-desktop   { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-bar-inner { padding: 0 20px !important; }
        }
      `}</style>

      {/* ── Sticky bar: solid white at top/bottom, frosted only over hero image ── */}
      <nav
        className="nav-bar-inner"
        style={{
          position:             "sticky",
          top:                  0,
          zIndex:               200,
          height:               64,
          background:           overHero ? "rgba(255,255,255,0.78)" : "#ffffff",
          backdropFilter:       overHero ? "blur(14px)" : "none",
          WebkitBackdropFilter: overHero ? "blur(14px)" : "none",
          borderBottom:         overHero
                                  ? "1px solid rgba(255,255,255,0.20)"
                                  : "1px solid rgba(0,0,0,0.07)",
          transition:           "background 0.25s ease, backdrop-filter 0.25s ease, border-color 0.25s ease",
          display:              "flex",
          alignItems:           "center",
          justifyContent:       "space-between",
          padding:              "0 40px",
        }}
      >
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", flexShrink:0 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="0"  y="0"  width="9"  height="9"  rx="2" fill="#d97706"/>
            <rect x="13" y="0"  width="9"  height="9"  rx="2" fill="#d97706"/>
            <rect x="0"  y="13" width="9"  height="9"  rx="2" fill="#d97706"/>
            <rect x="13" y="13" width="9"  height="9"  rx="2" fill="#d97706" opacity="0.45"/>
          </svg>
          <span style={{
            fontFamily:    INTER,
            fontSize:      "1.05rem",
            fontWeight:    700,
            letterSpacing: "-0.02em",
            color:         overHero ? "rgba(255,255,255,0.95)" : "#0f172a",
            transition:    "color 0.25s",
          }}>
            ADLTrack
          </span>
        </div>

        {/* Centre links — desktop */}
        <div className="nav-desktop" style={{ gap:28 }}>
          {NAV_LINKS.map(l => (
            <span
              key={l}
              className="nav-link-item"
              style={{ color: overHero ? "rgba(255,255,255,0.88)" : "#374151" }}
            >
              {l}
            </span>
          ))}
        </div>

        {/* Right CTAs — desktop */}
        <div className="nav-desktop" style={{ alignItems:"center", gap:10 }}>
          <button
            onClick={() => onNavigateToAuth?.("login")}
            style={{
              fontFamily:   INTER,
              fontSize:     "0.875rem",
              fontWeight:   600,
              color:        overHero ? "rgba(255,255,255,0.92)" : "#0f172a",
              background:   "transparent",
              border:       overHero ? "1.5px solid rgba(255,255,255,0.45)" : "1.5px solid rgba(0,0,0,0.22)",
              transition:   "color 0.25s, border-color 0.25s",
              borderRadius: 99,
              padding:      "8px 18px",
              cursor:       "pointer",
              display:      "inline-flex",
              alignItems:   "center",
              gap:          5,
              transition:   "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            Log in <ChevronRight size={14} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onNavigateToAuth?.("signup")}
            style={{
              fontFamily:   INTER,
              fontSize:     "0.875rem",
              fontWeight:   700,
              color:        "#ffffff",
              background:   "linear-gradient(135deg,#f97316 0%,#d97706 100%)",
              border:       "none",
              borderRadius: 99,
              padding:      "8px 20px",
              cursor:       "pointer",
              boxShadow:    "0 2px 10px rgba(217,119,6,0.28)",
              transition:   "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(217,119,6,0.42)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(217,119,6,0.28)";
            }}
          >
            Get Started
          </button>
        </div>

        {/* Hamburger — mobile */}
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)}>
          {open
            ? <X    size={22} color={overHero ? "#ffffff" : "#0f172a"} />
            : <Menu size={22} color={overHero ? "#ffffff" : "#0f172a"} />}
        </button>
      </nav>

      {/* ── Mobile dropdown ── */}
      {open && (
        <div style={{
          position:             "sticky",
          top:                  64,
          zIndex:               199,
          background:           "rgba(255,255,255,0.92)",
          backdropFilter:       "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom:         "1px solid rgba(0,0,0,0.07)",
          padding:       "12px 24px 24px",
          display:       "flex",
          flexDirection: "column",
          boxShadow:     "0 8px 24px rgba(0,0,0,0.08)",
        }}>
          {NAV_LINKS.map((l, i) => (
            <span
              key={l}
              className="nav-link-item"
              style={{
                fontSize:     "1rem",
                padding:      "12px 0",
                borderBottom: i < NAV_LINKS.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
              }}
            >
              {l}
            </span>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button
              onClick={() => { onNavigateToAuth?.("login");  setOpen(false); }}
              style={{ flex:1, fontFamily:INTER, fontWeight:600, fontSize:"0.9rem", color:"#0f172a", background:"transparent", border:"1.5px solid rgba(0,0,0,0.22)", borderRadius:99, padding:"11px 0", cursor:"pointer" }}
            >
              Log in
            </button>
            <button
              onClick={() => { onNavigateToAuth?.("signup"); setOpen(false); }}
              style={{ flex:1, fontFamily:INTER, fontWeight:700, fontSize:"0.9rem", color:"#fff", background:"linear-gradient(135deg,#f97316,#d97706)", border:"none", borderRadius:99, padding:"11px 0", cursor:"pointer" }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * HeroPanel — dark navy right-side card for the hero section.
 * Inspired by the Microsoft "How can we help?" block:
 *   • Deep navy background, rounded card
 *   • "Care tools at your fingertips" heading
 *   • Decorative search bar
 *   • 3 quick-action pill buttons
 *   • 6-icon feature grid (3×2)
 */

import React, { useState } from "react";
import {
  Search, Eye, Camera, Activity,
  FileText, Bell, Users,
} from "lucide-react";

const INTER  = "'Inter', -apple-system, sans-serif";
const FUSTAT = "'Fustat', 'Inter', sans-serif";

const PILLS = [
  "Track a shift",
  "Log vitals",
  "Family updates",
];

const FEATURES = [
  { Icon: Eye,      label: "Live Updates",   amber: true  },
  { Icon: Camera,   label: "Photo Docs",     amber: false },
  { Icon: Activity, label: "Vital Signs",    amber: true  },
  { Icon: FileText, label: "Shift Reports",  amber: false },
  { Icon: Bell,     label: "Alerts",         amber: false },
  { Icon: Users,    label: "Family Hub",     amber: true  },
];

/* ── Small pill button with hover ─────────────────────────────────── */
function ActionPill({ label }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:   hovered ? "rgba(217,119,6,0.18)" : "rgba(255,255,255,0.09)",
        border:       hovered ? "1px solid rgba(217,119,6,0.45)" : "1px solid rgba(255,255,255,0.15)",
        borderRadius: 99,
        padding:      "7px 16px",
        fontFamily:   INTER,
        fontSize:     "0.83rem",
        fontWeight:   500,
        color:        hovered ? "#FFB347" : "rgba(255,255,255,0.78)",
        cursor:       "pointer",
        transition:   "background 0.18s, border-color 0.18s, color 0.18s",
        whiteSpace:   "nowrap",
      }}
    >
      {label}
    </div>
  );
}

/* ── Feature tile with hover ──────────────────────────────────────── */
function FeatureTile({ Icon, label, amber }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:            10,
        padding:        "18px 10px",
        background:     hovered ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
        border:         hovered ? "1px solid rgba(217,119,6,0.30)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius:   14,
        cursor:         "pointer",
        transition:     "background 0.18s, border-color 0.18s, transform 0.18s",
        transform:      hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <div style={{
        width:          38,
        height:         38,
        borderRadius:   11,
        background:     amber || hovered
          ? "rgba(217,119,6,0.22)"
          : "rgba(255,255,255,0.08)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        transition:     "background 0.18s",
      }}>
        <Icon size={18} color={amber || hovered ? "#FFB347" : "rgba(255,255,255,0.55)"} />
      </div>
      <span style={{
        fontFamily: INTER,
        fontSize:   "0.76rem",
        fontWeight: 500,
        color:      hovered ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.60)",
        textAlign:  "center",
        lineHeight: 1.3,
        transition: "color 0.18s",
      }}>
        {label}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   HeroPanel — the right-side dark card
════════════════════════════════════════════════════════════════════ */
export default function HeroPanel() {
  return (
    <div style={{
      width:          "100%",
      display:        "flex",
      justifyContent: "center",
      alignItems:     "center",
      padding:        "20px 48px 20px 16px",
    }}>
      <div style={{
        background:   "#0f172a",
        borderRadius: 24,
        padding:      "38px 32px 36px",
        width:        "100%",
        maxWidth:     460,
        boxShadow:    "0 40px 90px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.05)",
        position:     "relative",
        overflow:     "hidden",
      }}>

        {/* Subtle amber radial bleed — top right corner */}
        <div style={{
          position:     "absolute",
          top:          -60,
          right:        -60,
          width:        220,
          height:       220,
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(217,119,6,0.22) 0%, transparent 70%)",
          pointerEvents:"none",
        }} />

        {/* ── Heading ── */}
        <p style={{
          fontFamily:   INTER,
          fontSize:     "0.72rem",
          fontWeight:   700,
          textTransform:"uppercase",
          letterSpacing:"0.16em",
          color:        "rgba(255,179,71,0.85)",
          margin:       "0 0 10px",
        }}>
          ADLTrack Care OS
        </p>

        <h2 style={{
          fontFamily:    FUSTAT,
          fontWeight:    800,
          fontSize:      "clamp(1.45rem, 2.4vw, 1.80rem)",
          lineHeight:    1.18,
          color:         "#ffffff",
          margin:        "0 0 6px",
          letterSpacing: "-0.5px",
        }}>
          Care tools at your fingertips.
        </h2>

        <p style={{
          fontFamily: INTER,
          fontSize:   "0.86rem",
          color:      "rgba(255,255,255,0.48)",
          margin:     "0 0 22px",
          lineHeight: 1.55,
        }}>
          Everything your family needs to stay connected to care.
        </p>

        {/* ── Search bar (decorative) ── */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          10,
          background:   "rgba(255,255,255,0.07)",
          border:       "1px solid rgba(255,255,255,0.11)",
          borderRadius: 10,
          padding:      "11px 14px",
          marginBottom: 14,
          cursor:       "text",
        }}>
          <Search size={15} color="rgba(255,255,255,0.35)" />
          <span style={{
            fontFamily: INTER,
            fontSize:   "0.86rem",
            color:      "rgba(255,255,255,0.32)",
          }}>
            Search for a patient or caregiver…
          </span>
        </div>

        {/* ── Quick-action pill buttons ── */}
        <div style={{
          display:      "flex",
          flexWrap:     "wrap",
          gap:          8,
          marginBottom: 26,
        }}>
          {PILLS.map(label => <ActionPill key={label} label={label} />)}
        </div>

        {/* Divider */}
        <div style={{
          height:       1,
          background:   "rgba(255,255,255,0.07)",
          marginBottom: 22,
        }} />

        {/* ── 3×2 feature icon grid ── */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap:                 10,
        }}>
          {FEATURES.map(f => (
            <FeatureTile key={f.label} {...f} />
          ))}
        </div>

      </div>
    </div>
  );
}

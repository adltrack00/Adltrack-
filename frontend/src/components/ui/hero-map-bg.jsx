/**
 * HeroMapBg — Globe-style dotted background with plain circle markers.
 *
 * • Large stipple-filled sphere (same right-side footprint as the old flat map)
 * • Latitude + longitude grid lines for globe depth
 * • Radial gradient shading for 3D sphere feel
 * • 5 plain circle markers over US city positions
 */

import React from "react";

/* ── City marker positions (% of full hero container) ─────────────── */
const LOCATIONS = [
  { id: 0, x: "72%", y: "28%", large: false },  // New York
  { id: 1, x: "60%", y: "30%", large: false },  // Chicago
  { id: 2, x: "65%", y: "45%", large: true  },  // Atlanta (anchor)
  { id: 3, x: "69%", y: "57%", large: false },  // Miami
  { id: 4, x: "52%", y: "50%", large: false },  // Houston
];

/* ── Marker — plain circle dot ─────────────────────────────────────── */
function Marker({ large }) {
  return (
    <div style={{
      width:        large ? 18 : 12,
      height:       large ? 18 : 12,
      borderRadius: "50%",
      background:   large ? "#0f172a" : "rgba(22,163,74,0.85)",
      border:       large ? "2px solid rgba(255,255,255,0.55)" : "2px solid rgba(255,255,255,0.70)",
      boxShadow:    large
        ? "0 0 0 5px rgba(15,23,42,0.18)"
        : "0 0 0 4px rgba(22,163,74,0.18)",
      flexShrink: 0,
    }} />
  );
}

/* ── Globe constants ────────────────────────────────────────────────── */
const CX = 500, CY = 450, R = 455;

/* Latitude rings: dy offsets from equator, clipped to globe radius */
const LAT_OFFSETS = [-370, -280, -180, -75, 75, 180, 280, 370]
  .filter(dy => Math.abs(dy) < R);

/* Longitude ellipses: rotation angles (each one passes through poles) */
const LONG_ANGLES = [0, 22, 44, 66, 88, 110, 132, 154];

/* ── Main component ─────────────────────────────────────────────────── */
export default function HeroMapBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>

      {/* ── Globe SVG — right 66 % of hero ── */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          right: 0, top: 0,
          width: "66%", height: "100%",
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Stipple dot tile */}
          <pattern id="stipple" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="2.8" cy="2.8" r="1.5" fill="rgba(74,222,128,0.52)" />
          </pattern>

          {/* Clip everything to the sphere circle */}
          <clipPath id="globeClip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>

          {/* Soft outer glow */}
          <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="70%"  stopColor="rgba(74,222,128,0)" />
            <stop offset="100%" stopColor="rgba(74,222,128,0.12)" />
          </radialGradient>

          {/* 3-D sphere shading — highlight top-left, darken bottom-right */}
          <radialGradient id="sphereShade" cx="33%" cy="27%" r="68%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.14)" />
            <stop offset="50%"  stopColor="rgba(255,255,255,0)"    />
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)"       />
          </radialGradient>
        </defs>

        {/* Outer atmospheric glow ring */}
        <circle cx={CX} cy={CY} r={R + 28}
          fill="none"
          stroke="rgba(74,222,128,0.10)"
          strokeWidth={28}
          style={{ filter: "blur(14px)" }}
        />

        {/* Globe base — stipple dots fill the sphere */}
        <circle cx={CX} cy={CY} r={R} fill="url(#stipple)" />

        {/* ── Latitude rings ── */}
        {LAT_OFFSETS.map(dy => {
          const rx = Math.sqrt(R * R - dy * dy);
          const ry = rx * 0.20; // perspective foreshortening
          return (
            <ellipse key={dy}
              cx={CX} cy={CY + dy}
              rx={rx} ry={ry}
              fill="none"
              stroke="rgba(74,222,128,0.28)"
              strokeWidth="1.1"
              clipPath="url(#globeClip)"
            />
          );
        })}

        {/* ── Longitude meridians (thin ellipses rotated through poles) ── */}
        {LONG_ANGLES.map(angle => (
          <ellipse key={angle}
            cx={CX} cy={CY}
            rx={R * 0.14} ry={R}
            fill="none"
            stroke="rgba(74,222,128,0.22)"
            strokeWidth="1.0"
            transform={`rotate(${angle}, ${CX}, ${CY})`}
            clipPath="url(#globeClip)"
          />
        ))}

        {/* 3-D shading overlay */}
        <circle cx={CX} cy={CY} r={R} fill="url(#sphereShade)" />

        {/* Crisp globe edge */}
        <circle cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(74,222,128,0.40)"
          strokeWidth="1.5"
        />
      </svg>

      {/* ── City markers (absolute over full hero) ── */}
      <div style={{ position: "absolute", inset: 0 }}>
        {LOCATIONS.map(loc => (
          <div key={loc.id} style={{
            position:  "absolute",
            left:      loc.x,
            top:       loc.y,
            transform: "translate(-50%, -50%)",
          }}>
            <Marker large={loc.large} />
          </div>
        ))}
      </div>

    </div>
  );
}

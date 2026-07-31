import React from "react";

/* ── Care Network ─────────────────────────────────────────────────
   An animated SVG network of care relationships.
   Nodes: Care Hub · Family · Caregiver · Doctor · Agency · Nurse · Medicare
   Edges: lines with flowing dashes + traveling dot packets
   All animations: pure CSS / SVG SMIL — no JS loop, no canvas.
──────────────────────────────────────────────────────────────────── */

const VB = 320; // square viewBox

const NODES = [
  { id: 0, x: 160, y: 152, r: 20, label: "Care Hub",  color: "#d97706", glow: "rgba(217,119,6,0.45)",  pulseDur: "2.8s", pulseDelay: "0s"   },
  { id: 1, x:  56, y:  82, r: 13, label: "Family",    color: "#f59e0b", glow: "rgba(245,158,11,0.38)", pulseDur: "3.2s", pulseDelay: "0.6s" },
  { id: 2, x: 258, y:  72, r: 14, label: "Caregiver", color: "#fb923c", glow: "rgba(251,146,60,0.38)", pulseDur: "3.8s", pulseDelay: "1.1s" },
  { id: 3, x: 270, y: 232, r: 13, label: "Doctor",    color: "#ea580c", glow: "rgba(234,88,12,0.38)",  pulseDur: "3.0s", pulseDelay: "1.8s" },
  { id: 4, x:  58, y: 236, r: 12, label: "Family",    color: "#fbbf24", glow: "rgba(251,191,36,0.38)", pulseDur: "3.5s", pulseDelay: "0.9s" },
  { id: 5, x: 172, y: 290, r: 11, label: "Agency",    color: "#f97316", glow: "rgba(249,115,22,0.35)", pulseDur: "4.0s", pulseDelay: "0.3s" },
  { id: 6, x: 108, y:  28, r: 11, label: "Nurse",     color: "#d97706", glow: "rgba(217,119,6,0.32)",  pulseDur: "3.4s", pulseDelay: "1.5s" },
  { id: 7, x: 222, y: 280, r: 10, label: "Medicare",  color: "#f59e0b", glow: "rgba(245,158,11,0.30)", pulseDur: "3.7s", pulseDelay: "2.1s" },
];

const EDGES = [
  { id: "e01", a: 0, b: 1, dashDur: "3.2s", dashDelay: "0s",   pkDur: "3.8s", pkDelay: "0.0s" },
  { id: "e02", a: 0, b: 2, dashDur: "3.5s", dashDelay: "0.4s", pkDur: "3.2s", pkDelay: "0.5s" },
  { id: "e03", a: 0, b: 3, dashDur: "4.0s", dashDelay: "0.8s", pkDur: "4.0s", pkDelay: "1.0s" },
  { id: "e04", a: 0, b: 4, dashDur: "3.8s", dashDelay: "1.2s", pkDur: "3.6s", pkDelay: "1.5s" },
  { id: "e05", a: 0, b: 5, dashDur: "3.6s", dashDelay: "1.6s", pkDur: "4.2s", pkDelay: "0.8s" },
  { id: "e06", a: 0, b: 6, dashDur: "3.0s", dashDelay: "0.2s", pkDur: "3.4s", pkDelay: "0.3s" },
  { id: "e07", a: 0, b: 7, dashDur: "4.2s", dashDelay: "0.6s", pkDur: "4.6s", pkDelay: "1.8s" },
  { id: "e14", a: 1, b: 4, dashDur: "3.4s", dashDelay: "1.0s", pkDur: "3.9s", pkDelay: "2.2s" },
  { id: "e16", a: 1, b: 6, dashDur: "3.1s", dashDelay: "0.5s", pkDur: "3.1s", pkDelay: "0.6s" },
  { id: "e23", a: 2, b: 3, dashDur: "3.9s", dashDelay: "1.4s", pkDur: "4.3s", pkDelay: "1.3s" },
  { id: "e45", a: 4, b: 5, dashDur: "3.3s", dashDelay: "0.9s", pkDur: "3.7s", pkDelay: "2.0s" },
  { id: "e37", a: 3, b: 7, dashDur: "3.7s", dashDelay: "1.7s", pkDur: "4.1s", pkDelay: "0.9s" },
];

/* Small ambient background particles */
const PARTICLES = [
  { cx:  24, cy: 140, r: 1.5, op: 0.4, dur: "5.0s", delay: "0s"   },
  { cx: 296, cy: 155, r: 1.2, op: 0.3, dur: "6.5s", delay: "1.0s" },
  { cx:  90, cy: 310, r: 1.0, op: 0.3, dur: "4.5s", delay: "0.5s" },
  { cx: 232, cy:  15, r: 1.3, op: 0.4, dur: "7.0s", delay: "1.5s" },
  { cx: 310, cy:  95, r: 1.0, op: 0.25,dur: "5.5s", delay: "0.8s" },
  { cx:  40, cy: 300, r: 1.1, op: 0.3, dur: "6.0s", delay: "2.0s" },
  { cx: 280, cy: 315, r: 0.9, op: 0.25,dur: "4.8s", delay: "1.2s" },
  { cx: 140, cy:   8, r: 1.2, op: 0.3, dur: "5.8s", delay: "0.3s" },
];

export default function CareNetwork() {
  return (
    <>
      <style>{`
        /* ── Edge dash flow ── */
        @keyframes dashFlow {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        /* ── Node glow ping ── */
        @keyframes ping {
          0%        { r: 0;  opacity: 0.7; }
          80%, 100% { r: 32; opacity: 0;   }
        }
        /* ── Particle float ── */
        @keyframes floatUp {
          0%        { transform: translateY(0);   opacity: 0;   }
          20%       { opacity: 1; }
          80%       { opacity: 0.6; }
          100%      { transform: translateY(-18px); opacity: 0; }
        }
        /* ── Hub core slow spin ── */
        @keyframes hubSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        /* ── Hub pulse ── */
        @keyframes hubPulse {
          0%, 100% { r: 20; }
          50%      { r: 22; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        width="320"
        height="320"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          {/* Radial gradient for each node */}
          {NODES.map((n) => (
            <radialGradient
              key={`grad-${n.id}`}
              id={`grad-${n.id}`}
              cx="38%" cy="35%" r="65%"
            >
              <stop offset="0%"   stopColor="#fff7ed" stopOpacity="0.9" />
              <stop offset="40%"  stopColor={n.color} stopOpacity="1"   />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.7" />
            </radialGradient>
          ))}

          {/* Drop shadow filter for nodes */}
          <filter id="nodeShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(120,53,15,0.3)" />
          </filter>

          {/* Glow filter for hub */}
          <filter id="hubGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Ambient background particles ── */}
        {PARTICLES.map((p, i) => (
          <circle
            key={`p-${i}`}
            cx={p.cx} cy={p.cy} r={p.r}
            fill="#d97706"
            style={{
              opacity: p.op,
              animation: `floatUp ${p.dur} ease-in-out infinite ${p.delay}`,
            }}
          />
        ))}

        {/* ── Edges — dashed flowing lines ── */}
        {EDGES.map((e) => {
          const a = NODES[e.a], b = NODES[e.b];
          return (
            <g key={e.id}>
              {/* Base static line */}
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="rgba(217,119,6,0.12)"
                strokeWidth="1"
              />
              {/* Animated flowing dashes */}
              <line
                id={e.id}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="rgba(251,146,60,0.55)"
                strokeWidth="0.9"
                strokeDasharray="5 10"
                style={{
                  animation: `dashFlow ${e.dashDur} linear infinite ${e.dashDelay}`,
                }}
              />
              {/* Traveling data packet */}
              <circle r="2.2" fill={a.color} opacity="0.85">
                <animateMotion
                  dur={e.pkDur}
                  begin={e.pkDelay}
                  repeatCount="indefinite"
                  path={`M${a.x},${a.y} L${b.x},${b.y}`}
                />
              </circle>
              {/* Return packet */}
              <circle r="1.6" fill={b.color} opacity="0.65">
                <animateMotion
                  dur={e.pkDur}
                  begin={`calc(${e.pkDur} / 2 + ${e.pkDelay})`}
                  repeatCount="indefinite"
                  path={`M${b.x},${b.y} L${a.x},${a.y}`}
                />
              </circle>
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {NODES.map((n) => (
          <g key={`node-${n.id}`}>
            {/* Outer ping ring */}
            <circle cx={n.x} cy={n.y} r="0" fill="none"
              stroke={n.color} strokeWidth="1" opacity="0"
              style={{
                animation: `ping ${n.pulseDur} ease-out infinite ${n.pulseDelay}`,
                transformOrigin: `${n.x}px ${n.y}px`,
              }}
            />

            {/* Mid glow halo */}
            <circle
              cx={n.x} cy={n.y}
              r={n.r + 6}
              fill={n.glow}
              style={{ filter: "blur(4px)" }}
            />

            {/* Main circle */}
            <circle
              cx={n.x} cy={n.y} r={n.r}
              fill={`url(#grad-${n.id})`}
              filter={n.id === 0 ? "url(#hubGlow)" : "url(#nodeShadow)"}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={n.id === 0 ? "1.5" : "0.8"}
            />

            {/* Specular highlight */}
            <ellipse
              cx={n.x - n.r * 0.3}
              cy={n.y - n.r * 0.3}
              rx={n.r * 0.38}
              ry={n.r * 0.28}
              fill="rgba(255,255,255,0.38)"
              style={{ filter: "blur(1px)" }}
            />

            {/* Label */}
            <text
              x={n.x}
              y={n.y + n.r + 10}
              textAnchor="middle"
              fontSize={n.id === 0 ? "8.5" : "7"}
              fontFamily="'Inter', sans-serif"
              fontWeight={n.id === 0 ? "700" : "500"}
              fill={n.id === 0 ? "#92400e" : "#b45309"}
              opacity="0.85"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </>
  );
}

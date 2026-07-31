import React from "react";

/* ── ConnectedGlobe v3 ──────────────────────────────────────────────
   Rotating Earth globe with small labelled dots orbiting the edge,
   connected back to the globe center by animated dashed lines.
   Clean, minimal — dots only, no large avatar circles.
──────────────────────────────────────────────────────────────────── */

const CX = 180, CY = 180;   // canvas centre
const GR  = 100;             // globe radius  → 200 × 200 globe div
const OR  = 148;             // orbit radius  (dot centres)
const DR  = 7;               // dot radius

const toRad = (d) => (d * Math.PI) / 180;

const NODES = [
  { id:0, angle:-90,  label:"Doctor",           color:"#2563eb" },
  { id:1, angle:-30,  label:"Paid Caregiver",   color:"#059669" },
  { id:2, angle: 30,  label:"Care Agency",      color:"#7c3aed" },
  { id:3, angle: 90,  label:"Patient",          color:"#e11d48" },
  { id:4, angle:150,  label:"Family Caregiver", color:"#d97706" },
  { id:5, angle:-150, label:"Remote Family",    color:"#0891b2" },
];

NODES.forEach(n => {
  n.x = CX + OR * Math.cos(toRad(n.angle));
  n.y = CY + OR * Math.sin(toRad(n.angle));
  /* globe-edge point for the path start */
  n.ex = CX + GR * Math.cos(toRad(n.angle));
  n.ey = CY + GR * Math.sin(toRad(n.angle));
});

/* Gentle outward control point for the dashed arc */
function arcPath(n) {
  const mx  = (n.ex + n.x) / 2;
  const my  = (n.ey + n.y) / 2;
  const cpx = mx + (mx - CX) * 0.22;
  const cpy = my + (my - CY) * 0.22;
  return `M${n.ex},${n.ey} Q${cpx},${cpy} ${n.x},${n.y}`;
}

export default function ConnectedGlobe() {
  return (
    <>
      <style>{`
        @keyframes dotPing {
          0%        { r: 0;  opacity: 0.7; }
          80%, 100% { r: 22; opacity: 0;   }
        }
        @keyframes dashFlow {
          from { stroke-dashoffset: 30; }
          to   { stroke-dashoffset: 0;  }
        }
        @keyframes coreBreath {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1;    }
        }
      `}</style>

      <div style={{ position: "relative", width: 360, height: 360 }}>


        {/* ── SVG: lines + dots + labels ── */}
        <svg
          style={{ position: "absolute", top: 0, left: 0, zIndex: 1, overflow: "visible" }}
          width={360} height={360}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="hubGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%"   stopColor="#fef3c7" />
              <stop offset="40%"  stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>
          </defs>

          {/* Hub glow */}
          <circle cx={CX} cy={CY} r={GR + 14}
            fill="rgba(217,119,6,0.12)" style={{ filter: "blur(12px)" }} />

          {/* Hub circle */}
          <circle cx={CX} cy={CY} r={GR}
            fill="url(#hubGrad)"
            stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />

          {/* Specular highlight */}
          <ellipse cx={CX - 28} cy={CY - 26} rx={44} ry={30}
            fill="rgba(255,255,255,0.18)" style={{ filter: "blur(4px)" }} />

          {/* ADLTrack label */}
          <text x={CX} y={CY - 5} textAnchor="middle"
            fontFamily="'Fustat','Inter',sans-serif"
            fontSize="13" fontWeight="800" fill="white" letterSpacing="0.4"
            style={{ animation: "coreBreath 3.5s ease-in-out infinite" }}>
            ADLTrack
          </text>
          <text x={CX} y={CY + 9} textAnchor="middle"
            fontFamily="'Inter',sans-serif"
            fontSize="7" fontWeight="600"
            fill="rgba(255,255,255,0.72)" letterSpacing="2.2"
            style={{ animation: "coreBreath 3.5s ease-in-out infinite 0.5s" }}>
            CARE OS
          </text>

          {/* ── Connection arcs ── */}
          {NODES.map(n => {
            const path = arcPath(n);
            return (
              <g key={n.id}>
                {/* Glow backing */}
                <path d={path} fill="none" stroke={n.color} strokeWidth="3.5" opacity="0.10" />
                {/* Animated dashes */}
                <path d={path} fill="none"
                  stroke={n.color} strokeWidth="1.1"
                  strokeDasharray="4 8" opacity="0.70"
                  style={{ animation: `dashFlow 3s linear infinite ${n.id * 0.5}s` }}
                />
                {/* Traveling packet: globe → dot */}
                <circle r="2.4" fill={n.color} opacity="0.90">
                  <animateMotion dur={`${3.2 + n.id * 0.3}s`} begin={`${n.id * 0.6}s`}
                    repeatCount="indefinite" path={path} />
                </circle>
                {/* Return packet: dot → globe */}
                <circle r="1.6" fill={n.color} opacity="0.60">
                  <animateMotion dur={`${3.2 + n.id * 0.3}s`}
                    begin={`${(3.2 + n.id * 0.3) / 2 + n.id * 0.6}s`}
                    repeatCount="indefinite"
                    path={`M${n.x},${n.y} Q${(n.ex+n.x)/2+(((n.ex+n.x)/2)-CX)*0.22},${(n.ey+n.y)/2+(((n.ey+n.y)/2)-CY)*0.22} ${n.ex},${n.ey}`}
                  />
                </circle>
              </g>
            );
          })}

          {/* ── Dots + labels ── */}
          {NODES.map(n => {
            const above  = n.y < CY;
            const anchor = n.x < CX - 10 ? "end" : n.x > CX + 10 ? "start" : "middle";
            const lx     = anchor === "end"   ? n.x - DR - 6
                         : anchor === "start" ? n.x + DR + 6
                         :                     n.x;
            const ly     = above ? n.y - DR - 6 : n.y + DR + 12;

            return (
              <g key={n.id}>
                {/* Ping ring */}
                <circle cx={n.x} cy={n.y} r="0" fill="none"
                  stroke={n.color} strokeWidth="1.2" opacity="0"
                  style={{
                    animation: `dotPing ${2.8 + n.id * 0.2}s ease-out infinite ${n.id * 0.7}s`,
                    transformOrigin: `${n.x}px ${n.y}px`,
                  }}
                />

                {/* Glow halo */}
                <circle cx={n.x} cy={n.y} r={DR + 6}
                  fill={n.color} opacity="0.22"
                  style={{ filter: "blur(5px)" }}
                />

                {/* White ring */}
                <circle cx={n.x} cy={n.y} r={DR + 2} fill="white" opacity="0.95" />

                {/* Coloured dot */}
                <circle cx={n.x} cy={n.y} r={DR} fill={n.color} />

                {/* Label */}
                <text x={lx} y={ly}
                  textAnchor={anchor}
                  fontFamily="'Inter',sans-serif"
                  fontSize="9.5" fontWeight="700"
                  fill="#0f172a">
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}

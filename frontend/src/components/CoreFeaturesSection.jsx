import React, { useState } from "react";
import { Sparkles, Code2, FolderOpen, Users, ArrowRight } from "lucide-react";

const INTER  = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const FUSTAT = "'Fustat', 'Inter', sans-serif";
const AMBER  = "#e8924a";          /* indicator line + active accents   */
const CARD_BG = "#ffffff";         /* pure white — matches page background */

/* ── Feature data ──────────────────────────────────────────────── */
const FEATURES = [
  {
    title: "Real-Time Documentation",
    description:
      "Caregivers document care as it happens — photos, vitals, and notes instantly visible to families and healthcare providers.",
    icon: Sparkles,
  },
  {
    title: "Family Connectivity",
    description:
      "Bring families into the care experience with shared updates, built-in messaging, and real-time visibility from anywhere in the world.",
    icon: Users,
  },
  {
    title: "Data-Driven Care Reports",
    description:
      "Transform daily caregiving into structured health reports — giving doctors accurate timelines, trends, and documented incidents.",
    icon: FolderOpen,
  },
  {
    title: "Care Accountability",
    description:
      "Every task is verified, timestamped, and reviewable. Families gain confidence; agencies gain protection; caregivers gain recognition.",
    icon: Code2,
  },
];

/* ── Feature card ──────────────────────────────────────────────── */
function FeatureCard({ feature, isActive, onClick }) {
  const Icon = feature.icon;
  return (
    <div
      onClick={onClick}
      style={{
        background:   CARD_BG,
        borderRadius: 16,
        border:       isActive
          ? `1.5px solid rgba(232,146,74,0.40)`
          : "1.5px solid rgba(0,0,0,0.00)",
        boxShadow: isActive
          ? "0 8px 28px rgba(232,146,74,0.12), 0 2px 8px rgba(0,0,0,0.04)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        padding:      "28px 24px 24px",
        minHeight:    220,
        display:      "flex",
        flexDirection:"column",
        justifyContent:"flex-start",
        cursor:       "pointer",
        transition:   "box-shadow 0.22s, border-color 0.22s",
        position:     "relative",
        overflow:     "hidden",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(232,146,74,0.10)",
        borderRadius: 12,
        marginBottom: 16,
      }}>
        <Icon
          size={24}
          color={AMBER}
          strokeWidth={1.6}
          style={{ filter: "drop-shadow(0 3px 6px rgba(232,146,74,0.28))" }}
        />
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily:    FUSTAT,
        fontWeight:    700,
        fontSize:      "1rem",
        color:         "#0f172a",
        lineHeight:    1.3,
        letterSpacing: "-0.02em",
        margin:        "0 0 10px",
      }}>
        {feature.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: INTER,
        fontSize:   "0.875rem",
        color:      "#374151",
        lineHeight: 1.65,
        margin:     0,
      }}>
        {feature.description}
      </p>

      {/* Subtle warm tint overlay on active */}
      {isActive && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(circle at 10% 10%, rgba(232,146,74,0.06) 0%, transparent 65%)",
          borderRadius: 16,
        }} />
      )}
    </div>
  );
}

/* ── Left list item ────────────────────────────────────────────── */
function ListItem({ feature, isActive, index, total, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display:  "flex",
        gap:      20,
        cursor:   "pointer",
        userSelect:"none",
      }}
    >
      {/* Vertical track + amber fill */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
        {/* Top connector (not shown on first item) */}
        <div style={{
          width: 2,
          height: index === 0 ? 0 : 16,
          background: isActive ? AMBER : "#e2e8f0",
          transition: "background 0.22s",
        }} />
        {/* Dot */}
        <div style={{
          width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
          background: isActive ? AMBER : "#e2e8f0",
          boxShadow:  isActive ? `0 0 0 3px rgba(232,146,74,0.18)` : "none",
          transition: "background 0.22s, box-shadow 0.22s",
        }} />
        {/* Bottom connector (not shown on last item) */}
        <div style={{
          width: 2,
          flex: 1,
          minHeight: 24,
          background: isActive ? AMBER : "#e2e8f0",
          transition: "background 0.22s",
        }} />
      </div>

      {/* Text */}
      <div style={{ paddingBottom: index === total - 1 ? 0 : 28, paddingTop: 0 }}>
        <h3 style={{
          fontFamily:  INTER,
          fontSize:    "1rem",
          fontWeight:  isActive ? 600 : 400,
          color:       isActive ? "#0f172a" : "#475569",
          margin:      "0 0 6px",
          lineHeight:  1.3,
          transition:  "color 0.22s, font-weight 0.18s",
        }}>
          {feature.title}
        </h3>
        {/* Expand description on active */}
        <div style={{
          maxHeight:  isActive ? 80 : 0,
          overflow:   "hidden",
          transition: "max-height 0.30s ease",
        }}>
          <p style={{
            fontFamily: INTER,
            fontSize:   "0.875rem",
            color:      "#374151",
            lineHeight: 1.65,
            margin:     0,
          }}>
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────────── */
export function CoreFeaturesSection({ onNavigateToAuth }) {
  const [active, setActive] = useState(0);

  return (
    <>
      <style>{`
        @media (max-width: 860px) {
          .cf-two-col { grid-template-columns: 1fr !important; }
          .cf-card-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          .cf-card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <section style={{
        background:  "#ffffff",
        fontFamily:  INTER,
        padding:     "80px 40px",
        display:     "flex",
        justifyContent: "center",
      }}>
        <div style={{ maxWidth: 1360, width: "100%" }}>

          <div
            className="cf-two-col"
            style={{
              display:       "grid",
              gridTemplateColumns: "1fr 1.35fr",
              gap:           64,
              alignItems:    "center",
            }}
          >

            {/* ── LEFT: copy + interactive list ── */}
            <div>
              {/* Badge */}
              <p style={{
                display:       "inline-block",
                fontSize:      "0.72rem",
                fontWeight:    600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                background:    "linear-gradient(90deg, #F5C344, #F28482, #B567C2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip: "text",
                color:          "transparent",
                marginBottom:   14,
              }}>
                Core Features
              </p>

              {/* Heading */}
              <h2 style={{
                fontFamily:    FUSTAT,
                fontWeight:    700,
                fontSize:      "clamp(32px, 3.8vw, 52px)",
                lineHeight:    1.08,
                letterSpacing: "-1.5px",
                color:         "#0f172a",
                margin:        "0 0 14px",
              }}>
                Built for Real<br />Home Care
              </h2>

              {/* Subtitle */}
              <p style={{
                fontFamily:  INTER,
                fontSize:    "1rem",
                color:       "#374151",
                lineHeight:  1.65,
                marginBottom: 32,
                maxWidth:    340,
              }}>
                One connected platform for families, caregivers, and healthcare providers — real-time, verified, and built around the people who give and receive care.
              </p>

              {/* CTA */}
              <button
                onClick={() => onNavigateToAuth?.("signup")}
                style={{
                  display:      "inline-flex",
                  alignItems:   "center",
                  gap:          10,
                  padding:      "12px 22px",
                  background:   "#0f172a",
                  border:       "none",
                  borderRadius: 12,
                  fontFamily:   INTER,
                  fontSize:     "0.875rem",
                  fontWeight:   600,
                  color:        "#ffffff",
                  cursor:       "pointer",
                  marginBottom: 48,
                  boxShadow:    "0 4px 18px rgba(15,23,42,0.20)",
                  transition:   "transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform  = "translateY(-1px)";
                  e.currentTarget.style.boxShadow  = "0 8px 24px rgba(15,23,42,0.28)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform  = "translateY(0)";
                  e.currentTarget.style.boxShadow  = "0 4px 18px rgba(15,23,42,0.20)";
                }}
              >
                Get Started
                <ArrowRight size={15} />
              </button>

              {/* Interactive feature list */}
              <div>
                {FEATURES.map((f, i) => (
                  <ListItem
                    key={i}
                    feature={f}
                    index={i}
                    total={FEATURES.length}
                    isActive={active === i}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            </div>

            {/* ── RIGHT: 2×2 card grid ── */}
            <div
              className="cf-card-grid"
              style={{
                display:             "grid",
                gridTemplateColumns: "1fr 1fr",
                gap:                 16,
              }}
            >
              {FEATURES.map((f, i) => (
                <FeatureCard
                  key={i}
                  feature={f}
                  isActive={active === i}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default CoreFeaturesSection;

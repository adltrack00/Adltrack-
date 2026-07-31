// Section 3 — Sticky wallet card left · Scrolling feature blocks right

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import WalletCard from "@/components/ui/wallet-card-2";

const INTER  = "'Inter', -apple-system, sans-serif";
const FUSTAT = "'Fustat', 'Inter', sans-serif";
const GREEN  = "#16a34a";

const INTEGRATIONS = [
  "Nearby care services",    "Support programs",
  "Respite care options",    "Home health agencies",
  "Meal delivery services",  "Transportation help",
  "Mental health resources", "Financial assistance",
];

export function StickyFeaturesSection() {
  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .sf-grid       { grid-template-columns: 1fr !important; }
          .sf-sticky-col { position: static !important; height: auto !important; }
        }
        .sf-learn-link:hover { text-decoration: underline !important; }
      `}</style>

      <section style={{
        background: "#ffffff",
        fontFamily: INTER,
        padding:    "80px 40px",
      }}>
        <div
          className="sf-grid"
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1.15fr",
            maxWidth:            1360,
            margin:              "0 auto",
            alignItems:          "start",
            gap:                 56,
          }}
        >

          {/* ── Left: sticky wallet card ── */}
          <div
            className="sf-sticky-col"
            style={{
              position:       "sticky",
              top:            48,
              height:         "calc(100vh - 96px)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            <WalletCard />
          </div>

          {/* ── Right: scrolling feature blocks ── */}
          <div style={{
            padding:       "24px 0 40px",
            display:       "flex",
            flexDirection: "column",
            gap:           80,
          }}>

            {/* ── Feature block 1: integrations ── */}
            <div>
              <h2 style={{
                fontFamily:    FUSTAT,
                fontWeight:    700,
                fontSize:      "clamp(28px, 3.2vw, 44px)",
                lineHeight:    1.15,
                letterSpacing: "-1px",
                color:         "#0f172a",
                margin:        "0 0 18px",
              }}>
                Local care resources, delivered when you need them
              </h2>
              <p style={{
                fontFamily: INTER,
                fontSize:   "1.025rem",
                color:      "#374151",
                lineHeight: 1.75,
                margin:     "0 0 32px",
                maxWidth:   480,
              }}>
                Caregivers often don't know what help is available around them. ADLTrack closes that gap with real-time updates about nearby services, programs, and resources — so help is never months away.
              </p>

              <div style={{
                display:             "grid",
                gridTemplateColumns: "1fr 1fr",
                gap:                 "12px 32px",
              }}>
                {INTEGRATIONS.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 20, height: 20, flexShrink: 0,
                      borderRadius: "50%",
                      background:   "rgba(22,163,74,0.10)",
                      border:       "1.5px solid rgba(22,163,74,0.30)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Check size={11} color={GREEN} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontFamily: INTER, fontSize: "0.95rem", color: "#1e293b" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Feature block 2: performance ── */}
            <div>
              <h2 style={{
                fontFamily:    FUSTAT,
                fontWeight:    700,
                fontSize:      "clamp(28px, 3.2vw, 44px)",
                lineHeight:    1.15,
                letterSpacing: "-1px",
                color:         "#0f172a",
                margin:        "0 0 18px",
              }}>
                Freedom for families — without losing visibility
              </h2>
              <p style={{
                fontFamily: INTER,
                fontSize:   "1.025rem",
                color:      "#374151",
                lineHeight: 1.75,
                margin:     "0 0 28px",
                maxWidth:   480,
              }}>
                By digitizing and verifying care, ADLTrack allows family members to step away physically — without losing control. Maintain your career, your life, and your peace of mind, knowing care is happening and being recorded.
              </p>

              <a
                href="#"
                className="sf-learn-link"
                style={{
                  display:        "inline-flex",
                  alignItems:     "center",
                  gap:            8,
                  fontFamily:     INTER,
                  fontSize:       "0.95rem",
                  fontWeight:     600,
                  color:          GREEN,
                  textDecoration: "none",
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `1.5px solid ${GREEN}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ArrowRight size={11} color={GREEN} />
                </div>
                See how families stay connected from anywhere
              </a>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default StickyFeaturesSection;

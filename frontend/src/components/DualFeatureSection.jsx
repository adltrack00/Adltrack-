// Section 1 — Dark image left · Two stacked feature blocks right
// Matches: Paystack "Protect yourself" / "Detailed reporting" layout

import React from "react";

const INTER  = "'Inter', -apple-system, sans-serif";
const FUSTAT = "'Fustat', 'Inter', sans-serif";

const FEATURES = [
  {
    title: "Verifiable care data that protects every family",
    body:  "ADLTrack captures real-time, photo-backed care records that families can trust. Every task is timestamped and documented — so there is never any doubt about the care that was delivered.",
  },
  {
    title: "Smarter doctor visits powered by real care data",
    body:  "ADLTrack aggregates daily caregiving into structured health reports — giving physicians accurate timelines, vital sign trends, and documented incidents instead of guesswork and faded memory.",
  },
];

export function DualFeatureSection() {
  return (
    <>
      <style>{`
        @media (max-width: 860px) {
          .df-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .df-img  { max-width: 100% !important; }
        }
        @media (max-width: 600px) {
          .df-section-wrap { padding: 60px 20px !important; }
        }
      `}</style>

      <section
        className="df-section-wrap"
        style={{ background: "#ffffff", fontFamily: INTER, padding: "80px 40px" }}
      >
        <div
          className="df-grid"
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr",
            maxWidth:            1360,
            margin:              "0 auto",
            alignItems:          "stretch",
            gap:                 56,
          }}
        >
          {/* ── Left: warm portrait image — WhatsApp "Say what you feel" sizing ── */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div
              className="df-img"
              style={{
                position:     "relative",
                borderRadius: 28,
                overflow:     "hidden",
                width:        "100%",
                maxWidth:     460,
                aspectRatio:  "4 / 5",
                boxShadow:    "0 12px 48px rgba(0,0,0,0.13)",
                flexShrink:   0,
              }}
            >
              <img
                src="https://images.pexels.com/photos/7446755/pexels-photo-7446755.jpeg?auto=compress&cs=tinysrgb&w=1260"
                alt="Family member monitoring blood pressure at home — verifiable care data"
                style={{
                  width:          "100%",
                  height:         "100%",
                  objectFit:      "cover",
                  objectPosition: "center 25%",
                  display:        "block",
                  filter:         "brightness(1.06) saturate(1.12) contrast(1.04)",
                }}
              />
            </div>
          </div>

          {/* ── Right: two stacked feature blocks ── */}
          <div style={{
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "center",
            gap:            56,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i}>
                <div style={{
                  width: 32, height: 3, borderRadius: 99,
                  background:   "linear-gradient(90deg, #F5C344, #F28482)",
                  marginBottom: 20,
                }} />
                <h2 style={{
                  fontFamily:    FUSTAT,
                  fontWeight:    700,
                  fontSize:      "clamp(22px, 2.4vw, 32px)",
                  lineHeight:    1.2,
                  letterSpacing: "-0.5px",
                  color:         "#0f172a",
                  margin:        "0 0 16px",
                }}>
                  {f.title}
                </h2>
                <p style={{
                  fontFamily: INTER,
                  fontSize:   "1rem",
                  color:      "#374151",
                  lineHeight: 1.75,
                  margin:     0,
                  maxWidth:   440,
                }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

export default DualFeatureSection;

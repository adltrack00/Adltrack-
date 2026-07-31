// Section 2 — Large heading + checklist + link left · Abstract image right
// Matches: Paystack "Build custom payments experiences with well-documented APIs"

import React from "react";
import { Check, ArrowRight } from "lucide-react";

const INTER  = "'Inter', -apple-system, sans-serif";
const FUSTAT = "'Fustat', 'Inter', sans-serif";
const GREEN  = "#16a34a";

const CHECK_ITEMS = [
  "Documented proof of care for Medicaid & Medicare qualification",
  "Verified service delivery — reducing fraud at scale",
  "Structured reports shared instantly with families and providers",
];

export function APIFeaturesSection() {
  return (
    <>
      <style>{`
        @media (max-width: 860px) {
          .api-grid     { grid-template-columns: 1fr !important; gap: 32px !important; }
          .api-img-wrap { min-height: 300px !important; }
        }
        @media (max-width: 600px) {
          .api-section-wrap { padding: 60px 20px !important; }
        }
        .api-link:hover { text-decoration: underline !important; }
      `}</style>

      <section
        className="api-section-wrap"
        style={{ background: "#ffffff", fontFamily: INTER, padding: "80px 40px" }}
      >
        <div
          className="api-grid"
          style={{
            display:             "grid",
            gridTemplateColumns: "1fr 1fr",
            maxWidth:            1360,
            margin:              "0 auto",
            alignItems:          "center",
            gap:                 64,
          }}
        >
          {/* ── Left: text content ── */}
          <div>
            {/* Badge */}
            <p style={{
              display:       "inline-block",
              fontSize:      "0.72rem", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "1px",
              background:    "linear-gradient(90deg, #F5C344, #F28482, #B567C2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip: "text",
              marginBottom:   18,
            }}>
              Medicaid & Government Support
            </p>

            <h2 style={{
              fontFamily:    FUSTAT,
              fontWeight:    700,
              fontSize:      "clamp(28px, 3.4vw, 48px)",
              lineHeight:    1.12,
              letterSpacing: "-1.5px",
              color:         "#0f172a",
              margin:        "0 0 20px",
            }}>
              Care that counts — for Medicaid, for families, for peace of mind
            </h2>

            <p style={{
              fontFamily:  INTER,
              fontSize:    "1.025rem",
              color:       "#374151",
              lineHeight:  1.75,
              margin:      "0 0 36px",
              maxWidth:    480,
            }}>
              Every ADLTrack log is timestamped and verifiable — turning daily care into documentation that helps families qualify for benefits and proves services were actually delivered.
            </p>

            {/* Checklist */}
            <ul style={{
              listStyle: "none", padding: 0, margin: "0 0 36px",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              {CHECK_ITEMS.map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    marginTop: 2, width: 20, height: 20, flexShrink: 0,
                    borderRadius: "50%",
                    background:   "rgba(22,163,74,0.10)",
                    border:       "1.5px solid rgba(22,163,74,0.30)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={11} color={GREEN} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: "0.95rem", color: "#1e293b", lineHeight: 1.55 }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* Link */}
            <a href="#" className="api-link" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: INTER, fontSize: "0.95rem", fontWeight: 600,
              color: GREEN, textDecoration: "none",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `1.5px solid ${GREEN}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ArrowRight size={11} color={GREEN} />
              </div>
              See how ADLTrack helps families qualify for benefits
            </a>
          </div>

          {/* ── Right: contained portrait image — WhatsApp "Say what you feel" sizing ── */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div
              className="api-img-wrap"
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
                src="https://images.pexels.com/photos/29372709/pexels-photo-29372709.jpeg?auto=compress&cs=tinysrgb&w=1260"
                alt="Caregiver and elderly woman at home"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block", filter: "brightness(1.06) saturate(1.12) contrast(1.04)" }}
              />
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

export default APIFeaturesSection;

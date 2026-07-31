import React from "react";
import { Check } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   Shared tokens — used by CaregiversSection below
───────────────────────────────────────────────────────────────── */
const T = {
  bg:    "#ffffff",
  card:  "#ffffff",
  bdr:   "rgba(0,0,0,0.07)",
  h:     "#0f172a",
  body:  "#374151",
  amber: "#d97706",
};
const INTER  = "'Inter', sans-serif";
const FUSTAT = "'Fustat', 'Inter', sans-serif";

/* ─────────────────────────────────────────────────────────────────
   Background images — real caregiver + elderly photos (Pexels)
   Two alternate URLs; first is primary
───────────────────────────────────────────────────────────────── */
const BG_IMGS = [
  "https://images.pexels.com/photos/3791664/pexels-photo-3791664.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/29372745/pexels-photo-29372745.jpeg?auto=compress&cs=tinysrgb&w=1920",
];

/* ═════════════════════════════════════════════════════════════════
   MOTION BACKGROUND
   Ken Burns effect on the Pexels caregiver photo +
   floating ADLTrack UI cards
═════════════════════════════════════════════════════════════════ */
function HeroMotionBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>

      {/* ── Background video — caregiver + patient, slow cinematic playback ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        ref={el => { if (el) el.playbackRate = 0.65; }}
        style={{
          position:       "absolute",
          inset:          0,
          width:          "100%",
          height:         "100%",
          objectFit:      "cover",
          objectPosition: "center 25%",
          display:        "block",
        }}
      >
        <source
          src="https://videos.pexels.com/video-files/8971160/8971160-hd_1920_1080_25fps.mp4"
          type="video/mp4"
        />
        <source
          src="https://videos.pexels.com/video-files/6257868/6257868-hd_1920_1080_25fps.mp4"
          type="video/mp4"
        />
        <source
          src="https://videos.pexels.com/video-files/6257867/6257867-hd_1920_1080_25fps.mp4"
          type="video/mp4"
        />
        {/* Fallback static image */}
        <img
          src={BG_IMGS[0]}
          alt="Caregiver helping elderly man with medication at home"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
        />
      </video>

      {/* ── Sunlight burst — soft subtle glow between the two women ── */}
      <div style={{
        position:      "absolute",
        inset:         0,
        background:    "radial-gradient(ellipse 18% 26% at 54% 37%, rgba(255,245,180,0.32) 0%, rgba(255,210,90,0.12) 45%, transparent 72%)",
        pointerEvents: "none",
        mixBlendMode:  "screen",
      }} />

      {/* ── Left gradient — keeps text readable, right stays bright ── */}
      <div style={{
        position:      "absolute",
        inset:         0,
        background:    "linear-gradient(105deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.24) 46%, rgba(0,0,0,0.02) 72%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Bottom vignette ── */}
      <div style={{
        position:      "absolute",
        inset:         0,
        background:    "linear-gradient(to top, rgba(0,0,0,0.40) 0%, transparent 36%)",
        pointerEvents: "none",
      }} />

    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════
   HERO  — rounded card on white, navbar overlays transparently
═════════════════════════════════════════════════════════════════ */
export default function GlobeScrollDemo() {
  return (
    <>
      <style>{`
        .hero-tray { background: #ffffff; padding: 10px 10px 0; }
        .hero-card {
          position: relative; height: calc(100vh - 74px);
          border-radius: 1.5rem; overflow: hidden;
          display: flex; flex-direction: column; color: #ffffff;
        }
        .hero-body {
          position: relative; z-index: 30; flex: 1;
          display: flex; align-items: flex-end;
          padding: 0 40px 52px;
        }
        .hero-text { max-width: 600px; }
        @media (max-width: 860px) {
          .hero-tray { padding: 8px 8px 0; }
          .hero-card { height: calc(100dvh - 72px); border-radius: 1.25rem; }
          .hero-body { padding: 0 22px 36px; }
          .hero-text { max-width: 100%; }
        }
      `}</style>

      <div className="hero-tray">
      <div className="hero-card">
        <HeroMotionBackground />

        <div className="hero-body">
          <div className="hero-text">

            <p style={{
              fontFamily: INTER, fontSize:"0.72rem", fontWeight:700,
              textTransform:"uppercase", letterSpacing:"0.18em",
              color:"#fbbf24", margin:"0 0 14px",
            }}>
              Home Care, Reimagined
            </p>

            <h1 style={{
              fontFamily: FUSTAT, fontWeight:700,
              fontSize:"clamp(2rem, 4.6vw, 4.2rem)",
              lineHeight:1.10, letterSpacing:"-1px",
              color:"#ffffff", margin:"0 0 18px",
              textShadow:"0 2px 20px rgba(0,0,0,0.50)",
            }}>
              Real-Time Home Care,{" "}
              <span style={{ color:"#fbbf24", border:"2px dotted rgba(251,191,36,0.65)", display:"inline", padding:"0 5px", borderRadius:6 }}>
                Verified
              </span>{" "}
              at Every Step.
            </h1>

            <p style={{
              fontFamily:INTER, fontWeight:400,
              fontSize:"clamp(0.88rem, 1.4vw, 1.025rem)",
              lineHeight:1.70, color:"rgba(255,255,255,0.84)",
              margin:"0 0 6px", maxWidth:"44ch",
              textShadow:"0 1px 8px rgba(0,0,0,0.45)",
            }}>
              We{" "}
              <span style={{ color:"#6ee7b7", border:"2px dotted rgba(52,211,153,0.55)", padding:"0 4px", borderRadius:5 }}>digitize, verify,</span>{" "}
              and connect home care so families stay informed and caregivers
              stay accountable — in{" "}
              <span style={{ color:"#93c5fd", border:"2px dotted rgba(147,197,253,0.55)", padding:"0 4px", borderRadius:5 }}>real time,</span>{" "}
              from anywhere.
            </p>

            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:16 }}>
              <Check size={12} color="#ffffff" style={{ flexShrink:0 }} />
              <span style={{ fontFamily:INTER, fontSize:"0.76rem", color:"rgba(255,255,255,0.60)", textShadow:"0 1px 6px rgba(0,0,0,0.50)" }}>
                HIPAA-compliant photo verification — now available for home care agencies.
              </span>
            </div>

          </div>
        </div>
      </div>{/* /hero-card */}
      </div>{/* /hero-tray */}
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════
   CaregiversSection — rendered by LandingPage.jsx after the hero
═════════════════════════════════════════════════════════════════ */
const CAREGIVER_FEATURES = [
  { title: "Photo Documentation",       description: "Upload photos after each task — medication, wound care, meals — creating a verifiable record families can trust." },
  { title: "Vitals & Incident Reports", description: "Record vital signs, daily activities, and incidents in structured logs built to the same standard as hospital care." },
  { title: "Real-Time Shift Tracking",  description: "Every task, every check-in, every update — timestamped and instantly visible to families, no matter where they are." },
];

export function CaregiversSection() {
  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .cg-section { padding: 60px 20px !important; }
          .cg-card    { padding: 28px 24px !important; }
          .cg-title   { font-size: 1.15rem !important; }
        }
      `}</style>

      <section className="cg-section" style={{ background: T.bg, color: T.h, padding: "80px 40px", fontFamily: INTER }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>

          {/* ── Centered header ── */}
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{
              fontFamily:    INTER,
              fontSize:      "0.72rem",
              fontWeight:    700,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color:         T.amber,
              display:       "block",
              marginBottom:  "1.1rem",
            }}>
              Caregivers
            </span>

            <h2 style={{
              fontFamily:    FUSTAT,
              fontWeight:    700,
              fontSize:      "clamp(2.4rem, 5vw, 4rem)",
              lineHeight:    1.08,
              letterSpacing: "-0.04em",
              color:         T.h,
              margin:        "0 0 1.25rem",
            }}>
              Every Shift<br />
              <span style={{ background: "linear-gradient(135deg,#FFB347,#d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Accounted For
              </span>
            </h2>

            <p style={{
              fontFamily: INTER,
              color:      T.body,
              lineHeight: 1.7,
              fontSize:   "1.05rem",
              fontWeight: 300,
              maxWidth:   "52ch",
              margin:     "0 auto",
            }}>
              Paid caregivers use ADLTrack like a lightweight clinical system — photo uploads, incident reports, and vital signs captured in real time so families are never in the dark.
            </p>
          </div>

          {/* ── Large full-width cards ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {CAREGIVER_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="cg-card"
                style={{
                  background:   "#ffffff",
                  border:       "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "1rem",
                  padding:      "2rem 2.5rem",
                  boxShadow:    "0 2px 16px rgba(0,0,0,0.045)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
                  {/* Left: number + title + description */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", flex: 1 }}>
                    <span style={{
                      fontFamily:  FUSTAT,
                      fontSize:    "1rem",
                      fontWeight:  700,
                      color:       T.amber,
                      opacity:     0.6,
                      minWidth:    24,
                      paddingTop:  3,
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3
                        className="cg-title"
                        style={{
                          fontFamily:    FUSTAT,
                          fontWeight:    700,
                          fontSize:      "clamp(1.2rem, 2vw, 1.5rem)",
                          color:         T.h,
                          margin:        "0 0 0.5rem",
                          letterSpacing: "-0.02em",
                          lineHeight:    1.2,
                        }}
                      >
                        {f.title}
                      </h3>
                      <p style={{
                        fontFamily: INTER,
                        fontSize:   "0.975rem",
                        color:      T.body,
                        lineHeight: 1.65,
                        margin:     0,
                      }}>
                        {f.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: amber accent circle */}
                  <div style={{
                    width:        40,
                    height:       40,
                    borderRadius: "50%",
                    border:       `1.5px solid rgba(217,119,6,0.25)`,
                    background:   "rgba(217,119,6,0.06)",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    flexShrink:   0,
                  }}>
                    <span style={{ fontSize: "1.1rem", color: T.amber, lineHeight: 1 }}>+</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

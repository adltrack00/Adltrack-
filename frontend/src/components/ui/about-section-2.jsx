"use client";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

/* ── Type tokens — exactly matching "Enjoy phenomenal performance" ── */
const FUSTAT = "'Fustat', 'Inter', sans-serif";
const INTER  = "'Inter', -apple-system, sans-serif";

const headingStyle = {
  fontFamily:    FUSTAT,
  fontWeight:    700,
  fontSize:      "clamp(28px, 3.2vw, 44px)",
  lineHeight:    1.15,
  letterSpacing: "-1px",
  color:         "#0f172a",
  margin:        0,
};

const bodyStyle = {
  fontFamily: INTER,
  fontSize:   "1.025rem",
  color:      "#374151",
  lineHeight: 1.75,
  margin:     0,
};

export default function AboutSection2() {
  const heroRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.55, duration: 0.72, ease: [0.22, 1, 0.36, 1] },
    }),
    hidden: { filter: "blur(10px)", y: 36, opacity: 0 },
  };

  const textVariants = {
    visible: (i) => ({
      filter: "blur(0px)",
      opacity: 1,
      transition: { delay: i * 0.28, duration: 0.60, ease: "easeOut" },
    }),
    hidden: { filter: "blur(10px)", opacity: 0 },
  };

  return (
    <section
      style={{
        padding:         "80px 40px",
        background:      "#ffffff",
        display:         "flex",
        alignItems:      "flex-end",
        justifyContent:  "center",
        fontFamily:      INTER,
      }}
    >
      <div style={{ maxWidth: 1360, width: "100%" }} ref={heroRef}>

        {/* Eyebrow */}
        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={heroRef}
          customVariants={revealVariants}
          style={{
            fontFamily:    INTER,
            fontSize:      "0.72rem",
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color:         "#d97706",
            marginBottom:  20,
          }}
        >
          Our Mission
        </TimelineContent>

        {/* Animated headline — Fustat, clamp(28px, 3.2vw, 44px) */}
        <TimelineContent
          as="h2"
          animationNum={1}
          timelineRef={heroRef}
          customVariants={revealVariants}
          style={{ ...headingStyle, marginBottom: 32 }}
        >
          We believe every family deserves{" "}

          <TimelineContent
            as="span"
            animationNum={2}
            timelineRef={heroRef}
            customVariants={textVariants}
            style={{
              color:        "#d97706",
              border:       "2px dotted #fbbf24",
              display:      "inline-block",
              padding:      "0 6px",
              borderRadius: 6,
            }}
          >
            real-time visibility
          </TimelineContent>{" "}

          into the care their loved ones receive — and every caregiver deserves to feel{" "}

          <TimelineContent
            as="span"
            animationNum={3}
            timelineRef={heroRef}
            customVariants={textVariants}
            style={{
              color:        "#f43f5e",
              border:       "2px dotted #fb7185",
              display:      "inline-block",
              padding:      "0 6px",
              borderRadius: 6,
            }}
          >
            seen and supported.
          </TimelineContent>{" "}

          Our mission is to{" "}

          <TimelineContent
            as="span"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={textVariants}
            style={{
              color:        "#059669",
              border:       "2px dotted #34d399",
              display:      "inline-block",
              padding:      "0 6px",
              borderRadius: 6,
            }}
          >
            digitize, verify,
          </TimelineContent>{" "}

          and connect home care so that{" "}

          <TimelineContent
            as="span"
            animationNum={5}
            timelineRef={heroRef}
            customVariants={textVariants}
            style={{
              color:        "#0284c7",
              border:       "2px dotted #38bdf8",
              display:      "inline-block",
              padding:      "0 6px",
              borderRadius: 6,
            }}
          >
            no one is left in the dark.
          </TimelineContent>
        </TimelineContent>

        {/* Bottom row — tagline + CTA */}
        <div
          style={{
            display:        "flex",
            flexWrap:       "wrap",
            gap:            16,
            justifyContent: "space-between",
            alignItems:     "center",
            marginTop:      12,
          }}
        >
          <TimelineContent
            as="div"
            animationNum={6}
            timelineRef={heroRef}
            customVariants={textVariants}
          >
            <div style={{ ...bodyStyle, fontWeight: 600, color: "#0f172a", marginBottom: 2 }}>
              We are ADLTrack — and we are
            </div>
            <div style={{
              fontFamily:    INTER,
              fontSize:      "0.82rem",
              fontWeight:    600,
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              color:         "#374151",
            }}>
              taking care further
            </div>
          </TimelineContent>

          <TimelineContent
            as="a"
            animationNum={7}
            timelineRef={heroRef}
            customVariants={textVariants}
            href="#"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              padding:        "12px 24px",
              background:     "linear-gradient(135deg, #FFB347 0%, #f97316 100%)",
              color:          "#fff",
              fontFamily:     INTER,
              fontSize:       "0.875rem",
              fontWeight:     700,
              borderRadius:   99,
              boxShadow:      "0 6px 20px rgba(249,115,22,0.30)",
              textDecoration: "none",
              transition:     "transform 0.18s, box-shadow 0.18s",
              cursor:         "pointer",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform  = "translateY(-2px)";
              e.currentTarget.style.boxShadow  = "0 10px 28px rgba(249,115,22,0.40)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform  = "translateY(0)";
              e.currentTarget.style.boxShadow  = "0 6px 20px rgba(249,115,22,0.30)";
            }}
          >
            <ArrowRight size={15} strokeWidth={2.5} />
            About ADLTrack
          </TimelineContent>
        </div>

      </div>
    </section>
  );
}

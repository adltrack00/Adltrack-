import React from "react";

/* ── WarmOrb ───────────────────────────────────────────────────────
   A luminous amber-rose sphere with realistic lighting, a breathing
   pulse, and a soft multi-layer halo. Replaces the Earth globe as the
   hero background visual — warmer, more on-brand for a care platform.
──────────────────────────────────────────────────────────────────── */

const WarmOrb = () => (
  <>
    <style>{`
      @keyframes orbBreath {
        0%, 100% { transform: scale(1);    opacity: 1;    }
        50%       { transform: scale(1.04); opacity: 0.92; }
      }
      @keyframes haloBreath {
        0%, 100% { opacity: 0.55; transform: scale(1);    }
        50%       { opacity: 0.85; transform: scale(1.06); }
      }
      @keyframes haloBreath2 {
        0%, 100% { opacity: 0.30; transform: scale(1);    }
        50%       { opacity: 0.55; transform: scale(1.10); }
      }
      @keyframes shimmerDrift {
        0%        { transform: translate(-8%, -8%);  opacity: 0.55; }
        50%       { transform: translate(6%,  6%);   opacity: 0.85; }
        100%      { transform: translate(-8%, -8%);  opacity: 0.55; }
      }
      @keyframes spotDrift {
        0%        { transform: translate(0, 0);      opacity: 0.25; }
        50%       { transform: translate(-6%, -4%);  opacity: 0.45; }
        100%      { transform: translate(0, 0);      opacity: 0.25; }
      }
    `}</style>

    {/* ── Outer ambient halo (largest, softest) ── */}
    <div style={{
      position: "absolute",
      inset: "-80px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(251,146,60,0.18) 0%, rgba(217,119,6,0.08) 45%, transparent 70%)",
      animation: "haloBreath2 7s ease-in-out infinite",
      pointerEvents: "none",
    }} />

    {/* ── Mid halo ── */}
    <div style={{
      position: "absolute",
      inset: "-36px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(251,146,60,0.28) 0%, rgba(234,88,12,0.12) 50%, transparent 72%)",
      animation: "haloBreath 5s ease-in-out infinite 0.6s",
      pointerEvents: "none",
    }} />

    {/* ── Inner glow ring ── */}
    <div style={{
      position: "absolute",
      inset: "-12px",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 65%)",
      animation: "haloBreath 4s ease-in-out infinite 1.2s",
      pointerEvents: "none",
    }} />

    {/* ── Main sphere ── */}
    <div style={{
      position: "relative",
      width:  "260px",
      height: "260px",
      borderRadius: "50%",
      background: `
        radial-gradient(
          circle at 36% 32%,
          #fff7ed  0%,
          #fed7aa 16%,
          #fb923c 36%,
          #ea580c 58%,
          #c2410c 76%,
          #7c2d12 100%
        )
      `,
      boxShadow: `
        0   0  80px rgba(251,146,60,0.40),
        0  24px 70px rgba(234,88,12,0.28),
        inset -48px -36px 70px rgba(124,45,18,0.65),
        inset  18px  18px 48px rgba(255,237,213,0.38)
      `,
      animation: "orbBreath 6s ease-in-out infinite",
      overflow: "hidden",
      flexShrink: 0,
    }}>

      {/* Primary specular highlight — top-left */}
      <div style={{
        position: "absolute",
        top: "7%", left: "9%",
        width: "46%", height: "40%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.50) 0%, transparent 72%)",
        animation: "shimmerDrift 7s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Secondary warm spot — lower-right */}
      <div style={{
        position: "absolute",
        bottom: "14%", right: "12%",
        width: "28%", height: "22%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,200,80,0.35) 0%, transparent 70%)",
        animation: "spotDrift 5s ease-in-out infinite 1s",
        pointerEvents: "none",
      }} />

      {/* Edge rim light — simulates a subtle backlight */}
      <div style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        boxShadow: "inset 0 0 0 1.5px rgba(255,200,100,0.18)",
        pointerEvents: "none",
      }} />
    </div>
  </>
);

export default WarmOrb;

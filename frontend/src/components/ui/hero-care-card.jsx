/**
 * HeroCareCard — same visual DNA as WalletCard:
 *   • #F4F8F9 base with radial accent bleeds from the top
 *   • borderRadius 20, shadow 0 10px 30px -10px rgba(0,0,0,0.10)
 *   • framer-motion fade-up (same easing + useInView trigger)
 * Content is ADLTrack-specific: care shifts, family status, task log.
 */

import React from "react";
import { motion, useInView } from "framer-motion";
import {
  Heart, Users, Activity, Camera,
  Bell, Clock, ShieldCheck, CheckCircle,
} from "lucide-react";

const INTER = "'Inter', -apple-system, sans-serif";

/* ── Radial gradient presets — exact same as WalletCard ── */
const G = {
  amber:  "radial-gradient(circle at 50% 0%, #FFB347 0%, #F9ED96 36%, #F4F8F9 68%, #F4F8F9 100%)",
  teal:   "radial-gradient(circle at 50% 0%, #67e8f9 0%, #a5f3fc 36%, #F4F8F9 68%, #F4F8F9 100%)",
  rose:   "radial-gradient(circle at 50% 0%, #fda4af 0%, #fecdd3 36%, #F4F8F9 68%, #F4F8F9 100%)",
  purple: "radial-gradient(circle at 50% 0%, #E5A1F5 0%, #F8ACA0 36%, #F4F8F9 68%, #F4F8F9 100%)",
};

/* ── Shared inner card shell (identical to WalletCard's InnerCard) ── */
function InnerCard({ gradient, children }) {
  const [lifted, setLifted] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setLifted(true)}
      onMouseLeave={() => setLifted(false)}
      style={{
        background:  gradient,
        borderRadius: 16,
        padding:     "14px 16px",
        boxShadow:   lifted
          ? "0 14px 36px -8px rgba(0,0,0,0.14)"
          : "0 4px 16px -4px rgba(0,0,0,0.08)",
        transform:   lifted ? "translateY(-2px)" : "translateY(0)",
        transition:  "box-shadow 0.22s ease, transform 0.22s ease",
        cursor:      "pointer",
      }}
    >
      {children}
    </div>
  );
}

export default function HeroCareCard() {
  const ref    = React.useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.50, ease: [0.16, 1, 0.3, 1] }}
      style={{
        maxWidth:      400,
        width:         "100%",
        background:    "#F4F8F9",
        borderRadius:  20,
        padding:       20,
        boxShadow:     "0 10px 30px -10px rgba(0,0,0,0.10)",
        fontFamily:    INTER,
        display:       "flex",
        flexDirection: "column",
        gap:           12,
      }}
    >

      {/* ── Row 1 + 2: header cards (amber Care Hub · teal Family) ── */}
      <InnerCard gradient={G.amber}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"rgba(0,0,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Heart size={15} color="#92400e" />
            </div>
            <span style={{ fontWeight:600, fontSize:"0.875rem", color:"#1e293b" }}>Care Hub</span>
          </div>
          <span style={{ fontWeight:700, fontSize:"0.875rem", color:"#1e293b" }}>2 Active Shifts</span>
        </div>
      </InnerCard>

      <InnerCard gradient={G.teal}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"rgba(0,0,0,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Users size={15} color="#155e75" />
            </div>
            <span style={{ fontWeight:600, fontSize:"0.875rem", color:"#1e293b" }}>Family Connected</span>
          </div>
          <span style={{ fontWeight:700, fontSize:"0.875rem", color:"#1e293b" }}>3 Members</span>
        </div>
      </InnerCard>

      {/* ── Row 3: Today's summary (mirrors Total Balance) ── */}
      <div style={{ background:"#ffffff", borderRadius:16, padding:"16px 18px", border:"1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:"#F4F8F9", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:"#d97706" }} />
            </div>
            <span style={{ fontWeight:600, fontSize:"0.85rem", color:"#475569" }}>Today's Care</span>
            <span style={{ fontSize:"0.72rem", fontWeight:600, color:"#16a34a", background:"#dcfce7", padding:"2px 8px", borderRadius:99 }}>
              Live
            </span>
          </div>
          <Bell size={16} color="#94a3b8" style={{ cursor:"pointer" }} />
        </div>
        <div style={{ fontSize:"2rem", fontWeight:700, color:"#0f172a", letterSpacing:"-0.5px", marginBottom:4 }}>
          8 Tasks Done
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, color:"#d97706" }}>
          <ShieldCheck size={14} />
          <span style={{ fontSize:"0.85rem", fontWeight:600 }}>All verified · 100%</span>
        </div>
      </div>

      {/* ── Row 4: Action buttons (mirrors Deposit / Withdraw / Transfer / History) ── */}
      <div style={{ display:"flex", gap:8 }}>
        <button style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          background: G.rose, border:"none", borderRadius:12, padding:"11px 0",
          fontFamily:INTER, fontSize:"0.85rem", fontWeight:600, color:"#7f1d1d", cursor:"pointer",
          boxShadow:"0 4px 12px -4px rgba(253,164,175,0.30)", transition:"transform 0.15s, box-shadow 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 18px -4px rgba(253,164,175,0.38)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 12px -4px rgba(253,164,175,0.30)"; }}
        >
          <Camera size={14} /> Log Task
        </button>

        <button style={{
          flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          background: G.amber, border:"none", borderRadius:12, padding:"11px 0",
          fontFamily:INTER, fontSize:"0.85rem", fontWeight:600, color:"#78350f", cursor:"pointer",
          boxShadow:"0 4px 12px -4px rgba(255,179,71,0.28)", transition:"transform 0.15s, box-shadow 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 18px -4px rgba(255,179,71,0.36)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 12px -4px rgba(255,179,71,0.28)"; }}
        >
          <Activity size={14} /> Vitals
        </button>

        <button style={{
          width:42, height:42, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
          background:"#F4F8F9", border:"1px solid rgba(0,0,0,0.07)", borderRadius:12, cursor:"pointer", transition:"background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="#edf0f3"}
          onMouseLeave={e => e.currentTarget.style.background="#F4F8F9"}
        >
          <Camera size={15} color="#475569" />
        </button>

        <button style={{
          width:42, height:42, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
          background:"#F4F8F9", border:"1px solid rgba(0,0,0,0.07)", borderRadius:12, cursor:"pointer", transition:"background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="#edf0f3"}
          onMouseLeave={e => e.currentTarget.style.background="#F4F8F9"}
        >
          <Clock size={15} color="#475569" />
        </button>
      </div>

      {/* ── Row 5: Recent activity rows (mirrors Account rows) ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>

        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={inView ? { opacity:1, y:0 } : { opacity:0, y:16 }}
          transition={{ duration:0.45, delay:0.10, ease:[0.16,1,0.3,1] }}
          style={{
            display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
            borderRadius:14, background:"#ffffff", border:"1px solid rgba(0,0,0,0.06)", cursor:"pointer",
          }}
        >
          <div style={{ width:44, height:44, borderRadius:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"radial-gradient(circle at 50% 0%, #FFB347 0%, #F9ED96 60%, #F4F8F9 100%)" }}>
            <Camera size={20} color="#b45309" />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:600, fontSize:"0.88rem", color:"#1e293b", margin:0 }}>Photo Documentation</p>
            <p style={{ fontSize:"0.76rem", color:"#94a3b8", margin:"2px 0 0" }}>Morning medication · 8:24 AM</p>
          </div>
          <CheckCircle size={16} color="#16a34a" />
        </motion.div>

        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={inView ? { opacity:1, y:0 } : { opacity:0, y:16 }}
          transition={{ duration:0.45, delay:0.18, ease:[0.16,1,0.3,1] }}
          style={{
            display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
            borderRadius:14, background:"#ffffff", border:"1px solid rgba(0,0,0,0.06)", cursor:"pointer",
          }}
        >
          <div style={{ width:44, height:44, borderRadius:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:"radial-gradient(circle at 50% 0%, #E5A1F5 0%, #F8ACA0 60%, #F4F8F9 100%)" }}>
            <Activity size={20} color="#7e22ce" />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:600, fontSize:"0.88rem", color:"#1e293b", margin:0 }}>Vitals Recorded</p>
            <p style={{ fontSize:"0.76rem", color:"#94a3b8", margin:"2px 0 0" }}>BP 118/76 · Temp 98.4°F · 9:05 AM</p>
          </div>
          <CheckCircle size={16} color="#16a34a" />
        </motion.div>

      </div>
    </motion.div>
  );
}

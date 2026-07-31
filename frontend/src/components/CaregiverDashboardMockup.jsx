/**
 * CaregiverDashboardMockup
 * Exact replica of the Subbie.world two-phone layout:
 *   Left  phone — behind,  rotate(-12deg), top offset +64px, heavy bottom fade
 *   Right phone — in front, rotate(+4.5deg), no top offset, light bottom fade
 * Phones overlap ~50px; right phone sits over left phone's right edge.
 */

import React from "react";
import {
  Heart, Activity, Thermometer, Frown,
  Home, MessageSquare, Clock, Settings,
  Bell, ChevronRight, CheckCircle, MapPin, Users,
} from "lucide-react";

/* ── Design tokens ── */
const D = {
  bg:    "#0a1929",
  card:  "rgba(255,255,255,0.055)",
  bdr:   "rgba(255,255,255,0.09)",
  h:     "#FFFFFF",
  body:  "rgba(255,255,255,0.58)",
  muted: "rgba(255,255,255,0.32)",
  brand: "#00c896",
  shadow:"0 4px 20px rgba(0,0,0,0.28)",
};

/* ─────────────────────────────────────────
   SHARED: status bar
───────────────────────────────────────── */
const SBar = ({ time = "9:41" }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 20px 4px" }}>
    <span style={{ color:D.h, fontSize:12, fontWeight:600, letterSpacing:"-0.3px" }}>{time}</span>
    <div style={{ display:"flex", gap:5, alignItems:"center" }}>
      {/* signal bars */}
      <div style={{ display:"flex", gap:2, alignItems:"flex-end" }}>
        {[6,9,12].map((h,i)=>(
          <div key={i} style={{ width:3, height:h, background:D.h, borderRadius:2, opacity:i===0?0.38:1 }} />
        ))}
      </div>
      {/* wifi */}
      <svg width="14" height="11" viewBox="0 0 24 18" fill="none">
        <path d="M1 6.5C5.5 2 11 0 12 0s6.5 2 11 6.5" stroke="white" strokeWidth="2.3" strokeLinecap="round" opacity="0.38"/>
        <path d="M4.5 10C7.2 7.5 9.8 6 12 6s4.8 1.5 7.5 4" stroke="white" strokeWidth="2.3" strokeLinecap="round" opacity="0.70"/>
        <path d="M8 13.5c1.2-1.2 2.5-1.8 4-1.8s2.8.6 4 1.8" stroke="white" strokeWidth="2.3" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1.5" fill="white"/>
      </svg>
      {/* battery */}
      <div style={{ display:"flex", alignItems:"center", gap:2 }}>
        <div style={{ width:22, height:11, borderRadius:3.5, border:`1.5px solid ${D.body}`, overflow:"hidden", padding:"1.5px" }}>
          <div style={{ width:"76%", height:"100%", background:D.h, borderRadius:2 }} />
        </div>
        <div style={{ width:2, height:5, background:D.body, borderRadius:1 }} />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   SHARED: iPhone frame shell
   240 px wide · 490 px screen height
   Matches Subbie phone proportions exactly
───────────────────────────────────────── */
function PhoneFrame({ children }) {
  return (
    <div style={{
      position:     "relative",
      width:        240,
      borderRadius: 46,
      background:   "linear-gradient(160deg, #252b38 0%, #0c1017 100%)",
      padding:      "13px 13px 0",
      boxShadow: [
        "0 0 0 1px rgba(255,255,255,0.10)",
        "0 0 0 2.5px rgba(0,0,0,0.25)",
        "0 32px 72px -4px rgba(0,0,0,0.40)",
        "0 10px 28px rgba(0,0,0,0.22)",
        "inset 0 1px 0 rgba(255,255,255,0.12)",
      ].join(", "),
    }}>

      {/* Dynamic Island */}
      <div style={{
        position:"absolute", top:15, left:"50%", transform:"translateX(-50%)",
        width:88, height:25, borderRadius:13,
        background:"#080808", zIndex:20,
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        boxShadow:"inset 0 1px 3px rgba(0,0,0,0.9)",
      }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"#141414" }} />
        <div style={{ width:22, height:8, borderRadius:4, background:"#141414" }} />
      </div>

      {/* Power button */}
      <div style={{
        position:"absolute", right:-4, top:118, width:4, height:48,
        borderRadius:"0 3.5px 3.5px 0",
        background:"linear-gradient(160deg,#272d38,#181d24)",
        boxShadow:"2px 0 5px rgba(0,0,0,0.45)",
      }} />
      {/* Volume up / down */}
      {[76,122].map((top,i)=>(
        <div key={i} style={{
          position:"absolute", left:-4, top,
          width:4, height:34,
          borderRadius:"3.5px 0 0 3.5px",
          background:"linear-gradient(160deg,#272d38,#181d24)",
          boxShadow:"-2px 0 5px rgba(0,0,0,0.45)",
        }} />
      ))}

      {/* Screen */}
      <div style={{
        borderRadius:   34,
        overflow:       "hidden",
        background:     D.bg,
        height:         490,
        position:       "relative",
        fontFamily:     "'Inter','Figtree',system-ui,sans-serif",
      }}>
        {children}
        {/* Home indicator */}
        <div style={{ position:"absolute", bottom:6, left:"50%", transform:"translateX(-50%)", width:70, height:3.5, borderRadius:99, background:"rgba(255,255,255,0.30)" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SCREEN 1 — Caregiver Dashboard Home
   (left phone / behind)
───────────────────────────────────────── */
const VITALS = [
  { label:"BP",    value:"120/80", Icon:Heart,       color:"#f472b6", bg:"rgba(244,114,182,0.10)" },
  { label:"Heart", value:"72bpm",  Icon:Activity,    color:"#fb923c", bg:"rgba(251,146,60,0.10)"  },
  { label:"Temp",  value:"98.6°",  Icon:Thermometer, color:"#60a5fa", bg:"rgba(96,165,250,0.10)"  },
  { label:"Pain",  value:"3/10",   Icon:Frown,       color:"#a78bfa", bg:"rgba(167,139,250,0.10)" },
];
const TASKS = [
  { name:"Medication Administration", time:"8:00 AM",  status:"completed" },
  { name:"Morning Vitals Check",      time:"9:00 AM",  status:"completed" },
  { name:"Mobility Exercise",         time:"10:30 AM", status:"active"    },
  { name:"Meal Preparation",          time:"12:00 PM", status:"pending"   },
];
const NAV1 = [
  { Icon:Home,          label:"Home",   active:true  },
  { Icon:MessageSquare, label:"Chat",   active:false },
  { Icon:Clock,         label:"Shifts", active:false },
  { Icon:Settings,      label:"More",   active:false },
];

function HomeScreen() {
  return (
    <>
      <SBar time="9:41" />

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"2px 18px 7px" }}>
        <div>
          <p style={{ color:D.muted, fontSize:10, margin:0 }}>Good morning,</p>
          <p style={{ color:D.h, fontSize:15, fontWeight:600, margin:0, letterSpacing:"-0.5px" }}>Sarah M.</p>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          <div style={{ width:30, height:30, borderRadius:10, background:D.card, border:`1px solid ${D.bdr}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Bell size={13} color={D.h} />
          </div>
          <div style={{ width:30, height:30, borderRadius:10, overflow:"hidden", boxShadow:`0 0 0 2px ${D.brand}` }}>
            <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#00c896,#9333ea)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontSize:12, fontWeight:700 }}>S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shift badge */}
      <div style={{ padding:"0 16px 9px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:99, background:"rgba(0,200,150,0.10)", border:"1px solid rgba(0,200,150,0.22)" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:D.brand }} />
          <span style={{ color:D.brand, fontSize:9, fontWeight:600 }}>Shift Active · 8:00 AM</span>
          <MapPin size={8} color={D.brand} />
        </div>
      </div>

      {/* Patient card */}
      <div style={{ padding:"0 14px 9px" }}>
        <div style={{ borderRadius:17, overflow:"hidden", height:90, position:"relative", boxShadow:D.shadow }}>
          <img
            src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=600&q=80"
            alt="Patient"
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 20%" }}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.76) 0%,transparent 50%)" }} />
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(to right,#a855f7,#ec4899,#f97316,#eab308,#22c55e,#3b82f6)" }} />
          <div style={{ position:"absolute", bottom:9, left:13, right:13, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <p style={{ color:"#fff", fontSize:13, fontWeight:600, margin:0 }}>Margaret C.</p>
              <p style={{ color:"rgba(255,255,255,0.58)", fontSize:9, margin:0 }}>78 yrs · Room 4B</p>
            </div>
            <ChevronRight size={12} color="rgba(255,255,255,0.5)" />
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div style={{ padding:"0 14px 9px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
          {VITALS.map(({ label, value, Icon, color, bg }) => (
            <div key={label} style={{ background:D.card, border:`1px solid ${D.bdr}`, borderRadius:12, padding:"8px 3px 7px", textAlign:"center" }}>
              <div style={{ width:24, height:24, borderRadius:7, background:bg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 4px" }}>
                <Icon size={11} color={color} />
              </div>
              <p style={{ color:D.h, fontSize:9, fontWeight:600, margin:0 }}>{value}</p>
              <p style={{ color:D.muted, fontSize:8, margin:"2px 0 0" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding:"0 14px 9px" }}>
        <div style={{ background:D.card, border:`1px solid ${D.bdr}`, borderRadius:12, padding:"10px 12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ color:D.body, fontSize:9, fontWeight:600 }}>Today's Progress</span>
            <span style={{ color:D.brand, fontSize:9, fontWeight:700 }}>3 <span style={{ color:D.muted, fontWeight:400 }}>/ 8 tasks</span></span>
          </div>
          <div style={{ height:3.5, borderRadius:99, background:D.bdr, overflow:"hidden" }}>
            <div style={{ width:"37.5%", height:"100%", borderRadius:99, background:"linear-gradient(90deg,#00c896,#facc15)" }} />
          </div>
        </div>
      </div>

      {/* Task tabs */}
      <div style={{ padding:"0 14px 7px" }}>
        <div style={{ display:"flex", gap:4, padding:3, borderRadius:11, background:D.bdr }}>
          {["Requests","Today's Tasks"].map((tab,i)=>(
            <div key={tab} style={{ flex:1, padding:"5px 6px", borderRadius:8, textAlign:"center", background:i===1?D.card:"transparent", border:i===1?`1px solid ${D.bdr}`:"1px solid transparent" }}>
              <span style={{ color:i===1?D.h:D.muted, fontSize:9, fontWeight:600 }}>{tab}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:4 }}>
        {TASKS.slice(0,3).map((task,i)=>(
          <div key={i} style={{
            background: task.status==="active"?"rgba(251,146,60,0.08)":D.card,
            border:`1px solid ${task.status==="active"?"rgba(251,146,60,0.24)":D.bdr}`,
            borderRadius:11, padding:"7px 10px",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0,
              background: task.status==="completed"?D.brand:task.status==="active"?"#fb923c":"rgba(255,255,255,0.20)",
            }} />
            <p style={{
              flex:1, color:task.status==="completed"?D.muted:D.h,
              fontSize:9, fontWeight:task.status==="active"?600:500,
              margin:0, textDecoration:task.status==="completed"?"line-through":"none",
              opacity:task.status==="pending"?0.55:1,
            }}>{task.name}</p>
            <span style={{ color:D.muted, fontSize:8, flexShrink:0 }}>{task.time}</span>
            {task.status==="completed" && <CheckCircle size={9} color={D.brand} />}
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        background:"rgba(6,16,30,0.97)", backdropFilter:"blur(22px)",
        borderTop:`1px solid ${D.bdr}`,
        display:"flex", padding:"9px 0 18px",
      }}>
        {NAV1.map(({ Icon, label, active })=>(
          <div key={label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div style={{ width:28, height:28, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", background:active?"rgba(0,200,150,0.14)":"transparent" }}>
              <Icon size={15} color={active?D.brand:D.muted} />
            </div>
            <span style={{ color:active?D.brand:D.muted, fontSize:8, fontWeight:active?600:400 }}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   SCREEN 2 — Family / Care Updates
   (right phone / front)
───────────────────────────────────────── */
const ACTIVITIES = [
  { time:"8:00 AM", text:"Medication administered",  done:true          },
  { time:"9:00 AM", text:"Morning vitals recorded",  done:true          },
  { time:"10:30",   text:"Exercise session started", done:false, active:true },
  { time:"12:00",   text:"Lunch preparation",        done:false         },
];
const NAV2 = [
  { Icon:Home,          label:"Overview", active:false },
  { Icon:Users,         label:"Family",   active:true  },
  { Icon:MessageSquare, label:"Messages", active:false },
  { Icon:Settings,      label:"More",     active:false },
];

function CareScreen() {
  return (
    <>
      <SBar time="2:09" />

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"2px 18px 7px" }}>
        <div>
          <p style={{ color:D.muted, fontSize:9.5, margin:0 }}>Family View</p>
          <p style={{ color:D.h, fontSize:15, fontWeight:600, margin:0, letterSpacing:"-0.5px" }}>Care Updates</p>
        </div>
        <div style={{ width:30, height:30, borderRadius:10, background:D.card, border:`1px solid ${D.bdr}`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
          <Bell size={13} color={D.h} />
          <div style={{ position:"absolute", top:5, right:5, width:6, height:6, borderRadius:"50%", background:"#f87171", border:"1.5px solid #0a1929" }} />
        </div>
      </div>

      {/* Status row */}
      <div style={{ padding:"0 16px 9px", display:"flex", alignItems:"center", gap:7 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:99, background:"rgba(0,200,150,0.10)", border:"1px solid rgba(0,200,150,0.22)" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:D.brand }} />
          <span style={{ color:D.brand, fontSize:9, fontWeight:600 }}>All Good</span>
        </div>
        <span style={{ color:D.muted, fontSize:8.5 }}>Today · May 23</span>
      </div>

      {/* Patient summary */}
      <div style={{ padding:"0 14px 9px" }}>
        <div style={{ background:D.card, border:`1px solid ${D.bdr}`, borderRadius:15, padding:"11px 13px", display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:46, height:46, borderRadius:13, overflow:"hidden", flexShrink:0, boxShadow:`0 0 0 2.5px ${D.brand}` }}>
            <img
              src="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=200&q=80"
              alt="Patient"
              style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 20%" }}
            />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ color:D.h, fontSize:12, fontWeight:600, margin:0 }}>Margaret C.</p>
            <p style={{ color:D.muted, fontSize:9, margin:"2px 0 4px" }}>78 yrs · Room 4B</p>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:D.brand }} />
              <span style={{ color:D.brand, fontSize:8.5, fontWeight:600 }}>Caregiver on duty</span>
            </div>
          </div>
          <ChevronRight size={13} color={D.muted} />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding:"0 14px 9px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
        <div style={{ background:"rgba(0,200,150,0.08)", border:"1px solid rgba(0,200,150,0.18)", borderRadius:12, padding:"9px 11px", textAlign:"center" }}>
          <p style={{ color:D.brand, fontSize:18, fontWeight:700, margin:0 }}>3</p>
          <p style={{ color:D.muted, fontSize:8.5, margin:"2px 0 0" }}>Tasks Done</p>
        </div>
        <div style={{ background:"rgba(248,113,113,0.07)", border:"1px solid rgba(248,113,113,0.16)", borderRadius:12, padding:"9px 11px", textAlign:"center" }}>
          <p style={{ color:"#f87171", fontSize:18, fontWeight:700, margin:0 }}>0</p>
          <p style={{ color:D.muted, fontSize:8.5, margin:"2px 0 0" }}>Alerts</p>
        </div>
      </div>

      {/* Activity log */}
      <div style={{ padding:"0 14px 9px" }}>
        <p style={{ color:D.body, fontSize:9, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", margin:"0 0 6px" }}>Today's Activity</p>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {ACTIVITIES.map((a,i)=>(
            <div key={i} style={{
              background:a.active?"rgba(251,146,60,0.07)":D.card,
              border:`1px solid ${a.active?"rgba(251,146,60,0.22)":D.bdr}`,
              borderRadius:11, padding:"7px 10px",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", flexShrink:0, background:a.done?D.brand:a.active?"#fb923c":"rgba(255,255,255,0.20)" }} />
              <p style={{ flex:1, color:a.done?D.muted:D.h, fontSize:9, fontWeight:a.active?600:500, margin:0, textDecoration:a.done?"line-through":"none" }}>{a.text}</p>
              <span style={{ color:D.muted, fontSize:8, flexShrink:0 }}>{a.time}</span>
              {a.done && <CheckCircle size={9} color={D.brand} />}
            </div>
          ))}
        </div>
      </div>

      {/* Caregiver message */}
      <div style={{ padding:"0 14px" }}>
        <div style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.20)", borderRadius:12, padding:"9px 11px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <div style={{ width:20, height:20, borderRadius:7, background:"linear-gradient(135deg,#00c896,#9333ea)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontSize:9, fontWeight:700 }}>S</span>
            </div>
            <span style={{ color:D.body, fontSize:9, fontWeight:600 }}>Sarah M. · just now</span>
          </div>
          <p style={{ color:D.body, fontSize:8.5, margin:0, lineHeight:1.55 }}>
            Margaret is doing well. Exercise session underway, vitals stable.
          </p>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        background:"rgba(6,16,30,0.97)", backdropFilter:"blur(22px)",
        borderTop:`1px solid ${D.bdr}`,
        display:"flex", padding:"9px 0 18px",
      }}>
        {NAV2.map(({ Icon, label, active })=>(
          <div key={label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div style={{ width:28, height:28, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", background:active?"rgba(0,200,150,0.14)":"transparent" }}>
              <Icon size={15} color={active?D.brand:D.muted} />
            </div>
            <span style={{ color:active?D.brand:D.muted, fontSize:8, fontWeight:active?600:400 }}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT — two-phone layout (exact Subbie reference)

   Container: 432 px wide  (240 × 2 – 48 px overlap)
              570 px tall  (490 frame + 64 top offset + ~16 bottom)
   Left  phone: left:0,  top:64,  rotate(-12deg), z:1
   Right phone: right:0, top:0,   rotate(+4.5deg), z:2
   Fades: left ~48 % | right ~20 %
═══════════════════════════════════════════════════════ */
export function CaregiverDashboardMockup() {
  return (
    <div style={{
      width:          "100%",
      height:         "100%",
      background:     "transparent",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      position:       "relative",
    }}>
      {/* phones wrapper */}
      <div style={{ position:"relative", width:432, height:570, flexShrink:0 }}>

        {/* ── LEFT phone (behind, heavy left tilt) ── */}
        <div style={{
          position:        "absolute",
          left:            0,
          top:             64,
          transform:       "rotate(-12deg)",
          transformOrigin: "bottom center",
          zIndex:          1,
        }}>
          <div style={{ position:"relative" }}>
            <PhoneFrame><HomeScreen /></PhoneFrame>

            {/* White bottom fade — ~48 % of phone height */}
            <div style={{
              position:     "absolute",
              bottom:       0, left:0, right:0,
              height:       "48%",
              background:   "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.88) 62%, #ffffff 100%)",
              borderRadius: "0 0 46px 46px",
              pointerEvents:"none",
              zIndex:       6,
            }} />
          </div>
        </div>

        {/* ── RIGHT phone (front, gentle right tilt) ── */}
        <div style={{
          position:        "absolute",
          right:           0,
          top:             0,
          transform:       "rotate(4.5deg)",
          transformOrigin: "bottom center",
          zIndex:          2,
        }}>
          <div style={{ position:"relative" }}>
            <PhoneFrame><CareScreen /></PhoneFrame>

            {/* White bottom fade — ~20 % of phone height */}
            <div style={{
              position:     "absolute",
              bottom:       0, left:0, right:0,
              height:       "20%",
              background:   "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.80) 70%, #ffffff 100%)",
              borderRadius: "0 0 46px 46px",
              pointerEvents:"none",
              zIndex:       6,
            }} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default CaregiverDashboardMockup;

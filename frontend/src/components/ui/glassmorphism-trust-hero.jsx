import React from "react";
import {
  ArrowRight,
  Play,
  Target,
  Star,
  Activity,
  Heart,
  Shield,
  Camera,
  MessageCircle,
  Clock,
  Stethoscope,
} from "lucide-react";

const CLIENTS = [
  { name: "CareFirst",    icon: Heart         },
  { name: "ShieldHealth", icon: Shield        },
  { name: "SnapCare",     icon: Camera        },
  { name: "CareConnect",  icon: MessageCircle },
  { name: "ClockIn",      icon: Clock         },
  { name: "MedTrack",     icon: Stethoscope   },
];

const StatItem = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default">
    <span className="text-xl font-bold sm:text-2xl" style={{ color: "#0f0f0f" }}>{value}</span>
    <span className="text-[10px] uppercase tracking-wider font-medium sm:text-xs" style={{ color: "rgba(0,0,0,0.40)" }}>{label}</span>
  </div>
);

export default function HeroSection({ onNavigateToAuth }) {
  return (
    <div
      className="relative w-full overflow-hidden font-sans"
      style={{
        background: "linear-gradient(180deg, #EEEFF1 0%, #F3F4F6 50%, #F8F9FA 100%)",
        fontFamily: "'Figtree','Manrope',sans-serif",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes marquee {
          from { transform: translateX(0);    }
          to   { transform: translateX(-50%); }
        }
        .animate-fade-in  { animation: fadeSlideIn 0.8s ease-out forwards; opacity: 0; }
        .animate-marquee  { animation: marquee 40s linear infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Soft radial glow — keeps depth without a photo */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(0,200,150,0.10) 0%, transparent 70%), " +
            "radial-gradient(ellipse 50% 40% at 20% 80%, rgba(0,200,150,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 md:pt-32 md:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pt-8">

            {/* Badge */}
            <div className="animate-fade-in delay-100">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md transition-colors"
                style={{
                  border: "1px solid rgba(0,0,0,0.09)",
                  background: "rgba(255,255,255,0.55)",
                }}
              >
                <span
                  className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: "rgba(0,0,0,0.55)" }}
                >
                  AI-Powered Care Platform
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1
              className="animate-fade-in delay-200 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-semibold tracking-tighter leading-[0.92]"
              style={{ color: "#0f0f0f", letterSpacing: "-0.035em" }}
            >
              Home Care,<br />
              <span style={{ color: "#00c896" }}>
                Verified
              </span><br />
              &amp; Trusted.
            </h1>

            {/* Description */}
            <p
              className="animate-fade-in delay-300 max-w-xl text-lg leading-relaxed"
              style={{ color: "rgba(0,0,0,0.52)" }}
            >
              Real-time updates, photo-verified tasks, and AI-powered care support —
              giving families full visibility and caregivers the tools they need.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in delay-400 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigateToAuth && onNavigateToAuth("signup")}
                className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg,#00c896,#00a87a)",
                  color: "#fff",
                  boxShadow: "0 6px 24px rgba(0,200,150,0.32)",
                }}
                data-testid="hero-start-trial-btn"
              >
                Start free trial
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigateToAuth && onNavigateToAuth("signin")}
                className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "rgba(255,255,255,0.60)",
                  color: "rgba(0,0,0,0.65)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
                data-testid="hero-login-btn"
              >
                <Play className="w-4 h-4 fill-current" />
                Log in
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-5 space-y-6 lg:mt-12">

            {/* Stats card */}
            <div
              className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl shadow-xl"
              style={{
                border: "1px solid rgba(255,255,255,0.70)",
                background: "rgba(255,255,255,0.55)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full pointer-events-none"
                style={{ background: "rgba(0,200,150,0.08)", filter: "blur(48px)" }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg,#00c896,#00a87a)",
                      boxShadow: "0 4px 14px rgba(0,200,150,0.30)",
                    }}
                  >
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight" style={{ color: "#0f0f0f" }}>500+</div>
                    <div className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>Families Served</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "rgba(0,0,0,0.45)" }}>EVV Compliance Rate</span>
                    <span className="font-semibold" style={{ color: "#00c896" }}>98%</span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ background: "rgba(0,0,0,0.07)" }}
                  >
                    <div
                      className="h-full w-[98%] rounded-full"
                      style={{ background: "linear-gradient(135deg,#00c896,#00a87a)" }}
                    />
                  </div>
                </div>

                <div className="h-px w-full mb-6" style={{ background: "rgba(0,0,0,0.07)" }} />

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="2M+"  label="Tasks"   />
                  <div className="w-px h-full mx-auto" style={{ background: "rgba(0,0,0,0.07)" }} />
                  <StatItem value="24/7" label="Support" />
                  <div className="w-px h-full mx-auto" style={{ background: "rgba(0,0,0,0.07)" }} />
                  <StatItem value="100%" label="Photo"   />
                </div>

                {/* Tag pills */}
                <div className="mt-8 flex flex-wrap gap-2">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide"
                    style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.70)", color: "rgba(0,0,0,0.55)" }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    LIVE
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide"
                    style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.70)", color: "rgba(0,0,0,0.55)" }}
                  >
                    <Shield className="w-3 h-3" style={{ color: "#00c896" }} />
                    HIPAA SECURE
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide"
                    style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.70)", color: "rgba(0,0,0,0.55)" }}
                  >
                    <Target className="w-3 h-3 text-yellow-500" />
                    EVV COMPLIANT
                  </div>
                </div>
              </div>
            </div>

            {/* Marquee card */}
            <div
              className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl py-8 backdrop-blur-xl"
              style={{
                border: "1px solid rgba(255,255,255,0.70)",
                background: "rgba(255,255,255,0.45)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              <h3
                className="mb-6 px-8 text-sm font-semibold"
                style={{ color: "rgba(0,0,0,0.40)" }}
              >
                Trusted by Home Care Agencies
              </h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...CLIENTS, ...CLIENTS, ...CLIENTS].map((client, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 transition-all hover:scale-105 cursor-default"
                      style={{ opacity: 0.45 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "0.45"}
                    >
                      <client.icon className="h-5 w-5" style={{ color: "#0f0f0f" }} />
                      <span className="text-base font-bold tracking-tight" style={{ color: "#0f0f0f" }}>{client.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

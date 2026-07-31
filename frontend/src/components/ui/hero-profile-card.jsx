"use client"

import { useState, useEffect } from "react";
import { ArrowRight, Activity } from "lucide-react";

export function HeroProfileCard({
  backgroundUrl = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
  families  = 500,
  tasks     = 2000000,
  compliance = 98,
  onNavigateToAuth,
}) {
  const [expProgress, setExpProgress] = useState(0);
  const [animatedFamilies,    setAnimatedFamilies]    = useState(0);
  const [animatedTasks,       setAnimatedTasks]       = useState(0);
  const [animatedCompliance,  setAnimatedCompliance]  = useState(0);

  // Animate experience bar
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setExpProgress((prev) => {
          if (prev >= 72) { clearInterval(interval); return 72; }
          return prev + 1;
        });
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Animate counters
  useEffect(() => {
    const duration = 2000;
    const steps    = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++;
        setAnimatedFamilies(   Math.min(Math.floor((families    / steps) * currentStep), families));
        setAnimatedTasks(      Math.min(Math.floor((tasks       / steps) * currentStep), tasks));
        setAnimatedCompliance( Math.min(Math.floor((compliance  / steps) * currentStep), compliance));
        if (currentStep >= steps) clearInterval(interval);
      }, stepDuration);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [families, tasks, compliance]);

  const fmt = (num) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-20 md:py-28"
      style={{ background: "#F8F9FA", fontFamily: "'Figtree','Manrope',sans-serif" }}
    >
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden"
          style={{ border: "1px solid rgba(0,0,0,0.07)" }}
        >

          {/* ── Header with background image ── */}
          <div className="relative h-44 overflow-hidden">
            <img
              src={backgroundUrl}
              alt="Care background"
              className="w-full h-full object-cover opacity-70"
            />
            {/* Tint overlay */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom right, rgba(0,200,150,0.35), rgba(0,168,122,0.20))" }}
            />

            {/* CTA button — top right */}
            <button
              onClick={() => onNavigateToAuth && onNavigateToAuth("signup")}
              className="absolute top-4 right-4 rounded-full px-5 py-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-100"
              style={{ background: "#00c896", color: "#fff", boxShadow: "0 4px 18px rgba(0,200,150,0.35)" }}
              data-testid="hero-start-trial-btn"
            >
              Get started
              <ArrowRight size={14} />
            </button>
          </div>

          {/* ── Profile content ── */}
          <div className="px-6 pb-7 -mt-12">

            {/* Avatar */}
            <div className="relative w-24 h-24 mb-4">
              <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-white shadow-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#00c896,#00a87a)" }}
              >
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Exp bar */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-light" style={{ color: "rgba(0,0,0,0.36)" }}>care exp.</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${expProgress}%`,
                      background: "linear-gradient(to right,#a855f7,#ec4899,#f97316,#eab308,#22c55e,#3b82f6)",
                    }}
                  />
                </div>
                <span className="text-xs font-light" style={{ color: "rgba(0,0,0,0.36)" }}>{expProgress}%</span>
              </div>
            </div>

            {/* Name + tagline */}
            <h2 className="text-2xl font-semibold mb-2 tracking-tight" style={{ color: "#0f0f0f" }}>
              ADLTrack
            </h2>
            <p className="text-sm leading-relaxed mb-6 font-light" style={{ color: "rgba(0,0,0,0.55)" }}>
              Real-time updates, photo-verified tasks, and AI-powered care support — for families, caregivers, and home care agencies.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 py-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.07)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}
            >
              <div className="text-center">
                <div className="text-2xl font-semibold mb-1" style={{ color: "#0f0f0f" }}>{fmt(animatedFamilies)}+</div>
                <div className="text-xs font-light" style={{ color: "rgba(0,0,0,0.36)" }}>Families</div>
              </div>
              <div className="text-center"
                style={{ borderLeft: "1px solid rgba(0,0,0,0.07)", borderRight: "1px solid rgba(0,0,0,0.07)" }}
              >
                <div className="text-2xl font-semibold mb-1" style={{ color: "#0f0f0f" }}>{fmt(animatedTasks)}</div>
                <div className="text-xs font-light" style={{ color: "rgba(0,0,0,0.36)" }}>Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold mb-1" style={{ color: "#0f0f0f" }}>{animatedCompliance}%</div>
                <div className="text-xs font-light" style={{ color: "rgba(0,0,0,0.36)" }}>EVV</div>
              </div>
            </div>

            {/* Bottom CTA row */}
            <div className="flex gap-3">
              <button
                onClick={() => onNavigateToAuth && onNavigateToAuth("signup")}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-100"
                style={{ background: "linear-gradient(135deg,#00c896,#00a87a)", boxShadow: "0 4px 18px rgba(0,200,150,0.28)" }}
                data-testid="hero-cta-signup"
              >
                Start free trial
              </button>
              <button
                onClick={() => onNavigateToAuth && onNavigateToAuth("signin")}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-100"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.10)",
                  color: "rgba(0,0,0,0.55)",
                }}
                data-testid="hero-cta-signin"
              >
                Log in
              </button>
            </div>
          </div>
        </div>

        {/* Subtle footnote */}
        <p className="text-center text-xs mt-4 font-light" style={{ color: "rgba(0,0,0,0.32)" }}>
          No credit card required · Free 14-day trial
        </p>
      </div>
    </div>
  );
}

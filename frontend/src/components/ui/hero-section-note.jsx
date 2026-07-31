import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── ADLTrack logo badge (replaces MistKitLogo) ── */
const ADLTrackLogo = ({ className }) => (
  <div
    aria-hidden
    className={cn(
      'relative flex size-9 translate-y-0.5 items-center justify-center rounded-[var(--radius,0.75rem)] border border-white/20 shadow-lg shadow-black/20 ring-1 ring-black/10',
      className,
    )}
    style={{ background: 'linear-gradient(to bottom, #00e6aa, #00a87a)' }}
  >
    <Activity className="size-5 stroke-white fill-white drop-shadow-sm" />
  </div>
);

/* ── Hero section ── */
export default function HeroSection({ onNavigateToAuth }) {
  return (
    <section className="py-20" style={{ fontFamily: "'Figtree','Manrope',sans-serif" }}>
      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 lg:px-0">

        {/* ── Copy block ── */}
        <div className="relative text-center">
          <ADLTrackLogo className="mx-auto" />

          <h1
            className="mx-auto mt-8 max-w-xl text-balance text-5xl font-semibold"
            style={{ color: '#0f0f0f', lineHeight: 1.08, letterSpacing: '-0.035em' }}
          >
            The Care Platform
          </h1>

          <p
            className="mx-auto mb-8 mt-4 max-w-xl text-balance text-xl font-light"
            style={{ color: 'rgba(0,0,0,0.55)', lineHeight: 1.55 }}
          >
            Real-time updates, photo-verified tasks, and AI-powered care support — for families, caregivers, and home care agencies.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={() => onNavigateToAuth && onNavigateToAuth('signup')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.03] active:scale-100"
              style={{
                background: 'linear-gradient(135deg,#00c896,#00a87a)',
                boxShadow: '0 4px 18px rgba(0,200,150,0.30)',
              }}
              data-testid="hero-start-trial-btn"
            >
              Get Started
            </button>
            <button
              onClick={() => onNavigateToAuth && onNavigateToAuth('signin')}
              className="w-full sm:w-auto px-7 py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-100"
              style={{
                background: 'transparent',
                border: '1px solid rgba(0,0,0,0.10)',
                color: 'rgba(0,0,0,0.55)',
              }}
              data-testid="hero-login-btn"
            >
              Log in
            </button>
          </div>
        </div>

        {/* ── App preview card ── */}
        <div
          className="relative mt-12 overflow-hidden rounded-3xl md:mt-16"
          style={{ background: 'rgba(0,0,0,0.08)' }}
        >
          {/* Background texture */}
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80"
            alt=""
            className="absolute inset-0 size-full object-cover opacity-60"
          />

          {/* Inner app screenshot */}
          <div
            className="relative m-4 overflow-hidden rounded-2xl sm:m-8 md:m-12"
            style={{
              background: '#fff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              border: '1px solid rgba(0,0,0,0.06)',
              outline: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1400&q=80"
              alt="ADLTrack dashboard"
              width="1400"
              height="875"
              className="size-full object-cover object-top"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <p
            className="w-full sm:w-auto text-center text-sm font-light"
            style={{ color: 'rgba(0,0,0,0.40)' }}
          >
            Trusted by care teams at :
          </p>
          <div className="flex flex-1 flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
            <img
              className="h-4 w-auto"
              src="https://html.tailus.io/blocks/customers/nvidia.svg"
              alt="Nvidia"
            />
            <img
              className="h-3 w-auto"
              src="https://html.tailus.io/blocks/customers/github.svg"
              alt="GitHub"
            />
            <img
              className="h-4 w-auto"
              src="https://html.tailus.io/blocks/customers/nike.svg"
              alt="Nike"
            />
            <img
              className="h-3 w-auto"
              src="https://html.tailus.io/blocks/customers/column.svg"
              alt="Column"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

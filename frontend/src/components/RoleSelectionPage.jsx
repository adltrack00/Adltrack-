import React, { useState } from 'react';
import { Heart, Users, Briefcase } from 'lucide-react';
import { UserRole } from '../types';

const C = {
  dark:   '#0a1929',
  yellow: '#FFFC00',
  black:  '#000000',
  white:  '#FFFFFF',
  muted:  'rgba(255,255,255,0.50)',
  card:   'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
};

const ROLES = [
  {
    role:        UserRole.CAREGIVER,
    title:       'Caregiver',
    subtitle:    'Manage shifts, tasks & documentation',
    icon:        Heart,
    accentColor: '#00c896',
    accentRgb:   '0,200,150',
    testId:      'caregiver',
  },
  {
    role:        UserRole.FAMILY,
    title:       'Family Member',
    subtitle:    'Monitor care & stay connected',
    icon:        Users,
    accentColor: '#a78bfa',
    accentRgb:   '167,139,250',
    testId:      'family',
  },
  {
    role:        UserRole.ENTERPRISE,
    title:       'Care Agency',
    subtitle:    'Manage staff & compliance',
    icon:        Briefcase,
    accentColor: '#38bdf8',
    accentRgb:   '56,189,248',
    testId:      'enterprise',
  },
];

export const RoleSelectionPage = ({ onSelectRole, onBack, mode = 'signin' }) => {
  const isSignUp = mode === 'signup';
  const [hoveredRole, setHoveredRole] = useState(null);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: C.dark, fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif",
      overflowX: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rsp-fade { animation: fadeUp 0.55s ease-out forwards; opacity: 0; }
        .rsp-root * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 320, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,252,0,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 0, width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,252,0,0.03) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, padding: '44px 24px 0', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          data-testid="role-logo-btn"
        >
          <span style={{ color: C.white, fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>One Permit</span>
        </button>
      </header>

      {/* Main */}
      <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px 44px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Headline */}
          <div className="rsp-fade" style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.03em', color: C.yellow, textTransform: 'uppercase', marginBottom: 12 }}>
              {isSignUp ? 'Getting started' : 'Welcome back'}
            </p>
            <h1 style={{ fontSize: 'clamp(1.9rem,4vw,2.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: C.white, lineHeight: 1.1, marginBottom: 8 }}>
              {isSignUp ? 'Who are you?' : 'Continue as'}
            </h1>
            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.03em', color: C.muted }}>
              Choose your account type to {isSignUp ? 'get started' : 'sign in'}
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLES.map(({ role, title, subtitle, icon: Icon, accentColor, accentRgb, testId }, idx) => {
              const isHov = hoveredRole === role;
              return (
                <button
                  key={role}
                  data-testid={`role-select-${testId}`}
                  onClick={() => onSelectRole(role)}
                  onMouseEnter={() => setHoveredRole(role)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className="rsp-fade"
                  style={{
                    animationDelay: `${0.08 + idx * 0.08}s`,
                    background: isHov ? `rgba(${accentRgb},0.08)` : C.card,
                    border: `1.5px solid ${isHov ? `rgba(${accentRgb},0.30)` : C.border}`,
                    borderRadius: 16,
                    padding: '18px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.25s',
                    transform: isHov ? 'translateY(-2px)' : 'translateY(0)',
                    backdropFilter: 'blur(8px)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Icon orb */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isHov ? `rgba(${accentRgb},0.15)` : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isHov ? `rgba(${accentRgb},0.25)` : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.25s',
                    }}>
                      <Icon style={{ width: 20, height: 20, color: isHov ? accentColor : 'rgba(255,255,255,0.55)' }} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.03em', color: C.white, marginBottom: 3 }}>{title}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.03em', color: C.muted }}>{subtitle}</p>
                    </div>

                    {/* Arrow box */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isHov ? C.yellow : 'rgba(255,255,255,0.06)',
                      transition: 'all 0.25s',
                    }}>
                      <svg
                        style={{ width: 14, height: 14, color: isHov ? C.black : 'rgba(255,255,255,0.35)', transition: 'transform 0.2s', transform: isHov ? 'translateX(1px)' : 'translateX(0)' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mode switch */}
          <p className="rsp-fade" style={{ animationDelay: '0.32s', textAlign: 'center', fontSize: 14, fontWeight: 700, letterSpacing: '-0.03em', color: C.muted, marginTop: 28 }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => onSelectRole(null, !isSignUp)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.yellow, fontWeight: 700, letterSpacing: '-0.03em', fontSize: 14, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              data-testid="role-switch-mode-btn"
            >
              {isSignUp ? 'Sign in' : 'Sign up free'}
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, paddingBottom: 28, textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.22)' }}>
          © {new Date().getFullYear()} One Permit · Secure care coordination
        </p>
      </footer>
    </div>
  );
};

export default RoleSelectionPage;

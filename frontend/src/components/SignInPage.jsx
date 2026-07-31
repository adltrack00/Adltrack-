import React from 'react';
import { Heart, Users, Briefcase, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

const FUSTAT = "'Fustat', 'Inter', sans-serif";
const INTER  = "'Inter', -apple-system, sans-serif";

const ROLES = [
  {
    role:        UserRole.CAREGIVER,
    label:       "I'm a Caregiver",
    description: 'Manage shifts, tasks & care documentation',
    Icon:        Heart,
    accent:      '#d97706',
    accentBg:    'rgba(217,119,6,0.08)',
    accentBorder:'rgba(217,119,6,0.28)',
    testId:      'signin-caregiver-btn',
  },
  {
    role:        UserRole.FAMILY,
    label:       "I'm a Family Member",
    description: 'Monitor care & stay connected from anywhere',
    Icon:        Users,
    accent:      '#0284c7',
    accentBg:    'rgba(2,132,199,0.08)',
    accentBorder:'rgba(2,132,199,0.28)',
    testId:      'signin-family-btn',
  },
  {
    role:        UserRole.ENTERPRISE,
    label:       "I'm a Care Agency",
    description: 'Manage staff, compliance & operations',
    Icon:        Briefcase,
    accent:      '#059669',
    accentBg:    'rgba(5,150,105,0.08)',
    accentBorder:'rgba(5,150,105,0.28)',
    testId:      'signin-enterprise-btn',
  },
];

export const SignInPage = ({ onSelectRole }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: INTER, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes siFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .si-fade { animation: siFade 0.52s ease-out forwards; opacity: 0; }
        .si-card {
          display: flex; align-items: center; gap: 18px;
          width: 100%; text-align: left; cursor: pointer;
          background: #ffffff;
          border: 1.5px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 20px 22px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: box-shadow 0.22s, border-color 0.22s, transform 0.18s;
        }
        .si-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.09); transform: translateY(-2px); }
        .si-icon { transition: background 0.2s, border-color 0.2s; }
        .si-arrow { transition: color 0.2s, transform 0.2s; }
      `}</style>

      {/* Header */}
      <header style={{ padding: '28px 36px' }}>
        <span style={{ fontFamily: FUSTAT, fontWeight: 700, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.03em' }}>
          ADLTrack
        </span>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 60px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Eyebrow */}
          <div className="si-fade" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{
              fontFamily: INTER, fontSize: '0.68rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.16em',
              background: 'linear-gradient(90deg, #F5C344, #F28482, #B567C2)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Welcome to ADLTrack
            </span>
          </div>

          {/* Headline */}
          <div className="si-fade" style={{ textAlign: 'center', marginBottom: 36, animationDelay: '0.07s' }}>
            <h1 style={{
              fontFamily: FUSTAT, fontWeight: 700,
              fontSize: 'clamp(1.9rem, 4vw, 2.6rem)',
              lineHeight: 1.1, letterSpacing: '-0.04em',
              color: '#0f172a', margin: '0 0 12px',
            }}>
              How will you use<br />ADLTrack?
            </h1>
            <p style={{ fontFamily: INTER, fontSize: '0.975rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
              Choose your role — each experience is built for you.
            </p>
          </div>

          {/* Role cards */}
          <div className="si-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.14s' }}>
            {ROLES.map(({ role, label, description, Icon, accent, accentBg, accentBorder, testId }) => (
              <button
                key={role}
                className="si-card"
                onClick={() => onSelectRole(role)}
                data-testid={testId}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = accentBorder;
                  e.currentTarget.querySelector('.si-icon').style.background = accentBg;
                  e.currentTarget.querySelector('.si-icon').style.borderColor = accentBorder;
                  e.currentTarget.querySelector('.si-arrow').style.color = accent;
                  e.currentTarget.querySelector('.si-arrow').style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
                  e.currentTarget.querySelector('.si-icon').style.background = '#f8fafc';
                  e.currentTarget.querySelector('.si-icon').style.borderColor = 'rgba(0,0,0,0.06)';
                  e.currentTarget.querySelector('.si-arrow').style.color = '#94a3b8';
                  e.currentTarget.querySelector('.si-arrow').style.transform = 'translateX(0)';
                }}
              >
                <div className="si-icon" style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: '#f8fafc', border: '1.5px solid rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={accent} strokeWidth={1.8} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FUSTAT, fontWeight: 700, fontSize: '1rem', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: INTER, fontSize: '0.845rem', color: '#64748b', lineHeight: 1.45 }}>
                    {description}
                  </div>
                </div>

                <ArrowRight className="si-arrow" size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
              </button>
            ))}
          </div>

          <p className="si-fade" style={{ animationDelay: '0.22s', textAlign: 'center', fontFamily: INTER, fontSize: '0.78rem', color: '#94a3b8', marginTop: 28 }}>
            Demo environment — select any role to explore ADLTrack
          </p>
        </div>
      </main>

      <footer style={{ padding: '0 36px 28px', textAlign: 'center' }}>
        <p style={{ fontFamily: INTER, fontSize: '0.78rem', color: '#cbd5e1' }}>
          © {new Date().getFullYear()} ADLTrack · Secure care coordination
        </p>
      </footer>
    </div>
  );
};

export default SignInPage;

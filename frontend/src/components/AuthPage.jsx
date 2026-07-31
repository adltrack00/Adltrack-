import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Check } from 'lucide-react';
import { UserRole } from '../types';

const FUSTAT = "'Fustat', 'Inter', sans-serif";
const INTER  = "'Inter', -apple-system, sans-serif";
const AMBER  = '#d97706';

const ROLE_CONFIG = {
  [UserRole.CAREGIVER]: {
    label:       'Caregiver',
    accent:      '#d97706',
    accentRgb:   '217,119,6',
    description: 'Manage shifts, tasks & care documentation',
    bullets:     ['Log tasks with photo verification', 'Track vitals & incidents in real time', 'Stay connected with families & agencies'],
  },
  [UserRole.FAMILY]: {
    label:       'Family Member',
    accent:      '#0284c7',
    accentRgb:   '2,132,199',
    description: 'Monitor care & stay connected',
    bullets:     ['Real-time care updates from anywhere', 'View photos, vitals & daily logs', 'Message caregivers & care teams'],
  },
  [UserRole.ENTERPRISE]: {
    label:       'Care Agency',
    accent:      '#059669',
    accentRgb:   '5,150,105',
    description: 'Manage staff, compliance & operations',
    bullets:     ['Oversee all caregiver activity', 'Track compliance & shift verification', 'Generate reports for Medicaid & Medicare'],
  },
};

const HERO_IMG = "https://images.pexels.com/photos/3791664/pexels-photo-3791664.jpeg?auto=compress&cs=tinysrgb&w=1280";

const GoogleIcon = () => (
  <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24" fill="#1d1d1f">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export const AuthPage = ({ mode = 'signin', selectedRole, onBack, onSwitchMode, onAuthSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [name,         setName]         = useState('');
  const [isLoading,    setIsLoading]    = useState(false);

  const isSignUp = mode === 'signup';
  const cfg = ROLE_CONFIG[selectedRole] || ROLE_CONFIG[UserRole.FAMILY];

  const handleMockAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess({
        user_id: 'mock_user_' + Date.now(),
        email:   email    || 'user@example.com',
        name:    name     || 'Test User',
        role:    selectedRole,
      });
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: INTER, background: '#ffffff' }}>
      <style>{`
        @keyframes apFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes apSpin { to { transform: rotate(360deg); } }
        .ap-fade  { animation: apFade 0.52s ease-out forwards; opacity: 0; }
        .ap-input {
          width: 100%; box-sizing: border-box;
          background: #f8fafc;
          border: 1.5px solid rgba(0,0,0,0.10);
          border-radius: 12px;
          color: #0f172a;
          font-family: ${INTER};
          font-size: 0.925rem;
          font-weight: 500;
          padding: 13px 14px 13px 44px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .ap-input:focus {
          background: #ffffff;
          border-color: rgba(217,119,6,0.50);
          box-shadow: 0 0 0 3px rgba(217,119,6,0.08);
        }
        .ap-input::placeholder { color: #94a3b8; font-weight: 400; }
        .ap-social-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 12px 20px;
          background: #ffffff;
          border: 1.5px solid rgba(0,0,0,0.10);
          border-radius: 12px;
          font-family: ${INTER}; font-size: 0.9rem; font-weight: 600;
          color: #0f172a; cursor: pointer;
          transition: background 0.18s, border-color 0.18s, box-shadow 0.18s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .ap-social-btn:hover {
          background: #f8fafc;
          border-color: rgba(0,0,0,0.16);
          box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        }
        @media (max-width: 800px) {
          .ap-left-panel { display: none !important; }
          .ap-right-panel { width: 100% !important; }
        }
      `}</style>

      {/* ── Left: image + brand panel ── */}
      <div
        className="ap-left-panel"
        style={{
          width:    '46%',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <img
          src={HERO_IMG}
          alt="Caregiver with patient"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
        />

        {/* Gradient overlay */}
        <div style={{
          position:   'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 50%, rgba(0,0,0,0.60) 100%)',
        }} />

        {/* Content */}
        <div style={{
          position:      'relative', zIndex: 10,
          height:        '100%',
          display:       'flex',
          flexDirection: 'column',
          justifyContent:'space-between',
          padding:       '40px 44px',
        }}>
          {/* Logo */}
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
          >
            <span style={{ fontFamily: FUSTAT, fontWeight: 700, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.03em' }}>
              ADLTrack
            </span>
          </button>

          {/* Bottom copy */}
          <div>
            <span style={{
              display:       'inline-block',
              fontFamily:    INTER,
              fontSize:      '0.68rem',
              fontWeight:    700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color:         '#fbbf24',
              marginBottom:  16,
            }}>
              {cfg.label}
            </span>

            <h2 style={{
              fontFamily:    FUSTAT,
              fontWeight:    700,
              fontSize:      'clamp(1.6rem, 2.4vw, 2.4rem)',
              lineHeight:    1.15,
              letterSpacing: '-0.03em',
              color:         '#ffffff',
              margin:        '0 0 20px',
              textShadow:    '0 2px 16px rgba(0,0,0,0.40)',
            }}>
              Real-Time Care,<br />
              <span style={{ color: '#fbbf24' }}>Verified</span> at Every Step.
            </h2>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cfg.bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(251,191,36,0.18)',
                    border: '1.5px solid rgba(251,191,36,0.40)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={10} color="#fbbf24" strokeWidth={2.8} />
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: '0.875rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.45 }}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div
        className="ap-right-panel"
        style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '40px 24px',
          overflowY:      'auto',
        }}
      >
        {/* Mobile-only logo */}
        <div style={{ display: 'none' }} className="ap-mobile-logo">
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 32 }}>
            <span style={{ fontFamily: FUSTAT, fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>ADLTrack</span>
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Role chip */}
          <div className="ap-fade" style={{ marginBottom: 22 }}>
            <span style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           6,
              padding:       '5px 14px',
              borderRadius:  8,
              background:    `rgba(${cfg.accentRgb},0.08)`,
              border:        `1.5px solid rgba(${cfg.accentRgb},0.22)`,
              fontFamily:    INTER,
              fontSize:      '0.72rem',
              fontWeight:    700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color:         cfg.accent,
            }}>
              {cfg.label}
            </span>
          </div>

          {/* Heading */}
          <div className="ap-fade" style={{ marginBottom: 28, animationDelay: '0.07s' }}>
            <h1 style={{
              fontFamily:    FUSTAT,
              fontWeight:    700,
              fontSize:      'clamp(1.7rem, 3.5vw, 2.3rem)',
              lineHeight:    1.1,
              letterSpacing: '-0.04em',
              color:         '#0f172a',
              margin:        '0 0 8px',
            }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ fontFamily: INTER, fontSize: '0.925rem', color: '#64748b', margin: 0 }}>
              {cfg.description}
            </p>
          </div>

          {/* Social buttons */}
          <div className="ap-fade" style={{ display: 'flex', gap: 10, marginBottom: 20, animationDelay: '0.12s' }}>
            <button className="ap-social-btn" disabled={isLoading} onClick={handleMockAuth} data-testid="google-auth-btn">
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button className="ap-social-btn" disabled={isLoading} onClick={handleMockAuth} data-testid="apple-auth-btn">
              <AppleIcon />
              <span>Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="ap-fade" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, animationDelay: '0.16s' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
            <span style={{ fontFamily: INTER, fontSize: '0.78rem', fontWeight: 500, color: '#94a3b8' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
          </div>

          {/* Form */}
          <form
            className="ap-fade"
            style={{ display: 'flex', flexDirection: 'column', gap: 14, animationDelay: '0.20s' }}
            onSubmit={e => { e.preventDefault(); handleMockAuth(); }}
          >
            {isSignUp && (
              <div>
                <label style={{ display: 'block', fontFamily: INTER, fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                  <input
                    className="ap-input"
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    data-testid="auth-name-input"
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontFamily: INTER, fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  className="ap-input"
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  data-testid="auth-email-input"
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontFamily: INTER, fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>
                  Password
                </label>
                {!isSignUp && (
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: INTER, fontSize: '0.78rem', fontWeight: 600, color: AMBER }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                <input
                  className="ap-input"
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  style={{ paddingRight: 44 }}
                  data-testid="auth-password-input"
                />
                <button
                  type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="auth-submit-btn"
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            8,
                width:          '100%',
                padding:        '14px 20px',
                marginTop:      4,
                background:     '#0f172a',
                border:         'none',
                borderRadius:   12,
                fontFamily:     INTER,
                fontSize:       '0.925rem',
                fontWeight:     700,
                color:          '#ffffff',
                cursor:         isLoading ? 'not-allowed' : 'pointer',
                opacity:        isLoading ? 0.7 : 1,
                boxShadow:      '0 4px 18px rgba(15,23,42,0.20)',
                transition:     'transform 0.18s, box-shadow 0.18s',
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,0.28)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,23,42,0.20)'; }}
            >
              {isLoading
                ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'apSpin 0.8s linear infinite' }} />
                : <><span>{isSignUp ? 'Create Account' : 'Sign In'}</span><ArrowRight style={{ width: 16, height: 16 }} /></>
              }
            </button>
          </form>

          {/* Switch mode */}
          <p className="ap-fade" style={{ animationDelay: '0.26s', textAlign: 'center', fontFamily: INTER, fontSize: '0.875rem', color: '#64748b', marginTop: 22 }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={onSwitchMode}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: INTER, fontSize: '0.875rem', fontWeight: 700, color: AMBER }}
            >
              {isSignUp ? 'Sign in' : 'Sign up free'}
            </button>
          </p>

          {isSignUp && (
            <p className="ap-fade" style={{ animationDelay: '0.30s', textAlign: 'center', fontFamily: INTER, fontSize: '0.75rem', color: '#94a3b8', marginTop: 12 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Terms</a>{' '}&amp;{' '}
              <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Privacy Policy</a>
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthPage;

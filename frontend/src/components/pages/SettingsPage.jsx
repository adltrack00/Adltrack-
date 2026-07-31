import React, { useState } from 'react';
import { ArrowLeft, Bell, Moon, Globe, Shield, ChevronRight } from 'lucide-react';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};


export const SettingsPage = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }} data-testid="settings-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-3" style={{ background: D.card, borderBottom: `1px solid ${D.bdr}` }}>
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-xl transition-all"
          style={{ background: D.bg, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
          data-testid="settings-back-btn"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: D.h }} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: D.h }}>Settings</h1>
      </div>

      <div className="px-5 pt-5 pb-24 space-y-4 overflow-y-auto">
        {/* Toggle Settings Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
          {/* Push Notifications */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,179,71,0.12)', border: '1px solid rgba(255,179,71,0.20)' }}>
                <Bell className="w-5 h-5" style={{ color: '#b45309' }} />
              </div>
              <span className="text-[16px] font-medium" style={{ color: D.h }}>Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" data-testid="push-notifications-toggle">
              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="sr-only peer" />
              <div
                className="w-[51px] h-[31px] rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all after:shadow-sm"
                style={{ background: notifications ? '#FFB347' : 'rgba(0,0,0,0.14)' }}
              />
            </label>
          </div>

          <div className="mx-4" style={{ borderTop: `1px solid ${D.bdr}` }} />

          {/* Dark Mode */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.20)' }}>
                <Moon className="w-5 h-5" style={{ color: '#1d4ed8' }} />
              </div>
              <span className="text-[16px] font-medium" style={{ color: D.h }}>Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" data-testid="dark-mode-toggle">
              <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="sr-only peer" />
              <div
                className="w-[51px] h-[31px] rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all after:shadow-sm"
                style={{ background: darkMode ? '#FFB347' : 'rgba(0,0,0,0.14)' }}
              />
            </label>
          </div>
        </div>

        {/* Navigation Settings Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
          {/* Privacy & Security */}
          <button className="w-full flex items-center justify-between px-4 py-4" data-testid="privacy-security-btn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.20)' }}>
                <Shield className="w-5 h-5" style={{ color: '#7c3aed' }} />
              </div>
              <span className="text-[16px] font-medium" style={{ color: D.h }}>Privacy &amp; Security</span>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: D.muted }} />
          </button>

          <div className="mx-4" style={{ borderTop: `1px solid ${D.bdr}` }} />

          {/* Language */}
          <button className="w-full flex items-center justify-between px-4 py-4" data-testid="language-btn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.18)' }}>
                <Globe className="w-5 h-5" style={{ color: '#15803d' }} />
              </div>
              <span className="text-[16px] font-medium" style={{ color: D.h }}>Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px]" style={{ color: D.muted }}>English</span>
              <ChevronRight className="w-5 h-5" style={{ color: D.muted }} />
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="text-center pt-6">
          <p className="text-[14px]" style={{ color: D.muted }}>One Permit v1.0.0</p>
          <p className="text-[13px] mt-1" style={{ color: D.muted }}>&copy; 2026 One Permit Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

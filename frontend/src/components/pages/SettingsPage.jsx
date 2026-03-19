import React, { useState } from 'react';
import { ArrowLeft, Bell, Moon, Globe, Shield, HelpCircle, ChevronRight } from 'lucide-react';

export const SettingsPage = ({ onBack, onNavigateToHelp }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="min-h-screen bg-black font-['Manrope',sans-serif]" data-testid="settings-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={onBack} className="mr-4 p-1" data-testid="settings-back-btn">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="px-5 pb-24 overflow-y-auto">
        {/* Toggle Settings Card */}
        <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl overflow-hidden mb-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#8e8e93]" />
              </div>
              <span className="text-[16px] font-medium text-white">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" data-testid="push-notifications-toggle">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-[51px] h-[31px] bg-[#39393d] rounded-full peer peer-checked:bg-[#34C759] peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all after:shadow-sm"></div>
            </label>
          </div>

          <div className="mx-4 border-t border-[#3a3a3c]" />

          {/* Dark Mode */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#8e8e93]" />
              </div>
              <span className="text-[16px] font-medium text-white">Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" data-testid="dark-mode-toggle">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-[51px] h-[31px] bg-[#39393d] rounded-full peer peer-checked:bg-[#34C759] peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all after:shadow-sm"></div>
            </label>
          </div>
        </div>

        {/* Navigation Settings Card */}
        <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl overflow-hidden">
          {/* Privacy & Security */}
          <button className="w-full flex items-center justify-between px-4 py-4" data-testid="privacy-security-btn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#8e8e93]" />
              </div>
              <span className="text-[16px] font-medium text-white">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
          </button>

          <div className="mx-4 border-t border-[#3a3a3c]" />

          {/* Language */}
          <button className="w-full flex items-center justify-between px-4 py-4" data-testid="language-btn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#8e8e93]" />
              </div>
              <span className="text-[16px] font-medium text-white">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-[#8e8e93]">English</span>
              <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
            </div>
          </button>

          <div className="mx-4 border-t border-[#3a3a3c]" />

          {/* Help & Support */}
          <button 
            className="w-full flex items-center justify-between px-4 py-4" 
            data-testid="help-support-btn"
            onClick={onNavigateToHelp}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-[#8e8e93]" />
              </div>
              <span className="text-[16px] font-medium text-white">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#8e8e93]" />
          </button>
        </div>

        {/* App Info */}
        <div className="text-center pt-10">
          <p className="text-[15px] text-[#8e8e93]">ADLTrack v1.0.0</p>
          <p className="text-[14px] text-[#8e8e93] mt-1">&copy; 2026 ADLTrack Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

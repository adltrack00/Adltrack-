import React, { useState } from 'react';
import { ArrowLeft, Bell, Moon, Sun, Globe, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SettingsPage = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const { isDarkMode, toggleTheme, bg, bgCard, border, text, textSecondary, textMuted, bgCardHover } = useTheme();

  const settingItems = [
    { icon: Shield, label: 'Privacy & Security', action: 'Navigate' },
    { icon: Globe, label: 'Language', value: 'English', action: 'Navigate' },
    { icon: HelpCircle, label: 'Help & Support', action: 'Navigate' },
  ];

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Header */}
      <div className={`sticky top-0 ${bgCard} border-b ${border} px-4 py-4 flex items-center gap-3 z-10`}>
        <button onClick={onBack} className={`p-2 ${bgCardHover} rounded-full`}>
          <ArrowLeft className={`w-5 h-5 ${textSecondary}`} />
        </button>
        <h1 className={`text-lg font-semibold ${text}`}>Settings</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggle Settings */}
        <div className={`${bgCard} border ${border} rounded-xl overflow-hidden`}>
          <div className={`flex items-center justify-between p-4 border-b ${border}`}>
            <div className="flex items-center gap-3">
              <Bell className={`w-5 h-5 ${textMuted}`} />
              <span className={`font-medium ${text}`}>Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 ${isDarkMode ? 'bg-stone-700' : 'bg-stone-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]`}></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className={`w-5 h-5 ${textMuted}`} />
              ) : (
                <Sun className={`w-5 h-5 ${textMuted}`} />
              )}
              <span className={`font-medium ${text}`}>Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleTheme}
                className="sr-only peer"
                data-testid="dark-mode-toggle"
              />
              <div className={`w-11 h-6 ${isDarkMode ? 'bg-stone-700' : 'bg-stone-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]`}></div>
            </label>
          </div>
        </div>

        {/* Navigation Settings */}
        <div className={`${bgCard} border ${border} rounded-xl overflow-hidden`}>
          {settingItems.map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center justify-between p-4 border-b ${border} last:border-0 ${bgCardHover} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${textMuted}`} />
                <span className={`font-medium ${text}`}>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className={`text-sm ${textMuted}`}>{item.value}</span>}
                <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`} />
              </div>
            </button>
          ))}
        </div>

        {/* App Info */}
        <div className="text-center pt-8">
          <p className={`text-sm ${textMuted}`}>ADLTrack v1.0.0</p>
          <p className={`text-xs ${isDarkMode ? 'text-stone-500' : 'text-stone-400'} mt-1`}>© {new Date().getFullYear()} ADLTrack Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

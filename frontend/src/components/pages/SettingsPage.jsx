import React, { useState } from 'react';
import { ArrowLeft, Bell, Moon, Globe, Shield, HelpCircle, ChevronRight } from 'lucide-react';

export const SettingsPage = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const settingItems = [
    { icon: Shield, label: 'Privacy & Security', action: 'Navigate' },
    { icon: Globe, label: 'Language', value: 'English', action: 'Navigate' },
    { icon: HelpCircle, label: 'Help & Support', action: 'Navigate' },
  ];

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-stone-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-stone-300" />
        </button>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggle Settings */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-stone-400" />
              <span className="font-medium text-white">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-stone-400" />
              <span className="font-medium text-white">Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Navigation Settings */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
          {settingItems.map((item, idx) => (
            <button
              key={idx}
              className="w-full flex items-center justify-between p-4 border-b border-stone-800 last:border-0 hover:bg-stone-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-stone-400" />
                <span className="font-medium text-white">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && <span className="text-sm text-stone-400">{item.value}</span>}
                <ChevronRight className="w-5 h-5 text-stone-600" />
              </div>
            </button>
          ))}
        </div>

        {/* App Info */}
        <div className="text-center pt-8">
          <p className="text-sm text-stone-400">ADLTrack v1.0.0</p>
          <p className="text-xs text-stone-500 mt-1">© {new Date().getFullYear()} ADLTrack Inc.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

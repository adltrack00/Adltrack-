import React from 'react';
import { Activity, Heart, Users, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';

export const RoleSelectionPage = ({ onSelectRole, onBack, mode = 'signin' }) => {
  const { isDarkMode, bg, bgCard, bgCardHover, border, text, textSecondary, textMuted } = useTheme();
  
  const isSignUp = mode === 'signup';

  const roles = [
    {
      role: UserRole.CAREGIVER,
      title: "I'm a Caregiver",
      description: 'Manage shifts, tasks & documentation',
      icon: Heart,
      color: 'teal',
      gradient: 'from-teal-500 to-teal-600',
      hoverBorder: 'hover:border-teal-400',
      lightBg: 'bg-teal-50 group-hover:bg-teal-100',
      darkBg: 'bg-teal-500/10 group-hover:bg-teal-500/20',
      iconColor: 'text-teal-600',
      hoverArrow: 'group-hover:text-teal-600'
    },
    {
      role: UserRole.FAMILY,
      title: "I'm a Family Member",
      description: 'Monitor care & stay connected',
      icon: Users,
      color: 'rose',
      gradient: 'from-rose-500 to-rose-600',
      hoverBorder: 'hover:border-rose-400',
      lightBg: 'bg-rose-50 group-hover:bg-rose-100',
      darkBg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
      iconColor: 'text-rose-600',
      hoverArrow: 'group-hover:text-rose-600'
    },
    {
      role: UserRole.ENTERPRISE,
      title: "I'm an Agency",
      description: 'Manage staff & compliance',
      icon: Briefcase,
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      hoverBorder: 'hover:border-indigo-400',
      lightBg: 'bg-indigo-50 group-hover:bg-indigo-100',
      darkBg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
      iconColor: 'text-indigo-600',
      hoverArrow: 'group-hover:text-indigo-600'
    }
  ];

  return (
    <div className={`min-h-screen ${bg} font-['Manrope',sans-serif] flex flex-col`}>
      {/* Header */}
      <header className={`p-6 flex items-center gap-3 border-b ${border}`}>
        <button 
          onClick={onBack}
          className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-100'} transition-colors`}
          data-testid="role-back-btn"
        >
          <ArrowLeft className={`w-5 h-5 ${textMuted}`} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className={`text-lg font-bold tracking-tight ${text}`}>ADLTrack</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className={`text-3xl font-bold ${text} tracking-tight`}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className={`${textSecondary} font-medium`}>
              Select your account type to {isSignUp ? 'get started' : 'continue'}
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4">
            {roles.map(({ role, title, description, icon: Icon, hoverBorder, lightBg, darkBg, iconColor, hoverArrow }) => (
              <button
                key={role}
                onClick={() => onSelectRole(role)}
                className={`w-full p-5 ${bgCard} border-2 ${border} rounded-2xl ${hoverBorder} hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 group text-left`}
                data-testid={`role-select-${role}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${isDarkMode ? darkBg : lightBg} flex items-center justify-center transition-colors`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${text}`}>{title}</h3>
                    <p className={`text-sm ${textSecondary} font-medium`}>{description}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${textMuted} ${hoverArrow} group-hover:translate-x-1 transition-all`} />
                </div>
              </button>
            ))}
          </div>

          {/* Mode Switch */}
          <p className={`text-center ${textSecondary} pt-4`}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => onSelectRole(null, !isSignUp)}
              className={`font-bold text-emerald-500 hover:underline`}
              data-testid="role-switch-mode-btn"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className={`p-6 text-center border-t ${border}`}>
        <p className={`text-sm ${textMuted} font-medium`}>
          © {new Date().getFullYear()} ADLTrack. Secure care coordination.
        </p>
      </footer>
    </div>
  );
};

export default RoleSelectionPage;

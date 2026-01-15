import React from 'react';
import { Activity, Heart, Users, Briefcase, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const RoleSelectionPage = ({ onSelectRole, onBack, mode = 'signin' }) => {
  const isSignUp = mode === 'signup';

  const roles = [
    {
      role: UserRole.CAREGIVER,
      title: "I'm a Caregiver",
      description: 'Manage shifts, tasks & documentation',
      icon: Heart,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 group-hover:bg-teal-100',
      hoverBorder: 'hover:border-teal-400',
      hoverArrow: 'group-hover:text-teal-600'
    },
    {
      role: UserRole.FAMILY,
      title: "I'm a Family Member",
      description: 'Monitor care & stay connected',
      icon: Users,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 group-hover:bg-rose-100',
      hoverBorder: 'hover:border-rose-400',
      hoverArrow: 'group-hover:text-rose-600'
    },
    {
      role: UserRole.ENTERPRISE,
      title: "I'm an Agency",
      description: 'Manage staff & compliance',
      icon: Briefcase,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 group-hover:bg-indigo-100',
      hoverBorder: 'hover:border-indigo-400',
      hoverArrow: 'group-hover:text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-['Manrope',sans-serif] flex flex-col">
      {/* Header - Logo with green text, clickable to go back */}
      <header className="p-6 flex items-center justify-center border-b border-stone-200">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          data-testid="role-logo-btn"
        >
          <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#25D366]">adltrack</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-stone-600 font-medium">
              Select your account type to {isSignUp ? 'get started' : 'continue'}
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4">
            {roles.map(({ role, title, description, icon: Icon, iconColor, iconBg, hoverBorder, hoverArrow }) => (
              <button
                key={role}
                onClick={() => onSelectRole(role)}
                className={`w-full p-5 bg-white border-2 border-stone-200 rounded-2xl ${hoverBorder} hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 group text-left`}
                data-testid={`role-select-${role}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center transition-colors`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900">{title}</h3>
                    <p className="text-sm text-stone-500 font-medium">{description}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-stone-300 ${hoverArrow} group-hover:translate-x-1 transition-all`} />
                </div>
              </button>
            ))}
          </div>

          {/* Mode Switch */}
          <p className="text-center text-stone-600 pt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => onSelectRole(null, !isSignUp)}
              className="font-bold text-emerald-600 hover:underline"
              data-testid="role-switch-mode-btn"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center border-t border-stone-200">
        <p className="text-sm text-stone-500 font-medium">
          © {new Date().getFullYear()} adltrack. Secure care coordination.
        </p>
      </footer>
    </div>
  );
};

export default RoleSelectionPage;

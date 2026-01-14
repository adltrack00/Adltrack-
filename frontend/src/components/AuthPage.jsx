import React, { useState } from 'react';
import { Activity, Heart, Users, Briefcase, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage = ({ mode = 'signin', onBack }) => {
  const { initiateGoogleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(null); // Track which button is loading

  const isSignUp = mode === 'signup';

  const roles = [
    {
      role: UserRole.CAREGIVER,
      title: "I'm a Caregiver",
      description: 'Manage shifts, tasks & documentation',
      icon: Heart,
      iconColor: 'text-teal-600',
      hoverBorder: 'hover:border-teal-400',
      hoverBg: 'hover:bg-teal-50'
    },
    {
      role: UserRole.FAMILY,
      title: "I'm a Family Member",
      description: 'Monitor care & stay connected',
      icon: Users,
      iconColor: 'text-rose-600',
      hoverBorder: 'hover:border-rose-400',
      hoverBg: 'hover:bg-rose-50'
    },
    {
      role: UserRole.ENTERPRISE,
      title: "I'm an Agency",
      description: 'Manage staff & compliance',
      icon: Briefcase,
      iconColor: 'text-indigo-600',
      hoverBorder: 'hover:border-indigo-400',
      hoverBg: 'hover:bg-indigo-50'
    }
  ];

  const handleRoleClick = (role) => {
    setIsLoading(role);
    initiateGoogleLogin(role, isSignUp);
  };

  return (
    <div className="min-h-screen bg-white font-['Manrope',sans-serif] flex flex-col">
      {/* Header - Logo always green, clickable to go back */}
      <header className="p-6 flex items-center justify-center border-b border-stone-200">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          data-testid="auth-logo-btn"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">ADLTrack</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-stone-600 font-medium">
              Select your account type to {isSignUp ? 'get started' : 'continue'} with Google
            </p>
          </div>

          {/* Google Icon */}
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
          </div>

          {/* Role Selection Cards - Click to sign in with Google */}
          <div className="space-y-3">
            {roles.map(({ role, title, description, icon: Icon, iconColor, hoverBorder, hoverBg }) => (
              <button
                key={role}
                onClick={() => handleRoleClick(role)}
                disabled={isLoading !== null}
                className={`w-full p-5 bg-white border-2 border-stone-200 rounded-2xl ${hoverBorder} ${hoverBg} hover:shadow-md transition-all duration-200 group text-left disabled:opacity-50 disabled:cursor-not-allowed`}
                data-testid={`auth-role-${role}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center group-hover:bg-white transition-colors`}>
                    {isLoading === role ? (
                      <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900">{title}</h3>
                    <p className="text-sm text-stone-500 font-medium">{description}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-1 transition-all`} />
                </div>
              </button>
            ))}
          </div>

          {/* Switch Mode */}
          <p className="text-center text-stone-600 pt-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => onBack(isSignUp ? 'signin' : 'signup')}
              className="font-bold text-emerald-600 hover:underline"
              data-testid="auth-switch-mode-btn"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center border-t border-stone-200">
        <p className="text-sm text-stone-500 font-medium">
          © {new Date().getFullYear()} ADLTrack. Secure care coordination.
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;

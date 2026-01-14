import React, { useState } from 'react';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage = ({ mode = 'signin', selectedRole, onBack, onSwitchMode }) => {
  const { initiateGoogleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSignUp = mode === 'signup';

  // Role display config - colors for icons/badges only, not for logo
  const roleConfig = {
    [UserRole.CAREGIVER]: {
      title: 'Caregiver',
      badgeBg: 'bg-teal-50',
      badgeText: 'text-teal-700',
      buttonGradient: 'from-teal-500 to-teal-600',
      description: 'Manage shifts, tasks & care documentation'
    },
    [UserRole.FAMILY]: {
      title: 'Family Member',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      buttonGradient: 'from-rose-500 to-rose-600',
      description: 'Monitor care & stay connected with your loved ones'
    },
    [UserRole.ENTERPRISE]: {
      title: 'Care Agency',
      badgeBg: 'bg-indigo-50',
      badgeText: 'text-indigo-700',
      buttonGradient: 'from-indigo-500 to-indigo-600',
      description: 'Manage staff, compliance & care operations'
    }
  };

  const config = roleConfig[selectedRole] || roleConfig[UserRole.FAMILY];

  const handleGoogleAuth = () => {
    setIsLoading(true);
    initiateGoogleLogin(selectedRole, isSignUp);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // For now, redirect to Google OAuth as primary auth method
    // In production, this would handle email/password auth
    handleGoogleAuth();
  };

  return (
    <div className="min-h-screen bg-white font-['Manrope',sans-serif] flex flex-col">
      {/* Header - Logo ALWAYS green, clickable to go back to landing */}
      <header className="p-6 flex items-center justify-between border-b border-stone-200">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          data-testid="auth-logo-btn"
        >
          {/* Logo always stays emerald/green */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900">ADLTrack</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Role Badge */}
          <div className="flex justify-center">
            <div className={`px-4 py-2 rounded-full ${config.badgeBg} ${config.badgeText} text-sm font-bold`}>
              {config.title} Account
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-stone-600 font-medium">
              {config.description}
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full p-4 bg-white border-2 border-stone-200 rounded-2xl hover:border-stone-400 hover:bg-stone-50 transition-all flex items-center justify-center gap-3 font-bold text-stone-900 disabled:opacity-50"
              data-testid="google-auth-btn"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isSignUp ? 'Sign up with Google' : 'Continue with Google'}
            </button>

            {/* Apple Sign In - Disabled with tooltip */}
            <button
              disabled
              className="w-full p-4 bg-white border-2 border-stone-200 rounded-2xl opacity-50 cursor-not-allowed flex items-center justify-center gap-3 font-bold text-stone-900 relative group"
              data-testid="apple-auth-btn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {isSignUp ? 'Sign up with Apple' : 'Continue with Apple'}
              {/* Tooltip */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-stone-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                Coming soon - Apple Developer account required
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-stone-500 font-medium">or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full p-4 pl-12 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    data-testid="auth-name-input"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-4 pl-12 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  data-testid="auth-email-input"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  className="w-full p-4 pl-12 pr-12 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  data-testid="auth-password-input"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium text-emerald-600 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-4 bg-gradient-to-r ${config.buttonGradient} text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
              data-testid="auth-submit-btn"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Switch Mode Link */}
          <p className="text-center text-stone-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={onSwitchMode}
              className="font-bold text-emerald-600 hover:underline"
              data-testid="auth-switch-mode-btn"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {/* Terms */}
          {isSignUp && (
            <p className="text-center text-xs text-stone-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="underline">Terms of Service</a> and{' '}
              <a href="#" className="underline">Privacy Policy</a>
            </p>
          )}
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

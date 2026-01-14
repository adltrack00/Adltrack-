import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const AuthCallback = ({ onAuthComplete }) => {
  const { isDarkMode, bg, text, textSecondary } = useTheme();
  const { login } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Get session_id from URL fragment
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          console.error('No session_id in callback');
          onAuthComplete(null, 'No session ID received');
          return;
        }

        // Get stored role from sessionStorage
        const role = sessionStorage.getItem('auth_role') || 'family';
        const isSignUp = sessionStorage.getItem('auth_is_signup') === 'true';

        // Clear stored values
        sessionStorage.removeItem('auth_role');
        sessionStorage.removeItem('auth_is_signup');

        // Exchange session_id for app session
        const userData = await login(sessionId, role);

        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        // Success - pass user data to parent
        onAuthComplete(userData, null);

      } catch (error) {
        console.error('Auth callback error:', error);
        onAuthComplete(null, error.message || 'Authentication failed');
      }
    };

    processAuth();
  }, [login, onAuthComplete]);

  return (
    <div className={`min-h-screen ${bg} font-['Manrope',sans-serif] flex flex-col items-center justify-center`}>
      {/* Loading Animation */}
      <div className="flex flex-col items-center space-y-6">
        {/* Logo with pulse */}
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400 rounded-2xl animate-ping opacity-20" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className={`text-xl font-bold ${text}`}>Signing you in...</h2>
          <p className={`${textSecondary} text-sm`}>Please wait while we verify your account</p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-stone-600' : 'bg-stone-300'} animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-stone-600' : 'bg-stone-300'} animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-stone-600' : 'bg-stone-300'} animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

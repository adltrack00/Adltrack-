import React from 'react';
import { Activity, Heart, Users, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { UserRole } from '../types';

export const SignInPage = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-[#111B21]">ADLTrack</span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-zinc-900">Welcome back</h1>
            <p className="text-zinc-500">Select your account type to continue</p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4">
            {/* Caregiver Option */}
            <button
              onClick={() => onSelectRole(UserRole.CAREGIVER)}
              className="w-full p-6 bg-white border-2 border-zinc-100 rounded-2xl hover:border-[#25D366] hover:shadow-lg transition-all duration-200 group text-left"
              data-testid="signin-caregiver-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Heart className="w-7 h-7 text-[#25D366]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">I'm a Caregiver</h3>
                  <p className="text-sm text-zinc-500">Manage shifts, tasks & documentation</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-[#25D366] group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Family Option */}
            <button
              onClick={() => onSelectRole(UserRole.FAMILY)}
              className="w-full p-6 bg-white border-2 border-zinc-100 rounded-2xl hover:border-purple-400 hover:shadow-lg transition-all duration-200 group text-left"
              data-testid="signin-family-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">I'm a Family Member</h3>
                  <p className="text-sm text-zinc-500">Monitor care & stay connected</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>

            {/* Enterprise Option */}
            <button
              onClick={() => onSelectRole(UserRole.ENTERPRISE)}
              className="w-full p-6 bg-white border-2 border-zinc-100 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 group text-left"
              data-testid="signin-enterprise-btn"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Briefcase className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">I'm an Agency</h3>
                  <p className="text-sm text-zinc-500">Manage staff & compliance</p>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          </div>

          {/* Demo Notice */}
          <div className="pt-4 text-center">
            <p className="text-xs text-zinc-400">
              This is a demo environment. Select any role to explore the app.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-zinc-400">
          © {new Date().getFullYear()} ADLTrack. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default SignInPage;

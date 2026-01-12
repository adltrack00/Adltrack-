import React, { useState } from 'react';
import { 
  Activity, MessageSquare, Bell, Settings, Bot, Heart, Thermometer, 
  ChevronRight, User, Clock, CheckCircle, Camera, Frown
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { PatientProfileModal } from './PatientProfileModal';
import { VitalsModal } from './VitalsModal';
import { AICopilot } from './AICopilot';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountsPage } from './pages/AccountsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SupportPage } from './pages/SupportPage';
import { ChatPage } from './pages/ChatPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { CaregiverPage } from './pages/CaregiverPage';

export const FamilyDashboard = ({ 
  onBack, 
  onSignOut,
  tasks = [],
  patient,
  vitalsData
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [activePage, setActivePage] = useState(null);

  // Get latest vitals
  const latestBP = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];
  const latestPain = vitalsData?.pain?.[vitalsData.pain.length - 1];

  // Filter completed tasks for timeline
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);

  // Helper to get task image
  const getTaskImage = (task) => {
    if (task.evidenceUrl) return task.evidenceUrl;
    // Default images based on task type
    const title = task.title.toLowerCase();
    if (title.includes('medication') || title.includes('med')) {
      return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80';
    }
    if (title.includes('breakfast') || title.includes('lunch') || title.includes('dinner') || title.includes('meal')) {
      return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80';
    }
    if (title.includes('walk') || title.includes('exercise')) {
      return 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1576091160550-217358c7e618?w=400&q=80';
  };

  // Render sub-pages
  if (activePage === 'profile') {
    return <ProfilePage onBack={() => setActivePage(null)} role={UserRole.FAMILY} onSignOut={onSignOut} />;
  }
  if (activePage === 'settings') {
    return <SettingsPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'billing') {
    return <AccountsPage onBack={() => setActivePage(null)} role={UserRole.FAMILY} />;
  }
  if (activePage === 'history') {
    return <HistoryPage onBack={() => setActivePage(null)} role={UserRole.FAMILY} />;
  }
  if (activePage === 'support') {
    return <SupportPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'chat') {
    return <ChatPage onBack={() => setActivePage(null)} role={UserRole.FAMILY} />;
  }
  if (activePage === 'updates') {
    return <UpdatesPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'caregiver') {
    return <CaregiverPage onBack={() => setActivePage(null)} />;
  }

  // Render Home Content
  const renderHomeContent = () => (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Vitals Row */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 justify-center">
          {/* BP */}
          <button 
            onClick={() => setShowVitals(true)}
            className="relative flex-1 max-w-[80px] aspect-square rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-500" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-[3px] rounded-xl bg-white/90 flex flex-col items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500 mb-0.5" />
              <span className="text-[10px] font-bold text-zinc-800">BP</span>
              <span className="text-[9px] text-zinc-500">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--'}</span>
            </div>
          </button>

          {/* HR */}
          <button 
            onClick={() => setShowVitals(true)}
            className="relative flex-1 max-w-[80px] aspect-square rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-[3px] rounded-xl bg-white/90 flex flex-col items-center justify-center">
              <Activity className="w-4 h-4 text-orange-500 mb-0.5" />
              <span className="text-[10px] font-bold text-zinc-800">HR</span>
              <span className="text-[9px] text-zinc-500">{latestHR ? latestHR.value : '--'}</span>
            </div>
          </button>

          {/* Temp */}
          <button 
            onClick={() => setShowVitals(true)}
            className="relative flex-1 max-w-[80px] aspect-square rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-[3px] rounded-xl bg-white/90 flex flex-col items-center justify-center">
              <Thermometer className="w-4 h-4 text-blue-500 mb-0.5" />
              <span className="text-[10px] font-bold text-zinc-800">Temp</span>
              <span className="text-[9px] text-zinc-500">{latestTemp ? `${latestTemp.value}°` : '--'}</span>
            </div>
          </button>

          {/* Pain */}
          <button 
            onClick={() => setShowVitals(true)}
            className="relative flex-1 max-w-[80px] aspect-square rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-500" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="absolute inset-[3px] rounded-xl bg-white/90 flex flex-col items-center justify-center">
              <Frown className="w-4 h-4 text-purple-500 mb-0.5" />
              <span className="text-[10px] font-bold text-zinc-800">Pain</span>
              <span className="text-[9px] text-zinc-500">{latestPain ? `${latestPain.value}/10` : '--'}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-zinc-900">Care Timeline</h2>
        <p className="text-sm text-zinc-500">Today's completed tasks</p>
      </div>

      {/* Timeline Feed */}
      <div className="px-4 space-y-4">
        {completedTasks.length > 0 ? (
          completedTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
              {/* Task Image */}
              <div className="relative aspect-video">
                <img 
                  src={getTaskImage(task)} 
                  alt={task.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Verified Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  {task.evidenceUrl ? 'Verified' : 'Completed'}
                </div>

                {/* Task Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{task.title}</h3>
                  <p className="text-white/80 text-sm">Completed at {task.completedAt}</p>
                </div>
              </div>

              {/* Notes */}
              {task.completionNote && (
                <div className="p-4 border-t border-zinc-100">
                  <p className="text-sm text-zinc-600">
                    <span className="font-medium text-zinc-900">Note:</span> {task.completionNote}
                  </p>
                </div>
              )}

              {/* Caregiver Attribution */}
              <div className="px-4 py-3 bg-zinc-50 flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80"
                  alt="Caregiver"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">Julia Martinez</p>
                  <p className="text-xs text-zinc-500">Caregiver</p>
                </div>
                <Clock className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500">No completed tasks yet today</p>
            <p className="text-sm text-zinc-400 mt-1">Updates will appear here as care is delivered</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Settings Content
  const renderSettingsContent = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* Patient Profile Quick Access */}
      <button
        onClick={() => setShowPatientProfile(true)}
        className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
      >
        <img 
          src={patient?.photo || 'https://via.placeholder.com/60'} 
          alt={patient?.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 text-left">
          <p className="font-medium text-zinc-900">{patient?.name || 'Patient'}</p>
          <p className="text-sm text-zinc-500">View Medical Profile</p>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-400" />
      </button>

      {/* Menu Items */}
      {[
        { label: 'My Profile', icon: User, action: () => setActivePage('profile') },
        { label: 'Billing', icon: Activity, action: () => setActivePage('billing') },
        { label: 'Care History', icon: Clock, action: () => setActivePage('history') },
        { label: 'Current Caregiver', icon: Heart, action: () => setActivePage('caregiver') },
        { label: 'Settings', icon: Settings, action: () => setActivePage('settings') },
        { label: 'Support', icon: Bell, action: () => setActivePage('support') },
      ].map((item, idx) => (
        <button
          key={idx}
          onClick={item.action}
          className="w-full flex items-center gap-4 p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center">
            <item.icon className="w-5 h-5 text-zinc-600" />
          </div>
          <span className="font-medium text-zinc-900">{item.label}</span>
          <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Inter',sans-serif]">
      {/* Main Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'chat' && <ChatPage onBack={() => setActiveTab('home')} role={UserRole.FAMILY} />}
      {activeTab === 'notifications' && <UpdatesPage onBack={() => setActiveTab('home')} />}
      {activeTab === 'settings' && renderSettingsContent()}

      {/* Floating Copilot Button */}
      {activeTab === 'home' && (
        <button
          onClick={() => setShowCopilot(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-zinc-900 rounded-full shadow-xl flex items-center justify-center hover:bg-zinc-800 transition-colors z-40"
          data-testid="family-copilot-btn"
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-6 py-2 flex justify-around items-center z-30">
        {[
          { id: 'home', icon: Activity },
          { id: 'chat', icon: MessageSquare },
          { id: 'notifications', icon: Bell },
          { id: 'settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
              activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-zinc-900' : ''}`} />
          </button>
        ))}
      </nav>

      {/* Modals */}
      <PatientProfileModal
        isOpen={showPatientProfile}
        onClose={() => setShowPatientProfile(false)}
        patient={patient}
      />

      <VitalsModal
        isOpen={showVitals}
        onClose={() => setShowVitals(false)}
        vitalsData={vitalsData}
        isCaregiver={false}
      />

      <AICopilot
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        role="family"
        patientName={patient?.name}
      />
    </div>
  );
};

export default FamilyDashboard;

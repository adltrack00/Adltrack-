import React, { useState } from 'react';
import { 
  Home, MessageSquare, Clock, Settings, Bot, User, Heart, Activity, Thermometer,
  MapPin, Play, Square, ChevronRight, Bell
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { TaskCard } from './TaskCard';
import { TaskRequestCard } from './TaskRequestCard';
import { TaskCompletionModal } from './TaskCompletionModal';
import { PatientProfileModal } from './PatientProfileModal';
import { VitalsModal } from './VitalsModal';
import { AICopilot } from './AICopilot';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountsPage } from './pages/AccountsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SupportPage } from './pages/SupportPage';
import { ChatPage } from './pages/ChatPage';

export const CaregiverDashboard = ({ 
  onBack, 
  onSignOut,
  tasks = [],
  proposedTasks = [],
  patient,
  vitalsData,
  onUpdateTask,
  onAcceptTask,
  onDeclineTask,
  onAddVital,
  onUpdatePatientPhoto
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaskTab, setActiveTaskTab] = useState('today');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [activePage, setActivePage] = useState(null);

  // Get latest vitals
  const latestBP = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];

  // Filter tasks
  const todayTasks = tasks.filter(t => t.status !== TaskStatus.PROPOSED);
  const pendingRequests = proposedTasks.filter(t => t.status === TaskStatus.PROPOSED);

  const handleStartShift = () => {
    setIsShiftActive(true);
    setShiftStartTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  };

  const handleEndShift = () => {
    if (window.confirm('Are you sure you want to end your shift?')) {
      setIsShiftActive(false);
      setShiftStartTime(null);
    }
  };

  const handleStartTask = (task) => {
    setSelectedTask(task);
  };

  const handleCompleteTask = (updatedTask) => {
    onUpdateTask && onUpdateTask(updatedTask);
    setSelectedTask(null);
    setExpandedTaskId(null);
  };

  // Render sub-pages
  if (activePage === 'profile') {
    return <ProfilePage onBack={() => setActivePage(null)} role={UserRole.CAREGIVER} onSignOut={onSignOut} />;
  }
  if (activePage === 'settings') {
    return <SettingsPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'earnings') {
    return <AccountsPage onBack={() => setActivePage(null)} role={UserRole.CAREGIVER} />;
  }
  if (activePage === 'history') {
    return <HistoryPage onBack={() => setActivePage(null)} role={UserRole.CAREGIVER} />;
  }
  if (activePage === 'support') {
    return <SupportPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'chat') {
    return <ChatPage onBack={() => setActivePage(null)} role={UserRole.CAREGIVER} />;
  }

  // Render Home Content
  const renderHomeContent = () => {
    if (!isShiftActive) {
      // Offline State - Show Start Shift
      return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">You're Offline</h2>
            <p className="text-zinc-500">Start your shift to begin caring for {patient?.name || 'the patient'}</p>
          </div>
          
          {/* Start Shift Button */}
          <button
            onClick={handleStartShift}
            className="relative group"
            data-testid="start-shift-btn"
          >
            {/* Pulse Ring */}
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
            {/* Button */}
            <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-xl group-hover:bg-green-600 transition-colors">
              <Play className="w-12 h-12 text-white ml-2" />
            </div>
          </button>
          <p className="text-sm text-zinc-500 mt-4">Tap to start shift</p>
        </div>
      );
    }

    // Online State - Show Dashboard
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Patient Header */}
        <div className="px-4 pt-4">
          <button 
            onClick={() => setShowPatientProfile(true)}
            className="flex items-center gap-3 w-full"
          >
            <img 
              src={patient?.photo || 'https://via.placeholder.com/60'} 
              alt={patient?.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex-1 text-left">
              <h2 className="font-semibold text-zinc-900">{patient?.name || 'Patient'}</h2>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Shift started at {shiftStartTime}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Vitals Cards */}
        <div className="px-4 py-4">
          <div className="flex gap-2 justify-center">
            {/* BP */}
            <button 
              onClick={() => setShowVitals(true)}
              className="relative flex-1 max-w-[100px] aspect-square rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-500" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <div className="absolute inset-[3px] rounded-xl bg-white/90 flex flex-col items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500 mb-1" />
                <span className="text-xs font-bold text-zinc-800">BP</span>
                <span className="text-[10px] text-zinc-500">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--'}</span>
              </div>
            </button>

            {/* HR */}
            <button 
              onClick={() => setShowVitals(true)}
              className="relative flex-1 max-w-[100px] aspect-square rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <div className="absolute inset-[3px] rounded-xl bg-white/90 flex flex-col items-center justify-center">
                <Activity className="w-5 h-5 text-orange-500 mb-1" />
                <span className="text-xs font-bold text-zinc-800">HR</span>
                <span className="text-[10px] text-zinc-500">{latestHR ? `${latestHR.value} bpm` : '--'}</span>
              </div>
            </button>

            {/* Temp */}
            <button 
              onClick={() => setShowVitals(true)}
              className="relative flex-1 max-w-[100px] aspect-square rounded-2xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-500" />
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <div className="absolute inset-[3px] rounded-xl bg-white/90 flex flex-col items-center justify-center">
                <Thermometer className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-xs font-bold text-zinc-800">Temp</span>
                <span className="text-[10px] text-zinc-500">{latestTemp ? `${latestTemp.value}°F` : '--'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Task Tabs */}
        <div className="px-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTaskTab('today')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                activeTaskTab === 'today'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              Today's Plan
            </button>
            <button
              onClick={() => setActiveTaskTab('requests')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all relative ${
                activeTaskTab === 'requests'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="px-4 space-y-3">
          {activeTaskTab === 'today' ? (
            todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={(id) => setExpandedTaskId(expandedTaskId === id ? null : id)}
                  onStartTask={handleStartTask}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-500">No tasks for today</p>
              </div>
            )
          ) : (
            pendingRequests.length > 0 ? (
              pendingRequests.map((task) => (
                <TaskRequestCard
                  key={task.id}
                  task={task}
                  onAccept={onAcceptTask}
                  onDecline={onDeclineTask}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-zinc-500">No pending requests</p>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Render Shift Tab
  const renderShiftContent = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Shift Status */}
      <div className={`p-6 rounded-2xl ${isShiftActive ? 'bg-green-50 border border-green-200' : 'bg-zinc-50'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-900">Current Shift</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isShiftActive ? 'bg-green-100 text-green-700' : 'bg-zinc-200 text-zinc-600'
          }`}>
            {isShiftActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {isShiftActive && (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Started</span>
              <span className="font-medium text-zinc-900">{shiftStartTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Patient</span>
              <span className="font-medium text-zinc-900">{patient?.name}</span>
            </div>
          </div>
        )}

        <button
          onClick={isShiftActive ? handleEndShift : handleStartShift}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            isShiftActive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isShiftActive ? 'End Shift' : 'Start Shift'}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-zinc-900">Quick Actions</h3>
        {[
          { label: 'View Earnings', action: () => setActivePage('earnings') },
          { label: 'Shift History', action: () => setActivePage('history') },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <span className="font-medium text-zinc-900">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        ))}
      </div>
    </div>
  );

  // Render Settings Tab
  const renderSettingsContent = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {[
        { label: 'Profile', icon: User, action: () => setActivePage('profile') },
        { label: 'Earnings', icon: Activity, action: () => setActivePage('earnings') },
        { label: 'Shift History', icon: Clock, action: () => setActivePage('history') },
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
      {activeTab === 'chat' && <ChatPage onBack={() => setActiveTab('home')} role={UserRole.CAREGIVER} />}
      {activeTab === 'shift' && renderShiftContent()}
      {activeTab === 'settings' && renderSettingsContent()}

      {/* Floating Copilot Button */}
      {activeTab === 'home' && isShiftActive && (
        <button
          onClick={() => setShowCopilot(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-zinc-900 rounded-full shadow-xl flex items-center justify-center hover:bg-zinc-800 transition-colors z-40"
          data-testid="copilot-btn"
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-100 px-6 py-2 flex justify-around items-center z-30">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'chat', icon: MessageSquare, label: 'Chats' },
          { id: 'shift', icon: Clock, label: 'Shift', badge: isShiftActive },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors relative ${
              activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400'
            }`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-zinc-900' : ''}`} />
            {tab.badge && (
              <div className="absolute top-1 right-3 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Modals */}
      {selectedTask && (
        <TaskCompletionModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={handleCompleteTask}
        />
      )}

      <PatientProfileModal
        isOpen={showPatientProfile}
        onClose={() => setShowPatientProfile(false)}
        patient={patient}
        onUpdatePhoto={onUpdatePatientPhoto}
      />

      <VitalsModal
        isOpen={showVitals}
        onClose={() => setShowVitals(false)}
        vitalsData={vitalsData}
        onAddVital={onAddVital}
        isCaregiver={true}
      />

      <AICopilot
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        role="caregiver"
        patientName={patient?.name}
      />
    </div>
  );
};

export default CaregiverDashboard;

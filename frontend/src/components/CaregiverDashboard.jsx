import React, { useState } from 'react';
import { 
  Home, MessageSquare, Clock, Settings, Bot, User, Heart, Activity, Thermometer,
  MapPin, Play, ChevronRight, Bell, CheckCircle, Sparkles, Frown
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
import { RoleSwitcher } from './RoleSwitcher';
import { CAREGIVER_PROFILE } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

export const CaregiverDashboard = ({ 
  onBack, 
  onSignOut,
  onRoleSwitch,
  currentRole,
  tasks = [],
  proposedTasks = [],
  patient,
  vitalsData,
  onUpdateTask,
  onAcceptTask,
  onDeclineTask,
  onAddVital,
  onUpdatePatientPhoto,
  skipStartShift = false
}) => {
  const { isDarkMode, bg, bgCard, bgCardHover, border, text, textSecondary, textMuted, bgNav, bgInput } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaskTab, setActiveTaskTab] = useState('today');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(skipStartShift); // Auto-start if skipStartShift
  const [shiftStartTime, setShiftStartTime] = useState(skipStartShift ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null);
  const [activePage, setActivePage] = useState(null);

  // Get latest vitals
  const latestBP = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];
  const latestPain = vitalsData?.pain?.[vitalsData.pain.length - 1];

  // Filter tasks
  const todayTasks = tasks.filter(t => t.status !== TaskStatus.PROPOSED);
  const pendingRequests = proposedTasks.filter(t => t.status === TaskStatus.PROPOSED);
  const completedCount = todayTasks.filter(t => t.status === TaskStatus.COMPLETED).length;

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
      // Offline State - Uber-style GO interface
      return (
        <div className={`flex-1 flex flex-col ${bg}`}>
          {/* Header with caregiver info */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-4">
              <img 
                src={CAREGIVER_PROFILE.photo} 
                alt="You"
                className={`w-14 h-14 rounded-full object-cover ring-2 ${isDarkMode ? 'ring-stone-800' : 'ring-stone-200'} shadow-lg`}
              />
              <div>
                <p className={`${textMuted} text-sm font-medium`}>Good morning,</p>
                <h1 className={`text-xl font-bold ${text} tracking-tight`}>Julia</h1>
              </div>
            </div>
          </div>

          {/* Patient Card */}
          <div className="px-6 mb-6">
            <div className={`${bgCard} border ${border} rounded-3xl p-5`}>
              <p className={`${textMuted} text-sm font-medium mb-3`}>Ready to care for</p>
              <div className="flex items-center gap-4">
                <img 
                  src={patient?.photo || 'https://via.placeholder.com/80'} 
                  alt={patient?.name}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${text}`}>{patient?.name || 'Patient'}</h2>
                  <p className={`${textSecondary} text-sm`}>{patient?.age} years old</p>
                </div>
                <button 
                  onClick={() => setShowPatientProfile(true)}
                  className={`p-3 ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'} rounded-full transition-colors`}
                >
                  <ChevronRight className={`w-5 h-5 ${textMuted}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Start Shift Section */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
            <p className={`${textMuted} font-medium mb-2`}>You&apos;re offline</p>
            <h2 className={`text-2xl font-bold ${text} mb-8 text-center`}>
              Tap to start your shift
            </h2>
            
            {/* Uber-style GO Button */}
            <button
              onClick={handleStartShift}
              className="relative group"
              data-testid="start-shift-btn"
            >
              {/* Outer pulse ring */}
              <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20 scale-110" />
              {/* Middle glow */}
              <div className="absolute inset-[-8px] bg-gradient-to-br from-rose-400 to-rose-500 rounded-full opacity-30 group-hover:opacity-50 transition-opacity blur-xl" />
              {/* Main button */}
              <div className="relative w-36 h-36 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(244,63,94,0.4)] group-hover:shadow-[0_12px_40px_rgba(244,63,94,0.5)] transition-all group-hover:scale-105">
                <Play className="w-14 h-14 text-white ml-2" fill="white" />
              </div>
            </button>
            
            <p className={`${textMuted} text-sm mt-6`}>
              {todayTasks.length} tasks scheduled for today
            </p>
          </div>
        </div>
      );
    }

    // Online State - Dashboard
    return (
      <div className={`flex-1 overflow-y-auto ${bg} pb-20`}>
        {/* Patient Header with Photo - Vitals overlapping from middle */}
        <div className="relative">
          {/* Photo Container */}
          <div className="relative h-44 overflow-hidden">
            {/* Patient Photo Background */}
            <img 
              src={patient?.photo || 'https://via.placeholder.com/400'} 
              alt={patient?.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            {/* Patient Info - positioned above vitals */}
            <button 
              onClick={() => setShowPatientProfile(true)}
              className="absolute bottom-12 left-0 right-0 px-5 flex items-center justify-between"
            >
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-md">{patient?.name || 'Patient'}</h2>
                <p className="text-white/90 text-xs font-medium drop-shadow-md">{patient?.age} years old</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
          </div>

          {/* Vitals Row - Overlapping from middle of photo */}
          <div className="px-5 -mt-6 relative z-10">
            <div className="grid grid-cols-4 gap-2">
              {/* BP Card */}
              <button 
                onClick={() => setShowVitals(true)}
                className={`${bgCard} border ${border} rounded-2xl p-3 ${bgCardHover} transition-colors`}
              >
                <div className="w-9 h-9 bg-rose-500/20 rounded-xl flex items-center justify-center mb-2 mx-auto">
                  <Heart className="w-4 h-4 text-rose-400" />
                </div>
                <p className={`text-base font-bold ${text} text-center`}>{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--'}</p>
                <p className={`text-[10px] ${textSecondary} font-medium mt-0.5 text-center`}>BP</p>
              </button>

              {/* HR Card */}
              <button 
                onClick={() => setShowVitals(true)}
                className={`${bgCard} border ${border} rounded-2xl p-3 ${bgCardHover} transition-colors`}
              >
                <div className="w-9 h-9 bg-orange-500/20 rounded-xl flex items-center justify-center mb-2 mx-auto">
                  <Activity className="w-4 h-4 text-orange-400" />
                </div>
                <p className={`text-base font-bold ${text} text-center`}>{latestHR ? latestHR.value : '--'}</p>
                <p className={`text-[10px] ${textSecondary} font-medium mt-0.5 text-center`}>Heart</p>
              </button>

              {/* Temp Card */}
              <button 
                onClick={() => setShowVitals(true)}
                className={`${bgCard} border ${border} rounded-2xl p-3 ${bgCardHover} transition-colors`}
              >
                <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center mb-2 mx-auto">
                  <Thermometer className="w-4 h-4 text-blue-400" />
                </div>
                <p className={`text-base font-bold ${text} text-center`}>{latestTemp ? `${latestTemp.value}°` : '--'}</p>
                <p className={`text-[10px] ${textSecondary} font-medium mt-0.5 text-center`}>Temp</p>
              </button>

              {/* Pain Card */}
              <button 
                onClick={() => setShowVitals(true)}
                className={`${bgCard} border ${border} rounded-2xl p-3 ${bgCardHover} transition-colors`}
              >
                <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center mb-2 mx-auto">
                  <Frown className="w-4 h-4 text-purple-400" />
                </div>
                <p className={`text-base font-bold ${text} text-center`}>{latestPain ? `${latestPain.value}/10` : '--'}</p>
                <p className={`text-[10px] ${textSecondary} font-medium mt-0.5 text-center`}>Pain</p>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${textSecondary}`}>Today&apos;s Progress</span>
            <span className={`text-sm font-bold ${text}`}>{completedCount}/{todayTasks.length}</span>
          </div>
          <div className={`h-2 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-200'} rounded-full overflow-hidden`}>
            <div 
              className="h-full bg-[#25D366] rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / todayTasks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task Tabs - Minimal Line Style */}
        <div className="px-6 mb-4">
          <div className="flex items-center gap-4">
            {/* Requests on left */}
            <button
              onClick={() => setActiveTaskTab('requests')}
              className="relative"
            >
              <span className={`text-sm font-semibold transition-colors ${
                activeTaskTab === 'requests'
                  ? text
                  : `${textMuted} hover:${textSecondary}`
              }`}>
                Requests
              </span>
              {pendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-3 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            
            {/* Line */}
            <div className={`flex-1 h-px ${isDarkMode ? 'bg-stone-700' : 'bg-stone-300'}`} />
            
            {/* Today's Tasks on right */}
            <button
              onClick={() => setActiveTaskTab('today')}
              className={`text-sm font-semibold transition-colors ${
                activeTaskTab === 'today'
                  ? text
                  : `${textMuted} hover:${textSecondary}`
              }`}
            >
              Today&apos;s Tasks
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="px-6 space-y-3 pb-4">
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
              <div className={`text-center py-12 ${bgCard} border ${border} rounded-3xl`}>
                <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto mb-3" />
                <p className={`${text} font-semibold`}>All done for today!</p>
                <p className={`${textSecondary} text-sm`}>Great work, Julia</p>
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
              <div className={`text-center py-12 ${bgCard} border ${border} rounded-3xl`}>
                <Sparkles className={`w-12 h-12 ${textMuted} mx-auto mb-3`} />
                <p className={textMuted}>No pending requests</p>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Render Shift Tab
  const renderShiftContent = () => (
    <div className="flex-1 overflow-y-auto bg-stone-950 p-6 space-y-4 pb-24">
      {/* Shift Status Card */}
      <div className={`rounded-3xl p-6 border ${isShiftActive ? 'bg-[#25D366] border-[#20bd5a]' : 'bg-stone-900 border-stone-800'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`font-bold text-lg ${isShiftActive ? 'text-white' : 'text-white'}`}>Current Shift</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isShiftActive ? 'bg-white/20 text-white' : 'bg-stone-800 text-stone-400'
          }`}>
            {isShiftActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {isShiftActive && (
          <div className="space-y-3 mb-5">
            <div className="flex justify-between">
              <span className="text-white/70">Started</span>
              <span className="font-semibold text-white">{shiftStartTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Patient</span>
              <span className="font-semibold text-white">{patient?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Tasks completed</span>
              <span className="font-semibold text-white">{completedCount}/{todayTasks.length}</span>
            </div>
          </div>
        )}

        <button
          onClick={isShiftActive ? handleEndShift : handleStartShift}
          className={`w-full py-4 rounded-2xl font-bold transition-all ${
            isShiftActive 
              ? 'bg-white text-rose-600 hover:bg-stone-100' 
              : 'bg-[#25D366] text-white hover:bg-[#20bd5a]'
          }`}
        >
          {isShiftActive ? 'End Shift' : 'Start Shift'}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5">
        <h3 className="font-bold text-white mb-4">Quick Actions</h3>
        {[
          { label: 'View Earnings', action: () => setActivePage('earnings'), icon: '💰' },
          { label: 'Shift History', action: () => setActivePage('history'), icon: '📋' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 hover:bg-stone-800 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-white">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-500" />
          </button>
        ))}
      </div>
    </div>
  );

  // Render Settings Tab
  const renderSettingsContent = () => (
    <div className={`flex-1 overflow-y-auto ${bg} p-6 space-y-3 pb-24`}>
      {/* Profile Card - Clickable to open profile */}
      <button 
        onClick={() => setActivePage('profile')}
        className={`w-full ${bgCard} border ${border} rounded-3xl p-5 ${bgCardHover} transition-colors text-left`}
      >
        <div className="flex items-center gap-4">
          <img 
            src={CAREGIVER_PROFILE.photo}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <h3 className={`font-bold ${text}`}>Julia Martinez</h3>
            <p className={`${textSecondary} text-sm`}>Certified Nursing Assistant</p>
          </div>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`} />
        </div>
      </button>

      {/* Menu Items */}
      {[
        { label: 'Earnings', icon: Activity, action: () => setActivePage('earnings') },
        { label: 'Shift History', icon: Clock, action: () => setActivePage('history') },
        { label: 'Settings', icon: Settings, action: () => setActivePage('settings') },
        { label: 'Support', icon: Bell, action: () => setActivePage('support') },
      ].map((item, idx) => (
        <button
          key={idx}
          onClick={item.action}
          className={`w-full flex items-center gap-4 p-4 ${bgCard} border ${border} rounded-2xl ${bgCardHover} transition-colors`}
        >
          <div className={`w-11 h-11 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'} rounded-xl flex items-center justify-center`}>
            <item.icon className={`w-5 h-5 ${textMuted}`} />
          </div>
          <span className={`font-medium ${text} flex-1 text-left`}>{item.label}</span>
          <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} flex flex-col font-['Manrope',sans-serif]`}>
      {/* Main Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'chat' && <ChatPage onBack={() => setActiveTab('home')} role={UserRole.CAREGIVER} />}
      {activeTab === 'shift' && renderShiftContent()}
      {activeTab === 'settings' && renderSettingsContent()}

      {/* Floating Copilot Button - Smaller, Light Green */}
      {activeTab === 'home' && isShiftActive && (
        <button
          onClick={() => setShowCopilot(true)}
          className="fixed bottom-24 right-5 w-11 h-11 bg-[#25D366] rounded-xl shadow-[0_4px_20px_rgba(37,211,102,0.4)] flex items-center justify-center hover:shadow-[0_8px_25px_rgba(37,211,102,0.5)] transition-all hover:scale-105 z-40"
          data-testid="copilot-btn"
        >
          <Bot className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Bottom Navigation - Fixed to bottom */}
      <nav className={`fixed bottom-0 left-0 right-0 ${bgNav} border-t ${border} z-30`}>
        <div className="flex justify-around items-center py-2">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'shift', icon: Clock, label: 'Shift', badge: isShiftActive },
            { id: 'settings', icon: Settings, label: 'Menu' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-5 transition-all relative ${
                activeTab === tab.id 
                  ? 'text-[#25D366]' 
                  : `${textMuted} hover:${textSecondary}`
              }`}
            >
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] font-semibold mt-1 ${activeTab === tab.id ? 'text-[#25D366]' : textMuted}`}>{tab.label}</span>
              {tab.badge && (
                <div className={`absolute top-1 right-3 w-2.5 h-2.5 bg-[#25D366] rounded-full ring-2 ${isDarkMode ? 'ring-stone-900' : 'ring-white'}`} />
              )}
            </button>
          ))}
        </div>
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
        tasks={tasks}
        role="caregiver"
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

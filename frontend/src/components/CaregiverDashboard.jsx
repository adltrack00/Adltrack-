import React, { useState } from 'react';
import { 
  Home, MessageSquare, Clock, Settings, Cpu, User, Heart, Activity, Thermometer,
  MapPin, Play, ChevronRight, Bell, CheckCircle, Sparkles, Frown, AlertTriangle
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { TaskCard } from './TaskCard';
import { TaskRequestCard } from './TaskRequestCard';
import { TaskCompletionModal } from './TaskCompletionModal';
import { PatientProfileModal } from './PatientProfileModal';
import { VitalsModal } from './VitalsModal';
import { AICopilot } from './AICopilot';
import { IncidentReportPage } from './IncidentReportPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountsPage } from './pages/AccountsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SupportPage } from './pages/SupportPage';
import { ChatPage } from './pages/ChatPage';
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
  incidents = [],
  onAddIncident,
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
  
  // Historical date viewing
  const [viewingDate, setViewingDate] = useState(null);
  const [historicalTasks, setHistoricalTasks] = useState([]);

  const today = new Date(2026, 0, 17); // Jan 17, 2026
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const formatDateHeader = (date) => {
    if (!date) return '';
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return 'Today';
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Handle date selection from patient profile calendar
  const handleSelectHistoricalDate = (date, tasksForDate) => {
    setViewingDate(date);
    setHistoricalTasks(tasksForDate);
    setActiveTab('home');
  };

  // Return to today's view
  const handleReturnToToday = () => {
    setViewingDate(null);
    setHistoricalTasks([]);
  };

  // Get latest vitals
  const latestBP = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];
  const latestPain = vitalsData?.pain?.[vitalsData.pain.length - 1];

  // Filter tasks - use historical tasks if viewing past date
  const displayTasks = viewingDate ? historicalTasks : tasks.filter(t => t.status !== TaskStatus.PROPOSED);
  const todayTasks = tasks.filter(t => t.status !== TaskStatus.PROPOSED);
  const pendingRequests = proposedTasks.filter(t => t.status === TaskStatus.PROPOSED);
  const completedCount = viewingDate 
    ? historicalTasks.filter(t => t.status === TaskStatus.COMPLETED).length
    : todayTasks.filter(t => t.status === TaskStatus.COMPLETED).length;

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
        {/* Patient Card - Rounded card with photo background */}
        <div className="px-4 pt-3">
          <button 
            onClick={() => setShowPatientProfile(true)}
            className="relative w-full h-56 rounded-3xl overflow-hidden"
          >
            {/* Patient Photo Background */}
            <img 
              src={patient?.photo || 'https://via.placeholder.com/400'} 
              alt={patient?.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            {/* Subtle gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Patient Info - positioned at bottom left */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{patient?.name || 'Patient'}</h2>
                <p className="text-white/70 text-sm font-medium mt-0.5">{patient?.age} years old</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/60" />
            </div>
          </button>
        </div>

        {/* Vitals Grid - 4 dark cards with rounded square colored icons */}
        <div className="px-4 mt-3">
          <div className="grid grid-cols-4 gap-2.5">
            {/* BP Card */}
            <button 
              onClick={() => setShowVitals(true)}
              className="bg-[#1c1c1e] rounded-2xl py-4 px-2 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-12 h-12 bg-[#5c1a3d] rounded-2xl flex items-center justify-center mb-2.5 mx-auto">
                <Heart className="w-6 h-6 text-[#e91e7a]" fill="currentColor" />
              </div>
              <p className="text-lg font-bold text-white text-center">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--'}</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5 text-center">BP</p>
            </button>

            {/* Heart Card */}
            <button 
              onClick={() => setShowVitals(true)}
              className="bg-[#1c1c1e] rounded-2xl py-4 px-2 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-12 h-12 bg-[#6b3410] rounded-2xl flex items-center justify-center mb-2.5 mx-auto">
                <Activity className="w-6 h-6 text-[#f97316]" />
              </div>
              <p className="text-lg font-bold text-white text-center">{latestHR ? latestHR.value : '--'}</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5 text-center">Heart</p>
            </button>

            {/* Temp Card */}
            <button 
              onClick={() => setShowVitals(true)}
              className="bg-[#1c1c1e] rounded-2xl py-4 px-2 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-12 h-12 bg-[#1a3a5c] rounded-2xl flex items-center justify-center mb-2.5 mx-auto">
                <Thermometer className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <p className="text-lg font-bold text-white text-center">{latestTemp ? `${latestTemp.value}°` : '--'}</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5 text-center">Temp</p>
            </button>

            {/* Pain Card */}
            <button 
              onClick={() => setShowVitals(true)}
              className="bg-[#1c1c1e] rounded-2xl py-4 px-2 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-12 h-12 bg-[#3d1a5c] rounded-2xl flex items-center justify-center mb-2.5 mx-auto">
                <div className="w-7 h-7 rounded-full border-2 border-[#9333ea] flex items-center justify-center">
                  <Frown className="w-4 h-4 text-[#9333ea]" />
                </div>
              </div>
              <p className="text-lg font-bold text-white text-center">{latestPain ? `${latestPain.value}/10` : '--'}</p>
              <p className="text-xs text-stone-500 font-medium mt-0.5 text-center">Pain</p>
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="px-4 py-4">
          {/* Historical Date Banner */}
          {viewingDate && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Viewing History</p>
                  <p className={`text-base font-bold ${text}`}>{formatDateHeader(viewingDate)}</p>
                </div>
              </div>
              <button 
                onClick={handleReturnToToday}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors"
              >
                Back to Today
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-white">
              {viewingDate ? `${formatDateHeader(viewingDate)}'s Progress` : "Today's Progress"}
            </span>
            <span className="text-base font-semibold text-stone-400">{completedCount}/{displayTasks.length}</span>
          </div>
          <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#25D366] rounded-full transition-all duration-500"
              style={{ width: `${displayTasks.length > 0 ? (completedCount / displayTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Task Tabs - Requests | Today's Tasks */}
        <div className="px-4 mb-3">
          <div className="flex items-center">
            {/* Requests on left - only show if viewing today */}
            {!viewingDate && (
              <>
                <button
                  onClick={() => setActiveTaskTab('requests')}
                  className="relative"
                >
                  <span className={`text-base font-medium transition-colors ${
                    activeTaskTab === 'requests'
                      ? 'text-white'
                      : 'text-stone-500'
                  }`}>
                    Requests
                  </span>
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
                
                {/* Line separator */}
                <div className="flex-1 h-px bg-stone-700 mx-4" />
              </>
            )}
            
            {/* Tasks tab */}
            <button
              onClick={() => setActiveTaskTab('today')}
              className={`text-base font-medium transition-colors ${
                activeTaskTab === 'today' || viewingDate
                  ? 'text-white'
                  : 'text-stone-500'
              }`}
            >
              {viewingDate ? 'Completed Tasks' : "Today's Tasks"}
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="px-4 space-y-2.5 pb-4">
          {activeTaskTab === 'today' || viewingDate ? (
            displayTasks.length > 0 ? (
              displayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isExpanded={expandedTaskId === task.id}
                  onToggleExpand={(id) => setExpandedTaskId(expandedTaskId === id ? null : id)}
                  onStartTask={viewingDate ? null : handleStartTask}
                  isHistorical={!!viewingDate}
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

      {/* Sign Out Button */}
      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl hover:bg-rose-500/20 transition-colors mt-4"
        data-testid="menu-sign-out-btn"
      >
        <div className="w-11 h-11 bg-rose-500/20 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-rose-400" />
        </div>
        <span className="font-medium text-rose-400 flex-1 text-left">Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} flex flex-col font-['Manrope',sans-serif]`}>
      {/* Main Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'incident' && <IncidentReportPage patientName={patient?.name} incidents={incidents} onAddIncident={onAddIncident} />}
      {activeTab === 'chat' && <ChatPage onBack={() => setActiveTab('home')} role={UserRole.CAREGIVER} />}
      {activeTab === 'shift' && renderShiftContent()}
      {activeTab === 'settings' && renderSettingsContent()}

      {/* Floating Action Button - Copilot - Chip Icon like mobile */}
      {activeTab === 'home' && isShiftActive && (
        <div className="fixed bottom-24 right-5 z-40">
          <button
            onClick={() => setShowCopilot(true)}
            className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-105 ${
              isDarkMode ? 'bg-stone-800' : 'bg-stone-100'
            }`}
            data-testid="copilot-btn"
          >
            <Cpu className={`w-6 h-6 ${isDarkMode ? 'text-[#25D366]' : 'text-[#25D366]'}`} />
          </button>
        </div>
      )}

      {/* Bottom Navigation - Fixed to bottom */}
      <nav className={`fixed bottom-0 left-0 right-0 ${bgNav} border-t ${border} z-30`}>
        <div className="flex justify-around items-center py-2">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'incident', icon: AlertTriangle, label: 'Incident' },
            { id: 'chat', icon: MessageSquare, label: 'Message' },
            { id: 'shift', icon: Clock, label: 'Shifts', badge: isShiftActive },
            { id: 'settings', icon: Settings, label: 'Menu' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-4 transition-all relative ${
                activeTab === tab.id 
                  ? 'text-[#25D366]'
                  : `${textMuted} hover:${textSecondary}`
              }`}
              data-testid={`nav-${tab.id}`}
            >
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] font-semibold mt-1 ${
                activeTab === tab.id ? 'text-[#25D366]' : textMuted
              }`}>{tab.label}</span>
              {tab.badge && (
                <div className={`absolute top-1 right-2 w-2.5 h-2.5 bg-[#25D366] rounded-full ring-2 ${isDarkMode ? 'ring-stone-900' : 'ring-white'}`} />
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
        onSelectDate={handleSelectHistoricalDate}
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

import React, { useState } from 'react';
import { 
  Home, MessageSquare, Clock, Settings, User, Heart, Activity, Thermometer,
  MapPin, Play, ChevronRight, Bell, CheckCircle, Sparkles, Frown, AlertTriangle,
  X, ChevronDown, Calendar, ArrowLeft, XCircle
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { TaskCard } from './TaskCard';
import { TaskRequestCard } from './TaskRequestCard';
import { TaskCompletionModal } from './TaskCompletionModal';
import { PatientProfileModal } from './PatientProfileModal';
import { VitalsModal } from './VitalsModal';
import { AICopilot } from './AICopilot';
import { CareAssistantIcon } from './CareAssistantIcon';
import { IncidentReportPage } from './IncidentReportPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SupportPage } from './pages/SupportPage';
import { ChatPage } from './pages/ChatPage';
import { CAREGIVER_PROFILE, SHIFT_HISTORY, CARE_PLAN, CLIENTS } from '../services/mockData';
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
  const [vitalsInitialTab, setVitalsInitialTab] = useState('bp');
  const [showCopilot, setShowCopilot] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(skipStartShift); // Auto-start if skipStartShift
  const [shiftStartTime, setShiftStartTime] = useState(skipStartShift ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null);
  const [activePage, setActivePage] = useState(null);
  
  // Historical date viewing
  const [viewingDate, setViewingDate] = useState(null);
  const [historicalTasks, setHistoricalTasks] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [showShiftHistory, setShowShiftHistory] = useState(false);
  const [medLogs, setMedLogs] = useState([]);
  const [showClientList, setShowClientList] = useState(false);
  const [showClockAlert, setShowClockAlert] = useState(false);
  const [clockAlertTitle, setClockAlertTitle] = useState('');
  const [clockAlertMessage, setClockAlertMessage] = useState('');
  const [activeClientId, setActiveClientId] = useState(1);
  const [clockOutTime, setClockOutTime] = useState(null);

  const today = new Date(2026, 0, 17); // Jan 17, 2026

  // Navigate to a tab with scroll-to-top (only on explicit user navigation)
  const handleTabChange = (tabId) => {
    window.scrollTo(0, 0);
    setActiveTab(tabId);
  };

  // Navigate to a sub-page with scroll-to-top
  const handlePageChange = (page) => {
    window.scrollTo(0, 0);
    setActivePage(page);
  };

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
    setClockOutTime(null);
    setClockAlertTitle('Clocked In');
    setClockAlertMessage('You have successfully clocked in. GPS location verified.');
    setShowClockAlert(true);
  };

  const handleEndShift = () => {
    setIsShiftActive(false);
    setClockOutTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    setClockAlertTitle('Clocked Out');
    setClockAlertMessage('You have successfully clocked out.');
    setShowClockAlert(true);
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
    return <ProfilePage onBack={() => handlePageChange(null)} role={UserRole.CAREGIVER} onSignOut={onSignOut} />;
  }
  if (activePage === 'settings') {
    return <SettingsPage onBack={() => handlePageChange(null)} onNavigateToHelp={() => handlePageChange('support')} />;
  }
  if (activePage === 'history') {
    return <HistoryPage onBack={() => handlePageChange(null)} role={UserRole.CAREGIVER} />;
  }
  if (activePage === 'support') {
    return <SupportPage onBack={() => handlePageChange(null)} />;
  }
  if (activePage === 'chat') {
    return <ChatPage onBack={() => handlePageChange(null)} role={UserRole.CAREGIVER} />;
  }

  // Medications sub-screen
  if (activePage === 'medications') {
    const medications = CARE_PLAN.medications || [];
    
    return (
      <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="flex items-center px-5 pt-3 pb-1">
            <button onClick={() => handlePageChange(null)} className="mr-4 p-1" data-testid="meds-back-btn">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Medications</h1>
              <p className="text-[#8e8e93] text-[14px]">For {patient?.name}</p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="px-5 mb-6">
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <div className="grid grid-cols-3 text-center">
                <div>
                  <p className="text-4xl font-bold text-white">{medications.length}</p>
                  <p className="text-[#8e8e93] text-sm mt-1">Total Meds</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#25D366]">{medLogs.length}</p>
                  <p className="text-[#8e8e93] text-sm mt-1">Given Today</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">{medications.length - medLogs.length}</p>
                  <p className="text-[#8e8e93] text-sm mt-1">Remaining</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Header */}
          <div className="px-5 mb-4 flex items-center gap-2">
            <span className="text-[#25D366] text-xl font-bold">✱</span>
            <span className="text-white font-bold text-lg">Today's Schedule</span>
          </div>

          {/* Medication Cards */}
          <div className="px-5 space-y-4">
            {medications.map((med, idx) => {
              const isGiven = medLogs.includes(med.name);
              return (
                <div key={idx} className="bg-[#1c1c1e] rounded-2xl p-5" data-testid={`med-card-${idx}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 bg-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-[#3b82f6] text-2xl font-bold">✱</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-[17px]">{med.name}</p>
                      <p className="text-[#8e8e93] text-[14px] mt-0.5">{med.dosage} - {med.frequency}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-4 h-4 text-[#8e8e93]" />
                        <span className="text-[#8e8e93] text-[13px]">{med.time}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[13px] font-bold ${isGiven ? 'bg-[#25D366]/20 text-[#25D366]' : 'bg-amber-600/20 text-amber-500'}`}>
                      {isGiven ? 'Given' : 'Pending'}
                    </span>
                  </div>
                  {!isGiven && (
                    <button 
                      onClick={() => setMedLogs(prev => [...prev, med.name])}
                      className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-xl text-[16px]"
                      data-testid={`admin-med-${idx}`}
                    >
                      Mark as Administered
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render Home Content
  const renderHomeContent = () => {
    if (!isShiftActive) {
      // Offline State - Uber-style GO interface
      return (
        <div className={`flex-1 flex flex-col ${bg}`}>
          {/* Header with caregiver info */}
          <div className="px-6 pt-3 pb-4">
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
            className="relative w-full h-48 rounded-3xl overflow-hidden"
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
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{patient?.name || 'Patient'}</h2>
                <p className="text-white/70 text-sm font-medium">{patient?.age} years old</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/60" />
            </div>
          </button>
        </div>

        {/* Vitals Grid - 4 dark cards with rounded square colored icons */}
        <div className="px-4 mt-3">
          <div className="grid grid-cols-4 gap-2">
            {/* BP Card */}
            <button 
              onClick={() => { setVitalsInitialTab('bp'); setShowVitals(true); }}
              className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-11 h-11 bg-[#5c1a3d] rounded-xl flex items-center justify-center mb-2 mx-auto">
                <Heart className="w-5 h-5 text-[#e91e7a]" fill="currentColor" />
              </div>
              <p className="text-base font-bold text-white text-center">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--'}</p>
              <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">BP</p>
            </button>

            {/* Heart Card */}
            <button 
              onClick={() => { setVitalsInitialTab('hr'); setShowVitals(true); }}
              className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-11 h-11 bg-[#6b3410] rounded-xl flex items-center justify-center mb-2 mx-auto">
                <Activity className="w-5 h-5 text-[#f97316]" />
              </div>
              <p className="text-base font-bold text-white text-center">{latestHR ? latestHR.value : '--'}</p>
              <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">Heart</p>
            </button>

            {/* Temp Card */}
            <button 
              onClick={() => { setVitalsInitialTab('temp'); setShowVitals(true); }}
              className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-11 h-11 bg-[#1a3a5c] rounded-xl flex items-center justify-center mb-2 mx-auto">
                <Thermometer className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <p className="text-base font-bold text-white text-center">{latestTemp ? `${latestTemp.value}°` : '--'}</p>
              <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">Temp</p>
            </button>

            {/* Pain Card */}
            <button 
              onClick={() => { setVitalsInitialTab('pain'); setShowVitals(true); }}
              className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors"
            >
              <div className="w-11 h-11 bg-[#3d1a5c] rounded-xl flex items-center justify-center mb-2 mx-auto">
                <div className="w-6 h-6 rounded-full border-2 border-[#9333ea] flex items-center justify-center">
                  <Frown className="w-3.5 h-3.5 text-[#9333ea]" />
                </div>
              </div>
              <p className="text-base font-bold text-white text-center">{latestPain ? `${latestPain.value}/10` : '--'}</p>
              <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">Pain</p>
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
            <span className="text-base font-semibold text-[#ababab]">{completedCount}/{displayTasks.length}</span>
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
                      : 'text-[#8e8e93]'
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
                  : 'text-[#8e8e93]'
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
              <div className="text-center py-12 bg-[#1c1c1e] rounded-2xl">
                <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto mb-3" />
                <p className="text-white font-semibold">All done for today!</p>
                <p className="text-[#8e8e93] text-sm">Great work, Julia</p>
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
              <div className="text-center py-12 bg-[#1c1c1e] rounded-2xl">
                <Sparkles className="w-12 h-12 text-[#8e8e93] mx-auto mb-3" />
                <p className="text-[#8e8e93]">No pending requests</p>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Get active client name
  const activeClient = CLIENTS.find(c => c.id === activeClientId);

  // Filter shift history based on selected filter
  const filteredHistory = SHIFT_HISTORY.filter(shift => {
    if (historyFilter === 'all') return true;
    return shift.status === historyFilter;
  });

  const renderShiftContent = () => (
    <div className="flex-1 overflow-y-auto bg-black pb-24">
      {showShiftHistory ? (
        <div className="px-5 pt-3 pb-24">
          {/* Shift History Header */}
          <div className="flex items-center mb-5">
            <button onClick={() => { window.scrollTo(0, 0); setShowShiftHistory(false); }} className="mr-4 p-1" data-testid="inline-history-back">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white">Shift History</h2>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-3 mb-5">
            {['all', 'completed', 'cancelled'].map((f) => (
              <button key={f} onClick={() => setHistoryFilter(f)}
                className={`px-6 py-2.5 rounded-full text-[15px] font-semibold transition-colors ${
                  historyFilter === f ? 'bg-[#25D366] text-white' : 'bg-[#2c2c2e] text-[#8e8e93]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Shift Cards */}
          <div className="space-y-4">
            {filteredHistory.map((shift) => (
              <div key={shift.id} className={`bg-[#1c1c1e] rounded-2xl p-5 border ${
                shift.status === 'completed' ? 'border-[#25D366]/50' : 'border-[#636366]/50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-[#8e8e93]" />
                    <span className="text-[19px] font-bold text-white">{shift.date}</span>
                  </div>
                  {shift.status === 'completed' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-[#25D366]/15 text-[#25D366]">
                      <CheckCircle className="w-4 h-4" fill="#25D366" stroke="#1c1c1e" strokeWidth={2} />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-white/10 text-[#8e8e93]">
                      <XCircle className="w-4 h-4" />
                      Cancelled
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#8e8e93]" />
                    <span className="text-[14px] text-[#8e8e93]">{shift.startTime} - {shift.endTime}</span>
                  </div>
                  {shift.status === 'completed' && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-[#25D366]" fill="#25D366" stroke="#1c1c1e" strokeWidth={2} />
                      <span className="text-[14px] text-[#8e8e93]">{shift.tasksCompleted}/{shift.totalTasks} tasks</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 pt-4 space-y-4">
          {/* Shift Status Card */}
          <div className="bg-[#1c1c1e] rounded-2xl p-5" data-testid="shift-status-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-semibold text-white">Shift Status</h3>
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${isShiftActive ? 'bg-[#25D366]' : 'bg-[#ef4444]'}`} />
                <span className="text-sm text-[#8e8e93]">{isShiftActive ? 'On Shift' : 'Off Shift'}</span>
              </div>
            </div>
            
            {/* Time Row */}
            <div className="flex justify-around mb-5">
              <div className="text-center">
                <p className="text-xs text-[#8e8e93] mb-1">Clock In</p>
                <p className="text-xl font-bold text-white">{shiftStartTime || '--:--'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#8e8e93] mb-1">Clock Out</p>
                <p className="text-xl font-bold text-white">{clockOutTime || '--:--'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#8e8e93] mb-1">Weekly Hours</p>
                <p className="text-xl font-bold text-white">32.5h</p>
              </div>
            </div>

            {/* Clock Button */}
            <button
              onClick={isShiftActive ? handleEndShift : handleStartShift}
              className={`w-full py-4 rounded-[14px] text-[18px] font-semibold text-white transition-colors ${
                isShiftActive ? 'bg-[#ef4444] hover:bg-[#dc2626]' : 'bg-[#25D366] hover:bg-[#20bd5a]'
              }`}
              data-testid="clock-btn"
            >
              {isShiftActive ? 'Clock Out' : 'Clock In'}
            </button>
            
            {/* GPS */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <MapPin className="w-4 h-4 text-[#25D366]" />
              <span className="text-[13px] text-[#8e8e93]">GPS verification enabled</span>
            </div>
          </div>

          {/* Active Client Selector */}
          <button 
            onClick={() => setShowClientList(true)}
            className="w-full bg-[#1c1c1e] rounded-2xl p-5 text-left"
            data-testid="active-client-selector"
          >
            <p className="text-sm text-[#8e8e93] tracking-[1px]">ACTIVE CLIENT</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xl font-semibold text-white">{activeClient?.name || 'Select Client'}</p>
              <ChevronDown className="w-6 h-6 text-[#8e8e93]" />
            </div>
          </button>

          {/* Quick Actions */}
          <div className="bg-[#1c1c1e] rounded-2xl p-5" data-testid="quick-actions-card">
            <h3 className="text-xl font-bold text-white mb-5">Quick Actions</h3>
            
            <button 
              className="w-full flex items-center py-4"
              onClick={() => { window.scrollTo(0, 0); setShowShiftHistory(true); }}
              data-testid="shift-history-btn"
            >
              <span className="text-2xl mr-4">📋</span>
              <span className="flex-1 text-lg text-white text-left">Shift History</span>
              <ChevronRight className="w-[22px] h-[22px] text-[#8e8e93]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Render Settings Tab
  const renderSettingsContent = () => (
    <div className="flex-1 overflow-y-auto bg-black px-5 pt-4 space-y-3 pb-24">
      {/* Profile Card */}
      <button 
        onClick={() => handlePageChange('profile')}
        className="w-full bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 text-left"
        data-testid="menu-profile"
      >
        <img 
          src={CAREGIVER_PROFILE.photo}
          alt="Profile"
          className="w-20 h-20 rounded-2xl object-cover"
        />
        <div className="flex-1">
          <h3 className="font-bold text-white text-xl">Julia Martinez</h3>
          <p className="text-[#8e8e93] text-[15px] mt-0.5">Certified Nursing Assistant</p>
        </div>
        <ChevronRight className="w-6 h-6 text-[#8e8e93]" />
      </button>

      {/* Menu Items */}
      {[
        { label: 'Medications', icon: null, iconText: '✱', color: '#3b82f6', hasColor: true, action: () => handlePageChange('medications') },
        { label: 'Shift History', icon: Clock, color: '#636366', hasColor: false, action: () => handlePageChange('history') },
        { label: 'Settings', icon: Settings, color: '#636366', hasColor: false, action: () => handlePageChange('settings') },
        { label: 'Support', icon: Bell, color: '#636366', hasColor: false, action: () => handlePageChange('support') },
      ].map((item, idx) => (
        <button
          key={idx}
          onClick={item.action}
          className="w-full bg-[#1c1c1e] rounded-2xl p-5 flex items-center gap-4"
          data-testid={`menu-${item.label.toLowerCase().replace(' ', '-')}`}
        >
          <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${
            item.hasColor ? 'bg-[#3b82f6]' : 'bg-[#3a3a3c]'
          }`}>
            {item.iconText ? (
              <span className="text-white text-2xl font-bold">{item.iconText}</span>
            ) : (
              <item.icon className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="text-white text-lg flex-1 text-left">{item.label}</span>
          <ChevronRight className="w-6 h-6 text-[#8e8e93]" />
        </button>
      ))}

      {/* Sign Out */}
      <button
        onClick={onSignOut}
        className="w-full bg-[#3d1a1a] border border-[#6b2a2a] rounded-2xl p-5 flex items-center gap-4"
        data-testid="menu-sign-out-btn"
      >
        <div className="w-12 h-12 bg-[#5c2020] rounded-[14px] flex items-center justify-center">
          <User className="w-6 h-6 text-[#ef4444]" />
        </div>
        <span className="text-[#ef4444] text-lg flex-1 text-left">Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} flex flex-col font-['Manrope',sans-serif]`}>
      {/* Main Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'incident' && <IncidentReportPage patientName={patient?.name} incidents={incidents} onAddIncident={onAddIncident} />}
      {activeTab === 'chat' && <ChatPage onBack={() => handleTabChange('home')} role={UserRole.CAREGIVER} />}
      {activeTab === 'shift' && renderShiftContent()}
      {activeTab === 'settings' && renderSettingsContent()}

      {/* Floating Action Button - AI Care Assistant */}
      {activeTab === 'home' && isShiftActive && (
        <div className="fixed bottom-24 right-5 z-40">
          <button
            onClick={() => setShowCopilot(true)}
            className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-105 overflow-hidden"
            data-testid="copilot-btn"
          >
            <CareAssistantIcon size={56} />
          </button>
        </div>
      )}

      {/* Bottom Navigation - Fixed to bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1c1c1e] z-30">
        <div className="flex justify-around items-center py-3">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'incident', icon: AlertTriangle, label: 'Incident' },
            { id: 'chat', icon: MessageSquare, label: 'Message' },
            { id: 'shift', icon: Clock, label: 'Shifts', badge: isShiftActive },
            { id: 'settings', icon: Settings, label: 'Menu' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex flex-col items-center px-4 py-1 transition-all relative"
                data-testid={`nav-${tab.id}`}
              >
                <tab.icon 
                  className={`w-8 h-8 ${isActive ? 'text-[#25D366]' : 'text-[#8e8e93]'}`}
                  fill={isActive ? '#25D366' : 'none'}
                  stroke={isActive ? '#1c1c1e' : '#8e8e93'}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className={`text-[11px] font-semibold mt-1 ${
                  isActive ? 'text-[#25D366]' : 'text-[#8e8e93]'
                }`}>{tab.label}</span>
                {tab.badge && (
                  <div className="absolute top-0.5 right-2 w-2.5 h-2.5 bg-[#25D366] rounded-full ring-2 ring-[#1c1c1e]" />
                )}
              </button>
            );
          })}
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
        initialTab={vitalsInitialTab}
      />

      <AICopilot
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        role="caregiver"
        patientName={patient?.name}
      />

      {/* Clock Alert Dialog */}
      {showClockAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" data-testid="clock-alert-modal">
          <div className="bg-[#2c2c2e] rounded-2xl mx-8 max-w-sm w-full text-center overflow-hidden">
            <div className="p-6 pb-4">
              <h3 className="text-lg font-bold text-white mb-2">{clockAlertTitle}</h3>
              <p className="text-[#8e8e93] text-sm leading-relaxed">{clockAlertMessage}</p>
            </div>
            <div className="border-t border-[#2c2c2e]">
              <button 
                onClick={() => setShowClockAlert(false)} 
                className="w-full py-3 text-[#25D366] font-semibold text-base"
                data-testid="clock-alert-ok-btn"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List Modal */}
      {showClientList && (
        <div className="fixed inset-0 z-[60] bg-black/90" data-testid="client-list-modal">
          <div className="pt-16 px-4 h-full overflow-y-auto pb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[28px] font-bold text-white">Your Clients</h2>
              <button 
                onClick={() => setShowClientList(false)}
                data-testid="close-client-list-btn"
              >
                <X className="w-7 h-7 text-white" />
              </button>
            </div>
            <div className="space-y-3">
              {CLIENTS.map(client => (
                <button 
                  key={client.id}
                  onClick={() => { setActiveClientId(client.id); setShowClientList(false); }}
                  className={`w-full bg-[#1c1c1e] rounded-2xl p-4 flex items-center text-left ${
                    client.id === activeClientId ? 'border-2 border-[#25D366]' : 'border-2 border-transparent'
                  }`}
                  data-testid={`client-card-${client.id}`}
                >
                  <div className="w-14 h-14 rounded-[14px] bg-[#3a3a3c] flex items-center justify-center mr-3.5 flex-shrink-0">
                    <User className="w-7 h-7 text-[#8e8e93]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[18px] font-semibold text-white">{client.name}</p>
                    <p className="text-sm text-[#8e8e93] mt-0.5">{client.condition}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[13px] text-[#25D366]">{client.tasksCompleted}/{client.tasksToday} tasks today</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        client.riskLevel === 'low' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                        client.riskLevel === 'moderate' ? 'bg-[#eab308]/20 text-[#eab308]' :
                        'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}>
                        {client.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {client.id === activeClientId && (
                    <CheckCircle className="w-6 h-6 text-[#25D366] flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverDashboard;

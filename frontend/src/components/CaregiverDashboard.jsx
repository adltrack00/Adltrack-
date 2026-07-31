import React, { useState } from 'react';
import {
  Home, MessageSquare, Clock, Settings, User, Heart, Activity, Thermometer,
  MapPin, ChevronRight, Bell, CheckCircle, Sparkles, Frown, AlertTriangle,
  X, ChevronDown, Calendar, ArrowLeft, XCircle, Pill
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

// ─── Design tokens — light warm palette matching WalletCard / ServicesSection ─
const D = {
  bg:        '#F4F8F9',
  bgAlt:     '#eef1f4',
  card:      '#ffffff',
  bdr:       'rgba(0,0,0,0.07)',
  bdrHv:     'rgba(0,0,0,0.13)',
  h:         '#0f172a',
  body:      '#475569',
  muted:     '#94a3b8',
  brand:     '#b45309',
  brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  brandGlow: '0 4px 20px rgba(255,179,71,0.32)',
  brandTint: 'rgba(255,179,71,0.10)',
  rainbow:   'linear-gradient(to right,#a855f7,#ec4899,#f97316,#eab308,#22c55e,#3b82f6)',
  shadow:    '0 4px 16px -4px rgba(0,0,0,0.08)',
  shadowMd:  '0 10px 30px -10px rgba(0,0,0,0.10)',
}

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
  useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaskTab, setActiveTaskTab] = useState('today');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [vitalsInitialTab, setVitalsInitialTab] = useState('bp');
  const [showCopilot, setShowCopilot] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(true);
  const [shiftStartTime, setShiftStartTime] = useState(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  const [activePage, setActivePage] = useState(null);

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

  const today = new Date(2026, 0, 17);

  const handleTabChange = (tabId) => {
    window.scrollTo(0, 0);
    setActiveTab(tabId);
  };

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

  const handleSelectHistoricalDate = (date, tasksForDate) => {
    setViewingDate(date);
    setHistoricalTasks(tasksForDate);
    setActiveTab('home');
  };

  const handleReturnToToday = () => {
    setViewingDate(null);
    setHistoricalTasks([]);
  };

  const latestBP = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];
  const latestPain = vitalsData?.pain?.[vitalsData.pain.length - 1];

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

  const handleStartTask = (task) => setSelectedTask(task);

  const handleCompleteTask = (updatedTask) => {
    onUpdateTask && onUpdateTask(updatedTask);
    setSelectedTask(null);
    setExpandedTaskId(null);
  };

  // Sub-pages
  if (activePage === 'profile') return <ProfilePage onBack={() => handlePageChange(null)} role={UserRole.CAREGIVER} onSignOut={onSignOut} />;
  if (activePage === 'settings') return <SettingsPage onBack={() => handlePageChange(null)} />;
  if (activePage === 'history') return <HistoryPage onBack={() => handlePageChange(null)} role={UserRole.CAREGIVER} />;
  if (activePage === 'support') return <SupportPage onBack={() => handlePageChange(null)} role="caregiver" />;
  if (activePage === 'chat') return <ChatPage onBack={() => handlePageChange(null)} role={UserRole.CAREGIVER} />;

  // ── Medications sub-page ──
  if (activePage === 'medications') {
    const medications = CARE_PLAN.medications || [];
    return (
      <div className="min-h-screen flex flex-col" style={{ background: D.bg, fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em' }}>
        <div className="flex-1 overflow-y-auto pb-8">
          <div className="flex items-center px-5 pt-5 pb-2 gap-3">
            <button
              onClick={() => handlePageChange(null)}
              className="p-2 rounded-xl transition-all"
              style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
              data-testid="meds-back-btn"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: D.h }} />
            </button>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: D.h }}>Medications</h1>
              <p className="text-xs font-light" style={{ color: D.muted }}>For {patient?.name}</p>
            </div>
          </div>

          <div className="px-5 mb-5 mt-3">
            <div className="p-5 rounded-[1.25rem]" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
              <div className="grid grid-cols-3 text-center">
                {[
                  { label: 'Total', value: medications.length, color: D.h },
                  { label: 'Given', value: medLogs.length, color: '#000000' },
                  { label: 'Remaining', value: medications.length - medLogs.length, color: '#d97706' },
                ].map(({ label, value, color }, i) => (
                  <div key={label} style={{ borderRight: i < 2 ? `1px solid ${D.bdr}` : 'none', padding: '0 8px' }}>
                    <p className="text-3xl font-semibold" style={{ color }}>{value}</p>
                    <p className="text-xs font-light mt-1" style={{ color: D.muted }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 mb-3 flex items-center gap-2">
            <span style={{ color: '#60a5fa', fontSize: 16, fontWeight: 700 }}>✱</span>
            <span className="font-semibold text-base" style={{ color: D.h }}>Today's Schedule</span>
          </div>

          <div className="px-5 space-y-3">
            {medications.map((med, idx) => {
              const isGiven = medLogs.includes(med.name);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-[1.125rem]"
                  style={{
                    background: D.card,
                    border: `1px solid ${isGiven ? 'rgba(22,163,74,0.22)' : D.bdr}`,
                    boxShadow: D.shadow,
                  }}
                  data-testid={`med-card-${idx}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(96,165,250,0.09)', border: '1px solid rgba(96,165,250,0.14)' }}>
                      <span style={{ color: '#60a5fa', fontSize: 20, fontWeight: 700 }}>✱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[16px]" style={{ color: D.h }}>{med.name}</p>
                      <p className="text-xs mt-0.5 font-light" style={{ color: D.muted }}>{med.dosage} · {med.frequency}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5" style={{ color: D.muted }} />
                        <span className="text-xs font-light" style={{ color: D.muted }}>{med.time}</span>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{
                        background: isGiven ? 'rgba(22,163,74,0.09)' : 'rgba(251,191,36,0.09)',
                        color: isGiven ? '#15803d' : '#d97706',
                        border: `1px solid ${isGiven ? 'rgba(22,163,74,0.18)' : 'rgba(251,191,36,0.16)'}`,
                      }}
                    >
                      {isGiven ? 'Given' : 'Pending'}
                    </span>
                  </div>
                  {!isGiven && (
                    <button
                      onClick={() => setMedLogs(prev => [...prev, med.name])}
                      className="w-full py-3 font-semibold rounded-xl text-sm transition-all"
                      style={{ background: D.brandGrad, boxShadow: '0 4px 16px rgba(255,179,71,0.28)', color: '#FFFFFF' }}
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

  // ── Home tab content ──
  const renderHomeContent = () => (
    <div className="flex-1 overflow-y-auto pb-28" style={{ background: D.bg }}>
      {/* Patient Card */}
      <div className="px-4 pt-3">
        <button
          onClick={() => setShowPatientProfile(true)}
          className="relative w-full h-48 rounded-3xl overflow-hidden"
        >
          <img
            src={patient?.photo || 'https://via.placeholder.com/400'}
            alt={patient?.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{patient?.name || 'Patient'}</h2>
              <p className="text-white/70 text-sm font-light">{patient?.age} years old</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white/60" />
          </div>
        </button>
      </div>

      {/* Vitals Grid */}
      <div className="px-4 mt-3">
        <div className="grid grid-cols-4 gap-2">
          {[
            { tab: 'bp',   label: 'BP',    value: latestBP   ? `${latestBP.systolic}/${latestBP.diastolic}` : '--', icon: Heart,       iconFill: true,  iconColor: '#be185d', iconBg: 'rgba(244,114,182,0.14)', cardGrad: 'radial-gradient(circle at 50% 0%,rgba(244,114,182,0.28) 0%,rgba(252,231,243,0.10) 55%,#ffffff 85%)' },
            { tab: 'hr',   label: 'Heart', value: latestHR   ? latestHR.value : '--',                                icon: Activity,    iconFill: false, iconColor: '#c2410c', iconBg: 'rgba(251,146,60,0.14)',  cardGrad: 'radial-gradient(circle at 50% 0%,rgba(251,146,60,0.28)  0%,rgba(255,237,213,0.10) 55%,#ffffff 85%)' },
            { tab: 'temp', label: 'Temp',  value: latestTemp ? `${latestTemp.value}°` : '--',                        icon: Thermometer, iconFill: false, iconColor: '#1d4ed8', iconBg: 'rgba(96,165,250,0.14)',  cardGrad: 'radial-gradient(circle at 50% 0%,rgba(96,165,250,0.28)  0%,rgba(219,234,254,0.10) 55%,#ffffff 85%)' },
            { tab: 'pain', label: 'Pain',  value: latestPain ? `${latestPain.value}/10` : '--',                      icon: Frown,       iconFill: false, iconColor: '#7c3aed', iconBg: 'rgba(167,139,250,0.14)', cardGrad: 'radial-gradient(circle at 50% 0%,rgba(167,139,250,0.28) 0%,rgba(237,233,254,0.10) 55%,#ffffff 85%)' },
          ].map(({ tab, label, value, icon: Icon, iconFill, iconColor, iconBg, cardGrad }) => (
            <button
              key={tab}
              onClick={() => { setVitalsInitialTab(tab); setShowVitals(true); }}
              className="transition-all"
              style={{ background: cardGrad, border: `1px solid ${D.bdr}`, borderRadius: 16, padding: '12px 4px 10px', boxShadow: D.shadow }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 mx-auto" style={{ background: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} fill={iconFill ? iconColor : 'none'} />
              </div>
              <p className="text-sm font-semibold text-center leading-none" style={{ color: D.h }}>{value}</p>
              <p className="text-[10px] font-light mt-1 text-center" style={{ color: D.muted }}>{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-4">
        {viewingDate && (
          <div
            className="mb-4 flex items-center justify-between p-4"
            style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.16)', borderRadius: 16 }}
          >
            <div className="flex items-center gap-3">
              <div style={{ width: 36, height: 36, background: 'rgba(251,191,36,0.09)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock className="w-4 h-4" style={{ color: '#d97706' }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d97706' }}>Viewing History</p>
                <p className="text-sm font-semibold" style={{ color: D.h }}>{formatDateHeader(viewingDate)}</p>
              </div>
            </div>
            <button
              onClick={handleReturnToToday}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
              style={{ background: 'rgba(251,191,36,0.09)', color: '#d97706', border: '1px solid rgba(251,191,36,0.16)' }}
            >
              Today
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: D.body }}>
            {viewingDate ? `${formatDateHeader(viewingDate)}'s Progress` : "Today's Progress"}
          </span>
          <span className="text-sm font-semibold" style={{ color: D.brand }}>
            {completedCount}<span style={{ color: D.muted, fontWeight: 400 }}>/{displayTasks.length}</span>
          </span>
        </div>
        <div style={{ height: 4, background: D.bdr, borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              width: `${displayTasks.length > 0 ? (completedCount / displayTasks.length) * 100 : 0}%`,
              transition: 'width 0.6s cubic-bezier(0.25,1,0.5,1)',
              background: 'linear-gradient(90deg,#FFB347 0%,#F9ED96 100%)',
            }}
          />
        </div>
      </div>

      {/* Task Tabs */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: D.bdr }}>
          {!viewingDate && (
            <button
              onClick={() => setActiveTaskTab('requests')}
              className="relative flex items-center gap-1.5 transition-all"
              style={{
                flex: 1, padding: '7px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: activeTaskTab === 'requests' ? D.card : 'transparent',
                color: activeTaskTab === 'requests' ? D.h : D.muted,
                border: activeTaskTab === 'requests' ? `1px solid ${D.bdr}` : '1px solid transparent',
                boxShadow: activeTaskTab === 'requests' ? D.shadow : 'none',
              }}
            >
              <span>Requests</span>
              {pendingRequests.length > 0 && (
                <span className="flex items-center justify-center text-white font-bold" style={{ background: '#ef4444', borderRadius: 999, fontSize: 10, minWidth: 16, height: 16, padding: '0 4px' }}>
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTaskTab('today')}
            className="transition-all"
            style={{
              flex: 1, padding: '7px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: activeTaskTab === 'today' || viewingDate ? D.card : 'transparent',
              color: activeTaskTab === 'today' || viewingDate ? D.h : D.muted,
              border: activeTaskTab === 'today' || viewingDate ? `1px solid ${D.bdr}` : '1px solid transparent',
              boxShadow: activeTaskTab === 'today' || viewingDate ? D.shadow : 'none',
            }}
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
            <div
              className="text-center py-12 rounded-[1.25rem]"
              style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
            >
              <div style={{ width: 52, height: 52, background: 'rgba(255,179,71,0.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle className="w-6 h-6" style={{ color: D.brand }} />
              </div>
              <p className="font-semibold" style={{ color: D.h }}>All done for today!</p>
              <p className="text-sm mt-1 font-light" style={{ color: D.muted }}>Great work today</p>
            </div>
          )
        ) : (
          pendingRequests.length > 0 ? (
            pendingRequests.map((task) => (
              <TaskRequestCard key={task.id} task={task} onAccept={onAcceptTask} onDecline={onDeclineTask} />
            ))
          ) : (
            <div
              className="text-center py-12 rounded-[1.25rem]"
              style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
            >
              <div style={{ width: 52, height: 52, background: D.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Sparkles className="w-6 h-6" style={{ color: D.muted }} />
              </div>
              <p className="font-light" style={{ color: D.muted }}>No pending requests</p>
            </div>
          )
        )}
      </div>
    </div>
  );

  const activeClient = CLIENTS.find(c => c.id === activeClientId);
  const filteredHistory = SHIFT_HISTORY.filter(shift => historyFilter === 'all' || shift.status === historyFilter);

  // ── Shift tab content ──
  const renderShiftContent = () => (
    <div className="flex-1 overflow-y-auto pb-28" style={{ background: D.bg }}>
      {showShiftHistory ? (
        <div className="px-5 pt-4 pb-24">
          <div className="flex items-center mb-5">
            <button
              onClick={() => { window.scrollTo(0, 0); setShowShiftHistory(false); }}
              className="mr-4 p-1.5 rounded-xl transition-all"
              style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
              data-testid="inline-history-back"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: D.h }} />
            </button>
            <h2 className="text-2xl font-semibold" style={{ color: D.h }}>Shift History</h2>
          </div>

          <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: D.bdr }}>
            {['all', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: historyFilter === f ? D.card : 'transparent',
                  color: historyFilter === f ? D.h : D.muted,
                  border: historyFilter === f ? `1px solid ${D.bdr}` : '1px solid transparent',
                  boxShadow: historyFilter === f ? D.shadow : 'none',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredHistory.map((shift) => (
              <div
                key={shift.id}
                className="p-5 rounded-[1.125rem]"
                style={{
                  background: D.card,
                  border: `1px solid ${shift.status === 'completed' ? 'rgba(22,163,74,0.22)' : D.bdr}`,
                  boxShadow: D.shadow,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: D.muted }} />
                    <span className="text-[17px] font-semibold" style={{ color: D.h }}>{shift.date}</span>
                  </div>
                  {shift.status === 'completed' ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(22,163,74,0.09)', color: '#15803d', border: '1px solid rgba(22,163,74,0.18)' }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: D.bg, color: D.muted, border: `1px solid ${D.bdr}` }}>
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelled
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" style={{ color: D.muted }} />
                    <span className="text-xs font-light" style={{ color: D.body }}>{shift.startTime} – {shift.endTime}</span>
                  </div>
                  {shift.status === 'completed' && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: '#15803d' }} />
                      <span className="text-xs font-light" style={{ color: D.body }}>{shift.tasksCompleted}/{shift.totalTasks} tasks</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-5 pt-4 space-y-3">
          {/* Shift Status Card */}
          <div
            className="p-5 rounded-[1.375rem]"
            style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
            data-testid="shift-status-card"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-semibold" style={{ color: D.h }}>Shift Status</h3>
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{
                  background: isShiftActive ? 'rgba(255,179,71,0.12)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${isShiftActive ? 'rgba(255,179,71,0.30)' : 'rgba(239,68,68,0.16)'}`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isShiftActive ? '#FFB347' : '#ef4444',
                    boxShadow: `0 0 6px ${isShiftActive ? 'rgba(255,179,71,0.70)' : 'rgba(239,68,68,0.6)'}`,
                  }}
                />
                <span className="text-xs font-semibold" style={{ color: isShiftActive ? '#b45309' : '#ef4444' }}>
                  {isShiftActive ? 'On Shift' : 'Off Shift'}
                </span>
              </div>
            </div>

            <div
              className="flex justify-around mb-5 py-4 rounded-xl"
              style={{ background: D.bg, border: `1px solid ${D.bdr}` }}
            >
              {[
                { label: 'Clock In', value: shiftStartTime || '--:--' },
                { label: 'Clock Out', value: clockOutTime || '--:--' },
                { label: 'Weekly Hrs', value: '32.5h' },
              ].map(({ label, value }, i) => (
                <div key={label} className="text-center" style={{ borderRight: i < 2 ? `1px solid ${D.bdr}` : 'none', paddingRight: i < 2 ? 16 : 0, paddingLeft: i > 0 ? 16 : 0 }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: D.muted }}>{label}</p>
                  <p className="text-lg font-semibold" style={{ color: D.h }}>{value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={isShiftActive ? handleEndShift : handleStartShift}
              className="w-full py-4 rounded-2xl text-[16px] font-semibold transition-all"
              style={{
                background: isShiftActive ? 'linear-gradient(135deg,#ef4444,#dc2626)' : D.brandGrad,
                boxShadow: isShiftActive ? '0 4px 20px rgba(239,68,68,0.22)' : D.brandGlow,
                color: '#ffffff',
              }}
              data-testid="clock-btn"
            >
              {isShiftActive ? 'Clock Out' : 'Clock In'}
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <MapPin className="w-3.5 h-3.5" style={{ color: D.brand }} />
              <span className="text-xs font-light" style={{ color: D.muted }}>GPS verification enabled</span>
            </div>
          </div>

          {/* Active Client Selector */}
          <button
            onClick={() => setShowClientList(true)}
            className="w-full p-5 text-left transition-all rounded-[1.125rem]"
            style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
            data-testid="active-client-selector"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-1" style={{ color: D.muted }}>Active Client</p>
            <div className="flex items-center justify-between">
              <p className="text-[19px] font-semibold" style={{ color: D.h }}>{activeClient?.name || 'Select Client'}</p>
              <ChevronDown className="w-5 h-5" style={{ color: D.muted }} />
            </div>
          </button>

          {/* Quick Actions */}
          <div
            className="p-5 rounded-[1.125rem]"
            style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
            data-testid="quick-actions-card"
          >
            <h3 className="text-base font-semibold mb-4" style={{ color: D.h }}>Quick Actions</h3>
            <button
              className="w-full flex items-center gap-4 py-3.5"
              style={{ borderTop: `1px solid ${D.bdr}` }}
              onClick={() => { window.scrollTo(0, 0); setShowShiftHistory(true); }}
              data-testid="shift-history-btn"
            >
              <div style={{ width: 36, height: 36, background: D.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${D.bdr}` }}>
                <Calendar className="w-4 h-4" style={{ color: D.body }} />
              </div>
              <span className="flex-1 text-[15px] font-semibold text-left" style={{ color: D.h }}>Shift History</span>
              <ChevronRight className="w-5 h-5" style={{ color: D.muted }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── Menu tab content ──
  const renderSettingsContent = () => (
    <div className="flex-1 overflow-y-auto px-5 pt-4 space-y-3 pb-24" style={{ background: D.bg }}>
      <button
        onClick={() => handlePageChange('profile')}
        className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all"
        style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
        data-testid="menu-profile"
      >
        <img
          src={CAREGIVER_PROFILE.photo}
          alt="Julia Martinez"
          className="w-20 h-20 rounded-2xl object-cover"
          style={{ border: '2px solid rgba(255,179,71,0.28)' }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-xl" style={{ color: D.h }}>Julia Martinez</h3>
          <p className="text-[15px] mt-0.5 font-light" style={{ color: D.muted }}>Certified Nursing Assistant</p>
          <span
            className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wide"
            style={{ background: 'rgba(255,179,71,0.12)', color: '#b45309', border: '1px solid rgba(255,179,71,0.28)' }}
          >
            On Shift
          </span>
        </div>
        <ChevronRight className="w-6 h-6" style={{ color: D.muted }} />
      </button>

      {[
        { label: 'Medications',    icon: Pill,     iconBg: 'rgba(96,165,250,0.09)',  iconColor: '#60a5fa', action: () => handlePageChange('medications'), testId: 'menu-medications'    },
        { label: 'Shift History',  icon: Clock,    iconBg: 'rgba(167,139,250,0.09)', iconColor: '#a78bfa', action: () => handlePageChange('history'),     testId: 'menu-shift-history'  },
        { label: 'Settings',       icon: Settings, iconBg: D.bg,                     iconColor: D.muted,   action: () => handlePageChange('settings'),    testId: 'menu-settings'       },
        { label: 'Help & Support', icon: Bell,     iconBg: 'rgba(251,191,36,0.09)',  iconColor: '#d97706', action: () => handlePageChange('support'),     testId: 'menu-support'        },
      ].map((item, idx) => (
        <button
          key={idx}
          onClick={item.action}
          className="w-full rounded-2xl p-5 flex items-center gap-4 transition-all"
          style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
          data-testid={item.testId}
        >
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: item.iconBg }}>
            <item.icon className="w-6 h-6" style={{ color: item.iconColor }} />
          </div>
          <span className="text-lg flex-1 text-left font-light" style={{ color: D.h }}>{item.label}</span>
          <ChevronRight className="w-6 h-6" style={{ color: D.muted }} />
        </button>
      ))}

      <button
        onClick={onSignOut}
        className="w-full rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}
        data-testid="menu-sign-out-btn"
      >
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
          <User className="w-6 h-6" style={{ color: '#ef4444' }} />
        </div>
        <span className="text-lg flex-1 text-left font-light" style={{ color: '#ef4444' }}>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: D.bg, fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em' }}>
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'incident' && <IncidentReportPage patientName={patient?.name} incidents={incidents} onAddIncident={onAddIncident} />}
      {activeTab === 'chat' && <ChatPage onBack={() => handleTabChange('home')} role={UserRole.CAREGIVER} />}
      {activeTab === 'shift' && renderShiftContent()}
      {activeTab === 'settings' && renderSettingsContent()}

      {activeTab === 'home' && (
        <div className="fixed z-40" style={{ bottom: 100, right: 18 }}>
          <button
            onClick={() => setShowCopilot(true)}
            className="flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              background: 'linear-gradient(135deg,#FFB347,#F28482)',
              border: 'none',
              boxShadow: `0 6px 24px rgba(255,179,71,0.45), 0 2px 8px rgba(0,0,0,0.10)`,
              padding: 3,
              overflow: 'hidden',
            }}
            data-testid="copilot-btn"
          >
            <CareAssistantIcon size={60} />
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav
        className="fixed z-30"
        style={{
          bottom: 12, left: 16, right: 16,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 28,
          boxShadow: '0 -2px 24px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex justify-around items-center py-2.5 px-2">
          {[
            { id: 'home',     icon: Home,          label: 'Home'    },
            { id: 'incident', icon: AlertTriangle,  label: 'Incident'},
            { id: 'chat',     icon: MessageSquare,  label: 'Message' },
            { id: 'shift',    icon: Clock,          label: 'Shifts', badge: isShiftActive },
            { id: 'settings', icon: Settings,       label: 'Menu'   },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex flex-col items-center px-3 py-1.5 transition-all relative rounded-2xl"
                style={{ background: isActive ? 'rgba(255,179,71,0.10)' : 'transparent', minWidth: 52 }}
                data-testid={`nav-${tab.id}`}
              >
                <tab.icon
                  className="w-6 h-6"
                  style={{ color: isActive ? '#b45309' : D.muted }}
                  fill="none"
                  stroke={isActive ? '#b45309' : D.muted}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                <span className="text-[10px] font-semibold mt-1" style={{ color: isActive ? '#b45309' : D.muted }}>
                  {tab.label}
                </span>
                {tab.badge && (
                  <div
                    className="absolute top-1 right-2 w-2 h-2 rounded-full"
                    style={{ background: '#FFB347', boxShadow: '0 0 6px rgba(255,179,71,0.70)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      {selectedTask && (
        <TaskCompletionModal task={selectedTask} onClose={() => setSelectedTask(null)} onComplete={handleCompleteTask} />
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
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          data-testid="clock-alert-modal"
        >
          <div
            className="mx-6 max-w-sm w-full text-center overflow-hidden animate-scale-in rounded-3xl"
            style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadowMd }}
          >
            <div className="p-7 pb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: clockAlertTitle.includes('In') ? 'rgba(255,179,71,0.12)' : 'rgba(239,68,68,0.09)',
                  border: `1px solid ${clockAlertTitle.includes('In') ? 'rgba(255,179,71,0.30)' : 'rgba(239,68,68,0.16)'}`,
                }}
              >
                <Clock className="w-6 h-6" style={{ color: clockAlertTitle.includes('In') ? D.brand : '#ef4444' }} />
              </div>
              <h3 className="text-[18px] font-semibold mb-2" style={{ color: D.h }}>{clockAlertTitle}</h3>
              <p className="text-sm leading-relaxed font-light" style={{ color: D.muted }}>{clockAlertMessage}</p>
            </div>
            <div style={{ borderTop: `1px solid ${D.bdr}` }}>
              <button
                onClick={() => setShowClockAlert(false)}
                className="w-full py-4 font-semibold text-base transition-opacity hover:opacity-70"
                style={{ color: D.brand }}
                data-testid="clock-alert-ok-btn"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List Modal */}
      {showClientList && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
          data-testid="client-list-modal"
        >
          <div className="pt-14 px-5 h-full overflow-y-auto pb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[26px] font-semibold" style={{ color: D.h }}>Your Clients</h2>
              <button
                onClick={() => setShowClientList(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
                data-testid="close-client-list-btn"
              >
                <X className="w-5 h-5" style={{ color: D.h }} />
              </button>
            </div>
            <div className="space-y-3">
              {CLIENTS.map(client => {
                const isActive = client.id === activeClientId;
                const riskColors = {
                  low:      { bg: 'rgba(22,163,74,0.09)',  text: '#15803d', border: 'rgba(22,163,74,0.18)' },
                  moderate: { bg: 'rgba(251,191,36,0.09)', text: '#d97706', border: 'rgba(251,191,36,0.16)' },
                  high:     { bg: 'rgba(239,68,68,0.09)',  text: '#ef4444', border: 'rgba(239,68,68,0.16)' },
                };
                const risk = riskColors[client.riskLevel] || riskColors.low;
                return (
                  <button
                    key={client.id}
                    onClick={() => { setActiveClientId(client.id); setShowClientList(false); }}
                    className="w-full p-4 flex items-center text-left transition-all rounded-[1.125rem]"
                    style={{
                      background: isActive ? D.brandTint : D.card,
                      border: `1.5px solid ${isActive ? 'rgba(255,179,71,0.30)' : D.bdr}`,
                      boxShadow: D.shadow,
                    }}
                    data-testid={`client-card-${client.id}`}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0"
                      style={{ background: D.bg, border: `1px solid ${D.bdr}` }}
                    >
                      <User className="w-6 h-6" style={{ color: D.muted }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] font-semibold" style={{ color: D.h }}>{client.name}</p>
                      <p className="text-xs mt-0.5 font-light" style={{ color: D.muted }}>{client.condition}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-semibold" style={{ color: '#000000' }}>
                          {client.tasksCompleted}/{client.tasksToday} tasks
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                          style={{ background: risk.bg, color: risk.text, border: `1px solid ${risk.border}` }}
                        >
                          {client.riskLevel}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: D.brand }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverDashboard;

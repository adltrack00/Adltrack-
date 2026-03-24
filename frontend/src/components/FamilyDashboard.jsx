import React, { useState } from 'react';
import { 
  Activity, MessageSquare, Bell, Settings, Heart, Thermometer, 
  ChevronRight, ChevronLeft, User, Clock, CheckCircle, Camera, Frown, Sparkles, Plus, X, 
  AlertTriangle, Home, Search, Users, Star, Mail, AlertCircle,
  Calendar, Pill, Shield, TrendingUp, Phone, FileText, ArrowLeft
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { PatientProfileModal } from './PatientProfileModal';
import { VitalsModal } from './VitalsModal';
import { AICopilot } from './AICopilot';
import { CareAssistantIcon } from './CareAssistantIcon';
import { IncidentViewPage } from './IncidentViewPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SupportPage } from './pages/SupportPage';
import { CARE_IMAGES, CAREGIVER_PROFILE, FAMILY_ALERTS, CARE_PLAN, WEEKLY_REPORT } from '../services/mockData';

export const FamilyDashboard = ({ 
  onBack, 
  onSignOut,
  onRoleSwitch,
  currentRole,
  tasks = [],
  patient,
  vitalsData,
  incidents = [],
  onAddRequest
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaskTab, setActiveTaskTab] = useState('timeline');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [vitalsInitialTab, setVitalsInitialTab] = useState('bp');
  const [showCopilot, setShowCopilot] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activePage, setActivePage] = useState(null);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'standard' });
  const [myRequests, setMyRequests] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Historical date viewing
  const [viewingDate, setViewingDate] = useState(null);
  const [historicalTasks, setHistoricalTasks] = useState([]);

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

  const handleSelectHistoricalDate = (date, tasksForDate) => {
    setViewingDate(date);
    setHistoricalTasks(tasksForDate);
    setActiveTab('home');
  };

  const handleReturnToToday = () => {
    setViewingDate(null);
    setHistoricalTasks([]);
  };

  // Get latest vitals
  const latestBP = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];
  const latestPain = vitalsData?.pain?.[vitalsData.pain.length - 1];

  const displayTasks = viewingDate ? historicalTasks : tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const totalTasks = tasks.filter(t => t.status !== TaskStatus.PROPOSED).length;

  const handleAddRequest = () => {
    if (newRequest.title.trim()) {
      const request = {
        id: Date.now(),
        ...newRequest,
        status: 'pending',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      setMyRequests(prev => [request, ...prev]);
      setNewRequest({ title: '', description: '', priority: 'standard' });
      setShowRequestModal(false);
    }
  };

  const getTaskImage = (task) => {
    if (task.evidenceUrl) return task.evidenceUrl;
    const title = task.title.toLowerCase();
    if (title.includes('medication') || title.includes('med')) return CARE_IMAGES.medication;
    if (title.includes('breakfast') || title.includes('lunch') || title.includes('dinner') || title.includes('meal')) return CARE_IMAGES.meal;
    if (title.includes('walk') || title.includes('exercise')) return CARE_IMAGES.walk;
    return CARE_IMAGES.vitals;
  };

  // ==========================================
  // CARE PLAN SUB-SCREEN
  // ==========================================
  if (activePage === 'carePlan') {
    return (
      <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="flex items-center px-5 pt-3 pb-1">
            <button onClick={() => handlePageChange(null)} className="mr-4 p-1" data-testid="care-plan-back">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Care Plan</h1>
              <p className="text-[#8e8e93] text-[14px]">For {patient?.name}</p>
            </div>
          </div>

          <div className="px-5 space-y-5">
            {/* Primary Goals */}
            <div className="bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-[#25D366] text-sm font-bold uppercase tracking-wider mb-5">Primary Goals</h3>
              <div className="space-y-4">
                {CARE_PLAN.goals.map((goal, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#25D366] flex-shrink-0" fill="#25D366" stroke="#1c1c1e" strokeWidth={2} />
                    <p className="text-white text-[16px]">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-[#25D366] text-sm font-bold uppercase tracking-wider mb-5">Medications</h3>
              <div className="divide-y divide-[#2c2c2e]">
                {CARE_PLAN.medications.map((med, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold text-[17px]">{med.name} ({med.dosage})</p>
                      <p className="text-[#8e8e93] text-[14px] mt-1">{med.frequency} - {med.condition}</p>
                    </div>
                    <span className="text-[#25D366] text-[15px] font-semibold flex-shrink-0 ml-4">{med.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Schedule */}
            <div className="bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-[#25D366] text-sm font-bold uppercase tracking-wider mb-5">Daily Schedule</h3>
              <div className="divide-y divide-[#2c2c2e]">
                {CARE_PLAN.dailySchedule.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold text-[17px]">{item.activity}</p>
                      <p className="text-[#8e8e93] text-[14px] mt-1">{item.priority} - {item.type}</p>
                    </div>
                    <span className="text-[#25D366] text-[15px] font-semibold flex-shrink-0 ml-4">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-[#ff453a] text-sm font-bold uppercase tracking-wider mb-5">Dietary Restrictions</h3>
              <div className="space-y-3">
                {CARE_PLAN.dietaryRestrictions.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-[#ff453a] flex-shrink-0" fill="#ff453a" stroke="#1c1c1e" strokeWidth={2} />
                    <p className="text-[#ff453a] text-[16px]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Protocol */}
            <div className="bg-[#1c1c1e] rounded-2xl p-6">
              <h3 className="text-[#ff453a] text-sm font-bold uppercase tracking-wider mb-4">Emergency Protocol</h3>
              <div className="bg-[#3d1a1a]/60 border border-[#7f2d2d]/50 rounded-xl p-4">
                <p className="text-[#e88e8e] text-[16px] leading-relaxed">{CARE_PLAN.emergencyProtocol}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // WEEKLY REPORT SUB-SCREEN
  // ==========================================
  if (activePage === 'weeklyReport') {
    return (
      <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="flex items-center px-5 pt-3 pb-1">
            <button onClick={() => handlePageChange(null)} className="mr-4 p-1" data-testid="weekly-report-back">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Weekly Report</h1>
              <p className="text-[#8e8e93] text-[14px]">Week of Dec 9-15</p>
            </div>
          </div>

          <div className="px-5 space-y-4">
            {/* Overall Compliance Circle */}
            <div className="bg-[#1c1c1e] rounded-2xl p-6 flex flex-col items-center">
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a2e" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#25D366" strokeWidth="10" 
                    strokeDasharray={`${WEEKLY_REPORT.overallCompliance * 3.14} ${314 - WEEKLY_REPORT.overallCompliance * 3.14}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{WEEKLY_REPORT.overallCompliance}%</span>
                </div>
              </div>
              <p className="text-[#ababab] text-sm">Overall Compliance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-[#25D366]">{WEEKLY_REPORT.tasksCompleted}/{WEEKLY_REPORT.totalTasks}</p>
                <p className="text-[#ababab] text-xs mt-1">Tasks</p>
              </div>
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-[#25D366]">{WEEKLY_REPORT.medsOnTime}%</p>
                <p className="text-[#ababab] text-xs mt-1">Meds On Time</p>
              </div>
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{WEEKLY_REPORT.incidents}</p>
                <p className="text-[#ababab] text-xs mt-1">Incidents</p>
              </div>
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-rose-400">{WEEKLY_REPORT.missedTasks}</p>
                <p className="text-[#ababab] text-xs mt-1">Missed Tasks</p>
              </div>
            </div>

            {/* Caregiver Notes */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider mb-3">Caregiver Notes</h3>
              <p className="text-white text-base leading-relaxed">{WEEKLY_REPORT.caregiverNotes}</p>
            </div>

            {/* Performance Trend */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider mb-4">Performance Trend</h3>
              <div className="flex items-end justify-between h-24 gap-2">
                {WEEKLY_REPORT.performanceTrend.map((d, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-stone-800 rounded-full overflow-hidden" style={{ height: '80px' }}>
                      <div className="w-full bg-[#25D366] rounded-full mt-auto" style={{ height: `${d.score}%`, marginTop: `${100 - d.score}%` }} />
                    </div>
                    <span className="text-[#8e8e93] text-[10px]">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CURRENT CAREGIVER SUB-SCREEN
  // ==========================================
  if (activePage === 'caregiver') {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const todayStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

    return (
      <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
        <div className="flex-1 overflow-y-auto pb-6">
          {/* Header */}
          <div className="flex items-center px-5 pt-3 pb-3">
            <button onClick={() => handlePageChange(null)} className="mr-4 p-1" data-testid="caregiver-page-back">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Current Caregiver</h1>
          </div>

          <div className="px-5 space-y-5">
            {/* Photo & Info */}
            <div className="flex flex-col items-center pt-2">
              <div className="w-36 h-36 rounded-full overflow-hidden ring-[3px] ring-[#25D366] mb-4">
                <img src={CAREGIVER_PROFILE.photo} alt={CAREGIVER_PROFILE.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-[26px] font-bold text-white">{CAREGIVER_PROFILE.name}</h2>
              <p className="text-[#8e8e93] text-[16px] mt-1">{CAREGIVER_PROFILE.role}</p>
            </div>

            {/* Stats Row - Icons + Numbers */}
            <div className="flex justify-center gap-10 py-2">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-[#2c2c2e] rounded-full flex items-center justify-center mb-2">
                  <Star className="w-7 h-7 text-amber-400" fill="#fbbf24" />
                </div>
                <p className="text-[22px] font-bold text-white">{CAREGIVER_PROFILE.rating}</p>
                <p className="text-[#8e8e93] text-sm">Rating</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-[#2c2c2e] rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-7 h-7 text-[#25D366]" />
                </div>
                <p className="text-[22px] font-bold text-white">{CAREGIVER_PROFILE.yearsExperience}</p>
                <p className="text-[#8e8e93] text-sm">Years</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-[#2c2c2e] rounded-full flex items-center justify-center mb-2">
                  <Calendar className="w-7 h-7 text-[#3b82f6]" />
                </div>
                <p className="text-[22px] font-bold text-white">{CAREGIVER_PROFILE.shiftsCompleted}</p>
                <p className="text-[#8e8e93] text-sm">Shifts</p>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[17px] font-bold text-white mb-4">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {CAREGIVER_PROFILE.certifications.map((cert, idx) => (
                  <span key={idx} className="bg-[#25D366]/15 text-[#25D366] text-[14px] font-semibold px-4 py-2 rounded-full flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[17px] font-bold text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#8e8e93]" />
                  <span className="text-white text-[15px]">{CAREGIVER_PROFILE.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#8e8e93]" />
                  <span className="text-white text-[15px]">{CAREGIVER_PROFILE.phone}</span>
                </div>
              </div>
            </div>

            {/* Caregiver Performance */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold text-white">Caregiver Performance</h3>
                <span className="bg-[#25D366]/15 text-[#25D366] text-[14px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4" fill="#25D366" />
                  96%
                </span>
              </div>
              <div className="grid grid-cols-3 text-center">
                <div>
                  <p className="text-[24px] font-bold text-white">94%</p>
                  <p className="text-[#8e8e93] text-[13px] mt-1">Tasks<br/>Completed</p>
                </div>
                <div className="border-x border-[#2c2c2e]">
                  <p className="text-[24px] font-bold text-white">98%</p>
                  <p className="text-[#8e8e93] text-[13px] mt-1">On-Time<br/>Rate</p>
                </div>
                <div>
                  <p className="text-[24px] font-bold text-white">4.8</p>
                  <p className="text-[#8e8e93] text-[13px] mt-1">Family<br/>Rating</p>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-bold text-white">Today's Summary</h3>
                <span className="text-[#8e8e93] text-[14px]">{todayStr}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#2c2c2e] rounded-xl p-4 text-center">
                  <p className="text-[24px] font-bold text-white">{completedTasks.length}/{totalTasks}</p>
                  <p className="text-[#8e8e93] text-[13px] mt-1">Tasks Done</p>
                </div>
                <div className="bg-[#2c2c2e] rounded-xl p-4 text-center">
                  <p className="text-[24px] font-bold text-white">0/4</p>
                  <p className="text-[#8e8e93] text-[13px] mt-1">Meds Given</p>
                </div>
                <div className="bg-[#2c2c2e] rounded-xl p-4 text-center">
                  <p className="text-[24px] font-bold text-white">--:--</p>
                  <p className="text-[#8e8e93] text-[13px] mt-1">Arrived At</p>
                </div>
                <div className="bg-[#2c2c2e] rounded-xl p-4 text-center">
                  <p className="text-[24px] font-bold text-white">0</p>
                  <p className="text-[#8e8e93] text-[13px] mt-1">Incidents</p>
                </div>
              </div>
            </div>

            {/* Message Caregiver Button */}
            <button
              onClick={() => { handlePageChange(null); handleTabChange('messages'); }}
              className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold text-[17px] flex items-center justify-center gap-2"
              data-testid="message-caregiver-btn"
            >
              <MessageSquare className="w-5 h-5" />
              Message Caregiver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // HOME TAB
  // ==========================================
  const renderHomeContent = () => (
    <div className="flex-1 overflow-y-auto bg-black pb-20">
      {/* Vitals Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => { setVitalsInitialTab('bp'); setShowVitals(true); }} className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors" data-testid="vital-bp">
            <div className="w-11 h-11 bg-[#6b1c3b] rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Heart className="w-5 h-5 text-[#ec4899]" fill="currentColor" />
            </div>
            <p className="text-base font-bold text-white text-center">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--'}</p>
            <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">BP</p>
          </button>

          <button onClick={() => { setVitalsInitialTab('hr'); setShowVitals(true); }} className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors" data-testid="vital-heart">
            <div className="w-11 h-11 bg-[#5c3d1e] rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Activity className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <p className="text-base font-bold text-white text-center">{latestHR ? latestHR.value : '--'}</p>
            <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">Heart</p>
          </button>

          <button onClick={() => { setVitalsInitialTab('temp'); setShowVitals(true); }} className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors" data-testid="vital-temp">
            <div className="w-11 h-11 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Thermometer className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <p className="text-base font-bold text-white text-center">{latestTemp ? `${latestTemp.value}°` : '--'}</p>
            <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">Temp</p>
          </button>

          <button onClick={() => { setVitalsInitialTab('pain'); setShowVitals(true); }} className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors" data-testid="vital-pain">
            <div className="w-11 h-11 bg-[#4a1d6b] rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Frown className="w-5 h-5 text-[#a855f7]" />
            </div>
            <p className="text-base font-bold text-white text-center">{latestPain ? `${latestPain.value}/10` : '--'}</p>
            <p className="text-[11px] text-[#8e8e93] font-medium mt-0.5 text-center">Pain</p>
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-4 py-4">
        {viewingDate && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Viewing History</p>
              </div>
            </div>
            <button onClick={handleReturnToToday} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold">
              Back to Today
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-semibold text-white">Today&apos;s Progress</span>
          <span className="text-base font-semibold text-[#ababab]">{completedTasks.length}/{totalTasks}</span>
        </div>
        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#25D366] rounded-full transition-all duration-500"
            style={{ width: totalTasks > 0 ? `${(completedTasks.length / totalTasks) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex items-center">
          {!viewingDate && (
            <>
              <button onClick={() => setActiveTaskTab('requests')} className="relative">
                <span className={`text-base font-medium transition-colors ${activeTaskTab === 'requests' ? 'text-white' : 'text-[#8e8e93]'}`}>
                  My Requests
                </span>
                {myRequests.length > 0 && (
                  <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {myRequests.length}
                  </span>
                )}
              </button>
              <div className="flex-1 h-px bg-stone-700 mx-4" />
            </>
          )}
          <button onClick={() => setActiveTaskTab('timeline')} className={`text-base font-medium transition-colors ${activeTaskTab === 'timeline' || viewingDate ? 'text-white' : 'text-[#8e8e93]'}`}>
            Care Timeline
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-4">
        {activeTaskTab === 'requests' && !viewingDate ? (
          <div className="space-y-3">
            <button onClick={() => setShowRequestModal(true)} className="w-full p-4 border-2 border-dashed border-stone-700 text-[#ababab] hover:border-[#25D366] hover:text-[#25D366] rounded-2xl flex items-center justify-center gap-2 transition-colors" data-testid="add-request-btn">
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Request</span>
            </button>

            {myRequests.length > 0 ? (
              myRequests.map((request) => (
                <div key={request.id} className="bg-[#1c1c1e] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        request.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' 
                        : request.priority === 'high' ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-stone-800 text-[#ababab]'
                      }`}>{request.priority.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">Pending</span>
                    </div>
                    <span className="text-xs text-[#8e8e93]">{request.time}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{request.title}</h3>
                  {request.description && <p className="text-sm text-[#ababab]">{request.description}</p>}
                </div>
              ))
            ) : (
              <div className="bg-[#1c1c1e] rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#8e8e93]" />
                </div>
                <h3 className="font-semibold text-white mb-1">No requests yet</h3>
                <p className="text-[#8e8e93] text-sm">Tap the button above to request tasks for the caregiver</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {displayTasks.length > 0 ? (
              <div className="space-y-3">
                {displayTasks.map((task) => (
                  <div key={task.id} className="bg-[#1c1c1e] rounded-2xl overflow-hidden" onClick={() => setSelectedTask(task)}>
                    <div className="relative aspect-[16/9] cursor-pointer">
                      <img src={getTaskImage(task)} alt={task.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg">{task.title}</h3>
                        <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          Completed at {task.completedAt}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      {task.completionNote && <p className="text-[#ababab] text-sm mb-3">&quot;{task.completionNote}&quot;</p>}
                      <div className="flex items-center gap-3">
                        <img src={CAREGIVER_PROFILE.photo} alt="Caregiver" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">Julia Martinez</p>
                          <p className="text-[#8e8e93] text-xs">Caregiver</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1c1c1e] rounded-2xl p-10 text-center">
                <div className="w-20 h-20 bg-[#2c2c2e] rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Clock className="w-10 h-10 text-[#8e8e93]" />
                </div>
                <h3 className="font-bold text-white text-xl mb-2">No care updates yet</h3>
                <p className="text-[#8e8e93] text-[15px] leading-relaxed">Tasks completed by caregivers will appear here with photos and notes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ==========================================
  // MESSAGES TAB
  // ==========================================
  // ==========================================
  // ALERTS TAB
  // ==========================================
  const getScheduleIcon = (iconType) => {
    switch (iconType) {
      case 'pulse': return Activity;
      case 'calendar': return Calendar;
      case 'pill': return Pill;
      default: return Activity;
    }
  };

  const renderAlertsContent = () => (
    <div className="flex-1 overflow-y-auto bg-black pb-28">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
      </div>

      {/* Upcoming Schedule */}
      <div className="px-5 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#8e8e93]" />
          <span className="text-xs font-bold text-[#8e8e93] uppercase tracking-wider">Upcoming Schedule</span>
        </div>
      </div>

      <div className="px-5 space-y-3 mb-6">
        {FAMILY_ALERTS.upcoming.map((item) => {
          const IconComp = getScheduleIcon(item.icon);
          return (
            <div key={item.id} className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-[#1e3a5f] rounded-full flex items-center justify-center flex-shrink-0">
                <IconComp className="w-7 h-7 text-[#3b82f6]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-[16px]">{item.title}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock className="w-4 h-4 text-[#8e8e93]" />
                  <p className="text-[#8e8e93] text-[14px]">{item.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Alerts */}
      <div className="px-5 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-[#8e8e93]" />
          <span className="text-xs font-bold text-[#8e8e93] uppercase tracking-wider">Recent Alerts</span>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {FAMILY_ALERTS.recent.map((item) => (
          <div key={item.id} className={`rounded-2xl p-5 ${item.highlight ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-[#1c1c1e]'}`}>
            <p className="text-white font-bold text-[16px]">{item.title}</p>
            <p className="text-[#8e8e93] text-[14px] mt-1">{item.subtitle}</p>
            <p className="text-[#8e8e93] text-[13px] mt-2">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================
  // MENU TAB
  // ==========================================
  const renderMenuContent = () => (
    <div className="flex-1 overflow-y-auto bg-black px-5 pt-4 space-y-3 pb-24">
      {/* Family Member Profile */}
      <button 
        onClick={() => handlePageChange('profile')}
        className="w-full bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 text-left"
        data-testid="menu-profile"
      >
        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" alt="Mary Smith" className="w-20 h-20 rounded-2xl object-cover" />
        <div className="flex-1">
          <h3 className="font-bold text-white text-xl">Mary Smith</h3>
          <p className="text-[#8e8e93] text-[15px] mt-0.5">Family Guardian</p>
        </div>
        <ChevronRight className="w-6 h-6 text-[#8e8e93]" />
      </button>

      {/* Patient Quick Access */}
      <button 
        onClick={() => setShowPatientProfile(true)}
        className="w-full bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 text-left"
        data-testid="menu-patient"
      >
        <img src={patient?.photo || ''} alt={patient?.name} className="w-16 h-16 rounded-2xl object-cover" />
        <div className="flex-1">
          <p className="font-bold text-white text-lg">{patient?.name}</p>
          <p className="text-[#8e8e93] text-[15px] mt-0.5">View Medical Profile</p>
        </div>
        <ChevronRight className="w-6 h-6 text-[#8e8e93]" />
      </button>

      {/* Menu Items */}
      {[
        { label: 'Care Plan', icon: FileText, hasColor: true, color: '#25D366', action: () => handlePageChange('carePlan') },
        { label: 'Weekly Report', icon: TrendingUp, hasColor: true, color: '#f59e0b', action: () => handlePageChange('weeklyReport') },
        { label: 'Current Caregiver', icon: Heart, hasColor: false, action: () => handlePageChange('caregiver') },
        { label: 'Settings', icon: Settings, hasColor: false, action: () => handlePageChange('settings') },
        { label: 'Support', icon: Bell, hasColor: false, action: () => handlePageChange('support') },
      ].map((item, idx) => (
        <button 
          key={idx} 
          onClick={item.action} 
          className="w-full bg-[#1c1c1e] rounded-2xl p-5 flex items-center gap-4"
          data-testid={`menu-${item.label.toLowerCase().replace(' ', '-')}`}
        >
          <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${
            item.hasColor ? '' : 'bg-[#3a3a3c]'
          }`} style={item.hasColor ? { backgroundColor: item.color } : {}}>
            <item.icon className="w-6 h-6 text-white" />
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

  // ==========================================
  // SETTINGS / SUPPORT SUB-PAGES
  // ==========================================
  if (activePage === 'settings') {
    return <SettingsPage onBack={() => handlePageChange(null)} onNavigateToHelp={() => handlePageChange('support')} />;
  }
  if (activePage === 'support') {
    return <SupportPage onBack={() => handlePageChange(null)} />;
  }
  if (activePage === 'profile') {
    return <ProfilePage onBack={() => handlePageChange(null)} role={UserRole.FAMILY} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
      {/* Main Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'incident' && <IncidentViewPage patientName={patient?.name} incidents={incidents} />}
      {activeTab === 'chat' && <ChatPage onBack={() => handleTabChange('home')} role={UserRole.FAMILY} />}
      {activeTab === 'notifications' && renderAlertsContent()}
      {activeTab === 'settings' && renderMenuContent()}

      {/* Floating Action Button - AI Care Assistant */}
      {activeTab === 'home' && (
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1c1c1e] z-30">
        <div className="flex justify-around items-center py-3">
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'incident', icon: AlertTriangle, label: 'Incident', badge: incidents.length > 0 ? incidents.length : null },
            { id: 'chat', icon: MessageSquare, label: 'Message' },
            { id: 'notifications', icon: Bell, label: 'Alerts' },
            { id: 'settings', icon: Settings, label: 'Menu' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex flex-col items-center px-3 py-1 transition-all relative"
                data-testid={`nav-${tab.id}`}
              >
                <tab.icon 
                  className={`w-8 h-8 ${isActive ? 'text-[#25D366]' : 'text-[#8e8e93]'}`}
                  fill={isActive ? '#25D366' : 'none'}
                  stroke={isActive ? '#1c1c1e' : '#8e8e93'}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className={`text-[11px] font-semibold mt-1 ${isActive ? 'text-[#25D366]' : 'text-[#8e8e93]'}`}>{tab.label}</span>
                {tab.badge && (
                  <div className="absolute top-0 right-0.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center ring-2 ring-[#1c1c1e]">
                    <span className="text-white text-[10px] font-bold">{tab.badge}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <PatientProfileModal
        isOpen={showPatientProfile}
        onClose={() => setShowPatientProfile(false)}
        patient={patient}
        tasks={tasks}
        role="family"
        onSelectDate={handleSelectHistoricalDate}
      />

      <VitalsModal
        isOpen={showVitals}
        onClose={() => setShowVitals(false)}
        vitalsData={vitalsData}
        isCaregiver={false}
        initialTab={vitalsInitialTab}
      />

      <AICopilot
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        role="family"
        patientName={patient?.name}
      />

      {/* Add Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
          <div className="bg-black border-t border-[#2c2c2e] w-full max-w-md rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Request</h2>
              <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-[#8e8e93]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#ababab] mb-2">What do you need?</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Extra blanket, Call me back"
                  className="w-full px-4 py-3 bg-[#2c2c2e] text-white placeholder-[#636366] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  style={{ fontSize: '16px' }}
                  data-testid="request-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#ababab] mb-2">Additional details (optional)</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any specific instructions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#2c2c2e] text-white placeholder-[#636366] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
                  style={{ fontSize: '16px' }}
                  data-testid="request-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#ababab] mb-2">Priority</label>
                <div className="flex gap-2">
                  {['standard', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewRequest(prev => ({ ...prev, priority }))}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                        newRequest.priority === priority
                          ? priority === 'urgent' ? 'bg-rose-500 text-white' : priority === 'high' ? 'bg-orange-500 text-white' : 'bg-stone-700 text-white'
                          : 'bg-[#2c2c2e] text-[#ababab] hover:bg-stone-800'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddRequest}
                disabled={!newRequest.title.trim()}
                className="w-full py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                data-testid="submit-request-btn"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-black rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#2c2c2e]">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedTask.title}</h2>
                <p className="text-sm text-[#8e8e93] flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4" />
                  Completed at {selectedTask.completedAt}
                </p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-[#8e8e93]" />
              </button>
            </div>
            <div className="relative">
              <img src={getTaskImage(selectedTask)} alt={selectedTask.title} className="w-full max-h-[50vh] object-contain bg-black" />
            </div>
            <div className="p-5 space-y-4">
              {selectedTask.completionNote && (
                <div className="bg-[#2c2c2e] rounded-2xl p-4">
                  <p className="text-xs font-bold text-[#8e8e93] uppercase tracking-wider mb-2">Caregiver Note</p>
                  <p className="text-white text-sm leading-relaxed">&quot;{selectedTask.completionNote}&quot;</p>
                </div>
              )}
              <div className="flex items-center gap-3 pt-3 border-t border-[#2c2c2e]">
                <img src={CAREGIVER_PROFILE.photo} alt="Caregiver" className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-white">Julia Martinez</p>
                  <p className="text-[#8e8e93] text-sm">Certified Nursing Assistant</p>
                </div>
                <div className="flex items-center gap-1 text-[#25D366] text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDashboard;

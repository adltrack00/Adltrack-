import React, { useState } from 'react';
import { 
  Activity, MessageSquare, Bell, Settings, Heart, Thermometer, 
  ChevronRight, ChevronLeft, User, Clock, CheckCircle, Camera, Frown, Sparkles, Plus, X, 
  AlertTriangle, Home, Search, Send, Users, Check, CheckCheck,
  Calendar, Pill, Shield, TrendingUp, Phone, FileText, ArrowLeft
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { PatientProfileModal } from './PatientProfileModal';
import { VitalsModal } from './VitalsModal';
import { AICopilot } from './AICopilot';
import { IncidentViewPage } from './IncidentViewPage';
import { ChatPage } from './pages/ChatPage';
import { CARE_IMAGES, CAREGIVER_PROFILE, FAMILY_CONVERSATIONS, FAMILY_ALERTS, CARE_PLAN, WEEKLY_REPORT } from '../services/mockData';

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
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Can someone cover Sunday?', time: '10:30 AM', sent: false },
    { id: 2, text: "I can cover from 2-6 PM!", time: '10:32 AM', sent: true },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Historical date viewing
  const [viewingDate, setViewingDate] = useState(null);
  const [historicalTasks, setHistoricalTasks] = useState([]);

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

  const handleSendChat = () => {
    if (chatInput.trim()) {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        sent: true,
      }]);
      setChatInput('');
    }
  };

  // ==========================================
  // CARE PLAN SUB-SCREEN
  // ==========================================
  if (activePage === 'carePlan') {
    return (
      <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-5 pt-5">
            <button onClick={() => setActivePage(null)} className="flex items-center gap-1 text-stone-400 mb-4" data-testid="care-plan-back">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">Care Plan</h1>
            <p className="text-stone-400 text-sm mb-6">For {patient?.name}</p>
          </div>

          <div className="px-5 space-y-4">
            {/* Primary Goals */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider mb-4">Primary Goals</h3>
              <div className="space-y-3">
                {CARE_PLAN.goals.map((goal, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#25D366] mt-0.5 flex-shrink-0" />
                    <p className="text-white text-sm">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider mb-4">Medications</h3>
              <div className="divide-y divide-stone-800">
                {CARE_PLAN.medications.map((med, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{med.name} {med.dosage}</p>
                        <p className="text-stone-400 text-xs mt-0.5">{med.frequency} - {med.condition}</p>
                      </div>
                      <span className="text-[#25D366] text-xs font-semibold">{med.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Schedule */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider mb-4">Daily Schedule</h3>
              <div className="space-y-3">
                {CARE_PLAN.dailySchedule.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-[#25D366] text-xs font-semibold w-16 flex-shrink-0">{item.time}</span>
                    <p className="text-white text-sm">{item.activity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider mb-4">Dietary Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {CARE_PLAN.dietaryRestrictions.map((item, idx) => (
                  <span key={idx} className="bg-stone-800 text-white text-xs font-medium px-3 py-1.5 rounded-full">{item}</span>
                ))}
              </div>
            </div>

            {/* Emergency Protocol */}
            <div className="bg-[#3d1a1a] border border-[#7f2d2d] rounded-2xl p-5">
              <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3">Emergency Protocol</h3>
              <p className="text-white text-sm leading-relaxed">{CARE_PLAN.emergencyProtocol}</p>
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
          <div className="px-5 pt-5">
            <button onClick={() => setActivePage(null)} className="flex items-center gap-1 text-stone-400 mb-4" data-testid="weekly-report-back">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">Weekly Report</h1>
            <p className="text-stone-400 text-sm mb-6">Week of Dec 9-15</p>
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
              <p className="text-stone-400 text-sm">Overall Compliance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-[#25D366]">{WEEKLY_REPORT.tasksCompleted}/{WEEKLY_REPORT.totalTasks}</p>
                <p className="text-stone-400 text-xs mt-1">Tasks</p>
              </div>
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-[#25D366]">{WEEKLY_REPORT.medsOnTime}%</p>
                <p className="text-stone-400 text-xs mt-1">Meds On Time</p>
              </div>
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{WEEKLY_REPORT.incidents}</p>
                <p className="text-stone-400 text-xs mt-1">Incidents</p>
              </div>
              <div className="bg-[#1c1c1e] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-rose-400">{WEEKLY_REPORT.missedTasks}</p>
                <p className="text-stone-400 text-xs mt-1">Missed Tasks</p>
              </div>
            </div>

            {/* Caregiver Notes */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-[#25D366] text-xs font-bold uppercase tracking-wider mb-3">Caregiver Notes</h3>
              <p className="text-stone-300 text-sm leading-relaxed">{WEEKLY_REPORT.caregiverNotes}</p>
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
                    <span className="text-stone-500 text-[10px]">{d.day}</span>
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
    return (
      <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-5 pt-5">
            <button onClick={() => setActivePage(null)} className="flex items-center gap-1 text-stone-400 mb-6" data-testid="caregiver-page-back">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>

          <div className="px-5 space-y-5">
            {/* Caregiver Photo & Info */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#25D366] mb-3">
                <img src={CAREGIVER_PROFILE.photo} alt={CAREGIVER_PROFILE.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-bold text-white">{CAREGIVER_PROFILE.name}</h2>
              <p className="text-stone-400 text-sm">{CAREGIVER_PROFILE.role}</p>
            </div>

            {/* Stats Row */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-white">{CAREGIVER_PROFILE.rating}</p>
                  <p className="text-stone-500 text-xs mt-0.5">Rating</p>
                </div>
                <div className="border-x border-stone-800">
                  <p className="text-xl font-bold text-white">{CAREGIVER_PROFILE.yearsExperience}</p>
                  <p className="text-stone-500 text-xs mt-0.5">Years</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{CAREGIVER_PROFILE.shiftsCompleted}</p>
                  <p className="text-stone-500 text-xs mt-0.5">Shifts</p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {CAREGIVER_PROFILE.certifications.map((cert, idx) => (
                  <span key={idx} className="bg-[#25D366]/20 text-[#25D366] text-xs font-semibold px-3 py-1.5 rounded-full">{cert}</span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Contact Information</h3>
              <div className="space-y-2">
                <p className="text-stone-300 text-sm">{CAREGIVER_PROFILE.email}</p>
                <p className="text-stone-300 text-sm">{CAREGIVER_PROFILE.phone}</p>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Today&apos;s Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-400 text-sm">Tasks Completed</span>
                  <span className="text-white font-semibold text-sm">{completedTasks.length}/{totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 text-sm">On Shift Since</span>
                  <span className="text-white font-semibold text-sm">8:00 AM</span>
                </div>
              </div>
            </div>
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
            <p className="text-[11px] text-stone-500 font-medium mt-0.5 text-center">BP</p>
          </button>

          <button onClick={() => { setVitalsInitialTab('hr'); setShowVitals(true); }} className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors" data-testid="vital-heart">
            <div className="w-11 h-11 bg-[#5c3d1e] rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Activity className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <p className="text-base font-bold text-white text-center">{latestHR ? latestHR.value : '--'}</p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5 text-center">Heart</p>
          </button>

          <button onClick={() => { setVitalsInitialTab('temp'); setShowVitals(true); }} className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors" data-testid="vital-temp">
            <div className="w-11 h-11 bg-[#1e3a5f] rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Thermometer className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <p className="text-base font-bold text-white text-center">{latestTemp ? `${latestTemp.value}°` : '--'}</p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5 text-center">Temp</p>
          </button>

          <button onClick={() => { setVitalsInitialTab('pain'); setShowVitals(true); }} className="bg-[#1c1c1e] rounded-2xl py-3.5 px-1.5 hover:bg-[#2c2c2e] transition-colors" data-testid="vital-pain">
            <div className="w-11 h-11 bg-[#4a1d6b] rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Frown className="w-5 h-5 text-[#a855f7]" />
            </div>
            <p className="text-base font-bold text-white text-center">{latestPain ? `${latestPain.value}/10` : '--'}</p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5 text-center">Pain</p>
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
          <span className="text-base font-semibold text-stone-400">{completedTasks.length}/{totalTasks}</span>
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
                <span className={`text-base font-medium transition-colors ${activeTaskTab === 'requests' ? 'text-white' : 'text-stone-500'}`}>
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
          <button onClick={() => setActiveTaskTab('timeline')} className={`text-base font-medium transition-colors ${activeTaskTab === 'timeline' || viewingDate ? 'text-white' : 'text-stone-500'}`}>
            Care Timeline
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-4">
        {activeTaskTab === 'requests' && !viewingDate ? (
          <div className="space-y-3">
            <button onClick={() => setShowRequestModal(true)} className="w-full p-4 border-2 border-dashed border-stone-700 text-stone-400 hover:border-[#25D366] hover:text-[#25D366] rounded-2xl flex items-center justify-center gap-2 transition-colors" data-testid="add-request-btn">
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
                        : 'bg-stone-800 text-stone-400'
                      }`}>{request.priority.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400">Pending</span>
                    </div>
                    <span className="text-xs text-stone-600">{request.time}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{request.title}</h3>
                  {request.description && <p className="text-sm text-stone-400">{request.description}</p>}
                </div>
              ))
            ) : (
              <div className="bg-[#1c1c1e] rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-stone-600" />
                </div>
                <h3 className="font-semibold text-white mb-1">No requests yet</h3>
                <p className="text-stone-600 text-sm">Tap the button above to request tasks for the caregiver</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {displayTasks.length > 0 ? (
              <div className="space-y-3">
                {displayTasks.map((task) => (
                  <div key={task.id} className="bg-[#1c1c1e] rounded-3xl overflow-hidden" onClick={() => setSelectedTask(task)}>
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
                      {task.completionNote && <p className="text-stone-400 text-sm mb-3">&quot;{task.completionNote}&quot;</p>}
                      <div className="flex items-center gap-3">
                        <img src={CAREGIVER_PROFILE.photo} alt="Caregiver" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">Julia Martinez</p>
                          <p className="text-stone-600 text-xs">Caregiver</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#1c1c1e] rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-stone-600" />
                </div>
                <h3 className="font-semibold text-white mb-1">No updates yet</h3>
                <p className="text-stone-600 text-sm">Photos and notes will appear here as tasks are completed</p>
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
  const renderMessagesContent = () => {
    if (activeConversation) {
      return (
        <div className="flex-1 flex flex-col bg-black pb-20">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-800">
            <button onClick={() => setActiveConversation(null)} className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            {activeConversation.isGroup ? (
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            ) : (
              <img src={activeConversation.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            )}
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{activeConversation.name}{activeConversation.role ? ` (${activeConversation.role})` : ''}</p>
              {activeConversation.online && <p className="text-[#25D366] text-xs">Online</p>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.sent ? 'bg-[#25D366] text-white' : 'bg-[#1c1c1e] text-white'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.sent ? 'justify-end' : ''}`}>
                    <p className={`text-[10px] ${msg.sent ? 'text-white/70' : 'text-stone-500'}`}>{msg.time}</p>
                    {msg.sent && <CheckCheck className="w-3.5 h-3.5 text-white/70" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-stone-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Type a message..."
              className="flex-1 bg-[#1c1c1e] text-white placeholder-stone-500 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#25D366]"
              style={{ fontSize: '16px' }}
              data-testid="chat-input"
            />
            <button onClick={handleSendChat} className={`w-10 h-10 rounded-full flex items-center justify-center ${chatInput.trim() ? 'bg-[#25D366]' : 'bg-stone-800'}`} data-testid="chat-send">
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto bg-black pb-20">
        <div className="px-5 pt-5 mb-4">
          <h1 className="text-2xl font-bold text-white mb-3">Messages</h1>
          <div className="bg-[#1c1c1e] rounded-xl px-4 py-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-stone-500" />
            <span className="text-stone-500 text-sm">Search conversations...</span>
          </div>
        </div>

        <div className="px-2">
          {FAMILY_CONVERSATIONS.map((conv) => (
            <button key={conv.id} onClick={() => setActiveConversation(conv)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-stone-900 rounded-xl transition-colors" data-testid={`conv-${conv.id}`}>
              <div className="relative">
                {conv.isGroup ? (
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <img src={conv.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                )}
                {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full ring-2 ring-black" />}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white font-semibold text-sm truncate">{conv.name}{conv.role ? ` (${conv.role})` : ''}</p>
                <p className="text-stone-500 text-xs truncate">{conv.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-stone-600 text-xs">{conv.time}</span>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{conv.unread}</span>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ==========================================
  // ALERTS TAB
  // ==========================================
  const renderAlertsContent = () => (
    <div className="flex-1 overflow-y-auto bg-black pb-20">
      <div className="px-5 pt-5 mb-4">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
      </div>

      {/* Upcoming Schedule */}
      <div className="px-5 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Upcoming Schedule</span>
        </div>
      </div>

      <div className="px-5 space-y-2 mb-6">
        {FAMILY_ALERTS.upcoming.map((item) => (
          <div key={item.id} className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{item.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <p className="text-stone-500 text-xs">{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Alerts */}
      <div className="px-5 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-stone-500" />
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Recent Alerts</span>
        </div>
      </div>

      <div className="px-5 space-y-2">
        {FAMILY_ALERTS.recent.map((item) => (
          <div key={item.id} className={`rounded-2xl p-4 ${item.highlight ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-[#1c1c1e]'}`}>
            <p className="text-white font-semibold text-sm">{item.title}</p>
            <p className="text-stone-400 text-xs mt-1">{item.subtitle}</p>
            <p className="text-stone-600 text-xs mt-2">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================
  // MENU TAB
  // ==========================================
  const renderMenuContent = () => (
    <div className="flex-1 overflow-y-auto bg-black p-5 space-y-3 pb-24">
      {/* Family Member Profile */}
      <button className="w-full bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#2c2c2e] transition-colors text-left" data-testid="menu-profile">
        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Mary Smith" className="w-16 h-16 rounded-2xl object-cover" />
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">Mary Smith</h3>
          <p className="text-stone-400 text-sm">Family Guardian</p>
        </div>
        <ChevronRight className="w-5 h-5 text-stone-600" />
      </button>

      {/* Patient Quick Access */}
      <button onClick={() => setShowPatientProfile(true)} className="w-full bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-3 hover:bg-[#2c2c2e] transition-colors" data-testid="menu-patient">
        <img src={patient?.photo || ''} alt={patient?.name} className="w-12 h-12 rounded-xl object-cover" />
        <div className="flex-1 text-left">
          <p className="font-medium text-white">{patient?.name}</p>
          <p className="text-stone-500 text-sm">View Medical Profile</p>
        </div>
        <ChevronRight className="w-5 h-5 text-stone-600" />
      </button>

      {/* Menu Items with colored icons */}
      {[
        { label: 'Care Plan', icon: FileText, color: '#25D366', bgColor: 'bg-[#25D366]/20', action: () => setActivePage('carePlan') },
        { label: 'Weekly Report', icon: TrendingUp, color: '#3b82f6', bgColor: 'bg-blue-500/20', action: () => setActivePage('weeklyReport') },
        { label: 'Current Caregiver', icon: Heart, color: '#ec4899', bgColor: 'bg-pink-500/20', action: () => setActivePage('caregiver') },
        { label: 'Billing', icon: Activity, color: '#f59e0b', bgColor: 'bg-amber-500/20', action: () => setActivePage('billing') },
        { label: 'Settings', icon: Settings, color: '#8b5cf6', bgColor: 'bg-purple-500/20', action: () => setActivePage('settings') },
        { label: 'Support', icon: Bell, color: '#06b6d4', bgColor: 'bg-cyan-500/20', action: () => setActivePage('support') },
      ].map((item, idx) => (
        <button key={idx} onClick={item.action} className="w-full bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#2c2c2e] transition-colors">
          <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center`}>
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
          </div>
          <span className="font-medium text-white flex-1 text-left">{item.label}</span>
          <ChevronRight className="w-5 h-5 text-stone-600" />
        </button>
      ))}

      {/* Sign Out */}
      <button onClick={onSignOut} className="w-full bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-4 hover:bg-rose-500/20 transition-colors mt-2" data-testid="menu-sign-out-btn">
        <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-rose-400" />
        </div>
        <span className="font-medium text-rose-400 flex-1 text-left">Sign Out</span>
      </button>
    </div>
  );

  // ==========================================
  // SETTINGS / BILLING / SUPPORT SUB-PAGES
  // ==========================================
  if (activePage === 'settings') {
    const SettingsPage = require('./pages/SettingsPage').SettingsPage;
    return <SettingsPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'billing') {
    const AccountsPage = require('./pages/AccountsPage').AccountsPage;
    return <AccountsPage onBack={() => setActivePage(null)} role={UserRole.FAMILY} />;
  }
  if (activePage === 'support') {
    const SupportPage = require('./pages/SupportPage').SupportPage;
    return <SupportPage onBack={() => setActivePage(null)} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-['Manrope',sans-serif]">
      {/* Main Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'incident' && <IncidentViewPage patientName={patient?.name} incidents={incidents} />}
      {activeTab === 'chat' && <ChatPage onBack={() => setActiveTab('home')} role={UserRole.FAMILY} />}
      {activeTab === 'notifications' && renderAlertsContent()}
      {activeTab === 'settings' && renderMenuContent()}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1c1c1e] border-t border-[#3a3a3c] z-30">
        <div className="flex justify-around items-center py-2.5">
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
                onClick={() => { setActiveTab(tab.id); setActiveConversation(null); }}
                className="flex flex-col items-center px-3 py-1 transition-all relative"
                data-testid={`nav-${tab.id}`}
              >
                <tab.icon 
                  className={`w-7 h-7 ${isActive ? 'text-[#25D366]' : 'text-[#8e8e93]'}`}
                  fill={isActive ? '#25D366' : 'none'}
                  strokeWidth={isActive ? 0 : 1.8}
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
          <div className="bg-stone-950 border-t border-stone-800 w-full max-w-md rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Request</h2>
              <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-400 mb-2">What do you need?</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Extra blanket, Call me back"
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-800 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                  style={{ fontSize: '16px' }}
                  data-testid="request-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-400 mb-2">Additional details (optional)</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any specific instructions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-stone-900 border border-stone-800 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
                  style={{ fontSize: '16px' }}
                  data-testid="request-description-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-400 mb-2">Priority</label>
                <div className="flex gap-2">
                  {['standard', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewRequest(prev => ({ ...prev, priority }))}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                        newRequest.priority === priority
                          ? priority === 'urgent' ? 'bg-rose-500 text-white' : priority === 'high' ? 'bg-orange-500 text-white' : 'bg-stone-700 text-white'
                          : 'bg-stone-900 border border-stone-800 text-stone-400 hover:bg-stone-800'
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
          <div className="bg-stone-950 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedTask.title}</h2>
                <p className="text-sm text-stone-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4" />
                  Completed at {selectedTask.completedAt}
                </p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="relative">
              <img src={getTaskImage(selectedTask)} alt={selectedTask.title} className="w-full max-h-[50vh] object-contain bg-black" />
            </div>
            <div className="p-5 space-y-4">
              {selectedTask.completionNote && (
                <div className="bg-stone-900 rounded-2xl p-4">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Caregiver Note</p>
                  <p className="text-white text-sm leading-relaxed">&quot;{selectedTask.completionNote}&quot;</p>
                </div>
              )}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
                <img src={CAREGIVER_PROFILE.photo} alt="Caregiver" className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-white">Julia Martinez</p>
                  <p className="text-stone-500 text-sm">Certified Nursing Assistant</p>
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

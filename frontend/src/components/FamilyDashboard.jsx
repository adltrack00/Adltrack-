import React, { useState } from 'react';
import {
  Home, MessageSquare, Bell, User, Heart, Activity, Thermometer,
  ChevronRight, Clock, CheckCircle, Frown, Sparkles, Plus, X,
  AlertTriangle, Star, Mail, AlertCircle, Calendar, Shield,
  TrendingUp, Phone, FileText, ArrowLeft, Settings,
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
import { useTheme } from '../context/ThemeContext';

// ─── Design tokens (repo design system) ─────────────────────────────────────
const INTER = `'Inter','Plus Jakarta Sans',sans-serif`;
const ACCENT = '#3A7BD5'; // family blue accent

const glassCard = (C) => ({
  background: C.CARD,
  border: `1px solid ${C.BORDER}`,
  boxShadow: C.SHADOW,
  borderRadius: 16,
});

const sectionLabel = (C) => ({
  fontSize: 10,
  fontWeight: 700,
  color: C.MUTED,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  fontFamily: INTER,
  marginBottom: 10,
});

export const FamilyDashboard = ({
  onBack,
  onSignOut,
  onRoleSwitch,
  currentRole,
  tasks = [],
  patient,
  vitalsData,
  incidents = [],
  onAddRequest,
}) => {
  const { colors: C } = useTheme();

  const [activeTab, setActiveTab]               = useState('home');
  const [activeTaskTab, setActiveTaskTab]       = useState('timeline');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals]             = useState(false);
  const [vitalsInitialTab, setVitalsInitialTab] = useState('bp');
  const [showCopilot, setShowCopilot]           = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activePage, setActivePage]             = useState(null);
  const [newRequest, setNewRequest]             = useState({ title: '', description: '', priority: 'standard' });
  const [myRequests, setMyRequests]             = useState([]);
  const [selectedTask, setSelectedTask]         = useState(null);
  const [viewingDate, setViewingDate]           = useState(null);
  const [historicalTasks, setHistoricalTasks]   = useState([]);

  const handleTabChange = (tabId) => { window.scrollTo(0, 0); setActiveTab(tabId); };
  const handlePageChange = (page) => { window.scrollTo(0, 0); setActivePage(page); };

  const handleSelectHistoricalDate = (date, tasksForDate) => {
    setViewingDate(date);
    setHistoricalTasks(tasksForDate);
    setActiveTab('home');
  };
  const handleReturnToToday = () => { setViewingDate(null); setHistoricalTasks([]); };

  const latestBP   = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR   = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];
  const latestPain = vitalsData?.pain?.[vitalsData.pain.length - 1];

  const displayTasks    = viewingDate ? historicalTasks : tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const completedTasks  = tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const totalTasks      = tasks.filter(t => t.status !== TaskStatus.PROPOSED).length;

  const handleAddRequest = () => {
    if (!newRequest.title.trim()) return;
    const request = {
      id: Date.now(),
      ...newRequest,
      status: 'pending',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMyRequests(prev => [request, ...prev]);
    setNewRequest({ title: '', description: '', priority: 'standard' });
    setShowRequestModal(false);
  };

  const getTaskImage = (task) => {
    if (task.evidenceUrl) return task.evidenceUrl;
    const t = task.title.toLowerCase();
    if (t.includes('medication') || t.includes('med')) return CARE_IMAGES.medication;
    if (t.includes('breakfast') || t.includes('lunch') || t.includes('dinner') || t.includes('meal')) return CARE_IMAGES.meal;
    if (t.includes('walk') || t.includes('exercise')) return CARE_IMAGES.walk;
    return CARE_IMAGES.vitals;
  };

  // ── Sub-pages ──────────────────────────────────────────────────────────────

  if (activePage === 'profile')
    return <ProfilePage onBack={() => handlePageChange(null)} role={UserRole.FAMILY} />;

  if (activePage === 'settings')
    return <SettingsPage onBack={() => handlePageChange(null)} />;

  if (activePage === 'support')
    return <SupportPage onBack={() => handlePageChange(null)} role="family" />;

  if (activePage === 'carePlan') {
    return (
      <div style={{ minHeight: '100vh', background: C.BG, fontFamily: INTER }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${C.BORDER}`, background: C.CARD }}>
          <button onClick={() => handlePageChange(null)} data-testid="care-plan-back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.MUTED, display: 'flex' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontFamily: INTER, fontSize: '1.4rem', color: C.TEXT, letterSpacing: '-0.01em', margin: 0 }}>Care Plan</h1>
            <p style={{ fontSize: 13, color: C.MUTED, margin: '2px 0 0', fontFamily: INTER }}>For {patient?.name}</p>
          </div>
        </div>

        <div style={{ padding: '20px 20px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Goals */}
          <p style={sectionLabel(C)}>Primary Goals</p>
          <div style={{ ...glassCard(C), padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(CARE_PLAN.goals || []).map((goal, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={20} color={ACCENT} />
                <p style={{ fontSize: 15, color: C.TEXT, margin: 0, fontFamily: INTER }}>{goal}</p>
              </div>
            ))}
          </div>

          {/* Medications */}
          <p style={{ ...sectionLabel(C), marginTop: 8 }}>Medications</p>
          <div style={glassCard(C)}>
            {(CARE_PLAN.medications || []).map((med, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${C.BORDER}` : 'none' }}>
                <div>
                  <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: '0 0 3px' }}>{med.name} ({med.dosage})</p>
                  <p style={{ fontFamily: INTER, fontSize: 12, color: C.MUTED, margin: 0 }}>{med.frequency} · {med.condition}</p>
                </div>
                <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: ACCENT, flexShrink: 0, marginLeft: 12 }}>{med.time}</span>
              </div>
            ))}
          </div>

          {/* Daily Schedule */}
          <p style={{ ...sectionLabel(C), marginTop: 8 }}>Daily Schedule</p>
          <div style={glassCard(C)}>
            {(CARE_PLAN.dailySchedule || []).map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < arr.length - 1 ? `1px solid ${C.BORDER}` : 'none' }}>
                <div>
                  <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: '0 0 3px' }}>{item.activity}</p>
                  <p style={{ fontFamily: INTER, fontSize: 12, color: C.MUTED, margin: 0 }}>{item.priority} · {item.type}</p>
                </div>
                <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: ACCENT, flexShrink: 0, marginLeft: 12 }}>{item.time}</span>
              </div>
            ))}
          </div>

          {/* Dietary Restrictions */}
          <p style={{ ...sectionLabel(C), marginTop: 8, color: C.RED }}>Dietary Restrictions</p>
          <div style={{ ...glassCard(C), padding: 20, display: 'flex', flexDirection: 'column', gap: 12, border: `1px solid ${C.RED}22` }}>
            {(CARE_PLAN.dietaryRestrictions || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertCircle size={18} color={C.RED} />
                <p style={{ fontSize: 15, color: C.RED, margin: 0, fontFamily: INTER }}>{item}</p>
              </div>
            ))}
          </div>

          {/* Emergency Protocol */}
          <p style={{ ...sectionLabel(C), marginTop: 8, color: C.RED }}>Emergency Protocol</p>
          <div style={{ ...glassCard(C), padding: 16, background: `${C.RED}08`, border: `1px solid ${C.RED}22` }}>
            <p style={{ fontSize: 14, color: C.RED, lineHeight: 1.7, margin: 0, fontFamily: INTER }}>{CARE_PLAN.emergencyProtocol}</p>
          </div>
        </div>
      </div>
    );
  }

  if (activePage === 'weeklyReport') {
    return (
      <div style={{ minHeight: '100vh', background: C.BG, fontFamily: INTER }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${C.BORDER}`, background: C.CARD }}>
          <button onClick={() => handlePageChange(null)} data-testid="weekly-report-back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.MUTED, display: 'flex' }}>
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ fontFamily: INTER, fontSize: '1.4rem', color: C.TEXT, letterSpacing: '-0.01em', margin: 0 }}>Weekly Report</h1>
            <p style={{ fontSize: 13, color: C.MUTED, margin: '2px 0 0', fontFamily: INTER }}>Week of Dec 9–15</p>
          </div>
        </div>

        <div style={{ padding: '20px 20px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Compliance ring */}
          <div style={{ ...glassCard(C), padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 112, height: 112, marginBottom: 12 }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke={C.BORDER} strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={ACCENT} strokeWidth="10"
                  strokeDasharray={`${WEEKLY_REPORT.overallCompliance * 3.14} ${314 - WEEKLY_REPORT.overallCompliance * 3.14}`}
                  strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 700, color: C.TEXT }}>{WEEKLY_REPORT.overallCompliance}%</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: C.MUTED, fontFamily: INTER }}>Overall Compliance</p>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { value: `${WEEKLY_REPORT.tasksCompleted}/${WEEKLY_REPORT.totalTasks}`, label: 'Tasks', color: ACCENT },
              { value: `${WEEKLY_REPORT.medsOnTime}%`, label: 'Meds On Time', color: ACCENT },
              { value: WEEKLY_REPORT.incidents, label: 'Incidents', color: C.ORANGE },
              { value: WEEKLY_REPORT.missedTasks, label: 'Missed Tasks', color: C.RED },
            ].map((s, i) => (
              <div key={i} style={{ ...glassCard(C), padding: '16px 12px', textAlign: 'center' }}>
                <p style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 700, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontSize: 12, color: C.MUTED, margin: 0, fontFamily: INTER }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Caregiver notes */}
          <div style={{ ...glassCard(C), padding: 20 }}>
            <p style={sectionLabel(C)}>Caregiver Notes</p>
            <p style={{ fontSize: 14, color: C.TEXT, lineHeight: 1.7, margin: 0, fontFamily: INTER }}>{WEEKLY_REPORT.caregiverNotes}</p>
          </div>

          {/* Performance trend */}
          <div style={{ ...glassCard(C), padding: 20 }}>
            <p style={sectionLabel(C)}>Performance Trend</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, gap: 6 }}>
              {(WEEKLY_REPORT.performanceTrend || []).map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: 64, background: C.BG, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ width: '100%', background: ACCENT, height: `${d.score}%`, borderRadius: 6, opacity: 0.85 }} />
                  </div>
                  <span style={{ fontSize: 10, color: C.MUTED, fontFamily: INTER }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activePage === 'caregiver') {
    const today = new Date();
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const todayStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

    return (
      <div style={{ minHeight: '100vh', background: C.BG, fontFamily: INTER }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${C.BORDER}`, background: C.CARD }}>
          <button onClick={() => handlePageChange(null)} data-testid="caregiver-page-back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.MUTED, display: 'flex' }}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ fontFamily: INTER, fontSize: '1.4rem', color: C.TEXT, letterSpacing: '-0.01em', margin: 0 }}>Current Caregiver</h1>
        </div>

        <div style={{ padding: '0 20px 100px' }}>
          {/* Photo & name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 24px' }}>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <img src={CAREGIVER_PROFILE.photo} alt={CAREGIVER_PROFILE.name}
                style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${ACCENT}` }} />
            </div>
            <h2 style={{ fontFamily: INTER, fontSize: '1.8rem', fontWeight: 700, color: C.TEXT, letterSpacing: '-0.01em', marginBottom: 6 }}>{CAREGIVER_PROFILE.name}</h2>
            <p style={{ color: C.MUTED, fontSize: 15, fontFamily: INTER }}>{CAREGIVER_PROFILE.role}</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { icon: Star,        value: CAREGIVER_PROFILE.rating,           label: 'Rating', color: C.ORANGE },
              { icon: Clock,       value: CAREGIVER_PROFILE.yearsExperience,  label: 'Years',  color: ACCENT  },
              { icon: CheckCircle, value: CAREGIVER_PROFILE.shiftsCompleted,  label: 'Shifts', color: C.GREEN },
            ].map(({ icon: Icon, value, label, color }, i) => (
              <div key={i} style={{ ...glassCard(C), padding: '16px 12px', textAlign: 'center' }}>
                <Icon size={22} color={color} style={{ display: 'block', margin: '0 auto 8px' }} />
                <p style={{ fontFamily: INTER, fontSize: '1.5rem', fontWeight: 700, color: C.TEXT, margin: '0 0 4px' }}>{value}</p>
                <p style={{ fontSize: 12, color: C.MUTED, margin: 0, fontFamily: INTER }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div style={{ ...glassCard(C), padding: 20, marginBottom: 12 }}>
            <p style={{ ...sectionLabel(C), marginBottom: 14 }}>Certifications</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(CAREGIVER_PROFILE.certifications || []).map((cert, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: `${ACCENT}18`, border: `1px solid ${ACCENT}35`, color: ACCENT, borderRadius: 999, fontSize: 13, fontWeight: 700, fontFamily: INTER }}>
                  <Shield size={13} /> {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{ ...glassCard(C), padding: 20, marginBottom: 12 }}>
            <p style={{ ...sectionLabel(C), marginBottom: 14 }}>Contact Information</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={18} color={C.MUTED} />
                <span style={{ fontSize: 15, color: C.TEXT, fontFamily: INTER }}>{CAREGIVER_PROFILE.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Phone size={18} color={C.MUTED} />
                <span style={{ fontSize: 15, color: C.TEXT, fontFamily: INTER }}>{CAREGIVER_PROFILE.phone}</span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div style={{ ...glassCard(C), padding: 20, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontFamily: INTER, fontSize: '1.05rem', fontWeight: 700, color: C.TEXT, margin: 0 }}>Performance</p>
              <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT, background: `${ACCENT}14`, borderRadius: 999, padding: '4px 12px', fontFamily: INTER }}>96%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
              {[
                { value: '94%', label: 'Tasks\nCompleted' },
                { value: '98%', label: 'On-Time\nRate' },
                { value: '4.8', label: 'Family\nRating' },
              ].map((s, i) => (
                <div key={i} style={{ borderRight: i < 2 ? `1px solid ${C.BORDER}` : 'none' }}>
                  <p style={{ fontFamily: INTER, fontSize: '1.5rem', fontWeight: 700, color: C.TEXT, margin: '0 0 4px' }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: C.MUTED, margin: 0, whiteSpace: 'pre-line', fontFamily: INTER }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Today's summary */}
          <div style={{ ...glassCard(C), padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontFamily: INTER, fontSize: '1.05rem', fontWeight: 700, color: C.TEXT, margin: 0 }}>Today's Summary</p>
              <span style={{ fontSize: 12, color: C.MUTED, fontFamily: INTER }}>{todayStr}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { value: `${completedTasks.length}/${totalTasks}`, label: 'Tasks Done' },
                { value: '0/4', label: 'Meds Given' },
                { value: '--:--', label: 'Arrived At' },
                { value: '0', label: 'Incidents' },
              ].map((s, i) => (
                <div key={i} style={{ background: C.BG, border: `1px solid ${C.BORDER}`, borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                  <p style={{ fontFamily: INTER, fontSize: '1.5rem', fontWeight: 700, color: C.TEXT, margin: '0 0 4px' }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: C.MUTED, margin: 0, fontFamily: INTER }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Message button */}
          <button
            onClick={() => { handlePageChange(null); handleTabChange('chat'); }}
            data-testid="message-caregiver-btn"
            style={{ width: '100%', padding: '16px', background: ACCENT, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 14px ${ACCENT}44` }}
          >
            <MessageSquare size={18} /> Message Caregiver
          </button>
        </div>
      </div>
    );
  }

  // ── Home tab ───────────────────────────────────────────────────────────────
  const renderHomeContent = () => (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 120, background: C.BG }}>
      {/* Patient hero card */}
      <div style={{ padding: '16px 16px 0' }}>
        <button
          onClick={() => setShowPatientProfile(true)}
          style={{ position: 'relative', width: '100%', height: 192, borderRadius: 24, overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0 }}
          data-testid="patient-hero-card"
        >
          <img
            src={patient?.photo || 'https://via.placeholder.com/400'}
            alt={patient?.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: INTER, fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 2px' }}>{patient?.name || 'Patient'}</h2>
              <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{patient?.age} years old</p>
            </div>
            <ChevronRight size={22} color="rgba(255,255,255,0.6)" />
          </div>
        </button>
      </div>

      {/* Vitals grid */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { tab: 'bp',   label: 'BP',    value: latestBP   ? `${latestBP.systolic}/${latestBP.diastolic}` : '--', iconColor: '#ec4899', iconBg: 'rgba(236,72,153,0.10)', icon: Heart,       fill: true,  testId: 'vital-bp'    },
            { tab: 'hr',   label: 'Heart', value: latestHR   ? latestHR.value : '--',                                iconColor: '#f97316', iconBg: 'rgba(249,115,22,0.10)',  icon: Activity,    fill: false, testId: 'vital-heart' },
            { tab: 'temp', label: 'Temp',  value: latestTemp ? `${latestTemp.value}°` : '--',                        iconColor: '#60a5fa', iconBg: 'rgba(96,165,250,0.10)',   icon: Thermometer, fill: false, testId: 'vital-temp'  },
            { tab: 'pain', label: 'Pain',  value: latestPain ? `${latestPain.value}/10` : '--',                      iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.10)', icon: Frown,       fill: false, testId: 'vital-pain'  },
          ].map(({ tab, label, value, icon: Icon, fill, iconColor, iconBg, testId }) => (
            <button
              key={tab}
              onClick={() => { setVitalsInitialTab(tab); setShowVitals(true); }}
              data-testid={testId}
              style={{ ...glassCard(C), padding: '12px 4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${C.BORDER}`, cursor: 'pointer' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Icon size={20} color={iconColor} fill={fill ? iconColor : 'none'} />
              </div>
              <p style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: C.TEXT, margin: '0 0 3px', textAlign: 'center' }}>{value}</p>
              <p style={{ fontFamily: INTER, fontSize: 10, color: C.MUTED, margin: 0, textAlign: 'center' }}>{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '16px 16px 0' }}>
        {viewingDate && (
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: `${C.ORANGE}08`, border: `1px solid ${C.ORANGE}22`, borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: `${C.ORANGE}14`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color={C.ORANGE} />
              </div>
              <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: C.ORANGE, textTransform: 'uppercase', letterSpacing: '0.14em', margin: 0 }}>Viewing History</p>
            </div>
            <button onClick={handleReturnToToday}
              style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: C.ORANGE, background: `${C.ORANGE}14`, border: `1px solid ${C.ORANGE}22`, borderRadius: 999, padding: '5px 14px', cursor: 'pointer' }}>
              Today
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 600, color: C.TEXT }}>Today's Progress</span>
          <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: ACCENT }}>
            {completedTasks.length}<span style={{ color: C.MUTED, fontWeight: 400 }}>/{totalTasks}</span>
          </span>
        </div>
        <div style={{ height: 4, background: C.BORDER, borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: ACCENT, borderRadius: 999, width: totalTasks > 0 ? `${(completedTasks.length / totalTasks) * 100}%` : '0%', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Task tab switcher */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.CARD2, borderRadius: 12, padding: 4 }}>
          {!viewingDate && (
            <button
              onClick={() => setActiveTaskTab('requests')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, fontFamily: INTER, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeTaskTab === 'requests' ? C.CARD : 'transparent', color: activeTaskTab === 'requests' ? C.TEXT : C.MUTED, boxShadow: activeTaskTab === 'requests' ? C.SHADOW : 'none', position: 'relative', transition: 'all 200ms' }}
            >
              My Requests
              {myRequests.length > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 8, background: C.RED, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{myRequests.length}</span>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTaskTab('timeline')}
            style={{ flex: 1, padding: '8px 0', borderRadius: 10, fontFamily: INTER, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: activeTaskTab === 'timeline' || viewingDate ? C.CARD : 'transparent', color: activeTaskTab === 'timeline' || viewingDate ? C.TEXT : C.MUTED, boxShadow: activeTaskTab === 'timeline' || viewingDate ? C.SHADOW : 'none', transition: 'all 200ms' }}
          >
            Care Timeline
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '12px 16px 0' }}>
        {activeTaskTab === 'requests' && !viewingDate ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => setShowRequestModal(true)}
              data-testid="add-request-btn"
              style={{ width: '100%', padding: '16px', border: `2px dashed ${C.BORDER}`, borderRadius: 14, background: 'none', fontFamily: INTER, fontSize: 14, fontWeight: 600, color: C.MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Plus size={18} /> Add New Request
            </button>

            {myRequests.length > 0 ? myRequests.map((req) => (
              <div key={req.id} style={{ ...glassCard(C), padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: req.priority === 'urgent' ? `${C.RED}18` : req.priority === 'high' ? `${C.ORANGE}18` : C.CARD2, color: req.priority === 'urgent' ? C.RED : req.priority === 'high' ? C.ORANGE : C.MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{req.priority}</span>
                    <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${C.ORANGE}18`, color: C.ORANGE }}>Pending</span>
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: 12, color: C.MUTED }}>{req.time}</span>
                </div>
                <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: '0 0 4px' }}>{req.title}</p>
                {req.description && <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0 }}>{req.description}</p>}
              </div>
            )) : (
              <div style={{ ...glassCard(C), padding: 40, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: C.BG, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Sparkles size={28} color={C.MUTED} />
                </div>
                <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 16, color: C.TEXT, margin: '0 0 6px' }}>No requests yet</p>
                <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0 }}>Tap the button above to request tasks for the caregiver</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {displayTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayTasks.map((task) => (
                  <div key={task.id} style={{ ...glassCard(C), overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                    <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                      <img src={getTaskImage(task)} alt={task.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                        <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 17, color: '#FFFFFF', margin: '0 0 4px' }}>{task.title}</p>
                        <p style={{ fontFamily: INTER, fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> Completed at {task.completedAt}
                        </p>
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      {task.completionNote && <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: '0 0 12px' }}>"{task.completionNote}"</p>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={CAREGIVER_PROFILE.photo} alt="Caregiver" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 14, color: C.TEXT, margin: '0 0 2px' }}>Julia Martinez</p>
                          <p style={{ fontFamily: INTER, fontSize: 12, color: C.MUTED, margin: 0 }}>Caregiver</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle size={14} color={C.GREEN} />
                          <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: C.GREEN }}>Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...glassCard(C), padding: 48, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: C.BG, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Clock size={32} color={C.MUTED} />
                </div>
                <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 18, color: C.TEXT, margin: '0 0 8px' }}>No care updates yet</p>
                <p style={{ fontFamily: INTER, fontSize: 14, color: C.MUTED, margin: 0, lineHeight: 1.6 }}>Tasks completed by caregivers will appear here with photos and notes</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ── Notifications tab ──────────────────────────────────────────────────────
  const renderNotificationsContent = () => (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 120, background: C.BG }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <h1 style={{ fontFamily: INTER, fontSize: '1.7rem', fontWeight: 700, color: C.TEXT, letterSpacing: '-0.01em', margin: 0 }}>Notifications</h1>
      </div>

      {/* Upcoming schedule */}
      <div style={{ padding: '0 20px' }}>
        <p style={sectionLabel(C)}>Upcoming Schedule</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(FAMILY_ALERTS.upcoming || []).map((item) => (
            <div key={item.id} style={{ ...glassCard(C), padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${ACCENT}14`, border: `1px solid ${ACCENT}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={22} color={ACCENT} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: '0 0 4px' }}>{item.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} color={C.MUTED} />
                  <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0 }}>{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent alerts */}
      <div style={{ padding: '16px 20px 0' }}>
        <p style={sectionLabel(C)}>Recent Alerts</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(FAMILY_ALERTS.recent || []).map((item) => (
            <div key={item.id} style={{ ...glassCard(C), padding: 20, background: item.highlight ? `${C.ORANGE}06` : C.CARD, border: item.highlight ? `1px solid ${C.ORANGE}20` : `1px solid ${C.BORDER}` }}>
              <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: '0 0 4px' }}>{item.title}</p>
              <p style={{ fontFamily: INTER, fontSize: 13, color: C.TEXT, margin: '0 0 6px' }}>{item.subtitle}</p>
              <p style={{ fontFamily: INTER, fontSize: 12, color: C.MUTED, margin: 0 }}>{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Menu tab ───────────────────────────────────────────────────────────────
  const renderMenuContent = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px', background: C.BG, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Family profile card */}
      <button
        onClick={() => handlePageChange('profile')}
        data-testid="menu-profile"
        style={{ width: '100%', ...glassCard(C), padding: 16, display: 'flex', alignItems: 'center', gap: 14, border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" alt="Mary Smith"
          style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', border: `2px solid ${ACCENT}` }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: INTER, fontWeight: 700, fontSize: 18, color: C.TEXT, margin: '0 0 4px' }}>Mary Smith</h3>
          <p style={{ fontFamily: INTER, fontSize: 14, color: C.MUTED, margin: 0 }}>Family Guardian</p>
        </div>
        <ChevronRight size={20} color={C.MUTED} />
      </button>

      {/* Patient card */}
      <button
        onClick={() => setShowPatientProfile(true)}
        data-testid="menu-patient"
        style={{ width: '100%', ...glassCard(C), padding: 16, display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${C.BORDER}`, cursor: 'pointer', textAlign: 'left' }}
      >
        <img src={patient?.photo || ''} alt={patient?.name}
          style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover' }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 16, color: C.TEXT, margin: '0 0 4px' }}>{patient?.name}</p>
          <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0 }}>View Medical Profile</p>
        </div>
        <ChevronRight size={20} color={C.MUTED} />
      </button>

      {/* Section: Care */}
      <p style={{ ...sectionLabel(C), marginTop: 8 }}>Care</p>
      <div style={{ ...glassCard(C), overflow: 'hidden' }}>
        {[
          { label: 'Care Plan',         icon: FileText,   color: ACCENT,     action: () => handlePageChange('carePlan'),     testId: 'menu-care-plan'    },
          { label: 'Weekly Report',     icon: TrendingUp, color: C.GREEN,    action: () => handlePageChange('weeklyReport'), testId: 'menu-weekly-report' },
          { label: 'Current Caregiver', icon: Heart,      color: '#ec4899',  action: () => handlePageChange('caregiver'),   testId: 'menu-caregiver'    },
        ].map((item, i, arr) => (
          <button key={i} onClick={item.action} data-testid={item.testId}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < arr.length - 1 ? `1px solid ${C.BORDER}` : 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${item.color}14`, border: `1px solid ${item.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={18} color={item.color} />
            </div>
            <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 500, color: C.TEXT, flex: 1, textAlign: 'left' }}>{item.label}</span>
            <ChevronRight size={18} color={C.MUTED} />
          </button>
        ))}
      </div>

      {/* Section: Account */}
      <p style={{ ...sectionLabel(C), marginTop: 8 }}>Account</p>
      <div style={{ ...glassCard(C), overflow: 'hidden' }}>
        {[
          { label: 'Settings',     icon: Settings, color: C.MUTED, action: () => handlePageChange('settings'), testId: 'menu-settings' },
          { label: 'Help & Support', icon: Bell,   color: C.MUTED, action: () => handlePageChange('support'),  testId: 'menu-support'  },
        ].map((item, i, arr) => (
          <button key={i} onClick={item.action} data-testid={item.testId}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < arr.length - 1 ? `1px solid ${C.BORDER}` : 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.CARD2, border: `1px solid ${C.BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={18} color={item.color} />
            </div>
            <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 500, color: C.TEXT, flex: 1, textAlign: 'left' }}>{item.label}</span>
            <ChevronRight size={18} color={C.MUTED} />
          </button>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        data-testid="menu-sign-out-btn"
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: `${C.RED}06`, border: `1px solid ${C.RED}18`, borderRadius: 16, cursor: 'pointer', marginTop: 4 }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.RED}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={18} color={C.RED} />
        </div>
        <span style={{ fontFamily: INTER, fontSize: 15, fontWeight: 500, color: C.RED, flex: 1, textAlign: 'left' }}>Sign Out</span>
      </button>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.BG, fontFamily: INTER }}>
      {/* Tab content */}
      {activeTab === 'home'          && renderHomeContent()}
      {activeTab === 'incident'      && <IncidentViewPage patientName={patient?.name} incidents={incidents} />}
      {activeTab === 'chat'          && <ChatPage onBack={() => handleTabChange('home')} role={UserRole.FAMILY} />}
      {activeTab === 'notifications' && renderNotificationsContent()}
      {activeTab === 'menu'          && renderMenuContent()}

      {/* Floating AI Copilot button */}
      {activeTab === 'home' && (
        <div style={{ position: 'fixed', bottom: 100, right: 18, zIndex: 40 }}>
          <button
            onClick={() => setShowCopilot(true)}
            data-testid="copilot-btn"
            style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid ${ACCENT}35`, boxShadow: `0 0 0 1px ${ACCENT}12, 0 8px 32px ${ACCENT}28, 0 2px 8px rgba(0,0,0,0.10)`, cursor: 'pointer', padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CareAssistantIcon size={60} />
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: 12, left: 16, right: 16, zIndex: 30, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: `1px solid ${C.BORDER}`, borderRadius: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 8px' }}>
          {[
            { id: 'home',          icon: Home,          label: 'Home'    },
            { id: 'incident',      icon: AlertTriangle,  label: 'Alerts',  badge: incidents.length > 0 ? incidents.length : null },
            { id: 'chat',          icon: MessageSquare,  label: 'Message' },
            { id: 'notifications', icon: Bell,           label: 'Updates' },
            { id: 'menu',          icon: User,           label: 'Menu'    },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                data-testid={`nav-${tab.id}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 12px', minWidth: 52, background: isActive ? `${ACCENT}14` : 'transparent', borderRadius: 16, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 200ms' }}
              >
                <tab.icon size={24} color={isActive ? ACCENT : C.MUTED} strokeWidth={isActive ? 2 : 1.5} />
                <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, marginTop: 4, color: isActive ? ACCENT : C.MUTED }}>{tab.label}</span>
                {tab.badge && (
                  <div style={{ position: 'absolute', top: 4, right: 6, background: C.RED, minWidth: 16, height: 16, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    <span style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 700 }}>{tab.badge}</span>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: C.BG, display: 'flex', flexDirection: 'column', fontFamily: INTER }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${C.BORDER}`, background: C.CARD }}>
            <button onClick={() => setShowRequestModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.MUTED, display: 'flex' }}>
              <X size={22} />
            </button>
            <h2 style={{ fontFamily: INTER, fontSize: '1.4rem', fontWeight: 700, color: C.TEXT, margin: 0 }}>New Request</h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={sectionLabel(C)}>What do you need?</p>
              <input
                type="text"
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Extra blanket, Call me back"
                data-testid="request-title-input"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `1px solid ${C.BORDER}`, background: C.CARD, fontFamily: INTER, fontSize: 16, color: C.TEXT, outline: 'none', boxSizing: 'border-box', boxShadow: C.SHADOW }}
              />
            </div>
            <div>
              <p style={sectionLabel(C)}>Additional details (optional)</p>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Any specific instructions..."
                rows={3}
                data-testid="request-description-input"
                style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `1px solid ${C.BORDER}`, background: C.CARD, fontFamily: INTER, fontSize: 16, color: C.TEXT, outline: 'none', resize: 'none', boxSizing: 'border-box', boxShadow: C.SHADOW }}
              />
            </div>
            <div>
              <p style={sectionLabel(C)}>Priority</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['standard', 'high', 'urgent'].map((priority) => {
                  const isSelected = newRequest.priority === priority;
                  const bg = isSelected ? (priority === 'urgent' ? C.RED : priority === 'high' ? C.ORANGE : ACCENT) : C.CARD;
                  return (
                    <button
                      key={priority}
                      onClick={() => setNewRequest(prev => ({ ...prev, priority }))}
                      style={{ flex: 1, padding: '12px 0', borderRadius: 12, fontFamily: INTER, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1px solid ${isSelected ? 'transparent' : C.BORDER}`, background: bg, color: isSelected ? '#FFFFFF' : C.TEXT, transition: 'all 200ms' }}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleAddRequest}
              disabled={!newRequest.title.trim()}
              data-testid="submit-request-btn"
              style={{ width: '100%', padding: '16px', background: newRequest.title.trim() ? ACCENT : C.BORDER, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: '#FFFFFF', cursor: newRequest.title.trim() ? 'pointer' : 'not-allowed', boxShadow: newRequest.title.trim() ? `0 4px 14px ${ACCENT}44` : 'none', transition: 'all 200ms' }}
            >
              Send Request
            </button>
          </div>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedTask && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{ ...glassCard(C), maxWidth: 640, width: '100%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.BORDER}` }}>
              <div>
                <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 17, color: C.TEXT, margin: '0 0 3px' }}>{selectedTask.title}</p>
                <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> Completed at {selectedTask.completedAt}
                </p>
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ width: 36, height: 36, borderRadius: '50%', background: C.BG, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color={C.MUTED} />
              </button>
            </div>
            <img src={getTaskImage(selectedTask)} alt={selectedTask.title} style={{ width: '100%', maxHeight: '50vh', objectFit: 'contain', background: C.BG, display: 'block' }} />
            <div style={{ padding: 20 }}>
              {selectedTask.completionNote && (
                <div style={{ background: C.BG, borderRadius: 12, padding: 14, marginBottom: 16 }}>
                  <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: C.MUTED, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 6px' }}>Caregiver Note</p>
                  <p style={{ fontFamily: INTER, fontSize: 14, color: C.TEXT, lineHeight: 1.6, margin: 0 }}>"{selectedTask.completionNote}"</p>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: `1px solid ${C.BORDER}` }}>
                <img src={CAREGIVER_PROFILE.photo} alt="Caregiver" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: '0 0 2px' }}>Julia Martinez</p>
                  <p style={{ fontFamily: INTER, fontSize: 12, color: C.MUTED, margin: 0 }}>Certified Nursing Assistant</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={16} color={C.GREEN} />
                  <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: C.GREEN }}>Verified</span>
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

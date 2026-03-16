import React, { useState } from 'react';
import { 
  Home, MessageSquare, Bell, Menu, Bot, Heart, Thermometer, Activity,
  ChevronRight, User, Clock, CheckCircle, Camera, Frown, Sparkles, Plus, X, 
  AlertTriangle, Star, Shield, Phone, Mail, ArrowLeft, Calendar, ChevronDown
} from 'lucide-react';
import { TaskStatus } from '../types';
import { CAREGIVER_PROFILE, CARE_IMAGES } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

// ============================================
// COLORS - Exact match from mobile app
// ============================================
const COLORS = {
  background: '#000000',
  card: '#1c1c1e',
  cardBorder: '#3a3a3c',
  primary: '#25D366',
  white: '#ffffff',
  textPrimary: '#ffffff',
  textSecondary: '#8e8e93',
  textMuted: '#636366',
  critical: '#ef4444',
  standard: '#3b82f6',
  low: '#22c55e',
  completed: '#f59e0b',
  vitalBP: '#be185d',
  vitalBPBg: 'rgba(190, 24, 93, 0.25)',
  vitalHeart: '#ea580c',
  vitalHeartBg: 'rgba(234, 88, 12, 0.25)',
  vitalTemp: '#3b82f6',
  vitalTempBg: 'rgba(59, 130, 246, 0.25)',
  vitalPain: '#a855f7',
  vitalPainBg: 'rgba(168, 85, 247, 0.25)',
};

// ============================================
// MOCK DATA
// ============================================
const PATIENT = {
  name: 'David Smith',
  age: 78,
  photo: 'https://customer-assets.emergentagent.com/job_adlcare-expo/artifacts/0kd0031g_IMG_9932.jpeg',
};

const FAMILY_MEMBER = {
  name: 'Mary Smith',
  relation: 'Daughter',
  email: 'mary.smith@email.com',
};

const CAREGIVER = {
  name: 'Julia Martinez',
  role: 'Certified Nursing Assistant',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia',
  rating: '4.9',
  years: '5',
  shifts: '234',
  certifications: ['CNA', 'CPR/First Aid', 'Dementia Care'],
  email: 'julia.martinez@adltrack.com',
  phone: '(555) 123-4567',
};

const COMPLETED_TASKS = [
  { id: 1, title: 'Morning Medication', time: '8:00 AM', category: 'Medication', icon: '💊', completedAt: '8:05 AM', hasPhoto: true, photo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
  { id: 2, title: 'Breakfast Assistance', time: '8:30 AM', category: 'Nutrition', icon: '🍳', completedAt: '8:45 AM', hasPhoto: true, photo: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400' },
  { id: 3, title: 'Morning Hygiene', time: '9:00 AM', category: 'Personal Care', icon: '🚿', completedAt: '9:20 AM', hasPhoto: false },
];

const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: '🚨', color: '#ef4444' },
  { id: 'injury', label: 'Injury', icon: '🩹', color: '#f59e0b' },
  { id: 'behavior', label: 'Behavioral', icon: '😤', color: '#8b5cf6' },
  { id: 'medical', label: 'Medical', icon: '🏥', color: '#3b82f6' },
  { id: 'medication', label: 'Medication Error', icon: '💊', color: '#ec4899' },
  { id: 'other', label: 'Other', icon: '📝', color: '#6b7280' },
];

// ============================================
// NEW REQUEST MODAL
// ============================================
const NewRequestModal = ({ visible, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('standard');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('standard');
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-t-3xl p-6" style={{ backgroundColor: COLORS.card, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: COLORS.white }}>New Request</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ backgroundColor: COLORS.cardBorder }}>
            <X size={20} color={COLORS.white} />
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.textSecondary }}>REQUEST TITLE</label>
          <input
            type="text"
            className="w-full p-4 rounded-xl"
            style={{ backgroundColor: COLORS.cardBorder, color: COLORS.white, border: 'none' }}
            placeholder="What do you need?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.textSecondary }}>DESCRIPTION</label>
          <textarea
            className="w-full p-4 rounded-xl"
            style={{ backgroundColor: COLORS.cardBorder, color: COLORS.white, border: 'none', resize: 'none' }}
            placeholder="Provide more details..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Priority Selection */}
        <div className="mb-6">
          <label className="text-sm font-semibold mb-2 block" style={{ color: COLORS.textSecondary }}>PRIORITY</label>
          <div className="flex gap-2">
            {[
              { value: 'low', label: 'Low', color: COLORS.low },
              { value: 'standard', label: 'Standard', color: COLORS.standard },
              { value: 'critical', label: 'Critical', color: COLORS.critical },
            ].map((p) => (
              <button
                key={p.value}
                className="flex-1 py-3 rounded-xl font-semibold transition-all"
                style={{
                  backgroundColor: priority === p.value ? `${p.color}30` : COLORS.cardBorder,
                  color: priority === p.value ? p.color : COLORS.white,
                  borderWidth: priority === p.value ? 2 : 0,
                  borderColor: p.color,
                }}
                onClick={() => setPriority(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-4 rounded-2xl font-semibold"
          style={{ backgroundColor: title.trim() ? COLORS.primary : COLORS.cardBorder, color: COLORS.white }}
          onClick={handleSubmit}
          disabled={!title.trim()}
        >
          Submit Request
        </button>
      </div>
    </div>
  );
};

// ============================================
// CURRENT CAREGIVER SCREEN
// ============================================
const CurrentCaregiverScreen = ({ onBack, performanceMetrics, dailySummary }) => {
  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b" style={{ borderColor: COLORS.cardBorder }}>
        <button className="p-2 rounded-full" style={{ backgroundColor: COLORS.cardBorder }} onClick={onBack}>
          <ArrowLeft size={24} color={COLORS.white} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: COLORS.white }}>Current Caregiver</h1>
      </div>

      <div className="p-4">
        {/* Caregiver Profile Header */}
        <div className="text-center mb-6">
          <img
            src={CAREGIVER.avatar}
            alt={CAREGIVER.name}
            className="w-28 h-28 rounded-full mx-auto mb-4 border-4"
            style={{ borderColor: COLORS.primary }}
          />
          <h2 className="text-2xl font-bold" style={{ color: COLORS.white }}>{CAREGIVER.name}</h2>
          <p style={{ color: COLORS.textSecondary }}>{CAREGIVER.role}</p>

          {/* Stats Row */}
          <div className="flex justify-center gap-8 mt-5">
            <div className="text-center">
              <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Star size={18} color="#f59e0b" />
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{CAREGIVER.rating}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Rating</p>
            </div>
            <div className="text-center">
              <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Clock size={18} color={COLORS.primary} />
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{CAREGIVER.years}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Years</p>
            </div>
            <div className="text-center">
              <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Calendar size={18} color="#3b82f6" />
              </div>
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{CAREGIVER.shifts}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Shifts</p>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="p-5 rounded-3xl mb-4" style={{ backgroundColor: COLORS.card }}>
          <h3 className="font-semibold mb-3" style={{ color: COLORS.white }}>Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {CAREGIVER.certifications.map((cert, idx) => (
              <span key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)' }}>
                <Shield size={14} color={COLORS.primary} />
                <span className="text-sm font-medium" style={{ color: COLORS.primary }}>{cert}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-5 rounded-3xl mb-4" style={{ backgroundColor: COLORS.card }}>
          <h3 className="font-semibold mb-3" style={{ color: COLORS.white }}>Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={20} color={COLORS.textSecondary} />
              <span style={{ color: COLORS.white }}>{CAREGIVER.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} color={COLORS.textSecondary} />
              <span style={{ color: COLORS.white }}>{CAREGIVER.phone}</span>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="p-5 rounded-3xl mb-4" style={{ backgroundColor: COLORS.card }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: COLORS.white }}>Caregiver Performance</h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)' }}>
              <Star size={16} color={COLORS.primary} />
              <span className="font-bold" style={{ color: COLORS.primary }}>{performanceMetrics?.monthlyScore || 96}%</span>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: COLORS.white }}>{performanceMetrics?.taskCompletionRate || 94}%</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Tasks{'\n'}Completed</p>
            </div>
            <div className="h-12 w-px" style={{ backgroundColor: COLORS.cardBorder }} />
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: COLORS.white }}>{performanceMetrics?.onTimeRate || 98}%</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>On-Time{'\n'}Rate</p>
            </div>
            <div className="h-12 w-px" style={{ backgroundColor: COLORS.cardBorder }} />
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: COLORS.white }}>{performanceMetrics?.familyRating || 4.8}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Family{'\n'}Rating</p>
            </div>
          </div>
        </div>

        {/* Today's Summary Card */}
        <div className="p-5 rounded-3xl mb-4" style={{ backgroundColor: COLORS.card }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: COLORS.white }}>Today's Summary</h3>
            <span className="text-sm" style={{ color: COLORS.textSecondary }}>{dailySummary?.date || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: COLORS.cardBorder }}>
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{dailySummary?.tasksCompleted || 3}/{dailySummary?.totalTasks || 12}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Tasks Done</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: COLORS.cardBorder }}>
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{dailySummary?.medicationsGiven || 2}/{dailySummary?.totalMedications || 4}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Meds Given</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: COLORS.cardBorder }}>
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{dailySummary?.caregiverArrival || '7:58 AM'}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Arrived At</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: COLORS.cardBorder }}>
              <p className="text-xl font-bold" style={{ color: COLORS.white }}>{dailySummary?.incidentsReported || 0}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>Incidents</p>
            </div>
          </div>
        </div>

        {/* Message Caregiver Button */}
        <button className="w-full py-4 rounded-2xl flex items-center justify-center gap-3" style={{ backgroundColor: COLORS.primary }}>
          <MessageSquare size={20} color={COLORS.white} />
          <span className="font-semibold" style={{ color: COLORS.white }}>Message Caregiver</span>
        </button>
      </div>
    </div>
  );
};

// ============================================
// MENU SCREEN
// ============================================
const FamilyMenuScreen = ({ onSignOut, showCurrentCaregiver, setShowCurrentCaregiver, performanceMetrics, dailySummary }) => {
  if (showCurrentCaregiver) {
    return (
      <CurrentCaregiverScreen 
        onBack={() => setShowCurrentCaregiver(false)}
        performanceMetrics={performanceMetrics}
        dailySummary={dailySummary}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      {/* Profile Header */}
      <div className="text-center py-6 px-4">
        <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center border-4" style={{ backgroundColor: COLORS.cardBorder, borderColor: COLORS.primary }}>
          <User size={48} color={COLORS.textSecondary} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: COLORS.white }}>{FAMILY_MEMBER.name}</h2>
        <p style={{ color: COLORS.textSecondary }}>{FAMILY_MEMBER.relation} of {PATIENT.name}</p>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        {/* Current Caregiver - Special Item */}
        <button 
          className="w-full p-4 rounded-2xl flex items-center gap-4"
          style={{ backgroundColor: COLORS.card }}
          onClick={() => setShowCurrentCaregiver(true)}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Heart size={24} color={COLORS.critical} />
          </div>
          <span className="flex-1 text-left font-medium" style={{ color: COLORS.white }}>Current Caregiver</span>
          <ChevronRight size={22} color={COLORS.textSecondary} />
        </button>

        {/* Other Menu Items */}
        {[
          { icon: <User size={24} />, label: 'Patient Profile', color: COLORS.primary },
          { icon: <Bell size={24} />, label: 'Notifications', color: '#f59e0b' },
          { icon: <Shield size={24} />, label: 'Privacy & Security', color: '#3b82f6' },
          { icon: <MessageSquare size={24} />, label: 'Help & Support', color: '#8b5cf6' },
        ].map((item, idx) => (
          <button 
            key={idx}
            className="w-full p-4 rounded-2xl flex items-center gap-4"
            style={{ backgroundColor: COLORS.card }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
              {React.cloneElement(item.icon, { color: item.color })}
            </div>
            <span className="flex-1 text-left font-medium" style={{ color: COLORS.white }}>{item.label}</span>
            <ChevronRight size={22} color={COLORS.textSecondary} />
          </button>
        ))}

        {/* Sign Out */}
        <button 
          className="w-full p-4 rounded-2xl flex items-center gap-4 mt-6"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          onClick={onSignOut}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
            <ArrowLeft size={24} color={COLORS.critical} />
          </div>
          <span className="flex-1 text-left font-medium" style={{ color: COLORS.critical }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN FAMILY DASHBOARD COMPONENT
// ============================================
export const FamilyDashboard = ({ 
  onBack, 
  onSignOut,
  onRoleSwitch,
  currentRole,
  tasks: propTasks = [],
  patient: propPatient,
  vitalsData: propVitalsData,
  incidents: propIncidents = [],
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaskTab, setActiveTaskTab] = useState('timeline');
  const [completedTasks, setCompletedTasks] = useState(COMPLETED_TASKS);
  const [sharedIncidents, setSharedIncidents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCurrentCaregiver, setShowCurrentCaregiver] = useState(false);
  const [vitals] = useState({ bp: { systolic: 120, diastolic: 76 }, heart: 72, temp: 98.6, pain: 1 });
  
  // Performance metrics for caregiver profile
  const performanceMetrics = { monthlyScore: 96, taskCompletionRate: 94, onTimeRate: 98, familyRating: 4.8 };
  const dailySummary = { 
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    tasksCompleted: completedTasks.length, 
    totalTasks: 12, 
    medicationsGiven: 2, 
    totalMedications: 4, 
    caregiverArrival: '7:58 AM', 
    incidentsReported: sharedIncidents.length 
  };

  const totalTasks = 12;
  const progressPercent = (completedTasks.length / totalTasks) * 100;

  const handleAddRequest = (request) => {
    const newRequest = {
      ...request,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMyRequests(prev => [newRequest, ...prev]);
  };

  // Render Home Screen
  const renderHomeScreen = () => (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Hello</p>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.white }}>{FAMILY_MEMBER.name}</h1>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.cardBorder }}>
          <Bell size={20} color={COLORS.white} />
        </button>
      </div>

      <div className="px-4">
        {/* Vitals Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-2xl text-center" style={{ backgroundColor: COLORS.vitalBPBg }}>
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: COLORS.vitalBP }}>
              <Heart size={20} color={COLORS.white} />
            </div>
            <p className="font-bold" style={{ color: COLORS.white }}>{vitals.bp.systolic}/{vitals.bp.diastolic}</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>BP</p>
          </div>
          <div className="p-3 rounded-2xl text-center" style={{ backgroundColor: COLORS.vitalHeartBg }}>
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: COLORS.vitalHeart }}>
              <Activity size={20} color={COLORS.white} />
            </div>
            <p className="font-bold" style={{ color: COLORS.white }}>{vitals.heart}</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Heart</p>
          </div>
          <div className="p-3 rounded-2xl text-center" style={{ backgroundColor: COLORS.vitalTempBg }}>
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: COLORS.vitalTemp }}>
              <Thermometer size={20} color={COLORS.white} />
            </div>
            <p className="font-bold" style={{ color: COLORS.white }}>{vitals.temp}°</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Temp</p>
          </div>
          <div className="p-3 rounded-2xl text-center" style={{ backgroundColor: COLORS.vitalPainBg }}>
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: COLORS.vitalPain }}>
              <Frown size={20} color={COLORS.white} />
            </div>
            <p className="font-bold" style={{ color: COLORS.white }}>{vitals.pain}/10</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Pain</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold" style={{ color: COLORS.white }}>Today's Progress</span>
            <span style={{ color: COLORS.primary }}>{completedTasks.length}/{totalTasks}</span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: COLORS.cardBorder }}>
            <div className="h-full rounded-full" style={{ backgroundColor: COLORS.primary, width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4" style={{ borderColor: COLORS.cardBorder }}>
          <button 
            className="flex-1 py-3 text-center font-semibold"
            style={{ 
              color: activeTaskTab === 'timeline' ? COLORS.primary : COLORS.textSecondary,
              borderBottom: activeTaskTab === 'timeline' ? `2px solid ${COLORS.primary}` : 'none'
            }}
            onClick={() => setActiveTaskTab('timeline')}
          >
            Care Timeline
          </button>
          <button 
            className="flex-1 py-3 text-center font-semibold"
            style={{ 
              color: activeTaskTab === 'requests' ? COLORS.primary : COLORS.textSecondary,
              borderBottom: activeTaskTab === 'requests' ? `2px solid ${COLORS.primary}` : 'none'
            }}
            onClick={() => setActiveTaskTab('requests')}
          >
            My Requests
          </button>
          <button 
            className="flex-1 py-3 text-center font-semibold"
            style={{ 
              color: activeTaskTab === 'incidents' ? COLORS.primary : COLORS.textSecondary,
              borderBottom: activeTaskTab === 'incidents' ? `2px solid ${COLORS.primary}` : 'none'
            }}
            onClick={() => setActiveTaskTab('incidents')}
          >
            Incidents
          </button>
        </div>

        {/* Care Timeline */}
        {activeTaskTab === 'timeline' && (
          <div className="space-y-4 pb-24">
            {completedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: COLORS.card }}>
                  <Clock size={32} color={COLORS.textMuted} />
                </div>
                <p style={{ color: COLORS.textSecondary }}>No completed tasks yet today</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <div key={task.id} className="rounded-2xl overflow-hidden" style={{ backgroundColor: COLORS.card }}>
                  {/* Task Photo */}
                  {task.hasPhoto && task.photo && (
                    <img src={task.photo} alt={task.title} className="w-full h-48 object-cover" />
                  )}
                  {/* Task Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{task.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold" style={{ color: COLORS.white }}>{task.title}</h4>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>{task.category}</p>
                      </div>
                      <CheckCircle size={24} color={COLORS.primary} />
                    </div>
                    <p className="text-sm" style={{ color: COLORS.textMuted }}>Completed at {task.completedAt}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Requests */}
        {activeTaskTab === 'requests' && (
          <div className="pb-24">
            {/* Add Request Button */}
            <button 
              className="w-full p-4 rounded-2xl mb-4 flex items-center justify-center gap-2"
              style={{ backgroundColor: COLORS.primary }}
              onClick={() => setShowRequestModal(true)}
            >
              <Plus size={20} color={COLORS.white} />
              <span className="font-semibold" style={{ color: COLORS.white }}>New Request</span>
            </button>

            {myRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: COLORS.card }}>
                  <MessageSquare size={32} color={COLORS.textMuted} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: COLORS.white }}>No Requests Yet</h3>
                <p style={{ color: COLORS.textSecondary }}>Tap the button above to create a new request</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: COLORS.card, borderLeft: `4px solid ${request.priority === 'critical' ? COLORS.critical : request.priority === 'standard' ? COLORS.standard : COLORS.low}` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold" style={{ color: COLORS.white }}>{request.title}</span>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: request.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: request.status === 'pending' ? COLORS.completed : COLORS.low
                        }}
                      >
                        {request.status === 'pending' ? 'PENDING' : 'COMPLETED'}
                      </span>
                    </div>
                    {request.description && (
                      <p className="text-sm mb-2" style={{ color: COLORS.textSecondary }}>{request.description}</p>
                    )}
                    <p className="text-xs" style={{ color: COLORS.textMuted }}>Created at {request.createdAt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incidents */}
        {activeTaskTab === 'incidents' && (
          <div className="pb-24">
            {sharedIncidents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: COLORS.card }}>
                  <AlertTriangle size={32} color={COLORS.textMuted} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: COLORS.white }}>No Incidents Reported</h3>
                <p style={{ color: COLORS.textSecondary }}>Any incidents reported by caregivers will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedIncidents.map((incident, idx) => (
                  <div key={idx} className="p-4 rounded-2xl" style={{ backgroundColor: COLORS.card }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{INCIDENT_TYPES.find(t => t.id === incident.type)?.icon}</span>
                      <span 
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ 
                          backgroundColor: incident.severity === 'High' ? 'rgba(239, 68, 68, 0.2)' : incident.severity === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                          color: incident.severity === 'High' ? COLORS.critical : incident.severity === 'Medium' ? COLORS.completed : COLORS.low
                        }}
                      >
                        {incident.severity}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1" style={{ color: COLORS.white }}>
                      {INCIDENT_TYPES.find(t => t.id === incident.type)?.label}
                    </h4>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>{incident.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Copilot FAB */}
      <button 
        className="fixed bottom-24 right-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ backgroundColor: COLORS.cardBorder }}
      >
        <Sparkles size={24} color={COLORS.primary} />
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: COLORS.background }}>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'menu' && (
          <FamilyMenuScreen 
            onSignOut={onSignOut} 
            showCurrentCaregiver={showCurrentCaregiver}
            setShowCurrentCaregiver={setShowCurrentCaregiver}
            performanceMetrics={performanceMetrics}
            dailySummary={dailySummary}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around py-3 border-t" style={{ backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }}>
        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => { setActiveTab('home'); setShowCurrentCaregiver(false); }}
        >
          <Home size={24} color={activeTab === 'home' ? COLORS.primary : COLORS.textSecondary} />
          <span className="text-xs" style={{ color: activeTab === 'home' ? COLORS.primary : COLORS.textSecondary }}>Home</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => { setActiveTab('menu'); setShowCurrentCaregiver(false); }}
        >
          <Menu size={24} color={activeTab === 'menu' ? COLORS.primary : COLORS.textSecondary} />
          <span className="text-xs" style={{ color: activeTab === 'menu' ? COLORS.primary : COLORS.textSecondary }}>Menu</span>
        </button>
      </div>

      {/* New Request Modal */}
      <NewRequestModal
        visible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleAddRequest}
      />
    </div>
  );
};

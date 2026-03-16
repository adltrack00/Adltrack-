import React, { useState, useContext, createContext } from 'react';
import { 
  Home, MessageSquare, Clock, Menu, Bot, User, Heart, Activity, Thermometer,
  MapPin, ChevronRight, Bell, CheckCircle, Sparkles, AlertTriangle, Camera,
  ChevronDown, X, Calendar, Star, Shield, Phone, Mail, ArrowLeft, Plus, Frown
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { CAREGIVER_PROFILE } from '../services/mockData';
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
// MOCK DATA - Exact match from mobile app
// ============================================
const PATIENT = {
  name: 'David Smith',
  age: 78,
  dob: '1946-03-15',
  photo: 'https://customer-assets.emergentagent.com/job_adlcare-expo/artifacts/0kd0031g_IMG_9932.jpeg',
  allergies: ['Penicillin', 'Shellfish'],
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Cognitive Impairment'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
  ],
  codeStatus: 'Full Code',
  mobility: 'Uses walker for ambulation',
};

const INITIAL_TASKS = [
  { id: 1, title: 'Morning Medication', time: '8:00 AM', status: 'completed', category: 'Medication', icon: '💊', requiresPhoto: true },
  { id: 2, title: 'Breakfast Assistance', time: '8:30 AM', status: 'completed', category: 'Nutrition', icon: '🍳', requiresPhoto: true },
  { id: 3, title: 'Morning Hygiene', time: '9:00 AM', status: 'completed', category: 'Personal Care', icon: '🚿', requiresPhoto: false },
  { id: 4, title: 'Physical Therapy Exercises', time: '10:00 AM', status: 'pending', category: 'Therapy', icon: '🏃', requiresPhoto: true },
  { id: 5, title: 'Vital Signs Check', time: '11:00 AM', status: 'pending', category: 'Health Monitoring', icon: '❤️', requiresPhoto: false },
  { id: 6, title: 'Lunch Preparation', time: '12:00 PM', status: 'pending', category: 'Nutrition', icon: '🥗', requiresPhoto: true },
];

const INITIAL_REQUESTS = [
  { id: 1, title: 'Extra blanket request', description: 'Please provide an extra blanket for the living room', priority: 'standard', status: 'pending', from: 'Mary Smith', time: '2:30 PM' },
  { id: 2, title: 'Schedule change', description: 'Can we move the afternoon walk to 3 PM instead of 2 PM?', priority: 'low', status: 'pending', from: 'Tom Smith', time: '1:15 PM' },
];

const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: '🚨', color: '#ef4444' },
  { id: 'injury', label: 'Injury', icon: '🩹', color: '#f59e0b' },
  { id: 'behavior', label: 'Behavioral', icon: '😤', color: '#8b5cf6' },
  { id: 'medical', label: 'Medical', icon: '🏥', color: '#3b82f6' },
  { id: 'medication', label: 'Medication Error', icon: '💊', color: '#ec4899' },
  { id: 'other', label: 'Other', icon: '📝', color: '#6b7280' },
];

const SHIFT_HISTORY = [
  { id: 1, date: 'Jan 16, 2026', startTime: '8:00 AM', endTime: '4:00 PM', tasksCompleted: 12, totalTasks: 12, status: 'completed' },
  { id: 2, date: 'Jan 15, 2026', startTime: '8:00 AM', endTime: '4:00 PM', tasksCompleted: 11, totalTasks: 12, status: 'completed' },
  { id: 3, date: 'Jan 14, 2026', startTime: '8:00 AM', endTime: '12:00 PM', tasksCompleted: 0, totalTasks: 6, status: 'cancelled' },
];

const CLIENTS = [
  { id: 1, name: 'Robert Williams', condition: 'Alzheimer\'s Disease', tasksToday: 8, tasksCompleted: 3, riskLevel: 'moderate' },
  { id: 2, name: 'David Smith', condition: 'Type 2 Diabetes, Hypertension', tasksToday: 12, tasksCompleted: 3, riskLevel: 'low' },
  { id: 3, name: 'Margaret Johnson', condition: 'Parkinson\'s Disease', tasksToday: 10, tasksCompleted: 0, riskLevel: 'high' },
];

// ============================================
// SHARED DATA CONTEXT
// ============================================
const SharedDataContext = createContext(null);

const SharedDataProvider = ({ children }) => {
  const [sharedTasks, setSharedTasks] = useState([]);
  const [sharedRequests, setSharedRequests] = useState(INITIAL_REQUESTS);
  const [sharedIncidents, setSharedIncidents] = useState([]);
  const [clients, setClients] = useState(CLIENTS);
  const [activeClientId, setActiveClientId] = useState(2);
  const [shiftData, setShiftData] = useState({
    isClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
    weeklyHours: 32,
    gpsVerified: false,
  });
  const [performanceMetrics] = useState({
    monthlyScore: 96,
    taskCompletionRate: 94,
    onTimeRate: 98,
    familyRating: 4.8,
  });
  const [dailySummary] = useState({
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    tasksCompleted: 3,
    totalTasks: 12,
    medicationsGiven: 2,
    totalMedications: 4,
    caregiverArrival: '7:58 AM',
    incidentsReported: 0,
  });

  const clockIn = (location) => {
    setShiftData(prev => ({
      ...prev,
      isClockedIn: true,
      clockInTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      gpsVerified: true,
    }));
  };

  const clockOut = () => {
    setShiftData(prev => ({
      ...prev,
      isClockedIn: false,
      clockOutTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }));
  };

  return (
    <SharedDataContext.Provider value={{
      sharedTasks, setSharedTasks,
      sharedRequests, setSharedRequests,
      sharedIncidents, setSharedIncidents,
      clients, setClients,
      activeClientId, setActiveClientId,
      shiftData, setShiftData,
      performanceMetrics,
      dailySummary,
      clockIn, clockOut,
    }}>
      {children}
    </SharedDataContext.Provider>
  );
};

// ============================================
// TASK DETAIL MODAL
// ============================================
const TaskDetailModal = ({ visible, onClose, task, onComplete, onCantComplete }) => {
  const [showCantCompleteOptions, setShowCantCompleteOptions] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes] = useState('');

  const cantCompleteReasons = [
    { id: 'refused', label: 'Patient Refused', icon: '🚫' },
    { id: 'sleeping', label: 'Patient Sleeping', icon: '😴' },
    { id: 'not_home', label: 'Patient Not Home', icon: '🏠' },
    { id: 'medical', label: 'Medical Reason', icon: '⚕️' },
    { id: 'other', label: 'Other Reason', icon: '📝' },
  ];

  if (!visible || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md rounded-t-3xl p-6" style={{ backgroundColor: COLORS.card, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{task.icon}</span>
            <div>
              <h2 className="text-xl font-bold" style={{ color: COLORS.white }}>{task.title}</h2>
              <p style={{ color: COLORS.textSecondary }}>{task.time} • {task.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ backgroundColor: COLORS.cardBorder }}>
            <X size={20} color={COLORS.white} />
          </button>
        </div>

        {/* Task Instructions */}
        <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: COLORS.cardBorder }}>
          <h3 className="font-semibold mb-2" style={{ color: COLORS.white }}>Instructions</h3>
          <p style={{ color: COLORS.textSecondary }}>
            {task.category === 'Medication' && 'Administer medication as prescribed. Verify patient identity and medication details before administration.'}
            {task.category === 'Nutrition' && 'Prepare and serve meal according to dietary requirements. Monitor intake and document any concerns.'}
            {task.category === 'Personal Care' && 'Assist patient with personal hygiene tasks while maintaining dignity and privacy.'}
            {task.category === 'Therapy' && 'Guide patient through prescribed exercises. Monitor for any signs of discomfort or fatigue.'}
            {task.category === 'Health Monitoring' && 'Record vital signs accurately. Report any values outside normal range immediately.'}
          </p>
        </div>

        {/* Photo Evidence Section */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3" style={{ color: COLORS.textSecondary }}>
            PHOTO EVIDENCE {task.requiresPhoto ? '(REQUIRED)' : '(OPTIONAL)'}
          </p>
          <button className="w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center" 
            style={{ borderColor: COLORS.cardBorder }}>
            <Camera size={40} color={COLORS.textMuted} />
            <span className="mt-3 font-semibold" style={{ color: COLORS.textSecondary }}>Tap to add photo</span>
            <span className="text-sm" style={{ color: COLORS.textMuted }}>Take a photo for documentation</span>
          </button>
        </div>

        {!showCantCompleteOptions ? (
          /* Action Buttons */
          <div className="flex gap-3">
            <button 
              className="flex-1 py-4 rounded-2xl font-semibold"
              style={{ backgroundColor: COLORS.cardBorder, color: COLORS.white }}
              onClick={() => setShowCantCompleteOptions(true)}
            >
              Can't Complete
            </button>
            <button 
              className="flex-1 py-4 rounded-2xl font-semibold"
              style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
              onClick={() => onComplete(task)}
            >
              Mark Complete
            </button>
          </div>
        ) : (
          /* Can't Complete Options */
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: COLORS.textSecondary }}>SELECT REASON</p>
            <div className="space-y-2 mb-4">
              {cantCompleteReasons.map((reason) => (
                <button
                  key={reason.id}
                  className="w-full flex items-center gap-3 p-4 rounded-xl transition-all"
                  style={{
                    backgroundColor: selectedReason === reason.id ? 'rgba(239, 68, 68, 0.2)' : COLORS.cardBorder,
                    borderWidth: selectedReason === reason.id ? 2 : 0,
                    borderColor: COLORS.critical,
                  }}
                  onClick={() => setSelectedReason(reason.id)}
                >
                  <span className="text-2xl">{reason.icon}</span>
                  <span style={{ color: selectedReason === reason.id ? COLORS.critical : COLORS.white }}>{reason.label}</span>
                </button>
              ))}
            </div>
            
            {/* Notes Input */}
            <textarea
              className="w-full p-4 rounded-xl mb-4"
              style={{ backgroundColor: COLORS.cardBorder, color: COLORS.white, border: 'none', resize: 'none' }}
              placeholder="Add notes (optional)"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-4 rounded-2xl font-semibold"
                style={{ backgroundColor: COLORS.cardBorder, color: COLORS.white }}
                onClick={() => { setShowCantCompleteOptions(false); setSelectedReason(null); }}
              >
                Back
              </button>
              <button 
                className="flex-1 py-4 rounded-2xl font-semibold"
                style={{ 
                  backgroundColor: selectedReason ? COLORS.critical : COLORS.cardBorder, 
                  color: COLORS.white,
                  opacity: selectedReason ? 1 : 0.5
                }}
                disabled={!selectedReason}
                onClick={() => onCantComplete(task, selectedReason, notes)}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// INCIDENT REPORT MODAL
// ============================================
const IncidentReportModal = ({ visible, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [witnesses, setWitnesses] = useState('');
  const [photos, setPhotos] = useState([]);
  const [notifyFamily, setNotifyFamily] = useState(true);

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedType(null);
    setSeverity('High');
    setDescription('');
    setActionsTaken('');
    setWitnesses('');
    setPhotos([]);
    setNotifyFamily(true);
  };

  const handleSubmit = () => {
    const incident = {
      type: selectedType,
      severity,
      description,
      actionsTaken,
      witnesses,
      photos,
      notifyFamily,
      timestamp: new Date().toLocaleString(),
    };
    onSubmit(incident);
    resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: COLORS.background }}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: COLORS.cardBorder }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: COLORS.white }}>New Incident Report</h2>
              <p style={{ color: COLORS.textSecondary }}>Step {currentStep} of 5</p>
            </div>
            <button 
              className="px-4 py-2 rounded-lg"
              style={{ color: COLORS.critical }}
              onClick={() => { resetForm(); onClose(); }}
            >
              Cancel
            </button>
          </div>
          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className="flex-1 h-1 rounded-full"
                style={{ backgroundColor: step <= currentStep ? COLORS.primary : COLORS.cardBorder }}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Incident Type */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.white }}>What type of incident occurred?</h3>
              <p className="mb-4" style={{ color: COLORS.textSecondary }}>Select the category that best describes the incident</p>
              <div className="grid grid-cols-2 gap-3">
                {INCIDENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className="p-4 rounded-2xl flex flex-col items-center transition-all"
                    style={{
                      backgroundColor: selectedType === type.id ? `${type.color}20` : COLORS.card,
                      borderWidth: 2,
                      borderColor: selectedType === type.id ? type.color : 'transparent',
                    }}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <span className="text-3xl mb-2">{type.icon}</span>
                    <span style={{ color: selectedType === type.id ? type.color : COLORS.white }}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.white }}>Incident Details</h3>
              
              <p className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>SEVERITY LEVEL</p>
              <div className="flex gap-2 mb-6">
                {['Low', 'Medium', 'High'].map((level) => (
                  <button
                    key={level}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={{
                      backgroundColor: severity === level ? (level === 'High' ? COLORS.critical : level === 'Medium' ? COLORS.completed : COLORS.primary) : COLORS.card,
                      color: COLORS.white,
                    }}
                    onClick={() => setSeverity(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>

              <p className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>WHAT HAPPENED?</p>
              <textarea
                className="w-full p-4 rounded-xl mb-4"
                style={{ backgroundColor: COLORS.card, color: COLORS.white, border: 'none', resize: 'none' }}
                placeholder="Describe what happened..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <p className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>ACTIONS TAKEN</p>
              <textarea
                className="w-full p-4 rounded-xl"
                style={{ backgroundColor: COLORS.card, color: COLORS.white, border: 'none', resize: 'none' }}
                placeholder="What actions were taken?"
                rows={4}
                value={actionsTaken}
                onChange={(e) => setActionsTaken(e.target.value)}
              />
            </div>
          )}

          {/* Step 3: Witnesses */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.white }}>Witness Information</h3>
              <p className="mb-4" style={{ color: COLORS.textSecondary }}>Document any witnesses present during the incident for legal and record-keeping purposes.</p>
              
              <p className="text-sm font-semibold mb-2" style={{ color: COLORS.textSecondary }}>WITNESS NAME(S)</p>
              <textarea
                className="w-full p-4 rounded-xl mb-4"
                style={{ backgroundColor: COLORS.card, color: COLORS.white, border: 'none', resize: 'none' }}
                placeholder="Enter the names of any witnesses present..."
                rows={4}
                value={witnesses}
                onChange={(e) => setWitnesses(e.target.value)}
              />

              <div className="p-4 rounded-xl flex gap-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}>
                <AlertTriangle size={20} color={COLORS.textSecondary} />
                <p className="text-sm flex-1" style={{ color: COLORS.textSecondary }}>
                  Include full names and their relationship to the patient if applicable (e.g., "John Smith - Family Visitor")
                </p>
              </div>

              <button 
                className="flex items-center gap-3 mt-4"
                onClick={() => setWitnesses('No witnesses present')}
              >
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ 
                    backgroundColor: witnesses === 'No witnesses present' ? COLORS.primary : 'transparent',
                    borderWidth: 2,
                    borderColor: witnesses === 'No witnesses present' ? COLORS.primary : COLORS.textSecondary
                  }}
                >
                  {witnesses === 'No witnesses present' && <CheckCircle size={16} color={COLORS.white} />}
                </div>
                <span style={{ color: COLORS.white }}>No witnesses were present</span>
              </button>
            </div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.white }}>Add Photos</h3>
              <p className="mb-4" style={{ color: COLORS.textSecondary }}>Document the incident with photos if applicable</p>
              
              <button className="w-full py-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center" 
                style={{ borderColor: COLORS.cardBorder }}>
                <Camera size={40} color={COLORS.textMuted} />
                <span className="mt-3 font-semibold" style={{ color: COLORS.textSecondary }}>Tap to add photo</span>
                <span className="text-sm" style={{ color: COLORS.textMuted }}>Take a photo for documentation</span>
              </button>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.white }}>Review & Submit</h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.card }}>
                  <p className="text-sm mb-1" style={{ color: COLORS.textSecondary }}>INCIDENT TYPE</p>
                  <p className="font-semibold" style={{ color: COLORS.white }}>
                    {INCIDENT_TYPES.find(t => t.id === selectedType)?.label || 'Not selected'}
                  </p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.card }}>
                  <p className="text-sm mb-1" style={{ color: COLORS.textSecondary }}>SEVERITY</p>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ 
                      backgroundColor: severity === 'High' ? 'rgba(239, 68, 68, 0.2)' : severity === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: severity === 'High' ? COLORS.critical : severity === 'Medium' ? COLORS.completed : COLORS.low
                    }}
                  >
                    {severity.toUpperCase()}
                  </span>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.card }}>
                  <p className="text-sm mb-1" style={{ color: COLORS.textSecondary }}>DESCRIPTION</p>
                  <p style={{ color: COLORS.white }}>{description || 'No description provided'}</p>
                </div>

                <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.card }}>
                  <p className="text-sm mb-1" style={{ color: COLORS.textSecondary }}>WITNESSES</p>
                  <p style={{ color: COLORS.white }}>{witnesses || 'No witnesses documented'}</p>
                </div>

                {/* Notify Family Toggle */}
                <button 
                  className="w-full p-4 rounded-xl flex items-center justify-between"
                  style={{ backgroundColor: notifyFamily ? 'rgba(37, 211, 102, 0.15)' : COLORS.card }}
                  onClick={() => setNotifyFamily(!notifyFamily)}
                >
                  <span style={{ color: COLORS.white }}>Notify Family</span>
                  <div 
                    className="w-12 h-7 rounded-full flex items-center px-1 transition-all"
                    style={{ backgroundColor: notifyFamily ? COLORS.primary : COLORS.cardBorder }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full bg-white transition-all"
                      style={{ transform: notifyFamily ? 'translateX(20px)' : 'translateX(0)' }}
                    />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3" style={{ borderColor: COLORS.cardBorder }}>
          {currentStep > 1 && (
            <button 
              className="flex-1 py-4 rounded-2xl font-semibold"
              style={{ backgroundColor: COLORS.cardBorder, color: COLORS.white }}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </button>
          )}
          {currentStep < 5 ? (
            <button 
              className="flex-1 py-4 rounded-2xl font-semibold"
              style={{ 
                backgroundColor: (currentStep === 1 && selectedType) || currentStep > 1 ? COLORS.primary : COLORS.cardBorder, 
                color: COLORS.white,
                opacity: (currentStep === 1 && !selectedType) ? 0.5 : 1
              }}
              disabled={currentStep === 1 && !selectedType}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Continue
            </button>
          ) : (
            <button 
              className="flex-1 py-4 rounded-2xl font-semibold"
              style={{ backgroundColor: COLORS.critical, color: COLORS.white }}
              onClick={handleSubmit}
            >
              Submit Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// SHIFTS SCREEN
// ============================================
const ShiftsScreen = ({ sharedData }) => {
  const [showClientList, setShowClientList] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (showHistory) {
    return (
      <div className="h-full" style={{ backgroundColor: COLORS.background }}>
        {/* Header */}
        <div className="p-4 flex items-center gap-4">
          <button className="p-2 rounded-full" style={{ backgroundColor: COLORS.cardBorder }} onClick={() => setShowHistory(false)}>
            <ArrowLeft size={24} color={COLORS.white} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: COLORS.white }}>Shift History</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 mb-4">
          {['all', 'completed', 'cancelled'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 rounded-full text-sm font-semibold"
              style={{ backgroundColor: COLORS.card, color: COLORS.white }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* History List */}
        <div className="px-4 space-y-3">
          {SHIFT_HISTORY.map((shift) => (
            <div 
              key={shift.id}
              className="p-4 rounded-2xl"
              style={{ backgroundColor: shift.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : COLORS.card }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={18} color={COLORS.textSecondary} />
                  <span style={{ color: COLORS.white }}>{shift.date}</span>
                </div>
                <span 
                  className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  style={{ 
                    backgroundColor: shift.status === 'completed' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: shift.status === 'completed' ? COLORS.primary : COLORS.textSecondary
                  }}
                >
                  {shift.status === 'completed' ? <CheckCircle size={12} /> : <X size={12} />}
                  {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} color={COLORS.textSecondary} />
                  <span className="text-sm" style={{ color: COLORS.textSecondary }}>{shift.startTime} - {shift.endTime}</span>
                </div>
                {shift.status === 'completed' && (
                  <div className="flex items-center gap-1">
                    <CheckCircle size={14} color={COLORS.primary} />
                    <span className="text-sm" style={{ color: COLORS.textSecondary }}>{shift.tasksCompleted}/{shift.totalTasks} tasks</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4" style={{ backgroundColor: COLORS.background }}>
      {/* Shift Status Card */}
      <div className="p-5 rounded-3xl mb-4" style={{ backgroundColor: COLORS.card }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: COLORS.white }}>Shift Status</h3>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: sharedData?.shiftData?.isClockedIn ? COLORS.primary : COLORS.critical }}
            />
            <span className="text-sm" style={{ color: COLORS.textSecondary }}>
              {sharedData?.shiftData?.isClockedIn ? 'On Shift' : 'Off Shift'}
            </span>
          </div>
        </div>

        <div className="flex justify-between mb-5">
          <div className="text-center">
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>Clock In</p>
            <p className="text-lg font-bold" style={{ color: COLORS.white }}>{sharedData?.shiftData?.clockInTime || '--:--'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>Clock Out</p>
            <p className="text-lg font-bold" style={{ color: COLORS.white }}>{sharedData?.shiftData?.clockOutTime || '--:--'}</p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>Weekly Hours</p>
            <p className="text-lg font-bold" style={{ color: COLORS.white }}>{sharedData?.shiftData?.weeklyHours || 0}h</p>
          </div>
        </div>

        <button 
          className="w-full py-4 rounded-2xl font-semibold mb-3"
          style={{ 
            backgroundColor: sharedData?.shiftData?.isClockedIn ? COLORS.critical : COLORS.primary, 
            color: COLORS.white 
          }}
          onClick={() => {
            if (sharedData?.shiftData?.isClockedIn) {
              sharedData.clockOut();
            } else {
              sharedData.clockIn({ lat: 40.7128, lng: -74.0060 });
            }
          }}
        >
          {sharedData?.shiftData?.isClockedIn ? 'Clock Out' : 'Clock In'}
        </button>

        <div className="flex items-center justify-center gap-2">
          <MapPin size={16} color={COLORS.primary} />
          <span className="text-sm" style={{ color: COLORS.textSecondary }}>GPS verification enabled</span>
        </div>
      </div>

      {/* Active Client Selector */}
      <button 
        className="w-full p-5 rounded-3xl mb-4 flex items-center justify-between"
        style={{ backgroundColor: COLORS.card }}
        onClick={() => setShowClientList(true)}
      >
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: COLORS.textSecondary }}>ACTIVE CLIENT</p>
          <p className="text-lg font-semibold" style={{ color: COLORS.white }}>
            {sharedData?.clients?.find(c => c.id === sharedData?.activeClientId)?.name || PATIENT.name}
          </p>
        </div>
        <ChevronDown size={24} color={COLORS.textSecondary} />
      </button>

      {/* Quick Actions */}
      <div className="p-5 rounded-3xl" style={{ backgroundColor: COLORS.card }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.white }}>Quick Actions</h3>
        
        <button className="w-full flex items-center justify-between py-3 border-b" style={{ borderColor: COLORS.cardBorder }}>
          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <span style={{ color: COLORS.white }}>View Earnings</span>
          </div>
          <ChevronRight size={22} color={COLORS.textSecondary} />
        </button>

        <button 
          className="w-full flex items-center justify-between py-3"
          onClick={() => setShowHistory(true)}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <span style={{ color: COLORS.white }}>Shift History</span>
          </div>
          <ChevronRight size={22} color={COLORS.textSecondary} />
        </button>
      </div>

      {/* Client List Modal */}
      {showClientList && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: COLORS.white }}>Your Clients</h2>
              <button onClick={() => setShowClientList(false)}>
                <X size={28} color={COLORS.white} />
              </button>
            </div>

            <div className="space-y-3">
              {(sharedData?.clients || CLIENTS).map((client) => (
                <button
                  key={client.id}
                  className="w-full p-4 rounded-2xl flex items-center gap-4"
                  style={{ 
                    backgroundColor: client.id === sharedData?.activeClientId ? 'rgba(37, 211, 102, 0.15)' : COLORS.card,
                    borderWidth: client.id === sharedData?.activeClientId ? 2 : 0,
                    borderColor: COLORS.primary
                  }}
                  onClick={() => {
                    sharedData?.setActiveClientId(client.id);
                    setShowClientList(false);
                  }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.cardBorder }}>
                    <User size={28} color={COLORS.textSecondary} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold" style={{ color: COLORS.white }}>{client.name}</p>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>{client.condition}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                        {client.tasksCompleted}/{client.tasksToday} tasks today
                      </span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: client.riskLevel === 'low' ? 'rgba(34, 197, 94, 0.2)' : client.riskLevel === 'moderate' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: client.riskLevel === 'low' ? '#22c55e' : client.riskLevel === 'moderate' ? '#eab308' : '#ef4444'
                        }}
                      >
                        {client.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {client.id === sharedData?.activeClientId && (
                    <CheckCircle size={24} color={COLORS.primary} />
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

// ============================================
// MENU SCREEN
// ============================================
const MenuScreen = ({ onSignOut, caregiver }) => {
  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      {/* Profile Header */}
      <div className="text-center py-6 px-4">
        <img 
          src={caregiver?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia'}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4"
          style={{ borderColor: COLORS.primary }}
        />
        <h2 className="text-2xl font-bold" style={{ color: COLORS.white }}>{caregiver?.name || 'Julia Martinez'}</h2>
        <p style={{ color: COLORS.textSecondary }}>{caregiver?.role || 'Certified Nursing Assistant'}</p>
        
        {/* Stats Row */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Star size={18} color="#f59e0b" />
            </div>
            <p className="text-xl font-bold" style={{ color: COLORS.white }}>{caregiver?.rating || '4.9'}</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Rating</p>
          </div>
          <div className="text-center">
            <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Clock size={18} color={COLORS.primary} />
            </div>
            <p className="text-xl font-bold" style={{ color: COLORS.white }}>{caregiver?.years || '5'}</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Years</p>
          </div>
          <div className="text-center">
            <div className="w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <Calendar size={18} color="#3b82f6" />
            </div>
            <p className="text-xl font-bold" style={{ color: COLORS.white }}>{caregiver?.shifts || '234'}</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>Shifts</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        {[
          { icon: <User size={24} />, label: 'Profile', color: COLORS.primary },
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
// MAIN CAREGIVER DASHBOARD COMPONENT
// ============================================
export const CaregiverDashboard = ({ 
  onBack, 
  onSignOut,
  onRoleSwitch,
  currentRole,
  tasks: propTasks = [],
  proposedTasks = [],
  patient: propPatient,
  vitalsData: propVitalsData,
  onUpdateTask,
  onAcceptTask,
  onDeclineTask,
  onAddVital,
  onUpdatePatientPhoto,
  incidents = [],
  onAddIncident,
  skipStartShift = false
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaskTab, setActiveTaskTab] = useState('tasks');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [vitals, setVitals] = useState({ bp: { systolic: 120, diastolic: 76 }, heart: 72, temp: 98.6, pain: 1 });
  
  // Shared data context
  const [sharedData, setSharedData] = useState({
    sharedTasks: [],
    sharedRequests: INITIAL_REQUESTS,
    sharedIncidents: [],
    clients: CLIENTS,
    activeClientId: 2,
    shiftData: {
      isClockedIn: false,
      clockInTime: null,
      clockOutTime: null,
      weeklyHours: 32,
    },
    performanceMetrics: { monthlyScore: 96, taskCompletionRate: 94, onTimeRate: 98, familyRating: 4.8 },
    dailySummary: { tasksCompleted: 3, totalTasks: 12, medicationsGiven: 2, totalMedications: 4, caregiverArrival: '7:58 AM', incidentsReported: 0 },
    clockIn: () => setSharedData(prev => ({ ...prev, shiftData: { ...prev.shiftData, isClockedIn: true, clockInTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }})),
    clockOut: () => setSharedData(prev => ({ ...prev, shiftData: { ...prev.shiftData, isClockedIn: false, clockOutTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }})),
    setActiveClientId: (id) => setSharedData(prev => ({ ...prev, activeClientId: id })),
  });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = (completedCount / totalCount) * 100;

  const handleCompleteTask = (task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'completed' } : t));
    setSharedData(prev => ({ 
      ...prev, 
      sharedTasks: [...prev.sharedTasks, { ...task, status: 'completed', completedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]
    }));
    setSelectedTask(null);
  };

  const handleCantCompleteTask = (task, reason, notes) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'skipped', skipReason: reason, skipNotes: notes } : t));
    setSelectedTask(null);
  };

  const handleIncidentSubmit = (incident) => {
    setSharedData(prev => ({ ...prev, sharedIncidents: [...prev.sharedIncidents, incident] }));
    if (onAddIncident) onAddIncident(incident);
  };

  // Render Home Screen
  const renderHomeScreen = () => (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Good Morning</p>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.white }}>Julia Martinez</h1>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.cardBorder }}>
          <Bell size={20} color={COLORS.white} />
        </button>
      </div>

      <div className="px-4">
        {/* Patient Card */}
        <div className="p-4 rounded-3xl mb-4 flex items-center gap-4" style={{ backgroundColor: COLORS.card }}>
          <img src={PATIENT.photo} alt={PATIENT.name} className="w-16 h-16 rounded-full object-cover" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold" style={{ color: COLORS.white }}>{PATIENT.name}</h3>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>{PATIENT.age} years old</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {PATIENT.conditions.slice(0, 2).map((condition, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: COLORS.cardBorder, color: COLORS.textSecondary }}>
                  {condition}
                </span>
              ))}
            </div>
          </div>
          <ChevronRight size={24} color={COLORS.textSecondary} />
        </div>

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
            <span style={{ color: COLORS.primary }}>{completedCount}/{totalCount}</span>
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
              color: activeTaskTab === 'tasks' ? COLORS.primary : COLORS.textSecondary,
              borderBottom: activeTaskTab === 'tasks' ? `2px solid ${COLORS.primary}` : 'none'
            }}
            onClick={() => setActiveTaskTab('tasks')}
          >
            Today's Tasks
          </button>
          <button 
            className="flex-1 py-3 text-center font-semibold relative"
            style={{ 
              color: activeTaskTab === 'requests' ? COLORS.primary : COLORS.textSecondary,
              borderBottom: activeTaskTab === 'requests' ? `2px solid ${COLORS.primary}` : 'none'
            }}
            onClick={() => setActiveTaskTab('requests')}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute top-2 right-4 w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ backgroundColor: COLORS.critical, color: COLORS.white }}>
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tasks List */}
        {activeTaskTab === 'tasks' && (
          <div className="space-y-3 pb-24">
            {tasks.map((task) => (
              <button
                key={task.id}
                className="w-full p-4 rounded-2xl flex items-center gap-4"
                style={{ backgroundColor: COLORS.card }}
                onClick={() => task.status !== 'completed' && setSelectedTask(task)}
              >
                <span className="text-2xl">{task.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold" style={{ color: COLORS.white }}>{task.title}</p>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>{task.time} • {task.category}</p>
                </div>
                {task.status === 'completed' ? (
                  <CheckCircle size={24} color={COLORS.primary} />
                ) : (
                  <ChevronRight size={24} color={COLORS.textSecondary} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Requests List */}
        {activeTaskTab === 'requests' && (
          <div className="space-y-3 pb-24">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: COLORS.card }}>
                  <MessageSquare size={32} color={COLORS.textMuted} />
                </div>
                <p style={{ color: COLORS.textSecondary }}>No pending requests</p>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 rounded-2xl"
                  style={{ backgroundColor: COLORS.card, borderLeft: `4px solid ${request.priority === 'critical' ? COLORS.critical : request.priority === 'standard' ? COLORS.standard : COLORS.low}` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold" style={{ color: COLORS.white }}>{request.title}</span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: request.priority === 'critical' ? 'rgba(239, 68, 68, 0.2)' : request.priority === 'standard' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: request.priority === 'critical' ? COLORS.critical : request.priority === 'standard' ? COLORS.standard : COLORS.low }}>
                      {request.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: COLORS.textSecondary }}>{request.description}</p>
                  <p className="text-xs" style={{ color: COLORS.textMuted }}>From {request.from} • {request.time}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 rounded-xl font-semibold" style={{ backgroundColor: COLORS.cardBorder, color: COLORS.white }}>
                      Decline
                    </button>
                    <button className="flex-1 py-2 rounded-xl font-semibold" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                      Accept
                    </button>
                  </div>
                </div>
              ))
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

  // Render Incidents Screen
  const renderIncidentsScreen = () => (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: COLORS.background }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: COLORS.white }}>Incidents</h1>
          <button 
            className="px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ backgroundColor: COLORS.critical, color: COLORS.white }}
            onClick={() => setShowIncidentModal(true)}
          >
            <Plus size={20} />
            <span className="font-semibold">Report</span>
          </button>
        </div>

        {sharedData.sharedIncidents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: COLORS.card }}>
              <AlertTriangle size={40} color={COLORS.textMuted} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.white }}>No Incidents Reported</h3>
            <p style={{ color: COLORS.textSecondary }}>All incidents will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sharedData.sharedIncidents.map((incident, idx) => (
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
                <p className="text-sm mb-2" style={{ color: COLORS.textSecondary }}>{incident.description}</p>
                <p className="text-xs" style={{ color: COLORS.textMuted }}>{incident.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: COLORS.background }}>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'shifts' && <ShiftsScreen sharedData={sharedData} />}
        {activeTab === 'incidents' && renderIncidentsScreen()}
        {activeTab === 'menu' && <MenuScreen onSignOut={onSignOut} caregiver={CAREGIVER_PROFILE} />}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around py-3 border-t" style={{ backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }}>
        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} color={activeTab === 'home' ? COLORS.primary : COLORS.textSecondary} />
          <span className="text-xs" style={{ color: activeTab === 'home' ? COLORS.primary : COLORS.textSecondary }}>Home</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => setActiveTab('shifts')}
        >
          <Clock size={24} color={activeTab === 'shifts' ? COLORS.primary : COLORS.textSecondary} />
          <span className="text-xs" style={{ color: activeTab === 'shifts' ? COLORS.primary : COLORS.textSecondary }}>Shifts</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => setActiveTab('incidents')}
        >
          <AlertTriangle size={24} color={activeTab === 'incidents' ? COLORS.primary : COLORS.textSecondary} />
          <span className="text-xs" style={{ color: activeTab === 'incidents' ? COLORS.primary : COLORS.textSecondary }}>Incidents</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1"
          onClick={() => setActiveTab('menu')}
        >
          <Menu size={24} color={activeTab === 'menu' ? COLORS.primary : COLORS.textSecondary} />
          <span className="text-xs" style={{ color: activeTab === 'menu' ? COLORS.primary : COLORS.textSecondary }}>Menu</span>
        </button>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onComplete={handleCompleteTask}
        onCantComplete={handleCantCompleteTask}
      />

      {/* Incident Report Modal */}
      <IncidentReportModal
        visible={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        onSubmit={handleIncidentSubmit}
      />
    </div>
  );
};

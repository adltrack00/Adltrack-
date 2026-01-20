import React, { useState } from 'react';
import { 
  Camera, AlertTriangle, Clock, CheckCircle, 
  ChevronRight, Plus, Trash2, Shield, Heart,
  Thermometer, Brain, Pill, HelpCircle, FileText, ChevronDown
} from 'lucide-react';
import { CAREGIVER_PROFILE } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

// Incident types with icons and colors
const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: AlertTriangle, color: 'rose', description: 'Patient fall or near-fall' },
  { id: 'medication', label: 'Medication Issue', icon: Pill, color: 'orange', description: 'Missed dose, wrong medication, or reaction' },
  { id: 'behavioral', label: 'Behavioral Change', icon: Brain, color: 'purple', description: 'Confusion, agitation, or mood changes' },
  { id: 'injury', label: 'Injury', icon: Heart, color: 'red', description: 'Cut, bruise, or other physical injury' },
  { id: 'vital', label: 'Vital Sign Concern', icon: Thermometer, color: 'blue', description: 'Abnormal vital signs' },
  { id: 'other', label: 'Other', icon: HelpCircle, color: 'stone', description: 'Other incident type' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', color: 'emerald', description: 'Minor issue, no immediate concern' },
  { id: 'medium', label: 'Medium', color: 'amber', description: 'Requires attention and monitoring' },
  { id: 'high', label: 'High', color: 'orange', description: 'Significant concern, action needed' },
  { id: 'critical', label: 'Critical', color: 'rose', description: 'Emergency, immediate action required' },
];

// Mock past incidents
const PAST_INCIDENTS = [
  {
    id: 1,
    type: 'fall',
    severity: 'medium',
    description: 'Patient experienced a near-fall while transitioning from bed to wheelchair',
    actionsTaken: 'Assisted patient safely back to bed, checked for injuries, monitored vitals',
    createdAt: 'Jan 16, 2026 • 2:30 PM',
    status: 'resolved'
  },
  {
    id: 2,
    type: 'medication',
    severity: 'low',
    description: 'Morning medication was taken 30 minutes late due to breakfast timing',
    actionsTaken: 'Adjusted schedule, noted for future reference',
    createdAt: 'Jan 15, 2026 • 9:15 AM',
    status: 'resolved'
  }
];

export const IncidentReportPage = ({ patientName = 'Patient' }) => {
  const { isDarkMode, bg, bgCard, bgCardHover, border, text, textSecondary, textMuted } = useTheme();
  const [activeView, setActiveView] = useState('history'); // 'history' or 'new'
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [photos, setPhotos] = useState([]);
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pastIncidents, setPastIncidents] = useState(PAST_INCIDENTS);
  const [expandedIncident, setExpandedIncident] = useState(null);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, { id: Date.now(), url: reader.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newIncident = {
      id: Date.now(),
      type: incidentType,
      severity,
      description,
      actionsTaken,
      createdAt: new Date().toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
      }),
      status: 'new'
    };
    
    setPastIncidents(prev => [newIncident, ...prev]);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setStep(1);
    setIncidentType(null);
    setSeverity(null);
    setDescription('');
    setActionsTaken('');
    setPhotos([]);
    setNotifyFamily(true);
    setFollowUpRequired(false);
    setSubmitted(false);
    setActiveView('history');
  };

  const selectedType = INCIDENT_TYPES.find(t => t.id === incidentType);
  const selectedSeverity = SEVERITY_LEVELS.find(s => s.id === severity);

  // Success Screen
  if (submitted) {
    return (
      <div className={`flex-1 ${bg} flex items-center justify-center p-6 pb-24`}>
        <div className={`${bgCard} border ${border} rounded-3xl w-full max-w-sm p-8 text-center`}>
          <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-[#25D366]" />
          </div>
          <h2 className={`text-2xl font-bold ${text} mb-3`}>Report Submitted</h2>
          <p className={`${textSecondary} mb-6`}>
            {notifyFamily 
              ? "Incident documented and family has been notified."
              : "Incident documented successfully."}
          </p>
          <button
            onClick={resetForm}
            className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold hover:bg-[#20bd5a] transition-colors"
            data-testid="incident-done-btn"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // New Report View
  if (activeView === 'new') {
    return (
      <div className={`flex-1 ${bg} flex flex-col pb-20`}>
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} border-b ${border} px-5 py-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${text}`}>New Incident Report</h2>
                <p className={`text-xs ${textMuted}`}>Step {step} of 4</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'} rounded-xl text-sm font-medium ${textSecondary} transition-colors`}
            >
              Cancel
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-rose-500' : isDarkMode ? 'bg-stone-700' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Step 1: Incident Type */}
          {step === 1 && (
            <div className="space-y-3">
              <h3 className={`${text} font-semibold mb-4`}>What type of incident occurred?</h3>
              {INCIDENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setIncidentType(type.id)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 ${
                    incidentType === type.id
                      ? 'bg-rose-500/15 border-rose-500/40'
                      : `${bgCard} border ${border} ${bgCardHover}`
                  }`}
                  data-testid={`incident-type-${type.id}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    incidentType === type.id ? 'bg-rose-500/25' : isDarkMode ? 'bg-stone-800' : 'bg-stone-100'
                  }`}>
                    <type.icon className={`w-6 h-6 ${
                      incidentType === type.id ? 'text-rose-400' : textMuted
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${incidentType === type.id ? 'text-rose-400' : text}`}>
                      {type.label}
                    </p>
                    <p className={`text-sm ${textMuted} truncate`}>{type.description}</p>
                  </div>
                  {incidentType === type.id && (
                    <CheckCircle className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Severity & Details */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Severity */}
              <div>
                <h3 className={`${text} font-semibold mb-3`}>Severity Level</h3>
                <div className="grid grid-cols-4 gap-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSeverity(level.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        severity === level.id
                          ? level.id === 'low' ? 'bg-emerald-500/20 border-emerald-500/50' :
                            level.id === 'medium' ? 'bg-amber-500/20 border-amber-500/50' :
                            level.id === 'high' ? 'bg-orange-500/20 border-orange-500/50' :
                            'bg-rose-500/20 border-rose-500/50'
                          : `${bgCard} ${border}`
                      }`}
                      data-testid={`severity-${level.id}`}
                    >
                      <p className={`font-semibold text-sm ${
                        severity === level.id ? 'text-white' : textMuted
                      }`}>{level.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className={`${text} font-semibold mb-3`}>What happened?</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident in detail..."
                  className={`w-full h-28 ${isDarkMode ? 'bg-stone-900 border-stone-800 text-white placeholder:text-stone-500' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'} border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none`}
                  data-testid="incident-description"
                />
              </div>

              {/* Actions Taken */}
              <div>
                <h3 className={`${text} font-semibold mb-3`}>Actions Taken</h3>
                <textarea
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  placeholder="What steps did you take to address this?"
                  className={`w-full h-24 ${isDarkMode ? 'bg-stone-900 border-stone-800 text-white placeholder:text-stone-500' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'} border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none`}
                  data-testid="incident-actions"
                />
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className={`${text} font-semibold mb-2`}>Add Photos (Optional)</h3>
                <p className={`${textMuted} text-sm mb-4`}>Document the incident visually for records.</p>
              </div>
              
              {/* Photo Upload */}
              <label className="block cursor-pointer">
                <div className={`w-full p-8 border-2 border-dashed ${isDarkMode ? 'border-stone-700 hover:border-rose-500/50 hover:bg-rose-500/5' : 'border-stone-300 hover:border-rose-400 hover:bg-rose-50'} rounded-2xl flex flex-col items-center justify-center transition-colors`}>
                  <div className={`w-14 h-14 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'} rounded-xl flex items-center justify-center mb-3`}>
                    <Camera className={`w-7 h-7 ${textMuted}`} />
                  </div>
                  <p className={`${text} font-semibold`}>Tap to add photos</p>
                  <p className={`text-xs ${textMuted} mt-1`}>JPG, PNG up to 10MB each</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="photo-upload"
                />
              </label>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={photo.url} alt="Evidence" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className={`${text} font-semibold mb-4`}>Review & Submit</h3>
              
              {/* Summary Card */}
              <div className={`${bgCard} border ${border} rounded-2xl p-4 space-y-4`}>
                {/* Type & Severity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedType && (
                      <>
                        <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                          <selectedType.icon className="w-5 h-5 text-rose-400" />
                        </div>
                        <span className={`font-semibold ${text}`}>{selectedType.label}</span>
                      </>
                    )}
                  </div>
                  {selectedSeverity && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      severity === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                      severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {selectedSeverity.label.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Description */}
                {description && (
                  <div>
                    <p className={`text-xs ${textMuted} uppercase tracking-wider mb-1`}>Description</p>
                    <p className={`${textSecondary} text-sm`}>{description}</p>
                  </div>
                )}

                {/* Actions */}
                {actionsTaken && (
                  <div>
                    <p className={`text-xs ${textMuted} uppercase tracking-wider mb-1`}>Actions Taken</p>
                    <p className={`${textSecondary} text-sm`}>{actionsTaken}</p>
                  </div>
                )}

                {/* Photos */}
                {photos.length > 0 && (
                  <div>
                    <p className={`text-xs ${textMuted} uppercase tracking-wider mb-2`}>Photos ({photos.length})</p>
                    <div className="flex gap-2">
                      {photos.slice(0, 4).map((photo) => (
                        <img 
                          key={photo.id}
                          src={photo.url} 
                          alt="Evidence"
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ))}
                      {photos.length > 4 && (
                        <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'} flex items-center justify-center`}>
                          <span className={`${textMuted} text-sm font-bold`}>+{photos.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3">
                <button
                  onClick={() => setNotifyFamily(!notifyFamily)}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                    notifyFamily 
                      ? 'bg-[#25D366]/10 border-[#25D366]/30' 
                      : `${bgCard} ${border}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${notifyFamily ? 'text-[#25D366]' : textMuted}`} />
                    <span className={notifyFamily ? 'text-[#25D366] font-medium' : textSecondary}>Notify Family Member</span>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    notifyFamily ? 'bg-[#25D366] border-[#25D366]' : isDarkMode ? 'border-stone-600' : 'border-stone-400'
                  }`}>
                    {notifyFamily && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </button>

                <button
                  onClick={() => setFollowUpRequired(!followUpRequired)}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                    followUpRequired 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : `${bgCard} ${border}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${followUpRequired ? 'text-amber-400' : textMuted}`} />
                    <span className={followUpRequired ? 'text-amber-400 font-medium' : textSecondary}>Follow-up Required</span>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    followUpRequired ? 'bg-amber-500 border-amber-500' : isDarkMode ? 'border-stone-600' : 'border-stone-400'
                  }`}>
                    {followUpRequired && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} border-t ${border} p-4 flex gap-3`}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className={`flex-1 py-4 ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'} ${text} rounded-2xl font-semibold transition-colors`}
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !incidentType) || (step === 2 && (!severity || !description))}
              className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-semibold hover:bg-rose-600 transition-colors disabled:bg-stone-600 disabled:cursor-not-allowed"
              data-testid="incident-continue-btn"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-semibold hover:bg-rose-600 transition-colors disabled:bg-stone-600 flex items-center justify-center gap-2"
              data-testid="incident-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // History View (Default)
  return (
    <div className={`flex-1 overflow-y-auto ${bg} pb-24`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className={`text-2xl font-bold ${text} mb-1`}>Incidents</h1>
        <p className={`${textSecondary} text-sm`}>Report and track incidents for {patientName}</p>
      </div>

      {/* New Report Button */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setActiveView('new')}
          className="w-full p-5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl flex items-center justify-between shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          data-testid="new-incident-btn"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">New Incident Report</p>
              <p className="text-white/70 text-sm">Document an incident now</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70" />
        </button>
      </div>

      {/* Past Incidents */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className={`w-5 h-5 ${textMuted}`} />
          <h2 className={`font-semibold ${text}`}>Past Reports</h2>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-200 text-stone-600'}`}>
            {pastIncidents.length}
          </span>
        </div>

        {pastIncidents.length > 0 ? (
          <div className="space-y-3">
            {pastIncidents.map((incident) => {
              const type = INCIDENT_TYPES.find(t => t.id === incident.type);
              const severityLevel = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              const isExpanded = expandedIncident === incident.id;
              
              return (
                <div 
                  key={incident.id}
                  className={`${bgCard} border ${border} rounded-2xl overflow-hidden transition-all`}
                >
                  <button
                    onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                    className={`w-full p-4 flex items-center gap-4 text-left ${bgCardHover} transition-colors`}
                    data-testid={`incident-${incident.id}`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      incident.severity === 'critical' ? 'bg-rose-500/20' :
                      incident.severity === 'high' ? 'bg-orange-500/20' :
                      incident.severity === 'medium' ? 'bg-amber-500/20' :
                      'bg-emerald-500/20'
                    }`}>
                      {type && <type.icon className={`w-5 h-5 ${
                        incident.severity === 'critical' ? 'text-rose-400' :
                        incident.severity === 'high' ? 'text-orange-400' :
                        incident.severity === 'medium' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold ${text}`}>{type?.label || 'Incident'}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          incident.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                          incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          incident.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {severityLevel?.label.toUpperCase()}
                        </span>
                      </div>
                      <p className={`text-sm ${textMuted}`}>{incident.createdAt}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 ${textMuted} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 pt-0 space-y-3 border-t ${border} mt-0`}>
                      <div className="pt-3">
                        <p className={`text-xs ${textMuted} uppercase tracking-wider mb-1`}>Description</p>
                        <p className={`${textSecondary} text-sm`}>{incident.description}</p>
                      </div>
                      {incident.actionsTaken && (
                        <div>
                          <p className={`text-xs ${textMuted} uppercase tracking-wider mb-1`}>Actions Taken</p>
                          <p className={`${textSecondary} text-sm`}>{incident.actionsTaken}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          incident.status === 'resolved' 
                            ? 'bg-[#25D366]/20 text-[#25D366]' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {incident.status === 'resolved' ? 'Resolved' : 'Open'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`${bgCard} border ${border} rounded-3xl p-8 text-center`}>
            <div className={`w-16 h-16 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <AlertTriangle className={`w-8 h-8 ${textMuted}`} />
            </div>
            <h3 className={`font-semibold ${text} mb-1`}>No incidents reported</h3>
            <p className={`${textMuted} text-sm`}>
              Tap the button above to report a new incident
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportPage;

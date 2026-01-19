import React, { useState } from 'react';
import { 
  X, Camera, AlertTriangle, Clock, User, CheckCircle, 
  ChevronRight, Plus, Trash2, AlertCircle, Shield, Heart,
  Thermometer, Brain, Pill, HelpCircle
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

export const IncidentReportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  patientName = 'Patient'
}) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1); // 1: Type, 2: Details, 3: Photos, 4: Review
  const [incidentType, setIncidentType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [photos, setPhotos] = useState([]);
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const incident = {
      id: Date.now(),
      type: incidentType,
      severity,
      description,
      actionsTaken,
      photos,
      notifyFamily,
      followUpRequired,
      createdAt: new Date().toISOString(),
      createdBy: CAREGIVER_PROFILE,
      patientName,
      status: 'new'
    };
    
    onSubmit && onSubmit(incident);
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const selectedType = INCIDENT_TYPES.find(t => t.id === incidentType);
  const selectedSeverity = SEVERITY_LEVELS.find(s => s.id === severity);

  // Success Screen
  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 font-['Manrope',sans-serif]">
        <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#25D366]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-stone-400 mb-6">
            {notifyFamily 
              ? "The incident has been documented and the family has been notified."
              : "The incident has been documented successfully."}
          </p>
          <button
            onClick={handleClose}
            className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-bold hover:bg-[#20bd5a] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-end sm:items-center justify-center font-['Manrope',sans-serif]">
      <div 
        className="bg-stone-950 border border-stone-800 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 60px)', height: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-stone-900 border-b border-stone-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Incident Report</h2>
                <p className="text-xs text-stone-400">Step {step} of 4</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-stone-800 rounded-xl transition-colors">
              <X className="w-5 h-5 text-stone-400" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-rose-500' : 'bg-stone-700'
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
              <h3 className="text-white font-semibold mb-4">What type of incident occurred?</h3>
              {INCIDENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setIncidentType(type.id)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 ${
                    incidentType === type.id
                      ? `bg-${type.color}-500/20 border-${type.color}-500/50`
                      : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    incidentType === type.id ? `bg-${type.color}-500/30` : 'bg-stone-800'
                  }`}>
                    <type.icon className={`w-6 h-6 ${
                      incidentType === type.id ? `text-${type.color}-400` : 'text-stone-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${incidentType === type.id ? 'text-white' : 'text-stone-300'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-stone-500">{type.description}</p>
                  </div>
                  {incidentType === type.id && (
                    <CheckCircle className="w-5 h-5 text-[#25D366]" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Severity & Details */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Severity */}
              <div>
                <h3 className="text-white font-semibold mb-3">Severity Level</h3>
                <div className="grid grid-cols-2 gap-2">
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
                          : 'bg-stone-900 border-stone-800'
                      }`}
                    >
                      <p className={`font-semibold text-sm ${
                        severity === level.id ? 'text-white' : 'text-stone-400'
                      }`}>{level.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-white font-semibold mb-3">What happened?</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident in detail..."
                  className="w-full h-32 bg-stone-900 border border-stone-800 rounded-2xl p-4 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm"
                />
              </div>

              {/* Actions Taken */}
              <div>
                <h3 className="text-white font-semibold mb-3">Actions Taken</h3>
                <textarea
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  placeholder="What steps did you take to address this?"
                  className="w-full h-24 bg-stone-900 border border-stone-800 rounded-2xl p-4 text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Add Photos (Optional)</h3>
              <p className="text-sm text-stone-400">Document the incident with photos for the care record.</p>
              
              {/* Photo Upload Button */}
              <label className="block">
                <div className="w-full p-8 border-2 border-dashed border-stone-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-500/50 hover:bg-rose-500/5 transition-colors">
                  <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center mb-3">
                    <Camera className="w-7 h-7 text-stone-400" />
                  </div>
                  <p className="text-stone-300 font-medium">Tap to add photos</p>
                  <p className="text-xs text-stone-500 mt-1">JPG, PNG up to 10MB each</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
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
              <h3 className="text-white font-semibold mb-4">Review & Submit</h3>
              
              {/* Summary Card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4">
                {/* Type & Severity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedType && (
                      <>
                        <selectedType.icon className="w-5 h-5 text-rose-400" />
                        <span className="text-white font-medium">{selectedType.label}</span>
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
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-stone-300 text-sm">{description}</p>
                  </div>
                )}

                {/* Actions */}
                {actionsTaken && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Actions Taken</p>
                    <p className="text-stone-300 text-sm">{actionsTaken}</p>
                  </div>
                )}

                {/* Photos */}
                {photos.length > 0 && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Photos ({photos.length})</p>
                    <div className="flex gap-2">
                      {photos.slice(0, 4).map((photo) => (
                        <img 
                          key={photo.id}
                          src={photo.url} 
                          alt="Evidence"
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ))}
                      {photos.length > 4 && (
                        <div className="w-16 h-16 rounded-xl bg-stone-800 flex items-center justify-center">
                          <span className="text-stone-400 font-bold">+{photos.length - 4}</span>
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
                      : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${notifyFamily ? 'text-[#25D366]' : 'text-stone-500'}`} />
                    <span className={notifyFamily ? 'text-white' : 'text-stone-400'}>Notify Family</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    notifyFamily ? 'bg-[#25D366] border-[#25D366]' : 'border-stone-600'
                  }`}>
                    {notifyFamily && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </button>

                <button
                  onClick={() => setFollowUpRequired(!followUpRequired)}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                    followUpRequired 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className={`w-5 h-5 ${followUpRequired ? 'text-amber-400' : 'text-stone-500'}`} />
                    <span className={followUpRequired ? 'text-white' : 'text-stone-400'}>Follow-up Required</span>
                  </div>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                    followUpRequired ? 'bg-amber-500 border-amber-500' : 'border-stone-600'
                  }`}>
                    {followUpRequired && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none border-t border-stone-800 p-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3.5 bg-stone-800 text-white rounded-xl font-semibold hover:bg-stone-700 transition-colors"
            >
              Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !incidentType || step === 2 && (!severity || !description)}
              className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors disabled:bg-stone-700 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors disabled:bg-stone-700 flex items-center justify-center gap-2"
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
    </div>
  );
};

export default IncidentReportModal;

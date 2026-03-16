import React, { useState } from 'react';
import { 
  Camera, AlertTriangle, Clock, CheckCircle, Check,
  ChevronRight, Plus, Trash2, Shield, 
  Thermometer, Brain, Pill, HelpCircle, FileText, Info,
  Activity, Bandage, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Incident types with icons and colors matching mobile design
const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: AlertTriangle, description: 'Patient fall or near-fall' },
  { id: 'medication', label: 'Medication Issue', icon: Pill, description: 'Missed dose, wrong medication, or reaction' },
  { id: 'behavioral', label: 'Behavioral Change', icon: Activity, description: 'Confusion, agitation, or mood changes' },
  { id: 'injury', label: 'Injury', icon: Bandage, description: 'Cut, bruise, or other physical injury' },
  { id: 'vital', label: 'Vital Sign Concern', icon: Thermometer, description: 'Abnormal vital signs' },
  { id: 'other', label: 'Other', icon: HelpCircle, description: 'Other incident type' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
];

export const IncidentReportPage = ({ patientName = 'David Smith', incidents = [], onAddIncident }) => {
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('history'); // 'history' or 'new'
  const [step, setStep] = useState(1);
  const [incidentType, setIncidentType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [witnessNames, setWitnessNames] = useState('');
  const [noWitnesses, setNoWitnesses] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [notifyFamily, setNotifyFamily] = useState(true);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      type: incidentType,
      severity,
      description,
      actionsTaken,
      witnesses: noWitnesses ? 'No witnesses present' : witnessNames,
      photos: photos.map(p => ({ id: p.id, url: p.url, name: p.name })),
      notifyFamily,
      followUpRequired,
      patientName
    };
    
    if (onAddIncident) {
      onAddIncident(newIncident);
    }
    
    setIsSubmitting(false);
    setShowSuccessModal(true);
  };

  const resetForm = () => {
    setStep(1);
    setIncidentType(null);
    setSeverity(null);
    setDescription('');
    setActionsTaken('');
    setWitnessNames('');
    setNoWitnesses(false);
    setPhotos([]);
    setNotifyFamily(true);
    setFollowUpRequired(false);
    setShowSuccessModal(false);
    setActiveView('history');
  };

  const selectedType = INCIDENT_TYPES.find(t => t.id === incidentType);
  const selectedSeverity = SEVERITY_LEVELS.find(s => s.id === severity);

  // New Report View
  if (activeView === 'new') {
    return (
      <div className="flex-1 bg-black flex flex-col pb-20 font-['Manrope',sans-serif] relative">
        {/* Success Modal Overlay */}
        {showSuccessModal && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
            <div className="bg-[#2c2c2e] rounded-2xl p-6 w-full max-w-sm text-center">
              <h3 className="text-xl font-bold text-white mb-2">Success</h3>
              <p className="text-stone-400 text-base mb-4">
                Incident report submitted successfully.
                {notifyFamily && ' Family has been notified.'}
              </p>
              <button
                onClick={resetForm}
                className="w-full py-3 text-blue-500 font-semibold text-lg border-t border-stone-700"
                data-testid="incident-ok-btn"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-black px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#5c1a2a] rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#ff3b5c]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Incident Report</h2>
                <p className="text-sm text-stone-500">Step {step} of 5</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView('history')}
              className="px-5 py-2.5 bg-[#2c2c2e] rounded-xl text-base font-semibold text-white hover:bg-[#3c3c3e] transition-colors"
              data-testid="incident-cancel-btn"
            >
              Cancel
            </button>
          </div>
          
          {/* Progress Bar - 5 segments */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-[#ff3b5c]' : 'bg-[#2c2c2e]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* Step 1: Incident Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white mb-6">What type of incident occurred?</h3>
              {INCIDENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setIncidentType(type.id)}
                  className={`w-full p-4 rounded-2xl transition-all text-left flex items-center gap-4 ${
                    incidentType === type.id
                      ? 'bg-[#2c2c2e] ring-2 ring-[#ff3b5c]'
                      : 'bg-[#1c1c1e] hover:bg-[#2c2c2e]'
                  }`}
                  data-testid={`incident-type-${type.id}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    incidentType === type.id ? 'bg-[#3c3c3e]' : 'bg-[#2c2c2e]'
                  }`}>
                    <type.icon className={`w-7 h-7 ${
                      incidentType === type.id ? 'text-white' : 'text-stone-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-lg ${incidentType === type.id ? 'text-white' : 'text-white'}`}>
                      {type.label}
                    </p>
                    <p className="text-sm text-stone-500">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Severity & Details */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Severity */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Severity Level</h3>
                <div className="flex gap-2">
                  {SEVERITY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSeverity(level.id)}
                      className={`flex-1 py-3.5 px-3 rounded-xl text-center transition-all font-semibold ${
                        severity === level.id
                          ? 'bg-[#b45309] text-orange-200 ring-2 ring-orange-400'
                          : 'bg-[#2c2c2e] text-stone-400 hover:bg-[#3c3c3e]'
                      }`}
                      data-testid={`severity-${level.id}`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">What happened?</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident in detail..."
                  className="w-full h-32 bg-[#1c1c1e] text-white placeholder:text-stone-600 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-[#ff3b5c] resize-none"
                  style={{ fontSize: '16px' }}
                  data-testid="incident-description"
                />
              </div>

              {/* Actions Taken */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Actions Taken</h3>
                <textarea
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  placeholder="What steps did you take to address this?"
                  className="w-full h-28 bg-[#1c1c1e] text-white placeholder:text-stone-600 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-[#ff3b5c] resize-none"
                  style={{ fontSize: '16px' }}
                  data-testid="incident-actions"
                />
              </div>
            </div>
          )}

          {/* Step 3: Witness Information */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Witness Information</h3>
                <p className="text-stone-500 text-base">
                  Document any witnesses present during the incident for legal and record-keeping purposes.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-bold text-white mb-3">Witness Name(s)</h4>
                <textarea
                  value={witnessNames}
                  onChange={(e) => setWitnessNames(e.target.value)}
                  placeholder="Enter the names of any witnesses present..."
                  disabled={noWitnesses}
                  className={`w-full h-28 bg-[#1c1c1e] text-white placeholder:text-stone-600 rounded-2xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-[#ff3b5c] resize-none ${
                    noWitnesses ? 'opacity-50' : ''
                  }`}
                  style={{ fontSize: '16px' }}
                  data-testid="incident-witnesses"
                />
              </div>

              {/* Info Box */}
              <div className="bg-[#1a2a3a] border-l-4 border-blue-500 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-blue-200 text-sm leading-relaxed">
                  Include full names and their relationship to the patient if applicable (e.g., "John Smith - Family Visitor", "Jane Doe - Nurse on duty")
                </p>
              </div>

              {/* No Witnesses Checkbox */}
              <button
                onClick={() => setNoWitnesses(!noWitnesses)}
                className="flex items-center gap-3"
                data-testid="no-witnesses-checkbox"
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  noWitnesses 
                    ? 'bg-white border-white' 
                    : 'border-stone-600 bg-transparent'
                }`}>
                  {noWitnesses && <Check className="w-4 h-4 text-black" />}
                </div>
                <span className="text-white font-medium">No witnesses were present</span>
              </button>
            </div>
          )}

          {/* Step 4: Photos */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Add Photos (Optional)</h3>
                <p className="text-stone-500 text-base">Document the incident visually for records.</p>
              </div>
              
              {/* Photo Upload */}
              <label className="block cursor-pointer">
                <div className="w-full py-16 border-2 border-dashed border-stone-700 rounded-3xl flex flex-col items-center justify-center transition-colors hover:border-stone-600">
                  <div className="w-14 h-14 bg-[#2c2c2e] rounded-xl flex items-center justify-center mb-4">
                    <Camera className="w-7 h-7 text-stone-500" />
                  </div>
                  <p className="text-white font-semibold text-lg">Tap to add photo</p>
                  <p className="text-stone-500 text-sm mt-1">Take a photo for documentation</p>
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
                        className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-white">Review & Submit</h3>
              
              {/* Summary Card */}
              <div className="bg-[#1c1c1e] rounded-2xl p-5 space-y-4">
                {/* Type & Severity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedType && (
                      <>
                        <div className="w-12 h-12 bg-[#5c1a2a] rounded-2xl flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-[#ff3b5c]" />
                        </div>
                        <span className="font-bold text-lg text-white">{selectedType.label}</span>
                      </>
                    )}
                  </div>
                  {selectedSeverity && (
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                      severity === 'low' ? 'bg-emerald-900/50 text-emerald-400' :
                      severity === 'medium' ? 'bg-amber-900/50 text-amber-400' :
                      severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                      'bg-rose-900/50 text-rose-400'
                    }`}>
                      {selectedSeverity.label.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Description */}
                {description && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Description</p>
                    <p className="text-white text-base">{description}</p>
                  </div>
                )}

                {/* Actions */}
                {actionsTaken && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Actions Taken</p>
                    <p className="text-white text-base">{actionsTaken}</p>
                  </div>
                )}

                {/* Witnesses */}
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Witnesses</p>
                  <p className="text-white text-base">
                    {noWitnesses ? 'No witnesses present' : (witnessNames || 'Not provided')}
                  </p>
                </div>

                {/* Photos */}
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-1">Photos ({photos.length})</p>
                  {photos.length > 0 ? (
                    <div className="flex gap-2 mt-2">
                      {photos.slice(0, 4).map((photo) => (
                        <img 
                          key={photo.id}
                          src={photo.url} 
                          alt="Evidence"
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ))}
                      {photos.length > 4 && (
                        <div className="w-14 h-14 rounded-xl bg-[#2c2c2e] flex items-center justify-center">
                          <span className="text-stone-400 text-sm font-bold">+{photos.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-stone-500 text-base">No photos attached</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {/* Notify Family */}
                <button
                  onClick={() => setNotifyFamily(!notifyFamily)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-colors ${
                    notifyFamily 
                      ? 'bg-[#0d3320]' 
                      : 'bg-[#1c1c1e]'
                  }`}
                  data-testid="notify-family-toggle"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      notifyFamily ? 'bg-[#166534]' : 'bg-[#2c2c2e]'
                    }`}>
                      <Shield className={`w-6 h-6 ${notifyFamily ? 'text-[#22c55e]' : 'text-stone-500'}`} />
                    </div>
                    <span className={`font-semibold text-base ${notifyFamily ? 'text-white' : 'text-stone-400'}`}>
                      Notify Family Member
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    notifyFamily ? 'bg-[#22c55e]' : 'border-2 border-stone-600'
                  }`}>
                    {notifyFamily && <Check className="w-5 h-5 text-white" />}
                  </div>
                </button>

                {/* Follow-up Required */}
                <button
                  onClick={() => setFollowUpRequired(!followUpRequired)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-colors ${
                    followUpRequired 
                      ? 'bg-[#0d3320]' 
                      : 'bg-[#1c1c1e]'
                  }`}
                  data-testid="followup-toggle"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      followUpRequired ? 'bg-[#166534]' : 'bg-[#2c2c2e]'
                    }`}>
                      <Clock className={`w-6 h-6 ${followUpRequired ? 'text-[#22c55e]' : 'text-stone-500'}`} />
                    </div>
                    <span className={`font-semibold text-base ${followUpRequired ? 'text-white' : 'text-stone-400'}`}>
                      Follow-up Required
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    followUpRequired ? 'bg-[#22c55e]' : 'border-2 border-stone-600'
                  }`}>
                    {followUpRequired && <Check className="w-5 h-5 text-white" />}
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-black px-5 py-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 bg-[#2c2c2e] text-white rounded-2xl font-bold text-base hover:bg-[#3c3c3e] transition-colors"
              data-testid="incident-back-btn"
            >
              Back
            </button>
          )}
          
          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !incidentType) || (step === 2 && (!severity || !description))}
              className={`flex-1 py-4 rounded-2xl font-bold text-base transition-colors ${
                step === 1 && !incidentType
                  ? 'bg-[#3c3c3e] text-stone-500 cursor-not-allowed'
                  : 'bg-[#ff3b5c] text-white hover:bg-[#e0354f]'
              }`}
              data-testid="incident-continue-btn"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-[#ff3b5c] text-white rounded-2xl font-bold text-base hover:bg-[#e0354f] transition-colors disabled:bg-[#3c3c3e] flex items-center justify-center gap-2"
              data-testid="incident-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Incident Report'
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // History View (Default)
  return (
    <div className="flex-1 overflow-y-auto bg-black pb-24 font-['Manrope',sans-serif]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-white mb-1">Incidents</h1>
        <p className="text-stone-500 text-base">Report and track incidents for {patientName}</p>
      </div>

      {/* New Report Button */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setActiveView('new')}
          className="w-full p-5 bg-gradient-to-r from-[#be185d] to-[#9d174d] rounded-2xl flex items-center justify-between shadow-lg"
          data-testid="new-incident-btn"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg">New Incident Report</p>
              <p className="text-white/70 text-sm">Document an incident now</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70" />
        </button>
      </div>

      {/* Past Incidents */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-stone-500" />
          <h2 className="font-bold text-white text-lg">Past Reports</h2>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2c2c2e] text-stone-400">
            {incidents.length}
          </span>
        </div>

        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map((incident) => {
              const type = INCIDENT_TYPES.find(t => t.id === incident.type);
              const severityLevel = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              
              return (
                <div 
                  key={incident.id}
                  className="bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4"
                  data-testid={`incident-${incident.id}`}
                >
                  <div className="w-12 h-12 bg-[#5c1a2a] rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-[#ff3b5c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-base">{type?.label || 'Incident'}</p>
                    <p className="text-sm text-stone-500">{incident.createdAt}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    incident.severity === 'critical' ? 'bg-rose-900/50 text-rose-400' :
                    incident.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                    incident.severity === 'medium' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-emerald-900/50 text-emerald-400'
                  }`}>
                    {severityLevel?.label.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#1c1c1e] rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-[#2c2c2e] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-stone-500" />
            </div>
            <h3 className="font-bold text-white mb-1">No incidents reported</h3>
            <p className="text-stone-500 text-sm">
              Tap the button above to report a new incident
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportPage;

import React, { useState } from 'react';
import { 
  Camera, AlertTriangle, Clock, Check,
  ChevronRight, Plus, Trash2, Shield, 
  Thermometer, Activity, Pill, HelpCircle, FileText, Info,
  Bandage
} from 'lucide-react';

// Incident types matching mobile design exactly
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
  const [activeView, setActiveView] = useState('history');
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

  // New Report View - Exact replica of mobile app
  if (activeView === 'new') {
    return (
      <>
        {/* Hide the bottom navigation when showing the new report form */}
        <style>{`
          nav.fixed.bottom-0 { display: none !important; }
        `}</style>
        <div className="fixed inset-0 bg-black flex flex-col font-['Manrope',sans-serif] z-40">
          {/* Success Modal Overlay */}
          {showSuccessModal && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-6">
              <div className="bg-[#2c2c2e] rounded-2xl w-full max-w-[280px] text-center overflow-hidden">
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2">Success</h3>
                  <p className="text-[#8e8e93] text-[15px] leading-relaxed">
                    Incident report submitted successfully.
                    {notifyFamily && ' Family has been notified.'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="w-full py-3 text-[#0a84ff] font-semibold text-[17px] border-t border-[#3c3c3e]"
                  data-testid="incident-ok-btn"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* Header - Matches mobile exactly */}
          <div className="flex-shrink-0 px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#5c1a2a] rounded-[14px] flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[#ff453a]" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-white leading-tight">New Incident Report</h2>
                  <p className="text-[15px] text-[#8e8e93]">Step {step} of 5</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveView('history')}
                className="px-5 py-2.5 bg-[#3a3a3c] rounded-full text-[15px] font-semibold text-white"
                data-testid="incident-cancel-btn"
              >
                Cancel
              </button>
            </div>
            
            {/* Progress Bar - 5 segments with gaps */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div 
                  key={s}
                  className={`h-[3px] flex-1 rounded-full ${
                    s <= step ? 'bg-[#ff375f]' : 'bg-[#3a3a3c]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
            {/* Step 1: Incident Type */}
            {step === 1 && (
              <div>
                <h3 className="text-[28px] font-bold text-white mb-5 leading-tight">What type of incident occurred?</h3>
                <div className="space-y-3">
                  {INCIDENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setIncidentType(type.id)}
                      className={`w-full p-4 rounded-2xl transition-all text-left flex items-center gap-4 ${
                        incidentType === type.id ? 'bg-[#3a3a3c]' : 'bg-[#2c2c2e]'
                      }`}
                      data-testid={`incident-type-${type.id}`}
                    >
                      <div className="w-12 h-12 bg-[#3a3a3c] rounded-xl flex items-center justify-center">
                        <type.icon className="w-6 h-6 text-[#8e8e93]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[17px] text-white">{type.label}</p>
                        <p className="text-[15px] text-[#8e8e93] leading-snug">{type.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Severity & Details */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Severity */}
                <div>
                  <h3 className="text-[17px] font-bold text-white mb-3">Severity Level</h3>
                  <div className="flex gap-2">
                    {SEVERITY_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setSeverity(level.id)}
                        className={`flex-1 py-3 px-2 rounded-xl text-center transition-all font-semibold text-[15px] ${
                          severity === level.id
                            ? 'bg-[#9a4f00] text-[#ff9f0a] ring-2 ring-[#ff9f0a]'
                            : 'bg-[#2c2c2e] text-[#8e8e93]'
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
                  <h3 className="text-[17px] font-bold text-white mb-3">What happened?</h3>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the incident in detail..."
                    className="w-full h-32 bg-[#2c2c2e] text-white placeholder:text-[#636366] rounded-2xl p-4 text-[17px] focus:outline-none resize-none"
                    style={{ fontSize: '16px' }}
                    data-testid="incident-description"
                  />
                </div>

                {/* Actions Taken */}
                <div>
                  <h3 className="text-[17px] font-bold text-white mb-3">Actions Taken</h3>
                  <textarea
                    value={actionsTaken}
                    onChange={(e) => setActionsTaken(e.target.value)}
                    placeholder="What steps did you take to address this?"
                    className="w-full h-28 bg-[#2c2c2e] text-white placeholder:text-[#636366] rounded-2xl p-4 text-[17px] focus:outline-none resize-none"
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
                  <h3 className="text-[28px] font-bold text-white mb-2 leading-tight">Witness Information</h3>
                  <p className="text-[#8e8e93] text-[15px] leading-relaxed">
                    Document any witnesses present during the incident for legal and record-keeping purposes.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-[17px] font-bold text-white mb-3">Witness Name(s)</h4>
                  <textarea
                    value={noWitnesses ? 'No witnesses present' : witnessNames}
                    onChange={(e) => setWitnessNames(e.target.value)}
                    placeholder="Enter the names of any witnesses present..."
                    disabled={noWitnesses}
                    className={`w-full h-28 bg-[#2c2c2e] text-white placeholder:text-[#636366] rounded-2xl p-4 text-[17px] focus:outline-none resize-none ${
                      noWitnesses ? 'opacity-70' : ''
                    }`}
                    style={{ fontSize: '16px' }}
                    data-testid="incident-witnesses"
                  />
                </div>

                {/* Info Box - Blue themed */}
                <div className="bg-[#1c3a5e] border-l-4 border-[#0a84ff] rounded-xl p-4 flex gap-3">
                  <Info className="w-5 h-5 text-[#0a84ff] flex-shrink-0 mt-0.5" />
                  <p className="text-[#8cb4e0] text-[14px] leading-relaxed">
                    Include full names and their relationship to the patient if applicable (e.g., "John Smith - Family Visitor", "Jane Doe - Nurse on duty")
                  </p>
                </div>

                {/* No Witnesses Checkbox - Green when checked */}
                <button
                  onClick={() => setNoWitnesses(!noWitnesses)}
                  className="flex items-center gap-3"
                  data-testid="no-witnesses-checkbox"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    noWitnesses 
                      ? 'bg-[#30d158]' 
                      : 'border-2 border-[#636366] bg-transparent'
                  }`}>
                    {noWitnesses && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-white text-[17px]">No witnesses were present</span>
                </button>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[28px] font-bold text-white mb-2 leading-tight">Add Photos (Optional)</h3>
                  <p className="text-[#8e8e93] text-[15px]">Document the incident visually for records.</p>
                </div>
                
                {/* Photo Upload Area */}
                <label className="block cursor-pointer">
                  <div className="w-full py-20 border-2 border-dashed border-[#48484a] rounded-2xl flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-[#3a3a3c] rounded-xl flex items-center justify-center mb-3">
                      <Camera className="w-6 h-6 text-[#636366]" />
                    </div>
                    <p className="text-[#636366] font-semibold text-[17px]">Tap to add photo</p>
                    <p className="text-[#48484a] text-[14px] mt-1">Take a photo for documentation</p>
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
                          className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center"
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
              <div className="space-y-4">
                <h3 className="text-[28px] font-bold text-white leading-tight">Review & Submit</h3>
                
                {/* Summary Card */}
                <div className="bg-[#2c2c2e] rounded-2xl p-5 space-y-4">
                  {/* Type & Severity Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#5c1a2a] rounded-[14px] flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-[#ff453a]" />
                      </div>
                      <span className="font-bold text-[18px] text-white">{selectedType?.label}</span>
                    </div>
                    {selectedSeverity && (
                      <span className={`px-3 py-1.5 rounded-lg text-[13px] font-bold ${
                        severity === 'low' ? 'bg-[#1c4428] text-[#30d158]' :
                        severity === 'medium' ? 'bg-[#4a3800] text-[#ffd60a]' :
                        severity === 'high' ? 'bg-[#5c3d0a] text-[#ff9f0a]' :
                        'bg-[#5c1a2a] text-[#ff453a]'
                      }`}>
                        {selectedSeverity.label.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {description && (
                    <div>
                      <p className="text-[12px] text-[#636366] uppercase tracking-wider font-bold mb-1">Description</p>
                      <p className="text-white text-[15px]">{description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {actionsTaken && (
                    <div>
                      <p className="text-[12px] text-[#636366] uppercase tracking-wider font-bold mb-1">Actions Taken</p>
                      <p className="text-white text-[15px]">{actionsTaken}</p>
                    </div>
                  )}

                  {/* Witnesses */}
                  <div>
                    <p className="text-[12px] text-[#636366] uppercase tracking-wider font-bold mb-1">Witnesses</p>
                    <p className="text-white text-[15px]">
                      {noWitnesses ? 'No witnesses present' : (witnessNames || 'Not provided')}
                    </p>
                  </div>

                  {/* Photos */}
                  <div>
                    <p className="text-[12px] text-[#636366] uppercase tracking-wider font-bold mb-1">Photos ({photos.length})</p>
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
                      </div>
                    ) : (
                      <p className="text-[#636366] text-[15px]">No photos attached</p>
                    )}
                  </div>
                </div>

                {/* Toggle Options - Matching mobile exactly */}
                <div className="space-y-3">
                  {/* Notify Family - Green themed when active */}
                  <button
                    onClick={() => setNotifyFamily(!notifyFamily)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-colors ${
                      notifyFamily ? 'bg-[#0d3320]' : 'bg-[#2c2c2e]'
                    }`}
                    data-testid="notify-family-toggle"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        notifyFamily ? 'bg-[#1a5c35]' : 'bg-[#3a3a3c]'
                      }`}>
                        <Shield className={`w-5 h-5 ${notifyFamily ? 'text-[#30d158]' : 'text-[#8e8e93]'}`} />
                      </div>
                      <span className={`font-semibold text-[17px] ${notifyFamily ? 'text-white' : 'text-[#8e8e93]'}`}>
                        Notify Family Member
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      notifyFamily ? 'bg-[#30d158]' : 'border-2 border-[#636366]'
                    }`}>
                      {notifyFamily && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                  </button>

                  {/* Follow-up Required - Gray when inactive */}
                  <button
                    onClick={() => setFollowUpRequired(!followUpRequired)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-colors ${
                      followUpRequired ? 'bg-[#0d3320]' : 'bg-[#2c2c2e]'
                    }`}
                    data-testid="followup-toggle"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        followUpRequired ? 'bg-[#1a5c35]' : 'bg-[#3a3a3c]'
                      }`}>
                        <Clock className={`w-5 h-5 ${followUpRequired ? 'text-[#30d158]' : 'text-[#8e8e93]'}`} />
                      </div>
                      <span className={`font-semibold text-[17px] ${followUpRequired ? 'text-white' : 'text-[#8e8e93]'}`}>
                        Follow-up Required
                      </span>
                    </div>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      followUpRequired ? 'bg-[#30d158]' : 'border-2 border-[#636366]'
                    }`}>
                      {followUpRequired && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation - Fixed at bottom */}
          <div className="flex-shrink-0 px-4 py-4 flex gap-3 bg-black border-t border-[#2c2c2e]">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-4 bg-[#2c2c2e] text-white rounded-xl font-bold text-[17px]"
                data-testid="incident-back-btn"
              >
                Back
              </button>
            )}
            
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !incidentType) || (step === 2 && (!severity || !description))}
                className={`flex-1 py-4 rounded-xl font-bold text-[17px] transition-colors ${
                  (step === 1 && !incidentType) || (step === 2 && (!severity || !description))
                    ? 'bg-[#3a3a3c] text-[#636366]'
                    : 'bg-[#ff375f] text-white'
                }`}
                data-testid="incident-continue-btn"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#ff375f] text-white rounded-xl font-bold text-[17px] flex items-center justify-center gap-2"
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
      </>
    );
  }

  // History View (Default) - Exact replica of mobile
  return (
    <div className="flex-1 overflow-y-auto bg-black font-['Manrope',sans-serif]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-[34px] font-bold text-white mb-1 leading-tight">Incidents</h1>
        <p className="text-[#8e8e93] text-[15px]">Report and track incidents for {patientName}</p>
      </div>

      {/* New Report Button - Pink gradient matching mobile */}
      <div className="px-4 mb-5">
        <button
          onClick={() => setActiveView('new')}
          className="w-full p-4 bg-gradient-to-r from-[#c41b5e] to-[#a01550] rounded-2xl flex items-center justify-between"
          data-testid="new-incident-btn"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-[17px]">New Incident Report</p>
              <p className="text-white/70 text-[14px]">Document an incident now</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70" />
        </button>
      </div>

      {/* Past Incidents */}
      <div className="px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8e8e93]" />
            <h2 className="font-bold text-white text-[17px]">Past Reports</h2>
          </div>
          <span className="w-6 h-6 rounded-full bg-[#3a3a3c] flex items-center justify-center text-[13px] font-bold text-[#8e8e93]">
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
                  className="bg-[#2c2c2e] rounded-2xl p-4 flex items-center gap-4"
                  data-testid={`incident-${incident.id}`}
                >
                  <div className="w-11 h-11 bg-[#5c1a2a] rounded-[14px] flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#ff453a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-[17px]">{type?.label || 'Incident'}</p>
                    <p className="text-[14px] text-[#8e8e93]">{incident.createdAt}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-[13px] font-bold ${
                    incident.severity === 'critical' ? 'bg-[#5c1a2a] text-[#ff453a]' :
                    incident.severity === 'high' ? 'bg-[#5c3d0a] text-[#ff9f0a]' :
                    incident.severity === 'medium' ? 'bg-[#4a3800] text-[#ffd60a]' :
                    'bg-[#1c4428] text-[#30d158]'
                  }`}>
                    {severityLevel?.label.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#2c2c2e] rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-[#3a3a3c] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-7 h-7 text-[#636366]" />
            </div>
            <h3 className="font-bold text-white text-[17px] mb-1">No incidents reported</h3>
            <p className="text-[#8e8e93] text-[15px]">
              Tap the button above to report a new incident
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportPage;

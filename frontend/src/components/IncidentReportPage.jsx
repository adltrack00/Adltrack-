import React, { useState } from 'react';
import { 
  Camera, AlertTriangle, Clock, Check,
  ChevronRight, Plus, Trash2, 
  Thermometer, Activity, Pill, HelpCircle, FileText,
  Bandage, X
} from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: AlertTriangle, description: 'Patient fall or near-fall' },
  { id: 'medication', label: 'Medication Issue', icon: Pill, description: 'Missed dose, wrong medication, or reaction' },
  { id: 'behavioral', label: 'Behavioral Change', icon: Activity, description: 'Confusion, agitation, or mood changes' },
  { id: 'injury', label: 'Injury', icon: Bandage, description: 'Cut, bruise, or other physical injury' },
  { id: 'vital', label: 'Vital Sign Concern', icon: Thermometer, description: 'Abnormal vital signs' },
  { id: 'other', label: 'Other', icon: HelpCircle, description: 'Other incident type' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', color: 'bg-green-600' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-600' },
  { id: 'high', label: 'High', color: 'bg-orange-600' },
  { id: 'critical', label: 'Critical', color: 'bg-red-600' },
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
  const [showSuccess, setShowSuccess] = useState(false);

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
      witnesses: noWitnesses ? 'No witnesses present' : witnessNames,
      photos: photos.length,
      notifyFamily,
      followUpRequired,
      patientName,
      createdAt: new Date().toLocaleString()
    };
    
    if (onAddIncident) {
      onAddIncident(newIncident);
    }
    
    setIsSubmitting(false);
    setShowSuccess(true);
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
    setShowSuccess(false);
    setActiveView('history');
  };

  const selectedType = INCIDENT_TYPES.find(t => t.id === incidentType);
  const selectedSeverity = SEVERITY_LEVELS.find(s => s.id === severity);

  // New Report Form
  if (activeView === 'new') {
    return (
      <div className="flex-1 bg-black flex flex-col pb-20 font-['Manrope',sans-serif]">
        {/* Success Screen */}
        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
            <p className="text-stone-400 mb-8">
              Your incident report has been submitted successfully.
              {notifyFamily && ' Family members have been notified.'}
            </p>
            <button
              onClick={resetForm}
              className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-[#3d1a1a] rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-[#ff453a]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">New Incident Report</h2>
                    <p className="text-sm text-stone-400">Step {step} of 5</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveView('history')}
                  className="px-5 py-2.5 bg-[#2c2c2e] rounded-xl text-base font-semibold text-white"
                >
                  Cancel
                </button>
              </div>
              
              {/* Progress */}
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s}
                    className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-[#ff375f]' : 'bg-stone-700'}`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {/* Step 1: Type */}
              {step === 1 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-5">What type of incident?</h3>
                  <div className="space-y-3">
                    {INCIDENT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setIncidentType(type.id)}
                        className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-colors ${
                          incidentType === type.id
                            ? 'bg-[#3d1a1a] border-2 border-[#ff453a]'
                            : 'bg-stone-900 border border-stone-800'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          incidentType === type.id ? 'bg-[#5c1a1a]' : 'bg-stone-800'
                        }`}>
                          <type.icon className={`w-7 h-7 ${incidentType === type.id ? 'text-[#ff453a]' : 'text-white'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">{type.label}</p>
                          <p className="text-sm text-stone-400">{type.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Severity & Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Severity Level</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {SEVERITY_LEVELS.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setSeverity(level.id)}
                          className={`py-3 rounded-xl text-center font-medium transition-colors ${
                            severity === level.id
                              ? `${level.color} text-white`
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">What happened?</h3>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the incident..."
                      className={`w-full h-32 bg-stone-900 rounded-xl p-4 text-white placeholder:text-stone-500 focus:outline-none ${
                        description ? 'border-2 border-[#ff375f]' : 'border border-stone-800'
                      }`}
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Actions Taken</h3>
                    <textarea
                      value={actionsTaken}
                      onChange={(e) => setActionsTaken(e.target.value)}
                      placeholder="What did you do to address this?"
                      className={`w-full h-28 bg-stone-900 rounded-xl p-4 text-white placeholder:text-stone-500 focus:outline-none ${
                        actionsTaken ? 'border-2 border-[#ff375f]' : 'border border-stone-800'
                      }`}
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Witnesses */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Witness Information</h3>
                    <p className="text-stone-400">
                      Document any witnesses present during the incident for legal and record-keeping purposes.
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-base font-semibold text-white mb-3 block">Witness Name(s)</label>
                    <textarea
                      value={witnessNames}
                      onChange={(e) => setWitnessNames(e.target.value)}
                      placeholder="Enter the names of any witnesses present..."
                      disabled={noWitnesses}
                      className={`w-full h-32 bg-stone-900 rounded-xl p-4 text-white placeholder:text-stone-500 focus:outline-none ${
                        noWitnesses ? 'opacity-50' : ''
                      } ${witnessNames && !noWitnesses ? 'border-2 border-[#ff375f]' : 'border border-stone-800'}`}
                      style={{ fontSize: '16px' }}
                    />
                  </div>

                  {/* Info box */}
                  <div className="bg-[#1a2a3a] rounded-xl p-4 flex gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-stone-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-stone-500 text-sm font-bold">i</span>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      Include full names and their relationship to the patient if applicable (e.g., "John Smith - Family Visitor", "Jane Doe - Nurse on duty")
                    </p>
                  </div>

                  <button
                    onClick={() => setNoWitnesses(!noWitnesses)}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      noWitnesses ? 'bg-emerald-500 border-emerald-500' : 'border-stone-600'
                    }`}>
                      {noWitnesses && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-white">No witnesses were present</span>
                  </button>
                </div>
              )}

              {/* Step 4: Photos */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Add Photos (Optional)</h3>
                    <p className="text-stone-400 text-sm">Document the incident visually.</p>
                  </div>
                  
                  <label className="block cursor-pointer">
                    <div className="w-full py-12 border-2 border-dashed border-stone-700 rounded-xl flex flex-col items-center justify-center hover:border-stone-600">
                      <Camera className="w-10 h-10 text-stone-500 mb-3" />
                      <p className="text-stone-400 font-medium">Tap to add photo</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                          <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
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
                  <h3 className="text-lg font-bold text-white">Review & Submit</h3>
                  
                  <div className="bg-stone-900 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      {selectedType && (
                        <>
                          <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center">
                            <selectedType.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-white">{selectedType.label}</span>
                        </>
                      )}
                      {selectedSeverity && (
                        <span className={`ml-auto px-3 py-1 rounded-lg text-sm font-medium ${selectedSeverity.color} text-white`}>
                          {selectedSeverity.label}
                        </span>
                      )}
                    </div>

                    {description && (
                      <div>
                        <p className="text-xs text-stone-500 uppercase mb-1">Description</p>
                        <p className="text-stone-300 text-sm">{description}</p>
                      </div>
                    )}

                    {actionsTaken && (
                      <div>
                        <p className="text-xs text-stone-500 uppercase mb-1">Actions Taken</p>
                        <p className="text-stone-300 text-sm">{actionsTaken}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-stone-500 uppercase mb-1">Witnesses</p>
                      <p className="text-stone-300 text-sm">
                        {noWitnesses ? 'No witnesses present' : (witnessNames || 'Not provided')}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500 uppercase mb-1">Photos</p>
                      <p className="text-stone-300 text-sm">{photos.length} attached</p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setNotifyFamily(!notifyFamily)}
                      className="w-full p-4 bg-stone-900 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-white">Notify Family</span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        notifyFamily ? 'bg-emerald-500 border-emerald-500' : 'border-stone-600'
                      }`}>
                        {notifyFamily && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>

                    <button
                      onClick={() => setFollowUpRequired(!followUpRequired)}
                      className="w-full p-4 bg-stone-900 rounded-xl flex items-center justify-between"
                    >
                      <span className="text-white">Follow-up Required</span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        followUpRequired ? 'bg-emerald-500 border-emerald-500' : 'border-stone-600'
                      }`}>
                        {followUpRequired && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 flex gap-3 border-t border-stone-800">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 bg-stone-800 text-white rounded-xl font-semibold"
                >
                  Back
                </button>
              )}
              
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 1 && !incidentType) || (step === 2 && (!severity || !description))}
                  className={`flex-1 py-3 rounded-xl font-semibold ${
                    (step === 1 && !incidentType) || (step === 2 && (!severity || !description))
                      ? 'bg-stone-700 text-stone-500'
                      : 'bg-[#ff375f] text-white'
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#ff375f] text-white rounded-xl font-semibold flex items-center justify-center gap-2"
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
          </>
        )}
      </div>
    );
  }

  // History View
  return (
    <div className="flex-1 overflow-y-auto bg-black pb-24 font-['Manrope',sans-serif]">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Incidents</h1>
        <p className="text-stone-500 text-sm">Report and track incidents for {patientName}</p>
      </div>

      <div className="px-5 mb-5">
        <button
          onClick={() => setActiveView('new')}
          className="w-full p-5 bg-[#c41b5e] rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">New Incident Report</p>
              <p className="text-white/70 text-base">Document an incident now</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/70" />
        </button>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-stone-500" />
            <h2 className="font-bold text-white text-lg">Past Reports</h2>
          </div>
          <span className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-sm font-bold text-stone-400">
            {incidents.length}
          </span>
        </div>

        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map((incident) => {
              const type = INCIDENT_TYPES.find(t => t.id === incident.type);
              const sev = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              
              return (
                <div key={incident.id} className="bg-stone-900 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center">
                    {type && <type.icon className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{type?.label || 'Incident'}</p>
                    <p className="text-xs text-stone-500">{incident.createdAt}</p>
                  </div>
                  {sev && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${sev.color} text-white`}>
                      {sev.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#1c1c1e] rounded-2xl p-10 text-center">
            <div className="w-20 h-20 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-white font-bold text-lg mb-1">No incidents reported</p>
            <p className="text-stone-500">Tap the button above to report a new incident</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportPage;

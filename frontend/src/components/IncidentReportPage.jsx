import React, { useState } from 'react';
import {
  Camera, AlertTriangle, Clock, Check,
  ChevronRight, Plus, Trash2, Shield,
  Thermometer, Activity, Pill, HelpCircle, FileText,
  Bandage
} from 'lucide-react';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
  shadowMd: '0 10px 30px -10px rgba(0,0,0,0.10)',
};

const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: AlertTriangle, description: 'Patient fall or near-fall' },
  { id: 'medication', label: 'Medication Issue', icon: Pill, description: 'Missed dose, wrong medication, or reaction' },
  { id: 'behavioral', label: 'Behavioral Change', icon: Activity, description: 'Confusion, agitation, or mood changes' },
  { id: 'injury', label: 'Injury', icon: Bandage, description: 'Cut, bruise, or other physical injury' },
  { id: 'vital', label: 'Vital Sign Concern', icon: Thermometer, description: 'Abnormal vital signs' },
  { id: 'other', label: 'Other', icon: HelpCircle, description: 'Other incident type' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', bg: 'rgba(22,163,74,0.10)', text: '#15803d' },
  { id: 'medium', label: 'Medium', bg: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
  { id: 'high', label: 'High', bg: 'rgba(249,115,22,0.12)', text: '#fb923c' },
  { id: 'critical', label: 'Critical', bg: 'rgba(244,63,94,0.12)', text: '#f43f5e' },
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
      reader.onloadend = () => setPhotos(prev => [...prev, { id: Date.now(), url: reader.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  const handleNext = () => { if (step < 5) { window.scrollTo(0, 0); setStep(step + 1); } };
  const handleBack = () => { if (step > 1) { window.scrollTo(0, 0); setStep(step - 1); } };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newIncident = {
      id: Date.now(), type: incidentType, severity, description, actionsTaken,
      witnesses: noWitnesses ? 'No witnesses present' : witnessNames,
      photos, notifyFamily, followUpRequired, patientName,
      createdAt: new Date().toLocaleString()
    };
    if (onAddIncident) onAddIncident(newIncident);
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setStep(1); setIncidentType(null); setSeverity(null); setDescription('');
    setActionsTaken(''); setWitnessNames(''); setNoWitnesses(false);
    setPhotos([]); setNotifyFamily(true); setFollowUpRequired(false);
    setShowSuccess(false); setActiveView('history');
  };

  const isNextDisabled = () => {
    if (step === 1 && !incidentType) return true;
    if (step === 2 && (!severity || !description)) return true;
    return false;
  };

  const selectedType = INCIDENT_TYPES.find(t => t.id === incidentType);
  const selectedSeverity = SEVERITY_LEVELS.find(s => s.id === severity);

  // New Report Form
  if (activeView === 'new') {
    return (
      <div
        className="fixed inset-0 z-[70] font-['Manrope',sans-serif] flex flex-col"
        style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }}
        data-testid="incident-form-overlay"
      >
        {/* Success Screen */}
        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: D.h }}>Report Submitted</h2>
            <p className="mb-8" style={{ color: D.body }}>
              Your incident report has been submitted successfully.
              {notifyFamily && ' Family members have been notified.'}
            </p>
            <button
              onClick={resetForm}
              className="px-8 py-3 text-white rounded-xl font-semibold"
              style={{ background: D.brand }}
              data-testid="incident-done-btn"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex-none px-5 py-4" style={{ borderBottom: `1px solid ${D.bdr}`, background: D.card }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: D.h }}>New Incident Report</h2>
                  <p className="text-sm" style={{ color: D.muted }}>Step {step} of 5</p>
                </div>
                <button
                  onClick={() => { window.scrollTo(0, 0); setActiveView('history'); }}
                  className="px-5 py-2.5 rounded-xl text-base font-semibold"
                  style={{ background: D.bg, border: `1px solid ${D.bdr}`, color: D.body }}
                  data-testid="incident-cancel-btn"
                >
                  Cancel
                </button>
              </div>
              {/* Progress */}
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full"
                    style={{ background: s <= step ? '#f43f5e' : D.bdr }}
                  />
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 py-6">

                {/* Step 1: Type */}
                {step === 1 && (
                  <div data-testid="incident-step-1">
                    <h3 className="text-[22px] font-semibold mb-5" style={{ color: D.h }}>What type of incident?</h3>
                    <div className="space-y-3">
                      {INCIDENT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setIncidentType(type.id)}
                          className="w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-colors"
                          style={{
                            background: incidentType === type.id ? 'rgba(244,63,94,0.06)' : D.card,
                            border: incidentType === type.id ? '2px solid #ef4444' : `2px solid ${D.bdr}`,
                          }}
                          data-testid={`incident-type-${type.id}`}
                        >
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: incidentType === type.id ? 'rgba(244,63,94,0.12)' : D.bg, border: `1px solid ${incidentType === type.id ? 'rgba(244,63,94,0.22)' : D.bdr}` }}
                          >
                            <type.icon className="w-6 h-6" style={{ color: incidentType === type.id ? '#ef4444' : D.body }} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-xl" style={{ color: D.h }}>{type.label}</p>
                            <p className="text-[15px] mt-0.5" style={{ color: D.muted }}>{type.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Severity & Details */}
                {step === 2 && (
                  <div className="space-y-6" data-testid="incident-step-2">
                    <div>
                      <h3 className="text-lg font-bold mb-3" style={{ color: D.h }}>Severity Level</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {SEVERITY_LEVELS.map((level) => (
                          <button
                            key={level.id}
                            onClick={() => setSeverity(level.id)}
                            className="py-3 rounded-xl text-center font-medium transition-colors"
                            style={{
                              background: severity === level.id ? level.bg : D.bg,
                              color: severity === level.id ? level.text : D.body,
                              border: severity === level.id ? `1px solid ${level.text}40` : '1px solid transparent',
                            }}
                            data-testid={`severity-${level.id}`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-3" style={{ color: D.h }}>What happened?</h3>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the incident..."
                        className="w-full h-32 rounded-xl p-4 focus:outline-none"
                        style={{
                          background: D.card,
                          color: D.h,
                          border: description ? '2px solid #f43f5e' : `1px solid ${D.bdr}`,
                          fontSize: '16px',
                        }}
                        data-testid="incident-description"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-3" style={{ color: D.h }}>Actions Taken</h3>
                      <textarea
                        value={actionsTaken}
                        onChange={(e) => setActionsTaken(e.target.value)}
                        placeholder="What did you do to address this?"
                        className="w-full h-28 rounded-xl p-4 focus:outline-none"
                        style={{
                          background: D.card,
                          color: D.h,
                          border: actionsTaken ? '2px solid #f43f5e' : `1px solid ${D.bdr}`,
                          fontSize: '16px',
                        }}
                        data-testid="incident-actions"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Witnesses */}
                {step === 3 && (
                  <div className="space-y-5" data-testid="incident-step-3">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: D.h }}>Witness Information</h3>
                      <p style={{ color: D.body }}>Document any witnesses present during the incident for legal and record-keeping purposes.</p>
                    </div>

                    <div>
                      <label className="text-base font-semibold mb-3 block" style={{ color: D.h }}>Witness Name(s)</label>
                      <textarea
                        value={witnessNames}
                        onChange={(e) => setWitnessNames(e.target.value)}
                        placeholder="Enter the names of any witnesses present..."
                        disabled={noWitnesses}
                        className="w-full h-32 rounded-xl p-4 focus:outline-none disabled:opacity-50"
                        style={{
                          background: D.card,
                          color: D.h,
                          border: witnessNames && !noWitnesses ? '2px solid #f43f5e' : `1px solid ${D.bdr}`,
                          fontSize: '16px',
                        }}
                        data-testid="incident-witnesses"
                      />
                    </div>

                    {/* Info box */}
                    <div className="rounded-xl p-4 flex gap-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <div className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 text-sm font-bold">i</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: D.body }}>
                        Include full names and their relationship to the patient if applicable (e.g., "John Smith - Family Visitor")
                      </p>
                    </div>

                    <button
                      onClick={() => setNoWitnesses(!noWitnesses)}
                      className="flex items-center gap-3"
                      data-testid="no-witnesses-checkbox"
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{
                          background: noWitnesses ? D.brand : 'transparent',
                          border: noWitnesses ? `2px solid ${D.brand}` : `2px solid ${D.bdr}`,
                        }}
                      >
                        {noWitnesses && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span style={{ color: D.h }}>No witnesses were present</span>
                    </button>
                  </div>
                )}

                {/* Step 4: Photos */}
                {step === 4 && (
                  <div className="space-y-5" data-testid="incident-step-4">
                    <div>
                      <h3 className="text-lg font-bold mb-2" style={{ color: D.h }}>Add Photos (Optional)</h3>
                      <p className="text-sm" style={{ color: D.muted }}>Document the incident visually.</p>
                    </div>

                    <label className="block cursor-pointer">
                      <div
                        className="w-full py-12 rounded-xl flex flex-col items-center justify-center"
                        style={{ border: `2px dashed ${D.bdr}` }}
                      >
                        <Camera className="w-10 h-10 mb-3" style={{ color: D.muted }} />
                        <p className="font-medium" style={{ color: D.body }}>Tap to add photo</p>
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" data-testid="photo-upload-input" />
                    </label>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removePhoto(photo.id)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
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
                  <div className="space-y-5" data-testid="incident-step-5">
                    <h3 className="text-2xl font-bold" style={{ color: D.h }}>Review &amp; Submit</h3>

                    {/* Summary Card */}
                    <div className="rounded-2xl p-5 space-y-5" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
                      <div className="flex items-center gap-3">
                        {selectedType && (
                          <>
                            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.08)' }}>
                              <selectedType.icon className="w-6 h-6 text-rose-500" />
                            </div>
                            <span className="font-bold text-xl" style={{ color: D.h }}>{selectedType.label}</span>
                          </>
                        )}
                        {selectedSeverity && (
                          <span
                            className="ml-auto px-4 py-1.5 rounded-xl text-sm font-bold"
                            style={{ background: selectedSeverity.bg, color: selectedSeverity.text }}
                          >
                            {selectedSeverity.label.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {description && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[1.5px] mb-1.5" style={{ color: D.muted }}>Description</p>
                          <p className="text-[15px] leading-relaxed" style={{ color: D.h }}>{description}</p>
                        </div>
                      )}
                      {actionsTaken && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[1.5px] mb-1.5" style={{ color: D.muted }}>Actions Taken</p>
                          <p className="text-[15px] leading-relaxed" style={{ color: D.h }}>{actionsTaken}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[1.5px] mb-1.5" style={{ color: D.muted }}>Witnesses</p>
                        <p className="text-[15px]" style={{ color: D.h }}>
                          {noWitnesses ? 'No witnesses present' : (witnessNames || 'Not provided')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[1.5px] mb-1.5" style={{ color: D.muted }}>Photos ({photos.length})</p>
                        <p className="text-[15px]" style={{ color: D.body }}>{photos.length > 0 ? `${photos.length} attached` : 'No photos attached'}</p>
                      </div>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setNotifyFamily(!notifyFamily)}
                        className="w-full p-5 rounded-2xl flex items-center gap-4 transition-colors"
                        style={{
                          background: notifyFamily ? 'rgba(255,179,71,0.08)' : D.card,
                          border: notifyFamily ? `1px solid rgba(255,179,71,0.30)` : `1px solid ${D.bdr}`,
                        }}
                        data-testid="notify-family-toggle"
                      >
                        <div
                          className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                          style={{ background: notifyFamily ? 'rgba(255,179,71,0.14)' : D.bg, border: `1px solid ${notifyFamily ? 'rgba(255,179,71,0.28)' : D.bdr}` }}
                        >
                          <Shield className="w-6 h-6" style={{ color: notifyFamily ? D.brand : D.muted }} />
                        </div>
                        <span className="text-lg font-semibold flex-1 text-left" style={{ color: D.h }}>Notify Family Member</span>
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: notifyFamily ? D.brand : 'transparent',
                            border: notifyFamily ? 'none' : `2px solid ${D.bdr}`,
                          }}
                        >
                          {notifyFamily && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </button>

                      <button
                        onClick={() => setFollowUpRequired(!followUpRequired)}
                        className="w-full p-5 rounded-2xl flex items-center gap-4 transition-colors"
                        style={{
                          background: followUpRequired ? 'rgba(255,179,71,0.08)' : D.card,
                          border: followUpRequired ? `1px solid rgba(255,179,71,0.30)` : `1px solid ${D.bdr}`,
                        }}
                        data-testid="follow-up-toggle"
                      >
                        <div
                          className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                          style={{ background: followUpRequired ? 'rgba(255,179,71,0.14)' : D.bg, border: `1px solid ${followUpRequired ? 'rgba(255,179,71,0.28)' : D.bdr}` }}
                        >
                          <Clock className="w-6 h-6" style={{ color: followUpRequired ? D.brand : D.muted }} />
                        </div>
                        <span className="text-lg font-semibold flex-1 text-left" style={{ color: D.h }}>Follow-up Required</span>
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: followUpRequired ? D.brand : 'transparent',
                            border: followUpRequired ? 'none' : `2px solid ${D.bdr}`,
                          }}
                        >
                          {followUpRequired && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex-none px-5 py-4"
              style={{ background: D.card, borderTop: `1px solid ${D.bdr}` }}
              data-testid="incident-footer"
            >
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-4 rounded-[14px] font-semibold text-[17px]"
                    style={{ background: D.bg, border: `1px solid ${D.bdr}`, color: D.body }}
                    data-testid="incident-back-btn"
                  >
                    Back
                  </button>
                )}

                {step < 5 ? (
                  <button
                    onClick={handleNext}
                    disabled={isNextDisabled()}
                    className="flex-1 py-4 rounded-[14px] font-semibold text-[17px] disabled:opacity-40 disabled:cursor-not-allowed text-white"
                    style={{ background: '#f43f5e' }}
                    data-testid="incident-next-btn"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-4 text-white rounded-[14px] font-semibold text-[17px] flex items-center justify-center gap-2"
                    style={{ background: '#f43f5e' }}
                    data-testid="incident-submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : 'Submit Incident'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // History View
  return (
    <div className="flex-1 overflow-y-auto pb-24 font-['Manrope',sans-serif]" style={{ background: D.bg }}>
      <div className="px-5 pt-3 pb-3">
        <h1 className="text-2xl font-bold mb-1" style={{ color: D.h }}>Incidents</h1>
        <p className="text-sm" style={{ color: D.muted }}>Report and track incidents for {patientName}</p>
      </div>

      <div className="px-5 mb-5">
        <button
          onClick={() => { window.scrollTo(0, 0); setActiveView('new'); }}
          className="w-full p-5 rounded-2xl flex items-center justify-between"
          style={{ background: '#f43f5e' }}
          data-testid="new-incident-btn"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-transparent/20 rounded-xl flex items-center justify-center">
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
            <FileText className="w-5 h-5" style={{ color: D.muted }} />
            <h2 className="font-bold text-lg" style={{ color: D.h }}>Past Reports</h2>
          </div>
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: D.bg, border: `1px solid ${D.bdr}`, color: D.body }}
          >
            {incidents.length}
          </span>
        </div>

        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map((incident) => {
              const type = INCIDENT_TYPES.find(t => t.id === incident.type);
              const sev = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              return (
                <div
                  key={incident.id}
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
                >
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(244,63,94,0.08)' }}>
                    {type && <type.icon className="w-6 h-6 text-rose-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg" style={{ color: D.h }}>{type?.label || 'Incident'}</p>
                    <p className="text-sm mt-0.5" style={{ color: D.muted }}>{incident.createdAt}</p>
                  </div>
                  {sev && (
                    <span className="px-4 py-1.5 rounded-xl text-sm font-bold" style={{ background: sev.bg, color: sev.text }}>
                      {sev.label.toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-10 text-center" style={{ background: D.card, border: `1px solid ${D.bdr}` }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: D.bg, border: `1px solid ${D.bdr}` }}>
              <AlertTriangle className="w-10 h-10" style={{ color: D.muted }} />
            </div>
            <p className="font-bold text-lg mb-1" style={{ color: D.h }}>No incidents reported</p>
            <p style={{ color: D.muted }}>Tap the button above to report a new incident</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportPage;

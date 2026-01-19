import React, { useState } from 'react';
import { 
  X, AlertTriangle, Clock, User, CheckCircle, ChevronLeft, ChevronRight,
  Phone, MessageSquare, AlertCircle, Shield, Heart, Thermometer, Brain, Pill, HelpCircle
} from 'lucide-react';
import { CAREGIVER_PROFILE, CARE_IMAGES } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

// Sample incident data
const SAMPLE_INCIDENTS = [
  {
    id: 1,
    type: 'fall',
    typeLabel: 'Fall',
    severity: 'medium',
    description: 'Patient lost balance while getting up from the chair in the living room. Caught themselves on the armrest before fully falling. No injuries sustained.',
    actionsTaken: 'Helped patient sit back down safely. Checked for any pain or discomfort. Monitored for 30 minutes. Rearranged furniture to provide better support.',
    photos: [CARE_IMAGES.vitals, CARE_IMAGES.medication],
    createdAt: '2026-01-17T10:30:00',
    createdBy: CAREGIVER_PROFILE,
    status: 'new',
    followUpRequired: true
  },
  {
    id: 2,
    type: 'medication',
    typeLabel: 'Medication Issue',
    severity: 'low',
    description: 'Patient initially refused morning medication, stating they had already taken it. After gentle reminder and showing the pill organizer, patient took medication.',
    actionsTaken: 'Used calm communication to explain medication schedule. Showed pill organizer as visual confirmation. Patient took medication without further issue.',
    photos: [CARE_IMAGES.medication],
    createdAt: '2026-01-16T08:45:00',
    createdBy: CAREGIVER_PROFILE,
    status: 'acknowledged',
    followUpRequired: false
  },
  {
    id: 3,
    type: 'behavioral',
    typeLabel: 'Behavioral Change',
    severity: 'medium',
    description: 'Patient showed increased confusion this afternoon, asking about family members who passed away years ago. Seemed agitated when gently redirected.',
    actionsTaken: 'Used validation therapy techniques. Played calming music. Redirected to favorite photo album activity. Patient calmed down after 20 minutes.',
    photos: [],
    createdAt: '2026-01-15T14:20:00',
    createdBy: CAREGIVER_PROFILE,
    status: 'resolved',
    followUpRequired: false
  }
];

const INCIDENT_ICONS = {
  fall: AlertTriangle,
  medication: Pill,
  behavioral: Brain,
  injury: Heart,
  vital: Thermometer,
  other: HelpCircle
};

const SEVERITY_COLORS = {
  low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  critical: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' }
};

const STATUS_STYLES = {
  new: { bg: 'bg-rose-500', text: 'NEW' },
  acknowledged: { bg: 'bg-amber-500', text: 'VIEWED' },
  resolved: { bg: 'bg-emerald-500', text: 'RESOLVED' }
};

export const IncidentViewModal = ({ 
  isOpen, 
  onClose,
  incidents = SAMPLE_INCIDENTS
}) => {
  const { isDarkMode } = useTheme();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date(2026, 0, 17); // Current date in the app
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  // Detail View
  if (selectedIncident) {
    const Icon = INCIDENT_ICONS[selectedIncident.type] || AlertTriangle;
    const severityStyle = SEVERITY_COLORS[selectedIncident.severity] || SEVERITY_COLORS.medium;
    const photos = selectedIncident.photos || [];

    return (
      <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center font-['Manrope',sans-serif]">
        <div className="bg-stone-950 w-full h-full sm:max-w-md sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:border sm:border-stone-800 flex flex-col overflow-hidden">
          {/* Photo Header or Gradient Header */}
          <div className="relative">
            {photos.length > 0 ? (
              <div className="relative aspect-[16/10]">
                <img 
                  src={photos[currentPhotoIndex]}
                  alt="Incident"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/40 to-black/20" />
                
                {/* Photo Navigation */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPhotoIndex(prev => prev === 0 ? photos.length - 1 : prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setCurrentPhotoIndex(prev => prev === photos.length - 1 ? 0 : prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-rose-600 to-rose-700" />
            )}

            {/* Back Button */}
            <button
              onClick={() => { setSelectedIncident(null); setCurrentPhotoIndex(0); }}
              className="absolute top-4 left-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${severityStyle.bg} ${severityStyle.text}`}>
                  {selectedIncident.severity.toUpperCase()}
                </span>
                {selectedIncident.followUpRequired && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
                    FOLLOW-UP
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {selectedIncident.typeLabel}
              </h2>
              <p className="text-white/70 text-sm mt-1">{formatDate(selectedIncident.createdAt)}</p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Description */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2">What Happened</p>
              <p className="text-stone-300 text-sm leading-relaxed">{selectedIncident.description}</p>
            </div>

            {/* Actions Taken */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2">Actions Taken</p>
              <p className="text-stone-300 text-sm leading-relaxed">{selectedIncident.actionsTaken}</p>
            </div>

            {/* Caregiver */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-3">Reported By</p>
              <div className="flex items-center gap-3">
                <img 
                  src={selectedIncident.createdBy.photo}
                  alt="Caregiver"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">{selectedIncident.createdBy.name || 'Julia Martinez'}</p>
                  <p className="text-stone-500 text-sm">Certified Nursing Assistant</p>
                </div>
                <div className="flex items-center gap-1 text-[#25D366] text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              </div>
            </div>

            {/* Contact Caregiver */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-stone-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors">
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button className="flex-1 py-3 bg-[#25D366] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-colors">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-end sm:items-center justify-center font-['Manrope',sans-serif]">
      <div 
        className="bg-stone-950 border border-stone-800 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-none bg-stone-900 border-b border-stone-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Incident Reports</h2>
              <p className="text-xs text-stone-400">{incidents.length} reports</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Incident List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {incidents.length > 0 ? (
            incidents.map((incident) => {
              const Icon = INCIDENT_ICONS[incident.type] || AlertTriangle;
              const severityStyle = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.medium;
              const statusStyle = STATUS_STYLES[incident.status] || STATUS_STYLES.new;

              return (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-colors text-left"
                >
                  {/* Image Preview */}
                  {incident.photos && incident.photos.length > 0 && (
                    <div className="relative h-32">
                      <img 
                        src={incident.photos[0]}
                        alt="Incident"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 right-3 px-2 py-0.5 ${statusStyle.bg} rounded-full`}>
                        <span className="text-[10px] font-bold text-white">{statusStyle.text}</span>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${severityStyle.bg}`}>
                        <Icon className={`w-5 h-5 ${severityStyle.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white">{incident.typeLabel}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${severityStyle.bg} ${severityStyle.text}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-stone-400 text-sm line-clamp-2">{incident.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span className="text-xs text-stone-500">{formatDate(incident.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-600 flex-shrink-0" />
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#25D366]" />
              </div>
              <h3 className="font-semibold text-white mb-1">No Incidents</h3>
              <p className="text-stone-500 text-sm">No incidents have been reported</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentViewModal;

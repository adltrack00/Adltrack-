import React, { useState } from 'react';
import { 
  AlertTriangle, Clock, ChevronRight, ChevronDown, Shield, Heart,
  Thermometer, Brain, Pill, HelpCircle, FileText, CheckCircle, User, X, ZoomIn, ChevronLeft
} from 'lucide-react';
import { CAREGIVER_PROFILE } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

// Incident types with icons
const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: AlertTriangle },
  { id: 'medication', label: 'Medication Issue', icon: Pill },
  { id: 'behavioral', label: 'Behavioral Change', icon: Brain },
  { id: 'injury', label: 'Injury', icon: Heart },
  { id: 'vital', label: 'Vital Sign Concern', icon: Thermometer },
  { id: 'other', label: 'Other', icon: HelpCircle },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Low', color: 'emerald' },
  { id: 'medium', label: 'Medium', color: 'amber' },
  { id: 'high', label: 'High', color: 'orange' },
  { id: 'critical', label: 'Critical', color: 'rose' },
];

export const IncidentViewPage = ({ patientName = 'Your loved one', incidents = [] }) => {
  const { isDarkMode, bg, bgCard, bgCardHover, border, text, textSecondary, textMuted } = useTheme();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Photo viewer navigation
  const navigatePhoto = (direction) => {
    if (!selectedIncident?.photos) return;
    const newIndex = currentPhotoIndex + direction;
    if (newIndex >= 0 && newIndex < selectedIncident.photos.length) {
      setCurrentPhotoIndex(newIndex);
      setViewingPhoto(selectedIncident.photos[newIndex]);
    }
  };

  // Photo Viewer Modal
  const PhotoViewerModal = () => {
    if (!viewingPhoto) return null;
    
    const hasMultiple = selectedIncident?.photos?.length > 1;
    const canGoBack = currentPhotoIndex > 0;
    const canGoForward = currentPhotoIndex < (selectedIncident?.photos?.length || 1) - 1;

    return (
      <div 
        className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
        onClick={() => setViewingPhoto(null)}
      >
        {/* Close button */}
        <button
          onClick={() => setViewingPhoto(null)}
          className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
          data-testid="close-photo-viewer"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Photo counter */}
        {hasMultiple && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full">
            <span className="text-white text-sm font-medium">
              {currentPhotoIndex + 1} / {selectedIncident.photos.length}
            </span>
          </div>
        )}

        {/* Navigation arrows */}
        {hasMultiple && canGoBack && (
          <button
            onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            data-testid="photo-prev"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        
        {hasMultiple && canGoForward && (
          <button
            onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            data-testid="photo-next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Image */}
        <div 
          className="max-w-[90vw] max-h-[85vh] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={viewingPhoto.url}
            alt={viewingPhoto.name || 'Evidence photo'}
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Photo info */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white/70 text-sm">
            {viewingPhoto.name || 'Evidence Photo'}
          </p>
          <p className="text-white/50 text-xs mt-1">
            Tap outside or press X to close
          </p>
        </div>
      </div>
    );
  };

  // Detailed incident view
  if (selectedIncident) {
    const type = INCIDENT_TYPES.find(t => t.id === selectedIncident.type);
    const severityLevel = SEVERITY_LEVELS.find(s => s.id === selectedIncident.severity);
    
    return (
      <div className={`flex-1 overflow-y-auto ${bg} pb-24`}>
        {/* Photo Viewer */}
        <PhotoViewerModal />

        {/* Header */}
        <div className={`${isDarkMode ? 'bg-stone-900' : 'bg-white'} border-b ${border} px-5 py-4`}>
          <button 
            onClick={() => setSelectedIncident(null)}
            className={`flex items-center gap-2 ${textMuted} hover:${text} mb-3`}
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span className="text-sm font-medium">Back to Incidents</span>
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selectedIncident.severity === 'critical' ? 'bg-rose-500/20' :
              selectedIncident.severity === 'high' ? 'bg-orange-500/20' :
              selectedIncident.severity === 'medium' ? 'bg-amber-500/20' :
              'bg-emerald-500/20'
            }`}>
              {type && <type.icon className={`w-6 h-6 ${
                selectedIncident.severity === 'critical' ? 'text-rose-400' :
                selectedIncident.severity === 'high' ? 'text-orange-400' :
                selectedIncident.severity === 'medium' ? 'text-amber-400' :
                'text-emerald-400'
              }`} />}
            </div>
            <div>
              <h1 className={`text-xl font-bold ${text}`}>{type?.label || 'Incident'}</h1>
              <p className={`text-sm ${textMuted}`}>{selectedIncident.createdAt}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Severity Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
              selectedIncident.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' :
              selectedIncident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
              selectedIncident.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-emerald-500/20 text-emerald-400'
            }`}>
              {severityLevel?.label} Severity
            </span>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              selectedIncident.status === 'resolved' 
                ? 'bg-[#25D366]/20 text-[#25D366]' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {selectedIncident.status === 'resolved' ? 'Resolved' : 'Open'}
            </span>
          </div>

          {/* Description */}
          <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
            <h3 className={`text-xs font-bold ${textMuted} uppercase tracking-wider mb-2`}>What Happened</h3>
            <p className={`${text} leading-relaxed`}>{selectedIncident.description}</p>
          </div>

          {/* Actions Taken */}
          {selectedIncident.actionsTaken && (
            <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
              <h3 className={`text-xs font-bold ${textMuted} uppercase tracking-wider mb-2`}>Actions Taken</h3>
              <p className={`${text} leading-relaxed`}>{selectedIncident.actionsTaken}</p>
            </div>
          )}

          {/* Photos - Clickable */}
          {selectedIncident.photos && selectedIncident.photos.length > 0 && (
            <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold ${textMuted} uppercase tracking-wider`}>Evidence Photos ({selectedIncident.photos.length})</h3>
                <div className="flex items-center gap-1 text-[#25D366]">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Tap to view</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {selectedIncident.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      setCurrentPhotoIndex(index);
                      setViewingPhoto(photo);
                    }}
                    className="relative group aspect-square rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                    data-testid={`view-photo-${photo.id}`}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.name || 'Incident evidence'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Caregiver Info */}
          {selectedIncident.createdBy && (
            <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
              <h3 className={`text-xs font-bold ${textMuted} uppercase tracking-wider mb-3`}>Reported By</h3>
              <div className="flex items-center gap-4">
                <img 
                  src={selectedIncident.createdBy.photo}
                  alt={selectedIncident.createdBy.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className={`font-semibold ${text}`}>{selectedIncident.createdBy.name}</p>
                  <p className={`text-sm ${textMuted}`}>{selectedIncident.createdBy.title}</p>
                </div>
                <div className="flex items-center gap-1 text-[#25D366]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Notification Status */}
          {selectedIncident.familyNotified && (
            <div className="flex items-center gap-3 p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl">
              <Shield className="w-5 h-5 text-[#25D366]" />
              <p className={`text-sm ${text}`}>You were notified about this incident when it was reported.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className={`flex-1 overflow-y-auto ${bg} pb-24`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className={`text-2xl font-bold ${text} mb-1`}>Incident Reports</h1>
        <p className={`${textSecondary} text-sm`}>Care incidents reported for {patientName}</p>
      </div>

      {/* Summary Card */}
      <div className="px-6 mb-6">
        <div className={`${bgCard} border ${border} rounded-2xl p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${text}`}>Summary</h3>
            <span className={`text-xs ${textMuted}`}>Last 30 days</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${text}`}>{incidents.length}</p>
              <p className={`text-xs ${textMuted}`}>Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#25D366]">{incidents.filter(i => i.status === 'resolved').length}</p>
              <p className={`text-xs ${textMuted}`}>Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{incidents.filter(i => i.status !== 'resolved').length}</p>
              <p className={`text-xs ${textMuted}`}>Open</p>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="px-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className={`w-5 h-5 ${textMuted}`} />
          <h2 className={`font-semibold ${text}`}>Recent Incidents</h2>
        </div>

        {incidents.length > 0 ? (
          <div className="space-y-3">
            {incidents.map((incident) => {
              const type = INCIDENT_TYPES.find(t => t.id === incident.type);
              const severityLevel = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              
              return (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`w-full ${bgCard} border ${border} rounded-2xl p-4 flex items-center gap-4 text-left ${bgCardHover} transition-colors`}
                  data-testid={`family-incident-${incident.id}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                    <p className={`text-sm ${textMuted} truncate`}>{incident.description}</p>
                    <p className={`text-xs ${textMuted} mt-1`}>{incident.createdAt}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${textMuted} flex-shrink-0`} />
                </button>
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
              Great news! No incidents have been reported recently.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentViewPage;

import React, { useState } from 'react';
import {
  AlertTriangle, ChevronRight, Shield, Heart,
  Thermometer, Brain, Pill, HelpCircle, CheckCircle, X, ZoomIn, ChevronLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const INTER = `'Inter','Plus Jakarta Sans',sans-serif`;

const INCIDENT_TYPES = [
  { id: 'fall',       label: 'Fall',               icon: AlertTriangle },
  { id: 'medication', label: 'Medication Issue',    icon: Pill          },
  { id: 'behavioral', label: 'Behavioral Change',   icon: Brain         },
  { id: 'injury',     label: 'Injury',              icon: Heart         },
  { id: 'vital',      label: 'Vital Sign Concern',  icon: Thermometer   },
  { id: 'other',      label: 'Other',               icon: HelpCircle    },
];

const SEVERITY_STYLES = {
  critical: { bg: 'rgba(255,59,48,0.10)',  text: '#FF3B30' },
  high:     { bg: 'rgba(255,149,0,0.10)',  text: '#FF9500' },
  medium:   { bg: 'rgba(255,204,0,0.12)',  text: '#B8860B' },
  low:      { bg: 'rgba(52,199,89,0.10)',  text: '#34C759' },
};

const SEVERITY_LEVELS = [
  { id: 'low',      label: 'Low'      },
  { id: 'medium',   label: 'Medium'   },
  { id: 'high',     label: 'High'     },
  { id: 'critical', label: 'Critical' },
];

export const IncidentViewPage = ({ patientName = 'Your loved one', incidents = [] }) => {
  const { colors: C } = useTheme();
  const [selectedIncident, setSelectedIncident]   = useState(null);
  const [viewingPhoto, setViewingPhoto]           = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const card = {
    background: C.CARD,
    border: `1px solid ${C.BORDER}`,
    boxShadow: C.SHADOW,
    borderRadius: 16,
  };

  const navigatePhoto = (dir) => {
    if (!selectedIncident?.photos) return;
    const next = currentPhotoIndex + dir;
    if (next >= 0 && next < selectedIncident.photos.length) {
      setCurrentPhotoIndex(next);
      setViewingPhoto(selectedIncident.photos[next]);
    }
  };

  // ── Photo viewer overlay ──
  const PhotoViewer = () => {
    if (!viewingPhoto) return null;
    const multi   = (selectedIncident?.photos?.length || 0) > 1;
    const canBack = currentPhotoIndex > 0;
    const canFwd  = currentPhotoIndex < (selectedIncident?.photos?.length || 1) - 1;
    return (
      <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center" onClick={() => setViewingPhoto(null)}>
        <button onClick={() => setViewingPhoto(null)} data-testid="close-photo-viewer"
          className="absolute top-4 right-4 p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <X className="w-6 h-6 text-white" />
        </button>
        {multi && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <span className="text-white text-sm font-semibold" style={{ fontFamily: INTER }}>{currentPhotoIndex + 1} / {selectedIncident.photos.length}</span>
          </div>
        )}
        {multi && canBack && (
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }} data-testid="photo-prev"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {multi && canFwd && (
          <button onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }} data-testid="photo-next"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
        <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <img src={viewingPhoto.url} alt={viewingPhoto.name || 'Evidence'} className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <p style={{ fontFamily: INTER, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{viewingPhoto.name || 'Evidence Photo'}</p>
        </div>
      </div>
    );
  };

  // ── Detail view ──
  if (selectedIncident) {
    const type     = INCIDENT_TYPES.find(t => t.id === selectedIncident.type);
    const sevStyle = SEVERITY_STYLES[selectedIncident.severity] || SEVERITY_STYLES.low;
    const sevLevel = SEVERITY_LEVELS.find(s => s.id === selectedIncident.severity);

    return (
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 96, background: C.BG, fontFamily: INTER }}>
        <PhotoViewer />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${C.BORDER}`, background: C.CARD }}>
          <button onClick={() => setSelectedIncident(null)} data-testid="incident-detail-back"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.MUTED, display: 'flex' }}>
            <ChevronLeft size={22} />
          </button>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: sevStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {type && <type.icon size={22} color={sevStyle.text} />}
          </div>
          <div>
            <h1 style={{ fontFamily: INTER, fontSize: '1.25rem', fontWeight: 700, color: C.TEXT, margin: '0 0 2px' }}>{type?.label || 'Incident'}</h1>
            <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0 }}>{selectedIncident.createdAt}</p>
          </div>
        </div>

        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 999, background: sevStyle.bg, color: sevStyle.text }}>
              {sevLevel?.label} Severity
            </span>
            <span style={{
              fontFamily: INTER, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 999,
              background: selectedIncident.status === 'resolved' ? `${C.GREEN}14` : `${C.ORANGE}14`,
              color: selectedIncident.status === 'resolved' ? C.GREEN : C.ORANGE,
            }}>
              {selectedIncident.status === 'resolved' ? 'Resolved' : 'Open'}
            </span>
          </div>

          {/* What Happened */}
          <div style={{ ...card, padding: 20 }}>
            <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: C.MUTED, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>What Happened</p>
            <p style={{ fontFamily: INTER, fontSize: 15, color: C.TEXT, lineHeight: 1.7, margin: 0 }}>{selectedIncident.description}</p>
          </div>

          {/* Actions Taken */}
          {selectedIncident.actionsTaken && (
            <div style={{ ...card, padding: 20 }}>
              <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: C.MUTED, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>Actions Taken</p>
              <p style={{ fontFamily: INTER, fontSize: 15, color: C.TEXT, lineHeight: 1.7, margin: 0 }}>{selectedIncident.actionsTaken}</p>
            </div>
          )}

          {/* Photos */}
          {selectedIncident.photos?.length > 0 && (
            <div style={{ ...card, padding: 20 }}>
              <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: C.MUTED, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 12px' }}>
                Evidence Photos ({selectedIncident.photos.length})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {selectedIncident.photos.map((photo, i) => (
                  <button key={photo.id} onClick={() => { setCurrentPhotoIndex(i); setViewingPhoto(photo); }}
                    data-testid={`view-photo-${photo.id}`}
                    style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.BORDER}`, cursor: 'pointer', padding: 0 }}>
                    <img src={photo.url} alt={photo.name || 'Evidence'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ZoomIn size={20} color="white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reported By */}
          {selectedIncident.createdBy && (
            <div style={{ ...card, padding: 20 }}>
              <p style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: C.MUTED, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 12px' }}>Reported By</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={selectedIncident.createdBy.photo} alt={selectedIncident.createdBy.name}
                  style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: '0 0 3px' }}>{selectedIncident.createdBy.name}</p>
                  <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0 }}>{selectedIncident.createdBy.title}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={15} color={C.GREEN} />
                  <span style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: C.GREEN }}>Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Family notified */}
          {selectedIncident.familyNotified && (
            <div style={{ padding: '14px 16px', borderRadius: 14, background: `${C.GREEN}08`, border: `1px solid ${C.GREEN}22`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={18} color={C.GREEN} />
              <p style={{ fontFamily: INTER, fontSize: 14, color: C.TEXT, margin: 0 }}>You were notified about this incident when it was reported.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List view ──
  const resolved = incidents.filter(i => i.status === 'resolved').length;
  const open     = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 96, background: C.BG, fontFamily: INTER }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px' }}>
        <h1 style={{ fontFamily: INTER, fontSize: '1.7rem', fontWeight: 700, color: C.TEXT, letterSpacing: '-0.01em', margin: '0 0 4px' }}>Incident Reports</h1>
        <p style={{ fontFamily: INTER, fontSize: 14, color: C.MUTED, margin: 0 }}>Care incidents reported for {patientName}</p>
      </div>

      {/* Summary card */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 16, color: C.TEXT, margin: 0 }}>Summary</p>
            <span style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED }}>Last 30 days</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
            {[
              { value: incidents.length, label: 'Total',    color: C.TEXT  },
              { value: resolved,         label: 'Resolved', color: C.GREEN },
              { value: open,             label: 'Open',     color: C.ORANGE },
            ].map((s, i) => (
              <div key={i} style={{ borderRight: i < 2 ? `1px solid ${C.BORDER}` : 'none' }}>
                <p style={{ fontFamily: INTER, fontSize: '1.9rem', fontWeight: 700, color: s.color, margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0 20px' }}>
        {incidents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {incidents.map((incident) => {
              const type     = INCIDENT_TYPES.find(t => t.id === incident.type);
              const sevStyle = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.low;
              const sevLevel = SEVERITY_LEVELS.find(s => s.id === incident.severity);
              return (
                <button
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  data-testid={`family-incident-${incident.id}`}
                  style={{ ...card, width: '100%', padding: 16, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', border: 'none', cursor: 'pointer', borderLeft: `4px solid ${sevStyle.text}` }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: sevStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {type && <type.icon size={20} color={sevStyle.text} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 15, color: C.TEXT, margin: 0 }}>{type?.label || 'Incident'}</p>
                      <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: sevStyle.bg, color: sevStyle.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {sevLevel?.label}
                      </span>
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: 13, color: C.MUTED, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.description}</p>
                    <p style={{ fontFamily: INTER, fontSize: 12, color: C.MUTED, margin: 0 }}>{incident.createdAt}</p>
                  </div>
                  <ChevronRight size={18} color={C.MUTED} style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ ...card, padding: 48, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: `${C.GREEN}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Shield size={36} color={C.GREEN} />
            </div>
            <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 18, color: C.TEXT, margin: '0 0 8px' }}>No incidents reported</p>
            <p style={{ fontFamily: INTER, fontSize: 14, color: C.MUTED, margin: 0, lineHeight: 1.6 }}>
              When caregivers report incidents, they will appear here with photos and details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentViewPage;

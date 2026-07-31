import React, { useState, useMemo } from 'react';
import { X, Phone, MapPin, AlertTriangle, Heart, Pill, Camera, User, Share2, Shield, Activity, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskStatus } from '../types';
import { CARE_IMAGES } from '../services/mockData';

const D = {
  bg: '#F4F8F9', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  brandGlow: '0 4px 20px rgba(255,179,71,0.32)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

export const PatientProfileModal = ({
  isOpen,
  onClose,
  patient,
  onUpdatePhoto,
  tasks = [],
  onSelectDate
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 17));

  const today = useMemo(() => new Date(2026, 0, 17), []);

  const historicalTasks = useMemo(() => {
    const taskHistory = {};
    const pastDates = [
      { date: new Date(2026, 0, 16), tasks: [
        { id: 'h1', title: 'Morning Medication',  completedAt: '8:15 AM',  status: TaskStatus.COMPLETED, completionNote: 'Took all medications with breakfast', evidenceUrl: CARE_IMAGES.medication },
        { id: 'h2', title: 'Breakfast Assistance', completedAt: '8:45 AM',  status: TaskStatus.COMPLETED, completionNote: 'Had oatmeal and fruit', evidenceUrl: CARE_IMAGES.meal },
        { id: 'h3', title: 'Blood Pressure Check', completedAt: '10:30 AM', status: TaskStatus.COMPLETED, completionNote: 'BP: 128/82', evidenceUrl: CARE_IMAGES.vitals },
      ]},
      { date: new Date(2026, 0, 15), tasks: [
        { id: 'h4', title: 'Morning Walk',       completedAt: '10:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Walked 15 minutes in the garden', evidenceUrl: CARE_IMAGES.walk },
        { id: 'h5', title: 'Lunch Preparation',  completedAt: '12:15 PM', status: TaskStatus.COMPLETED, completionNote: 'Had soup and sandwich', evidenceUrl: CARE_IMAGES.meal },
      ]},
      { date: new Date(2026, 0, 14), tasks: [
        { id: 'h8', title: 'Morning Medication', completedAt: '8:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Medications administered', evidenceUrl: CARE_IMAGES.medication },
      ]},
    ];
    pastDates.forEach(({ date, tasks: dateTasks }) => { taskHistory[date.toDateString()] = dateTasks; });
    const todayCompleted = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    if (todayCompleted.length > 0) taskHistory[today.toDateString()] = todayCompleted;
    return taskHistory;
  }, [tasks, today]);

  const hasTasksOnDate = (date) => (historicalTasks[date.toDateString()] || []).length > 0;

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDay.getDay();
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--)
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    for (let i = 1; i <= daysInMonth; i++)
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++)
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    return days;
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const formatDate = (date) => `${monthNames[date.getMonth()].substring(0,3)} ${date.getDate()}, ${date.getFullYear()}`;
  const navigateMonth = (dir) => setCurrentMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + dir); return d; });
  const handleDateSelect = (date) => {
    if (onSelectDate) onSelectDate(date, historicalTasks[date.toDateString()] || []);
    setShowCalendar(false);
    onClose();
  };

  if (!isOpen || !patient) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpdatePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdatePhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: D.bg, fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em' }}
      onClick={onClose}
    >
      <div className="flex-1 overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* ── Photo Hero — stays dark, it's overlaid on the patient photo ── */}
        <div className="relative h-[38vh]">
          {patient.photo ? (
            <>
              <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: D.bg }}>
              <User className="w-24 h-24" style={{ color: D.muted }} />
            </div>
          )}

          {/* Top right controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            {onUpdatePhoto && (
              <label className="w-11 h-11 rounded-xl cursor-pointer flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${D.bdr}` }}>
                <Camera className="w-5 h-5" style={{ color: D.h }} />
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
            <button onClick={onClose} className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${D.bdr}` }}>
              <X className="w-5 h-5" style={{ color: D.h }} />
            </button>
          </div>

          {/* Patient name on photo */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-3xl font-bold text-white">{patient.name}</h2>
            <p className="text-white/75 text-sm font-medium mt-1">Age {patient.age} • DOB: {patient.dateOfBirth || '1946-03-15'}</p>
          </div>
        </div>

        {/* ── Light content area ── */}
        <div className="px-4 py-4 space-y-3">

          {/* Care History */}
          <button
            onClick={() => setShowCalendar(true)}
            className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all"
            style={{ background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.28)', boxShadow: D.shadow }}
            data-testid="calendar-tab"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,179,71,0.15)', border: '1px solid rgba(255,179,71,0.28)' }}>
              <Calendar className="w-6 h-6" style={{ color: D.brand }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: D.brand }}>Care History</p>
              <p className="text-lg font-bold mt-0.5" style={{ color: D.h }}>{formatDate(today)}</p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: D.brand }} />
          </button>

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.20)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                <span className="text-base font-semibold" style={{ color: '#ef4444' }}>Allergies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(244,63,94,0.10)', color: '#dc2626', border: '1px solid rgba(244,63,94,0.18)' }}>
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          {patient.medicalConditions && patient.medicalConditions.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5" style={{ color: '#ec4899' }} fill="#ec4899" />
                <span className="text-base font-semibold" style={{ color: D.h }}>Medical Conditions</span>
              </div>
              <ul className="space-y-2">
                {patient.medicalConditions.map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: D.body }}>
                    <span style={{ color: D.muted }}>•</span>
                    <span className="font-medium">{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Medications */}
          {patient.medications && patient.medications.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-5 h-5" style={{ color: '#3b82f6' }} />
                <span className="text-base font-semibold" style={{ color: D.h }}>Current Medications</span>
              </div>
              <div className="space-y-2.5">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2" style={{ borderBottom: idx < patient.medications.length - 1 ? `1px solid ${D.bdr}` : 'none' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.20)' }}>
                      <Pill className="w-4 h-4" style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: D.h }}>{med.name}</p>
                      <p className="text-xs font-light" style={{ color: D.muted }}>{med.dosage} · {med.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Status & Mobility */}
          <div className="grid grid-cols-2 gap-3">
            {patient.codeStatus && (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'radial-gradient(circle at 50% 0%,rgba(234,179,8,0.22) 0%,rgba(254,249,195,0.10) 55%,#ffffff 85%)', border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
                <Shield className="w-7 h-7 mx-auto mb-2" style={{ color: '#ca8a04' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#ca8a04' }}>Code Status</p>
                <p className="text-base font-bold" style={{ color: D.h }}>{patient.codeStatus}</p>
              </div>
            )}
            {patient.mobilityStatus && (
              <div className="rounded-2xl p-4 text-center" style={{ background: 'radial-gradient(circle at 50% 0%,rgba(96,165,250,0.22) 0%,rgba(219,234,254,0.10) 55%,#ffffff 85%)', border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
                <Activity className="w-7 h-7 mx-auto mb-2" style={{ color: '#1d4ed8' }} />
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#1d4ed8' }}>Mobility</p>
                <p className="text-base font-bold" style={{ color: D.h }}>{patient.mobilityStatus}</p>
              </div>
            )}
          </div>

          {/* Access Instructions */}
          {patient.accessInstructions && (
            <div className="rounded-2xl p-4" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5" style={{ color: '#16a34a' }} />
                <span className="text-base font-semibold" style={{ color: D.h }}>Access Instructions</span>
              </div>
              <p className="text-sm font-light leading-relaxed" style={{ color: D.body }}>{patient.accessInstructions}</p>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="rounded-2xl p-4" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5" style={{ color: '#f97316' }} />
              <span className="text-base font-semibold" style={{ color: D.h }}>Emergency Contacts</span>
            </div>
            <div className="space-y-4">
              {patient.emergencyContacts?.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-base" style={{ color: D.h }}>{contact.name}</p>
                    <p className="text-xs font-light mt-0.5" style={{ color: D.muted }}>{contact.relationship}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white"
                    style={{ background: D.brandGrad, boxShadow: D.brandGlow }}
                  >
                    Call
                  </a>
                </div>
              ))}

              {patient.primaryCarePhysician && (
                <div className="pt-3" style={{ borderTop: `1px solid ${D.bdr}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: D.muted }}>Primary Care Physician</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-base" style={{ color: D.h }}>{patient.primaryCarePhysician.name}</p>
                      <p className="text-xs font-light mt-0.5" style={{ color: D.muted }}>{patient.primaryCarePhysician.facility}</p>
                    </div>
                    <a
                      href={`tel:${patient.primaryCarePhysician.phone}`}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white"
                      style={{ background: D.brandGrad, boxShadow: D.brandGlow }}
                    >
                      Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Medical ID */}
          <button
            onClick={() => setShowShareOptions(true)}
            className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 text-base"
            style={{ background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.22)', color: '#dc2626' }}
            data-testid="share-medical-id"
          >
            <Share2 className="w-5 h-5" />
            Share Medical ID for EMS
          </button>
        </div>

        {/* ── Share Options Modal ── */}
        {showShareOptions && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)' }} onClick={() => setShowShareOptions(false)}>
            <div className="rounded-3xl p-6 m-4 max-w-sm w-full" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: D.h }}>Share Medical ID</h3>
              <p className="text-sm font-light leading-relaxed mb-5" style={{ color: D.body }}>
                This will generate a secure summary of the patient&apos;s critical medical information for emergency services.
              </p>
              <div className="space-y-2">
                <button onClick={() => { alert('Medical ID shared with emergency services'); setShowShareOptions(false); }} className="w-full py-3.5 rounded-xl font-semibold text-white" style={{ background: '#ef4444' }}>
                  Share Now
                </button>
                <button onClick={() => setShowShareOptions(false)} className="w-full py-3.5 rounded-xl font-semibold" style={{ background: D.bg, border: `1px solid ${D.bdr}`, color: D.body }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Calendar Modal ── */}
        {showCalendar && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCalendar(false)}>
            <div className="rounded-3xl w-full max-w-md overflow-hidden" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>

              {/* Calendar Header */}
              <div className="p-4" style={{ borderBottom: `1px solid ${D.bdr}` }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold" style={{ color: D.h }}>Care History</h3>
                  <button onClick={() => setShowCalendar(false)} className="p-2 rounded-xl" style={{ background: D.bg, border: `1px solid ${D.bdr}` }}>
                    <X className="w-4 h-4" style={{ color: D.h }} />
                  </button>
                </div>
                <p className="text-xs font-light mb-4" style={{ color: D.muted }}>Select a date to view all care activities</p>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <button onClick={() => navigateMonth(-1)} className="p-2 rounded-xl" style={{ background: D.bg, border: `1px solid ${D.bdr}` }}>
                    <ChevronLeft className="w-4 h-4" style={{ color: D.h }} />
                  </button>
                  <h4 className="text-base font-semibold" style={{ color: D.h }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <button onClick={() => navigateMonth(1)} className="p-2 rounded-xl" style={{ background: D.bg, border: `1px solid ${D.bdr}` }}>
                    <ChevronRight className="w-4 h-4" style={{ color: D.h }} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-[11px] font-bold py-2" style={{ color: D.muted }}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((dayInfo, idx) => {
                    const isToday = dayInfo.date.toDateString() === today.toDateString();
                    const hasTasks = hasTasksOnDate(dayInfo.date);
                    const isPast = dayInfo.date <= today;
                    return (
                      <button
                        key={idx}
                        onClick={() => isPast && dayInfo.isCurrentMonth && handleDateSelect(dayInfo.date)}
                        disabled={!dayInfo.isCurrentMonth || !isPast}
                        className="relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all"
                        style={{
                          opacity: !dayInfo.isCurrentMonth ? 0.2 : (!isPast ? 0.4 : 1),
                          background: isToday ? D.brandGrad : 'transparent',
                          color: isToday ? '#ffffff' : dayInfo.isCurrentMonth && isPast ? D.h : D.muted,
                          fontWeight: isToday ? 700 : 500,
                          boxShadow: isToday ? D.brandGlow : 'none',
                        }}
                      >
                        {dayInfo.day}
                        {hasTasks && dayInfo.isCurrentMonth && (
                          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ background: isToday ? 'rgba(255,255,255,0.8)' : '#FFB347' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-4 pb-4 text-center">
                <p className="text-xs font-light" style={{ color: D.muted }}>Tap a date to view that day&apos;s care timeline</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileModal;

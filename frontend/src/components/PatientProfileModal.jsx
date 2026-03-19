import React, { useState, useMemo } from 'react';
import { X, Phone, MapPin, AlertTriangle, Heart, Pill, Camera, User, Share2, Shield, Activity, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { TaskStatus } from '../types';
import { CARE_IMAGES } from '../services/mockData';

export const PatientProfileModal = ({ 
  isOpen, 
  onClose, 
  patient,
  onUpdatePhoto,
  tasks = [],
  role = 'caregiver',
  onSelectDate
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 17));

  const today = useMemo(() => new Date(2026, 0, 17), []);

  // Generate mock historical tasks for different dates
  const historicalTasks = useMemo(() => {
    const taskHistory = {};
    
    const pastDates = [
      { date: new Date(2026, 0, 16), tasks: [
        { id: 'h1', title: 'Morning Medication', completedAt: '8:15 AM', status: TaskStatus.COMPLETED, completionNote: 'Took all medications with breakfast', evidenceUrl: CARE_IMAGES.medication },
        { id: 'h2', title: 'Breakfast Assistance', completedAt: '8:45 AM', status: TaskStatus.COMPLETED, completionNote: 'Had oatmeal and fruit', evidenceUrl: CARE_IMAGES.meal },
        { id: 'h3', title: 'Blood Pressure Check', completedAt: '10:30 AM', status: TaskStatus.COMPLETED, completionNote: 'BP: 128/82', evidenceUrl: CARE_IMAGES.vitals },
      ]},
      { date: new Date(2026, 0, 15), tasks: [
        { id: 'h4', title: 'Morning Walk', completedAt: '10:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Walked 15 minutes in the garden', evidenceUrl: CARE_IMAGES.walk },
        { id: 'h5', title: 'Lunch Preparation', completedAt: '12:15 PM', status: TaskStatus.COMPLETED, completionNote: 'Had soup and sandwich', evidenceUrl: CARE_IMAGES.meal },
      ]},
      { date: new Date(2026, 0, 14), tasks: [
        { id: 'h8', title: 'Morning Medication', completedAt: '8:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Medications administered', evidenceUrl: CARE_IMAGES.medication },
      ]},
    ];

    pastDates.forEach(({ date, tasks: dateTasks }) => {
      const key = date.toDateString();
      taskHistory[key] = dateTasks;
    });

    const todayCompleted = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    if (todayCompleted.length > 0) {
      taskHistory[today.toDateString()] = todayCompleted;
    }

    return taskHistory;
  }, [tasks, today]);

  const hasTasksOnDate = (date) => {
    return (historicalTasks[date.toDateString()] || []).length > 0;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthDays - i, 
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    return `${monthNames[date.getMonth()].substring(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateSelect = (date) => {
    if (onSelectDate) {
      onSelectDate(date, historicalTasks[date.toDateString()] || []);
    }
    setShowCalendar(false);
    onClose();
  };

  if (!isOpen || !patient) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpdatePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdatePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = () => {
    alert('Medical ID shared with emergency services');
    setShowShareOptions(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-['Manrope',sans-serif]" onClick={onClose}>
      <div 
        className="flex-1 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Photo */}
        <div className="relative h-[38vh]">
          {patient.photo ? (
            <>
              <img 
                src={patient.photo} 
                alt={patient.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-[#2c2c2e] flex items-center justify-center">
              <User className="w-24 h-24 text-stone-700" />
            </div>
          )}
          
          {/* Top Right Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            {/* Camera Button */}
            {onUpdatePhoto && (
              <label className="w-11 h-11 bg-stone-800/80 backdrop-blur-sm rounded-xl cursor-pointer flex items-center justify-center hover:bg-stone-700/80 transition-colors">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="w-11 h-11 bg-stone-800/80 backdrop-blur-sm hover:bg-stone-700/80 rounded-xl transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Patient Name - Bottom left */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-3xl font-bold text-white">{patient.name}</h2>
            <p className="text-white/70 text-base font-medium mt-1">Age {patient.age} • DOB: {patient.dateOfBirth || '1946-03-15'}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Care History Card - Green */}
          <button
            onClick={() => setShowCalendar(true)}
            className="w-full bg-[#25D366] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#20bd5a] transition-colors"
            data-testid="calendar-tab"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-white/80 font-bold uppercase tracking-wider">Care History</p>
              <p className="text-xl font-bold text-white">{formatDate(today)}</p>
            </div>
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Allergies Card - Red */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="bg-[#3d1a1a] border-2 border-[#7f2d2d] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[#ef4444] font-bold mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-lg">Allergies</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-4 py-2 bg-[#7f2d2d] text-[#f87171] rounded-xl text-sm font-semibold">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Conditions Card */}
          {patient.medicalConditions && patient.medicalConditions.length > 0 && (
            <div className="bg-[#1c1c1e] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-3">
                <Heart className="w-5 h-5 text-[#ec4899]" fill="currentColor" />
                <span className="text-lg">Medical Conditions</span>
              </div>
              <ul className="space-y-2">
                {patient.medicalConditions.map((condition, idx) => (
                  <li key={idx} className="text-base text-[#ababab] font-medium flex items-start gap-2">
                    <span className="text-[#8e8e93]">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Current Medications Card */}
          {patient.medications && patient.medications.length > 0 && (
            <div className="bg-[#1c1c1e] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-3">
                <Pill className="w-5 h-5 text-[#3b82f6]" />
                <span className="text-lg">Current Medications</span>
              </div>
              <div className="space-y-2">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="text-base">
                    <span className="font-bold text-white">{med.name}</span>
                    <span className="text-[#ababab] font-medium"> - {med.dosage}, {med.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Status & Mobility - Side by side */}
          <div className="grid grid-cols-2 gap-3">
            {patient.codeStatus && (
              <div className="bg-[#3d3a1a] border-2 border-[#a3903d] rounded-2xl p-4 text-center">
                <Shield className="w-7 h-7 text-[#eab308] mx-auto mb-2" />
                <p className="text-xs text-[#eab308] font-bold uppercase tracking-wider">Code Status</p>
                <p className="text-lg font-bold text-white mt-1">{patient.codeStatus}</p>
              </div>
            )}
            {patient.mobilityStatus && (
              <div className="bg-[#1a2a3d] border-2 border-[#3d6a9f] rounded-2xl p-4 text-center">
                <Activity className="w-7 h-7 text-[#3b82f6] mx-auto mb-2" />
                <p className="text-xs text-[#3b82f6] font-bold uppercase tracking-wider">Mobility</p>
                <p className="text-base font-bold text-white mt-1">{patient.mobilityStatus}</p>
              </div>
            )}
          </div>

          {/* Access Instructions Card */}
          {patient.accessInstructions && (
            <div className="bg-[#1c1c1e] rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-2">
                <MapPin className="w-5 h-5 text-[#22c55e]" />
                <span className="text-lg">Access Instructions</span>
              </div>
              <p className="text-base text-[#ababab] font-medium">{patient.accessInstructions}</p>
            </div>
          )}

          {/* Emergency Contacts Card */}
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white font-bold mb-4">
              <Phone className="w-5 h-5 text-[#f97316]" />
              <span className="text-lg">Emergency Contacts</span>
            </div>
            <div className="space-y-4">
              {patient.emergencyContacts?.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-lg">{contact.name}</p>
                    <p className="text-sm text-[#8e8e93] font-medium">{contact.relationship}</p>
                  </div>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="px-5 py-2.5 bg-[#22c55e] text-white rounded-xl text-sm font-bold hover:bg-[#16a34a] transition-colors"
                  >
                    Call
                  </a>
                </div>
              ))}
              
              {/* Primary Care Physician */}
              {patient.primaryCarePhysician && (
                <div className="pt-4 border-t border-[#2c2c2e]">
                  <p className="text-xs text-[#8e8e93] font-bold uppercase tracking-wider mb-3">Primary Care Physician</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-lg">{patient.primaryCarePhysician.name}</p>
                      <p className="text-sm text-[#8e8e93] font-medium">{patient.primaryCarePhysician.facility}</p>
                    </div>
                    <a 
                      href={`tel:${patient.primaryCarePhysician.phone}`}
                      className="px-5 py-2.5 bg-[#22c55e] text-white rounded-xl text-sm font-bold hover:bg-[#16a34a] transition-colors"
                    >
                      Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Medical ID Button - Red/Coral */}
          <button
            onClick={() => setShowShareOptions(true)}
            className="w-full py-4 bg-[#f43f5e] text-white rounded-2xl font-bold hover:bg-[#e11d48] transition-colors flex items-center justify-center gap-3 text-lg"
            data-testid="share-medical-id"
          >
            <Share2 className="w-6 h-6" />
            Share Medical ID for EMS
          </button>
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center" onClick={() => setShowShareOptions(false)}>
            <div className="bg-[#2c2c2e] rounded-3xl p-6 m-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-3">Share Medical ID</h3>
              <p className="text-sm text-[#ababab] mb-5 font-medium">
                This will generate a secure summary of the patient&apos;s critical medical information for emergency services.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 bg-[#f43f5e] text-white rounded-xl font-bold hover:bg-[#e11d48] transition-colors"
                >
                  Share Now
                </button>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="w-full py-3.5 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Modal */}
        {showCalendar && (
          <div 
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" 
            onClick={() => setShowCalendar(false)}
          >
            <div 
              className="bg-black rounded-3xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Calendar Header */}
              <div className="p-4 border-b border-[#2c2c2e]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Care History</h3>
                  <button 
                    onClick={() => setShowCalendar(false)}
                    className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-[#ababab]" />
                  </button>
                </div>
                
                <p className="text-sm text-[#ababab] mb-4">Select a date to view all care activities</p>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#ababab]" />
                  </button>
                  <h4 className="text-lg font-bold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <button 
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#ababab]" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-[#8e8e93] py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
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
                        className={`
                          relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                          ${!dayInfo.isCurrentMonth ? 'text-stone-700 cursor-not-allowed' : ''}
                          ${dayInfo.isCurrentMonth && !isPast ? 'text-[#8e8e93] cursor-not-allowed' : ''}
                          ${dayInfo.isCurrentMonth && isPast && !isToday ? 'text-stone-300 hover:bg-stone-800 cursor-pointer' : ''}
                          ${isToday ? 'bg-[#25D366] text-white hover:bg-[#20bd5a]' : ''}
                        `}
                      >
                        {dayInfo.day}
                        {hasTasks && dayInfo.isCurrentMonth && (
                          <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-[#25D366]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hint */}
              <div className="px-4 pb-4">
                <p className="text-xs text-[#8e8e93] text-center">
                  Tap a date to view that day&apos;s care timeline
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileModal;

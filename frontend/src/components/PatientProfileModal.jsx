import React, { useState, useMemo } from 'react';
import { X, Phone, MapPin, AlertTriangle, Heart, Pill, Camera, User, Share2, Shield, Activity, Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle, Image } from 'lucide-react';
import { TaskStatus } from '../types';
import { CARE_IMAGES, CAREGIVER_PROFILE } from '../services/mockData';

export const PatientProfileModal = ({ 
  isOpen, 
  onClose, 
  patient,
  onUpdatePhoto,
  tasks = [],
  role = 'caregiver' // 'caregiver' or 'family'
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 17)); // Jan 17, 2026
  const [selectedTask, setSelectedTask] = useState(null);

  const today = new Date(2026, 0, 17); // Jan 17, 2026

  // Generate mock historical tasks for different dates
  const historicalTasks = useMemo(() => {
    const taskHistory = {};
    
    // Add some completed tasks for past dates
    const pastDates = [
      { date: new Date(2026, 0, 16), tasks: [
        { id: 'h1', title: 'Morning Medication', completedAt: '8:15 AM', status: TaskStatus.COMPLETED, completionNote: 'Took all medications with breakfast', evidenceUrl: CARE_IMAGES.medication },
        { id: 'h2', title: 'Breakfast Assistance', completedAt: '8:45 AM', status: TaskStatus.COMPLETED, completionNote: 'Had oatmeal and fruit', evidenceUrl: CARE_IMAGES.meal },
        { id: 'h3', title: 'Blood Pressure Check', completedAt: '10:30 AM', status: TaskStatus.COMPLETED, completionNote: 'BP: 128/82', evidenceUrl: CARE_IMAGES.vitals },
      ]},
      { date: new Date(2026, 0, 15), tasks: [
        { id: 'h4', title: 'Morning Walk', completedAt: '10:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Walked 15 minutes in the garden', evidenceUrl: CARE_IMAGES.walk },
        { id: 'h5', title: 'Lunch Preparation', completedAt: '12:15 PM', status: TaskStatus.COMPLETED, completionNote: 'Had soup and sandwich', evidenceUrl: CARE_IMAGES.meal },
        { id: 'h6', title: 'Afternoon Medication', completedAt: '12:45 PM', status: TaskStatus.COMPLETED, completionNote: 'All meds taken on time', evidenceUrl: CARE_IMAGES.medication },
        { id: 'h7', title: 'Evening Vitals', completedAt: '6:00 PM', status: TaskStatus.COMPLETED, completionNote: 'Temperature: 98.4°F', evidenceUrl: CARE_IMAGES.vitals },
      ]},
      { date: new Date(2026, 0, 14), tasks: [
        { id: 'h8', title: 'Morning Medication', completedAt: '8:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Medications administered', evidenceUrl: CARE_IMAGES.medication },
        { id: 'h9', title: 'Physical Therapy', completedAt: '11:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Completed stretching exercises', evidenceUrl: CARE_IMAGES.walk },
      ]},
      { date: new Date(2026, 0, 13), tasks: [
        { id: 'h10', title: 'Doctor Visit Prep', completedAt: '9:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Prepared documents for appointment', evidenceUrl: null },
        { id: 'h11', title: 'Lunch Assistance', completedAt: '12:30 PM', status: TaskStatus.COMPLETED, completionNote: 'Light lunch, good appetite', evidenceUrl: CARE_IMAGES.meal },
        { id: 'h12', title: 'Afternoon Rest', completedAt: '2:00 PM', status: TaskStatus.COMPLETED, completionNote: 'Rested well for 2 hours', evidenceUrl: null },
      ]},
      { date: new Date(2026, 0, 10), tasks: [
        { id: 'h13', title: 'Morning Routine', completedAt: '8:30 AM', status: TaskStatus.COMPLETED, completionNote: 'Bathing and grooming complete', evidenceUrl: null },
        { id: 'h14', title: 'Medication Review', completedAt: '10:00 AM', status: TaskStatus.COMPLETED, completionNote: 'Weekly medication review done', evidenceUrl: CARE_IMAGES.medication },
      ]},
    ];

    pastDates.forEach(({ date, tasks }) => {
      const key = date.toDateString();
      taskHistory[key] = tasks;
    });

    // Add today's completed tasks
    const todayCompleted = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    if (todayCompleted.length > 0) {
      taskHistory[today.toDateString()] = todayCompleted;
    }

    return taskHistory;
  }, [tasks, today]);

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return historicalTasks[date.toDateString()] || [];
  };

  // Check if a date has tasks
  const hasTasksOnDate = (date) => {
    return getTasksForDate(date).length > 0;
  };

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthDays - i, 
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next month days
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
    setSelectedDate(date);
  };

  const getTaskImage = (task) => {
    if (task.evidenceUrl) return task.evidenceUrl;
    const title = task.title.toLowerCase();
    if (title.includes('medication') || title.includes('med')) return CARE_IMAGES.medication;
    if (title.includes('breakfast') || title.includes('lunch') || title.includes('dinner') || title.includes('meal') || title.includes('food')) return CARE_IMAGES.meal;
    if (title.includes('walk') || title.includes('exercise') || title.includes('therapy')) return CARE_IMAGES.walk;
    return CARE_IMAGES.vitals;
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

  // Render Task Detail View - Different based on role
  const renderTaskDetail = () => {
    if (!selectedTask) return null;

    const taskImage = getTaskImage(selectedTask);

    if (role === 'family') {
      // Family View - Airbnb style with large image
      return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div 
            className="bg-stone-950 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            {taskImage && (
              <div className="relative aspect-[16/10]">
                <img 
                  src={taskImage}
                  alt={selectedTask.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{selectedTask.title}</h3>
                  <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    Completed at {selectedTask.completedAt}
                  </p>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Completion Note */}
              {selectedTask.completionNote && (
                <div className="bg-stone-900 rounded-2xl p-4">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Caregiver Note</p>
                  <p className="text-stone-200 text-sm leading-relaxed">"{selectedTask.completionNote}"</p>
                </div>
              )}

              {/* Caregiver Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
                <img 
                  src={CAREGIVER_PROFILE.photo}
                  alt="Caregiver"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">Julia Martinez</p>
                  <p className="text-stone-500 text-sm">Certified Nursing Assistant</p>
                </div>
                <div className="flex items-center gap-1 text-[#25D366] text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Caregiver View - Compact card style
      return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div 
            className="bg-stone-950 border border-stone-800 rounded-3xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedTask.title}</h3>
                <p className="text-stone-400 text-sm">Completed at {selectedTask.completedAt}</p>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {/* Image */}
            {taskImage && (
              <div className="relative aspect-video">
                <img 
                  src={taskImage}
                  alt={selectedTask.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-[#25D366] rounded-lg text-white text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </div>
              </div>
            )}

            {/* Details */}
            <div className="p-4 space-y-3">
              {selectedTask.completionNote && (
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Your Note</p>
                  <p className="text-stone-300 text-sm bg-stone-900 rounded-xl p-3">"{selectedTask.completionNote}"</p>
                </div>
              )}

              {/* Task info */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-stone-900 rounded-xl p-3 text-center">
                  <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-stone-500">Time</p>
                  <p className="text-sm font-bold text-white">{selectedTask.completedAt}</p>
                </div>
                <div className="bg-stone-900 rounded-xl p-3 text-center">
                  <Image className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs text-stone-500">Evidence</p>
                  <p className="text-sm font-bold text-white">{taskImage ? 'Photo' : 'None'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" onClick={onClose}>
      <div 
        className="bg-stone-950 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Photo */}
        <div className="relative h-56 bg-gradient-to-br from-rose-600 to-rose-700 overflow-hidden">
          {patient.photo ? (
            <>
              <img 
                src={patient.photo} 
                alt={patient.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-24 h-24 text-white/40" />
            </div>
          )}
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Photo Upload Button */}
          {onUpdatePhoto && (
            <label className="absolute bottom-20 right-4 p-3 bg-stone-900 rounded-xl cursor-pointer shadow-lg hover:bg-stone-800 transition-colors border border-stone-700">
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Patient Name */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
            <p className="text-white/80 text-sm font-medium">Age {patient.age} • DOB: {patient.dateOfBirth}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Calendar Date Tab - NEW */}
          <button
            onClick={() => setShowCalendar(true)}
            className="w-full bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-4 flex items-center gap-3 hover:bg-[#25D366]/20 transition-colors"
            data-testid="calendar-tab"
          >
            <div className="w-11 h-11 bg-[#25D366]/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#25D366]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-[#25D366] font-bold uppercase tracking-wider">Care History</p>
              <p className="text-lg font-bold text-white">{formatDate(today)}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#25D366]" />
          </button>

          {/* Critical Alert - Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-3">
                <AlertTriangle className="w-5 h-5" />
                Allergies
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-full text-sm font-semibold">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          {patient.medicalConditions && patient.medicalConditions.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-3">
                <Heart className="w-5 h-5 text-rose-500" />
                Medical Conditions
              </div>
              <ul className="space-y-1.5">
                {patient.medicalConditions.map((condition, idx) => (
                  <li key={idx} className="text-sm text-stone-400 font-medium">• {condition}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Medications */}
          {patient.medications && patient.medications.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-3">
                <Pill className="w-5 h-5 text-blue-500" />
                Current Medications
              </div>
              <div className="space-y-2">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-bold text-white">{med.name}</span>
                    <span className="text-stone-400 font-medium"> - {med.dosage}, {med.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Status & Mobility */}
          <div className="grid grid-cols-2 gap-3">
            {patient.codeStatus && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                <Shield className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Code Status</p>
                <p className="text-sm font-bold text-white mt-1">{patient.codeStatus}</p>
              </div>
            )}
            {patient.mobilityStatus && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center">
                <Activity className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Mobility</p>
                <p className="text-sm font-bold text-white mt-1">{patient.mobilityStatus}</p>
              </div>
            )}
          </div>

          {/* Access Instructions */}
          {patient.accessInstructions && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Access Instructions
              </div>
              <p className="text-sm text-stone-400 font-medium">{patient.accessInstructions}</p>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white font-bold mb-4">
              <Phone className="w-5 h-5 text-emerald-500" />
              Emergency Contacts
            </div>
            <div className="space-y-3">
              {patient.emergencyContacts?.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{contact.name}</p>
                    <p className="text-xs text-stone-500 font-medium">{contact.relationship}</p>
                  </div>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
                  >
                    Call
                  </a>
                </div>
              ))}
              
              {/* Primary Care Physician */}
              {patient.primaryCarePhysician && (
                <div className="pt-3 border-t border-stone-800">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">Primary Care Physician</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{patient.primaryCarePhysician.name}</p>
                      <p className="text-xs text-stone-500 font-medium">{patient.primaryCarePhysician.facility}</p>
                    </div>
                    <a 
                      href={`tel:${patient.primaryCarePhysician.phone}`}
                      className="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share for EMS Button */}
          <button
            onClick={() => setShowShareOptions(true)}
            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(244,63,94,0.3)]"
            data-testid="share-medical-id"
          >
            <Share2 className="w-5 h-5" />
            Share Medical ID for EMS
          </button>
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center" onClick={() => setShowShareOptions(false)}>
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 m-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-3">Share Medical ID</h3>
              <p className="text-sm text-stone-400 mb-5 font-medium">
                This will generate a secure summary of the patient&apos;s critical medical information for emergency services.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
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

        {/* Calendar Modal - Airbnb Style */}
        {showCalendar && (
          <div 
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" 
            onClick={() => { setShowCalendar(false); setSelectedDate(null); }}
          >
            <div 
              className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Calendar Header */}
              <div className="p-4 border-b border-stone-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Care History</h3>
                  <button 
                    onClick={() => { setShowCalendar(false); setSelectedDate(null); }}
                    className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-400" />
                  </button>
                  <h4 className="text-lg font-bold text-white">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h4>
                  <button 
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-stone-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((dayInfo, idx) => {
                    const isToday = dayInfo.date.toDateString() === today.toDateString();
                    const isSelected = selectedDate && dayInfo.date.toDateString() === selectedDate.toDateString();
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
                          ${dayInfo.isCurrentMonth && !isPast ? 'text-stone-600 cursor-not-allowed' : ''}
                          ${dayInfo.isCurrentMonth && isPast ? 'text-stone-300 hover:bg-stone-800 cursor-pointer' : ''}
                          ${isToday ? 'bg-[#25D366] text-white hover:bg-[#20bd5a]' : ''}
                          ${isSelected && !isToday ? 'bg-stone-700 text-white' : ''}
                        `}
                      >
                        {dayInfo.day}
                        {hasTasks && dayInfo.isCurrentMonth && (
                          <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isToday || isSelected ? 'bg-white' : 'bg-[#25D366]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Tasks */}
              {selectedDate && (
                <div className="border-t border-stone-800 p-4 max-h-[40vh] overflow-y-auto">
                  <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">
                    {formatDate(selectedDate)}
                  </h4>
                  
                  {getTasksForDate(selectedDate).length > 0 ? (
                    <div className="space-y-2">
                      {getTasksForDate(selectedDate).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-3 flex items-center gap-3 hover:bg-stone-800 transition-colors text-left"
                          data-testid={`task-${task.id}`}
                        >
                          {/* Task thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-800">
                            {getTaskImage(task) ? (
                              <img 
                                src={getTaskImage(task)} 
                                alt={task.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-[#25D366]" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{task.title}</p>
                            <p className="text-stone-400 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.completedAt}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[#25D366] text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-stone-700 mx-auto mb-2" />
                      <p className="text-stone-500 text-sm">No tasks recorded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Task Detail Modal */}
        {selectedTask && renderTaskDetail()}
      </div>
    </div>
  );
};

export default PatientProfileModal;

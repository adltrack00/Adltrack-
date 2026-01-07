import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Heart, Thermometer, MessageCircle, Clock, CircleCheck,
  Camera, MapPin, Bell, Settings, ChevronRight, Calendar,
  User, ArrowLeft, Send, Plus, Sparkles, Shield, Play, Pause,
  AlertTriangle, CheckCircle2, XCircle, Home, Pill, Utensils,
  Dumbbell, Bath, Moon, Sun, Coffee, Apple
} from "lucide-react"
import { Button } from "./ui/button"

// Mock Data
const mockShift = {
  patient: {
    name: "Johnathan Doe",
    age: 78,
    address: "123 Oak Street, Apt 4B",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80",
    conditions: ["Hypertension", "Diabetes Type 2", "Mild Arthritis"],
    allergies: ["Penicillin", "Shellfish"]
  },
  startTime: "08:00 AM",
  endTime: "04:00 PM",
  checkedIn: true,
  location: { lat: 34.0522, lon: -118.2437 }
};

const mockTasks = [
  { id: 1, title: "Morning Medications", time: "08:00 AM", priority: "CRITICAL", completed: true, verified: true, category: "medication", icon: Pill },
  { id: 2, title: "Breakfast Preparation", time: "09:00 AM", priority: "STANDARD", completed: true, verified: false, category: "nutrition", icon: Coffee },
  { id: 3, title: "Blood Pressure Check", time: "09:30 AM", priority: "HIGH", completed: true, verified: true, category: "vitals", icon: Heart },
  { id: 4, title: "Physical Therapy Exercises", time: "10:30 AM", priority: "STANDARD", completed: false, verified: false, category: "exercise", icon: Dumbbell },
  { id: 5, title: "Lunch", time: "12:00 PM", priority: "STANDARD", completed: false, verified: false, category: "nutrition", icon: Utensils },
  { id: 6, title: "Afternoon Medications", time: "02:00 PM", priority: "CRITICAL", completed: false, verified: false, category: "medication", icon: Pill },
  { id: 7, title: "Assisted Bathing", time: "03:00 PM", priority: "STANDARD", completed: false, verified: false, category: "hygiene", icon: Bath },
];

const mockCopilotSuggestions = [
  { id: 1, text: "Patient's blood pressure was elevated yesterday. Consider monitoring more frequently today.", type: "alert" },
  { id: 2, text: "Reminder: Johnathan prefers his medication with applesauce.", type: "tip" },
  { id: 3, text: "Great job! You're ahead of schedule. Consider some light stretching exercises.", type: "encouragement" },
];

export const CaregiverDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState(mockTasks);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [shiftActive, setShiftActive] = useState(true);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  const handleCompleteTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleVerifyTask = (taskId) => {
    setSelectedTask(taskId);
    setShowCamera(true);
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'notes', label: 'Notes', icon: MessageCircle },
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] font-sans">
      {/* Header */}
      <header className="bg-[#25D366] text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-bold text-lg">Caregiver Dashboard</h1>
                <p className="text-sm text-white/80">Shift: {mockShift.startTime} - {mockShift.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/20 rounded-full relative">
                <Bell className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShiftActive(!shiftActive)}
                className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
                  shiftActive ? 'bg-white text-[#25D366]' : 'bg-red-500 text-white'
                }`}
              >
                {shiftActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {shiftActive ? 'On Shift' : 'Paused'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Patient Info Banner */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#25D366] shadow-md">
                <img src={mockShift.patient.avatar} alt={mockShift.patient.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-bold text-[#1F1F1F]">{mockShift.patient.name}</h2>
                <p className="text-sm text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {mockShift.patient.address}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-[#146C2E] bg-[#E6F4EA] px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold">Checked In</span>
              </div>
            </div>
          </div>
          
          {/* Quick Info Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {mockShift.patient.conditions.map((condition, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                {condition}
              </span>
            ))}
            {mockShift.patient.allergies.map((allergy, i) => (
              <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {allergy}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[#1F1F1F]">Today's Progress</span>
            <span className="text-sm text-slate-500">{completedTasks} of {totalTasks} tasks</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#25D366] to-[#0B57D0] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-[72px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#25D366] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  className={`bg-white rounded-[20px] p-4 shadow-sm border transition-all ${
                    task.completed ? 'border-[#C4EED0] bg-[#E6F4EA]/30' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 mt-1 ${
                        task.completed 
                          ? 'bg-[#25D366] text-white' 
                          : 'border-2 border-slate-300 hover:border-[#25D366]'
                      }`}
                      data-testid={`task-checkbox-${task.id}`}
                    >
                      {task.completed && <CircleCheck className="w-5 h-5" />}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {task.time}
                            </span>
                          </div>
                          <h4 className={`font-bold text-[#1F1F1F] flex items-center gap-2 ${
                            task.completed ? 'line-through opacity-60' : ''
                          }`}>
                            <task.icon className="w-4 h-4 text-slate-400" />
                            {task.title}
                          </h4>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {task.completed && !task.verified && (
                        <Button
                          onClick={() => handleVerifyTask(task.id)}
                          className="mt-3 bg-[#0B57D0] hover:bg-[#0842a0] text-white rounded-full text-xs h-9"
                          size="sm"
                        >
                          <Camera className="w-3 h-3 mr-2" />
                          Add Photo Verification
                        </Button>
                      )}
                      {task.verified && (
                        <div className="mt-3 flex items-center text-[#146C2E] text-xs font-bold bg-[#E6F4EA] px-3 py-2 rounded-lg w-fit">
                          <Shield className="w-4 h-4 mr-2" />
                          Verified with Photo Evidence
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'vitals' && (
            <motion.div
              key="vitals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#1F1F1F]">Record Vitals</h3>
                  <Button className="bg-[#25D366] hover:bg-[#20bd5a] rounded-full" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reading
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FFD8E4] p-5 rounded-[20px]">
                    <div className="flex justify-between items-start mb-4">
                      <Heart className="w-6 h-6 text-[#31111D]" />
                      <span className="text-xs font-bold text-[#31111D]/60">BLOOD PRESSURE</span>
                    </div>
                    <p className="text-3xl font-bold text-[#31111D]">120/80</p>
                    <p className="text-xs text-[#31111D]/70 mt-1">Normal • 9:30 AM</p>
                  </div>
                  <div className="bg-[#FFDCC2] p-5 rounded-[20px]">
                    <div className="flex justify-between items-start mb-4">
                      <Thermometer className="w-6 h-6 text-[#2E1500]" />
                      <span className="text-xs font-bold text-[#2E1500]/60">TEMPERATURE</span>
                    </div>
                    <p className="text-3xl font-bold text-[#2E1500]">98.6°F</p>
                    <p className="text-xs text-[#2E1500]/70 mt-1">Normal • 9:30 AM</p>
                  </div>
                  <div className="bg-[#E8DEF8] p-5 rounded-[20px]">
                    <div className="flex justify-between items-start mb-4">
                      <Activity className="w-6 h-6 text-[#21005D]" />
                      <span className="text-xs font-bold text-[#21005D]/60">HEART RATE</span>
                    </div>
                    <p className="text-3xl font-bold text-[#21005D]">72 bpm</p>
                    <p className="text-xs text-[#21005D]/70 mt-1">Normal • 9:30 AM</p>
                  </div>
                  <div className="bg-[#D3E4FD] p-5 rounded-[20px]">
                    <div className="flex justify-between items-start mb-4">
                      <Sun className="w-6 h-6 text-[#001D36]" />
                      <span className="text-xs font-bold text-[#001D36]/60">BLOOD SUGAR</span>
                    </div>
                    <p className="text-3xl font-bold text-[#001D36]">105 mg/dL</p>
                    <p className="text-xs text-[#001D36]/70 mt-1">Normal • 8:00 AM</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-[24px] p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Care Copilot</h3>
                    <p className="text-sm text-white/80">Your intelligent care assistant</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  I'm here to help you provide the best care for {mockShift.patient.name}. 
                  Ask me anything about medications, care procedures, or get personalized suggestions.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-[#1F1F1F] px-1">Today's Insights</h4>
                {mockCopilotSuggestions.map((suggestion) => (
                  <div 
                    key={suggestion.id} 
                    className={`bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex gap-4 ${
                      suggestion.type === 'alert' ? 'border-l-4 border-l-orange-400' :
                      suggestion.type === 'tip' ? 'border-l-4 border-l-blue-400' :
                      'border-l-4 border-l-green-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      suggestion.type === 'alert' ? 'bg-orange-100' :
                      suggestion.type === 'tip' ? 'bg-blue-100' :
                      'bg-green-100'
                    }`}>
                      {suggestion.type === 'alert' ? <AlertTriangle className="w-5 h-5 text-orange-600" /> :
                       suggestion.type === 'tip' ? <Sparkles className="w-5 h-5 text-blue-600" /> :
                       <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-[#1F1F1F] leading-relaxed">{suggestion.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Ask the AI Copilot anything..."
                    className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <Button className="rounded-full bg-gradient-to-r from-purple-500 to-blue-600" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-[#1F1F1F] mb-4">Shift Notes</h3>
                <textarea
                  placeholder="Add notes about today's shift..."
                  className="w-full h-40 bg-slate-50 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
                  data-testid="shift-notes-input"
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Add Photo
                    </Button>
                  </div>
                  <Button className="bg-[#25D366] hover:bg-[#20bd5a] rounded-full" size="sm">
                    Save Notes
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCamera(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-[24px] p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-xl text-[#1F1F1F] mb-4">Photo Verification</h3>
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Camera className="w-16 h-16 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 mb-4 text-center">
                Take a photo to verify task completion. This will be timestamped and geotagged.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-full"
                  onClick={() => setShowCamera(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] rounded-full"
                  onClick={() => {
                    setTasks(prev => prev.map(t => 
                      t.id === selectedTask ? { ...t, verified: true } : t
                    ));
                    setShowCamera(false);
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CaregiverDashboard;

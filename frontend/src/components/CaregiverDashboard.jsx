import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Heart, Thermometer, Clock, CircleCheck,
  Camera, MapPin, Bell, ArrowLeft, Send, Plus, Sparkles,
  AlertTriangle, CheckCircle2, Pill, Utensils, Dumbbell, Bath,
  ListTodo, FileText, Mic, Play, Pause
} from "lucide-react"
import { Button } from "./ui/button"

// Mock Data
const mockShift = {
  patient: {
    name: "Johnathan Doe",
    age: 78,
    address: "123 Oak Street, Apt 4B",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80",
    conditions: ["Hypertension", "Diabetes Type 2"],
    allergies: ["Penicillin"]
  },
  startTime: "08:00 AM",
  endTime: "04:00 PM",
};

const mockTasks = [
  { id: 1, title: "Morning Medications", time: "08:00 AM", priority: "critical", completed: true, verified: true, icon: Pill },
  { id: 2, title: "Breakfast", time: "09:00 AM", priority: "standard", completed: true, verified: false, icon: Utensils },
  { id: 3, title: "Blood Pressure Check", time: "09:30 AM", priority: "high", completed: true, verified: true, icon: Heart },
  { id: 4, title: "Physical Therapy", time: "10:30 AM", priority: "standard", completed: false, verified: false, icon: Dumbbell },
  { id: 5, title: "Lunch", time: "12:00 PM", priority: "standard", completed: false, verified: false, icon: Utensils },
  { id: 6, title: "Afternoon Meds", time: "02:00 PM", priority: "critical", completed: false, verified: false, icon: Pill },
  { id: 7, title: "Bathing Assistance", time: "03:00 PM", priority: "standard", completed: false, verified: false, icon: Bath },
];

const mockCopilotSuggestions = [
  { id: 1, text: "Blood pressure was slightly elevated yesterday. Consider extra monitoring.", type: "alert" },
  { id: 2, text: "Tip: Johnathan prefers his medication with applesauce.", type: "tip" },
  { id: 3, text: "Great work! You are ahead of schedule today.", type: "success" },
];

export const CaregiverDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState(mockTasks);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [shiftActive, setShiftActive] = useState(true);

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  const handleCompleteTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'copilot', label: 'AI', icon: Sparkles },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="font-semibold text-slate-900">Caregiver</h1>
                <p className="text-xs text-slate-500">{mockShift.startTime} - {mockShift.endTime}</p>
              </div>
            </div>
            <button 
              onClick={() => setShiftActive(!shiftActive)}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                shiftActive 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {shiftActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {shiftActive ? 'On Shift' : 'Paused'}
            </button>
          </div>
        </div>
      </header>

      {/* Patient Banner */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 flex-shrink-0">
              <img src={mockShift.patient.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 truncate">{mockShift.patient.name}</h2>
              <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {mockShift.patient.address}
              </p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full text-emerald-600 flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-medium">In</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {mockShift.patient.conditions.map((c, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{c}</span>
            ))}
            {mockShift.patient.allergies.map((a, i) => (
              <span key={i} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />{a}
              </span>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600 font-medium">Progress</span>
            <span className="text-slate-500">{completedTasks}/{tasks.length}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                    task.completed ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        task.completed 
                          ? 'bg-emerald-500 text-white' 
                          : 'border-2 border-slate-300 hover:border-emerald-400'
                      }`}
                      data-testid={`task-checkbox-${task.id}`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {task.priority === 'critical' && (
                          <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase">Critical</span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">High</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <task.icon className={`w-4 h-4 flex-shrink-0 ${task.completed ? 'text-slate-400' : 'text-slate-500'}`} />
                        <h4 className={`font-medium truncate ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{task.time}</p>
                      
                      {/* Actions */}
                      {task.completed && !task.verified && (
                        <Button
                          onClick={() => { setSelectedTask(task.id); setShowCamera(true); }}
                          className="mt-3 h-8 text-xs bg-blue-500 hover:bg-blue-600 rounded-full"
                          size="sm"
                        >
                          <Camera className="w-3 h-3 mr-1.5" />
                          Add Photo
                        </Button>
                      )}
                      {task.verified && (
                        <div className="mt-2 flex items-center text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Verified
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
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">Record Vitals</h3>
                <Button size="sm" className="rounded-full bg-emerald-500 hover:bg-emerald-600 h-9">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rose-50 rounded-2xl p-4">
                  <Heart className="w-5 h-5 text-rose-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">120/80</p>
                  <p className="text-xs text-slate-500">Blood Pressure</p>
                  <p className="text-[10px] text-slate-400 mt-1">9:30 AM</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                  <Thermometer className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">98.6°F</p>
                  <p className="text-xs text-slate-500">Temperature</p>
                  <p className="text-[10px] text-slate-400 mt-1">9:30 AM</p>
                </div>
                <div className="bg-violet-50 rounded-2xl p-4">
                  <Activity className="w-5 h-5 text-violet-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">72 bpm</p>
                  <p className="text-xs text-slate-500">Heart Rate</p>
                  <p className="text-[10px] text-slate-400 mt-1">9:30 AM</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                  <Activity className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-900">105</p>
                  <p className="text-xs text-slate-500">Blood Sugar</p>
                  <p className="text-[10px] text-slate-400 mt-1">8:00 AM</p>
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
              className="space-y-4"
            >
              {/* AI Header */}
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Care Copilot</h3>
                    <p className="text-xs text-white/70">Your intelligent assistant</p>
                  </div>
                </div>
                <p className="text-sm text-white/90">Ask me anything about care procedures or get personalized suggestions.</p>
              </div>

              {/* Suggestions */}
              <h4 className="font-medium text-slate-900">Today's Insights</h4>
              {mockCopilotSuggestions.map((s) => (
                <div key={s.id} className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${
                  s.type === 'alert' ? 'border-l-amber-400' :
                  s.type === 'tip' ? 'border-l-blue-400' : 'border-l-emerald-400'
                }`}>
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      s.type === 'alert' ? 'bg-amber-100' :
                      s.type === 'tip' ? 'bg-blue-100' : 'bg-emerald-100'
                    }`}>
                      {s.type === 'alert' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                       s.type === 'tip' ? <Sparkles className="w-4 h-4 text-blue-600" /> :
                       <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-sm text-slate-700 flex-1">{s.text}</p>
                  </div>
                </div>
              ))}

              {/* Chat Input */}
              <div className="flex gap-3 pt-4">
                <input
                  type="text"
                  placeholder="Ask the AI Copilot..."
                  className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                />
                <Button className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 p-0">
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-slate-900">Shift Notes</h3>
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <textarea
                  placeholder="Add notes about today's shift..."
                  className="w-full h-40 bg-transparent text-sm outline-none resize-none text-slate-700 placeholder:text-slate-400"
                  data-testid="shift-notes-input"
                />
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                  <Button size="sm" className="rounded-full bg-emerald-500 hover:bg-emerald-600">
                    Save Notes
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 safe-area-pb">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowCamera(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Photo Verification</h3>
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Camera className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 mb-4 text-center">
                Take a photo to verify task completion.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-full h-12"
                  onClick={() => setShowCamera(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-full h-12"
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

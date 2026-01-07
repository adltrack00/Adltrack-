import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Heart, Thermometer, Clock, CircleCheck,
  Camera, MapPin, Bell, ArrowLeft, Send, Plus, Sparkles,
  AlertTriangle, CheckCircle2, Pill, Utensils, Dumbbell, Bath,
  ListTodo, FileText, Mic, Play, Pause, Menu, X, Home,
  MessageSquare, User, Settings, ChevronRight, Image
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
}

const mockTasks = [
  { id: 1, title: "Morning Medications", time: "08:00 AM", priority: "critical", completed: true, verified: true, icon: Pill },
  { id: 2, title: "Breakfast", time: "09:00 AM", priority: "standard", completed: true, verified: false, icon: Utensils },
  { id: 3, title: "Blood Pressure Check", time: "09:30 AM", priority: "high", completed: true, verified: true, icon: Heart },
  { id: 4, title: "Physical Therapy", time: "10:30 AM", priority: "standard", completed: false, verified: false, icon: Dumbbell },
  { id: 5, title: "Lunch", time: "12:00 PM", priority: "standard", completed: false, verified: false, icon: Utensils },
  { id: 6, title: "Afternoon Meds", time: "02:00 PM", priority: "critical", completed: false, verified: false, icon: Pill },
  { id: 7, title: "Bathing Assistance", time: "03:00 PM", priority: "standard", completed: false, verified: false, icon: Bath },
]

const mockChatHistory = [
  { id: 1, role: "assistant", content: "Good morning! I see you're starting your shift with Johnathan Doe. Here's a quick summary: Blood pressure was slightly elevated yesterday (142/88). Remember, he prefers his medication with applesauce." },
  { id: 2, role: "user", content: "Thanks! What should I watch out for today?" },
  { id: 3, role: "assistant", content: "Great question! Key things to monitor:\n• Blood pressure - take reading before and after physical therapy\n• Blood sugar levels - he had a low reading two days ago\n• Hydration - encourage fluids throughout the day" },
]

const suggestionChips = [
  { text: "Log vital signs", icon: Heart },
  { text: "View care plan", icon: FileText },
  { text: "Report concern", icon: AlertTriangle },
  { text: "Take photo", icon: Camera },
]

export const CaregiverDashboard = ({ onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('tasks')
  const [tasks, setTasks] = useState(mockTasks)
  const [inputMessage, setInputMessage] = useState('')
  const [chatHistory, setChatHistory] = useState(mockChatHistory)
  const [shiftActive, setShiftActive] = useState(true)
  const [showCamera, setShowCamera] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const completedTasks = tasks.filter(t => t.completed).length
  const progress = Math.round((completedTasks / tasks.length) * 100)

  const handleCompleteTask = (taskId) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setChatHistory(prev => [...prev, { id: Date.now(), role: 'user', content: inputMessage }])
    setInputMessage('')
    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I understand. Let me help you with that. Based on the care plan and current patient status, here are my recommendations..."
      }])
    }, 1000)
  }

  const sidebarItems = [
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'chat', label: 'AI Assistant', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-sans flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">ADLTrack</h1>
              <p className="text-xs text-gray-500">Caregiver Portal</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-[#E6F4EA] text-[#146C2E]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Back Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">ADLTrack</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeView === item.id
                        ? 'bg-[#E6F4EA] text-[#146C2E]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-100">
                <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <ArrowLeft className="w-5 h-5" />
                  Back to Home
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
        {/* Top Header - Mobile */}
        <header className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="grid grid-cols-[48px_1fr_48px] items-center px-2 py-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 justify-self-start">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-1.5 justify-center">
              <div className="w-6 h-6 rounded-lg bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">ADLTrack</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 relative justify-self-end">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Patient Card - Always visible */}
        <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100">
                  <img src={mockShift.patient.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900">{mockShift.patient.name}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{mockShift.patient.address}</span>
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setShiftActive(!shiftActive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    shiftActive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {shiftActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {shiftActive ? 'On Shift' : 'Paused'}
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[#25D366] rounded-full"
                />
              </div>
              <span className="text-sm font-medium text-gray-600">{progress}%</span>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {mockShift.patient.conditions.map((c, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{c}</span>
              ))}
              {mockShift.patient.allergies.map((a, i) => (
                <span key={i} className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />{a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <AnimatePresence mode="wait">
              {/* Chat View - Copilot Style */}
              {activeView === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Chat History */}
                  <div className="space-y-4 overflow-x-hidden">
                    {chatHistory.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'assistant'
                            ? 'bg-[#25D366]'
                            : 'bg-gray-200'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          ) : (
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                          )}
                        </div>
                        <div className={`max-w-[70%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                          msg.role === 'assistant'
                            ? 'bg-white border border-gray-100 shadow-sm'
                            : 'bg-[#25D366] text-white'
                        }`}>
                          <p className={`text-sm whitespace-pre-line break-words ${msg.role === 'assistant' ? 'text-gray-700' : 'text-white'}`}>
                            {msg.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tasks View */}
              {activeView === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Tasks</h2>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      className={`bg-white rounded-2xl p-4 border transition-all ${
                        task.completed ? 'border-green-100 bg-green-50/30' : 'border-gray-100 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            task.completed
                              ? 'bg-green-500 text-white'
                              : 'border-2 border-gray-300 hover:border-[#25D366]'
                          }`}
                          data-testid={`task-checkbox-${task.id}`}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {task.priority === 'critical' && (
                              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Critical</span>
                            )}
                            {task.priority === 'high' && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">High</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <task.icon className={`w-4 h-4 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {task.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{task.time}</p>
                          {task.completed && !task.verified && (
                            <Button
                              onClick={() => { setSelectedTask(task.id); setShowCamera(true); }}
                              className="mt-3 h-8 text-xs bg-[#25D366] hover:bg-[#20bd5a] rounded-full"
                              size="sm"
                            >
                              <Camera className="w-3 h-3 mr-1.5" />
                              Verify with Photo
                            </Button>
                          )}
                          {task.verified && (
                            <div className="mt-2 flex items-center text-green-600 text-xs font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Verified
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Vitals View */}
              {activeView === 'vitals' && (
                <motion.div
                  key="vitals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Vitals</h2>
                    <Button size="sm" className="rounded-full bg-[#25D366] hover:bg-[#20bd5a] h-9">
                      <Plus className="w-4 h-4 mr-1" /> Record
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">120/80</p>
                      <p className="text-sm text-gray-500">Blood Pressure</p>
                      <p className="text-xs text-gray-400 mt-1">9:30 AM</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                        <Thermometer className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">98.6°F</p>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="text-xs text-gray-400 mt-1">9:30 AM</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center mb-3">
                        <Activity className="w-5 h-5 text-[#25D366]" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">72 bpm</p>
                      <p className="text-sm text-gray-500">Heart Rate</p>
                      <p className="text-xs text-gray-400 mt-1">9:30 AM</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                        <Activity className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">105</p>
                      <p className="text-sm text-gray-500">Blood Sugar</p>
                      <p className="text-xs text-gray-400 mt-1">8:00 AM</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notes View */}
              {activeView === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shift Notes</h2>
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <textarea
                      placeholder="Add notes about today's shift..."
                      className="w-full h-40 bg-transparent text-sm outline-none resize-none text-gray-700 placeholder:text-gray-400"
                      data-testid="shift-notes-input"
                    />
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Camera className="w-4 h-4 mr-2" />
                        Add Photo
                      </Button>
                      <Button size="sm" className="rounded-full bg-[#25D366] hover:bg-[#20bd5a]">
                        Save Notes
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Copilot-style Bottom Input - Always visible */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pt-6 pb-4 px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap shadow-sm flex-shrink-0"
                >
                  <chip.icon className="w-4 h-4 text-[#25D366]" />
                  {chip.text}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-3 bg-white rounded-full border border-gray-200 shadow-lg px-4 py-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Plus className="w-5 h-5 text-gray-500" />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask the AI Care Assistant..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Mic className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-full bg-[#25D366] hover:bg-[#20bd5a] transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCamera(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Photo Verification</h3>
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Camera className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-sm text-gray-500 mb-4 text-center">
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
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] rounded-full h-12"
                  onClick={() => {
                    setTasks(prev => prev.map(t =>
                      t.id === selectedTask ? { ...t, verified: true } : t
                    ))
                    setShowCamera(false)
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
  )
}

export default CaregiverDashboard

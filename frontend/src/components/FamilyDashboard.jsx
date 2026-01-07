import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Heart, Thermometer, MessageCircle, Clock, CircleCheck,
  Camera, Phone, Video, Bell, ChevronRight, Calendar,
  ArrowLeft, Send, Plus, Home, Sparkles, User, Menu, X,
  TrendingUp, Shield, MapPin, FileText, Image
} from "lucide-react"
import { Button } from "./ui/button"

// Mock Data
const mockPatient = {
  name: "Johnathan Doe",
  age: 78,
  status: "Comfortable",
  avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80",
  caregiver: {
    name: "Sarah Jenkins",
    role: "CNA",
    avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80",
    status: "On Shift"
  }
}

const mockVitals = [
  { type: "HR", value: "72", unit: "bpm", label: "Heart Rate", trend: "+2", icon: Heart, color: "red" },
  { type: "TEMP", value: "98.6", unit: "°F", label: "Temperature", trend: "0", icon: Thermometer, color: "amber" },
  { type: "BP", value: "120/80", unit: "mmHg", label: "Blood Pressure", trend: "-3", icon: Activity, color: "purple" },
]

const mockTimeline = [
  { id: 1, task: "Morning Medications", time: "08:00 AM", completed: true, verified: true },
  { id: 2, task: "Breakfast", time: "09:15 AM", completed: true, verified: false },
  { id: 3, task: "Physical Therapy", time: "10:30 AM", completed: true, verified: true },
  { id: 4, task: "Lunch", time: "12:00 PM", completed: false, verified: false },
  { id: 5, task: "Afternoon Meds", time: "02:00 PM", completed: false, verified: false },
]

const mockChatHistory = [
  { id: 1, role: "assistant", content: "Good morning! I'm here to help you stay connected with your father's care. Sarah just checked in for her shift and reported that Johnathan is in great spirits today." },
  { id: 2, role: "user", content: "That's wonderful! How was his sleep last night?" },
  { id: 3, role: "assistant", content: "According to the night report, Johnathan slept well from 10 PM to 6 AM with only one brief awakening at 2 AM. His sleep quality has been improving over the past week." },
]

const suggestionChips = [
  { text: "View today's schedule", icon: Calendar },
  { text: "Check vitals", icon: Heart },
  { text: "Message caregiver", icon: MessageCircle },
  { text: "View photos", icon: Image },
]

export const FamilyDashboard = ({ onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('overview')
  const [inputMessage, setInputMessage] = useState('')
  const [chatHistory, setChatHistory] = useState(mockChatHistory)

  const completedTasks = mockTimeline.filter(t => t.completed).length
  const progress = Math.round((completedTasks / mockTimeline.length) * 100)

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setChatHistory(prev => [...prev, { id: Date.now(), role: 'user', content: inputMessage }])
    setInputMessage('')
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I understand your concern. Let me check the latest updates and get back to you with detailed information about your father's care today."
      }])
    }, 1000)
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'chat', label: 'AI Assistant', icon: Sparkles },
  ]

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-sans flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">ADLTrack</h1>
              <p className="text-xs text-gray-500">Family Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

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

      {/* Mobile Sidebar */}
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
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
                        ? 'bg-purple-50 text-purple-700'
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
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
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

        {/* Patient & Caregiver Card */}
        <div className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100">
                  <img src={mockPatient.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900">{mockPatient.name}</h2>
                <p className="text-sm text-gray-500">Age {mockPatient.age} • {mockPatient.status}</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 flex items-center justify-center transition-all shadow-lg shadow-purple-200">
                  <Video className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Caregiver Strip */}
            <div className="mt-4 p-3 bg-purple-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <img src={mockPatient.caregiver.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{mockPatient.caregiver.name}</p>
                  <p className="text-xs text-gray-500">{mockPatient.caregiver.role} • {mockPatient.caregiver.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-600">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto overflow-x-hidden">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <AnimatePresence mode="wait">
              {/* Chat View */}
              {activeView === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 overflow-x-hidden"
                >
                  {chatHistory.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'assistant'
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500'
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
                          : 'bg-purple-600 text-white'
                      }`}>
                        <p className={`text-sm whitespace-pre-line break-words ${msg.role === 'assistant' ? 'text-gray-700' : 'text-white'}`}>
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Overview View */}
              {activeView === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Progress Card */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Today&apos;s Progress</h3>
                        <p className="text-sm text-gray-500">{completedTasks} of {mockTimeline.length} tasks completed</p>
                      </div>
                      <div className="relative w-14 h-14">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="28" cy="28" r="24" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                          <circle
                            cx="28" cy="28" r="24"
                            stroke="url(#progressGradient)"
                            strokeWidth="5"
                            fill="none"
                            strokeDasharray="150.8"
                            strokeDashoffset={150.8 - (150.8 * progress / 100)}
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">{progress}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {mockTimeline.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            item.completed ? 'bg-gray-50' : 'bg-white border border-gray-100'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            item.completed
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                              : 'bg-gray-100'
                          }`}>
                            {item.completed ? (
                              <CircleCheck className="w-4 h-4 text-white" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${item.completed ? 'text-gray-400' : 'text-gray-900'}`}>
                              {item.task}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">{item.time}</span>
                          {item.verified && (
                            <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Camera className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Vitals */}
                  <div className="grid grid-cols-3 gap-3">
                    {mockVitals.map((vital, i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                          vital.color === 'red' ? 'bg-red-50' :
                          vital.color === 'amber' ? 'bg-amber-50' : 'bg-purple-50'
                        }`}>
                          <vital.icon className={`w-5 h-5 ${
                            vital.color === 'red' ? 'text-red-500' :
                            vital.color === 'amber' ? 'text-amber-500' : 'text-purple-500'
                          }`} />
                        </div>
                        <p className="text-xl font-bold text-gray-900">{vital.value}</p>
                        <p className="text-xs text-gray-500">{vital.label}</p>
                      </div>
                    ))}
                  </div>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Vitals</h2>
                  {mockVitals.map((vital, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            vital.color === 'red' ? 'bg-red-50' :
                            vital.color === 'amber' ? 'bg-amber-50' : 'bg-purple-50'
                          }`}>
                            <vital.icon className={`w-6 h-6 ${
                              vital.color === 'red' ? 'text-red-500' :
                              vital.color === 'amber' ? 'text-amber-500' : 'text-purple-500'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{vital.label}</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {vital.value} <span className="text-base font-normal text-gray-400">{vital.unit}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                            parseFloat(vital.trend) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            <TrendingUp className="w-4 h-4" />
                            {vital.trend}%
                          </div>
                          <p className="text-xs text-gray-400 mt-1">vs yesterday</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Messages View */}
              {activeView === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                        FC
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Family Chat</h3>
                        <p className="text-sm text-gray-500">4 members • 2 online</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 p-4 bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Messages will appear here</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                        data-testid="message-input"
                      />
                      <Button className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-4">
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Schedule View */}
              {activeView === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Today&apos;s Schedule</h2>
                    <button className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                      View Week
                    </button>
                  </div>
                  {mockTimeline.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-4 border shadow-sm ${
                        item.completed ? 'border-green-100 bg-green-50/30' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          item.completed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200'
                            : 'bg-gray-100'
                        }`}>
                          {item.completed ? (
                            <CircleCheck className="w-5 h-5 text-white" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${item.completed ? 'text-gray-500' : 'text-gray-900'}`}>
                            {item.task}
                          </h4>
                          <p className="text-sm text-gray-400">{item.time}</p>
                        </div>
                        {item.verified && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                            <Camera className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Copilot-style Bottom Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pt-6 pb-4 px-3 sm:px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            {/* Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap shadow-sm flex-shrink-0"
                >
                  <chip.icon className="w-4 h-4 text-purple-500" />
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
                placeholder="Ask about your loved one's care..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FamilyDashboard

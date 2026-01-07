import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Heart, Thermometer, MessageCircle, Clock, CircleCheck,
  Camera, Phone, Video, Bell, ChevronRight, Calendar,
  ArrowLeft, Send, Plus, Home, Sparkles, User, Sun, Moon,
  TrendingUp, Shield, MoreHorizontal
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
};

const mockVitals = [
  { type: "HR", value: "72", unit: "bpm", label: "Heart Rate", trend: "+2", icon: Heart, gradient: "from-rose-500 to-pink-500" },
  { type: "TEMP", value: "98.6", unit: "°F", label: "Temperature", trend: "0", icon: Thermometer, gradient: "from-amber-500 to-orange-500" },
  { type: "BP", value: "120/80", unit: "mmHg", label: "Blood Pressure", trend: "-3", icon: Activity, gradient: "from-violet-500 to-purple-500" },
];

const mockTimeline = [
  { id: 1, task: "Morning Medications", time: "08:00 AM", completed: true, verified: true },
  { id: 2, task: "Breakfast", time: "09:15 AM", completed: true, verified: false },
  { id: 3, task: "Physical Therapy", time: "10:30 AM", completed: true, verified: true },
  { id: 4, task: "Lunch", time: "12:00 PM", completed: false, verified: false },
  { id: 5, task: "Afternoon Meds", time: "02:00 PM", completed: false, verified: false },
];

const mockMessages = [
  { id: 1, sender: "Sarah", text: "Good morning! Dad is in great spirits today.", time: "9:30 AM", isMe: false },
  { id: 2, sender: "Me", text: "Wonderful! Did he take his morning pills?", time: "9:32 AM", isMe: true },
  { id: 3, sender: "Sarah", text: "Yes, all done at 8 AM. Photo attached!", time: "9:33 AM", isMe: false, hasPhoto: true },
];

export const FamilyDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');

  const completedTasks = mockTimeline.filter(t => t.completed).length;
  const progress = (completedTasks / mockTimeline.length) * 100;

  const tabs = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'messages', label: 'Chat', icon: MessageCircle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      {/* Copilot-style gradient header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <header className="relative px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="font-semibold text-white text-lg">Family Portal</h1>
                <p className="text-white/70 text-sm">Caring for {mockPatient.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center relative transition-all">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="pt-24 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Welcome Card - Copilot Style */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-purple-100">
                        <img src={mockPatient.avatar} alt={mockPatient.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900">{mockPatient.name}</h2>
                      <p className="text-slate-500">Age {mockPatient.age} • {mockPatient.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <Phone className="w-5 h-5 text-slate-600" />
                      </button>
                      <button className="w-11 h-11 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 flex items-center justify-center transition-all shadow-lg shadow-purple-200">
                        <Video className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Caregiver Strip */}
                  <div className="mt-5 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden">
                        <img src={mockPatient.caregiver.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{mockPatient.caregiver.name}</p>
                        <p className="text-sm text-slate-500">{mockPatient.caregiver.role} • {mockPatient.caregiver.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-slate-600">Live</span>
                    </div>
                  </div>
                </div>

                {/* Progress Ring Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-slate-900">Today's Progress</h3>
                      <p className="text-sm text-slate-500">{completedTasks} of {mockTimeline.length} tasks completed</p>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="none" />
                        <circle 
                          cx="32" cy="32" r="28" 
                          stroke="url(#progressGradient)" 
                          strokeWidth="6" 
                          fill="none" 
                          strokeDasharray="175.9" 
                          strokeDashoffset={175.9 - (175.9 * progress / 100)}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900">{Math.round(progress)}%</span>
                    </div>
                  </div>
                  
                  {/* Task List */}
                  <div className="space-y-3">
                    {mockTimeline.slice(0, 4).map((item, i) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                          item.completed ? 'bg-slate-50' : 'bg-white border border-slate-100 shadow-sm'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          item.completed 
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500' 
                            : 'bg-slate-100'
                        }`}>
                          {item.completed ? (
                            <CircleCheck className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${item.completed ? 'text-slate-400' : 'text-slate-900'}`}>
                            {item.task}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">{item.time}</span>
                        {item.verified && (
                          <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Camera className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Vitals Grid - Copilot Card Style */}
                <div className="grid grid-cols-3 gap-3">
                  {mockVitals.map((vital, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${vital.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                        <vital.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{vital.value}</p>
                      <p className="text-xs text-slate-500">{vital.label}</p>
                      <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                        parseFloat(vital.trend) > 0 ? 'text-green-600' : 
                        parseFloat(vital.trend) < 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        {vital.trend}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'vitals' && (
              <motion.div
                key="vitals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">Health Vitals</h2>
                {mockVitals.map((vital, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${vital.gradient} flex items-center justify-center shadow-lg`}>
                          <vital.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">{vital.label}</p>
                          <p className="text-3xl font-bold text-slate-900">{vital.value} <span className="text-lg font-normal text-slate-400">{vital.unit}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          parseFloat(vital.trend) >= 0 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          <TrendingUp className="w-4 h-4" />
                          {vital.trend}%
                        </div>
                        <p className="text-xs text-slate-400 mt-1">vs yesterday</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[calc(100vh-200px)]"
              >
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                      FC
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Family Chat</h3>
                      <p className="text-sm text-slate-500">4 members • 2 online</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {mockMessages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${msg.isMe ? '' : 'flex gap-2'}`}>
                        {!msg.isMe && (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-violet-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {msg.sender[0]}
                          </div>
                        )}
                        <div>
                          {!msg.isMe && <p className="text-xs text-slate-500 mb-1 ml-1">{msg.sender}</p>}
                          <div className={`px-4 py-3 rounded-3xl ${
                            msg.isMe 
                              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-br-lg' 
                              : 'bg-white text-slate-900 rounded-bl-lg shadow-sm border border-slate-100'
                          }`}>
                            <p className="text-sm">{msg.text}</p>
                            {msg.hasPhoto && (
                              <div className="mt-2 rounded-2xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80" alt="" className="w-full h-24 object-cover" />
                              </div>
                            )}
                          </div>
                          <p className={`text-[10px] mt-1 ${msg.isMe ? 'text-right' : 'ml-1'} text-slate-400`}>{msg.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-100 bg-white">
                  <div className="flex gap-3">
                    <button className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <Plus className="w-5 h-5 text-slate-600" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      data-testid="message-input"
                    />
                    <Button className="w-11 h-11 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 p-0 shadow-lg shadow-purple-200">
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-slate-900">Today's Schedule</h2>
                  <button className="px-4 py-2 bg-white rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    View Week
                  </button>
                </div>
                
                {mockTimeline.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
                      item.completed ? 'border-green-100 bg-green-50/30' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        item.completed 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200' 
                          : 'bg-slate-100'
                      }`}>
                        {item.completed ? (
                          <CircleCheck className="w-6 h-6 text-white" />
                        ) : (
                          <Clock className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${item.completed ? 'text-slate-500' : 'text-slate-900'}`}>
                          {item.task}
                        </h4>
                        <p className="text-sm text-slate-400">{item.time}</p>
                      </div>
                      {item.verified && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">Verified</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation - Copilot Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-200'
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
    </div>
  );
};

export default FamilyDashboard;

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Heart, Thermometer, MessageCircle, Clock, CircleCheck,
  Camera, Phone, Video, Bell, Settings, ChevronRight, Calendar,
  ArrowLeft, Send, Plus, User, Home, Sparkles
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
  { type: "BP", value: "120/80", label: "Blood Pressure", trend: "Normal", icon: Heart, color: "rose" },
  { type: "TEMP", value: "98.6°", label: "Temperature", trend: "Stable", icon: Thermometer, color: "amber" },
  { type: "HR", value: "72", label: "Heart Rate", trend: "Normal", icon: Activity, color: "violet" },
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
  { id: 4, sender: "Tom", text: "Thanks Sarah! I will visit this evening.", time: "10:15 AM", isMe: false },
];

export const FamilyDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');

  const tabs = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'messages', label: 'Chat', icon: MessageCircle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ];

  const completedTasks = mockTimeline.filter(t => t.completed).length;
  const progress = (completedTasks / mockTimeline.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans">
      {/* Clean Header */}
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
                <h1 className="font-semibold text-slate-900">Family Portal</h1>
                <p className="text-xs text-slate-500">Caring for {mockPatient.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center relative transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-6"
            >
              {/* Patient Card - Clean & Minimal */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-100 to-violet-50">
                    <img src={mockPatient.avatar} alt={mockPatient.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-900">{mockPatient.name}</h2>
                    <p className="text-sm text-slate-500">Age {mockPatient.age}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-sm font-medium text-emerald-600">{mockPatient.status}</span>
                    </div>
                  </div>
                </div>
                
                {/* Caregiver Info */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-100">
                        <img src={mockPatient.caregiver.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{mockPatient.caregiver.name}</p>
                        <p className="text-xs text-slate-500">{mockPatient.caregiver.role} • {mockPatient.caregiver.status}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <Phone className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-violet-100 hover:bg-violet-200 flex items-center justify-center transition-colors">
                        <Video className="w-4 h-4 text-violet-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Today's Care</h3>
                  <span className="text-sm text-slate-500">{completedTasks} of {mockTimeline.length}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full"
                  />
                </div>
                
                {/* Timeline */}
                <div className="mt-5 space-y-3">
                  {mockTimeline.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.completed ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        {item.completed ? (
                          <CircleCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${item.completed ? 'text-slate-400' : 'text-slate-900'}`}>
                          {item.task}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{item.time}</span>
                      {item.verified && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-3 gap-3">
                {mockVitals.map((vital, i) => (
                  <div key={i} className={`rounded-2xl p-4 ${
                    vital.color === 'rose' ? 'bg-rose-50' :
                    vital.color === 'amber' ? 'bg-amber-50' : 'bg-violet-50'
                  }`}>
                    <vital.icon className={`w-5 h-5 mb-2 ${
                      vital.color === 'rose' ? 'text-rose-500' :
                      vital.color === 'amber' ? 'text-amber-500' : 'text-violet-500'
                    }`} />
                    <p className="text-lg font-bold text-slate-900">{vital.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{vital.trend}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'vitals' && (
            <motion.div
              key="vitals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-4"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Health Vitals</h2>
              {mockVitals.map((vital, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        vital.color === 'rose' ? 'bg-rose-100' :
                        vital.color === 'amber' ? 'bg-amber-100' : 'bg-violet-100'
                      }`}>
                        <vital.icon className={`w-6 h-6 ${
                          vital.color === 'rose' ? 'text-rose-500' :
                          vital.color === 'amber' ? 'text-amber-500' : 'text-violet-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">{vital.label}</p>
                        <p className="text-2xl font-bold text-slate-900">{vital.value}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                        {vital.trend}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">2h ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 flex flex-col h-[calc(100vh-180px)]"
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  F
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Family Room</h3>
                  <p className="text-xs text-slate-500">4 members</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {mockMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${msg.isMe ? '' : 'flex gap-2'}`}>
                      {!msg.isMe && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                          {msg.sender[0]}
                        </div>
                      )}
                      <div>
                        {!msg.isMe && <p className="text-xs text-slate-500 mb-1 ml-1">{msg.sender}</p>}
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          msg.isMe 
                            ? 'bg-violet-500 text-white rounded-br-md' 
                            : 'bg-white border border-slate-100 text-slate-900 rounded-bl-md shadow-sm'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          {msg.hasPhoto && (
                            <div className="mt-2 rounded-xl overflow-hidden">
                              <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80" alt="" className="w-full h-24 object-cover" />
                            </div>
                          )}
                        </div>
                        <p className={`text-[10px] mt-1 ${msg.isMe ? 'text-right' : 'ml-1'} text-slate-400`}>{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-200 transition-all"
                  data-testid="message-input"
                />
                <Button className="w-12 h-12 rounded-full bg-violet-500 hover:bg-violet-600 p-0 flex-shrink-0">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Today's Schedule</h2>
                <button className="text-sm text-violet-600 font-medium">View Week</button>
              </div>
              
              {mockTimeline.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${
                  item.completed ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.completed ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      {item.completed ? (
                        <CircleCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={`font-medium ${item.completed ? 'text-slate-500' : 'text-slate-900'}`}>
                            {item.task}
                          </h4>
                          <p className="text-sm text-slate-400 mt-0.5">{item.time}</p>
                        </div>
                        {item.verified && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                            <Camera className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Clean Pill Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 safe-area-pb">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-violet-100 text-violet-600'
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

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Heart, Thermometer, MessageCircle, Clock, CircleCheck,
  Camera, Phone, Video, Bell, Settings, ChevronRight, Calendar,
  User, ArrowLeft, Send, Plus, MoreVertical, Sparkles, Shield,
  AlertTriangle, TrendingUp, FileText, Users, Home, Pill
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
  { type: "BP", value: "120/80", label: "Blood Pressure", trend: "Normal", icon: Heart, color: "pink" },
  { type: "TEMP", value: "98.6°", label: "Temperature", trend: "Stable", icon: Thermometer, color: "orange" },
  { type: "HR", value: "72", label: "Heart Rate", trend: "Normal", icon: Activity, color: "red" },
];

const mockTimeline = [
  { id: 1, task: "Morning Medications", time: "08:00 AM", completed: true, verified: true, caregiver: "Sarah J.", notes: "Administered Lisinopril 10mg, Metformin 500mg" },
  { id: 2, task: "Breakfast", time: "09:15 AM", completed: true, verified: false, caregiver: "Sarah J.", notes: "Oatmeal with fruit. Good appetite today!" },
  { id: 3, task: "Physical Therapy", time: "10:30 AM", completed: true, verified: true, caregiver: "Sarah J.", notes: "30 min session. Leg lifts and stretching." },
  { id: 4, task: "Lunch", time: "12:00 PM", completed: false, verified: false, caregiver: "Sarah J.", notes: "" },
  { id: 5, task: "Afternoon Meds", time: "02:00 PM", completed: false, verified: false, caregiver: "Sarah J.", notes: "" },
];

const mockMessages = [
  { id: 1, sender: "Sarah (CNA)", text: "Good morning! Dad is in great spirits today. Just finished breakfast.", time: "09:30 AM", isMe: false, avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80" },
  { id: 2, sender: "Me", text: "That's wonderful to hear! Did he take his morning pills?", time: "09:32 AM", isMe: true },
  { id: 3, sender: "Sarah (CNA)", text: "Yes, all administered at 8 AM. Photo attached!", time: "09:33 AM", isMe: false, hasPhoto: true, avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80" },
  { id: 4, sender: "Tom (Brother)", text: "Thanks for the update Sarah! I'll swing by this evening.", time: "10:15 AM", isMe: false, avatar: "" },
];

const mockFamilyMembers = [
  { name: "You", role: "Primary", avatar: "" },
  { name: "Tom", role: "Brother", avatar: "" },
  { name: "Mom", role: "Spouse", avatar: "" },
];

export const FamilyDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F9] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-[#1F1F1F]">Family Portal</h1>
                  <p className="text-sm text-slate-500">Caring for {mockPatient.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 rounded-full relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-full">
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
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
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Patient Card */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                      <img src={mockPatient.avatar} alt={mockPatient.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1F1F1F]">{mockPatient.name}</h2>
                      <p className="text-sm text-slate-500">Age {mockPatient.age} • Status: <span className="text-green-600 font-semibold">{mockPatient.status}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Phone className="w-4 h-4 mr-2" /> Call
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Video className="w-4 h-4 mr-2" /> Video
                    </Button>
                  </div>
                </div>

                {/* Caregiver On Duty */}
                <div className="bg-[#E6F4EA] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <img src={mockPatient.caregiver.avatar} alt={mockPatient.caregiver.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#146C2E]">{mockPatient.caregiver.name}</p>
                      <p className="text-xs text-[#146C2E]/70">{mockPatient.caregiver.role} • {mockPatient.caregiver.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-[#146C2E]">Live</span>
                  </div>
                </div>
              </div>

              {/* Today's Progress */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1F1F1F]">Today's Care Progress</h3>
                  <span className="text-sm text-slate-500">3 of 5 tasks</span>
                </div>
                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#25D366] to-[#0B57D0] rounded-full"
                  />
                </div>
                <div className="space-y-3">
                  {mockTimeline.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-[#E6F4EA]' : 'bg-slate-100'
                      }`}>
                        {item.completed ? (
                          <CircleCheck className="w-4 h-4 text-[#146C2E]" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${item.completed ? 'text-slate-400 line-through' : 'text-[#1F1F1F]'}`}>
                          {item.task}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">{item.time}</span>
                      {item.verified && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          <Camera className="w-3 h-3 inline mr-1" />Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-purple-600 hover:bg-purple-50">
                  View Full Timeline <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Quick Vitals */}
              <div className="grid grid-cols-3 gap-4">
                {mockVitals.map((vital, i) => (
                  <div key={i} className={`p-4 rounded-[20px] ${
                    vital.color === 'pink' ? 'bg-[#FFD8E4]' :
                    vital.color === 'orange' ? 'bg-[#FFDCC2]' : 'bg-[#FFCDD2]'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <vital.icon className="w-5 h-5 opacity-70" />
                      <span className="text-[10px] font-bold opacity-60 uppercase">{vital.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{vital.value}</p>
                    <p className="text-xs opacity-70">{vital.trend}</p>
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
              className="space-y-6"
            >
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-[#1F1F1F] mb-6">Health Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockVitals.map((vital, i) => (
                    <div key={i} className="border border-slate-100 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            vital.color === 'pink' ? 'bg-[#FFD8E4]' :
                            vital.color === 'orange' ? 'bg-[#FFDCC2]' : 'bg-[#FFCDD2]'
                          }`}>
                            <vital.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-[#1F1F1F]">{vital.label}</p>
                            <p className="text-xs text-slate-500">Last updated 2 hours ago</p>
                          </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-[#1F1F1F]">{vital.value}</span>
                        <span className="text-sm text-green-600 font-semibold mb-1">{vital.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-purple-50 p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold">
                      FR
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1F1F1F]">Family Room</h4>
                      <p className="text-xs text-slate-500">{mockFamilyMembers.length + 1} participants</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {mockFamilyMembers.map((member, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 -ml-2 first:ml-0 border-2 border-white">
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    <button className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 -ml-2 border-2 border-white">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 h-[400px] overflow-y-auto space-y-4 bg-[#F0F4F9]">
                {mockMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${msg.isMe ? '' : 'flex gap-2'}`}>
                      {!msg.isMe && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          {msg.avatar ? (
                            <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">
                              {msg.sender.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`px-4 py-2 rounded-2xl ${
                        msg.isMe 
                          ? 'bg-[#E7FFDB] rounded-tr-none' 
                          : 'bg-white rounded-tl-none shadow-sm'
                      }`}>
                        {!msg.isMe && <p className="text-xs font-bold text-purple-600 mb-1">{msg.sender}</p>}
                        <p className="text-sm text-[#1F1F1F]">{msg.text}</p>
                        {msg.hasPhoto && (
                          <div className="mt-2 rounded-lg overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80" 
                              alt="Medication" 
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1 text-right">{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-3">
                  <button className="p-2 hover:bg-slate-100 rounded-full">
                    <Plus className="w-5 h-5 text-slate-400" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                    data-testid="message-input"
                  />
                  <Button className="rounded-full bg-purple-600 hover:bg-purple-700" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[#1F1F1F]">Today's Schedule</h3>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Calendar className="w-4 h-4 mr-2" /> View Week
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockTimeline.map((item) => (
                    <div key={item.id} className={`p-4 rounded-2xl border ${
                      item.completed ? 'bg-[#E6F4EA] border-[#C4EED0]' : 'bg-white border-slate-100'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.completed ? 'bg-white' : 'bg-slate-100'
                          }`}>
                            {item.completed ? (
                              <CircleCheck className="w-5 h-5 text-[#146C2E]" />
                            ) : (
                              <Clock className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold ${item.completed ? 'text-[#146C2E]' : 'text-[#1F1F1F]'}`}>
                              {item.task}
                            </h4>
                            <p className="text-sm text-slate-500">{item.time} • {item.caregiver}</p>
                            {item.notes && (
                              <p className="text-sm text-slate-600 mt-2 bg-white/50 p-2 rounded-lg">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.verified && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold flex items-center">
                            <Camera className="w-3 h-3 mr-1" /> Photo
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FamilyDashboard;

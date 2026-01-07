import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Users, Clock, CircleCheck, MapPin, Bell, Settings,
  ChevronRight, Calendar, ArrowLeft, Search, Filter, Download,
  BarChart3, TrendingUp, AlertTriangle, Shield, Building2, Phone,
  Eye, FileText, DollarSign, UserPlus, CheckCircle2, LayoutGrid,
  Menu, X, Sparkles, Send, Plus, User
} from "lucide-react"
import { Button } from "./ui/button"

// Mock Data
const mockStats = [
  { label: "Active Shifts", value: "24", change: "+3", icon: Clock, color: "blue" },
  { label: "On Duty", value: "18", change: "+2", icon: Users, color: "green" },
  { label: "Clients", value: "42", change: "+5", icon: Building2, color: "purple" },
  { label: "Compliance", value: "98%", change: "+2%", icon: Shield, color: "amber" },
]

const mockCaregivers = [
  { id: 1, name: "Sarah Jenkins", role: "CNA", status: "Active", location: "Doe Residence", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80", tasks: "5/7" },
  { id: 2, name: "Mike Ross", role: "RN", status: "Active", location: "Smith Residence", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80", tasks: "3/5" },
  { id: 3, name: "Jessica Parker", role: "HHA", status: "Break", location: "Johnson Res.", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80", tasks: "4/6" },
  { id: 4, name: "Emily Watson", role: "LPN", status: "Active", location: "Williams Res.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80", tasks: "6/8" },
]

const mockClients = [
  { id: 1, name: "Johnathan Doe", status: "Receiving Care", caregiver: "Sarah Jenkins" },
  { id: 2, name: "Margaret Smith", status: "Receiving Care", caregiver: "Mike Ross" },
  { id: 3, name: "Robert Johnson", status: "Scheduled", caregiver: "Jessica Parker" },
  { id: 4, name: "Helen Williams", status: "Receiving Care", caregiver: "Emily Watson" },
]

const mockAlerts = [
  { id: 1, type: "warning", message: "Margaret Smith - Elevated BP detected", time: "10 min" },
  { id: 2, type: "info", message: "Mike Ross checked in at Smith Residence", time: "25 min" },
  { id: 3, type: "success", message: "All morning meds verified (18 clients)", time: "1 hr" },
]

const mockBilling = [
  { id: 1, client: "J. Doe", caregiver: "Sarah J.", amount: "$200", status: "Pending" },
  { id: 2, client: "M. Smith", caregiver: "Mike R.", amount: "$210", status: "Approved" },
  { id: 3, client: "R. Johnson", caregiver: "Jessica P.", amount: "$88", status: "Pending" },
]

const mockChatHistory = [
  { id: 1, role: "assistant", content: "Good morning! Here's your agency overview for today. You have 24 active shifts running with 98% EVV compliance. Would you like me to highlight any areas that need attention?" },
  { id: 2, role: "user", content: "Yes, show me any compliance issues" },
  { id: 3, role: "assistant", content: "I found 2 minor compliance flags:\n• Sarah Jenkins - GPS check-in was 5 minutes late at Doe Residence\n• Photo verification pending for 3 afternoon medication tasks\n\nWould you like me to send reminders to the caregivers?" },
]

const suggestionChips = [
  { text: "View all alerts", icon: Bell },
  { text: "Staff overview", icon: Users },
  { text: "Generate report", icon: FileText },
  { text: "Compliance check", icon: Shield },
]

export const EnterpriseDashboard = ({ onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('chat')
  const [searchQuery, setSearchQuery] = useState('')
  const [inputMessage, setInputMessage] = useState('')
  const [chatHistory, setChatHistory] = useState(mockChatHistory)

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    setChatHistory(prev => [...prev, { id: Date.now(), role: 'user', content: inputMessage }])
    setInputMessage('')
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I've analyzed your request. Here's what I found based on the current agency data and performance metrics..."
      }])
    }, 1000)
  }

  const sidebarItems = [
    { id: 'chat', label: 'AI Assistant', icon: Sparkles },
    { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'compliance', label: 'EVV', icon: Shield },
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Break': return 'bg-amber-100 text-amber-700'
      case 'Offline': return 'bg-gray-100 text-gray-500'
      case 'Receiving Care': return 'bg-blue-100 text-blue-700'
      case 'Scheduled': return 'bg-purple-100 text-purple-700'
      case 'Approved': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

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
              <p className="text-xs text-gray-500">Agency Portal</p>
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="hidden lg:flex items-center justify-between px-6 py-3">
            <div>
              <h1 className="font-semibold text-gray-900">CareFirst Home Health</h1>
              <p className="text-xs text-gray-500">Agency Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Button size="sm" className="flex rounded-full bg-purple-600 hover:bg-purple-700 h-9">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          {/* Mobile Header */}
          <div className="lg:hidden grid grid-cols-[48px_1fr_48px] items-center px-2 py-3">
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

        {/* Main Content */}
        <main className="flex-1 overflow-auto overflow-x-hidden">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
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
                      <div className={`max-w-[75%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
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

              {/* Dashboard Overview */}
              {activeView === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockStats.map((stat, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                            stat.color === 'green' ? 'bg-green-50 text-green-600' :
                            stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            <stat.icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Alerts */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Alerts</h3>
                        <button className="text-sm text-purple-600 font-medium">View All</button>
                      </div>
                      <div className="space-y-3">
                        {mockAlerts.map((alert) => (
                          <div key={alert.id} className={`p-3 rounded-xl flex items-start gap-3 ${
                            alert.type === 'warning' ? 'bg-amber-50' :
                            alert.type === 'info' ? 'bg-blue-50' : 'bg-green-50'
                          }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              alert.type === 'warning' ? 'bg-amber-100' :
                              alert.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                               alert.type === 'info' ? <Activity className="w-4 h-4 text-blue-600" /> :
                               <CheckCircle2 className="w-4 h-4 text-green-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700">{alert.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{alert.time} ago</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Staff */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Active Now</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500">LIVE</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {mockCaregivers.filter(c => c.status === 'Active').slice(0, 3).map((cg) => (
                          <div key={cg.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-xl overflow-hidden">
                              <img src={cg.avatar} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{cg.name}</p>
                              <p className="text-xs text-gray-500">{cg.location}</p>
                            </div>
                            <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-lg">
                              {cg.tasks}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Live Map</h3>
                      <span className="text-sm text-gray-500">18 caregivers on shift</span>
                    </div>
                    <div className="aspect-[3/1] bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">GPS Tracking Map</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Staff View */}
              {activeView === 'staff' && (
                <motion.div
                  key="staff"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search staff..."
                        className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300"
                        data-testid="staff-search-input"
                      />
                    </div>
                    <Button variant="outline" className="rounded-xl px-4 hidden sm:flex">
                      <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {mockCaregivers.map((cg) => (
                      <div key={cg.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden">
                            <img src={cg.avatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{cg.name}</h4>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(cg.status)}`}>
                                {cg.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{cg.role} • {cg.location}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                              <Phone className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 h-12">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Caregiver
                  </Button>
                </motion.div>
              )}

              {/* Clients View */}
              {activeView === 'clients' && (
                <motion.div
                  key="clients"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search clients..."
                        className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {mockClients.map((client) => (
                      <div key={client.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900">{client.name}</h4>
                            <p className="text-sm text-gray-500">Caregiver: {client.caregiver}</p>
                          </div>
                          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 h-12">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Client
                  </Button>
                </motion.div>
              )}

              {/* Billing View */}
              {activeView === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">$12.4k</p>
                      <p className="text-sm text-gray-500">This Week</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">$3.2k</p>
                      <p className="text-sm text-gray-500">Pending</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">486h</p>
                      <p className="text-sm text-gray-500">Hours</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
                      <button className="text-sm text-purple-600 font-medium">Generate Report</button>
                    </div>
                    <div className="space-y-3">
                      {mockBilling.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">{item.client}</p>
                            <p className="text-sm text-gray-500">{item.caregiver}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{item.amount}</p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Compliance View */}
              {activeView === 'compliance' && (
                <motion.div
                  key="compliance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm mb-1">EVV Compliance</p>
                        <p className="text-4xl font-bold">98%</p>
                        <p className="text-white/70 text-sm mt-1">Above industry avg (89%)</p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Shield className="w-8 h-8" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: 'GPS Verified', value: '99.2%' },
                      { label: 'Photo Docs', value: '94.8%' },
                      { label: 'On-Time', value: '97.5%' },
                    ].map((metric, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">{metric.label}</span>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: metric.value }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Verifications</h3>
                    <div className="space-y-3">
                      {[
                        { caregiver: "Sarah J.", task: "Morning Meds", time: "08:02 AM" },
                        { caregiver: "Mike R.", task: "BP Check", time: "09:15 AM" },
                        { caregiver: "Emily W.", task: "Wound Care", time: "10:30 AM" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{item.task}</p>
                            <p className="text-xs text-gray-500">{item.caregiver} • {item.time}</p>
                          </div>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            GPS+Photo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Copilot-style Bottom Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent pt-6 pb-4 px-4 lg:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Suggestion Chips */}
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap shadow-sm"
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
                placeholder="Ask about your agency operations..."
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

export default EnterpriseDashboard

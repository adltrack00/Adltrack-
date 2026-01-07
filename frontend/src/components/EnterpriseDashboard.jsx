import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Users, Clock, CircleCheck, MapPin, Bell, Settings,
  ChevronRight, Calendar, ArrowLeft, Search, Filter, Download,
  BarChart3, TrendingUp, AlertTriangle, Shield, Building2, Phone,
  Eye, FileText, DollarSign, UserPlus, CheckCircle2, LayoutGrid
} from "lucide-react"
import { Button } from "./ui/button"

// Mock Data
const mockStats = [
  { label: "Active Shifts", value: "24", change: "+3", icon: Clock, color: "blue" },
  { label: "On Duty", value: "18", change: "+2", icon: Users, color: "emerald" },
  { label: "Clients", value: "42", change: "+5", icon: Building2, color: "violet" },
  { label: "Compliance", value: "98%", change: "+2%", icon: Shield, color: "amber" },
];

const mockCaregivers = [
  { id: 1, name: "Sarah Jenkins", role: "CNA", status: "Active", location: "Doe Residence", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80", tasks: "5/7" },
  { id: 2, name: "Mike Ross", role: "RN", status: "Active", location: "Smith Residence", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80", tasks: "3/5" },
  { id: 3, name: "Jessica Parker", role: "HHA", status: "Break", location: "Johnson Res.", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80", tasks: "4/6" },
  { id: 4, name: "Emily Watson", role: "LPN", status: "Active", location: "Williams Res.", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80", tasks: "6/8" },
];

const mockClients = [
  { id: 1, name: "Johnathan Doe", status: "Receiving Care", caregiver: "Sarah Jenkins" },
  { id: 2, name: "Margaret Smith", status: "Receiving Care", caregiver: "Mike Ross" },
  { id: 3, name: "Robert Johnson", status: "Scheduled", caregiver: "Jessica Parker" },
  { id: 4, name: "Helen Williams", status: "Receiving Care", caregiver: "Emily Watson" },
];

const mockAlerts = [
  { id: 1, type: "warning", message: "Margaret Smith - Elevated BP detected", time: "10 min" },
  { id: 2, type: "info", message: "Mike Ross checked in at Smith Residence", time: "25 min" },
  { id: 3, type: "success", message: "All morning meds verified (18 clients)", time: "1 hr" },
];

const mockBilling = [
  { id: 1, client: "J. Doe", caregiver: "Sarah J.", amount: "$200", status: "Pending" },
  { id: 2, client: "M. Smith", caregiver: "Mike R.", amount: "$210", status: "Approved" },
  { id: 3, client: "R. Johnson", caregiver: "Jessica P.", amount: "$88", status: "Pending" },
];

export const EnterpriseDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'overview', label: 'Home', icon: LayoutGrid },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'compliance', label: 'EVV', icon: Shield },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700';
      case 'Break': return 'bg-amber-100 text-amber-700';
      case 'Offline': return 'bg-slate-100 text-slate-500';
      case 'Receiving Care': return 'bg-blue-100 text-blue-700';
      case 'Scheduled': return 'bg-violet-100 text-violet-700';
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
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
                <h1 className="font-semibold text-slate-900">Agency Dashboard</h1>
                <p className="text-xs text-slate-500">CareFirst Home Health</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center relative transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mockStats.map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        stat.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 truncate">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Alerts & Live */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alerts */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Alerts</h3>
                    <button className="text-xs text-blue-600 font-medium">View All</button>
                  </div>
                  <div className="space-y-3">
                    {mockAlerts.map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-xl flex items-start gap-3 ${
                        alert.type === 'warning' ? 'bg-amber-50' :
                        alert.type === 'info' ? 'bg-blue-50' : 'bg-emerald-50'
                      }`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          alert.type === 'warning' ? 'bg-amber-100' :
                          alert.type === 'info' ? 'bg-blue-100' : 'bg-emerald-100'
                        }`}>
                          {alert.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> :
                           alert.type === 'info' ? <Activity className="w-3.5 h-3.5 text-blue-600" /> :
                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 truncate">{alert.message}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{alert.time} ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Staff */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Active Now</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-500">LIVE</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {mockCaregivers.filter(c => c.status === 'Active').slice(0, 3).map((cg) => (
                      <div key={cg.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                          <img src={cg.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{cg.name}</p>
                          <p className="text-xs text-slate-500 truncate">{cg.location}</p>
                        </div>
                        <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-lg flex-shrink-0">
                          {cg.tasks}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Live Map</h3>
                  <span className="text-xs text-slate-500">18 caregivers on shift</span>
                </div>
                <div className="aspect-[2/1] sm:aspect-[3/1] bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">GPS Tracking Map</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-4"
            >
              {/* Search */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search staff..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    data-testid="staff-search-input"
                  />
                </div>
                <Button variant="outline" size="sm" className="rounded-full px-4 hidden sm:flex">
                  <Filter className="w-4 h-4 mr-2" /> Filter
                </Button>
              </div>

              {/* Staff List */}
              <div className="space-y-3">
                {mockCaregivers.map((cg) => (
                  <div key={cg.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={cg.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 truncate">{cg.name}</h4>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(cg.status)}`}>
                            {cg.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 truncate">{cg.role} • {cg.location}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full rounded-full bg-blue-500 hover:bg-blue-600 h-12">
                <UserPlus className="w-4 h-4 mr-2" /> Add Caregiver
              </Button>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-4"
            >
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {mockClients.map((client) => (
                  <div key={client.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900 truncate">{client.name}</h4>
                        </div>
                        <p className="text-sm text-slate-500 truncate">Caregiver: {client.caregiver}</p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-full flex-shrink-0 ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full rounded-full bg-blue-500 hover:bg-blue-600 h-12">
                <UserPlus className="w-4 h-4 mr-2" /> Add Client
              </Button>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-4"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <DollarSign className="w-5 h-5 text-emerald-500 mb-2" />
                  <p className="text-xl font-bold text-slate-900">$12.4k</p>
                  <p className="text-xs text-slate-500">This Week</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <Clock className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="text-xl font-bold text-slate-900">$3.2k</p>
                  <p className="text-xs text-slate-500">Pending</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-xl font-bold text-slate-900">486h</p>
                  <p className="text-xs text-slate-500">Hours</p>
                </div>
              </div>

              {/* Invoice List */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Recent Invoices</h3>
                  <button className="text-xs text-blue-600 font-medium">Generate Report</button>
                </div>
                <div className="space-y-3">
                  {mockBilling.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{item.client}</p>
                        <p className="text-xs text-slate-500 truncate">{item.caregiver}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="font-bold text-slate-900">{item.amount}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'compliance' && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-6 space-y-4"
            >
              {/* Score Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white">
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

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">GPS Verified</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">99.2%</p>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99.2%' }} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Photo Docs</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">94.8%</p>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.8%' }} />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">On-Time</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">97.5%</p>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '97.5%' }} />
                  </div>
                </div>
              </div>

              {/* Recent Verifications */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4">Recent Verifications</h3>
                <div className="space-y-3">
                  {[
                    { caregiver: "Sarah J.", task: "Morning Meds", time: "08:02 AM" },
                    { caregiver: "Mike R.", task: "BP Check", time: "09:15 AM" },
                    { caregiver: "Emily W.", task: "Wound Care", time: "10:30 AM" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.task}</p>
                        <p className="text-xs text-slate-500 truncate">{item.caregiver} • {item.time}</p>
                      </div>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
                        GPS+Photo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 safe-area-pb">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default EnterpriseDashboard;

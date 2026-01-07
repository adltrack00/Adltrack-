import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Users, Clock, CircleCheck, MapPin, Bell, Settings,
  ChevronRight, Calendar, ArrowLeft, Search, Filter, Download,
  BarChart3, TrendingUp, AlertTriangle, Shield, Building2, Phone,
  Mail, MoreVertical, Eye, FileText, DollarSign, UserPlus, Briefcase,
  CheckCircle2, XCircle, Clock3, RefreshCw
} from "lucide-react"
import { Button } from "./ui/button"

// Mock Data
const mockStats = [
  { label: "Active Shifts", value: "24", change: "+3", icon: Clock, color: "blue" },
  { label: "Caregivers On Duty", value: "18", change: "+2", icon: Users, color: "green" },
  { label: "Clients Served", value: "42", change: "+5", icon: Building2, color: "purple" },
  { label: "EVV Compliance", value: "98%", change: "+2%", icon: Shield, color: "emerald" },
];

const mockCaregivers = [
  { id: 1, name: "Sarah Jenkins", role: "CNA", status: "Active", location: "Doe Residence", avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80", tasksCompleted: 5, totalTasks: 7, checkInTime: "08:02 AM" },
  { id: 2, name: "Mike Ross", role: "RN", status: "Active", location: "Smith Residence", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&q=80", tasksCompleted: 3, totalTasks: 5, checkInTime: "07:58 AM" },
  { id: 3, name: "Jessica Parker", role: "HHA", status: "Break", location: "Johnson Residence", avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80", tasksCompleted: 4, totalTasks: 6, checkInTime: "08:15 AM" },
  { id: 4, name: "David Chen", role: "CNA", status: "Offline", location: "-", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", tasksCompleted: 0, totalTasks: 0, checkInTime: "-" },
  { id: 5, name: "Emily Watson", role: "LPN", status: "Active", location: "Williams Residence", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80", tasksCompleted: 6, totalTasks: 8, checkInTime: "07:45 AM" },
];

const mockClients = [
  { id: 1, name: "Johnathan Doe", age: 78, status: "Receiving Care", caregiver: "Sarah Jenkins", address: "123 Oak St", lastVitals: "Normal" },
  { id: 2, name: "Margaret Smith", age: 82, status: "Receiving Care", caregiver: "Mike Ross", address: "456 Elm Ave", lastVitals: "Elevated BP" },
  { id: 3, name: "Robert Johnson", age: 75, status: "Scheduled", caregiver: "Jessica Parker", address: "789 Pine Rd", lastVitals: "Normal" },
  { id: 4, name: "Helen Williams", age: 80, status: "Receiving Care", caregiver: "Emily Watson", address: "321 Maple Dr", lastVitals: "Normal" },
];

const mockAlerts = [
  { id: 1, type: "warning", message: "Margaret Smith - Elevated blood pressure detected", time: "10 min ago" },
  { id: 2, type: "info", message: "Mike Ross checked in at Smith Residence", time: "25 min ago" },
  { id: 3, type: "success", message: "All morning medications verified across 18 clients", time: "1 hour ago" },
];

const mockBilling = [
  { id: 1, client: "Johnathan Doe", caregiver: "Sarah Jenkins", hours: 8, rate: 25, status: "Pending" },
  { id: 2, client: "Margaret Smith", caregiver: "Mike Ross", hours: 6, rate: 35, status: "Approved" },
  { id: 3, client: "Robert Johnson", caregiver: "Jessica Parker", hours: 4, rate: 22, status: "Pending" },
];

export const EnterpriseDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'clients', label: 'Clients', icon: Building2 },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'compliance', label: 'Compliance', icon: Shield },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Break': return 'bg-yellow-100 text-yellow-700';
      case 'Offline': return 'bg-slate-100 text-slate-500';
      case 'Receiving Care': return 'bg-blue-100 text-blue-700';
      case 'Scheduled': return 'bg-purple-100 text-purple-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] font-sans">
      {/* Header */}
      <header className="bg-[#0B57D0] text-white sticky top-0 z-50">
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Agency Dashboard</h1>
                  <p className="text-sm text-white/80">CareFirst Home Health</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/20 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-white/20 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
              <Button variant="secondary" size="sm" className="rounded-full bg-white text-[#0B57D0] hover:bg-white/90">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                    ? 'bg-[#0B57D0] text-white'
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
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {mockStats.map((stat, i) => (
                  <div key={i} className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        stat.color === 'green' ? 'bg-green-100 text-green-600' :
                        stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Alerts & Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alerts */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1F1F1F]">Recent Alerts</h3>
                    <button className="text-sm text-[#0B57D0] font-semibold">View All</button>
                  </div>
                  <div className="space-y-3">
                    {mockAlerts.map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-xl flex items-start gap-3 ${
                        alert.type === 'warning' ? 'bg-orange-50' :
                        alert.type === 'info' ? 'bg-blue-50' : 'bg-green-50'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          alert.type === 'warning' ? 'bg-orange-100' :
                          alert.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-orange-600" /> :
                           alert.type === 'info' ? <Activity className="w-4 h-4 text-blue-600" /> :
                           <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#1F1F1F]">{alert.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Caregivers */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#1F1F1F]">Active Caregivers</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-500">LIVE</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {mockCaregivers.filter(c => c.status === 'Active').slice(0, 4).map((caregiver) => (
                      <div key={caregiver.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={caregiver.avatar} alt={caregiver.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#1F1F1F]">{caregiver.name}</p>
                            <p className="text-xs text-slate-500">{caregiver.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1F1F1F]">{caregiver.tasksCompleted}/{caregiver.totalTasks}</p>
                          <p className="text-xs text-slate-400">tasks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#1F1F1F]">Live Location Map</h3>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="aspect-[2/1] bg-slate-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Live GPS tracking map</p>
                    <p className="text-xs text-slate-300">18 caregivers currently on shift</p>
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
              className="space-y-6"
            >
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search caregivers..."
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-[#0B57D0]/20 focus:border-[#0B57D0]"
                    data-testid="staff-search-input"
                  />
                </div>
                <Button variant="outline" className="rounded-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button className="bg-[#0B57D0] hover:bg-[#0842a0] rounded-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Caregiver
                </Button>
              </div>

              {/* Staff Table */}
              <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Caregiver</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check-in</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</th>
                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockCaregivers.map((caregiver) => (
                        <tr key={caregiver.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img src={caregiver.avatar} alt={caregiver.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-semibold text-[#1F1F1F]">{caregiver.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{caregiver.role}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(caregiver.status)}`}>
                              {caregiver.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{caregiver.location}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{caregiver.checkInTime}</td>
                          <td className="px-6 py-4">
                            {caregiver.totalTasks > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#0B57D0] rounded-full"
                                    style={{ width: `${(caregiver.tasksCompleted / caregiver.totalTasks) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">{caregiver.tasksCompleted}/{caregiver.totalTasks}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-[#0B57D0]/20 focus:border-[#0B57D0]"
                  />
                </div>
                <Button className="bg-[#0B57D0] hover:bg-[#0842a0] rounded-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockClients.map((client) => (
                  <div key={client.id} className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1F1F1F]">{client.name}</h4>
                          <p className="text-sm text-slate-500">Age {client.age} • {client.address}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400">Caregiver</p>
                        <p className="text-sm font-semibold text-[#1F1F1F]">{client.caregiver}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Last Vitals</p>
                        <p className={`text-sm font-semibold ${
                          client.lastVitals === 'Normal' ? 'text-green-600' : 'text-orange-600'
                        }`}>{client.lastVitals}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Billing Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-slate-500">This Week</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F1F1F]">$12,450</p>
                  <p className="text-xs text-green-600 font-semibold">+8% from last week</p>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <Clock3 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <span className="text-sm text-slate-500">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F1F1F]">$3,200</p>
                  <p className="text-xs text-slate-500">12 invoices awaiting</p>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-slate-500">Hours Logged</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F1F1F]">486 hrs</p>
                  <p className="text-xs text-slate-500">This billing period</p>
                </div>
              </div>

              {/* Billing Table */}
              <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#1F1F1F]">Recent Invoices</h3>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Client</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Caregiver</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Hours</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rate</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockBilling.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-semibold text-[#1F1F1F]">{item.client}</td>
                          <td className="px-6 py-4 text-slate-600">{item.caregiver}</td>
                          <td className="px-6 py-4 text-slate-600">{item.hours} hrs</td>
                          <td className="px-6 py-4 text-slate-600">${item.rate}/hr</td>
                          <td className="px-6 py-4 font-bold text-[#1F1F1F]">${item.hours * item.rate}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {item.status === 'Pending' && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-full text-xs">
                                Approve
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              className="space-y-6"
            >
              {/* Compliance Score */}
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-[24px] p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-2">EVV Compliance Score</p>
                    <p className="text-5xl font-bold">98%</p>
                    <p className="text-white/80 text-sm mt-2">Excellent! Above industry average of 89%</p>
                  </div>
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="w-12 h-12" />
                  </div>
                </div>
              </div>

              {/* Compliance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500">GPS Verified Visits</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#1F1F1F]">99.2%</p>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '99.2%' }} />
                  </div>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500">Photo Documented Tasks</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#1F1F1F]">94.8%</p>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '94.8%' }} />
                  </div>
                </div>
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500">On-Time Check-ins</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#1F1F1F]">97.5%</p>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '97.5%' }} />
                  </div>
                </div>
              </div>

              {/* Recent Verifications */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-[#1F1F1F] mb-4">Recent Verifications</h3>
                <div className="space-y-3">
                  {[
                    { caregiver: "Sarah Jenkins", task: "Morning Medications", time: "08:02 AM", type: "Photo + GPS" },
                    { caregiver: "Mike Ross", task: "Blood Pressure Check", time: "09:15 AM", type: "Photo + GPS" },
                    { caregiver: "Emily Watson", task: "Wound Care", time: "10:30 AM", type: "Photo + GPS" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#1F1F1F]">{item.task}</p>
                          <p className="text-xs text-slate-500">{item.caregiver} • {item.time}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {item.type}
                      </span>
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

export default EnterpriseDashboard;

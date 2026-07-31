import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, Users, Clock, CircleCheck, MapPin, Bell, Settings,
  ChevronRight, Calendar, ArrowLeft, Search, Filter, Download,
  BarChart3, TrendingUp, AlertTriangle, Shield, Building2, Phone,
  Eye, FileText, DollarSign, UserPlus, CheckCircle2, LayoutGrid,
  Menu, X, Sparkles, Send, Plus, User
} from "lucide-react"

import { RoleSwitcher } from './RoleSwitcher';

// ─── Design tokens ──────────────────────────────────────────────────────────
const D = {
  bg:        '#0a1929',
  bgAlt:     'rgba(255,255,255,0.03)',
  card:      'rgba(255,255,255,0.05)',
  bdr:       'rgba(255,255,255,0.08)',
  bdrHv:     'rgba(255,255,255,0.16)',
  h:         '#FFFFFF',
  body:      'rgba(255,255,255,0.55)',
  muted:     'rgba(255,255,255,0.36)',
  brand:     '#00c896',
  brandText: '#000000',
  brandGrad: 'linear-gradient(135deg,#00c896,#00a87a)',
  brandGlow: '0 4px 20px rgba(0,200,150,0.35)',
  brandTint: 'rgba(0,200,150,0.12)',
  rainbow:   'linear-gradient(to right,#a855f7,#ec4899,#f97316,#eab308,#22c55e,#3b82f6)',
  shadow:    '0 4px 24px rgba(0,0,0,0.24)',
  shadowMd:  '0 8px 32px rgba(0,0,0,0.32)',
}

// ─── Mock Data ─────────────────────────────────────────────────────────────
const mockStats = [
  { label: "Active Shifts", value: "24", change: "+3", icon: Clock, accentRgb: '56,189,248', accent: '#38bdf8' },
  { label: "On Duty", value: "18", change: "+2", icon: Users, accentRgb: '255,252,0', accent: '#00c896' },
  { label: "Clients", value: "42", change: "+5", icon: Building2, accentRgb: '167,139,250', accent: '#a78bfa' },
  { label: "Compliance", value: "98%", change: "+2%", icon: Shield, accentRgb: '251,146,60', accent: '#fb923c' },
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

// ─── Status badge helper ────────────────────────────────────────────────────
const STATUS_STYLES = {
  Active:           { bg: 'rgba(0,200,150,0.15)',    text: '#7A6500' },
  Break:            { bg: 'rgba(251,146,60,0.10)',   text: '#d97706' },
  Offline:          { bg: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.40)' },
  'Receiving Care': { bg: 'rgba(56,189,248,0.10)',   text: '#0284c7' },
  Scheduled:        { bg: 'rgba(167,139,250,0.10)',  text: '#7c3aed' },
  Approved:         { bg: 'rgba(0,200,150,0.15)',    text: '#7A6500' },
  Pending:          { bg: 'rgba(251,146,60,0.10)',   text: '#d97706' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Offline
  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: s.bg, color: s.text }}
    >
      {status}
    </span>
  )
}

// ─── Shared card ────────────────────────────────────────────────────────────
const Card = ({ children, className = '', style = {} }) => (
  <div
    className={`rounded-2xl p-5 ${className}`}
    style={{
      background: D.card,
      border: `1px solid ${D.bdr}`,
      boxShadow: D.shadow,
      ...style,
    }}
  >
    {children}
  </div>
)

// ─── Component ──────────────────────────────────────────────────────────────
export const EnterpriseDashboard = ({ onBack, onSignOut, onRoleSwitch, currentRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('overview')
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
        content: "I've analyzed your request. Here's what I found based on the current agency data and performance metrics...",
      }])
    }, 1000)
  }

  const sidebarItems = [
    { id: 'overview',   label: 'Dashboard',   icon: LayoutGrid },
    { id: 'staff',      label: 'Staff',        icon: Users },
    { id: 'clients',    label: 'Clients',      icon: Building2 },
    { id: 'billing',    label: 'Billing',      icon: DollarSign },
    { id: 'compliance', label: 'EVV',          icon: Shield },
    { id: 'chat',       label: 'AI Assistant', icon: Sparkles },
  ]

  const SidebarContent = ({ onNavigate }) => (
    <>
      <nav className="flex-1 p-3 space-y-1">
        {sidebarItems.map((item) => {
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); onNavigate?.() }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(0,200,150,0.08)' : 'transparent',
                color: active ? D.brand : D.body,
                border: active ? `1px solid rgba(0,200,150,0.18)` : '1px solid transparent',
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 space-y-3" style={{ borderTop: `1px solid ${D.bdr}` }}>
        {onRoleSwitch && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: D.muted }}>
              Test Other Views
            </p>
            <RoleSwitcher currentRole={currentRole} onRoleSwitch={onRoleSwitch} />
          </div>
        )}
        <button
          onClick={onBack}
          data-testid="back-btn"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ color: D.muted }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = D.body }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = D.muted }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </>
  )

  const LogoBadge = () => (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: D.brandGrad, boxShadow: '0 4px 14px rgba(0,200,150,0.25)' }}
      >
        <Sparkles className="w-4 h-4" style={{ color: '#FFFFFF' }} />
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: D.h }}>One Permit</p>
        <p className="text-xs" style={{ color: D.muted }}>Agency Portal</p>
      </div>
    </div>
  )

  return (
    <div
      className="min-h-screen font-sans flex overflow-x-hidden"
      style={{ background: D.bg }}
    >
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0"
        style={{ background: D.bgAlt, borderRight: `1px solid ${D.bdr}` }}
      >
        <div className="p-5" style={{ borderBottom: `1px solid ${D.bdr}` }}>
          <LogoBadge />
        </div>
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden flex flex-col"
              style={{ background: D.bgAlt, borderRight: `1px solid ${D.bdr}`, boxShadow: D.shadowMd }}
            >
              <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${D.bdr}` }}>
                <LogoBadge />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <X className="w-4 h-4" style={{ color: D.body }} />
                </button>
              </div>
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">

        {/* Top Header */}
        <header
          className="sticky top-0 z-30"
          style={{ background: 'rgba(10,25,41,0.97)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: `1px solid ${D.bdr}` }}
        >


          {/* Desktop */}
          <div className="hidden lg:flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: D.h }}>CareFirst Home Health</p>
              <p className="text-xs" style={{ color: D.muted }}>Agency Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${D.bdr}` }}
              >
                <Bell className="w-4 h-4" style={{ color: D.body }} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: D.brandGrad, boxShadow: '0 4px 14px rgba(0,200,150,0.22)', color: '#FFFFFF' }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="lg:hidden grid grid-cols-[48px_1fr_48px] items-center px-2 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl flex items-center justify-center justify-self-start"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <Menu className="w-5 h-5" style={{ color: D.body }} />
            </button>
            <div className="flex items-center gap-2 justify-center">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: D.brandGrad }}
              >
                <Sparkles className="w-3 h-3" style={{ color: '#FFFFFF' }} />
              </div>
              <span className="text-sm font-bold" style={{ color: D.h }}>One Permit</span>
            </div>
            <button
              className="p-2 rounded-xl flex items-center justify-center relative justify-self-end"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <Bell className="w-5 h-5" style={{ color: D.body }} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* ── Views ── */}
        <main className="flex-1 overflow-auto overflow-x-hidden pb-44">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            <AnimatePresence mode="wait">

              {/* ── Chat View ── */}
              {activeView === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {chatHistory.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: msg.role === 'assistant' ? D.brandGrad : 'rgba(0,0,0,0.07)',
                          boxShadow: msg.role === 'assistant' ? '0 4px 12px rgba(0,200,150,0.20)' : 'none',
                        }}
                      >
                        {msg.role === 'assistant'
                          ? <Sparkles className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                          : <User className="w-4 h-4" style={{ color: D.body }} />
                        }
                      </div>
                      <div
                        className="max-w-[78%] rounded-2xl px-4 py-3"
                        style={{
                          background: msg.role === 'assistant' ? D.card : D.brandGrad,
                          border: msg.role === 'assistant' ? `1px solid ${D.bdr}` : 'none',
                          boxShadow: msg.role === 'assistant' ? D.shadow : '0 4px 14px rgba(0,200,150,0.18)',
                        }}
                      >
                        <p
                          className="text-sm whitespace-pre-line break-words"
                          style={{ color: msg.role === 'assistant' ? D.body : '#ffffff' }}
                        >
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* ── Overview ── */}
              {activeView === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {mockStats.map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className="rounded-[1.25rem] p-4"
                        style={{
                          background: D.card,
                          border: `1px solid ${D.bdr}`,
                          boxShadow: D.shadow,
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `rgba(${stat.accentRgb},0.10)`, border: `1px solid rgba(${stat.accentRgb},0.15)` }}
                          >
                            <stat.icon className="w-5 h-5" style={{ color: stat.accent }} />
                          </div>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(0,200,150,0.09)', color: '#000000' }}
                          >
                            {stat.change}
                          </span>
                        </div>
                        <p className="text-2xl font-semibold" style={{ color: D.h }}>{stat.value}</p>
                        <p className="text-sm font-light mt-0.5" style={{ color: D.muted }}>{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Alerts */}
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold" style={{ color: D.h }}>Alerts</h3>
                        <button className="text-xs font-semibold" style={{ color: D.brand }}>View All</button>
                      </div>
                      <div className="space-y-3">
                        {mockAlerts.map((alert) => {
                          const cfg = {
                            warning: { bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.14)', icon: <AlertTriangle className="w-4 h-4" style={{ color: '#d97706' }} />, iconBg: 'rgba(251,146,60,0.10)' },
                            info:    { bg: 'rgba(56,189,248,0.07)', border: 'rgba(56,189,248,0.14)', icon: <Activity className="w-4 h-4" style={{ color: '#0284c7' }} />, iconBg: 'rgba(56,189,248,0.10)' },
                            success: { bg: 'rgba(0,200,150,0.06)',  border: 'rgba(0,200,150,0.12)', icon: <CheckCircle2 className="w-4 h-4" style={{ color: '#000000' }} />, iconBg: 'rgba(0,200,150,0.09)' },
                          }[alert.type]
                          return (
                            <div
                              key={alert.id}
                              className="p-3 rounded-xl flex items-start gap-3"
                              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.iconBg }}>
                                {cfg.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: D.body }}>{alert.message}</p>
                                <p className="text-xs mt-1" style={{ color: D.muted }}>{alert.time} ago</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>

                    {/* Active Staff */}
                    <Card>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold" style={{ color: D.h }}>Active Now</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#00c896] rounded-full" style={{ boxShadow: '0 0 6px rgba(0,200,150,0.7)', animation: 'pulse 2s infinite' }} />
                          <span className="text-xs font-semibold" style={{ color: D.muted }}>LIVE</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {mockCaregivers.filter(c => c.status === 'Active').slice(0, 3).map((cg) => (
                          <div
                            key={cg.id}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: D.bg, border: `1px solid ${D.bdr}` }}
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={cg.avatar} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{ color: D.h }}>{cg.name}</p>
                              <p className="text-xs font-light" style={{ color: D.muted }}>{cg.location}</p>
                            </div>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                              style={{ background: 'rgba(0,200,150,0.09)', color: '#000000' }}
                            >
                              {cg.tasks}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Live Map placeholder */}
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold" style={{ color: D.h }}>Live Map</h3>
                      <span className="text-xs font-light" style={{ color: D.muted }}>18 caregivers on shift</span>
                    </div>
                    <div
                      className="aspect-[3/1] rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(0,200,150,0.04), rgba(56,189,248,0.03))', border: `1px dashed ${D.bdr}` }}
                    >
                      <div className="text-center">
                        <MapPin className="w-10 h-10 mx-auto mb-2" style={{ color: 'rgba(0,0,0,0.12)' }} />
                        <p className="text-sm font-light" style={{ color: D.muted }}>GPS Tracking Map</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ── Staff View ── */}
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
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: D.muted }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search staff..."
                        data-testid="staff-search-input"
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
                        style={{
                          background: D.card,
                          border: `1px solid ${D.bdr}`,
                          color: D.h,
                          boxShadow: D.shadow,
                        }}
                      />
                    </div>
                    <button
                      className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                      style={{ background: D.card, border: `1px solid ${D.bdr}`, color: D.body, boxShadow: D.shadow }}
                    >
                      <Filter className="w-4 h-4" /> Filter
                    </button>
                  </div>

                  <div className="space-y-3">
                    {mockCaregivers.map((cg) => (
                      <Card key={cg.id} className="!p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={cg.avatar} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold" style={{ color: D.h }}>{cg.name}</h4>
                              <StatusBadge status={cg.status} />
                            </div>
                            <p className="text-xs font-light" style={{ color: D.muted }}>{cg.role} · {cg.location}</p>
                          </div>
                          <div className="flex gap-2">
                            {[Eye, Phone].map((Icon, i) => (
                              <button
                                key={i}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${D.bdr}` }}
                              >
                                <Icon className="w-4 h-4" style={{ color: D.body }} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: D.brandGrad, boxShadow: '0 4px 14px rgba(0,200,150,0.22)', color: '#FFFFFF' }}
                  >
                    <UserPlus className="w-4 h-4" /> Add Caregiver
                  </button>
                </motion.div>
              )}

              {/* ── Clients View ── */}
              {activeView === 'clients' && (
                <motion.div
                  key="clients"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: D.muted }} />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: D.card,
                        border: `1px solid ${D.bdr}`,
                        color: D.h,
                        boxShadow: D.shadow,
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    {mockClients.map((client) => (
                      <Card key={client.id} className="!p-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{ background: 'rgba(0,200,150,0.09)', color: '#FFFFFF', border: `1px solid rgba(0,200,150,0.16)` }}
                          >
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold" style={{ color: D.h }}>{client.name}</h4>
                            <p className="text-xs font-light" style={{ color: D.muted }}>Caregiver: {client.caregiver}</p>
                          </div>
                          <StatusBadge status={client.status} />
                        </div>
                      </Card>
                    ))}
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold"
                    style={{ background: D.brandGrad, boxShadow: '0 4px 14px rgba(0,200,150,0.22)', color: '#FFFFFF' }}
                  >
                    <UserPlus className="w-4 h-4" /> Add Client
                  </button>
                </motion.div>
              )}

              {/* ── Billing View ── */}
              {activeView === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: DollarSign, accent: '#7A6500', accentRgb: '0,200,150', label: 'This Week', value: '$12.4k' },
                      { icon: Clock,       accent: '#d97706', accentRgb: '251,146,60', label: 'Pending',   value: '$3.2k' },
                      { icon: TrendingUp,  accent: '#0284c7', accentRgb: '56,189,248', label: 'Hours',     value: '486h' },
                    ].map((b, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className="rounded-[1.25rem] p-4"
                        style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: `rgba(${b.accentRgb},0.09)`, border: `1px solid rgba(${b.accentRgb},0.14)` }}
                        >
                          <b.icon className="w-5 h-5" style={{ color: b.accent }} />
                        </div>
                        <p className="text-2xl font-semibold" style={{ color: D.h }}>{b.value}</p>
                        <p className="text-xs font-light mt-0.5" style={{ color: D.muted }}>{b.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold" style={{ color: D.h }}>Recent Invoices</h3>
                      <button className="text-xs font-semibold" style={{ color: D.brand }}>Generate Report</button>
                    </div>
                    <div className="space-y-2">
                      {mockBilling.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-xl"
                          style={{ background: D.bg, border: `1px solid ${D.bdr}` }}
                        >
                          <div>
                            <p className="text-sm font-semibold" style={{ color: D.h }}>{item.client}</p>
                            <p className="text-xs font-light" style={{ color: D.muted }}>{item.caregiver}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold mb-1" style={{ color: D.h }}>{item.amount}</p>
                            <StatusBadge status={item.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ── Compliance View ── */}
              {activeView === 'compliance' && (
                <motion.div
                  key="compliance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div
                    className="rounded-[1.5rem] p-6"
                    style={{ background: 'linear-gradient(135deg, rgba(0,200,150,0.10), rgba(0,200,150,0.04))', border: '1px solid rgba(0,200,150,0.18)', boxShadow: '0 8px 32px rgba(0,200,150,0.06)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: '#FFFFFF' }}>EVV Compliance</p>
                        <p className="text-5xl font-semibold" style={{ color: '#000000' }}>98%</p>
                        <p className="text-sm font-light mt-2" style={{ color: D.muted }}>Above industry avg (89%)</p>
                      </div>
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(0,200,150,0.10)', border: '1px solid rgba(0,200,150,0.20)' }}
                      >
                        <Shield className="w-8 h-8" style={{ color: '#000000' }} />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: 'GPS Verified', value: '99.2%' },
                      { label: 'Photo Docs',   value: '94.8%' },
                      { label: 'On-Time',      value: '97.5%' },
                    ].map((metric, i) => (
                      <Card key={i}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-light" style={{ color: D.body }}>{metric.label}</span>
                          <CheckCircle2 className="w-5 h-5" style={{ color: '#000000' }} />
                        </div>
                        <p className="text-2xl font-semibold" style={{ color: D.h }}>{metric.value}</p>
                        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: metric.value, background: 'linear-gradient(90deg, #00c896, #FFEF00)' }}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: D.h }}>Recent Verifications</h3>
                    <div className="space-y-2">
                      {[
                        { caregiver: "Sarah J.", task: "Morning Meds", time: "08:02 AM" },
                        { caregiver: "Mike R.",  task: "BP Check",     time: "09:15 AM" },
                        { caregiver: "Emily W.", task: "Wound Care",   time: "10:30 AM" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: D.bg, border: `1px solid ${D.bdr}` }}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(0,200,150,0.09)', border: '1px solid rgba(0,200,150,0.15)' }}
                          >
                            <Shield className="w-4 h-4" style={{ color: '#000000' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: D.h }}>{item.task}</p>
                            <p className="text-xs font-light" style={{ color: D.muted }}>{item.caregiver} · {item.time}</p>
                          </div>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(0,200,150,0.09)', color: '#000000' }}
                          >
                            GPS+Photo
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>

        {/* ── AI Bottom Input Bar ── */}
        <div
          className="sticky bottom-0 pt-6 pb-4 px-4 lg:px-6"
          style={{ background: `linear-gradient(to top, ${D.bg} 40%, transparent)` }}
        >
          <div className="max-w-5xl mx-auto">
            {/* Suggestion chips */}
            <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    background: D.card,
                    border: `1px solid ${D.bdr}`,
                    color: D.body,
                    boxShadow: D.shadow,
                  }}
                >
                  <chip.icon className="w-3.5 h-3.5" style={{ color: D.brand }} />
                  {chip.text}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div
              className="flex items-center gap-3 px-4 py-2"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: `1px solid ${D.bdr}`,
                borderRadius: 28,
                boxShadow: D.shadowMd,
              }}
            >
              <button
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <Plus className="w-5 h-5" style={{ color: D.body }} />
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about your agency operations..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: D.h }}
              />
              <button
                onClick={handleSendMessage}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: D.brandGrad, boxShadow: '0 4px 12px rgba(0,200,150,0.25)' }}
              >
                <Send className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterpriseDashboard

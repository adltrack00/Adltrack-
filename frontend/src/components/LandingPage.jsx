import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CircleCheck, MessageCircle, Shield, Activity, Heart, Clock, Camera, 
  Menu, X, PhoneMissed, FileX, Thermometer, Users, Briefcase, 
  CircleHelp, MapPin, Building2, Twitter, Linkedin, Facebook, Instagram, 
  Globe, Download, Smartphone, ChevronDown, Mail, Wifi, Battery, Signal, 
  Settings, Send, MoreVertical, Phone 
} from "lucide-react"
import { Button } from "./ui/button"
import { Timeline } from "./ui/timeline"
import ThumbnailButton from "./ui/thumbnail-button-video-player"

// --- MOCK APP WIDGETS (Floating UI Elements) ---

// 1. Task Card
const MockTaskCard = ({ title, time, completed = false, priority = "STANDARD" }) => (
  <div className={`p-4 rounded-[16px] border transition-all flex flex-col justify-between relative overflow-hidden group shadow-sm w-full max-w-[260px] ${
    completed ? 'bg-[#E6F4EA] border-[#C4EED0]' : 'bg-white border-white'
  }`}>
    <div className="flex justify-between items-start mb-2">
      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
        priority === 'CRITICAL' ? 'bg-[#F9DEDC] text-[#B3261E]' : 'bg-[#F0F4F9] text-[#444746]'
      }`}>
        {priority}
      </div>
      {completed ? <CircleCheck className="w-4 h-4 text-[#146C2E]" /> : <div className="w-4 h-4 rounded-full border-2 border-[#E1E3E1]"></div>}
    </div>
    <div>
      <h4 className={`font-bold text-sm mb-1 text-[#1F1F1F] ${completed ? 'line-through opacity-60' : ''}`}>{title}</h4>
      <div className="flex items-center text-[#444746] text-[10px] font-medium">
        <Clock className="w-3 h-3 mr-1" />
        {time}
      </div>
    </div>
  </div>
);

// 2. Vitals Card
const MockVitalCard = ({ type, value, label, trend }) => (
  <div className={`p-5 rounded-[24px] flex flex-col justify-between h-[140px] w-full max-w-[160px] shadow-lg ${
    type === 'BP' ? 'bg-[#FFD8E4] text-[#31111D]' : 'bg-[#FFDCC2] text-[#2E1500]'
  }`}>
    <div className="flex justify-between items-start w-full">
      <span className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</span>
      <div className="bg-white/40 p-1.5 rounded-full">
        {type === 'BP' ? <Heart className="w-5 h-5 fill-current" /> : <Thermometer className="w-5 h-5" />}
      </div>
    </div>
    <div className="text-left">
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-80 block mt-1">{trend}</span>
    </div>
  </div>
);

// 3. Chat Message
const MockChatMessage = ({ text, sender, isMe, time, isPhoto, imgSrc }) => (
  <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`max-w-[85%] px-3 py-2 rounded-2xl shadow-sm text-sm relative ${
      isMe ? 'bg-[#E7FFDB] text-[#111B21] rounded-tr-none' : 'bg-white text-[#111B21] rounded-tl-none'
    }`}>
      {!isMe && <p className="text-[10px] font-bold text-[#128C7E] mb-1">{sender}</p>}
      {isPhoto && (
        <div className="mb-2 rounded-lg overflow-hidden relative">
          <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white flex items-center">
            <Camera className="w-3 h-3 mr-1" />
            {sender.toLowerCase().includes('cna') || sender.toLowerCase().includes('rn') ? 'Verified' : 'Shared'}
          </div>
          <img src={imgSrc || "https://images.unsplash.com/photo-1576091160550-217358c7e618?w=400&q=80"} alt="evidence" className="w-full h-32 object-cover" />
        </div>
      )}
      <p className="leading-relaxed">{text}</p>
      <div className="flex justify-end items-center mt-1 space-x-1">
        <span className="text-[9px] text-gray-500">{time}</span>
        {isMe && <CircleCheck className="w-3 h-3 text-[#53bdeb]" />}
      </div>
    </div>
  </div>
);

// 4. Enterprise Row
const MockStaffRow = ({ name, role, status, location }) => (
  <div className="bg-white p-4 rounded-[16px] shadow-sm border border-[#E1E3E1] flex items-center justify-between w-full">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#E1E3E1] flex items-center justify-center font-bold text-[#444746] text-sm">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-sm text-[#1F1F1F]">{name}</h4>
        <p className="text-xs text-[#444746]">{role} • {location}</p>
      </div>
    </div>
    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
      status === 'Active' ? 'bg-[#E6F4EA] text-[#146C2E]' : 'bg-[#F2F2F2] text-[#444746]'
    }`}>
      {status}
    </span>
  </div>
);

// --- FEATURE ROW COMPONENT ---
const FeatureRow = ({ title, description, visual, reversed = false, themeColor = "blue" }) => {
  return (
    <div className="py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-24 lg:gap-40`}>
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full relative flex justify-center items-center"
          >
            <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
              {visual}
            </div>
            {/* Decorative Blob */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] z-0 opacity-20 blur-[90px] rounded-full pointer-events-none ${
              themeColor === 'green' ? 'bg-green-300' : themeColor === 'purple' ? 'bg-purple-300' : 'bg-blue-300'
            }`}></div>
          </motion.div>

          {/* Text Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 text-center lg:text-left"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#111B21] mb-8 leading-tight tracking-tight">
              {title}
            </h2>
            <div className="text-lg text-slate-600 leading-relaxed font-medium space-y-6">
              {description}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// --- FAMILY CHAT MOCK COMPONENT ---
const FamilyChatMock = () => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-2xl w-full relative z-10 overflow-hidden">
    <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">FR</div>
        <div>
          <h4 className="font-bold text-[#1F1F1F]">Family Room</h4>
          <p className="text-xs text-slate-500">3 members active</p>
        </div>
      </div>
      <div className="p-2 bg-slate-50 rounded-full"><MoreVertical className="w-5 h-5 text-slate-400" /></div>
    </div>
    <MockChatMessage text="Can someone cover the Sunday visit? I have a work trip." sender="Tom (Brother)" isMe={false} time="10:30 AM" />
    <MockChatMessage text="I can do it! I'll bring Dad's favorite puzzle." sender="Me" isMe={true} time="10:32 AM" />
    <MockChatMessage text="Thanks! Here is a photo of the groceries I just dropped off." sender="Mom" isMe={false} time="11:45 AM" isPhoto={true} imgSrc="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80" />
    <div className="mt-4 pt-2 border-t border-slate-50 flex gap-2">
      <div className="flex-1 bg-slate-50 rounded-full h-10 px-4 flex items-center text-slate-400 text-sm">Message...</div>
      <div className="w-10 h-10 bg-[#0B57D0] rounded-full flex items-center justify-center text-white"><Send className="w-4 h-4" /></div>
    </div>
  </div>
)

export const LandingPage = ({ onNavigateToAuth, onNavigateToFAQ }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- TIMELINE DATA ---
  const timelineData = [
    {
      title: "The Reality Gap",
      content: (
        <div className="space-y-8">
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            Why guess? Old ways leave you worrying. ADLTrack lets you know for sure.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way - NURSING HOMES */}
            <div className="bg-[#F9DEDC] border border-[#F2B8B5] p-6 rounded-[32px] relative overflow-hidden flex flex-col justify-center min-h-[240px]">
              <div className="absolute right-[-20px] top-[-20px] bg-[#B3261E]/10 w-32 h-32 rounded-full blur-2xl"></div>
              <h4 className="font-bold text-xl mb-4 text-[#8C1D18] flex items-center">
                <span className="bg-white p-2 rounded-xl mr-3 shadow-sm">
                  <Building2 className="w-5 h-5 text-[#B3261E]" />
                </span>
                Nursing Homes
              </h4>
              <div className="space-y-3 opacity-80">
                <div className="bg-white/60 p-3 rounded-xl flex items-center gap-3">
                  <PhoneMissed className="w-5 h-5 text-[#B3261E]" />
                  <div>
                    <p className="text-xs font-bold text-[#8C1D18]">Missed Call</p>
                    <p className="text-[12px] text-[#410E0B]">"They didn't answer."</p>
                  </div>
                </div>
                <div className="bg-white/60 p-3 rounded-xl flex items-center gap-3">
                  <FileX className="w-5 h-5 text-[#B3261E]" />
                  <div>
                    <p className="text-xs font-bold text-[#8C1D18]">No Notes</p>
                    <p className="text-[12px] text-[#410E0B]">"Did Mom eat lunch?"</p>
                  </div>
                </div>
                <div className="bg-white/60 p-3 rounded-xl flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#B3261E]" />
                  <div>
                    <p className="text-xs font-bold text-[#8C1D18]">Different Staff</p>
                    <p className="text-[12px] text-[#410E0B]">"Who is helping today?"</p>
                  </div>
                </div>
                <div className="bg-white/60 p-3 rounded-xl flex items-center gap-3">
                  <CircleHelp className="w-5 h-5 text-[#B3261E]" />
                  <div>
                    <p className="text-xs font-bold text-[#8C1D18]">Mystery Health</p>
                    <p className="text-[12px] text-[#410E0B]">"Is Dad feeling okay?"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* The ADLTrack Way */}
            <div className="bg-[#E6F4EA] border border-[#C4EED0] p-6 rounded-[32px] relative overflow-hidden shadow-lg flex flex-col justify-center min-h-[240px] md:-translate-y-4">
              <div className="absolute right-[-20px] top-[-20px] bg-[#34A853]/10 w-32 h-32 rounded-full blur-2xl"></div>
              <h4 className="font-bold text-xl mb-6 text-[#146C2E] flex items-center">
                <span className="bg-white p-2 rounded-xl mr-3 shadow-sm">
                  <Activity className="w-5 h-5 text-[#146C2E]" />
                </span>
                ADLTrack
              </h4>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-[#C4EED0] flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full"><CircleCheck className="w-4 h-4 text-[#146C2E]" /></div>
                  <div>
                    <p className="text-xs font-bold text-[#1F1F1F]">Meds Taken</p>
                    <p className="text-[12px] text-[#444746]">"Photo proof at 9 AM."</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-[#C4EED0] flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full"><Activity className="w-4 h-4 text-[#0B57D0]" /></div>
                  <div>
                    <p className="text-xs font-bold text-[#1F1F1F]">Health is Good</p>
                    <p className="text-[12px] text-[#444746]">"Blood pressure is normal."</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-[#C4EED0] flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full"><MapPin className="w-4 h-4 text-[#684fa3]" /></div>
                  <div>
                    <p className="text-xs font-bold text-[#1F1F1F]">Checked In</p>
                    <p className="text-[12px] text-[#444746]">"Arrived at 8:00 AM sharp."</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-[#C4EED0] flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full"><MessageCircle className="w-4 h-4 text-[#b06000]" /></div>
                  <div>
                    <p className="text-xs font-bold text-[#1F1F1F]">Happy Updates</p>
                    <p className="text-[12px] text-[#444746]">"Dad loved the puzzle!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Real-Time Clarity",
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            ADLTrack turns care into a transparent feed. Just like your favorite messaging app, but for health.
          </p>
          <div className="bg-[#F0F4F9] p-6 rounded-[32px] border border-slate-100 shadow-xl max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">JD</div>
                <span className="text-sm font-bold text-slate-900">Dad's Feed</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-slate-200">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-600 uppercase">Live</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">10:30</span>
                  <div className="w-0.5 h-full bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <MockTaskCard title="Morning Walk" time="10:30 - 11:00" completed={true} priority="JOY" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">09:00</span>
                  <div className="w-0.5 h-full bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex-1 flex gap-2">
                  <MockVitalCard type="BP" value="120/80" label="BP mmHg" trend="Normal" />
                  <MockVitalCard type="TEMP" value="98.6°" label="Temp F" trend="Stable" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Evidence Based",
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            Trust is good. Verified data is better. Every task is timestamped, geotagged, and photographed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full py-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-100 rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="bg-white p-4 rounded-[24px] shadow-xl border border-slate-100 relative z-10 h-full">
                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden relative mb-4">
                  <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Evidence" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center text-white mb-1">
                      <CircleCheck className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-base font-bold">Task Verified</span>
                    </div>
                    <p className="text-white/80 text-xs font-mono">Lat: 34.0522 • Lon: -118.2437</p>
                  </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <div>
                    <h4 className="font-bold text-[#1F1F1F] text-lg">Medication Administered</h4>
                    <p className="text-sm text-[#444746] font-medium">Sarah Jenkins • 09:12 AM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group md:mt-12">
              <div className="absolute inset-0 bg-green-100 rounded-[24px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="bg-white p-4 rounded-[24px] shadow-xl border border-slate-100 relative z-10 h-full">
                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden relative mb-4">
                  <img src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Walking Evidence" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center text-white mb-1">
                      <CircleCheck className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-base font-bold">Task Verified</span>
                    </div>
                    <p className="text-white/80 text-xs font-mono">Lat: 34.0524 • Lon: -118.2440</p>
                  </div>
                </div>
                <div className="flex justify-between items-center px-2">
                  <div>
                    <h4 className="font-bold text-[#1F1F1F] text-lg">Afternoon Walk</h4>
                    <p className="text-sm text-[#444746] font-medium">Sarah Jenkins • 02:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans selection:bg-[#25D366] selection:text-white overflow-x-hidden">
      {/* --- HEADER --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo - Airbnb-inspired clean style */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#25D366]">adltrack</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-semibold text-[#111B21] hover:text-[#25D366] transition-colors">How it Works</a>
            <a href="#demo" className="text-sm font-semibold text-[#111B21] hover:text-[#25D366] transition-colors">Features</a>
            <button onClick={onNavigateToFAQ} className="text-sm font-semibold text-[#111B21] hover:text-[#25D366] transition-colors">FAQ</button>
            
            {/* Login Button */}
            <Button 
              variant="ghost" 
              className="text-sm font-semibold text-[#111B21] hover:text-[#25D366] hover:bg-transparent px-4"
              onClick={() => onNavigateToAuth('signin')}
              data-testid="nav-login-btn"
            >
              Log In
            </Button>

            {/* Get Started Button */}
            <Button 
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full px-6 font-bold shadow-[0_4px_10px_rgba(37,211,102,0.3)] transition-all"
              onClick={() => onNavigateToAuth('signup')}
              data-testid="nav-signup-btn"
            >
              Get Started
            </Button>
          </nav>

          <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="text-[#111B21]" /> : <Menu className="text-[#111B21]" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl lg:hidden">
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-[#111B21]">How it Works</a>
            <button onClick={() => { setIsMobileMenuOpen(false); onNavigateToFAQ(); }} className="text-lg font-medium text-[#111B21] text-left">FAQ</button>
            <div className="h-px bg-gray-100 my-2"></div>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onNavigateToAuth('signin'); }} 
              className="text-left text-lg font-medium text-[#25D366]"
              data-testid="mobile-login-btn"
            >
              Log In
            </button>
            <Button 
              className="w-full bg-[#25D366] rounded-full py-6 text-lg font-bold" 
              onClick={() => { setIsMobileMenuOpen(false); onNavigateToAuth('signup'); }}
              data-testid="mobile-signup-btn"
            >
              Get Started Free
            </Button>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-48 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-5xl lg:text-[5.5rem] leading-[1.05] font-normal tracking-tight mb-6 text-[#111B21]">
                Simple. Secure.<br/>Reliable Care.
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                With ADLTrack, you get fast, simple, secure messaging and real-time health updates for your loved ones, available on phones all over the world.
              </p>
              <Button 
                onClick={() => onNavigateToAuth('signup')} 
                className="bg-[#25D366] text-white rounded-full h-14 px-8 text-lg font-bold hover:bg-[#20bd5a] shadow-[0_8px_20px_rgba(37,211,102,0.25)] transition-all hover:scale-105"
                data-testid="hero-start-trial-btn"
              >
                Start Free Trial
              </Button>
            </div>

            {/* Phone Mockup - Matching Reference Image Layout */}
            <div className="flex-1 relative w-full flex justify-center lg:justify-end">
              <div className="relative flex items-center justify-center">
                
                {/* FLOATING CHAT CARD - Left Side of Phones */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -left-4 sm:-left-12 lg:-left-40 top-8 z-30 hidden sm:block"
                >
                  <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 w-[220px]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Family Chat</p>
                        <p className="text-xs text-slate-500">3 members</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-2xl px-4 py-3">
                        <p className="text-xs text-slate-500 mb-1">Sarah (CNA)</p>
                        <p className="text-sm text-slate-800">Dad had a great morning! Just finished his exercises 💪</p>
                        <p className="text-[10px] text-slate-400 mt-1">9:32 AM</p>
                      </div>
                      <div className="bg-[#E7FFDB] rounded-2xl px-4 py-3 ml-4">
                        <p className="text-sm text-slate-800">Thanks for the update!</p>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">9:35 AM ✓✓</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* PHONE 2 (BEHIND) - Chat Screen - Left/Behind */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative w-[220px] sm:w-[250px] h-[460px] sm:h-[500px] bg-[#1a1a1a] rounded-[36px] border-[7px] border-[#1a1a1a] shadow-xl overflow-hidden z-10 hidden sm:block"
                  style={{ 
                    transform: 'perspective(1200px) rotateY(8deg)',
                    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)' 
                  }}
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1a1a] rounded-b-xl z-30"></div>
                  {/* Status Bar */}
                  <div className="w-full h-6 bg-white flex justify-between items-center px-4 text-[#1F1F1F] relative">
                    <span className="text-[8px] font-semibold">9:41</span>
                    <div className="flex gap-1">
                      <Signal className="w-2.5 h-2.5" />
                      <Wifi className="w-2.5 h-2.5" />
                      <Battery className="w-2.5 h-2.5" />
                    </div>
                  </div>
                  {/* Chat Screen Content */}
                  <div className="w-full h-full bg-white overflow-hidden relative font-sans">
                    {/* Header */}
                    <div className="bg-white px-3 py-2 border-b border-slate-100">
                      <p className="text-slate-400 text-[10px]">Good morning,</p>
                      <p className="font-bold text-sm text-slate-900">Sarah</p>
                    </div>
                    
                    {/* Patient Selector */}
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-2 py-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-[8px]">MJ</div>
                        <span className="text-[11px] font-medium text-slate-700">Margaret Johnson</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 ml-auto" />
                      </div>
                    </div>
                    
                    {/* Family Chat Section */}
                    <div className="px-3 py-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Family Chat</p>
                      <div className="space-y-2">
                        <div className="bg-slate-50 rounded-xl px-2 py-1.5">
                          <p className="text-[9px] text-slate-500">Can someone cover Sunday?</p>
                          <p className="text-[8px] text-slate-400">Sarah • 2:30 PM</p>
                        </div>
                        <div className="bg-[#E7FFDB] rounded-xl px-2 py-1.5 ml-4">
                          <p className="text-[9px] text-slate-800">I can handle it 👍</p>
                          <p className="text-[8px] text-slate-400 text-right">You • 2:35 PM</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-2 py-1.5">
                          <p className="text-[9px] text-slate-500">Thanks! Mom has PT at 10am</p>
                          <p className="text-[8px] text-slate-400">Sarah • 2:36 PM</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Input */}
                    <div className="absolute bottom-8 left-0 right-0 px-3">
                      <div className="flex gap-2 bg-slate-100 rounded-full px-3 py-1.5">
                        <span className="text-[9px] text-slate-400 flex-1">Message...</span>
                        <Send className="w-3 h-3 text-[#25D366]" />
                      </div>
                    </div>
                    
                    {/* Bottom Nav */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-1 flex justify-around">
                      <Activity className="w-4 h-4 text-slate-300" />
                      <Clock className="w-4 h-4 text-slate-300" />
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <Settings className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </motion.div>

                {/* PHONE 1 (FRONT) - Dashboard - Right/Front */}
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] bg-[#1a1a1a] rounded-[40px] border-[8px] border-[#1a1a1a] shadow-2xl overflow-hidden z-20 sm:-ml-16"
                  style={{ 
                    transform: 'perspective(1200px) rotateY(-5deg)',
                    boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.4)' 
                  }}
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1a1a1a] rounded-b-2xl z-30"></div>
                  {/* Status Bar */}
                  <div className="w-full h-7 bg-white flex justify-between items-center px-5 text-[#1F1F1F] relative">
                    <span className="text-[9px] font-semibold">9:41</span>
                    <div className="flex gap-1">
                      <Signal className="w-3 h-3" />
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3 h-3" />
                    </div>
                  </div>
                  {/* Dashboard Screen Content */}
                  <div className="w-full h-full bg-white overflow-hidden relative font-sans">
                    {/* Header */}
                    <div className="bg-white px-4 py-2">
                      <p className="text-slate-400 text-xs">Good morning,</p>
                      <p className="font-bold text-lg text-slate-900">Sarah</p>
                    </div>
                    
                    {/* Patient Profile Selector */}
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-sm">MJ</div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-slate-800">Margaret Johnson</span>
                          <p className="text-[10px] text-slate-500">Patient</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    
                    {/* Main Content Area */}
                    <div className="px-4 py-2 space-y-3">
                      {/* Family Chat Preview */}
                      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                            <MessageCircle className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">Family Chat</span>
                          <span className="ml-auto text-[9px] text-slate-400">2:30 PM</span>
                        </div>
                        <p className="text-[11px] text-slate-600">Tom: Can someone cover Sunday?</p>
                      </div>
                      
                      {/* Current Vitals */}
                      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Current Vitals</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#FFE4EC] rounded-xl p-3">
                            <Heart className="w-4 h-4 text-[#E11D48] mb-1" />
                            <p className="text-lg font-bold text-slate-900">72 <span className="text-xs font-normal">bpm</span></p>
                            <p className="text-[9px] text-slate-500">Heart Rate</p>
                          </div>
                          <div className="bg-[#FEF3C7] rounded-xl p-3">
                            <Thermometer className="w-4 h-4 text-[#D97706] mb-1" />
                            <p className="text-lg font-bold text-slate-900">98.6 <span className="text-xs font-normal">°F</span></p>
                            <p className="text-[9px] text-slate-500">Temperature</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Today's Tasks */}
                      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Today's Tasks</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold">CRITICAL</span>
                          </div>
                          <div className="flex items-center gap-2 bg-[#E6F4EA] rounded-xl px-3 py-2">
                            <CircleCheck className="w-4 h-4 text-[#25D366]" />
                            <span className="text-xs text-slate-700">Morning Medication</span>
                            <span className="ml-auto text-[9px] text-slate-400">8:00 AM</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">STANDARD</span>
                          </div>
                          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                            <span className="text-xs text-slate-600">Blood Pressure Check</span>
                            <span className="ml-auto text-[9px] text-slate-400">10:00 AM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex justify-around">
                      <div className="flex flex-col items-center">
                        <Activity className="w-5 h-5 text-[#25D366]" />
                        <span className="text-[8px] text-[#25D366] font-medium">Dashboard</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Clock className="w-5 h-5 text-slate-300" />
                        <span className="text-[8px] text-slate-400">Schedule</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <MessageCircle className="w-5 h-5 text-slate-300" />
                        <span className="text-[8px] text-slate-400">Messages</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Settings className="w-5 h-5 text-slate-300" />
                        <span className="text-[8px] text-slate-400">Settings</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative blurs */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#25D366] rounded-full blur-[120px] opacity-10 pointer-events-none -z-10"></div>
                <div className="absolute bottom-0 -left-20 w-64 h-64 bg-purple-400 rounded-full blur-[100px] opacity-10 pointer-events-none -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SCROLLING TIMELINE SECTION --- */}
      <section id="how-it-works" className="bg-[#FFFFFF]">
        <Timeline data={timelineData} />
      </section>

      {/* --- VIDEO & FAMILY CHAT SHOWCASE --- */}
      <section id="demo" className="py-24 bg-[#F0F4F9] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Side: Video Content & Context */}
            <div className="flex-1 space-y-12">
              <div className="max-w-xl">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#111B21] mb-6">
                  See Care in Action
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  From AI-powered caregiver support to seamless family communication, watch how ADLTrack brings transparency to every shift.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col gap-3">
                  <ThumbnailButton
                    videoUrl="https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYyFbubgfAdJGgcHaXTtYDS9BWOoP8AKMkrxu6"
                    thumbnailUrl="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
                    title="Platform Overview"
                    className="shadow-lg border-2 border-white"
                  />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">For Families</p>
                </div>
                <div className="flex flex-col gap-3">
                  <ThumbnailButton
                    videoUrl="https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYrcDsPep5NDIwsMcqZHiUGKxvuhb64FA8T3JP"
                    thumbnailUrl="https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80"
                    title="Copilot Demo"
                    className="shadow-lg border-2 border-white"
                  />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">For Caregivers</p>
                </div>
              </div>
            </div>

            {/* Right Side: Family Chat Mock */}
            <div className="flex-1 w-full flex justify-center lg:justify-end relative">
              <div className="relative w-full max-w-md">
                <FamilyChatMock />
                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-6 -left-6 z-20 bg-[#25D366] text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-[240px]"
                >
                  <div className="bg-white/20 p-2 rounded-full">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold opacity-90 uppercase">One Secure Thread</p>
                    <p className="text-sm font-bold">Coordinate with the whole family instantly.</p>
                  </div>
                </motion.div>
                {/* Decorative Elements */}
                <div className="absolute top-10 -right-10 w-32 h-32 bg-purple-200 rounded-full blur-[60px] opacity-60 pointer-events-none -z-10"></div>
                <div className="absolute -bottom-10 left-10 w-40 h-40 bg-blue-200 rounded-full blur-[60px] opacity-60 pointer-events-none -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AGENCY EDUCATION SECTION --- */}
      <section className="bg-[#FFFFFF] relative z-20 pb-32">
        {/* Section 1: Fraud & Compliance */}
        <FeatureRow
          themeColor="blue"
          title="Audit-Proof Your Agency"
          description={
            <>
              <p>Government mandates for Electronic Visit Verification (EVV) are cracking down on fraud. Genuine agencies are at risk if they can't prove care delivery.</p>
              <p>ADLTrack generates indisputable, GPS-verified, and photo-backed logs for every shift. Protect your license and your revenue with data regulators trust.</p>
            </>
          }
          visual={
            <div className="flex flex-col gap-4 w-full">
              <div className="bg-white p-6 rounded-[24px] shadow-xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Live Shift Log</h4>
                <div className="space-y-3">
                  <MockStaffRow name="Sarah Jenkins" role="CNA" status="Active" location="Doe Res." />
                  <MockStaffRow name="Mike Ross" role="RN" status="Offline" location="-" />
                  <MockStaffRow name="Jessica P." role="HHA" status="Active" location="Smith Res." />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#E6F4EA] p-4 rounded-xl self-end text-[#146C2E] font-bold text-sm flex items-center shadow-lg border border-[#C4EED0]"
              >
                <Shield className="w-5 h-5 mr-2" />
                EVV Compliant & Verified
              </motion.div>
            </div>
          }
        />

        {/* Section 2: Family Trust */}
        <FeatureRow
          reversed
          themeColor="purple"
          title="Turn Anxiety into Loyalty"
          description={
            <>
              <p>Families today demand transparency. They don't just want to know a caregiver arrived; they want to see the care happening.</p>
              <p>Give families a real-time window into the home without the intrusion. Share joy moments, vital updates, and peace of mind instantly. Build trust that lasts generations.</p>
            </>
          }
          visual={
            <div className="relative w-full max-w-sm">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 bg-purple-100 w-32 h-32 rounded-full blur-2xl -z-10"></div>
              <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80" alt="Dad" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1F1F1F] text-lg">Johnathan Doe</h4>
                    <p className="text-sm text-[#444746]">Status: <span className="text-green-600 font-bold">Comfortable</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MockVitalCard type="BP" value="120/80" label="Blood Pressure" trend="Normal" />
                  <MockVitalCard type="TEMP" value="98.6°" label="Temperature" trend="Stable" />
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute -bottom-6 -right-4 bg-[#0B57D0] text-white p-4 rounded-2xl shadow-lg flex items-center gap-3"
              >
                <MessageCircle className="w-6 h-6" />
                <div>
                  <p className="text-xs opacity-80 font-bold uppercase">New Message</p>
                  <p className="font-bold text-sm">"Thanks for the update!"</p>
                </div>
              </motion.div>
            </div>
          }
        />

        {/* Section 3: Billing & Payments */}
        <FeatureRow
          themeColor="green"
          title="Get Paid Faster, With Proof"
          description={
            <>
              <p>Billing disputes vanish when you have photographic evidence of every task completed. Streamline your payroll and invoicing with automated, verified data.</p>
              <p>Whether it's private pay or insurance, clean data means faster approvals and less administrative overhead. Let your care speak for itself.</p>
            </>
          }
          visual={
            <div className="flex flex-col items-center gap-4 w-full">
              <MockTaskCard title="Morning Meds" time="08:00 AM" completed={true} priority="CRITICAL" />
              <div className="bg-white p-4 rounded-[20px] shadow-lg border border-slate-100 w-full max-w-sm flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Shift Invoice #4022</p>
                  <p className="text-2xl font-bold text-[#1F1F1F]">$142.50</p>
                </div>
                <button className="bg-[#146C2E] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#0F5223] transition-colors">
                  Approve
                </button>
              </div>
            </div>
          }
        />
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="bg-[#111B21] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#25D366] opacity-5 skew-x-12 transform origin-top-right"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-[#1F2C34] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl border border-slate-800">
            <div className="max-w-xl mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your care experience?</h2>
              <p className="text-slate-400 text-lg mb-8">
                Whether you're a concerned family member or an agency owner looking to scale, our team is here to help you get set up.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center text-white font-medium bg-[#111B21] px-5 py-3 rounded-full border border-slate-700">
                  <Mail className="w-5 h-5 text-[#25D366] mr-3" />
                  support@adltrack.com
                </div>
                <div className="flex items-center text-white font-medium bg-[#111B21] px-5 py-3 rounded-full border border-slate-700">
                  <Phone className="w-5 h-5 text-[#25D366] mr-3" />
                  +1 (888) 555-0123
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto bg-white p-6 rounded-2xl shadow-lg max-w-sm">
              <h3 className="text-[#1F1F1F] font-bold text-xl mb-4">Get in Touch</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input placeholder="Your Name" className="w-full bg-[#F0F4F9] border-none rounded-lg px-4 py-3 text-[#1F1F1F] text-sm focus:ring-2 focus:ring-[#25D366] outline-none" data-testid="contact-name-input" />
                <input placeholder="Email Address" className="w-full bg-[#F0F4F9] border-none rounded-lg px-4 py-3 text-[#1F1F1F] text-sm focus:ring-2 focus:ring-[#25D366] outline-none" data-testid="contact-email-input" />
                <textarea placeholder="How can we help?" className="w-full bg-[#F0F4F9] border-none rounded-lg px-4 py-3 text-[#1F1F1F] text-sm focus:ring-2 focus:ring-[#25D366] outline-none h-24 resize-none" data-testid="contact-message-input"></textarea>
                <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg py-6" data-testid="contact-submit-btn">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#111B21] text-white pt-20 pb-10 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[#25D366]">adltrack</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                The Care Operating System. Bridging the trust gap with evidence-based monitoring for families and agencies worldwide.
              </p>
              <div className="flex gap-4 pt-2">
                <button className="text-slate-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></button>
                <button className="text-slate-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-[#8696A0]">Access Portals</h4>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li><button onClick={() => onNavigateToAuth('signin')} className="hover:text-[#25D366] transition-colors text-left">Log In</button></li>
                <li><button onClick={() => onNavigateToAuth('signup')} className="hover:text-[#25D366] transition-colors text-left font-bold text-[#25D366]">Create Account</button></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-[#8696A0]">Company</h4>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li><a href="#how-it-works" className="hover:text-[#25D366] transition-colors">How it Works</a></li>
                <li><a href="#demo" className="hover:text-[#25D366] transition-colors">Features</a></li>
                <li><button onClick={onNavigateToFAQ} className="hover:text-[#25D366] transition-colors">Help Center</button></li>
                <li><a href="#contact" className="hover:text-[#25D366] transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Download Column */}
            <div>
              <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-[#8696A0]">Download</h4>
              <div className="space-y-3">
                <button className="w-full bg-[#232D36] border border-slate-700 hover:border-[#25D366] rounded-xl p-3 flex items-center justify-center gap-3 transition-all group">
                  <Download className="w-6 h-6 text-slate-400 group-hover:text-[#25D366]" />
                  <span className="text-left">
                    <div className="text-[10px] text-slate-400">Download on the</div>
                    <div className="font-bold text-sm">App Store</div>
                  </span>
                </button>
                <button className="w-full bg-[#232D36] border border-slate-700 hover:border-[#25D366] rounded-xl p-3 flex items-center justify-center gap-3 transition-all group">
                  <Smartphone className="w-6 h-6 text-slate-400 group-hover:text-[#25D366]" />
                  <span className="text-left">
                    <div className="text-[10px] text-slate-400">Get it on</div>
                    <div className="font-bold text-sm">Google Play</div>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-[#232D36] pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500 text-sm">English (US)</span>
            </div>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} adltrack Inc.</p>
            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage;

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Cpu, Loader2, Heart, ClipboardList, ShieldCheck } from 'lucide-react';
import { sendChatMessage, getGreeting } from '../services/geminiService';
import { useTheme } from '../context/ThemeContext';

export const AICopilot = ({ isOpen, onClose, role = 'caregiver', patientName = 'the patient' }) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`);

  // Initialize with greeting when entering chat
  useEffect(() => {
    if (isOpen && !showIntro && messages.length === 0) {
      const greeting = getGreeting(role, patientName);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, showIntro, role, patientName, messages.length]);

  // Reset when role changes
  useEffect(() => {
    setMessages([]);
    setShowIntro(true);
    sessionId.current = `session-${Date.now()}`;
  }, [role]);

  // Reset intro when reopened
  useEffect(() => {
    if (isOpen) {
      setShowIntro(true);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleContinue = () => {
    setShowIntro(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await sendChatMessage(sessionId.current, userMessage, role, { patientName });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const features = role === 'caregiver' ? [
    {
      icon: Heart,
      title: 'Smart Care Guidance',
      description: 'Get real-time recommendations on ADL tasks, vitals monitoring, and best care practices for your patient.'
    },
    {
      icon: ClipboardList,
      title: 'Task & Documentation Help',
      description: 'AI can help you stay organized with shift notes, incident reports, and care plan documentation.'
    },
    {
      icon: ShieldCheck,
      title: 'Safety & Compliance',
      description: 'Get quick answers on medication protocols, emergency procedures, and compliance requirements.'
    }
  ] : [
    {
      icon: Heart,
      title: 'Care Updates & Insights',
      description: 'Get summaries of your loved one\'s daily care, vitals trends, and caregiver activity at a glance.'
    },
    {
      icon: ClipboardList,
      title: 'Ask Anything',
      description: 'Have questions about medications, care plans, or daily routines? Your AI assistant has the answers.'
    },
    {
      icon: ShieldCheck,
      title: 'Peace of Mind',
      description: 'Stay informed about your loved one\'s wellbeing with intelligent alerts and proactive health insights.'
    }
  ];

  // ============================
  // INTRO WELCOME SCREEN
  // ============================
  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] font-['Manrope',sans-serif]">
        <div className="fixed inset-0 bg-black flex flex-col">
          {/* Close button */}
          <div className="flex-none flex justify-end px-5 pt-5">
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#2c2c2e] rounded-full flex items-center justify-center"
              data-testid="copilot-intro-close"
            >
              <X className="w-5 h-5 text-[#8e8e93]" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-7 pb-6">
            {/* Glowing Ring Icon */}
            <div className="flex justify-center pt-6 pb-8">
              <div className="relative w-32 h-32">
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-[#25D366]/20 blur-xl animate-pulse" />
                {/* Ring */}
                <svg className="relative w-full h-full" viewBox="0 0 128 128">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#25D366" />
                      <stop offset="35%" stopColor="#20bd5a" />
                      <stop offset="65%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#25D366" />
                    </linearGradient>
                  </defs>
                  <circle cx="64" cy="64" r="52" fill="none" stroke="url(#ringGrad)" strokeWidth="8" strokeLinecap="round" />
                  {/* Inner subtle glow circle */}
                  <circle cx="64" cy="64" r="36" fill="none" stroke="#25D366" strokeWidth="1" opacity="0.15" />
                </svg>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-10 h-10 text-[#25D366]" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-[28px] font-bold text-white text-center leading-tight mb-10">
              ADLTrack Care{'\n'}Assistant
            </h1>

            {/* Feature Items */}
            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-5" data-testid={`copilot-feature-${idx}`}>
                  <div className="w-12 h-12 rounded-2xl bg-[#1c1c1e] border border-[#3a3a3c] flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-[17px] mb-1">{feature.title}</h3>
                    <p className="text-[#8e8e93] text-[15px] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom section - disclaimer + button */}
          <div className="flex-none px-7 pb-8 pt-4">
            <p className="text-[#636366] text-[13px] text-center leading-relaxed mb-5">
              ADLTrack Care Assistant is an AI-powered tool for care guidance only. It does not provide medical diagnoses or replace professional medical advice.
            </p>
            <button
              onClick={handleContinue}
              className="w-full py-4 bg-[#25D366] text-white font-bold text-[17px] rounded-2xl active:bg-[#20bd5a] transition-colors"
              data-testid="copilot-continue-btn"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // CHAT SCREEN
  // ============================
  return (
    <div className="fixed inset-0 z-[100] font-['Manrope',sans-serif]">
      <div className={`${isDarkMode ? 'bg-black' : 'bg-white'} fixed inset-0 flex flex-col`}>
        {/* Header */}
        <div className={`flex-none ${isDarkMode ? 'border-[#3a3a3c]' : 'border-stone-200'} border-b px-5 py-4 flex items-center gap-3`}>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center"
            data-testid="copilot-close"
          >
            <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-stone-800'}`} />
          </button>
          <div className="w-11 h-11 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-[#25D366]" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>Care Assistant</h2>
            <p className="text-xs text-[#8e8e93] font-medium">Powered by AI</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 ${isDarkMode ? 'bg-black' : 'bg-stone-50'}`}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex-shrink-0 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-[#25D366]" />
                </div>
              )}
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-[#25D366] text-white ml-auto'
                  : `${isDarkMode ? 'bg-stone-800 text-stone-100' : 'bg-white text-stone-800 shadow-sm'}`
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#25D366]" />
              </div>
              <div className={`${isDarkMode ? 'bg-stone-800' : 'bg-white shadow-sm'} px-4 py-3 rounded-2xl`}>
                <Loader2 className="w-5 h-5 text-[#25D366] animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`flex-none border-t ${isDarkMode ? 'border-[#3a3a3c] bg-black' : 'border-stone-200 bg-white'} p-4`}>
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask about care..."
              className={`flex-1 px-4 py-3 ${isDarkMode ? 'bg-[#2c2c2e] text-white placeholder:text-[#8e8e93]' : 'bg-stone-100 text-stone-900 placeholder:text-[#ababab]'} rounded-xl text-base focus:outline-none font-medium transition-all ${
                isFocused ? 'ring-2 ring-[#25D366] border-[#25D366]' : 'border border-transparent'
              }`}
              style={{ fontSize: '16px' }}
              data-testid="copilot-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] active:bg-[#1ca34d] transition-colors disabled:bg-stone-600 disabled:cursor-not-allowed flex-none flex items-center justify-center"
              data-testid="copilot-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-[11px] ${isDarkMode ? 'text-[#8e8e93]' : 'text-[#ababab]'} text-center mt-3 font-medium`}>
            AI care guidance - Not medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

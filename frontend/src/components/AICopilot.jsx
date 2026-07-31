import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Heart, ClipboardList, ShieldCheck } from 'lucide-react';
import { CareAssistantIcon } from './CareAssistantIcon';
import { sendChatMessage, getGreeting } from '../services/geminiService';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  brandGlow: '0 4px 20px rgba(255,179,71,0.32)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

export const AICopilot = ({ isOpen, onClose, role = 'caregiver', patientName = 'the patient' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    if (isOpen && !showIntro && messages.length === 0) {
      const greeting = getGreeting(role, patientName);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, showIntro, role, patientName, messages.length]);

  useEffect(() => {
    setMessages([]);
    setShowIntro(true);
    sessionId.current = `session-${Date.now()}`;
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      setShowIntro(true);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleContinue = () => setShowIntro(false);

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
    { icon: Heart, title: 'Smart Care Guidance', description: 'Get real-time recommendations on ADL tasks, vitals monitoring, and best care practices for your patient.' },
    { icon: ClipboardList, title: 'Task & Documentation Help', description: 'AI can help you stay organized with shift notes, incident reports, and care plan documentation.' },
    { icon: ShieldCheck, title: 'Safety & Compliance', description: 'Get quick answers on medication protocols, emergency procedures, and compliance requirements.' },
  ] : [
    { icon: Heart, title: 'Care Updates & Insights', description: "Get summaries of your loved one's daily care, vitals trends, and caregiver activity at a glance." },
    { icon: ClipboardList, title: 'Ask Anything', description: 'Have questions about medications, care plans, or daily routines? Your AI assistant has the answers.' },
    { icon: ShieldCheck, title: 'Peace of Mind', description: "Stay informed about your loved one's wellbeing with intelligent alerts and proactive health insights." },
  ];

  // ============================
  // INTRO WELCOME SCREEN
  // ============================
  if (showIntro) {
    return (
      <div className="fixed inset-0 z-[100] font-['Manrope',sans-serif]">
        <div className="fixed inset-0 flex flex-col" style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }}>
          {/* Close button */}
          <div className="flex-none flex justify-end px-5 pt-5">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: D.bg, border: `1px solid ${D.bdr}` }}
              data-testid="copilot-intro-close"
            >
              <X className="w-5 h-5" style={{ color: D.body }} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-7 pb-6">
            {/* Icon */}
            <div className="flex justify-center pt-6 pb-8">
              <div className="relative">
                <div className="absolute inset-[-16px] rounded-full opacity-30 blur-2xl" style={{ background: 'linear-gradient(135deg,#FFB347,#F28482)' }} />
                <CareAssistantIcon size={120} className="relative" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-[28px] font-bold text-center leading-tight mb-10" style={{ color: D.h }}>
              One Permit Care{'\n'}Assistant
            </h1>

            {/* Feature Items */}
            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-5" data-testid={`copilot-feature-${idx}`}>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,179,71,0.12)', border: '1px solid rgba(255,179,71,0.28)', boxShadow: D.shadow }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: '#b45309' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[17px] mb-1" style={{ color: D.h }}>{feature.title}</h3>
                    <p className="text-[15px] leading-relaxed" style={{ color: D.body }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex-none px-7 pb-8 pt-4">
            <p className="text-[13px] text-center leading-relaxed mb-5" style={{ color: D.muted }}>
              One Permit Care Assistant is an AI-powered tool for care guidance only. It does not provide medical diagnoses or replace professional medical advice.
            </p>
            <button
              onClick={handleContinue}
              className="w-full py-4 text-white font-bold text-[17px] rounded-2xl transition-colors"
              style={{ background: D.brandGrad, boxShadow: D.brandGlow }}
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
      <div className="fixed inset-0 flex flex-col" style={{ background: D.bg }}>
        {/* Header */}
        <div
          className="flex-none px-5 py-4 flex items-center gap-3"
          style={{ background: D.card, borderBottom: `1px solid ${D.bdr}` }}
        >
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center"
            data-testid="copilot-close"
          >
            <X className="w-6 h-6" style={{ color: D.h }} />
          </button>
          <CareAssistantIcon size={40} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: D.h }}>Care Assistant</h2>
            <p className="text-xs font-medium" style={{ color: D.muted }}>Powered by AI</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4" style={{ background: D.bg }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <CareAssistantIcon size={32} />
                </div>
              )}
              <div
                className="max-w-[85%] px-4 py-3 rounded-2xl"
                style={{
                  background: msg.role === 'user' ? D.brandGrad : D.card,
                  color: msg.role === 'user' ? '#fff' : D.h,
                  border: msg.role === 'user' ? 'none' : `1px solid ${D.bdr}`,
                  boxShadow: msg.role === 'user' ? '0 2px 10px rgba(255,179,71,0.22)' : D.shadow,
                  boxShadow: msg.role === 'user' ? 'none' : D.shadow,
                }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <CareAssistantIcon size={32} />
              </div>
              <div className="px-4 py-3 rounded-2xl" style={{ background: D.card, border: `1px solid rgba(255,179,71,0.25)` }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#FFB347' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className="flex-none p-4"
          style={{ background: D.card, borderTop: `1px solid ${D.bdr}` }}
        >
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
              className="flex-1 px-4 py-3 rounded-xl text-base focus:outline-none font-medium transition-all"
              style={{
                background: D.bg,
                color: D.h,
                border: `1px solid ${isFocused ? D.brand : D.bdr}`,
                fontSize: '16px',
              }}
              data-testid="copilot-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-none flex items-center justify-center"
              style={{ background: D.brandGrad }}
              data-testid="copilot-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[11px] text-center mt-3 font-medium" style={{ color: D.muted }}>
            AI care guidance - Not medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

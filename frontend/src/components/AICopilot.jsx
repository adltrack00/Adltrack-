import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Cpu, User, Loader2 } from 'lucide-react';
import { sendChatMessage, getGreeting } from '../services/geminiService';
import { useTheme } from '../context/ThemeContext';

export const AICopilot = ({ isOpen, onClose, role = 'caregiver', patientName = 'the patient' }) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getGreeting(role, patientName);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, role, patientName, messages.length]);

  // Reset when role changes
  useEffect(() => {
    setMessages([]);
    sessionId.current = `session-${Date.now()}`;
  }, [role]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        sessionId.current,
        userMessage,
        role,
        { patientName }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  if (!isOpen) return null;

  // Theme-aware colors
  const userMsgBg = isDarkMode ? 'bg-[#25D366] text-white' : 'bg-[#2c2c2e] text-white';
  const assistantMsgBg = isDarkMode ? 'bg-stone-800 text-stone-100' : 'bg-white text-stone-800 border border-stone-200';
  const userIconBg = isDarkMode ? 'bg-stone-700' : 'bg-stone-200';
  const assistantIconBg = isDarkMode ? 'bg-[#25D366]/20' : 'bg-emerald-100';

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[100] font-['Manrope',sans-serif]" 
      onClick={onClose}
    >
      {/* Slide-up panel matching mobile app */}
      <div 
        ref={containerRef}
        className={`
          ${isDarkMode ? 'bg-black' : 'bg-white'} 
          fixed left-0 right-0 bottom-0
          sm:left-1/2 sm:-translate-x-1/2 sm:bottom-0
          sm:max-w-lg
          rounded-t-3xl
          shadow-2xl
          flex flex-col
        `}
        style={{
          height: '70vh',
          maxHeight: '600px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - matching mobile exactly */}
        <div className={`flex-none ${isDarkMode ? 'border-[#3a3a3c]' : 'border-stone-200'} border-b px-5 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                Care Assistant
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-[#8e8e93]' : 'text-[#8e8e93]'} font-medium`}>Powered by AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`w-9 h-9 ${isDarkMode ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-100 hover:bg-stone-200'} rounded-full flex items-center justify-center transition-colors`}
            data-testid="copilot-close"
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-[#ababab]' : 'text-[#8e8e93]'}`} />
          </button>
        </div>

        {/* Messages Area */}
        <div 
          className={`flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 ${isDarkMode ? 'bg-black' : 'bg-stone-50'}`}
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
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

        {/* Input Area - matching mobile with green border on focus */}
        <div className={`flex-none border-t ${isDarkMode ? 'border-[#3a3a3c] bg-black' : 'border-stone-200 bg-white'} p-4`}>
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
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
            AI care guidance • Not medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

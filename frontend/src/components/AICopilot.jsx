import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage, getGreeting } from '../services/geminiService';
import { useTheme } from '../context/ThemeContext';

export const AICopilot = ({ isOpen, onClose, role = 'caregiver', patientName = 'the patient' }) => {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  // Prevent body scroll when modal is open and handle mobile viewport
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Prevent iOS bounce
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
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
  const userMsgBg = isDarkMode ? 'bg-[#25D366] text-white' : 'bg-stone-900 text-white';
  const assistantMsgBg = isDarkMode ? 'bg-stone-800 text-stone-100' : 'bg-white text-stone-800 border border-stone-200';
  const userIconBg = isDarkMode ? 'bg-stone-700' : 'bg-stone-200';
  const assistantIconBg = isDarkMode ? 'bg-[#25D366]/20' : 'bg-emerald-100';

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[100] font-['Manrope',sans-serif]" 
      onClick={onClose}
    >
      {/* Full screen container for mobile - fixed position from top */}
      <div 
        ref={containerRef}
        className={`
          ${isDarkMode ? 'bg-stone-950' : 'bg-white'} 
          fixed left-0 right-0 bottom-0
          sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
          sm:max-w-md sm:rounded-3xl sm:border ${isDarkMode ? 'sm:border-stone-800' : 'sm:border-stone-200'}
          rounded-t-3xl
          shadow-2xl
          flex flex-col
        `}
        style={{
          height: '450px', /* Fixed pixel height - won't change with keyboard */
          maxHeight: '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex-none ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'} border-b px-4 py-3 flex items-center justify-between rounded-t-3xl`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {role === 'caregiver' ? 'Care Assistant' : 'Family Assistant'}
              </h2>
              <p className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} font-medium`}>Powered by AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'hover:bg-stone-800 active:bg-stone-700' : 'hover:bg-stone-100 active:bg-stone-200'} rounded-xl transition-colors`}
            data-testid="copilot-close"
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
          </button>
        </div>

        {/* Messages Area - fixed height with internal scroll */}
        <div 
          className={`flex-1 overflow-y-auto overscroll-contain p-4 space-y-3 ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? userIconBg : assistantIconBg
              }`}>
                {msg.role === 'user' ? (
                  <User className={`w-3.5 h-3.5 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`} />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-[#25D366]" />
                )}
              </div>
              <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? `${userMsgBg} rounded-tr-sm` 
                  : `${assistantMsgBg} rounded-tl-sm`
              }`}>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2">
              <div className={`w-7 h-7 rounded-lg ${assistantIconBg} flex items-center justify-center`}>
                <Bot className="w-3.5 h-3.5 text-[#25D366]" />
              </div>
              <div className={`${assistantMsgBg} px-3 py-2.5 rounded-2xl rounded-tl-sm shadow-sm`}>
                <Loader2 className="w-4 h-4 text-[#25D366] animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - fixed at bottom */}
        <div className={`flex-none border-t ${isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'} p-3`}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about care..."
              className={`flex-1 px-3 py-2.5 ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder:text-stone-500' : 'bg-stone-100 border-stone-200 text-stone-900 placeholder:text-stone-400'} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] font-medium`}
              data-testid="copilot-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] active:bg-[#1ca34d] transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed flex-none flex items-center justify-center"
              data-testid="copilot-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-[9px] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'} text-center mt-2 font-medium`}>
            AI care guidance • Not medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

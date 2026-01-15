import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage, getGreeting } from '../services/geminiService';
import { useTheme } from '../context/ThemeContext';

export const AICopilot = ({ isOpen, onClose, role = 'caregiver', patientName = 'the patient' }) => {
  const { isDarkMode, bg, bgCard, border, text, textSecondary, textMuted, bgInput } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
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
  const modalBg = isDarkMode ? 'bg-stone-900' : 'bg-white';
  const messagesBg = isDarkMode ? 'bg-stone-950' : 'bg-stone-50';
  const inputBg = isDarkMode ? 'bg-stone-800 text-white placeholder:text-stone-500' : 'bg-stone-100 text-stone-900 placeholder:text-stone-400';
  const inputBorder = isDarkMode ? 'border-stone-700' : 'border-stone-200';
  const footerBg = isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100';
  const userMsgBg = isDarkMode ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white';
  const assistantMsgBg = isDarkMode ? 'bg-stone-800 text-stone-100' : 'bg-white text-stone-800';
  const userIconBg = isDarkMode ? 'bg-stone-700' : 'bg-stone-200';
  const assistantIconBg = isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100';

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" 
      onClick={onClose}
    >
      <div 
        className={`${modalBg} w-full sm:max-w-lg h-[85vh] sm:h-[600px] sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Brand Green */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#25D366]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">
                {role === 'caregiver' ? 'Care Assistant' : 'Family Assistant'}
              </h3>
              <p className="text-xs text-white/80">Powered by AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            data-testid="copilot-close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${messagesBg}`}>
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? userIconBg : assistantIconBg
              }`}>
                {msg.role === 'user' ? (
                  <User className={`w-4 h-4 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`} />
                ) : (
                  <Bot className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? `${userMsgBg} rounded-tr-md` 
                  : `${assistantMsgBg} rounded-tl-md`
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-xl ${assistantIconBg} flex items-center justify-center`}>
                <Bot className="w-4 h-4 text-emerald-500" />
              </div>
              <div className={`${assistantMsgBg} px-4 py-3 rounded-2xl rounded-tl-md shadow-sm`}>
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`border-t ${inputBorder} p-4 ${footerBg}`}>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              className={`flex-1 px-4 py-3 ${inputBg} border ${inputBorder} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium`}
              data-testid="copilot-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
              data-testid="copilot-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-[10px] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'} text-center mt-3 font-medium`}>
            AI assistant for care guidance • Not a substitute for medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

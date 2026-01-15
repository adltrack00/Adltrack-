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
  const userMsgBg = isDarkMode ? 'bg-[#25D366] text-white' : 'bg-stone-900 text-white';
  const assistantMsgBg = isDarkMode ? 'bg-stone-800 text-stone-100' : 'bg-white text-stone-800 border border-stone-200';
  const userIconBg = isDarkMode ? 'bg-stone-700' : 'bg-stone-200';
  const assistantIconBg = isDarkMode ? 'bg-[#25D366]/20' : 'bg-emerald-100';

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" 
      onClick={onClose}
    >
      {/* Fixed height container - stable size that won't resize */}
      <div 
        className={`${isDarkMode ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200'} border w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl h-[70vh] sm:h-[500px] flex flex-col overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed height */}
        <div className={`flex-shrink-0 ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-200'} border-b px-5 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {role === 'caregiver' ? 'Care Assistant' : 'Family Assistant'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'} font-medium`}>Powered by AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 ${isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-100'} rounded-xl transition-colors`}
            data-testid="copilot-close"
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`} />
          </button>
        </div>

        {/* Messages Area - Flex-1 takes remaining space, scrolls internally */}
        <div 
          className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}
          style={{ minHeight: 0 }} /* Critical for flex child overflow */
        >
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
                  <Bot className="w-4 h-4 text-[#25D366]" />
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
                <Bot className="w-4 h-4 text-[#25D366]" />
              </div>
              <div className={`${assistantMsgBg} px-4 py-3 rounded-2xl rounded-tl-md shadow-sm`}>
                <Loader2 className="w-5 h-5 text-[#25D366] animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed height at bottom */}
        <div className={`flex-shrink-0 border-t ${isDarkMode ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-white'} p-4`}>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about care..."
              className={`flex-1 px-4 py-3 ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder:text-stone-500' : 'bg-stone-100 border-stone-200 text-stone-900 placeholder:text-stone-400'} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] font-medium`}
              data-testid="copilot-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed flex-shrink-0"
              data-testid="copilot-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className={`text-[10px] ${isDarkMode ? 'text-stone-500' : 'text-stone-400'} text-center mt-2 font-medium`}>
            AI care guidance • Not a substitute for medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

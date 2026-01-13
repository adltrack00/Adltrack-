import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { sendChatMessage, getGreeting } from '../services/geminiService';

export const AICopilot = ({ isOpen, onClose, role = 'caregiver', patientName = 'the patient' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-lg h-[85vh] sm:h-[600px] sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Light Green */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-400 to-teal-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">AI Caregiver Assistant</h3>
              <p className="text-xs text-white/80">Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-stone-200' : 'bg-emerald-100'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-stone-600" />
                ) : (
                  <Bot className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-stone-900 text-white rounded-tr-md' 
                  : 'bg-white text-stone-800 rounded-tl-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-stone-100 p-4 bg-white">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 bg-stone-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              data-testid="copilot-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
              data-testid="copilot-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-stone-400 text-center mt-3 font-medium">
            AI assistant for care guidance • Not a substitute for medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

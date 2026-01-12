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
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-lg h-[80vh] sm:h-[600px] sm:rounded-2xl rounded-t-3xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Ask Me</h3>
              <p className="text-xs text-zinc-500">AI Care Assistant</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-zinc-200' : 'bg-zinc-900'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-zinc-600" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-zinc-900 text-white rounded-tr-md' 
                  : 'bg-zinc-100 text-zinc-800 rounded-tl-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-tl-md">
                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-zinc-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 bg-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              data-testid="copilot-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
              data-testid="copilot-send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-2">
            AI assistant for care guidance. Not a substitute for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;

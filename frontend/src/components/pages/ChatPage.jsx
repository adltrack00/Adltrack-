import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Search, Users, Image, CheckCheck } from 'lucide-react';
import { UserRole } from '../../types';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

export const ChatPage = ({ onBack, role }) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [conversationMessages, setConversationMessages] = useState({});
  const [searchText, setSearchText] = useState('');
  const messagesEndRef = useRef(null);

  const isCaregiver = role === UserRole.CAREGIVER;

  const conversations = isCaregiver ? [
    { id: 'poa', name: 'Mary Smith', role: 'POA', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', lastMessage: 'Thank you for the update!', time: '2:30 PM', unread: 0, online: true, isGroup: false },
    { id: 'supervisor', name: 'Sarah Johnson', role: 'Supervisor', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', lastMessage: 'Please submit your timesheet', time: '1:15 PM', unread: 1, online: true, isGroup: false },
    { id: 'weekend', name: 'Michael Chen', role: 'Weekend Caregiver', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', lastMessage: 'Handoff notes are ready', time: 'Yesterday', unread: 0, online: false, isGroup: false },
    { id: 'team', name: 'Care Team Handoff', role: '', avatar: null, lastMessage: 'Weekend schedule updated', time: 'Yesterday', unread: 2, online: false, isGroup: true },
  ] : [
    { id: 'family', name: 'Family Group', role: '', avatar: null, lastMessage: 'Can someone cover Sunday?', time: '10:30 AM', unread: 3, online: false, isGroup: true },
    { id: 'caregiver', name: 'Julia Martinez', role: 'Caregiver', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', lastMessage: 'David had a great morning!', time: '9:32 AM', unread: 0, online: true, isGroup: false },
    { id: 'tom', name: 'Tom Smith', role: 'Brother', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', lastMessage: "I'll bring the puzzle", time: 'Yesterday', unread: 0, online: false, isGroup: false },
  ];

  const getInitialMessages = () => [
    { id: 1, sender: 'other', text: 'Hi! How is everything going with Dad today?', time: '9:30 AM', status: 'read' },
    { id: 2, sender: 'me', text: 'Great! He had a wonderful breakfast and we just finished his morning walk.', time: '9:32 AM', status: 'read' },
    { id: 3, sender: 'other', text: "That's wonderful to hear! Did he take his medication?", time: '9:33 AM', status: 'read' },
    { id: 4, sender: 'me', text: "Yes, all medications given on time. I've uploaded the photo evidence.", time: '9:35 AM', hasImage: true, status: 'read' },
    { id: 5, sender: 'other', text: 'Thank you for the update!', time: '9:36 AM', status: 'read' },
  ];

  useEffect(() => {
    if (activeConversation && !conversationMessages[activeConversation]) {
      setConversationMessages(prev => ({ ...prev, [activeConversation]: getInitialMessages() }));
    }
  }, [activeConversation, conversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, activeConversation]);

  const getCurrentTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const handleSend = () => {
    if (!message.trim() || !activeConversation) return;
    const newMsg = { id: Date.now(), sender: 'me', text: message.trim(), time: getCurrentTime(), status: 'read' };
    setConversationMessages(prev => ({ ...prev, [activeConversation]: [...(prev[activeConversation] || []), newMsg] }));
    setMessage('');
  };

  const filteredConversations = searchText
    ? conversations.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()))
    : conversations;

  // ===== CHAT VIEW =====
  if (activeConversation) {
    const conv = conversations.find(c => c.id === activeConversation);
    const messages_list = conversationMessages[activeConversation] || [];
    const displayName = conv?.role ? `${conv.name} (${conv.role})` : conv?.name;

    return (
      <div className="flex flex-col h-full" style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }} data-testid="chat-view">
        {/* Chat Header */}
        <div className="flex items-center px-5 pt-2 pb-2.5" style={{ borderBottom: `1px solid ${D.bdr}`, background: D.card }}>
          <button onClick={() => setActiveConversation(null)} className="mr-4 p-1" data-testid="chat-back-btn">
            <ArrowLeft className="w-6 h-6" style={{ color: D.h }} />
          </button>
          {conv?.isGroup ? (
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              <Users className="w-6 h-6 text-indigo-500" />
            </div>
          ) : (
            <img src={conv?.avatar} alt={conv?.name} className="w-12 h-12 rounded-full object-cover mr-3" />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold" style={{ color: D.h }}>{displayName}</h2>
            {conv?.online && <p className="text-sm mt-0.5" style={{ color: D.brand }}>Online</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-[140px]">
          {messages_list.map((msg) => (
            <div key={msg.id} className={`mb-3 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-4 py-3"
                style={{
                  background: msg.sender === 'me' ? D.brandGrad : D.card,
                  borderRadius: msg.sender === 'me' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                  border: msg.sender === 'me' ? 'none' : `1px solid ${D.bdr}`,
                  boxShadow: msg.sender === 'me' ? 'none' : D.shadow,
                }}
              >
                {msg.hasImage && (
                  <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-2.5" style={{ background: 'rgba(255,255,255,0.25)' }}>
                    <Image className="w-5 h-5 text-white" />
                    <span className="text-[15px] text-white">Photo attached</span>
                  </div>
                )}
                <p className="text-base leading-[22px]" style={{ color: msg.sender === 'me' ? '#fff' : D.h }}>{msg.text}</p>
                {msg.sender === 'me' ? (
                  <div className="flex items-center justify-end gap-1 mt-1.5">
                    <span className="text-xs text-white/70">{msg.time}</span>
                    <CheckCheck className="w-4 h-4 text-white/70" />
                  </div>
                ) : (
                  <p className="text-xs mt-1.5 text-right" style={{ color: D.muted }}>{msg.time}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className="fixed bottom-[76px] left-0 right-0 px-4 py-2.5 z-20"
          style={{ background: D.card, borderTop: `1px solid ${D.bdr}` }}
        >
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type a message..."
              className="flex-1 px-5 py-3 rounded-full text-base focus:outline-none"
              style={{
                background: D.bg,
                color: D.h,
                border: `2px solid ${inputFocused || message.trim() ? D.brand : D.bdr}`,
                fontSize: '16px',
              }}
              data-testid="chat-input"
            />
            <button
              onClick={handleSend}
              className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: message.trim() ? D.brandGrad : D.bg, border: `1px solid ${message.trim() ? 'transparent' : D.bdr}` }}
              data-testid="chat-send-btn"
            >
              <Send className="w-5 h-5" style={{ color: message.trim() ? '#fff' : D.muted }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== MESSAGES LIST VIEW =====
  return (
    <div className="flex-1 overflow-y-auto pb-20" style={{ background: D.bg }} data-testid="messages-list-view">
      {/* Header */}
      <div className="px-5 pt-3 pb-4">
        <h1 className="text-[28px] font-bold" style={{ color: D.h }}>Messages</h1>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center rounded-2xl px-4 py-3.5"
          style={{ background: D.card, border: `1px solid ${D.bdr}` }}
        >
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: D.muted }} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 ml-3 bg-transparent text-base focus:outline-none"
            style={{ color: D.h, fontSize: '16px' }}
            data-testid="search-conversations"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div>
        {filteredConversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            className="w-full flex items-center px-5 py-4 transition-colors"
            style={{ borderBottom: `1px solid ${D.bdr}` }}
            data-testid={`conversation-${conv.id}`}
          >
            {/* Avatar */}
            <div className="relative mr-3.5 flex-shrink-0">
              {conv.isGroup ? (
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-indigo-500" />
                </div>
              ) : (
                <img src={conv.avatar} alt={conv.name} className="w-14 h-14 rounded-full object-cover" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[18px] font-semibold leading-tight" style={{ color: D.h }}>
                {conv.role ? `${conv.name} (${conv.role})` : conv.name}
              </p>
              <p className="text-[15px] mt-1 truncate" style={{ color: D.muted }}>{conv.lastMessage}</p>
            </div>

            {/* Meta */}
            <div className="flex flex-col items-end ml-3 flex-shrink-0">
              <span className="text-sm mb-1.5" style={{ color: D.muted }}>{conv.time}</span>
              {conv.unread > 0 && (
                <span
                  className="w-6 h-6 text-white text-[13px] font-semibold rounded-full flex items-center justify-center"
                  style={{ background: D.brand }}
                >
                  {conv.unread}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;

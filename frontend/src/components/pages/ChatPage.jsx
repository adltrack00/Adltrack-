import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Search, Users, Image, CheckCheck } from 'lucide-react';
import { UserRole } from '../../types';

export const ChatPage = ({ onBack, role }) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [conversationMessages, setConversationMessages] = useState({});
  const [searchText, setSearchText] = useState('');
  const messagesEndRef = useRef(null);
  
  const isCaregiver = role === UserRole.CAREGIVER;

  const conversations = isCaregiver ? [
    { 
      id: 'poa', 
      name: 'Mary Smith',
      role: 'POA',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      lastMessage: 'Thank you for the update!',
      time: '2:30 PM',
      unread: 0,
      online: true,
      isGroup: false
    },
    { 
      id: 'supervisor', 
      name: 'Sarah Johnson',
      role: 'Supervisor',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      lastMessage: 'Please submit your timesheet',
      time: '1:15 PM',
      unread: 1,
      online: true,
      isGroup: false
    },
    { 
      id: 'weekend', 
      name: 'Michael Chen',
      role: 'Weekend Caregiver',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastMessage: 'Handoff notes are ready',
      time: 'Yesterday',
      unread: 0,
      online: false,
      isGroup: false
    },
    { 
      id: 'team', 
      name: 'Care Team Handoff',
      role: '',
      avatar: null,
      lastMessage: 'Weekend schedule updated',
      time: 'Yesterday',
      unread: 2,
      online: false,
      isGroup: true
    },
  ] : [
    { 
      id: 'family', 
      name: 'Family Group',
      role: '',
      avatar: null,
      lastMessage: 'Can someone cover Sunday?',
      time: '10:30 AM',
      unread: 3,
      online: false,
      isGroup: true
    },
    { 
      id: 'caregiver', 
      name: 'Julia Martinez',
      role: 'Caregiver',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      lastMessage: 'David had a great morning!',
      time: '9:32 AM',
      unread: 0,
      online: true,
      isGroup: false
    },
    { 
      id: 'tom', 
      name: 'Tom Smith',
      role: 'Brother',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      lastMessage: "I'll bring the puzzle",
      time: 'Yesterday',
      unread: 0,
      online: false,
      isGroup: false
    },
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
      setConversationMessages(prev => ({
        ...prev,
        [activeConversation]: getInitialMessages()
      }));
    }
  }, [activeConversation, conversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, activeConversation]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  const handleSend = () => {
    if (!message.trim() || !activeConversation) return;
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: message.trim(),
      time: getCurrentTime(),
      status: 'read'
    };
    setConversationMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMsg]
    }));
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
      <div className="flex flex-col h-full bg-black" data-testid="chat-view">
        {/* Chat Header */}
        <div className="flex items-center px-5 pt-3 pb-4 border-b border-[#3a3a3c]">
          <button 
            onClick={() => setActiveConversation(null)} 
            className="mr-4 p-1"
            data-testid="chat-back-btn"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          {conv?.isGroup ? (
            <div className="w-12 h-12 rounded-full bg-[#7c3aed] flex items-center justify-center mr-3">
              <Users className="w-6 h-6 text-white" />
            </div>
          ) : (
            <img src={conv?.avatar} alt={conv?.name} className="w-12 h-12 rounded-full object-cover mr-3" />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{displayName}</h2>
            {conv?.online && <p className="text-sm text-[#25D366] mt-0.5">Online</p>}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-28">
          {messages_list.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-3 flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-3 ${
                  msg.sender === 'me'
                    ? 'bg-[#25D366] rounded-[20px] rounded-br-[6px]'
                    : 'bg-[#1c1c1e] rounded-[20px] rounded-bl-[6px]'
                }`}
              >
                {msg.hasImage && (
                  <div className="flex items-center gap-2.5 bg-black/20 rounded-xl px-3.5 py-2.5 mb-2.5">
                    <Image className="w-5 h-5 text-white" />
                    <span className="text-[15px] text-white">Photo attached</span>
                  </div>
                )}
                <p className="text-base text-white leading-[22px]">{msg.text}</p>
                {msg.sender === 'me' ? (
                  <div className="flex items-center justify-end gap-1 mt-1.5">
                    <span className="text-xs text-white/70">{msg.time}</span>
                    <CheckCheck className="w-4 h-4 text-white/70" />
                  </div>
                ) : (
                  <p className="text-xs text-[#8e8e93] mt-1.5 text-right">{msg.time}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed above bottom nav */}
        <div className="fixed bottom-[56px] left-0 right-0 border-t border-[#3a3a3c] px-5 py-3 bg-black z-20">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type a message..."
              className={`flex-1 px-5 py-3.5 bg-[#1c1c1e] text-white rounded-3xl text-base focus:outline-none placeholder-[#636366] border-2 transition-colors ${
                inputFocused ? 'border-[#25D366]' : 'border-transparent'
              }`}
              style={{ fontSize: '16px' }}
              data-testid="chat-input"
            />
            <button
              onClick={handleSend}
              className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center flex-shrink-0 transition-colors ${
                message.trim() ? 'bg-[#25D366]' : 'bg-[#1c1c1e]'
              }`}
              data-testid="chat-send-btn"
            >
              <Send className={`w-5 h-5 ${message.trim() ? 'text-white' : 'text-[#636366]'}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== MESSAGES LIST VIEW =====
  return (
    <div className="flex-1 overflow-y-auto bg-black pb-20" data-testid="messages-list-view">
      {/* Header */}
      <div className="flex items-center px-5 pt-3 pb-4">
        <button onClick={onBack} className="mr-4 p-1" data-testid="messages-back-btn">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-[28px] font-bold text-white">Messages</h1>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center bg-[#1c1c1e] rounded-2xl px-4 py-3.5">
          <Search className="w-5 h-5 text-[#636366] flex-shrink-0" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 ml-3 bg-transparent text-white text-base focus:outline-none placeholder-[#636366]"
            style={{ fontSize: '16px' }}
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
            className="w-full flex items-center px-5 py-4 active:bg-[#1c1c1e] transition-colors"
            data-testid={`conversation-${conv.id}`}
          >
            {/* Avatar */}
            <div className="relative mr-3.5 flex-shrink-0">
              {conv.isGroup ? (
                <div className="w-14 h-14 rounded-full bg-[#7c3aed] flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
              ) : (
                <img src={conv.avatar} alt={conv.name} className="w-14 h-14 rounded-full object-cover" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[18px] font-semibold text-white leading-tight">
                {conv.role ? `${conv.name} (${conv.role})` : conv.name}
              </p>
              <p className="text-[15px] text-[#8e8e93] mt-1 truncate">{conv.lastMessage}</p>
            </div>

            {/* Meta */}
            <div className="flex flex-col items-end ml-3 flex-shrink-0">
              <span className="text-sm text-[#8e8e93] mb-1.5">{conv.time}</span>
              {conv.unread > 0 && (
                <span className="w-6 h-6 bg-[#25D366] text-white text-[13px] font-semibold rounded-full flex items-center justify-center">
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

import React, { useState } from 'react';
import { ArrowLeft, Send, Search, Users, User, Image } from 'lucide-react';
import { UserRole } from '../../types';

export const ChatPage = ({ onBack, role }) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  
  const isCaregiver = role === UserRole.CAREGIVER;

  // Different conversations based on role
  const conversations = isCaregiver ? [
    { 
      id: 'poa', 
      name: 'Mary Smith (POA)', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      lastMessage: 'Thank you for the update!',
      time: '2:30 PM',
      unread: 0,
      isGroup: false
    },
    { 
      id: 'supervisor', 
      name: 'Sarah Johnson (Supervisor)', 
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&q=80',
      lastMessage: 'Please submit your timesheet',
      time: '1:15 PM',
      unread: 1,
      isGroup: false
    },
    { 
      id: 'weekend', 
      name: 'Michael Chen (Weekend Caregiver)', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      lastMessage: 'Handoff notes are ready',
      time: 'Yesterday',
      unread: 0,
      isGroup: false
    },
    { 
      id: 'team', 
      name: 'Care Team Handoff', 
      avatar: null,
      lastMessage: 'Weekend schedule updated',
      time: 'Yesterday',
      unread: 2,
      isGroup: true
    },
  ] : [
    { 
      id: 'family', 
      name: 'Family Group', 
      avatar: null,
      lastMessage: 'Can someone cover Sunday?',
      time: '10:30 AM',
      unread: 3,
      isGroup: true
    },
    { 
      id: 'caregiver', 
      name: 'Julia Martinez (Caregiver)', 
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&q=80',
      lastMessage: 'David had a great morning!',
      time: '9:32 AM',
      unread: 0,
      isGroup: false
    },
    { 
      id: 'tom', 
      name: 'Tom Smith (Brother)', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      lastMessage: "I'll bring the puzzle",
      time: 'Yesterday',
      unread: 0,
      isGroup: false
    },
  ];

  const mockMessages = [
    { id: 1, sender: 'other', text: 'Hi! How is everything going with Dad today?', time: '9:30 AM' },
    { id: 2, sender: 'me', text: 'Great! He had a wonderful breakfast and we just finished his morning walk.', time: '9:32 AM' },
    { id: 3, sender: 'other', text: 'That\'s wonderful to hear! Did he take his medication?', time: '9:33 AM' },
    { id: 4, sender: 'me', text: 'Yes, all medications given on time. I\'ve uploaded the photo evidence.', time: '9:35 AM', hasImage: true },
    { id: 5, sender: 'other', text: 'Thank you for the update! 🙏', time: '9:36 AM' },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    // In real app, this would send the message
    setMessage('');
  };

  if (activeConversation) {
    const conv = conversations.find(c => c.id === activeConversation);
    
    return (
      <div className="flex flex-col h-screen bg-white">
        {/* Chat Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-3 flex items-center gap-3 z-10">
          <button onClick={() => setActiveConversation(null)} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-zinc-700" />
          </button>
          {conv?.isGroup ? (
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          ) : (
            <img src={conv?.avatar} alt={conv?.name} className="w-10 h-10 rounded-full object-cover" />
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-zinc-900">{conv?.name}</h2>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.sender === 'me'
                  ? 'bg-zinc-900 text-white rounded-br-md'
                  : 'bg-white text-zinc-900 rounded-bl-md shadow-sm'
              }`}>
                {msg.hasImage && (
                  <div className="mb-2 bg-zinc-200 rounded-lg p-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-zinc-500" />
                    <span className="text-sm text-zinc-600">Photo attached</span>
                  </div>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-100 p-4 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              onClick={handleSend}
              className="px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900">Messages</h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 bg-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="px-4 space-y-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl transition-colors"
          >
            {conv.isGroup ? (
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            ) : (
              <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
            )}
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">{conv.name}</h3>
                <span className="text-xs text-zinc-500">{conv.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500 truncate max-w-[200px]">{conv.lastMessage}</p>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;

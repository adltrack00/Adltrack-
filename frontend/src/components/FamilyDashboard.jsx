import React, { useState } from 'react';
import { 
  Activity, MessageSquare, Bell, Settings, Bot, Heart, Thermometer, 
  ChevronRight, User, Clock, CheckCircle, Camera, Frown, Sparkles, Plus, X
} from 'lucide-react';
import { TaskStatus, UserRole } from '../types';
import { PatientProfileModal } from './PatientProfileModal';
import { VitalsModal } from './VitalsModal';
import { AICopilot } from './AICopilot';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountsPage } from './pages/AccountsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SupportPage } from './pages/SupportPage';
import { ChatPage } from './pages/ChatPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { CaregiverPage } from './pages/CaregiverPage';
import { CARE_IMAGES, CAREGIVER_PROFILE } from '../services/mockData';

export const FamilyDashboard = ({ 
  onBack, 
  onSignOut,
  tasks = [],
  patient,
  vitalsData,
  onAddRequest
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTaskTab, setActiveTaskTab] = useState('timeline');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activePage, setActivePage] = useState(null);
  const [newRequest, setNewRequest] = useState({ title: '', description: '', priority: 'standard' });
  const [myRequests, setMyRequests] = useState([]);

  // Get latest vitals
  const latestBP = vitalsData?.bloodPressure?.[vitalsData.bloodPressure.length - 1];
  const latestHR = vitalsData?.heartRate?.[vitalsData.heartRate.length - 1];
  const latestTemp = vitalsData?.temperature?.[vitalsData.temperature.length - 1];
  const latestPain = vitalsData?.pain?.[vitalsData.pain.length - 1];

  // Filter completed tasks for timeline
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
  const totalTasks = tasks.filter(t => t.status !== TaskStatus.PROPOSED).length;

  // Handle adding a new request
  const handleAddRequest = () => {
    if (newRequest.title.trim()) {
      const request = {
        id: Date.now(),
        ...newRequest,
        status: 'pending',
        createdAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      setMyRequests(prev => [request, ...prev]);
      setNewRequest({ title: '', description: '', priority: 'standard' });
      setShowRequestModal(false);
    }
  };

  // Helper to get task image with AI-generated fallbacks
  const getTaskImage = (task) => {
    if (task.evidenceUrl) return task.evidenceUrl;
    const title = task.title.toLowerCase();
    if (title.includes('medication') || title.includes('med')) return CARE_IMAGES.medication;
    if (title.includes('breakfast') || title.includes('lunch') || title.includes('dinner') || title.includes('meal')) return CARE_IMAGES.meal;
    if (title.includes('walk') || title.includes('exercise')) return CARE_IMAGES.walk;
    return CARE_IMAGES.vitals;
  };

  // Render sub-pages
  if (activePage === 'profile') {
    return <ProfilePage onBack={() => setActivePage(null)} role={UserRole.FAMILY} onSignOut={onSignOut} />;
  }
  if (activePage === 'settings') {
    return <SettingsPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'billing') {
    return <AccountsPage onBack={() => setActivePage(null)} role={UserRole.FAMILY} />;
  }
  if (activePage === 'history') {
    return <HistoryPage onBack={() => setActivePage(null)} role={UserRole.FAMILY} />;
  }
  if (activePage === 'support') {
    return <SupportPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'chat') {
    return <ChatPage onBack={() => setActivePage(null)} role={UserRole.FAMILY} />;
  }
  if (activePage === 'updates') {
    return <UpdatesPage onBack={() => setActivePage(null)} />;
  }
  if (activePage === 'caregiver') {
    return <CaregiverPage onBack={() => setActivePage(null)} />;
  }

  // Render Home Content
  const renderHomeContent = () => (
    <div className="flex-1 overflow-y-auto bg-stone-50 pb-20">
      {/* Vitals Summary - Grid Layout */}
      <div className="px-6 pt-6 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {/* BP */}
          <button 
            onClick={() => setShowVitals(true)}
            className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-base font-bold text-stone-900 text-center">{latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--'}</p>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5 text-center">BP</p>
          </button>

          {/* HR */}
          <button 
            onClick={() => setShowVitals(true)}
            className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Activity className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-base font-bold text-stone-900 text-center">{latestHR ? latestHR.value : '--'}</p>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5 text-center">Heart</p>
          </button>

          {/* Temp */}
          <button 
            onClick={() => setShowVitals(true)}
            className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Thermometer className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-base font-bold text-stone-900 text-center">{latestTemp ? `${latestTemp.value}°` : '--'}</p>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5 text-center">Temp</p>
          </button>

          {/* Pain */}
          <button 
            onClick={() => setShowVitals(true)}
            className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
          >
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-2 mx-auto">
              <Frown className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-base font-bold text-stone-900 text-center">{latestPain ? `${latestPain.value}/10` : '--'}</p>
            <p className="text-[10px] text-stone-400 font-medium mt-0.5 text-center">Pain</p>
          </button>
        </div>
      </div>

      {/* Progress Section - Compact style */}
      <div className="px-6 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-500">Today's Progress</span>
          <span className="text-sm font-bold text-stone-900">{completedTasks.length}/{totalTasks}</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
            style={{ width: totalTasks > 0 ? `${(completedTasks.length / totalTasks) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Task Tabs - Minimal Line Style */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-4">
          {/* My Requests on left */}
          <button
            onClick={() => setActiveTaskTab('requests')}
            className="relative"
          >
            <span className={`text-sm font-semibold transition-colors ${
              activeTaskTab === 'requests'
                ? 'text-stone-900'
                : 'text-stone-400 hover:text-stone-600'
            }`}>
              My Requests
            </span>
            {myRequests.length > 0 && (
              <span className="absolute -top-2 -right-3 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {myRequests.length}
              </span>
            )}
          </button>
          
          {/* Line */}
          <div className="flex-1 h-px bg-stone-200" />
          
          {/* Care Timeline on right */}
          <button
            onClick={() => setActiveTaskTab('timeline')}
            className={`text-sm font-semibold transition-colors ${
              activeTaskTab === 'timeline'
                ? 'text-stone-900'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Care Timeline
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6">
        {activeTaskTab === 'requests' ? (
          /* My Requests Tab */
          <div className="space-y-4">
            {/* Add Request Button */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="w-full p-4 border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center gap-2 text-stone-500 hover:border-rose-300 hover:text-rose-500 transition-colors"
              data-testid="add-request-btn"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Request</span>
            </button>

            {/* Request List */}
            {myRequests.length > 0 ? (
              myRequests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        request.priority === 'urgent' 
                          ? 'bg-rose-100 text-rose-600' 
                          : request.priority === 'high'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {request.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-600'
                          : request.status === 'accepted'
                          ? 'bg-teal-100 text-teal-600'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {request.status === 'pending' ? 'Pending' : 'Accepted'}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400">{request.createdAt}</span>
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-1">{request.title}</h3>
                  {request.description && (
                    <p className="text-sm text-stone-500">{request.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">No requests yet</h3>
                <p className="text-stone-400 text-sm">
                  Tap the button above to request tasks for the caregiver
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Care Timeline Tab */
          <div>
            {completedTasks.length > 0 ? (
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                  >
                    {/* Task Image */}
                    <div className="relative aspect-[16/9]">
                      <img 
                        src={getTaskImage(task)} 
                        alt={task.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Verified Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-emerald-600 text-xs font-semibold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {task.evidenceUrl ? 'Verified' : 'Completed'}
                      </div>

                      {/* Task Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-white font-bold text-lg">{task.title}</h3>
                        <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          Completed at {task.completedAt}
                        </p>
                      </div>
                    </div>

                    {/* Notes & Attribution */}
                    <div className="p-5">
                      {task.completionNote && (
                        <p className="text-stone-600 text-sm mb-4">
                          &quot;{task.completionNote}&quot;
                        </p>
                      )}
                      
                      {/* Caregiver Attribution */}
                      <div className="flex items-center gap-3">
                        <img 
                          src={CAREGIVER_PROFILE.photo}
                          alt="Caregiver"
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-stone-900 text-sm">Julia Martinez</p>
                          <p className="text-stone-400 text-xs">Caregiver</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">No updates yet</h3>
                <p className="text-stone-400 text-sm">
                  Photos and notes will appear here as tasks are completed
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render Settings Content
  const renderSettingsContent = () => (
    <div className="flex-1 overflow-y-auto bg-stone-50 p-6 space-y-3 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div>
            <h3 className="font-bold text-stone-900">Mary Smith</h3>
            <p className="text-stone-500 text-sm">Family Guardian</p>
          </div>
        </div>
        
        {/* Quick Patient Access */}
        <button
          onClick={() => setShowPatientProfile(true)}
          className="w-full flex items-center gap-3 p-3 bg-stone-50 rounded-xl"
        >
          <img 
            src={patient?.photo || 'https://via.placeholder.com/40'} 
            alt={patient?.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div className="flex-1 text-left">
            <p className="font-medium text-stone-900 text-sm">{patient?.name}</p>
            <p className="text-stone-500 text-xs">View Medical Profile</p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* Menu Items */}
      {[
        { label: 'My Profile', icon: User, action: () => setActivePage('profile') },
        { label: 'Current Caregiver', icon: Heart, action: () => setActivePage('caregiver') },
        { label: 'Billing', icon: Activity, action: () => setActivePage('billing') },
        { label: 'Care History', icon: Clock, action: () => setActivePage('history') },
        { label: 'Settings', icon: Settings, action: () => setActivePage('settings') },
        { label: 'Support', icon: Bell, action: () => setActivePage('support') },
      ].map((item, idx) => (
        <button
          key={idx}
          onClick={item.action}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
        >
          <div className="w-11 h-11 bg-stone-100 rounded-xl flex items-center justify-center">
            <item.icon className="w-5 h-5 text-stone-600" />
          </div>
          <span className="font-medium text-stone-900 flex-1 text-left">{item.label}</span>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-['Manrope',sans-serif]">
      {/* Main Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'chat' && <ChatPage onBack={() => setActiveTab('home')} role={UserRole.FAMILY} />}
      {activeTab === 'notifications' && <UpdatesPage onBack={() => setActiveTab('home')} />}
      {activeTab === 'settings' && renderSettingsContent()}

      {/* Floating Copilot Button - Smaller, Light Green */}
      {activeTab === 'home' && (
        <button
          onClick={() => setShowCopilot(true)}
          className="fixed bottom-24 right-5 w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.4)] flex items-center justify-center hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] transition-all hover:scale-105 z-40"
          data-testid="family-copilot-btn"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Bottom Navigation - Fixed to bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 z-30">
        <div className="flex justify-around items-center py-2">
          {[
            { id: 'home', icon: Activity, label: 'Home' },
            { id: 'chat', icon: MessageSquare, label: 'Chat' },
            { id: 'notifications', icon: Bell, label: 'Alerts' },
            { id: 'settings', icon: Settings, label: 'Menu' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 px-5 transition-all ${
                activeTab === tab.id 
                  ? 'text-rose-600' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] font-semibold mt-1 ${activeTab === tab.id ? 'text-rose-600' : 'text-stone-400'}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      <PatientProfileModal
        isOpen={showPatientProfile}
        onClose={() => setShowPatientProfile(false)}
        patient={patient}
      />

      <VitalsModal
        isOpen={showVitals}
        onClose={() => setShowVitals(false)}
        vitalsData={vitalsData}
        isCaregiver={false}
      />

      <AICopilot
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        role="family"
        patientName={patient?.name}
      />

      {/* Add Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-900">New Request</h2>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  What do you need?
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Extra blanket, Call me back"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  data-testid="request-title-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any specific instructions..."
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  data-testid="request-description-input"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {['standard', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewRequest(prev => ({ ...prev, priority }))}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                        newRequest.priority === priority
                          ? priority === 'urgent'
                            ? 'bg-rose-500 text-white'
                            : priority === 'high'
                            ? 'bg-orange-500 text-white'
                            : 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddRequest}
                disabled={!newRequest.title.trim()}
                className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                data-testid="submit-request-btn"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyDashboard;

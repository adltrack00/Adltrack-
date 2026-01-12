import React, { useState } from 'react';
import { X, Plus, Heart, Activity, Thermometer, Frown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export const VitalsModal = ({ 
  isOpen, 
  onClose, 
  vitalsData,
  onAddVital,
  isCaregiver = false 
}) => {
  const [activeTab, setActiveTab] = useState('bp');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVital, setNewVital] = useState({ systolic: '', diastolic: '', heartRate: '', temperature: '', pain: '' });

  if (!isOpen) return null;

  const tabs = [
    { id: 'bp', label: 'Blood Pressure', icon: Heart, color: '#f43f5e', bgColor: 'bg-rose-50' },
    { id: 'hr', label: 'Heart Rate', icon: Activity, color: '#f97316', bgColor: 'bg-orange-50' },
    { id: 'temp', label: 'Temperature', icon: Thermometer, color: '#3b82f6', bgColor: 'bg-blue-50' },
    { id: 'pain', label: 'Pain Level', icon: Frown, color: '#8b5cf6', bgColor: 'bg-purple-50' }
  ];

  const getLatestValue = (type) => {
    if (!vitalsData) return '--';
    switch (type) {
      case 'bp':
        const bp = vitalsData.bloodPressure?.[vitalsData.bloodPressure.length - 1];
        return bp ? `${bp.systolic}/${bp.diastolic}` : '--';
      case 'hr':
        const hr = vitalsData.heartRate?.[vitalsData.heartRate.length - 1];
        return hr ? `${hr.value} bpm` : '--';
      case 'temp':
        const temp = vitalsData.temperature?.[vitalsData.temperature.length - 1];
        return temp ? `${temp.value}°F` : '--';
      case 'pain':
        const pain = vitalsData.pain?.[vitalsData.pain.length - 1];
        return pain ? `${pain.value}/10` : '--';
      default:
        return '--';
    }
  };

  const getChartData = () => {
    if (!vitalsData) return [];
    switch (activeTab) {
      case 'bp': return vitalsData.bloodPressure || [];
      case 'hr': return vitalsData.heartRate || [];
      case 'temp': return vitalsData.temperature || [];
      case 'pain': return vitalsData.pain || [];
      default: return [];
    }
  };

  const handleAddVital = () => {
    if (onAddVital) {
      const vitalEntry = {
        date: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        ...(activeTab === 'bp' && { systolic: parseInt(newVital.systolic), diastolic: parseInt(newVital.diastolic) }),
        ...(activeTab === 'hr' && { value: parseInt(newVital.heartRate) }),
        ...(activeTab === 'temp' && { value: parseFloat(newVital.temperature) }),
        ...(activeTab === 'pain' && { value: parseInt(newVital.pain) })
      };
      onAddVital(activeTab, vitalEntry);
      setNewVital({ systolic: '', diastolic: '', heartRate: '', temperature: '', pain: '' });
      setShowAddForm(false);
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);
  const ActiveIcon = activeTabData?.icon || Heart;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Vital Signs</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-5 pb-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  style={activeTab === tab.id ? { backgroundColor: tab.color } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Value Card */}
        <div className="px-5 py-6">
          <div className={`${activeTabData?.bgColor} rounded-2xl p-5 text-center`}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: activeTabData?.color + '20' }}>
              <ActiveIcon className="w-7 h-7" style={{ color: activeTabData?.color }} />
            </div>
            <p className="text-4xl font-bold text-stone-900">{getLatestValue(activeTab)}</p>
            <p className="text-sm text-stone-500 font-medium mt-1">Current Reading</p>
          </div>
        </div>

        {/* Chart */}
        <div className="px-5 pb-4">
          <div className="bg-stone-50 rounded-2xl p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'bp' ? (
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e" domain={[60, 160]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, fill: '#f43f5e' }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4, fill: '#f97316' }} />
                </LineChart>
              ) : (
                <AreaChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} stroke="#a8a29e" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={activeTabData?.color} 
                    fill={`${activeTabData?.color}20`}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-stone-400 text-center mt-2 font-medium">Weekly trend</p>
        </div>

        {/* Add Vital Form (Caregiver Only) */}
        {isCaregiver && (
          <div className="px-5 pb-4">
            {showAddForm ? (
              <div className="bg-stone-50 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-bold text-stone-700">Log New Reading</p>
                
                {activeTab === 'bp' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={newVital.systolic}
                      onChange={(e) => setNewVital({...newVital, systolic: e.target.value})}
                      className="flex-1 px-4 py-3 bg-white border-0 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={newVital.diastolic}
                      onChange={(e) => setNewVital({...newVital, diastolic: e.target.value})}
                      className="flex-1 px-4 py-3 bg-white border-0 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                )}
                
                {activeTab === 'hr' && (
                  <input
                    type="number"
                    placeholder="Heart Rate (BPM)"
                    value={newVital.heartRate}
                    onChange={(e) => setNewVital({...newVital, heartRate: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                )}
                
                {activeTab === 'temp' && (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Temperature (°F)"
                    value={newVital.temperature}
                    onChange={(e) => setNewVital({...newVital, temperature: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                )}
                
                {activeTab === 'pain' && (
                  <input
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Pain Level (0-10)"
                    value={newVital.pain}
                    onChange={(e) => setNewVital({...newVital, pain: e.target.value})}
                    className="w-full px-4 py-3 bg-white border-0 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddVital}
                    className="flex-1 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3.5 border-2 border-dashed border-stone-300 rounded-2xl text-stone-500 font-bold hover:border-stone-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log New Reading
              </button>
            )}
          </div>
        )}

        {/* History */}
        <div className="px-5 pb-6">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Recent History</p>
          <div className="bg-stone-50 rounded-2xl overflow-hidden">
            {getChartData().slice(-5).reverse().map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 px-4 border-b border-stone-100 last:border-0">
                <span className="text-sm text-stone-500 font-medium">{entry.date} at {entry.time}</span>
                <span className="text-sm font-bold text-stone-900">
                  {activeTab === 'bp' ? `${entry.systolic}/${entry.diastolic}` : entry.value}
                  {activeTab === 'temp' && '°F'}
                  {activeTab === 'pain' && '/10'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsModal;

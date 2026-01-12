import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, Camera, Plus } from 'lucide-react';
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
    { id: 'bp', label: 'BP', color: '#ef4444' },
    { id: 'hr', label: 'HR', color: '#f97316' },
    { id: 'temp', label: 'Temp', color: '#3b82f6' },
    { id: 'pain', label: 'Pain', color: '#8b5cf6' }
  ];

  const getLatestValue = (type) => {
    if (!vitalsData) return '--';
    switch (type) {
      case 'bp':
        const bp = vitalsData.bloodPressure?.[vitalsData.bloodPressure.length - 1];
        return bp ? `${bp.systolic}/${bp.diastolic}` : '--';
      case 'hr':
        const hr = vitalsData.heartRate?.[vitalsData.heartRate.length - 1];
        return hr ? `${hr.value}` : '--';
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
      case 'bp':
        return vitalsData.bloodPressure || [];
      case 'hr':
        return vitalsData.heartRate || [];
      case 'temp':
        return vitalsData.temperature || [];
      case 'pain':
        return vitalsData.pain || [];
      default:
        return [];
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Vital Signs</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
                style={activeTab === tab.id ? { backgroundColor: tab.color } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Value */}
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Reading</p>
          <p className="text-4xl font-bold text-zinc-900">{getLatestValue(activeTab)}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {vitalsData?.[activeTab === 'bp' ? 'bloodPressure' : activeTab === 'hr' ? 'heartRate' : activeTab === 'temp' ? 'temperature' : 'pain']?.[0]?.time || 'No data'}
          </p>
        </div>

        {/* Chart */}
        <div className="px-4 pb-4">
          <div className="bg-zinc-50 rounded-xl p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'bp' ? (
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={[60, 160]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              ) : (
                <AreaChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={activeTabData?.color} 
                    fill={`${activeTabData?.color}20`}
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-zinc-400 text-center mt-2">Weekly trend</p>
        </div>

        {/* Add Vital Form (Caregiver Only) */}
        {isCaregiver && (
          <div className="px-4 pb-4">
            {showAddForm ? (
              <div className="bg-zinc-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-zinc-700">Log New Reading</p>
                
                {activeTab === 'bp' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Systolic"
                      value={newVital.systolic}
                      onChange={(e) => setNewVital({...newVital, systolic: e.target.value})}
                      className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Diastolic"
                      value={newVital.diastolic}
                      onChange={(e) => setNewVital({...newVital, diastolic: e.target.value})}
                      className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                    />
                  </div>
                )}
                
                {activeTab === 'hr' && (
                  <input
                    type="number"
                    placeholder="Heart Rate (BPM)"
                    value={newVital.heartRate}
                    onChange={(e) => setNewVital({...newVital, heartRate: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                  />
                )}
                
                {activeTab === 'temp' && (
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Temperature (°F)"
                    value={newVital.temperature}
                    onChange={(e) => setNewVital({...newVital, temperature: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
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
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm"
                  />
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddVital}
                    className="flex-1 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-600 font-medium hover:border-zinc-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log New Reading
              </button>
            )}
          </div>
        )}

        {/* History */}
        <div className="px-4 pb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Recent History</p>
          <div className="space-y-2">
            {getChartData().slice(-5).reverse().map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                <span className="text-sm text-zinc-600">{entry.date} at {entry.time}</span>
                <span className="text-sm font-medium text-zinc-900">
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

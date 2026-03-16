import React, { useState } from 'react';
import { X, Plus, Heart, Activity, Thermometer, Frown } from 'lucide-react';

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

  // Define unique themes for each vital type
  const vitalThemes = {
    bp: {
      id: 'bp',
      label: 'Blood Pressure',
      icon: Heart,
      primaryColor: '#e91e7a',
      bgColor: '#5c1a3d',
      gradientFrom: '#5c1a3d',
      graphColor: '#e91e7a',
      secondaryGraphColor: '#f97316',
      unit: 'mmHg',
      yAxisDomain: [60, 160],
    },
    hr: {
      id: 'hr',
      label: 'Heart Rate',
      icon: Activity,
      primaryColor: '#f97316',
      bgColor: '#6b3410',
      gradientFrom: '#6b3410',
      graphColor: '#f97316',
      unit: 'bpm',
      yAxisDomain: [50, 120],
    },
    temp: {
      id: 'temp',
      label: 'Temperature',
      icon: Thermometer,
      primaryColor: '#3b82f6',
      bgColor: '#1a3a5c',
      gradientFrom: '#1a3a5c',
      graphColor: '#3b82f6',
      unit: '°F',
      yAxisDomain: [96, 102],
    },
    pain: {
      id: 'pain',
      label: 'Pain Level',
      icon: Frown,
      primaryColor: '#8b5cf6',
      bgColor: '#3d1a5c',
      gradientFrom: '#3d1a5c',
      graphColor: '#8b5cf6',
      unit: '/10',
      yAxisDomain: [0, 10],
    }
  };

  const theme = vitalThemes[activeTab];
  const ActiveIcon = theme.icon;

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

  const chartData = getChartData();

  // Custom Dot Chart for Pain (matching mobile design)
  const renderDotChart = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxValue = 10;
    const dotSize = 10;
    const chartWidth = 280;
    const chartHeight = 110;

    return (
      <div className="relative h-36 w-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-stone-500 font-medium w-8">
          <span>10</span>
          <span>7.5</span>
          <span>5</span>
          <span>2.5</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-10 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-6">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div key={i} className="border-b border-dashed border-stone-800 w-full" />
            ))}
          </div>
          
          {/* Dots and connecting line */}
          <svg className="absolute inset-0 w-full h-[calc(100%-24px)]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            {/* Connecting line */}
            <polyline
              fill="none"
              stroke={theme.primaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * chartWidth;
                const y = chartHeight - ((d.value / maxValue) * chartHeight);
                return `${x},${y}`;
              }).join(' ')}
            />
            {/* Dots */}
            {chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * chartWidth;
              const y = chartHeight - ((d.value / maxValue) * chartHeight);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={dotSize / 2}
                  fill={theme.primaryColor}
                />
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-stone-500 font-medium">
            {days.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Line Chart for BP, HR, Temp
  const renderLineChart = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const [minVal, maxVal] = theme.yAxisDomain;
    const range = maxVal - minVal;
    const yLabels = [maxVal, maxVal - range * 0.25, maxVal - range * 0.5, maxVal - range * 0.75, minVal];
    const chartWidth = 280;
    const chartHeight = 110;

    return (
      <div className="relative h-36 w-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-stone-500 font-medium w-8">
          {yLabels.map((v, i) => (
            <span key={i}>{Math.round(v)}</span>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="ml-10 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-6">
            {[0, 1, 2, 3, 4].map((_, i) => (
              <div key={i} className="border-b border-dashed border-stone-800 w-full" />
            ))}
          </div>
          
          {/* Lines and dots */}
          <svg className="absolute inset-0 w-full h-[calc(100%-24px)]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            {activeTab === 'bp' ? (
              <>
                {/* Systolic line */}
                <polyline
                  fill="none"
                  stroke={theme.graphColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * chartWidth;
                    const y = chartHeight - (((d.systolic - minVal) / range) * chartHeight);
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Systolic dots */}
                {chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * chartWidth;
                  const y = chartHeight - (((d.systolic - minVal) / range) * chartHeight);
                  return (
                    <circle key={`sys-${i}`} cx={x} cy={y} r="5" fill={theme.graphColor} />
                  );
                })}
                {/* Diastolic line */}
                <polyline
                  fill="none"
                  stroke={theme.secondaryGraphColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * chartWidth;
                    const y = chartHeight - (((d.diastolic - minVal) / range) * chartHeight);
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Diastolic dots */}
                {chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * chartWidth;
                  const y = chartHeight - (((d.diastolic - minVal) / range) * chartHeight);
                  return (
                    <circle key={`dia-${i}`} cx={x} cy={y} r="5" fill={theme.secondaryGraphColor} />
                  );
                })}
              </>
            ) : (
              <>
                {/* Single line for HR, Temp */}
                <polyline
                  fill="none"
                  stroke={theme.graphColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * chartWidth;
                    const y = chartHeight - (((d.value - minVal) / range) * chartHeight);
                    return `${x},${y}`;
                  }).join(' ')}
                />
                {/* Dots */}
                {chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * chartWidth;
                  const y = chartHeight - (((d.value - minVal) / range) * chartHeight);
                  return (
                    <circle key={i} cx={x} cy={y} r="5" fill={theme.graphColor} />
                  );
                })}
              </>
            )}
          </svg>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-stone-500 font-medium">
            {days.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" onClick={onClose}>
      <div 
        className="bg-black w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Vital Signs</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-900 rounded-xl transition-colors"
            data-testid="vitals-close-btn"
          >
            <X className="w-6 h-6 text-stone-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-8">
          {/* Tabs - Horizontal scrollable */}
          <div className="px-6 pb-5 overflow-x-auto">
            <div className="flex gap-3 min-w-max">
              {Object.values(vitalThemes).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-base transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'bg-[#1c1c1e] text-stone-400 hover:bg-[#2c2c2e] hover:text-stone-300'
                    }`}
                    style={isActive ? { backgroundColor: tab.primaryColor } : {}}
                    data-testid={`vital-tab-${tab.id}`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Value Card - Themed */}
          <div className="px-6 pb-6">
            <div 
              className="rounded-3xl p-6 text-center"
              style={{ backgroundColor: theme.bgColor }}
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${theme.primaryColor}40` }}
              >
                <ActiveIcon className="w-8 h-8" style={{ color: theme.primaryColor }} />
              </div>
              <p className="text-5xl font-bold text-white tracking-tight">{getLatestValue(activeTab)}</p>
              <p className="text-base text-stone-300 font-semibold mt-2">Current Reading</p>
            </div>
          </div>

          {/* Chart */}
          <div className="px-6 pb-5">
            <div className="bg-[#1c1c1e] rounded-3xl p-5">
              {activeTab === 'pain' ? renderDotChart() : renderLineChart()}
            </div>
            <p className="text-sm text-stone-500 text-center mt-3 font-semibold">Weekly trend</p>
          </div>

          {/* Add Vital Form (Caregiver Only) */}
          {isCaregiver && (
            <div className="px-6 pb-5">
              {showAddForm ? (
                <div className="bg-[#1c1c1e] rounded-3xl p-5 space-y-4">
                  <p className="text-base font-bold text-white">Log New Reading</p>
                  
                  {activeTab === 'bp' && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Systolic"
                          value={newVital.systolic}
                          onChange={(e) => setNewVital({...newVital, systolic: e.target.value})}
                          className="w-full px-4 py-4 bg-stone-900 border border-stone-800 rounded-2xl text-lg font-semibold text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          style={{ fontSize: '16px' }}
                          data-testid="vital-systolic"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Diastolic"
                          value={newVital.diastolic}
                          onChange={(e) => setNewVital({...newVital, diastolic: e.target.value})}
                          className="w-full px-4 py-4 bg-stone-900 border border-stone-800 rounded-2xl text-lg font-semibold text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          style={{ fontSize: '16px' }}
                          data-testid="vital-diastolic"
                        />
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'hr' && (
                    <input
                      type="number"
                      placeholder="Heart Rate (BPM)"
                      value={newVital.heartRate}
                      onChange={(e) => setNewVital({...newVital, heartRate: e.target.value})}
                      className="w-full px-4 py-4 bg-stone-900 border border-stone-800 rounded-2xl text-lg font-semibold text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{ fontSize: '16px' }}
                      data-testid="vital-heartrate"
                    />
                  )}
                  
                  {activeTab === 'temp' && (
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Temperature (°F)"
                      value={newVital.temperature}
                      onChange={(e) => setNewVital({...newVital, temperature: e.target.value})}
                      className="w-full px-4 py-4 bg-stone-900 border border-stone-800 rounded-2xl text-lg font-semibold text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{ fontSize: '16px' }}
                      data-testid="vital-temperature"
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
                      className="w-full px-4 py-4 bg-stone-900 border border-stone-800 rounded-2xl text-lg font-semibold text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      style={{ fontSize: '16px' }}
                      data-testid="vital-pain"
                    />
                  )}

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-4 border-2 border-stone-700 rounded-2xl text-base font-bold text-stone-400 hover:bg-stone-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddVital}
                      className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl text-base font-bold hover:bg-[#20bd5a] transition-colors"
                      data-testid="vital-save-btn"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-4 border-2 border-dashed border-stone-700 rounded-3xl text-stone-400 font-bold text-base hover:border-stone-600 hover:text-stone-300 transition-colors flex items-center justify-center gap-3"
                  data-testid="log-new-reading-btn"
                >
                  <Plus className="w-6 h-6" />
                  Log New Reading
                </button>
              )}
            </div>
          )}

          {/* History */}
          <div className="px-6">
            <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">Recent History</p>
            <div className="bg-[#1c1c1e] rounded-3xl overflow-hidden">
              {chartData.slice(-5).reverse().map((entry, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between py-4 px-5 border-b border-stone-800 last:border-0"
                >
                  <span className="text-base text-white font-semibold">{entry.date} at {entry.time}</span>
                  <span className="text-lg font-bold" style={{ color: theme.primaryColor }}>
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
    </div>
  );
};

export default VitalsModal;

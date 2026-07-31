import React, { useState, useEffect } from 'react';
import { X, Plus, Heart, Activity, Thermometer, Frown } from 'lucide-react';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
  shadowMd: '0 10px 30px -10px rgba(0,0,0,0.10)',
};

export const VitalsModal = ({
  isOpen,
  onClose,
  vitalsData,
  onAddVital,
  isCaregiver = false,
  initialTab = 'bp'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVital, setNewVital] = useState({ systolic: '', diastolic: '', heartRate: '', temperature: '', pain: '' });

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const vitalThemes = {
    bp:   { id: 'bp',   label: 'Blood Pressure', icon: Heart,        primaryColor: '#be185d', bgColor: 'radial-gradient(circle at 50% 0%,rgba(244,114,182,0.28) 0%,rgba(252,231,243,0.14) 52%,#F4F8F9 88%)', graphColor: '#e91e7a', secondaryGraphColor: '#f97316', unit: 'mmHg', yAxisDomain: [60, 160] },
    hr:   { id: 'hr',   label: 'Heart Rate',      icon: Activity,     primaryColor: '#c2410c', bgColor: 'radial-gradient(circle at 50% 0%,rgba(251,146,60,0.28)  0%,rgba(255,237,213,0.14) 52%,#F4F8F9 88%)',  graphColor: '#f97316', unit: 'bpm',  yAxisDomain: [50, 120] },
    temp: { id: 'temp', label: 'Temperature',     icon: Thermometer,  primaryColor: '#1d4ed8', bgColor: 'radial-gradient(circle at 50% 0%,rgba(96,165,250,0.28)   0%,rgba(219,234,254,0.14) 52%,#F4F8F9 88%)',  graphColor: '#3b82f6', unit: '°F',   yAxisDomain: [96, 102] },
    pain: { id: 'pain', label: 'Pain Level',      icon: Frown,        primaryColor: '#7c3aed', bgColor: 'radial-gradient(circle at 50% 0%,rgba(167,139,250,0.28)  0%,rgba(237,233,254,0.14) 52%,#F4F8F9 88%)', graphColor: '#8b5cf6', unit: '/10',  yAxisDomain: [0, 10] },
  };

  const theme = vitalThemes[activeTab];
  const ActiveIcon = theme.icon;

  const getLatestValue = (type) => {
    if (!vitalsData) return '--';
    switch (type) {
      case 'bp': { const bp = vitalsData.bloodPressure?.[vitalsData.bloodPressure.length - 1]; return bp ? `${bp.systolic}/${bp.diastolic}` : '--'; }
      case 'hr': { const hr = vitalsData.heartRate?.[vitalsData.heartRate.length - 1]; return hr ? `${hr.value}` : '--'; }
      case 'temp': { const temp = vitalsData.temperature?.[vitalsData.temperature.length - 1]; return temp ? `${temp.value}°F` : '--'; }
      case 'pain': { const pain = vitalsData.pain?.[vitalsData.pain.length - 1]; return pain ? `${pain.value}/10` : '--'; }
      default: return '--';
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
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartWidth = 280;
  const chartHeight = 110;

  const renderDotChart = () => {
    const maxValue = 10;
    return (
      <div className="relative h-36 w-full">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-medium w-8" style={{ color: D.muted }}>
          <span>10</span><span>7.5</span><span>5</span><span>2.5</span><span>0</span>
        </div>
        <div className="ml-10 h-full relative">
          <div className="absolute inset-0 flex flex-col justify-between pb-6">
            {[0,1,2,3,4].map((_, i) => <div key={i} className="border-b border-dashed" style={{ borderColor: D.bdr }} />)}
          </div>
          <svg className="absolute inset-0 w-full h-[calc(100%-24px)]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <polyline fill="none" stroke={theme.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              points={chartData.map((d, i) => { const x = (i/(chartData.length-1))*chartWidth; const y = chartHeight-((d.value/maxValue)*chartHeight); return `${x},${y}`; }).join(' ')} />
            {chartData.map((d, i) => { const x = (i/(chartData.length-1))*chartWidth; const y = chartHeight-((d.value/maxValue)*chartHeight); return <circle key={i} cx={x} cy={y} r="5" fill={theme.primaryColor} />; })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-medium" style={{ color: D.muted }}>
            {days.map(day => <span key={day}>{day}</span>)}
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const [minVal, maxVal] = theme.yAxisDomain;
    const range = maxVal - minVal;
    const yLabels = [maxVal, maxVal-range*0.25, maxVal-range*0.5, maxVal-range*0.75, minVal];
    return (
      <div className="relative h-36 w-full">
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs font-medium w-8" style={{ color: D.muted }}>
          {yLabels.map((v, i) => <span key={i}>{Math.round(v)}</span>)}
        </div>
        <div className="ml-10 h-full relative">
          <div className="absolute inset-0 flex flex-col justify-between pb-6">
            {[0,1,2,3,4].map((_, i) => <div key={i} className="border-b border-dashed" style={{ borderColor: D.bdr }} />)}
          </div>
          <svg className="absolute inset-0 w-full h-[calc(100%-24px)]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            {activeTab === 'bp' ? (
              <>
                <polyline fill="none" stroke={theme.graphColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points={chartData.map((d,i)=>{const x=(i/(chartData.length-1))*chartWidth;const y=chartHeight-(((d.systolic-minVal)/range)*chartHeight);return `${x},${y}`;}).join(' ')} />
                {chartData.map((d,i)=>{const x=(i/(chartData.length-1))*chartWidth;const y=chartHeight-(((d.systolic-minVal)/range)*chartHeight);return <circle key={`sys-${i}`} cx={x} cy={y} r="5" fill={theme.graphColor} />;} )}
                <polyline fill="none" stroke={theme.secondaryGraphColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points={chartData.map((d,i)=>{const x=(i/(chartData.length-1))*chartWidth;const y=chartHeight-(((d.diastolic-minVal)/range)*chartHeight);return `${x},${y}`;}).join(' ')} />
                {chartData.map((d,i)=>{const x=(i/(chartData.length-1))*chartWidth;const y=chartHeight-(((d.diastolic-minVal)/range)*chartHeight);return <circle key={`dia-${i}`} cx={x} cy={y} r="5" fill={theme.secondaryGraphColor} />;} )}
              </>
            ) : (
              <>
                <polyline fill="none" stroke={theme.graphColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  points={chartData.map((d,i)=>{const x=(i/(chartData.length-1))*chartWidth;const y=chartHeight-(((d.value-minVal)/range)*chartHeight);return `${x},${y}`;}).join(' ')} />
                {chartData.map((d,i)=>{const x=(i/(chartData.length-1))*chartWidth;const y=chartHeight-(((d.value-minVal)/range)*chartHeight);return <circle key={i} cx={x} cy={y} r="5" fill={theme.graphColor} />;} )}
              </>
            )}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-medium" style={{ color: D.muted }}>
            {days.map(day => <span key={day}>{day}</span>)}
          </div>
        </div>
      </div>
    );
  };

  const inputClass = "w-full px-4 py-4 rounded-2xl text-lg font-semibold focus:outline-none";
  const inputStyle = { background: D.bg, color: D.h, border: `1px solid ${D.bdr}`, fontSize: '16px' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-['Manrope',sans-serif]"
      style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] flex flex-col"
        style={{ background: D.card, boxShadow: '0 -8px 40px rgba(0,0,0,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: D.h }}>{vitalThemes[activeTab]?.label || 'Vital Signs'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors" style={{ background: D.bg, border: `1px solid ${D.bdr}` }} data-testid="vitals-close-btn">
            <X className="w-6 h-6" style={{ color: D.body }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-8">
          {/* Current Value Card - keeps themed dark bg */}
          <div className="px-6 py-6">
            <div className="rounded-3xl p-6 text-center" style={{ background: theme.bgColor, border: `1px solid ${D.bdr}` }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${theme.primaryColor}22`, border: `1px solid ${theme.primaryColor}44` }}>
                <ActiveIcon className="w-8 h-8" style={{ color: theme.primaryColor }} />
              </div>
              <p className="text-5xl font-bold tracking-tight" style={{ color: D.h }}>{getLatestValue(activeTab)}</p>
              <p className="text-base font-semibold mt-2" style={{ color: D.muted }}>Current Reading</p>
            </div>
          </div>

          {/* Chart */}
          <div className="px-6 pb-5">
            <div className="rounded-3xl p-5" style={{ background: D.bg, border: `1px solid ${D.bdr}` }}>
              {activeTab === 'pain' ? renderDotChart() : renderLineChart()}
            </div>
            <p className="text-sm text-center mt-3 font-semibold" style={{ color: D.muted }}>Weekly trend</p>
          </div>

          {/* Add Vital Form (Caregiver Only) */}
          {isCaregiver && (
            <div className="px-6 pb-5">
              {showAddForm ? (
                <div className="rounded-3xl p-5 space-y-4" style={{ background: D.bg, border: `1px solid ${D.bdr}` }}>
                  <p className="text-base font-bold" style={{ color: D.h }}>Log New Reading</p>
                  {activeTab === 'bp' && (
                    <div className="flex gap-4">
                      <input type="number" placeholder="Systolic" value={newVital.systolic} onChange={(e) => setNewVital({...newVital, systolic: e.target.value})} className={inputClass} style={inputStyle} data-testid="vital-systolic" />
                      <input type="number" placeholder="Diastolic" value={newVital.diastolic} onChange={(e) => setNewVital({...newVital, diastolic: e.target.value})} className={inputClass} style={inputStyle} data-testid="vital-diastolic" />
                    </div>
                  )}
                  {activeTab === 'hr' && (
                    <input type="number" placeholder="Heart Rate (BPM)" value={newVital.heartRate} onChange={(e) => setNewVital({...newVital, heartRate: e.target.value})} className={inputClass} style={inputStyle} data-testid="vital-heartrate" />
                  )}
                  {activeTab === 'temp' && (
                    <input type="number" step="0.1" placeholder="Temperature (°F)" value={newVital.temperature} onChange={(e) => setNewVital({...newVital, temperature: e.target.value})} className={inputClass} style={inputStyle} data-testid="vital-temperature" />
                  )}
                  {activeTab === 'pain' && (
                    <input type="number" min="0" max="10" placeholder="Pain Level (0-10)" value={newVital.pain} onChange={(e) => setNewVital({...newVital, pain: e.target.value})} className={inputClass} style={inputStyle} data-testid="vital-pain" />
                  )}
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setShowAddForm(false)} className="flex-1 py-4 rounded-2xl text-base font-bold transition-colors" style={{ border: `1px solid ${D.bdr}`, color: D.body }}>
                      Cancel
                    </button>
                    <button onClick={handleAddVital} className="flex-1 py-4 text-white rounded-2xl text-base font-bold transition-colors" style={{ background: D.brandGrad, boxShadow: '0 4px 16px rgba(255,179,71,0.28)' }} data-testid="vital-save-btn">
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-4 rounded-3xl text-base font-bold flex items-center justify-center gap-3 transition-colors"
                  style={{ border: `2px dashed ${D.bdr}`, color: D.body }}
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
            <p className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: D.muted }}>Recent History</p>
            <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${D.bdr}` }}>
              {chartData.slice(-5).reverse().map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-4 px-5"
                  style={{ borderBottom: idx < 4 ? `1px solid ${D.bdr}` : 'none', background: D.card }}
                >
                  <span className="text-base font-semibold" style={{ color: D.h }}>{entry.date} at {entry.time}</span>
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

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const SHIFTS = [
  { date: 'Dec 15, 2024', hours: '8:00 AM - 4:00 PM', status: 'completed', tasks: 12, completed: 12 },
  { date: 'Dec 14, 2024', hours: '8:00 AM - 4:00 PM', status: 'completed', tasks: 10, completed: 10 },
  { date: 'Dec 13, 2024', hours: '8:00 AM - 12:00 PM', status: 'completed', tasks: 6, completed: 5 },
  { date: 'Dec 12, 2024', hours: '12:00 PM - 8:00 PM', status: 'completed', tasks: 8, completed: 8 },
  { date: 'Dec 11, 2024', hours: '8:00 AM - 4:00 PM', status: 'cancelled', tasks: 0, completed: 0 },
];

export const HistoryPage = ({ onBack }) => {
  const [filter, setFilter] = useState('all');

  const filteredShifts = filter === 'all'
    ? SHIFTS
    : SHIFTS.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-black font-['Manrope',sans-serif]" data-testid="shift-history-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={onBack} className="mr-4 p-1" data-testid="history-back-btn">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Shift History</h1>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pb-4 flex gap-3">
        {['all', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-full text-[15px] font-semibold transition-colors ${
              filter === f
                ? 'bg-[#25D366] text-white'
                : 'bg-[#2c2c2e] text-[#8e8e93]'
            }`}
            data-testid={`filter-${f}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Shift Cards */}
      <div className="px-5 space-y-4 pb-24">
        {filteredShifts.map((shift, idx) => (
          <div
            key={idx}
            className={`bg-[#1c1c1e] rounded-2xl p-5 border ${
              shift.status === 'completed'
                ? 'border-[#25D366]/50'
                : 'border-[#636366]/50'
            }`}
            data-testid={`shift-card-${idx}`}
          >
            {/* Date + Status Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#8e8e93]" />
                <span className="text-[19px] font-bold text-white">{shift.date}</span>
              </div>
              {shift.status === 'completed' ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-[#25D366]/15 text-[#25D366]">
                  <CheckCircle className="w-4 h-4" fill="#25D366" stroke="#1c1c1e" strokeWidth={2} />
                  Completed
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-white/10 text-[#8e8e93]">
                  <XCircle className="w-4 h-4" />
                  Cancelled
                </span>
              )}
            </div>

            {/* Time + Tasks Row */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8e8e93]" />
                <span className="text-[14px] text-[#8e8e93]">{shift.hours}</span>
              </div>
              {shift.status === 'completed' && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#25D366]" fill="#25D366" stroke="#1c1c1e" strokeWidth={2} />
                  <span className="text-[14px] text-[#8e8e93]">{shift.completed}/{shift.tasks} tasks</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredShifts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#8e8e93] text-[16px]">No shifts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

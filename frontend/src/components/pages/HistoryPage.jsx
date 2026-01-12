import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { UserRole } from '../../types';

export const HistoryPage = ({ onBack, role }) => {
  const [filter, setFilter] = useState('all');
  const isCaregiver = role === UserRole.CAREGIVER;

  const shifts = [
    { date: 'Dec 15, 2024', hours: '8:00 AM - 4:00 PM', status: 'completed', tasks: 12, completed: 12 },
    { date: 'Dec 14, 2024', hours: '8:00 AM - 4:00 PM', status: 'completed', tasks: 10, completed: 10 },
    { date: 'Dec 13, 2024', hours: '8:00 AM - 12:00 PM', status: 'completed', tasks: 6, completed: 5 },
    { date: 'Dec 12, 2024', hours: '12:00 PM - 8:00 PM', status: 'completed', tasks: 8, completed: 8 },
    { date: 'Dec 11, 2024', hours: '8:00 AM - 4:00 PM', status: 'cancelled', tasks: 0, completed: 0 },
  ];

  const filteredShifts = filter === 'all' 
    ? shifts 
    : shifts.filter(s => s.status === filter);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900">
          {isCaregiver ? 'Shift History' : 'Care History'}
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-zinc-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredShifts.map((shift, idx) => (
          <div 
            key={idx}
            className={`p-4 rounded-xl border ${
              shift.status === 'completed' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="font-semibold text-zinc-900">{shift.date}</span>
              </div>
              {shift.status === 'completed' ? (
                <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-200 px-2 py-1 rounded-full">
                  <XCircle className="w-3 h-3" /> Cancelled
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-zinc-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {shift.hours}
              </div>
              {shift.status === 'completed' && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {shift.completed}/{shift.tasks} tasks
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredShifts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No shifts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

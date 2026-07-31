import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

const SHIFTS = [
  { date: 'Dec 15, 2024', hours: '8:00 AM – 4:00 PM', status: 'completed', tasks: 12, completed: 12 },
  { date: 'Dec 14, 2024', hours: '8:00 AM – 4:00 PM', status: 'completed', tasks: 10, completed: 10 },
  { date: 'Dec 13, 2024', hours: '8:00 AM – 12:00 PM', status: 'completed', tasks: 6,  completed: 5  },
  { date: 'Dec 12, 2024', hours: '12:00 PM – 8:00 PM', status: 'completed', tasks: 8,  completed: 8  },
  { date: 'Dec 11, 2024', hours: '8:00 AM – 4:00 PM',  status: 'cancelled', tasks: 0,  completed: 0  },
];

export const HistoryPage = ({ onBack }) => {
  const [filter, setFilter] = useState('all');
  const filteredShifts = filter === 'all' ? SHIFTS : SHIFTS.filter(s => s.status === filter);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }} data-testid="shift-history-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-3" style={{ background: D.card, borderBottom: `1px solid ${D.bdr}` }}>
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-xl transition-all"
          style={{ background: D.bg, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
          data-testid="history-back-btn"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: D.h }} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: D.h }}>Shift History</h1>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: D.bdr }}>
          {['all', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: filter === f ? D.card : 'transparent',
                color: filter === f ? D.h : D.muted,
                border: filter === f ? `1px solid ${D.bdr}` : '1px solid transparent',
                boxShadow: filter === f ? D.shadow : 'none',
              }}
              data-testid={`filter-${f}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Cards */}
      <div className="px-5 space-y-3 pb-24">
        {filteredShifts.map((shift, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-5"
            style={{
              background: shift.status === 'completed' ? 'rgba(255,179,71,0.05)' : D.card,
              border: `1px solid ${shift.status === 'completed' ? 'rgba(255,179,71,0.30)' : D.bdr}`,
              boxShadow: D.shadow,
            }}
            data-testid={`shift-card-${idx}`}
          >
            {/* Left amber stripe for completed */}
            <div className="flex items-start gap-3">
              {shift.status === 'completed' && (
                <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 4, background: 'linear-gradient(180deg,#FFB347,#F28482)', flexShrink: 0 }} />
              )}
              <div className="flex-1">
                {/* Date + Status Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: D.muted }} />
                    <span className="text-[17px] font-semibold" style={{ color: D.h }}>{shift.date}</span>
                  </div>
                  {shift.status === 'completed' ? (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                      style={{ background: 'rgba(255,179,71,0.12)', color: D.brand, border: '1px solid rgba(255,179,71,0.28)' }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)' }}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancelled
                    </span>
                  )}
                </div>

                {/* Time + Tasks Row */}
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" style={{ color: D.muted }} />
                    <span className="text-[13px] font-light" style={{ color: D.body }}>{shift.hours}</span>
                  </div>
                  {shift.status === 'completed' && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: D.brand }} />
                      <span className="text-[13px] font-light" style={{ color: D.body }}>{shift.completed}/{shift.tasks} tasks</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredShifts.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: D.card, border: `1px solid ${D.bdr}` }}>
            <p className="text-[15px] font-light" style={{ color: D.muted }}>No shifts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

import React, { useState } from 'react';
import { Check, X, Clock, User } from 'lucide-react';
import { DECLINE_REASONS } from '../services/mockData';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

export const TaskRequestCard = ({ task, onAccept, onDecline }) => {
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const handleDecline = () => {
    if (!selectedReason) return;
    onDecline(task.id, selectedReason);
    setShowDeclineForm(false);
  };

  return (
    <div
      style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.card, boxShadow: D.shadow, border: `1px solid ${D.bdr}` }}
      className="relative rounded-2xl overflow-hidden font-['Manrope',sans-serif]"
    >
      {/* Accent Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-400" />

      <div className="pl-5 pr-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-base font-bold truncate" style={{ color: D.h }}>{task.title}</h3>
        </div>

        {/* Time & Requester */}
        <div className="flex items-center gap-3 text-sm mb-3" style={{ color: D.muted }}>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {task.scheduledTime}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {task.proposedBy}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm mb-3 line-clamp-2" style={{ color: D.body }}>{task.description}</p>

        {/* Decline Reason Form */}
        {showDeclineForm ? (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase" style={{ color: D.muted }}>Select reason:</p>
            <div className="space-y-1">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className="w-full p-2 rounded-lg text-left text-xs font-medium transition-all"
                  style={{
                    background: selectedReason === reason ? 'rgba(244,63,94,0.08)' : D.bg,
                    border: selectedReason === reason ? '1px solid rgba(244,63,94,0.4)' : '1px solid transparent',
                    color: selectedReason === reason ? '#f43f5e' : D.body,
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDeclineForm(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold"
                style={{ border: `1px solid ${D.bdr}`, color: D.body }}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!selectedReason}
                className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          /* Action Buttons */
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(task)}
              className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
              data-testid={`accept-request-${task.id}`}
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => setShowDeclineForm(true)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
              style={{ background: D.bg, border: `1px solid ${D.bdr}`, color: D.body }}
              data-testid={`decline-request-${task.id}`}
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskRequestCard;

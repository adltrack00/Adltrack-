import React, { useState } from 'react';
import { Check, X, Clock, User, Sparkles } from 'lucide-react';
import { TaskStatus, Priority } from '../types';
import { DECLINE_REASONS } from '../services/mockData';

export const TaskRequestCard = ({ task, onAccept, onDecline }) => {
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const handleDecline = () => {
    if (!selectedReason) return;
    onDecline(task.id, selectedReason);
    setShowDeclineForm(false);
  };

  return (
    <div className="relative bg-white rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden font-['Manrope',sans-serif]">
      {/* Accent Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
      
      <div className="pl-4 pr-3 py-2.5">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-stone-900 truncate">{task.title}</h3>
            <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              Request
            </span>
          </div>
        </div>

        {/* Time & Requester */}
        <div className="flex items-center gap-3 text-xs text-stone-400 mb-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.scheduledTime}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.proposedBy}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-500 mb-2 line-clamp-2">{task.description}</p>

        {/* Decline Reason Form */}
        {showDeclineForm ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase">Select reason:</p>
            <div className="space-y-1">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-2 rounded-lg text-left text-xs font-medium transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-50 border border-rose-300 text-rose-700'
                      : 'bg-stone-50 border border-transparent text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDeclineForm(false)}
                className="flex-1 py-2 border border-stone-200 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!selectedReason}
                className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 disabled:bg-stone-300 disabled:cursor-not-allowed"
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
              className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
              data-testid={`accept-request-${task.id}`}
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </button>
            <button
              onClick={() => setShowDeclineForm(true)}
              className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-1"
              data-testid={`decline-request-${task.id}`}
            >
              <X className="w-3.5 h-3.5" />
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskRequestCard;

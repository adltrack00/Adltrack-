import React, { useState } from 'react';
import { Check, X, Clock, User } from 'lucide-react';
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
    <div className="relative bg-stone-950 border border-stone-800 rounded-xl overflow-hidden font-['Manrope',sans-serif]">
      {/* Accent Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
      
      <div className="pl-5 pr-4 py-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="text-base font-bold text-white truncate">{task.title}</h3>
        </div>

        {/* Time & Requester */}
        <div className="flex items-center gap-3 text-sm text-stone-500 mb-3">
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
        <p className="text-sm text-stone-400 mb-3 line-clamp-2">{task.description}</p>

        {/* Decline Reason Form */}
        {showDeclineForm ? (
          <div className="space-y-2">
            <p className="text-xs font-bold text-stone-500 uppercase">Select reason:</p>
            <div className="space-y-1">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-2 rounded-lg text-left text-xs font-medium transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-500/20 border border-rose-500 text-rose-400'
                      : 'bg-stone-800 border border-transparent text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDeclineForm(false)}
                className="flex-1 py-2 border border-stone-700 rounded-lg text-xs font-semibold text-stone-400 hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!selectedReason}
                className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed"
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
              className="flex-1 py-2.5 bg-stone-800 text-stone-300 rounded-lg text-sm font-bold hover:bg-stone-700 transition-colors flex items-center justify-center gap-1"
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

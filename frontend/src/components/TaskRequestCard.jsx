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
    <div className="relative bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden font-['Manrope',sans-serif]">
      {/* Accent Stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
      
      <div className="pl-5 pr-4 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Family Request
              </span>
            </div>
            <h3 className="font-bold text-stone-900">{task.title}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-stone-400 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{task.scheduledTime}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">{task.description}</p>

        {/* Proposed By */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-4 bg-stone-50 p-3 rounded-xl">
          <User className="w-4 h-4" />
          <span className="font-medium">Requested by {task.proposedBy}</span>
        </div>

        {/* Decline Reason Form */}
        {showDeclineForm ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Select reason for declining:
            </p>
            <div className="space-y-2">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-50 border-2 border-rose-500 text-rose-700'
                      : 'bg-stone-50 border-2 border-transparent text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeclineForm(false)}
                className="flex-1 py-3 border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!selectedReason}
                className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          /* Action Buttons */
          <div className="flex gap-3">
            <button
              onClick={() => onAccept(task)}
              className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
              data-testid={`accept-request-${task.id}`}
            >
              <Check className="w-5 h-5" />
              Accept
            </button>
            <button
              onClick={() => setShowDeclineForm(true)}
              className="flex-1 py-3.5 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
              data-testid={`decline-request-${task.id}`}
            >
              <X className="w-5 h-5" />
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskRequestCard;

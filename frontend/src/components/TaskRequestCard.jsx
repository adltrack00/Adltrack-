import React, { useState } from 'react';
import { Check, X, Clock, User } from 'lucide-react';
import { TaskStatus, Priority } from '../types';
import { DECLINE_REASONS } from '../services/mockData';

const priorityColors = {
  [Priority.CRITICAL]: { stripe: 'bg-red-500' },
  [Priority.HIGH]: { stripe: 'bg-orange-500' },
  [Priority.STANDARD]: { stripe: 'bg-blue-500' },
  [Priority.LOW]: { stripe: 'bg-gray-400' },
  [Priority.QUALITY_OF_LIFE]: { stripe: 'bg-indigo-500' }
};

export const TaskRequestCard = ({ task, onAccept, onDecline }) => {
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  
  const colors = priorityColors[task.priority] || priorityColors[Priority.STANDARD];

  const handleDecline = () => {
    if (!selectedReason) return;
    onDecline(task.id, selectedReason);
    setShowDeclineForm(false);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.stripe}`} />
      
      <div className="pl-4 pr-4 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 mb-2">
              Request
            </span>
            <h3 className="font-semibold text-zinc-900">{task.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-zinc-500 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{task.scheduledTime}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-600 mb-3">{task.description}</p>

        {/* Proposed By */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
          <User className="w-3.5 h-3.5" />
          <span>Requested by {task.proposedBy}</span>
        </div>

        {/* Decline Reason Form */}
        {showDeclineForm ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Select reason for declining:
            </p>
            <div className="space-y-2">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-2.5 rounded-lg text-left text-sm transition-all ${
                    selectedReason === reason
                      ? 'bg-red-50 border-2 border-red-500 text-red-700'
                      : 'bg-zinc-50 border-2 border-transparent text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeclineForm(false)}
                className="flex-1 py-2.5 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={!selectedReason}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:bg-zinc-300 disabled:cursor-not-allowed"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        ) : (
          /* Action Buttons */
          <div className="flex gap-2">
            <button
              onClick={() => onAccept(task)}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              data-testid={`accept-request-${task.id}`}
            >
              <Check className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => setShowDeclineForm(true)}
              className="flex-1 py-3 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
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

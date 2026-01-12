import React, { useState } from 'react';
import { Clock, Camera, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { TaskStatus, Priority } from '../types';

const priorityColors = {
  [Priority.CRITICAL]: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', stripe: 'bg-red-500' },
  [Priority.HIGH]: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', stripe: 'bg-orange-500' },
  [Priority.STANDARD]: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', stripe: 'bg-blue-500' },
  [Priority.LOW]: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', stripe: 'bg-gray-400' },
  [Priority.QUALITY_OF_LIFE]: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', stripe: 'bg-green-500' }
};

export const TaskCard = ({ 
  task, 
  onStartTask, 
  isExpanded, 
  onToggleExpand,
  readOnly = false 
}) => {
  const colors = priorityColors[task.priority] || priorityColors[Priority.STANDARD];
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed = task.status === TaskStatus.MISSED;

  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-200 ${
        isCompleted ? 'opacity-60' : ''
      } ${isExpanded ? 'shadow-md' : 'hover:shadow-md'}`}
    >
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.stripe}`} />
      
      {/* Main Content */}
      <div 
        className="pl-4 pr-4 py-4 cursor-pointer"
        onClick={() => !readOnly && onToggleExpand && onToggleExpand(task.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Priority Badge */}
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${colors.bg} ${colors.text}`}>
              {task.priority}
            </span>
            
            {/* Task Title */}
            <h3 className={`font-semibold text-zinc-900 ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            
            {/* Time */}
            <div className="flex items-center gap-1 mt-1 text-zinc-500 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{task.scheduledTime}</span>
              {task.requiresPhoto && (
                <span className="flex items-center gap-1 ml-2 text-zinc-400">
                  <Camera className="w-3.5 h-3.5" />
                  Photo required
                </span>
              )}
            </div>
          </div>
          
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : isMissed ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-zinc-300" />
            )}
          </div>
        </div>

        {/* Completed Info */}
        {isCompleted && task.completedAt && (
          <div className="mt-2 pt-2 border-t border-zinc-100">
            <p className="text-xs text-green-600 font-medium">
              ✓ Completed at {task.completedAt}
            </p>
            {task.completionNote && (
              <p className="text-xs text-zinc-500 mt-1">Note: {task.completionNote}</p>
            )}
          </div>
        )}

        {/* Missed Info */}
        {isMissed && task.missedReason && (
          <div className="mt-2 pt-2 border-t border-zinc-100">
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Reason: {task.missedReason}
            </p>
          </div>
        )}

        {/* Evidence Image */}
        {task.evidenceUrl && (
          <div className="mt-3">
            <img 
              src={task.evidenceUrl} 
              alt="Task evidence" 
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Expanded Section */}
      {isExpanded && !isCompleted && !isMissed && !readOnly && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-100">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Instructions</p>
              <p className="text-sm text-zinc-700">{task.instructions || task.description}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Time Window</p>
              <p className="text-sm text-zinc-700">{task.timeWindow}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTask && onStartTask(task);
              }}
              className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
              data-testid={`start-task-${task.id}`}
            >
              Start Task
            </button>
          </div>
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      {!isCompleted && !isMissed && !readOnly && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;

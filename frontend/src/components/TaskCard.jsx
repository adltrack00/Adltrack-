import React from 'react';
import { Clock, Camera, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Image } from 'lucide-react';
import { TaskStatus, Priority } from '../types';

const priorityConfig = {
  [Priority.CRITICAL]: { 
    bg: 'bg-rose-50', 
    text: 'text-rose-600', 
    stripe: 'bg-rose-500',
    icon: '🔴'
  },
  [Priority.HIGH]: { 
    bg: 'bg-orange-50', 
    text: 'text-orange-600', 
    stripe: 'bg-orange-500',
    icon: '🟠'
  },
  [Priority.STANDARD]: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-600', 
    stripe: 'bg-blue-500',
    icon: '🔵'
  },
  [Priority.LOW]: { 
    bg: 'bg-stone-100', 
    text: 'text-stone-600', 
    stripe: 'bg-stone-400',
    icon: '⚪'
  },
  [Priority.QUALITY_OF_LIFE]: { 
    bg: 'bg-emerald-50', 
    text: 'text-emerald-600', 
    stripe: 'bg-emerald-500',
    icon: '🟢'
  }
};

export const TaskCard = ({ 
  task, 
  onStartTask, 
  isExpanded, 
  onToggleExpand,
  readOnly = false 
}) => {
  const config = priorityConfig[task.priority] || priorityConfig[Priority.STANDARD];
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed = task.status === TaskStatus.MISSED;
  const hasPhoto = !!task.evidenceUrl;

  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 font-['Manrope',sans-serif] ${
        isCompleted ? 'opacity-80' : ''
      } ${isExpanded && !isCompleted ? 'shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'}`}
    >
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? 'bg-emerald-500' : config.stripe}`} />
      
      {/* Main Content */}
      <div 
        className="pl-5 pr-4 py-4 cursor-pointer"
        onClick={() => !readOnly && !isCompleted && onToggleExpand && onToggleExpand(task.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Priority Badge & Photo indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-50 text-emerald-600' : `${config.bg} ${config.text}`}`}>
                {isCompleted ? '✓' : config.icon} {isCompleted ? 'DONE' : task.priority}
              </span>
              {task.requiresPhoto && !hasPhoto && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 text-stone-500 text-[10px] font-medium rounded-full">
                  <Camera className="w-3 h-3" />
                  Photo
                </span>
              )}
              {hasPhoto && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-medium rounded-full">
                  <Image className="w-3 h-3" />
                  Photo
                </span>
              )}
            </div>
            
            {/* Task Title */}
            <h3 className={`font-bold ${isCompleted ? 'text-stone-500' : 'text-stone-900'}`}>
              {task.title}
            </h3>
            
            {/* Time */}
            <div className="flex items-center gap-1.5 mt-1.5 text-stone-400 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {isCompleted && task.completedAt ? `Done at ${task.completedAt}` : task.scheduledTime}
              </span>
            </div>
          </div>
          
          {/* Right side - Photo thumbnail or Status */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Mini Photo Thumbnail for completed tasks with photos */}
            {hasPhoto && (
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                <img 
                  src={task.evidenceUrl} 
                  alt="Evidence" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Status Indicator */}
            {isCompleted ? (
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            ) : isMissed ? (
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-500" />
              </div>
            ) : (
              <div className="w-8 h-8 border-2 border-stone-200 rounded-full flex items-center justify-center">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completion Note (shown inline for completed tasks) */}
        {isCompleted && task.completionNote && (
          <p className="text-sm text-stone-500 mt-2 italic line-clamp-1">"{task.completionNote}"</p>
        )}

        {/* Missed Info */}
        {isMissed && task.missedReason && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-sm text-rose-600 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {task.missedReason}
            </p>
          </div>
        )}
      </div>

      {/* Expanded Section - Only for non-completed tasks */}
      {isExpanded && !isCompleted && !isMissed && !readOnly && (
        <div className="px-5 pb-5 pt-2 border-t border-stone-100 bg-stone-50/50">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Instructions</p>
              <p className="text-sm text-stone-700 leading-relaxed">{task.instructions || task.description}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Time Window</p>
              <p className="text-sm text-stone-700">{task.timeWindow}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTask && onStartTask(task);
              }}
              className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
              data-testid={`start-task-${task.id}`}
            >
              Start Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;

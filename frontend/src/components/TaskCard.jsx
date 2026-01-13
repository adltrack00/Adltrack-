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
      className={`relative bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-200 font-['Manrope',sans-serif] ${
        isCompleted ? 'opacity-80' : ''
      } ${isExpanded && !isCompleted ? 'shadow-[0_4px_16px_rgba(0,0,0,0.1)]' : 'hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)]'}`}
    >
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? 'bg-emerald-500' : config.stripe}`} />
      
      {/* Main Content */}
      <div 
        className="pl-5 pr-4 py-4 cursor-pointer"
        onClick={() => !readOnly && !isCompleted && onToggleExpand && onToggleExpand(task.id)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title & Badges Row */}
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className={`text-base font-bold truncate ${isCompleted ? 'text-stone-500' : 'text-stone-900'}`}>
                {task.title}
              </h3>
              {/* Priority Badge - only show for non-completed tasks */}
              {!isCompleted && (
                <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${config.bg} ${config.text}`}>
                  {config.icon}
                </span>
              )}
            </div>
            
            {/* Time & Photo indicator */}
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4" />
                {isCompleted && task.completedAt ? `${task.completedAt}` : task.scheduledTime}
              </span>
              {/* Only show Photo badge for pending tasks that require photo */}
              {task.requiresPhoto && !hasPhoto && !isCompleted && (
                <span className="flex items-center gap-1 text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full text-xs font-medium">
                  <Camera className="w-3.5 h-3.5" />
                  Photo
                </span>
              )}
            </div>
            
            {/* Completion Note */}
            {isCompleted && task.completionNote && (
              <p className="text-sm text-stone-400 mt-1.5 truncate italic">&quot;{task.completionNote}&quot;</p>
            )}
          </div>
          
          {/* Right side - Photo thumbnail or Status */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Mini Photo Thumbnail */}
            {hasPhoto && (
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                <img src={task.evidenceUrl} alt="" className="w-full h-full object-cover" />
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

        {/* Missed Info */}
        {isMissed && task.missedReason && (
          <p className="text-sm text-rose-600 font-medium flex items-center gap-1.5 mt-2">
            <AlertCircle className="w-4 h-4" />
            {task.missedReason}
          </p>
        )}
      </div>

      {/* Expanded Section */}
      {isExpanded && !isCompleted && !isMissed && !readOnly && (
        <div className="px-5 pb-4 pt-3 border-t border-stone-100 bg-stone-50/50">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Instructions</p>
              <p className="text-sm text-stone-600 leading-relaxed">{task.instructions || task.description}</p>
            </div>
            
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Time Window</p>
              <p className="text-sm text-stone-600">{task.timeWindow}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTask && onStartTask(task);
              }}
              className="w-full py-3.5 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors shadow-sm"
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

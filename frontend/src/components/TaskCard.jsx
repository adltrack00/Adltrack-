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
      className={`relative bg-white rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200 font-['Manrope',sans-serif] ${
        isCompleted ? 'opacity-80' : ''
      } ${isExpanded && !isCompleted ? 'shadow-[0_2px_12px_rgba(0,0,0,0.08)]' : 'hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)]'}`}
    >
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCompleted ? 'bg-emerald-500' : config.stripe}`} />
      
      {/* Main Content */}
      <div 
        className="pl-4 pr-3 py-3 cursor-pointer"
        onClick={() => !readOnly && !isCompleted && onToggleExpand && onToggleExpand(task.id)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title & Badges Row */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-sm font-bold truncate ${isCompleted ? 'text-stone-500' : 'text-stone-900'}`}>
                {task.title}
              </h3>
              {/* Priority/Status Badge */}
              <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${isCompleted ? 'bg-emerald-50 text-emerald-600' : `${config.bg} ${config.text}`}`}>
                {isCompleted ? '✓ Done' : config.icon}
              </span>
            </div>
            
            {/* Time & Photo indicator */}
            <div className="flex items-center gap-2 text-stone-400 text-xs">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {isCompleted && task.completedAt ? `Done ${task.completedAt}` : task.scheduledTime}
              </span>
              {hasPhoto && (
                <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <Image className="w-3 h-3" />
                </span>
              )}
              {task.requiresPhoto && !hasPhoto && (
                <span className="flex items-center gap-0.5 text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                  <Camera className="w-3 h-3" />
                </span>
              )}
            </div>
            
            {/* Completion Note */}
            {isCompleted && task.completionNote && (
              <p className="text-xs text-stone-400 mt-1 truncate italic">"{task.completionNote}"</p>
            )}
          </div>
          
          {/* Right side - Photo thumbnail or Status */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Mini Photo Thumbnail */}
            {hasPhoto && (
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img src={task.evidenceUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            
            {/* Status Indicator */}
            {isCompleted ? (
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
            ) : isMissed ? (
              <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
            ) : (
              <div className="w-7 h-7 border-2 border-stone-200 rounded-full flex items-center justify-center">
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Missed Info */}
        {isMissed && task.missedReason && (
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            {task.missedReason}
          </p>
        )}
      </div>

      {/* Expanded Section */}
      {isExpanded && !isCompleted && !isMissed && !readOnly && (
        <div className="px-4 pb-3 pt-2 border-t border-stone-100 bg-stone-50/50">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Instructions</p>
              <p className="text-xs text-stone-600 leading-relaxed">{task.instructions || task.description}</p>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Time Window</p>
              <p className="text-xs text-stone-600">{task.timeWindow}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTask && onStartTask(task);
              }}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors"
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

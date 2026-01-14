import React from 'react';
import { Clock, Camera, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Image } from 'lucide-react';
import { TaskStatus, Priority } from '../types';
import { useTheme } from '../context/ThemeContext';

export const TaskCard = ({ 
  task, 
  onStartTask, 
  isExpanded, 
  onToggleExpand,
  readOnly = false 
}) => {
  const { isDarkMode, bg, bgCard, border, text, textSecondary, textMuted } = useTheme();
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed = task.status === TaskStatus.MISSED;
  const hasPhoto = !!task.evidenceUrl;

  // Priority stripe colors (these stay the same in both themes)
  const priorityStripe = {
    [Priority.CRITICAL]: 'bg-rose-500',
    [Priority.HIGH]: 'bg-orange-500',
    [Priority.STANDARD]: 'bg-blue-500',
    [Priority.LOW]: 'bg-stone-400',
    [Priority.QUALITY_OF_LIFE]: 'bg-emerald-500'
  };

  const stripe = isCompleted ? 'bg-emerald-500' : (priorityStripe[task.priority] || priorityStripe[Priority.STANDARD]);

  return (
    <div 
      className={`relative ${bgCard} border ${border} rounded-2xl overflow-hidden transition-all duration-200 font-['Manrope',sans-serif] ${
        isCompleted ? 'opacity-75' : ''
      } ${isExpanded && !isCompleted ? (isDarkMode ? 'border-stone-700' : 'border-stone-300') : (isDarkMode ? 'hover:border-stone-700' : 'hover:border-stone-300')}`}
    >
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripe}`} />
      
      {/* Main Content */}
      <div 
        className="pl-5 pr-4 py-4 cursor-pointer"
        onClick={() => !readOnly && !isCompleted && onToggleExpand && onToggleExpand(task.id)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className={`text-base font-bold truncate ${isCompleted ? textMuted : text}`}>
                {task.title}
              </h3>
            </div>
            
            {/* Time & Photo indicator */}
            <div className={`flex items-center gap-2 ${textSecondary} text-sm`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4" />
                {isCompleted && task.completedAt ? `${task.completedAt}` : task.scheduledTime}
              </span>
              {/* Only show Photo badge for pending tasks that require photo */}
              {task.requiresPhoto && !hasPhoto && !isCompleted && (
                <span className={`flex items-center gap-1 ${isDarkMode ? 'text-stone-300 bg-stone-800' : 'text-stone-600 bg-stone-200'} px-2 py-0.5 rounded-full text-xs font-medium`}>
                  <Camera className="w-3.5 h-3.5" />
                  Photo
                </span>
              )}
            </div>
            
            {/* Completion Note */}
            {isCompleted && task.completionNote && (
              <p className={`text-sm ${textMuted} mt-1.5 truncate italic`}>&quot;{task.completionNote}&quot;</p>
            )}
          </div>
          
          {/* Right side - Photo thumbnail only (no checkmark for completed) */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Mini Photo Thumbnail */}
            {hasPhoto && (
              <div className={`w-12 h-12 rounded-xl overflow-hidden border ${border}`}>
                <img src={task.evidenceUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            
            {/* Status Indicator - Only show for non-completed tasks */}
            {isMissed ? (
              <div className="w-8 h-8 bg-rose-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
            ) : !isCompleted && (
              <div className={`w-8 h-8 border-2 ${isDarkMode ? 'border-stone-700' : 'border-stone-300'} rounded-full flex items-center justify-center`}>
                {isExpanded ? (
                  <ChevronUp className={`w-4 h-4 ${textMuted}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${textMuted}`} />
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
        <div className={`px-5 pb-4 pt-3 border-t ${border} ${isDarkMode ? 'bg-stone-950/50' : 'bg-stone-50'}`}>
          <div className="space-y-3">
            <div>
              <p className={`text-xs font-bold ${textMuted} uppercase tracking-wider mb-1`}>Instructions</p>
              <p className={`text-sm ${textSecondary} leading-relaxed`}>{task.instructions || task.description}</p>
            </div>
            
            <div>
              <p className={`text-xs font-bold ${textMuted} uppercase tracking-wider mb-1`}>Time Window</p>
              <p className={`text-sm ${textSecondary}`}>{task.timeWindow}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTask && onStartTask(task);
              }}
              className="w-full py-3.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
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

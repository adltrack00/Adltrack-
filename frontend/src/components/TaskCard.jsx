import React from 'react';
import { Clock, Camera, ChevronDown, ChevronUp, XCircle, AlertCircle } from 'lucide-react';
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

  // Priority stripe colors - matching mobile app exactly
  // Red = Medication/Critical, Blue = Nutrition/Standard, Green = Others/Quality of Life
  const priorityStripe = {
    [Priority.CRITICAL]: 'bg-rose-500',      // Red for medications
    [Priority.HIGH]: 'bg-rose-500',          // Red 
    [Priority.STANDARD]: 'bg-blue-500',      // Blue for nutrition/standard
    [Priority.LOW]: 'bg-[#25D366]',          // Green for others
    [Priority.QUALITY_OF_LIFE]: 'bg-[#25D366]' // Green
  };

  const stripe = isCompleted ? 'bg-[#25D366]' : (priorityStripe[task.priority] || priorityStripe[Priority.STANDARD]);

  return (
    <div 
      className={`relative bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl overflow-hidden transition-all duration-200 font-['Manrope',sans-serif] ${
        isCompleted ? 'opacity-75' : ''
      } ${isExpanded && !isCompleted ? 'border-[#636366]' : 'hover:border-[#636366]'}`}
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
              <h3 className={`text-base font-bold truncate ${isCompleted ? `${textMuted} line-through` : text}`}>
                {task.title}
              </h3>
            </div>
            
            {/* Time & Photo indicator */}
            <div className={`flex items-center gap-2 ${isCompleted ? textMuted : textSecondary} text-sm`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4" />
                {isCompleted && task.completedAt ? `${task.completedAt}` : task.scheduledTime}
              </span>
              {/* Only show Photo badge for pending tasks that require photo */}
              {task.requiresPhoto && !hasPhoto && !isCompleted && (
                <span className="flex items-center gap-1 text-[#8e8e93] bg-[#2c2c2e] px-2 py-0.5 rounded-full text-xs font-medium">
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
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#3a3a3c]">
                <img src={task.evidenceUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            
            {/* Status Indicator - Only show for non-completed tasks */}
            {isMissed ? (
              <div className="w-8 h-8 bg-rose-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
            ) : !isCompleted && (
              <div className="w-8 h-8 border-2 border-[#3a3a3c] rounded-full flex items-center justify-center">
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
        <div className={`px-5 pb-4 pt-3 border-t border-[#3a3a3c] bg-black/30`}>
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
              className="w-full py-3.5 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#20bd5a] transition-colors"
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

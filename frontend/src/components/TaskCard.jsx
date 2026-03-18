import React from 'react';
import { Clock, Camera, ChevronDown, ChevronUp, XCircle, AlertCircle, Image } from 'lucide-react';
import { TaskStatus, Priority } from '../types';
import { useTheme } from '../context/ThemeContext';

export const TaskCard = ({ 
  task, 
  onStartTask, 
  isExpanded, 
  onToggleExpand,
  readOnly = false 
}) => {
  const { isDarkMode } = useTheme();
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed = task.status === TaskStatus.MISSED;
  const hasPhoto = !!task.evidenceUrl;

  const priorityStripe = {
    [Priority.CRITICAL]: 'bg-rose-500',
    [Priority.HIGH]: 'bg-rose-500',
    [Priority.STANDARD]: 'bg-blue-500',
    [Priority.LOW]: 'bg-[#25D366]',
    [Priority.QUALITY_OF_LIFE]: 'bg-[#25D366]'
  };

  const stripe = isCompleted ? 'bg-[#25D366]' : (priorityStripe[task.priority] || priorityStripe[Priority.STANDARD]);

  return (
    <div 
      className={`relative bg-[#1c1c1e] rounded-2xl overflow-hidden transition-all duration-200 font-['Manrope',sans-serif] ${
        isCompleted ? 'opacity-80' : ''
      }`}
    >
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripe}`} />
      
      {/* Main Content */}
      <div 
        className="pl-5 pr-4 py-4 cursor-pointer"
        onClick={() => !readOnly && !isCompleted && onToggleExpand && onToggleExpand(task.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold mb-1.5 ${isCompleted ? 'text-[#8e8e93] line-through' : 'text-white'}`}>
              {task.title}
            </h3>
            
            <div className={`flex items-center gap-2.5 ${isCompleted ? 'text-[#636366]' : 'text-[#8e8e93]'} text-[15px]`}>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-[18px] h-[18px]" />
                {isCompleted && task.completedAt ? task.completedAt : task.scheduledTime}
              </span>
              {task.requiresPhoto && !hasPhoto && !isCompleted && (
                <span className="flex items-center gap-1.5 text-[#8e8e93] bg-[#2c2c2e] px-2.5 py-1 rounded-full text-xs font-medium">
                  <Camera className="w-3.5 h-3.5" />
                  Photo
                </span>
              )}
            </div>
            
            {isCompleted && task.completionNote && (
              <p className="text-[15px] text-[#636366] mt-1.5 italic">&quot;{task.completionNote}&quot;</p>
            )}
          </div>
          
          {/* Right side */}
          <div className="flex-shrink-0">
            {hasPhoto && (
              <div className="relative">
                <div className="w-20 h-20 rounded-xl overflow-hidden">
                  <img src={task.evidenceUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#2c2c2e] rounded-lg flex items-center justify-center border border-[#3a3a3c]">
                  <Image className="w-4 h-4 text-[#8e8e93]" />
                </div>
              </div>
            )}
            
            {isMissed ? (
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-400" />
              </div>
            ) : !isCompleted && !hasPhoto && (
              <div className="w-12 h-12 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#8e8e93]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#8e8e93]" />
                )}
              </div>
            )}
          </div>
        </div>

        {isMissed && task.missedReason && (
          <p className="text-sm text-rose-600 font-medium flex items-center gap-1.5 mt-2">
            <AlertCircle className="w-4 h-4" />
            {task.missedReason}
          </p>
        )}
      </div>

      {/* Expanded Section */}
      {isExpanded && !isCompleted && !isMissed && !readOnly && (
        <div className="px-5 pb-5">
          <div className="space-y-4">
            <div className="bg-[#191919] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#636366] uppercase tracking-[1.5px] mb-2">Instructions</p>
              <p className="text-[15px] text-[#8e8e93] leading-relaxed">{task.instructions || task.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#636366]" />
              <span className="text-xs font-bold text-[#636366] uppercase tracking-[1.5px]">Time Window</span>
              <span className="text-[15px] text-white font-bold ml-1">{task.timeWindow}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartTask && onStartTask(task);
              }}
              className="w-full py-4 bg-[#25D366] text-white rounded-2xl text-lg font-bold hover:bg-[#20bd5a] transition-colors"
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

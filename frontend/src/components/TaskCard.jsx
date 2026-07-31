import React from 'react';
import { Clock, Camera, ChevronDown, ChevronUp, XCircle, AlertCircle, Image, CheckCircle2 } from 'lucide-react';
import { TaskStatus } from '../types';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

export const TaskCard = ({ task, onStartTask, isExpanded, onToggleExpand, readOnly = false }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed = task.status === TaskStatus.MISSED;
  const hasPhoto = !!task.evidenceUrl;

  return (
    <div
      style={{
        fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif",
        letterSpacing: '-0.03em',
        background: isCompleted ? 'rgba(255,179,71,0.06)' : D.card,
        boxShadow: D.shadow,
        border: `1px solid ${isCompleted ? 'rgba(255,179,71,0.35)' : isMissed ? 'rgba(244,63,94,0.22)' : D.bdr}`,
      }}
      className="relative rounded-2xl overflow-hidden transition-all duration-200"
    >
      {/* Completed left accent stripe */}
      {isCompleted && (
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(180deg,#FFB347,#F28482)', borderRadius: '8px 0 0 8px' }} />
      )}

      {/* Main Content */}
      <div
        className="pl-4 pr-4 py-4 cursor-pointer"
        onClick={() => !readOnly && !isCompleted && onToggleExpand && onToggleExpand(task.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title row with completed badge inline */}
            <div className="flex items-start gap-2 mb-1.5">
              <h3
                className="text-lg font-bold leading-snug"
                style={{
                  color: isCompleted ? D.body : D.h,
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  textDecorationColor: '#F28482',
                  textDecorationThickness: '2px',
                }}
              >
                {task.title}
              </h3>
            </div>

            <div className="flex items-center gap-2.5 text-[15px]" style={{ color: isCompleted ? '#64748b' : D.muted }}>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-[18px] h-[18px]" />
                {isCompleted && task.completedAt ? task.completedAt : task.scheduledTime}
              </span>
              {isCompleted && (
                <span
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,179,71,0.14)', color: '#b45309', border: '1px solid rgba(255,179,71,0.35)' }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Done
                </span>
              )}
              {task.requiresPhoto && !hasPhoto && !isCompleted && (
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: D.bg, color: D.muted, border: `1px solid ${D.bdr}` }}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Photo
                </span>
              )}
            </div>

            {isCompleted && task.completionNote && (
              <p className="text-[14px] italic mt-1.5 font-medium" style={{ color: '#475569' }}>
                &quot;{task.completionNote}&quot;
              </p>
            )}
          </div>

          {/* Right side */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            {hasPhoto && (
              <div className="relative">
                <div className="w-20 h-20 rounded-xl overflow-hidden" style={{ border: '2px solid rgba(255,179,71,0.35)' }}>
                  <img src={task.evidenceUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: '#ffffff', border: '1px solid rgba(255,179,71,0.35)' }}
                >
                  <Image className="w-4 h-4" style={{ color: '#b45309' }} />
                </div>
              </div>
            )}

            {isMissed ? (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)' }}
              >
                <XCircle className="w-6 h-6" style={{ color: 'rgba(244,63,94,0.8)' }} />
              </div>
            ) : isCompleted && !hasPhoto ? (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,179,71,0.14)', border: '1px solid rgba(255,179,71,0.35)' }}
              >
                <CheckCircle2 className="w-6 h-6" style={{ color: '#b45309' }} />
              </div>
            ) : !isCompleted && !hasPhoto && (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: D.bg }}
              >
                {isExpanded
                  ? <ChevronUp className="w-5 h-5" style={{ color: D.muted }} />
                  : <ChevronDown className="w-5 h-5" style={{ color: D.muted }} />
                }
              </div>
            )}
          </div>
        </div>

        {isMissed && task.missedReason && (
          <p className="text-sm font-medium flex items-center gap-1.5 mt-2" style={{ color: 'rgba(244,63,94,0.8)' }}>
            <AlertCircle className="w-4 h-4" />
            {task.missedReason}
          </p>
        )}
      </div>

      {/* Expanded Section */}
      {isExpanded && !isCompleted && !isMissed && !readOnly && (
        <div className="px-5 pb-5">
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: D.bg, border: `1px solid ${D.bdr}` }}>
              <p className="text-xs font-bold uppercase tracking-[1.5px] mb-2" style={{ color: D.muted }}>
                Instructions
              </p>
              <p className="text-[15px] leading-relaxed" style={{ color: D.body }}>
                {task.instructions || task.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: D.muted }} />
              <span className="text-xs font-bold uppercase tracking-[1.5px]" style={{ color: D.muted }}>
                Time Window
              </span>
              <span className="text-[15px] font-bold ml-1" style={{ color: D.h }}>
                {task.timeWindow}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onStartTask && onStartTask(task); }}
              className="w-full py-4 rounded-2xl text-lg font-bold transition-colors"
              style={{ background: D.brandGrad, color: D.brandText, boxShadow: '0 4px 16px rgba(255,179,71,0.28)' }}
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

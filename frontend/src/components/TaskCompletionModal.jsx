import React, { useState } from 'react';
import { X, Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { TaskStatus } from '../types';
import { DECLINE_REASONS } from '../services/mockData';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

export const TaskCompletionModal = ({ task, onClose, onComplete }) => {
  const [mode, setMode] = useState('complete');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (task.requiresPhoto && !photo && mode === 'complete') {
      alert('This task requires a photo as evidence.');
      return;
    }
    onComplete({
      ...task,
      status: mode === 'complete' ? TaskStatus.COMPLETED : TaskStatus.MISSED,
      completedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      completionNote: note,
      evidenceUrl: photoPreview || null,
      missedReason: mode === 'cantComplete' ? selectedReason : null
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col font-['Manrope',sans-serif]"
      style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }}
      data-testid="task-completion-modal"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h1 className="text-[28px] font-bold" style={{ color: D.h }}>{task.title}</h1>
        <button onClick={onClose} className="p-1" data-testid="task-modal-close">
          <X className="w-7 h-7" style={{ color: D.h }} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Mode Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode('complete')}
            className="flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-colors"
            style={{
              background: mode === 'complete' ? D.brandGrad : D.card,
              color: mode === 'complete' ? '#fff' : D.muted,
              border: `1px solid ${mode === 'complete' ? 'rgba(255,179,71,0.40)' : D.bdr}`,
              boxShadow: mode === 'complete' ? '0 4px 16px rgba(255,179,71,0.22)' : 'none',
            }}
            data-testid="mode-complete-btn"
          >
            <CheckCircle className="w-6 h-6" />
            Complete
          </button>
          <button
            onClick={() => setMode('cantComplete')}
            className="flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-colors"
            style={{
              background: mode === 'cantComplete' ? '#ef4444' : D.card,
              color: mode === 'cantComplete' ? '#fff' : D.muted,
              border: `1px solid ${mode === 'cantComplete' ? '#ef4444' : D.bdr}`,
            }}
            data-testid="mode-cant-complete-btn"
          >
            <XCircle className="w-6 h-6" />
            Can't Complete
          </button>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: D.card, border: `1px solid ${D.bdr}` }}>
          <p className="text-xs font-bold uppercase tracking-[1.5px] mb-2.5" style={{ color: D.muted }}>
            Instructions
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: D.h }}>
            {task.instructions || task.description}
          </p>
        </div>

        {mode === 'complete' ? (
          <>
            {/* Photo Upload */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[1.5px] mb-3" style={{ color: D.muted }}>
                Photo Evidence ({task.requiresPhoto ? 'Required' : 'Optional'})
              </p>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Evidence" className="w-full h-52 object-cover rounded-2xl" />
                  <button
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-3 right-3 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <label className="absolute bottom-3 right-3 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div
                    className="rounded-2xl py-10 text-center"
                    style={{ border: `2px dashed ${D.bdr}`, background: D.card }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      style={{ background: D.bg, border: `1px solid ${D.bdr}` }}
                    >
                      <Camera className="w-8 h-8" style={{ color: D.muted }} />
                    </div>
                    <p className="text-base font-semibold" style={{ color: D.h }}>Tap to add photo</p>
                    <p className="text-sm mt-1" style={{ color: D.muted }}>Take a photo for documentation</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[1.5px] mb-3" style={{ color: D.muted }}>Notes</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any relevant notes here..."
                className="w-full p-4 rounded-2xl resize-none h-28 text-base focus:outline-none"
                style={{
                  background: D.card,
                  border: `1px solid ${D.bdr}`,
                  color: D.h,
                  fontSize: '16px',
                }}
                data-testid="task-note-input"
              />
            </div>
          </>
        ) : (
          /* Can't Complete - Reason Selection */
          <div>
            <p className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-[1.5px] mb-3">
              <AlertTriangle className="w-4 h-4" />
              Reason for Not Completing
            </p>
            <div className="space-y-3">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className="w-full p-5 rounded-2xl text-left text-base font-semibold transition-all"
                  style={{
                    background: selectedReason === reason ? 'rgba(244,63,94,0.06)' : D.card,
                    border: selectedReason === reason ? '2px solid #ef4444' : `2px solid ${D.bdr}`,
                    color: selectedReason === reason ? '#ef4444' : D.h,
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div
        className="fixed bottom-0 left-0 right-0 p-5 z-10"
        style={{ background: D.card, borderTop: `1px solid ${D.bdr}` }}
      >
        <button
          onClick={handleComplete}
          disabled={mode === 'cantComplete' && !selectedReason}
          className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2.5 transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: mode === 'complete' ? D.brandGrad : '#ef4444', boxShadow: mode === 'complete' ? '0 4px 16px rgba(255,179,71,0.28)' : '0 4px 16px rgba(239,68,68,0.22)' }}
          data-testid="submit-task-completion"
        >
          <CheckCircle className="w-6 h-6" />
          {mode === 'complete' ? 'Mark as Complete' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
};

export default TaskCompletionModal;

import React, { useState } from 'react';
import { X, Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { TaskStatus } from '../types';
import { DECLINE_REASONS } from '../services/mockData';

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
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-['Manrope',sans-serif]" data-testid="task-completion-modal">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h1 className="text-[28px] font-bold text-white">{task.title}</h1>
        <button onClick={onClose} className="p-1" data-testid="task-modal-close">
          <X className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Mode Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode('complete')}
            className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-colors ${
              mode === 'complete'
                ? 'bg-[#25D366] text-white'
                : 'bg-[#1c1c1e] text-[#8e8e93]'
            }`}
            data-testid="mode-complete-btn"
          >
            <CheckCircle className="w-6 h-6" />
            Complete
          </button>
          <button
            onClick={() => setMode('cantComplete')}
            className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-colors ${
              mode === 'cantComplete'
                ? 'bg-[#ef4444] text-white'
                : 'bg-[#1c1c1e] text-[#8e8e93]'
            }`}
            data-testid="mode-cant-complete-btn"
          >
            <XCircle className="w-6 h-6" />
            Can't Complete
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-[#191919] rounded-2xl p-5 mb-6">
          <p className="text-xs font-bold text-[#636366] uppercase tracking-[1.5px] mb-2.5">Instructions</p>
          <p className="text-[15px] text-[#8e8e93] leading-relaxed">{task.instructions || task.description}</p>
        </div>

        {mode === 'complete' ? (
          <>
            {/* Photo Upload */}
            <div className="mb-6">
              <p className="text-xs font-bold text-[#636366] uppercase tracking-[1.5px] mb-3">
                Photo Evidence ({task.requiresPhoto ? 'Required' : 'Optional'})
              </p>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Evidence" className="w-full h-52 object-cover rounded-2xl" />
                  <button
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-3 right-3 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                  <label className="absolute bottom-3 right-3 w-9 h-9 bg-black/60 rounded-full flex items-center justify-center cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-[#3a3a3c] rounded-2xl py-10 text-center bg-[#1c1c1e]/50">
                    <div className="w-16 h-16 bg-[#2c2c2e] rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-8 h-8 text-[#636366]" />
                    </div>
                    <p className="text-base text-white font-semibold">Tap to add photo</p>
                    <p className="text-sm text-[#636366] mt-1">Take a photo for documentation</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-bold text-[#636366] uppercase tracking-[1.5px] mb-3">Notes</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any relevant notes here..."
                className="w-full p-4 bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl resize-none h-28 text-base text-white placeholder-[#636366] focus:outline-none focus:border-[#25D366] caret-white"
                style={{ fontSize: '16px' }}
                data-testid="task-note-input"
              />
            </div>
          </>
        ) : (
          /* Can't Complete - Reason Selection */
          <div>
            <p className="flex items-center gap-2 text-xs font-bold text-[#ef4444] uppercase tracking-[1.5px] mb-3">
              <AlertTriangle className="w-4 h-4" />
              Reason for Not Completing
            </p>
            <div className="space-y-3">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-5 rounded-2xl text-left text-base font-semibold transition-all ${
                    selectedReason === reason
                      ? 'bg-[#3d1a1a]/60 border-2 border-[#ef4444] text-[#ef4444]'
                      : 'bg-[#1c1c1e] border-2 border-transparent text-white'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-black border-t border-[#3a3a3c] z-10">
        <button
          onClick={handleComplete}
          disabled={mode === 'cantComplete' && !selectedReason}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2.5 transition-colors ${
            mode === 'complete'
              ? 'bg-[#25D366] text-white'
              : 'bg-[#ef4444] text-white disabled:bg-[#3a3a3c] disabled:text-[#636366]'
          }`}
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

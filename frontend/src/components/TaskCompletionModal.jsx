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
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
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
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" onClick={onClose}>
      <div 
        className="bg-stone-950 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{task.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-5 pt-5">
          <div className="bg-stone-900 p-1.5 rounded-2xl flex border border-stone-800">
            <button
              onClick={() => setMode('complete')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'complete' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
            <button
              onClick={() => setMode('cantComplete')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                mode === 'cantComplete' 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <XCircle className="w-5 h-5" />
              Can&apos;t Complete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Instructions */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-2">Instructions</p>
            <p className="text-sm text-stone-300 leading-relaxed">{task.instructions || task.description}</p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              {task.requiresPhoto ? 'Photo Evidence (Required)' : 'Add Photo (Optional)'}
            </label>
            
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Evidence preview" 
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/50 rounded-xl text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-stone-700 rounded-2xl p-8 text-center hover:border-stone-600 transition-colors bg-stone-900/50">
                  <div className="w-14 h-14 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-7 h-7 text-stone-500" />
                  </div>
                  <p className="text-sm text-stone-300 font-semibold">Tap to add photo</p>
                  <p className="text-xs text-stone-400 mt-1">Take a photo or select from gallery</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about this task..."
              className="w-full p-4 bg-stone-900 border border-stone-800 rounded-2xl resize-none h-24 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Reason Selection (for Can't Complete) */}
          {mode === 'cantComplete' && (
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
                <AlertTriangle className="w-4 h-4" />
                Reason for Not Completing
              </label>
              <div className="space-y-2">
                {DECLINE_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full p-4 rounded-xl text-left text-sm font-semibold transition-all ${
                      selectedReason === reason
                        ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-400'
                        : 'bg-stone-900 border-2 border-stone-800 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-stone-950 border-t border-stone-800 p-5">
          <button
            onClick={handleComplete}
            disabled={mode === 'cantComplete' && !selectedReason}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.3)] ${
              mode === 'complete'
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-stone-700 disabled:cursor-not-allowed disabled:shadow-none'
            }`}
            data-testid="submit-task-completion"
          >
            {mode === 'complete' ? 'Mark as Complete' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionModal;

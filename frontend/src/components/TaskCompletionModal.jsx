import React, { useState } from 'react';
import { X, Camera, CheckCircle, XCircle, Upload, AlertTriangle } from 'lucide-react';
import { TaskStatus } from '../types';
import { DECLINE_REASONS } from '../services/mockData';

export const TaskCompletionModal = ({ task, onClose, onComplete }) => {
  const [mode, setMode] = useState('complete'); // 'complete' or 'cantComplete'
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">{task.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-4 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('complete')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'complete' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
            <button
              onClick={() => setMode('cantComplete')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'cantComplete' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <XCircle className="w-5 h-5" />
              Can't Complete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Instructions */}
          <div className="bg-zinc-50 rounded-xl p-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Instructions</p>
            <p className="text-sm text-zinc-700">{task.instructions || task.description}</p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              {task.requiresPhoto ? 'Photo Evidence (Required)' : 'Add Photo (Optional)'}
            </label>
            
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Evidence preview" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center hover:border-zinc-300 transition-colors">
                  <Camera className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600 font-medium">Tap to add photo</p>
                  <p className="text-xs text-zinc-400 mt-1">Take a photo or select from gallery</p>
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
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes about this task..."
              className="w-full p-3 border border-zinc-200 rounded-xl resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Reason Selection (for Can't Complete) */}
          {mode === 'cantComplete' && (
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Reason for Not Completing
              </label>
              <div className="space-y-2">
                {DECLINE_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all ${
                      selectedReason === reason
                        ? 'bg-red-50 border-2 border-red-500 text-red-700'
                        : 'bg-zinc-50 border-2 border-transparent text-zinc-700 hover:bg-zinc-100'
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
        <div className="sticky bottom-0 bg-white border-t border-zinc-100 p-4">
          <button
            onClick={handleComplete}
            disabled={mode === 'cantComplete' && !selectedReason}
            className={`w-full py-4 rounded-xl font-semibold transition-all ${
              mode === 'complete'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-zinc-300 disabled:cursor-not-allowed'
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

import React, { useState } from 'react';
import { X, Camera, AlertTriangle, Phone, User } from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 'fall', label: 'Fall', icon: '⚠️' },
  { id: 'injury', label: 'Injury', icon: '🩹' },
  { id: 'behavior', label: 'Behavior Change', icon: '🧠' },
  { id: 'medication', label: 'Medication Issue', icon: '💊' },
  { id: 'health', label: 'Health Concern', icon: '❤️' },
  { id: 'other', label: 'Other', icon: '📝' }
];

export const IncidentModal = ({ isOpen, onClose, onSubmit, patientName = 'the patient' }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notifyEmergency, setNotifyEmergency] = useState(false);

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

  const handleSubmit = () => {
    if (!selectedType) {
      alert('Please select an incident type');
      return;
    }

    const incident = {
      id: `incident-${Date.now()}`,
      type: selectedType,
      description,
      photo: photoPreview,
      notifyEmergency,
      timestamp: new Date().toISOString(),
      patientName
    };

    onSubmit(incident);
    
    // Reset form
    setSelectedType(null);
    setDescription('');
    setPhoto(null);
    setPhotoPreview(null);
    setNotifyEmergency(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-red-500 text-white px-4 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Report Incident</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Incident Type Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Type of Incident
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INCIDENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedType === type.id
                      ? 'bg-red-50 border-2 border-red-500'
                      : 'bg-zinc-50 border-2 border-transparent hover:bg-zinc-100'
                  }`}
                >
                  <span className="text-xl mb-1 block">{type.icon}</span>
                  <span className={`text-sm font-medium ${
                    selectedType === type.id ? 'text-red-700' : 'text-zinc-700'
                  }`}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened..."
              className="w-full p-3 border border-zinc-200 rounded-xl resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Add Photo
            </label>
            
            {photoPreview ? (
              <div className="relative">
                <img 
                  src={photoPreview} 
                  alt="Incident" 
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
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center hover:border-zinc-300 transition-colors">
                  <Camera className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-sm text-zinc-600">Tap to add photo</p>
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

          {/* Emergency Notification Toggle */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Notify Emergency Contacts</p>
                  <p className="text-xs text-amber-700">Family will be alerted immediately</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyEmergency}
                onChange={(e) => setNotifyEmergency(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-zinc-100 p-4">
          <button
            onClick={handleSubmit}
            disabled={!selectedType}
            className="w-full py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
            data-testid="submit-incident"
          >
            Submit Incident Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;

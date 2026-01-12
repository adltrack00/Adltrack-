import React, { useState } from 'react';
import { X, Phone, MapPin, AlertTriangle, Heart, Pill, FileText, Share2, Camera, User } from 'lucide-react';

export const PatientProfileModal = ({ 
  isOpen, 
  onClose, 
  patient,
  onUpdatePhoto 
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  if (!isOpen || !patient) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpdatePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdatePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = () => {
    // In a real app, this would generate a secure PDF or share link
    alert('Medical ID shared with emergency services');
    setShowShareOptions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Photo */}
        <div className="relative h-48 bg-gradient-to-br from-zinc-800 to-zinc-900">
          {patient.photo ? (
            <img 
              src={patient.photo} 
              alt={patient.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-20 h-20 text-zinc-600" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Photo Upload Button */}
          {onUpdatePhoto && (
            <label className="absolute bottom-4 right-4 p-2 bg-white rounded-full cursor-pointer shadow-lg hover:bg-zinc-100 transition-colors">
              <Camera className="w-5 h-5 text-zinc-700" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Patient Name */}
          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
            <p className="text-white/80 text-sm">Age: {patient.age} • DOB: {patient.dateOfBirth}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Critical Alert */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                <AlertTriangle className="w-5 h-5" />
                Allergies
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          {patient.medicalConditions && patient.medicalConditions.length > 0 && (
            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-zinc-700 font-semibold mb-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Medical Conditions
              </div>
              <ul className="space-y-1">
                {patient.medicalConditions.map((condition, idx) => (
                  <li key={idx} className="text-sm text-zinc-600">• {condition}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Medications */}
          {patient.medications && patient.medications.length > 0 && (
            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-zinc-700 font-semibold mb-2">
                <Pill className="w-5 h-5 text-blue-500" />
                Current Medications
              </div>
              <div className="space-y-2">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-medium text-zinc-800">{med.name}</span>
                    <span className="text-zinc-500"> - {med.dosage}, {med.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Status & Mobility */}
          <div className="grid grid-cols-2 gap-3">
            {patient.codeStatus && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-600 font-medium uppercase">Code Status</p>
                <p className="text-sm font-bold text-amber-800">{patient.codeStatus}</p>
              </div>
            )}
            {patient.mobilityStatus && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600 font-medium uppercase">Mobility</p>
                <p className="text-sm font-bold text-blue-800">{patient.mobilityStatus}</p>
              </div>
            )}
          </div>

          {/* Access Instructions */}
          {patient.accessInstructions && (
            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-zinc-700 font-semibold mb-2">
                <MapPin className="w-5 h-5 text-green-500" />
                Access Instructions
              </div>
              <p className="text-sm text-zinc-600">{patient.accessInstructions}</p>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="bg-zinc-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-zinc-700 font-semibold mb-3">
              <Phone className="w-5 h-5 text-emerald-500" />
              Emergency Contacts
            </div>
            <div className="space-y-3">
              {patient.emergencyContacts?.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-800">{contact.name}</p>
                    <p className="text-xs text-zinc-500">{contact.relationship}</p>
                  </div>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
              
              {/* Primary Care Physician */}
              {patient.primaryCarePhysician && (
                <div className="pt-3 border-t border-zinc-200">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Primary Care Physician</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-800">{patient.primaryCarePhysician.name}</p>
                      <p className="text-xs text-zinc-500">{patient.primaryCarePhysician.facility}</p>
                    </div>
                    <a 
                      href={`tel:${patient.primaryCarePhysician.phone}`}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      {patient.primaryCarePhysician.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share for EMS Button */}
          <button
            onClick={() => setShowShareOptions(true)}
            className="w-full py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            data-testid="share-medical-id"
          >
            <Share2 className="w-5 h-5" />
            Share Medical ID for EMS
          </button>
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center" onClick={() => setShowShareOptions(false)}>
            <div className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Share Medical ID</h3>
              <p className="text-sm text-zinc-600 mb-4">
                This will generate a secure summary of the patient's critical medical information for emergency services.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Share Now
                </button>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="w-full py-3 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileModal;

import React, { useState } from 'react';
import { X, Phone, MapPin, AlertTriangle, Heart, Pill, Camera, User, Share2, Shield, Activity } from 'lucide-react';

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
    alert('Medical ID shared with emergency services');
    setShowShareOptions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center font-['Manrope',sans-serif]" onClick={onClose}>
      <div 
        className="bg-stone-950 w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Photo */}
        <div className="relative h-56 bg-gradient-to-br from-rose-600 to-rose-700 overflow-hidden">
          {patient.photo ? (
            <>
              <img 
                src={patient.photo} 
                alt={patient.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/40 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-24 h-24 text-white/40" />
            </div>
          )}
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Photo Upload Button */}
          {onUpdatePhoto && (
            <label className="absolute bottom-20 right-4 p-3 bg-stone-900 rounded-xl cursor-pointer shadow-lg hover:bg-stone-800 transition-colors border border-stone-700">
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Patient Name */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
            <p className="text-white/80 text-sm font-medium">Age {patient.age} • DOB: {patient.dateOfBirth}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Critical Alert - Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold mb-3">
                <AlertTriangle className="w-5 h-5" />
                Allergies
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-full text-sm font-semibold">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          {patient.medicalConditions && patient.medicalConditions.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-3">
                <Heart className="w-5 h-5 text-rose-500" />
                Medical Conditions
              </div>
              <ul className="space-y-1.5">
                {patient.medicalConditions.map((condition, idx) => (
                  <li key={idx} className="text-sm text-stone-400 font-medium">• {condition}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Medications */}
          {patient.medications && patient.medications.length > 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-3">
                <Pill className="w-5 h-5 text-blue-500" />
                Current Medications
              </div>
              <div className="space-y-2">
                {patient.medications.map((med, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="font-bold text-white">{med.name}</span>
                    <span className="text-stone-400 font-medium"> - {med.dosage}, {med.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Status & Mobility */}
          <div className="grid grid-cols-2 gap-3">
            {patient.codeStatus && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                <Shield className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Code Status</p>
                <p className="text-sm font-bold text-white mt-1">{patient.codeStatus}</p>
              </div>
            )}
            {patient.mobilityStatus && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-center">
                <Activity className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Mobility</p>
                <p className="text-sm font-bold text-white mt-1">{patient.mobilityStatus}</p>
              </div>
            )}
          </div>

          {/* Access Instructions */}
          {patient.accessInstructions && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white font-bold mb-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Access Instructions
              </div>
              <p className="text-sm text-stone-400 font-medium">{patient.accessInstructions}</p>
            </div>
          )}

          {/* Emergency Contacts */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-white font-bold mb-4">
              <Phone className="w-5 h-5 text-emerald-500" />
              Emergency Contacts
            </div>
            <div className="space-y-3">
              {patient.emergencyContacts?.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{contact.name}</p>
                    <p className="text-xs text-stone-500 font-medium">{contact.relationship}</p>
                  </div>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
                  >
                    Call
                  </a>
                </div>
              ))}
              
              {/* Primary Care Physician */}
              {patient.primaryCarePhysician && (
                <div className="pt-3 border-t border-stone-800">
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mb-2">Primary Care Physician</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{patient.primaryCarePhysician.name}</p>
                      <p className="text-xs text-stone-500 font-medium">{patient.primaryCarePhysician.facility}</p>
                    </div>
                    <a 
                      href={`tel:${patient.primaryCarePhysician.phone}`}
                      className="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                      Call
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share for EMS Button */}
          <button
            onClick={() => setShowShareOptions(true)}
            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(244,63,94,0.3)]"
            data-testid="share-medical-id"
          >
            <Share2 className="w-5 h-5" />
            Share Medical ID for EMS
          </button>
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center" onClick={() => setShowShareOptions(false)}>
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 m-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-white mb-3">Share Medical ID</h3>
              <p className="text-sm text-stone-400 mb-5 font-medium">
                This will generate a secure summary of the patient&apos;s critical medical information for emergency services.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                >
                  Share Now
                </button>
                <button
                  onClick={() => setShowShareOptions(false)}
                  className="w-full py-3.5 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors"
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

import React, { useState } from 'react';
import { ArrowLeft, Camera, Star, Award, Clock, CheckCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const ProfilePage = ({ onBack, role, onSignOut }) => {
  const isCaregiver = role === UserRole.CAREGIVER;
  
  const [profile, setProfile] = useState({
    name: isCaregiver ? 'Julia Martinez' : 'Mary Smith',
    role: isCaregiver ? 'Certified Nursing Assistant' : 'Family Guardian',
    email: isCaregiver ? 'julia.martinez@careagency.com' : 'mary.smith@email.com',
    phone: isCaregiver ? '(555) 567-8901' : '(555) 234-5678',
    photo: isCaregiver 
      ? 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80'
      : 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-stone-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-stone-300" />
        </button>
        <h1 className="text-lg font-semibold text-white">Profile</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={profile.photo} 
              alt={profile.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-stone-800 shadow-lg"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-[#25D366] rounded-full cursor-pointer hover:bg-[#20bd5a] transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="text-xl font-bold text-white mt-4">{profile.name}</h2>
          <p className="text-stone-400">{profile.role}</p>
        </div>

        {/* Stats (Caregiver Only) */}
        {isCaregiver && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">4.9</p>
              <p className="text-xs text-stone-400">Rating</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">5</p>
              <p className="text-xs text-stone-400">Years</p>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-[#25D366] mx-auto mb-1" />
              <p className="text-xl font-bold text-white">234</p>
              <p className="text-xs text-stone-400">Shifts</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-white">Contact Information</h3>
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-wider">Email</label>
            <p className="text-stone-300">{profile.email}</p>
          </div>
          <div>
            <label className="text-xs text-stone-400 uppercase tracking-wider">Phone</label>
            <p className="text-stone-300">{profile.phone}</p>
          </div>
        </div>

        {/* Certifications (Caregiver Only) */}
        {isCaregiver && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {['CNA', 'CPR/First Aid', 'Dementia Care'].map((cert, idx) => (
                <span key={idx} className="px-3 py-1 bg-[#25D366]/20 text-[#25D366] rounded-full text-sm font-medium">
                  ✓ {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

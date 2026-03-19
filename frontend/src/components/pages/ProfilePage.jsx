import React, { useState } from 'react';
import { ArrowLeft, Camera, Star, Award, CheckCircle, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-black font-['Manrope',sans-serif]" data-testid="profile-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-3 pb-3">
        <button onClick={onBack} className="mr-4 p-1" data-testid="profile-back-btn">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      <div className="px-5 pb-24 overflow-y-auto">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-5">
            <img 
              src={profile.photo} 
              alt={profile.name}
              className="w-40 h-40 rounded-full object-cover border-[3px] border-[#636366]"
            />
            <label className="absolute bottom-2 left-2 w-12 h-12 bg-[#25D366] rounded-full cursor-pointer flex items-center justify-center shadow-lg">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="text-[28px] font-bold text-white">{profile.name}</h2>
          <p className="text-[#8e8e93] text-lg mt-1">{profile.role}</p>
        </div>

        {/* Stats - Caregiver Only */}
        {isCaregiver && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl p-4 text-center">
              <Star className="w-7 h-7 text-yellow-500 mx-auto mb-2" fill="#eab308" />
              <p className="text-3xl font-bold text-white">4.9</p>
              <p className="text-sm text-[#8e8e93] mt-1">Rating</p>
            </div>
            <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl p-4 text-center">
              <Award className="w-7 h-7 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-sm text-[#8e8e93] mt-1">Years</p>
            </div>
            <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl p-4 text-center">
              <CheckCircle className="w-7 h-7 text-[#25D366] mx-auto mb-2" fill="#25D366" stroke="black" strokeWidth={2} />
              <p className="text-3xl font-bold text-white">234</p>
              <p className="text-sm text-[#8e8e93] mt-1">Shifts</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl p-5 mb-5">
          <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
          <div className="mb-4">
            <p className="text-xs text-[#8e8e93] uppercase tracking-[1.5px] mb-1">EMAIL</p>
            <p className="text-white text-[17px]">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs text-[#8e8e93] uppercase tracking-[1.5px] mb-1">PHONE</p>
            <p className="text-white text-[17px]">{profile.phone}</p>
          </div>
        </div>

        {/* Certifications - Caregiver Only */}
        {isCaregiver && (
          <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl p-5">
            <h3 className="text-xl font-bold text-white mb-4">Certifications</h3>
            <div className="flex flex-wrap gap-2.5">
              {['CNA', 'CPR/First Aid', 'Dementia Care'].map((cert, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] rounded-xl text-[15px] font-semibold">
                  <Check className="w-4 h-4" />
                  {cert}
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

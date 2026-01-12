import React, { useState } from 'react';
import { ArrowLeft, Camera, Star, Award, Clock, CheckCircle, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900">Profile</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={profile.photo} 
              alt={profile.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-zinc-900 rounded-full cursor-pointer hover:bg-zinc-800 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mt-4">{profile.name}</h2>
          <p className="text-zinc-500">{profile.role}</p>
        </div>

        {/* Stats (Caregiver Only) */}
        {isCaregiver && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-50 rounded-xl p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-zinc-900">4.9</p>
              <p className="text-xs text-zinc-500">Rating</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-zinc-900">5</p>
              <p className="text-xs text-zinc-500">Years</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-zinc-900">234</p>
              <p className="text-xs text-zinc-500">Shifts</p>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-zinc-50 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-zinc-900">Contact Information</h3>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Email</label>
            <p className="text-zinc-900">{profile.email}</p>
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Phone</label>
            <p className="text-zinc-900">{profile.phone}</p>
          </div>
        </div>

        {/* Certifications (Caregiver Only) */}
        {isCaregiver && (
          <div className="bg-zinc-50 rounded-xl p-4">
            <h3 className="font-semibold text-zinc-900 mb-3">Certifications</h3>
            <div className="flex flex-wrap gap-2">
              {['CNA', 'CPR/First Aid', 'Dementia Care'].map((cert, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  ✓ {cert}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="w-full py-4 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          data-testid="sign-out-btn"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

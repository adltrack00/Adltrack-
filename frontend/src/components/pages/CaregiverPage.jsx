import React from 'react';
import { ArrowLeft, Star, Award, Clock, Phone, MessageCircle, Shield, CheckCircle } from 'lucide-react';

export const CaregiverPage = ({ onBack }) => {
  const caregiver = {
    name: 'Julia Martinez',
    role: 'Certified Nursing Assistant',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
    phone: '(555) 567-8901',
    rating: 4.9,
    yearsExperience: 5,
    shiftsCompleted: 234,
    certifications: ['CNA', 'CPR/First Aid', 'Dementia Care'],
    bio: 'Experienced caregiver with a passion for elderly care. Specialized in dementia and Alzheimer\'s patients.',
    currentShift: {
      status: 'Active',
      startTime: '8:00 AM',
      location: 'On-site'
    }
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-stone-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-stone-300" />
        </button>
        <h1 className="text-lg font-semibold text-white">Current Caregiver</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <img 
            src={caregiver.photo} 
            alt={caregiver.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-stone-800 shadow-lg"
          />
          <h2 className="text-xl font-bold text-white mt-4">{caregiver.name}</h2>
          <p className="text-stone-400">{caregiver.role}</p>
          
          {/* Shift Status */}
          <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Currently on shift</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{caregiver.rating}</p>
            <p className="text-xs text-stone-500">Rating</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
            <Award className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{caregiver.yearsExperience}</p>
            <p className="text-xs text-stone-500">Years Exp.</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{caregiver.shiftsCompleted}</p>
            <p className="text-xs text-stone-500">Shifts</p>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex gap-3">
          <a 
            href={`tel:${caregiver.phone}`}
            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call
          </a>
          <button className="flex-1 py-3 bg-stone-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-700 transition-colors">
            <MessageCircle className="w-5 h-5" />
            Message
          </button>
        </div>

        {/* About */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">About</h3>
          <p className="text-sm text-stone-400">{caregiver.bio}</p>
        </div>

        {/* Certifications */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Verified Certifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {caregiver.certifications.map((cert, idx) => (
              <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Current Shift Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Shift
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-blue-400/70">Started</p>
              <p className="font-medium text-white">{caregiver.currentShift.startTime}</p>
            </div>
            <div>
              <p className="text-blue-400/70">Location</p>
              <p className="font-medium text-white">{caregiver.currentShift.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverPage;

import React, { useState } from 'react';
import { ArrowLeft, Camera, Star, Award, CheckCircle, Check } from 'lucide-react';
import { UserRole } from '../../types';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  brandGlow: '0 4px 20px rgba(255,179,71,0.32)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
  shadowMd: '0 10px 30px -10px rgba(0,0,0,0.10)',
};

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
      reader.onloadend = () => setProfile(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }} data-testid="profile-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-3" style={{ background: D.card, borderBottom: `1px solid ${D.bdr}` }}>
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-xl transition-all"
          style={{ background: D.bg, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
          data-testid="profile-back-btn"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: D.h }} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: D.h }}>Profile</h1>
      </div>

      <div className="px-5 pb-24 overflow-y-auto">
        {/* Profile Photo */}
        <div className="flex flex-col items-center py-8">
          <div className="relative mb-5">
            <img
              src={profile.photo}
              alt={profile.name}
              className="w-36 h-36 rounded-full object-cover"
              style={{ border: `3px solid rgba(255,179,71,0.35)`, boxShadow: D.brandGlow }}
            />
            <label
              className="absolute bottom-1 right-1 w-11 h-11 rounded-full cursor-pointer flex items-center justify-center shadow-lg"
              style={{ background: D.brandGrad, boxShadow: D.brandGlow }}
            >
              <Camera className="w-5 h-5 text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: D.h }}>{profile.name}</h2>
          <p className="text-base mt-1 font-light" style={{ color: D.body }}>{profile.role}</p>
          {isCaregiver && (
            <span
              className="mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{ background: 'rgba(255,179,71,0.12)', color: D.brand, border: '1px solid rgba(255,179,71,0.28)' }}
            >
              On Shift
            </span>
          )}
        </div>

        {/* Stats - Caregiver Only */}
        {isCaregiver && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: <Star className="w-6 h-6" style={{ color: '#eab308' }} fill="#eab308" />, value: '4.9', label: 'Rating',
                grad: 'radial-gradient(circle at 50% 0%,rgba(234,179,8,0.22) 0%,rgba(254,249,195,0.10) 55%,#ffffff 85%)' },
              { icon: <Award className="w-6 h-6" style={{ color: '#3b82f6' }} />, value: '5', label: 'Years',
                grad: 'radial-gradient(circle at 50% 0%,rgba(96,165,250,0.22) 0%,rgba(219,234,254,0.10) 55%,#ffffff 85%)' },
              { icon: <CheckCircle className="w-6 h-6" style={{ color: '#b45309' }} />, value: '234', label: 'Shifts',
                grad: 'radial-gradient(circle at 50% 0%,rgba(255,179,71,0.22) 0%,rgba(255,237,213,0.10) 55%,#ffffff 85%)' },
            ].map(({ icon, value, label, grad }, i) => (
              <div key={i} className="rounded-2xl p-4 text-center" style={{ background: grad, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
                <div className="flex justify-center mb-2">{icon}</div>
                <p className="text-2xl font-bold" style={{ color: D.h }}>{value}</p>
                <p className="text-xs mt-1 font-light" style={{ color: D.muted }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Contact Info */}
        <div className="rounded-2xl p-5 mb-4" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: D.h }}>Contact Information</h3>
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: D.muted }}>EMAIL</p>
            <p className="text-[16px] font-medium" style={{ color: D.h }}>{profile.email}</p>
          </div>
          <div style={{ borderTop: `1px solid ${D.bdr}`, paddingTop: 16 }}>
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-1" style={{ color: D.muted }}>PHONE</p>
            <p className="text-[16px] font-medium" style={{ color: D.h }}>{profile.phone}</p>
          </div>
        </div>

        {/* Certifications - Caregiver Only */}
        {isCaregiver && (
          <div className="rounded-2xl p-5" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: D.h }}>Certifications</h3>
            <div className="flex flex-wrap gap-2.5">
              {['CNA', 'CPR/First Aid', 'Dementia Care'].map((cert, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[14px] font-semibold"
                  style={{ background: 'rgba(255,179,71,0.12)', border: '1px solid rgba(255,179,71,0.28)', color: D.brand }}
                >
                  <Check className="w-3.5 h-3.5" />
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

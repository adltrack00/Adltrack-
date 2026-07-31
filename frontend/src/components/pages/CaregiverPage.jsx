import React from 'react';
import { ArrowLeft, Star, Award, Clock, Phone, MessageCircle, Shield, CheckCircle } from 'lucide-react';

const D = {
  bg: '#0a1929', card: 'rgba(255,255,255,0.05)', bdr: 'rgba(255,255,255,0.08)',
  h: '#FFFFFF', body: 'rgba(255,255,255,0.55)', muted: 'rgba(255,255,255,0.36)',
  brand: '#00c896', brandText: '#FFFFFF',
};

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
    bio: "Experienced caregiver with a passion for elderly care. Specialized in dementia and Alzheimer's patients.",
    currentShift: { status: 'Active', startTime: '8:00 AM', location: 'On-site' },
  };

  return (
    <div style={{ minHeight: '100vh', background: D.bg, fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(10,25,41,0.95)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${D.bdr}`, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 10 }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${D.bdr}`, borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft style={{ width: 20, height: 20, color: D.body }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: D.h, margin: 0 }}>Current Caregiver</h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 8 }}>
          <img
            src={caregiver.photo}
            alt={caregiver.name}
            style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${D.bdr}` }}
          />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: D.h, margin: '16px 0 4px' }}>{caregiver.name}</h2>
          <p style={{ fontSize: 14, color: D.body, margin: 0 }}>{caregiver.role}</p>

          {/* Shift Status */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)', borderRadius: 24 }}>
            <div style={{ width: 8, height: 8, background: '#00c896', borderRadius: '50%' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00c896' }}>Currently on shift</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { icon: Star, value: caregiver.rating, label: 'Rating', color: D.brand },
            { icon: Award, value: caregiver.yearsExperience, label: 'Years Exp.', color: '#38bdf8' },
            { icon: CheckCircle, value: caregiver.shiftsCompleted, label: 'Shifts', color: '#00c896' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} style={{ background: D.card, border: `1px solid ${D.bdr}`, borderRadius: 14, padding: 16, textAlign: 'center', backdropFilter: 'blur(8px)' }}>
              <Icon style={{ width: 22, height: 22, color, margin: '0 auto 6px' }} />
              <p style={{ fontSize: 20, fontWeight: 700, color: D.h, margin: '0 0 2px' }}>{value}</p>
              <p style={{ fontSize: 12, color: D.muted, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Contact Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={`tel:${caregiver.phone}`}
            style={{ flex: 1, padding: '14px', background: D.brand, color: D.brandText, borderRadius: 14, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', border: 'none' }}
          >
            <Phone style={{ width: 18, height: 18 }} />
            Call
          </a>
          <button
            style={{ flex: 1, padding: '14px', background: D.card, color: D.h, borderRadius: 14, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: `1px solid ${D.bdr}`, cursor: 'pointer', backdropFilter: 'blur(8px)' }}
          >
            <MessageCircle style={{ width: 18, height: 18 }} />
            Message
          </button>
        </div>

        {/* About */}
        <div style={{ background: D.card, border: `1px solid ${D.bdr}`, borderRadius: 14, padding: 16, backdropFilter: 'blur(8px)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: D.h, marginBottom: 8 }}>About</h3>
          <p style={{ fontSize: 14, color: D.body, lineHeight: 1.6, margin: 0 }}>{caregiver.bio}</p>
        </div>

        {/* Certifications */}
        <div style={{ background: D.card, border: `1px solid ${D.bdr}`, borderRadius: 14, padding: 16, backdropFilter: 'blur(8px)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: D.h, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield style={{ width: 18, height: 18, color: '#38bdf8' }} />
            Verified Certifications
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {caregiver.certifications.map((cert, idx) => (
              <span
                key={idx}
                style={{ padding: '6px 12px', background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)', color: '#00c896', borderRadius: 20, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <CheckCircle style={{ width: 12, height: 12 }} />
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Current Shift Info */}
        <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 14, padding: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock style={{ width: 18, height: 18 }} />
            Current Shift
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
            <div>
              <p style={{ color: 'rgba(56,189,248,0.55)', margin: '0 0 2px' }}>Started</p>
              <p style={{ fontWeight: 700, color: D.h, margin: 0 }}>{caregiver.currentShift.startTime}</p>
            </div>
            <div>
              <p style={{ color: 'rgba(56,189,248,0.55)', margin: '0 0 2px' }}>Location</p>
              <p style={{ fontWeight: 700, color: D.h, margin: 0 }}>{caregiver.currentShift.location}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaregiverPage;

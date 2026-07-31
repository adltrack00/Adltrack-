import React from 'react';
import { ArrowLeft, Calendar, Bell, AlertTriangle, Clock, Pill, Activity } from 'lucide-react';

const D = {
  bg: '#0a1929', card: 'rgba(255,255,255,0.05)', bdr: 'rgba(255,255,255,0.08)',
  h: '#FFFFFF', body: 'rgba(255,255,255,0.55)', muted: 'rgba(255,255,255,0.36)',
  brand: '#00c896',
};

export const UpdatesPage = ({ onBack }) => {
  const upcomingSchedule = [
    { id: 1, title: 'Physical Therapy', time: '10:00 AM Tomorrow', type: 'appointment', icon: Activity },
    { id: 2, title: 'Doctor Visit', time: 'Dec 20, 2:30 PM', type: 'appointment', icon: Calendar },
    { id: 3, title: 'Medication Refill Due', time: 'Dec 22', type: 'reminder', icon: Pill },
  ];

  const alerts = [
    { id: 1, title: 'Care Plan Updated', desc: 'New evening routine added', time: '2 hours ago', priority: 'low' },
    { id: 2, title: 'Medication Schedule Change', desc: 'Evening meds moved to 6 PM', time: 'Yesterday', priority: 'medium' },
    { id: 3, title: 'Caregiver Assignment', desc: 'Julia will cover weekend shifts', time: '2 days ago', priority: 'low' },
  ];

  const alertStyle = (priority) => {
    if (priority === 'high') return { background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.20)' };
    if (priority === 'medium') return { background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' };
    return { background: D.card, border: `1px solid ${D.bdr}` };
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
        <h1 style={{ fontSize: 18, fontWeight: 700, color: D.h, margin: 0 }}>Notifications</h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Upcoming Schedule */}
        <div>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.brand, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar style={{ width: 14, height: 14 }} />
            Upcoming Schedule
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingSchedule.map((item) => (
              <div
                key={item.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: D.card, border: `1px solid ${D.bdr}`, borderRadius: 14, backdropFilter: 'blur(8px)' }}
              >
                <div style={{ width: 40, height: 40, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon style={{ width: 18, height: 18, color: '#38bdf8' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: D.h, margin: '0 0 2px' }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: D.muted, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock style={{ width: 11, height: 11 }} />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: D.brand, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell style={{ width: 14, height: 14 }} />
            Recent Alerts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{ padding: 16, borderRadius: 14, backdropFilter: 'blur(8px)', ...alertStyle(alert.priority) }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: D.h, margin: '0 0 4px' }}>{alert.title}</p>
                    <p style={{ fontSize: 13, color: D.body, margin: '0 0 8px' }}>{alert.desc}</p>
                    <p style={{ fontSize: 12, color: D.muted, margin: 0 }}>{alert.time}</p>
                  </div>
                  {alert.priority === 'high' && (
                    <AlertTriangle style={{ width: 18, height: 18, color: 'rgba(244,63,94,0.8)', flexShrink: 0, marginLeft: 8 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;

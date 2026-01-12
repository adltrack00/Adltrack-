import React from 'react';
import { ArrowLeft, Calendar, Bell, AlertTriangle, Clock, Pill, Activity } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900">Notifications</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Upcoming Schedule */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Schedule
          </h2>
          <div className="space-y-3">
            {upcomingSchedule.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-zinc-900">{item.title}</p>
                  <p className="text-sm text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Recent Alerts
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border ${
                  alert.priority === 'high' 
                    ? 'bg-red-50 border-red-100' 
                    : alert.priority === 'medium'
                    ? 'bg-amber-50 border-amber-100'
                    : 'bg-zinc-50 border-zinc-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900">{alert.title}</p>
                    <p className="text-sm text-zinc-600 mt-1">{alert.desc}</p>
                    <p className="text-xs text-zinc-400 mt-2">{alert.time}</p>
                  </div>
                  {alert.priority === 'high' && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
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

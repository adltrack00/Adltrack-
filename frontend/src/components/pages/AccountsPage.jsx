import React from 'react';
import { ArrowLeft, CreditCard, DollarSign, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { UserRole } from '../../types';

const D = {
  bg: '#0a1929', card: 'rgba(255,255,255,0.05)', bdr: 'rgba(255,255,255,0.08)',
  h: '#FFFFFF', body: 'rgba(255,255,255,0.55)', muted: 'rgba(255,255,255,0.36)',
  brand: '#00c896', brandText: '#FFFFFF',
  shadow: '0 4px 24px rgba(0,0,0,0.24)',
};

export const AccountsPage = ({ onBack, role }) => {
  const isCaregiver = role === UserRole.CAREGIVER;

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
        <h1 style={{ fontSize: 18, fontWeight: 700, color: D.h, margin: 0 }}>
          {isCaregiver ? 'Earnings' : 'Billing'}
        </h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Balance Card */}
        <div style={{
          background: isCaregiver ? 'linear-gradient(135deg,rgba(0,200,150,0.15),rgba(0,200,150,0.06))' : D.card,
          border: `1px solid ${isCaregiver ? 'rgba(0,200,150,0.25)' : D.bdr}`,
          borderRadius: 20, padding: 24, backdropFilter: 'blur(8px)',
        }}>
          <p style={{ fontSize: 13, color: D.body, marginBottom: 4 }}>
            {isCaregiver ? 'Available Balance' : 'Current Balance'}
          </p>
          <p style={{ fontSize: 36, fontWeight: 700, color: D.h, marginBottom: 16 }}>
            {isCaregiver ? '$1,247.50' : '$0.00'}
          </p>
          {isCaregiver ? (
            <button style={{ width: '100%', padding: '12px', background: D.brand, color: D.brandText, borderRadius: 12, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
              Withdraw Funds
            </button>
          ) : (
            <p style={{ fontSize: 13, color: D.muted }}>No outstanding balance</p>
          )}
        </div>

        {/* Quick Stats */}
        {isCaregiver && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: Calendar, label: 'This Week', value: '$485.00', color: '#38bdf8' },
              { icon: TrendingUp, label: 'This Month', value: '$1,892.50', color: '#00c896' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ background: D.card, border: `1px solid ${D.bdr}`, borderRadius: 14, padding: 16, backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon style={{ width: 16, height: 16, color }} />
                  <span style={{ fontSize: 12, color: D.muted }}>{label}</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 700, color: D.h, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Payment Method */}
        <div style={{ background: D.card, border: `1px solid ${D.bdr}`, borderRadius: 14, padding: 16, backdropFilter: 'blur(8px)' }}>
          <h3 style={{ fontWeight: 700, color: D.h, marginBottom: 16, fontSize: 15 }}>Payment Method</h3>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.bdr}`, borderRadius: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard style={{ width: 20, height: 20, color: '#38bdf8' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, color: D.h, margin: 0, fontSize: 14 }}>•••• 4242</p>
                <p style={{ fontSize: 12, color: D.muted, margin: 0 }}>Visa ending in 4242</p>
              </div>
            </div>
            <ChevronRight style={{ width: 18, height: 18, color: D.muted }} />
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 style={{ fontWeight: 700, color: D.h, marginBottom: 16, fontSize: 15 }}>Recent Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { desc: isCaregiver ? 'Shift Payment — Dec 15' : 'Care Service — Dec 15', amount: isCaregiver ? '+$125.00' : '−$125.00', status: 'Completed' },
              { desc: isCaregiver ? 'Shift Payment — Dec 14' : 'Care Service — Dec 14', amount: isCaregiver ? '+$150.00' : '−$150.00', status: 'Completed' },
              { desc: isCaregiver ? 'Shift Payment — Dec 13' : 'Care Service — Dec 13', amount: isCaregiver ? '+$100.00' : '−$100.00', status: 'Completed' },
            ].map((tx, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: D.card, border: `1px solid ${D.bdr}`, borderRadius: 14, backdropFilter: 'blur(8px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCaregiver ? 'rgba(0,200,150,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isCaregiver ? 'rgba(0,200,150,0.2)' : D.bdr}` }}>
                    <DollarSign style={{ width: 18, height: 18, color: isCaregiver ? '#00c896' : D.muted }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: D.h, margin: '0 0 2px', fontSize: 14 }}>{tx.desc}</p>
                    <p style={{ fontSize: 12, color: D.muted, margin: 0 }}>{tx.status}</p>
                  </div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: isCaregiver ? '#00c896' : D.body }}>
                  {tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;

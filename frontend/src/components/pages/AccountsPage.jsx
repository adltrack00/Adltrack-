import React from 'react';
import { ArrowLeft, CreditCard, DollarSign, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { UserRole } from '../../types';

export const AccountsPage = ({ onBack, role }) => {
  const isCaregiver = role === UserRole.CAREGIVER;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-zinc-100 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900">
          {isCaregiver ? 'Earnings' : 'Billing'}
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <div className={`${isCaregiver ? 'bg-green-500' : 'bg-zinc-900'} rounded-2xl p-6 text-white`}>
          <p className="text-sm opacity-80 mb-1">
            {isCaregiver ? 'Available Balance' : 'Current Balance'}
          </p>
          <p className="text-4xl font-bold mb-4">
            {isCaregiver ? '$1,247.50' : '$0.00'}
          </p>
          {isCaregiver ? (
            <button className="w-full py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-zinc-100 transition-colors">
              Withdraw Funds
            </button>
          ) : (
            <p className="text-sm opacity-80">No outstanding balance</p>
          )}
        </div>

        {/* Quick Stats */}
        {isCaregiver && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">This Week</span>
              </div>
              <p className="text-xl font-bold text-zinc-900">$485.00</p>
            </div>
            <div className="bg-zinc-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-zinc-500">This Month</span>
              </div>
              <p className="text-xl font-bold text-zinc-900">$1,892.50</p>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-zinc-50 rounded-xl p-4">
          <h3 className="font-semibold text-zinc-900 mb-4">Payment Method</h3>
          <button className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-zinc-900">•••• 4242</p>
                <p className="text-xs text-zinc-500">Visa ending in 4242</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="font-semibold text-zinc-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { desc: isCaregiver ? 'Shift Payment - Dec 15' : 'Care Service - Dec 15', amount: isCaregiver ? '+$125.00' : '-$125.00', status: 'Completed' },
              { desc: isCaregiver ? 'Shift Payment - Dec 14' : 'Care Service - Dec 14', amount: isCaregiver ? '+$150.00' : '-$150.00', status: 'Completed' },
              { desc: isCaregiver ? 'Shift Payment - Dec 13' : 'Care Service - Dec 13', amount: isCaregiver ? '+$100.00' : '-$100.00', status: 'Completed' },
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCaregiver ? 'bg-green-100' : 'bg-zinc-200'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${isCaregiver ? 'text-green-600' : 'text-zinc-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{tx.desc}</p>
                    <p className="text-xs text-zinc-500">{tx.status}</p>
                  </div>
                </div>
                <span className={`font-semibold ${isCaregiver ? 'text-green-600' : 'text-zinc-900'}`}>
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

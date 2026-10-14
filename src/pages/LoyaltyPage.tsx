import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  Sparkles,
  Settings2,
  TrendingUp,
  Users,
  CheckCircle,
  X,
  CreditCard,
  Gift,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const LoyaltyPage: React.FC = () => {
  const { db, updateLoyaltySettings } = useApp();

  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [earnRateInput, setEarnRateInput] = useState<number>(db.loyaltySettings.earnRate);
  const [redeemRateInput, setRedeemRateInput] = useState<number>(db.loyaltySettings.redeemRate);
  const [minRedeemInput, setMinRedeemInput] = useState<number>(db.loyaltySettings.minRedeem);

  // 14 days points data
  const now = Date.now();
  const loyaltyData: { date: string; issued: number; redeemed: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    // Deterministic simulation matching reference
    const issued = Math.round(750 + ((i * 123 + 45) % 650));
    const redeemed = Math.round(200 + ((i * 87 + 12) % 300));
    loyaltyData.push({
      date: `${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })}`,
      issued,
      redeemed,
    });
  }

  const totalPoints = db.customers.reduce((sum, c) => sum + c.points, 0);
  const topMembers = [...db.customers].sort((a, b) => b.points - a.points).slice(0, 8);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateLoyaltySettings({
      earnRate: earnRateInput,
      redeemRate: redeemRateInput,
      minRedeem: minRedeemInput,
    });
    setShowConfigModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Settings Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold font-display text-espresso-950">Loyalty Program</h2>
          <p className="text-xs text-espresso-500 font-medium">
            {db.loyaltySettings.enabled
              ? `Active · ${db.loyaltySettings.earnRate} points per ₹100`
              : 'Loyalty program currently paused'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-espresso-800">Program active</span>
            <input
              type="checkbox"
              checked={db.loyaltySettings.enabled}
              onChange={(e) => updateLoyaltySettings({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-espresso-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-espresso-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sage-600" />
          </label>

          <button
            type="button"
            onClick={() => {
              setEarnRateInput(db.loyaltySettings.earnRate);
              setRedeemRateInput(db.loyaltySettings.redeemRate);
              setMinRedeemInput(db.loyaltySettings.minRedeem);
              setShowConfigModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure rules</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Points Issued (14d)
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">14,484</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Points Redeemed (14d)
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">4,700</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Outstanding Balance
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {totalPoints.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-terracotta-600 font-semibold">
            ₹{(totalPoints / 1000).toFixed(1)}K liability
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Enrolled Members
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.customers.length}
          </div>
          <span className="text-[11px] text-sage-700 font-semibold">100% of customers</span>
        </div>
      </div>

      {/* Chart & Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg text-espresso-950">
              Points issued vs redeemed
            </h3>
            <p className="text-xs text-espresso-500">Last 14 days volume</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loyaltyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#38261F', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="issued" name="Issued" fill="#38261F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="redeemed" name="Redeemed" fill="#C87553" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-cream-50 rounded-xl border border-espresso-100 text-xs text-espresso-700 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-terracotta-500 flex-shrink-0 mt-0.5" />
            <p>
              Redemption is running well below issuance — points are piling up, which is a good moment for a double-points weekend or exclusive loyalty rewards promotion.
            </p>
          </div>
        </div>

        {/* Program Rules Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-display font-bold text-base text-espresso-950">Program rules</h3>
              <p className="text-xs text-espresso-500">Current earning and redemption rates</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
                <div>
                  <span className="text-espresso-500 block">Earn Rate</span>
                  <span className="font-bold text-espresso-950 text-sm">
                    {db.loyaltySettings.earnRate} points per ₹100
                  </span>
                </div>
                <Gift className="w-5 h-5 text-terracotta-500" />
              </div>

              <div className="p-3 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
                <div>
                  <span className="text-espresso-500 block">Redemption Value</span>
                  <span className="font-bold text-espresso-950 text-sm">
                    1 point = ₹{db.loyaltySettings.redeemRate.toFixed(2)}
                  </span>
                </div>
                <CreditCard className="w-5 h-5 text-sage-600" />
              </div>

              <div className="p-3 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
                <div>
                  <span className="text-espresso-500 block">Minimum Threshold</span>
                  <span className="font-bold text-espresso-950 text-sm">
                    {db.loyaltySettings.minRedeem} points
                  </span>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-espresso-100 text-center">
            <span className="text-[11px] text-espresso-500">
              Auto-synced with POS cart settlement
            </span>
          </div>
        </div>
      </div>

      {/* Top Members Leaderboard */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-espresso-100">
          <h3 className="font-display font-bold text-base text-espresso-950">Top members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Points Balance</th>
                <th className="py-3 px-4 text-right">Visits</th>
                <th className="py-3 px-4 text-right">Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {topMembers.map((m, idx) => (
                <tr key={m.id} className="hover:bg-cream-50/70">
                  <td className="py-3 px-4 font-bold text-espresso-950 flex items-center gap-2">
                    <span className="font-mono text-espresso-400 w-4">#{idx + 1}</span>
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-espresso-600">{m.phone}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-100 text-purple-800">
                      {m.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-terracotta-600">
                    {m.points}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-espresso-700">{m.visits}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-espresso-950">
                    ₹{m.spend.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Rules Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRules}
            className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">
                Configure Loyalty Rules
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Points Earned per ₹100 spent</label>
              <input
                type="number"
                min="1"
                required
                value={earnRateInput}
                onChange={(e) => setEarnRateInput(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Rupee value per 1 point (₹)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={redeemRateInput}
                onChange={(e) => setRedeemRateInput(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Minimum points to redeem</label>
              <input
                type="number"
                min="10"
                required
                value={minRedeemInput}
                onChange={(e) => setMinRedeemInput(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-espresso-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white font-bold shadow-2xs"
              >
                Save Rules
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

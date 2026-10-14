import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import {
  Users,
  Search,
  Plus,
  Download,
  Award,
  Calendar,
  X,
  CreditCard,
  Phone,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { db, addCustomer } = useApp();

  const [activeTab, setActiveTab] = useState<'recent' | 'spend' | 'points'>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Form State
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newTier, setNewTier] = useState<'Silver' | 'Gold' | 'Platinum'>('Silver');

  // Filter & Sort
  const filteredCustomers = db.customers
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    })
    .sort((a, b) => {
      if (activeTab === 'recent') return b.lastVisit - a.lastVisit;
      if (activeTab === 'spend') return b.spend - a.spend;
      if (activeTab === 'points') return b.points - a.points;
      return 0;
    });

  const totalPoints = db.customers.reduce((sum, c) => sum + c.points, 0);
  const totalSpend = db.customers.reduce((sum, c) => sum + c.spend, 0);

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Phone', 'Tier', 'Visits', 'Total Spend', 'Points', 'Last Visit'];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.phone,
      c.tier,
      c.visits,
      c.spend,
      c.points,
      new Date(c.lastVisit).toLocaleDateString('en-GB'),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `morrow-bean-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      tier: newTier,
    });
    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
  };

  // Get orders for selected customer
  const customerOrders = selectedCustomer
    ? db.orders.filter((o) => o.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold font-display text-espresso-950">Customers</h2>
          <p className="text-xs text-espresso-500 font-medium">
            {db.customers.length} in the local database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-espresso-200 hover:bg-cream-100 text-xs font-bold text-espresso-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add customer</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Total Customers
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.customers.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Active (30 days)
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.customers.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Points Outstanding
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {totalPoints.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-terracotta-600 font-semibold">
            ≈ ₹{(totalPoints / 1000).toFixed(1)}K liability
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Lifetime Value
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            ₹{(totalSpend / 100000).toFixed(2)} L
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'recent' ? 'bg-white text-espresso-950 shadow-2xs' : 'text-espresso-600'
              }`}
            >
              Recent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('spend')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'spend' ? 'bg-white text-espresso-950 shadow-2xs' : 'text-espresso-600'
              }`}
            >
              Top spend
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('points')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'points' ? 'bg-white text-espresso-950 shadow-2xs' : 'text-espresso-600'
              }`}
            >
              Most points
            </button>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name or mobile number…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cream-50 rounded-xl border border-espresso-100 text-xs text-espresso-900 placeholder:text-espresso-400 focus:outline-hidden focus:border-terracotta-500"
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Visits</th>
                <th className="py-3 px-4 text-right">Spend</th>
                <th className="py-3 px-4 text-right">Points</th>
                <th className="py-3 px-4 text-right">Last Visit</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-cream-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cream-100 text-espresso-800 font-bold flex items-center justify-center text-xs">
                        {cust.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="font-bold text-espresso-950">{cust.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-espresso-700">{cust.phone}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cust.tier === 'Platinum'
                          ? 'bg-purple-100 text-purple-800'
                          : cust.tier === 'Gold'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-cream-200 text-espresso-700'
                      }`}
                    >
                      {cust.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-espresso-800">
                    {cust.visits}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-espresso-950">
                    ₹{cust.spend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-terracotta-600">
                    {cust.points}
                  </td>
                  <td className="py-3 px-4 text-right text-espresso-500 whitespace-nowrap">
                    {new Date(cust.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1 rounded-lg border border-espresso-200 text-espresso-800 hover:bg-cream-100 font-bold text-xs"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-espresso-800 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {selectedCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-espresso-950">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-espresso-500 font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-cream-100/60 rounded-2xl border border-espresso-100 text-center">
                <div>
                  <span className="text-[10px] text-espresso-500 uppercase font-semibold">Tier</span>
                  <div className="font-bold text-sm text-espresso-950">{selectedCustomer.tier}</div>
                </div>
                <div>
                  <span className="text-[10px] text-espresso-500 uppercase font-semibold">Points</span>
                  <div className="font-bold text-sm text-terracotta-600">{selectedCustomer.points} pts</div>
                </div>
                <div>
                  <span className="text-[10px] text-espresso-500 uppercase font-semibold">Total Spend</span>
                  <div className="font-bold text-sm text-espresso-950">₹{selectedCustomer.spend.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-2">
                <h4 className="font-bold text-espresso-900 uppercase tracking-wider text-[11px]">
                  Order History ({customerOrders.length})
                </h4>
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-espresso-400 py-4 text-center">
                    No recent bills recorded in the active shift.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl border border-espresso-100 bg-cream-50/50 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-espresso-950">
                            Bill #{o.billNo} · {o.type}
                          </div>
                          <div className="text-[10px] text-espresso-500">
                            {new Date(o.createdAt).toLocaleString()} · {o.items.length} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-espresso-950">₹{o.total}</div>
                          <span className="text-[10px] font-semibold text-sage-700">{o.payment.mode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-espresso-800 text-white font-bold text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCustomer}
            className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">Add Customer</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Arun Nair"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Mobile Number</label>
              <input
                type="text"
                required
                placeholder="10-digit mobile"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Initial Loyalty Tier</label>
              <select
                value={newTier}
                onChange={(e: any) => setNewTier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 bg-white text-espresso-900"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-espresso-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white font-bold shadow-2xs"
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

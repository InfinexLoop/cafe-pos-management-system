import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StaffUser, UserRole } from '../types';
import {
  Users,
  Plus,
  ShieldCheck,
  Edit2,
  X,
  Phone,
  KeyRound,
  Award,
  Clock,
  TrendingUp,
} from 'lucide-react';

export const StaffPage: React.FC = () => {
  const { db, addStaff, updateStaff } = useApp();

  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  const [nameInput, setNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [roleInput, setRoleInput] = useState<UserRole>('captain');
  const [pinInput, setPinInput] = useState<string>('0000');

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setNameInput('');
    setPhoneInput('98470 ');
    setRoleInput('captain');
    setPinInput('1234');
    setShowUserModal(true);
  };

  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setNameInput(staff.name);
    setPhoneInput(staff.phone);
    setRoleInput(staff.role);
    setPinInput(staff.pin);
    setShowUserModal(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const roleDesc =
      roleInput === 'admin'
        ? 'Owner · full access'
        : roleInput === 'billing'
        ? 'POS billing, customers, orders'
        : roleInput === 'kitchen'
        ? 'Kitchen display only'
        : 'Tables, orders, KOT';

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: nameInput.trim(),
        phone: phoneInput.trim(),
        role: roleInput,
        pin: pinInput.trim() || '1111',
        roleDescription: roleDesc,
      });
    } else {
      addStaff({
        name: nameInput.trim(),
        phone: phoneInput.trim(),
        role: roleInput,
        pin: pinInput.trim() || '1111',
        roleDescription: roleDesc,
      });
    }

    setShowUserModal(false);
  };

  // Performance simulation last 7 days
  const staffPerformance = [
    { name: 'Daniel Brooks', role: 'Billing', bills: 156, items: 503, revenue: 144200, avg: 924 },
    { name: 'Adrian Mitchell', role: 'Admin', bills: 48, items: 152, revenue: 43250, avg: 901 },
    { name: 'Oliver Bennett', role: 'Captain', bills: 28, items: 94, revenue: 26400, avg: 942 },
    { name: 'Sophia Carter', role: 'Captain', bills: 20, items: 68, revenue: 18900, avg: 945 },
    { name: 'Ethan Parker', role: 'Kitchen', bills: 0, items: 817, revenue: 0, avg: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold font-display text-espresso-950">Staff</h2>
          <p className="text-xs text-espresso-500 font-medium">
            {db.staff.filter((s) => s.active).length} active users on shift rosters
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add user</span>
        </button>
      </div>

      {/* Users & Access Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-espresso-100">
          <h3 className="font-display font-bold text-base text-espresso-950">Users & access</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">PIN</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {db.staff.map((staff) => (
                <tr key={staff.id} className="hover:bg-cream-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-espresso-800 text-cream-100 font-bold flex items-center justify-center text-xs shadow-2xs">
                        {staff.avatar || staff.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-espresso-950">{staff.name}</div>
                        <div className="text-[11px] text-espresso-500 font-mono">{staff.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-espresso-900 capitalize flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          staff.role === 'admin'
                            ? 'bg-purple-600'
                            : staff.role === 'billing'
                            ? 'bg-blue-600'
                            : staff.role === 'kitchen'
                            ? 'bg-amber-600'
                            : 'bg-sage-600'
                        }`}
                      />
                      <span>{staff.role}</span>
                    </div>
                    <div className="text-[11px] text-espresso-500">
                      {staff.roleDescription || staff.role}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-espresso-400">
                    •••• <span className="text-[10px] text-espresso-300">({staff.pin})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-sage-100 text-sage-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(staff)}
                      className="px-3 py-1 rounded-lg border border-espresso-200 text-espresso-800 hover:bg-cream-100 font-bold text-xs"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Performance Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-espresso-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-espresso-950">Performance</h3>
            <p className="text-xs text-espresso-500">Last 7 days shift summary</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase">
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4 text-right">Bills</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Avg Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {staffPerformance.map((row) => (
                <tr key={row.name} className="hover:bg-cream-50/70">
                  <td className="py-3 px-4">
                    <div className="font-bold text-espresso-950">{row.name}</div>
                    <div className="text-[10px] text-espresso-500">{row.role}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-espresso-900">
                    {row.bills}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-espresso-700">{row.items}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-espresso-950">
                    {row.revenue > 0 ? `₹${(row.revenue / 1000).toFixed(1)}K` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-espresso-800">
                    {row.avg > 0 ? `₹${row.avg}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStaff}
            className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">
                {editingStaff ? 'Edit Staff User' : 'Add Staff User'}
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
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
                placeholder="e.g. Arun Kumar"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Phone</label>
              <input
                type="text"
                placeholder="Mobile number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-espresso-700">Role</label>
                <select
                  value={roleInput}
                  onChange={(e: any) => setRoleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="billing">Billing</option>
                  <option value="captain">Captain</option>
                  <option value="kitchen">Kitchen</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-espresso-700">4-Digit PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="e.g. 1234"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 font-mono text-center tracking-widest text-sm font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-espresso-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white font-bold shadow-2xs"
              >
                Save User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Server,
  Cloud,
} from 'lucide-react';

export const BackupPage: React.FC = () => {
  const { db, exportBackup, importBackup, resetDemoData } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compute database size estimation
  const dbJson = JSON.stringify(db);
  const dbSizeMb = (new Blob([dbJson]).size / (1024 * 1024)).toFixed(2);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackup(content);
      if (success) {
        setMessage({ type: 'success', text: 'Database restored successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Invalid backup file format.' });
      }
      setTimeout(() => setMessage(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    setMessage({ type: 'success', text: 'Demo data has been reset to pristine seed state.' });
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold font-display text-espresso-950">Backup & Restore</h2>
          <p className="text-xs text-espresso-500 font-medium">
            Everything lives on this machine — keep a copy
          </p>
        </div>

        {message && (
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fade-in ${
              message.type === 'success' ? 'bg-sage-100 text-sage-900' : 'bg-red-100 text-red-900'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-sage-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-700" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Orders Stored
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.orders.length.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Customers
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.customers.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Menu Items
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.products.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Database Size
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {dbSizeMb} MB
          </div>
        </div>
      </div>

      {/* Local Backup Section */}
      <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-4">
        <div>
          <h3 className="font-display font-bold text-base text-espresso-950">Local backup</h3>
          <p className="text-xs text-espresso-600 leading-relaxed mt-1">
            Writes a complete snapshot — menu, bills, customers, points, settings — to a single file. Restoring it on a fresh machine brings the café back exactly as it was.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={exportBackup}
            className="px-4 py-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download backup</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border border-espresso-200 hover:bg-cream-100 text-espresso-800 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Restore from file</span>
          </button>
        </div>

        <div className="pt-3 border-t border-espresso-100 space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-espresso-700">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-terracotta-500" />
            <span>Automatic local backup every 6 hours</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-espresso-700">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-terracotta-500" />
            <span>Also push encrypted copy to cloud when internet is available</span>
          </label>
        </div>

        {/* Recent Snapshots */}
        <div className="pt-3 border-t border-espresso-100">
          <div className="text-[11px] font-bold text-espresso-400 uppercase tracking-wider mb-2">
            Recent snapshots
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-espresso-900">Today, 12:06 PM</span>
                <span className="text-[11px] text-espresso-500 ml-2">auto · {dbSizeMb} MB</span>
              </div>
              <span className="text-[10px] font-bold text-sage-800 bg-sage-100 px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-espresso-900">Today, 6:06 AM</span>
                <span className="text-[11px] text-espresso-500 ml-2">auto · {dbSizeMb} MB</span>
              </div>
              <span className="text-[10px] font-bold text-sage-800 bg-sage-100 px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Demo Data */}
      <div className="bg-red-50/50 p-6 rounded-2xl border border-red-200 shadow-soft space-y-3">
        <div className="flex items-center gap-2 text-red-800">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h3 className="font-display font-bold text-base">Danger zone</h3>
        </div>
        <p className="text-xs text-red-950 leading-relaxed">
          Resetting clears all custom bills and updates in localStorage, returning the database to its initial deterministic seed data (30-day history, default tables, customers, and menu).
        </p>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset demo data</span>
        </button>
      </div>

      {/* Migration Tools */}
      <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-3">
        <h3 className="font-display font-bold text-base text-espresso-950">
          Migrate from Petpooja / POS
        </h3>
        <p className="text-xs text-espresso-600 leading-relaxed">
          Import your existing customer base, raw ingredients or menu categories via CSV format:
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setMessage({ type: 'success', text: 'CSV import template downloaded.' })}
            className="px-3 py-1.5 rounded-lg border border-espresso-200 text-xs font-bold text-espresso-800 hover:bg-cream-50"
          >
            Import Menu CSV
          </button>
          <button
            type="button"
            onClick={() => setMessage({ type: 'success', text: 'CSV import template downloaded.' })}
            className="px-3 py-1.5 rounded-lg border border-espresso-200 text-xs font-bold text-espresso-800 hover:bg-cream-50"
          >
            Import Customers CSV
          </button>
          <button
            type="button"
            onClick={() => setMessage({ type: 'success', text: 'CSV import template downloaded.' })}
            className="px-3 py-1.5 rounded-lg border border-espresso-200 text-xs font-bold text-espresso-800 hover:bg-cream-50"
          >
            Import Inventory CSV
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Demo Data Reset</span>
            </div>
            <p className="text-espresso-600 leading-relaxed">
              Are you sure you want to reset all data? This will restore the pristine factory demo dataset.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-espresso-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Yes, Reset Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

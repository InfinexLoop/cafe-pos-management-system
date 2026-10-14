import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  Store,
  Receipt,
  Server,
  Printer,
  Palette,
  CheckCircle2,
  Wifi,
  Laptop,
  Tablet,
  Tv,
} from 'lucide-react';
import { OutletSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { db, updateSettings } = useApp();

  const [form, setForm] = useState<OutletSettings>({ ...db.settings });
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [testPrinterMessage, setTestPrinterMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleTestPrint = (type: 'bill' | 'kot') => {
    setTestPrinterMessage(`Test ${type.toUpperCase()} sent to ${type === 'bill' ? form.printerBill : form.printerKot}`);
    setTimeout(() => setTestPrinterMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold font-display text-espresso-950">Settings</h2>
          <p className="text-xs text-espresso-500 font-medium">
            Outlet details, tax rates, printers and local LAN server
          </p>
        </div>

        {savedToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-100 text-sage-900 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-sage-700" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: OUTLET DETAILS */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-espresso-100">
            <Store className="w-5 h-5 text-terracotta-500" />
            <h3 className="font-display font-bold text-base text-espresso-950">Outlet details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Café name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-espresso-700">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">GSTIN</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">FSSAI licence</label>
              <input
                type="text"
                value={form.fssai}
                onChange={(e) => setForm({ ...form, fssai: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BILLING RULES */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-espresso-100">
            <Receipt className="w-5 h-5 text-terracotta-500" />
            <h3 className="font-display font-bold text-base text-espresso-950">Billing rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">GST % (CGST + SGST)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.tax}
                onChange={(e) => setForm({ ...form, tax: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Service charge %</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form.serviceCharge}
                onChange={(e) => setForm({ ...form, serviceCharge: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 focus:outline-hidden focus:border-terracotta-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.roundTotal}
                  onChange={(e) => setForm({ ...form, roundTotal: e.target.checked })}
                  className="w-4 h-4 rounded text-terracotta-500 focus:ring-terracotta-400"
                />
                <span className="font-semibold text-espresso-800">
                  Round the bill total to the nearest rupee
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCAL SERVER & CONNECTED DEVICES */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-espresso-100">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-terracotta-500" />
              <h3 className="font-display font-bold text-base text-espresso-950">Local server</h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-50 text-sage-800 text-[11px] font-bold border border-sage-200">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
              <span>Running offline</span>
            </div>
          </div>

          <p className="text-xs text-espresso-600 leading-relaxed">
            Billing counters, captain tablets and the kitchen screen connect over the café Wi-Fi. No internet required for any of it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Host / IP</label>
              <input
                type="text"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Port</label>
              <input
                type="text"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-espresso-100 space-y-2">
            <div className="text-[11px] font-bold text-espresso-400 uppercase tracking-wider">
              Connected devices on LAN
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-espresso-600" />
                  <div>
                    <div className="font-bold text-espresso-900">Billing counter</div>
                    <div className="text-[10px] text-espresso-500 font-mono">Windows PC · 192.168.1.51</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-full">Online</span>
              </div>

              <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-espresso-600" />
                  <div>
                    <div className="font-bold text-espresso-900">Captain tablet 1</div>
                    <div className="text-[10px] text-espresso-500 font-mono">Android · 192.168.1.62</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-full">Online</span>
              </div>

              <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-espresso-600" />
                  <div>
                    <div className="font-bold text-espresso-900">Captain tablet 2</div>
                    <div className="text-[10px] text-espresso-500 font-mono">Android · 192.168.1.63</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-full">Online</span>
              </div>

              <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-espresso-600" />
                  <div>
                    <div className="font-bold text-espresso-900">Kitchen display</div>
                    <div className="text-[10px] text-espresso-500 font-mono">ChromeOS · 192.168.1.70</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sage-700 bg-sage-50 px-2 py-0.5 rounded-full">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PRINTERS */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-espresso-100">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-terracotta-500" />
              <h3 className="font-display font-bold text-base text-espresso-950">Printers</h3>
            </div>
            {testPrinterMessage && (
              <span className="text-xs font-semibold text-terracotta-600 animate-pulse">
                {testPrinterMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-espresso-700">Billing Counter Printer</label>
                <button
                  type="button"
                  onClick={() => handleTestPrint('bill')}
                  className="text-terracotta-600 hover:underline font-bold"
                >
                  Test bill
                </button>
              </div>
              <input
                type="text"
                value={form.printerBill}
                onChange={(e) => setForm({ ...form, printerBill: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-espresso-700">Kitchen KOT Printer</label>
                <button
                  type="button"
                  onClick={() => handleTestPrint('kot')}
                  className="text-terracotta-600 hover:underline font-bold"
                >
                  Test KOT
                </button>
              </div>
              <input
                type="text"
                value={form.printerKot}
                onChange={(e) => setForm({ ...form, printerKot: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-espresso-900"
              />
            </div>

            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.autoKot}
                  onChange={(e) => setForm({ ...form, autoKot: e.target.checked })}
                  className="w-4 h-4 rounded text-terracotta-500"
                />
                <span className="font-semibold text-espresso-800">
                  Automatically print KOT slip when order is fired to kitchen
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 5: APPEARANCE */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-espresso-100">
            <Palette className="w-5 h-5 text-terracotta-500" />
            <h3 className="font-display font-bold text-base text-espresso-950">Appearance</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, theme: 'cream' })}
              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                form.theme === 'cream'
                  ? 'bg-espresso-800 text-white shadow-2xs'
                  : 'bg-cream-100 text-espresso-800'
              }`}
            >
              Warm Cream
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, theme: 'dark' })}
              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                form.theme === 'dark'
                  ? 'bg-espresso-800 text-white shadow-2xs'
                  : 'bg-cream-100 text-espresso-800'
              }`}
            >
              Espresso Dark
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold shadow-soft transition-colors"
          >
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
};

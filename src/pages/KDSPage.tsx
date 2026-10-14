import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KOT, KOTStatus } from '../types';
import {
  ChefHat,
  Clock,
  Printer,
  CheckCircle2,
  Play,
  Check,
  Flame,
  Coffee,
  X,
  Volume2,
} from 'lucide-react';
import { BRAND } from '../lib/branding';

export const KDSPage: React.FC = () => {
  const { db, updateKOTStatus } = useApp();

  const [activeStation, setActiveStation] = useState<'all' | 'hot' | 'bev'>('all');
  const [selectedKotSlip, setSelectedKotSlip] = useState<KOT | null>(null);

  const filteredKots = db.kots.filter((kot) => {
    if (kot.status === 'served') return false;
    if (activeStation !== 'all' && kot.station !== activeStation) return false;
    return true;
  });

  const newOrders = filteredKots.filter((k) => k.status === 'new');
  const preparingOrders = filteredKots.filter((k) => k.status === 'preparing');
  const readyOrders = filteredKots.filter((k) => k.status === 'ready');

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Station Filter Tabs & Ticket Counts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStation('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStation === 'all'
                ? 'bg-espresso-800 text-white shadow-2xs'
                : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
            }`}
          >
            All stations
          </button>
          <button
            type="button"
            onClick={() => setActiveStation('hot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStation === 'hot'
                ? 'bg-espresso-800 text-white shadow-2xs'
                : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Hot kitchen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStation('bev')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeStation === 'bev'
                ? 'bg-espresso-800 text-white shadow-2xs'
                : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Beverages</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
            {newOrders.length} new
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
            {preparingOrders.length} preparing
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sage-100 text-sage-800">
            {readyOrders.length} ready
          </span>
        </div>
      </div>

      {/* 3 Columns: New Orders -> Preparing -> Ready to Serve */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* COLUMN 1: NEW ORDERS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-400">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-espresso-950 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>New Orders</span>
            </h3>
            <span className="font-mono font-bold text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-4">
            {newOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-espresso-100 text-center text-xs text-espresso-400">
                No new orders waiting.
              </div>
            ) : (
              newOrders.map((kot) => {
                const minsAgo = Math.max(1, Math.round((Date.now() - kot.createdAt) / 60000));
                return (
                  <div
                    key={kot.id}
                    className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-card space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-base text-espresso-950">
                          #{kot.kotNo}
                        </span>
                        <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-espresso-800 text-white">
                          {kot.tableName}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{minsAgo} min</span>
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 divide-y divide-espresso-50 text-xs pt-1">
                      {kot.items.map((item, idx) => (
                        <div key={idx} className="pt-1.5">
                          <div className="flex items-start justify-between font-bold text-espresso-900">
                            <span>
                              <span className="text-terracotta-600 font-extrabold text-sm mr-1.5">
                                {item.quantity}×
                              </span>
                              {item.product.name}
                            </span>
                            {item.variant && (
                              <span className="text-xs text-espresso-500 font-normal">
                                {item.variant.name}
                              </span>
                            )}
                          </div>
                          {item.kitchenNote && (
                            <div className="text-[11px] text-amber-800 font-semibold italic mt-0.5 pl-5">
                              Note: {item.kitchenNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-espresso-100">
                      <button
                        type="button"
                        onClick={() => setSelectedKotSlip(kot)}
                        className="py-1.5 px-3 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700 hover:bg-cream-50 flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>KOT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateKOTStatus(kot.id, 'preparing')}
                        className="flex-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start preparing</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-blue-400">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-espresso-950 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Preparing</span>
            </h3>
            <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-espresso-100 text-center text-xs text-espresso-400">
                No orders being prepped.
              </div>
            ) : (
              preparingOrders.map((kot) => {
                const minsAgo = Math.max(1, Math.round((Date.now() - kot.createdAt) / 60000));
                return (
                  <div
                    key={kot.id}
                    className="p-4 rounded-2xl bg-white border border-blue-200 shadow-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-base text-espresso-950">
                          #{kot.kotNo}
                        </span>
                        <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-espresso-800 text-white">
                          {kot.tableName}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-blue-700 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{minsAgo} min</span>
                      </span>
                    </div>

                    <div className="space-y-2 divide-y divide-espresso-50 text-xs pt-1">
                      {kot.items.map((item, idx) => (
                        <div key={idx} className="pt-1.5">
                          <div className="flex items-start justify-between font-bold text-espresso-900">
                            <span>
                              <span className="text-blue-600 font-extrabold text-sm mr-1.5">
                                {item.quantity}×
                              </span>
                              {item.product.name}
                            </span>
                            {item.variant && (
                              <span className="text-xs text-espresso-500 font-normal">
                                {item.variant.name}
                              </span>
                            )}
                          </div>
                          {item.kitchenNote && (
                            <div className="text-[11px] text-amber-800 font-semibold italic mt-0.5 pl-5">
                              Note: {item.kitchenNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-espresso-100">
                      <button
                        type="button"
                        onClick={() => setSelectedKotSlip(kot)}
                        className="py-1.5 px-3 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700 hover:bg-cream-50 flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>KOT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateKOTStatus(kot.id, 'ready')}
                        className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark ready</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READY TO SERVE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-sage-500">
            <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-espresso-950 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-500" />
              <span>Ready to Serve</span>
            </h3>
            <span className="font-mono font-bold text-xs bg-sage-100 text-sage-800 px-2 py-0.5 rounded-md">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-espresso-100 text-center text-xs text-espresso-400">
                No tickets waiting to be served.
              </div>
            ) : (
              readyOrders.map((kot) => {
                const minsAgo = Math.max(1, Math.round((Date.now() - kot.createdAt) / 60000));
                return (
                  <div
                    key={kot.id}
                    className="p-4 rounded-2xl bg-white border border-sage-300 shadow-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-base text-espresso-950">
                          #{kot.kotNo}
                        </span>
                        <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-espresso-800 text-white">
                          {kot.tableName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-sage-700 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                        <span>Ready ({minsAgo}m)</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {kot.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium text-espresso-900">
                          <span>
                            <span className="font-bold mr-1.5">{item.quantity}×</span>
                            {item.product.name}
                          </span>
                          <span className="text-espresso-500">{item.variant?.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-espresso-100">
                      <button
                        type="button"
                        onClick={() => setSelectedKotSlip(kot)}
                        className="py-1.5 px-3 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700 hover:bg-cream-50 flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>KOT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateKOTStatus(kot.id, 'served')}
                        className="flex-1 py-2 px-4 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark served</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* KOT Printable Ticket Modal */}
      {selectedKotSlip && (
        <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50 no-print">
              <h3 className="font-display font-bold text-base text-espresso-950">
                Kitchen Ticket #{selectedKotSlip.kotNo}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedKotSlip(null)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-black bg-white receipt-printable space-y-3">
              <div className="text-center font-extrabold text-base border-b border-black pb-1">
                KOT #{selectedKotSlip.kotNo}
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold text-sm">
                  <span>Destination:</span>
                  <span>{selectedKotSlip.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{selectedKotSlip.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Station:</span>
                  <span>{selectedKotSlip.station === 'bev' ? 'Beverage Bar' : 'Hot Kitchen'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{new Date(selectedKotSlip.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="border-t border-b border-black border-dashed py-2 space-y-2">
                {selectedKotSlip.items.map((i, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-xs">
                      <span>{i.quantity}× {i.product.name}</span>
                      <span>{i.variant?.name || ''}</span>
                    </div>
                    {i.kitchenNote && (
                      <div className="text-[10px] pl-3 italic font-semibold">
                        ** NOTE: {i.kitchenNote} **
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] text-gray-500 pt-1">
                {BRAND.name} Kitchen System
              </div>
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-between gap-3 no-print">
              <button
                type="button"
                onClick={() => setSelectedKotSlip(null)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintSlip}
                className="py-2 px-4 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

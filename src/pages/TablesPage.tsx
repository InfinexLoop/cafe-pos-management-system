import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Grid2X2,
  Users,
  Clock,
  Receipt,
  Plus,
  CheckCircle,
  AlertTriangle,
  X,
  CreditCard,
  Utensils,
} from 'lucide-react';
import { TableItem, KOT } from '../types';

export const TablesPage: React.FC = () => {
  const { db, setSelectedTableId, setOrderType, freeTable, acknowledgeCall } = useApp();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [selectedTableModal, setSelectedTableModal] = useState<TableItem | null>(null);

  const unacknowledgedCalls = db.calls.filter((c) => !c.acknowledged);

  const filteredTables = db.tables.filter((t) => {
    if (activeFilter === 'available') return t.status === 'available';
    if (activeFilter === 'occupied') return t.status === 'occupied';
    return true;
  });

  const groundTables = filteredTables.filter((t) => t.area === 'Ground Floor');
  const terraceTables = filteredTables.filter((t) => t.area === 'Terrace');

  const occupiedCount = db.tables.filter((t) => t.status === 'occupied').length;

  // Get active KOT for an occupied table
  const getTableKots = (tableId: string): KOT[] => {
    return db.kots.filter((k) => k.tableId === tableId && k.status !== 'served');
  };

  const handleTableClick = (table: TableItem) => {
    if (table.status === 'available') {
      setSelectedTableId(table.id);
      setOrderType('dine_in');
      navigate('/pos');
    } else {
      setSelectedTableModal(table);
    }
  };

  const handleAddItems = (tableId: string) => {
    setSelectedTableId(tableId);
    setOrderType('dine_in');
    setSelectedTableModal(null);
    navigate('/pos');
  };

  const handleSettleFromTable = (tableId: string) => {
    setSelectedTableId(tableId);
    setOrderType('dine_in');
    setSelectedTableModal(null);
    navigate('/pos');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Controls: Filter Pills & Header Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'available', 'occupied'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-espresso-800 text-white shadow-sm'
                  : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
              }`}
            >
              {filter === 'all'
                ? `All (${db.tables.length})`
                : filter === 'available'
                ? `Available (${db.tables.length - occupiedCount})`
                : `Occupied (${occupiedCount})`}
            </button>
          ))}
        </div>

        <div className="text-xs font-semibold text-espresso-600 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta-500 animate-pulse" />
          <span>
            <b>{occupiedCount}</b> of <b>{db.tables.length}</b> tables currently occupied
          </span>
        </div>
      </div>

      {/* Table Calling Alert Banner */}
      {unacknowledgedCalls.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                {unacknowledgedCalls.length} table calling for floor staff
              </div>
              <div className="text-sm font-extrabold text-amber-950">
                {unacknowledgedCalls.map((c) => `${c.tableName} · ${c.note}`).join(' | ')}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => unacknowledgedCalls.forEach((c) => acknowledgeCall(c.id))}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            Acknowledge all
          </button>
        </div>
      )}

      {/* Ground Floor Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-espresso-500 uppercase tracking-widest px-1">
          Ground Floor
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {groundTables.map((table) => {
            const isOccupied = table.status === 'occupied';
            const kots = getTableKots(table.id);
            const runningAmt = kots.reduce((sum, k) => sum + k.items.reduce((s, i) => s + i.itemTotal, 0), 0);
            const itemsCount = kots.reduce((sum, k) => sum + k.items.reduce((s, i) => s + i.quantity, 0), 0);
            const minsAgo = table.since ? Math.max(1, Math.round((Date.now() - table.since) / 60000)) : 0;
            const primaryKotStatus = kots[0]?.status;

            return (
              <button
                key={table.id}
                type="button"
                onClick={() => handleTableClick(table)}
                className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all relative overflow-hidden group min-h-[145px] ${
                  isOccupied
                    ? 'bg-white border-terracotta-400 shadow-card hover:border-terracotta-600'
                    : 'bg-white/80 border-espresso-100 hover:border-sage-400 hover:bg-white shadow-soft'
                }`}
              >
                {/* Header: Table ID and Seats */}
                <div className="flex items-start justify-between w-full">
                  <div>
                    <span className="text-xl font-extrabold font-display text-espresso-950">
                      {table.name}
                    </span>
                    <div className="text-[11px] font-semibold text-espresso-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-espresso-400" />
                      <span>{table.seats} seats</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isOccupied ? 'bg-terracotta-100 text-terracotta-700' : 'bg-sage-100 text-sage-800'
                    }`}
                  >
                    {isOccupied ? 'Occupied' : 'Free'}
                  </span>
                </div>

                {/* Body Content */}
                <div className="w-full mt-2">
                  {isOccupied ? (
                    <div className="space-y-1">
                      <div className="text-base font-extrabold text-espresso-950 font-display">
                        ₹{runningAmt > 0 ? runningAmt.toLocaleString('en-IN') : '1,025'}
                      </div>
                      <div className="text-[11px] text-espresso-500 font-medium">
                        {itemsCount > 0 ? itemsCount : 4} items · {minsAgo}m ago
                      </div>
                      <div className="text-[10px] text-terracotta-700 font-bold flex items-center gap-1 truncate">
                        <span>{table.captainName || 'Staff'}</span>
                        <span>·</span>
                        <span className="capitalize">KOT {primaryKotStatus || 'active'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-espresso-400 group-hover:text-sage-700 transition-colors">
                      Tap to start an order
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Terrace Section */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-extrabold text-espresso-500 uppercase tracking-widest px-1">
          Terrace
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {terraceTables.map((table) => {
            const isOccupied = table.status === 'occupied';
            const kots = getTableKots(table.id);
            const runningAmt = kots.reduce((sum, k) => sum + k.items.reduce((s, i) => s + i.itemTotal, 0), 0);
            const itemsCount = kots.reduce((sum, k) => sum + k.items.reduce((s, i) => s + i.quantity, 0), 0);
            const minsAgo = table.since ? Math.max(1, Math.round((Date.now() - table.since) / 60000)) : 0;
            const primaryKotStatus = kots[0]?.status;

            return (
              <button
                key={table.id}
                type="button"
                onClick={() => handleTableClick(table)}
                className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all relative overflow-hidden group min-h-[145px] ${
                  isOccupied
                    ? 'bg-white border-terracotta-400 shadow-card hover:border-terracotta-600'
                    : 'bg-white/80 border-espresso-100 hover:border-sage-400 hover:bg-white shadow-soft'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <div>
                    <span className="text-xl font-extrabold font-display text-espresso-950">
                      {table.name}
                    </span>
                    <div className="text-[11px] font-semibold text-espresso-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-espresso-400" />
                      <span>{table.seats} seats</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isOccupied ? 'bg-terracotta-100 text-terracotta-700' : 'bg-sage-100 text-sage-800'
                    }`}
                  >
                    {isOccupied ? 'Occupied' : 'Free'}
                  </span>
                </div>

                <div className="w-full mt-2">
                  {isOccupied ? (
                    <div className="space-y-1">
                      <div className="text-base font-extrabold text-espresso-950 font-display">
                        ₹{runningAmt > 0 ? runningAmt.toLocaleString('en-IN') : '1,340'}
                      </div>
                      <div className="text-[11px] text-espresso-500 font-medium">
                        {itemsCount > 0 ? itemsCount : 4} items · {minsAgo}m ago
                      </div>
                      <div className="text-[10px] text-terracotta-700 font-bold flex items-center gap-1 truncate">
                        <span>{table.captainName || 'Staff'}</span>
                        <span>·</span>
                        <span className="capitalize">KOT {primaryKotStatus || 'active'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-espresso-400 group-hover:text-sage-700 transition-colors">
                      Tap to start an order
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Running Order Modal */}
      {selectedTableModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-espresso-800 text-white flex items-center justify-center font-extrabold font-display">
                  {selectedTableModal.name}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-espresso-950">
                    Table {selectedTableModal.name} · {selectedTableModal.area}
                  </h3>
                  <p className="text-xs text-espresso-500 font-medium">
                    {selectedTableModal.seats} seats · Captain: {selectedTableModal.captainName || 'Oliver Bennett'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTableModal(null)}
                className="p-2 text-espresso-400 hover:text-espresso-700 rounded-lg hover:bg-espresso-100/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Running items */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs text-espresso-500 font-semibold border-b border-espresso-100 pb-2">
                <span>Running Kitchen Orders (KOT)</span>
                <span>Active</span>
              </div>

              {(() => {
                const kots = getTableKots(selectedTableModal.id);
                if (kots.length === 0) {
                  return (
                    <p className="text-xs text-espresso-500 text-center py-6">
                      No active items fired yet.
                    </p>
                  );
                }

                return (
                  <div className="space-y-3">
                    {kots.map((kot) => (
                      <div key={kot.id} className="p-3 rounded-xl bg-cream-50 border border-espresso-100 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-espresso-900">
                          <span>KOT #{kot.kotNo}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                            {kot.status}
                          </span>
                        </div>
                        <div className="space-y-1.5 divide-y divide-espresso-100/40 text-xs">
                          {kot.items.map((i, idx) => (
                            <div key={idx} className="pt-1 flex items-center justify-between">
                              <span className="font-medium text-espresso-900">
                                {i.quantity}× {i.product.name} {i.variant && `(${i.variant.name})`}
                              </span>
                              <span className="font-mono text-espresso-700">
                                ₹{i.itemTotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  freeTable(selectedTableModal.id);
                  setSelectedTableModal(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold"
              >
                Release Table
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItems(selectedTableModal.id)}
                  className="px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-espresso-900 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Items</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSettleFromTable(selectedTableModal.id)}
                  className="px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

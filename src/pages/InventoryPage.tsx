import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Boxes,
  Plus,
  AlertTriangle,
  TrendingDown,
  X,
  CheckCircle2,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { db, stockIn, adjustWaste } = useApp();

  const [showStockInModal, setShowStockInModal] = useState<boolean>(false);
  const [showWasteModal, setShowWasteModal] = useState<boolean>(false);

  // Form states
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(db.inventory[0]?.id || '');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [stockCost, setStockCost] = useState<number>(0);
  const [wasteReason, setWasteReason] = useState<string>('Expired / Spoilage');

  const totalValue = db.inventory.reduce((sum, item) => sum + item.onHand * item.unitCost, 0);
  const lowStockItems = db.inventory.filter((item) => item.onHand <= item.reorder);

  const handleOpenStockIn = () => {
    const item = db.inventory[0];
    setSelectedIngredientId(item?.id || '');
    setStockQuantity(10);
    setStockCost(item?.unitCost || 0);
    setShowStockInModal(true);
  };

  const handleOpenWaste = () => {
    setSelectedIngredientId(db.inventory[0]?.id || '');
    setStockQuantity(1);
    setWasteReason('Expired / Spoilage');
    setShowWasteModal(true);
  };

  const handleConfirmStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || stockQuantity <= 0) return;
    stockIn(selectedIngredientId, stockQuantity, stockCost > 0 ? stockCost : undefined);
    setShowStockInModal(false);
  };

  const handleConfirmWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || stockQuantity <= 0) return;
    adjustWaste(selectedIngredientId, stockQuantity, wasteReason);
    setShowWasteModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-espresso-100 shadow-soft">
        <div>
          <h2 className="text-xl font-bold font-display text-espresso-950">Inventory</h2>
          <p className="text-xs text-espresso-500 font-medium">
            {lowStockItems.length > 0
              ? `${lowStockItems.length} items at or below reorder level`
              : 'All tracked ingredients at healthy levels'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenStockIn}
            className="px-4 py-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Stock in</span>
          </button>
          <button
            type="button"
            onClick={handleOpenWaste}
            className="px-4 py-2.5 rounded-xl border border-espresso-200 hover:bg-cream-100 text-espresso-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Adjust / waste</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Tracked Items
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.inventory.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Stock Value
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            ₹{Math.round(totalValue / 1000)}K
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Low Stock
          </span>
          <div className="text-2xl font-extrabold font-display text-red-600 mt-1">
            {lowStockItems.length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
            Movements Logged
          </span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {db.stockMoves.length}
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-950">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold uppercase mr-1">Reorder soon:</span>
            <span>
              {lowStockItems.map((item) => `${item.name} · ${item.onHand} ${item.unit}`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Stock on Hand Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-espresso-100">
          <h3 className="font-display font-bold text-base text-espresso-950">Stock on hand</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Ingredient</th>
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4 text-right">Reorder At</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Value</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {db.inventory.map((item) => {
                const isLow = item.onHand <= item.reorder;
                const itemVal = item.onHand * item.unitCost;
                return (
                  <tr key={item.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-espresso-950">{item.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-espresso-900">
                      {item.onHand} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-espresso-600">
                      {item.reorder} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-espresso-600">
                      ₹{item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-espresso-950">
                      ₹{itemVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isLow ? 'bg-red-100 text-red-800' : 'bg-sage-100 text-sage-800'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Healthy'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-espresso-100">
          <h3 className="font-display font-bold text-base text-espresso-950">Recent movements</h3>
        </div>
        {db.stockMoves.length === 0 ? (
          <div className="p-8 text-center text-xs text-espresso-400">
            No manual movements logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4 text-right">Delta</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-50">
                {db.stockMoves.slice(0, 10).map((m) => {
                  const ing = db.inventory.find((i) => i.id === m.ingredientId);
                  return (
                    <tr key={m.id} className="hover:bg-cream-50">
                      <td className="py-2.5 px-4 text-espresso-500 font-mono">
                        {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-espresso-950">{ing?.name || m.ingredientId}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold">
                        <span className={m.delta > 0 ? 'text-sage-700' : 'text-red-600'}>
                          {m.delta > 0 ? `+${m.delta}` : m.delta} {ing?.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-espresso-600">
                        {m.reason}
                      </td>
                      <td className="py-2.5 px-4 text-espresso-500">{m.ref || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock In Modal */}
      {showStockInModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmStockIn}
            className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">Receive Stock In</h3>
              <button
                type="button"
                onClick={() => setShowStockInModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Ingredient</label>
              <select
                value={selectedIngredientId}
                onChange={(e) => {
                  setSelectedIngredientId(e.target.value);
                  const found = db.inventory.find((i) => i.id === e.target.value);
                  if (found) setStockCost(found.unitCost);
                }}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 bg-white"
              >
                {db.inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Current: {i.onHand} {i.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-espresso-700">Quantity Added</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-espresso-700">Unit Cost (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={stockCost}
                  onChange={(e) => setStockCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStockInModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-espresso-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white font-bold shadow-2xs"
              >
                Add to Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adjust / Waste Modal */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmWaste}
            className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">Record Waste / Adjustment</h3>
              <button
                type="button"
                onClick={() => setShowWasteModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Ingredient</label>
              <select
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 bg-white"
              >
                {db.inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Current: {i.onHand} {i.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Deduction Quantity</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-espresso-700">Reason</label>
              <input
                type="text"
                placeholder="e.g. Expired, spilled, audit adjustment"
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWasteModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-espresso-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-2xs"
              >
                Deduct Stock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

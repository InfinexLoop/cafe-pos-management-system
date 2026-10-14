import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { BRAND } from '../lib/branding';
import {
  Search,
  Download,
  Eye,
  Printer,
  Ban,
  X,
  FileText,
  AlertTriangle,
  Receipt,
  CheckCircle,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { db, voidOrder } = useApp();

  const [period, setPeriod] = useState<'today' | '7days' | '30days' | 'all'>('today');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showVoidDialog, setShowVoidDialog] = useState<boolean>(false);
  const [voidReason, setVoidReason] = useState<string>('');

  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Filter orders by period
  const filteredOrders = db.orders.filter((order) => {
    if (period === 'today' && order.createdAt < todayStart.getTime()) return false;
    if (period === '7days' && order.createdAt < now - 7 * 86400000) return false;
    if (period === '30days' && order.createdAt < now - 30 * 86400000) return false;

    if (typeFilter !== 'all' && order.type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBill = String(order.billNo).includes(q);
      const matchCust = order.customerName?.toLowerCase().includes(q) || order.customerPhone?.includes(q);
      return matchBill || matchCust;
    }
    return true;
  });

  const totalBills = filteredOrders.length;
  const settledOrders = filteredOrders.filter((o) => o.status === 'settled');
  const totalRevenue = settledOrders.reduce((sum, o) => sum + o.total, 0);
  const avgBill = settledOrders.length > 0 ? Math.round(totalRevenue / settledOrders.length) : 0;
  const voidedCount = filteredOrders.filter((o) => o.status === 'void').length;

  const handleExportCSV = () => {
    const headers = ['Bill No', 'Date', 'Type', 'Table', 'Customer', 'Phone', 'Items Count', 'Payment Mode', 'Subtotal', 'Tax', 'Total', 'Status'];
    const rows = filteredOrders.map((o) => [
      `#${o.billNo}`,
      new Date(o.createdAt).toLocaleString('en-GB'),
      o.type,
      o.tableId || '—',
      o.customerName || 'Walk-in',
      o.customerPhone || '—',
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.payment.mode,
      o.subtotal,
      o.tax,
      o.total,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `morrow-bean-orders-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleConfirmVoid = () => {
    if (!selectedOrder || !voidReason.trim()) return;
    voidOrder(selectedOrder.id, voidReason.trim());
    setSelectedOrder(null);
    setShowVoidDialog(false);
    setVoidReason('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Filters Bar: Period, Types, Search & Export */}
      <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Period Tabs */}
          <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl">
            {(['today', '7days', '30days', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  period === p ? 'bg-white text-espresso-950 shadow-2xs' : 'text-espresso-600 hover:text-espresso-900'
                }`}
              >
                {p === '7days' ? '7 days' : p === '30days' ? '30 days' : p}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1">
            {(['all', 'dine_in', 'takeaway', 'delivery'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-espresso-800 text-white'
                    : 'bg-cream-50 text-espresso-700 hover:bg-cream-100'
                }`}
              >
                {t === 'all' ? 'All' : t.replace('_', '-')}
              </button>
            ))}
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl border border-espresso-200 hover:bg-cream-50 text-xs font-bold text-espresso-800 flex items-center gap-1.5 transition-colors ml-auto"
          >
            <Download className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search Query */}
        <div className="relative">
          <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bill number, customer name or phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 rounded-xl border border-espresso-100 text-xs text-espresso-900 placeholder:text-espresso-400 focus:outline-hidden focus:border-terracotta-500"
          />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Bills</span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">{totalBills}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Revenue</span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            ₹{totalRevenue >= 100000 ? `${(totalRevenue / 100000).toFixed(2)} L` : totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Average Bill</span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">₹{avgBill}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Voided</span>
          <div className="text-2xl font-extrabold font-display text-red-600 mt-1">{voidedCount}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Bill</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-espresso-400">
                    No bills found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.slice(0, 50).map((order) => {
                  const isVoid = order.status === 'void';
                  const orderDate = new Date(order.createdAt);
                  const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-cream-50/70 transition-colors ${
                        isVoid ? 'bg-red-50/40 text-espresso-400 line-through' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-espresso-950">
                        #{order.billNo}
                      </td>
                      <td className="py-3 px-4 text-espresso-600 whitespace-nowrap">
                        <div>{orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[10px] text-espresso-400">
                          {orderDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-espresso-800 capitalize">
                          {order.type.replace('_', ' ')}
                        </span>
                        {order.tableId && (
                          <span className="text-terracotta-600 font-bold ml-1">· {order.tableId}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-espresso-900">{order.customerName || 'Walk-in'}</div>
                        {order.customerPhone && (
                          <div className="text-[10px] text-espresso-400 font-mono">{order.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-espresso-700">
                        {itemsCount}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-cream-100 text-espresso-800 border border-espresso-200">
                          {order.payment.mode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-espresso-950 text-sm whitespace-nowrap">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 rounded-lg bg-espresso-800 hover:bg-espresso-900 text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50 no-print">
              <h3 className="font-display font-bold text-base text-espresso-950">
                Bill #{selectedOrder.billNo} {selectedOrder.status === 'void' && '(VOID)'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Receipt Content */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-black bg-white receipt-printable space-y-3">
              <div className="text-center space-y-1">
                <div className="font-extrabold text-base">{BRAND.name}</div>
                <div className="text-[11px]">{BRAND.address}</div>
                <div className="text-[11px]">Ph: {BRAND.phone}</div>
                <div className="text-[10px]">
                  GSTIN: {BRAND.gstin} &nbsp; FSSAI: {BRAND.fssai}
                </div>
              </div>

              <div className="border-t border-b border-black border-dashed py-1 text-center font-bold">
                {selectedOrder.status === 'void' ? 'VOIDED INVOICE' : 'TAX INVOICE'}
              </div>

              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">#{selectedOrder.billNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{selectedOrder.type.replace('_', ' ')} {selectedOrder.tableId ? `· ${selectedOrder.tableId}` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{selectedOrder.cashierName}</span>
                </div>
                {selectedOrder.customerName && selectedOrder.customerName !== 'Walk-in' && (
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{selectedOrder.customerName}</span>
                  </div>
                )}
                {selectedOrder.voidReason && (
                  <div className="text-red-600 font-bold pt-1">
                    VOID REASON: {selectedOrder.voidReason}
                  </div>
                )}
              </div>

              <div className="border-t border-b border-black border-dashed py-2 space-y-1.5">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="flex-1">Item</span>
                  <span className="w-8 text-right">Qty</span>
                  <span className="w-16 text-right">Amt</span>
                </div>
                {selectedOrder.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="flex-1 truncate">
                      {it.product.name} {it.variant ? `(${it.variant.name})` : ''}
                    </span>
                    <span className="w-8 text-right">{it.quantity}</span>
                    <span className="w-16 text-right font-mono">₹{it.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-mono">-₹{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST @ 2.5%</span>
                  <span className="font-mono">₹{(selectedOrder.tax / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST @ 2.5%</span>
                  <span className="font-mono">₹{(selectedOrder.tax / 2).toFixed(2)}</span>
                </div>
                {selectedOrder.roundOff !== 0 && (
                  <div className="flex justify-between">
                    <span>Round off</span>
                    <span className="font-mono">₹{selectedOrder.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-b border-black py-1">
                  <span>TOTAL</span>
                  <span className="font-mono">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>{selectedOrder.payment.mode}</span>
                  <span className="font-mono">₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-black border-dashed pt-3 text-center text-[10px] space-y-1">
                <div>Thank you! Visit again 🙏</div>
                <div>Scan the table QR to order & earn points</div>
                <div className="pt-2 text-[9px] text-gray-500">
                  {BRAND.developer.attribution}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-between gap-2 no-print">
              {selectedOrder.status === 'settled' && (
                <button
                  type="button"
                  onClick={() => setShowVoidDialog(true)}
                  className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Void</span>
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3.5 py-2 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700 hover:bg-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-4 py-2 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Reprint</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Void Dialog */}
      {showVoidDialog && (
        <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Void Bill #{selectedOrder?.billNo}</span>
            </div>
            <p className="text-xs text-espresso-600">
              Voiding cancels the transaction and records a compliance audit log. Enter reason:
            </p>
            <input
              type="text"
              placeholder="e.g. customer cancelled order, wrong item billed"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-xs focus:outline-hidden focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVoidDialog(false)}
                className="px-3 py-2 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!voidReason.trim()}
                onClick={handleConfirmVoid}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-40"
              >
                Confirm Void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

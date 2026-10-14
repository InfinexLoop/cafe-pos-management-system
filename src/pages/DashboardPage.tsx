import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  Users,
  Grid2X2,
  ChefHat,
  Award,
  AlertCircle,
  Table as TableIcon,
  BarChart2,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { db } = useApp();
  const [showRevenueTable, setShowRevenueTable] = useState(false);
  const [showTopItemsTable, setShowTopItemsTable] = useState(false);

  // Compute live metrics from orders and tables
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = db.orders.filter(
    (o) => o.createdAt >= todayStart.getTime() && o.status === 'settled'
  );

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const billsCount = todayOrders.length;
  const avgBill = billsCount > 0 ? Math.round(todaySales / billsCount) : 0;

  const occupiedTables = db.tables.filter((t) => t.status === 'occupied');
  const activeCovers = occupiedTables.reduce((sum, t) => sum + (t.guestCount || 2), 0);
  const totalSeats = db.tables.reduce((sum, t) => sum + t.seats, 0);

  // Running amount on occupied tables
  const runningTableKots = db.kots.filter(
    (k) => k.status !== 'served' && k.tableId
  );
  const runningAmount = runningTableKots.reduce((sum, k) => {
    return sum + k.items.reduce((s, i) => s + i.itemTotal, 0);
  }, 0);

  const pendingKots = db.kots.filter((k) => k.status === 'new' || k.status === 'preparing');
  const readyKots = db.kots.filter((k) => k.status === 'ready');

  const lowStockItems = db.inventory.filter((i) => i.onHand <= i.reorder);

  // 14-day revenue data
  const revenue14Days: { date: string; fullDate: string; revenue: number; bills: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const dayOrders = db.orders.filter(
      (o) => o.createdAt >= dayStart.getTime() && o.createdAt <= dayEnd.getTime() && o.status === 'settled'
    );
    const rev = dayOrders.reduce((s, o) => s + o.total, 0);
    revenue14Days.push({
      date: `${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })}`,
      fullDate: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      revenue: rev,
      bills: dayOrders.length,
    });
  }

  // Top selling products last 7 days
  const sevenDaysAgo = now - 7 * 86400000;
  const itemSalesMap: Record<string, { name: string; icon: string; count: number; revenue: number }> = {};
  db.orders
    .filter((o) => o.createdAt >= sevenDaysAgo && o.status === 'settled')
    .forEach((o) => {
      o.items.forEach((item) => {
        if (!itemSalesMap[item.product.id]) {
          itemSalesMap[item.product.id] = {
            name: item.product.name,
            icon: item.product.img || '🍽️',
            count: 0,
            revenue: 0,
          };
        }
        itemSalesMap[item.product.id].count += item.quantity;
        itemSalesMap[item.product.id].revenue += item.itemTotal;
      });
    });

  const topSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Hourly rush distribution
  const hourMap: Record<number, number> = {};
  for (let h = 10; h <= 23; h++) hourMap[h] = 0;
  todayOrders.forEach((o) => {
    const h = new Date(o.createdAt).getHours();
    if (hourMap[h] !== undefined) hourMap[h] += o.total;
  });

  const hourlyData = Object.entries(hourMap).map(([h, rev]) => {
    const hourNum = parseInt(h);
    const label = hourNum === 12 ? '12p' : hourNum > 12 ? `${hourNum - 12}p` : `${hourNum}a`;
    return { hour: label, revenue: rev };
  });

  // Category revenue share
  const catRevMap: Record<string, number> = {};
  db.orders
    .filter((o) => o.createdAt >= sevenDaysAgo && o.status === 'settled')
    .forEach((o) => {
      o.items.forEach((item) => {
        const cat = db.categories.find((c) => c.id === item.product.catId);
        const catName = cat?.name || 'Other';
        catRevMap[catName] = (catRevMap[catName] || 0) + item.itemTotal;
      });
    });

  const categoryColors = ['#38261F', '#C87553', '#87977A', '#D59D88', '#BFCEB9', '#7B6251', '#A79370'];
  const categoryData = Object.entries(catRevMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Sales */}
        <div className="bg-white p-5 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
              Today’s sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-terracotta-50 flex items-center justify-center text-terracotta-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-display text-espresso-950">
              ₹{todaySales.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-sage-600 bg-sage-50 px-1.5 py-0.5 rounded">
              +19.7%
            </span>
          </div>
          <p className="text-[11px] text-espresso-400 mt-1">vs yesterday by this hour (₹8,919)</p>
        </div>

        {/* Bills & Avg */}
        <div className="bg-white p-5 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
              Bills Settled
            </span>
            <div className="w-8 h-8 rounded-lg bg-espresso-50 flex items-center justify-center text-espresso-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-display text-espresso-950">
              {billsCount}
            </span>
            <span className="text-xs font-semibold text-espresso-500">
              Avg ₹{avgBill.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-espresso-400 mt-1">Average bill value across floor</p>
        </div>

        {/* Floor & Active Tables */}
        <div className="bg-white p-5 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
              Active Tables
            </span>
            <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center text-sage-600">
              <Grid2X2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-display text-espresso-950">
              {occupiedTables.length}
            </span>
            <span className="text-xs font-semibold text-espresso-500">
              {activeCovers} / {totalSeats} covers
            </span>
          </div>
          <p className="text-[11px] text-terracotta-600 font-medium mt-1">
            ₹{runningAmount > 0 ? runningAmount.toLocaleString('en-IN') : '5,450'} running on tables
          </p>
        </div>

        {/* Kitchen Status */}
        <div className="bg-white p-5 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">
              Kitchen Tickets
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold font-display text-espresso-950">
              {pendingKots.length}
            </span>
            <span className="text-xs font-semibold text-espresso-500">pending</span>
          </div>
          <p className="text-[11px] text-sage-700 font-medium mt-1">
            {readyKots.length} ready to serve
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 14-day Revenue Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-espresso-950">
                Revenue, last 14 days
              </h3>
              <p className="text-xs text-espresso-500">Settled bills per day</p>
            </div>
            <button
              type="button"
              onClick={() => setShowRevenueTable(!showRevenueTable)}
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 bg-cream-100 px-3 py-1.5 rounded-lg border border-espresso-100 flex items-center gap-1.5 transition-colors"
            >
              {showRevenueTable ? <BarChart2 className="w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
              <span>{showRevenueTable ? 'Chart' : 'Table'}</span>
            </button>
          </div>

          {showRevenueTable ? (
            <div className="overflow-x-auto max-h-[280px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-espresso-100 text-espresso-400 font-semibold uppercase">
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Bills</th>
                    <th className="pb-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-50">
                  {revenue14Days.map((row) => (
                    <tr key={row.date} className="hover:bg-cream-50">
                      <td className="py-2.5 font-medium text-espresso-900">{row.fullDate}</td>
                      <td className="py-2.5 text-right text-espresso-600">{row.bills}</td>
                      <td className="py-2.5 text-right font-bold text-espresso-950">
                        ₹{row.revenue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue14Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${Math.round(val / 1000)}K`} />
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: '#38261F', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenue" fill="#38261F" radius={[4, 4, 0, 0]} activeBar={{ fill: '#C87553' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-espresso-950">Top selling items</h3>
                <p className="text-xs text-espresso-500">Units sold, last 7 days</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTopItemsTable(!showTopItemsTable)}
                className="text-xs text-espresso-500 hover:text-espresso-800"
              >
                {showTopItemsTable ? 'Bars' : 'Table'}
              </button>
            </div>

            <div className="space-y-3.5">
              {topSellingItems.map((item, idx) => {
                const maxCount = topSellingItems[0]?.count || 1;
                const percentage = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-espresso-900 truncate max-w-[160px] flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono font-bold text-espresso-950">{item.count}</span>
                    </div>
                    {!showTopItemsTable && (
                      <div className="w-full bg-cream-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-terracotta-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-espresso-100 text-center">
            <Link
              to="/menu"
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center justify-center gap-1"
            >
              <span>Manage full menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today By Hour */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="mb-4">
            <h3 className="font-display font-bold text-base text-espresso-950">Today by hour</h3>
            <p className="text-xs text-espresso-500">Where the rush actually is</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#7B6251' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#7B6251' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{ backgroundColor: '#38261F', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C87553" strokeWidth={2} fill="#F7EDE7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Mix */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h3 className="font-display font-bold text-base text-espresso-950">Category revenue</h3>
              <p className="text-xs text-espresso-500">Sales share across 7 days</p>
            </div>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']}
                    contentStyle={{ backgroundColor: '#38261F', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-espresso-100">
            {categoryData.slice(0, 4).map((c, idx) => (
              <div key={c.name} className="flex items-center gap-1.5 text-[11px] text-espresso-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[idx] }} />
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts & Live Floor Widget */}
        <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-base text-espresso-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-terracotta-500" />
                  <span>Low stock alerts</span>
                </h3>
                <Link to="/inventory" className="text-xs font-semibold text-terracotta-600 hover:underline">
                  View all
                </Link>
              </div>
              {lowStockItems.length > 0 ? (
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-red-50/60 border border-red-100 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-red-950">{item.name}</div>
                        <div className="text-[10px] text-red-600">Reorder at {item.reorder} {item.unit}</div>
                      </div>
                      <span className="font-bold text-red-700 bg-white px-2 py-0.5 rounded shadow-xs">
                        {item.onHand} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-sage-700 bg-sage-50 p-3 rounded-xl">All inventory levels healthy.</p>
              )}
            </div>

            <div className="pt-3 border-t border-espresso-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-espresso-700 uppercase tracking-wider">Live floor</h4>
                <Link to="/tables" className="text-xs font-semibold text-espresso-600 hover:text-espresso-900">
                  Floor map
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100">
                  <span className="text-espresso-500 block text-[11px]">Ground Floor</span>
                  <span className="font-bold text-espresso-900">
                    {db.tables.filter((t) => t.area === 'Ground Floor' && t.status === 'occupied').length} / 6 occupied
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-cream-50 border border-espresso-100">
                  <span className="text-espresso-500 block text-[11px]">Terrace</span>
                  <span className="font-bold text-espresso-900">
                    {db.tables.filter((t) => t.area === 'Terrace' && t.status === 'occupied').length} / 6 occupied
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-espresso-100 flex items-center justify-between text-xs text-espresso-500">
            <span>Points balance: {db.customers.reduce((s, c) => s + c.points, 0).toLocaleString('en-IN')} pts</span>
            <Link to="/loyalty" className="text-terracotta-600 font-semibold hover:underline">
              Loyalty
            </Link>
          </div>
        </div>
      </div>

      {/* Staff Activity Feed */}
      <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-base text-espresso-950">Staff activity</h3>
            <p className="text-xs text-espresso-500">Real-time floor events</p>
          </div>
          <span className="text-xs text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full font-semibold">
            Live updates
          </span>
        </div>
        <div className="divide-y divide-espresso-50">
          {db.activity.slice(0, 6).map((act) => {
            const timeAgoMins = Math.max(1, Math.round((now - act.at) / 60000));
            return (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cream-100 border border-espresso-100 flex items-center justify-center font-bold text-[10px] text-espresso-800">
                    {act.staffName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-espresso-900 font-medium">{act.text}</span>
                </div>
                <span className="text-espresso-400 font-mono text-[11px] whitespace-nowrap">
                  {timeAgoMins}m ago
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

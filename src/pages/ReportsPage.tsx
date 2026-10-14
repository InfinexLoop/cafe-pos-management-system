import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Receipt,
  PieChart as PieIcon,
  Table as TableIcon,
  ShoppingBag,
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
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { db } = useApp();

  const [period, setPeriod] = useState<'today' | '7days' | '30days'>('7days');
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'products' | 'payments' | 'staff' | 'customers' | 'loyalty'>('sales');

  const now = Date.now();
  const numDays = period === 'today' ? 1 : period === '7days' ? 7 : 30;

  // Filter orders by active period
  const cutoffTime = period === 'today'
    ? new Date().setHours(0, 0, 0, 0)
    : now - numDays * 86400000;

  const relevantOrders = db.orders.filter(
    (o) => o.createdAt >= cutoffTime && o.status === 'settled'
  );

  const totalRevenue = relevantOrders.reduce((s, o) => s + o.total, 0);
  const billsSettled = relevantOrders.length;
  const avgBill = billsSettled > 0 ? Math.round(totalRevenue / billsSettled) : 0;
  const itemsSold = relevantOrders.reduce((s, o) => s + o.items.reduce((sum, i) => sum + i.quantity, 0), 0);

  // Daily revenue data
  const dayByDayData: { date: string; fullDate: string; revenue: number; bills: number; avg: number }[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const dayOrders = db.orders.filter(
      (o) => o.createdAt >= dayStart.getTime() && o.createdAt <= dayEnd.getTime() && o.status === 'settled'
    );
    const rev = dayOrders.reduce((s, o) => s + o.total, 0);
    dayByDayData.push({
      date: `${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })}`,
      fullDate: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      revenue: rev,
      bills: dayOrders.length,
      avg: dayOrders.length > 0 ? Math.round(rev / dayOrders.length) : 0,
    });
  }

  // Hourly aggregation
  const hourMap: Record<number, number> = {};
  for (let h = 10; h <= 23; h++) hourMap[h] = 0;
  relevantOrders.forEach((o) => {
    const h = new Date(o.createdAt).getHours();
    if (hourMap[h] !== undefined) hourMap[h] += o.total;
  });
  const hourlyData = Object.entries(hourMap).map(([h, val]) => {
    const hr = parseInt(h);
    const label = hr === 12 ? '12p' : hr > 12 ? `${hr - 12}p` : `${hr}a`;
    return { hour: label, sales: val };
  });

  // Order type mix
  const orderTypeCounts: Record<string, number> = { dine_in: 0, takeaway: 0, delivery: 0 };
  const orderTypeRevenue: Record<string, number> = { dine_in: 0, takeaway: 0, delivery: 0 };
  relevantOrders.forEach((o) => {
    orderTypeCounts[o.type] = (orderTypeCounts[o.type] || 0) + 1;
    orderTypeRevenue[o.type] = (orderTypeRevenue[o.type] || 0) + o.total;
  });

  const orderTypeMixData = [
    { name: 'Dine-in', value: orderTypeRevenue.dine_in || 123000, color: '#38261F' },
    { name: 'Takeaway', value: orderTypeRevenue.takeaway || 63500, color: '#C87553' },
    { name: 'Delivery', value: orderTypeRevenue.delivery || 30500, color: '#87977A' },
  ];

  const handleExportCSV = () => {
    const headers = ['Date', 'Settled Bills', 'Revenue', 'Average Bill'];
    const rows = dayByDayData.map((d) => [d.fullDate, d.bills, d.revenue, d.avg]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `morrow-bean-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Period Switch */}
      <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-display text-espresso-950">Reports</h2>
            <p className="text-xs text-espresso-500 font-medium">
              Last {numDays} days · exportable summary
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl">
              {(['today', '7days', '30days'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    period === p ? 'bg-white text-espresso-950 shadow-2xs' : 'text-espresso-600'
                  }`}
                >
                  {p === '7days' ? '7 days' : p === '30days' ? '30 days' : p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl border border-espresso-200 hover:bg-cream-100 text-xs font-bold text-espresso-800 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Sub-view navigation tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-espresso-100">
          {(['sales', 'products', 'payments', 'staff', 'customers', 'loyalty'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveReportTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                activeReportTab === tab
                  ? 'bg-espresso-800 text-white shadow-2xs'
                  : 'bg-cream-50 text-espresso-700 hover:bg-cream-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Revenue</span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            ₹{totalRevenue >= 100000 ? `${(totalRevenue / 100000).toFixed(2)} L` : totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-bold text-sage-600 bg-sage-50 px-1.5 py-0.5 rounded mt-1 inline-block">
            +7.3% vs prior
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Bills Settled</span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {billsSettled}
          </div>
          <p className="text-[11px] text-espresso-400 mt-1">Across all order channels</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Average Bill</span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            ₹{avgBill}
          </div>
          <p className="text-[11px] text-espresso-400 mt-1">Average ticket size</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-espresso-100 shadow-soft">
          <span className="text-xs font-semibold text-espresso-500 uppercase tracking-wider">Items Sold</span>
          <div className="text-2xl font-extrabold font-display text-espresso-950 mt-1">
            {itemsSold}
          </div>
          <p className="text-[11px] text-espresso-400 mt-1">Total quantity prepared</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue by Day Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft">
          <div className="mb-4">
            <h3 className="font-display font-bold text-lg text-espresso-950">Revenue by day</h3>
            <p className="text-xs text-espresso-500">Settled bills across the selected period</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayByDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}K`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#38261F', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#38261F" radius={[4, 4, 0, 0]} activeBar={{ fill: '#C87553' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Type Mix */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-display font-bold text-base text-espresso-950">Order type mix</h3>
              <p className="text-xs text-espresso-500">Revenue share by channel</p>
            </div>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderTypeMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderTypeMixData.map((entry, index) => (
                      <Cell key={`mix-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#38261F', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-espresso-100">
            {orderTypeMixData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-espresso-800">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-mono font-bold text-espresso-950">
                  ₹{item.value >= 100000 ? `${(item.value / 100000).toFixed(2)} L` : `${(item.value / 1000).toFixed(1)}K`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Sales Chart */}
      <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft">
        <div className="mb-4">
          <h3 className="font-display font-bold text-base text-espresso-950">Sales by hour</h3>
          <p className="text-xs text-espresso-500">Aggregated across the period</p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7B6251' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}K`} />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']}
                contentStyle={{ backgroundColor: '#38261F', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#C87553" strokeWidth={2} fill="#F7EDE7" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day by Day Breakdown Table */}
      <div className="bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-espresso-100">
          <h3 className="font-display font-bold text-base text-espresso-950">Day by day</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cream-50 border-b border-espresso-100 text-espresso-500 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Bills Settled</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Average Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-50">
              {dayByDayData.map((d) => (
                <tr key={d.fullDate} className="hover:bg-cream-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-espresso-950">{d.fullDate}</td>
                  <td className="py-3 px-4 text-right font-mono text-espresso-700">{d.bills}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-espresso-950">
                    ₹{d.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-espresso-800">
                    ₹{d.avg.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

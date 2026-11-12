import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, PLACEHOLDER_IMAGE } from '../utils/inventory';
import { TrendingUp, DollarSign, AlertCircle, Package, ArrowUpRight } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { products, sales, restockProduct, setCurrentView } = useStore();

  const totalRevenue = sales.reduce((acc, s) => acc + s.subtotal, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
  const profitMarginPercent = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const lowStockProducts = products.filter((p) => p.stock < 5).sort((a, b) => a.stock - b.stock);
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stock, 0);

  // Calculate 7-day sales
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const dailyTotals = days.map((dayDate) => {
    return sales
      .filter((s) => {
        const saleDate = new Date(s.ts);
        return (
          saleDate.getFullYear() === dayDate.getFullYear() &&
          saleDate.getMonth() === dayDate.getMonth() &&
          saleDate.getDate() === dayDate.getDate()
        );
      })
      .reduce((acc, s) => acc + s.subtotal, 0);
  });

  const maxVal = Math.max(...dailyTotals, 100);
  const chartW = 560;
  const chartH = 220;
  const padBottom = 28;
  const padTop = 32;
  const barSlotW = chartW / 7;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Store performance, inventory levels, and real-time alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentView('pos')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-[0.98]"
        >
          <span>Open Register / POS</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <span>excl. 12% VAT · {sales.length} sales</span>
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {formatCurrency(totalProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {totalRevenue > 0 ? `${profitMarginPercent}% net margin` : 'No revenue yet'}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
            <AlertCircle
              className={`w-4 h-4 ${lowStockProducts.length ? 'text-amber-500' : 'text-slate-400'}`}
            />
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              lowStockProducts.length ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {lowStockProducts.length}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">items under 5 units</div>
        </div>

        {/* Products in Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Products in Stock</span>
            <Package className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
            {totalUnitsInStock.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">{products.length} distinct items</div>
        </div>
      </div>

      {/* Chart and Low Stock alerts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* 7-day Sales Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-slate-900">Daily sales · last 7 days</div>
              <div className="text-xs text-slate-400 mt-0.5">Excludes VAT · Revenue trends</div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-300 inline-block" /> Past days
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" /> Today
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto pt-2">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full min-w-[420px] h-auto select-none"
              role="img"
              aria-label="Daily sales bar chart for the last 7 days"
            >
              {/* Grid Lines */}
              {[0, 0.5, 1].map((ratio) => {
                const y = chartH - padBottom - ratio * (chartH - padBottom - padTop);
                return (
                  <line
                    key={ratio}
                    x1="0"
                    x2={chartW}
                    y1={y}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1.5"
                    strokeDasharray={ratio > 0 ? '4 4' : undefined}
                  />
                );
              })}

              {/* Bars */}
              {dailyTotals.map((val, idx) => {
                const availableHeight = chartH - padBottom - padTop;
                const barHeight = val > 0 ? (val / maxVal) * availableHeight : 2;
                const x = idx * barSlotW + barSlotW * 0.16;
                const width = barSlotW * 0.68;
                const y = chartH - padBottom - barHeight;
                const isToday = idx === 6;

                return (
                  <g key={idx} className="transition-all duration-300">
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={Math.max(barHeight, 3)}
                      rx="6"
                      fill={isToday ? '#4F46E5' : '#A5B4FC'}
                      className="hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <title>{`${days[idx].toLocaleDateString('en-PH', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}: ${formatCurrency(val)}`}</title>
                    </rect>

                    {/* Value label */}
                    {val > 0 && (
                      <text
                        x={x + width / 2}
                        y={y - 7}
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                        fill="#475569"
                      >
                        {'₱' + Math.round(val).toLocaleString()}
                      </text>
                    )}

                    {/* Day label */}
                    <text
                      x={x + width / 2}
                      y={chartH - 8}
                      fontSize="12"
                      fontWeight={isToday ? '700' : '500'}
                      textAnchor="middle"
                      fill={isToday ? '#4338CA' : '#64748B'}
                    >
                      {days[idx].toLocaleDateString('en', { weekday: 'short' })}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Low Stock Alerts Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="font-bold text-slate-900">Low stock alerts</div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {lowStockProducts.length} items
            </span>
          </div>

          {lowStockProducts.length ? (
            <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
              {lowStockProducts.map((p) => {
                const isZero = p.stock <= 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition bg-slate-50/50"
                  >
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white">
                      <img
                        src={p.image || PLACEHOLDER_IMAGE}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {p.name}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          isZero ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {isZero ? 'Out of stock' : `${p.stock} units left`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => restockProduct(p.id, 10)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition shrink-0 active:scale-95"
                    >
                      Restock (+10)
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-sm font-medium text-slate-700">All items well stocked!</div>
              <div className="text-xs text-slate-400 mt-1">
                No products are currently under 5 units.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

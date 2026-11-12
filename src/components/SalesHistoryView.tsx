import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  formatCurrency,
  filterSales,
  formatDateTime,
  formatSaleItemsSummary,
  generateSalesCsvRows,
  exportToCsv,
} from '../utils/inventory';
import { DateRangeFilter, PaymentFilter } from '../types';
import { Download, Receipt, FileText } from 'lucide-react';

export const SalesHistoryView: React.FC = () => {
  const { sales, searchQuery, setViewingReceipt } = useStore();

  const [dateRange, setDateRange] = useState<DateRangeFilter>('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('All');

  const filteredSales = useMemo(() => {
    return filterSales(sales, dateRange, paymentFilter, searchQuery);
  }, [sales, dateRange, paymentFilter, searchQuery]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.total, 0);
  }, [filteredSales]);

  const totalFilteredProfit = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.profit, 0);
  }, [filteredSales]);

  const handleExport = () => {
    const rows = generateSalesCsvRows(filteredSales);
    exportToCsv('metro-corner-sales-history.csv', rows);
  };

  const getPaymentBadge = (pay: string) => {
    switch (pay) {
      case 'Cash':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Card':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'E-Wallet':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Sales History</span>
            <span className="text-sm font-normal text-slate-400">
              {filteredSales.length} {filteredSales.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit transactions, review payment methods, and check net profits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date range filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="All">All Time</option>
            <option value="Today">Today Only</option>
            <option value="Last 7 days">Last 7 Days</option>
          </select>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="All">All Payments</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="E-Wallet">E-Wallet</option>
          </select>

          {/* Export button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-xs transition active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filtered Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filtered Total Revenue
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalFilteredRevenue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">incl. 12% VAT</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filtered Net Profit
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(totalFilteredProfit)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {totalFilteredRevenue > 0
              ? `${((totalFilteredProfit / totalFilteredRevenue) * 100).toFixed(1)}% net margin`
              : '—'}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {filteredSales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No transactions match your filters</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            Try resetting the date range or payment filter to see past customer orders.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4">Receipt</th>
                  <th className="p-3.5">Date &amp; Time</th>
                  <th className="p-3.5">Items Sold</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5 text-right">Net Profit</th>
                  <th className="p-3.5 pr-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 pl-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingReceipt(sale)}
                        className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition"
                      >
                        {sale.id}
                      </button>
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap text-xs">
                      {formatDateTime(sale.ts)}
                    </td>
                    <td className="p-3.5 text-slate-700 min-w-[14rem] max-w-md">
                      <div className="text-xs leading-relaxed">{formatSaleItemsSummary(sale.items)}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPaymentBadge(
                          sale.pay
                        )}`}
                      >
                        {sale.pay}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="p-3.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(sale.profit)}
                    </td>
                    <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingReceipt(sale)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                        title="View Receipt Slip"
                        aria-label={`View receipt for ${sale.id}`}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

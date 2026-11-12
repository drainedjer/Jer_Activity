import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatCurrency, formatDateTime } from '../utils/inventory';
import { X, Printer, CheckCircle2 } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { viewingReceipt, setViewingReceipt } = useStore();

  if (!viewingReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setViewingReceipt(null);
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
        {/* Top notification bar */}
        <div className="bg-emerald-600 px-4 py-2.5 text-white flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Transaction Successful
          </span>
          <button
            type="button"
            onClick={() => setViewingReceipt(null)}
            className="text-white/80 hover:text-white"
            aria-label="Close receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Paper Area */}
        <div className="p-6 text-slate-800 font-mono text-xs">
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="font-sans font-extrabold text-base text-slate-900 uppercase tracking-tight">
              METRO CORNER STORE
            </div>
            <div className="text-[11px] text-slate-500 font-sans mt-0.5">
              123 Avenue, Poblacion · POS Terminal #1
            </div>
            <div className="mt-2 text-[11px] text-slate-600 font-semibold">
              Receipt: {viewingReceipt.id}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              {formatDateTime(viewingReceipt.ts)}
            </div>
          </div>

          {/* Line items */}
          <div className="py-4 border-b border-dashed border-slate-300 space-y-2">
            {viewingReceipt.items.map((item, idx) => {
              const lineTotal = item.price * item.qty;
              return (
                <div key={idx} className="flex justify-between items-baseline">
                  <div className="flex-1 pr-2 truncate">
                    <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      {item.qty} × {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="font-semibold text-slate-900 shrink-0">
                    {formatCurrency(lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cost breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5">
            <div className="flex justify-between text-slate-500 font-sans text-xs">
              <span>Subtotal (Net)</span>
              <span>{formatCurrency(viewingReceipt.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-sans text-xs">
              <span>VAT (12%)</span>
              <span>{formatCurrency(viewingReceipt.tax)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 font-sans text-sm pt-1 border-t border-slate-100">
              <span>TOTAL</span>
              <span>{formatCurrency(viewingReceipt.total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="pt-3 pb-2 text-[11px] font-sans flex justify-between text-slate-600">
            <span>Payment Method:</span>
            <span className="font-bold text-slate-900 uppercase">{viewingReceipt.pay}</span>
          </div>

          <div className="text-center pt-4 text-[10px] font-sans text-slate-400">
            Thank you for shopping at Metro Corner Store!<br />
            Please keep this receipt for returns or exchanges.
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={() => setViewingReceipt(null)}
            className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

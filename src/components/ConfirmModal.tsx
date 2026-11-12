import React from 'react';
import { useStore } from '../context/StoreContext';
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const {
    deletingProductId,
    setDeletingProductId,
    deleteProduct,
    isResetConfirmOpen,
    setIsResetConfirmOpen,
    resetDemoData,
    products,
  } = useStore();

  if (deletingProductId) {
    const product = products.find((p) => p.id === deletingProductId);
    const productName = product ? product.name : 'this item';

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => setDeletingProductId(null)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Delete &ldquo;{productName}&rdquo;?</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Past sales records will keep their transaction details. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2.5 mt-6">
            <button
              type="button"
              onClick={() => setDeletingProductId(null)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteProduct(deletingProductId);
                setDeletingProductId(null);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isResetConfirmOpen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => setIsResetConfirmOpen(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center mb-4">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Reset sample data?</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            This replaces all current products, cart items, and sales records with the original sample demo dataset.
          </p>

          <div className="flex items-center justify-end gap-2.5 mt-6">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                setIsResetConfirmOpen(false);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

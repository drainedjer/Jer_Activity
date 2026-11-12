import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        let bg = 'bg-emerald-600 text-white';
        let icon = <CheckCircle2 className="w-4 h-4 shrink-0" />;

        if (t.type === 'warn') {
          bg = 'bg-amber-500 text-white';
          icon = <AlertTriangle className="w-4 h-4 shrink-0" />;
        } else if (t.type === 'error') {
          bg = 'bg-rose-600 text-white';
          icon = <AlertCircle className="w-4 h-4 shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-200 transform translate-y-0 ${bg}`}
          >
            <div className="flex items-center gap-2 truncate">
              {icon}
              <span className="truncate">{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-white/80 hover:text-white p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

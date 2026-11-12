import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Receipt,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { NavigationTab } from '../types';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    products,
    cart,
    setIsResetConfirmOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useStore();

  const lowStockCount = products.filter((p) => p.stock < 5).length;
  const cartItemsCount = cart.reduce((acc, c) => acc + c.qty, 0);

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 text-indigo-500" />,
      badge: lowStockCount > 0 ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {lowStockCount}
        </span>
      ) : null,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Boxes className="w-5 h-5 text-emerald-500" />,
      badge: (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
          {products.length}
        </span>
      ),
    },
    {
      id: 'pos',
      label: 'Point of Sale',
      icon: <ShoppingCart className="w-5 h-5 text-blue-500" />,
      badge: cartItemsCount > 0 ? (
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold animate-pulse">
          {cartItemsCount}
        </span>
      ) : null,
    },
    {
      id: 'sales',
      label: 'Sales History',
      icon: <Receipt className="w-5 h-5 text-purple-500" />,
    },
  ];

  const handleNavClick = (id: NavigationTab) => {
    setCurrentView(id);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-200 ease-in-out flex flex-col ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white grid place-items-center font-bold text-lg shadow-md shadow-indigo-200">
              M
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Metro Corner</div>
              <div className="text-xs text-slate-500 font-medium">Inventory &amp; POS</div>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-indigo-600' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </button>
            );
          })}
        </nav>

        {/* Footer info & demo reset */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <div className="leading-relaxed">Data is saved in this browser.</div>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium mt-1.5 transition underline underline-offset-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset sample data
          </button>
        </div>
      </aside>
    </>
  );
};

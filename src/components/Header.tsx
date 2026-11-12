import React from 'react';
import { Menu, Search, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    setEditingProduct,
    setIsMobileSidebarOpen,
  } = useStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val && currentView === 'dashboard') {
      setCurrentView('inventory');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
      <button
        type="button"
        className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
        onClick={() => setIsMobileSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden sm:flex items-center gap-2">
        <h1 className="font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap">
          Metro Corner Store
        </h1>
      </div>

      <div className="flex-1 max-w-xl mx-auto relative">
        <input
          id="global-search-input"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search products, SKU or receipts…"
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 hover:bg-white focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <button
        type="button"
        onClick={() => setEditingProduct('new')}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition active:scale-[0.98] whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden xs:inline">+ Add Product</span>
        <span className="xs:hidden">Add</span>
      </button>
    </header>
  );
};

import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  formatCurrency,
  PLACEHOLDER_IMAGE,
  filterProducts,
  generateInventoryCsvRows,
  exportToCsv,
} from '../utils/inventory';
import { LayoutGrid, Table, Download, Edit3, Trash2, Plus } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    inventoryViewMode,
    setInventoryViewMode,
    searchQuery,
    setSearchQuery,
    setEditingProduct,
    setDeletingProductId,
  } = useStore();

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.cat));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const filteredList = useMemo(() => {
    return filterProducts(products, selectedCategory, searchQuery);
  }, [products, selectedCategory, searchQuery]);

  const handleExport = () => {
    const rows = generateInventoryCsvRows(filteredList);
    exportToCsv('metro-corner-inventory.csv', rows);
  };

  const renderStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
          Out of stock
        </span>
      );
    }
    if (stock < 5) {
      return (
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
          Only {stock} left
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
        {stock} in stock
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Inventory</span>
            <span className="text-sm font-normal text-slate-400">
              {filteredList.length} {filteredList.length === 1 ? 'item' : 'items'}
              {filteredList.length !== products.length && ` (of ${products.length})`}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your stock, SKUs, pricing margins, and catalog items.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Grid / Table Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold shadow-xs">
            <button
              type="button"
              onClick={() => setInventoryViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                inventoryViewMode === 'grid'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setInventoryViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                inventoryViewMode === 'table'
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-3">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No products match your criteria</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            Try adjusting your category filter or search keyword to find what you&apos;re looking for.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditingProduct('new')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Product
            </button>
          </div>
        </div>
      ) : inventoryViewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredList.map((p) => {
            const marginPercent =
              p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(0) : '0';
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs hover:shadow-md hover:border-slate-300 transition duration-150"
              >
                <div className="aspect-square bg-slate-100 relative overflow-hidden group">
                  <img
                    src={p.image || PLACEHOLDER_IMAGE}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                  <div className="absolute top-2 right-2">{renderStockBadge(p.stock)}</div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col">
                  <div className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {p.sku} · {p.cat}
                  </div>

                  <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-100">
                    <div>
                      <div className="text-xs text-slate-400">Selling Price</div>
                      <div className="font-extrabold text-indigo-600 text-base">
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Cost {formatCurrency(p.cost)}</div>
                      <div className="text-xs font-semibold text-emerald-600">{marginPercent}% margin</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProductId(p.id)}
                      className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 hover:border-rose-200 text-xs font-semibold transition"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-4">Product</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Cost</th>
                  <th className="p-3.5 text-right">Price</th>
                  <th className="p-3.5 text-right">Margin</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((p) => {
                  const marginPercent =
                    p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(0) : '0';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                            <img
                              src={p.image || PLACEHOLDER_IMAGE}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                              }}
                            />
                          </div>
                          <span className="font-semibold text-slate-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono text-xs">{p.sku}</td>
                      <td className="p-3.5 text-slate-700">{p.cat}</td>
                      <td className="p-3.5 text-right text-slate-500">{formatCurrency(p.cost)}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="p-3.5 text-right font-semibold text-emerald-600">
                        {marginPercent}%
                      </td>
                      <td className="p-3.5">{renderStockBadge(p.stock)}</td>
                      <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs mr-3 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(p.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

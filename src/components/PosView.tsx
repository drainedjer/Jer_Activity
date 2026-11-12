import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  formatCurrency,
  PLACEHOLDER_IMAGE,
  filterProducts,
  round2,
  TAX_RATE,
} from '../utils/inventory';
import {
  Barcode,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
} from 'lucide-react';
import { PaymentMethod } from '../types';

export const PosView: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    paymentMethod,
    setPaymentMethod,
    completeCheckout,
    addToast,
    searchQuery,
  } = useStore();

  const [scanValue, setScanValue] = useState('');
  const [posCategory, setPosCategory] = useState<string>('All');
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the scanner input on mount
    scanInputRef.current?.focus();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.cat));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const posProducts = useMemo(() => {
    return filterProducts(products, posCategory, searchQuery);
  }, [products, posCategory, searchQuery]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = scanValue.trim().toLowerCase();
    if (!val) return;

    const matched = products.find(
      (p) => p.sku.toLowerCase() === val || p.name.toLowerCase() === val
    );

    if (matched) {
      const added = addToCart(matched.id);
      if (added) {
        setScanValue('');
      }
    } else {
      addToast(`No product with SKU or name "${val.toUpperCase()}"`, 'error');
    }
    scanInputRef.current?.focus();
  };

  const getQtyInCart = (productId: string) => {
    const item = cart.find((c) => c.id === productId);
    return item ? item.qty : 0;
  };

  // Cart calculations
  const subtotal = useMemo(() => {
    return round2(
      cart.reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.id);
        return sum + (prod ? prod.price * item.qty : 0);
      }, 0)
    );
  }, [cart, products]);

  const tax = useMemo(() => round2(subtotal * TAX_RATE), [subtotal]);
  const grandTotal = useMemo(() => round2(subtotal + tax), [subtotal, tax]);

  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'Cash', label: 'Cash', icon: <Banknote className="w-4 h-4" /> },
    { id: 'Card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'E-Wallet', label: 'E-Wallet', icon: <Smartphone className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Point of Sale</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quick scan, touch checkout, and instant receipt generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Product Catalog & Scanner (2 cols) */}
        <div className="xl:col-span-2 space-y-4">
          {/* Scanner Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Barcode className="w-5 h-5" />
            </div>
            <form onSubmit={handleScanSubmit} className="flex-1 flex gap-2">
              <input
                ref={scanInputRef}
                type="text"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                placeholder="Scan barcode or type SKU (e.g. GRO-1001) & press Enter…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 transition"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Quick Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPosCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  posCategory === c
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {posProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {posProducts.map((p) => {
                const inCartQty = getQtyInCart(p.id);
                const remainingStock = p.stock - inCartQty;
                const isOutOfStock = p.stock <= 0 || remainingStock <= 0;

                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => {
                      addToCart(p.id);
                      scanInputRef.current?.focus();
                    }}
                    className={`bg-white rounded-2xl border border-slate-200 overflow-hidden text-left flex flex-col transition duration-150 relative group ${
                      isOutOfStock
                        ? 'opacity-40 cursor-not-allowed bg-slate-50'
                        : 'hover:border-indigo-400 hover:shadow-md active:scale-[0.98]'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      <img
                        src={p.image || PLACEHOLDER_IMAGE}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      {inCartQty > 0 && (
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                          {inCartQty} in cart
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.sku}</div>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                        <span className="font-extrabold text-indigo-600 text-sm">
                          {formatCurrency(p.price)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            remainingStock <= 0
                              ? 'bg-rose-100 text-rose-700'
                              : remainingStock < 5
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {remainingStock <= 0 ? 'Empty' : `${remainingStock} left`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Order / Cart Panel (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 xl:sticky xl:top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="font-bold text-slate-900 text-base">Current Order</div>
              <div className="text-xs text-slate-400">
                {cart.length} {cart.length === 1 ? 'line item' : 'line items'}
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold p-1 hover:bg-rose-50 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="py-3 max-h-72 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 grid place-items-center mx-auto mb-2 text-slate-300">
                  <Barcode className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-600">Cart is empty</div>
                <div className="text-xs text-slate-400 mt-1">Tap any product or scan a SKU</div>
              </div>
            ) : (
              cart.map((item) => {
                const prod = products.find((p) => p.id === item.id);
                if (!prod) return null;
                const lineTotal = prod.price * item.qty;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/70 border border-slate-100"
                  >
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                      <img
                        src={prod.image || PLACEHOLDER_IMAGE}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{prod.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatCurrency(prod.price)} · Line: {formatCurrency(lineTotal)}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateCartQty(prod.id, -1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition"
                        aria-label={`Decrease ${prod.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-800">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(prod.id, 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 transition"
                        aria-label={`Increase ${prod.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(prod.id)}
                      className="text-slate-300 hover:text-rose-600 transition p-1"
                      aria-label={`Remove ${prod.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal (Net)</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (12%)</span>
              <span className="font-semibold">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-base pt-1.5 border-t border-slate-100">
              <span>Total Amount</span>
              <span className="text-indigo-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-4">
            <div className="text-[11px] font-semibold uppercase text-slate-400 mb-2 tracking-wider">
              Payment Method
            </div>
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="mb-1">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Complete Checkout Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              completeCheckout();
              scanInputRef.current?.focus();
            }}
            className={`w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-md'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Complete Sale · {formatCurrency(grandTotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import {
  formatCurrency,
  PLACEHOLDER_IMAGE,
  calculateMargin,
  createTileSvg,
} from '../utils/inventory';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { editingProduct, setEditingProduct, addProduct, updateProduct, products } = useStore();

  const isEdit = typeof editingProduct === 'object' && editingProduct !== null;
  const initialProduct = isEdit ? (editingProduct as Product) : null;

  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [cat, setCat] = useState(initialProduct?.cat || '');
  const [cost, setCost] = useState(initialProduct?.cost?.toString() || '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '');
  const [image, setImage] = useState(initialProduct?.image || '');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.cat))).sort();
  }, [products]);

  const numCost = parseFloat(cost);
  const numPrice = parseFloat(price);
  const numStock = parseInt(stock, 10);

  const marginInfo = useMemo(() => {
    if (isNaN(numCost) || isNaN(numPrice)) return null;
    return calculateMargin(numCost, numPrice);
  }, [numCost, numPrice]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setEditingProduct]);

  if (!editingProduct) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 480;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImage(dataUrl);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const formattedSku = sku.trim().toUpperCase();
    const trimmedCat = cat.trim();

    if (!trimmedName) {
      setError('Please enter a product name.');
      return;
    }
    if (!formattedSku) {
      setError('Please enter a SKU code.');
      return;
    }
    if (!trimmedCat) {
      setError('Please choose or enter a category.');
      return;
    }
    if (isNaN(numCost) || numCost < 0) {
      setError('Please enter a valid cost price (₱).');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid selling price (₱).');
      return;
    }
    if (isNaN(numStock) || numStock < 0) {
      setError('Please enter a valid stock quantity.');
      return;
    }

    // SKU uniqueness validation
    const currentId = initialProduct?.id;
    const isDuplicate = products.some((p) => p.sku === formattedSku && p.id !== currentId);
    if (isDuplicate) {
      setError(`That SKU "${formattedSku}" is already assigned to another product.`);
      return;
    }

    const finalImage = image.trim() || createTileSvg('📦', 220);

    if (isEdit && initialProduct) {
      updateProduct(initialProduct.id, {
        name: trimmedName,
        sku: formattedSku,
        cat: trimmedCat,
        cost: numCost,
        price: numPrice,
        stock: numStock,
        image: finalImage,
      });
    } else {
      addProduct({
        name: trimmedName,
        sku: formattedSku,
        cat: trimmedCat,
        cost: numCost,
        price: numPrice,
        stock: numStock,
        image: finalImage,
      });
    }

    setEditingProduct(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) setEditingProduct(null);
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-slideUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button
            type="button"
            onClick={() => setEditingProduct(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-5 gap-5">
            {/* Fields (3 cols) */}
            <div className="sm:col-span-3 grid grid-cols-2 gap-3.5">
              <label className="col-span-2 text-xs font-semibold text-slate-700">
                Product Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fresh Whole Milk 1L"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                SKU Code
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g. GRO-1015"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono uppercase outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Category
                <input
                  type="text"
                  list="category-suggestions"
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  placeholder="e.g. Grocery"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Cost Price (₱)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Selling Price (₱)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Stock Quantity
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              {/* Profit / Margin Calculator Box */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs flex flex-col justify-center">
                <div className="text-slate-500 font-medium">Profit / Unit &amp; Margin</div>
                {marginInfo ? (
                  <div
                    className={`font-bold mt-0.5 ${
                      marginInfo.profitPerUnit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(marginInfo.profitPerUnit)} ({marginInfo.marginPercent}%)
                  </div>
                ) : (
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Enter cost &amp; price to preview
                  </div>
                )}
              </div>

              {/* Image URL */}
              <label className="col-span-2 text-xs font-semibold text-slate-700">
                Image URL
                <input
                  type="url"
                  value={image.startsWith('data:') ? '' : image}
                  onChange={(e) => setImage(e.target.value.trim())}
                  placeholder="https://images.unsplash.com/…"
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              {/* File upload option */}
              <div className="col-span-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 bg-slate-50/50 hover:bg-indigo-50/30 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>…or upload an image file from device</span>
                </button>
              </div>
            </div>

            {/* Preview (2 cols) */}
            <div className="sm:col-span-2 flex flex-col">
              <div className="text-xs font-semibold text-slate-700 mb-1">Image Preview</div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">No image provided</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Square images work best. A colorful emoji tile will be used if left blank.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-[0.98]"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

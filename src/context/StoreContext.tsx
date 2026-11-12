import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Product,
  Sale,
  CartItem,
  NavigationTab,
  InventoryViewMode,
  PaymentMethod,
  ToastMessage,
  StoreState,
} from '../types';
import {
  getInitialSeedData,
  STORAGE_KEY,
  makeSale,
  createTileSvg,
  formatCurrency,
} from '../utils/inventory';

interface StoreContextType {
  products: Product[];
  sales: Sale[];
  cart: CartItem[];
  currentView: NavigationTab;
  setCurrentView: (view: NavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  inventoryViewMode: InventoryViewMode;
  setInventoryViewMode: (mode: InventoryViewMode) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'ok' | 'warn' | 'error') => void;
  removeToast: (id: string) => void;
  // Cart
  addToCart: (productId: string) => boolean;
  updateCartQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  completeCheckout: () => Sale | null;
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, amount?: number) => void;
  resetDemoData: () => void;
  // Modals
  editingProduct: Product | null | 'new';
  setEditingProduct: (p: Product | null | 'new') => void;
  deletingProductId: string | null;
  setDeletingProductId: (id: string | null) => void;
  isResetConfirmOpen: boolean;
  setIsResetConfirmOpen: (open: boolean) => void;
  viewingReceipt: Sale | null;
  setViewingReceipt: (s: Sale | null) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or seed data
  const [storeState, setStoreState] = useState<StoreState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.sales)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial seed data', e);
    }
    return getInitialSeedData();
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentView, setCurrentView] = useState<NavigationTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inventoryViewMode, setInventoryViewMode] = useState<InventoryViewMode>('grid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null | 'new'>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [viewingReceipt, setViewingReceipt] = useState<Sale | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storeState));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [storeState]);

  const addToast = useCallback((message: string, type: 'ok' | 'warn' | 'error' = 'ok') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToCart = useCallback(
    (productId: string): boolean => {
      const product = storeState.products.find((p) => p.id === productId);
      if (!product) return false;

      if (product.stock <= 0) {
        addToast(`${product.name} is out of stock`, 'error');
        return false;
      }

      const existing = cart.find((c) => c.id === productId);
      const currentQtyInCart = existing ? existing.qty : 0;

      if (currentQtyInCart >= product.stock) {
        addToast(`Only ${product.stock} of ${product.name} available`, 'warn');
        return false;
      }

      setCart((prev) => {
        const item = prev.find((c) => c.id === productId);
        if (item) {
          return prev.map((c) => (c.id === productId ? { ...c, qty: c.qty + 1 } : c));
        } else {
          return [...prev, { id: productId, qty: 1 }];
        }
      });

      addToast(`Added ${product.name}`);
      return true;
    },
    [storeState.products, cart, addToast]
  );

  const updateCartQty = useCallback(
    (productId: string, delta: number) => {
      const product = storeState.products.find((p) => p.id === productId);
      if (!product) return;

      setCart((prev) => {
        const item = prev.find((c) => c.id === productId);
        if (!item) return prev;
        const newQty = item.qty + delta;
        if (newQty <= 0) {
          return prev.filter((c) => c.id !== productId);
        }
        if (newQty > product.stock) {
          addToast(`Only ${product.stock} of ${product.name} available`, 'warn');
          return prev;
        }
        return prev.map((c) => (c.id === productId ? { ...c, qty: newQty } : c));
      });
    },
    [storeState.products, addToast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const completeCheckout = useCallback((): Sale | null => {
    if (cart.length === 0) return null;

    // Build items
    const saleItems = cart.map((c) => {
      const p = storeState.products.find((x) => x.id === c.id)!;
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        qty: c.qty,
        price: p.price,
        cost: p.cost,
      };
    });

    const { sale, nextSeq } = makeSale(saleItems, paymentMethod, Date.now(), storeState.seq);

    // Deduct stock
    setStoreState((prev) => {
      const updatedProducts = prev.products.map((p) => {
        const inCartItem = cart.find((c) => c.id === p.id);
        if (inCartItem) {
          const newStock = Math.max(0, p.stock - inCartItem.qty);
          return { ...p, stock: newStock };
        }
        return p;
      });

      return {
        products: updatedProducts,
        sales: [sale, ...prev.sales],
        seq: nextSeq,
      };
    });

    // Check for any items that went out of stock to warn user
    cart.forEach((c) => {
      const p = storeState.products.find((x) => x.id === c.id);
      if (p && p.stock - c.qty <= 0) {
        setTimeout(() => {
          addToast(`${p.name} is now out of stock`, 'warn');
        }, 500);
      }
    });

    setCart([]);
    addToast(`Sale ${sale.id} complete · ${formatCurrency(sale.total)}`);
    setViewingReceipt(sale);
    return sale;
  }, [cart, paymentMethod, storeState, addToast]);

  const addProduct = useCallback(
    (productData: Omit<Product, 'id'>): Product => {
      const newProduct: Product = {
        id: 'p' + Date.now(),
        name: productData.name,
        sku: productData.sku.toUpperCase(),
        cat: productData.cat,
        cost: productData.cost,
        price: productData.price,
        stock: productData.stock,
        image: productData.image || createTileSvg('📦', 220),
      };

      setStoreState((prev) => ({
        ...prev,
        products: [newProduct, ...prev.products],
      }));

      addToast(`Product "${newProduct.name}" added`);
      if (newProduct.stock === 0) {
        addToast(`${newProduct.name} has zero stock`, 'warn');
      }
      return newProduct;
    },
    [addToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setStoreState((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === id
            ? {
                ...p,
                ...updates,
                sku: updates.sku ? updates.sku.toUpperCase() : p.sku,
              }
            : p
        ),
      }));
      addToast('Product updated');
    },
    [addToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const p = storeState.products.find((x) => x.id === id);
      setStoreState((prev) => ({
        ...prev,
        products: prev.products.filter((x) => x.id !== id),
      }));
      setCart((prev) => prev.filter((c) => c.id !== id));
      addToast(p ? `Deleted "${p.name}"` : 'Product deleted', 'warn');
    },
    [storeState.products, addToast]
  );

  const restockProduct = useCallback(
    (id: string, amount = 10) => {
      let updatedName = '';
      let updatedStock = 0;
      setStoreState((prev) => {
        const updated = prev.products.map((p) => {
          if (p.id === id) {
            updatedName = p.name;
            updatedStock = p.stock + amount;
            return { ...p, stock: updatedStock };
          }
          return p;
        });
        return { ...prev, products: updated };
      });
      addToast(`${updatedName} restocked → ${updatedStock} units`);
    },
    [addToast]
  );

  const resetDemoData = useCallback(() => {
    const seed = getInitialSeedData();
    setStoreState(seed);
    setCart([]);
    addToast('Sample data restored');
  }, [addToast]);

  const value = useMemo(
    () => ({
      products: storeState.products,
      sales: storeState.sales,
      cart,
      currentView,
      setCurrentView,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      inventoryViewMode,
      setInventoryViewMode,
      paymentMethod,
      setPaymentMethod,
      toasts,
      addToast,
      removeToast,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      completeCheckout,
      addProduct,
      updateProduct,
      deleteProduct,
      restockProduct,
      resetDemoData,
      editingProduct,
      setEditingProduct,
      deletingProductId,
      setDeletingProductId,
      isResetConfirmOpen,
      setIsResetConfirmOpen,
      viewingReceipt,
      setViewingReceipt,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
    }),
    [
      storeState,
      cart,
      currentView,
      searchQuery,
      selectedCategory,
      inventoryViewMode,
      paymentMethod,
      toasts,
      addToast,
      removeToast,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      completeCheckout,
      addProduct,
      updateProduct,
      deleteProduct,
      restockProduct,
      resetDemoData,
      editingProduct,
      deletingProductId,
      isResetConfirmOpen,
      viewingReceipt,
      isMobileSidebarOpen,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

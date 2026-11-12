export type PaymentMethod = 'Cash' | 'Card' | 'E-Wallet';

export interface Product {
  id: string;
  name: string;
  sku: string;
  cat: string;
  cost: number;
  price: number;
  stock: number;
  image: string;
}

export interface SaleItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  ts: number;
  items: SaleItem[];
  pay: PaymentMethod;
  subtotal: number;
  tax: number;
  total: number;
  profit: number;
}

export interface CartItem {
  id: string;
  qty: number;
}

export type NavigationTab = 'dashboard' | 'inventory' | 'pos' | 'sales';
export type InventoryViewMode = 'grid' | 'table';
export type DateRangeFilter = 'All' | 'Today' | 'Last 7 days';
export type PaymentFilter = 'All' | PaymentMethod;

export interface ToastMessage {
  id: string;
  message: string;
  type: 'ok' | 'warn' | 'error';
}

export interface StoreState {
  products: Product[];
  sales: Sale[];
  seq: number;
}

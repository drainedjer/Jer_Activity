import { PaymentMethod, Product, Sale, SaleItem, StoreState, DateRangeFilter, PaymentFilter } from '../types';

export const TAX_RATE = 0.12;
export const STORAGE_KEY = 'mcs_inventory_v1';

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const formatCurrency = (n: number): string =>
  '₱' + (+n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const createTileSvg = (emoji: string, hue: number): string =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},85%,93%)"/><stop offset="1" stop-color="hsl(${hue},70%,80%)"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><text x="100" y="128" font-size="86" text-anchor="middle">${emoji}</text></svg>`
  );

export const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#F1F5F9"/><g fill="none" stroke="#94A3B8" stroke-width="6" stroke-linejoin="round"><path d="M100 60l40 20v40l-40 20-40-20V80z"/><path d="M60 80l40 20 40-20M100 100v40"/></g></svg>'
  );

export const calculateMargin = (
  cost: number,
  price: number
): { profitPerUnit: number; marginPercent: number } => {
  const profitPerUnit = round2(price - cost);
  const marginPercent = price > 0 ? round2((profitPerUnit / price) * 100) : 0;
  return { profitPerUnit, marginPercent };
};

export const makeSale = (
  items: SaleItem[],
  pay: PaymentMethod,
  ts: number,
  seq: number
): { sale: Sale; nextSeq: number } => {
  const subtotal = round2(items.reduce((acc, item) => acc + item.price * item.qty, 0));
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);
  const profit = round2(items.reduce((acc, item) => acc + (item.price - item.cost) * item.qty, 0));

  const sale: Sale = {
    id: `R-${seq}`,
    ts,
    items,
    pay,
    subtotal,
    tax,
    total,
    profit,
  };

  return { sale, nextSeq: seq + 1 };
};

const SEED_PRODUCT_DATA: [string, string, string, number, number, number, string, number][] = [
  ['Whole Milk 1L', 'GRO-1001', 'Grocery', 48, 65, 24, '🥛', 210],
  ['Sourdough Bread', 'BAK-1002', 'Bakery', 55, 85, 3, '🍞', 35],
  ['Free-Range Eggs (12)', 'GRO-1003', 'Grocery', 90, 125, 18, '🥚', 45],
  ['Fresh Bananas 1kg', 'PRO-1004', 'Produce', 42, 70, 30, '🍌', 50],
  ['Red Apples 1kg', 'PRO-1005', 'Produce', 95, 140, 4, '🍎', 0],
  ['Cold Brew Coffee', 'BEV-1006', 'Beverages', 60, 95, 16, '☕', 25],
  ['Sparkling Water', 'BEV-1007', 'Beverages', 18, 30, 48, '💧', 195],
  ['Potato Chips', 'SNK-1008', 'Snacks', 28, 45, 40, '🥔', 40],
  ['Dark Chocolate Bar', 'SNK-1009', 'Snacks', 55, 90, 2, '🍫', 20],
  ['USB-C Cable 1m', 'TEC-1010', 'Electronics', 120, 220, 12, '🔌', 230],
  ['Wireless Earbuds', 'TEC-1011', 'Electronics', 650, 1190, 7, '🎧', 260],
  ['Power Bank 10,000mAh', 'TEC-1012', 'Electronics', 480, 850, 9, '🔋', 150],
];

export const getInitialSeedData = (): StoreState => {
  const products: Product[] = SEED_PRODUCT_DATA.map((p, i) => ({
    id: `p${i + 1}`,
    name: p[0],
    sku: p[1],
    cat: p[2],
    cost: p[3],
    price: p[4],
    stock: p[5],
    image: createTileSvg(p[6], p[7]),
  }));

  const sales: Sale[] = [];
  let seq = 1001;

  let r = 7;
  const rnd = () => {
    r = (r * 9301 + 49297) % 233280;
    return r / 233280;
  };

  const paymentMethods: PaymentMethod[] = ['Cash', 'Card', 'E-Wallet'];

  for (let d = 6; d >= 0; d--) {
    const n = 3 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const dt = new Date();
      dt.setDate(dt.getDate() - d);
      dt.setHours(9 + Math.floor(rnd() * 9), Math.floor(rnd() * 60), 0, 0);

      const items: SaleItem[] = [];
      const m = 1 + Math.floor(rnd() * 3);
      for (let j = 0; j < m; j++) {
        const p = products[Math.floor(rnd() * products.length)];
        if (!items.find((x) => x.id === p.id)) {
          items.push({
            id: p.id,
            name: p.name,
            sku: p.sku,
            qty: 1 + Math.floor(rnd() * 3),
            price: p.price,
            cost: p.cost,
          });
        }
      }

      const payMethod = paymentMethods[Math.floor(rnd() * paymentMethods.length)];
      const { sale, nextSeq } = makeSale(items, payMethod, dt.getTime(), seq);
      seq = nextSeq;
      sales.push(sale);
    }
  }

  sales.sort((a, b) => b.ts - a.ts);

  return {
    products,
    sales,
    seq,
  };
};

export const filterProducts = (products: Product[], category: string, query: string): Product[] => {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const matchesCat = category === 'All' || p.cat === category;
    const matchesQuery = !q || (p.name + ' ' + p.sku).toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });
};

export const filterSales = (
  sales: Sale[],
  dateRange: DateRangeFilter,
  payment: PaymentFilter,
  query: string,
  now = new Date()
): Sale[] => {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgoStart = todayStart - 6 * 24 * 60 * 60 * 1000;
  const q = query.trim().toLowerCase();

  return sales.filter((s) => {
    const matchesPay = payment === 'All' || s.pay === payment;
    let matchesRange = true;
    if (dateRange === 'Today') {
      matchesRange = s.ts >= todayStart;
    } else if (dateRange === 'Last 7 days') {
      matchesRange = s.ts >= sevenDaysAgoStart;
    }

    const matchesQuery =
      !q || s.id.toLowerCase().includes(q) || s.items.some((i) => i.name.toLowerCase().includes(q));

    return matchesPay && matchesRange && matchesQuery;
  });
};

export const formatSaleItemsSummary = (items: SaleItem[]): string =>
  items.map((i) => `${i.qty}× ${i.name}`).join(', ');

export const formatDateTime = (ts: number): string =>
  new Date(ts).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const generateInventoryCsvRows = (products: Product[]): (string | number)[][] => [
  ['Name', 'SKU', 'Category', 'Cost Price', 'Selling Price', 'Stock', 'Margin %'],
  ...products.map((p) => [
    p.name,
    p.sku,
    p.cat,
    p.cost,
    p.price,
    p.stock,
    p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(1) : 0,
  ]),
];

export const generateSalesCsvRows = (sales: Sale[]): (string | number)[][] => [
  ['Receipt ID', 'Date & Time', 'Items Sold', 'Payment Method', 'Subtotal', 'VAT', 'Total', 'Net Profit'],
  ...sales.map((s) => [
    s.id,
    new Date(s.ts).toLocaleString('en-PH'),
    formatSaleItemsSummary(s.items),
    s.pay,
    s.subtotal,
    s.tax,
    s.total,
    s.profit,
  ]),
];

export const exportToCsv = (filename: string, rows: (string | number)[][]): void => {
  const data =
    '\ufeff' +
    rows
      .map((row) => row.map((val) => '"' + String(val).replace(/"/g, '""') + '"').join(','))
      .join('\n');

  try {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export CSV', err);
  }
};

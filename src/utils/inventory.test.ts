import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMargin,
  makeSale,
  round2,
  filterProducts,
  filterSales,
  getInitialSeedData,
  TAX_RATE,
} from './inventory';
import { Product, SaleItem } from '../types';

test('round2 handles floating precision properly', () => {
  assert.equal(round2(10.255), 10.26);
  assert.equal(round2(10.254), 10.25);
  assert.equal(round2(0), 0);
});

test('calculateMargin computes unit profit and margin percentage', () => {
  // Cost 48, Price 65 -> profit 17, margin 26.15%
  const res = calculateMargin(48, 65);
  assert.equal(res.profitPerUnit, 17);
  assert.equal(res.marginPercent, 26.15);

  // Free/zero price
  const zero = calculateMargin(10, 0);
  assert.equal(zero.profitPerUnit, -10);
  assert.equal(zero.marginPercent, 0);
});

test('makeSale correctly computes subtotal, 12% VAT, total and profit', () => {
  const items: SaleItem[] = [
    { id: 'p1', name: 'Whole Milk 1L', sku: 'GRO-1001', qty: 2, price: 65, cost: 48 },
    { id: 'p2', name: 'Sourdough Bread', sku: 'BAK-1002', qty: 1, price: 85, cost: 55 },
  ];
  // Subtotal = 2*65 + 1*85 = 130 + 85 = 215.00
  // Tax (12%) = 215 * 0.12 = 25.80
  // Total = 240.80
  // Profit = (65-48)*2 + (85-55)*1 = 17*2 + 30*1 = 34 + 30 = 64.00

  const { sale, nextSeq } = makeSale(items, 'Cash', 1700000000000, 1001);
  assert.equal(sale.id, 'R-1001');
  assert.equal(sale.subtotal, 215);
  assert.equal(sale.tax, 25.8);
  assert.equal(sale.total, 240.8);
  assert.equal(sale.profit, 64);
  assert.equal(sale.pay, 'Cash');
  assert.equal(nextSeq, 1002);
});

test('filterProducts filters by category and search keyword', () => {
  const products: Product[] = [
    { id: '1', name: 'Whole Milk 1L', sku: 'GRO-1001', cat: 'Grocery', cost: 48, price: 65, stock: 10, image: '' },
    { id: '2', name: 'Sourdough Bread', sku: 'BAK-1002', cat: 'Bakery', cost: 55, price: 85, stock: 5, image: '' },
    { id: '3', name: 'Free-Range Eggs', sku: 'GRO-1003', cat: 'Grocery', cost: 90, price: 125, stock: 2, image: '' },
  ];

  // All
  assert.equal(filterProducts(products, 'All', '').length, 3);
  // Category filter
  assert.equal(filterProducts(products, 'Grocery', '').length, 2);
  assert.equal(filterProducts(products, 'Bakery', '').length, 1);
  // Search filter
  assert.equal(filterProducts(products, 'All', 'milk').length, 1);
  assert.equal(filterProducts(products, 'All', 'GRO-1003').length, 1);
  assert.equal(filterProducts(products, 'Bakery', 'milk').length, 0);
});

test('getInitialSeedData returns valid initial products and 7-day sales records', () => {
  const seed = getInitialSeedData();
  assert.equal(seed.products.length, 12);
  assert.ok(seed.sales.length > 10, 'Expected seeded sales');
  assert.ok(seed.seq > 1001);
});

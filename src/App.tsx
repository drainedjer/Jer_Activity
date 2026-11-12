/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { PosView } from './components/PosView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ProductModal } from './components/ProductModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/ToastContainer';

const MainContent: React.FC = () => {
  const { currentView } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'inventory' && <InventoryView />}
          {currentView === 'pos' && <PosView />}
          {currentView === 'sales' && <SalesHistoryView />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ProductModal />
      <ReceiptModal />
      <ConfirmModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}

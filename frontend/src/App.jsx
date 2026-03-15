import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AccountingDashboard from './pages/accounting/AccountingDashboard';
import Invoices from './pages/accounting/Invoices';
import Expenses from './pages/accounting/Expenses';
import Suppliers from './pages/accounting/Suppliers';
import CRMDashboard from './pages/crm/CRMDashboard';
import Clients from './pages/crm/Clients';
import Leads from './pages/crm/Leads';
import Quotations from './pages/crm/Quotations';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import StockList from './pages/inventory/StockList';
import ProjectsDashboard from './pages/projects/ProjectsDashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetail from './pages/projects/ProjectDetail';
import Workers from './pages/projects/Workers';
import Login from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('achi_auth') === 'true'
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounting">
            <Route index element={<AccountingDashboard />} />
            <Route path="invoices"  element={<Invoices />} />
            <Route path="expenses"  element={<Expenses />} />
            <Route path="suppliers" element={<Suppliers />} />
          </Route>
          <Route path="crm">
            <Route index element={<CRMDashboard />} />
            <Route path="clients"    element={<Clients />} />
            <Route path="leads"      element={<Leads />} />
            <Route path="quotations" element={<Quotations />} />
          </Route>
          <Route path="inventory">
            <Route index element={<InventoryDashboard />} />
            <Route path="stock" element={<StockList />} />
          </Route>
          <Route path="projects">
            <Route index element={<ProjectsDashboard />} />
            <Route path="list"    element={<ProjectList />} />
            <Route path="workers" element={<Workers />} />
            <Route path=":id"     element={<ProjectDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import '../../styles/custom.css';

const pageTitles = {
  '/':                     'Dashboard',
  '/accounting':           'Accounting · Overview',
  '/accounting/invoices':  'Accounting · Invoices',
  '/accounting/expenses':  'Accounting · Expenses',
  '/accounting/suppliers': 'Accounting · Suppliers',
  '/crm':                  'CRM · Overview',
  '/crm/clients':          'CRM · Clients',
  '/crm/leads':            'CRM · Leads',
  '/crm/quotations':       'CRM · Quotations',
  '/inventory':            'Inventory · Overview',
  '/inventory/stock':      'Inventory · Stock List',
  '/projects':             'Projects · Overview',
  '/projects/list':        'Projects · All Projects',
  '/projects/workers':     'Projects · Workers',
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'ACHI ERP';
  const [module, page] = title.split(' · ');

  return (
    <header className="app-header">
      <div className="header-breadcrumb">
        <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onMenuClick}><Menu size={18} /></button>
        <span className="header-module">{module}</span>
        {page && <><span className="header-sep">/</span><span className="header-page">{page}</span></>}
      </div>
     
    </header>
  );
}

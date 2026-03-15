import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Users, Package, FolderKanban, ChevronDown, HardHat } from 'lucide-react';
import { useState } from 'react';
import '../../styles/custom.css';

const modules = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Accounting', icon: DollarSign, base: '/accounting', children: [
    { label: 'Overview',  path: '/accounting' },
    { label: 'Invoices',  path: '/accounting/invoices' },
    { label: 'Expenses',  path: '/accounting/expenses' },
    { label: 'Suppliers', path: '/accounting/suppliers' },
  ]},
  { label: 'CRM', icon: Users, base: '/crm', children: [
    { label: 'Overview',   path: '/crm' },
    { label: 'Clients',    path: '/crm/clients' },
    { label: 'Leads',      path: '/crm/leads' },
    { label: 'Quotations', path: '/crm/quotations' },
  ]},
  { label: 'Inventory', icon: Package, base: '/inventory', children: [
    { label: 'Overview',   path: '/inventory' },
    { label: 'Stock List', path: '/inventory/stock' },
  ]},
  { label: 'Projects', icon: FolderKanban, base: '/projects', children: [
    { label: 'Overview',     path: '/projects' },
    { label: 'All Projects', path: '/projects/list' },
    { label: 'Workers',      path: '/projects/workers' },
  ]},
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => {
    const active = modules.find(m => m.base && location.pathname.startsWith(m.base));
    return active ? active.label : 'Accounting';
  });

  return (
    <aside className={`sidebar${isOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-wrap">
          <img src="/logo.png" alt="ACHI Logo" />
        </div>
        <div>
          <div className="sidebar-brand-name">ACHI</div>
          <div className="sidebar-brand-sub">SCAFFOLDING ERP</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {modules.map(mod => {
          if (!mod.children) {
            return (
              <NavLink key={mod.label} to={mod.path} end onClick={onClose} className={({ isActive }) => `sidebar-navlink${isActive ? ' active' : ''}`}>
                <mod.icon size={16} />{mod.label}
              </NavLink>
            );
          }
          const isOpen = expanded === mod.label;
          const isActive = location.pathname.startsWith(mod.base);
          return (
            <div key={mod.label} className="sidebar-item">
              <button onClick={() => setExpanded(prev => prev === mod.label ? null : mod.label)} className={`sidebar-module-btn${isActive ? ' active' : ''}`}>
                <mod.icon size={16} />
                <span className="sidebar-label">{mod.label}</span>
                <ChevronDown size={13} className="sidebar-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              {isOpen && (
                <div className="sidebar-submenu">
                  {mod.children.map(child => (
                    <NavLink key={child.path} to={child.path} end onClick={onClose} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        ACHI Scaffolding © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
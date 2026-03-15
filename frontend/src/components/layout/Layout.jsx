import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Header onMenuClick={() => setMobileOpen(prev => !prev)} />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
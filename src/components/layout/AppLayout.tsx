import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Protect demo routes: if not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Derive header title from current route
  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return {
          title: 'Dashboard',
          subtitle: `Live view · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · updates as bills are settled`,
        };
      case '/tables':
        return {
          title: 'Tables',
          subtitle: 'Real-time floor map & guest management',
        };
      case '/pos':
        return {
          title: 'POS Billing',
          subtitle: 'Ready — pick items to start a bill',
        };
      case '/kds':
        return {
          title: 'Kitchen Display',
          subtitle: 'Live tickets · target 15 min per ticket',
        };
      case '/orders':
        return {
          title: 'Orders & Bills',
          subtitle: 'Search, reprint receipts and void bills',
        };
      case '/menu':
        return {
          title: 'Menu Management',
          subtitle: 'Items, categories, variants & pricing',
        };
      case '/inventory':
        return {
          title: 'Inventory',
          subtitle: 'Stock on hand, unit costs & reorder tracking',
        };
      case '/customers':
        return {
          title: 'Customers',
          subtitle: 'Local guest database & visit history',
        };
      case '/loyalty':
        return {
          title: 'Loyalty Program',
          subtitle: 'Points balance, tiers & redemption rules',
        };
      case '/qrcodes':
        return {
          title: 'QR Codes',
          subtitle: 'Table scannable codes pointing to local server',
        };
      case '/staff':
        return {
          title: 'Staff',
          subtitle: 'Team members, PIN access & shift stats',
        };
      case '/reports':
        return {
          title: 'Reports',
          subtitle: 'Sales analytics, hour mix & revenue insights',
        };
      case '/settings':
        return {
          title: 'Settings',
          subtitle: 'Outlet profile, taxes, printers & local LAN server',
        };
      case '/backup':
        return {
          title: 'Backup & Restore',
          subtitle: 'Everything lives on this machine — keep a copy',
        };
      default:
        return { title: 'Morrow & Bean POS', subtitle: 'Floor operations' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-cream-200 text-espresso-950 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-espresso-950/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

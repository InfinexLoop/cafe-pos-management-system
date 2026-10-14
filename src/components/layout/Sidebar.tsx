import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BRAND } from '../../lib/branding';
import {
  LayoutDashboard,
  Grid2X2,
  Receipt,
  ChefHat,
  FileText,
  UtensilsCrossed,
  Boxes,
  Users,
  Award,
  QrCode,
  UserCheck,
  BarChart3,
  Settings,
  Database,
  Coffee,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { db, heldOrders } = useApp();

  const occupiedTablesCount = db.tables.filter((t) => t.status === 'occupied').length;
  const activeKotsCount = db.kots.filter((k) => k.status === 'new' || k.status === 'preparing').length;
  const lowStockCount = db.inventory.filter((i) => i.onHand <= i.reorder).length;

  const navGroups = [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Tables', path: '/tables', icon: Grid2X2, badge: occupiedTablesCount > 0 ? occupiedTablesCount : undefined, badgeColor: 'bg-terracotta-500' },
        { label: 'POS Billing', path: '/pos', icon: Receipt, badge: heldOrders.length > 0 ? heldOrders.length : undefined, badgeColor: 'bg-espresso-800' },
        { label: 'Kitchen', path: '/kds', icon: ChefHat, badge: activeKotsCount > 0 ? activeKotsCount : undefined, badgeColor: 'bg-amber-600' },
        { label: 'Orders & Bills', path: '/orders', icon: FileText },
      ],
    },
    {
      title: 'MANAGE',
      items: [
        { label: 'Menu', path: '/menu', icon: UtensilsCrossed },
        { label: 'Inventory', path: '/inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-red-500' },
        { label: 'Customers', path: '/customers', icon: Users },
        { label: 'Loyalty', path: '/loyalty', icon: Award },
        { label: 'QR Codes', path: '/qrcodes', icon: QrCode },
        { label: 'Staff', path: '/staff', icon: UserCheck },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Backup & Restore', path: '/backup', icon: Database },
      ],
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-espresso-100 flex flex-col h-full min-h-screen text-espresso-900 select-none shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-espresso-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-espresso-800 flex items-center justify-center text-cream-100 shadow-md">
            <Coffee className="w-6 h-6 text-terracotta-400" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-base tracking-tight text-espresso-950 leading-tight">
              {BRAND.name}
            </h2>
            <p className="text-[11px] text-terracotta-600 font-semibold truncate max-w-[130px]">
              {BRAND.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 text-[11px] font-bold text-espresso-400 tracking-wider uppercase mb-2">
              {group.title}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-espresso-800 text-cream-100 shadow-sm font-semibold'
                          : 'text-espresso-700 hover:bg-cream-100 hover:text-espresso-950'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full text-white font-bold leading-none ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Server status & Developer attribution */}
      <div className="p-4 border-t border-espresso-100 bg-cream-50 text-xs space-y-2">
        <div className="flex items-center justify-between text-espresso-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
            <span className="font-medium text-espresso-800">Local server online</span>
          </div>
          <span className="text-[11px] text-espresso-400 font-mono">192.168.1.50:8080</span>
        </div>

        {/* Infinex Loop Developer Attribution */}
        <div className="pt-2 border-t border-espresso-100/60 text-[11px] text-espresso-500 flex items-center justify-between">
          <span>
            Developed by{' '}
            <a
              href={BRAND.developer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-terracotta-600 hover:text-terracotta-700 hover:underline inline-flex items-center gap-0.5"
            >
              {BRAND.developer.name}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </span>
        </div>
      </div>
    </aside>
  );
};

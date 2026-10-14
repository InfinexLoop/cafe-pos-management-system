import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, LogOut, Shield, Wifi, AlertTriangle } from 'lucide-react';
import { BRAND } from '../../lib/branding';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onToggleMobileMenu }) => {
  const { currentUser, logout, db, acknowledgeCall } = useApp();

  const unacknowledgedCalls = db.calls.filter((c) => !c.acknowledged);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-espresso-100 px-4 md:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-espresso-700 hover:bg-espresso-50 border border-espresso-100"
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-espresso-900 tracking-tight flex items-center gap-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-espresso-500 font-medium">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center: Live Call Alert Pill (if table is calling) */}
        {unacknowledgedCalls.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-terracotta-50 border border-terracotta-300 text-terracotta-800 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-terracotta-600" />
            <span>
              {unacknowledgedCalls.length} table calling: {unacknowledgedCalls[0].tableName} (
              {unacknowledgedCalls[0].note})
            </span>
            <button
              type="button"
              onClick={() => acknowledgeCall(unacknowledgedCalls[0].id)}
              className="ml-2 text-xs bg-terracotta-600 hover:bg-terracotta-700 text-white px-2 py-0.5 rounded-full transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Right: Local Server Status & Staff Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-50 border border-sage-200 text-sage-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-ping" />
            <Wifi className="w-3.5 h-3.5 text-sage-600" />
            <span>LAN Online</span>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-espresso-100">
              <div className="w-9 h-9 rounded-full bg-espresso-800 text-cream-100 flex items-center justify-center font-bold text-sm shadow-sm">
                {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-espresso-950 leading-tight">{currentUser.name}</div>
                <div className="text-[11px] text-terracotta-600 font-semibold uppercase tracking-wider">
                  {currentUser.role}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out of current shift"
                className="p-2 ml-1 rounded-lg text-espresso-400 hover:text-terracotta-600 hover:bg-terracotta-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

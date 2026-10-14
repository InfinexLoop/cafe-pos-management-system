import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BRAND } from '../lib/branding';
import {
  Coffee,
  CheckCircle2,
  Delete,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { db, login, currentUser } = useApp();
  const navigate = useNavigate();

  const [selectedStaffId, setSelectedStaffId] = useState<string>(db.staff[0]?.id || 'u1');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [shake, setShake] = useState<boolean>(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const selectedStaff = db.staff.find((s) => s.id === selectedStaffId) || db.staff[0];

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        attemptLogin(selectedStaffId, nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const attemptLogin = (staffId: string, enteredPin: string) => {
    const res = login(staffId, enteredPin);
    if (res.ok) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Wrong PIN');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          attemptLogin(selectedStaffId, pin);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedStaffId]);

  const features = [
    'Works with zero internet',
    'Live kitchen display & KOT printing',
    'Per-table QR ordering',
    'Points, tiers and redemption',
    'Owner dashboard, anywhere',
  ];

  return (
    <div className="min-h-screen w-full bg-cream-200 flex items-center justify-center p-4 md:p-6 select-none">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-float border border-espresso-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand & Features Hero */}
        <div className="lg:col-span-4 bg-espresso-800 text-cream-100 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative coffee bean background rings */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-espresso-700/30 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-terracotta-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-terracotta-500/20 border border-terracotta-400/40 flex items-center justify-center shadow-inner">
                <Coffee className="w-7 h-7 text-terracotta-400" />
              </div>
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight text-cream-100">
                  {BRAND.name}
                </h1>
                <p className="text-xs text-terracotta-300 font-medium">{BRAND.tagline}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="font-display font-extrabold text-2xl tracking-tight leading-tight text-white">
                Point of Sale,<br />built for the floor.
              </h2>
              <p className="text-xs text-espresso-200 leading-relaxed">
                Offline-first billing, KOT, QR ordering and loyalty — all running on the café’s own local server.
              </p>
            </div>

            <ul className="space-y-2.5 pt-4 border-t border-espresso-700/60">
              {features.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-xs text-espresso-100 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-sage-400 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer attribution */}
          <div className="relative z-10 pt-6 border-t border-espresso-700/60 text-xs text-espresso-300 flex items-center justify-between">
            <span>
              Developed by{' '}
              <a
                href={BRAND.developer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta-300 hover:text-white font-semibold underline underline-offset-2 inline-flex items-center gap-1"
              >
                {BRAND.developer.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            </span>
            <span className="text-[11px] opacity-70">Demo v1.0</span>
          </div>
        </div>

        {/* Right Area: Single-Column Staff Selector + Keypad Panel */}
        <div className="lg:col-span-8 p-6 md:p-8 bg-white flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Staff User Single-Column Selector (1 per row, exactly 5 cards) */}
            <div className="md:col-span-7 flex flex-col">
              <div className="mb-3.5">
                <h3 className="font-display font-bold text-2xl text-espresso-950">Sign in</h3>
                <p className="text-xs text-espresso-500 font-medium">
                  Select your profile, then enter the 4-digit PIN.
                </p>
              </div>

              {/* Exactly 5 vertically stacked cards in a single-column layout */}
              <div className="flex flex-col gap-3 w-full">
                {db.staff.map((staff) => {
                  const isSelected = selectedStaffId === staff.id;
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaffId(staff.id);
                        setPin('');
                        setError('');
                      }}
                      className={`w-full h-[78px] px-3.5 py-2.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-espresso-800 border-espresso-800 text-white shadow-md ring-2 ring-terracotta-500/50'
                          : 'bg-cream-50/80 hover:bg-cream-100 border-espresso-100 text-espresso-900 hover:border-terracotta-300'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs tracking-wider shrink-0 transition-colors ${
                          isSelected ? 'bg-terracotta-500 text-white shadow-sm' : 'bg-espresso-100 text-espresso-800'
                        }`}
                      >
                        {staff.avatar || staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>

                      {/* Staff Name and Role */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-espresso-950'}`}>
                          {staff.name}
                        </div>
                        <div className={`text-[11px] font-medium truncate mt-0.5 ${isSelected ? 'text-espresso-200' : 'text-espresso-500'}`}>
                          {staff.roleDescription || staff.role}
                        </div>
                      </div>

                      {/* PIN Badge */}
                      <div
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wide transition-colors ${
                          isSelected
                            ? 'bg-white/20 text-cream-100 border border-white/20'
                            : 'bg-espresso-100 text-espresso-700 border border-espresso-200/60'
                        }`}
                      >
                        PIN {staff.pin}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PIN Entry & Keypad Column */}
            <div className="md:col-span-5 flex flex-col justify-between h-full bg-cream-50/60 p-5 rounded-2xl border border-espresso-100">
              <div>
                {/* Active Selected Staff Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-espresso-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-espresso-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {selectedStaff.avatar || selectedStaff.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-espresso-950 truncate leading-tight">
                        {selectedStaff.name}
                      </div>
                      <div className="text-[10px] text-espresso-500 truncate">
                        {selectedStaff.roleDescription || selectedStaff.role}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-md border border-terracotta-200/60 shrink-0">
                    Active
                  </span>
                </div>

                {/* PIN Dots Display */}
                <div
                  className={`flex flex-col items-center justify-center mb-3.5 transition-transform ${
                    shake ? 'animate-bounce' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 h-9">
                    {[0, 1, 2, 3].map((index) => {
                      const filled = pin.length > index;
                      return (
                        <div
                          key={index}
                          className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                            filled
                              ? 'bg-terracotta-600 scale-125 shadow-sm'
                              : 'bg-espresso-100 border border-espresso-300'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {error ? (
                    <p className="text-xs font-semibold text-red-600 mt-1">{error}</p>
                  ) : (
                    <p className="text-[11px] text-espresso-400 font-medium mt-1">
                      Enter 4-digit PIN for {selectedStaff.name.split(' ')[0]}
                    </p>
                  )}
                </div>

                {/* Tactile Keypad */}
                <div className="max-w-[240px] mx-auto grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleDigit(digit)}
                      className="keypad-btn text-xl font-bold font-display h-11"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="keypad-btn text-[11px] font-bold text-espresso-500 uppercase tracking-wider h-11"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDigit('0')}
                    className="keypad-btn text-xl font-bold font-display h-11"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="keypad-btn text-espresso-700 h-11"
                    aria-label="Backspace"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Sign-In Trigger button */}
              <div className="pt-3 mt-3 border-t border-espresso-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPin(selectedStaff.pin);
                    attemptLogin(selectedStaff.id, selectedStaff.pin);
                  }}
                  className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Quick Login as {selectedStaff.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] text-espresso-400 font-medium">
                  Counter 1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

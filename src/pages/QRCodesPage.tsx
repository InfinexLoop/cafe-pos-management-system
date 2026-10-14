import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  QrCode as QrIcon,
  Printer,
  ExternalLink,
  Smartphone,
  CheckCircle,
  Copy,
} from 'lucide-react';
import QRCode from 'qrcode';
import { BRAND } from '../lib/branding';

export const QRCodesPage: React.FC = () => {
  const { db } = useApp();
  const navigate = useNavigate();

  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  // Generate QR code for each table
  useEffect(() => {
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/$/, '');
    const generateCodes = async () => {
      const urls: Record<string, string> = {};
      for (const table of db.tables) {
        // Link to in-app guest ordering or standalone qr page
        const guestUrl = `${origin}${path}/#/guest-menu?table=${table.id}`;
        try {
          const dataUrl = await QRCode.toDataURL(guestUrl, {
            width: 200,
            margin: 1,
            color: {
              dark: '#38261F',
              light: '#FFFFFF',
            },
          });
          urls[table.id] = dataUrl;
        } catch (e) {
          console.error('Error generating QR', e);
        }
      }
      setQrDataUrls(urls);
    };
    generateCodes();
  }, [db.tables]);

  const handleCopyLink = (tableId: string) => {
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/$/, '');
    const guestUrl = `${origin}${path}/#/guest-menu?table=${tableId}`;
    navigator.clipboard.writeText(guestUrl);
    setCopiedTable(tableId);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Actions */}
      <div className="bg-white p-6 rounded-2xl border border-espresso-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-espresso-950">QR Codes</h2>
            <p className="text-xs text-espresso-500 font-medium">
              One scannable code per table · points to the local server
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/guest-menu?table=T1')}
              className="px-4 py-2.5 rounded-xl border border-espresso-200 hover:bg-cream-100 text-xs font-bold text-espresso-800 flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Preview guest menu</span>
            </button>
            <button
              type="button"
              onClick={handlePrintAll}
              className="px-4 py-2.5 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print all tent cards</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cream-50 border border-espresso-100 text-xs text-espresso-700 space-y-1">
          <div className="font-bold text-espresso-900 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-sage-600" />
            <span>Table ordering is live</span>
          </div>
          <p className="text-espresso-600 leading-relaxed">
            Guests scan, browse the menu with photos, order, track the kitchen and sign in for points. Codes are generated against current domain — so on the café’s own machine they resolve over the LAN with no internet.
          </p>
        </div>
      </div>

      {/* Grid of 12 Table QR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {db.tables.map((table) => {
          const qrUrl = qrDataUrls[table.id];
          const isCopied = copiedTable === table.id;

          return (
            <div
              key={table.id}
              className="bg-white p-5 rounded-2xl border border-espresso-100 shadow-soft flex flex-col items-center text-center justify-between space-y-4"
            >
              <div>
                <span className="font-display font-extrabold text-2xl text-espresso-950">
                  {table.name}
                </span>
                <p className="text-xs text-espresso-500 font-medium">
                  {table.area} · {table.seats} seats
                </p>
              </div>

              {/* QR Image */}
              <div className="p-3 bg-cream-50 rounded-2xl border border-espresso-100 shadow-inner flex items-center justify-center">
                {qrUrl ? (
                  <img src={qrUrl} alt={`QR Code for Table ${table.name}`} className="w-36 h-36 rounded-lg" />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-espresso-300">
                    <QrIcon className="w-12 h-12 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                <div className="text-[10px] font-mono text-espresso-400 truncate px-2">
                  /#/guest-menu?table={table.id}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-espresso-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/guest-menu?table=${table.id}`)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-espresso-200 text-espresso-800 hover:bg-cream-50 text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3 text-terracotta-500" />
                    <span>Open</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(table.id)}
                    className="py-1.5 px-3 rounded-xl border border-espresso-200 text-espresso-700 hover:bg-cream-50 text-xs font-bold flex items-center justify-center gap-1"
                    title="Copy QR URL"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isCopied ? 'Copied' : 'Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BRAND } from '../lib/branding';
import { Product, ProductVariant, Addon } from '../types';
import {
  Coffee,
  Bell,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GuestQRMenuPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table') || 'T1';

  const { db, callCaptain, sendKOT, addToCart, cartItems, cartTotalAmount, clearCart } = useApp();

  const table = db.tables.find((t) => t.id === tableParam) || db.tables[0];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Call waiter state
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [callNote, setCallNote] = useState<string>('Need water & extra plates');
  const [calledToast, setCalledToast] = useState<boolean>(false);

  // Item customization modal
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [kitchenNote, setKitchenNote] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Cart drawer
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const filteredProducts = db.products.filter((p) => {
    if (!p.available) return false;
    if (activeCategory !== 'all' && p.catId !== activeCategory) return false;
    if (vegOnly && !p.veg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedVariant(product.variants.length > 0 ? product.variants[0] : undefined);
    setSelectedAddons([]);
    setKitchenNote('');
    setItemQuantity(1);
  };

  const handleConfirmAdd = () => {
    if (!customizingProduct) return;
    addToCart(customizingProduct, itemQuantity, {
      variant: selectedVariant,
      selectedAddons,
      kitchenNote,
    });
    setCustomizingProduct(null);
  };

  const handleSendOrder = () => {
    if (cartItems.length === 0) return;
    sendKOT();
    setOrderPlaced(true);
    clearCart();
    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch (e) {}
  };

  const handleCallStaff = () => {
    callCaptain(table.id, callNote);
    setShowCallModal(false);
    setCalledToast(true);
    setTimeout(() => setCalledToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-cream-200 text-espresso-950 font-sans pb-28 select-none">
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-espresso-100 px-4 py-3 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-espresso-800 text-cream-100 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-terracotta-400" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base leading-tight text-espresso-950">
                {BRAND.name}
              </h1>
              <p className="text-[10px] text-terracotta-600 font-semibold">{BRAND.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCallModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 border border-espresso-200 text-espresso-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Call Waiter</span>
            </button>
            <Link
              to="/dashboard"
              className="text-[11px] font-bold text-espresso-400 hover:text-espresso-700 ml-1"
            >
              POS Staff
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Table Banner */}
        <div className="p-4 rounded-2xl bg-espresso-800 text-cream-100 shadow-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-2xl text-white">{table.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-terracotta-500 text-white font-bold">
                {table.area}
              </span>
            </div>
            <p className="text-xs text-espresso-200 mt-0.5">Seating capacity: {table.seats} guests</p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-sage-300 font-semibold flex items-center gap-1 justify-end">
              <Sparkles className="w-3 h-3" />
              <span>Earn 5% points</span>
            </span>
            <div className="text-[10px] text-espresso-300">Order directly to kitchen</div>
          </div>
        </div>

        {/* Toast confirmation */}
        {calledToast && (
          <div className="p-3 bg-sage-100 border border-sage-300 rounded-xl text-xs font-bold text-sage-900 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-sage-700" />
            <span>Captain notified! Floor staff will attend Table {table.name} shortly.</span>
          </div>
        )}

        {/* Search & Veg Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, drinks, desserts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-espresso-100 text-xs font-medium text-espresso-900 focus:outline-hidden focus:border-terracotta-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-espresso-700 cursor-pointer">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600"
              />
              <span className="flex items-center gap-1">
                <span className="veg-indicator"><span className="dot" /></span>
                <span>Vegetarian only</span>
              </span>
            </label>
            <span className="text-[11px] text-espresso-400 font-medium">
              {filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-espresso-800 text-white shadow-2xs'
                : 'bg-white border border-espresso-100 text-espresso-700'
            }`}
          >
            All
          </button>
          {db.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-espresso-800 text-white shadow-2xs'
                  : 'bg-white border border-espresso-100 text-espresso-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Order Placed Success Message */}
        {orderPlaced && (
          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-sage-900">
              <CheckCircle2 className="w-5 h-5 text-sage-600" />
              <span>Order sent to kitchen!</span>
            </div>
            <p className="text-xs text-sage-800 leading-relaxed">
              Your ticket is now active on the kitchen display. Hot food is being freshly prepared for Table {table.name}.
            </p>
            <button
              type="button"
              onClick={() => setOrderPlaced(false)}
              className="text-xs font-bold text-sage-700 underline"
            >
              Order more items
            </button>
          </div>
        )}

        {/* Product Cards List */}
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="p-3.5 rounded-2xl bg-white border border-espresso-100 shadow-soft flex items-start justify-between gap-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  {product.veg ? (
                    <span className="veg-indicator"><span className="dot" /></span>
                  ) : (
                    <span className="nonveg-indicator"><span className="triangle" /></span>
                  )}
                  <span className="font-bold text-xs text-espresso-950">{product.name}</span>
                </div>
                <p className="text-[11px] text-espresso-500 leading-snug line-clamp-2">
                  {product.desc}
                </p>
                <div className="font-mono font-bold text-xs text-espresso-900 pt-1">
                  ₹{product.price.toLocaleString('en-IN')}{' '}
                  {product.variants.length > 0 && (
                    <span className="text-[10px] text-espresso-400 font-sans font-normal">onwards</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-2xl shadow-inner">
                  {product.img}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAdd(product)}
                  className="px-3 py-1 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>ADD</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-gradient-to-t from-cream-200 via-cream-200 to-transparent">
          <div className="max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setShowCartDrawer(true)}
              className="w-full p-4 rounded-2xl bg-espresso-800 hover:bg-espresso-900 text-white shadow-float flex items-center justify-between font-bold text-sm transition-all active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-terracotta-500 text-white text-xs flex items-center justify-center font-mono">
                  {cartItems.reduce((s, i) => s + i.quantity, 0)}
                </div>
                <span>View Order</span>
              </div>
              <div className="flex items-center gap-2 font-mono font-extrabold text-base">
                <span>₹{cartTotalAmount.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4 text-terracotta-400" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Call Waiter Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">Call Floor Staff</h3>
              <button
                type="button"
                onClick={() => setShowCallModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-espresso-700">What do you need at Table {table.name}?</label>
              <div className="space-y-2">
                {[
                  'Need water & extra plates',
                  'Requesting bill',
                  'Cleaning assistance',
                  'Call floor captain',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCallNote(preset)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                      callNote === preset
                        ? 'bg-espresso-800 text-white border-espresso-800'
                        : 'bg-cream-50 text-espresso-900 border-espresso-100 hover:bg-cream-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCallModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-espresso-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCallStaff}
                className="px-5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold shadow-2xs"
              >
                Notify Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white max-w-md w-full rounded-t-3xl sm:rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <h3 className="font-display font-bold text-base text-espresso-950">
                Your Table Order ({table.name})
              </h3>
              <button
                type="button"
                onClick={() => setShowCartDrawer(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3 rounded-xl border border-espresso-100 bg-cream-50/50 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-espresso-950">{item.product.name}</div>
                    {item.variant && <div className="text-[11px] text-espresso-500">{item.variant.name}</div>}
                    <div className="font-mono text-espresso-700">₹{item.itemTotal.toLocaleString('en-IN')}</div>
                  </div>
                  <span className="font-mono font-bold text-xs bg-white border border-espresso-200 px-2.5 py-1 rounded-lg">
                    {item.quantity}×
                  </span>
                </div>
              ))}

              <div className="pt-2 border-t border-espresso-100 space-y-1">
                <label className="text-[11px] font-semibold text-espresso-600">
                  Mobile Number (Optional — earn loyalty points)
                </label>
                <input
                  type="text"
                  placeholder="10-digit number"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200"
                />
              </div>

              <div className="pt-2 flex justify-between font-bold text-sm text-espresso-950">
                <span>Payable at table counter</span>
                <span className="font-mono">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCartDrawer(false)}
                className="px-4 py-2.5 rounded-xl border border-espresso-200 text-espresso-700 font-bold text-xs"
              >
                Add More
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendOrder();
                  setShowCartDrawer(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-sm"
              >
                Send Order to Kitchen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">
                {customizingProduct.name}
              </h3>
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customizingProduct.variants.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-bold text-espresso-700 uppercase tracking-wider text-[10px]">
                  Select Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {customizingProduct.variants.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2 rounded-xl border text-center ${
                        selectedVariant?.name === v.name
                          ? 'bg-espresso-800 text-white font-bold'
                          : 'bg-cream-50 text-espresso-800'
                      }`}
                    >
                      <div>{v.name}</div>
                      <div className="font-mono text-[10px]">₹{v.price}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 bg-cream-100 px-2 py-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  className="w-6 h-6 rounded bg-white flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold w-4 text-center">{itemQuantity}</span>
                <button
                  type="button"
                  onClick={() => setItemQuantity(itemQuantity + 1)}
                  className="w-6 h-6 rounded bg-white flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmAdd}
                className="py-2.5 px-5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

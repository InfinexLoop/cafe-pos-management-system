import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductVariant, Addon, CartItem, OrderType, Customer, PaymentMode } from '../types';
import { BRAND } from '../lib/branding';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  ChefHat,
  PauseCircle,
  Tag,
  UserPlus,
  Printer,
  CheckCircle2,
  AlertCircle,
  QrCode,
  DollarSign,
  Split,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const POSPage: React.FC = () => {
  const {
    db,
    cartItems,
    addToCart,
    updateCartQty,
    removeCartItem,
    clearCart,
    orderType,
    setOrderType,
    selectedTableId,
    setSelectedTableId,
    selectedCustomer,
    setSelectedCustomer,
    cartDiscount,
    cartDiscountType,
    setCartDiscount,
    heldOrders,
    holdOrder,
    resumeHeldOrder,
    deleteHeldOrder,
    cartSubtotal,
    cartDiscountAmount,
    cartTaxAmount,
    cartTotalAmount,
    cartRoundOff,
    sendKOT,
    settleBill,
    addCustomer,
  } = useApp();

  // Search & Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);

  // Modals state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [kitchenNote, setKitchenNote] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  const [showHeldModal, setShowHeldModal] = useState<boolean>(false);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showKotReceiptModal, setShowKotReceiptModal] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [lastFiredKot, setLastFiredKot] = useState<any>(null);

  // Mobile drawer
  const [mobileCartOpen, setMobileCartOpen] = useState<boolean>(false);

  // Payment modal state
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [tenderedAmount, setTenderedAmount] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [discountTypeInput, setDiscountTypeInput] = useState<'percent' | 'flat'>('percent');

  // Customer search / add form state
  const [custSearch, setCustSearch] = useState<string>('');
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');

  // Filter products
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

  // Open item customization
  const handleProductCardClick = (product: Product) => {
    setCustomizingProduct(product);
    setSelectedVariant(product.variants.length > 0 ? product.variants[0] : undefined);
    setSelectedAddons([]);
    setKitchenNote('');
    setItemQuantity(1);
  };

  const handleConfirmAddToCart = () => {
    if (!customizingProduct) return;
    addToCart(customizingProduct, itemQuantity, {
      variant: selectedVariant,
      selectedAddons,
      kitchenNote,
    });
    setCustomizingProduct(null);
  };

  const currentModalPrice = customizingProduct
    ? (selectedVariant ? selectedVariant.price : customizingProduct.price) +
      selectedAddons.reduce((s, a) => s + a.price, 0)
    : 0;

  // Settle bill
  const handleOpenPayment = () => {
    setPaymentMode('Cash');
    setTenderedAmount(String(cartTotalAmount));
    setShowPaymentModal(true);
  };

  const handleSettleAndPrint = () => {
    const tendered = parseFloat(tenderedAmount) || cartTotalAmount;
    const change = Math.max(0, tendered - cartTotalAmount);
    const order = settleBill({
      mode: paymentMode,
      tendered,
      change,
    });
    setCompletedOrder(order);
    setShowPaymentModal(false);
    setShowReceiptModal(true);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  // Fire KOT
  const handleFireKOT = () => {
    const kot = sendKOT();
    if (kot) {
      setLastFiredKot(kot);
      setShowKotReceiptModal(true);
    }
  };

  const handlePrintWindow = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto h-[calc(100vh-100px)] min-h-[650px] pb-6">
      {/* LEFT: Products Catalog & Categories */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden">
        {/* Top Controls: Search, Veg only & Held orders */}
        <div className="p-4 border-b border-espresso-100 flex flex-wrap items-center justify-between gap-3 bg-cream-50/50">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-espresso-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search menu items…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-espresso-100 text-xs font-medium text-espresso-900 placeholder:text-espresso-400 focus:outline-hidden focus:border-terracotta-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-espresso-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="w-4 h-4 rounded text-sage-600 focus:ring-sage-500"
              />
              <span className="flex items-center gap-1">
                <span className="veg-indicator"><span className="dot" /></span>
                <span>Veg only</span>
              </span>
            </label>

            <button
              type="button"
              onClick={() => setShowHeldModal(true)}
              className="px-3 py-2 rounded-xl border border-espresso-200 bg-white hover:bg-cream-100 text-xs font-bold text-espresso-800 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Held ({heldOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="px-4 py-2.5 border-b border-espresso-100 flex items-center gap-2 overflow-x-auto bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-espresso-800 text-white shadow-2xs'
                : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
            }`}
          >
            <span>🍽️</span>
            <span>All</span>
          </button>
          {db.categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-espresso-800 text-white shadow-2xs'
                  : 'bg-cream-100 text-espresso-700 hover:bg-cream-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-[11px] font-semibold text-espresso-400 mb-2">
            {filteredProducts.length} items available
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleProductCardClick(product)}
                className="flex flex-col justify-between p-3.5 rounded-2xl border border-espresso-100 bg-white hover:border-terracotta-400 hover:shadow-card text-left transition-all group min-h-[125px] relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-cream-100 flex items-center justify-center text-lg flex-shrink-0">
                      {product.img}
                    </div>
                    {product.veg ? (
                      <span className="veg-indicator"><span className="dot" /></span>
                    ) : (
                      <span className="nonveg-indicator"><span className="triangle" /></span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-espresso-950 line-clamp-1 group-hover:text-terracotta-600 transition-colors">
                    {product.name}
                  </div>
                  {product.variants.length > 0 && (
                    <span className="text-[10px] text-espresso-400 font-medium">
                      {product.variants.length} sizes
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-espresso-950 font-display">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-cream-100 text-espresso-600 group-hover:bg-terracotta-500 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart Panel (Fixed width on desktop, modal drawer on mobile) */}
      <div className="w-full lg:w-96 flex flex-col h-full bg-white rounded-2xl border border-espresso-100 shadow-soft overflow-hidden flex-shrink-0">
        {/* Order Type Tabs: Dine-in / Takeaway / Delivery */}
        <div className="p-3 border-b border-espresso-100 bg-cream-50 flex items-center gap-1">
          {(['dine_in', 'takeaway', 'delivery'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                orderType === type
                  ? 'bg-espresso-800 text-white shadow-2xs'
                  : 'text-espresso-600 hover:bg-cream-100'
              }`}
            >
              {type.replace('_', '-')}
            </button>
          ))}
        </div>

        {/* Dine-in Table Selector or Customer info */}
        <div className="px-4 py-2.5 border-b border-espresso-100 bg-white flex items-center justify-between gap-2">
          {orderType === 'dine_in' ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs font-semibold text-espresso-500">Table:</span>
              <select
                value={selectedTableId || ''}
                onChange={(e) => setSelectedTableId(e.target.value || null)}
                className="flex-1 py-1 px-2.5 rounded-lg border border-espresso-200 text-xs font-bold text-espresso-900 bg-cream-50"
              >
                <option value="">Select Table</option>
                {db.tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.area} · {t.seats}s) {t.status === 'occupied' ? '· Occupied' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-xs font-medium text-espresso-600">
              {orderType === 'takeaway' ? 'Direct Counter Pickup' : 'Delivery Dispatch'}
            </div>
          )}

          {/* Customer Attachment */}
          <button
            type="button"
            onClick={() => setShowCustomerModal(true)}
            className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{selectedCustomer ? selectedCustomer.name.split(' ')[0] : 'Add guest'}</span>
          </button>
        </div>

        {/* Selected Customer Loyalty Pill */}
        {selectedCustomer && (
          <div className="px-4 py-1.5 bg-sage-50 border-b border-sage-200 text-sage-900 text-xs flex items-center justify-between">
            <span className="font-semibold">{selectedCustomer.name} ({selectedCustomer.tier})</span>
            <span className="font-bold">{selectedCustomer.points} pts available</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-espresso-400">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-semibold text-espresso-700">No items yet</p>
              <p className="text-xs text-espresso-400 mt-1">Tap a product from the menu to start the bill.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="p-2.5 rounded-xl border border-espresso-100 bg-cream-50/40 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-espresso-950">{item.product.name}</div>
                    {item.variant && (
                      <span className="text-[11px] text-espresso-500 font-medium">{item.variant.name}</span>
                    )}
                    {item.addons.length > 0 && (
                      <div className="text-[10px] text-terracotta-600">
                        +{item.addons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                    {item.kitchenNote && (
                      <div className="text-[10px] text-amber-700 italic">“{item.kitchenNote}”</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-xs text-espresso-950">
                      ₹{item.itemTotal.toLocaleString('en-IN')}
                    </span>
                    <div className="text-[10px] text-espresso-400">@ ₹{item.unitPrice}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-espresso-100/40">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.cartItemId, -1)}
                      className="w-6 h-6 rounded-md bg-white border border-espresso-200 flex items-center justify-center text-espresso-700 hover:bg-cream-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.cartItemId, 1)}
                      className="w-6 h-6 rounded-md bg-white border border-espresso-200 flex items-center justify-center text-espresso-700 hover:bg-cream-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCartItem(item.cartItemId)}
                    className="text-espresso-400 hover:text-red-600 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary Calculations */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-espresso-100 bg-cream-50/70 space-y-1.5 text-xs">
            <div className="flex justify-between text-espresso-600">
              <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-mono">₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {cartDiscountAmount > 0 && (
              <div className="flex justify-between text-terracotta-600 font-semibold">
                <span>Discount ({cartDiscountType === 'percent' ? `${cartDiscount}%` : 'flat'})</span>
                <span className="font-mono">-₹{cartDiscountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-espresso-600">
              <span>GST {db.settings.tax}% (CGST + SGST)</span>
              <span className="font-mono">₹{cartTaxAmount.toFixed(2)}</span>
            </div>
            {cartRoundOff !== 0 && (
              <div className="flex justify-between text-espresso-400 text-[11px]">
                <span>Round off</span>
                <span className="font-mono">{cartRoundOff > 0 ? `+₹${cartRoundOff}` : `-₹${Math.abs(cartRoundOff)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-espresso-950 font-display pt-1 border-t border-espresso-200">
              <span>Total</span>
              <span className="font-mono">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Cart Action Buttons */}
        <div className="p-3 border-t border-espresso-100 bg-white grid grid-cols-5 gap-1.5 flex-shrink-0">
          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={() => setShowDiscountModal(true)}
            className="py-2.5 rounded-xl border border-espresso-200 text-espresso-700 hover:bg-cream-100 text-[11px] font-bold flex flex-col items-center justify-center disabled:opacity-40 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 mb-0.5 text-terracotta-500" />
            <span>Discount</span>
          </button>

          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={() => holdOrder()}
            className="py-2.5 rounded-xl border border-espresso-200 text-espresso-700 hover:bg-cream-100 text-[11px] font-bold flex flex-col items-center justify-center disabled:opacity-40 transition-colors"
          >
            <PauseCircle className="w-3.5 h-3.5 mb-0.5 text-amber-500" />
            <span>Hold</span>
          </button>

          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={() => clearCart()}
            className="py-2.5 rounded-xl border border-espresso-200 text-espresso-700 hover:bg-cream-100 text-[11px] font-bold flex flex-col items-center justify-center disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mb-0.5 text-red-500" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={handleFireKOT}
            className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex flex-col items-center justify-center disabled:opacity-40 shadow-2xs transition-colors"
          >
            <ChefHat className="w-3.5 h-3.5 mb-0.5" />
            <span>KOT</span>
          </button>

          <button
            type="button"
            disabled={cartItems.length === 0}
            onClick={handleOpenPayment}
            className="py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold flex flex-col items-center justify-center disabled:opacity-40 shadow-sm transition-colors"
          >
            <CreditCard className="w-4 h-4 mb-0.5" />
            <span>Pay</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: Product Customization Dialog */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <h3 className="font-display font-bold text-lg text-espresso-950">
                {customizingProduct.name}
              </h3>
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className="p-1.5 text-espresso-400 hover:text-espresso-700 rounded-lg hover:bg-espresso-100/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center text-3xl shadow-inner">
                  {customizingProduct.img}
                </div>
                <div>
                  <p className="text-xs text-espresso-600 leading-relaxed">{customizingProduct.desc}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                    {customizingProduct.veg ? (
                      <>
                        <span className="veg-indicator"><span className="dot" /></span>
                        <span className="text-sage-700">Vegetarian</span>
                      </>
                    ) : (
                      <>
                        <span className="nonveg-indicator"><span className="triangle" /></span>
                        <span className="text-red-700">Non-Veg</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Variants Selector */}
              {customizingProduct.variants.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso-700 uppercase tracking-wider">
                    Size / Variant
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {customizingProduct.variants.map((v) => {
                      const isSelected = selectedVariant?.name === v.name;
                      return (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-espresso-800 border-espresso-800 text-white font-bold shadow-2xs'
                              : 'bg-white border-espresso-200 text-espresso-800 hover:bg-cream-50'
                          }`}
                        >
                          <div className="text-xs">{v.name}</div>
                          <div className="text-[11px] font-mono opacity-80">
                            ₹{v.price.toLocaleString('en-IN')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons Checklist */}
              {customizingProduct.addons.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso-700 uppercase tracking-wider">
                    Add-ons
                  </label>
                  <div className="space-y-2">
                    {customizingProduct.addons.map((add) => {
                      const isChecked = selectedAddons.some((a) => a.name === add.name);
                      return (
                        <label
                          key={add.name}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-espresso-100 bg-cream-50/50 hover:bg-cream-100 cursor-pointer select-none transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAddons([...selectedAddons, add]);
                                } else {
                                  setSelectedAddons(selectedAddons.filter((a) => a.name !== add.name));
                                }
                              }}
                              className="w-4 h-4 rounded text-terracotta-500"
                            />
                            <span className="text-xs font-medium text-espresso-900">{add.name}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-terracotta-600">
                            +₹{add.price}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kitchen Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-espresso-700 uppercase tracking-wider">
                  Kitchen note
                </label>
                <input
                  type="text"
                  placeholder="e.g. less spicy, no onion, extra crispy"
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-xs text-espresso-900 placeholder:text-espresso-400 focus:outline-hidden focus:border-terracotta-500"
                />
              </div>
            </div>

            {/* Modal Footer: Stepper & Add Button */}
            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-espresso-200">
                <button
                  type="button"
                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center text-espresso-700 hover:bg-cream-200"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold font-mono w-6 text-center">{itemQuantity}</span>
                <button
                  type="button"
                  onClick={() => setItemQuantity(itemQuantity + 1)}
                  className="w-7 h-7 rounded-lg bg-cream-100 flex items-center justify-center text-espresso-700 hover:bg-cream-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="flex-1 py-3 px-5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Add ·</span>
                <span className="font-mono">
                  ₹{(currentModalPrice * itemQuantity).toLocaleString('en-IN')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Held Bills Drawer */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <h3 className="font-display font-bold text-base text-espresso-950">
                Held Bills ({heldOrders.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowHeldModal(false)}
                className="p-1.5 text-espresso-400 hover:text-espresso-700 rounded-lg hover:bg-espresso-100/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {heldOrders.length === 0 ? (
                <p className="text-xs text-espresso-500 text-center py-8">No held orders right now.</p>
              ) : (
                heldOrders.map((held) => (
                  <div
                    key={held.id}
                    className="p-3 rounded-xl border border-espresso-100 bg-cream-50/50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-xs text-espresso-950">{held.name}</div>
                      <div className="text-[11px] text-espresso-500">
                        {held.items.length} items · {Math.max(1, Math.round((Date.now() - held.timestamp) / 60000))}m ago
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          resumeHeldOrder(held.id);
                          setShowHeldModal(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-espresso-800 text-white text-xs font-bold hover:bg-espresso-900"
                      >
                        Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHeldOrder(held.id)}
                        className="p-1.5 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-espresso-950">Apply Bill Discount</h3>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex rounded-xl bg-cream-100 p-1">
              <button
                type="button"
                onClick={() => setDiscountTypeInput('percent')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  discountTypeInput === 'percent' ? 'bg-white text-espresso-950 shadow-2xs' : 'text-espresso-600'
                }`}
              >
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountTypeInput('flat')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                  discountTypeInput === 'flat' ? 'bg-white text-espresso-950 shadow-2xs' : 'text-espresso-600'
                }`}
              >
                Flat Amount (₹)
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-espresso-600">Discount value</label>
              <input
                type="number"
                min="0"
                value={discountInput || ''}
                onChange={(e) => setDiscountInput(parseFloat(e.target.value) || 0)}
                placeholder={discountTypeInput === 'percent' ? '10' : '100'}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-sm font-bold text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCartDiscount(0, 'percent');
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-600"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => {
                  setCartDiscount(discountInput, discountTypeInput);
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-2xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Guest / Customer Selector */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <h3 className="font-display font-bold text-base text-espresso-950">Attach Guest</h3>
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-espresso-100">
              <input
                type="text"
                placeholder="Search by name or mobile…"
                value={custSearch}
                onChange={(e) => setCustSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-xs font-medium focus:outline-hidden focus:border-terracotta-500"
              />
            </div>
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {db.customers
                .filter((c) =>
                  custSearch.trim()
                    ? c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)
                    : true
                )
                .slice(0, 8)
                .map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(cust);
                      setShowCustomerModal(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-espresso-100 bg-cream-50/50 hover:bg-cream-100 text-left transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-espresso-950">{cust.name}</div>
                      <div className="text-[11px] text-espresso-500">{cust.phone}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800">
                        {cust.tier}
                      </span>
                      <div className="text-[10px] font-bold text-terracotta-600 mt-0.5">
                        {cust.points} pts
                      </div>
                    </div>
                  </button>
                ))}
            </div>

            {/* Quick Add New Guest form */}
            <div className="p-4 border-t border-espresso-100 bg-cream-50 space-y-2">
              <div className="text-xs font-bold text-espresso-800">Or add new guest:</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Guest Name"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-espresso-200 text-xs"
                />
                <input
                  type="text"
                  placeholder="Phone number"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-espresso-200 text-xs"
                />
              </div>
              <button
                type="button"
                disabled={!newCustName.trim()}
                onClick={() => {
                  const created = addCustomer({
                    name: newCustName.trim(),
                    phone: newCustPhone.trim() || '98470 00000',
                    tier: 'Silver',
                  });
                  setSelectedCustomer(created);
                  setShowCustomerModal(false);
                  setNewCustName('');
                  setNewCustPhone('');
                }}
                className="w-full py-2 bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold rounded-xl disabled:opacity-40"
              >
                Save & Attach Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Payment & Settle Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50">
              <h3 className="font-display font-bold text-lg text-espresso-950">
                Settle bill · ₹{cartTotalAmount.toLocaleString('en-IN')}
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Totals Preview */}
              <div className="p-3 rounded-2xl bg-cream-100/70 border border-espresso-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-espresso-600">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-espresso-600">
                  <span>GST ({db.settings.tax}%)</span>
                  <span className="font-mono">₹{cartTaxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-espresso-950 pt-1 border-t border-espresso-200">
                  <span>Payable</span>
                  <span className="font-mono">₹{cartTotalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-espresso-700 uppercase tracking-wider">
                  Payment mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'UPI', 'Card'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        paymentMode === mode
                          ? 'bg-espresso-800 border-espresso-800 text-white shadow-2xs'
                          : 'bg-white border-espresso-200 text-espresso-800 hover:bg-cream-50'
                      }`}
                    >
                      {mode === 'Cash' && <DollarSign className="w-3.5 h-3.5" />}
                      {mode === 'UPI' && <QrCode className="w-3.5 h-3.5" />}
                      {mode === 'Card' && <CreditCard className="w-3.5 h-3.5" />}
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-espresso-400">
                  UPI & Card are wired for the future — cash is the live mode today.
                </p>
              </div>

              {/* Amount Tendered & Quick Cash Chips (for Cash mode) */}
              {paymentMode === 'Cash' && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-espresso-700">Amount tendered</label>
                    <input
                      type="number"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-espresso-200 text-lg font-bold font-mono text-espresso-900 focus:outline-hidden focus:border-terracotta-500"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[cartTotalAmount, 300, 500, 1000].map((cash) => (
                      <button
                        key={cash}
                        type="button"
                        onClick={() => setTenderedAmount(String(cash))}
                        className="py-1.5 px-2 rounded-lg bg-cream-100 hover:bg-cream-200 border border-espresso-100 text-xs font-bold text-espresso-800"
                      >
                        ₹{cash}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-sage-50 border border-sage-200 text-xs">
                    <span className="font-semibold text-sage-900">Change to return</span>
                    <span className="font-extrabold font-mono text-sm text-sage-950">
                      ₹{Math.max(0, (parseFloat(tenderedAmount) || 0) - cartTotalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2.5 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSettleAndPrint}
                className="flex-1 py-2.5 px-5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Settle & print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: 80mm Thermal Receipt Preview */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50 no-print">
              <h3 className="font-display font-bold text-base text-espresso-950">
                Bill #{completedOrder.billNo}
              </h3>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-black bg-white receipt-printable space-y-3">
              <div className="text-center space-y-1">
                <div className="font-extrabold text-base tracking-wider">{BRAND.name}</div>
                <div className="text-[11px]">{BRAND.address}</div>
                <div className="text-[11px]">Ph: {BRAND.phone}</div>
                <div className="text-[10px]">
                  GSTIN: {BRAND.gstin} &nbsp; FSSAI: {BRAND.fssai}
                </div>
              </div>

              <div className="border-t border-b border-black border-dashed py-1 text-center font-bold">
                TAX INVOICE
              </div>

              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">#{completedOrder.billNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(completedOrder.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{completedOrder.type.replace('_', ' ')} {completedOrder.tableId ? `· ${completedOrder.tableId}` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{completedOrder.cashierName}</span>
                </div>
                {completedOrder.customerName && completedOrder.customerName !== 'Walk-in' && (
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{completedOrder.customerName}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border-t border-b border-black border-dashed py-2 space-y-1.5">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="flex-1">Item</span>
                  <span className="w-8 text-right">Qty</span>
                  <span className="w-16 text-right">Amt</span>
                </div>
                {completedOrder.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="flex-1 truncate">
                      {it.product.name} {it.variant ? `(${it.variant.name})` : ''}
                    </span>
                    <span className="w-8 text-right">{it.quantity}</span>
                    <span className="w-16 text-right font-mono">₹{it.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{completedOrder.subtotal.toFixed(2)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-mono">-₹{completedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST @ 2.5%</span>
                  <span className="font-mono">₹{(completedOrder.tax / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST @ 2.5%</span>
                  <span className="font-mono">₹{(completedOrder.tax / 2).toFixed(2)}</span>
                </div>
                {completedOrder.roundOff !== 0 && (
                  <div className="flex justify-between">
                    <span>Round off</span>
                    <span className="font-mono">₹{completedOrder.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-b border-black py-1">
                  <span>TOTAL</span>
                  <span className="font-mono">₹{completedOrder.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>{completedOrder.payment.mode}</span>
                  <span className="font-mono">₹{completedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="border-t border-black border-dashed pt-3 text-center text-[10px] space-y-1">
                <div>Thank you! Visit again 🙏</div>
                <div>Scan the table QR to order & earn points</div>
                <div className="pt-2 text-[9px] text-gray-500">
                  {BRAND.developer.attribution}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-between gap-3 no-print">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700 hover:bg-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintWindow}
                className="flex-1 py-2.5 px-5 rounded-xl bg-espresso-800 hover:bg-espresso-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print 80mm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: KOT Print Slip Preview */}
      {showKotReceiptModal && lastFiredKot && (
        <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-float border border-espresso-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-espresso-100 flex items-center justify-between bg-cream-50 no-print">
              <h3 className="font-display font-bold text-base text-espresso-950">
                Kitchen Order Ticket #{lastFiredKot.kotNo}
              </h3>
              <button
                type="button"
                onClick={() => setShowKotReceiptModal(false)}
                className="text-espresso-400 hover:text-espresso-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-black bg-white receipt-printable space-y-3">
              <div className="text-center font-extrabold text-base border-b border-black pb-1">
                KITCHEN TICKET #{lastFiredKot.kotNo}
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold text-sm">
                  <span>Destination:</span>
                  <span>{lastFiredKot.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize">{lastFiredKot.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{new Date(lastFiredKot.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="border-t border-b border-black border-dashed py-2 space-y-2">
                {lastFiredKot.items.map((i: any, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-xs">
                      <span>{i.quantity}× {i.product.name}</span>
                      <span>{i.variant?.name || ''}</span>
                    </div>
                    {i.kitchenNote && (
                      <div className="text-[10px] pl-3 italic font-semibold">
                        ** NOTE: {i.kitchenNote} **
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] text-gray-500 pt-1">
                Fired to {lastFiredKot.station === 'bev' ? 'Beverage Bar' : 'Hot Kitchen'}
              </div>
            </div>

            <div className="p-4 border-t border-espresso-100 bg-cream-50 flex items-center justify-between gap-3 no-print">
              <button
                type="button"
                onClick={() => setShowKotReceiptModal(false)}
                className="px-4 py-2 rounded-xl border border-espresso-200 text-xs font-bold text-espresso-700"
              >
                Done
              </button>
              <button
                type="button"
                onClick={handlePrintWindow}
                className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

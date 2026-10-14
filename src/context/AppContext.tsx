import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CafeDatabase,
  StaffUser,
  CartItem,
  Product,
  OrderType,
  Customer,
  PaymentDetails,
  Order,
  KOT,
  KOTStatus,
  ProductVariant,
  Addon,
  OutletSettings,
  LoyaltySettings,
  TableItem,
  InventoryItem,
} from '../types';
import { createInitialDatabase } from '../lib/seed';

const DB_STORAGE_KEY = 'morrow_bean.pos.v1';
const SESSION_STORAGE_KEY = 'morrow_bean.pos.session';

export interface HeldOrder {
  id: string;
  name: string;
  items: CartItem[];
  orderType: OrderType;
  tableId: string | null;
  customer: Customer | null;
  timestamp: number;
}

interface AppContextType {
  db: CafeDatabase;
  currentUser: StaffUser | null;
  login: (staffId: string, pin: string) => { ok: boolean; error?: string };
  logout: () => void;

  // Cart & POS
  cartItems: CartItem[];
  orderType: OrderType;
  selectedTableId: string | null;
  selectedCustomer: Customer | null;
  cartDiscount: number;
  cartDiscountType: 'percent' | 'flat';
  heldOrders: HeldOrder[];

  addToCart: (
    product: Product,
    quantity?: number,
    customization?: {
      variant?: ProductVariant;
      selectedAddons?: Addon[];
      kitchenNote?: string;
    }
  ) => void;
  updateCartQty: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setSelectedTableId: (tableId: string | null) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setCartDiscount: (amount: number, type: 'percent' | 'flat') => void;
  holdOrder: (label?: string) => void;
  resumeHeldOrder: (heldId: string) => void;
  deleteHeldOrder: (heldId: string) => void;

  // Calculations
  cartSubtotal: number;
  cartDiscountAmount: number;
  cartTaxAmount: number;
  cartTotalAmount: number;
  cartRoundOff: number;

  // Operations
  sendKOT: () => KOT | null;
  settleBill: (payment: PaymentDetails) => Order;
  updateKOTStatus: (kotId: string, status: KOTStatus) => void;
  voidOrder: (orderId: string, reason: string) => void;

  // Tables
  freeTable: (tableId: string) => void;
  occupyTable: (tableId: string, guestCount?: number) => void;
  acknowledgeCall: (callId: string) => void;
  callCaptain: (tableId: string, note?: string) => void;

  // Menu
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  toggleProductAvailable: (id: string) => void;

  // Inventory
  stockIn: (ingredientId: string, quantity: number, unitCost?: number) => void;
  adjustWaste: (ingredientId: string, quantity: number, reason: string) => void;

  // Customers & Loyalty
  addCustomer: (data: Omit<Customer, 'id' | 'points' | 'visits' | 'spend' | 'since' | 'lastVisit'>) => Customer;
  updateLoyaltySettings: (settings: Partial<LoyaltySettings>) => void;

  // Staff
  addStaff: (data: Omit<StaffUser, 'id' | 'active'>) => void;
  updateStaff: (id: string, data: Partial<StaffUser>) => void;

  // Settings & Demo State
  updateSettings: (settings: Partial<OutletSettings>) => void;
  resetDemoData: () => void;
  exportBackup: () => void;
  importBackup: (jsonContent: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database State
  const [db, setDb] = useState<CafeDatabase>(() => {
    try {
      const stored = localStorage.getItem(DB_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.version === 1) {
          // Ensure staff list carries updated staff names
          if (Array.isArray(parsed.staff)) {
            let updated = false;
            parsed.staff = parsed.staff.map((s: StaffUser) => {
              if (s.id === 'u1' && (s.name.includes('Shafeek') || s.name !== 'Adrian Mitchell')) {
                updated = true;
                return { ...s, name: 'Adrian Mitchell', roleDescription: 'Owner / Administrator', avatar: 'AM' };
              }
              if (s.id === 'u2' && (s.name.includes('Rahul') || s.name !== 'Daniel Brooks')) {
                updated = true;
                return { ...s, name: 'Daniel Brooks', roleDescription: 'Billing Counter', avatar: 'DB' };
              }
              if (s.id === 'u3' && (s.name.includes('Anees') || s.name !== 'Oliver Bennett')) {
                updated = true;
                return { ...s, name: 'Oliver Bennett', roleDescription: 'Floor Captain', avatar: 'OB' };
              }
              if (s.id === 'u4' && (s.name.includes('Divya') || s.name !== 'Sophia Carter')) {
                updated = true;
                return { ...s, name: 'Sophia Carter', roleDescription: 'Floor Captain', avatar: 'SC' };
              }
              if (s.id === 'u5' && (s.name.includes('Kitchen') || s.name !== 'Ethan Parker')) {
                updated = true;
                return { ...s, name: 'Ethan Parker', roleDescription: 'Kitchen Staff', avatar: 'EP', phone: '98470 55555' };
              }
              return s;
            });
            if (updated) {
              try {
                localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsed));
              } catch (_) {}
            }
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load database from localStorage', e);
    }
    const fresh = createInitialDatabase();
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(fresh));
    } catch (e) {
      console.warn('localStorage is full or unavailable', e);
    }
    return fresh;
  });

  // Current Logged in User State
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    try {
      const storedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        if (parsed) {
          if (parsed.id === 'u1') parsed.name = 'Adrian Mitchell';
          else if (parsed.id === 'u2') parsed.name = 'Daniel Brooks';
          else if (parsed.id === 'u3') parsed.name = 'Oliver Bennett';
          else if (parsed.id === 'u4') parsed.name = 'Sophia Carter';
          else if (parsed.id === 'u5') parsed.name = 'Ethan Parker';
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse session', e);
    }
    return null;
  });

  // Active Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [cartDiscountType, setCartDiscountType] = useState<'percent' | 'flat'>('percent');
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([
    {
      id: 'held-1',
      name: 'Takeaway (Morning Coffee)',
      items: [
        {
          cartItemId: 'held-item-1',
          product: db.products[25], // Cold Coffee
          quantity: 1,
          variant: db.products[25].variants[0],
          addons: [],
          unitPrice: 149,
          itemTotal: 149,
        },
      ],
      orderType: 'takeaway',
      tableId: null,
      customer: db.customers[0],
      timestamp: Date.now() - 25 * 60000,
    },
  ]);

  // Persist DB updates
  const saveDb = (newDb: CafeDatabase) => {
    setDb(newDb);
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(newDb));
    } catch (e) {
      console.error('Failed to save database to localStorage', e);
    }
  };

  // Auth
  const login = (staffId: string, pin: string) => {
    const user = db.staff.find((s) => s.id === staffId && s.active);
    if (!user) {
      return { ok: false, error: 'User not found or inactive.' };
    }
    if (user.pin !== pin) {
      return { ok: false, error: 'Incorrect 4-digit PIN. Please try again.' };
    }

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('sessionStorage not available', e);
    }
    setCurrentUser(user);

    // Log login activity
    const newActivity = [
      {
        id: `act-${Date.now()}`,
        staffId: user.id,
        staffName: user.name,
        type: 'login',
        text: `${user.name} signed in`,
        at: Date.now(),
      },
      ...db.activity,
    ].slice(0, 50);

    saveDb({ ...db, activity: newActivity });
    return { ok: true };
  };

  const logout = () => {
    if (currentUser) {
      const newActivity = [
        {
          id: `act-${Date.now()}`,
          staffId: currentUser.id,
          staffName: currentUser.name,
          type: 'logout',
          text: `${currentUser.name} signed out`,
          at: Date.now(),
        },
        ...db.activity,
      ].slice(0, 50);
      saveDb({ ...db, activity: newActivity });
    }
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
    setCurrentUser(null);
  };

  // Cart item calculation helpers
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.itemTotal, 0);

  const cartDiscountAmount =
    cartDiscountType === 'percent'
      ? Math.round(((cartSubtotal * cartDiscount) / 100) * 100) / 100
      : Math.min(cartDiscount, cartSubtotal);

  const discountedSubtotal = Math.max(0, cartSubtotal - cartDiscountAmount);
  const cartTaxAmount = Math.round(discountedSubtotal * (db.settings.tax / 100) * 100) / 100;
  const rawTotal = discountedSubtotal + cartTaxAmount;
  const cartTotalAmount = db.settings.roundTotal ? Math.round(rawTotal) : Math.round(rawTotal * 100) / 100;
  const cartRoundOff = Math.round((cartTotalAmount - rawTotal) * 100) / 100;

  const addToCart = (
    product: Product,
    quantity = 1,
    customization?: {
      variant?: ProductVariant;
      selectedAddons?: Addon[];
      kitchenNote?: string;
    }
  ) => {
    const variant = customization?.variant || (product.variants.length > 0 ? product.variants[0] : undefined);
    const addons = customization?.selectedAddons || [];
    const kitchenNote = customization?.kitchenNote?.trim() || undefined;

    const basePrice = variant ? variant.price : product.price;
    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + addonsTotal;
    const itemTotal = unitPrice * quantity;

    // Check if identical item (same variant, same addons, same note) already in cart
    const existingIndex = cartItems.findIndex((item) => {
      if (item.product.id !== product.id) return false;
      if (item.variant?.name !== variant?.name) return false;
      if (item.kitchenNote !== kitchenNote) return false;
      if (item.addons.length !== addons.length) return false;
      const existingNames = item.addons.map((a) => a.name).sort().join(',');
      const newNames = addons.map((a) => a.name).sort().join(',');
      return existingNames === newNames;
    });

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        itemTotal: updated[existingIndex].unitPrice * newQty,
      };
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        product,
        quantity,
        variant,
        addons,
        kitchenNote,
        unitPrice,
        itemTotal,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCartDiscount(0);
    setSelectedCustomer(null);
  };

  const setCartDiscountHandler = (amount: number, type: 'percent' | 'flat') => {
    setCartDiscount(amount);
    setCartDiscountType(type);
  };

  const holdOrder = (label?: string) => {
    if (cartItems.length === 0) return;
    const newHeld: HeldOrder = {
      id: `held-${Date.now()}`,
      name: label || `${orderType === 'dine_in' ? `Table ${selectedTableId || '?'}` : 'Takeaway'} (${cartItems.length} items)`,
      items: [...cartItems],
      orderType,
      tableId: selectedTableId,
      customer: selectedCustomer,
      timestamp: Date.now(),
    };
    setHeldOrders((prev) => [newHeld, ...prev]);
    clearCart();
  };

  const resumeHeldOrder = (heldId: string) => {
    const held = heldOrders.find((h) => h.id === heldId);
    if (!held) return;
    setCartItems(held.items);
    setOrderType(held.orderType);
    setSelectedTableId(held.tableId);
    setSelectedCustomer(held.customer);
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
  };

  const deleteHeldOrder = (heldId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldId));
  };

  // Operations
  const sendKOT = (): KOT | null => {
    if (cartItems.length === 0) return null;
    const nextKotNo = db.counters.kot;
    const kotId = `kot-${Date.now()}`;

    // Determine station (beverages vs hot kitchen)
    const hasBeverages = cartItems.some((i) => i.product.catId === 'c6');
    const station = hasBeverages && cartItems.every((i) => i.product.catId === 'c6') ? 'bev' : 'hot';

    const newKOT: KOT = {
      id: kotId,
      kotNo: nextKotNo,
      orderId: `ord-${Date.now()}`,
      tableId: selectedTableId,
      tableName: selectedTableId || (orderType === 'takeaway' ? 'Takeaway' : 'Delivery'),
      type: orderType,
      items: [...cartItems],
      status: 'new',
      station,
      createdAt: Date.now(),
    };

    let updatedTables = db.tables;
    if (orderType === 'dine_in' && selectedTableId) {
      updatedTables = db.tables.map((t) =>
        t.id === selectedTableId
          ? {
              ...t,
              status: 'occupied',
              orderId: newKOT.orderId,
              since: t.since || Date.now(),
              captainName: currentUser?.name || 'Floor Captain',
            }
          : t
      );
    }

    const activityText = `${currentUser?.name || 'Staff'} fired KOT #${nextKotNo} for ${newKOT.tableName}`;
    const newActivity = [
      {
        id: `act-${Date.now()}`,
        staffId: currentUser?.id || 'sys',
        staffName: currentUser?.name || 'Staff',
        type: 'kot',
        text: activityText,
        at: Date.now(),
      },
      ...db.activity,
    ].slice(0, 50);

    saveDb({
      ...db,
      kots: [newKOT, ...db.kots],
      tables: updatedTables,
      activity: newActivity,
      counters: { ...db.counters, kot: nextKotNo + 1 },
    });

    return newKOT;
  };

  const settleBill = (payment: PaymentDetails): Order => {
    const nextBillNo = db.counters.bill;
    const orderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      billNo: nextBillNo,
      type: orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : null,
      customerId: selectedCustomer?.id || null,
      customerName: selectedCustomer?.name || 'Walk-in',
      customerPhone: selectedCustomer?.phone || '',
      items: [...cartItems],
      subtotal: cartSubtotal,
      discount: cartDiscountAmount,
      discountType: cartDiscountType,
      tax: cartTaxAmount,
      serviceCharge: 0,
      roundOff: cartRoundOff,
      total: cartTotalAmount,
      payment,
      cashierId: currentUser?.id || 'u1',
      cashierName: currentUser?.name || 'Cashier',
      status: 'settled',
      createdAt: Date.now(),
    };

    // Free table if dine-in
    let updatedTables = db.tables;
    if (orderType === 'dine_in' && selectedTableId) {
      updatedTables = db.tables.map((t) =>
        t.id === selectedTableId
          ? { ...t, status: 'available', orderId: null, since: null, guestCount: undefined }
          : t
      );
    }

    // Update customer loyalty points if applicable
    let updatedCustomers = db.customers;
    if (selectedCustomer && db.loyaltySettings.enabled) {
      const earnedPoints = Math.floor((cartTotalAmount / 100) * db.loyaltySettings.earnRate);
      updatedCustomers = db.customers.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              visits: c.visits + 1,
              spend: c.spend + cartTotalAmount,
              points: c.points + earnedPoints,
              lastVisit: Date.now(),
            }
          : c
      );
    }

    // Deduct ingredient inventory based on recipes
    const updatedInventory = [...db.inventory];
    cartItems.forEach((cartItem) => {
      if (cartItem.product.recipe) {
        cartItem.product.recipe.forEach(([ingId, qty]) => {
          const invItem = updatedInventory.find((i) => i.id === ingId);
          if (invItem) {
            invItem.onHand = Math.max(0, Math.round((invItem.onHand - qty * cartItem.quantity) * 100) / 100);
          }
        });
      }
    });

    const activityText = `${currentUser?.name || 'Cashier'} settled Bill #${nextBillNo} (${orderType}) · ₹${cartTotalAmount}`;
    const newActivity = [
      {
        id: `act-${Date.now()}`,
        staffId: currentUser?.id || 'sys',
        staffName: currentUser?.name || 'Cashier',
        type: 'bill',
        text: activityText,
        at: Date.now(),
      },
      ...db.activity,
    ].slice(0, 50);

    saveDb({
      ...db,
      orders: [newOrder, ...db.orders],
      tables: updatedTables,
      customers: updatedCustomers,
      inventory: updatedInventory,
      activity: newActivity,
      counters: { ...db.counters, bill: nextBillNo + 1, order: nextBillNo + 1 },
    });

    clearCart();
    return newOrder;
  };

  const updateKOTStatus = (kotId: string, status: KOTStatus) => {
    const updated = db.kots.map((k) => {
      if (k.id === kotId) {
        const update: Partial<KOT> = { status };
        if (status === 'preparing') update.preparedAt = Date.now();
        if (status === 'ready') update.readyAt = Date.now();
        if (status === 'served') update.servedAt = Date.now();
        return { ...k, ...update };
      }
      return k;
    });
    saveDb({ ...db, kots: updated });
  };

  const voidOrder = (orderId: string, reason: string) => {
    const updated = db.orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'void' as const,
            voidReason: reason,
            voidAt: Date.now(),
          }
        : o
    );

    const targetOrder = db.orders.find((o) => o.id === orderId);
    const newActivity = [
      {
        id: `act-${Date.now()}`,
        staffId: currentUser?.id || 'sys',
        staffName: currentUser?.name || 'Cashier',
        type: 'void',
        text: `${currentUser?.name || 'Cashier'} voided Bill #${targetOrder?.billNo || orderId}: ${reason}`,
        at: Date.now(),
      },
      ...db.activity,
    ].slice(0, 50);

    saveDb({ ...db, orders: updated, activity: newActivity });
  };

  // Tables
  const freeTable = (tableId: string) => {
    const updated = db.tables.map((t) =>
      t.id === tableId ? { ...t, status: 'available' as const, orderId: null, since: null } : t
    );
    saveDb({ ...db, tables: updated });
  };

  const occupyTable = (tableId: string, guestCount = 2) => {
    const updated = db.tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status: 'occupied' as const,
            since: Date.now(),
            guestCount,
            captainName: currentUser?.name || 'Floor Captain',
          }
        : t
    );
    saveDb({ ...db, tables: updated });
  };

  const acknowledgeCall = (callId: string) => {
    const updated = db.calls.map((c) => (c.id === callId ? { ...c, acknowledged: true } : c));
    saveDb({ ...db, calls: updated });
  };

  const callCaptain = (tableId: string, note = 'Requesting assistance') => {
    const newCall = {
      id: `call-${Date.now()}`,
      tableId,
      tableName: tableId,
      type: 'captain',
      note,
      at: Date.now(),
      acknowledged: false,
    };
    saveDb({ ...db, calls: [newCall, ...db.calls] });
  };

  // Menu
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: `p-${Date.now()}`,
    };
    saveDb({ ...db, products: [newProd, ...db.products] });
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updated = db.products.map((p) => (p.id === id ? { ...p, ...productData } : p));
    saveDb({ ...db, products: updated });
  };

  const toggleProductAvailable = (id: string) => {
    const updated = db.products.map((p) => (p.id === id ? { ...p, available: !p.available } : p));
    saveDb({ ...db, products: updated });
  };

  // Inventory
  const stockIn = (ingredientId: string, quantity: number, unitCost?: number) => {
    const updated = db.inventory.map((item) => {
      if (item.id === ingredientId) {
        return {
          ...item,
          onHand: Math.round((item.onHand + quantity) * 100) / 100,
          unitCost: unitCost || item.unitCost,
        };
      }
      return item;
    });

    const newMove = {
      id: `move-${Date.now()}`,
      ingredientId,
      delta: quantity,
      reason: 'stock_in' as const,
      at: Date.now(),
      ref: `Purchase receipt #${Math.floor(1000 + Math.random() * 9000)}`,
    };

    saveDb({ ...db, inventory: updated, stockMoves: [newMove, ...db.stockMoves] });
  };

  const adjustWaste = (ingredientId: string, quantity: number, reason: string) => {
    const updated = db.inventory.map((item) => {
      if (item.id === ingredientId) {
        return {
          ...item,
          onHand: Math.max(0, Math.round((item.onHand - quantity) * 100) / 100),
        };
      }
      return item;
    });

    const newMove = {
      id: `move-${Date.now()}`,
      ingredientId,
      delta: -quantity,
      reason: 'waste' as const,
      at: Date.now(),
      ref: reason,
    };

    saveDb({ ...db, inventory: updated, stockMoves: [newMove, ...db.stockMoves] });
  };

  // Customers
  const addCustomer = (data: Omit<Customer, 'id' | 'points' | 'visits' | 'spend' | 'since' | 'lastVisit'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      points: 0,
      visits: 0,
      spend: 0,
      since: Date.now(),
      lastVisit: Date.now(),
    };
    saveDb({ ...db, customers: [newCust, ...db.customers] });
    return newCust;
  };

  const updateLoyaltySettings = (settings: Partial<LoyaltySettings>) => {
    saveDb({ ...db, loyaltySettings: { ...db.loyaltySettings, ...settings } });
  };

  // Staff
  const addStaff = (data: Omit<StaffUser, 'id' | 'active'>) => {
    const newStaff: StaffUser = {
      ...data,
      id: `u${db.staff.length + 1}`,
      active: true,
      avatar: data.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    };
    saveDb({ ...db, staff: [...db.staff, newStaff] });
  };

  const updateStaff = (id: string, data: Partial<StaffUser>) => {
    const updated = db.staff.map((s) => (s.id === id ? { ...s, ...data } : s));
    saveDb({ ...db, staff: updated });
  };

  // Settings & Reset
  const updateSettings = (settings: Partial<OutletSettings>) => {
    saveDb({ ...db, settings: { ...db.settings, ...settings } });
  };

  const resetDemoData = () => {
    const fresh = createInitialDatabase();
    saveDb(fresh);
    clearCart();
    setHeldOrders([]);
  };

  const exportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `morrow-bean-pos-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed && parsed.categories && parsed.products && parsed.settings) {
        saveDb(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid backup file', e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        db,
        currentUser,
        login,
        logout,
        cartItems,
        orderType,
        selectedTableId,
        selectedCustomer,
        cartDiscount,
        cartDiscountType,
        heldOrders,
        addToCart,
        updateCartQty,
        removeCartItem,
        clearCart,
        setOrderType,
        setSelectedTableId,
        setSelectedCustomer,
        setCartDiscount: setCartDiscountHandler,
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
        updateKOTStatus,
        voidOrder,
        freeTable,
        occupyTable,
        acknowledgeCall,
        callCaptain,
        addProduct,
        updateProduct,
        toggleProductAvailable,
        stockIn,
        adjustWaste,
        addCustomer,
        updateLoyaltySettings,
        addStaff,
        updateStaff,
        updateSettings,
        resetDemoData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

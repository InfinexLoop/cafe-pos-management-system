export type UserRole = 'admin' | 'billing' | 'captain' | 'kitchen';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  phone: string;
  active: boolean;
  avatar?: string;
  roleDescription?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort: number;
}

export interface ProductVariant {
  name: string;
  price: number;
}

export interface Addon {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  catId: string;
  name: string;
  price: number;
  veg: boolean;
  img: string;
  desc: string;
  variants: ProductVariant[];
  addons: Addon[];
  available: boolean;
  popular?: boolean;
  weight?: number;
  recipe?: [string, number][]; // [ingredientId, quantity]
}

export type TableStatus = 'available' | 'occupied' | 'billing';
export type TableArea = 'Ground Floor' | 'Terrace';

export interface TableItem {
  id: string;
  name: string;
  seats: number;
  area: TableArea;
  status: TableStatus;
  orderId: string | null;
  since: number | null;
  guestCount?: number;
  captainName?: string;
}

export interface CartCustomization {
  variant?: ProductVariant;
  selectedAddons: Addon[];
  kitchenNote?: string;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  addons: Addon[];
  kitchenNote?: string;
  unitPrice: number;
  itemTotal: number;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Split';

export interface PaymentDetails {
  mode: PaymentMode;
  tendered?: number;
  change?: number;
  mix?: { mode: string; amount: number }[];
}

export interface Order {
  id: string;
  billNo: number;
  type: OrderType;
  tableId: string | null;
  customerId: string | null;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType?: 'percent' | 'flat';
  tax: number;
  serviceCharge: number;
  roundOff: number;
  total: number;
  payment: PaymentDetails;
  cashierId: string;
  cashierName: string;
  status: 'settled' | 'void';
  createdAt: number;
  voidReason?: string;
  voidAt?: number;
}

export type KOTStatus = 'new' | 'preparing' | 'ready' | 'served';

export interface KOT {
  id: string;
  kotNo: number;
  orderId: string;
  tableId: string | null;
  tableName?: string;
  type: OrderType;
  items: CartItem[];
  status: KOTStatus;
  station: 'hot' | 'bev';
  createdAt: number;
  preparedAt?: number;
  readyAt?: number;
  servedAt?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  tier: 'Silver' | 'Gold' | 'Platinum';
  points: number;
  visits: number;
  spend: number;
  since: number;
  lastVisit: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  onHand: number;
  reorder: number;
  unitCost: number;
}

export interface StockMove {
  id: string;
  ingredientId: string;
  delta: number;
  reason: 'sale' | 'stock_in' | 'waste' | 'adjust';
  at: number;
  ref?: string;
}

export interface TableCall {
  id: string;
  tableId: string;
  tableName: string;
  type: string;
  note: string;
  at: number;
  acknowledged: boolean;
}

export interface StaffActivity {
  id: string;
  staffId: string;
  staffName: string;
  type: string;
  text: string;
  at: number;
}

export interface OutletSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  gstin: string;
  fssai: string;
  tax: number; // GST %
  serviceCharge: number; // %
  roundTotal: boolean;
  host: string;
  port: string;
  printerBill: string;
  printerKot: string;
  autoKot: boolean;
  theme: 'cream' | 'dark';
}

export interface LoyaltySettings {
  enabled: boolean;
  earnRate: number; // points per 100 Rs
  redeemRate: number; // Rs per point
  minRedeem: number; // minimum points
}

export interface CafeDatabase {
  version: number;
  createdAt: number;
  settings: OutletSettings;
  loyaltySettings: LoyaltySettings;
  categories: Category[];
  products: Product[];
  tables: TableItem[];
  staff: StaffUser[];
  inventory: InventoryItem[];
  customers: Customer[];
  orders: Order[];
  kots: KOT[];
  stockMoves: StockMove[];
  activity: StaffActivity[];
  calls: TableCall[];
  counters: {
    bill: number;
    kot: number;
    order: number;
  };
}

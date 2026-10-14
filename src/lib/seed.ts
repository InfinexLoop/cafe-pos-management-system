import {
  Category,
  Product,
  TableItem,
  StaffUser,
  InventoryItem,
  Customer,
  Order,
  KOT,
  OutletSettings,
  LoyaltySettings,
  CafeDatabase,
  TableCall,
  StaffActivity,
} from '../types';
import { BRAND } from './branding';

export const SEED_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Pizza', icon: '🍕', sort: 1 },
  { id: 'c2', name: 'Pasta', icon: '🍝', sort: 2 },
  { id: 'c3', name: 'Broasted Chicken', icon: '🍗', sort: 3 },
  { id: 'c4', name: 'Burgers', icon: '🍔', sort: 4 },
  { id: 'c5', name: 'Wraps & Sides', icon: '🌯', sort: 5 },
  { id: 'c6', name: 'Beverages', icon: '🥤', sort: 6 },
  { id: 'c7', name: 'Desserts', icon: '🍰', sort: 7 },
];

const PIZZA_VAR = [
  { name: 'Regular', priceDelta: 0 },
  { name: 'Medium', priceDelta: 150 },
  { name: 'Large', priceDelta: 300 },
];
const PORTION_VAR = [
  { name: 'Half', priceDelta: -70 },
  { name: 'Full', priceDelta: 0 },
];
const CUP_VAR = [
  { name: 'Regular', priceDelta: 0 },
  { name: 'Large', priceDelta: 40 },
];

const ADDON_PRICES: Record<string, number> = {
  'Extra Cheese': 49,
  'Extra Toppings': 39,
  Jalapenos: 29,
  'Peri Peri Dust': 19,
  'Extra Sauce': 25,
  'Ice Cream Scoop': 59,
  'Extra Chocolate': 35,
};

function createProduct(
  id: string,
  catId: string,
  name: string,
  price: number,
  veg: boolean,
  img: string,
  opts: {
    desc?: string;
    variants?: { name: string; priceDelta: number }[];
    addons?: string[];
    available?: boolean;
    popular?: boolean;
    weight?: number;
    recipe?: [string, number][];
  } = {}
): Product {
  return {
    id,
    catId,
    name,
    price,
    veg,
    img,
    desc: opts.desc || '',
    variants: (opts.variants || []).map((v) => ({ name: v.name, price: price + v.priceDelta })),
    addons: (opts.addons || []).map((a) => ({ name: a, price: ADDON_PRICES[a] || 25 })),
    available: opts.available !== false,
    popular: !!opts.popular,
    weight: opts.weight || 1,
    recipe: opts.recipe || [],
  };
}

const ADD_PIZZA = ['Extra Cheese', 'Extra Toppings', 'Jalapenos', 'Peri Peri Dust'];
const ADD_SIDES = ['Extra Cheese', 'Extra Sauce', 'Peri Peri Dust'];
const ADD_SWEET = ['Ice Cream Scoop', 'Extra Chocolate'];

export const SEED_PRODUCTS: Product[] = [
  /* --- Pizza --- */
  createProduct('p101', 'c1', 'Margherita Classic', 249, true, '🍕', {
    variants: PIZZA_VAR,
    addons: ADD_PIZZA,
    popular: true,
    weight: 9,
    desc: 'Mozzarella, artisan tomato sauce, fresh basil',
    recipe: [['i1', 1], ['i2', 0.12], ['i4', 0.08]],
  }),
  createProduct('p102', 'c1', 'Farmhouse Veg', 329, true, '🍕', {
    variants: PIZZA_VAR,
    addons: ADD_PIZZA,
    popular: true,
    weight: 8,
    desc: 'Onion, bell pepper, sweet corn, button mushroom',
    recipe: [['i1', 1], ['i2', 0.14], ['i4', 0.08]],
  }),
  createProduct('p103', 'c1', 'Peri Peri Paneer', 349, true, '🍕', {
    variants: PIZZA_VAR,
    addons: ADD_PIZZA,
    weight: 6,
    desc: 'Charred paneer cubes, peri peri dust, red onions',
    recipe: [['i1', 1], ['i2', 0.12], ['i7', 0.1]],
  }),
  createProduct('p104', 'c1', 'Chicken Tikka Pizza', 399, false, '🍕', {
    variants: PIZZA_VAR,
    addons: ADD_PIZZA,
    popular: true,
    weight: 9,
    desc: 'Clay oven roasted chicken, mint drizzle, mozzarella',
    recipe: [['i1', 1], ['i2', 0.14], ['i3', 0.12]],
  }),
  createProduct('p105', 'c1', 'BBQ Chicken Feast', 449, false, '🍕', {
    variants: PIZZA_VAR,
    addons: ADD_PIZZA,
    weight: 6,
    desc: 'Smoked hickory BBQ chicken, roasted peppers, cheese',
    recipe: [['i1', 1], ['i2', 0.18], ['i3', 0.15]],
  }),
  createProduct('p106', 'c1', 'Cheese Burst Corn', 359, true, '🍕', {
    variants: PIZZA_VAR,
    addons: ADD_PIZZA,
    weight: 5,
    desc: 'Molten cheese crust core, golden sweet corn',
    recipe: [['i1', 1], ['i2', 0.22]],
  }),

  /* --- Pasta --- */
  createProduct('p201', 'c2', 'Alfredo White Sauce', 279, true, '🍝', {
    variants: PORTION_VAR,
    addons: ADD_SIDES,
    popular: true,
    weight: 7,
    desc: 'Creamy aged parmesan velouté, garlic herbs',
    recipe: [['i5', 0.15], ['i10', 0.12]],
  }),
  createProduct('p202', 'c2', 'Arrabbiata Red Sauce', 259, true, '🍝', {
    variants: PORTION_VAR,
    addons: ADD_SIDES,
    weight: 5,
    desc: 'San Marzano spicy tomato, crushed bird eye chilli',
    recipe: [['i5', 0.15], ['i4', 0.1]],
  }),
  createProduct('p203', 'c2', 'Pink Sauce Penne', 299, true, '🍝', {
    variants: PORTION_VAR,
    addons: ADD_SIDES,
    weight: 6,
    desc: 'Balanced blend of roasted tomato and creamy alfredo',
    recipe: [['i5', 0.15], ['i10', 0.08], ['i4', 0.06]],
  }),
  createProduct('p204', 'c2', 'Chicken Alfredo', 349, false, '🍝', {
    variants: PORTION_VAR,
    addons: ADD_SIDES,
    popular: true,
    weight: 8,
    desc: 'Pan-seared tender herb chicken in rich white sauce',
    recipe: [['i5', 0.15], ['i3', 0.12], ['i10', 0.12]],
  }),
  createProduct('p205', 'c2', 'Mac & Cheese', 269, true, '🍝', {
    addons: ADD_SIDES,
    weight: 4,
    desc: 'Triple-cheese baked macaroni with panko crust',
    recipe: [['i5', 0.15], ['i2', 0.1], ['i10', 0.08]],
  }),

  /* --- Broasted Chicken --- */
  createProduct('p301', 'c3', 'Broasted Chicken 2 Pc', 219, false, '🍗', {
    addons: ADD_SIDES,
    popular: true,
    weight: 8,
    desc: 'Southern secret 12-spice crispy pressure-fried chicken',
    recipe: [['i3', 0.25], ['i9', 0.05]],
  }),
  createProduct('p302', 'c3', 'Broasted Chicken 4 Pc', 399, false, '🍗', {
    addons: ADD_SIDES,
    popular: true,
    weight: 8,
    desc: '4 juicy pieces, garlic toum dip, pickled cucumbers',
    recipe: [['i3', 0.5], ['i9', 0.08]],
  }),
  createProduct('p303', 'c3', 'Broasted Bucket 8 Pc', 749, false, '🍗', {
    addons: ADD_SIDES,
    weight: 5,
    desc: 'Family feast bucket, 2 dips and large fries',
    recipe: [['i3', 1.0], ['i9', 0.15]],
  }),
  createProduct('p304', 'c3', 'Chicken Wings (6)', 289, false, '🍗', {
    addons: ADD_SIDES,
    weight: 6,
    desc: 'Crispy glazed wings tossed in hot smoked honey buffalo',
    recipe: [['i3', 0.3], ['i9', 0.05]],
  }),
  createProduct('p305', 'c3', 'Fried Chicken Strips', 249, false, '🍗', {
    addons: ADD_SIDES,
    weight: 6,
    desc: 'Boneless tenderloin strips with honey mustard dip',
    recipe: [['i3', 0.25], ['i9', 0.05]],
  }),

  /* --- Burgers --- */
  createProduct('p401', 'c4', 'Classic Veg Burger', 149, true, '🍔', {
    addons: ADD_SIDES,
    weight: 5,
    desc: 'Crisp vegetable patty, lettuce, house mayo, brioche bun',
    recipe: [['i6', 1], ['i15', 0.1]],
  }),
  createProduct('p402', 'c4', 'Crispy Paneer Burger', 189, true, '🍔', {
    addons: ADD_SIDES,
    popular: true,
    weight: 7,
    desc: 'Spiced panko crusted cottage cheese steak, coleslaw',
    recipe: [['i6', 1], ['i7', 0.1]],
  }),
  createProduct('p403', 'c4', 'Chicken Zinger Burger', 219, false, '🍔', {
    addons: ADD_SIDES,
    popular: true,
    weight: 9,
    desc: 'Crunchy battered whole thigh fillet, spicy garlic mayo',
    recipe: [['i6', 1], ['i3', 0.15]],
  }),
  createProduct('p404', 'c4', 'Double Chicken Burger', 289, false, '🍔', {
    addons: ADD_SIDES,
    weight: 5,
    desc: 'Twin fried patties, melted double cheddar slice',
    recipe: [['i6', 1], ['i3', 0.28], ['i2', 0.04]],
  }),
  createProduct('p405', 'c4', 'Mushroom Swiss Burger', 209, true, '🍔', {
    addons: ADD_SIDES,
    weight: 4,
    desc: 'Sautéed portobello mushrooms, caramelized onion, cheese',
    recipe: [['i6', 1], ['i2', 0.04]],
  }),

  /* --- Wraps & Sides --- */
  createProduct('p501', 'c5', 'Peri Peri Fries', 129, true, '🍟', {
    addons: ADD_SIDES,
    popular: true,
    weight: 9,
    desc: 'Golden crisp french fries dusted with tangy spice blend',
    recipe: [['i8', 0.2]],
  }),
  createProduct('p502', 'c5', 'Cheesy Loaded Fries', 179, true, '🍟', {
    addons: ADD_SIDES,
    popular: true,
    weight: 7,
    desc: 'Fries smothered in warm jalapeno cheese sauce and herbs',
    recipe: [['i8', 0.2], ['i2', 0.08]],
  }),
  createProduct('p503', 'c5', 'Chicken Shawarma Wrap', 199, false, '🌯', {
    addons: ADD_SIDES,
    popular: true,
    weight: 8,
    desc: 'Slow roasted pulled chicken, garlic toum, rolled in kuboos',
    recipe: [['i3', 0.15]],
  }),
  createProduct('p504', 'c5', 'Paneer Tikka Wrap', 179, true, '🌯', {
    addons: ADD_SIDES,
    weight: 5,
    desc: 'Tandoori paneer, crunchy capsicum, mint yogurt dressing',
    recipe: [['i7', 0.1]],
  }),
  createProduct('p505', 'c5', 'Garlic Bread', 119, true, '🥖', {
    addons: ADD_PIZZA,
    weight: 6,
    desc: 'Toasted sourdough baguette infused with herb garlic butter',
    recipe: [['i1', 0.5]],
  }),

  /* --- Beverages --- */
  createProduct('p601', 'c6', 'Cold Coffee', 149, true, '🥤', {
    variants: CUP_VAR,
    addons: ADD_SWEET,
    popular: true,
    weight: 9,
    desc: 'Blended espresso, vanilla ice cream, chilled whole milk',
    recipe: [['i11', 0.02], ['i10', 0.2]],
  }),
  createProduct('p602', 'c6', 'Cappuccino', 129, true, '☕', {
    variants: CUP_VAR,
    popular: true,
    weight: 7,
    desc: 'Double shot house espresso, velvety steamed microfoam',
    recipe: [['i11', 0.02], ['i10', 0.15]],
  }),
  createProduct('p603', 'c6', 'Fresh Lime Soda', 89, true, '🥤', {
    variants: [{ name: 'Sweet', priceDelta: 0 }, { name: 'Salted', priceDelta: 0 }, { name: 'Mixed', priceDelta: 0 }],
    weight: 6,
    desc: 'Freshly squeezed Key limes, sparkling soda, mint leaf',
    recipe: [['i12', 0.05]],
  }),
  createProduct('p604', 'c6', 'Oreo Thickshake', 179, true, '🥤', {
    variants: CUP_VAR,
    addons: ADD_SWEET,
    popular: true,
    weight: 9,
    desc: 'Crushed Oreo cookies churned with rich milk and fudge',
    recipe: [['i10', 0.2]],
  }),
  createProduct('p605', 'c6', 'Virgin Mojito', 139, true, '🥤', {
    weight: 6,
    desc: 'Muddled fresh garden mint, lime juice, brown sugar, fizz',
    recipe: [['i12', 0.05]],
  }),
  createProduct('p606', 'c6', 'Masala Chai', 59, true, '☕', {
    weight: 5,
    desc: 'Slow brewed Assam CTC tea infused with cardamom & ginger',
    recipe: [['i10', 0.1]],
  }),

  /* --- Desserts --- */
  createProduct('p701', 'c7', 'Choco Lava Cake', 129, true, '🍰', {
    addons: ADD_SWEET,
    popular: true,
    weight: 7,
    desc: 'Warm Belgian dark chocolate cake with flowing molten core',
    recipe: [],
  }),
  createProduct('p702', 'c7', 'Tiramisu Jar', 179, true, '🍮', {
    popular: true,
    weight: 6,
    desc: 'Espresso soaked ladyfingers layered with mascarpone cream',
    recipe: [['i11', 0.01]],
  }),
  createProduct('p703', 'c7', 'Brownie with Ice Cream', 189, true, '🍨', {
    addons: ADD_SWEET,
    popular: true,
    weight: 8,
    desc: 'Fudgy walnut brownie served sizzling with vanilla scoop',
    recipe: [],
  }),
  createProduct('p704', 'c7', 'Gulab Jamun (2)', 99, true, '🍡', {
    weight: 4,
    desc: 'Traditional fried milk dumplings soaked in rose saffron syrup',
    recipe: [],
  }),
];

export const SEED_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Pizza Dough Ball', unit: 'pc', onHand: 120, reorder: 40, unitCost: 18.0 },
  { id: 'i2', name: 'Mozzarella Cheese', unit: 'kg', onHand: 8.5, reorder: 4.0, unitCost: 420.0 },
  { id: 'i3', name: 'Chicken (cleaned)', unit: 'kg', onHand: 14.0, reorder: 8.0, unitCost: 260.0 },
  { id: 'i4', name: 'Tomato Sauce', unit: 'kg', onHand: 6.2, reorder: 3.0, unitCost: 150.0 },
  { id: 'i5', name: 'Penne Pasta', unit: 'kg', onHand: 9.0, reorder: 4.0, unitCost: 130.0 },
  { id: 'i6', name: 'Burger Bun', unit: 'pc', onHand: 64, reorder: 24, unitCost: 12.0 },
  { id: 'i7', name: 'Paneer (fresh)', unit: 'kg', onHand: 2.8, reorder: 3.0, unitCost: 320.0 }, // low stock
  { id: 'i8', name: 'Potato Fries (frozen)', unit: 'kg', onHand: 3.1, reorder: 5.0, unitCost: 140.0 }, // low stock
  { id: 'i9', name: 'Frying Oil', unit: 'L', onHand: 22.0, reorder: 10.0, unitCost: 135.0 },
  { id: 'i10', name: 'Milk (whole)', unit: 'L', onHand: 18.0, reorder: 6.0, unitCost: 55.0 },
  { id: 'i11', name: 'Coffee Beans (Arabica)', unit: 'kg', onHand: 6.5, reorder: 2.0, unitCost: 950.0 },
  { id: 'i12', name: 'Soft Drink Syrups', unit: 'L', onHand: 8.0, reorder: 3.0, unitCost: 220.0 },
  { id: 'i13', name: 'Takeaway Packaging', unit: 'pc', onHand: 240, reorder: 80, unitCost: 8.5 },
  { id: 'i14', name: 'Spices & Seasonings', unit: 'kg', onHand: 5.4, reorder: 2.0, unitCost: 480.0 },
  { id: 'i15', name: 'Fresh Vegetables', unit: 'kg', onHand: 12.5, reorder: 5.0, unitCost: 65.0 },
];

export const SEED_TABLES: TableItem[] = [
  { id: 'T1', name: 'T1', seats: 2, area: 'Ground Floor', status: 'available', orderId: null, since: null },
  { id: 'T2', name: 'T2', seats: 2, area: 'Ground Floor', status: 'available', orderId: null, since: null },
  { id: 'T3', name: 'T3', seats: 4, area: 'Ground Floor', status: 'occupied', orderId: 'ord-seed-t3', since: Date.now() - 36 * 60000, guestCount: 3, captainName: 'Oliver Bennett' },
  { id: 'T4', name: 'T4', seats: 4, area: 'Ground Floor', status: 'available', orderId: null, since: null },
  { id: 'T5', name: 'T5', seats: 4, area: 'Ground Floor', status: 'available', orderId: null, since: null },
  { id: 'T6', name: 'T6', seats: 6, area: 'Ground Floor', status: 'occupied', orderId: 'ord-seed-t6', since: Date.now() - 14 * 60000, guestCount: 5, captainName: 'Sophia Carter' },
  { id: 'T7', name: 'T7', seats: 2, area: 'Terrace', status: 'available', orderId: null, since: null },
  { id: 'T8', name: 'T8', seats: 4, area: 'Terrace', status: 'available', orderId: null, since: null },
  { id: 'T9', name: 'T9', seats: 4, area: 'Terrace', status: 'occupied', orderId: 'ord-seed-t9', since: Date.now() - 53 * 60000, guestCount: 4, captainName: 'Oliver Bennett' },
  { id: 'T10', name: 'T10', seats: 6, area: 'Terrace', status: 'available', orderId: null, since: null },
  { id: 'T11', name: 'T11', seats: 8, area: 'Terrace', status: 'occupied', orderId: 'ord-seed-t11', since: Date.now() - 9 * 60000, guestCount: 7, captainName: 'Sophia Carter' },
  { id: 'T12', name: 'T12', seats: 2, area: 'Terrace', status: 'available', orderId: null, since: null },
];

export const SEED_STAFF: StaffUser[] = [
  {
    id: 'u1',
    name: 'Adrian Mitchell',
    role: 'admin',
    pin: '1111',
    phone: '98470 11111',
    active: true,
    avatar: 'AM',
    roleDescription: 'Owner / Administrator',
  },
  {
    id: 'u2',
    name: 'Daniel Brooks',
    role: 'billing',
    pin: '2222',
    phone: '98470 22222',
    active: true,
    avatar: 'DB',
    roleDescription: 'Billing Counter',
  },
  {
    id: 'u3',
    name: 'Oliver Bennett',
    role: 'captain',
    pin: '3333',
    phone: '98470 33333',
    active: true,
    avatar: 'OB',
    roleDescription: 'Floor Captain',
  },
  {
    id: 'u4',
    name: 'Sophia Carter',
    role: 'captain',
    pin: '4444',
    phone: '98470 44444',
    active: true,
    avatar: 'SC',
    roleDescription: 'Floor Captain',
  },
  {
    id: 'u5',
    name: 'Ethan Parker',
    role: 'kitchen',
    pin: '5555',
    phone: '98470 55555',
    active: true,
    avatar: 'EP',
    roleDescription: 'Kitchen Staff',
  },
];

export const SEED_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Manu Varghese', phone: '9334749391', tier: 'Gold', points: 368, visits: 11, spend: 7298, since: Date.now() - 60 * 86400000, lastVisit: Date.now() - 3600000 },
  { id: 'cust-2', name: 'Faisal Iyer', phone: '9192415085', tier: 'Platinum', points: 875, visits: 19, spend: 17896, since: Date.now() - 90 * 86400000, lastVisit: Date.now() - 7200000 },
  { id: 'cust-3', name: 'Jasmine Iyer', phone: '9193556265', tier: 'Gold', points: 449, visits: 13, spend: 8759, since: Date.now() - 45 * 86400000, lastVisit: Date.now() - 14400000 },
  { id: 'cust-4', name: 'Rohit Pillai', phone: '9220285224', tier: 'Gold', points: 95, visits: 18, spend: 13881, since: Date.now() - 80 * 86400000, lastVisit: Date.now() - 21600000 },
  { id: 'cust-5', name: 'Karthik Pillai', phone: '9740213305', tier: 'Platinum', points: 1240, visits: 24, spend: 24650, since: Date.now() - 110 * 86400000, lastVisit: Date.now() - 28800000 },
  { id: 'cust-6', name: 'Ananya Sharma', phone: '9845012345', tier: 'Gold', points: 520, visits: 14, spend: 9400, since: Date.now() - 70 * 86400000, lastVisit: Date.now() - 36000000 },
  { id: 'cust-7', name: 'Deepak George', phone: '9447123987', tier: 'Silver', points: 180, visits: 6, spend: 3850, since: Date.now() - 30 * 86400000, lastVisit: Date.now() - 86400000 },
  { id: 'cust-8', name: 'Sneha Kurian', phone: '9895123765', tier: 'Platinum', points: 1100, visits: 21, spend: 21400, since: Date.now() - 120 * 86400000, lastVisit: Date.now() - 86400000 * 2 },
  { id: 'cust-9', name: 'Riyaz Khan', phone: '9746198234', tier: 'Silver', points: 210, visits: 5, spend: 3200, since: Date.now() - 20 * 86400000, lastVisit: Date.now() - 86400000 * 3 },
  { id: 'cust-10', name: 'Meera Nambiar', phone: '9496112233', tier: 'Gold', points: 640, visits: 15, spend: 11200, since: Date.now() - 50 * 86400000, lastVisit: Date.now() - 86400000 * 3 },
];

export const SEED_SETTINGS: OutletSettings = {
  name: BRAND.name,
  tagline: BRAND.tagline,
  address: BRAND.address,
  phone: BRAND.phone,
  gstin: BRAND.gstin,
  fssai: BRAND.fssai,
  tax: 5.0,
  serviceCharge: 0.0,
  roundTotal: true,
  host: '192.168.1.50',
  port: '8080',
  printerBill: 'EPSON TM-T82III (USB/LAN)',
  printerKot: 'TVS RP 3200 Plus (LAN)',
  autoKot: true,
  theme: 'cream',
};

export const SEED_LOYALTY: LoyaltySettings = {
  enabled: true,
  earnRate: 5, // 5 points per Rs 100
  redeemRate: 1.0, // 1 point = Rs 1
  minRedeem: 100,
};

// Generate deterministic historical bills for charts and reports
export function generateSeedOrders(): { orders: Order[]; liveKots: KOT[]; liveOrders: Order[] } {
  const orders: Order[] = [];
  const now = Date.now();
  let billCounter = 1100;

  // Generate 30 days of past settled bills
  for (let day = 30; day >= 1; day--) {
    const dayTimestamp = now - day * 86400000;
    // Number of bills per day varies between 8 and 18
    const numBills = 8 + ((day * 7 + 3) % 11);
    for (let b = 0; b < numBills; b++) {
      billCounter++;
      const hour = 11 + (b % 12);
      const minute = (b * 17) % 60;
      const orderDate = new Date(dayTimestamp);
      orderDate.setHours(hour, minute, 0, 0);

      const type = b % 3 === 0 ? 'takeaway' : b % 4 === 0 ? 'delivery' : 'dine_in';
      const p1 = SEED_PRODUCTS[(b * 3) % SEED_PRODUCTS.length];
      const p2 = SEED_PRODUCTS[(b * 5 + 2) % SEED_PRODUCTS.length];
      const items = [
        {
          cartItemId: `item-${billCounter}-1`,
          product: p1,
          quantity: 1 + (b % 2),
          variant: p1.variants[0],
          addons: [],
          unitPrice: p1.price,
          itemTotal: p1.price * (1 + (b % 2)),
        },
        {
          cartItemId: `item-${billCounter}-2`,
          product: p2,
          quantity: 1,
          variant: p2.variants[0],
          addons: [],
          unitPrice: p2.price,
          itemTotal: p2.price,
        },
      ];
      const subtotal = items.reduce((acc, i) => acc + i.itemTotal, 0);
      const tax = Math.round(subtotal * 0.05 * 100) / 100;
      const totalRaw = subtotal + tax;
      const total = Math.round(totalRaw);
      const roundOff = Math.round((total - totalRaw) * 100) / 100;

      const customer = SEED_CUSTOMERS[b % SEED_CUSTOMERS.length];
      const cashier = SEED_STAFF[b % 2];

      orders.push({
        id: `ord-${billCounter}`,
        billNo: billCounter,
        type,
        tableId: type === 'dine_in' ? `T${(b % 12) + 1}` : null,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items,
        subtotal,
        discount: 0,
        tax,
        serviceCharge: 0,
        roundOff,
        total,
        payment: {
          mode: b % 2 === 0 ? 'UPI' : 'Cash',
          tendered: total,
          change: 0,
        },
        cashierId: cashier.id,
        cashierName: cashier.name,
        status: 'settled',
        createdAt: orderDate.getTime(),
      });
    }
  }

  // Today's completed bills
  const todayMorning = new Date();
  todayMorning.setHours(11, 0, 0, 0);
  const todayBills = [
    { no: 1160, minsAgo: 45, type: 'takeaway' as const, cust: SEED_CUSTOMERS[2], prodIdx: 25, mode: 'UPI' as const },
    { no: 1161, minsAgo: 40, type: 'takeaway' as const, cust: SEED_CUSTOMERS[3], prodIdx: 12, mode: 'Cash' as const },
    { no: 1162, minsAgo: 30, type: 'dine_in' as const, table: 'T1', cust: SEED_CUSTOMERS[1], prodIdx: 0, mode: 'UPI' as const },
    { no: 1163, minsAgo: 25, type: 'takeaway' as const, cust: SEED_CUSTOMERS[0], prodIdx: 6, mode: 'UPI' as const },
    { no: 1164, minsAgo: 20, type: 'takeaway' as const, cust: undefined, prodIdx: 18, mode: 'Cash' as const },
    { no: 1165, minsAgo: 10, type: 'takeaway' as const, cust: undefined, prodIdx: 3, mode: 'Cash' as const },
  ];

  todayBills.forEach((tb) => {
    billCounter++;
    const p1 = SEED_PRODUCTS[tb.prodIdx];
    const p2 = SEED_PRODUCTS[(tb.prodIdx + 5) % SEED_PRODUCTS.length];
    const items = [
      {
        cartItemId: `item-${tb.no}-1`,
        product: p1,
        quantity: 1,
        variant: p1.variants[0],
        addons: [],
        unitPrice: p1.price,
        itemTotal: p1.price,
      },
      {
        cartItemId: `item-${tb.no}-2`,
        product: p2,
        quantity: 2,
        variant: p2.variants[0],
        addons: [],
        unitPrice: p2.price,
        itemTotal: p2.price * 2,
      },
    ];
    const subtotal = items.reduce((acc, i) => acc + i.itemTotal, 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const totalRaw = subtotal + tax;
    const total = Math.round(totalRaw);
    const roundOff = Math.round((total - totalRaw) * 100) / 100;

    orders.push({
      id: `ord-${tb.no}`,
      billNo: tb.no,
      type: tb.type,
      tableId: tb.table || null,
      customerId: tb.cust?.id || null,
      customerName: tb.cust?.name || 'Walk-in',
      customerPhone: tb.cust?.phone || '',
      items,
      subtotal,
      discount: 0,
      tax,
      serviceCharge: 0,
      roundOff,
      total,
      payment: {
        mode: tb.mode,
        tendered: total,
        change: 0,
      },
      cashierId: 'u1',
      cashierName: 'Adrian Mitchell',
      status: 'settled',
      createdAt: now - tb.minsAgo * 60000,
    });
  });

  // Active running tables (T3, T6, T9, T11) and live KOT tickets matching reference
  const liveKots: KOT[] = [
    {
      id: 'kot-1',
      kotNo: 1,
      orderId: 'ord-seed-t3',
      tableId: 'T3',
      tableName: 'T3',
      type: 'dine_in',
      status: 'preparing',
      station: 'hot',
      createdAt: now - 36 * 60000,
      preparedAt: now - 30 * 60000,
      items: [
        {
          cartItemId: 'kot1-1',
          product: SEED_PRODUCTS[0], // Margherita Classic
          quantity: 1,
          variant: { name: 'Large', price: 549 },
          addons: [],
          unitPrice: 549,
          itemTotal: 549,
        },
        {
          cartItemId: 'kot1-2',
          product: SEED_PRODUCTS[20], // Peri Peri Fries
          quantity: 1,
          addons: [],
          unitPrice: 129,
          itemTotal: 129,
        },
        {
          cartItemId: 'kot1-3',
          product: SEED_PRODUCTS[25], // Cold Coffee
          quantity: 2,
          variant: { name: 'Regular', price: 149 },
          addons: [],
          unitPrice: 149,
          itemTotal: 298,
        },
      ],
    },
    {
      id: 'kot-2',
      kotNo: 2,
      orderId: 'ord-seed-t6',
      tableId: 'T6',
      tableName: 'T6',
      type: 'dine_in',
      status: 'new',
      station: 'hot',
      createdAt: now - 14 * 60000,
      items: [
        {
          cartItemId: 'kot2-1',
          product: SEED_PRODUCTS[12], // Broasted Chicken 4 Pc
          quantity: 1,
          addons: [],
          unitPrice: 399,
          itemTotal: 399,
        },
        {
          cartItemId: 'kot2-2',
          product: SEED_PRODUCTS[17], // Chicken Zinger Burger
          quantity: 2,
          addons: [],
          unitPrice: 219,
          itemTotal: 438,
        },
        {
          cartItemId: 'kot2-3',
          product: SEED_PRODUCTS[28], // Oreo Thickshake
          quantity: 2,
          variant: { name: 'Large', price: 219 },
          addons: [],
          unitPrice: 219,
          itemTotal: 438,
        },
      ],
    },
    {
      id: 'kot-3',
      kotNo: 3,
      orderId: 'ord-seed-t9',
      tableId: 'T9',
      tableName: 'T9',
      type: 'dine_in',
      status: 'ready',
      station: 'hot',
      createdAt: now - 53 * 60000,
      readyAt: now - 5 * 60000,
      items: [
        {
          cartItemId: 'kot3-1',
          product: SEED_PRODUCTS[3], // Chicken Tikka Pizza
          quantity: 1,
          variant: { name: 'Medium', price: 549 },
          addons: [],
          unitPrice: 549,
          itemTotal: 549,
        },
        {
          cartItemId: 'kot3-2',
          product: SEED_PRODUCTS[9], // Chicken Alfredo
          quantity: 1,
          variant: { name: 'Full', price: 349 },
          addons: [],
          unitPrice: 349,
          itemTotal: 349,
        },
      ],
    },
    {
      id: 'kot-4',
      kotNo: 4,
      orderId: 'ord-seed-t11',
      tableId: 'T11',
      tableName: 'T11',
      type: 'dine_in',
      status: 'new',
      station: 'hot',
      createdAt: now - 9 * 60000,
      items: [
        {
          cartItemId: 'kot4-1',
          product: SEED_PRODUCTS[13], // Broasted Bucket 8 Pc
          quantity: 1,
          addons: [],
          unitPrice: 749,
          itemTotal: 749,
        },
        {
          cartItemId: 'kot4-2',
          product: SEED_PRODUCTS[21], // Cheesy Loaded Fries
          quantity: 2,
          addons: [],
          unitPrice: 179,
          itemTotal: 358,
        },
        {
          cartItemId: 'kot4-3',
          product: SEED_PRODUCTS[29], // Virgin Mojito
          quantity: 4,
          addons: [],
          unitPrice: 139,
          itemTotal: 556,
        },
      ],
    },
  ];

  const liveOrders: Order[] = [
    {
      id: 'ord-seed-t3',
      billNo: 1166,
      type: 'dine_in',
      tableId: 'T3',
      customerId: SEED_CUSTOMERS[0].id,
      customerName: SEED_CUSTOMERS[0].name,
      customerPhone: SEED_CUSTOMERS[0].phone,
      items: liveKots[0].items,
      subtotal: 976,
      discount: 0,
      tax: 48.8,
      serviceCharge: 0,
      roundOff: 0.2,
      total: 1025,
      payment: { mode: 'Cash' },
      cashierId: 'u3',
      cashierName: 'Oliver Bennett',
      status: 'settled', // running active
      createdAt: now - 36 * 60000,
    },
    {
      id: 'ord-seed-t6',
      billNo: 1167,
      type: 'dine_in',
      tableId: 'T6',
      customerId: null,
      customerName: 'Walk-in',
      customerPhone: '',
      items: liveKots[1].items,
      subtotal: 1275,
      discount: 0,
      tax: 63.75,
      serviceCharge: 0,
      roundOff: 0.25,
      total: 1339,
      payment: { mode: 'Cash' },
      cashierId: 'u4',
      cashierName: 'Sophia Carter',
      status: 'settled',
      createdAt: now - 14 * 60000,
    },
    {
      id: 'ord-seed-t9',
      billNo: 1168,
      type: 'dine_in',
      tableId: 'T9',
      customerId: SEED_CUSTOMERS[1].id,
      customerName: SEED_CUSTOMERS[1].name,
      customerPhone: SEED_CUSTOMERS[1].phone,
      items: liveKots[2].items,
      subtotal: 1276,
      discount: 0,
      tax: 63.8,
      serviceCharge: 0,
      roundOff: 0.2,
      total: 1340,
      payment: { mode: 'Cash' },
      cashierId: 'u3',
      cashierName: 'Oliver Bennett',
      status: 'settled',
      createdAt: now - 53 * 60000,
    },
    {
      id: 'ord-seed-t11',
      billNo: 1169,
      type: 'dine_in',
      tableId: 'T11',
      customerId: null,
      customerName: 'Walk-in',
      customerPhone: '',
      items: liveKots[3].items,
      subtotal: 1663,
      discount: 0,
      tax: 83.15,
      serviceCharge: 0,
      roundOff: -0.15,
      total: 1746,
      payment: { mode: 'Cash' },
      cashierId: 'u4',
      cashierName: 'Sophia Carter',
      status: 'settled',
      createdAt: now - 9 * 60000,
    },
  ];

  return { orders, liveKots, liveOrders };
}

export function createInitialDatabase(): CafeDatabase {
  const { orders, liveKots } = generateSeedOrders();

  const seedCalls: TableCall[] = [
    {
      id: 'call-1',
      tableId: 'T9',
      tableName: 'T9',
      type: 'captain',
      note: 'Need water & extra plates',
      at: Date.now() - 4 * 60000,
      acknowledged: false,
    },
  ];

  const seedActivity: StaffActivity[] = [
    { id: 'act-1', staffId: 'u1', staffName: 'Adrian Mitchell', type: 'login', text: 'Adrian signed in', at: Date.now() - 120 * 60000 },
    { id: 'act-2', staffId: 'u2', staffName: 'Daniel Brooks', type: 'order', text: 'Daniel settled Bill #1163 (Takeaway)', at: Date.now() - 25 * 60000 },
    { id: 'act-3', staffId: 'u3', staffName: 'Oliver Bennett', type: 'kot', text: 'Oliver fired KOT #1 for Table T3', at: Date.now() - 36 * 60000 },
    { id: 'act-4', staffId: 'u4', staffName: 'Sophia Carter', type: 'kot', text: 'Sophia fired KOT #4 for Table T11', at: Date.now() - 9 * 60000 },
  ];

  return {
    version: 1,
    createdAt: Date.now(),
    settings: SEED_SETTINGS,
    loyaltySettings: SEED_LOYALTY,
    categories: SEED_CATEGORIES,
    products: SEED_PRODUCTS,
    tables: SEED_TABLES,
    staff: SEED_STAFF,
    inventory: SEED_INVENTORY,
    customers: SEED_CUSTOMERS,
    orders,
    kots: liveKots,
    stockMoves: [],
    activity: seedActivity,
    calls: seedCalls,
    counters: {
      bill: 1170,
      kot: 5,
      order: 1170,
    },
  };
}

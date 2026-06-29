// Cart store using localStorage with event-based sync between components
export interface CartItem {
  id: string;
  qty: number;
  [key: string]: any; // full product data stored alongside qty
}

const CART_KEY = "autopart_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-update"));
}

export function addToCart(productId: string, qty = 1, productData?: Record<string, any>) {
  const cart = getCart();
  const existing = cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += qty;
    // Update product data if provided
    if (productData) Object.assign(existing, productData, { id: productId, qty: existing.qty });
  } else {
    cart.push({ ...productData, id: productId, qty });
  }
  saveCart(cart);
}

export function removeFromCart(productId: string) {
  saveCart(getCart().filter(c => c.id !== productId));
}

export function updateQty(productId: string, qty: number) {
  if (qty <= 0) return removeFromCart(productId);
  const cart = getCart();
  const item = cart.find(c => c.id === productId);
  if (item) item.qty = qty;
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function cartCount(): number {
  return getCart().reduce((sum, c) => sum + c.qty, 0);
}

export function isInCart(productId: string): boolean {
  return getCart().some(c => c.id === productId);
}

// ─── Selection state tracking (Shopee behavior) ───
const SELECTED_CART_KEY = "autopart_cart_sel";
const VOUCHERS_KEY = "autopart_vouchers_sel";

export function getSelectedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SELECTED_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveSelectedIds(ids: string[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SELECTED_CART_KEY, JSON.stringify(ids));
  }
}

export function getSelectedVouchers(): { freeship: string | null; discount: string | null } {
  if (typeof window === "undefined") return { freeship: null, discount: null };
  try {
    const raw = localStorage.getItem(VOUCHERS_KEY);
    return raw ? JSON.parse(raw) : { freeship: null, discount: null };
  } catch { return { freeship: null, discount: null }; }
}

export function saveSelectedVouchers(vouchers: { freeship: string | null; discount: string | null }) {
  if (typeof window !== "undefined") {
    localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers));
  }
}

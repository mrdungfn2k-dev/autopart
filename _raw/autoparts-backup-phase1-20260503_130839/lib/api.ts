// ─── Client-side API helpers ─────────────────────────────────────────────────
// All fetch calls go through these helpers.
// When you add auth tokens / headers, add them here once — everywhere benefits.

const BASE = "/api";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)             => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown) => request<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown) => request<T>("PUT",    path, body),
  delete: <T>(path: string)             => request<T>("DELETE", path),
};

// ─── Domain helpers ───────────────────────────────────────────────────────────
export const vouchersApi = {
  list:     ()                   => api.get<Voucher[]>("/vouchers"),
  create:   (v: Partial<Voucher>)  => api.post<Voucher>("/vouchers", v),
  update:   (id: string, v: Partial<Voucher>) => api.put<Voucher>(`/vouchers/${id}`, v),
  remove:   (id: string)          => api.delete<{ ok: boolean }>(`/vouchers/${id}`),
  validate: (code: string, order: number) =>
    api.post<{ valid: boolean; voucher?: Voucher; discount?: number }>("/vouchers/validate", { code, order }),
};

export const flashSalesApi = {
  list:   ()                    => api.get<FlashSale[]>("/flash-sales"),
  active: ()                    => api.get<FlashSale[]>("/flash-sales?active=true"),
  create: (fs: Partial<FlashSale>) => api.post<FlashSale>("/flash-sales", fs),
  update: (id: string, fs: Partial<FlashSale>) => api.put<FlashSale>(`/flash-sales/${id}`, fs),
  remove: (id: string)          => api.delete<{ ok: boolean }>(`/flash-sales/${id}`),
};

export const productsApi = {
  list:   (params?: string)     => api.get<Product[]>(`/products${params ? "?" + params : ""}`),
  create: (p: Partial<Product>) => api.post<Product>("/products", p),
  update: (id: string, p: Partial<Product>) => api.put<Product>(`/products/${id}`, p),
  remove: (id: string)          => api.delete<{ ok: boolean }>(`/products/${id}`),
};

export const categoriesApi = {
  list:   ()                      => api.get<Category[]>("/categories"),
  create: (c: Partial<Category>)  => api.post<Category>("/categories", c),
  update: (id: string, c: Partial<Category>) => api.put<Category>(`/categories/${id}`, c),
  remove: (id: string)            => api.delete<{ ok: boolean }>(`/categories/${id}`),
};

export const bannersApi = {
  list:   (onlyActive = false)    => api.get<Banner[]>(`/banners${onlyActive ? "?active=true" : ""}`),
  create: (b: Partial<Banner>)    => api.post<Banner>("/banners", b),
  update: (id: string, b: Partial<Banner>) => api.put<Banner>(`/banners/${id}`, b),
  remove: (id: string)            => api.delete<{ ok: boolean }>(`/banners/${id}`),
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Voucher {
  id: string;
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minOrder: number;
  used: number;
  limit: number;
  expiry: string;
  active: boolean;
}

export interface FlashSaleProduct {
  id: string; name: string; brand: string;
  price: number; originalPrice: number; discount: number;
  rating: number; reviews: number; sold: number; stock: number;
  img: string; oem: boolean;
}

export interface FlashSale {
  id: string;
  name: string;
  discount: number;
  startTime: string;
  endTime: string;
  active: boolean;
  products: FlashSaleProduct[];
}

export interface Product {
  id: string; name: string; nameZh?: string;
  brand: string; category: string; categoryId: string;
  price: number; originalPrice?: number;
  type: "OEM" | "OES" | "Generic";
  oemCode?: string; rating: number; reviews: number;
  stock: number; image: string; description?: string;
  origin?: string; originClass?: string;
  supplierId?: string; active: boolean;
  isTrending?: boolean; isHot?: boolean; isImported?: boolean;
}

export interface Subcategory { id: string; name: string; nameZh?: string; subcategories?: Subcategory[]; }

export interface Category {
  id: string; name: string; nameZh?: string;
  icon: string; desc: string; count: number;
  color: string; img?: string;
  subcategories?: Subcategory[];
}

export interface Banner {
  id: string; title: string; subtitle: string;
  cta: string; href: string; image?: string;
  status: "active" | "scheduled" | "ended";
  startDate: string; endDate: string;
  clicks: number; gradient?: string;
}

// Auth utility — uses localStorage for frontend-only demo
export type UserRole = "customer" | "supplier" | "affiliate" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

const KEY = "autopart_auth";

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export const roleRedirects: Record<UserRole, string> = {
  customer: "/customer",
  supplier: "/supplier",
  affiliate: "/affiliate",
  admin: "/admin",
};

// Which roles can access which prefix
export const routeRoles: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/supplier", roles: ["supplier", "admin"] },
  { prefix: "/affiliate", roles: ["affiliate", "admin"] },
  { prefix: "/customer", roles: ["customer", "affiliate", "admin"] },
  { prefix: "/checkout", roles: ["customer", "affiliate"] },
  { prefix: "/cart", roles: ["customer", "affiliate"] },
];

/** Roles allowed to purchase products */
export const BUYER_ROLES: UserRole[] = ["customer", "affiliate"];


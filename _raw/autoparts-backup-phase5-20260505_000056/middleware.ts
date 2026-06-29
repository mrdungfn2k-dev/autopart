import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth";

const COOKIE_NAME = "ap_token";

// Edge-compatible JWT decode — atob() instead of Node crypto.
// Note: signature is NOT verified here (Edge runtime can't use HMAC).
// Source of truth = API routes / lib/jwt.verifyToken on the Node side.
function decodeJwt(token: string): { id: string; role: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const padding = parts[1].length % 4;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/") + (padding ? "=".repeat(4 - padding) : "");
    const payload = JSON.parse(atob(base64));
    if (typeof payload?.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

const PROTECTED: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin",     roles: ["admin"] },
  { prefix: "/supplier",  roles: ["supplier", "admin"] },
  { prefix: "/affiliate", roles: ["affiliate", "admin"] },
  { prefix: "/customer",  roles: ["customer", "affiliate", "admin"] },
];

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  supplier: "/supplier",
  affiliate: "/affiliate",
  customer: "/customer",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rule = PROTECTED.find(r => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? decodeJwt(token) : null;

  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (!rule.roles.includes(payload.role as UserRole)) {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_HOME[payload.role as UserRole] ?? "/";
    url.searchParams.delete("from");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/supplier/:path*",
    "/affiliate/:path*",
    "/customer/:path*",
  ],
};

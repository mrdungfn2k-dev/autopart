import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth";

const COOKIE_NAME = "ap_token";

// Edge-compatible JWT decode — uses atob() instead of Node.js crypto
// (No signature verification here — that's done in API routes which run in Node.js)
function decodeJwt(token: string): { id: string; role: string; exp: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // atob is available in Edge runtime (Web API)
    const padding = parts[1].length % 4;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/") + (padding ? "=".repeat(4 - padding) : "");
    const payload = JSON.parse(atob(base64));
    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    // exp checked
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

// Route access rules
const PROTECTED: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin",    roles: ["admin"] },
  { prefix: "/supplier", roles: ["supplier", "admin"] },
  { prefix: "/affiliate", roles: ["affiliate", "admin"] },
  { prefix: "/customer", roles: ["customer", "admin"] },
  { prefix: "/mechanic", roles: ["admin"] },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rule = PROTECTED.find(r => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? decodeJwt(token) : null;

  // Not logged in → redirect to login (allow guest checkout)
  if (!payload) {
    // Allow /checkout with ?guest=1 to pass through without auth
    if (pathname === "/checkout" && req.nextUrl.searchParams.get("guest") === "1") {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Wrong role → redirect to own portal
  if (!rule.roles.includes(payload.role as UserRole)) {
    const roleHome: Record<string, string> = {
      admin: "/admin", supplier: "/supplier",
      affiliate: "/affiliate", customer: "/customer",
    };
    const url = req.nextUrl.clone();
    url.pathname = roleHome[payload.role] ?? "/";
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
    "/mechanic/:path*",
  ],
};

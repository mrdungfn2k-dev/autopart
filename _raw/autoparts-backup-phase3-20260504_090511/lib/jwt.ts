import crypto from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/auth";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const COOKIE_NAME = "ap_token";
const EXPIRES_H = 24;

export interface JWTPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

function base64url(data: string): string {
  return Buffer.from(data).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function decodeBase64url(s: string): string {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const full: JWTPayload = { ...payload, iat: now, exp: now + EXPIRES_H * 3600 };
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(full));
  const sig = crypto.createHmac("sha256", SECRET!).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const expected = crypto.createHmac("sha256", SECRET!).update(`${header}.${body}`).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(decodeBase64url(body)) as JWTPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Password hashing — scrypt with per-user salt (no extra packages required)
const SCRYPT_N = 16384;
const SCRYPT_KEYLEN = 64;

export function hashPasswordNew(pw: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, SCRYPT_KEYLEN, { N: SCRYPT_N });
  return `scrypt$${SCRYPT_N}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  try {
    if (stored.startsWith("scrypt$")) {
      const [, n, saltHex, hashHex] = stored.split("$");
      const salt = Buffer.from(saltHex, "hex");
      const hash = crypto.scryptSync(pw, salt, SCRYPT_KEYLEN, { N: parseInt(n, 10) });
      const expected = Buffer.from(hashHex, "hex");
      return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
    }
    // Legacy HMAC-SHA256 hash (backward compat — uses OLD hardcoded secret).
    // Once a user logs in successfully, login route re-hashes their password with scrypt.
    const LEGACY_SECRET = "autopart-hub-secret-2024-change-in-production";
    const legacy = crypto.createHmac("sha256", LEGACY_SECRET + "pw_salt").update(pw).digest("hex");
    const a = Buffer.from(legacy, "hex");
    const b = Buffer.from(stored, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isLegacyHash(stored: string): boolean {
  return !stored.startsWith("scrypt$");
}

// Deprecated: kept only for migration script. Do not use in new code.
export function hashPassword(pw: string): string {
  return hashPasswordNew(pw);
}

export function makeTokenCookie(token: string): string {
  const expires = new Date(Date.now() + EXPIRES_H * 3600_000).toUTCString();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`;
}

export function clearTokenCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// ============ Auth helpers for API routes ============

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

export function requireAuth(req: NextRequest): { user: JWTPayload } | NextResponse {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { user };
}

export function requireRole(req: NextRequest, roles: UserRole[]): { user: JWTPayload } | NextResponse {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!roles.includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return { user };
}

export { COOKIE_NAME };

// Server-side JWT utilities using only Node.js built-ins (no extra packages)
import crypto from "crypto";
import type { UserRole } from "@/lib/auth";

const SECRET = process.env.JWT_SECRET ?? "autopart-hub-secret-2024-change-in-production";
const COOKIE_NAME = "ap_token";
const EXPIRES_H = 24; // 24 hours

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
  const sig = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const [header, body, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(decodeBase64url(body)) as JWTPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(pw: string): string {
  return crypto.createHmac("sha256", SECRET + "pw_salt").update(pw).digest("hex");
}

export function makeTokenCookie(token: string): string {
  const expires = new Date(Date.now() + EXPIRES_H * 3600_000).toUTCString();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`;
}

export function clearTokenCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { COOKIE_NAME };

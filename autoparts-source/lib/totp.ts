import crypto from "crypto";

// TOTP chuẩn RFC 6238 (Google/Microsoft Authenticator) — tự cài bằng Node crypto, KHÔNG thêm thư viện.
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(len = 20): string {
  const buf = crypto.randomBytes(len);
  let bits = "", out = "";
  for (const b of buf) bits += b.toString(2).padStart(8, "0");
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = (s || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const c of clean) bits += B32.indexOf(c).toString(2).padStart(5, "0");
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { buf[i] = c & 0xff; c = Math.floor(c / 256); }
  const hmac = crypto.createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return (bin % 1000000).toString().padStart(6, "0");
}

export function totpCode(secretB32: string, t = Date.now()): string {
  return hotp(base32Decode(secretB32), Math.floor(t / 1000 / 30));
}

/** Cho phép lệch ±1 cửa sổ (±30s) để bù sai lệch đồng hồ. */
export function verifyTotp(secretB32: string, code: string, t = Date.now()): boolean {
  const c = (code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(c) || !secretB32) return false;
  const secret = base32Decode(secretB32);
  const counter = Math.floor(t / 1000 / 30);
  for (let w = -1; w <= 1; w++) if (hotp(secret, counter + w) === c) return true;
  return false;
}

export function otpauthURI(secretB32: string, account: string, issuer = "AutoParts"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

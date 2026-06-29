import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fileStore";
import { requireRole, signToken, makeTokenCookie } from "@/lib/jwt";

interface User {
  id: string; name: string; email: string;
  passwordHash: string; role: string;
  active: boolean;
}

// Admin-only impersonation: issue a JWT for a target user, set cookie,
// then admin is logged in AS that user. Logout returns to /login.
export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  let body: { email?: string; userId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }

  const users = readJson<User[]>("users.json");
  const target = users.find(u =>
    (body.userId && u.id === body.userId) ||
    (body.email && u.email.toLowerCase() === body.email.toLowerCase())
  );
  if (!target) return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
  if (!target.active) return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 400 });
  if (target.id === auth.user.id) return NextResponse.json({ error: "Không thể đăng nhập làm chính mình" }, { status: 400 });

  const token = signToken({
    id: target.id, name: target.name, email: target.email,
    role: target.role as "admin" | "supplier" | "affiliate" | "customer",
  });

  const redirectMap: Record<string, string> = {
    admin: "/admin", supplier: "/supplier",
    affiliate: "/affiliate", customer: "/customer",
  };

  console.log(`[IMPERSONATE] ${auth.user.email} (admin) → ${target.email} (${target.role}) at ${new Date().toISOString()}`);

  const res = NextResponse.json({
    ok: true,
    impersonating: { id: target.id, name: target.name, email: target.email, role: target.role },
    redirect: redirectMap[target.role] ?? "/",
  });
  res.headers.set("Set-Cookie", makeTokenCookie(token));
  return res;
}

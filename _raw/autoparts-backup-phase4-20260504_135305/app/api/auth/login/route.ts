import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyPassword, hashPasswordNew, isLegacyHash, signToken, makeTokenCookie } from "@/lib/jwt";

interface User {
  id: string; name: string; email: string;
  passwordHash: string; role: string;
  phone?: string; supplierId?: string;
  active: boolean; createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password)
      return NextResponse.json({ error: "Vui lòng nhập email và mật khẩu" }, { status: 400 });

    const users = readJson<User[]>("users.json");
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user || !user.active)
      return NextResponse.json({ error: "Email không tồn tại trong hệ thống" }, { status: 401 });

    if (!verifyPassword(password, user.passwordHash))
      return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 });

    // Lazy migration: upgrade legacy HMAC hash to scrypt on successful login
    if (isLegacyHash(user.passwordHash)) {
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx].passwordHash = hashPasswordNew(password);
        writeJson("users.json", users);
      }
    }

    const token = signToken({
      id: user.id, name: user.name, email: user.email,
      role: user.role as "admin" | "supplier" | "affiliate" | "customer",
    });

    const redirectMap: Record<string, string> = {
      admin: "/admin", supplier: "/supplier",
      affiliate: "/affiliate", customer: "/customer",
    };

    const res = NextResponse.json({
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      redirect: redirectMap[user.role] ?? "/",
    });
    res.headers.set("Set-Cookie", makeTokenCookie(token));
    return res;

  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Lỗi server, vui lòng thử lại" }, { status: 500 });
  }
}

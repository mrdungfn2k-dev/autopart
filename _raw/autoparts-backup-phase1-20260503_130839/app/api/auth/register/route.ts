import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { hashPassword, signToken, makeTokenCookie } from "@/lib/jwt";

interface User {
  id: string; name: string; email: string;
  passwordHash: string; role: string;
  phone?: string; supplierId?: string;
  active: boolean; createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password)
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Mật khẩu phải ít nhất 6 ký tự" }, { status: 400 });

    const users = readJson<User[]>("users.json");

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim()))
      return NextResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });

    const newUser: User = {
      id: `u${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role: "customer",
      phone: phone || "",
      active: true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeJson("users.json", users);

    // Auto-login after register
    const token = signToken({
      id: newUser.id, name: newUser.name,
      email: newUser.email, role: "customer",
    });

    const res = NextResponse.json({
      ok: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      redirect: "/customer",
    });
    res.headers.set("Set-Cookie", makeTokenCookie(token));
    return res;

  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Lỗi server, vui lòng thử lại" }, { status: 500 });
  }
}

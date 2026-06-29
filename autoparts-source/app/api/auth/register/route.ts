import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { hashPassword, signToken, makeTokenCookie } from "@/lib/jwt";
import { isPassword } from "@/lib/validators";

interface User {
  id: string; name: string; email: string;
  passwordHash: string; role: string;
  phone?: string; supplierId?: string;
  active: boolean; status?: "active" | "pending" | "suspended"; createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role: rawRole } = body;

    if (!name || !email || !password)
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });

    if (!isPassword(password))
      return NextResponse.json({ error: "Mật khẩu cần ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt" }, { status: 400 });

    const users = readJson<User[]>("users.json");

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim()))
      return NextResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });

    // NCC / đại lý cần admin DUYỆT mới đăng nhập được; khách hàng kích hoạt ngay
    const role = ["supplier", "affiliate"].includes(rawRole) ? rawRole : "customer";
    const needsApproval = role === "supplier" || role === "affiliate";

    const newUser: User = {
      id: `u${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role,
      phone: phone || "",
      active: !needsApproval,
      status: needsApproval ? "pending" : "active",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeJson("users.json", users);

    // NCC/đại lý: KHÔNG auto-login — trả về trạng thái chờ duyệt
    if (needsApproval) {
      return NextResponse.json({
        ok: true,
        pending: true,
        message: "Đăng ký thành công! Tài khoản " + (role === "supplier" ? "nhà cung cấp" : "đại lý") + " của bạn đang chờ quản trị viên phê duyệt. Bạn sẽ đăng nhập được sau khi được duyệt.",
      });
    }

    // Khách hàng: auto-login
    const token = signToken({
      id: newUser.id, name: newUser.name,
      email: newUser.email, role: newUser.role as "admin" | "supplier" | "affiliate" | "customer",
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

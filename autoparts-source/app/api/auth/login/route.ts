import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyPassword, hashPasswordNew, isLegacyHash, signToken, makeTokenCookie } from "@/lib/jwt";
import { verifyTotp } from "@/lib/totp";

interface User {
  id: string; name: string; email: string;
  passwordHash: string; role: string;
  phone?: string; supplierId?: string;
  active: boolean; status?: "active" | "pending" | "suspended"; createdAt: string;
  twoFA?: boolean; twoFASecret?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password)
      return NextResponse.json({ error: "Vui lòng nhập email và mật khẩu" }, { status: 400 });

    const users = readJson<User[]>("users.json");
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user)
      return NextResponse.json({ error: "Email không tồn tại trong hệ thống" }, { status: 401 });

    if (!verifyPassword(password, user.passwordHash))
      return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 });

    // Trạng thái tài khoản: chờ duyệt / bị khóa → không cho đăng nhập (kèm thông báo rõ)
    const status = user.status || (user.active === false ? "suspended" : "active");
    if (status === "pending")
      return NextResponse.json({ error: "Tài khoản của bạn đang chờ quản trị viên phê duyệt. Vui lòng quay lại sau khi được duyệt.", code: "pending" }, { status: 403 });
    if (status === "suspended" || user.active === false)
      return NextResponse.json({ error: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.", code: "locked" }, { status: 403 });

    // NCC bị admin DUYỆT tạm ngưng (suppliers.json: status="suspended") → chặn đăng nhập kèm popup.
    // CHỈ chặn khi "suspended" (tạm ngưng), KHÔNG chặn khi chỉ active=false (ẩn khỏi gian hàng).
    if (user.role === "supplier" && user.supplierId) {
      const suppliers = readJson<Array<{ id: string; status?: string }>>("suppliers.json");
      const sup = suppliers.find(s => String(s.id) === String(user.supplierId));
      if (sup && sup.status === "suspended")
        return NextResponse.json({ error: "Cửa hàng của bạn đã bị tạm ngưng theo yêu cầu. Vui lòng liên hệ quản trị viên để được hỗ trợ.", code: "locked" }, { status: 403 });
    }

    // Xác thực 2 yếu tố (2FA/TOTP): nếu tài khoản đã bật → yêu cầu mã 6 số từ app Authenticator
    if (user.twoFA && user.twoFASecret) {
      const code = (body.code || "").toString().trim();
      if (!code) {
        // mật khẩu đúng nhưng cần thêm mã — báo client hiện bước nhập mã
        return NextResponse.json({ requires2FA: true, email: user.email }, { status: 200 });
      }
      if (!verifyTotp(user.twoFASecret, code)) {
        return NextResponse.json({ error: "Mã xác thực 2FA không đúng. Vui lòng kiểm tra app Authenticator và thử lại.", requires2FA: true }, { status: 401 });
      }
    }

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
      affiliate: "/affiliate", customer: "/",
    };

    const res = NextResponse.json({
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, supplierId: (user as any).supplierId },
      redirect: redirectMap[user.role] ?? "/",
    });
    res.headers.set("Set-Cookie", makeTokenCookie(token));
    return res;

  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Lỗi server, vui lòng thử lại" }, { status: 500 });
  }
}

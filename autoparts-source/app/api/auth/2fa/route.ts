import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import { generateSecret, otpauthURI, verifyTotp } from "@/lib/totp";

function me(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

// Đọc trạng thái 2FA của tài khoản đang đăng nhập.
export async function GET(req: NextRequest) {
  const user = me(req);
  if (!user) return NextResponse.json({ twoFA: false });
  const users = readJson<any[]>("users.json") || [];
  const u = users.find(x => x.id === user.id || x.email === user.email);
  return NextResponse.json({ twoFA: !!u?.twoFA });
}

// Luồng TOTP: action=setup (tạo mã bí mật) → action=confirm (xác nhận bằng mã 6 số) → bật.
// action=disable để tắt.
export async function POST(req: NextRequest) {
  const user = me(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = body.action;

  const users = readJson<any[]>("users.json") || [];
  const idx = users.findIndex(x => x.id === user.id || x.email === user.email);
  if (idx < 0) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

  if (action === "setup") {
    const secret = generateSecret();
    users[idx].pending2FASecret = secret;
    writeJson("users.json", users);
    return NextResponse.json({ secret, otpauth: otpauthURI(secret, user.email) });
  }

  if (action === "confirm") {
    const pending = users[idx].pending2FASecret;
    if (!pending) return NextResponse.json({ error: "Chưa khởi tạo. Hãy bật lại 2FA." }, { status: 400 });
    if (!verifyTotp(pending, (body.code || "").toString())) {
      return NextResponse.json({ error: "Mã không đúng. Kiểm tra app Authenticator (mã đổi mỗi 30s)." }, { status: 400 });
    }
    users[idx].twoFA = true;
    users[idx].twoFASecret = pending;
    delete users[idx].pending2FASecret;
    writeJson("users.json", users);
    return NextResponse.json({ twoFA: true });
  }

  if (action === "disable") {
    users[idx].twoFA = false;
    delete users[idx].twoFASecret;
    delete users[idx].pending2FASecret;
    writeJson("users.json", users);
    return NextResponse.json({ twoFA: false });
  }

  return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
}

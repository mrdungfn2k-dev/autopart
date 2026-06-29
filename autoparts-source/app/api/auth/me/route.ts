import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import { readJson } from "@/lib/fileStore";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null, active: false });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ user: null, active: false });

  // Trạng thái THẬT trong users.json — để đá phiên đang đăng nhập nếu tài khoản bị khóa
  const users = readJson<Array<{ id: string; active?: boolean; status?: string; supplierId?: string }>>("users.json");
  const u = users.find(x => x.id === payload.id);
  let status = u ? (u.status || (u.active === false ? "suspended" : "active")) : "active";

  // NCC bị admin DUYỆT tạm ngưng (suppliers.json: status="suspended") → đá phiên đang đăng nhập.
  if (status === "active" && payload.role === "supplier" && u?.supplierId) {
    const suppliers = readJson<Array<{ id: string; status?: string }>>("suppliers.json");
    const sup = suppliers.find(s => String(s.id) === String(u.supplierId));
    if (sup && sup.status === "suspended") status = "suspended";
  }

  return NextResponse.json({
    user: { id: payload.id, name: payload.name, email: payload.email, role: payload.role, supplierId: u?.supplierId },
    active: status === "active",
    status,
  }, { headers: { "Cache-Control": "no-store" } });
}

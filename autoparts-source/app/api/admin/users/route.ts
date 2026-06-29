import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

interface RawUser {
  id: string; name: string; email: string;
  role: string; phone?: string;
  active?: boolean; status?: "active" | "pending" | "suspended"; createdAt?: string;
  sales?: number;
}

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}

// GET /api/admin/users — danh sách tài khoản THẬT từ users.json (đã bỏ passwordHash).
// Dùng cho trang Quản lý người dùng để tài khoản mới đăng ký hiển thị ngay.
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const raw = readJson<RawUser[]>("users.json");
  const users = (Array.isArray(raw) ? raw : []).map(u => ({
    id: u.id,
    name: u.name || "—",
    email: u.email || "",
    phone: (u.phone || "").toString(),
    role: u.role || "customer",
    status: u.status || (u.active === false ? "suspended" : "active"),
    joined: fmtDate(u.createdAt),
    sales: u.sales ?? 0,
  }));

  return NextResponse.json(users, { headers: { "Cache-Control": "no-store" } });
}

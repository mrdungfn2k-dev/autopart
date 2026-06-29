import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

interface RawUser {
  id: string; role?: string; active?: boolean;
  status?: "active" | "pending" | "suspended";
  passwordHash?: string; [k: string]: unknown;
}

// PUT — cập nhật vai trò / trạng thái tài khoản (admin only). Bảo vệ tài khoản admin.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await Promise.resolve(params);
  const body = await req.json();
  const users = readJson<RawUser[]>("users.json");
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

  // KHÔNG cho khóa hoặc đổi vai trò tài khoản admin
  if (users[idx].role === "admin" && (body.status === "suspended" || (body.role && body.role !== "admin")))
    return NextResponse.json({ error: "Không thể khóa hoặc đổi vai trò tài khoản admin" }, { status: 403 });

  if (typeof body.role === "string" && body.role.trim()) users[idx].role = body.role;
  if (typeof body.status === "string" && ["active", "pending", "suspended"].includes(body.status)) {
    users[idx].status = body.status as RawUser["status"];
    users[idx].active = body.status === "active";
  }
  writeJson("users.json", users);
  const safe = { ...users[idx] }; delete safe.passwordHash;
  return NextResponse.json({ ok: true, user: safe });
}

// DELETE — xóa tài khoản (admin only). Không cho xóa admin.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await Promise.resolve(params);
  const users = readJson<RawUser[]>("users.json");
  const target = users.find(u => u.id === id);
  if (!target) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
  if (target.role === "admin") return NextResponse.json({ error: "Không thể xóa tài khoản admin" }, { status: 403 });

  writeJson("users.json", users.filter(u => u.id !== id));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import type { SuspensionRequest } from "../route";

const FILE = "suspension-requests.json";

// Admin tiếp nhận: chấp nhận (ACCEPTED) hoặc từ chối (REJECTED) yêu cầu tạm ngưng
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: any; try { body = await req.json(); } catch { body = {}; }
  const data = readJson<SuspensionRequest[]>(FILE);
  const idx = Array.isArray(data) ? data.findIndex(r => r.id === id) : -1;
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const status: SuspensionRequest["status"] =
    body.status === "ACCEPTED" || body.status === "REJECTED" ? body.status : data[idx].status;
  data[idx] = { ...data[idx], status, updatedAt: new Date().toISOString() };
  writeJson(FILE, data);

  // Cập nhật trạng thái NCC theo quyết định (best-effort, nếu map được supplierId):
  //  ACCEPTED => tạm ngưng (chặn đăng nhập)   REJECTED/từ chối/mở lại => mở hoạt động trở lại
  if (data[idx].supplierId) {
    try {
      const sup = readJson<any[]>("suppliers.json");
      if (Array.isArray(sup)) {
        const si = sup.findIndex(s => String(s.id) === String(data[idx].supplierId));
        if (si !== -1) {
          if (status === "ACCEPTED") sup[si] = { ...sup[si], active: false, status: "suspended" };
          else if (status === "REJECTED") sup[si] = { ...sup[si], active: true, status: "active" };
          writeJson("suppliers.json", sup);
        }
      }
    } catch {}
  }
  return NextResponse.json(data[idx]);
}

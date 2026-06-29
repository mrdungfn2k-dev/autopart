import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

export type SuspendStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface SuspensionRequest {
  id: string;
  supplierId?: string;
  shopName: string;
  submittedBy: string;
  reason: string;
  status: SuspendStatus;
  createdAt: string;
  updatedAt: string;
}

const FILE = "suspension-requests.json";

// Admin xem danh sách yêu cầu tạm ngưng từ NCC
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = readJson<SuspensionRequest[]>(FILE);
  return NextResponse.json(Array.isArray(data) ? data : []);
}

// NCC gửi yêu cầu tạm ngưng cửa hàng (lưu THẬT để admin tiếp nhận)
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user || (user.role !== "supplier" && user.role !== "admin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: any; try { body = await req.json(); } catch { body = {}; }
  const shopName = typeof body?.shopName === "string" ? body.shopName.trim().slice(0, 120) : "";
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) : "";
  const supplierId = typeof body?.supplierId === "string" ? body.supplierId : undefined;

  const data = readJson<SuspensionRequest[]>(FILE);
  const arr = Array.isArray(data) ? data : [];
  // Tránh trùng: đã có yêu cầu PENDING của NCC này thì trả lại cái cũ (không tạo thêm)
  const dup = arr.find(r => r.status === "PENDING" && (
    (supplierId && r.supplierId === supplierId) || r.submittedBy === user.name
  ));
  if (dup) return NextResponse.json(dup, { status: 200 });

  const now = new Date().toISOString();
  const item: SuspensionRequest = {
    id: nextId("SR"),
    supplierId,
    shopName: shopName || user.name || "Cửa hàng",
    submittedBy: user.name || "",
    reason: reason || "Yêu cầu tạm ngưng hoạt động cửa hàng",
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  };
  arr.push(item);
  writeJson(FILE, arr);
  return NextResponse.json(item, { status: 201 });
}

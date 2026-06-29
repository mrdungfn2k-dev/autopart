import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";
import { enrichSupplier } from "@/lib/supplierStats";

const FILE = "suppliers.json";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const data = readJson<any[]>(FILE);
  const supplier = data.find(s => s.id === resolvedParams.id);
  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(enrichSupplier(supplier));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const resolvedParams = await Promise.resolve(params);
  const body = await req.json();
  const data = readJson<any[]>(FILE);
  const idx = data.findIndex(s => s.id === resolvedParams.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body };
  // Admin bật "Hiển thị" lại ⇒ gỡ trạng thái tạm ngưng để NCC đăng nhập lại được (đường khôi phục độc lập với yêu cầu)
  if (body.active === true && data[idx].status === "suspended") data[idx].status = "active";
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

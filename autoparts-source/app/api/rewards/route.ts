import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson, nextId } from "@/lib/fileStore";

const FILE = "rewards.json";

export interface Reward {
  id: string;
  name: string;
  nameZh?: string;
  pointsCost: number;
  voucherType: "percent" | "fixed" | "shipping";
  voucherValue: number; // % nếu percent, VNĐ nếu fixed, 0 nếu shipping
  minOrder: number;
  active: boolean;
}

// Danh mục quà mặc định (admin có thể sửa). Khớp với 4 thẻ đang hiển thị.
const DEFAULTS: Reward[] = [
  { id: "r1", name: "Giảm 50,000đ", nameZh: "减 50,000đ", pointsCost: 500, voucherType: "fixed", voucherValue: 50000, minOrder: 300000, active: true },
  { id: "r2", name: "Giảm 100,000đ", nameZh: "减 100,000đ", pointsCost: 900, voucherType: "fixed", voucherValue: 100000, minOrder: 500000, active: true },
  { id: "r3", name: "Miễn phí vận chuyển", nameZh: "免运费", pointsCost: 300, voucherType: "shipping", voucherValue: 0, minOrder: 0, active: true },
  { id: "r4", name: "Giảm 200,000đ", nameZh: "减 200,000đ", pointsCost: 1800, voucherType: "fixed", voucherValue: 200000, minOrder: 1000000, active: true },
];

export function readRewards(): Reward[] {
  const data = readJson<Reward[]>(FILE, []);
  if (!Array.isArray(data) || data.length === 0) { writeJson(FILE, DEFAULTS); return DEFAULTS; }
  return data;
}

export async function GET() {
  return NextResponse.json(readRewards());
}

export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;
  let body: any; try { body = await req.json(); } catch { body = {}; }
  if (!body?.name || !(Number(body?.pointsCost) > 0)) return NextResponse.json({ error: "Thiếu tên hoặc điểm" }, { status: 400 });
  const item: Reward = {
    id: nextId("r"),
    name: String(body.name).slice(0, 60),
    nameZh: body.nameZh ? String(body.nameZh).slice(0, 60) : undefined,
    pointsCost: Math.max(1, Math.floor(Number(body.pointsCost))),
    voucherType: ["percent", "fixed", "shipping"].includes(body.voucherType) ? body.voucherType : "fixed",
    voucherValue: Math.max(0, Math.floor(Number(body.voucherValue) || 0)),
    minOrder: Math.max(0, Math.floor(Number(body.minOrder) || 0)),
    active: body.active !== false,
  };
  const data = readRewards(); data.push(item); writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;
  let body: any; try { body = await req.json(); } catch { body = {}; }
  const data = readRewards();
  const idx = data.findIndex(r => r.id === body?.id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  const cur = data[idx];
  data[idx] = {
    ...cur,
    name: body.name != null ? String(body.name).slice(0, 60) : cur.name,
    nameZh: body.nameZh != null ? String(body.nameZh).slice(0, 60) : cur.nameZh,
    pointsCost: body.pointsCost != null ? Math.max(1, Math.floor(Number(body.pointsCost))) : cur.pointsCost,
    voucherType: ["percent", "fixed", "shipping"].includes(body.voucherType) ? body.voucherType : cur.voucherType,
    voucherValue: body.voucherValue != null ? Math.max(0, Math.floor(Number(body.voucherValue) || 0)) : cur.voucherValue,
    minOrder: body.minOrder != null ? Math.max(0, Math.floor(Number(body.minOrder) || 0)) : cur.minOrder,
    active: typeof body.active === "boolean" ? body.active : cur.active,
  };
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  writeJson(FILE, readRewards().filter(r => r.id !== id));
  return NextResponse.json({ ok: true });
}

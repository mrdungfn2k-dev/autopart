import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  active: boolean;
  isDefault?: boolean;
}

const SEED: Warehouse[] = [
  { id: "w1", name: "Kho Hà Nội (chính)", code: "HN", address: "Tòa nhà AutoParts, Ngõ 15 Duy Tân, Cầu Giấy", city: "Hà Nội", active: true, isDefault: true },
  { id: "w2", name: "Kho TP. Hồ Chí Minh", code: "HCM", address: "Quận 1, TP.HCM", city: "TP. Hồ Chí Minh", active: true },
  { id: "w3", name: "Kho Đà Nẵng", code: "DN", city: "Đà Nẵng", active: false },
];

function ensureSeeded(): Warehouse[] {
  let data = readJson<Warehouse[]>("warehouses.json");
  if (data.length === 0) { writeJson("warehouses.json", SEED); return SEED; }
  return data;
}

export async function GET() { return NextResponse.json(ensureSeeded()); }

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const data = ensureSeeded();
  const item: Warehouse = {
    id: nextId("w"),
    name: body.name ?? "",
    code: (body.code ?? "").toUpperCase(),
    address: body.address ?? "",
    city: body.city ?? "",
    active: body.active !== false,
    isDefault: body.isDefault === true,
  };
  if (item.isDefault) data.forEach(w => { w.isDefault = false; });
  data.push(item);
  writeJson("warehouses.json", data);
  return NextResponse.json(item, { status: 201 });
}

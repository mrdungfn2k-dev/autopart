import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

interface Carrier {
  id: string;
  name: string;
  code: string;
  active: boolean;
  baseFee: number;
  perKgFee?: number;
  freeshipThreshold?: number;
  estimatedDays?: string;
  zones?: string[];
}

const SEED: Carrier[] = [
  { id: "c1", name: "Giao Hàng Tiết Kiệm", code: "ghtk", active: true, baseFee: 35000, perKgFee: 5000, freeshipThreshold: 500000, estimatedDays: "3–5 ngày", zones: ["Toàn quốc"] },
  { id: "c2", name: "Giao Hàng Nhanh", code: "ghn", active: true, baseFee: 25000, perKgFee: 7000, freeshipThreshold: 800000, estimatedDays: "2–3 ngày", zones: ["Toàn quốc"] },
  { id: "c3", name: "Viettel Post", code: "vtp", active: true, baseFee: 30000, perKgFee: 6000, estimatedDays: "3–4 ngày", zones: ["Toàn quốc"] },
  { id: "c4", name: "J&T Express", code: "jt", active: false, baseFee: 28000, perKgFee: 5500, estimatedDays: "2–4 ngày" },
  { id: "c5", name: "BEST Express", code: "best", active: false, baseFee: 30000, perKgFee: 6000, estimatedDays: "3–5 ngày" },
];

function ensureSeeded(): Carrier[] {
  let data = readJson<Carrier[]>("carriers.json");
  if (data.length === 0) { writeJson("carriers.json", SEED); return SEED; }
  return data;
}

export async function GET() { return NextResponse.json(ensureSeeded()); }

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const data = ensureSeeded();
  const item: Carrier = {
    id: nextId("c"),
    name: body.name ?? "",
    code: (body.code ?? "").toLowerCase(),
    active: body.active !== false,
    baseFee: Number(body.baseFee) || 0,
    perKgFee: Number(body.perKgFee) || undefined,
    freeshipThreshold: Number(body.freeshipThreshold) || undefined,
    estimatedDays: body.estimatedDays ?? "",
    zones: Array.isArray(body.zones) ? body.zones : [],
  };
  data.push(item);
  writeJson("carriers.json", data);
  return NextResponse.json(item, { status: 201 });
}

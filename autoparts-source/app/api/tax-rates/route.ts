import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  categoryIds?: string[];
  isDefault?: boolean;
}

const SEED: TaxRate[] = [
  { id: "tr1", name: "VAT 10% (chuẩn)", rate: 10, isDefault: true },
  { id: "tr2", name: "VAT 8% (giảm)", rate: 8 },
  { id: "tr3", name: "VAT 0% (xuất khẩu)", rate: 0 },
];

function ensureSeeded(): TaxRate[] {
  let data = readJson<TaxRate[]>("tax-rates.json");
  if (data.length === 0) { writeJson("tax-rates.json", SEED); return SEED; }
  return data;
}

export async function GET() { return NextResponse.json(ensureSeeded()); }

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const data = ensureSeeded();
  const item: TaxRate = {
    id: nextId("tr"),
    name: body.name ?? "",
    rate: Number(body.rate) || 0,
    categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : [],
    isDefault: body.isDefault === true,
  };
  if (item.isDefault) {
    data.forEach(t => { t.isDefault = false; });
  }
  data.push(item);
  writeJson("tax-rates.json", data);
  return NextResponse.json(item, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

const FILE = "attribute-sets.json";

interface Attribute {
  id: string;
  name: string;
  type: "text" | "number" | "select";
  options?: string[];
  unit?: string;
}

interface AttributeSet {
  id: string;
  name: string;
  categoryId?: string;
  attributes: Attribute[];
  createdAt: string;
}

const SEED: AttributeSet[] = [
  {
    id: "as001",
    name: "Bugi đánh lửa",
    categoryId: "ignition",
    attributes: [
      { id: "a1", name: "Khoảng cách điện cực", type: "number", unit: "mm" },
      { id: "a2", name: "Loại điện cực", type: "select", options: ["Đồng", "Bạch kim", "Iridium"] },
      { id: "a3", name: "Mã ren", type: "text" },
    ],
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "as002",
    name: "Má phanh",
    categoryId: "brakes",
    attributes: [
      { id: "a1", name: "Vật liệu", type: "select", options: ["Ceramic", "Semi-metallic", "Organic"] },
      { id: "a2", name: "Độ dày", type: "number", unit: "mm" },
      { id: "a3", name: "Vị trí", type: "select", options: ["Trước", "Sau"] },
    ],
    createdAt: "2024-01-01T00:00:00Z",
  },
];

function ensureSeeded(): AttributeSet[] {
  let data = readJson<AttributeSet[]>(FILE);
  if (data.length === 0) {
    writeJson(FILE, SEED);
    return SEED;
  }
  return data;
}

export async function GET() {
  return NextResponse.json(ensureSeeded());
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const data = ensureSeeded();
  const item: AttributeSet = {
    id: nextId("as"),
    name: body.name ?? "",
    categoryId: body.categoryId ?? undefined,
    attributes: Array.isArray(body.attributes) ? body.attributes.map((a: any, i: number) => ({
      id: a.id || `a${i + 1}`,
      name: a.name ?? "",
      type: ["text", "number", "select"].includes(a.type) ? a.type : "text",
      options: Array.isArray(a.options) ? a.options : undefined,
      unit: a.unit ?? undefined,
    })) : [],
    createdAt: new Date().toISOString(),
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

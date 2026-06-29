import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import type { Category } from "@/lib/api";
import { categories as seedCats } from "@/lib/data";

const FILE = "categories.json";

function ensureSeeded(): Category[] {
  let data = readJson<Category[]>(FILE);
  if (data.length === 0) {
    data = seedCats as unknown as Category[];
    writeJson(FILE, data);
  }
  return data;
}

export async function GET() {
  return NextResponse.json(ensureSeeded());
}

export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const data = ensureSeeded();
  const item: Category = {
    id: body.id ?? nextId("cat"),
    name: body.name ?? "",
    nameZh: body.nameZh,
    icon: body.icon ?? "NEW",
    desc: body.desc ?? "",
    count: 0,
    color: body.color ?? "#8f9294",
    img: body.img,
    subcategories: body.subcategories ?? [],
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import type { FlashSale } from "@/lib/api";

const FILE = "flash-sales.json";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = readJson<FlashSale[]>(FILE);
  const idx = data.findIndex(fs => fs.id === id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id };
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = readJson<FlashSale[]>(FILE).filter(fs => fs.id !== id);
  writeJson(FILE, data);
  return NextResponse.json({ ok: true });
}

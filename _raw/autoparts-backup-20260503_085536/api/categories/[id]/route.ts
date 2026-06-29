import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import type { Category } from "@/lib/api";

const FILE = "categories.json";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = readJson<Category[]>(FILE);
  const idx = data.findIndex(c => c.id === id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id };
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = readJson<Category[]>(FILE).filter(c => c.id !== id);
  writeJson(FILE, data);
  return NextResponse.json({ ok: true });
}

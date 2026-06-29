import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";
import type { Banner } from "@/lib/api";

const FILE = "banners.json";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const { id } = await params;
  const body = await req.json();
  const data = readJson<Banner[]>(FILE);
  const idx = data.findIndex(b => b.id === id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id };
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const { id } = await params;
  const data = readJson<Banner[]>(FILE).filter(b => b.id !== id);
  writeJson(FILE, data);
  return NextResponse.json({ ok: true });
}

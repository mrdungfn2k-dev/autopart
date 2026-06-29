import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const body = await req.json();
  const data = readJson<any[]>("carriers.json");
  const idx = data.findIndex(x => x.id === id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body, id };
  writeJson("carriers.json", data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const data = readJson<any[]>("carriers.json").filter(x => x.id !== id);
  writeJson("carriers.json", data);
  return NextResponse.json({ ok: true });
}

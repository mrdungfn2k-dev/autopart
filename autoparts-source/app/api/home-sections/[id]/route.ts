import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

const FILE = "home-sections.json";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  let data = readJson<any[]>(FILE);
  const index = data.findIndex(i => i.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  data[index] = { ...data[index], ...body };
  writeJson(FILE, data);
  return NextResponse.json(data[index]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  let data = readJson<any[]>(FILE);
  data = data.filter(i => i.id !== id);
  writeJson(FILE, data);
  return new NextResponse(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

const FILE = "origins.json";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  let data = readJson<any[]>(FILE);
  const index = data.findIndex(i => i.id === params.id);
  
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  data[index] = { ...data[index], ...body };
  writeJson(FILE, data);
  return NextResponse.json(data[index]);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  let data = readJson<any[]>(FILE);
  data = data.filter(i => i.id !== params.id);
  writeJson(FILE, data);
  return new NextResponse(null, { status: 204 });
}

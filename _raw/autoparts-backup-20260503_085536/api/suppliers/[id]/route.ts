import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";

const FILE = "suppliers.json";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const data = readJson<any[]>(FILE);
  const supplier = data.find(s => s.id === resolvedParams.id);
  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(supplier);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const body = await req.json();
  const data = readJson<any[]>(FILE);
  const idx = data.findIndex(s => s.id === resolvedParams.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  data[idx] = { ...data[idx], ...body };
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import type { ApprovalItem } from "../route";

const FILE = "approvals.json";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data = readJson<ApprovalItem[]>(FILE);
  const idx = data.findIndex((a) => a.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  data[idx] = { ...data[idx], ...body, id, updatedAt: new Date().toISOString() };
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson, nextId } from "@/lib/fileStore";

const FILE = "home-sections.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let data = readJson<any[]>(FILE);
  if (searchParams.get("active") === "true") {
    data = data.filter(item => item.active === true);
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const data = readJson<any[]>(FILE);
  const item = {
    id: body.id || nextId("sec"),
    title: body.title ?? "",
    titleZh: body.titleZh ?? "",
    icon: body.icon ?? "",
    query: body.query ?? "",
    limit: body.limit ?? 10,
    active: body.active ?? true,
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

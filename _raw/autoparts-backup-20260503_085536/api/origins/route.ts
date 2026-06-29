import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";

const FILE = "origins.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let data = readJson<any[]>(FILE);
  if (searchParams.get("active") === "true") {
    data = data.filter(item => item.active === true);
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = readJson<any[]>(FILE);
  const item = {
    id: body.id || nextId("orig"),
    name: body.name ?? "",
    nameZh: body.nameZh ?? "",
    image: body.image ?? "",
    active: body.active ?? true,
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

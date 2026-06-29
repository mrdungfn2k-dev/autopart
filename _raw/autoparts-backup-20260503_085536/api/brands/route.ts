import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "brands-catalog.json");

export async function GET() {
  try {
    const raw = fs.readFileSync(FILE, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ brands: [], regions: {} }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    fs.writeFileSync(FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Cannot write file" }, { status: 500 });
  }
}

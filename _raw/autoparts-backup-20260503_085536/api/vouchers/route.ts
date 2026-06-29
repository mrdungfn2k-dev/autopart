import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import type { Voucher } from "@/lib/api";

const FILE = "vouchers.json";

export async function GET() {
  return NextResponse.json(readJson<Voucher[]>(FILE));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = readJson<Voucher[]>(FILE);
  const item: Voucher = {
    id: nextId("v"),
    code: (body.code as string).toUpperCase().trim(),
    type: body.type ?? "percent",
    value: Number(body.value) || 0,
    minOrder: Number(body.minOrder) || 0,
    used: 0,
    limit: Number(body.limit) || 100,
    expiry: body.expiry ?? "",
    active: true,
  };
  if (!item.code) return NextResponse.json({ error: "code required" }, { status: 400 });
  if (data.find(v => v.code === item.code))
    return NextResponse.json({ error: "code exists" }, { status: 409 });
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

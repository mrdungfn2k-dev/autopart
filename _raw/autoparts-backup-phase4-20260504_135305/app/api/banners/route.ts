import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import type { Banner } from "@/lib/api";

const FILE = "banners.json";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let data = readJson<Banner[]>(FILE);
  if (searchParams.get("active") === "true") {
    const now = new Date();
    data = data.filter(b =>
      b.status === "active" &&
      new Date(b.startDate) <= now &&
      new Date(b.endDate) >= now
    );
  }
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const data = readJson<Banner[]>(FILE);
  const item: Banner = {
    id: nextId("b"),
    title: body.title ?? "",
    subtitle: body.subtitle ?? "",
    cta: body.cta ?? "Khám phá",
    href: body.href ?? "/products",
    image: body.image ?? "",
    status: body.status ?? "active",
    startDate: body.startDate ?? new Date().toISOString().split("T")[0],
    endDate: body.endDate ?? "",
    clicks: 0,
    gradient: body.gradient ?? "from-orange-600 to-red-700",
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

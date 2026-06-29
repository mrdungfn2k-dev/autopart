import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

const FILE = "affiliate-links.json";

interface AffiliateLink {
  id: string;
  name: string;
  target: string;
  url: string;
  clicks: number;
  orders: number;
  revenue: number;
  conversion: string;
  createdAt: string;
}

const DEFAULTS: AffiliateLink[] = [
  { id: "l1", name: "Link tổng — Trang chủ", target: "homepage", url: "https://autopart.vn?ref=LP2024", clicks: 1284, orders: 48, revenue: 12450000, conversion: "3.7%", createdAt: "2024-10-01" },
  { id: "l2", name: "Link danh mục Má Phanh", target: "brake-pads", url: "https://autopart.vn/c/ma-phanh?ref=LP2024", clicks: 642, orders: 29, revenue: 6230000, conversion: "4.5%", createdAt: "2024-10-05" },
  { id: "l3", name: "Link Flash Sale tháng 10", target: "flash-sale", url: "https://autopart.vn/flash-sale?ref=LP2024&camp=oct", clicks: 891, orders: 38, revenue: 9870000, conversion: "4.3%", createdAt: "2024-10-10" },
];

function readLinks(): AffiliateLink[] {
  const data = readJson<AffiliateLink[]>(FILE);
  if (!Array.isArray(data) || data.length === 0) {
    writeJson(FILE, DEFAULTS);
    return DEFAULTS;
  }
  return data;
}

export async function GET() {
  return NextResponse.json(readLinks());
}

export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["affiliate", "admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const links = readLinks();
  const refCode = "LP" + Date.now().toString(36).toUpperCase();
  const newLink: AffiliateLink = {
    id: "l" + Date.now(),
    name: body.name || "Link mới",
    target: body.target || "homepage",
    url: `https://autopart.vn/${body.target || ""}?ref=${refCode}&src=${(body.name || "new").replace(/\s/g, "_")}`,
    clicks: 0,
    orders: 0,
    revenue: 0,
    conversion: "0%",
    createdAt: new Date().toISOString().split("T")[0],
  };
  links.push(newLink);
  writeJson(FILE, links);
  return NextResponse.json(newLink, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const __auth = requireRole(req, ["affiliate", "admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const links = readLinks().filter(l => l.id !== id);
  writeJson(FILE, links);
  return NextResponse.json({ ok: true });
}

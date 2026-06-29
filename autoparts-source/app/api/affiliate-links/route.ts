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

// Domain prod thật + ánh xạ target -> đường dẫn CÓ THẬT (tránh link 404 như /homepage, /brake-pads)
const SITE = "https://autopartsvietnam.com.vn";
const TARGET_PATHS: Record<string, string> = { homepage: "", products: "products", "flash-sale": "flash-sale", "brake-pads": "products", "engine-oil": "products" };
function buildAffUrl(target: string, ref: string, src?: string) {
  const path = TARGET_PATHS[target] ?? "";
  const sep = path.includes("?") ? "&" : "?";
  return `${SITE}/${path}${sep}ref=${ref}${src ? "&src=" + src : ""}`;
}

// Mỗi seed 1 mã ref RIÊNG để click link nào chỉ tăng đúng link đó (trước dùng chung LP2024 → 1 click tăng cả 3).
const SEED_REF: Record<string, string> = { l1: "LP2024", l2: "LP2024MP", l3: "LP2024FS" };

// Link demo mặc định — KHÔNG bịa số liệu (clicks/orders/revenue = 0).
// Số liệu chỉ tăng khi có lượt click/đơn hàng THẬT qua /api/affiliate-links/track.
const DEFAULTS: AffiliateLink[] = [
  { id: "l1", name: "Link tổng — Trang chủ", target: "homepage", url: buildAffUrl("homepage", SEED_REF.l1), clicks: 0, orders: 0, revenue: 0, conversion: "0%", createdAt: "2024-10-01" },
  { id: "l2", name: "Link danh mục Má Phanh", target: "brake-pads", url: buildAffUrl("brake-pads", SEED_REF.l2), clicks: 0, orders: 0, revenue: 0, conversion: "0%", createdAt: "2024-10-05" },
  { id: "l3", name: "Link Flash Sale tháng 10", target: "flash-sale", url: buildAffUrl("flash-sale", SEED_REF.l3), clicks: 0, orders: 0, revenue: 0, conversion: "0%", createdAt: "2024-10-10" },
];

// Dấu vân tay số liệu ẢO cũ (bản seed trước đây) — chỉ reset ĐÚNG các seed chưa hề có hoạt động thật.
// Nếu seed đã có click/đơn thật (số khác) thì vân tay không khớp -> giữ nguyên, không đụng dữ liệu thật.
const LEGACY_FAKE: Record<string, { clicks: number; orders: number; revenue: number }> = {
  l1: { clicks: 1284, orders: 48, revenue: 12450000 },
  l2: { clicks: 642, orders: 29, revenue: 6230000 },
  l3: { clicks: 891, orders: 38, revenue: 9870000 },
};

export function calcConversion(clicks: number, orders: number): string {
  if (!clicks || clicks <= 0) return "0%";
  return ((orders / clicks) * 100).toFixed(1) + "%";
}

function readLinks(): AffiliateLink[] {
  const data = readJson<AffiliateLink[]>(FILE);
  if (!Array.isArray(data) || data.length === 0) {
    writeJson(FILE, DEFAULTS);
    return DEFAULTS;
  }
  let changed = false;
  const fixed = data.map(l => {
    let next = l;
    // 1) Sửa link cũ trỏ tới domain/đường dẫn sai (autopart.vn/... -> autopartsvietnam.com.vn + path thật)
    if (next.url && next.url.includes("autopart.vn")) {
      const m = next.url.match(/ref=([^&]+)/);
      next = { ...next, url: buildAffUrl(next.target || "homepage", m ? m[1] : "LP") };
      changed = true;
    }
    // 2) Xoá số liệu ẢO seed cũ về 0 (chỉ khi khớp vân tay legacy — tránh đụng dữ liệu thật)
    const fp = LEGACY_FAKE[next.id];
    if (fp && next.clicks === fp.clicks && next.orders === fp.orders && next.revenue === fp.revenue) {
      next = { ...next, clicks: 0, orders: 0, revenue: 0, conversion: "0%" };
      changed = true;
    }
    // 3) Gán mã ref RIÊNG cho từng seed (trước l1/l2/l3 dùng chung LP2024 → 1 click tăng cả 3).
    //    KHÔNG còn reset click seed về 0 nữa → lượt click THẬT được giữ và tăng đúng.
    const wantRef = SEED_REF[next.id];
    if (wantRef) {
      const curRef = (next.url.match(/[?&]ref=([^&]+)/) || [])[1];
      if (curRef !== wantRef) { next = { ...next, url: buildAffUrl(next.target || "homepage", wantRef) }; changed = true; }
    }
    return next;
  });
  if (changed) writeJson(FILE, fixed);
  return fixed;
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
    url: buildAffUrl(body.target || "homepage", refCode, (body.name || "new").replace(/\s/g, "_")),
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

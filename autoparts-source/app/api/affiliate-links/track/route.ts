import { NextRequest, NextResponse } from "next/server";
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

function calcConversion(clicks: number, orders: number): string {
  if (!clicks || clicks <= 0) return "0%";
  return ((orders / clicks) * 100).toFixed(1) + "%";
}

// Lấy mã ref từ URL của 1 link (vd ...?ref=LP2024&src=... -> "LP2024")
function refOf(url: string): string {
  const m = (url || "").match(/[?&]ref=([^&]+)/);
  return m ? m[1] : "";
}

/**
 * Ghi nhận hoạt động THẬT cho link affiliate (KHÔNG còn số liệu ảo).
 * POST { ref, type: "click" | "order", amount? }
 *  - click: +1 lượt click cho link có mã ref tương ứng
 *  - order: +1 đơn + cộng doanh thu (amount) cho link đó
 * Endpoint công khai (lượt click từ khách chưa đăng nhập) nên validate đầu vào chặt chẽ.
 */
export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const ref = typeof body?.ref === "string" ? body.ref.trim() : "";
  const type = body?.type === "order" ? "order" : "click";
  // Mã ref do hệ thống sinh ra dạng LP + base36 (chữ/số/_). Chặn input lạ để tránh nhiễm dữ liệu.
  if (!ref || !/^[A-Za-z0-9_]{2,40}$/.test(ref)) {
    return NextResponse.json({ error: "invalid ref" }, { status: 400 });
  }
  const amount = type === "order" ? Math.max(0, Math.min(Number(body?.amount) || 0, 1_000_000_000)) : 0;

  const links = readJson<AffiliateLink[]>(FILE);
  if (!Array.isArray(links) || links.length === 0) {
    return NextResponse.json({ ok: false, matched: false });
  }

  let matched = false;
  const next = links.map(l => {
    if (refOf(l.url) !== ref) return l;
    matched = true;
    const clicks = (l.clicks || 0) + (type === "click" ? 1 : 0);
    const orders = (l.orders || 0) + (type === "order" ? 1 : 0);
    const revenue = (l.revenue || 0) + (type === "order" ? amount : 0);
    return { ...l, clicks, orders, revenue, conversion: calcConversion(clicks, orders) };
  });

  if (matched) writeJson(FILE, next);
  return NextResponse.json({ ok: true, matched });
}

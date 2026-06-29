import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import type { Product } from "@/lib/api";
import { products as seedProducts } from "@/lib/data";

const FILE = "products.json";

function ensureSeeded(): Product[] {
  let data = readJson<Product[]>(FILE);
  if (data.length === 0) {
    // Seed from lib/data — preserve Chinese translation fields
    data = seedProducts.map(p => ({
      id: p.id,
      name: p.name,
      nameZh: (p as any).nameZh,
      brand: p.brand,
      category: p.categoryId,
      categoryId: p.categoryId,
      categoryName: (p as any).categoryName,
      categoryNameZh: (p as any).categoryNameZh,
      price: p.price,
      originalPrice: p.originalPrice,
      type: p.type as "OEM" | "OES" | "Generic",
      oemCode: p.oemCode,
      description: (p as any).description,
      descriptionZh: (p as any).descZh,
      rating: p.rating,
      reviews: (p as { reviews?: number }).reviews ?? (p as any).reviewCount ?? 0,
      stock: p.stock,
      sold: (p as any).sold ?? 0,
      image: p.image,
      origin: (p as any).origin ?? "",
      supplierId: "s001",
      active: true,
      isTrending: (p as any).isTrending ?? false,
      isHot: (p as any).isHot ?? false,
      isImported: (p as any).isImported ?? false,
    }));
    writeJson(FILE, data);
  }
  return data;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let data = ensureSeeded();
  const category = searchParams.get("category");
  const supplier = searchParams.get("supplierId");
  const search = searchParams.get("q");
  if (category) data = data.filter(p => p.categoryId === category || p.category === category);
  if (supplier) data = data.filter(p => p.supplierId === supplier);
  if (search) data = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.oemCode?.includes(search));
  const isTrending = searchParams.get("isTrending");
  const isHot = searchParams.get("isHot");
  const isImported = searchParams.get("isImported");
  if (isTrending === "true") data = data.filter(p => (p as any).isTrending === true);
  if (isHot === "true") data = data.filter(p => (p as any).isHot === true);
  if (isImported === "true") data = data.filter(p => (p as any).isImported === true);
  data = data.filter(p => p.active !== false);
  // "Đã bán" THẬT: đếm theo orders.json (bỏ số seed ảo) — sản phẩm chưa có đơn = 0
  try {
    const allOrders = readJson<Array<{ status?: string; items?: Array<{ id?: string; qty?: number }> }>>("orders.json");
    const soldMap: Record<string, number> = {};
    for (const o of allOrders) {
      if (o.status === "cancelled") continue;
      for (const it of (o.items ?? [])) if (it.id) soldMap[it.id] = (soldMap[it.id] ?? 0) + (it.qty ?? 1);
    }
    data = data.map(p => ({ ...p, sold: soldMap[p.id] ?? 0 }));
  } catch {}
  // "Đánh giá" THẬT: tính từ reviews.json (bỏ rating/reviews seed ẢO). Sản phẩm CHƯA có đánh giá thật = 0 sao / (0).
  try {
    const allReviews = readJson<Array<{ productId?: string; rating?: number }>>("reviews.json");
    const rev: Record<string, { sum: number; n: number }> = {};
    for (const r of (Array.isArray(allReviews) ? allReviews : [])) {
      if (!r.productId) continue;
      const g = rev[r.productId] ?? (rev[r.productId] = { sum: 0, n: 0 });
      g.sum += Number(r.rating) || 0; g.n += 1;
    }
    data = data.map(p => {
      const g = rev[p.id];
      const n = g?.n ?? 0;
      const avg = n > 0 ? Math.round((g!.sum / n) * 10) / 10 : 0;
      return { ...p, rating: avg, reviews: n, reviewCount: n };
    });
  } catch { data = data.map(p => ({ ...p, rating: 0, reviews: 0, reviewCount: 0 })); }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["admin", "supplier"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const data = ensureSeeded();

  // Auto-translate Vietnamese → Chinese for dynamic content
  async function translateBatch(texts: string[]): Promise<string[]> {
    try {
      const base = req.url.split("/api/")[0];
      const res = await fetch(`${base}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texts }),
      });
      if (!res.ok) return texts;
      const { results } = await res.json();
      return Array.isArray(results) ? results : texts;
    } catch { return texts; }
  }

  const fieldsToTranslate = [body.name ?? "", body.brand ?? "", body.description ?? ""].filter(Boolean);
  const [nameZh, brandZh, descriptionZh] = fieldsToTranslate.length > 0
    ? await translateBatch(fieldsToTranslate)
    : ["", "", ""];

  const item: Product & { nameZh?: string; brandZh?: string; descriptionZh?: string; sku?: string; warrantyMonth?: number } = {
    id: nextId("p"),
    name: body.name ?? "",
    nameZh: nameZh || undefined,
    brand: body.brand ?? "",
    brandZh: brandZh || undefined,
    description: body.description,
    descriptionZh: descriptionZh || undefined,
    category: body.category ?? "",
    categoryId: body.categoryId ?? (body.category ?? "").toLowerCase().replace(/\s+/g, "-"),
    price: Number(body.price) || 0,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
    type: body.type ?? "Generic",
    oemCode: body.oemCode,
    sku: body.sku || undefined,
    warrantyMonth: body.warrantyMonth != null ? Number(body.warrantyMonth) : undefined,
    rating: body.rating ?? 0,
    reviews: body.reviews ?? 0,
    stock: Number(body.stock) || 0,
    image: body.image ?? "generic",
    origin: body.originClass === "imported" ? "Nhập khẩu" : body.originClass === "domestic" ? "Trong nước" : "Khác",
    originClass: body.originClass,
    supplierId: body.supplierId,
    active: true,
    isTrending: body.isTrending ?? false,
    isHot: body.isHot ?? false,
    isImported: body.originClass === "imported",
    allowBackorder: body.allowBackorder === true,
    attributeSetId: body.attributeSetId || undefined,
    attributes: body.attributes && typeof body.attributes === "object" ? body.attributes : undefined,
    channels: Array.isArray(body.channels) ? body.channels : undefined,
    warehouseStocks: body.warehouseStocks && typeof body.warehouseStocks === "object" ? body.warehouseStocks : undefined,
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

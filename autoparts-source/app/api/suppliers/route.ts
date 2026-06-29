import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { enrichSuppliers } from "@/lib/supplierStats";

const FILE = "suppliers.json";

interface Supplier {
  id: string;
  name: string;
  nameZh?: string;
  logo?: string;
  banner?: string;
  description?: string;
  descriptionZh?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxCode?: string;
  rating?: number;
  reviewCount?: number;
  totalProducts?: number;
  totalOrders?: number;
  responseRate?: number;
  responseTime?: string;
  joinedAt?: string;
  verified?: boolean;
  active?: boolean;
  tags?: string[];
  categories?: string[];
}

function ensureSeeded(): Supplier[] {
  const data = readJson<Supplier[]>(FILE);
  return Array.isArray(data) ? data : [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // all=1 -> trả cả NCC đã ẩn (cho trang quản trị); mặc định chỉ NCC đang hoạt động
  let data = ensureSeeded();
  if (searchParams.get("all") !== "1") data = data.filter(s => s.active !== false);

  // Số liệu THẬT (SP/đơn/đánh giá/phản hồi) — tính từ products.json + orders.json
  data = enrichSuppliers(data);

  const q = searchParams.get("q");
  if (q) {
    const lq = q.toLowerCase();
    data = data.filter(s =>
      s.name.toLowerCase().includes(lq) ||
      s.description?.toLowerCase().includes(lq) ||
      s.tags?.some(t => t.toLowerCase().includes(lq))
    );
  }
  
  const sort = searchParams.get("sort");
  if (sort === "rating") data.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  else if (sort === "orders") data.sort((a, b) => (b.totalOrders ?? 0) - (a.totalOrders ?? 0));
  else if (sort === "products") data.sort((a, b) => (b.totalProducts ?? 0) - (a.totalProducts ?? 0));
  else data.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
  
  const limit = searchParams.get("limit");
  if (limit) data = data.slice(0, parseInt(limit));
  
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const data = ensureSeeded();
  const item: Supplier = {
    id: nextId("s"),
    name: body.name ?? "",
    nameZh: body.nameZh,
    logo: body.logo ?? "",
    banner: body.banner ?? "",
    description: body.description ?? "",
    address: body.address ?? "",
    phone: body.phone ?? "",
    email: body.email ?? "",
    taxCode: body.taxCode ?? "",
    rating: 0,
    reviewCount: 0,
    totalProducts: 0,
    totalOrders: 0,
    responseRate: 100,
    responseTime: "trong ngày",
    joinedAt: new Date().toISOString(),
    verified: false,
    active: true,
    tags: body.tags ?? [],
    categories: body.categories ?? [],
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

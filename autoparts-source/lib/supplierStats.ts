import { readJson } from "@/lib/fileStore";

// Tính SỐ LIỆU THẬT cho nhà cung cấp từ products.json + orders.json.
// - totalProducts: số sản phẩm thật của NCC
// - totalOrders:   số đơn có chứa ít nhất 1 SP của NCC (bỏ đơn cancelled)
// - rating:        điểm trung bình thật từ rating các SP của NCC
// - reviewCount:   tổng lượt đã bán của các SP (tín hiệu hoạt động thật, thay số seed ảo)
// - responseRate:  suy ra từ đánh giá của người dùng = round(rating/5*100)
// NCC CHƯA có sản phẩm thật → giữ nguyên seed (placeholder), tránh hiển thị toàn số 0.
type AnySupplier = {
  id: string; rating?: number; reviewCount?: number;
  totalProducts?: number; totalOrders?: number; responseRate?: number;
  [k: string]: unknown;
};

export function enrichSuppliers<T extends AnySupplier>(suppliers: T[]): T[] {
  const products = (readJson<Array<{ id?: string; supplierId?: string; rating?: number; sold?: number; active?: boolean }>>("products.json") || [])
    .filter(p => p?.active !== false);
  const orders = readJson<Array<{ status?: string; items?: Array<{ id?: string }> }>>("orders.json") || [];
  const prodSupplier: Record<string, string> = {};
  for (const p of products) if (p?.id) prodSupplier[p.id] = p.supplierId || "";

  return suppliers.map(s => {
    const mine = products.filter(p => p.supplierId === s.id);
    if (mine.length === 0) return s; // chưa có SP thật → giữ seed
    const totalProducts = mine.length;
    const reviewCount = mine.reduce((a, p) => a + (p.sold ?? 0), 0);
    const ratings = mine.map(p => p.rating).filter((r): r is number => typeof r === "number" && r > 0);
    const rating = ratings.length ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : (s.rating ?? 0);
    const totalOrders = orders.filter(o =>
      o?.status !== "cancelled" && Array.isArray(o.items) && o.items.some(it => it?.id && prodSupplier[it.id] === s.id)
    ).length;
    const responseRate = rating > 0 ? Math.round((rating / 5) * 100) : (s.responseRate ?? 0);
    return { ...s, totalProducts, totalOrders, rating, reviewCount, responseRate };
  });
}

export function enrichSupplier<T extends AnySupplier>(s: T): T {
  return enrichSuppliers([s])[0];
}

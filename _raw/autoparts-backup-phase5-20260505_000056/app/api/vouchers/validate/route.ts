import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import type { Voucher } from "@/lib/api";

const FILE = "vouchers.json";

interface CartItem { id: string; qty: number; categoryId?: string; price?: number; }

export async function POST(req: NextRequest) {
  const { code, order, items } = await req.json() as { code: string; order: number; items?: CartItem[] };
  if (!code) return NextResponse.json({ valid: false, error: "no code" }, { status: 400 });

  const data = readJson<Voucher[]>(FILE);
  const voucher = data.find(v => v.code === code.toUpperCase().trim()) as any;

  if (!voucher) return NextResponse.json({ valid: false, error: "Mã không hợp lệ" });
  if (!voucher.active) return NextResponse.json({ valid: false, error: "Mã đã bị tắt" });
  if (voucher.used >= voucher.limit) return NextResponse.json({ valid: false, error: "Mã đã hết lượt" });
  if (order < voucher.minOrder) return NextResponse.json({ valid: false, error: `Đơn tối thiểu ${voucher.minOrder.toLocaleString()}đ` });

  // Cart-rule conditions (only enforced if cart items provided)
  if (Array.isArray(items) && items.length > 0) {
    if (Array.isArray(voucher.applicableProductIds) && voucher.applicableProductIds.length > 0) {
      const matchProd = items.some(it => voucher.applicableProductIds.includes(it.id));
      if (!matchProd) return NextResponse.json({ valid: false, error: "Mã chỉ áp dụng cho sản phẩm cụ thể không có trong giỏ" });
    }
    if (Array.isArray(voucher.applicableCategoryIds) && voucher.applicableCategoryIds.length > 0) {
      const matchCat = items.some(it => it.categoryId && voucher.applicableCategoryIds.includes(it.categoryId));
      if (!matchCat) return NextResponse.json({ valid: false, error: "Mã chỉ áp dụng cho danh mục cụ thể không có trong giỏ" });
    }
    if (voucher.minQty && voucher.minQty > 0) {
      const totalQty = items.reduce((s, it) => s + (it.qty || 0), 0);
      if (totalQty < voucher.minQty) return NextResponse.json({ valid: false, error: `Mã yêu cầu tối thiểu ${voucher.minQty} sản phẩm` });
    }
  }

  // Check expiry
  if (voucher.expiry) {
    const exp = new Date(voucher.expiry);
    if (exp < new Date()) return NextResponse.json({ valid: false, error: "Mã đã hết hạn" });
  }

  // Calculate discount
  let discount = 0;
  if (voucher.type === "percent") discount = Math.round(order * voucher.value / 100);
  else if (voucher.type === "fixed") discount = voucher.value;
  else if (voucher.type === "shipping") discount = 35000; // shipping fee

  // Increment used count
  const idx = data.findIndex(v => v.id === voucher.id);
  data[idx].used += 1;
  writeJson(FILE, data);

  return NextResponse.json({ valid: true, voucher, discount });
}

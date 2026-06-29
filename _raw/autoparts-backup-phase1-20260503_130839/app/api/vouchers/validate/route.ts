import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import type { Voucher } from "@/lib/api";

const FILE = "vouchers.json";

export async function POST(req: NextRequest) {
  const { code, order } = await req.json() as { code: string; order: number };
  if (!code) return NextResponse.json({ valid: false, error: "no code" }, { status: 400 });

  const data = readJson<Voucher[]>(FILE);
  const voucher = data.find(v => v.code === code.toUpperCase().trim());

  if (!voucher) return NextResponse.json({ valid: false, error: "Mã không hợp lệ" });
  if (!voucher.active) return NextResponse.json({ valid: false, error: "Mã đã bị tắt" });
  if (voucher.used >= voucher.limit) return NextResponse.json({ valid: false, error: "Mã đã hết lượt" });
  if (order < voucher.minOrder) return NextResponse.json({ valid: false, error: `Đơn tối thiểu ${voucher.minOrder.toLocaleString()}đ` });

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

import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  // Giao dịch THẬT suy ra từ đơn hàng — KHÔNG dùng transactions.json seed (còn ví MoMo/ZaloPay đã bỏ).
  // Hệ thống chỉ còn 2 phương thức: Thanh toán QR + COD → mọi đơn điện tử = "qr", còn lại "cod".
  const orders = readJson<any[]>("orders.json", []);
  const STATUS: Record<string, string> = { pending: "pending", confirmed: "success", shipping: "success", delivered: "success", cancelled: "cancelled" };
  const txns = (Array.isArray(orders) ? orders : []).map(o => ({
    id: "tx-" + String(o.id || "").replace(/^AP-?/, ""),
    orderId: o.id,
    type: "payment",
    method: o.paymentMethod === "cod" ? "cod" : "qr",
    amount: o.total || 0,
    status: STATUS[o.status] || "pending",
    createdAt: o.createdAt,
  }));
  txns.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return NextResponse.json(txns);
}

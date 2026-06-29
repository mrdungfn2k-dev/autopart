import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

export interface Order {
  id: string;
  userId: string;
  items: Array<{ id: string; name: string; qty: number; price: number }>;
  shipping: { name: string; phone: string; city: string; address: string; method: string; fee: number };
  payment: { method: string; status: "pending" | "paid" | "failed"; detail?: string };
  subtotal: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  const orders = readJson<Order[]>("orders.json");
  // Đơn MỚI NHẤT lên đầu (theo createdAt giảm dần) — đơn vừa đặt hiện ngay đầu danh sách
  orders.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  // Admin and supplier see all; other users see only their own
  if (user?.role === "admin" || user?.role === "supplier") return NextResponse.json(orders);
  if (!user) return NextResponse.json([], { status: 200 });
  return NextResponse.json(orders.filter(o => o.userId === user.id));
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  const body = await req.json();

  const order: Order = {
    id: `AP-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    userId: user?.id ?? "guest",
    items: body.items ?? [],
    shipping: body.shipping,
    payment: { method: body.paymentMethod, status: "pending" },
    subtotal: body.subtotal,
    discount: body.discount ?? 0,
    total: body.total,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = readJson<Order[]>("orders.json");
  orders.push(order);
  writeJson("orders.json", orders);

  // Cộng "số lượng đã bán" THẬT cho từng sản phẩm trong đơn (để con số phản ánh đơn thực tế)
  try {
    const prods = readJson<Array<{ id: string; sold?: number }>>("products.json");
    let changed = false;
    for (const it of (order.items ?? []) as Array<{ id?: string; qty?: number }>) {
      const p = prods.find(x => x.id === it.id);
      if (p) { p.sold = (p.sold ?? 0) + (it.qty ?? 1); changed = true; }
    }
    if (changed) writeJson("products.json", prods);
  } catch {}

  // Auto-log transaction (Giao dịch)
  try {
    const txs = readJson<any[]>("transactions.json");
    txs.push({
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: order.id,
      type: "payment",
      method: order.payment.method,
      amount: order.total,
      status: order.payment.method === "cod" ? "pending" : "pending",
      createdAt: new Date().toISOString(),
    });
    writeJson("transactions.json", txs);
  } catch {}

  return NextResponse.json(order, { status: 201 });
}

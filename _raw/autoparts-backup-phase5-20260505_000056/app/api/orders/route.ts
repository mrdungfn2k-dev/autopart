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

import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME, requireRole } from "@/lib/jwt";
import type { Order } from "../route";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = readJson<Order[]>("orders.json");
  const order = orders.find(o => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const __auth = requireRole(req, ["admin", "supplier"]);
  if (__auth instanceof NextResponse) return __auth;
  const { id } = await params;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  const body = await req.json();
  const orders = readJson<Order[]>("orders.json");
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update allowed fields
  const oldStatus = orders[idx].status;
  if (body.status) orders[idx].status = body.status;
  if (body.note !== undefined) (orders[idx] as any).note = body.note;
  if (body.tracking !== undefined) (orders[idx] as any).tracking = body.tracking;
  if (body.shipment !== undefined) (orders[idx] as any).shipment = body.shipment;
  orders[idx].updatedAt = new Date().toISOString();

  writeJson("orders.json", orders);

  // Auto-create invoice on first delivery
  if (oldStatus !== "delivered" && body.status === "delivered") {
    try {
      const invs = readJson<any[]>("invoices.json");
      const exists = invs.find((iv: any) => iv.orderId === orders[idx].id);
      if (!exists) {
        invs.push({
          id: `INV-${orders[idx].id}`,
          orderId: orders[idx].id,
          customerId: orders[idx].userId,
          customerName: orders[idx].shipping?.name ?? "",
          items: orders[idx].items,
          subtotal: orders[idx].subtotal,
          discount: orders[idx].discount,
          total: orders[idx].total,
          issuedAt: new Date().toISOString(),
        });
        writeJson("invoices.json", invs);
      }
    } catch {}
  }

  // Update transaction status when order delivered or cancelled
  if (body.status && body.status !== oldStatus) {
    try {
      const txs = readJson<any[]>("transactions.json");
      const txIdx = txs.findIndex((t: any) => t.orderId === orders[idx].id);
      if (txIdx >= 0) {
        if (body.status === "delivered") txs[txIdx].status = "success";
        else if (body.status === "cancelled") txs[txIdx].status = "cancelled";
        else if (body.status === "refunded") txs[txIdx].status = "refunded";
        txs[txIdx].updatedAt = new Date().toISOString();
        writeJson("transactions.json", txs);
      }
    } catch {}
  }

  return NextResponse.json(orders[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;
  const { id } = await params;
  const orders = readJson<Order[]>("orders.json");
  const filtered = orders.filter(o => o.id !== id);
  if (filtered.length === orders.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  writeJson("orders.json", filtered);
  return NextResponse.json({ ok: true });
}

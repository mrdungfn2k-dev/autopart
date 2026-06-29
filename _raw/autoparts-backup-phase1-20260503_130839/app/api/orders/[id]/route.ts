import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import type { Order } from "../route";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = readJson<Order[]>("orders.json");
  const order = orders.find(o => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  const body = await req.json();
  const orders = readJson<Order[]>("orders.json");
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update allowed fields
  if (body.status) orders[idx].status = body.status;
  if (body.note !== undefined) (orders[idx] as any).note = body.note;
  if (body.tracking !== undefined) (orders[idx] as any).tracking = body.tracking;
  orders[idx].updatedAt = new Date().toISOString();

  writeJson("orders.json", orders);
  return NextResponse.json(orders[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = readJson<Order[]>("orders.json");
  const filtered = orders.filter(o => o.id !== id);
  if (filtered.length === orders.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  writeJson("orders.json", filtered);
  return NextResponse.json({ ok: true });
}

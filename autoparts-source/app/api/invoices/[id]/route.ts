import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fileStore";
import { requireRole, getUserFromRequest } from "@/lib/jwt";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = readJson<any[]>("invoices.json");
  const inv = data.find(x => x.id === id || x.orderId === id);
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Customers can only see their own
  if (user.role !== "admin" && user.role !== "supplier" && inv.customerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(inv);
}

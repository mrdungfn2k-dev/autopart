import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(readJson<Refund[]>("refunds.json"));
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  if (!body.orderId || !body.amount) return NextResponse.json({ error: "orderId and amount required" }, { status: 400 });
  const data = readJson<Refund[]>("refunds.json");
  const item: Refund = {
    id: nextId("rf"),
    orderId: body.orderId,
    amount: Number(body.amount),
    reason: body.reason ?? "",
    status: body.status ?? "pending",
    createdAt: new Date().toISOString(),
  };
  data.push(item);
  writeJson("refunds.json", data);
  return NextResponse.json(item, { status: 201 });
}

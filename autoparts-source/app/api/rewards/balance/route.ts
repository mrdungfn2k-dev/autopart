import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { balanceFor, redemptionHistory } from "@/lib/loyalty";

// Số dư điểm THẬT của khách = điểm tích (theo đơn) − điểm đã đổi. Kèm lịch sử đổi quà (mã voucher).
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["customer", "admin"]);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user.id;
  if (!userId) return NextResponse.json({ earned: 0, spent: 0, balance: 0, history: [] });
  return NextResponse.json({ ...balanceFor(userId), history: redemptionHistory(userId) }, { headers: { "Cache-Control": "no-store" } });
}

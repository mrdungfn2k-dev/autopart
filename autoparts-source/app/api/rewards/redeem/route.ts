import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { readRewards } from "../route";
import { balanceFor, recordRedemption } from "@/lib/loyalty";

const VFILE = "vouchers.json";

// Khách đổi ĐIỂM lấy voucher THẬT: kiểm tra đủ điểm → phát voucher (gắn userId) → trừ điểm.
export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["customer", "admin"]);
  if (auth instanceof NextResponse) return auth;
  const userId = auth.user.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any; try { body = await req.json(); } catch { body = {}; }
  const reward = readRewards().find(r => r.id === body?.rewardId && r.active);
  if (!reward) return NextResponse.json({ error: "Phần quà không tồn tại hoặc đã tắt." }, { status: 404 });

  const { balance } = balanceFor(userId);
  if (balance < reward.pointsCost)
    return NextResponse.json({ error: `Không đủ điểm. Cần ${reward.pointsCost} điểm, bạn có ${balance}.` }, { status: 400 });

  // Phát voucher cá nhân (1 lần dùng, hết hạn 30 ngày)
  const vouchers = readJson<any[]>(VFILE, []);
  const code = "RW" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);
  const expiry = new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0];
  const voucher = {
    id: nextId("v"),
    code,
    type: reward.voucherType,
    value: reward.voucherValue,
    minOrder: reward.minOrder,
    limit: 1,
    used: 0,
    expiry,
    active: true,
    userId, // chỉ chủ tài khoản đổi mới dùng được (xem validate)
    description: `Đổi ${reward.pointsCost} điểm: ${reward.name}`,
  };
  vouchers.push(voucher);
  writeJson(VFILE, vouchers);

  // Trừ điểm THẬT (ghi sổ loyalty.json) + lưu mã để khách xem lại
  recordRedemption(userId, reward.pointsCost, `Đổi quà: ${reward.name}`, voucher.id, code);
  const after = balanceFor(userId);

  return NextResponse.json({ ok: true, code, voucher, balance: after.balance }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

const FILE = "payouts.json";

interface Payout {
  id: string;
  type: "supplier" | "affiliate";
  kind?: "commission" | "withdrawal"; // withdrawal = yêu cầu rút tiền (khoá tạm số dư)
  name: string;
  amount: number;
  fee?: number;
  net?: number;
  role?: string;
  account?: string;
  date: string;
  status: "PAID" | "PENDING" | "SCHEDULED" | "REJECTED";
}

// Số dư khả dụng đại lý = hoa hồng chưa trả − tiền đã rút/đang chờ rút (yêu cầu rút KHÔNG bị từ chối).
//  - PENDING (chờ admin duyệt) = khoá tạm   - PAID (admin đã duyệt) = đã rút hẳn   - REJECTED = trả lại số dư
export function affiliateBalance(payouts: Payout[]) {
  const aff = payouts.filter(p => p.type === "affiliate");
  const earned = aff.filter(p => p.kind !== "withdrawal" && p.status !== "PAID").reduce((s, p) => s + (p.amount || 0), 0);
  const taken = aff.filter(p => p.kind === "withdrawal" && p.status !== "REJECTED").reduce((s, p) => s + (p.amount || 0), 0);
  const locked = aff.filter(p => p.kind === "withdrawal" && p.status === "PENDING").reduce((s, p) => s + (p.amount || 0), 0);
  return { earned, taken, locked, available: Math.max(0, earned - taken) };
}

const DEFAULTS: Payout[] = [
  { id: "P-001", type: "supplier", name: "Phụ Tùng An Thái",  amount: 38400000, fee: 4266000, net: 34134000, date: "10/10/2024", status: "PAID" },
  { id: "P-002", type: "supplier", name: "Hà Thành Parts",     amount: 29100000, fee: 3233000, net: 25867000, date: "10/10/2024", status: "PAID" },
  { id: "P-003", type: "supplier", name: "Nam Bộ Auto Parts",  amount: 21800000, fee: 2422000, net: 19378000, date: "10/10/2024", status: "PENDING" },
  { id: "P-004", type: "supplier", name: "Motors Việt Nam",    amount: 15600000, fee: 1733000, net: 13867000, date: "25/10/2024", status: "SCHEDULED" },
  { id: "C-001", type: "affiliate", name: "Lê Partner Gold",  amount: 14640000, role: "T1", date: "10/10/2024", status: "PAID" },
  { id: "C-002", type: "affiliate", name: "Nguyễn Văn An",    amount: 9720000,  role: "T1", date: "10/10/2024", status: "PAID" },
  { id: "C-003", type: "affiliate", name: "Trần CTV Pro",      amount: 3650000,  role: "T2", date: "10/10/2024", status: "PENDING" },
  { id: "C-004", type: "affiliate", name: "Phạm CTV Mới",     amount: 1840000,  role: "T2", date: "25/10/2024", status: "SCHEDULED" },
];

function readPayouts(): Payout[] {
  const data = readJson<Payout[]>(FILE);
  if (!Array.isArray(data) || data.length === 0) {
    writeJson(FILE, DEFAULTS);
    return DEFAULTS;
  }
  return data;
}

export async function GET() {
  return NextResponse.json(readPayouts());
}

// Đại lý gửi YÊU CẦU RÚT TIỀN — lưu THẬT + KHOÁ số dư (trước đây chỉ trừ tạm ở client rồi reset khi tải lại)
export async function POST(req: NextRequest) {
  const __auth = requireRole(req, ["affiliate", "admin"]);
  if (__auth instanceof NextResponse) return __auth;

  let body: any; try { body = await req.json(); } catch { body = {}; }
  const amount = Math.floor(Number(body?.amount) || 0);
  if (amount < 500000) return NextResponse.json({ error: "amount too small (min 500,000)" }, { status: 400 });

  const payouts = readPayouts();
  const { available } = affiliateBalance(payouts);
  if (amount > available) return NextResponse.json({ error: "insufficient balance", available }, { status: 400 });

  const item: Payout = {
    id: "W" + Date.now().toString(36).toUpperCase(),
    type: "affiliate",
    kind: "withdrawal",
    name: typeof body?.name === "string" ? body.name.slice(0, 80) : "Rút hoa hồng",
    amount,
    role: typeof body?.role === "string" ? body.role : undefined,
    account: typeof body?.account === "string" ? body.account.slice(0, 60) : undefined,
    date: new Date().toLocaleDateString("vi-VN"),
    status: "PENDING",
  };
  payouts.push(item);
  writeJson(FILE, payouts);
  return NextResponse.json({ ok: true, request: item, available: available - amount }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const { id, status } = body;
  if (!["PAID", "PENDING", "SCHEDULED", "REJECTED"].includes(status))
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  const payouts = readPayouts();
  const idx = payouts.findIndex(p => p.id === id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  payouts[idx] = { ...payouts[idx], status };
  writeJson(FILE, payouts);
  return NextResponse.json(payouts[idx]);
}

export async function PUT(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  // Duyệt tất cả hoa hồng PENDING của 1 loại — KHÔNG đụng yêu cầu rút (withdrawal) để admin duyệt riêng
  const body = await req.json();
  const { type } = body;
  const payouts = readPayouts();
  payouts.forEach((p, i) => { if (p.status === "PENDING" && p.kind !== "withdrawal" && (!type || p.type === type)) payouts[i].status = "PAID"; });
  writeJson(FILE, payouts);
  return NextResponse.json({ ok: true });
}

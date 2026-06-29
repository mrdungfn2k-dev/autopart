import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

const FILE = "payouts.json";

interface Payout {
  id: string;
  type: "supplier" | "affiliate";
  name: string;
  amount: number;
  fee?: number;
  net?: number;
  role?: string;
  date: string;
  status: "PAID" | "PENDING" | "SCHEDULED";
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

export async function PATCH(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const { id, status } = body;
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

  // Approve all PENDING of a given type
  const body = await req.json();
  const { type } = body;
  const payouts = readPayouts();
  payouts.forEach((p, i) => { if (p.status === "PENDING" && (!type || p.type === type)) payouts[i].status = "PAID"; });
  writeJson(FILE, payouts);
  return NextResponse.json({ ok: true });
}

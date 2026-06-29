import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

export type ApprovalType = "supplier" | "product" | "affiliate" | "mechanic";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  name: string;
  submittedBy: string;
  date: string;
  status: ApprovalStatus;
  details: string;
  taxCode?: string;
  province?: string;
  createdAt: string;
  updatedAt: string;
}

const FILE = "approvals.json";

const SEED: ApprovalItem[] = [
  { id: "A-001", type: "supplier", name: "Công Ty TNHH Phụ Tùng Việt Bắc", submittedBy: "Nguyễn Văn Hùng", date: "15/10/2024", status: "PENDING", details: "Nhà cung cấp phụ tùng ô tô khu vực phía Bắc", taxCode: "0123456789", province: "Hà Nội", createdAt: "2024-10-15T08:00:00.000Z", updatedAt: "2024-10-15T08:00:00.000Z" },
  { id: "A-002", type: "product", name: "Má Phanh Continental Premium X400", submittedBy: "Phụ Tùng An Thái (NCC)", date: "14/10/2024", status: "PENDING", details: "Sản phẩm mới — chờ kiểm tra thông số kỹ thuật và chứng nhận xuất xứ", createdAt: "2024-10-14T09:00:00.000Z", updatedAt: "2024-10-14T09:00:00.000Z" },
  { id: "A-003", type: "affiliate", name: "Đại Lý Phụ Tùng Miền Trung", submittedBy: "Trần Minh Đức", date: "14/10/2024", status: "PENDING", details: "Đăng ký làm đại lý cấp T1, cam kết GMV 50M/tháng", province: "Đà Nẵng", createdAt: "2024-10-14T10:00:00.000Z", updatedAt: "2024-10-14T10:00:00.000Z" },
  { id: "A-004", type: "mechanic", name: "Nguyễn Trọng Tín", submittedBy: "Nguyễn Trọng Tín", date: "13/10/2024", status: "PENDING", details: "Thợ có 8 năm kinh nghiệm, chuyên Toyota/Honda, kèm chứng chỉ kỹ thuật", province: "TP.HCM", createdAt: "2024-10-13T11:00:00.000Z", updatedAt: "2024-10-13T11:00:00.000Z" },
  { id: "A-005", type: "product", name: "Bugi Bosch Platinum Iridium FR7KI332S", submittedBy: "Hà Thành Parts (NCC)", date: "12/10/2024", status: "APPROVED", details: "Sản phẩm đã được phê duyệt", createdAt: "2024-10-12T12:00:00.000Z", updatedAt: "2024-10-12T13:00:00.000Z" },
  { id: "A-006", type: "supplier", name: "Auto Parts Mekong", submittedBy: "Lê Văn Phong", date: "10/10/2024", status: "REJECTED", details: "Thiếu giấy phép kinh doanh hợp lệ — yêu cầu bổ sung hồ sơ", province: "Cần Thơ", createdAt: "2024-10-10T08:00:00.000Z", updatedAt: "2024-10-10T09:00:00.000Z" },
];

function ensureSeeded(): ApprovalItem[] {
  let data = readJson<ApprovalItem[]>(FILE);
  if (data.length === 0) {
    writeJson(FILE, SEED);
    return SEED;
  }
  return data;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  let data = ensureSeeded();
  const status = searchParams.get("status");
  if (status) data = data.filter((a) => a.status === status);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();

  const item: ApprovalItem = {
    id: nextId("A"),
    type: body.type ?? "product",
    name: body.name ?? "",
    submittedBy: body.submittedBy ?? user.name,
    date: new Date().toLocaleDateString("vi-VN"),
    status: "PENDING",
    details: body.details ?? "",
    taxCode: body.taxCode,
    province: body.province,
    createdAt: now,
    updatedAt: now,
  };

  const data = ensureSeeded();
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

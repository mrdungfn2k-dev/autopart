import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  isDefault?: boolean;
}

const FILE = "addresses.json";

// Sổ địa chỉ lưu THẬT trên server theo tài khoản → đồng bộ giữa "Sổ địa chỉ" và trang Thanh toán.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json([], { status: 200 });
  const all = readJson<Address[]>(FILE);
  return NextResponse.json(all.filter(a => a.userId === user.id));
}

// Thay thế toàn bộ danh sách địa chỉ của tài khoản hiện tại bằng danh sách gửi lên.
export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const list: Partial<Address>[] = Array.isArray(body) ? body : (body?.addresses || []);

  const all = readJson<Address[]>(FILE);
  const others = all.filter(a => a.userId !== user.id);
  const mine: Address[] = list.map((a, i) => ({
    id: a.id || `addr_${Date.now()}_${i}`,
    userId: user.id,
    name: a.name || "",
    phone: a.phone || "",
    address: a.address || "",
    city: a.city || "",
    district: a.district || "",
    isDefault: !!a.isDefault,
  }));
  // Đảm bảo có đúng 1 địa chỉ mặc định nếu danh sách không rỗng
  if (mine.length && !mine.some(a => a.isDefault)) mine[0].isDefault = true;

  writeJson(FILE, [...others, ...mine]);
  return NextResponse.json(mine);
}

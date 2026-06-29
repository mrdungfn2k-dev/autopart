import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fileStore";
import { getUserFromRequest } from "@/lib/jwt";

interface User {
  id: string; name: string; email: string;
  passwordHash: string; role: string;
  phone?: string; supplierId?: string;
  active: boolean; createdAt: string;
}

// GDPR-style data export — return everything we have on the authenticated user.
// Excludes other users' data and internal hash.
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = readJson<User[]>("users.json");
  const me = users.find(u => u.id === user.id);
  const myProfile = me ? {
    id: me.id, name: me.name, email: me.email, phone: me.phone,
    role: me.role, supplierId: me.supplierId, active: me.active, createdAt: me.createdAt,
  } : null;

  const orders = readJson<any[]>("orders.json").filter(o => o.userId === user.id);
  const garage = readJson<any[]>("garage.json").filter(g => g.userId === user.id);
  const reviews = readJson<any[]>("reviews.json").filter(r => r.userId === user.id);
  const returns = readJson<any[]>("returns.json").filter(r => r.userId === user.id);
  const newsletter = readJson<any[]>("newsletter.json").filter(n => n.email?.toLowerCase() === user.email.toLowerCase());

  const data = {
    exportedAt: new Date().toISOString(),
    profile: myProfile,
    orders,
    garage,
    reviews,
    returns,
    newsletterSubscriptions: newsletter,
    note: "Export tuân thủ GDPR — chỉ chứa dữ liệu của tài khoản đang đăng nhập.",
  };

  const filename = `autoparts-data-export-${user.id}-${Date.now()}.json`;
  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

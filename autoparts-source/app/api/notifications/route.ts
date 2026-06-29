import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

export const dynamic = "force-dynamic";

type Notif = { id: string; type: "message" | "order" | "approval" | "info"; title: string; time: string; link: string };

const STATUS_VI: Record<string, string> = {
  pending: "Chờ xác nhận", confirmed: "Đã xác nhận", shipping: "Đang giao", delivered: "Đã giao", cancelled: "Đã huỷ",
};

// Tổng hợp thông báo theo vai trò từ nguồn THẬT: tin nhắn, đơn hàng, phê duyệt.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });

  const role = user.role;
  const items: Notif[] = [];

  // 1) Tin nhắn chưa đọc (mọi vai trò)
  try {
    const convs = readJson<any[]>("conversations.json") || [];
    let unread: any[] = [];
    if (role === "customer") unread = convs.filter(c => c.userId === user.id && (c.unreadForUser || 0) > 0);
    else if (role === "admin") unread = convs.filter(c => c.peerType === "admin" && (c.unreadForPeer || 0) > 0);
    else if (role === "supplier") unread = convs.filter(c => c.peerType === "supplier" && (c.unreadForPeer || 0) > 0);
    else if (role === "affiliate") unread = convs.filter(c => c.peerType === "affiliate" && (c.unreadForPeer || 0) > 0);
    for (const c of unread) {
      items.push({
        id: `m-${c.id}`, type: "message",
        title: `Tin nhắn mới từ ${role === "customer" ? (c.peerName || "Hỗ trợ") : (c.userName || "Khách hàng")}`,
        time: c.updatedAt || c.createdAt || "",
        link: role === "customer" ? "/customer/orders" : role === "supplier" ? "/supplier/messages" : "/admin/messages",
      });
    }
  } catch {}

  // 2) Đơn hàng
  try {
    const orders = readJson<any[]>("orders.json") || [];
    if (role === "admin" || role === "supplier") {
      orders.filter(o => o.status === "pending")
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 15)
        .forEach(o => items.push({
          id: `o-${o.id}`, type: "order",
          title: `Đơn mới ${o.id} • ${(o.total || 0).toLocaleString("vi-VN")}đ`,
          time: o.createdAt || "", link: role === "admin" ? "/admin/orders" : "/supplier/orders",
        }));
    } else if (role === "customer") {
      orders.filter(o => o.userId === user.id)
        .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || "")).slice(0, 15)
        .forEach(o => items.push({
          id: `o-${o.id}`, type: "order",
          title: `Đơn ${o.id}: ${STATUS_VI[o.status] || o.status}`,
          time: o.updatedAt || o.createdAt || "", link: "/customer/orders",
        }));
    }
  } catch {}

  // 2b) Hoa hồng / rút tiền đang chờ (đại lý)
  if (role === "affiliate") {
    try {
      const payouts = readJson<any[]>("payouts.json") || [];
      payouts.filter(p => p.type === "affiliate" && p.status !== "PAID")
        .sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 15)
        .forEach(p => items.push({
          id: `p-${p.id}`, type: "info",
          title: `Hoa hồng chờ giải ngân: ${(p.amount || 0).toLocaleString("vi-VN")}đ`,
          time: p.date || "", link: "/affiliate/commissions",
        }));
    } catch {}
  }

  // 3) Phê duyệt đang chờ (admin)
  if (role === "admin") {
    try {
      const apps = readJson<any[]>("approvals.json") || [];
      apps.filter(a => a.status === "PENDING")
        .forEach(a => items.push({ id: `a-${a.id}`, type: "approval", title: `Chờ duyệt: ${a.name}`, time: a.createdAt || "", link: "/admin/approvals" }));
    } catch {}
    // 3b) Yêu cầu tạm ngưng cửa hàng từ NCC (admin tiếp nhận)
    try {
      const sr = readJson<any[]>("suspension-requests.json") || [];
      sr.filter(r => r.status === "PENDING")
        .forEach(r => items.push({ id: `sr-${r.id}`, type: "approval", title: `Yêu cầu tạm ngưng: ${r.shopName}`, time: r.createdAt || "", link: "/admin/suspensions" }));
    } catch {}
  }

  items.sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  return NextResponse.json({ items: items.slice(0, 30) }, { headers: { "Cache-Control": "no-store" } });
}

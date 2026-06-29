import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

const FILE = "conversations.json";

interface Message { from: "user" | "peer"; text: string; at: string }
interface Conversation {
  id: string;
  userId: string; userName: string; userEmail?: string;
  peerType: "admin" | "supplier";
  peerId: string; peerName: string;
  messages: Message[];
  unreadForUser: number; unreadForPeer: number;
  createdAt: string; updatedAt: string;
}

// "user" = khách hàng khởi tạo; "peer" = admin hoặc NCC trả lời.
function sideOf(role: string): "user" | "peer" {
  return role === "customer" ? "user" : "peer";
}

// GET — danh sách hội thoại liên quan tới người gọi (theo vai trò). Đồng thời đánh dấu ĐÃ ĐỌC cho phía gọi.
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const me = auth.user;
  const all = readJson<Conversation[]>(FILE) || [];

  let mine: Conversation[];
  if (me.role === "customer") mine = all.filter(c => c.userId === me.id);
  else if (me.role === "admin") mine = all.filter(c => c.peerType === "admin");
  else if (me.role === "supplier") mine = all.filter(c => c.peerType === "supplier");
  else mine = [];

  // đánh dấu đã đọc cho phía đang xem
  const side = sideOf(me.role);
  let changed = false;
  for (const c of all) {
    if (!mine.includes(c)) continue;
    if (side === "user" && c.unreadForUser > 0) { c.unreadForUser = 0; changed = true; }
    if (side === "peer" && c.unreadForPeer > 0) { c.unreadForPeer = 0; changed = true; }
  }
  if (changed) writeJson(FILE, all);

  mine.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return NextResponse.json(mine, { headers: { "Cache-Control": "no-store" } });
}

// POST — gửi tin nhắn. Body: { conversationId?, peerType?, peerId?, peerName?, text }
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const me = auth.user;
  const body = await req.json();
  const text = (body.text || "").toString().trim();
  if (!text) return NextResponse.json({ error: "Nội dung trống" }, { status: 400 });
  if (text.length > 2000) return NextResponse.json({ error: "Tin nhắn quá dài" }, { status: 400 });

  const all = readJson<Conversation[]>(FILE) || [];
  const now = new Date().toISOString();
  const side = sideOf(me.role);
  let conv: Conversation | undefined;

  if (body.conversationId) {
    conv = all.find(c => c.id === body.conversationId);
    if (!conv) return NextResponse.json({ error: "Không tìm thấy hội thoại" }, { status: 404 });
    // chỉ thành viên hội thoại mới gửi được
    const ok = side === "user" ? conv.userId === me.id
      : (me.role === "admin" ? conv.peerType === "admin" : conv.peerType === "supplier");
    if (!ok) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  } else {
    // khách hàng tạo hội thoại mới
    if (side !== "user") return NextResponse.json({ error: "Thiếu conversationId" }, { status: 400 });
    const peerType = body.peerType === "supplier" ? "supplier" : "admin";
    const peerId = peerType === "supplier" ? (body.peerId || "").toString() : "admin";
    const peerName = (body.peerName || (peerType === "supplier" ? "Nhà cung cấp" : "Hỗ trợ AutoParts")).toString();
    // gộp nếu đã có hội thoại với cùng peer
    conv = all.find(c => c.userId === me.id && c.peerType === peerType && c.peerId === peerId);
    if (!conv) {
      conv = {
        id: `c${Date.now()}`,
        userId: me.id, userName: me.name, userEmail: me.email,
        peerType, peerId, peerName,
        messages: [], unreadForUser: 0, unreadForPeer: 0,
        createdAt: now, updatedAt: now,
      };
      all.push(conv);
    }
  }

  conv.messages.push({ from: side, text, at: now });
  conv.updatedAt = now;
  if (side === "user") conv.unreadForPeer += 1; else conv.unreadForUser += 1;
  writeJson(FILE, all);
  return NextResponse.json(conv);
}

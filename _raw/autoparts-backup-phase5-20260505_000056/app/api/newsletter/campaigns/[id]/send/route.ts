import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

interface Subscriber {
  email: string;
  active: boolean;
}

interface Campaign {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "sent";
  recipients: string[];
  recipientCount: number;
  createdAt: string;
  sentAt?: string;
}

// "Send" a campaign — currently marks as sent and logs recipients.
// Real SMTP integration is a placeholder; integration via SendGrid/SMTP would
// hook in here.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const camps = readJson<Campaign[]>("newsletter-campaigns.json");
  const idx = camps.findIndex(c => c.id === id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (camps[idx].status === "sent") return NextResponse.json({ error: "Đã gửi rồi" }, { status: 400 });

  const subs = readJson<Subscriber[]>("newsletter.json").filter(s => s.active !== false);
  const recipientEmails = subs.map(s => s.email);

  // Placeholder for SMTP send. Real implementation:
  // for (const email of recipientEmails) await sendEmail(email, camp.subject, camp.body);
  console.log(`[NEWSLETTER] Sending campaign ${id} "${camps[idx].subject}" to ${recipientEmails.length} recipients`);

  camps[idx] = {
    ...camps[idx],
    status: "sent",
    recipients: recipientEmails,
    recipientCount: recipientEmails.length,
    sentAt: new Date().toISOString(),
  };
  writeJson("newsletter-campaigns.json", camps);

  return NextResponse.json({
    ok: true,
    campaign: camps[idx],
    note: "Email gửi giả lập — chưa tích hợp SMTP. Danh sách người nhận đã được lưu vào campaign.",
  });
}

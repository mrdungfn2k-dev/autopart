import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

const FILE = "newsletter.json";

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: string;
  active: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const source = String(body.source ?? "footer");
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    const subs = readJson<Subscriber[]>(FILE);
    if (subs.some(s => s.email === email)) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }
    subs.push({ email, source, subscribedAt: new Date().toISOString(), active: true });
    writeJson(FILE, subs);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(readJson<Subscriber[]>(FILE));
}

export async function DELETE(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const subs = readJson<Subscriber[]>(FILE).filter(s => s.email !== email);
  writeJson(FILE, subs);
  return NextResponse.json({ ok: true });
}

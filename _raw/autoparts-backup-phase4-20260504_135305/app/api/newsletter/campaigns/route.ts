import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

const FILE = "newsletter-campaigns.json";

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

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(readJson<Campaign[]>(FILE));
}

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const data = readJson<Campaign[]>(FILE);
  const item: Campaign = {
    id: nextId("camp"),
    subject: body.subject ?? "",
    body: body.body ?? "",
    status: "draft",
    recipients: [],
    recipientCount: 0,
    createdAt: new Date().toISOString(),
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const data = readJson<Campaign[]>(FILE).filter(c => c.id !== id);
  writeJson(FILE, data);
  return NextResponse.json({ ok: true });
}

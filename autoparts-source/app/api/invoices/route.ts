import { NextRequest, NextResponse } from "next/server";
import { readJson } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin", "supplier"]);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(readJson<any[]>("invoices.json"));
}

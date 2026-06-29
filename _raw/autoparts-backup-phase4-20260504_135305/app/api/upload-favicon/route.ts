import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";
import { writeJson, readJson } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("favicon") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const allowed = ["png", "ico", "svg", "jpg", "jpeg"];
    const safeExt = allowed.includes(ext) ? ext : "png";
    const filename = `favicon-custom.${safeExt}`;

    const fs = require("fs");
    const dir = join(process.cwd(), "public", "vipo-assets", "avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), buffer);

    const FILE = "settings.json";
    const current = readJson<Record<string, unknown>>(FILE) as Record<string, unknown>;
    const branding = (current.branding as Record<string, unknown>) ?? {};
    branding.faviconUrl = `/api/uploads/avatars/${filename}?v=${Date.now()}`;
    current.branding = branding;
    writeJson(FILE, current);

    return NextResponse.json({ ok: true, url: branding.faviconUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

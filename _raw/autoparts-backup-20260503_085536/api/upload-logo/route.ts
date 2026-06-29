import { NextRequest, NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";
import { writeJson, readJson } from "@/lib/fileStore";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Always save as PNG (already background-removed by client canvas)
    const filename = "autoparts-logo-custom.png";
    const destPath = join(process.cwd(), "public", "vipo-assets", "avatars", filename);

    // Make sure avatars directory exists
    const fs = require("fs");
    const avatarsDir = join(process.cwd(), "public", "vipo-assets", "avatars");
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    writeFileSync(destPath, buffer);

    // Persist the logo URL to settings so all components can read it
    const FILE = "settings.json";
    const current = readJson<Record<string, unknown>>(FILE) as Record<string, unknown>;
    const branding = (current.branding as Record<string, unknown>) ?? {};
    branding.logoUrl = `/api/uploads/avatars/${filename}?v=${Date.now()}`;
    current.branding = branding;
    writeJson(FILE, current);

    return NextResponse.json({ ok: true, url: branding.logoUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

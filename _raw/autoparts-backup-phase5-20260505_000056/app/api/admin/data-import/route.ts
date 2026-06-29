import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUP_DIR = path.join(process.cwd(), "data-backups");

// Full data restore — accepts JSON object from /api/admin/data-export.
// Creates a timestamped backup of current data before overwriting.
// Skips users.json by default unless _meta.includeUsers=true.
export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Body must be object" }, { status: 400 });
  if (!body._meta || body._meta.version !== "1.0") {
    return NextResponse.json({ error: "Missing or invalid _meta.version" }, { status: 400 });
  }

  const includeUsers = body._meta?.includeUsers === true;

  // Backup current data first
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupSubdir = path.join(BACKUP_DIR, stamp);
  fs.mkdirSync(backupSubdir);
  const existingFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
  for (const f of existingFiles) {
    fs.copyFileSync(path.join(DATA_DIR, f), path.join(backupSubdir, f));
  }

  // Write new data
  let written = 0;
  const skipped: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === "_meta") continue;
    if (key === "users" && !includeUsers) { skipped.push("users.json"); continue; }
    if (value === null || value === undefined) continue;
    try {
      fs.writeFileSync(path.join(DATA_DIR, `${key}.json`), JSON.stringify(value, null, 2), "utf-8");
      written++;
    } catch (e) {
      skipped.push(`${key}.json (error: ${e})`);
    }
  }

  return NextResponse.json({
    ok: true,
    written,
    skipped,
    backupAt: backupSubdir,
    note: "Backup của dữ liệu cũ đã được tạo. Liên hệ admin server để rollback nếu cần.",
  });
}

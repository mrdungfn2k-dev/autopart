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
  try { body = await req.json(); } catch { return NextResponse.json({ error: "File không phải JSON hợp lệ. Vui lòng chọn đúng file backup .json đã xuất từ nút 'Tải dữ liệu (JSON)'." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Nội dung file không đúng định dạng backup (phải là object chứa các bộ dữ liệu). Hãy dùng file xuất từ 'Tải dữ liệu (JSON)'." }, { status: 400 });
  }
  // Chấp nhận file backup CŨ không có _meta: chỉ cần có ít nhất 1 bộ dữ liệu quen thuộc
  const KNOWN_KEYS = ["products", "orders", "suppliers", "users", "vouchers", "banners", "settings", "categories", "conversations", "flash-sales", "newsletter", "reviews", "payouts"];
  const hasKnownData = Object.keys(body).some(k => KNOWN_KEYS.includes(k));
  if (!body._meta && !hasKnownData) {
    return NextResponse.json({ error: "File thiếu thông tin nhận dạng (_meta) và không chứa bộ dữ liệu nào quen thuộc. Vui lòng dùng đúng file backup xuất từ 'Tải dữ liệu (JSON)'." }, { status: 400 });
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

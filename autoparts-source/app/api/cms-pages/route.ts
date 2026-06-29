import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

const FILE = "cms-pages.json";

export interface CmsPage {
  id: string;
  title: string;
  slug: string;       // "/about" (trang gốc) hoặc "/p/<slug>" (trang tự thêm)
  content: string;    // HTML từ RichTextEditor
  custom?: boolean;   // true = trang tự thêm (được phép xóa)
  updatedAt?: string;
}

// GET — public: trả danh sách trang CMS (trang khách /p/[slug] cũng đọc từ đây)
export async function GET() {
  const pages = readJson<CmsPage[]>(FILE);
  return NextResponse.json(Array.isArray(pages) ? pages : [], { headers: { "Cache-Control": "no-store" } });
}

// PUT — admin: lưu TOÀN BỘ danh sách trang (thêm/sửa/xóa đều qua đây)
export async function PUT(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  if (!Array.isArray(body)) return NextResponse.json({ error: "Body phải là mảng trang" }, { status: 400 });
  const now = new Date().toISOString();
  const pages: CmsPage[] = body
    .filter((p: any) => p && typeof p.id === "string" && typeof p.title === "string")
    .map((p: any) => ({
      id: p.id, title: p.title.slice(0, 120), slug: (p.slug || "").slice(0, 160),
      content: typeof p.content === "string" ? p.content : "",
      custom: !!p.custom, updatedAt: now,
    }));
  writeJson(FILE, pages);
  return NextResponse.json({ ok: true, count: pages.length });
}

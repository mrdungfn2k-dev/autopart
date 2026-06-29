import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

const EXCLUDED = new Set(["users.json"]); // skip credential data by default

// Full data export — bundles all data/*.json files into one JSON object.
// Includes a version + timestamp for restore validation.
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const includeUsers = searchParams.get("includeUsers") === "1";

  const out: Record<string, unknown> = {
    _meta: {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      includeUsers,
    },
  };

  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    for (const f of files) {
      if (!includeUsers && EXCLUDED.has(f)) continue;
      try {
        const raw = fs.readFileSync(path.join(DATA_DIR, f), "utf-8");
        out[f.replace(/\.json$/, "")] = JSON.parse(raw);
      } catch {
        out[f.replace(/\.json$/, "")] = null;
      }
    }
  } catch (e) {
    return NextResponse.json({ error: "Cannot read data dir: " + String(e) }, { status: 500 });
  }

  const filename = `autoparts-data-export-${new Date().toISOString().split("T")[0]}.json`;
  return new NextResponse(JSON.stringify(out, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

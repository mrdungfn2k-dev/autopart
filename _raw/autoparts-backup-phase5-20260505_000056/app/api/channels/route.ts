import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

interface Channel {
  id: string;
  name: string;
  code: string;
  type: "web" | "marketplace" | "social" | "pos";
  active: boolean;
  url?: string;
  isDefault?: boolean;
  config?: Record<string, unknown>;
}

const SEED: Channel[] = [
  { id: "ch1", name: "Web AutoParts", code: "web", type: "web", active: true, url: "https://autopartsvietnam.com.vn", isDefault: true },
  { id: "ch2", name: "Shopee Mall", code: "shopee", type: "marketplace", active: false, url: "https://shopee.vn/autoparts" },
  { id: "ch3", name: "Tiki Trading", code: "tiki", type: "marketplace", active: false, url: "https://tiki.vn/cua-hang/autoparts" },
  { id: "ch4", name: "Lazada", code: "lazada", type: "marketplace", active: false },
  { id: "ch5", name: "Zalo OA", code: "zalo", type: "social", active: false },
  { id: "ch6", name: "Facebook Shop", code: "facebook", type: "social", active: false },
  { id: "ch7", name: "Cửa hàng vật lý", code: "pos", type: "pos", active: false },
];

function ensureSeeded(): Channel[] {
  let data = readJson<Channel[]>("channels.json");
  if (data.length === 0) { writeJson("channels.json", SEED); return SEED; }
  return data;
}

export async function GET() { return NextResponse.json(ensureSeeded()); }

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const data = ensureSeeded();
  const item: Channel = {
    id: nextId("ch"),
    name: body.name ?? "",
    code: (body.code ?? "").toLowerCase(),
    type: ["web", "marketplace", "social", "pos"].includes(body.type) ? body.type : "web",
    active: body.active !== false,
    url: body.url ?? "",
    isDefault: body.isDefault === true,
    config: body.config ?? {},
  };
  if (item.isDefault) data.forEach(c => { c.isDefault = false; });
  data.push(item);
  writeJson("channels.json", data);
  return NextResponse.json(item, { status: 201 });
}

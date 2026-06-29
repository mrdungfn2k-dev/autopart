import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import type { FlashSale } from "@/lib/api";

const FILE = "flash-sales.json";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let data = readJson<FlashSale[]>(FILE);
  if (searchParams.get("active") === "true") {
    const now = new Date();
    data = data.filter(fs => fs.active && new Date(fs.startTime) <= now && new Date(fs.endTime) >= now);
  }

  // Enrich product snapshots with nameZh/brandZh from products.json
  const allProducts = readJson<any[]>("products.json");
  const productMap = new Map(allProducts.map(p => [p.id, p]));
  data = data.map(fs => ({
    ...fs,
    products: (fs.products ?? []).map((p: any) => {
      const full = productMap.get(p.id);
      if (!full) return p;
      return { ...p, nameZh: full.nameZh ?? p.nameZh, brandZh: full.brandZh ?? p.brandZh };
    }),
  }));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Auto-translate campaign name to Chinese
  let nameZh = body.nameZh ?? "";
  if (!nameZh && body.name) {
    try {
      const base = req.url.split("/api/")[0];
      const res = await fetch(`${base}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body.name }),
      });
      if (res.ok) {
        const { result } = await res.json();
        nameZh = result ?? "";
      }
    } catch { /* ignore, graceful fallback */ }
  }

  const data = readJson<FlashSale[]>(FILE);
  const item: FlashSale & { nameZh?: string } = {
    id: nextId("fs"),
    name: body.name ?? "Flash Sale",
    nameZh: nameZh || undefined,
    discount: Number(body.discount) || 0,
    startTime: body.startTime ?? new Date().toISOString(),
    endTime: body.endTime ?? new Date().toISOString(),
    active: body.active ?? true,
    products: body.products ?? [],
  };
  data.push(item);
  writeJson(FILE, data);
  return NextResponse.json(item, { status: 201 });
}

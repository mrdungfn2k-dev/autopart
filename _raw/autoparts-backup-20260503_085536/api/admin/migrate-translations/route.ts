import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { products as seedProducts } from "@/lib/data";

// Migration: patch products.json AND flash-sales.json with nameZh/descZh
// Safe to call multiple times — only updates missing fields
export async function GET(req: NextRequest) {
  const seedMap = new Map(seedProducts.map(p => [p.id, p]));
  const base = req.url.split("/api/")[0];

  async function translateText(text: string): Promise<string> {
    try {
      const res = await fetch(`${base}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return "";
      const { result } = await res.json();
      return result ?? "";
    } catch { return ""; }
  }

  // 1. Patch products.json
  const stored = readJson<any[]>("products.json");
  let patchedProducts = 0;
  const updatedProducts = stored.map(p => {
    const seed = seedMap.get(p.id) as any;
    if (!seed) return p;
    let changed = false;
    if (!p.nameZh && seed.nameZh)                { p.nameZh = seed.nameZh;             changed = true; }
    if (!p.brandZh && seed.brandZh)              { p.brandZh = seed.brandZh;           changed = true; }
    if (!p.descriptionZh && seed.descZh)         { p.descriptionZh = seed.descZh;      changed = true; }
    if (!p.categoryNameZh && seed.categoryNameZh){ p.categoryNameZh = seed.categoryNameZh; changed = true; }
    if (!p.sold && seed.sold)                    { p.sold = seed.sold;                  changed = true; }
    if (!p.description && seed.description)      { p.description = seed.description;   changed = true; }
    if (changed) patchedProducts++;
    return p;
  });
  writeJson("products.json", updatedProducts);

  // 2. Patch flash-sales.json — campaign nameZh AND product nameZh
  const flashSales = readJson<any[]>("flash-sales.json");
  let patchedCampaigns = 0;
  let patchedFlashProducts = 0;

  for (const fs of flashSales) {
    // Translate campaign name if missing
    if (!fs.nameZh && fs.name) {
      fs.nameZh = await translateText(fs.name);
      if (fs.nameZh) patchedCampaigns++;
    }
    // Patch product snapshots with nameZh/brandZh
    if (!Array.isArray(fs.products)) continue;
    fs.products.forEach((p: any, i: number) => {
      const src = updatedProducts.find(up => up.id === p.id) || (seedMap.get(p.id) as any);
      if (!src) return;
      let changed = false;
      if (!p.nameZh && src.nameZh)   { fs.products[i].nameZh = src.nameZh;   changed = true; }
      if (!p.brandZh && src.brandZh) { fs.products[i].brandZh = src.brandZh; changed = true; }
      if (changed) patchedFlashProducts++;
    });
  }
  writeJson("flash-sales.json", flashSales);

  return NextResponse.json({
    ok: true,
    products: { total: stored.length, patched: patchedProducts },
    flashSales: { campaigns: flashSales.length, patchedCampaigns, patchedFlashProducts },
  });
}

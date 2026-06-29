import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import type { Product } from "@/lib/api";

const FILE = "products.json";

async function autoTranslate(req: NextRequest, fields: { name?: string; brand?: string; description?: string }) {
  const texts = [fields.name, fields.brand, fields.description].filter(Boolean) as string[];
  if (texts.length === 0) return {};
  try {
    const base = req.url.split("/api/")[0];
    const res = await fetch(`${base}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: texts }),
    });
    if (!res.ok) return {};
    const { results } = await res.json();
    if (!Array.isArray(results)) return {};
    let i = 0;
    return {
      nameZh:        fields.name        ? results[i++] : undefined,
      brandZh:       fields.brand       ? results[i++] : undefined,
      descriptionZh: fields.description ? results[i++] : undefined,
    };
  } catch { return {}; }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data = readJson<Product[]>(FILE);
  const idx = data.findIndex(p => p.id === id);
  if (idx < 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Only re-translate if the text fields changed
  const curr = data[idx] as any;
  const nameChanged = body.name && body.name !== curr.name;
  const brandChanged = body.brand && body.brand !== curr.brand;
  const descChanged = body.description && body.description !== curr.description;

  let translations: Record<string, string | undefined> = {};
  if (nameChanged || brandChanged || descChanged) {
    translations = await autoTranslate(req, {
      name: nameChanged ? body.name : undefined,
      brand: brandChanged ? body.brand : undefined,
      description: descChanged ? body.description : undefined,
    });
  }

  data[idx] = { ...data[idx], ...body, ...translations, id };
  writeJson(FILE, data);
  return NextResponse.json(data[idx]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = readJson<Product[]>(FILE);
  const idx = data.findIndex(p => p.id === id);
  if (idx >= 0) { (data[idx] as any).active = false; writeJson(FILE, data); }
  return NextResponse.json({ ok: true });
}

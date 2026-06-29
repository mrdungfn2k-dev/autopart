import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { requireRole } from "@/lib/jwt";

interface Synonym {
  id: string;
  term: string;
  synonyms: string[];
  active: boolean;
}

const SEED: Synonym[] = [
  { id: "syn1", term: "lọc dầu", synonyms: ["loc dau", "lọc nhớt", "oil filter"], active: true },
  { id: "syn2", term: "má phanh", synonyms: ["ma phanh", "brake pad", "phanh đĩa"], active: true },
  { id: "syn3", term: "bugi", synonyms: ["bu gi", "spark plug", "bougie"], active: true },
  { id: "syn4", term: "ắc quy", synonyms: ["ac quy", "battery", "bình điện"], active: true },
];

function ensureSeeded(): Synonym[] {
  let data = readJson<Synonym[]>("search-synonyms.json");
  if (data.length === 0) { writeJson("search-synonyms.json", SEED); return SEED; }
  return data;
}

export async function GET() { return NextResponse.json(ensureSeeded()); }

export async function POST(req: NextRequest) {
  const auth = requireRole(req, ["admin"]);
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const data = ensureSeeded();
  const item: Synonym = {
    id: nextId("syn"),
    term: (body.term ?? "").toLowerCase().trim(),
    synonyms: Array.isArray(body.synonyms) ? body.synonyms.map((s: string) => s.toLowerCase().trim()).filter(Boolean) : [],
    active: body.active !== false,
  };
  if (!item.term) return NextResponse.json({ error: "term required" }, { status: 400 });
  data.push(item);
  writeJson("search-synonyms.json", data);
  return NextResponse.json(item, { status: 201 });
}

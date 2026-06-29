import { NextRequest, NextResponse } from "next/server";

// Free Google Translate endpoint (no API key required, rate-limited)
// Returns translated text for small amounts of content
async function googleTranslate(text: string, from: string, to: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // Response: [[["translated","original",null,null,1]],...]
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map((seg: any[]) => seg[0] ?? "").join("");
  }
  throw new Error("Unexpected translate response");
}

export async function POST(req: NextRequest) {
  try {
    const { text, from = "vi", to = "zh-CN" } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }
    // Translate single string or array of strings
    if (Array.isArray(text)) {
      const results = await Promise.all(text.map((t: string) => googleTranslate(t, from, to)));
      return NextResponse.json({ results });
    }
    const result = await googleTranslate(text, from, to);
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

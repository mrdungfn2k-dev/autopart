import { NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

const FILE = "exchange-rates.json";
// Tỉ giá VND cho 1 đơn vị ngoại tệ (fallback nếu API lỗi)
const FALLBACK = { VND: 1, USD: 25400, CNY: 3500 };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Tự động cập nhật tỉ giá thật theo ngày (cache 1 lần/ngày trong exchange-rates.json)
export async function GET() {
  const today = todayStr();
  const cached = readJson<{ date?: string; rates?: typeof FALLBACK } | null>(FILE, null);

  if (cached && cached.date === today && cached.rates) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    // open.er-api.com: miễn phí, không cần key, base = VND
    const r = await fetch("https://open.er-api.com/v6/latest/VND", { cache: "no-store" });
    const d = await r.json();
    if (d && d.result === "success" && d.rates && d.rates.USD && d.rates.CNY) {
      const rates = {
        VND: 1,
        USD: Math.round(1 / d.rates.USD),                 // VND cho 1 USD
        CNY: Math.round((1 / d.rates.CNY) * 100) / 100,   // VND cho 1 CNY
      };
      const out = { date: today, base: "VND", rates, updated: d.time_last_update_utc || today, source: "open.er-api.com" };
      writeJson(FILE, out);
      return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
    }
  } catch {
    /* rơi xuống fallback bên dưới */
  }

  // API lỗi → dùng cache cũ (dù hết hạn) hoặc fallback cứng
  const out = cached?.rates
    ? { ...cached, stale: true }
    : { date: today, base: "VND", rates: FALLBACK, source: "fallback" };
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}

import { NextResponse } from "next/server";
import { decodeVinLocal } from "@/lib/vinDecode";

export async function GET(req: Request, { params }: { params: Promise<{ vin: string }> }) {
  const { vin: rawVin } = await params;
  const vin = (rawVin || "").toUpperCase();
  const lang = new URL(req.url).searchParams.get("lang") || "vi";

  if (vin.length !== 17) {
    return NextResponse.json({ error: "Invalid VIN" }, { status: 400 });
  }

  // Always compute a deterministic offline decode first (year/region/manufacturer).
  // This guarantees a valid 17-char VIN never dead-ends even if NHTSA is unreachable.
  const local = decodeVinLocal(vin, lang);

  // Try to enrich with the NHTSA open API (proxy). Time-boxed so a slow/blocked
  // network can't hang the request — we just fall back to the local decode.
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    const data = await res.json();

    if (data && Array.isArray(data.Results)) {
      let make = "", model = "", year = 0, engine = "", trim = "";
      for (const item of data.Results) {
        const v = item?.Variable || "";
        const val = item?.Value;
        if (v === "Make") make = val || "";
        else if (v === "Model") model = val || "";
        else if (v === "Model Year") year = parseInt(val) || 0;
        else if (v === "Engine Model") engine = val || engine;
        else if (v.includes("Trim") || v === "Series") trim = val || trim;
      }
      if (make) {
        return NextResponse.json({
          make,
          model: model || local.model,
          year: year || local.year,
          engine: engine && engine !== "null" ? engine : local.engine,
          trim: trim && trim !== "null" ? trim : local.trim,
          country: local.country,
          plant: local.plant,
          source: "nhtsa",
        });
      }
    }
  } catch {
    // NHTSA unreachable / timed out / bad payload — fall through to local decode.
  }

  // Local fallback. make may be empty if the WMI isn't in our table; the page
  // still shows year + region + suggested parts, so the VIN never dead-ends.
  return NextResponse.json({ ...local, source: "local" });
}

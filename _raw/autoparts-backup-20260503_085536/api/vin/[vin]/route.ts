import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { vin: string } }) {
  try {
    const vin = params.vin.toUpperCase();
    if (vin.length !== 17) {
      return NextResponse.json({ error: "Invalid VIN" }, { status: 400 });
    }

    // Call the NHTSA open API as a proxy
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    const data = await res.json();

    if (!data.Results) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let make = "";
    let model = "";
    let year = 0;
    let engine = "";
    let trim = "";

    // Parse the obscure NHTSA array format
    for (const item of data.Results) {
      if (item.Variable === "Make") make = item.Value || "";
      if (item.Variable === "Model") model = item.Value || "";
      if (item.Variable === "Model Year") year = parseInt(item.Value) || 0;
      if (item.Variable === "Engine Model") engine = item.Value || engine;
      if (item.Variable.includes("Trim") || item.Variable === "Series") trim = item.Value || trim;
    }

    if (!make) {
      return NextResponse.json({ error: "No vehicle matched" }, { status: 404 });
    }

    // Default fallbacks for engine/trim if API doesn't provide them thoroughly
    if (!engine || engine === "null") engine = "Standard Engine";
    if (!trim || trim === "null") trim = "Base";

    return NextResponse.json({ make, model, year, engine, trim });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

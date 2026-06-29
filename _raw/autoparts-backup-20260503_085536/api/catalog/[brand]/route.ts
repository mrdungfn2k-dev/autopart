import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Scrape catcar.info catalog pages to extract model/series data
// This acts as a white-label proxy - no catcar branding reaches the frontend

async function scrapeCatcarModels(slug: string): Promise<any[]> {
  try {
    const url = `https://www.catcar.info/${slug}/?lang=en`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });
    
    if (!res.ok) return [];
    
    const html = await res.text();
    const models: any[] = [];
    
    // Parse region/market links
    const regionNames = ["Europe", "Japan", "Middle East", "USA", "General", "Asia", "Africa", "Oceania"];
    for (const rn of regionNames) {
      if (html.includes(`>${rn}<`)) {
        models.push({ name: rn, type: "region" });
      }
    }

    // Parse model/series links - look for <a> with encoded l= parameter (catalog navigation)
    const linkRegex = /<a[^>]*href="(https?:\/\/[^"]*catcar\.info[^"]*l=[^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/gi;
    let match;
    const seen = new Set<string>();
    const skipWords = ['Connect', 'CatCar', 'Русский', 'English', 'CATCAR', 'Read more', 'Do you sell', 'catcar.info', '2026 CATCAR', '2025 CATCAR'];
    while ((match = linkRegex.exec(html)) !== null) {
      const name = match[2].trim();
      if (name && name.length > 1 && name.length < 60 && 
          !skipWords.some(w => name.includes(w)) &&
          !seen.has(name)) {
        seen.add(name);
        models.push({ name, type: "model" });
      }
    }

    return models;
  } catch (error) {
    console.error("Scrape error:", error);
    return [];
  }
}
// Fallback data for ALL brands - instant response, no scraping delay
const fallbackModels: Record<string, any[]> = {
  bmw: [
    { name: "BMW Series 1", type: "model" }, { name: "BMW Series 3", type: "model" },
    { name: "BMW Series 5", type: "model" }, { name: "BMW Series 7", type: "model" },
    { name: "BMW X1", type: "model" }, { name: "BMW X3", type: "model" },
    { name: "BMW X5", type: "model" }, { name: "BMW X7", type: "model" },
    { name: "BMW i4", type: "model" }, { name: "BMW iX", type: "model" },
    { name: "BMW M3", type: "model" }, { name: "BMW M5", type: "model" },
  ],
  "rolls-royce": [
    { name: "Rolls-Royce Ghost", type: "model" }, { name: "Rolls-Royce Phantom", type: "model" },
    { name: "Rolls-Royce Wraith", type: "model" }, { name: "Rolls-Royce Dawn", type: "model" },
    { name: "Rolls-Royce Cullinan", type: "model" }, { name: "Rolls-Royce Spectre", type: "model" },
  ],
  mini: [
    { name: "Mini Cooper", type: "model" }, { name: "Mini Countryman", type: "model" },
    { name: "Mini Clubman", type: "model" }, { name: "Mini Cabrio", type: "model" },
  ],
  audi: [
    { name: "Audi A3", type: "model" }, { name: "Audi A4", type: "model" },
    { name: "Audi A5", type: "model" }, { name: "Audi A6", type: "model" },
    { name: "Audi A7", type: "model" }, { name: "Audi A8", type: "model" },
    { name: "Audi Q3", type: "model" }, { name: "Audi Q5", type: "model" },
    { name: "Audi Q7", type: "model" }, { name: "Audi Q8", type: "model" },
    { name: "Audi TT", type: "model" }, { name: "Audi R8", type: "model" },
    { name: "Audi e-tron", type: "model" },
  ],
  volkswagen: [
    { name: "VW Golf", type: "model" }, { name: "VW Passat", type: "model" },
    { name: "VW Tiguan", type: "model" }, { name: "VW Polo", type: "model" },
    { name: "VW Touareg", type: "model" }, { name: "VW T-Roc", type: "model" },
    { name: "VW Arteon", type: "model" }, { name: "VW ID.4", type: "model" },
  ],
  toyota: [
    { name: "Toyota Camry", type: "model" }, { name: "Toyota Corolla", type: "model" },
    { name: "Toyota RAV4", type: "model" }, { name: "Toyota Land Cruiser", type: "model" },
    { name: "Toyota Hilux", type: "model" }, { name: "Toyota Fortuner", type: "model" },
    { name: "Toyota Vios", type: "model" }, { name: "Toyota Innova", type: "model" },
    { name: "Toyota Yaris", type: "model" }, { name: "Toyota Prius", type: "model" },
    { name: "Toyota Supra", type: "model" }, { name: "Toyota Avalon", type: "model" },
  ],
  lexus: [
    { name: "Lexus ES", type: "model" }, { name: "Lexus IS", type: "model" },
    { name: "Lexus LS", type: "model" }, { name: "Lexus GS", type: "model" },
    { name: "Lexus NX", type: "model" }, { name: "Lexus RX", type: "model" },
    { name: "Lexus UX", type: "model" }, { name: "Lexus GX", type: "model" },
    { name: "Lexus LX", type: "model" }, { name: "Lexus LC", type: "model" },
    { name: "Lexus RC", type: "model" },
  ],
  honda: [
    { name: "Honda Civic", type: "model" }, { name: "Honda Accord", type: "model" },
    { name: "Honda CR-V", type: "model" }, { name: "Honda HR-V", type: "model" },
    { name: "Honda City", type: "model" }, { name: "Honda Jazz/Fit", type: "model" },
    { name: "Honda Pilot", type: "model" }, { name: "Honda Odyssey", type: "model" },
  ],
  nissan: [
    { name: "Nissan X-Trail", type: "model" }, { name: "Nissan Navara", type: "model" },
    { name: "Nissan Kicks", type: "model" }, { name: "Nissan Almera", type: "model" },
    { name: "Nissan Terra", type: "model" }, { name: "Nissan GT-R", type: "model" },
    { name: "Nissan Patrol", type: "model" }, { name: "Nissan Qashqai", type: "model" },
  ],
  infiniti: [
    { name: "Infiniti Q50", type: "model" }, { name: "Infiniti Q60", type: "model" },
    { name: "Infiniti QX50", type: "model" }, { name: "Infiniti QX55", type: "model" },
    { name: "Infiniti QX60", type: "model" }, { name: "Infiniti QX80", type: "model" },
  ],
  mazda: [
    { name: "Mazda 2", type: "model" }, { name: "Mazda 3", type: "model" },
    { name: "Mazda 6", type: "model" }, { name: "Mazda CX-3", type: "model" },
    { name: "Mazda CX-5", type: "model" }, { name: "Mazda CX-8", type: "model" },
    { name: "Mazda CX-30", type: "model" }, { name: "Mazda BT-50", type: "model" },
    { name: "Mazda MX-5", type: "model" },
  ],
  mitsubishi: [
    { name: "Mitsubishi Xpander", type: "model" }, { name: "Mitsubishi Outlander", type: "model" },
    { name: "Mitsubishi Pajero", type: "model" }, { name: "Mitsubishi Triton", type: "model" },
    { name: "Mitsubishi Attrage", type: "model" }, { name: "Mitsubishi Eclipse Cross", type: "model" },
  ],
  suzuki: [
    { name: "Suzuki Swift", type: "model" }, { name: "Suzuki Vitara", type: "model" },
    { name: "Suzuki Jimny", type: "model" }, { name: "Suzuki Ertiga", type: "model" },
    { name: "Suzuki XL7", type: "model" }, { name: "Suzuki Ciaz", type: "model" },
    { name: "Suzuki Carry", type: "model" },
  ],
  subaru: [
    { name: "Subaru Forester", type: "model" }, { name: "Subaru Outback", type: "model" },
    { name: "Subaru XV/Crosstrek", type: "model" }, { name: "Subaru WRX", type: "model" },
    { name: "Subaru BRZ", type: "model" }, { name: "Subaru Impreza", type: "model" },
    { name: "Subaru Legacy", type: "model" },
  ],
  isuzu: [
    { name: "Isuzu D-Max", type: "model" }, { name: "Isuzu MU-X", type: "model" },
    { name: "Isuzu NPR", type: "model" }, { name: "Isuzu NQR", type: "model" },
    { name: "Isuzu FRR", type: "model" }, { name: "Isuzu Giga", type: "model" },
  ],
  hyundai: [
    { name: "Hyundai Accent", type: "model" }, { name: "Hyundai Tucson", type: "model" },
    { name: "Hyundai Santa Fe", type: "model" }, { name: "Hyundai Elantra", type: "model" },
    { name: "Hyundai Sonata", type: "model" }, { name: "Hyundai Kona", type: "model" },
    { name: "Hyundai Creta", type: "model" }, { name: "Hyundai i10", type: "model" },
    { name: "Hyundai Stargazer", type: "model" }, { name: "Hyundai Palisade", type: "model" },
  ],
  kia: [
    { name: "Kia Morning", type: "model" }, { name: "Kia Seltos", type: "model" },
    { name: "Kia Sportage", type: "model" }, { name: "Kia Sorento", type: "model" },
    { name: "Kia Cerato/K3", type: "model" }, { name: "Kia Carnival", type: "model" },
    { name: "Kia K5", type: "model" }, { name: "Kia EV6", type: "model" },
  ],
  ssangyong: [
    { name: "SsangYong Rexton", type: "model" }, { name: "SsangYong Tivoli", type: "model" },
    { name: "SsangYong Korando", type: "model" }, { name: "SsangYong Musso", type: "model" },
    { name: "SsangYong Torres", type: "model" },
  ],
  mercedes: [
    { name: "C-Class", type: "model" }, { name: "E-Class", type: "model" },
    { name: "S-Class", type: "model" }, { name: "GLC", type: "model" },
    { name: "GLE", type: "model" }, { name: "GLS", type: "model" },
    { name: "A-Class", type: "model" }, { name: "CLA", type: "model" },
    { name: "AMG GT", type: "model" }, { name: "EQS", type: "model" },
    { name: "GLA", type: "model" }, { name: "GLB", type: "model" },
  ],
  smart: [
    { name: "Smart ForTwo", type: "model" }, { name: "Smart ForFour", type: "model" },
    { name: "Smart #1", type: "model" }, { name: "Smart #3", type: "model" },
  ],
  ford: [
    { name: "Ford Ranger", type: "model" }, { name: "Ford Everest", type: "model" },
    { name: "Ford Transit", type: "model" }, { name: "Ford Explorer", type: "model" },
    { name: "Ford EcoSport", type: "model" }, { name: "Ford Territory", type: "model" },
    { name: "Ford Mustang", type: "model" }, { name: "Ford Focus", type: "model" },
  ],
  skoda: [
    { name: "Skoda Octavia", type: "model" }, { name: "Skoda Superb", type: "model" },
    { name: "Skoda Kodiaq", type: "model" }, { name: "Skoda Karoq", type: "model" },
    { name: "Skoda Kamiq", type: "model" }, { name: "Skoda Fabia", type: "model" },
    { name: "Skoda Enyaq", type: "model" },
  ],
  seat: [
    { name: "Seat Leon", type: "model" }, { name: "Seat Ibiza", type: "model" },
    { name: "Seat Ateca", type: "model" }, { name: "Seat Arona", type: "model" },
    { name: "Seat Tarraco", type: "model" },
  ],
  renault: [
    { name: "Renault Clio", type: "model" }, { name: "Renault Megane", type: "model" },
    { name: "Renault Captur", type: "model" }, { name: "Renault Kadjar", type: "model" },
    { name: "Renault Koleos", type: "model" }, { name: "Renault Duster", type: "model" },
    { name: "Renault Scenic", type: "model" },
  ],
  dacia: [
    { name: "Dacia Duster", type: "model" }, { name: "Dacia Sandero", type: "model" },
    { name: "Dacia Logan", type: "model" }, { name: "Dacia Jogger", type: "model" },
    { name: "Dacia Spring", type: "model" },
  ],
  peugeot: [
    { name: "Peugeot 208", type: "model" }, { name: "Peugeot 308", type: "model" },
    { name: "Peugeot 508", type: "model" }, { name: "Peugeot 2008", type: "model" },
    { name: "Peugeot 3008", type: "model" }, { name: "Peugeot 5008", type: "model" },
    { name: "Peugeot Traveller", type: "model" },
  ],
  opel: [
    { name: "Opel Corsa", type: "model" }, { name: "Opel Astra", type: "model" },
    { name: "Opel Insignia", type: "model" }, { name: "Opel Mokka", type: "model" },
    { name: "Opel Grandland", type: "model" }, { name: "Opel Crossland", type: "model" },
  ],
  citroen: [
    { name: "Citroën C3", type: "model" }, { name: "Citroën C4", type: "model" },
    { name: "Citroën C5 Aircross", type: "model" }, { name: "Citroën Berlingo", type: "model" },
    { name: "Citroën SpaceTourer", type: "model" },
  ],
  volvo: [
    { name: "Volvo XC40", type: "model" }, { name: "Volvo XC60", type: "model" },
    { name: "Volvo XC90", type: "model" }, { name: "Volvo S60", type: "model" },
    { name: "Volvo S90", type: "model" }, { name: "Volvo V60", type: "model" },
    { name: "Volvo V90", type: "model" }, { name: "Volvo EX30", type: "model" },
  ],
  jaguar: [
    { name: "Jaguar F-Pace", type: "model" }, { name: "Jaguar E-Pace", type: "model" },
    { name: "Jaguar I-Pace", type: "model" }, { name: "Jaguar XE", type: "model" },
    { name: "Jaguar XF", type: "model" }, { name: "Jaguar F-Type", type: "model" },
  ],
  chrysler: [
    { name: "Chrysler 300", type: "model" }, { name: "Chrysler Pacifica", type: "model" },
    { name: "Chrysler Voyager", type: "model" },
  ],
};

export async function GET(req: Request, context: { params: Promise<{ brand: string }> }) {
  try {
    const { brand: rawBrand } = await context.params;
    const brand = rawBrand.toLowerCase();
    
    const filePath = path.join(process.cwd(), "data", "brands-catalog.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const catalogData = JSON.parse(raw);
    
    const brandInfo = catalogData.brands.find((b: any) => b.id === brand);
    if (!brandInfo) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Always prefer curated fallback data (real car model names)
    // Scraping is only used for brands without fallback data
    let models: any[] = [];
    
    if (fallbackModels[brand]) {
      // Use curated data - always has real model names
      models = fallbackModels[brand];
    } else {
      // Fallback to live scraping for brands we haven't curated
      models = await scrapeCatcarModels(brandInfo.slug);
    }

    return NextResponse.json({
      brand: brandInfo.name,
      brandId: brandInfo.id,
      region: brandInfo.region,
      models,
    });
  } catch (error) {
    console.error("Catalog API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

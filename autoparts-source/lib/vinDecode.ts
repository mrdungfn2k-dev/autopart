// Offline VIN decoder — deterministic basics that need no external API.
// Position 10 → model year, position 1 → region/country, positions 1-3 (WMI) → manufacturer.
// Used as a resilient fallback when the NHTSA proxy is unreachable, so a valid
// 17-char VIN never dead-ends on the storefront.

export type VinLocal = {
  make: string;
  model: string;
  year: number;
  engine: string;
  trim: string;
  country: string;
  plant: string;
};

// Model-year letter/digit table (position 10). The 30-year cycle repeats, so the
// same code maps to e.g. 1990 or 2020 — we disambiguate with position 7 below.
const YEAR_CODES: Record<string, number> = {
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017,
  J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025,
  T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
  "1": 2001, "2": 2002, "3": 2003, "4": 2004, "5": 2005,
  "6": 2006, "7": 2007, "8": 2008, "9": 2009,
};

function decodeYear(vin: string): number {
  const c10 = vin[9];
  const base = YEAR_CODES[c10];
  if (!base) return 0;
  // Position 7: a letter means 2010+ era, a digit means the 1980–2009 era.
  const c7 = vin[6];
  const isOldEra = /[0-9]/.test(c7);
  if (isOldEra && base >= 2010) {
    const older = base - 30; // shift back one cycle (e.g. 2020 → 1990)
    return older >= 1980 ? older : base;
  }
  return base;
}

// Region/country from the first VIN character (WMI region block).
function decodeCountry(vin: string, lang: string): string {
  const c = vin[0].toUpperCase();
  const VI: Record<string, string> = {
    "1": "Hoa Kỳ", "4": "Hoa Kỳ", "5": "Hoa Kỳ", "2": "Canada", "3": "Mexico",
    J: "Nhật Bản", K: "Hàn Quốc", L: "Trung Quốc", M: "Ấn Độ / Thái Lan",
    R: "Châu Á (Đài Loan / Việt Nam)", S: "Anh / Châu Âu", V: "Pháp / Tây Ban Nha",
    W: "Đức", X: "Nga / Châu Âu", Y: "Bắc Âu", Z: "Ý", "6": "Úc", "9": "Brazil",
  };
  const ZH: Record<string, string> = {
    "1": "美国", "4": "美国", "5": "美国", "2": "加拿大", "3": "墨西哥",
    J: "日本", K: "韩国", L: "中国", M: "印度/泰国", R: "亚洲(台湾/越南)",
    S: "英国/欧洲", V: "法国/西班牙", W: "德国", X: "俄罗斯/欧洲", Y: "北欧",
    Z: "意大利", "6": "澳大利亚", "9": "巴西",
  };
  const map = lang === "zh" ? ZH : VI;
  return map[c] || (lang === "zh" ? "未知地区" : "Không xác định khu vực");
}

// Manufacturer from the WMI (first 3 chars). Focused on brands common in Vietnam.
const WMI_MAKES: Array<[RegExp, string]> = [
  [/^JT|^MHF|^MR0|^5TD|^2T|^4T/, "Toyota"],
  [/^1HG|^JHM|^19X|^2HG|^3HG|^5J6|^SHH/, "Honda"],
  [/^KMH|^KMF|^TMA/, "Hyundai"],
  [/^KNA|^KNB|^KND|^U5Y|^3KP/, "Kia"],
  [/^1FA|^1FT|^1FM|^WF0|^MAJ/, "Ford"],
  [/^JM[01]|^4F|^3MZ|^JMZ/, "Mazda"],
  [/^WDB|^WDD|^WDC|^W1K|^W1N/, "Mercedes-Benz"],
  [/^WBA|^WBS|^4US|^5UX/, "BMW"],
  [/^WVW|^WV1|^WV2|^3VW|^1VW/, "Volkswagen"],
  [/^JN|^1N4|^3N1|^5N1/, "Nissan"],
  [/^JM3|^JF[12]|^JF1/, "Subaru"],
  [/^1G[0-9]|^KL[0-9]|^2G1/, "Chevrolet / GM"],
  [/^MM[0-9]|^MMB|^JA3|^JA4/, "Mitsubishi"],
  [/^VF[1-9]|^RLM/, "VinFast / Renault"],
  [/^LVS|^LFV|^LGB|^LSV/, "Trung Quốc (BYD/Geely/SAIC)"],
];

function decodeMake(vin: string): string {
  const head = vin.slice(0, 3).toUpperCase();
  for (const [re, name] of WMI_MAKES) {
    if (re.test(head)) return name;
  }
  return "";
}

export function decodeVinLocal(vin: string, lang = "vi"): VinLocal {
  const v = vin.toUpperCase();
  const year = decodeYear(v);
  const make = decodeMake(v);
  const country = decodeCountry(v, lang);
  const plantChar = v[10] || "";
  return {
    make,
    model: lang === "zh" ? "按VIN" : "Theo VIN",
    year,
    engine: lang === "zh" ? "标准" : "Theo phiên bản",
    trim: lang === "zh" ? "标准" : "Tiêu chuẩn",
    country,
    plant: lang === "zh" ? `工厂代码 ${plantChar}` : `Mã nhà máy ${plantChar}`,
  };
}

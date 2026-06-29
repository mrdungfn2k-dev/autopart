import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export function readJson<T>(filename: string, defaultVal: unknown = []): T {
  const file = path.join(DATA_DIR, filename);
  if (!fs.existsSync(file)) return defaultVal as T;
  // Strip UTF-8 BOM (\uFEFF) that Windows tools sometimes prepend
  const raw = fs.readFileSync(file, "utf-8").replace(/^\uFEFF/, "");
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultVal as T;
  }
}

export function writeJson<T>(filename: string, data: T): void {
  const file = path.join(DATA_DIR, filename);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export function nextId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

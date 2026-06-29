"use client";
import { confirmDialog } from "@/components/ConfirmDialog";
import { useState, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useLang } from "@/lib/i18n";

const SAMPLE_CSV = `NAME,OEM_CODE,PART_BRAND,CATEGORY_ID,PRICE,PRICE_BEFORE_TAX,STOCK,WARRANTY_MONTH,SKU
"MÃ¡ phanh Toyota Camry",04465-06180,Toyota,brake-pad,350000,420000,50,12,MP-CAM-001
"Lá»c dáº§u Honda Civic",15400-RTA-004,Honda,oil-filter,85000,110000,120,6,LD-CIV-002
"Bugi NGK Vios",BKR6EKB-11,NGK,spark-plug,65000,80000,200,12,BG-VIO-003`;

// Quy Ä‘á»•i tÃªn cá»™t linh hoáº¡t: cháº¥p nháº­n CHá»® HOA / chá»¯ thÆ°á»ng / cÃ³ dáº¥u / tiáº¿ng Viá»‡t
const norm = (h: string) => h.trim().replace(/^["']|["']$/g, "").toLowerCase().normalize("NFD").replace(/[Ì€-Í¯]/g, "").replace(/[^a-z0-9]/g, "");
const HEADER_ALIAS: Record<string, string> = {
  name: "name", tensanpham: "name", ten: "name",
  sku: "sku",
  oemcode: "oemCode", oem: "oemCode", maoem: "oemCode",
  brand: "brand", partbrand: "brand", thuonghieu: "brand", hang: "brand",
  category: "category", categoryid: "category", danhmuc: "category",
  price: "price", gia: "price", giaban: "price",
  pricebeforetax: "originalPrice", originalprice: "originalPrice", giagoc: "originalPrice",
  type: "type", loai: "type", loaihang: "type",
  stock: "stock", tonkho: "stock", ton: "stock",
  warrantymonth: "warrantyMonth", baohanh: "warrantyMonth",
  description: "description", mota: "description",
};
// Map canonical -> tÃªn cá»™t thá»±c trong file (Ä‘á»ƒ láº¥y giÃ¡ trá»‹ theo nhiá»u Ä‘á»‹nh dáº¡ng header)
function buildHeaderMap(headers: string[]): Record<string, string> {
  const m: Record<string, string> = {};
  for (const h of headers) { const c = HEADER_ALIAS[norm(h)]; if (c && !m[c]) m[c] = h; }
  return m;
}

// TÃ¡ch 1 dÃ²ng CSV CÃ“ Xá»¬ LÃ dáº¥u ngoáº·c kÃ©p (tÃªn/mÃ´ táº£ chá»©a dáº¥u pháº©y khÃ´ng bá»‹ vá»¡ cá»™t)
function parseLine(line: string): string[] {
  const out: string[] = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r/g, "").trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const vals = parseLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

function exportCSV(rows: any[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminImportExportPage() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"import" | "export">("import");
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingExport, setLoadingExport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Báº¯t buá»™c tá»‘i thiá»ƒu: TÃŠN + GIÃ (cÃ¡c cá»™t khÃ¡c tá»± máº·c Ä‘á»‹nh). Sai Ä‘á»‹nh dáº¡ng -> KHÃ”NG cho import.
  const applyParsed = (text: string) => {
    const p = parseCSV(text);
    if (!p.headers.length || !p.rows.length) {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "File CSV khÃ´ng há»£p lá»‡ hoáº·c rá»—ng. HÃ£y táº£i file máº«u Ä‘á»ƒ xem Ä‘á»‹nh dáº¡ng chuáº©n.", type: "warning" } }));
      setParsed(null); return;
    }
    const hm = buildHeaderMap(p.headers);
    const REQUIRED: Record<string, string> = { name: "TÃªn (NAME)", price: "GiÃ¡ (PRICE)" };
    const missing = Object.keys(REQUIRED).filter(c => !hm[c]);
    if (missing.length > 0) {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: `File CSV sai Ä‘á»‹nh dáº¡ng â€” thiáº¿u cá»™t: ${missing.map(c => REQUIRED[c]).join(", ")}. Táº£i file máº«u Ä‘á»ƒ xem Ä‘á»‹nh dáº¡ng chuáº©n.`, type: "warning" } }));
      setParsed(null); return;
    }
    setParsed(p);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setCsvText(text);
      applyParsed(text);
      setImportDone(0);
      setImportErrors([]);
    };
    reader.readAsText(file, "utf-8");
  };

  const handlePaste = (text: string) => {
    setCsvText(text);
    applyParsed(text);
    setImportDone(0);
    setImportErrors([]);
  };

  const handleImport = async () => {
    if (!parsed || !parsed.rows.length || importing) return;
    setImporting(true);
    setImportDone(0);
    setImportErrors([]);
    setDuplicateAlert(null);
    const hm = buildHeaderMap(parsed.headers);
    const get = (row: Record<string, string>, c: string) => (hm[c] ? String(row[hm[c]] ?? "").trim() : "");
    let done = 0, skipped = 0;
    const errors: string[] = [];
    const skippedNames: string[] = [];
    // Láº¥y SP hiá»‡n cÃ³ Ä‘á»ƒ CHáº¶N nháº­p trÃ¹ng (theo mÃ£ OEM / SKU / tÃªn sáº£n pháº©m)
    const existingOem = new Set<string>(), existingName = new Set<string>(), existingSku = new Set<string>();
    try {
      const cur = await fetch("/api/products").then(r => r.json());
      if (Array.isArray(cur)) cur.forEach((p: any) => {
        if (p.oemCode) existingOem.add(String(p.oemCode).trim().toLowerCase());
        if (p.name) existingName.add(String(p.name).trim().toLowerCase());
        if (p.sku) existingSku.add(String(p.sku).trim().toLowerCase());
      });
    } catch {}
    for (const row of parsed.rows) {
      const name = get(row, "name");
      if (!name) { errors.push("(dÃ²ng thiáº¿u tÃªn â€” bá» qua)"); continue; }
      const oem = get(row, "oemCode").toLowerCase();
      const sku = get(row, "sku").toLowerCase();
      const nm = name.toLowerCase();
      if ((oem && existingOem.has(oem)) || (sku && existingSku.has(sku)) || existingName.has(nm)) {
        skipped++;
        skippedNames.push(name);
        continue;
      }
      try {
        const cat = get(row, "category") || "general";
        const op = get(row, "originalPrice");
        const wm = get(row, "warrantyMonth");
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            brand: get(row, "brand"),
            category: cat,
            categoryId: cat.toLowerCase().replace(/\s+/g, "-"),
            price: Number(get(row, "price")) || 0,
            originalPrice: op ? Number(op) : undefined,
            type: get(row, "type") || "Generic",
            oemCode: get(row, "oemCode"),
            sku: get(row, "sku") || undefined,
            stock: Number(get(row, "stock")) || 0,
            warrantyMonth: wm ? Number(wm) : undefined,
            description: get(row, "description"),
            image: cat.toLowerCase().replace(/\s+/g, "-"),
            active: true,
          }),
        });
        if (res.ok) { done++; if (oem) existingOem.add(oem); if (sku) existingSku.add(sku); existingName.add(nm); }
        else errors.push(`${name}: HTTP ${res.status}`);
      } catch (ex: any) {
        errors.push(`${name}: ${ex.message}`);
      }
    }
    setImportDone(done);
    setImportErrors(errors);
    setImporting(false);

    // Náº¿u cÃ³ sáº£n pháº©m má»›i Ä‘Æ°á»£c nháº­p -> toast thÃ nh cÃ´ng
    if (done > 0) {
      const msg = errors.length
        ? `âœ“ ÄÃ£ nháº­p ${done} sáº£n pháº©m Â· ${errors.length} lá»—i${skipped ? ` Â· bá» qua ${skipped} trÃ¹ng` : ""}`
        : `âœ“ Nháº­p thÃ nh cÃ´ng ${done} sáº£n pháº©m má»›i!${skipped ? ` (Bá» qua ${skipped} sáº£n pháº©m Ä‘Ã£ tá»“n táº¡i)` : ""}`;
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: msg, type: errors.length ? "warning" : "success" } }));
    }

    // Náº¿u Táº¤T Cáº¢ Ä‘á»u bá»‹ trÃ¹ng -> hiá»ƒn thá»‹ popup riÃªng
    if (skipped > 0 && done === 0 && errors.length === 0) {
      const preview = skippedNames.slice(0, 5).join(", ");
      setDuplicateAlert(`${skipped} sáº£n pháº©m trong file ÄÃƒ Tá»’N Táº I trong há»‡ thá»‘ng (trÃ¹ng tÃªn/OEM/SKU):\n${preview}${skippedNames.length > 5 ? ` ... vÃ  ${skippedNames.length - 5} sáº£n pháº©m khÃ¡c` : ""}`);
    } else if (skipped > 0 && done === 0) {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: `âš  KhÃ´ng nháº­p Ä‘Æ°á»£c sáº£n pháº©m nÃ o. ${skipped} trÃ¹ng, ${errors.length} lá»—i.`, type: "warning" } }));
    }
  };

  const handleLoadExport = async () => {
    setLoadingExport(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {}
    setLoadingExport(false);
  };

  const handleExportCSV = () => {
    const rows = products.map(p => ({
      NAME: p.name,
      OEM_CODE: p.oemCode ?? "",
      SKU: p.sku ?? "",
      PART_BRAND: p.brand ?? "",
      CATEGORY_ID: p.categoryId ?? "",
      PRICE: p.price,
      PRICE_BEFORE_TAX: p.originalPrice ?? "",
      STOCK: p.stock,
      WARRANTY_MONTH: p.warrantyMonth ?? "",
      TYPE: p.type ?? "",
      STATUS: p.active ? "active" : "hidden",
    }));
    exportCSV(rows, `autoparts_products_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="px-6 h-16 flex flex-col justify-center">
            <h1 className="text-xl font-bold text-[#44494d]">Nháº­p / Xuáº¥t dá»¯ liá»‡u</h1>
            <p className="text-xs text-[#8f9294]">Import bulk sáº£n pháº©m tá»« CSV hoáº·c xuáº¥t danh sÃ¡ch hiá»‡n táº¡i</p>
          </div>
        </div>
        <div className="p-6">{/* Tabs */}
          <div className="flex gap-1 ap-card bg-white rounded-2xl border border-[#f0f0f0] p-1 mb-6 w-fit">{(["import", "export"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? "text-white shadow-sm" : "text-[#8f9294] hover:text-[#44494d]"}`}
                style={tab === t ? { background: "var(--ap-primary)" } : {}}>{t === "import" ? "Nháº­p sáº£n pháº©m" : "Xuáº¥t sáº£n pháº©m"}
              </button>))}
          </div>{tab === "import" && (
            <div className="space-y-5">{/* Template download */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a4b97" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#44494d] text-sm mb-1">File máº«u CSV</p>
                  <p className="text-xs text-[#8f9294] mb-3">Táº£i file máº«u Ä‘á»ƒ biáº¿t Ä‘á»‹nh dáº¡ng chuáº©n. <b>Báº¯t buá»™c tá»‘i thiá»ƒu: NAME + PRICE</b>. Há»— trá»£ cá»™t: NAME, OEM_CODE, SKU, PART_BRAND, CATEGORY_ID, PRICE, PRICE_BEFORE_TAX, STOCK, WARRANTY_MONTH (cháº¥p nháº­n cáº£ chá»¯ thÆ°á»ng).</p>
                  <button onClick={() => exportCSV(
                    SAMPLE_CSV.trim().split("\n").slice(1).map(line => {
                      const headers = SAMPLE_CSV.split("\n")[0].split(",");
                      const vals = line.split(",");
                      const obj: Record<string, string> = {};
                      headers.forEach((h, i) => { obj[h.trim()] = vals[i]?.trim() ?? ""; });
                      return obj;
                    }), "autoparts_import_template.csv"
                  )}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#1a4b97] border-2 border-[#1a4b97] hover:bg-blue-100 transition-colors">Táº£i file máº«u
                  </button>
                </div>
              </div>{/* Upload area */}
              <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6">
                <p className="text-sm font-bold text-[#44494d] mb-4">Táº£i file CSV lÃªn</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const text = ev.target?.result as string;
                        setCsvText(text); applyParsed(text); setImportDone(0); setImportErrors([]);
                      };
                      reader.readAsText(file, "utf-8");
                    }
                  }}
                  className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-10 text-center cursor-pointer hover:border-[#1a4b97] transition-colors">
                  <div className="text-4xl mb-3"></div>
                  <p className="font-semibold text-[#44494d] text-sm">KÃ©o tháº£ file CSV vÃ o Ä‘Ã¢y hoáº·c click Ä‘á»ƒ chá»n</p>
                  <p className="text-xs text-[#8f9294] mt-1">Chá»‰ há»— trá»£ file .csv, mÃ£ hoÃ¡ UTF-8</p>
                  <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#8f9294] mb-2">Hoáº·c dÃ¡n ná»™i dung CSV trá»±c tiáº¿p:</p>
                  <textarea
                    value={csvText}
                    onChange={e => handlePaste(e.target.value)}
                    placeholder={SAMPLE_CSV}
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl font-mono text-xs text-[#44494d] focus:outline-none focus:border-[#1a4b97] resize-none"
                    style={{ minHeight: "120px", background: "#f9fafb" }}
                  />
                </div>
              </div>{/* Preview table */}
              {parsed && parsed.rows.length > 0 && (
                <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
                    <p className="font-bold text-[#44494d] text-sm">Xem trÆ°á»›c: {parsed.rows.length} sáº£n pháº©m</p>
                    <button onClick={handleImport} disabled={importing}
                      className="px-5 py-2 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: "var(--ap-primary)" }}>{importing ? "Äang nháº­p..." : `Nháº­p ${parsed.rows.length} sáº£n pháº©m`}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#f8f8fa]">{parsed.headers.map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-bold text-[#8f9294] uppercase tracking-wide whitespace-nowrap">{h}</th>))}
                        </tr>
                      </thead>
                      <tbody>{parsed.rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-t border-[#f0f0f0] hover:bg-[#f8f8fa]">{parsed.headers.map(h => (
                              <td key={h} className="px-3 py-2.5 text-[#44494d] whitespace-nowrap max-w-[150px] truncate">{row[h]}</td>))}
                          </tr>))}
                        {parsed.rows.length > 10 && (
                          <tr className="border-t border-[#f0f0f0]">
                            <td colSpan={parsed.headers.length} className="px-3 py-2.5 text-center text-[#8f9294] text-xs">... vÃ  {parsed.rows.length - 10} sáº£n pháº©m khÃ¡c
                            </td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>{(importDone > 0 || importErrors.length > 0) && (
                    <div className="px-5 py-4 border-t border-[#f0f0f0]">{importDone > 0 && (
                        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                          <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold">âœ“</span>Nháº­p thÃ nh cÃ´ng {importDone} sáº£n pháº©m
                        </div>)}
                      {importErrors.map((err, i) => (
                        <div key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mb-1">{err}</div>))}
                    </div>)}
                </div>)}
            </div>)}

          {tab === "export" && (
            <div className="space-y-5">
              <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6">
                <p className="text-sm font-bold text-[#44494d] mb-2">Xuáº¥t danh sÃ¡ch sáº£n pháº©m</p>
                <p className="text-xs text-[#8f9294] mb-5">Xuáº¥t toÃ n bá»™ sáº£n pháº©m thÃ nh file CSV Ä‘á»ƒ chá»‰nh sá»­a offline hoáº·c backup.</p>
                <div className="flex gap-3">
                  <button onClick={handleLoadExport} disabled={loadingExport}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-[#1a4b97] text-[#1a4b97] hover:bg-blue-50 transition-colors disabled:opacity-60">{loadingExport ? "Äang táº£i..." : "Táº£i danh sÃ¡ch"}
                  </button>{products.length > 0 && (
                    <button onClick={handleExportCSV}
                      className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                      style={{ background: "#22C55E" }}>Xuáº¥t CSV ({products.length} sáº£n pháº©m)
                    </button>)}
                </div>{products.length > 0 && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-[#f0f0f0]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#f8f8fa]">{["ID", "TÃªn sáº£n pháº©m", "ThÆ°Æ¡ng hiá»‡u", "Danh má»¥c", "GiÃ¡", "Loáº¡i", "Tá»“n kho", "Tráº¡ng thÃ¡i"].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-bold text-[#8f9294] uppercase tracking-wide whitespace-nowrap">{h}</th>))}
                        </tr>
                      </thead>
                      <tbody>{products.slice(0, 20).map(p => (
                          <tr key={p.id} className="border-t border-[#f0f0f0] hover:bg-[#f8f8fa]">
                            <td className="px-3 py-2 font-mono text-[#8f9294]">{p.id}</td>
                            <td className="px-3 py-2 text-[#44494d] max-w-[200px] truncate">{p.name}</td>
                            <td className="px-3 py-2 text-[#44494d]">{p.brand}</td>
                            <td className="px-3 py-2 text-[#8f9294]">{p.categoryId}</td>
                            <td className="px-3 py-2 font-bold" style={{ color: "var(--ap-primary)" }}>{p.price?.toLocaleString()}Ä‘</td>
                            <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.type === "OEM" ? "bg-green-100 text-green-700" : p.type === "OES" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{p.type}</span></td>
                            <td className="px-3 py-2 text-[#44494d]">{p.stock}</td>
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{p.active ? "Äang bÃ¡n" : "áº¨n"}
                              </span>
                            </td>
                          </tr>))}
                        {products.length > 20 && (
                          <tr className="border-t border-[#f0f0f0]">
                            <td colSpan={8} className="px-3 py-2.5 text-center text-[#8f9294] text-xs">... vÃ  {products.length - 20} sáº£n pháº©m khÃ¡c
                            </td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>)}
              </div>
            </div>)}
        </div>
      
        <div className="p-6">
          <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5 mb-4">
            <h2 className="font-bold text-[#44494d] mb-2">ToÃ n bá»™ dá»¯ liá»‡u (backup/restore)</h2>
            <p className="text-sm text-[#8f9294] mb-3">Xuáº¥t táº¥t cáº£ file JSON trong <code>data/</code> ra 1 file Ä‘á»ƒ backup. Nháº­p file Ä‘á»ƒ restore (sáº½ táº¡o backup tá»± Ä‘á»™ng trÆ°á»›c khi ghi Ä‘Ã¨).</p>
            <div className="flex flex-wrap gap-2">
              <a href="/api/admin/data-export" download className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2" style={{ background: "var(--ap-primary)" }}>Táº£i dá»¯ liá»‡u (JSON)
              </a>
              <a href="/api/admin/data-export?includeUsers=1" download className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4]">Táº£i kÃ¨m users.json
              </a>
              <input id="data-import-input" type="file" accept=".json" style={{ display: "none" }} onChange={async e => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (!(await confirmDialog(`Náº¡p láº¡i dá»¯ liá»‡u tá»« "${f.name}"? Dá»¯ liá»‡u hiá»‡n táº¡i sáº½ Ä‘Æ°á»£c backup tá»± Ä‘á»™ng trÆ°á»›c khi ghi Ä‘Ã¨.`))) { e.target.value = ""; return; }
                try {
                  const text = await f.text();
                  const obj = JSON.parse(text);
                  const res = await fetch("/api/admin/data-import", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(obj) });
                  const data = await res.json();
                  if (res.ok) alert(`ÄÃ£ ghi ${data.written} file. Backup táº¡i: ${data.backupAt}`);
                  else alert(data.error || "Lá»—i náº¡p dá»¯ liá»‡u");
                } catch (err) { alert("File khÃ´ng há»£p lá»‡: " + err); }
                e.target.value = "";
              }} />
              <button onClick={() => document.getElementById("data-import-input")?.click()} className="px-4 py-2 rounded-lg text-sm font-semibold border border-orange-300 text-orange-600 hover:bg-orange-50">Náº¡p láº¡i tá»« file JSON
              </button>
            </div>
            <p className="text-xs text-[#8f9294] mt-3">Backup tá»± Ä‘á»™ng lÆ°u á»Ÿ <code>/data-backups/</code> trÃªn server. Máº·c Ä‘á»‹nh khÃ´ng bao gá»“m users.json Ä‘á»ƒ trÃ¡nh ghi Ä‘Ã¨ credentials.</p>
          </div>
        </div>
      </main>
      {/* â”€â”€ Popup: Sáº£n pháº©m Ä‘Ã£ tá»“n táº¡i â”€â”€ */}
      {duplicateAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 text-2xl">âš ï¸</div>
            <h3 className="font-bold text-[#44494d] text-center mb-2">Sáº£n pháº©m Ä‘Ã£ tá»“n táº¡i</h3>
            <p className="text-sm text-[#8f9294] text-center mb-4 whitespace-pre-line">{duplicateAlert}</p>
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4 text-center">Há»‡ thá»‘ng Ä‘Ã£ tá»± Ä‘á»™ng bá» qua cÃ¡c sáº£n pháº©m trÃ¹ng láº·p Ä‘á»ƒ trÃ¡nh nháº­p hai láº§n.</p>
            <button onClick={() => setDuplicateAlert(null)} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>ÄÃ£ hiá»ƒu</button>
          </div>
        </div>
      )}
    </>);
}


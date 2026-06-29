"use client";
import { useState, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";

const SAMPLE_CSV = `name,brand,category,price,originalPrice,type,oemCode,stock,description
Má phanh Toyota Camry,Toyota,brake-pad,350000,420000,OEM,04465-06180,50,Má phanh chính hãng Toyota cho Camry 2018-2023
Lọc dầu Honda Civic,Honda,oil-filter,85000,110000,OES,15400-RTA-004,120,Lọc dầu OES cho Honda Civic 2016-2022
Bugi NGK Vios,NGK,spark-plug,65000,80000,OEM,BKR6EKB-11,200,Bugi chính hãng NGK cho Toyota Vios
Bình ắc quy GS,GS Battery,battery,1200000,1500000,Generic,MF50D20L,30,Bình ắc quy GS 45Ah phổ thông`;

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
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
  const [tab, setTab] = useState<"import" | "export">("import");
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingExport, setLoadingExport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setParsed(parseCSV(text));
      setImportDone(0);
      setImportErrors([]);
    };
    reader.readAsText(file, "utf-8");
  };

  const handlePaste = (text: string) => {
    setCsvText(text);
    setParsed(parseCSV(text));
    setImportDone(0);
    setImportErrors([]);
  };

  const handleImport = async () => {
    if (!parsed || !parsed.rows.length) return;
    setImporting(true);
    let done = 0;
    const errors: string[] = [];
    for (const row of parsed.rows) {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row.name || row["tên"] || "",
            brand: row.brand || row["thương hiệu"] || "",
            category: row.category || row["danh mục"] || "general",
            categoryId: (row.category || "general").toLowerCase().replace(/\s+/g, "-"),
            price: Number(row.price || row["giá"] || 0),
            originalPrice: row.originalPrice || row["giá gốc"] ? Number(row.originalPrice || row["giá gốc"]) : undefined,
            type: row.type || "Generic",
            oemCode: row.oemCode || row["mã OEM"] || "",
            stock: Number(row.stock || row["tồn kho"] || 0),
            description: row.description || row["mô tả"] || "",
            image: (row.category || "general").toLowerCase().replace(/\s+/g, "-"),
            active: true,
          }),
        });
        if (res.ok) done++;
        else errors.push(`${row.name}: HTTP ${res.status}`);
      } catch (ex: any) {
        errors.push(`${row.name}: ${ex.message}`);
      }
    }
    setImportDone(done);
    setImportErrors(errors);
    setImporting(false);
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
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.categoryId,
      price: p.price,
      originalPrice: p.originalPrice ?? "",
      type: p.type,
      oemCode: p.oemCode ?? "",
      stock: p.stock,
      sold: p.sold ?? 0,
      rating: p.rating ?? 0,
      active: p.active ? "true" : "false",
    }));
    exportCSV(rows, `autoparts_products_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--ap-page-bg)" }}>
      <AdminSidebar active="/admin/import-export" />
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#44494d]">Nhập / Xuất dữ liệu</h1>
            <p className="text-sm text-[#8f9294] mt-0.5">Import bulk sản phẩm từ CSV hoặc xuất danh sách hiện tại</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-[#f0f0f0] p-1 mb-6 w-fit">
            {(["import", "export"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? "text-white shadow-sm" : "text-[#8f9294] hover:text-[#44494d]"}`}
                style={tab === t ? { background: "var(--ap-primary)" } : {}}>
                {t === "import" ? "📥 Nhập sản phẩm" : "📤 Xuất sản phẩm"}
              </button>
            ))}
          </div>

          {tab === "import" && (
            <div className="space-y-5">
              {/* Template download */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a4b97" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#44494d] text-sm mb-1">File mẫu CSV</p>
                  <p className="text-xs text-[#8f9294] mb-3">Tải file mẫu để biết định dạng chuẩn. Cột bắt buộc: name, brand, category, price, type, stock</p>
                  <button onClick={() => exportCSV(
                    SAMPLE_CSV.trim().split("\n").slice(1).map(line => {
                      const headers = SAMPLE_CSV.split("\n")[0].split(",");
                      const vals = line.split(",");
                      const obj: Record<string, string> = {};
                      headers.forEach((h, i) => { obj[h.trim()] = vals[i]?.trim() ?? ""; });
                      return obj;
                    }), "autoparts_import_template.csv"
                  )}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#1a4b97] border-2 border-[#1a4b97] hover:bg-blue-100 transition-colors">
                    Tải file mẫu
                  </button>
                </div>
              </div>

              {/* Upload area */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
                <p className="text-sm font-bold text-[#44494d] mb-4">Tải file CSV lên</p>
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
                        setCsvText(text); setParsed(parseCSV(text)); setImportDone(0); setImportErrors([]);
                      };
                      reader.readAsText(file, "utf-8");
                    }
                  }}
                  className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-10 text-center cursor-pointer hover:border-[#1a4b97] transition-colors">
                  <div className="text-4xl mb-3">📂</div>
                  <p className="font-semibold text-[#44494d] text-sm">Kéo thả file CSV vào đây hoặc click để chọn</p>
                  <p className="text-xs text-[#8f9294] mt-1">Chỉ hỗ trợ file .csv, mã hoá UTF-8</p>
                  <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#8f9294] mb-2">Hoặc dán nội dung CSV trực tiếp:</p>
                  <textarea
                    value={csvText}
                    onChange={e => handlePaste(e.target.value)}
                    placeholder={SAMPLE_CSV}
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl font-mono text-xs text-[#44494d] focus:outline-none focus:border-[#1a4b97] resize-none"
                    style={{ minHeight: "120px", background: "#f9fafb" }}
                  />
                </div>
              </div>

              {/* Preview table */}
              {parsed && parsed.rows.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
                    <p className="font-bold text-[#44494d] text-sm">Xem trước: {parsed.rows.length} sản phẩm</p>
                    <button onClick={handleImport} disabled={importing}
                      className="px-5 py-2 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
                      style={{ background: "var(--ap-primary)" }}>
                      {importing ? "Đang nhập..." : `Nhập ${parsed.rows.length} sản phẩm`}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#f8f8fa]">
                          {parsed.headers.map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-bold text-[#8f9294] uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.rows.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-t border-[#f0f0f0] hover:bg-[#f8f8fa]">
                            {parsed.headers.map(h => (
                              <td key={h} className="px-3 py-2.5 text-[#44494d] whitespace-nowrap max-w-[150px] truncate">{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                        {parsed.rows.length > 10 && (
                          <tr className="border-t border-[#f0f0f0]">
                            <td colSpan={parsed.headers.length} className="px-3 py-2.5 text-center text-[#8f9294] text-xs">
                              ... và {parsed.rows.length - 10} sản phẩm khác
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {(importDone > 0 || importErrors.length > 0) && (
                    <div className="px-5 py-4 border-t border-[#f0f0f0]">
                      {importDone > 0 && (
                        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                          <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold">✓</span>
                          Nhập thành công {importDone} sản phẩm
                        </div>
                      )}
                      {importErrors.map((err, i) => (
                        <div key={i} className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5 mb-1">{err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === "export" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
                <p className="text-sm font-bold text-[#44494d] mb-2">Xuất danh sách sản phẩm</p>
                <p className="text-xs text-[#8f9294] mb-5">Xuất toàn bộ sản phẩm thành file CSV để chỉnh sửa offline hoặc backup.</p>
                <div className="flex gap-3">
                  <button onClick={handleLoadExport} disabled={loadingExport}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-[#1a4b97] text-[#1a4b97] hover:bg-blue-50 transition-colors disabled:opacity-60">
                    {loadingExport ? "Đang tải..." : "Tải danh sách"}
                  </button>
                  {products.length > 0 && (
                    <button onClick={handleExportCSV}
                      className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                      style={{ background: "#22C55E" }}>
                      Xuất CSV ({products.length} sản phẩm)
                    </button>
                  )}
                </div>

                {products.length > 0 && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-[#f0f0f0]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#f8f8fa]">
                          {["ID", "Tên sản phẩm", "Thương hiệu", "Danh mục", "Giá", "Loại", "Tồn kho", "Trạng thái"].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-bold text-[#8f9294] uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {products.slice(0, 20).map(p => (
                          <tr key={p.id} className="border-t border-[#f0f0f0] hover:bg-[#f8f8fa]">
                            <td className="px-3 py-2 font-mono text-[#8f9294]">{p.id}</td>
                            <td className="px-3 py-2 text-[#44494d] max-w-[200px] truncate">{p.name}</td>
                            <td className="px-3 py-2 text-[#44494d]">{p.brand}</td>
                            <td className="px-3 py-2 text-[#8f9294]">{p.categoryId}</td>
                            <td className="px-3 py-2 font-bold" style={{ color: "var(--ap-primary)" }}>{p.price?.toLocaleString()}đ</td>
                            <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.type === "OEM" ? "bg-green-100 text-green-700" : p.type === "OES" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{p.type}</span></td>
                            <td className="px-3 py-2 text-[#44494d]">{p.stock}</td>
                            <td className="px-3 py-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {p.active ? "Đang bán" : "Ẩn"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {products.length > 20 && (
                          <tr className="border-t border-[#f0f0f0]">
                            <td colSpan={8} className="px-3 py-2.5 text-center text-[#8f9294] text-xs">
                              ... và {products.length - 20} sản phẩm khác
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 mb-4">
            <h2 className="font-bold text-[#44494d] mb-2">Toàn bộ dữ liệu (backup/restore)</h2>
            <p className="text-sm text-[#8f9294] mb-3">Xuất tất cả file JSON trong <code>data/</code> ra 1 file để backup. Nhập file để restore (sẽ tạo backup tự động trước khi ghi đè).</p>
            <div className="flex flex-wrap gap-2">
              <a href="/api/admin/data-export" download className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2" style={{ background: "var(--ap-primary)" }}>
                ⬇ Tải dữ liệu (JSON)
              </a>
              <a href="/api/admin/data-export?includeUsers=1" download className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4]">
                ⬇ Tải kèm users.json
              </a>
              <input id="data-import-input" type="file" accept=".json" style={{ display: "none" }} onChange={async e => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (!confirm(`Nạp lại dữ liệu từ "${f.name}"? Dữ liệu hiện tại sẽ được backup tự động trước khi ghi đè.`)) { e.target.value = ""; return; }
                try {
                  const text = await f.text();
                  const obj = JSON.parse(text);
                  const res = await fetch("/api/admin/data-import", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(obj) });
                  const data = await res.json();
                  if (res.ok) alert(`Đã ghi ${data.written} file. Backup tại: ${data.backupAt}`);
                  else alert(data.error || "Lỗi nạp dữ liệu");
                } catch (err) { alert("File không hợp lệ: " + err); }
                e.target.value = "";
              }} />
              <button onClick={() => document.getElementById("data-import-input")?.click()} className="px-4 py-2 rounded-lg text-sm font-semibold border border-orange-300 text-orange-600 hover:bg-orange-50">
                ⬆ Nạp lại từ file JSON
              </button>
            </div>
            <p className="text-xs text-[#8f9294] mt-3">Backup tự động lưu ở <code>/data-backups/</code> trên server. Mặc định không bao gồm users.json để tránh ghi đè credentials.</p>
          </div>
        </div>
</main>
    </div>
  );
}

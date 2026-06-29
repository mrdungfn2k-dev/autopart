"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import SupplierSidebar from "@/components/SupplierSidebar";
import SidebarControls from "@/components/SidebarControls";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";

const swatchMap: Record<string, { bg: string; color: string; label: string }> = {
  "brake-pad":      { bg: "#FEE2E2", color: "#DC2626",  label: "Phanh" },
  "brake-disc":     { bg: "#FEE2E2", color: "#DC2626",  label: "Đĩa" },
  "oil-filter":     { bg: "#FEF9C3", color: "#92400E",  label: "Lọc" },
  "cabin-filter":   { bg: "#F0FDF4", color: "#166534",  label: "Lọc" },
  "spark-plug":     { bg: "#EDE9FE", color: "#6D28D9",  label: "Bugi" },
  "battery":        { bg: "#DBEAFE", color: "#1D4ED8",  label: "Ắcquy" },
  "engine-oil":     { bg: "#44494d", color: "#8f9294",  label: "Nhớt" },
  "headlight":      { bg: "#FEF3C7", color: "#D97706",  label: "Đèn" },
  "shock-absorber": { bg: "#D1FAE5", color: "#065F46",  label: "Giảm" },
  "timing-belt":    { bg: "#F3F4F6", color: "#374151",  label: "Curoa" },
  "radiator":       { bg: "#E0F2FE", color: "#0369A1",  label: "Két" },
  "o2-sensor":      { bg: "#FDF4FF", color: "#7E22CE",  label: "Cảm" },
};
function getSwatch(img: string) { return swatchMap[img] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" }; }

export default function SupplierInventoryPage() {
  const { t, lang } = useLang();
  const fp = (n: number) => n.toLocaleString("vi-VN") + "₫";

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "low" | "ok">("all");
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedProd, setSelectedProd] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(50);
  const [restockPrice, setRestockPrice] = useState("");
  const [restockSource, setRestockSource] = useState("");
  const [isRestocking, setIsRestocking] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Enrich products with warehouse metadata (stable per product id)
  const inventoryData = products.map(p => {
    const seed = p.id.charCodeAt(0) + p.id.charCodeAt(1);
    return {
      ...p,
      location: `Kho ${String.fromCharCode(65 + (seed % 4))}-${(seed % 9) + 1}-${(seed % 5) + 1}`,
      incoming: seed % 3 === 0 ? (seed % 50) + 10 : 0,
      minStock: 10,
      lastRestocked: (() => { const d = new Date(); d.setDate(d.getDate() - (seed % 30)); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`; })(),
    };
  });

  const lowStockItems = inventoryData.filter(p => p.stock < 15);

  const filtered = inventoryData.filter(p =>(filterStock === "all" ||
     (filterStock === "low" && p.stock < p.minStock) ||
     (filterStock === "ok"  && p.stock >= p.minStock)) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );
  const pg = usePaged(filtered, 15);

  const getStockStatus = (stock: number, min: number) => {
    if (stock === 0) return { label: t('outOfStock'), cls: "bg-red-100 text-red-700" };
    if (stock < min) return { label: t('lowStock'), cls: "bg-yellow-100 text-yellow-700" };
    return { label: t('inStock'), cls: "bg-green-100 text-green-700" };
  };

  const handleRestock = async () => {
    if (!selectedProd || restockQty <= 0) return;
    const prod = inventoryData.find(p => p.id === selectedProd);
    if (!prod) return;
    setIsRestocking(true);
    try {
      const res = await fetch(`/api/inventory/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: selectedProd, 
          qty: restockQty,
          source: restockSource,
          price: Number(restockPrice) || 0
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p.id === selectedProd ? { ...p, stock: data.stock } : p));
        setShowRestockModal(false);
        setRestockQty(50);
        setRestockSource("");
        setRestockPrice("");
        showToast(`✓ Đã nhập thêm ${restockQty} sản phẩm thành công!`);
      }
    } catch { showToast("Lỗi khi nhập kho"); }
    finally { setIsRestocking(false); }
  };

  const openRestock = (id: string) => { setSelectedProd(id); setShowRestockModal(true); };

  return (
    <>
      <main className="flex-1 overflow-auto">{/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{t("inventoryTitle")}</h1>
            <button onClick={() => { setSelectedProd(null); setShowRestockModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>{t('stockIn')}
            </button>
          </div>
        </div>

        <div className="p-6">{/* Low stock alert */}
          {lowStockItems.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#D97706" className="shrink-0 mt-0.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <div>
                <p className="font-bold text-yellow-800">{lang === "zh" ? `警告：${lowStockItems.length} 个产品即将缺货！` : lang === "en" ? `Warning: ${lowStockItems.length} products low on stock!` : `Cảnh báo: ${lowStockItems.length} sản phẩm sắp hết hàng!`}</p>
                <p className="text-yellow-700 text-sm mt-0.5">{lowStockItems.slice(0, 3).map(p => p.name.split(" ").slice(0, 3).join(" ")).join(", ")}
                  {lowStockItems.length > 3 ? (lang === "zh" ? ` 等 ${lowStockItems.length - 3} 个产品` : lang === "en" ? ` and ${lowStockItems.length - 3} more products` : ` và ${lowStockItems.length - 3} sản phẩm khác`) : ""}. {lang === "zh" ? "请尽快补货。" : lang === "en" ? "Please restock soon." : "Hãy nhập kho sớm."}
                </p>
              </div>
            </div>)}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{[
              { label: (lang === "zh" ? "总SKU" : lang === "en" ? "Total SKUs" : "Tổng SKU"), value: inventoryData.length.toString(), color: "#44494d" },
              { label: (lang === "zh" ? "总库存" : lang === "en" ? "Total stock" : "Tổng tồn kho"), value: inventoryData.reduce((s, p) => s + (p.stock || 0), 0).toLocaleString(), color: "var(--ap-primary)" },
              { label: (lang === "zh" ? "即将缺货" : lang === "en" ? "Low stock" : "Sắp hết hàng"), value: lowStockItems.length.toString(), color: "#F59E0B" },
              { label: (lang === "zh" ? "在途货物" : lang === "en" ? "Incoming" : "Hàng đang về"), value: inventoryData.filter(p => p.incoming > 0).length.toString(), color: "#22C55E" },
            ].map(s => (
              <div key={s.label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4">
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-[#8f9294]">{s.label}</p>
              </div>))}
          </div>{/* Filters */}
          <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4 mb-4 flex flex-wrap gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t("searchProducts")}
              className="pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] w-56" />
            <div className="flex rounded-lg border border-[#e5e5e5] overflow-hidden text-sm">{(["all", "low", "ok"] as const).map((k, i) => {
                const labels = [t('all'), t('lowStock'), t('stable')];
                const counts = [inventoryData.length, lowStockItems.length, inventoryData.length - lowStockItems.length];
                return (
                  <button key={k} onClick={() => setFilterStock(k)}
                    className={`px-3 py-2 transition-colors ${filterStock === k ? "text-white font-semibold" : "text-slate-600 hover:bg-[#f8f8fa]"}`}
                    style={filterStock === k ? { background: "var(--ap-primary)" } : {}}>{labels[i]} ({counts[i]})
                  </button>);
              })}
            </div>
          </div>{/* Table */}
          <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "#f8f8fa" }}>
                <tr className="text-xs text-[#8f9294] font-semibold">{(lang === "zh" ? ["产品", "仓库位置", "库存", "在途", "最后入库", "成本价", "状态", ""] : ["SẢN PHẨM", "VỊ TRÍ KHO", "TỒN KHO", "HÀNG VỀ", "NHẬP LẦN CUỐI", "GIÁ VỐN", "TRẠNG THÁI", ""]).map(h => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>))}
                </tr>
              </thead>
              <tbody>{pg.paged.map(prod => {
                  const status = getStockStatus(prod.stock, prod.minStock);
                  const sw = getSwatch(prod.image);
                  return (
                    <tr key={prod.id} className={`border-t border-slate-50 transition-colors ${prod.stock < prod.minStock ? "bg-yellow-50/30" : "hover:bg-[#f8f8fa]"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span style={{ background: sw.bg, color: sw.color, fontSize: "10px", fontWeight: "bold", padding: "3px 5px", borderRadius: "4px" }}>{sw.label}</span>
                          <div>
                            <p className="font-semibold text-[#44494d] text-sm whitespace-nowrap">{lang === "zh" ? ((prod as any).nameZh || prod.name) : prod.name}</p>
                            <p className="text-xs font-mono text-[#8f9294]">{prod.oemCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="font-mono text-xs bg-[#f4f4f4] px-2 py-1 rounded text-slate-600">{prod.location}</span></td>
                      <td className="px-4 py-3">
                        <span className={`text-lg font-bold ${prod.stock < prod.minStock ? "text-red-500" : "text-[#44494d]"}`}>{prod.stock}</span>{prod.stock < prod.minStock && <span className="text-xs text-red-500 font-bold ml-1">!</span>}
                      </td>
                      <td className="px-4 py-3">{prod.incoming > 0
                          ? <span className="text-green-600 font-medium text-sm">+{prod.incoming}</span>: <span className="text-[#8f9294]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[#8f9294] text-sm">{prod.lastRestocked}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{fp(Math.round(prod.price * 0.65))}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${status.cls}`}>{status.label}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/supplier/products?edit=${prod.id}`}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa] transition-colors mr-2">{t('edit')}</Link>
                        <button onClick={() => openRestock(prod.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border border-[#1a4b97]/30 text-[#1a4b97] hover:bg-[#EFF4FB] transition-colors">{t('stockIn') || "Nhập thêm"}
                        </button>
                      </td>
                    </tr>);
                })}
              </tbody>
            </table>{filtered.length === 0 && (
              <p className="text-center text-[#8f9294] py-12 text-sm">{t('noData')}</p>)}
          </div>
          {filtered.length > 0 && <Pagination {...pg.bind} />}
        </div>{/* Restock modal */}
        {showRestockModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm">
              <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
                <h3 className="font-bold text-[#44494d]">{t("stockIn")}</h3>
                <button onClick={() => setShowRestockModal(false)} className="text-[#8f9294] text-xl">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Sản phẩm</label>
                  <select value={selectedProd ?? ""} onChange={e => setSelectedProd(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
                    <option value="">— Chọn sản phẩm —</option>{inventoryData.filter(p => p.stock < p.minStock).map(p => (
                      <option key={p.id} value={p.id}>{p.name} (còn {p.stock})</option>))}
                    {inventoryData.filter(p => p.stock >= p.minStock).map(p => (
                      <option key={p.id} value={p.id}>{p.name} (còn {p.stock})</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('stockInQty')}</label>
                    <input type="number" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} min="1"
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">Giá nhập (VNĐ)</label>
                    <input type="number" placeholder="Đơn giá" value={restockPrice} onChange={e => setRestockPrice(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Nguồn nhập hàng</label>
                  <input value={restockSource} onChange={e => setRestockSource(e.target.value)}
                    placeholder="VD: Toyota Motor Vietnam"
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t border-[#f0f0f0]">
                <button onClick={() => setShowRestockModal(false)}
                  className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600">{t("cancel")}</button>
                <button onClick={handleRestock} disabled={isRestocking || !selectedProd}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:opacity-60"
                  style={{ background: "var(--ap-primary)" }}>{isRestocking ? t('saving') : t('confirmStockIn')}
                </button>
              </div>
            </div>
          </div>)}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[100] bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">{toast}
          </div>)}
      </main>
    </>);
}

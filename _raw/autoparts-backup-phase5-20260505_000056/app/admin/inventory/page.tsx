"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import AdminSidebar from "@/components/AdminSidebar";

interface StockItem {
  id: string;
  name: string;
  oemCode: string;
  categoryName: string;
  brand: string;
  stock: number;
  price: number;
  supplier: string;
}

type Adjustment = { productId: string; delta: number; note: string; date: string };

const LOW_STOCK_THRESHOLD = 10;

export default function AdminInventoryPage() {
  const { t, fp, lang } = useLang();
  const [products, setProducts] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [adjustTarget, setAdjustTarget] = useState<StockItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [history, setHistory] = useState<Adjustment[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.oemCode.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "low" && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD) ||
      (filter === "out" && p.stock === 0);
    return matchSearch && matchFilter;
  });

  const lowCount = products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length;
  const outCount = products.filter(p => p.stock === 0).length;

  const handleAdjust = async () => {
    if (!adjustTarget) return;
    const delta = parseInt(adjustDelta);
    if (isNaN(delta) || delta === 0) return;

    const newStock = Math.max(0, adjustTarget.stock + delta);
    try {
      await fetch(`/api/products/${adjustTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
    } catch {
      // Fallback: update local state only
    }

    const adj: Adjustment = {
      productId: adjustTarget.id,
      delta,
      note: adjustNote || (delta > 0 ? "Nhập kho" : "Xuất kho"),
      date: new Date().toISOString(),
    };
    setHistory(h => [adj, ...h.slice(0, 19)]);
    setProducts(ps => ps.map(p => p.id === adjustTarget.id ? { ...p, stock: newStock } : p));
    setAdjustTarget(null);
    setAdjustDelta("");
    setAdjustNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stockColor = (stock: number) => {
    if (stock === 0) return "text-red-600 bg-red-50";
    if (stock <= LOW_STOCK_THRESHOLD) return "text-orange-600 bg-orange-50";
    return "text-green-700 bg-green-50";
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <AdminSidebar active="/admin/inventory" />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">{t("inventoryManage")}</h1>
          </div>
        </div>

        <div className="p-6">
          {saved && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
              ✓ {lang === "zh" ? "库存已更新" : "Đã cập nhật tồn kho"}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: lang === "zh" ? "总产品数" : "Tổng sản phẩm", value: products.length, color: "var(--ap-primary)" },
              { label: lang === "zh" ? "正常库存" : "Tồn kho ổn định", value: products.filter(p => p.stock > LOW_STOCK_THRESHOLD).length, color: "#22C55E" },
              { label: lang === "zh" ? "低库存预警" : "Sắp hết hàng", value: lowCount, color: "#F59E0B" },
              { label: lang === "zh" ? "缺货" : "Hết hàng", value: outCount, color: "#EF4444" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#f0f0f0] p-4">
                <p className="text-xs text-[#8f9294] font-semibold uppercase mb-2">{kpi.label}</p>
                <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Product inventory table */}
            <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <div className="p-4 border-b border-[#f0f0f0] flex flex-wrap gap-3 items-center">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={lang === "zh" ? "搜索产品..." : "Tìm sản phẩm..."}
                  className="flex-1 min-w-[160px] px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
                <div className="flex gap-2">
                  {(["all", "low", "out"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${filter === f ? "text-white border-transparent" : "border-[#e5e5e5] text-[#44494d]"}`}
                      style={filter === f ? { background: "var(--ap-primary)" } : {}}>
                      {f === "all" ? (lang === "zh" ? "全部" : "Tất cả") : f === "low" ? (lang === "zh" ? "低库存" : "Sắp hết") : (lang === "zh" ? "缺货" : "Hết hàng")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-12 text-center text-[#8f9294]">
                    <span className="inline-block w-6 h-6 border-2 border-[#1a4b97] border-t-transparent rounded-full animate-spin mr-2" />
                    {lang === "zh" ? "加载中..." : "Đang tải..."}
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-[#8f9294] bg-[#f8f8fa]">
                        <th className="text-left px-4 py-3">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
                        <th className="text-left px-4 py-3">{lang === "zh" ? "OEM码" : "OEM"}</th>
                        <th className="text-left px-4 py-3">{lang === "zh" ? "库存" : "TỒN KHO"}</th>
                        <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
                        <th className="text-left px-4 py-3">{lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id} className="border-t border-[#f8f8fa] hover:bg-[#f8f8fa]/60">
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#44494d] text-xs line-clamp-1">{p.name}</p>
                            <p className="text-[#8f9294] text-xs">{p.brand}</p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#8f9294]">{p.oemCode}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${stockColor(p.stock)}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold ${p.stock === 0 ? "text-red-600" : p.stock <= LOW_STOCK_THRESHOLD ? "text-orange-600" : "text-green-700"}`}>
                              {p.stock === 0 ? (lang === "zh" ? "缺货" : "Hết hàng") : p.stock <= LOW_STOCK_THRESHOLD ? (lang === "zh" ? "低库存" : "Sắp hết") : (lang === "zh" ? "正常" : "Ổn định")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => { setAdjustTarget(p); setAdjustDelta(""); setAdjustNote(""); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                              style={{ background: "var(--ap-primary)" }}>
                              {t("stockAdjust")}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={5} className="text-center py-12 text-[#8f9294]">{t("noData")}</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Adjust form */}
              {adjustTarget && (
                <div className="bg-white rounded-2xl border-2 p-5" style={{ borderColor: "var(--ap-primary)" }}>
                  <h3 className="font-bold text-[#44494d] mb-4">{t("stockAdjust")}</h3>
                  <p className="text-xs text-[#8f9294] mb-3 line-clamp-2 font-medium">{adjustTarget.name}</p>
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[#f8f8fa]">
                    <span className="text-sm text-[#8f9294]">{lang === "zh" ? "当前库存" : "Tồn hiện tại"}:</span>
                    <span className="font-bold text-xl text-[#44494d]">{adjustTarget.stock}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#44494d] mb-1 block">
                        {lang === "zh" ? "调整数量（+入库 / -出库）" : "Điều chỉnh (+nhập / -xuất) *"}
                      </label>
                      <input type="number" value={adjustDelta} onChange={e => setAdjustDelta(e.target.value)}
                        placeholder="+10 hoặc -5"
                        className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#44494d] mb-1 block">{t("note")}</label>
                      <input value={adjustNote} onChange={e => setAdjustNote(e.target.value)}
                        placeholder={lang === "zh" ? "调整原因..." : "Lý do điều chỉnh..."}
                        className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
                    </div>
                    {adjustDelta && !isNaN(parseInt(adjustDelta)) && (
                      <div className="text-xs text-[#44494d] p-2 bg-[#f0f6ff] rounded-lg">
                        {lang === "zh" ? "调整后库存：" : "Tồn sau điều chỉnh: "}<strong>{Math.max(0, adjustTarget.stock + parseInt(adjustDelta))}</strong>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleAdjust}
                      className="flex-1 py-2 rounded-lg text-sm font-bold text-white"
                      style={{ background: "var(--ap-primary)" }}>
                      {t("confirm")}
                    </button>
                    <button onClick={() => setAdjustTarget(null)}
                      className="px-4 py-2 rounded-lg text-sm font-bold border border-[#e5e5e5] text-[#44494d]">
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              )}

              {/* Adjustment history */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
                <h3 className="font-bold text-[#44494d] mb-4">{t("stockHistory")}</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-[#8f9294] text-center py-6">{lang === "zh" ? "暂无调整记录" : "Chưa có lịch sử điều chỉnh"}</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((h, i) => {
                      const prod = products.find(p => p.id === h.productId);
                      const d = new Date(h.date);
                      return (
                        <div key={i} className="flex items-start justify-between py-2 border-b border-[#f8f8fa] last:border-0">
                          <div>
                            <p className="text-xs font-medium text-[#44494d] line-clamp-1">{prod?.name || h.productId}</p>
                            <p className="text-xs text-[#8f9294]">{h.note}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className={`text-xs font-bold ${h.delta > 0 ? "text-green-600" : "text-red-600"}`}>
                              {h.delta > 0 ? "+" : ""}{h.delta}
                            </span>
                            <p className="text-xs text-[#8f9294]">{d.getDate()}/{d.getMonth()+1} {String(d.getHours()).padStart(2,"0")}:{String(d.getMinutes()).padStart(2,"0")}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

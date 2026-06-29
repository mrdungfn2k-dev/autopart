"use client";
import { useState, useEffect } from "react";

// Global compare state stored in module-level memory + event
let _compareIds: string[] = [];
const _listeners: (() => void)[] = [];

function notify() { _listeners.forEach(fn => fn()); }

export function useCompare() {
  const [ids, setIds] = useState<string[]>(_compareIds);
  useEffect(() => {
    const update = () => setIds([..._compareIds]);
    _listeners.push(update);
    return () => { const idx = _listeners.indexOf(update); if (idx >= 0) _listeners.splice(idx, 1); };
  }, []);

  function toggle(id: string) {
    if (_compareIds.includes(id)) {
      _compareIds = _compareIds.filter(x => x !== id);
    } else if (_compareIds.length < 3) {
      _compareIds = [..._compareIds, id];
    }
    notify();
  }

  function clear() { _compareIds = []; notify(); }
  return { ids, toggle, clear, count: ids.length };
}

interface CompareBarProps {
  products: any[];
  fp: (n: number) => string;
  lang: string;
}

const SPEC_KEYS = [
  { key: "type", label: "Loại hàng" },
  { key: "brand", label: "Thương hiệu" },
  { key: "oemCode", label: "Mã OEM" },
  { key: "origin", label: "Xuất xứ" },
  { key: "stock", label: "Tồn kho" },
  { key: "rating", label: "Đánh giá" },
  { key: "sold", label: "Đã bán" },
];

export default function CompareBar({ products, fp, lang }: CompareBarProps) {
  const { ids, toggle, clear } = useCompare();
  const [showModal, setShowModal] = useState(false);

  const compareProducts = ids
    .map(id => products.find((p: any) => p.id === id))
    .filter(Boolean);

  if (ids.length === 0) return null;

  return (
    <>
      {/* Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        style={{ background: "#fff", borderColor: "var(--ap-primary)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "var(--ap-primary)" }}>
              {ids.length}
            </div>
            <span className="text-sm font-semibold text-[#44494d]">
              {lang === "zh" ? "已选对比" : "Đang so sánh"}
            </span>
          </div>

          <div className="flex gap-3 flex-1 overflow-x-auto">
            {compareProducts.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 bg-[#f8f8fa] rounded-xl px-3 py-2 min-w-fit border border-[#e5e5e5]">
                <span className="text-xs font-semibold text-[#44494d] max-w-[120px] truncate">
                  {lang === "zh" ? (p.nameZh || p.name) : p.name}
                </span>
                <span className="text-xs font-bold" style={{ color: "var(--ap-primary)" }}>{fp(p.price)}</span>
                <button onClick={() => toggle(p.id)}
                  className="text-[#8f9294] hover:text-red-500 transition-colors font-bold text-sm leading-none">
                  ×
                </button>
              </div>
            ))}
            {Array.from({ length: 3 - ids.length }).map((_, i) => (
              <div key={i} className="flex items-center justify-center bg-[#f8f8fa] rounded-xl px-6 py-2 border border-dashed border-[#e5e5e5] min-w-[100px]">
                <span className="text-xs text-[#8f9294]">
                  {lang === "zh" ? "+ 添加产品" : "+ Thêm SP"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 shrink-0">
            {ids.length >= 2 && (
              <button onClick={() => setShowModal(true)}
                className="px-5 py-2 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: "var(--ap-primary)" }}>
                {lang === "zh" ? "开始对比" : "So sánh ngay"}
              </button>
            )}
            <button onClick={clear}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#e5e5e5] text-[#8f9294] hover:border-red-300 hover:text-red-500 transition-colors">
              {lang === "zh" ? "清除" : "Xóa"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && compareProducts.length >= 2 && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 px-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border border-[#f0f0f0]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
              <h2 className="text-lg font-bold text-[#44494d]">
                {lang === "zh" ? "产品对比" : "So sánh sản phẩm"} ({compareProducts.length})
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-[#8f9294] hover:text-[#44494d] text-2xl font-bold leading-none transition-colors">×</button>
            </div>

            {/* Modal body */}
            <div className="overflow-auto flex-1 p-6">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 bg-[#f8f8fa] rounded-xl text-[#8f9294] text-xs uppercase font-bold w-32"></th>
                    {compareProducts.map((p: any) => (
                      <th key={p.id} className="px-4 py-3 text-center align-top">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold"
                            style={{ background: "var(--ap-primary)", opacity: 0.85 }}>
                            {(lang === "zh" ? (p.nameZh || p.name) : p.name).slice(0, 2)}
                          </div>
                          <p className="font-bold text-[#44494d] text-xs leading-tight max-w-[140px] text-center">
                            {lang === "zh" ? (p.nameZh || p.name) : p.name}
                          </p>
                          <p className="font-extrabold text-base" style={{ color: "var(--ap-primary)" }}>{fp(p.price)}</p>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <p className="text-xs text-[#8f9294] line-through">{fp(p.originalPrice)}</p>
                          )}
                          <button onClick={() => toggle(p.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors">
                            {lang === "zh" ? "移除" : "Xóa"}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_KEYS.map(({ key, label }, rowI) => {
                    const vals = compareProducts.map((p: any) => String(p[key] ?? "—"));
                    const allSame = vals.every(v => v === vals[0]);
                    return (
                      <tr key={key} className={rowI % 2 === 0 ? "bg-[#f8f8fa]" : "bg-white"}>
                        <td className="px-4 py-3 text-xs font-bold text-[#8f9294] uppercase tracking-wide">{label}</td>
                        {compareProducts.map((p: any) => {
                          const val = String(p[key] ?? "—");
                          const isBest =
                            (key === "rating" && Number(p[key]) === Math.max(...compareProducts.map(x => Number((x as any)[key] ?? 0)))) ||
                            (key === "sold" && Number(p[key]) === Math.max(...compareProducts.map(x => Number((x as any)[key] ?? 0)))) ||
                            (key === "stock" && Number(p[key]) === Math.max(...compareProducts.map(x => Number((x as any)[key] ?? 0))));
                          return (
                            <td key={p.id} className={`px-4 py-3 text-center font-semibold text-sm ${isBest ? "text-green-600" : "text-[#44494d]"}`}>
                              {key === "type" ? (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${val === "OEM" ? "bg-green-100 text-green-700" : val === "OES" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{val}</span>
                              ) : key === "rating" ? (
                                <span>{val} ★</span>
                              ) : val}
                              {isBest && key !== "type" && <span className="ml-1 text-xs">✓</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Price row */}
                  <tr className="bg-[#FFF7ED] border-t-2 border-orange-200">
                    <td className="px-4 py-4 text-xs font-bold text-[#44494d] uppercase">{lang === "zh" ? "价格" : "Giá bán"}</td>
                    {compareProducts.map((p: any) => {
                      const cheapest = Math.min(...compareProducts.map(x => (x as any).price));
                      return (
                        <td key={p.id} className="px-4 py-4 text-center">
                          <p className={`font-extrabold text-lg ${p.price === cheapest ? "text-green-600" : "text-[#1a4b97]"}`}>{fp(p.price)}</p>
                          {p.price === cheapest && <p className="text-xs text-green-600 font-semibold">{lang === "zh" ? "最低价" : "Giá tốt nhất"}</p>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Add to cart row */}
                  <tr className="bg-white border-t border-[#f0f0f0]">
                    <td className="px-4 py-3"></td>
                    {compareProducts.map((p: any) => (
                      <td key={p.id} className="px-4 py-3 text-center">
                        <a href={`/products/${p.id}`}
                          className="inline-block px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                          style={{ background: "var(--ap-primary)" }}>
                          {lang === "zh" ? "查看详情" : "Xem chi tiết"}
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

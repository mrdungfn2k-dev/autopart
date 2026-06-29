"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f5a623" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Đã xác minh
    </span>
  );
}

export default function SuppliersPage() {
  const { lang } = useLang();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (debouncedSearch) params.set("q", debouncedSearch);
    fetch(`/api/suppliers?${params}`)
      .then(r => r.json())
      .then(d => { setSuppliers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sort, debouncedSearch]);

  const formatCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  return (
    <div className="min-h-screen" style={{ background: "var(--ap-page-bg, #f8f8fa)" }}>
      <StorefrontHeader />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a4b97] to-[#0d2d5e] py-10 px-4 text-white text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-white">
          {lang === "zh" ? "供应商列表" : "Nhà Cung Cấp Uy Tín"}
        </h1>
        <p className="text-white/70 text-sm mb-6">
          {lang === "zh" ? "精选认证汽车配件供应商" : "Danh sách nhà cung cấp phụ tùng ô tô được xác minh"}
        </p>
        <div className="max-w-xl mx-auto relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === "zh" ? "搜索供应商名称、品牌..." : "Tìm nhà cung cấp theo tên, thương hiệu..."}
            className="w-full px-5 py-3 bg-white rounded-full text-[#44494d] text-sm outline-none shadow-lg pr-12"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8f9294]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Sort Bar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="text-sm font-semibold text-[#44494d]">
            {lang === "zh" ? "排序：" : "Sắp xếp:"}
          </span>
          {[
            { value: "rating", label: lang === "zh" ? "Đánh giá cao nhất" : "Đánh giá cao nhất" },
            { value: "orders", label: lang === "zh" ? "Đơn hàng nhiều nhất" : "Đơn hàng nhiều nhất" },
            { value: "products", label: lang === "zh" ? "Sản phẩm nhiều nhất" : "Sản phẩm nhiều nhất" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sort === opt.value
                  ? "text-white"
                  : "bg-white border border-[#e5e5e5] text-[#44494d] hover:border-[#1a4b97] hover:text-[#1a4b97]"
              }`}
              style={sort === opt.value ? { background: "var(--ap-primary, #1a4b97)" } : {}}
            >
              {opt.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-[#8f9294]">
            {lang === "zh" ? `共 ${suppliers.length} 家供应商` : `Tìm thấy ${suppliers.length} nhà cung cấp`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-[220px] animate-pulse" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-20 text-[#8f9294]">
            <svg className="mx-auto mb-3 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p className="font-medium">{lang === "zh" ? "暂无供应商" : "Không tìm thấy nhà cung cấp"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.map((sup, idx) => (
              <Link
                key={sup.id}
                href={`/suppliers/${sup.id}`}
                className="group bg-white rounded-2xl border border-[#f0f0f0] hover:border-[#1a4b97] hover:shadow-[0_4px_20px_rgba(26,75,151,0.12)] transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Banner top strip */}
                <div className="h-[60px] relative overflow-hidden bg-[#0d2d5e]">
                  <img src={sup.banner || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80"} alt="" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
                  {idx < 3 && (
                    <div className="absolute top-2 left-2">
                      <div className="flex flex-col items-center justify-start w-[24px] h-[32px] relative drop-shadow-sm">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 32" fill={idx === 0 ? "#fbb117" : idx === 1 ? "#94a3b8" : "#b45309"}>
                          <path d="M0 0h24v32l-12-5-12 5z"/>
                        </svg>
                        <span className="relative text-white text-[8px] font-bold z-10 leading-none mt-1">TOP</span>
                        <span className="relative text-white text-[12px] font-black z-10 leading-none mt-[1px]">{idx + 1}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="px-4 pb-4 flex-1 flex flex-col -mt-6">
                  {/* Logo + name */}
                  <div className="flex items-end gap-3 mb-3">
                    <div className="relative z-10 w-[52px] h-[52px] rounded-xl border-2 border-white shadow-md overflow-hidden bg-white shrink-0">
                      <img
                        src={sup.logo || "/ap-assets/supplier-default.svg"}
                        alt={sup.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).src = "/ap-assets/supplier-default.svg"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-7">
                      <h2 className="font-bold text-[14px] text-[#44494d] truncate group-hover:text-[#1a4b97] transition-colors">
                        {lang === "zh" ? (sup.nameZh || sup.name) : sup.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={sup.rating ?? 0} />
                        <span className="text-[11px] text-[#f5a623] font-semibold">{sup.rating?.toFixed(1)}</span>
                        <span className="text-[11px] text-[#8f9294]">({formatCount(sup.reviewCount ?? 0)} đánh giá)</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {sup.tags && sup.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {sup.tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="bg-[#eef2ff] text-[#1a4b97] text-[10px] px-2 py-0.5 rounded-full font-medium">{tag}</span>
                      ))}
                      {sup.verified && <VerifiedBadge />}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-[#f0f0f0]">
                    <div className="text-center">
                      <p className="text-[15px] font-bold text-[#44494d]">{formatCount(sup.totalProducts ?? 0)}</p>
                      <p className="text-[10px] text-[#8f9294]">{lang === "zh" ? "商品" : "Sản phẩm"}</p>
                    </div>
                    <div className="text-center border-x border-[#f0f0f0]">
                      <p className="text-[15px] font-bold text-[#44494d]">{formatCount(sup.totalOrders ?? 0)}</p>
                      <p className="text-[10px] text-[#8f9294]">{lang === "zh" ? "订单" : "Đơn hàng"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-bold text-[#44494d]">{sup.responseRate ?? 0}%</p>
                      <p className="text-[10px] text-[#8f9294]">{lang === "zh" ? "响应率" : "Phản hồi"}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <StorefrontFooter />
    </div>
  );
}

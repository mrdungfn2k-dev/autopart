"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import { addToCart } from "@/lib/cartStore";
import AddToCartToast, { useAddToCartToast } from "@/components/AddToCartToast";

const swatchMap: Record<string, { bg: string; color: string; label: string }> = {
  "brake-pad":      { bg: "#FEE2E2", color: "#DC2626", label: "Phanh" },
  "brake-disc":     { bg: "#FEE2E2", color: "#DC2626", label: "Đĩa" },
  "oil-filter":     { bg: "#FEF9C3", color: "#92400E", label: "Lọc" },
  "cabin-filter":   { bg: "#F0FDF4", color: "#166534", label: "Gió" },
  "spark-plug":     { bg: "#EDE9FE", color: "#6D28D9", label: "Bugi" },
  "battery":        { bg: "#DBEAFE", color: "#1D4ED8", label: "Ắcquy" },
  "engine-oil":     { bg: "#44494d", color: "#8f9294", label: "Nhớt" },
  "headlight":      { bg: "#FEF3C7", color: "#D97706", label: "Đèn" },
  "shock-absorber": { bg: "#D1FAE5", color: "#065F46", label: "Giảm" },
  "timing-belt":    { bg: "#F3F4F6", color: "#374151", label: "Curoa" },
  "radiator":       { bg: "#E0F2FE", color: "#0369A1", label: "Két" },
  "o2-sensor":      { bg: "#FDF4FF", color: "#7E22CE", label: "Cảm" },
};
function getSwatch(img: string) { return swatchMap[img] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" }; }

export default function SearchPage() {
  const { t, fp, lang } = useLang();
  const fireToast = useAddToCartToast();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setAllProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("bestseller");
  const [onlyOEM, setOnlyOEM] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceMax, setPriceMax] = useState(5000000);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState("");

  // Read ?q= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    setQuery(q);
  }, []);

  const filtered = allProducts
    .filter(p =>
      !query ||
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.oemCode?.toLowerCase().includes(query.toLowerCase()) ||
      p.brand?.toLowerCase().includes(query.toLowerCase())
    )
    .filter(p => !selectedType || p.type === selectedType)
    .filter(p => !onlyInStock || p.stock > 0)
    .filter(p => p.price <= priceMax)
    .sort((a, b) => {
      if (sortBy === "bestseller") return (b.sold ?? b.reviews ?? 0) - (a.sold ?? a.reviews ?? 0);
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const handleAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1, product);
    setCartIds(prev => new Set([...prev, product.id]));
    fireToast(product.name);
  };

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[1,2,3,4,5].map(i => (
        <span key={i} className="text-xs" style={{ color: i <= Math.round(rating ?? 0) ? "#FBBF24" : "#E2E8F0" }}>★</span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <AddToCartToast />
      <StorefrontHeader />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search input bar */}
        <div className="flex gap-2 mb-5">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") window.history.replaceState({}, "", `/search?q=${encodeURIComponent(query)}`); }}
            placeholder={lang === "zh" ? "寻找零件、OEM码、品牌..." : "Tìm phụ tùng, mã OEM, thương hiệu..."}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-white text-sm focus:outline-none focus:border-[#1a4b97]"
          />
          <button
            onClick={() => window.history.replaceState({}, "", `/search?q=${encodeURIComponent(query)}`)}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
            style={{ background: "var(--ap-primary)" }}>
            {t('searchBtn')}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-[#8f9294]">{t('productType')}:</span>
          {[["", t('all')], ["OEM", "OEM"], ["OES", "OES"], ["Generic", t('genericParts') || "Phổ thông"]].map(([v, l]) => (
            <button key={v} onClick={() => setSelectedType(v)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${selectedType === v ? "text-white border-[#1a4b97]" : "border-[#e5e5e5] text-slate-600 hover:border-orange-300"}`}
              style={selectedType === v ? { background: "var(--ap-primary)" } : {}}>
              {l}
            </button>
          ))}
          <label className="flex items-center gap-1.5 cursor-pointer ml-2">
            <input type="checkbox" checked={onlyInStock} onChange={e => setOnlyInStock(e.target.checked)} className="accent-orange-500" />
            <span className="text-xs text-slate-600">{t('inStock')}</span>
          </label>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[#8f9294] text-sm">
            {query ? <><span className="font-bold text-[#44494d]">"{query}"</span> — </> : `${t('all')} — `}
            <span className="font-bold" style={{ color: "var(--ap-primary)" }}>{filtered.length} {t('itemCount')}</span>
          </p>
          <div className="flex items-center gap-3">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-[#e5e5e5] rounded-lg bg-white text-sm focus:outline-none focus:border-[#1a4b97]">
              <option value="bestseller">{lang === "zh" ? "最畅销" : "Bán chạy nhất"}</option>
              <option value="rating">{lang === "zh" ? "评分高" : "Đánh giá cao"}</option>
              <option value="price_asc">{lang === "zh" ? "价格: 从低到高" : "Giá thấp → cao"}</option>
              <option value="price_desc">{lang === "zh" ? "价格: 从高到低" : "Giá cao → thấp"}</option>
            </select>
            <div className="flex border border-[#e5e5e5] rounded-lg overflow-hidden bg-white">
              <button onClick={() => setViewMode("grid")}
                className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "text-white" : "text-[#8f9294]"}`}
                style={viewMode === "grid" ? { background: "var(--ap-primary)" } : {}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" fillRule="evenodd"/>
                </svg>
              </button>
              <button onClick={() => setViewMode("list")}
                className={`px-3 py-2 transition-colors ${viewMode === "list" ? "text-white" : "text-[#8f9294]"}`}
                style={viewMode === "list" ? { background: "var(--ap-primary)" } : {}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-16 text-center">
          <p className="text-4xl mb-4 text-slate-300 font-bold">?</p>
            <p className="font-bold text-[#44494d] text-lg mb-2">{t('productsNoResult')} {lang === "zh" ? "匹配" : "phù hợp"}</p>
            <p className="text-[#8f9294] text-sm">{lang === "zh" ? "尝试其他关键词或调整过滤器" : "Thử tìm với từ khóa khác hoặc điều chỉnh bộ lọc"}</p>
            <button onClick={() => { setQuery(""); setSelectedType(""); setOnlyInStock(false); setPriceMax(5000000); }}
              className="mt-4 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
              {lang === "zh" ? "清除筛选" : "Xóa bộ lọc"}
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col">
                <Link href={`/products/${product.id}`} className="relative block">
                  <div className="aspect-[4/3] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)" }}>
                    <div style={{ background: getSwatch(product.image).bg, color: getSwatch(product.image).color, fontSize: "16px", fontWeight: "800", padding: "10px 16px", borderRadius: "8px" }}>{getSwatch(product.image).label}</div>
                  </div>
                  {(product.sold > 200) && (
                    <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: "var(--ap-primary)" }}>{lang === "zh" ? "最畅销" : "Bán chạy"}</span>
                  )}
                  {!(product.stock > 0) && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#8f9294] bg-white px-3 py-1 rounded-full border">{t("outOfStock")}</span>
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-[#8f9294] mb-1">{product.brand}</p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-[#44494d] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[#1a4b97] transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-2">
                    <Stars rating={product.rating} />
                    <span className="text-xs text-[#8f9294]">({product.reviewCount ?? 0})</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div>
                      <p className="font-extrabold" style={{ color: "var(--ap-primary)" }}>{fp(product.price)}</p>
                      {product.originalPrice && <p className="text-xs text-[#8f9294] line-through">{fp(product.originalPrice)}</p>}
                    </div>
                    <button onClick={e => handleAdd(e, product)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${cartIds.has(product.id) ? "bg-green-50 text-green-600" : "text-white"}`}
                      style={cartIds.has(product.id) ? {} : { background: "var(--ap-primary)" }}>
                      {cartIds.has(product.id) ? (lang === "zh" ? "✓ 已添加" : "✓ Đã thêm") : t('productsAddCart')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-[#f0f0f0] p-4 flex gap-4 hover:shadow-md transition-all group">
                <Link href={`/products/${product.id}`}>
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#f8f8fa" }}>
                    <span style={{ background: getSwatch(product.image).bg, color: getSwatch(product.image).color, fontSize: "12px", fontWeight: "bold", padding: "6px 10px", borderRadius: "6px" }}>{getSwatch(product.image).label}</span>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {(product.sold > 200) && <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ background: "var(--ap-primary)" }}>{lang === "zh" ? "最畅销" : "Bán chạy"}</span>}
                    {(product.type === "OEM") && <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">OEM</span>}
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-[#44494d] text-sm group-hover:text-[#1a4b97] transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-[#8f9294]">{product.brand}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Stars rating={product.rating} />
                    <span className="text-xs text-[#8f9294]">({product.reviewCount ?? 0})</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-lg" style={{ color: "var(--ap-primary)" }}>{fp(product.price)}</p>
                  {product.originalPrice && <p className="text-xs text-[#8f9294] line-through mb-2">{fp(product.originalPrice)}</p>}
                  <button onClick={e => handleAdd(e, product)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${cartIds.has(product.id) ? "bg-green-50 text-green-600" : "text-white"}`}
                    style={cartIds.has(product.id) ? {} : { background: "var(--ap-primary)" }}>
                    {cartIds.has(product.id) ? (lang === "zh" ? "✓ 已添加" : "✓ Đã thêm") : t('productsAddCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

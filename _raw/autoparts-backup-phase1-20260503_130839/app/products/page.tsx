"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { getFlagUrl } from "@/lib/data";
import { addToCart } from "@/lib/cartStore";
import CategoryNav from "@/components/CategoryNav";
import StorefrontHeader from "@/components/StorefrontHeader";
import AddToCartToast, { useAddToCartToast } from "@/components/AddToCartToast";
import CompareBar, { useCompare } from "@/components/CompareBar";
import { useSearchParams, useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";

const typeColors: Record<string, string> = {
  OEM: "bg-green-100 text-green-700",
  OES: "bg-blue-100 text-blue-700",
  Generic: "bg-yellow-100 text-yellow-700",
};

const swatchMap: Record<string, { bg: string; color: string; label: string }> = {
  "brake-pad":      { bg: "#FEE2E2", color: "#DC2626", label: "Phanh" },
  "brake-disc":     { bg: "#FEE2E2", color: "#DC2626", label: "Đĩa" },
  "oil-filter":     { bg: "#FEF9C3", color: "#92400E", label: "Lọc" },
  "cabin-filter":   { bg: "#F0FDF4", color: "#166534", label: "Lọc" },
  "spark-plug":     { bg: "#EDE9FE", color: "#6D28D9", label: "Bugi" },
  "battery":        { bg: "#DBEAFE", color: "#1D4ED8", label: "Ắcquy" },
  "engine-oil":     { bg: "#44494d", color: "#8f9294", label: "Nhớt" },
  "headlight":      { bg: "#FEF3C7", color: "#D97706", label: "Đèn" },
  "shock-absorber": { bg: "#D1FAE5", color: "#065F46", label: "Giảm" },
  "timing-belt":    { bg: "#F3F4F6", color: "#374151", label: "Curoa" },
  "radiator":       { bg: "#E0F2FE", color: "#0369A1", label: "Két" },
  "o2-sensor":      { bg: "#FDF4FF", color: "#7E22CE", label: "Cảm" },
};
function getSwatch(img: string) {
  return swatchMap[img] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" };
}

function ProductsInner() {
  const { t, fp, lang } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const fireToast = useAddToCartToast();
  const { ids: compareIds, toggle: toggleCompare } = useCompare();

  // ── Affiliate share helper ───────────────────────────────────────
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleShare = (e: React.MouseEvent, prodId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const auth = getAuth();
    const base = `${window.location.origin}/products/${prodId}`;
    // Only affiliates get a ref code embedded in the URL
    const url = auth?.role === "affiliate"
      ? `${base}?ref=${encodeURIComponent(auth.email.split("@")[0])}`
      : base;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedId(prodId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const PRICE_RANGES = [
    { label: t('all'), min: 0, max: Infinity },
    { label: lang === "zh" ? "低于500k" : "Dưới 500k", min: 0, max: 500000 },
    { label: lang === "zh" ? "500k – 200万" : "500k – 2 triệu", min: 500000, max: 2000000 },
    { label: lang === "zh" ? "200万 – 500万" : "2 triệu – 5 triệu", min: 2000000, max: 5000000 },
    { label: lang === "zh" ? "500万以上" : "Trên 5 triệu", min: 5000000, max: Infinity },
  ];

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [origins, setOrigins] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/origins?active=true").then(r => r.json()).then(d => setOrigins(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const brands = [...new Set(products.map((p: any) => p.brand))].sort() as string[];

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [selectedSubSub, setSelectedSubSub] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRangeIdx, setPriceRangeIdx] = useState(0);
  const [sort, setSort] = useState("popular");
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [cartIds, setCartIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const cat = searchParams.get("category");
    const sub = searchParams.get("sub");
    const subsub = searchParams.get("subsub");
    const orig = searchParams.get("origin");
    setSelectedCat(cat || "");
    setSelectedSub(sub || "");
    setSelectedSubSub(subsub || "");
    setSelectedOrigin(orig || "");
  }, [searchParams]);

  // Sync origin to URL for shareable links
  const handleOriginSelect = (originName: string) => {
    const newOrigin = selectedOrigin === originName ? "" : originName;
    setSelectedOrigin(newOrigin);
    const params = new URLSearchParams(searchParams.toString());
    if (newOrigin) params.set("origin", newOrigin);
    else params.delete("origin");
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const priceRange = PRICE_RANGES[priceRangeIdx];
  const filtered = products.filter(p =>
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.oemCode?.toLowerCase().includes(search.toLowerCase())) &&
    (selectedCat === "" || p.categoryId === selectedCat) &&
    (selectedSub === "" || p.name.toLowerCase().includes(selectedSub.replace(/-/g, ' ').toLowerCase())) &&
    (selectedSubSub === "" || p.name.toLowerCase().includes(selectedSubSub.replace(/-/g, ' ').toLowerCase())) &&
    (selectedType === "" || p.type === selectedType) &&
    (selectedBrand === "" || p.brand === selectedBrand) &&
    (selectedOrigin === "" || (p.origin && p.origin.toLowerCase().includes(selectedOrigin.toLowerCase()))) &&
    (p.price >= priceRange.min && p.price < priceRange.max)
  ).sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return (b.sold ?? b.reviews ?? 0) - (a.sold ?? a.reviews ?? 0);
  });

  const handleAddToCart = (e: React.MouseEvent, prod: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(prod.id, 1, prod); // pass full product data
    setCartIds(prev => new Set([...prev, prod.id]));
    fireToast(prod.name, prod.image);
  };

  const discountPct = (prod: any) =>
    prod.originalPrice && prod.originalPrice > prod.price
      ? Math.round((1 - prod.price / prod.originalPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen pb-20" style={{ background: "#f8f8fa" }}>
      <AddToCartToast />
      <StorefrontHeader />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-[#8f9294]">
        <Link href="/" className="hover:text-[#1a4b97]">{t('home') || (lang === "zh" ? "首页" : "Trang chủ")}</Link>{" / "}
        <Link href="/products" className={`hover:text-[#1a4b97] ${selectedOrigin ? '' : 'text-[#44494d] font-medium'}`}>{t('allProducts') || (lang === "zh" ? "所有产品" : "Tất cả sản phẩm")}</Link>
        {selectedOrigin && (
          <>{" / "}<span className="text-[#44494d] font-medium">{lang === "zh" ? "产地" : "Xuất xứ"}: {selectedOrigin}</span></>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 grid lg:grid-cols-4 gap-6">
        {/* Sidebar filter */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-4 sticky top-20 space-y-5 z-40">
            <h3 className="font-bold text-[#44494d] flex items-center gap-2">{t('filter')}</h3>

            {/* Search */}
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">{t('search').toUpperCase()}</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "zh" ? "名称，OEM码..." : "Tên, mã OEM..."}
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-2 block">{t('category').toUpperCase()}</label>
              <button onClick={() => { setSelectedCat(""); router.push("/products", { scroll: false }); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm mb-1 transition-colors ${selectedCat === "" ? "font-semibold text-white" : "text-slate-600 hover:bg-[#f8f8fa]"}`}
                style={selectedCat === "" ? { background: "var(--ap-primary)" } : {}}>
                {t('allCategories')}
              </button>
              <div className="-mx-1"><CategoryNav /></div>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-2 block">{t('productType')}</label>
              <div className="space-y-1.5">
                {[["", t('all')], ["OEM", t('originalOEM') || "OEM"], ["OES", t('aftermarketOES') || "OES"], ["Generic", t('genericParts') || "Generic"]].map(([v, l]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={selectedType === v} onChange={() => setSelectedType(v)} className="accent-orange-500" />
                    <span className="text-sm text-slate-600">{l}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-[#8f9294] mb-2 block">{t('brand').toUpperCase()}</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => setSelectedBrand("")}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${selectedBrand === "" ? "border-[#1a4b97] text-[#1a4b97] bg-orange-50" : "border-[#e5e5e5] text-slate-600 hover:border-orange-300"}`}>
                    {t('all')}
                  </button>
                  {brands.map(b => (
                    <button key={b} onClick={() => setSelectedBrand(b === selectedBrand ? "" : b)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${selectedBrand === b ? "border-[#1a4b97] text-[#1a4b97] bg-orange-50" : "border-[#e5e5e5] text-slate-600 hover:border-orange-300"}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Origin */}
            {origins.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-[#8f9294] mb-2 block">{lang === "zh" ? "产地" : "XUẤT XỨ"}</label>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => handleOriginSelect("")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedOrigin === "" ? "border-[#1a4b97] text-[#1a4b97] bg-blue-50" : "border-[#e5e5e5] text-slate-600 hover:border-[#1a4b97]"}`}>
                    {t('all')}
                  </button>
                  {origins.filter(o => !o.name.toLowerCase().includes('coming')).map(o => {
                    const displayName = o.name.replace(/\s*\(coming\)\s*/i, '').replace(/coming/i, '').trim();
                    const isActive = selectedOrigin.toLowerCase() === displayName.toLowerCase();
                    const flagUrl = getFlagUrl(displayName, o.image);
                    return (
                      <button key={o.id} onClick={() => handleOriginSelect(displayName)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${isActive ? "border-[#1a4b97] text-[#1a4b97] bg-blue-50 shadow-sm" : "border-[#e5e5e5] text-slate-600 hover:border-[#1a4b97]"}`}>
                        {flagUrl && <img src={flagUrl} alt={displayName} className="w-[16px] h-[11px] rounded-sm object-cover" />}
                        {lang === "zh" ? (o.nameZh || displayName) : displayName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-2 block">{t('price').toUpperCase()}</label>
              <div className="space-y-1.5">
                {PRICE_RANGES.map((r, i) => (
                  <label key={r.label} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={priceRangeIdx === i} onChange={() => setPriceRangeIdx(i)} className="accent-orange-500" />
                    <span className="text-sm text-slate-600">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset */}
            {(search || selectedType || selectedBrand || selectedOrigin || priceRangeIdx > 0) && (
              <button onClick={() => { setSearch(""); setSelectedType(""); setSelectedBrand(""); setSelectedOrigin(""); setPriceRangeIdx(0); }}
                className="w-full py-2 rounded-lg text-sm font-semibold text-[#1a4b97] border border-orange-200 hover:bg-orange-50 transition-colors">
                {lang === "zh" ? "清除筛选" : "Xóa bộ lọc"}
              </button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#8f9294] text-sm flex items-center gap-1 flex-wrap">
              <span className="font-bold text-[#44494d]">{filtered.length}</span> {t('itemCount')}
              {selectedBrand && <span className="ml-1 text-[#1a4b97] font-semibold">· {selectedBrand}</span>}
              {selectedOrigin && (
                <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1a4b97] border border-blue-200">
                  {getFlagUrl(selectedOrigin) && <img src={getFlagUrl(selectedOrigin)!} alt="" className="w-[14px] h-[10px] rounded-sm object-cover" />}
                  {selectedOrigin}
                  <button onClick={() => handleOriginSelect("")} className="ml-0.5 text-[#8f9294] hover:text-red-500 font-bold text-xs">✕</button>
                </span>
              )}
            </p>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="border border-[#e5e5e5] rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-[#1a4b97]">
              <option value="popular">{lang === "zh" ? "最受欢迎" : "Phổ biến nhất"}</option>
              <option value="rating">{lang === "zh" ? "评分最高" : "Đánh giá cao"}</option>
              <option value="price_asc">{lang === "zh" ? "价格升序" : "Giá tăng dần"}</option>
              <option value="price_desc">{lang === "zh" ? "价格降序" : "Giá giảm dần"}</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <p className="font-semibold">{t('productsNoResult')} {lang === "zh" ? "匹配" : "phù hợp"}</p>
              <button onClick={() => { setSearch(""); setSelectedCat(""); setSelectedType(""); setSelectedBrand(""); setSelectedOrigin(""); setPriceRangeIdx(0); }}
                className="mt-3 text-sm text-[#1a4b97] font-semibold hover:underline">{lang === "zh" ? "清除筛选" : "Xóa bộ lọc"}</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(prod => {
                const disc = discountPct(prod);
                const inCart = cartIds.has(prod.id);
                const sw = getSwatch(prod.image);
                return (
                  <Link key={prod.id} href={`/products/${prod.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#f0f0f0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col">

                    {/* Image */}
                    <div className="relative aspect-[4/3] flex items-center justify-center overflow-hidden" style={{ background: "#f8f8fa" }}>
                      <span style={{ background: sw.bg, color: sw.color, fontSize: "18px", fontWeight: "800", padding: "12px 18px", borderRadius: "8px" }}>
                        {sw.label}
                      </span>
                      {disc > 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-white text-xs font-extrabold" style={{ background: "#EF4444" }}>
                          -{disc}%
                        </span>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)" }}>
                        <button
                          onClick={e => handleAddToCart(e, prod)}
                          className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
                          style={{ background: inCart ? "#22C55E" : "var(--ap-primary)" }}>
                          {inCart ? (lang === "zh" ? "✓ 已添加" : "✓ Đã thêm") : (lang === "zh" ? "+ 加入购物车" : "+ Thêm vào giỏ")}
                        </button>
                      </div>
                      {/* Compare checkbox */}
                      <label onClick={e => e.stopPropagation()} className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 rounded-lg px-1.5 py-1 shadow cursor-pointer">
                        <input type="checkbox" className="accent-[#1a4b97] w-3 h-3"
                          checked={compareIds.includes(prod.id)}
                          onChange={e => { e.stopPropagation(); toggleCompare(prod.id); }}
                          disabled={!compareIds.includes(prod.id) && compareIds.length >= 3}
                        />
                        <span className="text-[9px] font-bold text-[#44494d]">{lang === "zh" ? "对比" : "So sánh"}</span>
                      </label>
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${typeColors[prod.type]}`}>{prod.type}</span>
                        {getFlagUrl(prod.origin) && <img loading="lazy" decoding="async" src={getFlagUrl(prod.origin)!} alt={prod.origin} className="w-[18px] h-[13px] rounded-sm object-cover shadow-sm border border-gray-200" title={prod.origin} />}
                        <span className="text-xs text-[#8f9294] truncate">{lang === "zh" ? ((prod as any).brandZh || prod.brand) : prod.brand}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#44494d] mb-1 line-clamp-2 flex-1">{lang === "zh" ? ((prod as any).nameZh || prod.name) : prod.name}</h3>
                      {prod.oemCode && <p className="text-xs font-mono text-[#8f9294] mb-1">{prod.oemCode}</p>}

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} className="text-xs" style={{ color: i <= Math.round(prod.rating ?? 0) ? "#FBBF24" : "#E2E8F0" }}>★</span>
                          ))}
                        </div>
                        <span className="text-xs text-[#8f9294]">({prod.reviewCount ?? prod.reviews ?? 0})</span>
                        <span className="text-xs text-slate-300 ml-auto">{(prod.sold ?? 0).toLocaleString()} {t('sold')}</span>
                      </div>

                      {/* Price + Share row */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-baseline gap-1.5 flex-1">
                          <span className="font-bold text-base" style={{ color: "var(--ap-primary)" }}>{fp(prod.price)}</span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="text-xs text-[#8f9294] line-through">{fp(prod.originalPrice)}</span>
                          )}
                        </div>
                        {/* Share button — visible to all, affiliate link embeds ref code */}
                        <button
                          onClick={e => handleShare(e, prod.id)}
                          title={lang === "zh" ? "分享链接" : "Sao chép link chia sẻ"}
                          className={`shrink-0 p-1.5 rounded-lg border transition-all ${
                            copiedId === prod.id
                              ? "border-green-300 bg-green-50 text-green-600"
                              : "border-[#e5e5e5] text-[#8f9294] hover:border-[#1a4b97] hover:text-[#1a4b97]"
                          }`}
                        >
                          {copiedId === prod.id ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                          )}
                        </button>
                      </div>

                      {/* Add to cart button */}
                      <button
                        onClick={e => handleAddToCart(e, prod)}
                        className={`w-full py-2 rounded-xl text-sm font-semibold text-white transition-all ${inCart ? "opacity-80" : "hover:opacity-90"}`}
                        style={{ background: inCart ? "#22C55E" : "var(--ap-primary)" }}>
                        {inCart ? (lang === "zh" ? "✓ 已添加" : "✓ Đã thêm vào giỏ") : t('productsAddCart')}
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Compare sticky bar */}
      <CompareBar products={filtered} fp={fp} lang={lang} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#8f9294]">Đang tải...</div>}>
      <ProductsInner />
    </Suspense>
  );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

function BrandLogo({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
      onError={(e) => {
        const el = e.target as HTMLImageElement;
        el.style.display = 'none';
        const parent = el.parentElement;
        if (parent && !parent.querySelector('.brand-fallback')) {
          const span = document.createElement('span');
          span.className = 'brand-fallback';
          span.style.cssText = `width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#1a4b97;color:white;border-radius:8px;font-weight:700;font-size:${Math.max(12, size/3)}px`;
          span.textContent = name.charAt(0);
          parent.appendChild(span);
        }
      }}
    />
  );
}

export default function CatalogPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fa" }}><div className="w-10 h-10 border-3 border-[#1a4b97] border-t-transparent rounded-full animate-spin"></div></div>}>
      <CatalogPageInner />
    </Suspense>
  );
}

interface Brand {
  id: string;
  name: string;
  region: string;
  logo: string;
}

interface CatalogModel {
  name: string;
  type: string;
  catalogUrl?: string;
}

const regionLabels: Record<string, { vi: string; zh: string; color: string }> = {
  japan: { vi: "Nhật Bản", zh: "日本", color: "#dc2626" },
  korea: { vi: "Hàn Quốc", zh: "韩国", color: "#2563eb" },
  europe: { vi: "Châu Âu", zh: "欧洲", color: "#059669" },
  usa: { vi: "Mỹ", zh: "美国", color: "#7c3aed" },
};

function CatalogPageInner() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const years = Array.from({ length: 16 }, (_, i) => (2025 - i).toString());

  useEffect(() => {
    fetch("/api/brands")
      .then(r => r.json())
      .then(d => {
        setBrands(Array.isArray(d.brands) ? d.brands : []);
        // Auto-select brand from URL
        const urlBrand = searchParams.get("brand");
        if (urlBrand) setSelectedBrand(urlBrand);
        const urlYear = searchParams.get("year");
        if (urlYear) setSelectedYear(urlYear);
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    if (!selectedBrand) { setModels([]); return; }
    setLoading(true);
    fetch(`/api/catalog/${selectedBrand}`)
      .then(r => r.json())
      .then(d => setModels(Array.isArray(d.models) ? d.models : []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, [selectedBrand]);

  const grouped = brands.reduce((acc, b) => {
    acc[b.region] = acc[b.region] || [];
    acc[b.region].push(b);
    return acc;
  }, {} as Record<string, Brand[]>);

  const filteredBrands = search
    ? brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const selectedBrandInfo = brands.find(b => b.id === selectedBrand);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />
      <main className="flex-1 max-w-[1280px] mx-auto w-full px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#8f9294] mb-6">
          <Link href="/" className="hover:text-[#1a4b97] transition-colors">
            {lang === "zh" ? "首页" : "Trang chủ"}
          </Link>
          <span>›</span>
          <span className="text-[#44494d] font-medium">
            {lang === "zh" ? "品牌目录" : "Danh mục thương hiệu"}
          </span>
          {selectedBrandInfo && (
            <>
              <span>›</span>
              <span className="text-[#1a4b97] font-semibold">{selectedBrandInfo.name}</span>
            </>
          )}
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#44494d]">
            {lang === "zh" ? "选择品牌查询配件目录" : "Chọn thương hiệu tra cứu danh mục phụ tùng"}
          </h1>
          <p className="text-[#8f9294] mt-1 text-sm">
            {lang === "zh"
              ? "选择您的车辆品牌以查看完整的零件目录和技术图纸"
              : "Chọn thương hiệu xe của bạn để xem toàn bộ danh mục phụ tùng và bản vẽ kỹ thuật"}
          </p>
        </div>

        {/* Search bar & Year Filter */}
        <div className="mb-6 flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f9294]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === "zh" ? "搜索品牌..." : "Tìm kiếm thương hiệu..."}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-[#1a4b97] transition-colors"
            />
            {/* Search results dropdown */}
            {search && filteredBrands.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-w-md overflow-hidden">
                {filteredBrands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBrand(b.id); setSearch(""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f0f4ff] transition-colors text-left border-b border-gray-50 last:border-0"
                  >
                    <BrandLogo src={b.logo} name={b.name} size={24} />
                    <span className="font-semibold text-[#44494d] text-sm">{b.name}</span>
                    <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: regionLabels[b.region]?.color + "15", color: regionLabels[b.region]?.color }}>
                      {lang === "zh" ? regionLabels[b.region]?.zh : regionLabels[b.region]?.vi}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:block w-[1px] h-[32px] bg-gray-200 mx-1"></div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[#8f9294] font-semibold text-sm whitespace-nowrap">{lang === "zh" ? "年份:" : "Đời xe:"}</span>
            <select
              value={selectedYear}
              onChange={e => {
                setSelectedYear(e.target.value);
                const currentUrl = new URL(window.location.href);
                if (e.target.value) currentUrl.searchParams.set("year", e.target.value);
                else currentUrl.searchParams.delete("year");
                window.history.pushState({}, '', currentUrl.toString());
              }}
              className="flex-1 sm:w-[140px] bg-white text-[#44494d] border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#1a4b97] text-sm font-semibold transition-colors cursor-pointer"
            >
              <option value="">{lang === "zh" ? "所有年份" : "Tất cả năm"}</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Brand Grid */}
          <div className={`${selectedBrand ? "lg:w-[320px] shrink-0" : "w-full"} transition-all`}>
            {Object.entries(grouped).map(([region, regionBrands]) => (
              <div key={region} className="mb-5">
                <h3 className="text-xs font-bold uppercase text-[#8f9294] mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: regionLabels[region]?.color }}></span>
                  {lang === "zh" ? regionLabels[region]?.zh : regionLabels[region]?.vi}
                </h3>
                <div className={`grid ${selectedBrand ? "grid-cols-2" : "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"} gap-2`}>
                  {regionBrands.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id === selectedBrand ? "" : b.id)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
                        b.id === selectedBrand
                          ? "border-[#1a4b97] bg-[#f0f4ff] shadow-md ring-2 ring-[#1a4b97]/20"
                          : "border-gray-100 bg-white hover:border-[#1a4b97]/30"
                      }`}
                    >
                      <BrandLogo src={b.logo} name={b.name} size={36} />
                      <span className={`text-xs font-semibold truncate w-full ${b.id === selectedBrand ? "text-[#1a4b97]" : "text-[#44494d]"}`}>
                        {b.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Model Results */}
          {selectedBrand && (
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #f8faff 0%, #fff 100%)" }}>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#44494d] flex items-center gap-2">
                      <BrandLogo src={selectedBrandInfo?.logo || ''} name={selectedBrandInfo?.name || ''} size={32} />
                      {selectedBrandInfo?.name}
                    </h2>
                    <p className="text-xs text-[#8f9294] mt-0.5">
                      {lang === "zh" ? "原装零件目录 — 数据来自国际技术数据库" : "Danh mục phụ tùng chính hãng — Dữ liệu từ CSDL Kỹ thuật quốc tế"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBrand("")}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#8f9294] transition-colors"
                  >✕</button>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex flex-col items-center py-12">
                      <div className="w-10 h-10 border-3 border-[#1a4b97] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-sm text-[#8f9294]">
                        {lang === "zh" ? "正在查询国际数据库..." : "Đang truy vấn CSDL quốc tế..."}
                      </p>
                    </div>
                  ) : models.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3"></div>
                      <p className="text-sm text-[#8f9294]">
                        {lang === "zh" ? "请选择区域以查看车型列表" : "Chọn khu vực để xem danh sách dòng xe"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Region links */}
                      {models.filter(m => m.type === "region").length > 0 && (
                        <div className="mb-5">
                          <h4 className="text-xs font-bold text-[#8f9294] uppercase mb-3">
                            {lang === "zh" ? "选择区域/市场" : "Chọn khu vực / Thị trường"}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {models.filter(m => m.type === "region").map((m, i) => (
                              <span key={i} className="px-4 py-2 rounded-lg bg-[#f0f4ff] text-[#1a4b97] font-semibold text-sm border border-[#1a4b97]/10 hover:bg-[#1a4b97] hover:text-white cursor-pointer transition-all">
                                {m.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Model links */}
                      {models.filter(m => m.type === "model").length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-[#8f9294] uppercase mb-3">
                            {lang === "zh" ? "车型 / 系列" : "Dòng xe / Series"}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {models.filter(m => m.type === "model").map((m, i) => (
                              <div
                                key={i}
                                onClick={() => router.push(`/search?q=${encodeURIComponent(m.name)}${selectedYear ? `&year=${selectedYear}` : ""}`)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-[#fafbfc] hover:border-[#1a4b97] hover:bg-[#f0f4ff] hover:shadow-sm cursor-pointer transition-all group active:scale-[0.98]"
                              >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-white border border-gray-100 p-1">
                                  <img src={selectedBrandInfo?.logo} alt={selectedBrandInfo?.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[#44494d] truncate group-hover:text-[#1a4b97] transition-colors">
                                    {m.name}
                                  </p>
                                  <p className="text-[10px] text-[#8f9294]">
                                    {lang === "zh" ? "查看零件目录" : "Xem danh mục phụ tùng"}
                                  </p>
                                </div>
                                <svg className="w-4 h-4 text-[#8f9294] ml-auto shrink-0 group-hover:text-[#1a4b97] transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {models.filter(m => m.type === "model").length === 0 && models.filter(m => m.type === "region").length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-sm text-[#8f9294]">
                            {lang === "zh" ? "暂无详细目录数据" : "Đang cập nhật dữ liệu danh mục chi tiết..."}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <StorefrontFooter />
    </div>
  );
}

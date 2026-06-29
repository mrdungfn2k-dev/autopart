"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLocalized, getFlagUrl } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import StorefrontFooter from "@/components/StorefrontFooter";
import StorefrontHeader from "@/components/StorefrontHeader";
import CategoryNav from "@/components/CategoryNav";
import { addToCart } from "@/lib/cartStore";
import AddToCartToast, { useAddToCartToast } from "@/components/AddToCartToast";
import RoundedSelect from "@/components/RoundedSelect";
import { useRates } from "@/lib/rates";
import LogoImage from "@/components/LogoImage";
import Pagination from "@/components/Pagination";

// ─── Find Parts by Vehicle ────────────────────────────────────────────────────
const sampleVINsHomePage: Record<string, { make: string; model: string; year: number; engine: string; }> = {
  "JTDBT923581234567": { make: "Toyota", model: "Vios", year: 2021, engine: "1.5L NZ-FE" },
  "MHFV2BE30K003456": { make: "Toyota", model: "Fortuner", year: 2019, engine: "2.4L 2GD-FTV Diesel" },
};

function FindPartsSection() {
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const { t, lang } = useLang();
  const [catalogBrands, setCatalogBrands] = useState<{id:string,name:string,region:string}[]>([]);
  useEffect(() => {
    fetch("/api/brands").then(r => r.json()).then(d => setCatalogBrands(Array.isArray(d.brands) ? d.brands : [])).catch(() => {});
  }, []);
  const years = Array.from({ length: 16 }, (_, i) => (2025 - i).toString());
  const [vin, setVin] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  return (
    <section className="bg-white rounded-[12px] px-[16px] py-[12px] shadow-sm mb-[10px] border border-transparent hover:border-[#1a4b97] transition-colors mt-[8px]">
      <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 justify-between">
        {/* Find by vehicle */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto">
          <span className="text-[#44494d] font-bold text-[13.5px] uppercase whitespace-nowrap mr-1 w-full sm:w-auto">{t("findByVehicle")}</span>
          <RoundedSelect className="flex-1 sm:w-[140px] min-w-0" value={brand} onChange={setBrand}
            placeholder={t("selectBrand")} options={catalogBrands.map(b => ({ value: b.id, label: b.name }))} />
          <RoundedSelect className="flex-1 sm:w-[110px] min-w-0" value={year} onChange={setYear}
            placeholder={t("selectYear")} options={years.map(y => ({ value: y, label: y }))} />
          <Link
            href={brand ? `/catalog?brand=${encodeURIComponent(brand)}${year ? `&year=${year}` : ""}` : "/catalog"}
            className="px-5 py-2 rounded-[12px] font-bold text-[13.5px] text-white transition-colors hover:opacity-90 whitespace-nowrap mt-2 sm:mt-0 w-full sm:w-auto text-center"
            style={{ background: "var(--ap-primary)" }}>
            {lang === "zh" ? "查询" : "Tra cứu"}
          </Link>
        </div>

        {/* Divider */}
        <div className="hidden xl:block w-[1px] h-[24px] bg-gray-200 mx-2"></div>

        {/* VIN Search */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
          <span className="text-[#44494d] font-bold text-[13.5px] uppercase whitespace-nowrap mr-1 w-full sm:w-auto">{t("vinQuickSearch")}</span>
          <div className="relative flex-1 sm:w-[200px]">
            <input
              value={vin} 
              onChange={e => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
                setVin(val);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={e => {
                if (e.key === "Enter" && vin) {
                  setShowDropdown(false);
                  router.push(`/vin-lookup?vin=${vin}`);
                }
              }}
              placeholder={lang === "zh" ? "输入车架号 (VIN)..." : "NHẬP SỐ VIN..."}
              maxLength={17}
              className="w-full bg-[#f8f8fa] text-[#44494d] border border-gray-200 rounded-[12px] px-3 py-2 outline-none focus:border-[#1a4b97] text-[13.5px] tracking-widest uppercase transition-colors"
            />
            {/* Live suggestions dropdown */}
            {showDropdown && vin.length > 0 && vin.length < 17 && (() => {
              const allVins = Object.entries(sampleVINsHomePage).map(([k, v]) => ({ vin: k, ...v }));
              const matches = allVins.filter(s => s.vin.includes(vin));
              if (matches.length === 0) return null;
              return (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-xl overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#f8f8fa] border-b border-[#f0f0f0]">
                    <span className="text-[10px] font-semibold text-[#8f9294] uppercase">{lang === "zh" ? "建议的VIN码" : "Đề xuất mã VIN"} ({matches.length})</span>
                  </div>
                  <div className="max-h-48 overflow-auto">
                    {matches.map(s => (
                      <div
                        key={s.vin}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setVin(s.vin);
                          setShowDropdown(false);
                          router.push(`/vin-lookup?vin=${s.vin}`);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#f0f4ff] transition-colors border-b border-[#f8f8fa] last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[11px] text-[#44494d] tracking-wider">{s.vin}</p>
                          <p className="text-[10px] text-[#8f9294] truncate">{s.make} {s.model} • {s.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
          <Link
            href={vin ? `/vin-lookup?vin=${vin}` : "/vin-lookup"}
            className="px-5 py-1.5 rounded-[6px] text-white font-bold transition-colors shrink-0 flex items-center justify-center hover:opacity-90 whitespace-nowrap text-[13.5px] mt-2 sm:mt-0 w-full sm:w-auto text-center"
            style={{ background: vin ? "var(--ap-primary)" : "#a2b0c3" }}>
            {t("vinBtn")}
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Hero Banner / Slider ─────────────────────────────────────────────────────────────

function DiscoverOriginsBar() {
  const { lang } = useLang();
  const [origins, setOrigins] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/origins?active=true', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setOrigins(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

// Removed inline getFlagUrl

  return (
    <div className="bg-gradient-to-r from-[#ffffff] to-[#e8f0fe] rounded-[12px] px-[20px] py-[10px] flex flex-wrap md:flex-nowrap items-center shadow-sm mb-[8px] mt-[8px] relative overflow-hidden border border-[#e0e7ff] min-h-[44px]">
      <span className="font-semibold text-[#44494d] text-[13.5px] mr-[20px] whitespace-nowrap z-20 flex items-center h-full">
        {lang === "zh" ? "探索货源 " : "Khám phá nguồn hàng của"}{" "}
        <LogoImage className="h-[14px] w-auto object-contain ml-1.5" />
      </span>
      
      <div className="flex items-center gap-[24px] overflow-x-auto sc-hide flex-1 z-20" style={{ scrollbarWidth: 'none' }}>
        {origins.map((o, i) => {
          const flagUrl = getFlagUrl(o.name, o.image);
          const isComing = o.name.toLowerCase().includes('coming');
          const displayName = o.name.replace(/\s*\(coming\)\s*/i, '').replace(/coming/i, '').trim();
          const LinkWrapper = isComing ? "div" : Link;
          return (
            <LinkWrapper 
              href={`/products?origin=${encodeURIComponent(displayName)}`}
              key={i} 
              className={`flex items-center gap-[6px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative group ${isComing ? 'pointer-events-none' : ''}`}
            >
              {flagUrl ? (
                <img loading="lazy" decoding="async" src={flagUrl} alt={o.name} className={`w-[20px] h-[20px] rounded-full object-cover shadow-sm border border-gray-200 bg-white group-hover:scale-110 transition-transform ${isComing ? 'grayscale opacity-60' : ''}`} />
              ) : (
                <div className="w-[20px] h-[20px] rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform"></div>
              )}
              <span className={`text-[13px] font-medium text-[#44494d] ${isComing ? 'opacity-60' : ''}`}>{lang === "zh" ? (o.nameZh || displayName) : displayName}</span>
              {isComing && (
                <span className="absolute -top-[10px] -right-[22px] bg-[#eef2ff] text-[#1a4b97] font-semibold border border-[#c7d2fe] text-[8px] px-1 rounded-[4px] scale-75 whitespace-nowrap hidden group-hover:block transition-all">Coming...</span>
              )}
            </LinkWrapper>
          );
        })}
      </div>
      
      {/* Decorative stars/shapes on the right */}
      <div className="absolute right-0 top-0 bottom-0 w-[180px] pointer-events-none z-10 flex items-center justify-end pr-2 overflow-hidden">
         <svg width="150" height="44" viewBox="0 0 150 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* SVG watermark in blue tone */}
            <path d="M120 22 l4 -6 l8 2 l-5 5 l5 5 l-8 2 l-4 -6 Z" fill="#1a4b97" opacity="0.08" />
            <path d="M140 10 Q145 5 150 10 Q145 15 140 10 Z" fill="#1a4b97" opacity="0.05" />
            <path d="M90 28 Q100 18 110 32 Q100 42 90 35 Q85 30 90 28 Z" fill="none" stroke="#1a4b97" strokeWidth="2.5" opacity="0.08" />
         </svg>
      </div>
    </div>
  );
}

function HeroBanner() {
  const { lang } = useLang();
  const [banners, setBanners] = useState<any[]>([]);
  const [origins, setOrigins] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch("/api/banners?active=true")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d) && d.length > 0) setBanners(d);
        else {
          // Fallback if no admin banners exist yet
          setBanners([
            { id: "1", image: "https://s3-north1.viettelidc.com.vn/viposeller/viposeller/2026/01/16/08/10/03/aebf3b23-1336-4cd9-a895-41404fcedeb7.jpg", alt: "Banner VIPO T1.26", href: "#" },
            { id: "2", image: "https://s3-north1.viettelidc.com.vn/viposeller/viposeller/%2F1411a343-a815-4a44-9785-0e0954f3ae8b.jpg", alt: "Banner VIPO 1", href: "#" }
          ]);
        }
      })
      .catch(() => {});

    fetch('/api/origins?active=true')
      .then(r => r.json())
      .then(d => setOrigins(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setIdx(p => (p + 1) % banners.length), 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  const prev = () => setIdx(p => (p - 1 + banners.length) % banners.length);
  const next = () => setIdx(p => (p + 1) % banners.length);

  if (banners.length === 0) return <div className="h-[357px] bg-[#f4f4f4] rounded-[12px] w-full mb-[6px] animate-pulse" />;

  return (
    <div className="flex flex-col lg:flex-row items-stretch pt-[6px] pb-[16px] mb-[6px] w-full lg:gap-0 gap-[16px]">
      {/* Banner Carousel */}
      <div className="flex-1 relative h-[220px] md:h-[300px] lg:h-[357px] rounded-[12px] overflow-hidden group lg:mr-[16px] bg-[#f4f4f4] w-full">
        {banners.map((b, i) => (
          <Link href={b.href || "#"} key={b.id || i}
            className={`absolute inset-0 w-full h-full block transition-opacity duration-700 ${i === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10 cursor-default'}`}
          >
            <img loading="lazy" decoding="async" src={b.image || b.src} alt={b.title || b.alt || "Banner"} className="w-full h-full object-cover" />
          </Link>
        ))}
        {/* Prev / Next */}
        {banners.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white" style={{ transform: 'translateY(-50%) scaleX(-1)' }}>
              <img loading="lazy" decoding="async" src="/ap-assets/icon-next-see.svg" alt="prev" className="w-[14px] h-[14px]" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white">
              <img loading="lazy" decoding="async" src="/ap-assets/icon-next-see.svg" alt="next" className="w-[14px] h-[14px]" />
            </button>
          </>
        )}
        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-[6px] items-center z-10">
            {banners.map((_, i) => (
              <div key={i} onClick={() => setIdx(i)} className={`rounded-full cursor-pointer transition-all ${i === idx ? 'w-[20px] h-[6px] bg-white' : 'w-[6px] h-[6px] bg-transparent border border-white hover:bg-white/50'}`}></div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar (.order-container) */}
      <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-[12px]">
        {/* Đơn hàng của tôi */}
        <div className="flex-1 lg:flex-none bg-white rounded-[12px] p-[16px] flex flex-col shadow-sm h-[155px]">
           <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-[#44494d] text-[15px] leading-[21px] tracking-[0.02em]">{lang === "zh" ? "我的订单" : "Đơn hàng của tôi"}</h3>
           </div>
           
           <div className="grid grid-cols-4 gap-[2px] text-center mt-1">
              <div className="flex flex-col items-center gap-[2px] cursor-pointer">
                <div className="w-[32px] h-[32px] flex items-center justify-center">
                   <img loading="lazy" decoding="async" src="/ap-assets/money-time-new.svg" alt="" className="w-[24px] h-[24px]" />
                </div>
                <span className="text-[11px] font-normal text-[#8f9294] mt-1 leading-[14px] h-[28px] flex items-start justify-center">{lang === "zh" ? "待付款" : "Chờ thanh toán"}</span>
                <span className="text-[16px] font-medium text-[#44494d]">0</span>
              </div>
              <div className="flex flex-col items-center gap-[2px] cursor-pointer">
                <div className="w-[32px] h-[32px] flex items-center justify-center">
                   <img loading="lazy" decoding="async" src="/ap-assets/time-new.svg" alt="" className="w-[24px] h-[24px]" />
                </div>
                <span className="text-[11px] font-normal text-[#8f9294] mt-1 leading-[14px] h-[28px] flex items-start justify-center">{lang === "zh" ? "待处理" : "Chờ xử lý"}</span>
                <span className="text-[16px] font-medium text-[#44494d]">0</span>
              </div>
              <div className="flex flex-col items-center gap-[2px] cursor-pointer relative">
                <div className="w-[32px] h-[32px] flex items-center justify-center">
                   <img loading="lazy" decoding="async" src="/ap-assets/delivery-time-new.svg" alt="" className="w-[24px] h-[24px]" />
                </div>
                <span className="text-[11px] font-normal text-[#8f9294] mt-1 leading-[14px] h-[28px] flex items-start justify-center">{lang === "zh" ? "待发货" : "Chờ giao hàng"}</span>
                <span className="text-[16px] font-medium text-[#44494d]">0</span>
              </div>
              <div className="flex flex-col items-center gap-[2px] cursor-pointer">
                <div className="w-[32px] h-[32px] flex items-center justify-center">
                   <img loading="lazy" decoding="async" src="/ap-assets/truck-fast-new.svg" alt="" className="w-[24px] h-[24px]" />
                </div>
                <span className="text-[11px] font-normal text-[#8f9294] mt-1 leading-[14px] h-[28px] flex items-start justify-center">{lang === "zh" ? "配送中" : "Đang giao hàng"}</span>
                <span className="text-[16px] font-medium text-[#44494d]">0</span>
              </div>
           </div>
        </div>

        {/* Khám phá nguồn */}
        <div className="bg-white rounded-[12px] p-[16px] flex flex-col flex-1 shadow-sm h-full relative overflow-hidden text-center z-10 border border-gray-50" style={{ background: 'linear-gradient(180deg, #fff9f9 0%, #ffffff 100%)' }}>
           <div className="flex flex-col items-center justify-center gap-2 mb-4 mt-1">
              {/* AP Logo inside card */}
              <div className="flex items-center gap-1.5">
                <LogoImage className="h-[20px] w-auto object-contain" />
              </div>
              
              {/* Clean Subtitle */}
              {lang === "zh" ? (
                <p className="text-[12.5px] text-[#44494d] leading-[18px]">提供<span className="text-[#1a4b97] font-medium">正宗汽车零件</span>的平台</p>
              ) : (
                <p className="text-[12.5px] text-[#44494d] leading-[18px]">Nền tảng cung cấp<br/><span className="text-[#1a4b97] font-medium">phụ tùng ô tô chính hãng</span></p>
              )}
           </div>
           
           <div className="flex justify-between items-center px-1 mt-auto w-full overflow-x-auto sc-hide gap-1" style={{ scrollbarWidth: 'none' }}>
              {origins.map((o, i) => {
                const flagUrl = getFlagUrl(o.name, o.image);
                const isComing = o.name.toLowerCase().includes('coming');
                const displayName = o.name.replace(/\s*\(coming\)\s*/i, '').replace(/coming/i, '').trim();
                const LinkWrapper = isComing ? "div" : Link;
                return (
                  <LinkWrapper 
                    href={isComing ? "#" : `/products?origin=${encodeURIComponent(displayName)}`}
                    key={i} 
                    className={`flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity relative ${isComing ? 'pointer-events-none' : ''}`}
                  >
                    {flagUrl ? (
                      <img loading="lazy" decoding="async" src={flagUrl} alt={o.name} className={`w-[36px] h-[36px] rounded-full object-cover shadow-sm border border-gray-100 bg-white ${isComing ? 'grayscale opacity-60' : ''}`} />
                    ) : (
                      <div className="w-[36px] h-[36px] rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-[12px]">{displayName.substring(0,1)}</div>
                    )}
                    <span className={`text-[11px] text-[#44494d] ${isComing ? 'opacity-60' : ''}`}>{lang === "zh" ? (o.nameZh || displayName) : displayName}</span>
                    {isComing && (
                      <span className="absolute -top-[6px] -right-[12px] bg-[#001030] text-white text-[8px] px-1 rounded-sm scale-75 whitespace-nowrap z-10">Coming...</span>
                    )}
                  </LinkWrapper>
                );
              })}
           </div>
           
           {/* Background decorative shapes */}
           <div className="absolute top-0 right-0 w-24 h-24 bg-[#e8f0fd] rounded-full -mr-10 -mt-10 -z-10 blur-xl"></div>
           <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#fff5e5] rounded-full -ml-10 -mb-10 -z-10 blur-xl"></div>
        </div>
      </div>
    </div>
  );
}

// ─── Category Section (Menu Cuộn Ngang Vipo) ─────────────────────────────────────────────────────────
function CategorySection() {
  const { t, lang } = useLang();
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  
  return (
    <div className="pb-[32px] relative">
      <div className="bg-white rounded-[12px] p-[16px] flex items-start gap-[15px] overflow-x-hidden w-full m-0">
        {categories.slice(0, 10).map((rawCat, i) => {
          const cat = getLocalized(rawCat, lang);
          const rc = rawCat as { img?: string; icon?: string; count: number; color: string };
          // Random preset Vipo colors for category background like their style #f9f9f9 usually, or tinted
          return (
            <Link key={cat.id} href={`/products?category=${cat.id}`} className="group flex flex-col items-center mx-[8px] w-[80px] shrink-0">
              <div className="w-[48px] h-[48px] rounded-[16px] overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 mt-[10px] bg-[#f9f9f9]">
                <img loading="lazy" decoding="async" src={rc.img || rc.icon} alt={cat.name} className="w-[48px] h-[48px] object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <span className="text-[14px] font-normal text-[#44494d] text-center leading-[19.6px] tracking-[0.02em] mt-[10px]">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Component Product Card (Dùng Chung Cho FlashSale & Feature) ────────────────────
function APProductCard({ prod, lang }: { prod: any, lang: string }) {
  const { fp } = useLang();
  const fireToast = useAddToCartToast();
  const rates = useRates();

  const flagUrl = getFlagUrl(prod.origin);

  return (
    <div className="w-full px-[7px] mb-[16px]">
      <div className="item-content flex flex-col w-full h-full bg-white rounded-[12px] border border-transparent hover:border-[#1a4b97] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer pb-2 relative group pt-[2px]">
        <Link href={`/products/${prod.id}`} className="block w-full relative">
          <div className="w-full h-[182px] overflow-hidden relative rounded-t-[10px] mx-auto w-[calc(100%-4px)]">
            <img loading="lazy" decoding="async" 
              src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} 
              alt={prod.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => { (e.target as HTMLImageElement).src = "/ap-assets/img-product-clone.png"; }} 
            />
            {flagUrl && (
              <img loading="lazy" decoding="async" src={flagUrl} alt={prod.origin} title={prod.origin} className="absolute top-[4px] left-[6px] w-[20px] h-[14px] z-10 shadow-sm rounded-sm" />
            )}
            {prod.discount && (
               <span className="absolute top-0 right-0 bg-[#1a4b97] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-bl-[8px] z-10">
                 {lang === "zh" ? "减" : "GIẢM"} {prod.discount}%
               </span>
            )}
          </div>
          {/* Tỉ lệ mua lại overlay chèn ra ngoài ảnh (half on image, half on white body) */}
          <div className="absolute -bottom-[10px] left-[2px] bg-white text-[#1a4b97] text-[12px] font-normal px-[10px] py-[2px] rounded-r-[12px] h-[20px] leading-[16.8px] tracking-[0.02em] z-20" style={{ boxShadow: '2px 2px 6px rgba(0,0,0,0.06)' }}>
            {lang === "zh" ? "回购率" : "Tỉ lệ mua lại"} {prod.repurchaseRate || 95}%
          </div>
        </Link>
        
        <div className="p-[8px] flex flex-col flex-1 justify-between min-h-[100px] mt-[4px]">
          <Link href={`/products/${prod.id}`}>
            <div className="relative pb-1 name-content">
               {prod.oem && (
                  <span className="absolute top-0 left-0 bg-[var(--ap-primary)] text-white text-[11px] h-[16.8px] leading-[16.8px] w-[48px] flex justify-center items-center rounded-br-[2px] rounded-tr-[6px] overflow-hidden z-10">
                    OEM
                  </span>
               )}
               <div className="text-[14px] text-[#44494d] font-light leading-[21px] line-clamp-2 h-[42px] overflow-hidden tracking-[0.02em] break-words" style={prod.oem ? {textIndent: '54px'} : {}}>
                 {getLocalized(prod, lang).name}
               </div>
            </div>
          </Link>

          <div className="flex flex-col mt-[4px]">
            <div className="flex items-start flex-col mt-0">
               <span className="font-medium text-[17px] text-[var(--ap-primary)] tracking-[0.02em] leading-[23.8px]">{fp(prod.price)}</span>
               <span className="text-[14px] text-[#44494d] leading-[19.6px] font-normal tracking-[0.02em]">¥ {prod.cnyPrice ?? (prod.price / rates.CNY).toFixed(1)}</span>
            </div>
            <div className="text-[11px] text-[#8f9294] mt-[4px] leading-[16.8px] min-h-[18px]">
               {lang === "zh" ? "已售" : "Đã bán"} {prod.sold ?? 0}
            </div>
          </div>
          
          <button
            onClick={(e) => { e.preventDefault(); addToCart(prod.id, 1, prod); fireToast(prod.name); }}
            className="absolute bottom-3 right-3 w-[28px] h-[28px] rounded-full bg-[#e8f0fd] hover:bg-[#1a4b97] text-[#1a4b97] hover:text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shadow-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Component Nhanh Dành Cho Flash Sale (Không Có Tên Sản Phẩm) ─────────────
function FlashSaleCard({ prod }: { prod: any }) {
  const { fp } = useLang();
  return (
    <div className="w-full px-[7px] mb-[16px]">
      <Link href={`/products/${prod.id}`} className="block w-full">
        <div className="flex flex-col w-full bg-white rounded-[12px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1">
          <div className="w-full aspect-square overflow-hidden relative bg-[#f8f8fa]">
            <img loading="lazy" decoding="async" 
              src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} 
              alt="Flash Sale"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="w-full bg-[var(--ap-primary)] h-[44px] flex items-center justify-start px-3 text-white">
             <span className="font-semibold text-[17px] tracking-wide">{fp(prod.price)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Flash Sale Section ──────────────────────────────────────────────────────
function FlashSaleSection() {
  const { fp, lang } = useLang();
  const fireToast = useAddToCartToast();
  const [campaign, setCampaign] = useState<any>(null);
  const [fallbackProducts, setFallbackProducts] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    fetch("/api/flash-sales?active=true")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data[0]) setCampaign(data[0]); })
      .catch(() => {});
    // Fallback: load regular products in case no active campaign
    fetch("/api/products")
      .then(r => r.json())
      .then(d => setFallbackProducts(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!campaign?.endTime) return;
    const tick = () => {
      const diff = Math.max(0, new Date(campaign.endTime).getTime() - Date.now());
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [campaign?.endTime]);

  const items = campaign?.products?.slice(0, 6) || fallbackProducts;
  if (items.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="rounded-[12px] p-[16px] relative mb-[16px] border border-transparent" style={{ backgroundImage: 'url(/ap-assets/category-blue.svg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#fff' }}>
        <div className="flex items-center justify-between mb-[20px]">
          <div className="flex items-center gap-[8px]">
            {lang === "zh" ? (
              <div className="flex items-center text-[#1a4b97] italic font-black text-[22px] px-2 tracking-wide">
                 限时特惠
                 <svg className="w-6 h-6 ml-1 text-[#1a4b97]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"></path></svg>
              </div>
            ) : lang === "en" ? (
              <div className="flex items-center text-[#1a4b97] italic font-black text-[22px] px-2 tracking-wide">
                 Daily Best Deals
                 <svg className="w-6 h-6 ml-1 text-[#1a4b97]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"></path></svg>
              </div>
            ) : (
              <img loading="lazy" decoding="async" src="/ap-assets/price-good-ic.png" alt="" className="h-[28px]" />
            )}
            <div className="flex items-center text-white ml-2 gap-[4px]">
              <div className="w-[26px] h-[21px] rounded-[4px] flex justify-center items-center bg-[var(--ap-primary-dark)]">
                <span className="text-[14px] font-normal leading-[21px] tracking-[0.02em] text-center">{pad(timeLeft.h)}</span>
              </div>
              <p className="text-[12px] font-normal leading-[18px] text-[#44494d] mx-[4px] text-center">:</p>
              <div className="w-[26px] h-[21px] rounded-[4px] flex justify-center items-center bg-[var(--ap-primary-dark)]">
                <span className="text-[14px] font-normal leading-[21px] tracking-[0.02em] text-center">{pad(timeLeft.m)}</span>
              </div>
              <p className="text-[12px] font-normal leading-[18px] text-[#44494d] mx-[4px] text-center">:</p>
              <div className="w-[26px] h-[21px] rounded-[4px] flex justify-center items-center bg-[var(--ap-primary-dark)]">
                <span className="text-[14px] font-normal leading-[21px] tracking-[0.02em] text-center">{pad(timeLeft.s)}</span>
              </div>
            </div>
          </div>
          <Link href="/flash-sale" className="flex items-center gap-[4px] text-[14px] font-medium text-[#44494d] leading-[19.6px] tracking-[0.02em] text-right cursor-pointer hover:opacity-80">
            <span>{lang === "zh" ? "查看更多" : "Xem thêm"}</span>
            <img loading="lazy" decoding="async" src="/ap-assets/icon-next-see.svg" alt="" className="w-[14px] h-[14px]" />
          </Link>
        </div>

        <div className="flex flex-wrap -mx-[7px]">
          {items.map((item: any) => (
             <div className="w-1/2 md:w-1/3 lg:w-1/6" key={item.id}>
               <FlashSaleCard prod={item} />
             </div>
          ))}
        </div>
    </div>
  );
}

// ─── Featured Products (Dành Cho Bạn - Gợi ý) ────────────────────────────────────────────────────────
function FeaturedProducts() {
  const { fp, lang } = useLang();
  const fireToast = useAddToCartToast();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products?isTrending=true").then(r => r.json()).then(d => setFeaturedProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="rounded-[12px] p-[16px] relative mb-[40px] shadow-sm" style={{ backgroundImage: 'url(/ap-assets/unmissable-blue.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#fff' }}>
        <div className="flex items-center justify-between mb-[20px]">
          <div className="flex items-center gap-[6px]">
             <span className="text-[17px] font-bold text-[#44494d] uppercase tracking-[0.02em]">{lang === "zh" ? "热门产品" : "SẢN PHẨM TRENDING"}</span>
             <img loading="lazy" decoding="async" src="/ap-assets/trending-icon.svg" alt="" className="w-[20px] h-[20px]" />
          </div>
          <Link href="/products" className="text-[14px] font-medium text-[var(--ap-primary)] cursor-pointer hover:opacity-80">
            {lang === "zh" ? "查看更多 >" : "Xem thêm >"}
          </Link>
        </div>
        
        <div className="flex flex-wrap -mx-[7px]">
          {featuredProducts.slice(0, 6).map(prod => (
             <div className="w-1/2 md:w-1/3 lg:w-1/6" key={prod.id}>
                <APProductCard prod={prod} lang={lang} />
             </div>
          ))}
        </div>
    </div>
  );
}

// ─── Sản phẩm hot bán chạy ─────────────────────────────────────────────
function HotBestSellers() {
  const { fp, lang } = useLang();
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products?isHot=true")
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d.sort(() => Math.random() - 0.5) : []))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const displayItems = [];
  for (let i = 0; i < 10; i++) {
    displayItems.push(products[i % products.length]);
  }

  return (
    <section className="mb-[20px]">
      {/* Title */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[8px]">
          <img loading="lazy" decoding="async" src="/ap-assets/star-3.svg" alt="" className="w-[28px] h-[28px]" />
          <h2 className="text-[17px] font-bold text-[#44494d] uppercase tracking-[0.02em]">
            {lang === "zh" ? <>热销 <span className="text-[#1a4b97]">配件</span></> : <>Phụ tùng hot <span className="text-[#1a4b97]">bán chạy</span></>}
          </h2>
        </div>
      </div>

      {/* Content: Big Image Left + Grid Right */}
      <div className="bg-gradient-to-br from-[#d4e4fc] to-[#f2f6fc] rounded-[16px] p-[16px] shadow-[0_4px_20px_rgba(26,75,151,0.06)] border border-[#a2c2f6] hover:border-[#1a4b97] transition-all duration-300">
        <div className="flex gap-[16px]">
          {/* Left: Large Image Slider */}
          <div className="w-[220px] flex-shrink-0 hidden lg:block">
            <Link href={`/products/${displayItems[0]?.id}`} className="w-full aspect-[2/3] rounded-[12px] overflow-hidden bg-[#f8f8fa] relative block group hover:opacity-95 transition-opacity">
              <img loading="lazy" decoding="async"
                src={displayItems[0]?.image || displayItems[0]?.img || "/ap-assets/img-product-clone.png"}
                alt="Hot Product"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right: Grid of products */}
          <div className="flex-1">
            {/* Mid Row: 4 medium images (2x2) */}
            <div className="grid grid-cols-2 gap-[8px] mb-[8px]">
              {displayItems.slice(1, 5).map((prod, i) => (
                <Link href={`/products/${prod.id}`} key={`${prod.id}-${i}`} className="aspect-square rounded-[12px] overflow-hidden bg-[#f8f8fa] block hover:opacity-90 transition-opacity">
                  <img loading="lazy" decoding="async" src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover" />
                </Link>
              ))}
            </div>
            {/* Bottom Row: 5 small images with count */}
            <div className="grid grid-cols-5 gap-[8px]">
              {displayItems.slice(5, 10).map((prod, i) => (
                <Link href={`/products/${prod.id}`} key={`${prod.id}-${i}`} className="relative aspect-square rounded-[12px] overflow-hidden bg-[#f8f8fa] block hover:opacity-90 transition-opacity">
                  <img loading="lazy" decoding="async" src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover" />
                  {(prod.sold ?? 0) > 0 && (
                    <div className="absolute bottom-[6px] right-[6px] bg-black/60 text-white text-[11px] px-[6px] py-[2px] rounded-full">
                      {(prod.sold ?? 0) >= 1000 ? ((prod.sold ?? 0) / 1000).toFixed(1) + "k" : prod.sold}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            {/* Xem thêm button */}
            <div className="flex justify-end mt-[12px]">
              <Link href="/products" className="text-[14px] font-medium text-[var(--ap-primary)] flex items-center gap-1 hover:opacity-80">
                {lang === "zh" ? "查看更多" : "Xem thêm"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sản phẩm hot từ 1688 ──────────────────────────────────────────────
function Hot1688Section() {
  const { fp, lang } = useLang();
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products?isImported=true")
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d.sort(() => Math.random() - 0.5) : []))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const displayItems = [];
  for (let i = 0; i < 10; i++) {
    displayItems.push(products[i % products.length]);
  }

  return (
    <section className="mb-[20px]">
      {/* Title */}
      <div className="flex items-center justify-between mb-[16px]">
        <div className="flex items-center gap-[8px]">
          <img loading="lazy" decoding="async" src="/ap-assets/nh-1688.svg" alt="1688" className="w-[32px] h-[32px]" />
          <h2 className="text-[17px] font-bold text-[#44494d] uppercase tracking-[0.02em]">
            {lang === "zh" ? <>原装 <span className="text-[#1a4b97]">进口配件</span></> : <>Phụ tùng nhập khẩu <span className="text-[#1a4b97]">chính hãng</span></>}
          </h2>
        </div>
      </div>

      {/* Content Grid */}
      <div className="bg-gradient-to-br from-[#d4e4fc] to-[#f2f6fc] rounded-[16px] p-[16px] shadow-[0_4px_20px_rgba(26,75,151,0.06)] border border-[#a2c2f6] hover:border-[#1a4b97] transition-all duration-300">
        <div className="flex gap-[16px]">
          {/* Left: Large Image */}
          <div className="w-[220px] flex-shrink-0 hidden lg:block">
            <Link href={`/products/${displayItems[0]?.id}`} className="w-full aspect-[2/3] rounded-[12px] overflow-hidden bg-[#f8f8fa] block group hover:opacity-95 transition-opacity">
              <img loading="lazy" decoding="async"
                src={displayItems[0]?.image || displayItems[0]?.img || "/ap-assets/img-product-clone.png"}
                alt="1688 Products" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right: Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-[8px] mb-[8px]">
              {displayItems.slice(1, 5).map((prod, i) => (
                <Link href={`/products/${prod.id}`} key={`${prod.id}-${i}`} className="aspect-square rounded-[12px] overflow-hidden bg-[#f8f8fa] block hover:opacity-90 transition-opacity">
                  <img loading="lazy" decoding="async" src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover" />
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-[8px]">
              {displayItems.slice(5, 10).map((prod, i) => (
                <Link href={`/products/${prod.id}`} key={`${prod.id}-${i}`} className="relative aspect-square rounded-[12px] overflow-hidden bg-[#f8f8fa] block hover:opacity-90 transition-opacity">
                  <img loading="lazy" decoding="async" src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover" />
                  {(prod.sold ?? 0) > 0 && (
                    <div className="absolute bottom-[6px] right-[6px] bg-black/60 text-white text-[11px] px-[6px] py-[2px] rounded-full">
                      {(prod.sold ?? 0) >= 1000 ? ((prod.sold ?? 0) / 1000).toFixed(1) + "k" : prod.sold}
                    </div>
                  )}
                </Link>
              ))}
            </div>
            <div className="flex justify-end mt-[12px]">
              <Link href="/products" className="text-[14px] font-medium text-[var(--ap-primary)] flex items-center gap-1 hover:opacity-80">
                {lang === "zh" ? "查看更多" : "Xem thêm"}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SẢN PHẨM MỚI (phân trang chuẩn — thay cho nút "Xem thêm") ───────────────
const NEW_PAGE_SIZE = 30;
function NewProductsSection() {
  const { fp, lang } = useLang();
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  if (products.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(products.length / NEW_PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const shown = products.slice((pageSafe - 1) * NEW_PAGE_SIZE, pageSafe * NEW_PAGE_SIZE);
  const goPage = (p: number) => { setPage(p); try { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch {} };

  return (
    <section className="mb-[40px]">
      {/* Title - Pinned header style */}
      <div ref={topRef} className="flex items-center justify-between mb-[16px] sticky top-0 z-20 bg-[#f8f8fa] py-[10px] scroll-mt-[80px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="text-[17px] font-bold text-[#44494d] uppercase tracking-[0.02em]">{lang === "zh" ? "新品配件" : "PHỤ TÙNG MỚI"}</h2>
          <img loading="lazy" decoding="async" src="/ap-assets/time-new.svg" alt="" className="w-[24px] h-[24px]" />
        </div>
      </div>

      <div className="flex flex-wrap -mx-[7px]">
        {shown.map(prod => (
           <div className="w-1/2 md:w-1/3 lg:w-1/6" key={prod.id}>
              <APProductCard prod={prod} lang={lang} />
           </div>
        ))}
      </div>

      {/* Phân trang căn giữa (dùng chung toàn hệ thống) */}
      <Pagination page={pageSafe} totalPages={totalPages} onChange={goPage}
        totalItems={products.length} pageSize={NEW_PAGE_SIZE} />
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────


// ─── Home Page ────────────────────────────────────────────────────────────────

function DynamicHomeSections() {
  const { lang } = useLang();
  const [sections, setSections] = useState<any[]>([]);
  const [productsCache, setProductsCache] = useState<any>({});

  useEffect(() => {
    fetch('/api/home-sections?active=true').then(r => r.json()).then(async (data) => {
       const activeSecs = Array.isArray(data) ? data : [];
       setSections(activeSecs);
       // Fetch products for each section
       const newCache: any = {};
       for (const sec of activeSecs) {
          try {
             // Avoid caching logic here just normal fetch
             const r = await fetch('/api/products' + (sec.query || ''));
             const items = await r.json();
             if (Array.isArray(items)) {
                newCache[sec.id] = items.sort(() => Math.random() - 0.5); // shuffle
             }
          } catch(e) {}
       }
       setProductsCache(newCache);
    }).catch(() => {});
  }, []);

  if (sections.length === 0) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-[16px] mb-[20px] w-full">
      {sections.map(sec => {
         const items = productsCache[sec.id] || [];
         if (items.length === 0) return null;
         
         const displayItems = [];
         for (let i = 0; i < (sec.limit || 10); i++) {
           displayItems.push(items[i % items.length]);
         }

         return (
           <section key={sec.id}>
             <div className="flex items-center justify-between mb-[16px]">
               <div className="flex items-center gap-[8px]">
                 {sec.icon && <img loading="lazy" decoding="async" src={sec.icon} alt="icon" className="w-[32px] h-[32px] object-contain" />}
                 <h2 className="text-[17px] font-bold text-[#44494d] uppercase tracking-[0.02em]">
                   {lang === "zh" ? (sec.titleZh || sec.title) : sec.title}
                 </h2>
               </div>
             </div>
             <div className="bg-gradient-to-br from-[#d4e4fc] to-[#f2f6fc] rounded-[16px] p-[16px] shadow-[0_4px_20px_rgba(26,75,151,0.06)] border border-[#a2c2f6] hover:border-[#1a4b97] transition-all duration-300">
               <div className="flex gap-[16px]">
                 <div className="w-[220px] flex-shrink-0 hidden lg:block">
                   <Link href={`/products/${displayItems[0]?.id}`} className="w-full aspect-[2/3] rounded-[12px] overflow-hidden bg-[#f8f8fa] relative block group hover:opacity-95 transition-opacity">
                     <img loading="lazy" decoding="async" src={displayItems[0]?.image || displayItems[0]?.img || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   </Link>
                 </div>
                 <div className="flex-1">
                   <div className="grid grid-cols-2 gap-[8px] mb-[8px]">
                     {displayItems.slice(1, 5).map((prod: any, i: number) => (
                       <Link href={`/products/${prod.id}`} key={`${prod.id}-${i}`} className="aspect-square rounded-[12px] overflow-hidden bg-[#f8f8fa] block hover:opacity-90 transition-opacity">
                         <img loading="lazy" decoding="async" src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover" />
                       </Link>
                     ))}
                   </div>
                   <div className="grid grid-cols-5 gap-[8px]">
                     {displayItems.slice(5, 10).map((prod: any, i: number) => (
                       <Link href={`/products/${prod.id}`} key={`${prod.id}-${i}`} className="relative aspect-square rounded-[12px] overflow-hidden bg-[#f8f8fa] block hover:opacity-90 transition-opacity">
                         <img loading="lazy" decoding="async" src={prod.image || prod.img || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover" />
                         {(prod.sold ?? 0) > 0 && (
                           <div className="absolute bottom-[6px] right-[6px] bg-black/60 text-white text-[11px] px-[6px] py-[2px] rounded-full">
                             {(prod.sold ?? 0) >= 1000 ? ((prod.sold ?? 0) / 1000).toFixed(1) + "k" : prod.sold}
                           </div>
                         )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
       })}
     </div>
   );
 }
 
// ─── PURE HERO BANNER (NO SIDEBAR) ───────────────────────────────────────────────────────────
function APHeroSlider() {
  const { lang } = useLang();
  const [banners, setBanners] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch("/api/banners?active=true").then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) setBanners(d);
      else setBanners([
        { id: "1", image: "https://s3-north1.viettelidc.com.vn/viposeller/viposeller/2026/01/16/08/10/03/aebf3b23-1336-4cd9-a895-41404fcedeb7.jpg" },
        { id: "2", image: "https://s3-north1.viettelidc.com.vn/viposeller/viposeller/%2F1411a343-a815-4a44-9785-0e0954f3ae8b.jpg" }
      ]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(prev => (prev + 1) % banners.length), 3500);
    return () => clearInterval(t);
  }, [banners.length]);

  return (
    <div className="relative w-full h-full rounded-[12px] overflow-hidden group shadow-sm bg-white border border-gray-100 flex items-center justify-center">
      {banners.length === 0 ? null : banners.map((b, i) => (
        <a key={i} href={b.href || '#'} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img loading="lazy" decoding="async" src={b.image} alt="" className="w-full h-full object-cover" />
        </a>
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {banners.length > 1 && banners.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} className={`rounded-full cursor-pointer transition-all ${i === idx ? 'w-[16px] h-[5px] bg-white' : 'w-[5px] h-[5px] bg-white/60 hover:bg-white'}`}></div>
        ))}
      </div>
    </div>
  );
}

// ─── AutoParts ROW 2 CUSTOM BLOCKS ─────────────────────────────────────────────────────────────
function SlidingCategoryNav({ items, colorHex, gradientFrom }: { items: {name: string, hasSub?: boolean, subCategories?: string[]}[], colorHex: string, gradientFrom: string }) {
   const scrollRef = useRef<HTMLDivElement>(null);
   const [activeIndex, setActiveIndex] = useState(0);
   const [hoverDrop, setHoverDrop] = useState<{items: string[], left: number, idx: number} | null>(null);

   const scrollRight = () => {
      if (scrollRef.current) scrollRef.current.scrollBy({ left: 150, behavior: 'smooth' });
   };

   const scrollLeft = () => {
      if (scrollRef.current) scrollRef.current.scrollBy({ left: -150, behavior: 'smooth' });
   };

   const bgClass = gradientFrom.includes('white') ? 'bg-white' : 'bg-[#eef2ff]';

   return (
      <div className="relative mb-3 flex items-center z-30 nav-container" onMouseLeave={() => setHoverDrop(null)}>
        {/* Left Mask & Arrow */}
        <div className={`absolute left-0 top-0 bottom-1 w-12 bg-gradient-to-r ${gradientFrom} to-transparent pointer-events-none z-10`} />
        <button onClick={scrollLeft} className={`absolute left-0 top-0 bottom-1 flex items-center justify-start w-6 hover:opacity-80 pb-1 z-20 cursor-pointer ${bgClass}`} style={{ color: colorHex }}>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
           </svg>
        </button>

        <div ref={scrollRef} className="flex gap-4 text-[12px] font-medium text-gray-600 overflow-x-auto whitespace-nowrap scroll-smooth flex-1 px-6 pt-1 pb-2 -mb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} onScroll={() => setHoverDrop(null)}>
           <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />
           {items.map((cat, i) => {
              const isActive = activeIndex === i;
              const isHovered = hoverDrop?.idx === i;
              const currentColor = isActive || isHovered ? colorHex : undefined;
              return (
                 <span key={i} onClick={(e) => {
                    setActiveIndex(i);
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                 }} 
                 onMouseEnter={(e) => {
                    if (cat.hasSub && cat.subCategories) {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const parentContainer = e.currentTarget.closest('.nav-container');
                       if (parentContainer) {
                          const parentRect = parentContainer.getBoundingClientRect();
                          setHoverDrop({ items: cat.subCategories, left: rect.left - parentRect.left, idx: i });
                       }
                    } else {
                       setHoverDrop(null);
                    }
                 }}
                 className="flex items-center gap-1 pb-1 cursor-pointer transition-colors border-b-2" 
                 style={{ color: currentColor, borderColor: isActive ? colorHex : 'transparent' }}
                 >
                    {cat.name}
                    {cat.hasSub && (
                       <svg width="8" height="6" viewBox="0 0 10 6" fill="currentColor" style={{ color: currentColor || '#9ca3af' }}>
                          <path d="M5 6L0 0H10L5 6Z" />
                       </svg>
                    )}
                 </span>
              )
           })}
        </div>
        
        {/* Render Dropdown OUTSIDE the overflow-x-auto container */}
        {hoverDrop && (
           <div className="absolute top-full mt-[-2px] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-[8px] py-1 min-w-[150px] transition-all duration-200 z-[99999]" style={{ left: hoverDrop.left }}>
              {hoverDrop.items.map((sub, idx) => (
                 <div key={idx} className="px-3 py-2 text-[12px] font-normal text-gray-700 hover:bg-[#f0f5ff] hover:text-[#1a4b97] transition-colors whitespace-nowrap text-left border-b border-gray-50 last:border-b-0 cursor-pointer">
                    {sub}
                 </div>
              ))}
           </div>
        )}

        {/* Right Mask & Arrow */}
        <div className={`absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l ${gradientFrom} to-transparent pointer-events-none z-10`} />
        <button onClick={scrollRight} className={`absolute right-0 top-0 bottom-1 flex items-center justify-end w-6 hover:opacity-80 pb-1 z-20 cursor-pointer ${bgClass}`} style={{ color: colorHex }}>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
           </svg>
        </button>
      </div>
   );
}

function APHotDeals() {
  const { fp } = useLang();
  const [prods, setProds] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r=>r.json()).then(d=> setProds(Array.isArray(d)?d.slice(0,5):[])).catch(()=>{});
  }, []);

  const d1 = prods[0];
  const rest = prods.slice(1, 5);

  const hotDealItems = [
    { name: '≡ Phụ tùng', hasSub: true, subCategories: ['Phụ tùng chính hãng', 'Phụ tùng OEM', 'Phụ tùng thay thế'] },
    { name: 'Điều Hòa', hasSub: true, subCategories: ['Lốc điều hòa', 'Dàn nóng', 'Dàn lạnh', 'Van tiết lưu'] },
    { name: 'Động Cơ', hasSub: false },
    { name: 'Khung Gầm', hasSub: true, subCategories: ['Bơm trợ lực', 'Giảm xóc', 'Rô tuyn', 'Má phanh'] },
    { name: 'Hệ Thống Điện', hasSub: false },
    { name: 'Lọc Gió', hasSub: true, subCategories: ['Lọc gió động cơ', 'Lọc gió điều hòa'] },
    { name: 'Lọc Nhớt', hasSub: false },
    { name: 'Phanh & Mâm', hasSub: true, subCategories: ['Má phanh', 'Đĩa phanh', 'Dầu phanh'] }
  ];

  return (
    <div className="rounded-[16px] p-4 flex flex-col shadow-sm border border-[#e0e7ff] h-full relative overflow-hidden bg-gradient-to-br from-[#ffffff] to-[#eff4fc]">
      {/* Background Watermark */}
      <svg className="absolute -right-6 top-0 w-48 h-48 text-[#1a4b97] opacity-[0.03] pointer-events-none transform -rotate-12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C12 2 8 6.5 8 11C8 13.5 9.5 15.5 11.5 16.5C10.5 15.5 10.5 14 10.5 14C10.5 14 12 11.5 13.5 11.5C14.5 11.5 15.5 13 15.5 15C15.5 16.5 14.5 18 13 18.5C15.5 18 18 16 18 12C18 8 13 4 12 2Z" />
      </svg>
      <h3 className="font-bold text-[#1a4b97] text-[15px] mb-2 flex items-center uppercase relative z-10"><span className="text-[#f5a623] mr-1"></span> {lang === 'zh' ? '热销产品' : lang === 'en' ? 'HOT SELLING PRODUCTS' : 'SẢN PHẨM HOT BÁN CHẠY'}</h3>
      <SlidingCategoryNav items={hotDealItems} colorHex="#1a4b97" gradientFrom="from-white" />
      <div className="flex gap-2 flex-1 min-h-0">
        <div className="w-[45%] h-full rounded-lg overflow-hidden relative group bg-white shadow-sm border border-gray-100">
           {d1 ? (
             <Link href={`/products/${d1.id}`} className="block w-full h-full">
               <img loading="lazy" decoding="async" src={d1.image || d1.img || d1.thumbnail || "/ap-assets/img-product-clone.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2"><span className="text-white/90 font-medium text-[11px]">Đã bán 1,2k+</span></div>
             </Link>
           ) : <div className="w-full h-full bg-gray-100 animate-pulse" />}
        </div>
        <div className="flex-1 flex flex-col gap-2 h-full">
           <Link href={`/products/${rest[0]?.id}`} className="bg-white rounded-md overflow-hidden relative group border border-gray-100 shadow-sm flex items-center justify-center p-1 flex-1">
              <img loading="lazy" decoding="async" src={rest[0]?.image || rest[0]?.img || "/ap-assets/img-product-clone.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
           </Link>
           <div className="grid grid-cols-2 gap-2 flex-1">
             <Link href={`/products/${rest[1]?.id}`} className="bg-white rounded-md overflow-hidden relative group border border-gray-100 shadow-sm flex items-center justify-center p-1">
                <img loading="lazy" decoding="async" src={rest[1]?.image || rest[1]?.img || "/ap-assets/img-product-clone.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
             </Link>
             <Link href={`/products/${rest[2]?.id}`} className="bg-white rounded-md overflow-hidden relative group border border-gray-100 shadow-sm flex items-center justify-center p-1">
                <img loading="lazy" decoding="async" src={rest[2]?.image || rest[2]?.img || "/ap-assets/img-product-clone.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
             </Link>
           </div>
           <div className="flex justify-end mt-1">
              <Link href="/products" className="text-[12px] text-blue-600 font-medium hover:opacity-80">Xem thêm &rarr;</Link>
           </div>
        </div>
      </div>
    </div>
  );
}

function APFlashSaleCompact() {
  const { fp, lang } = useLang();
  const [campaign, setCampaign] = useState<any>(null);
  const [fallbackProducts, setFallbackProducts] = useState<any[]>([]);
  const [totalFallbackCount, setTotalFallbackCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    fetch("/api/flash-sales?active=true")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data[0]) setCampaign(data[0]); })
      .catch(() => {});
    fetch("/api/products")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setTotalFallbackCount(d.length);
          setFallbackProducts(d.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!campaign?.endTime) return;
    const tick = () => {
      const diff = Math.max(0, new Date(campaign.endTime).getTime() - Date.now());
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [campaign?.endTime]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const prodsTemplate = campaign ? campaign.products?.slice(0,4) : fallbackProducts.slice(0,4);
  const fillArray = [...(prodsTemplate || [])];
  while (fillArray.length < 4) fillArray.push(null); // pad with empty pulse placeholders

  return (
    <div className="bg-[#eef2ff] rounded-[16px] p-4 flex flex-col shadow-sm border border-[#e0e7ff] h-full">
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2">
            {lang === 'zh' ? <span className="text-[16px] font-black text-[#1a4b97] italic mr-2">限时特惠</span> : lang === 'en' ? <span className="text-[16px] font-black text-[#1a4b97] italic mr-2">Best Deals</span> : <img loading="lazy" decoding="async" src="/ap-assets/price-good-ic.png" alt="" className="h-[22px] mr-1" />}
            <div className="flex items-center text-white gap-[3px]">
               <div className="w-[22px] h-[19px] rounded flex justify-center items-center bg-[var(--ap-primary-dark)] text-[12px]">{pad(timeLeft.h)}</div>
               <span className="text-[12px] text-[#44494d] font-bold">:</span>
               <div className="w-[22px] h-[19px] rounded flex justify-center items-center bg-[var(--ap-primary-dark)] text-[12px]">{pad(timeLeft.m)}</div>
               <span className="text-[12px] text-[#44494d] font-bold">:</span>
               <div className="w-[22px] h-[19px] rounded flex justify-center items-center bg-[var(--ap-primary-dark)] text-[12px]">{pad(timeLeft.s)}</div>
            </div>
         </div>
      </div>
      
      <SlidingCategoryNav items={[
        { name: '≡ Bộ lọc', hasSub: true, subCategories: ['Giá dưới 100k', 'Giá 100k - 500k', 'Giá trên 500k'] },
        { name: 'Phụ kiện ô tô', hasSub: false },
        { name: 'Bảo dưỡng', hasSub: true, subCategories: ['Dụng cụ sửa chữa', 'Dung dịch làm sạch'] },
        { name: 'Nội thất', hasSub: true, subCategories: ['Bọc vô lăng', 'Thảm lót sàn', 'Nước hoa ô tô'] },
        { name: 'Dầu nhớt', hasSub: false },
        { name: 'Ngoại thất', hasSub: true, subCategories: ['Bạt phủ', 'Gạt mưa', 'Đèn led'] }
      ]} colorHex="var(--ap-primary)" gradientFrom="from-[#eef2ff]" />

      <div className="grid grid-cols-2 grid-rows-2 gap-[10px] flex-1 min-h-0 mb-3">
         {fillArray.map((p, idx) => {
            if (!p) return <div key={idx} className="bg-white rounded-lg animate-pulse" />;
            return (
              <Link href={`/products/${p.id || p.productId}`} key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group relative flex items-center justify-center p-2">
                 <img loading="lazy" decoding="async" src={p.image || p.img || p.thumbnail || "/ap-assets/img-product-clone.png"} className="w-full h-[70%] object-contain group-hover:scale-105 transition-transform" />
                 <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1 text-center"><span className="text-white/90 font-medium text-[10px]">Đã bán {120 + ((idx * 87 + 43) % 400)}</span></div>
              </Link>
            )
         })}
      </div>
      <div className="flex items-center gap-2 mt-auto">
          
          <Link href="/products" className="flex -space-x-2 cursor-pointer hover:-translate-y-1 transition-transform group" title="Xem danh sách">
             {(campaign ? campaign.products || [] : fallbackProducts).slice(0, 2).map((p: any, i: number) => (
                <img key={i} loading="lazy" decoding="async" src={p?.image || p?.img || p?.thumbnail || "/ap-assets/img-product-clone.png"} className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover bg-white" />
             ))}
             {((campaign ? campaign.products?.length || 0 : totalFallbackCount) > 2) && (
               <div className="w-[28px] h-[28px] relative rounded-full border-2 border-[#1a4b97] bg-[#1a4b97] flex items-center justify-center text-white text-[9px] font-bold z-10 group-hover:scale-110 transition-transform">
                 +{(campaign ? campaign.products?.length || 0 : totalFallbackCount) - 2}
               </div>
             )}
          </Link>
          <div className="flex-1" />
          <Link href="/flash-sale" className="text-[12px] text-blue-600 font-medium hover:opacity-80">Xem thêm &rarr;</Link>
      </div>
    </div>
  );
}

function APTaobaoDeals() {
  const [prods, setProds] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    // try to fetch some different items
    fetch("/api/products").then(r=>r.json()).then(d=> {
      if(Array.isArray(d)) {
        setTotalCount(d.length > 5 ? d.length - 5 : d.length);
        setProds(d.slice(5,8));
      }
    }).catch(()=>{});
  }, []);

  const top1 = prods[0];
  const top2 = prods[1];
  const bottom = prods[2];

  return (
    <div className="bg-[#fff9f9] rounded-[16px] p-4 flex flex-col shadow-sm border border-[#ffebeb] h-full">
      <h3 className="font-bold text-[#ef4444] text-[15px] mb-2 flex items-center uppercase">
        <span className="text-red-500 mr-1 text-[18px]"></span>
        {lang === 'zh' ? '淘宝、1688 热门产品' : lang === 'en' ? 'HOT PRODUCTS FROM TAOBAO, 1688' : 'SẢN PHẨM HOT TỪ TAOBAO, 1688'}
      </h3>
      <div className="flex gap-4 text-[12px] font-medium text-gray-600 mb-3 overflow-x-hidden whitespace-nowrap">
         <span className="text-[#fe0035] border-b-2 border-[#fe0035] pb-1 cursor-pointer">≡ Bộ Lọc</span>
         <span className="cursor-pointer hover:text-[#fe0035]">Lọc Gió</span>
         <span className="cursor-pointer hover:text-[#fe0035]">Lọc Nhớt</span>
         <span className="cursor-pointer hover:text-[#fe0035]">Bugi Đánh Lửa</span>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1 min-h-0 mb-3">
         {prods.map((p, k) => (
           <Link href={`/products/${p?.id}`} key={k} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group relative">
              <img loading="lazy" decoding="async" src={p?.image || p?.img || p?.thumbnail || "/ap-assets/img-product-clone.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
           </Link>
         ))}
         {prods.length < 4 && Array.from({length: 4 - prods.length}).map((_,k) => <div key={`ph-${k}`} className="bg-gray-100 rounded-lg animate-pulse" />)}
      </div>
      <div className="flex items-center gap-2 mt-auto">
          
          <Link href="/products" className="flex -space-x-2 cursor-pointer hover:-translate-y-1 transition-transform group" title="Xem danh sách">
             {prods.slice(0, 2).map((p: any, i: number) => (
                <img key={i} loading="lazy" decoding="async" src={p?.image || p?.img || p?.thumbnail || "/ap-assets/img-product-clone.png"} className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover bg-white" />
             ))}
             {(totalCount > 2) && (
               <div className="w-[28px] h-[28px] relative rounded-full border-2 border-[#1a4b97] bg-[#1a4b97] flex items-center justify-center text-white text-[9px] font-bold z-10 group-hover:scale-110 transition-transform">
                 +{totalCount - 2}
               </div>
             )}
          </Link>
          <div className="flex-1" />
          <Link href="/products" className="text-[12px] text-blue-600 font-medium hover:opacity-80">Xem thêm &rarr;</Link>
      </div>
    </div>
  );
}

function APTopSellers() {
  const { lang } = useLang();
  const [suppliers, setSups] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch('/api/suppliers?sort=rating&limit=3')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setSups(d);
      })
      .catch(() => {});
    // Get total count
    fetch('/api/suppliers')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setTotal(d.length); })
      .catch(() => {});
  }, []);

  const formatCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k+' : String(n);

  const renderBadge = (idx: number) => {
    let fill = '#cbd5e1';
    if (idx === 0) fill = '#fbb117';
    else if (idx === 1) fill = '#94a3b8';
    else if (idx === 2) fill = '#b45309';
    return (
      <div className="absolute -top-1 -left-2 w-[24px] h-[32px] flex flex-col items-center justify-start drop-shadow-sm z-10 transition-transform group-hover:scale-110">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 32" fill={fill} xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0h24v32l-12-5-12 5z"/>
        </svg>
        <span className="relative text-white text-[8px] font-bold z-10 leading-none mt-1">TOP</span>
        <span className="relative text-white text-[12px] font-black z-10 leading-none mt-[1px]">{idx + 1}</span>
      </div>
    );
  };

  return (
    <div className="rounded-[16px] p-4 flex flex-col shadow-sm border border-[#e0e7ff] h-full relative overflow-hidden bg-gradient-to-br from-[#ffffff] to-[#eff4fc]">
      {/* Background Crown Watermark */}
      <svg className="absolute -right-4 -bottom-4 w-40 h-40 text-[#1a4b97] opacity-[0.03] pointer-events-none transform rotate-[15deg]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
         <path d="M2.28 7.37L5.5 12 7.72 7.37L12 2l4.28 5.37L18.5 12l3.22-4.63C22 7 22.37 7.02 22.5 7.15c.16.15.2.37.1.57L19 18H5L1.4 7.72C1.3 7.5 1.34 7.3 1.5 7.15c.13-.13.5-.15.78.22ZM4 20h16v2H4v-2Z" />
      </svg>
      <h3 className="font-bold text-[#1a4b97] text-[15px] mb-4 flex items-center uppercase relative z-10">
         <img loading="lazy" decoding="async" src="/ap-assets/category-blue.svg" className="w-[16px] h-[16px] mr-1" />
         {lang === 'zh' ? '优质卖家' : lang === 'en' ? 'TOP SELLERS' : 'NHÀ BÁN NỔI BẬT'}
      </h3>
      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-1 pt-2 pb-4">
        {suppliers.length === 0
          ? [1,2,3].map(i => <div key={i} className="h-[56px] bg-[#f0f4ff] rounded-xl animate-pulse" />)
          : suppliers.map((sup: any, idx: number) => (
          <Link href={`/suppliers/${sup.id}`} key={sup.id} className="flex gap-3 items-center group cursor-pointer border-b border-gray-50 pb-3 z-10 relative">
             <div className="w-[45px] h-[45px] rounded-full border border-gray-200 p-0.5 relative shrink-0 ml-2">
                <img loading="lazy" decoding="async" src={sup.logo || "/ap-assets/supplier-default.svg"} className="w-full h-full object-cover rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = "/ap-assets/supplier-default.svg"; }} />
                {renderBadge(idx)}
             </div>
             <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-bold text-[#44494d] truncate group-hover:text-[var(--ap-primary)] transition-colors">{lang === 'zh' ? (sup.nameZh || sup.name) : sup.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                   <span className="text-[#f5a623]">★ {sup.rating?.toFixed(1)}</span>
                   <span className="opacity-50">|</span>
                   <span>{formatCount(sup.reviewCount ?? 0)} đánh giá</span>
                </div>
             </div>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50 z-10 relative">
          <Link href="/suppliers" className="flex -space-x-2 cursor-pointer hover:-translate-y-1 transition-transform group" title={lang === 'zh' ? '查看全部' : 'Xem tất cả nhà cung cấp'}>
             {suppliers.slice(0, 2).map((sup: any, i: number) => (
                <img key={i} loading="lazy" decoding="async" src={sup?.logo || "/ap-assets/supplier-default.svg"} className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover bg-white" />
             ))}
             {total > 2 && (
               <div className="w-[28px] h-[28px] relative rounded-full border-2 border-[#1a4b97] bg-[#1a4b97] flex items-center justify-center text-white text-[9px] font-bold z-10 group-hover:scale-110 transition-transform">+{total - 2}</div>
             )}
          </Link>
          <div className="flex-1" />
          <Link href="/suppliers" className="text-[12px] text-blue-600 font-medium hover:opacity-80">{lang === 'zh' ? '查看更多' : 'Xem thêm'} &rarr;</Link>
      </div>
    </div>
  );
}


// ─── Vertical Category (AutoParts Desktop View) ─────────────────────────────────────────────────────────
function VerticalCategory() {
  const { lang } = useLang();
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="w-[200px] shrink-0 bg-white rounded-[12px] p-2 flex flex-col h-full shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {categories.slice(0, 10).map((rawCat) => {
          const cat = getLocalized(rawCat, lang);
          const rc = rawCat as any;
          return (
            <Link key={cat.id} href={`/products?category=${cat.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer mb-1 group">
              <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all">
                <img loading="lazy" decoding="async" src={rc.img || rc.icon} alt={cat.name} className="w-[24px] h-[24px] object-contain group-hover:scale-110 transition-transform" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <span className="text-[13px] font-medium text-[#44494d] truncate group-hover:text-[var(--ap-primary)] transition-colors">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Suggested Grid (Có thể bạn đang tìm kiếm) ─────────────────────────────────────────────────────
function SuggestedGrid() {
  const { fp, lang } = useLang();
  const [prods, setProds] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r=>r.json()).then(d=> setProds(Array.isArray(d)?d.slice(0,9):[])).catch(()=>{});
  }, []);

  if (prods.length === 0) return null;
  const items = prods.slice(0, 9); // tối đa 9 sản phẩm, mỗi hàng 3

  return (
    <section className="ap-card w-full rounded-[16px] p-4 sm:p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-[#ffffff] to-[#eff4fc] border border-[#e0e7ff]">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-[16px] font-bold text-[#44494d]">{lang === "en" ? "You might be looking for" : "Có thể bạn đang tìm kiếm"}</h3>
        <Link href="/products" className="text-[13px] font-semibold text-[#1a4b97] hover:underline whitespace-nowrap">{lang === "en" ? "View all →" : "Xem tất cả →"}</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
        {items.map((p, j) => (
          <Link key={j} href={`/products/${p.id}`} className="group rounded-[12px] overflow-hidden border border-gray-100 bg-white hover:border-[#1a4b97] hover:shadow-md transition-all">
            <div className="aspect-square overflow-hidden bg-[#f8f8fa]">
              <img loading="lazy" decoding="async" src={p.image || p.img || p.thumbnail || "/ap-assets/img-product-clone.png"} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-2.5">
              <p className="text-[12.5px] text-[#44494d] line-clamp-1">{p.name}</p>
              <p className="text-[13.5px] font-bold text-[#1a4b97] mt-0.5">{fp(p.price || 0)}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center relative z-10">
        <Link href="/products" className="ap-btn inline-block px-7 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "var(--ap-primary)" }}>
          {lang === "en" ? "View all products" : "Xem tất cả sản phẩm"}
        </Link>
      </div>
    </section>
  );
}

// ─── AutoParts Grid Layout Wrapper ──────────────────────────────────────────────────────────────────
function APHybridLayout() {
  return (
    <div className="flex flex-col gap-[12px] mb-8 pb-4">
      {/* ROW 1: danh mục trái + banner lớn bên phải */}
      <div className="flex gap-[12px] h-[280px]">
        {/* Left menu */}
        <div className="hidden lg:block shrink-0"><VerticalCategory /></div>
        {/* Right Slider (mở rộng lấp chỗ trống) */}
        <div className="flex-1 min-w-0 h-full">
           <APHeroSlider />
        </div>
      </div>

      {/* Gộp 3 "Có thể bạn đang tìm kiếm" thành 1 mục lớn (tối đa 9 SP) */}
      <SuggestedGrid />

      {/* ROW 2 - Exact replica of AutoParts layout */}
      <div className="flex flex-col xl:flex-row gap-[12px] h-[340px]">
        <div className="flex-1 min-w-0 h-full">
           <APHotDeals />
        </div>
        <div className="flex-1 min-w-0 h-full">
           <APFlashSaleCompact />
        </div>
        <div className="flex-1 min-w-0 h-full">
           <APTopSellers />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="w-full font-sans" style={{ backgroundColor: "var(--ap-page-bg)" }}>
      <AddToCartToast />
      <StorefrontHeader />
      
      {/* AutoParts Box Model - .home-container */}
      <main className="w-full relative min-h-[calc(100vh-200px)] pt-[16px]" style={{ backgroundColor: "#f8f8fa" }}>
         <div className="ap-container">
           {/* Formatted FindParts to match Vipo neat white-card aesthetic */}
           <FindPartsSection />
           <DiscoverOriginsBar />
           
           <APHybridLayout />

           <NewProductsSection />
         </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}

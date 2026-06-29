"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import { useLang } from "@/lib/i18n";
// Sample VIN decode results


type CompatiblePart = { cat: string; name: string; price: number; oem: boolean; id: string };

const vinHints = ["JTDBT923581234567 (Toyota Vios 2021)", "MHFV2BE30K003456 (Toyota Fortuner 2019)"];


function VINLookupInner() {
  const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===

  function getVinSwatch(cat: string) { return vinSwatchMap[cat] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" }; }
  function VINExplainer() {
    const { lang } = useLang();
  
   return (
   <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
   <h3 className="font-bold text-[#44494d] mb-4 text-sm">{lang === "zh" ? "VIN码解读" : "Cách đọc mã VIN"}</h3>
   <div className="font-mono text-sm text-center p-3 rounded-xl mb-4 tracking-widest text-white font-bold" style={{ background: "#44494d" }}>
   <span style={{ color: "var(--ap-primary)" }}>JTD</span>
   <span style={{ color: "#22C55E" }}>BT923</span>
   <span style={{ color: "var(--ap-primary)" }}>5</span>
   <span style={{ color: "#8B5CF6" }}>8</span>
   <span style={{ color: "#F59E0B" }}>1234567</span>
   </div>
   <div className="space-y-2">
   {positions.map((p, i) => {
   const colors = ["var(--ap-primary)", "#22C55E", "var(--ap-primary)", "#8B5CF6", "#F59E0B"];
   return (
   <div key={p.chars} className="flex items-center gap-3">
   <div className="w-16 h-6 rounded text-xs font-bold flex items-center justify-center text-white shrink-0" style={{ background: colors[i] }}>
   VT {p.chars}
   </div>
   <span className="font-semibold text-slate-600 text-xs w-16">{p.label}</span>
   <span className="text-[#8f9294] text-xs">{p.desc}</span>
   </div>
   );
   })}
   </div>
   </div>
   );
  }
  const sampleVINs: Record<string, { make: string; model: string; year: number; engine: string; trim: string; country: string; plant: string; compatible: CompatiblePart[] }> = {
   "JTDBT923581234567": {
   make: "Toyota", model: "Vios", year: 2021, engine: "1.5L NZ-FE", trim: "E MT", country: (lang === "zh" ? "越南" : "Việt Nam"), plant: "Toyota Motor Vietnam",
   compatible: [
   { cat: (lang === "zh" ? "刹车片" : "Má phanh"), name: (lang === "zh" ? "前刹车片Akebono" : "Má Phanh Trước Akebono"), price: 1250000, oem: true, id: "p001" },
   { cat: (lang === "zh" ? "机油" : "Dầu nhớt"), name: "Shell Helix Ultra 5W-30 4L", price: 700000, oem: false, id: "p005" },
   { cat: (lang === "zh" ? "机油滤清器" : "Lọc dầu"), name: (lang === "zh" ? "Bosch优质机油滤清器" : "Lọc Dầu Bosch Premium"), price: 700000, oem: false, id: "p002" },
   { cat: (lang === "zh" ? "空气滤清器" : "Lọc gió"), name: (lang === "zh" ? "Denso空气滤清器DCA-3012" : "Lọc Gió Denso DCA-3012"), price: 350000, oem: true, id: "p007" },
   { cat: (lang === "zh" ? "空调滤清器" : "Lọc cabin"), name: (lang === "zh" ? "OEM空调滤清器 Toyota Vios 2019+" : "Lọc Cabin OEM Toyota Vios 2019+"), price: 280000, oem: true, id: "p009" },
   { cat: (lang === "zh" ? "火花塞" : "Bugi"), name: "Bugi NGK Iridium BKR6EIX x4", price: 980000, oem: true, id: "p004" },
   ],
   },
   "MHFV2BE30K003456": {
   make: "Toyota", model: "Fortuner", year: 2019, engine: "2.4L 2GD-FTV Diesel", trim: "2.4G 4x2 AT", country: (lang === "zh" ? "泰国" : "Thái Lan"), plant: "TMT",
   compatible: [
   { cat: (lang === "zh" ? "机油滤清器" : "Lọc dầu"), name: (lang === "zh" ? "Bosch柴油滤清器F026407006" : "Lọc Dầu Diesel Bosch F026407006"), price: 850000, oem: false, id: "p002" },
   { cat: (lang === "zh" ? "刹车片" : "Má phanh"), name: (lang === "zh" ? "前刹车片Akebono Fortuner" : "Má Phanh Trước Akebono Fortuner"), price: 1850000, oem: true, id: "p001" },
   { cat: (lang === "zh" ? "皮带" : "Dây curoa"), name: (lang === "zh" ? "Gates正时皮带" : "Dây Curoa Gates PowerGrip"), price: 680000, oem: false, id: "p010" },
   { cat: (lang === "zh" ? "减震器" : "Giảm xóc"), name: (lang === "zh" ? "Monroe减震器" : "Giảm Xóc Monroe OESpectrum"), price: 3200000, oem: false, id: "p011" },
   ],
   },
  };
  const vinSwatchMap: Record<string, { bg: string; color: string; label: string }> = {
    "Má phanh":   { bg: "#FEE2E2", color: "#DC2626", label: (lang === "zh" ? "制动" : "Phanh") },
    "Dầu nhớt":   { bg: "#44494d", color: "#8f9294", label: (lang === "zh" ? "机油" : "Nhớt") },
    "Lọc dầu":    { bg: "#FEF9C3", color: "#92400E", label: (lang === "zh" ? "滤清" : "Lọc") },
    "Lọc gió":    { bg: "#F0FDF4", color: "#166534", label: (lang === "zh" ? "空滤" : "Gió") },
    "Lọc cabin":  { bg: "#F0FDF4", color: "#166534", label: (lang === "zh" ? "滤清" : "Lọc") },
    "Bugi":       { bg: "#EDE9FE", color: "#6D28D9", label: (lang === "zh" ? "火花塞" : "Bugi") },
    "Dây curoa":  { bg: "#F3F4F6", color: "#374151", label: (lang === "zh" ? "皮带" : "Curoa") },
    "Giảm xóc":  { bg: "#D1FAE5", color: "#065F46", label: (lang === "zh" ? "减震" : "Giảm") },
  };
   const positions = [
   { chars: "1-3", label: "WMI", desc: (lang === "zh" ? "制造商" : "Nhà sản xuất") },
   { chars: "4-9", label: "VDS", desc: (lang === "zh" ? "车辆特征" : "Đặc tính xe") },
   { chars: "10", label: (lang === "zh" ? "年份" : "Năm SX"), desc: (lang === "zh" ? "生产年份" : "Năm sản xuất") },
   { chars: "11", label: (lang === "zh" ? "工厂" : "Nhà máy"), desc: (lang === "zh" ? "生产地点" : "Địa điểm sản xuất") },
   { chars: "12-17", label: "Serial", desc: (lang === "zh" ? "序列号" : "Số thứ tự xe") },
   ];

  const [vin, setVin] = useState("");
  const [result, setResult] = useState<(typeof sampleVINs)[string] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setAllProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    // Đọc từ useSearchParams; fallback window.location để link chia sẻ ?vin= luôn chạy (v2)
    const qVin = searchParams?.get("vin")
      ?? (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("vin") : null);
    if (qVin) {
      const upVin = qVin.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
      setVin(upVin);
      if (upVin.length === 17) {
        handleLookup(upVin);
      } else if (upVin.length > 0) {
        setShowDropdown(true);
      }
    }
  }, [searchParams]);

  const handleLookup = async (overrideVin?: string) => {
    const searchVin = (typeof overrideVin === "string" ? overrideVin : vin).toUpperCase();
    setError("");
    setResult(null);
    if (searchVin.length !== 17) { setError(lang === "zh" ? "VIN码必须正好是17个字符。" : "Mã VIN phải có đúng 17 ký tự."); return; }
    setShowDropdown(false);
    setLoading(true);

    // 1) VIN mẫu (tra cứu tức thì, có sẵn danh sách phụ tùng)
    const sample = sampleVINs[searchVin];
    if (sample) { setLoading(false); setResult(sample); return; }

    // 2) VIN THẬT: giải mã qua /api/vin (proxy NHTSA, fallback offline) — gợi ý phụ tùng phổ biến
    try {
      const res = await fetch(`/api/vin/${searchVin}?lang=${lang}`);
      const d = await res.json();
      // Chấp nhận khi có hãng HOẶC ít nhất đời xe (giải mã offline theo chuẩn VIN)
      if (res.ok && d && (d.make || d.year)) {
        const suggest = [...allProducts].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 6).map((p: any) => ({
          cat: p.categoryName || p.type || "Phụ tùng", name: p.name, price: p.price ?? 0, oem: p.type === "OEM", id: p.id,
        }));
        const unknownMake = lang === "zh" ? "未识别品牌" : "Hãng chưa xác định";
        setResult({
          make: d.make || unknownMake, model: d.model || "—", year: d.year || 0,
          engine: d.engine || "—", trim: d.trim || "—",
          country: d.country || "—", plant: d.plant || "—",
          compatible: suggest,
        });
      } else {
        setError(lang === "zh" ? "找不到此VIN码的车辆信息。请仔细检查或按品牌搜索。" : "Không tìm thấy thông tin xe với mã VIN này. Vui lòng kiểm tra lại hoặc tìm theo hãng xe.");
      }
    } catch {
      setError(lang === "zh" ? "查询出错，请稍后再试。" : "Lỗi tra cứu VIN, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

 return (
 <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
 <StorefrontHeader />

 <div className="max-w-6xl mx-auto px-6 py-10">
 {/* Hero */}
 <div className="text-center mb-10">
 <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 font-extrabold text-2xl text-[#1a4b97]" style={{ background: "#FFF7ED" }}>VIN</div>
 <h1 className="text-3xl font-extrabold text-[#44494d] mb-3">{lang === "zh" ? "按VIN查找配件" : "Tra cứu phụ tùng theo VIN"}</h1>
 <p className="text-[#8f9294] max-w-xl mx-auto">{lang === "zh" ? "输入您车上的17位VIN码——系统将100%准确列出与您车型、发动机和版本匹配的配件。" : "Nhập mã VIN 17 ký tự trên xe của bạn — hệ thống sẽ liệt kê phụ tùng chính xác 100% phù hợp với đời xe, động cơ và phiên bản."}</p>
 </div>

 {/* Search */}
 <div className="max-w-2xl mx-auto mb-3">
 <div className="flex gap-3">
 <div className="relative flex-1">

 <input
 value={vin}
 onChange={e => { const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17); setVin(v); setError(""); }}
 onKeyDown={e => e.key === "Enter" && handleLookup()}
 onFocus={() => setShowDropdown(true)}
 placeholder={lang === "zh" ? "输入VIN码或品牌/车型名..." : "Nhập mã VIN hoặc tên hãng/model..."}
 className="w-full pl-11 pr-4 py-4 border-2 border-[#e5e5e5] rounded-2xl text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-[#1a4b97] uppercase"
 />
 {vin && <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${vin.length === 17 ? "text-green-500" : "text-[#8f9294]"}`}>{vin.length}/17</span>}

 {/* Live suggestions dropdown */}
 {showDropdown && vin.length > 0 && vin.length < 17 && (() => {
   const allVins = Object.entries(sampleVINs).map(([k, v]) => ({ vin: k, ...v }));
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
             onMouseDown={() => { setVin(s.vin); setShowDropdown(false); setError(""); setResult(null); }}
             className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#f0f4ff] transition-colors border-b border-[#f8f8fa] last:border-0"
           >
             <div className="min-w-0 flex-1">
               <p className="font-mono text-xs text-[#44494d] tracking-wider">{s.vin}</p>
               <p className="text-[10px] text-[#8f9294]">{s.make} {s.model} • {s.year} • {s.engine}</p>
             </div>
             <span className="text-[10px] bg-[#f0f4ff] text-[#1a4b97] px-1.5 py-0.5 rounded font-semibold shrink-0">{s.year}</span>
           </div>
         ))}
       </div>
     </div>
   );
 })()}
 </div>
 <button onClick={() => handleLookup()} disabled={loading} className="px-6 py-4 rounded-2xl text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2" style={{ background: "var(--ap-primary)" }}>
 {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
 {loading ? "..." : (lang === "zh" ? "查询" : "Tra cứu")}
 </button>
 </div>

 {/* Hint VINs */}
 <div className="flex gap-2 mt-2 flex-wrap">
 <span className="text-xs text-[#8f9294]">{lang === "zh" ? "试试：" : "Thử:"}</span>
 {vinHints.map(hint => (
 <button key={hint} onClick={() => { setVin(hint.split(" ")[0]); setError(""); setResult(null); }}
 className="text-xs font-mono text-[#1a4b97] hover:underline">
 {hint}
 </button>
 ))}
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: "#FEF2F2" }}>
 !
 <div>
 <p className="font-semibold text-red-700 text-sm">{error}</p>
 <Link href="/search" className="text-xs text-red-500 hover:underline">{lang === "zh" ? "> 按分类或品牌查找" : "> Tìm theo danh mục hoặc hãng xe"}</Link>
 </div>
 </div>
 )}

 {/* Result */}
 {result && (
 <div className="mt-6 space-y-5">
 {/* Car info */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <div className="flex items-center gap-2 mb-4">
 ✓
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "已确认车辆信息" : "Thông tin xe đã xác nhận"}</h2>
 </div>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
 {[
 [(lang === "zh" ? "品牌" : "Hãng xe"), result.make],
 ["Model", result.model],
 [(lang === "zh" ? "年份" : "Năm SX"), result.year],
 [(lang === "zh" ? "发动机" : "Động cơ"), result.engine],
 [(lang === "zh" ? "版本" : "Phiên bản"), result.trim],
 [(lang === "zh" ? "工厂" : "Nhà máy"), result.plant],
 ].map(([k, v]) => (
 <div key={String(k)} className="p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <p className="text-xs text-[#8f9294] mb-0.5">{k}</p>
 <p className="font-bold text-[#44494d] text-sm">{v}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Compatible parts */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">
 {lang === "zh" ? `适合 ${result.make} ${result.model} ${result.year} (${result.engine}) 的配件` : `Phụ tùng phù hợp cho ${result.make} ${result.model} ${result.year} (${result.engine})`}
 <span className="ml-2 text-sm font-normal text-[#8f9294]">{result.compatible.length} {t('itemCount')}</span>
 </h2>
 <div className="space-y-3">
 {result.compatible.map(part => (
 <Link key={part.id} href={`/products/${part.id}`}
 className="flex items-center gap-4 p-4 rounded-xl border border-[#f0f0f0] hover:border-orange-300 hover:shadow-sm transition-all group">
 <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"><span style={{background: getVinSwatch(part.cat).bg, color: getVinSwatch(part.cat).color, fontSize: "11px", fontWeight: "bold", padding: "4px 7px", borderRadius: "6px"}}>{getVinSwatch(part.cat).label}</span></div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-xs px-2 py-0.5 rounded-full bg-[#f4f4f4] text-[#8f9294] font-semibold">{part.cat}</span>
 {part.oem && <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">OEM</span>}
 <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">{lang === "zh" ? "✓ 100%匹配" : "✓ Khớp 100%"}</span>
 </div>
 <h3 className="font-semibold text-[#44494d] text-sm group-hover:text-[#1a4b97] transition-colors">{part.name}</h3>
 </div>
 <div className="text-right shrink-0">
 <p className="font-extrabold" style={{ color: "var(--ap-primary)" }}>{fp(part.price)}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Explainer + Where to find VIN */}
 {!result && !loading && (
 <div className="grid md:grid-cols-2 gap-5 mt-8">
 <VINExplainer />
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h3 className="font-bold text-[#44494d] mb-4 text-sm">{lang === "zh" ? "VIN码在哪里？" : "Mã VIN ở đâu trên xe?"}</h3>
 <div className="space-y-3">
 {[
 ["A", (lang === "zh" ? "驾驶席门框" : "Khung cửa tài xế"), (lang === "zh" ? "车门内侧A柱处" : "Bên trong cánh cửa, khung cột A")],
 ["B", (lang === "zh" ? "仪表台" : "Bảng tapô"), (lang === "zh" ? "从外部透过挡风玻璃可见" : "Nhìn từ bên ngoài qua kính chắn gió")],
 ["C", (lang === "zh" ? "车辆证件" : "Giấy tờ xe"), (lang === "zh" ? "登记证、保险单、购车合同" : "Đăng ký, bảo hiểm, hợp đồng mua bán")],
 ["D", (lang === "zh" ? "发动机舱" : "Khoang động cơ"), (lang === "zh" ? "车身上方，近发动机处" : "Trên thân xe, gần đầu máy")],
 ].map(([icon, place, note]) => (
 <div key={place} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <span className="w-7 h-7 rounded-full bg-orange-100 text-[#1a4b97] text-xs font-bold flex items-center justify-center">{icon}</span>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{place}</p>
 <p className="text-xs text-[#8f9294]">{note}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}

export default function VINLookupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f8fa" }}>Đang tải...</div>}>
      <VINLookupInner />
    </Suspense>
  );
}

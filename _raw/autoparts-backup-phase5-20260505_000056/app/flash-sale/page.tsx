"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import StorefrontFooter from "@/components/StorefrontFooter";
import StorefrontHeader from "@/components/StorefrontHeader";
import { addToCart, getCart } from "@/lib/cartStore";
import type { FlashSale, FlashSaleProduct } from "@/lib/api";




function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-extrabold text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
        {String(value).padStart(2, "0")}
      </div>
      <p className="text-xs text-white/60 mt-1">{label}</p>
    </div>
  );
}


function useCountdown(endTime: string) {
    const [remaining, setRemaining] = useState(() =>
      Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000))
    );
    useEffect(() => {
      const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
      return () => clearInterval(t);
    }, []);
    return [Math.floor(remaining / 3600), Math.floor((remaining % 3600) / 60), remaining % 60];
  }

export default function FlashSalePage() {
  const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===

  const swatchMap: Record<string, { bg: string; color: string; label: string }> = {
    "brake-pad":      { bg: "#FEE2E2", color: "var(--ap-primary)", label: (lang === "zh" ? "制动" : "Phanh") },
    "brake-disc":     { bg: "#FEE2E2", color: "var(--ap-primary)", label: (lang === "zh" ? "碟片" : "Đĩa") },
    "oil-filter":     { bg: "#FEF9C3", color: "#92400E", label: (lang === "zh" ? "滤清" : "Lọc") },
    "cabin-filter":   { bg: "#F0FDF4", color: "#166534", label: (lang === "zh" ? "滤清" : "Lọc") },
    "spark-plug":     { bg: "#EDE9FE", color: "#6D28D9", label: (lang === "zh" ? "火花塞" : "Bugi") },
    "battery":        { bg: "#DBEAFE", color: "#1D4ED8", label: (lang === "zh" ? "蓄电池" : "Ắcquy") },
    "engine-oil":     { bg: "#44494d", color: "#8f9294", label: (lang === "zh" ? "机油" : "Nhớt") },
    "headlight":      { bg: "#FEF3C7", color: "#D97706", label: (lang === "zh" ? "车灯" : "Đèn") },
    "shock-absorber": { bg: "#D1FAE5", color: "#065F46", label: (lang === "zh" ? "减震" : "Giảm") },
    "timing-belt":    { bg: "#F3F4F6", color: "#374151", label: (lang === "zh" ? "皮带" : "Curoa") },
    "radiator":       { bg: "#E0F2FE", color: "#0369A1", label: (lang === "zh" ? "水箱" : "Két") },
    "o2-sensor":      { bg: "#FDF4FF", color: "#7E22CE", label: (lang === "zh" ? "传感" : "Cảm") },
  };
  function getSwatch(img: string) { return swatchMap[img] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" }; }

  const [campaign, setCampaign] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartIds, setCartIds] = useState<string[]>([]);

  useEffect(() => {
    // Refresh cart IDs from localStorage
    const refreshCart = () => setCartIds(getCart().map((i: any) => i.id));
    refreshCart();
    window.addEventListener("cart-update", refreshCart);
    return () => window.removeEventListener("cart-update", refreshCart);
  }, []);

  useEffect(() => {
    // Fetch flash sale AND full products list in parallel to get nameZh
    Promise.all([
      fetch("/api/flash-sales?active=true").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ])
      .then(([flashData, allProducts]: [FlashSale[], any[]]) => {
        // Build product lookup map for Chinese translations
        const productMap = new Map(allProducts.map((p: any) => [p.id, p]));
        // Enrich flash-sale product snapshots with nameZh/brandZh
        const enriched = flashData.map(fs => ({
          ...fs,
          products: (fs.products ?? []).map((p: any) => {
            const full = productMap.get(p.id);
            if (!full) return p;
            return { ...p, nameZh: full.nameZh ?? p.nameZh, brandZh: full.brandZh ?? p.brandZh };
          }),
        }));
        setCampaign(enriched[0] ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const endTime = campaign?.endTime ?? new Date().toISOString();
  const [h, m, s] = useCountdown(endTime);
  const products: FlashSaleProduct[] = campaign?.products ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />

      {/* Hero banner */}
      <div className="relative overflow-hidden py-10 px-6" style={{ background: "linear-gradient(135deg, var(--ap-primary) 0%, var(--ap-primary) 40%, var(--ap-primary-dark) 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 0%, transparent 40%), radial-gradient(circle at 80% 20%, yellow 0%, transparent 40%)" }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-yellow-300 font-extrabold text-xl uppercase tracking-wide">
              {campaign ? campaign.name : "Flash Sale"}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {campaign ? (lang === "zh" ? `最高立减 ${campaign.discount}% 正品配件` : `Giảm đến ${campaign.discount}% Phụ Tùng Chính Hãng`) : (lang === "zh" ? "正品配件特卖" : "Ưu Đãi Phụ Tùng Chính Hãng")}
          </h1>
          <p className="text-white/70 mb-6">
            {campaign ? (lang === "zh" ? "每日限量优惠 — 下单要趁早！" : "Ưu đãi có hạn mỗi ngày — Đặt hàng trước khi hết!") : (lang === "zh" ? "稍后回来，不要错过下次特卖！" : "Theo dõi để không bỏ lỡ Flash Sale tiếp theo!")}
          </p>
          {campaign && (
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1 text-white/70 text-sm">{lang === "zh" ? "结束倒计时：" : "Kết thúc sau:"}</div>
              <div className="flex items-center gap-2">
                <CountdownBox value={h} label={t("hours")} />
                <span className="text-white text-2xl font-bold mb-4">:</span>
                <CountdownBox value={m} label={t("minutes")} />
                <span className="text-white text-2xl font-bold mb-4">:</span>
                <CountdownBox value={s} label={t("seconds")} />
              </div>
            </div>
          )}
          {!campaign && !loading && (
            <p className="text-white/60 text-sm">{lang === "zh" ? "🔔 即将推出优惠活动 — 请稍后回来！" : "🔔 Sắp có chương trình ưu đãi — hãy quay lại sớm!"}</p>
          )}
        </div>
      </div>


      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-extrabold text-[#44494d] text-xl flex items-center gap-2">
            {loading ? (lang === "zh" ? "加载中..." : "Đang tải...") : campaign ? (lang === "zh" ? `${(campaign as any).nameZh || campaign.name} — ${products.length} 件` : `${campaign.name} — ${products.length} sản phẩm`) : (lang === "zh" ? "今日限时特卖商品" : "Sản phẩm Flash Sale hôm nay")}
          </h2>
          <Link href="/products" className="text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>{lang === "zh" ? "查看全部 →" : "Xem tất cả →"}</Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] h-72 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-16 text-center">
            <p className="text-4xl mb-4">🕐</p>
            <p className="font-bold text-[#44494d] text-lg mb-2">{lang === "zh" ? "暂无限时特卖活动" : "Chưa có Flash Sale đang diễn ra"}</p>
            <p className="text-[#8f9294] text-sm">{lang === "zh" ? "稍后回来，不要错过优惠" : "Quay lại sau để không bỏ lỡ ưu đãi"}</p>
            <Link href="/products" className="inline-block mt-4 px-6 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
              {lang === "zh" ? "查看全部商品" : "Xem tất cả sản phẩm"}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => {
              const stockPct = Math.min(100, (p.sold / (p.sold + p.stock)) * 100);
              const inCart = cartIds.includes(p.id);
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all relative">
                  <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg text-xs font-extrabold text-white" style={{ background: "var(--ap-primary)" }}>
                    -{p.discount}%
                  </div>
                  {p.oem && <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">OEM</div>}
                  {p.stock <= 10 && <div className="absolute top-10 left-3 z-10 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "var(--ap-page-bg)", color: "var(--ap-primary)" }}>{lang === "zh" ? "即将售罄" : "Sắp hết"}</div>}
                  <div className="aspect-[4/3] flex items-center justify-center group-hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, var(--ap-page-bg), #FFF7ED)" }}>
                    <span style={{ background: getSwatch(p.img).bg, color: getSwatch(p.img).color, fontSize: "13px", fontWeight: "800", padding: "8px 14px", borderRadius: "8px" }}>{getSwatch(p.img).label}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#8f9294] mb-0.5">{lang === "zh" ? ((p as any).brandZh || p.brand) : p.brand}</p>
                    <h3 className="font-semibold text-[#44494d] text-sm leading-snug mb-2 line-clamp-2">{lang === "zh" ? ((p as any).nameZh || p.name) : p.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      *<span className="text-xs font-bold text-[#44494d]">{p.rating}</span>
                      <span className="text-xs text-[#8f9294]">({p.reviews})</span>
                      <span className="text-xs text-[#8f9294] ml-auto">{lang === "zh" ? `已售 ${p.sold}` : `Đã bán ${p.sold}`}</span>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                      <p className="text-xl font-extrabold" style={{ color: "var(--ap-primary)" }}>{fp(p.price)}</p>
                      <p className="text-sm text-[#8f9294] line-through pb-0.5">{fp(p.originalPrice)}</p>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-[#8f9294] mb-1">
                        <span>{lang === "zh" ? `已售 ${p.sold}` : `Đã bán ${p.sold}`}</span><span>{lang === "zh" ? `剩余 ${p.stock}` : `Còn ${p.stock}`}</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#f4f4f4] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#1a4b97] to-[#0d2d5e] transition-all" style={{ width: `${stockPct}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!cartIds.includes(p.id)) {
                          addToCart(p.id, 1, {
                            id: p.id, name: p.name, brand: p.brand,
                            price: p.price, originalPrice: p.originalPrice,
                            type: p.oem ? "OEM" : "Generic",
                            oemCode: "", image: p.img,
                            rating: p.rating, stock: p.stock,
                          });
                          setCartIds(prev => [...prev, p.id]);
                        }
                      }}
                      className="w-full py-2 rounded-xl text-sm font-bold transition-all"
                      style={cartIds.includes(p.id) ? { background: "#D1FAE5", color: "#065F46" } : { background: "var(--ap-primary)", color: "white" }}>
                      {cartIds.includes(p.id) ? (lang === "zh" ? "✓ 已加入购物车" : "✓ Đã thêm vào giỏ") : (lang === "zh" ? "立即购买" : "Mua ngay")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <StorefrontFooter />
    </div>
  );
}

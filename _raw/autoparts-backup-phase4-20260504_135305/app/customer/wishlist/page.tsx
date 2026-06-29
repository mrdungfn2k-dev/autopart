"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import CustomerSidebar from "@/components/CustomerSidebar";
import { products as allProducts } from "@/lib/data";

const STORAGE_KEY = "ap_wishlist";

function loadWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function WishlistPage() {
  const { t, fp, lang } = useLang();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => { setWishlistIds(loadWishlist()); }, []);

  const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));

  const removeItem = (id: string) => {
    const updated = wishlistIds.filter(wid => wid !== id);
    setWishlistIds(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <CustomerSidebar active="/customer/wishlist" />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">
              {t("wishlist")} {wishlistProducts.length > 0 && <span className="text-[#8f9294] font-normal text-base">({wishlistProducts.length})</span>}
            </h1>
            <Link href="/products" className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
              {lang === "zh" ? "继续购物" : "Tiếp tục mua sắm"}
            </Link>
          </div>
        </div>

        <div className="p-6">
          {wishlistProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-14 text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--ap-primary)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <p className="font-bold text-[#44494d] mb-2 text-lg">{t("wishlistEmpty")}</p>
              <p className="text-[#8f9294] text-sm mb-5">
                {lang === "zh" ? "点击产品页面上的❤️将商品加入收藏" : "Nhấn ❤️ trên trang sản phẩm để thêm vào yêu thích"}
              </p>
              <Link href="/products" className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold inline-block" style={{ background: "var(--ap-primary)" }}>
                {lang === "zh" ? "浏览产品" : "Khám phá sản phẩm"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map(product => {
                const name = lang === "zh" ? (product.nameZh || product.name) : product.name;
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={name}
                        className="w-full h-48 object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = "/products/ac-compressor.png"; }}
                      />
                      <button onClick={() => removeItem(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        title={t("removeFromWishlist")}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </button>
                      {product.isFlashSale && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {product.discountPct}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[#8f9294] font-mono mb-1">{product.oemCode}</p>
                      <h3 className="font-semibold text-[#44494d] text-sm mb-2 line-clamp-2">{name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-lg" style={{ color: "var(--ap-primary)" }}>{fp(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-[#8f9294] line-through">{fp(product.originalPrice)}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/products/${product.id}`}
                          className="flex-1 py-2 rounded-lg text-center text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">
                          {lang === "zh" ? "查看详情" : "Xem chi tiết"}
                        </Link>
                        <Link href={`/products/${product.id}`}
                          className="flex-1 py-2 rounded-lg text-center text-sm font-semibold text-white"
                          style={{ background: "var(--ap-primary)" }}>
                          {t("addToCart")}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

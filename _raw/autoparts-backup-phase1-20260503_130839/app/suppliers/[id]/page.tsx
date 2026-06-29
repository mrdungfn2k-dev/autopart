"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { addToCart } from "@/lib/cartStore";
import AddToCartToast, { useAddToCartToast } from "@/components/AddToCartToast";
import { MapPin, Phone, Mail, FileText, Calendar, Tags } from "lucide-react";

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#f5a623" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-[#e8f5e9] text-[#2e7d32] text-[11px] font-semibold px-2 py-0.5 rounded-full">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      Đã xác minh
    </span>
  );
}

export default function SupplierDetailPage() {
  const { id } = useParams() as { id: string };
  const { lang, fp } = useLang();
  const [supplier, setSupplier] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "info">("products");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fireToast = useAddToCartToast();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/suppliers/${id}`).then(r => r.json()),
      fetch(`/api/products?supplierId=${id}`).then(r => r.json()),
    ]).then(([sup, prods]) => {
      setSupplier(sup.error ? null : sup);
      setProducts(Array.isArray(prods) ? prods : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const formatCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

  const uniqueCategories = Array.from(new Set(products.map(p => p.categoryName || p.categoryId).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || (p.categoryName || p.categoryId) === selectedCategory;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--ap-page-bg)" }}>
        <StorefrontHeader />
        <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-[200px] bg-gray-200 rounded-2xl" />
          <div className="h-[80px] bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-[200px] bg-gray-200 rounded-xl" />)}
          </div>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--ap-page-bg)" }}>
        <StorefrontHeader />
        <div className="text-center py-20">
          <p className="text-2xl font-bold text-[#44494d] mb-2">Không tìm thấy nhà cung cấp</p>
          <Link href="/suppliers" className="text-[#1a4b97] font-medium hover:underline">← Quay lại danh sách</Link>
        </div>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--ap-page-bg, #f8f8fa)" }}>
      <StorefrontHeader />
      <AddToCartToast />

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-2 text-[12px] text-[#8f9294] flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#1a4b97]">Trang chủ</Link>
        <span>/</span>
        <Link href="/suppliers" className="hover:text-[#1a4b97]">Nhà cung cấp</Link>
        <span>/</span>
        <span className="text-[#44494d] font-medium">{supplier.name}</span>
      </div>

      {/* Banner + Profile */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        {/* Banner */}
        <div className="w-full h-[160px] md:h-[220px] rounded-2xl overflow-hidden relative mb-0 bg-[#0d2d5e]">
          <img src={supplier.banner || "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80"} alt="" className="w-full h-full object-cover opacity-90 mix-blend-overlay" />
          {/* Decorative */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-8 right-4 flex gap-2">
            {supplier.tags?.slice(0,3).map((tag: string) => (
              <span key={tag} className="bg-white/20 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/30 shadow-sm">{tag}</span>
            ))}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-sm px-5 py-4 -mt-5 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Logo */}
            <div className="w-[72px] h-[72px] rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white -mt-10 shrink-0">
              <img
                src={supplier.logo || "/ap-assets/img-product-clone.png"}
                alt={supplier.name}
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = "/ap-assets/img-product-clone.png"; }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-[18px] font-extrabold text-[#44494d]">
                  {lang === "zh" ? (supplier.nameZh || supplier.name) : supplier.name}
                </h1>
                {supplier.verified && <VerifiedBadge />}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={supplier.rating ?? 0} />
                <span className="text-sm font-bold text-[#f5a623]">{supplier.rating?.toFixed(1)}</span>
                <span className="text-sm text-[#8f9294]">({formatCount(supplier.reviewCount ?? 0)} {lang === "zh" ? "评价" : "đánh giá"})</span>
              </div>
              <p className="text-[13px] text-[#8f9294] line-clamp-2">
                {lang === "zh" ? (supplier.descriptionZh || supplier.description) : supplier.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                className="px-4 py-2 rounded-xl border border-[#1a4b97] text-[#1a4b97] text-sm font-semibold hover:bg-[#eef2ff] hover:text-[#1a4b97] transition-colors flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                {lang === "zh" ? "聊天" : "Chat Ngay"}
              </button>

            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#f0f0f0]">
            {[
              { label: lang === "zh" ? "商品数量" : "Sản phẩm", value: formatCount(supplier.totalProducts ?? 0) },
              { label: lang === "zh" ? "总订单" : "Đơn hàng", value: formatCount(supplier.totalOrders ?? 0) },
              { label: lang === "zh" ? "响应率" : "Tỉ lệ phản hồi", value: `${supplier.responseRate ?? 0}%` },
              { label: lang === "zh" ? "响应时间" : "Thời gian phản hồi", value: supplier.responseTime ?? "—" },
            ].map(stat => (
              <div key={stat.label} className="text-center p-2 rounded-xl bg-[#f8f8fa]">
                <p className="text-[16px] font-extrabold text-[#44494d]">{stat.value}</p>
                <p className="text-[10px] text-[#8f9294] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-4">
        <div className="flex gap-1 bg-white rounded-xl border border-[#f0f0f0] p-1 w-fit mb-4">
          {([
            { key: "products", label: lang === "zh" ? "商品" : "Sản phẩm" },
            { key: "info", label: lang === "zh" ? "店铺信息" : "Thông tin cửa hàng" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-[#8f9294] hover:text-[#44494d]"
              }`}
              style={activeTab === tab.key ? { background: "var(--ap-primary, #1a4b97)" } : {}}
            >
              {tab.label}
              {tab.key === "products" && (
                <span className="ml-1.5 text-[10px] opacity-70">({products.length})</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "products" && (
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Left Sidebar: Categories */}
            <div className="w-full md:w-[240px] shrink-0">
              <div className="bg-white rounded-xl border border-[#f0f0f0] p-4">
                <h3 className="font-bold text-[#44494d] mb-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                  {lang === "zh" ? "店铺分类" : "Danh mục của Shop"}
                </h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? "bg-[#eef2ff] text-[#1a4b97] font-semibold" : "text-[#44494d] hover:bg-[#f8f8fa]"}`}
                  >
                    {lang === "zh" ? "所有商品" : "Tất cả sản phẩm"}
                  </button>
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? "bg-[#eef2ff] text-[#1a4b97] font-semibold" : "text-[#44494d] hover:bg-[#f8f8fa]"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Products */}
            <div className="flex-1 min-w-0">
              {/* Search within store */}
              <div className="relative mb-4">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === "zh" ? "搜索店内商品..." : "Tìm sản phẩm trong cửa hàng..."}
                  className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] pr-10"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f9294]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-[#8f9294] bg-white rounded-xl border border-[#f0f0f0]">
                  <p className="font-medium">{lang === "zh" ? "暂无商品" : "Không có sản phẩm"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map(prod => (
                    <div key={prod.id} className="group bg-white rounded-xl border border-[#f0f0f0] hover:border-[#1a4b97] hover:shadow-md transition-all overflow-hidden flex flex-col">
                      <Link href={`/products/${prod.id}`} className="block relative">
                        <div className="aspect-square overflow-hidden bg-[#f8f8fa]">
                          <img
                            src={prod.image || "/ap-assets/img-product-clone.png"}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).src = "/ap-assets/img-product-clone.png"; }}
                          />
                        </div>
                        {prod.discount && (
                          <span className="absolute top-0 right-0 bg-[#1a4b97] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">-{prod.discount}%</span>
                        )}
                      </Link>
                      <div className="p-2.5 flex flex-col flex-1">
                        <Link href={`/products/${prod.id}`}>
                          <p className="text-[12px] text-[#44494d] font-medium line-clamp-2 mb-1">{prod.name}</p>
                        </Link>
                        <p className="text-[14px] font-bold text-[#1a4b97] mt-auto">{fp(prod.price)}</p>
                        <p className="text-[10px] text-[#8f9294]">{lang === "zh" ? "已售" : "Đã bán"} {prod.sold ?? 0}</p>
                      </div>
                      <button
                        onClick={() => { addToCart(prod.id, 1, prod); fireToast(prod.name); }}
                        className="mx-2 mb-2 py-1.5 text-[11px] font-semibold text-[#1a4b97] bg-[#eef2ff] hover:bg-[#1a4b97] hover:text-white rounded-lg transition-colors"
                      >
                        + {lang === "zh" ? "加入购物车" : "Thêm vào giỏ"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 mb-8 space-y-4">
            <h2 className="font-bold text-[#44494d] text-[15px]">{lang === "zh" ? "店铺详情" : "Thông tin cửa hàng"}</h2>
            {[
              { icon: <MapPin size={16} className="text-[#8f9294]" />, label: lang === "zh" ? "地址" : "Địa chỉ", value: supplier.address },
              { icon: <Phone size={16} className="text-[#8f9294]" />, label: lang === "zh" ? "电话" : "Điện thoại", value: supplier.phone },
              { icon: <Mail size={16} className="text-[#8f9294]" />, label: "Email", value: supplier.email },
              { icon: <FileText size={16} className="text-[#8f9294]" />, label: lang === "zh" ? "税号" : "Mã số thuế", value: supplier.taxCode },
              { icon: <Calendar size={16} className="text-[#8f9294]" />, label: lang === "zh" ? "加入时间" : "Ngày tham gia", value: supplier.joinedAt ? new Date(supplier.joinedAt).toLocaleDateString("vi-VN") : "" },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className="flex items-start gap-3 py-2.5 border-b border-[#f0f0f0] last:border-0">
                <span className="mt-0.5">{row.icon}</span>
                <span className="text-[13px] font-semibold text-[#8f9294] w-32 shrink-0">{row.label}</span>
                <span className="text-[13px] text-[#44494d] flex-1">{row.value}</span>
              </div>
            ))}
            {supplier.categories && supplier.categories.length > 0 && (
              <div className="flex items-start gap-3 py-2.5">
                <span className="mt-0.5"><Tags size={16} className="text-[#8f9294]" /></span>
                <span className="text-[13px] font-semibold text-[#8f9294] w-32 shrink-0">{lang === "zh" ? "经营类别" : "Danh mục"}</span>
                <div className="flex flex-wrap gap-1.5">
                  {supplier.categories.map((cat: string) => (
                    <span key={cat} className="bg-[#eef2ff] text-[#1a4b97] text-[11px] px-2 py-0.5 rounded-full">{cat}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <StorefrontFooter />
    </div>
  );
}

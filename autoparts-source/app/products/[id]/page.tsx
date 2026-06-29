"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart as addToCartStore, updateQty as updateQtyStore, saveSelectedIds, saveSelectedVouchers } from "@/lib/cartStore";
import StorefrontHeader from "@/components/StorefrontHeader";
import AddToCartToast, { useAddToCartToast } from "@/components/AddToCartToast";


export default function ProductDetailPage() {
  const { t, fp, lang } = useLang();
  const router = useRouter();
  const params = useParams();
  const productId = (params?.id as string) ?? "";
  const fireToast = useAddToCartToast();

  const [products, setProducts] = useState<any[]>([]);
  const [supplier, setSupplier] = useState<any>(null);
  const [attributeSets, setAttributeSets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/attribute-sets").then(r => r.ok ? r.json() : []).then(d => setAttributeSets(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const product = products.find(p => p.id === productId) || products[0];

  useEffect(() => {
    if (product?.supplierId) {
      fetch(`/api/suppliers/${product.supplierId}`).then(r => r.json()).then(d => setSupplier(d.error ? null : d)).catch(() => {});
    }
  }, [product?.supplierId]);

  // Ảnh sản phẩm dùng ảnh thật product.image; nếu thiếu/đường dẫn lỗi → fallback /ap-assets/img-product-clone.png (xem JSX bên dưới).

 const [qty, setQty] = useState(1);
 const [activeTab, setActiveTab] = useState<"specs" | "compatible" | "reviews">("specs");
 const [wishlisted, setWishlisted] = useState(false);

 // Sync wishlist state from localStorage
 useEffect(() => {
   if (!product?.id) return;
   try {
     const wl: string[] = JSON.parse(localStorage.getItem("ap_wishlist") || "[]");
     setWishlisted(wl.includes(product.id));
   } catch {}
 }, [product?.id]);

 const toast = (message: string, type = "success") =>
   window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));

 const toggleWishlist = () => {
   if (!product?.id) return;
   try {
     const wl: string[] = JSON.parse(localStorage.getItem("ap_wishlist") || "[]");
     const updated = wishlisted ? wl.filter(id => id !== product.id) : [...wl, product.id];
     localStorage.setItem("ap_wishlist", JSON.stringify(updated));
     setWishlisted(!wishlisted);
     window.dispatchEvent(new Event("wishlist-update"));
     toast(wishlisted ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích ❤", wishlisted ? "info" : "success");
   } catch {}
 };

 // Chia sẻ: dùng Web Share API nếu có, không thì copy link
 const shareProduct = async () => {
   const url = typeof window !== "undefined" ? window.location.href : "";
   const title = product?.name || "AutoParts";
   try {
     if (navigator.share) { await navigator.share({ title, url }); return; }
     await navigator.clipboard.writeText(url);
     toast("Đã copy link sản phẩm vào clipboard", "success");
   } catch {
     try { await navigator.clipboard.writeText(url); toast("Đã copy link sản phẩm", "success"); }
     catch { toast("Không thể chia sẻ trên thiết bị này", "warning"); }
   }
 };

 // Chat với NCC: mở box chat (ChatWidget lắng nghe sự kiện open-chat)
 const chatSupplier = () => {
   if (!supplier?.id) return;
   window.dispatchEvent(new CustomEvent("open-chat", { detail: { peerType: "supplier", peerId: supplier.id, peerName: lang === "zh" ? (supplier.nameZh || supplier.name) : supplier.name } }));
 };

 // Show loading skeleton while products haven't loaded yet
 if (!product) {
  return (
   <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
    <StorefrontHeader />
    <div className="ap-container py-12 text-center">
     <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto" />
      <div className="h-64 bg-slate-200 rounded-2xl" />
      <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto" />
     </div>
     <p className="text-[#8f9294] mt-6 text-sm">{t('loadingProductInfo')}</p>
    </div>
   </div>
  );
 }

 const relatedProducts = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

 const typeColors: Record<string, string> = {
 OEM: "bg-green-100 text-green-700 border border-green-200",
 OES: "bg-blue-100 text-blue-700 border border-blue-200",
 Generic: "bg-yellow-100 text-yellow-700 border border-yellow-200"
 };
 const typeLabels: Record<string, string> = {
 OEM: t('originalOEM'),
 OES: t('aftermarketOES'),
 Generic: t('genericParts')
 };

 
 const reviews = [
 { user: "Nguyễn Văn A", rating: 5, date: "12/10/2023", content: "Hàng chính hãng, đóng gói cẩn thận. Lắp vào tốt hơn hẳn đồ cũ, phanh êm mượt hơn nhiều!", verified: true },
 { user: "Trần Thị B", rating: 4, date: "08/10/2023", content: "Sản phẩm đúng mã OEM, giao hàng nhanh, sẽ quay lại mua thêm.", verified: true },
 { user: "Lê Minh C", rating: 5, date: "05/10/2023", content: "Mua nhiều lần tại đây, không bao giờ lo hàng giả. Giá tốt, ship nhanh.", verified: false },
 ];

 return (
 <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
 <AddToCartToast />
 <StorefrontHeader  />

 <div className="ap-container py-4">
 {/* Breadcrumb */}
 <div className="flex items-center gap-2 mb-4 text-sm text-[#8f9294]">
 <Link href="/" className="hover:text-[#1a4b97]">{t('home')}</Link>
 /
 <Link href="/products" className="hover:text-[#1a4b97]">{t('products')}</Link>
 /
 <Link href={`/products?category=${product.categoryId}`} className="hover:text-[#1a4b97]">{lang === "zh" ? ((product as any).categoryNameZh || product.categoryName) : product.categoryName}</Link>
 /
 <span className="text-slate-600 font-medium truncate max-w-xs">{lang === "zh" ? ((product as any).nameZh || product.name) : product.name}</span>
 </div>

 <div className="grid lg:grid-cols-5 gap-8 mb-10">
 {/* Image */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-2xl border border-[#f0f0f0] aspect-[4/3] flex items-center justify-center mb-3 relative overflow-hidden">
 <img src={product.image || "/ap-assets/img-product-clone.png"} alt={product.name} className="w-full h-full object-contain p-6" onError={e => { (e.target as HTMLImageElement).src = "/ap-assets/img-product-clone.png"; }} />
 {product.discountPct && (
 <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-bold" style={{ background: "#EF4444" }}>
 -{product.discountPct}%
 </span>
 )}
 </div>
 <div className="flex gap-2">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className={`flex-1 aspect-square rounded-xl flex items-center justify-center border-2 cursor-pointer transition-colors overflow-hidden ${i === 1 ? "border-[#1a4b97]" : "border-[#e5e5e5] hover:border-orange-300"}`} style={{ background: "#f8f8fa" }}>
 <img src={product.image || "/ap-assets/img-product-clone.png"} alt={product.name} className="w-full h-full object-contain p-2" onError={e => { (e.target as HTMLImageElement).src = "/ap-assets/img-product-clone.png"; }} />
 </div>
 ))}
 </div>
 </div>

 {/* Info */}
 <div className="lg:col-span-3">
 <div className="flex items-start justify-between gap-4 mb-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[product.type]}`}>
 {typeLabels[product.type]}
 </span>
 {product.isFlashSale && (
 <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white" style={{ background: "#EF4444" }}>
 FLASH SALE
 </span>
 )}
 </div>
 <h1 className="text-2xl font-bold text-[#44494d] mb-1">{lang === "zh" ? ((product as any).nameZh || product.name) : product.name}</h1>
 <p className="text-[#8f9294] text-sm font-mono mb-3">{t('oemCode')}: <span className="font-bold text-slate-600">{product.oemCode}</span></p>
 </div>
  <div className="flex gap-2 shrink-0">
  <button onClick={toggleWishlist} className="p-2.5 rounded-xl border border-[#e5e5e5] hover:border-orange-300 transition-colors" title={t('favorite')}>
   <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? "#EF4444" : "none"} stroke={wishlisted ? "#EF4444" : "#8f9294"} strokeWidth="2" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
   </svg>
   </button>
  <button onClick={shareProduct} className="p-2.5 rounded-xl border border-[#e5e5e5] hover:border-slate-300 transition-colors" title={t('share')}>
   <svg width="20" height="20" viewBox="0 0 24 24" fill="#8f9294" aria-hidden="true">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
   </svg>
  </button>
  </div>
 </div>

 {/* Rating */}
 <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#f0f0f0]">
 <div className="flex items-center gap-1">
 {[1,2,3,4,5].map(i => {
   const rated = (product.reviewCount ?? 0) > 0;
   const on = rated && i <= Math.round(product.rating ?? 0);
   return <span key={i} className={on ? "text-yellow-400" : "text-slate-300"}>★</span>;
 })}
 </div>
 {(product.reviewCount ?? 0) > 0
   ? <><span className="font-bold text-[#44494d]">{product.rating}</span>
       <span className="text-[#8f9294] text-sm">({product.reviewCount} {t('reviews')})</span></>
   : <span className="text-[#8f9294] text-sm">{t('noReviewsYet')}</span>}
 <span className="text-slate-300">|</span>
 <span className="text-[#8f9294] text-sm">{(product.sold ?? 0).toLocaleString()} {t('sold')}</span>
 </div>

 {/* Price */}
 <div className="mb-5">
 <div className="flex items-baseline gap-3">
 <span className="text-4xl font-extrabold" style={{ color: "var(--ap-primary)" }}>{fp(product.price)}</span>
 {product.originalPrice && (
 <>
 <span className="text-lg text-[#8f9294] line-through">{fp(product.originalPrice)}</span>
 <span className="px-2 py-1 rounded-lg text-sm font-bold text-white" style={{ background: "#EF4444" }}>
 {t('save')} {fp(product.originalPrice - product.price)}
 </span>
 </>
 )}
 </div>
 <div className="mt-1 flex items-center gap-2">
 <span className="text-sm text-[#8f9294]">{t('tier1Price')}:</span>
 <span className="text-sm font-bold" style={{ color: "#7C3AED" }}>{fp(Math.round(product.price * 0.83))}</span>
 <span className="text-xs text-[#8f9294]">({t('discount17')})</span>
 </div>
 </div>

 {/* Trust */}
 <div className="grid grid-cols-3 gap-2 mb-5">
 {[
 { label: t('warranty'), value: product.warranty },
 { label: t('returns'), value: t('7days') },
 { label: t('delivery'), value: t('2_4days') },
 ].map(({ label, value }) => (
 <div key={label} className="flex flex-col items-center p-3 rounded-xl text-center" style={{ background: "#FFF7ED" }}>

 <p className="text-xs text-[#8f9294]">{label}</p>
 <p className="text-xs font-bold text-[#44494d]">{value}</p>
 </div>
 ))}
 </div>

 {/* Qty + Cart */}
 <div className="flex items-center gap-3 mb-5">
 <div className="flex items-center border border-[#e5e5e5] rounded-xl overflow-hidden">
 <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-4 py-3 hover:bg-[#f4f4f4] transition-colors font-bold text-slate-600">-</button>
 <span className="px-5 py-3 font-bold text-[#44494d]">{qty}</span>
 <button onClick={() => setQty(q => { const max = product.stock > 0 ? product.stock : 999; if (q + 1 > max) { toast(`Chỉ còn ${max} sản phẩm trong kho`, "warning"); return q; } return q + 1; })} className="px-4 py-3 hover:bg-[#f4f4f4] transition-colors font-bold text-slate-600">+</button>
 </div>
 {product.stock > 0 ? (
            <span className="text-sm text-[#8f9294]">{t('remaining')} {product.stock} {t('items')}</span>
          ) : product.allowBackorder ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700">⏳ Hàng đặt trước (giao 7-14 ngày)</span>
          ) : (
            <span className="text-xs font-bold text-red-600">Hết hàng</span>
          )}
 </div>

  <div className="flex gap-3">
  <button
   onClick={() => {
     addToCartStore(product.id, qty, product);
     fireToast(product.name, product.image);
   }}
   className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02]" style={{ background: "var(--ap-primary)" }}>
  {t("addToCart")}
  </button>
  <button
   onClick={() => {
     // Mua ngay = mua ĐÚNG số lượng đang chọn, KHÔNG cộng dồn với SL đã có trong giỏ
     addToCartStore(product.id, qty, product);
     updateQtyStore(product.id, qty);
     saveSelectedIds([product.id]);
     saveSelectedVouchers({ freeship: null, discount: null });
     router.push("/checkout");
   }}
   className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold border-2 transition-all hover:bg-orange-50" style={{ borderColor: "var(--ap-primary)", color: "var(--ap-primary)" }}>
  {lang === "zh" ? "立即购买" : "Mua ngay"}
  </button>
  </div>

 {/* Shopee-style Supplier Card */}
 {supplier && (
   <div className="mt-8 bg-white border border-[#f0f0f0] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
     {/* Left: Supplier Info */}
     <div className="flex items-center gap-4">
       <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#f8f8fa] shrink-0">
         <img src={supplier.logo || "/ap-assets/supplier-default.svg"} alt={supplier.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "/ap-assets/supplier-default.svg"; }} />
       </div>
       <div>
         <div className="flex items-center gap-2 mb-1">
           <p className="font-bold text-[#44494d] text-lg">{lang === "zh" ? (supplier.nameZh || supplier.name) : supplier.name}</p>
           {supplier.verified && (
             <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> {lang === "zh" ? "已认证" : "Đã xác minh"}
             </span>
           )}
         </div>
         <p className="text-xs text-[#8f9294] mb-2">{lang === "zh" ? "在线" : "Online"}</p>
         <div className="flex items-center gap-2">
           <button onClick={chatSupplier} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eef2ff] hover:bg-[#1a4b97] text-[#1a4b97] hover:text-white transition-colors rounded border border-[#1a4b97] text-xs font-semibold">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
             {lang === "zh" ? "聊天" : "Chat Ngay"}
           </button>
           <Link href={`/suppliers/${supplier.id}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e5e5e5] hover:border-[#1a4b97] text-[#44494d] transition-colors rounded text-xs font-semibold">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
             {lang === "zh" ? "查看店铺" : "Xem Shop"}
           </Link>
         </div>
       </div>
     </div>
     
     {/* Right: Metrics */}
     <div className="flex items-center gap-6 md:pl-6 md:border-l border-[#f0f0f0] w-full md:w-auto">
       <div className="flex flex-col gap-2 w-1/3 md:w-auto">
         <div className="flex items-center justify-between gap-4">
           <span className="text-xs text-[#8f9294]">{lang === "zh" ? "商品" : "Sản phẩm"}</span>
           <span className="text-sm font-bold" style={{ color: "var(--ap-primary)" }}>{supplier.totalProducts ?? 0}</span>
         </div>
         <div className="flex items-center justify-between gap-4">
           <span className="text-xs text-[#8f9294]">{lang === "zh" ? "评价" : "Đánh giá"}</span>
           <span className="text-sm font-bold" style={{ color: "var(--ap-primary)" }}>{supplier.rating?.toFixed(1) ?? "0.0"}</span>
         </div>
       </div>
       <div className="flex flex-col gap-2 w-1/3 md:w-auto">
         <div className="flex items-center justify-between gap-4">
           <span className="text-xs text-[#8f9294]">{lang === "zh" ? "响应率" : "Phản hồi"}</span>
           <span className="text-sm font-bold" style={{ color: "var(--ap-primary)" }}>{supplier.responseRate ?? 0}%</span>
         </div>
         <div className="flex items-center justify-between gap-4">
           <span className="text-xs text-[#8f9294]">{lang === "zh" ? "加入" : "Tham gia"}</span>
           <span className="text-sm font-bold" style={{ color: "var(--ap-primary)" }}>{supplier.joinedAt ? new Date(supplier.joinedAt).getFullYear() : "—"}</span>
         </div>
       </div>
     </div>
   </div>
 )}
 </div>
 </div>

 {/* Tabs */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden mb-8">
 <div className="flex border-b border-[#f0f0f0]">
 {([["specs", t('specs')], ["compatible", t('compatibleVehicles')], ["reviews", t('reviewsTab')]] as const).map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key)}
 className={`px-6 py-4 font-semibold text-sm transition-colors ${activeTab === key ? "border-b-2 text-[#1a4b97]" : "text-[#8f9294] hover:text-[#44494d]"}`}
 style={activeTab === key ? { borderColor: "var(--ap-primary)" } : {}}>
 {label}
 {key === "reviews" && <span className="ml-1 text-xs">{product.reviewCount ?? 0}</span>}
 </button>
 ))}
 </div>

 <div className="p-6">
 {activeTab === "specs" && (
 <div className="grid md:grid-cols-2 gap-4">
                {/* Phase 4.1: render attributes from product.attributeSetId */}
                {(() => {
                  const setId = (product as any).attributeSetId;
                  const attrs = (product as any).attributes;
                  const attrSet = attributeSets.find((s: any) => s.id === setId);
                  if (!setId || !attrSet || !attrs) return null;
                  return (
                    <div className="mb-6">
                      <h3 className="font-bold text-[#44494d] mb-3 text-sm">📐 {attrSet.name}</h3>
                      <table className="w-full text-sm">
                        <tbody>
                          {(attrSet.attributes || []).map((a: any) => {
                            const val = attrs[a.id];
                            if (val === undefined || val === "" || val === null) return null;
                            return (
                              <tr key={a.id} className="border-b border-slate-100">
                                <td className="py-2 text-[#8f9294]" style={{ width: "40%" }}>{a.name}</td>
                                <td className="py-2 font-semibold text-[#44494d]">{val}{a.unit ? ` ${a.unit}` : ""}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}

 {[
 [t('oemCode'), product.oemCode],
 [t('brand'), product.brand],
 [t('origin'), (product as any).origin || t('notUpdated')],
 [t('category'), product.categoryName],
 [t('productType'), typeLabels[product.type]],
 [t('warranty'), product.warranty],
 [t('stockStatus'), `${product.stock} ${t('itemsAvailable')}`],
 ].map(([k, v]) => (
 <div key={k} className="flex justify-between py-2 border-b border-slate-50">
 <span className="text-[#8f9294] text-sm">{k}</span>
 <span className="text-[#44494d] font-medium text-sm">{v}</span>
 </div>
 ))}
 <div className="py-2 border-b border-slate-50 md:col-span-2">
 <p className="text-[#8f9294] text-sm mb-1">{t("description")}</p>
 <p className="text-[#44494d] text-sm">{lang === "zh" ? ((product as any).descriptionZh || (product as any).descZh || product.description || "") : (product.description || "")}</p>
 </div>
 </div>
 )}

 {activeTab === "compatible" && (
 <div>
 <p className="text-sm text-[#8f9294] mb-4">{t('compatibleWithFollowing')}</p>
 <div className="flex flex-wrap gap-2">
  {(product.compatibleVehicles ?? []).map((v: string) => (

 <span key={v} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 font-medium">
 ✓ {v}
 </span>
 ))}
 </div>
 </div>
 )}

 {activeTab === "reviews" && (
 <div className="space-y-4">
 {reviews.map((r, i) => (
 <div key={i} className="p-4 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div className="flex items-start justify-between mb-2">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a4b97] to-[#0d2d5e] flex items-center justify-center text-white text-xs font-bold">
 {r.user.charAt(0)}
 </div>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{r.user}</p>
 {r.verified && <span className="text-xs text-green-600 font-medium flex items-center gap-1">✓ {t('verifiedBuyer')}</span>}
 </div>
 </div>
 <p className="text-xs text-[#8f9294]">{r.date}</p>
 </div>
 <div className="flex gap-0.5 mb-2">
 {[1,2,3,4,5].map(s => (
 <span key={s} className="text-yellow-400">★</span>
 ))}
 </div>
 <p className="text-sm text-slate-600">{r.content}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Related */}
 <h2 className="text-xl font-bold text-[#44494d] mb-4">{t("relatedProducts")}</h2>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {relatedProducts.map(p => (
 <Link key={p.id} href={`/products/${p.id}`} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
 <div className="aspect-video flex items-center justify-center overflow-hidden" style={{ background: "#f8f8fa" }}><img src={p.image || "/ap-assets/img-product-clone.png"} alt={p.name} className="w-full h-full object-contain p-2" onError={e => { (e.target as HTMLImageElement).src = "/ap-assets/img-product-clone.png"; }} /></div>
 <div className="p-3">
 <p className="text-xs font-semibold text-[#44494d] line-clamp-2 mb-1">{p.name}</p>
 <p className="font-bold text-sm" style={{ color: "var(--ap-primary)" }}>{fp(p.price)}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </div>
 );
}

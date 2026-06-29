"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";

type ApiOrder = {
  id: string;
  userId: string;
  items: Array<{ id: string; name: string; qty: number; price: number }>;
  shipping: { name: string; phone: string; city: string; address: string; method: string; fee: number };
  payment: { method: string; status: string };
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  note?: string;
  tracking?: string;
  createdAt: string;
  updatedAt: string;
};

const statusSymbol: Record<string, { symbol: string; bg: string; color: string }> = {
 shipping: { symbol: ">", bg: "#FFF7ED", color: "var(--ap-primary)" },
 confirmed: { symbol: "⋯", bg: "#f8f8fa", color: "#8f9294" },
 pending: { symbol: "⋯", bg: "#FEF9C3", color: "#92400E" },
 delivered: { symbol: "✓", bg: "#ECFDF5", color: "#22C55E" },
 cancelled: { symbol: "✕", bg: "#FEF2F2", color: "#EF4444" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function CustomerOrdersPage() {
 const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===

  const statusTabs = [
   { key: "", label: "Tất cả" },
   { key: "confirmed", label: (lang === "zh" ? "处理中" : "Đang xử lý") },
   { key: "shipping", label: "Đang giao" },
   { key: "delivered", label: (lang === "zh" ? "已送达" : "Đã giao") },
   { key: "cancelled", label: "Đã hủy" },
  ];
  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: (lang === "zh" ? "待确认" : "Chờ xác nhận"), color: "bg-yellow-100 text-yellow-700" },
      confirmed: { label: (lang === "zh" ? "处理中" : "Đang xử lý"), color: "bg-blue-100 text-blue-700" },
      shipping: { label: (lang === "zh" ? "配送中" : "Đang giao"), color: "bg-indigo-100 text-indigo-700" },
      delivered: { label: (lang === "zh" ? "已送达" : "Đã giao"), color: "bg-green-200 text-green-800" },
      cancelled: { label: (lang === "zh" ? "已取消" : "Đã hủy"), color: "bg-red-100 text-red-700" },
    };
    return map[status] ?? { label: status, color: "bg-[#f4f4f4] text-[#44494d]" };
  };

 const [orders, setOrders] = useState<ApiOrder[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeStatus, setActiveStatus] = useState("");
 const [search, setSearch] = useState("");
 const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

 useEffect(() => {
   fetch("/api/orders")
     .then(r => r.json())
     .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
     .catch(() => setLoading(false));
 }, []);

 const filtered = orders.filter(o =>
   (activeStatus === "" || o.status === activeStatus) &&
   (search === "" || o.id.includes(search) || o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase())))
 );

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
 <CustomerSidebar active="/customer/orders" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">Lịch sử đơn hàng</h1>
 <Link href="/products" className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
 Mua thêm
 </Link>
 </div>
 {/* Status tabs */}
 <div className="px-6 flex gap-0 border-t border-[#f0f0f0] overflow-x-auto">
 {statusTabs.map(t => (
 <button key={t.key} onClick={() => setActiveStatus(t.key)}
 className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeStatus === t.key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
 {t.label}
 <span className="ml-1 text-xs text-[#8f9294]">({orders.filter(o => t.key === "" || o.status === t.key).length})</span>
 </button>
 ))}
 </div>
 </div>

 <div className="p-6">
 {/* Search */}
 <div className="flex gap-3 mb-4">
 <div className="relative flex-1 max-w-sm">
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đơn, tên sản phẩm..." className="w-full pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a4b97]" />
 </div>
 </div>

 {/* Loading */}
 {loading ? (
   <div className="text-center py-16 text-[#8f9294]">
     <span className="inline-block w-6 h-6 border-2 border-[#1a4b97] border-t-transparent rounded-full animate-spin mr-2" />
     Đang tải đơn hàng...
   </div>
 ) : filtered.length === 0 ? (
 <div className="text-center py-16 text-[#8f9294]">
 <p className="text-4xl mb-3"></p>
 <p className="font-semibold">{lang === "zh" ? "暂无订单" : "Không có đơn hàng nào"}</p>
 <Link href="/products" className="mt-3 inline-block text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>Mua sắm ngay</Link>
 </div>
 ) : (
 <div className="space-y-3">
 {filtered.map(order => {
 const badge = statusBadge(order.status);
 const sym = statusSymbol[order.status] || statusSymbol["confirmed"];
 const isExpanded = expandedOrder === order.id;
 const productNames = order.items.map(i => `${lang === "zh" ? ((i as any).nameZh || i.name) : i.name} × ${i.qty}`).join(", ");
 return (
 <div key={order.id} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
 <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-base" style={{ background: sym.bg, color: sym.color }}>
 {sym.symbol}
 </div>
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-mono font-bold text-[#44494d] text-sm">{order.id}</span>
 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
 </div>
 <p className="text-sm text-slate-600 mb-1 line-clamp-1">{productNames}</p>
 <p className="text-xs text-[#8f9294]">{formatDate(order.createdAt)}</p>
 </div>
 </div>
 <div className="text-right shrink-0 ml-4">
 <p className="font-bold text-[#44494d]">{fp(order.total)}</p>
 <p className="text-xs text-[#8f9294] mt-1">{isExpanded ? "Thu gọn ▲" : "Xem chi tiết ▼"}</p>
 </div>
 </div>

 {isExpanded && (
 <div className="border-t border-[#f0f0f0] p-4" style={{ background: "#FAFAFA" }}>
 {/* Shipping progress */}
 {order.status === "shipping" && (
 <div className="mb-4 p-3 rounded-xl border border-orange-100 bg-orange-50">
 <div className="flex items-center gap-2 mb-2">
 <span className="font-semibold text-orange-700 text-sm">{lang === "zh" ? "配送中" : "Đang giao hàng"}</span>
 </div>
 {order.tracking && <p className="text-xs text-[#1a4b97] font-mono">Mã tracking: {order.tracking}</p>}
 </div>
 )}

 {/* Order items */}
 <div className="mb-4">
   <p className="text-xs text-[#8f9294] mb-2 font-semibold">{lang === "zh" ? "产品" : "SẢN PHẨM"}</p>
   {order.items.map((item, i) => (
     <div key={i} className="flex items-center justify-between py-1.5 text-sm">
       <span className="text-slate-600">{lang === "zh" ? ((item as any).nameZh || item.name) : item.name} <span className="text-[#8f9294]">× {item.qty}</span></span>
       <span className="font-semibold text-[#44494d]">{fp(item.price * item.qty)}</span>
     </div>
   ))}
 </div>

 <div className="flex gap-3 flex-wrap">
 {order.status === "delivered" && (
 <>
 <button onClick={() => {}} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>Mua lại</button>
 <button onClick={() => {}} className="text-xs font-semibold text-[#8f9294] cursor-default">Đánh giá</button>
 </>
 )}
 {order.status === "shipping" && (
 <button onClick={() => {}} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#22C55E" }}>Đã nhận hàng</button>
 )}
 <button onClick={() => {}} className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#e5e5e5] text-[#8f9294] flex items-center gap-1">
 Xem hóa đơn
 </button>
 </div>
 </div>
 )}
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

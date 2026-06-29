"use client";
import { getAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, getStatusBadge } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";

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

const paymentLabel: Record<string, string> = {
  momo: "MoMo", zalopay: "ZaloPay", paypal: "PayPal",
  card: "Thẻ", bank: "Chuyển khoản", cod: "COD",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function AdminOrdersPage() {
 const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===

  const statusOptions = [
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: (lang === "zh" ? "已确认" : "Đã xác nhận") },
    { value: "shipping", label: (lang === "zh" ? "配送中" : "Đang giao hàng") },
    { value: "delivered", label: (lang === "zh" ? "已送达" : "Đã giao") },
    { value: "cancelled", label: "Đã hủy" },
    { value: "refunded", label: (lang === "zh" ? "已退款" : "Đã hoàn tiền") },
  ];

 const [orders, setOrders] = useState<ApiOrder[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeStatus, setActiveStatus] = useState("");
 const [search, setSearch] = useState("");
 const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
 const [editStatus, setEditStatus] = useState("");
 const [editNote, setEditNote] = useState("");
 const [toast, setToast] = useState("");
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [createForm, setCreateForm] = useState({ customerEmail: "", phone: "", address: "", city: "Hà Nội", note: "" });
 const [createItems, setCreateItems] = useState<Array<{ id: string; name: string; price: number; qty: number }>>([]);
 const [allProductsForOrder, setAllProductsForOrder] = useState<any[]>([]);
 const [productSearch, setProductSearch] = useState("");
 const [creating, setCreating] = useState(false);

 useEffect(() => {
   if (showCreateModal && allProductsForOrder.length === 0) {
     fetch("/api/products").then(r => r.json()).then(d => setAllProductsForOrder(Array.isArray(d) ? d : [])).catch(() => {});
   }
 }, [showCreateModal, allProductsForOrder.length]);

 async function handleCreateOrder() {
   if (createItems.length === 0) { showToast("Thêm ít nhất 1 sản phẩm"); return; }
   if (!createForm.customerEmail || !createForm.phone || !createForm.address) { showToast("Điền đủ thông tin khách"); return; }
   setCreating(true);
   const subtotal = createItems.reduce((s, it) => s + it.price * it.qty, 0);
   try {
     const res = await fetch("/api/orders", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       credentials: "include",
       body: JSON.stringify({
         items: createItems,
         shipping: { name: createForm.customerEmail, phone: createForm.phone, city: createForm.city, address: createForm.address, method: "ghn", fee: 25000 },
         paymentMethod: "cod",
         subtotal,
         discount: 0,
         total: subtotal + 25000,
       }),
     });
     if (!res.ok) throw new Error("create failed");
     const newOrder = await res.json();
     setOrders(prev => [newOrder, ...prev]);
     setShowCreateModal(false);
     setCreateForm({ customerEmail: "", phone: "", address: "", city: "Hà Nội", note: "" });
     setCreateItems([]);
     showToast(`Đã tạo đơn ${newOrder.id}`);
   } catch {
     showToast("Lỗi tạo đơn");
   } finally {
     setCreating(false);
   }
 }


 useEffect(() => {
   fetch("/api/orders")
     .then(r => r.json())
     .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
     .catch(() => setLoading(false));
 }, []);

 const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

 const openOrder = (o: ApiOrder) => { setSelectedOrder(o); setEditStatus(o.status); setEditNote(o.note || ""); };

 const saveOrder = async () => {
   if (!selectedOrder) return;
   try {
     const res = await fetch(`/api/orders/${selectedOrder.id}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ status: editStatus, note: editNote }),
     });
     const updated = await res.json();
     setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, ...updated } : o));
     setSelectedOrder(prev => prev ? { ...prev, ...updated } : null);
     showToast("Đã cập nhật đơn hàng " + selectedOrder.id);
   } catch {
     showToast("Lỗi khi cập nhật đơn hàng");
   }
 };

 const cancelOrder = async (id: string) => {
   try {
     await fetch(`/api/orders/${id}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ status: "cancelled" }),
     });
     setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
     setSelectedOrder(null);
     showToast("Đã hủy đơn " + id);
   } catch {
     showToast("Lỗi khi hủy đơn hàng");
   }
 };

 const statusTabs = [
   { key: "", label: (lang === "zh" ? "全部" : "Tất cả"), count: orders.length },
   { key: "pending", label: "Chờ xác nhận", count: orders.filter(o => o.status === "pending").length },
   { key: "confirmed", label: (lang === "zh" ? "已确认" : "Đã xác nhận"), count: orders.filter(o => o.status === "confirmed").length },
   { key: "shipping", label: (lang === "zh" ? "配送中" : "Đang giao"), count: orders.filter(o => o.status === "shipping").length },
   { key: "delivered", label: (lang === "zh" ? "已送达" : "Đã giao"), count: orders.filter(o => o.status === "delivered").length },
   { key: "cancelled", label: "Đã hủy", count: orders.filter(o => o.status === "cancelled").length },
 ];

 const filtered = orders.filter(o =>
   (activeStatus === "" || o.status === activeStatus) &&
   (search === "" || o.id.toLowerCase().includes(search.toLowerCase()) || o.shipping.name.toLowerCase().includes(search.toLowerCase()))
 );

 // Dynamic KPIs
 const totalGMV = orders.reduce((s, o) => s + o.total, 0);
 const pendingCount = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;
 const completedCount = orders.filter(o => o.status === "delivered").length;
 const completionRate = orders.length > 0 ? ((completedCount / orders.length) * 100).toFixed(1) : "0";

 const kpis = [
   { label: "Tổng đơn hàng", value: orders.length.toString(), color: "#44494d" },
   { label: "GMV tháng này", value: fp(totalGMV), color: "var(--ap-primary)" },
   { label: "Đơn chờ xử lý", value: pendingCount.toString(), color: "#F59E0B" },
   { label: "Tỉ lệ hoàn thành", value: completionRate + "%", color: "#22C55E" },
 ];

 const statusBadge = (status: string) => {
   const map: Record<string, { label: string; color: string }> = {
     pending: { label: (lang === "zh" ? "待确认" : "Chờ xác nhận"), color: "bg-yellow-100 text-yellow-700" },
     confirmed: { label: (lang === "zh" ? "已确认" : "Đã xác nhận"), color: "bg-blue-100 text-blue-700" },
     shipping: { label: (lang === "zh" ? "配送中" : "Đang giao"), color: "bg-indigo-100 text-indigo-700" },
     delivered: { label: (lang === "zh" ? "已送达" : "Đã giao"), color: "bg-green-200 text-green-800" },
     cancelled: { label: (lang === "zh" ? "已取消" : "Đã hủy"), color: "bg-red-100 text-red-700" },
     refunded: { label: (lang === "zh" ? "已退款" : "Đã hoàn tiền"), color: "bg-purple-100 text-purple-700" },
   };
   return map[status] ?? { label: status, color: "bg-[#f4f4f4] text-[#44494d]" };
 };

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <AdminSidebar active="/admin/orders" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{t("ordersTitle")}</h1>
 <div className="flex items-center gap-2">
   <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ Tạo đơn mới</button>
   <button className="px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">{t("exportExcel")}</button>
 </div>
 </div>
 <div className="px-6 flex gap-0 border-t border-[#f0f0f0] overflow-x-auto">
 {statusTabs.map(t => (
 <button key={t.key} onClick={() => setActiveStatus(t.key)}
 className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeStatus === t.key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
 {t.label}
 <span className="ml-1 text-xs text-[#8f9294]">({t.count})</span>
 </button>
 ))}
 </div>
 </div>

 <div className="p-6">
 {/* KPIs */}
 <div className="grid grid-cols-4 gap-4 mb-6">
 {kpis.map(k => (
 <div key={k.label} className="bg-white rounded-xl border border-[#f0f0f0] p-4">
 <p className="text-xs text-[#8f9294] mb-1">{k.label}</p>
 <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
 </div>
 ))}
 </div>

 {/* Filters */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-4 mb-4 flex gap-3">
 <div className="relative flex-1 max-w-sm">
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "zh" ? "搜索订单号、客户名..." : "Tìm mã đơn, tên KH..."} className="w-full pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 </div>

 {/* Loading */}
 {loading ? (
   <div className="text-center py-16 text-[#8f9294]">
     <span className="inline-block w-6 h-6 border-2 border-[#1a4b97] border-t-transparent rounded-full animate-spin mr-2" />
     Đang tải đơn hàng...
   </div>
 ) : (
 /* Orders table */
 <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">MÃ ĐH</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "客户" : "KHÁCH HÀNG"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
 <th className="text-left px-4 py-3">THANH TOÁN</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "总金额" : "TỔNG TIỀN"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "日期" : "NGÀY"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
 <th className="text-left px-4 py-3">XEM</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map(order => {
 const badge = statusBadge(order.status);
 return (
 <tr key={order.id} className="border-t border-slate-50 hover:bg-[#f8f8fa] cursor-pointer" onClick={() => openOrder(order)}>
 <td className="px-4 py-3 font-mono text-sm font-bold text-slate-600">{order.id}</td>
 <td className="px-4 py-3">
 <p className="font-semibold text-[#44494d] text-sm">{order.shipping.name}</p>
 <p className="text-xs text-[#8f9294]">{order.shipping.city}</p>
 </td>
 <td className="px-4 py-3 text-slate-600 text-sm max-w-[180px] truncate">{order.items.map(i => `${lang === "zh" ? ((i as any).nameZh || i.name) : i.name} × ${i.qty}`).join(", ")}</td>
 <td className="px-4 py-3">
 <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f4f4f4] text-slate-600">{paymentLabel[order.payment.method] || order.payment.method}</span>
 </td>
 <td className="px-4 py-3 font-bold text-[#44494d]">{fp(order.total)}</td>
 <td className="px-4 py-3 text-[#8f9294] text-sm">{formatDate(order.createdAt)}</td>
 <td className="px-4 py-3">
 <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>{badge.label}</span>
 </td>
 <td className="px-4 py-3">
 <button className="p-1.5 rounded-lg hover:bg-orange-50 text-[#1a4b97] text-xs font-bold" title={t("edit")}>✎</button>
 </td>
 </tr>
 );
 })}
 {filtered.length === 0 && (
   <tr><td colSpan={8} className="text-center py-12 text-[#8f9294]">{lang === "zh" ? "暂无订单" : "Không có đơn hàng nào"}</td></tr>
 )}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Toast */}
 {toast && (
 <div className="fixed bottom-6 right-6 z-[100] bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-fade-in">
 ✓ {toast}
 </div>
 )}

 {/* Order detail drawer */}
 {selectedOrder && (
 <div className="fixed inset-0 z-50 flex">
 <div className="flex-1 bg-black/20" onClick={() => setSelectedOrder(null)} />
 <div className="w-[420px] bg-white shadow-xl overflow-y-auto">
 <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
 <div>
 <h3 className="font-bold text-[#44494d]">{selectedOrder.id}</h3>
 <p className="text-xs text-[#8f9294]">{formatDate(selectedOrder.createdAt)}</p>
 </div>
 <button onClick={() => setSelectedOrder(null)} className="text-[#8f9294] hover:text-slate-600 text-xl">✕</button>
 </div>
 <div className="p-5 space-y-4">
 {/* Thông tin */}
 <div>
 <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">{t("orderInfo")}</p>
 <div className="space-y-2 text-sm">
 {([
 ["Khách hàng", selectedOrder.shipping.name],
 [(lang === "zh" ? "电话" : "SĐT"), selectedOrder.shipping.phone],
 [(lang === "zh" ? "省/市" : "Tỉnh/TP"), selectedOrder.shipping.city],
 ["Địa chỉ", selectedOrder.shipping.address],
 ["Thanh toán", paymentLabel[selectedOrder.payment.method] || selectedOrder.payment.method],
 ["Tracking", selectedOrder.tracking || (lang === "zh" ? "暂无" : "Chưa có")],
 ] as [string,string][]).map(([k, v]) => (
 <div key={k} className="flex justify-between gap-2">
 <span className="text-[#8f9294] shrink-0">{k}:</span>
 <span className="font-medium text-[#44494d] text-right">{v}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Products */}
 <div>
 <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">Sản phẩm ({selectedOrder.items.length} món)</p>
 <div className="space-y-2">
   {selectedOrder.items.map((item, i) => (
     <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
       <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-[#8f9294]" style={{ background: "white" }}>SP</div>
       <div className="flex-1">
         <p className="text-sm font-semibold text-[#44494d]">{lang === "zh" ? ((item as any).nameZh || item.name) : item.name}</p>
         <p className="text-xs text-[#8f9294]">x{item.qty}</p>
       </div>
       <span className="font-bold text-[#44494d] text-sm">{fp(item.price * item.qty)}</span>
     </div>
   ))}
 </div>
 </div>

 {/* Tài chính */}
 <div className="p-4 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div className="flex justify-between items-center">
 <span className="font-semibold text-slate-600">Tổng tiền KH trả:</span>
 <span className="text-xl font-extrabold" style={{ color: "var(--ap-primary)" }}>{fp(selectedOrder.total)}</span>
 </div>
 <div className="flex justify-between mt-1 text-xs text-[#8f9294]">
 <span>Phí nền tảng (11.1%)</span>
 <span>-{fp(Math.round(selectedOrder.total * 0.111))}</span>
 </div>
 <div className="flex justify-between mt-1 text-xs font-semibold text-green-600">
 <span>NCC nhận được</span>
 <span>{fp(Math.round(selectedOrder.total * 0.889))}</span>
 </div>
 </div>

 {/* Cập nhật trạng thái */}
 <div>
 <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">{lang === "zh" ? "更新状态" : "Cập nhật trạng thái"}</p>
 <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
 className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm mb-3 focus:outline-none focus:border-[#1a4b97]">
 {statusOptions.map(s => (
   <option key={s.value} value={s.value}>{s.label}</option>
 ))}
 </select>
 <label className="text-xs font-semibold text-[#8f9294] uppercase mb-1 block">Ghi chú nội bộ</label>
 <textarea value={editNote} onChange={e => setEditNote(e.target.value)}
 rows={2} placeholder="Ghi chú cho đơn hàng này..."
 className="w-full px-3 py-2 border border-[#e5e5e5] rounded-xl text-sm mb-3 focus:outline-none focus:border-[#1a4b97] resize-none" />
 <div className="flex gap-2">
 <button onClick={saveOrder}
 className="flex-1 py-2.5 rounded-xl font-semibold text-white" style={{ background: "var(--ap-primary)" }}>
 Lưu thay đổi
 </button>
 {editStatus !== "cancelled" && (
 <button onClick={() => cancelOrder(selectedOrder.id)}
 className="px-4 py-2.5 rounded-xl font-semibold text-red-500 border border-red-200 hover:bg-red-50">
 Hủy đơn
 </button>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {showCreateModal && (
   <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
     <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
       <div className="sticky top-0 bg-white border-b border-[#e5e5e5] px-6 py-3 flex items-center justify-between">
         <h2 className="text-lg font-bold text-[#44494d]">Tạo đơn hàng mới</h2>
         <button onClick={() => setShowCreateModal(false)} className="text-2xl text-[#8f9294] hover:text-[#44494d]">×</button>
       </div>
       <div className="p-6 space-y-4">
         <div>
           <h3 className="font-semibold text-sm text-[#44494d] mb-2">Thông tin khách hàng</h3>
           <div className="grid grid-cols-2 gap-3">
             <input value={createForm.customerEmail} onChange={e => setCreateForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="Họ tên / email khách" className="px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
             <input value={createForm.phone} onChange={e => setCreateForm(f => ({ ...f, phone: e.target.value }))} placeholder="Số điện thoại" className="px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
             <input value={createForm.address} onChange={e => setCreateForm(f => ({ ...f, address: e.target.value }))} placeholder="Địa chỉ chi tiết" className="px-3 py-2 border border-[#e5e5e5] rounded text-sm col-span-2" />
             <select value={createForm.city} onChange={e => setCreateForm(f => ({ ...f, city: e.target.value }))} className="px-3 py-2 border border-[#e5e5e5] rounded text-sm">
               <option>Hà Nội</option><option>TP. Hồ Chí Minh</option><option>Đà Nẵng</option><option>Hải Phòng</option><option>Cần Thơ</option><option>Khác</option>
             </select>
           </div>
         </div>

         <div>
           <h3 className="font-semibold text-sm text-[#44494d] mb-2">Sản phẩm ({createItems.length})</h3>
           <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Tìm sản phẩm theo tên / OEM..." className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm mb-2" />
           {productSearch && (
             <div className="max-h-40 overflow-y-auto border border-[#e5e5e5] rounded mb-2">
               {allProductsForOrder.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.oemCode || "").toLowerCase().includes(productSearch.toLowerCase())).slice(0, 8).map(p => (
                 <div key={p.id} onClick={() => { setCreateItems(prev => prev.find(x => x.id === p.id) ? prev : [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }]); setProductSearch(""); }} className="px-3 py-2 hover:bg-[#f8f8fa] cursor-pointer border-b border-[#f0f0f0] flex items-center justify-between">
                   <div>
                     <p className="text-sm font-semibold text-[#44494d]">{p.name}</p>
                     <p className="text-xs text-[#8f9294]">{p.oemCode || "—"}</p>
                   </div>
                   <span className="text-sm font-bold text-[#1a4b97]">{fp(p.price)}</span>
                 </div>
               ))}
             </div>
           )}
           {createItems.length === 0 ? (
             <p className="text-sm text-[#8f9294] text-center py-4">Chưa có sản phẩm nào</p>
           ) : (
             <div className="space-y-2">
               {createItems.map(it => (
                 <div key={it.id} className="flex items-center gap-3 p-2 bg-[#f8f8fa] rounded">
                   <span className="flex-1 text-sm text-[#44494d]">{it.name}</span>
                   <input type="number" min="1" value={it.qty} onChange={e => setCreateItems(prev => prev.map(x => x.id === it.id ? { ...x, qty: Math.max(1, parseInt(e.target.value) || 1) } : x))} className="w-16 px-2 py-1 border border-[#e5e5e5] rounded text-sm text-center" />
                   <span className="w-24 text-right text-sm font-semibold">{fp(it.price * it.qty)}</span>
                   <button onClick={() => setCreateItems(prev => prev.filter(x => x.id !== it.id))} className="text-red-500 hover:bg-red-50 px-2 rounded">×</button>
                 </div>
               ))}
               <div className="flex justify-end pt-2 border-t border-[#e5e5e5]">
                 <span className="text-sm">Tạm tính: <strong className="text-[#1a4b97]">{fp(createItems.reduce((s, it) => s + it.price * it.qty, 0))}</strong></span>
               </div>
             </div>
           )}
         </div>

         <div className="flex justify-end gap-2 pt-4 border-t border-[#e5e5e5]">
           <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">Hủy</button>
           <button onClick={handleCreateOrder} disabled={creating || createItems.length === 0} className="px-4 py-2 rounded text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>
             {creating ? "Đang tạo..." : "Tạo đơn"}
           </button>
         </div>
       </div>
     </div>
   </div>
 )}
 </main>
 </div>
 );
}

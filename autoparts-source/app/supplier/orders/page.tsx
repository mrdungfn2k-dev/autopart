"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import SupplierSidebar from "@/components/SupplierSidebar";
import Pagination from "@/components/Pagination";

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

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function SupplierOrdersPage() {
 const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: t('orderPending'), color: "bg-yellow-100 text-yellow-700" },
      confirmed: { label: t('orderConfirmed'), color: "bg-blue-100 text-blue-700" },
      shipping: { label: t('orderShipping'), color: "bg-indigo-100 text-indigo-700" },
      delivered: { label: t('orderDelivered'), color: "bg-green-200 text-green-800" },
      cancelled: { label: t('orderCancelled'), color: "bg-red-100 text-red-700" },
    };
    return map[status] ?? { label: status, color: "bg-[#f4f4f4] text-[#44494d]" };
  };

 const [orders, setOrders] = useState<ApiOrder[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [statusFilter, setStatusFilter] = useState("");
 useEffect(() => { const p = new URLSearchParams(window.location.search).get("q"); if (p) setSearch(p); }, []);
 const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
 const [trackingInput, setTrackingInput] = useState("");
 const [toast, setToast] = useState("");

 useEffect(() => {
   fetch("/api/orders")
     .then(r => r.json())
     .then(async data => {
       const list = Array.isArray(data) ? data : [];
       setOrders(list);
       setLoading(false);
       // VẬN HÀNH TỰ ĐỘNG (a): khi mở trang, nếu NCC bật toggle → tự xử lý đơn theo logic
       try {
         const s = JSON.parse(localStorage.getItem("ap_supplier_settings") || "null");
         const ops = s?.ops || {};
         if (!ops.autoConfirm && !ops.autoShip) return;
         const put = (id: string, status: string) => fetch(`/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status }) });
         let confirmed = 0, shipped = 0;
         for (const o of list) {
           if (ops.autoConfirm && o.status === "pending") {
             if ((await put(o.id, "confirmed")).ok) { confirmed++; setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: "confirmed" } : x));
               if (ops.autoShip && (await put(o.id, "shipping")).ok) { shipped++; setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: "shipping" } : x)); }
             }
           } else if (ops.autoShip && o.status === "confirmed") {
             if ((await put(o.id, "shipping")).ok) { shipped++; setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: "shipping" } : x)); }
           }
         }
         if (confirmed || shipped) window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: `⚙️ Vận hành tự động: đã xác nhận ${confirmed} đơn${shipped ? `, chuyển vận chuyển ${shipped} đơn` : ""}.`, type: "success" } }));
       } catch {}
     })
     .catch(() => setLoading(false));
 }, []);

 const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const statusFilters = [
    { key: "", label: t('all'), count: orders.length },
    { key: "pending", label: t('orderPending'), count: orders.filter(o => o.status === "pending").length },
    { key: "confirmed", label: t('orderConfirmed'), count: orders.filter(o => o.status === "confirmed").length },
    { key: "shipping", label: t('orderShipping'), count: orders.filter(o => o.status === "shipping").length },
    { key: "delivered", label: t('orderDelivered'), count: orders.filter(o => o.status === "delivered").length },
  ];

 const filtered = orders.filter(o =>(statusFilter === "" || o.status === statusFilter) &&
   (search === "" || o.id.includes(search) || o.shipping.name.toLowerCase().includes(search.toLowerCase()))
 );

 const PAGE_SIZE = 10;
 const [page, setPage] = useState(1);
 useEffect(() => { setPage(1); }, [statusFilter, search]);
 const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
 const pageSafe = Math.min(page, totalPages);
 const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

 const selected = orders.find(o => o.id === selectedOrder);

 const nextStatusMap: Record<string, string> = {
   pending: "confirmed", confirmed: "shipping", shipping: "delivered"
 };
  const nextStatusLabel: Record<string, string> = {
    pending: lang === "zh" ? "确认订单" : lang === "en" ? "Confirm order" : "Xác nhận đơn", confirmed: lang === "zh" ? "已发货" : lang === "en" ? "Hand to carrier" : "Giao cho đơn vị vận chuyển", shipping: t('confirmDelivered')
  };

 const advanceStatus = async (id: string) => {
   const order = orders.find(o => o.id === id);
   if (!order) return;
   const next = nextStatusMap[order.status];
   if (!next) return;
   try {
     await fetch(`/api/orders/${id}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ status: next }),
     });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
      showToast(t('statusUpdated'));
    } catch {
      showToast(t('updateFailed'));
    }
  };

 const saveTracking = async (id: string, tracking: string) => {
   try {
     await fetch(`/api/orders/${id}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ tracking }),
     });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, tracking } : o));
      showToast(lang === "zh" ? "物流单号已保存！" : "Đã lưu mã vận đơn!");
    } catch {
      showToast(lang === "zh" ? "保存失败" : "Lỗi khi lưu");
    }
  };

 return (
 <>
 <main className="flex-1 flex flex-col overflow-hidden">
 <div className="bg-white border-b border-[#e5e5e5] px-6 h-16 flex items-center justify-between">
 <h1 className="text-xl font-bold text-[#44494d]">{t("ordersTitle")}</h1>
 <button className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa] transition-colors">{t('exportReport')}
 </button>
 </div>{/* Status tabs */}
 <div className="bg-white border-b border-[#f0f0f0] px-6 flex gap-1 overflow-x-auto">{statusFilters.map(f => (
 <button key={f.key} onClick={() => setStatusFilter(f.key)}
 className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${statusFilter === f.key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{f.label} <span className="ml-1 text-xs text-[#8f9294]">({f.count})</span>
 </button>))}
 </div>{loading ? (
   <div className="flex-1 flex items-center justify-center text-[#8f9294]">
     <span className="inline-block w-6 h-6 border-2 border-[#1a4b97] border-t-transparent rounded-full animate-spin mr-2" />{t('loading')}
   </div>) : (
 <div className="flex flex-1 overflow-hidden">{/* Orders list */}
 <div className={`${selectedOrder ? "w-[55%]" : "w-full"} flex flex-col overflow-hidden transition-all`}>
 <div className="p-4 bg-white border-b border-[#f0f0f0]">
 <div className="flex gap-3">
 <div className="relative flex-1">
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchOrders')} className="w-full pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 </div>
 </div>

 <div className="flex-1 overflow-auto p-4 space-y-2">{paged.map(order => {
 const badge = statusBadge(order.status);
 const isSelected = selectedOrder === order.id;
 return (
 <div key={order.id} onClick={() => setSelectedOrder(isSelected ? null : order.id)}
 className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-[#1a4b97]" : "border-[#f0f0f0]"}`}>
 <div className="flex items-center justify-between mb-2">
 <span className="font-mono font-bold text-[#44494d]">{order.id}</span>
 <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>{badge.label}</span>
 </div>
 <p className="text-sm text-slate-600 mb-1">{order.shipping.name}</p>
 <div className="flex items-center justify-between">
 <span className="text-xs text-[#8f9294]">{formatDate(order.createdAt)}</span>
 <span className="font-bold text-[#44494d]">{fp(order.total)}</span>
 </div>
 </div>);
 })}
 {filtered.length === 0 && (
   <div className="text-center py-12 text-[#8f9294]">{t('noOrders')}</div>)}
 <div className="px-1"><Pagination page={pageSafe} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} unit={lang === "zh" ? "笔订单" : lang === "en" ? "orders" : "đơn"} /></div>
 </div>
 </div>{/* Order detail panel */}
 {selected && (
 <div className="w-[45%] border-l border-[#e5e5e5] bg-white flex flex-col overflow-auto">
 <div className="p-5 border-b border-[#f0f0f0] flex items-center justify-between">
 <h2 className="font-bold text-[#44494d]">Chi tiết đơn {selected.id}</h2>
 <button onClick={() => setSelectedOrder(null)} className="text-[#8f9294] hover:text-slate-600 text-lg">✕</button>
 </div>
 <div className="p-5 space-y-4 flex-1">
 <div>
 <p className="text-xs text-[#8f9294] mb-3 font-semibold uppercase">{lang === "zh" ? "客户信息" : "Thông tin khách hàng"}</p>
 <div className="space-y-1 text-sm">{[[(lang === "zh" ? "客户名" : "Tên KH"), selected.shipping.name], [(lang === "zh" ? "电话" : "SĐT"), selected.shipping.phone], [(lang === "zh" ? "省/市" : "Tỉnh/TP"), selected.shipping.city], [(lang === "zh" ? "下单日" : "Ngày đặt"), formatDate(selected.createdAt)], [t('trackingNumber'), selected.tracking || (lang === "zh" ? "暂无" : "Chưa có")]].map(([k, v]) => (
 <div key={k} className="flex justify-between">
 <span className="text-[#8f9294]">{k}:</span>
 <span className="font-medium text-[#44494d]">{v}</span>
 </div>))}
 </div>
 </div>

 <div>
 <p className="text-xs text-[#8f9294] mb-3 font-semibold uppercase">Sản phẩm trong đơn ({selected.items.length} món)</p>
 <div className="space-y-2">{selected.items.map((item, i) => (
 <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-[#8f9294]" style={{ background: "white" }}>SP</div>
 <div className="flex-1">
 <p className="text-sm font-semibold text-[#44494d]">{lang === "zh" ? ((item as any).nameZh || item.name) : item.name}</p>
 <p className="text-xs text-[#8f9294]">x{item.qty}</p>
 </div>
 <span className="font-bold text-[#44494d] text-sm">{fp(item.price * item.qty)}</span>
 </div>))}
 </div>
 </div>

 <div className="border-t border-[#f0f0f0] pt-3">
 <div className="flex justify-between font-bold text-base">
 <span>{t("cartTotal")}</span>
 <span style={{ color: "var(--ap-primary)" }}>{fp(selected.total)}</span>
 </div>
 </div>{/* Status progression */}
 {nextStatusMap[selected.status] && (
 <>{selected.status === "confirmed" && (
 <div className="mt-2">
 <label className="text-xs text-[#8f9294] font-semibold mb-1 block">{t("trackingNumber")}</label>
 <div className="flex gap-2">
 <input value={trackingInput || selected.tracking || ""} onChange={e => setTrackingInput(e.target.value)}
 placeholder={lang === "zh" ? "输入物流单号..." : "Nhập mã vận đơn..."} className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
 <button onClick={() => saveTracking(selected.id, trackingInput)} className="px-3 py-2 text-xs font-bold text-white rounded-lg" style={{ background: "#22C55E" }}>{t("save")}</button>
 </div>
 </div>)}
 <button onClick={() => advanceStatus(selected.id)} className="w-full py-3 rounded-xl text-white font-bold mt-2" style={{ background: "var(--ap-primary)" }}>{nextStatusLabel[selected.status] || (lang === "zh" ? "更新状态" : lang === "en" ? "Update status" : "Cập nhật trạng thái")}
 </button>
 </>)}
 </div>
 </div>)}
 </div>)}
 </main>{/* Toast */}
 {toast && (
 <div className="fixed bottom-6 right-6 z-[100] bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">✓ {toast}
 </div>)}
 </>);
}

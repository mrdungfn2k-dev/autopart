"use client";
import { useLang, formatPriceLang } from "@/lib/i18n";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice, getStatusBadge } from "@/lib/data";

import SidebarControls from "@/components/SidebarControls";
import SupplierSidebar from "@/components/SupplierSidebar";






function KPICard({ label, value, badge, badgeColor, icon: _icon, iconBg: _iconBg }: {
 label: string; value: string; badge?: string; badgeColor?: string;
 icon?: React.ElementType; iconBg?: string;
}) {
 return (
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 card-shadow">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide">{label}</p>
 {badge && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: badgeColor || "#16A34A", background: badgeColor ? `${badgeColor}18` : "#DCFCE720" }}>{badge}</span>}
 </div>
 <p className="text-2xl font-bold tracking-tight text-[#44494d]">{value}</p>
 </div>
 );
}

export default function SupplierDashboard() {
  const { t, fp, lang } = useLang();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const salesChartData = [
    { day: "T2", revenue: 22000000 }, { day: "T3", revenue: 38000000 },
    { day: "T4", revenue: 29000000 }, { day: "T5", revenue: 51000000 },
    { day: "T6", revenue: 33000000 }, { day: "T7", revenue: 47000000 }, { day: "CN", revenue: 41000000 },
  ];
  const suppliers = [{ id: "s-yy", name: "Yongye Canton", rating: 4.9, completion: 98, revenue: 145200000, pendingPayout: 28200000, nextPayoutDate: "10 Tháng 10, 2025" }];
  const supplier = suppliers[0];
  const topProducts = [
    { ...products[0], stockStatus: "on_stock", soldCount: 128 },
    { ...products[1], stockStatus: "on_stock", soldCount: 95, supplierId: "s001" },
    { id: "px", name: "Dây curoa tổng Mitsubishi...", soldCount: 72, stock: 3, stockStatus: "low", image: "timing-belt" },
    { id: "py", name: "Má phanh sau Fortuner...", soldCount: 58, stock: 0, stockStatus: "out", image: "brake-pad" },
  ].filter(p => p && p.name);
 const [period, setPeriod] = useState("week");
 const [showNotifs, setShowNotifs] = useState(false);

 const stockStatusMap: Record<string, { label: string; color: string }> = {
 on_stock: { label: (lang === "zh" ? "稳定" : "Ổn định"), color: "bg-green-100 text-green-700" },
 low: { label: (lang === "zh" ? "即将缺货" : "Sắp hết"), color: "bg-yellow-100 text-yellow-700" },
 out: { label: (lang === "zh" ? "需补货" : "Cần nhập"), color: "bg-red-100 text-red-700" },
 };

 
 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <SupplierSidebar active="/supplier" />

 <main className="flex-1 overflow-auto">
 {/* Top bar */}
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
        <div>
 <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "供应商控制台" : "Dashboard Nhà Cung Cấp"}</h1>
 <p className="text-[#8f9294] text-xs">Chào mừng quay trở lại, đây là dữ liệu kinh doanh của bạn hôm nay.</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="relative">
 <input placeholder={lang === "zh" ? "搜索订单..." : "Tìm kiếm đơn hàng..."} className="pl-4 pr-4 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "#f8f8fa", border: "1px solid #E2E8F0" }} />
 </div>
 <div className="relative">
   <button onClick={() => setShowNotifs(!showNotifs)} className="relative flex items-center justify-center rounded-lg text-[#44494d] hover:bg-gray-100 transition-colors" style={{ background: "#f8f8fa", border: "1px solid #E2E8F0", width: "38px", height: "38px" }}>
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
     <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: "var(--ap-primary)", fontSize: "10px" }}>3</span>
   </button>
   {showNotifs && (
     <div className="absolute right-0 mt-2 w-[320px] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#e5e5e5] py-2 z-50">
       <div className="px-4 py-2 border-b border-[#e5e5e5] font-bold text-[#44494d] text-sm flex justify-between items-center">
         <span>{lang === "zh" ? "通知中心" : "Thông báo"}</span>
         <span className="text-xs text-[#3b7cec] cursor-pointer hover:underline">{lang === "zh" ? "全部已读" : "Đánh dấu đã đọc"}</span>
       </div>
       <div className="max-h-[300px] overflow-y-auto">
         {[
           { title: "Đơn hàng mới #ORD-9912", desc: "Bạn có 1 đơn hàng mới từ khách hàng Nguyễn Văn A.", time: "10 phút trước", unread: true, link: "/supplier/orders" },
           { title: "Cảnh báo tồn kho", desc: "Sản phẩm 'Má phanh sau Fortuner' đã hết hàng.", time: "1 giờ trước", unread: true, link: "/supplier/inventory" },
           { title: "Đánh giá 5 sao", desc: "Sản phẩm 'Dây curoa tổng' vừa nhận được đánh giá tốt.", time: "3 giờ trước", unread: true, link: "/supplier/analytics" }
         ].map((n, i) => (
           <Link href={n.link} key={i} onClick={() => setShowNotifs(false)} className={`block p-4 border-b border-[#f4f4f4] hover:bg-[#f8f8fa] cursor-pointer transition-colors ${n.unread ? "bg-blue-50/50" : ""}`}>
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b7cec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
               </div>
               <div>
                 <p className={`text-sm ${n.unread ? "font-bold text-[#44494d]" : "font-medium text-gray-700"}`}>{n.title}</p>
                 <p className="text-xs text-gray-500 mt-1">{n.desc}</p>
                 <p className="text-[10px] text-[#8f9294] mt-2">{n.time}</p>
               </div>
             </div>
           </Link>
         ))}
       </div>
       <div className="p-2 border-t border-[#e5e5e5] text-center">
         <Link href="/supplier/orders" onClick={() => setShowNotifs(false)} className="text-sm font-medium text-[#3b7cec] hover:underline block w-full py-1">
           {lang === "zh" ? "查看全部" : "Xem tất cả thông báo"}
         </Link>
       </div>
     </div>
   )}
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-6">
 {/* KPI Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <KPICard label={lang === "zh" ? "总营收（扣费后）" : "Tổng doanh thu (sau phí)"} value={fp(supplier.revenue)} badge="+12.5%" badgeColor="#16A34A" />
 <KPICard label={lang === "zh" ? "待处理订单" : "Đơn hàng chờ xử lý"} value="24" badge={lang === "zh" ? "当前" : "Hiện tại"} badgeColor="var(--ap-primary)" iconBg="#EFF6FF" />
 <KPICard label={lang === "zh" ? "低库存预警" : "Cảnh báo tồn kho thấp"} value="12" badge={lang === "zh" ? "紧急" : "Khẩn cấp"} badgeColor="#EF4444" iconBg="#FEF2F2" />
 <KPICard label={lang === "zh" ? "平均评分" : "Đánh giá trung bình"} value="4.8 / 5" badge="+0.1%" badgeColor="#F59E0B" iconBg="#FFFBEB" />
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 {/* Bar Chart */}
 <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-5">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "销售业绩（近7天）" : "Hiệu suất bán hàng (7 ngày qua)"}</h2>
 <select value={period} onChange={e => setPeriod(e.target.value)} className="text-xs border border-[#e5e5e5] rounded-lg px-2 py-1 text-slate-600">
 <option value="week">{t("thisWeek")}</option>
 <option value="month">{t("thisMonth")}</option>
 </select>
 </div>
 <ResponsiveContainer width="100%" height={220}>
 <BarChart data={salesChartData} barSize={32}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [useLang().fp(Number(v)), "Doanh thu"]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="revenue" fill="var(--ap-primary)" radius={6}
 label={false}
 background={{ fill: "#FFF7ED" }}
 />
 </BarChart>
 </ResponsiveContainer>
 </div>

 {/* Payout panel */}
 <div className="rounded-xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}>
 <div className="flex items-center gap-2 mb-4">

 <h2 className="font-bold">{lang === "zh" ? "结算与对账" : "Thanh toán & Đối soát"}</h2>
 </div>
 <p className="text-[#8f9294] text-xs mb-1">{lang === "zh" ? "当前可用余额" : "Số dư khả dụng hiện tại"}</p>
 <p className="text-3xl font-bold mb-5">{fp(supplier.revenue - supplier.pendingPayout)}</p>

 <div className="bg-white/10 rounded-xl p-4 mb-3">
 <div className="flex items-center gap-2 mb-1">

 <p className="text-slate-300 text-xs">{lang === "zh" ? "下次结算日期" : "Ngày quyết toán tiếp theo"}</p>
 </div>
 <p className="text-white font-semibold">{supplier.nextPayoutDate}</p>
 </div>
 <div className="bg-white/10 rounded-xl p-4 mb-4">
 <p className="text-slate-300 text-xs mb-1">{lang === "zh" ? "待处理" : "Đang chờ xử lý"}</p>
 <p className="text-xl font-bold">{fp(supplier.pendingPayout)}</p>
 </div>
 <button onClick={() => {}} className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2" style={{ background: "var(--ap-primary)" }}>
 Xem sao kê chi tiết
 </button>
 </div>
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 {/* Orders table */}
 <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "最新订单" : "Đơn hàng mới nhất"}</h2>
 <Link href="/supplier/orders" style={{ color: "var(--ap-primary)" }} className="text-sm font-semibold">{lang === "zh" ? "全部订单" : "Tất cả đơn hàng"}</Link>
 </div>
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[#f0f0f0]">
 {[(lang === "zh" ? "订单号" : "MÃ ĐƠN"), (lang === "zh" ? "客户" : "KHÁCH HÀNG"), (lang === "zh" ? "下单日期" : "NGÀY ĐẶT"), (lang === "zh" ? "状态" : "TRẠNG THÁI"), (lang === "zh" ? "总金额" : "TỔNG TIỀN")].map(h => (
 <th key={h} className="text-left py-2 text-xs text-[#8f9294] font-semibold">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {orders.slice(0, 5).map(order => {
 const badge = getStatusBadge(order.status);
 return (
 <tr key={order.id} className="border-b border-slate-50 hover:bg-[#f8f8fa] transition-colors">
 <td className="py-3 font-mono font-semibold text-[#44494d]">{order.id}</td>
 <td className="py-3 text-slate-600">{order.customer}</td>
 <td className="py-3 text-[#8f9294] text-xs">{order.date}</td>
 <td className="py-3">
 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>{badge.label}</span>
 </td>
 <td className="py-3 font-bold text-[#44494d]">{fp(order.total)}</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Top products */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{t("topProducts")}</h2>
 <div className="space-y-3">
 {topProducts.map((prod, i) => {
 const stockStyle = stockStatusMap[prod.stockStatus as string] || { label: "N/A", color: "bg-[#f4f4f4] text-gray-600" };
 return (
 <div key={i} className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs text-white"
 style={{ background: ["var(--ap-primary)","var(--ap-primary)","#8B5CF6","#EF4444"][i % 4] }}>
 {prod.name.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-[#44494d] truncate">{prod.name}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${stockStyle.color}`}>Tồn kho: {(prod as { stock?: number }).stock ?? 45} • {stockStyle.label}</span>
 </div>
 </div>
 <div className="text-right shrink-0">
 <p className="text-sm font-bold text-[#44494d]">{prod.soldCount}</p>
 <p className="text-xs text-[#8f9294]">{t("sold")}</p>
 </div>
 </div>
 );
 })}
 </div>
 <Link href="/supplier/inventory" className="w-full mt-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa] transition-colors flex items-center justify-center">
 Quản lý kho hàng
 </Link>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

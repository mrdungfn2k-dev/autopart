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
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5 card-shadow">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide">{label}</p>{badge && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: badgeColor || "#16A34A", background: badgeColor ? `${badgeColor}18` : "#DCFCE720" }}>{badge}</span>}
 </div>
 <p className="text-2xl font-bold tracking-tight text-[#44494d]">{value}</p>
 </div>);
}

export default function SupplierDashboard() {
  const { t, fp, lang } = useLang();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const _nextPay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10);
  const suppliers = [{ id: "s-yy", name: "Yongye Canton", rating: 4.9, completion: 98, revenue: 145200000, pendingPayout: 28200000, nextPayoutDate: `10 Tháng ${_nextPay.getMonth() + 1}, ${_nextPay.getFullYear()}` }];
  const supplier = suppliers[0];
  const topProducts = [
    { ...products[0], stockStatus: "on_stock", soldCount: 128 },
    { ...products[1], stockStatus: "on_stock", soldCount: 95, supplierId: "s001" },
    { id: "px", name: "Dây curoa tổng Mitsubishi...", soldCount: 72, stock: 3, stockStatus: "low", image: "timing-belt" },
    { id: "py", name: "Má phanh sau Fortuner...", soldCount: 58, stock: 0, stockStatus: "out", image: "brake-pad" },
  ].filter(p => p && p.name);
 const [period, setPeriod] = useState("week");
 const [cFrom, setCFrom] = useState("");
 const [cTo, setCTo] = useState("");
 // ===== Số liệu THẬT từ đơn hàng + biểu đồ lọc: 7 ngày / tháng này (theo NGÀY, đủ 30 ngày) / năm / tùy chọn =====
 const _now = new Date();
 const _sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
 const _revOf = (fn: (d: Date) => boolean) => orders.filter(o => { const d = new Date(o.createdAt); return !isNaN(d.getTime()) && fn(d); }).reduce((s, o) => s + (o.total || 0), 0);
 const _WD = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
 const realChart = (() => {
   if (period === "year") return Array.from({ length: 12 }, (_, i) => { const m = new Date(_now.getFullYear(), _now.getMonth() - 11 + i, 1); return { day: "T" + (m.getMonth() + 1), revenue: _revOf(d => d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth()) }; });
   if (period === "month") { const dim = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate(); return Array.from({ length: dim }, (_, i) => { const d = new Date(_now.getFullYear(), _now.getMonth(), i + 1); return { day: String(i + 1), revenue: _revOf(x => _sameDay(x, d)) }; }); }
   if (period === "custom") { const f = cFrom ? new Date(cFrom) : new Date(_now.getFullYear(), _now.getMonth(), 1); const t = cTo ? new Date(cTo) : _now; const n = Math.max(1, Math.min(62, Math.round((t.getTime() - f.getTime()) / 86400000) + 1)); return Array.from({ length: n }, (_, i) => { const d = new Date(f); d.setDate(d.getDate() + i); return { day: `${d.getDate()}/${d.getMonth() + 1}`, revenue: _revOf(x => _sameDay(x, d)) }; }); }
   return Array.from({ length: 7 }, (_, i) => { const d = new Date(_now); d.setDate(d.getDate() - (6 - i)); return { day: _WD[d.getDay()], revenue: _revOf(x => _sameDay(x, d)) }; });
 })();
 const _hasReal = orders.length > 0;
 const chartData = realChart;
 const realRevenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + (o.total || 0), 0);
 const realPending = orders.filter(o => o.status === "pending" || o.status === "confirmed").length;
 const realLowStock = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length;
 const [q, setQ] = useState("");
 const goSearch = () => { if (q.trim()) window.location.href = "/supplier/orders?q=" + encodeURIComponent(q.trim()); };

 const stockStatusMap: Record<string, { label: string; color: string }> = {
 on_stock: { label: (lang === "en" ? "Stable" : lang === "zh" ? "稳定" : "Ổn định"), color: "bg-green-100 text-green-700" },
 low: { label: (lang === "en" ? "Low Stock" : lang === "zh" ? "即将缺货" : "Sắp hết"), color: "bg-yellow-100 text-yellow-700" },
 out: { label: (lang === "en" ? "Out of Stock" : lang === "zh" ? "需补货" : "Cần nhập"), color: "bg-red-100 text-red-700" },
 };

 
 return (
 <>

 <main className="flex-1 overflow-auto">{/* Top bar */}
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
        <div>
 <h1 className="text-xl font-bold text-[#44494d]">{lang === "en" ? "Supplier Dashboard" : lang === "zh" ? "供应商控制台" : "Dashboard Nhà Cung Cấp"}</h1>
 <p className="text-[#8f9294] text-xs">{lang === "zh" ? "欢迎回来，这是您今天的经营数据。" : lang === "en" ? "Welcome back, here's your business data for today." : "Chào mừng quay trở lại, đây là dữ liệu kinh doanh của bạn hôm nay."}</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="relative">
 <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") goSearch(); }} placeholder={lang === "en" ? "Search orders..." : lang === "zh" ? "搜索订单..." : "Tìm kiếm đơn hàng..."} className="pl-4 pr-4 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "#f8f8fa", border: "1px solid #E2E8F0" }} />
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-6">{/* KPI Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <KPICard label={lang === "zh" ? "总营收（已交付）" : lang === "en" ? "Total revenue (delivered)" : "Tổng doanh thu (đã giao)"} value={fp(realRevenue || supplier.revenue)} badge="+12.5%" badgeColor="#16A34A" />
 <KPICard label={lang === "zh" ? "待处理订单" : lang === "en" ? "Pending orders" : "Đơn hàng chờ xử lý"} value={(_hasReal ? realPending : 24).toString()} badge={lang === "zh" ? "当前" : lang === "en" ? "Current" : "Hiện tại"} badgeColor="var(--ap-primary)" iconBg="#EFF6FF" />
 <KPICard label={lang === "zh" ? "低库存预警" : lang === "en" ? "Low-stock alert" : "Cảnh báo tồn kho thấp"} value={(products.length ? realLowStock : 12).toString()} badge={lang === "zh" ? "紧急" : lang === "en" ? "Urgent" : "Khẩn cấp"} badgeColor="#EF4444" iconBg="#FEF2F2" />
 <KPICard label={lang === "en" ? "Avg Rating" : lang === "zh" ? "平均评分" : "Đánh giá trung bình"} value="4.8 / 5" badge="+0.1%" badgeColor="#F59E0B" iconBg="#FFFBEB" />
 </div>

 <div className="grid lg:grid-cols-3 gap-6">{/* Bar Chart */}
 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-5">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? (period === "year" ? "销售业绩（今年）" : period === "month" ? "销售业绩（本月）" : period === "custom" ? "销售业绩（自定义）" : "销售业绩（近7天）") : lang === "en" ? (period === "year" ? "Sales (this year)" : period === "month" ? "Sales (this month)" : period === "custom" ? "Sales (custom)" : "Sales (last 7 days)") : (period === "year" ? "Hiệu suất bán hàng (năm nay)" : period === "month" ? "Hiệu suất bán hàng (tháng này)" : period === "custom" ? "Hiệu suất bán hàng (tùy chọn)" : "Hiệu suất bán hàng (7 ngày qua)")}</h2>
 <div className="flex items-center gap-2">
 {period === "custom" && (<>
 <input type="date" value={cFrom} onChange={e => setCFrom(e.target.value)} className="text-xs border border-[#e5e5e5] rounded-lg px-2 py-1 text-slate-600" />
 <span className="text-xs text-[#8f9294]">→</span>
 <input type="date" value={cTo} onChange={e => setCTo(e.target.value)} className="text-xs border border-[#e5e5e5] rounded-lg px-2 py-1 text-slate-600" />
 </>)}
 <select value={period} onChange={e => setPeriod(e.target.value)} className="text-xs border border-[#e5e5e5] rounded-lg px-2 py-1 text-slate-600">
 <option value="week">{lang === "zh" ? "近7天" : lang === "en" ? "Last 7 days" : "7 ngày qua"}</option>
 <option value="month">{t("thisMonth")}</option>
 <option value="year">{lang === "zh" ? "今年" : lang === "en" ? "This year" : "Năm nay"}</option>
 <option value="custom">{lang === "zh" ? "自定义" : lang === "en" ? "Custom" : "Tùy chọn"}</option>
 </select>
 </div>
 </div>
 <ResponsiveContainer width="100%" height={220}>
 <BarChart data={chartData} barSize={32}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [useLang().fp(Number(v)), (lang === "zh" ? "营收" : lang === "en" ? "Revenue" : "Doanh thu")]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="revenue" fill="var(--ap-primary)" radius={6}
 label={false}
 background={{ fill: "#EFF4FB" }}
 />
 </BarChart>
 </ResponsiveContainer>
 </div>{/* Payout panel */}
 <div className="rounded-xl p-5 text-white" style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}>
 <div className="flex items-center gap-2 mb-4">

 <h2 className="font-bold">{lang === "en" ? "Payout & Reconciliation" : lang === "zh" ? "结算与对账" : "Thanh toán & Đối soát"}</h2>
 </div>
 <p className="text-[#8f9294] text-xs mb-1">{lang === "en" ? "Available Balance" : lang === "zh" ? "当前可用余额" : "Số dư khả dụng hiện tại"}</p>
 <p className="text-3xl font-bold mb-5">{fp(supplier.revenue - supplier.pendingPayout)}</p>

 <div className="bg-white/10 rounded-xl p-4 mb-3">
 <div className="flex items-center gap-2 mb-1">

 <p className="text-slate-300 text-xs">{lang === "en" ? "Next Payout Date" : lang === "zh" ? "下次结算日期" : "Ngày quyết toán tiếp theo"}</p>
 </div>
 <p className="text-white font-semibold">{supplier.nextPayoutDate}</p>
 </div>
 <div className="bg-white/10 rounded-xl p-4 mb-4">
 <p className="text-slate-300 text-xs mb-1">{lang === "en" ? "Pending" : lang === "zh" ? "待处理" : "Đang chờ xử lý"}</p>
 <p className="text-xl font-bold">{fp(supplier.pendingPayout)}</p>
 </div>
 <button onClick={() => { window.location.href = "/supplier/finance"; }} className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2" style={{ background: "var(--ap-primary)" }}>{lang === "zh" ? "查看详细对账单" : lang === "en" ? "View detailed statement" : "Xem sao kê chi tiết"}
 </button>
 </div>
 </div>

 <div className="grid lg:grid-cols-3 gap-6">{/* Orders table */}
 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "en" ? "Latest Orders" : lang === "zh" ? "最新订单" : "Đơn hàng mới nhất"}</h2>
 <Link href="/supplier/orders" style={{ color: "var(--ap-primary)" }} className="text-sm font-semibold">{lang === "en" ? "All Orders" : lang === "zh" ? "全部订单" : "Tất cả đơn hàng"}</Link>
 </div>
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-[#f0f0f0]">{[(lang === "en" ? "ORDER ID" : lang === "zh" ? "订单号" : "MÃ ĐƠN"), (lang === "en" ? "CUSTOMER" : lang === "zh" ? "客户" : "KHÁCH HÀNG"), (lang === "en" ? "ORDER DATE" : lang === "zh" ? "下单日期" : "NGÀY ĐẶT"), (lang === "en" ? "STATUS" : lang === "zh" ? "状态" : "TRẠNG THÁI"), (lang === "en" ? "TOTAL" : lang === "zh" ? "总金额" : "TỔNG TIỀN")].map(h => (
 <th key={h} className="text-left py-2 text-xs text-[#8f9294] font-semibold">{h}</th>))}
 </tr>
 </thead>
 <tbody>{orders.slice(0, 5).map(order => {
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
 </tr>);
 })}
 </tbody>
 </table>
 </div>{/* Top products */}
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{t("topProducts")}</h2>
 <div className="space-y-3">{topProducts.map((prod, i) => {
 const stockStyle = stockStatusMap[prod.stockStatus as string] || { label: "N/A", color: "bg-[#f4f4f4] text-gray-600" };
 return (
 <div key={i} className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs text-white"
 style={{ background: ["var(--ap-primary)","var(--ap-primary)","#8B5CF6","#EF4444"][i % 4] }}>{prod.name.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-[#44494d] truncate">{prod.name}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${stockStyle.color}`}>{lang === "zh" ? "库存" : lang === "en" ? "Stock" : "Tồn kho"}: {(prod as { stock?: number }).stock ?? 45} • {stockStyle.label}</span>
 </div>
 </div>
 <div className="text-right shrink-0">
 <p className="text-sm font-bold text-[#44494d]">{prod.soldCount}</p>
 <p className="text-xs text-[#8f9294]">{t("sold")}</p>
 </div>
 </div>);
 })}
 </div>
 <Link href="/supplier/inventory" className="w-full mt-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa] transition-colors flex items-center justify-center">{lang === "zh" ? "库存管理" : lang === "en" ? "Inventory management" : "Quản lý kho hàng"}
 </Link>
 </div>
 </div>
 </div>
 </main>
 </>);
}


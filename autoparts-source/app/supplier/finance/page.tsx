"use client";
import { useLang, formatPriceLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import SupplierSidebar from "@/components/SupplierSidebar";





// Ngày tháng tính ĐỘNG theo thời gian thực (không cố định 2024) — "lấy ngày giờ chuẩn"
const _now = new Date();
const _pad = (n: number) => String(n).padStart(2, "0");
const _mLabel = (back: number) => { const d = new Date(_now.getFullYear(), _now.getMonth() - back, 1); return "T" + (d.getMonth() + 1); };
const _period = (back: number, label: string) => { const d = new Date(_now.getFullYear(), _now.getMonth() - back, 1); return `${label}/${_pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
const _payDate = (back: number, day: number) => { const d = new Date(_now.getFullYear(), _now.getMonth() - back, day); return `${_pad(d.getDate())}/${_pad(d.getMonth() + 1)}/${d.getFullYear()}`; };

const revenueData = [28.2, 31.5, 29.8, 38.4, 35.1, 45.2].map((revenue, i) => ({
 month: _mLabel(5 - i), revenue, orders: [142, 167, 155, 198, 182, 234][i],
}));

const payoutRecord = [
 { period: _period(0, "01–10"), gross: 45200000, fee: 5022000, net: 40178000, status: "PAID", date: _payDate(0, 12) },
 { period: _period(1, "01–10"), gross: 38400000, fee: 4266000, net: 34134000, status: "PAID", date: _payDate(1, 12) },
 { period: _period(1, "11–20"), gross: 22100000, fee: 2455000, net: 19645000, status: "PAID", date: _payDate(1, 22) },
 { period: _period(1, "21–30"), gross: 18600000, fee: 2066000, net: 16534000, status: "PAID", date: _payDate(0, 2) },
];

const statusBadge: Record<string, string> = {
 PAID: "bg-green-100 text-green-700",
 PENDING: "bg-yellow-100 text-yellow-700",
 PROCESSING: "bg-blue-100 text-blue-700",
};

export default function SupplierFinancePage() {
  const { t, fp, lang } = useLang();
 const [activeTab, setActiveTab] = useState<"overview" | "payouts" | "invoices">("overview");

 // Số liệu THẬT từ đơn hàng (tháng hiện tại) — thay cho số cứng
 const [orders, setOrders] = useState<any[]>([]);
 useEffect(() => { fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
 const _ordRev = (fn: (d: Date) => boolean) => orders.filter(o => { const d = new Date(o.createdAt); return !isNaN(d.getTime()) && fn(d); }).reduce((s, o) => s + (o.total || 0), 0);
 const monthGross = _ordRev(d => d.getFullYear() === _now.getFullYear() && d.getMonth() === _now.getMonth());
 const monthFee = Math.round(monthGross * 0.111);
 const monthNet = monthGross - monthFee;
 const pendingSettle = orders.filter(o => o.status === "pending" || o.status === "confirmed").reduce((s, o) => s + Math.round((o.total || 0) * 0.889), 0);
 const hasOrders = orders.length > 0;

 const totalRevenue = hasOrders ? monthGross : payoutRecord.reduce((s, p) => s + p.gross, 0);
 const totalNet = hasOrders ? monthNet : payoutRecord.reduce((s, p) => s + p.net, 0);
 const totalFee = hasOrders ? monthFee : payoutRecord.reduce((s, p) => s + p.fee, 0);

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "财务与对账" : lang === "en" ? "Finance & Reconciliation" : "Tài chính & Đối soát"}</h1>
 <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">{lang === "zh" ? "导出报告" : lang === "en" ? "Export report" : "Xuất báo cáo"}
 </button>
 </div>
 <div className="px-6 flex border-t border-[#f0f0f0]">{[["overview", (lang === "zh" ? "概览" : lang === "en" ? "Overview" : "Tổng quan")], ["payouts", (lang === "zh" ? "结算历史" : lang === "en" ? "Payout history" : "Lịch sử giải ngân")], ["invoices", (lang === "zh" ? "发票" : lang === "en" ? "Invoices" : "Hóa đơn")]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}
 </button>))}
 </div>
 </div>

 <div className="p-6">{/* KPI */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{[
 { label: (lang === "zh" ? "本月营收" : "Doanh thu tháng này"), value: useLang().fp(totalRevenue), color: "var(--ap-primary)", trend: "+12.3%" },
 { label: (lang === "zh" ? "实收（扣费后）" : lang === "en" ? "Net received (after fees)" : "Thực nhận (sau phí)"), value: useLang().fp(totalNet), color: "#22C55E", trend: "+11.8%" },
 { label: (lang === "zh" ? "平台费 (11.1%)" : lang === "en" ? "Platform fee (11.1%)" : "Phí nền tảng (11.1%)"), value: useLang().fp(totalFee), color: "#EF4444", trend: "" },
 { label: (lang === "zh" ? "待结算" : "Đang chờ giải ngân"), value: useLang().fp(pendingSettle), color: "#F59E0B", trend: "Kỳ 20/" + _pad(_now.getMonth() + 1) },
 ].map(s => (
 <div key={s.label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4">
 <p className="text-xs text-[#8f9294] mb-2">{s.label}</p>
 <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>{s.trend && <p className="text-xs font-semibold mt-1" style={{ color: s.trend.startsWith("+") ? "#22C55E" : "#8f9294" }}>{s.trend}</p>}
 </div>))}
 </div>{activeTab === "overview" && (
 <div className="grid lg:grid-cols-2 gap-6">
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2">{lang === "zh" ? "6个月营收（百万越南盾）" : lang === "en" ? "6-month revenue (million VND)" : "Doanh thu 6 tháng (triệu VNĐ)"}</h2>
 <ResponsiveContainer width="100%" height={210}>
 <BarChart data={revenueData} barSize={22}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [`${Number(v).toLocaleString("vi-VN")} ${lang === "zh" ? "百万" : lang === "en" ? "M" : "Triệu"}`, (lang === "zh" ? "营收" : lang === "en" ? "Revenue" : "Doanh thu")]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="revenue" fill="var(--ap-primary)" radius={6} />
 </BarChart>
 </ResponsiveContainer>
 </div>

 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{lang === "zh" ? "订单数量趋势" : lang === "en" ? "Order count trend" : "Xu hướng số đơn hàng"}</h2>
 <ResponsiveContainer width="100%" height={210}>
 <LineChart data={revenueData}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Line type="monotone" dataKey="orders" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", r: 4 }} connectNulls />
 </LineChart>
 </ResponsiveContainer>
 </div>

 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{lang === "zh" ? `${_now.getMonth() + 1}月财务总结` : lang === "en" ? `Financial summary — month ${_now.getMonth() + 1}` : `Tổng kết tài chính tháng ${_now.getMonth() + 1}`}</h2>
 <table className="w-full text-sm">
 <tbody>{[
 [(lang === "zh" ? "客户支付总营收" : lang === "en" ? "Total gross revenue from customers" : "Tổng doanh thu gộp từ khách hàng"), useLang().fp(totalRevenue), "text-[#44494d]"],
 [(lang === "zh" ? "AutoParts 平台费 (11.1%)" : lang === "en" ? "AutoParts platform fee (11.1%)" : "Phí nền tảng AutoParts (11.1%)"), "-" + useLang().fp(totalFee), "text-red-500"],
 [(lang === "zh" ? "实收转入账户" : lang === "en" ? "Net transferred to account" : "Thực nhận chuyển vào tài khoản"), useLang().fp(totalNet), "text-green-600 font-bold text-base"],
 [(lang === "zh" ? `待结算 20/${_pad(_now.getMonth() + 1)} 期` : lang === "en" ? `Pending settlement period 20/${_pad(_now.getMonth() + 1)}` : `Đang chờ quyết toán kỳ 20/${_pad(_now.getMonth() + 1)}`), useLang().fp(pendingSettle), "text-yellow-600"],
 ].map(([k, v, cls]) => (
 <tr key={k as string} className="border-b border-slate-50">
 <td className="py-3 text-[#8f9294]">{k}</td>
 <td className={`py-3 text-right font-semibold ${cls}`}>{v}</td>
 </tr>))}
 </tbody>
 </table>
 </div>
 </div>)}

 {activeTab === "payouts" && (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">KỲ ĐỐI SOÁT</th>
 <th className="text-left px-4 py-3">DOANH THU GỘP</th>
 <th className="text-left px-4 py-3">PHÍ NỀN TẢNG</th>
 <th className="text-left px-4 py-3">THỰC NHẬN</th>
 <th className="text-left px-4 py-3">NGÀY GIẢI NGÂN</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
 <th className="text-left px-4 py-3">HÓA ĐƠN</th>
 </tr>
 </thead>
 <tbody>{payoutRecord.map((p, i) => (
 <tr key={i} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 text-slate-600 text-sm">{p.period}</td>
 <td className="px-4 py-3 font-semibold text-[#44494d]">{fp(p.gross)}</td>
 <td className="px-4 py-3 text-red-500 text-sm">-{fp(p.fee)}</td>
 <td className="px-4 py-3 font-bold text-green-600">{fp(p.net)}</td>
 <td className="px-4 py-3 text-[#8f9294] text-sm">{p.date}</td>
 <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge[p.status]}`}>Đã giải ngân</span></td>
 <td className="px-4 py-3"><button onClick={() => window.print()} className="text-xs text-[#1a4b97] hover:underline flex items-center gap-1"> PDF</button></td>
 </tr>))}
 </tbody>
 </table>
 </div>)}

 {activeTab === "invoices" && (
 <div className="space-y-3">{payoutRecord.map((p, i) => (
 <div key={i} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4 flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: "#f8f8fa" }}></div>
 <div className="flex-1">
 <p className="font-semibold text-[#44494d]">Hóa đơn giải ngân — {p.period}</p>
 <p className="text-xs text-[#8f9294]">Giải ngân ngày {p.date} • Thực nhận {fp(p.net)}</p>
 </div>
 <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">Tải PDF
 </button>
 </div>))}
 </div>)}
 </div>
 </main>
 </>);
}

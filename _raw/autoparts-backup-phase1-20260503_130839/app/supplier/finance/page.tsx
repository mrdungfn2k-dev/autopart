"use client";
import { useLang, formatPriceLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import SupplierSidebar from "@/components/SupplierSidebar";





const revenueData = [
 { month: "T5", revenue: 28.2, orders: 142 },
 { month: "T6", revenue: 31.5, orders: 167 },
 { month: "T7", revenue: 29.8, orders: 155 },
 { month: "T8", revenue: 38.4, orders: 198 },
 { month: "T9", revenue: 35.1, orders: 182 },
 { month: "T10", revenue: 45.2, orders: 234 },
];

const payoutRecord = [
 { period: "01–10/10/2024", gross: 45200000, fee: 5022000, net: 40178000, status: "PAID", date: "12/10/2024" },
 { period: "01–10/09/2024", gross: 38400000, fee: 4266000, net: 34134000, status: "PAID", date: "12/09/2024" },
 { period: "11–20/09/2024", gross: 22100000, fee: 2455000, net: 19645000, status: "PAID", date: "22/09/2024" },
 { period: "21–30/09/2024", gross: 18600000, fee: 2066000, net: 16534000, status: "PAID", date: "02/10/2024" },
];

const statusBadge: Record<string, string> = {
 PAID: "bg-green-100 text-green-700",
 PENDING: "bg-yellow-100 text-yellow-700",
 PROCESSING: "bg-blue-100 text-blue-700",
};

export default function SupplierFinancePage() {
  const { t, fp, lang } = useLang();
 const [activeTab, setActiveTab] = useState<"overview" | "payouts" | "invoices">("overview");

 const totalRevenue = payoutRecord.reduce((s, p) => s + p.gross, 0);
 const totalNet = payoutRecord.reduce((s, p) => s + p.net, 0);
 const totalFee = payoutRecord.reduce((s, p) => s + p.fee, 0);

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <SupplierSidebar active="/supplier/finance" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">Tài chính & Đối soát</h1>
 <button onClick={() => {}} className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">
 Xuất báo cáo
 </button>
 </div>
 <div className="px-6 flex border-t border-[#f0f0f0]">
 {[["overview", "Tổng quan"], ["payouts", "Lịch sử giải ngân"], ["invoices", "Hóa đơn"]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
 {label}
 </button>
 ))}
 </div>
 </div>

 <div className="p-6">
 {/* KPI */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 {[
 { label: (lang === "zh" ? "本月营收" : "Doanh thu tháng này"), value: useLang().fp(45200000), color: "var(--ap-primary)", trend: "+12.3%" },
 { label: "Thực nhận (sau phí)", value: useLang().fp(40178000), color: "#22C55E", trend: "+11.8%" },
 { label: "Phí nền tảng (11.1%)", value: useLang().fp(totalFee), color: "#EF4444", trend: "" },
 { label: "Đang chờ giải ngân", value: useLang().fp(12450000), color: "#F59E0B", trend: "Kỳ 20/10" },
 ].map(s => (
 <div key={s.label} className="bg-white rounded-xl border border-[#f0f0f0] p-4">
 <p className="text-xs text-[#8f9294] mb-2">{s.label}</p>
 <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
 {s.trend && <p className="text-xs font-semibold mt-1" style={{ color: s.trend.startsWith("+") ? "#22C55E" : "#8f9294" }}>{s.trend}</p>}
 </div>
 ))}
 </div>

 {activeTab === "overview" && (
 <div className="grid lg:grid-cols-2 gap-6">
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Doanh thu 6 tháng (triệu VNĐ)</h2>
 <ResponsiveContainer width="100%" height={210}>
 <BarChart data={revenueData} barSize={22}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [`${Number(v)}M`, "Doanh thu"]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="revenue" fill="var(--ap-primary)" radius={6} />
 </BarChart>
 </ResponsiveContainer>
 </div>

 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Xu hướng số đơn hàng</h2>
 <ResponsiveContainer width="100%" height={210}>
 <LineChart data={revenueData}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Line type="monotone" dataKey="orders" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", r: 4 }} />
 </LineChart>
 </ResponsiveContainer>
 </div>

 <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Tổng kết tài chính tháng 10</h2>
 <table className="w-full text-sm">
 <tbody>
 {[
 ["Tổng doanh thu gộp từ khách hàng", useLang().fp(45200000), "text-[#44494d]"],
 ["Phí nền tảng AutoParts (11.1%)", "-" + useLang().fp(5022000), "text-red-500"],
 [(lang === "zh" ? "实收转入账户" : "Thực nhận chuyển vào tài khoản"), useLang().fp(40178000), "text-green-600 font-bold text-base"],
 ["Đang chờ quyết toán kỳ 20/10", useLang().fp(12450000), "text-yellow-600"],
 ].map(([k, v, cls]) => (
 <tr key={k as string} className="border-b border-slate-50">
 <td className="py-3 text-[#8f9294]">{k}</td>
 <td className={`py-3 text-right font-semibold ${cls}`}>{v}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {activeTab === "payouts" && (
 <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
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
 <tbody>
 {payoutRecord.map((p, i) => (
 <tr key={i} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 text-slate-600 text-sm">{p.period}</td>
 <td className="px-4 py-3 font-semibold text-[#44494d]">{fp(p.gross)}</td>
 <td className="px-4 py-3 text-red-500 text-sm">-{fp(p.fee)}</td>
 <td className="px-4 py-3 font-bold text-green-600">{fp(p.net)}</td>
 <td className="px-4 py-3 text-[#8f9294] text-sm">{p.date}</td>
 <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge[p.status]}`}>Đã giải ngân</span></td>
 <td className="px-4 py-3"><button onClick={() => {}} className="text-xs text-[#1a4b97] hover:underline flex items-center gap-1"> PDF</button></td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === "invoices" && (
 <div className="space-y-3">
 {payoutRecord.map((p, i) => (
 <div key={i} className="bg-white rounded-xl border border-[#f0f0f0] p-4 flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: "#f8f8fa" }}></div>
 <div className="flex-1">
 <p className="font-semibold text-[#44494d]">Hóa đơn giải ngân — {p.period}</p>
 <p className="text-xs text-[#8f9294]">Giải ngân ngày {p.date} • Thực nhận {fp(p.net)}</p>
 </div>
 <button onClick={() => {}} className="flex items-center gap-2 px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">
 Tải PDF
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 </main>
 </div>
 );
}

"use client";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import AffiliateSidebar from "@/components/AffiliateSidebar";





const monthlyData = [
 { month: "T5", myCommission: 8.2, teamCommission: 3.1 },
 { month: "T6", myCommission: 9.8, teamCommission: 3.8 },
 { month: "T7", myCommission: 7.4, teamCommission: 2.9 },
 { month: "T8", myCommission: 11.2, teamCommission: 4.5 },
 { month: "T9", myCommission: 10.6, teamCommission: 4.2 },
 { month: "T10", myCommission: 14.6, teamCommission: 5.8 },
];

type CommStatus = "PAID" | "PENDING" | "PROCESSING";

const statusBadge: Record<CommStatus, string> = {
 PAID: "bg-green-100 text-green-700",
 PENDING: "bg-yellow-100 text-yellow-700",
 PROCESSING: "bg-blue-100 text-blue-700",
};

export default function AffiliateCommissionsPage() {
  const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===
  const commissionHistory: { date: string; orderId: string; customer: string; orderValue: number; myCommission: number; type: string; status: CommStatus }[] = [
   { date: "15/10", orderId: "#AP-10284", customer: (lang === "zh" ? "客户A" : "Nguyễn Văn An"), orderValue: 2450000, myCommission: 245000, type: "Trực tiếp T1 (10%)", status: "PAID" },
   { date: "14/10", orderId: "#AP-10277", customer: "Trần Thị Bé", orderValue: 1850000, myCommission: 185000, type: "Trực tiếp T1 (10%)", status: "PAID" },
   { date: "13/10", orderId: "#AP-10265", customer: "KH của CTV Minh", orderValue: 3200000, myCommission: 160000, type: "Thụ động T1 (5%)", status: "PAID" },
   { date: "12/10", orderId: "#AP-10258", customer: "Lê Minh", orderValue: 980000, myCommission: 98000, type: "Trực tiếp T1 (10%)", status: "PAID" },
   { date: "11/10", orderId: "#AP-10241", customer: "KH của CTV Nam", orderValue: 4500000, myCommission: 225000, type: "Thụ động T1 (5%)", status: "PENDING" },
   { date: "10/10", orderId: "#AP-10228", customer: "Phùng Văn Tuấn", orderValue: 2100000, myCommission: 210000, type: "Trực tiếp T1 (10%)", status: "PAID" },
  ];
  const statusLabel: Record<CommStatus, string> = { PAID: "Đã nhận", PENDING: (lang === "zh" ? "待处理" : "Chờ xử lý"), PROCESSING: (lang === "zh" ? "处理中" : "Đang xử lý") };


 const [activeTab, setActiveTab] = useState<"history" | "chart" | "request">("history");
 const [copied, setCopied] = useState(false);

 const totalPending = commissionHistory.filter(c => c.status === "PENDING").reduce((s, c) => s + c.myCommission, 0);
 const totalPaid = commissionHistory.filter(c => c.status === "PAID").reduce((s, c) => s + c.myCommission, 0);

 const handleCopy = () => {
 navigator.clipboard.writeText(useLang().fp(totalPending));
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <AffiliateSidebar active="/affiliate/commissions" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{t("commissionHistory")}</h1>
 <button className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]"> Xuất Excel</button>
 </div>
 <div className="px-6 flex border-t border-[#f0f0f0]">
 {[["history", "Lịch sử giao dịch"], ["chart", (lang === "zh" ? "佣金图表" : "Biểu đồ hoa hồng")], ["request", "Yêu cầu rút tiền"]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
 {label}
 </button>
 ))}
 </div>
 </div>

 <div className="p-6">
 {/* KPIs */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 {[
 { label: "Hoa hồng tháng này", value: useLang().fp(14640000), color: "var(--ap-primary)", badge: "+18.2% vs T9" },
 { label: "Hoa hồng thụ động (từ CTV)", value: useLang().fp(5800000), color: "#8B5CF6", badge: "12 CTV đang hoạt động" },
 { label: "Đang chờ thanh toán", value: useLang().fp(totalPending), color: "#F59E0B", badge: "Kỳ 20/10" },
 { label: "Tổng đã nhận tháng này", value: useLang().fp(totalPaid), color: "#22C55E", badge: "Đã thanh toán" },
 ].map(s => (
 <div key={s.label} className="bg-white rounded-xl border border-[#f0f0f0] p-4">
 <p className="text-xs text-[#8f9294] mb-2">{s.label}</p>
 <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
 <p className="text-xs font-medium mt-1 text-[#8f9294]">{s.badge}</p>
 </div>
 ))}
 </div>

 {activeTab === "history" && (
 <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">{lang === "zh" ? "日期" : "NGÀY"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "订单" : "ĐƠN HÀNG"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "客户" : "KHÁCH HÀNG"}</th>
 <th className="text-left px-4 py-3">GIÁ TRỊ ĐH</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "佣金类型" : "LOẠI HH"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "佣金" : "HOA HỒNG"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
 </tr>
 </thead>
 <tbody>
 {commissionHistory.map((c, i) => (
 <tr key={i} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 text-[#8f9294] text-sm">{c.date}</td>
 <td className="px-4 py-3 font-mono text-xs text-[#8f9294]">{c.orderId}</td>
 <td className="px-4 py-3 text-[#44494d] text-sm">{c.customer}</td>
 <td className="px-4 py-3 text-slate-600">{fp(c.orderValue)}</td>
 <td className="px-4 py-3">
 <span className={`text-xs font-semibold px-2 py-0.5 rounded ${c.type.includes("Thụ động") ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}>{c.type}</span>
 </td>
 <td className="px-4 py-3 font-bold text-green-600">{fp(c.myCommission)}</td>
 <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span></td>
 </tr>
 ))}
 </tbody>
 <tfoot style={{ background: "#f8f8fa" }}>
 <tr>
 <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-[#8f9294]">{t("cartTotal")}</td>
 <td className="px-4 py-3 font-extrabold text-[#1a4b97]">{fp(commissionHistory.reduce((s, c) => s + c.myCommission, 0))}</td>
 <td className="px-4 py-3"></td>
 </tr>
 </tfoot>
 </table>
 </div>
 )}

 {activeTab === "chart" && (
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-6">
 <h2 className="font-bold text-[#44494d] mb-5">Hoa hồng theo tháng (triệu VNĐ)</h2>
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={monthlyData} barSize={28} barGap={8}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [`${Number(v)}M`, ""]} contentStyle={{ borderRadius: "8px" }} />
 <Bar dataKey="myCommission" fill="var(--ap-primary)" radius={6} name="HH trực tiếp T1 (10%)" />
 <Bar dataKey="teamCommission" fill="#8B5CF6" radius={6} name="HH thụ động (5%)" />
 </BarChart>
 </ResponsiveContainer>
 <div className="flex gap-6 mt-3 justify-center">
 <span className="flex items-center gap-1.5 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "var(--ap-primary)" }}></span>Hoa hồng trực tiếp (10%)</span>
 <span className="flex items-center gap-1.5 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#8B5CF6" }}></span>Hoa hồng thụ động (5%)</span>
 </div>
 </div>
 )}

 {activeTab === "request" && (
 <div className="max-w-4xl mx-auto bg-white rounded-xl border border-[#f0f0f0] p-6">
 <h2 className="font-bold text-[#44494d] mb-5">{t("requestWithdraw")}</h2>

 <div className="p-4 rounded-xl mb-5" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
 <p className="text-sm text-orange-700 font-semibold mb-1">{t("availableBalance")}</p>
 <div className="flex items-center gap-3">
 <p className="text-3xl font-extrabold text-[#1a4b97]">{fp(totalPaid)}</p>
 <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-orange-100">
 {"✓"}
 </button>
 </div>
 <p className="text-xs text-[#1a4b97] mt-1">Rút tối thiểu: 500,000đ • Phí rút: miễn phí</p>
 </div>

 <div className="space-y-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Số tiền muốn rút (VNĐ)</label>
 <input type="number" defaultValue={totalPaid} min="500000" className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Tài khoản nhận tiền</label>
 <select className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm">
 <option>VCB — 0123456789 — Lê Văn Partner</option>
 <option>Techcombank — 9876543210 — Lê Văn Partner</option>
 <option>MoMo — 0901234567</option>
 <option>+ Thêm tài khoản mới</option>
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Ghi chú (tùy chọn)</label>
 <input placeholder="VD: Rút hoa hồng tháng 10" className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <button className="w-full py-3.5 rounded-xl text-white font-bold" style={{ background: "var(--ap-primary)" }}>
 Gửi yêu cầu rút tiền
 </button>
 </div>
 </div>
 )}
 </div>
 </main>
 </div>
 );
}

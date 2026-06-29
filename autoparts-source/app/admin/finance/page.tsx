"use client";
import { getAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatPrice, formatVndShort } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";


const adminGMVData = [
  { month: "T1", gmv: 280, revenue: 28 }, { month: "T2", gmv: 320, revenue: 32 },
  { month: "T3", gmv: 295, revenue: 29.5 }, { month: "T4", gmv: 410, revenue: 41 },
  { month: "T5", gmv: 520, revenue: 52 }, { month: "T6", gmv: 680, revenue: 68 },
];

const revenueByMonth = adminGMVData.map(d => ({
 month: d.month,
 platform_fee: Math.round(d.gmv * 1e8 * 0.1 / 1000000),
 affiliate_commission: Math.round(d.gmv * 1e8 * 0.05 / 1000000),
}));

const statusBadge: Record<string, string> = {
 PAID: "bg-green-100 text-green-700",
 PENDING: "bg-yellow-100 text-yellow-700",
 SCHEDULED: "bg-blue-100 text-blue-700",
 REJECTED: "bg-red-100 text-red-700",
};

export default function AdminFinancePage() {
  const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===
  const initPayouts = [
   { id: "P-001", supplier: (lang === "zh" ? "安泰配件" : "Phụ Tùng An Thái"), amount: 38400000, fee: 4266000, net: 34134000, date: "10/10/2024", status: "PAID" },
   { id: "P-002", supplier: "Hà Thành Parts", amount: 29100000, fee: 3233000, net: 25867000, date: "10/10/2024", status: "PAID" },
   { id: "P-003", supplier: "Nam Bộ Auto Parts", amount: 21800000, fee: 2422000, net: 19378000, date: "10/10/2024", status: "PENDING" },
   { id: "P-004", supplier: "Motors Việt Nam", amount: 15600000, fee: 1733000, net: 13867000, date: "25/10/2024", status: "SCHEDULED" },
  ];
  const initCommissions = [
   { name: "Lê Partner Gold", role: "T1", amount: 14640000, date: "10/10/2024", status: "PAID" },
   { name: (lang === "zh" ? "客户A" : "Nguyễn Văn An"), role: "T1", amount: 9720000, date: "10/10/2024", status: "PAID" },
   { name: "Trần CTV Pro", role: "T2", amount: 3650000, date: "10/10/2024", status: "PENDING" },
   { name: "Phạm CTV Mới", role: "T2", amount: 1840000, date: "25/10/2024", status: "SCHEDULED" },
  ];
  const statusLabel: Record<string, string> = { PAID: (lang === "zh" ? "已结算" : "Đã giải ngân"), PENDING: (lang === "zh" ? "处理中" : "Đang xử lý"), SCHEDULED: "Lên lịch", REJECTED: (lang === "zh" ? "已拒绝" : "Đã từ chối") };

 const [activeTab, setActiveTab] = useState<"overview" | "supplier" | "affiliate">("overview");
 const [payouts, setPayouts] = useState(initPayouts);
 const [commissions, setCommissions] = useState(initCommissions);
 const [toast, setToast] = useState("");

 useEffect(() => {
   fetch("/api/payouts").then(r => r.json()).then(data => {
     if (Array.isArray(data)) {
       setPayouts(data.filter((p: {type:string}) => p.type === "supplier").map((p: any) => ({ id: p.id, supplier: p.name, amount: p.amount, fee: p.fee ?? 0, net: p.net ?? p.amount, date: p.date, status: p.status })));
       setCommissions(data.filter((p: {type:string}) => p.type === "affiliate").map((p: any) => ({ name: p.name, role: p.role ?? "T1", amount: p.amount, date: p.date, status: p.status, id: p.id, kind: p.kind, account: p.account })));
     }
   }).catch(() => {});
 }, []);

 const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

 const approveSupplierPayout = async (id: string) => {
   await fetch("/api/payouts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "PAID" }) });
   setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: "PAID" } : p));
   showToast("Đã giải ngân thành công!");
 };
 const approveAllSupplier = async () => {
   await fetch("/api/payouts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "supplier" }) });
   setPayouts(prev => prev.map(p => p.status === "PENDING" ? { ...p, status: "PAID" } : p));
   showToast("Đã giải ngân tất cả NCC!");
 };
 const approveCommission = async (id: string, name: string) => {
   await fetch("/api/payouts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "PAID" }) });
   setCommissions(prev => prev.map(c => (c as any).id === id ? { ...c, status: "PAID" } : c));
   showToast((lang === "zh" ? "已批准：" : "Đã duyệt: ") + name);
 };
 // Duyệt/Từ chối YÊU CẦU RÚT TIỀN của đại lý (kind=withdrawal). Duyệt→PAID (trừ hẳn), Từ chối→REJECTED (trả lại số dư)
 const rejectWithdrawal = async (id: string, name: string) => {
   await fetch("/api/payouts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "REJECTED" }) });
   setCommissions(prev => prev.map(c => (c as any).id === id ? { ...c, status: "REJECTED" } : c));
   showToast((lang === "zh" ? "已拒绝提现：" : "Đã từ chối rút tiền: ") + name);
 };
 const approveAllCommissions = async () => {
   await fetch("/api/payouts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "affiliate" }) });
   setCommissions(prev => prev.map(c => c.status === "PENDING" ? { ...c, status: "PAID" } : c));
   showToast("Đã xét duyệt tất cả hoa hồng!");
 };

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">Tài chính & Giải ngân</h1>
 <button className="px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]"> Xuất báo cáo</button>
 </div>
 <div className="px-6 flex border-t border-[#f0f0f0]">{([ ["overview", " Tổng quan"], ["supplier", "Giải ngân NCC"], ["affiliate", " Hoa hồng Đại lý"] ] as [string,string][]).map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}
 </button>))}
 </div>
 </div>

 <div className="p-6">{/* KPI row */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{[
 { label: "Doanh thu nền tảng tháng này", value: formatVndShort(250000000), color: "var(--ap-primary)", icon: "" },
 { label: "Tổng giải ngân NCC (chờ)", value: formatVndShort(127300000), color: "var(--ap-primary)", icon: "" },
 { label: "Hoa hồng đại lý (chờ)", value: formatVndShort(29800000), color: "#8B5CF6", icon: "" },
 { label: "Số kỳ giải ngân tháng này", value: "2 kỳ", color: "#22C55E", icon: "" },
 ].map(s => (
 <div key={s.label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4">
 <div className="flex items-center gap-2 mb-2">
 <span className="text-2xl">{s.icon}</span>
 </div>
 <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
 <p className="text-xs text-[#8f9294]">{s.label}</p>
 </div>))}
 </div>{activeTab === "overview" && (
 <div className="grid lg:grid-cols-2 gap-6">
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Doanh thu nền tảng theo tháng</h2>
 <ResponsiveContainer width="100%" height={200}>
 <BarChart data={revenueByMonth} barSize={18} barGap={6}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [`${Number(v).toLocaleString("vi-VN")} Triệu`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="platform_fee" fill="var(--ap-primary)" radius={6} name="Phí nền tảng (10%)" />
 <Bar dataKey="affiliate_commission" fill="#8B5CF6" radius={6} name="Hoa hồng CK" />
 </BarChart>
 </ResponsiveContainer>
 <div className="flex gap-4 mt-2">
 <span className="flex items-center gap-1 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "var(--ap-primary)" }}></span>{lang === "zh" ? "平台费" : "Phí nền tảng"}</span>
 <span className="flex items-center gap-1 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#8B5CF6" }}></span>Hoa hồng affiliate</span>
 </div>
 </div>

 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Xu hướng GMV 6 tháng (Tỷ VNĐ)</h2>
 <ResponsiveContainer width="100%" height={200}>
 <LineChart data={adminGMVData}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Line type="monotone" dataKey="gmv" stroke="var(--ap-primary)" strokeWidth={2.5} dot={{ fill: "var(--ap-primary)", r: 4 }} connectNulls name="GMV (Tỷ)" />
 </LineChart>
 </ResponsiveContainer>
 </div>

 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Tổng kết tài chính tháng 10</h2>
 <table className="w-full text-sm">
 <tbody>{[
 ["Tổng GMV toàn hệ thống", "2.5 Tỷ VNĐ", "text-[#44494d]"],
 ["Phí nền tảng (10% GMV)", "250,000,000đ", "text-[#1a4b97]"],
 ["Tổng giải ngân cho NCC (90%)", "2.25 Tỷ VNĐ", "text-[#1a4b97]"],
 ["Hoa hồng Đại lý T1 (10% đơn hàng)", "45,200,000đ", "text-purple-600"],
 ["Hoa hồng CTV/T2 thụ động (5%)", "18,400,000đ", "text-indigo-600"],
 ["Doanh thu thuần nền tảng", "186,400,000đ", "text-green-600 font-bold"],
 ].map(([k, v, cls]) => (
 <tr key={k} className="border-b border-slate-50">
 <td className="py-2.5 text-[#8f9294]">{k}</td>
 <td className={`py-2.5 font-semibold text-right ${cls}`}>{v}</td>
 </tr>))}
 </tbody>
 </table>
 </div>
 </div>)}

 {activeTab === "supplier" && (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <div className="p-4 border-b border-[#f0f0f0] flex items-center justify-between">
 <h2 className="font-bold text-[#44494d]">Giải ngân Nhà cung cấp — Kỳ 10/10/2024</h2>
 <div className="flex gap-2">
 <button className="px-3 py-1.5 text-sm font-semibold border border-[#e5e5e5] rounded-lg text-slate-600 hover:bg-[#f8f8fa]">Lọc kỳ</button>
 <button onClick={approveAllSupplier} className="px-3 py-1.5 text-sm font-semibold rounded-lg text-white" style={{ background: "var(--ap-primary)" }}>Giải ngân tất cả</button>
 </div>
 </div>
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">MÃ THANH TOÁN</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "供应商" : "NHÀ CUNG CẤP"}</th>
 <th className="text-left px-4 py-3">DOANH THU GỘP</th>
 <th className="text-left px-4 py-3">PHÍ NỀN TẢNG (11.1%)</th>
 <th className="text-left px-4 py-3">THỰC NHẬN</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "日期" : "NGÀY"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
 </tr>
 </thead>
 <tbody>{payouts.map(p => (
 <tr key={p.id} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 font-mono text-xs text-[#8f9294]">{p.id}</td>
 <td className="px-4 py-3 font-semibold text-[#44494d] text-sm">{p.supplier}</td>
 <td className="px-4 py-3 text-slate-600">{fp(p.amount)}</td>
 <td className="px-4 py-3 text-red-500">-{fp(p.fee)}</td>
 <td className="px-4 py-3 font-bold text-green-600">{fp(p.net)}</td>
 <td className="px-4 py-3 text-[#8f9294] text-sm">{p.date}</td>
 <td className="px-4 py-3">
 <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge[p.status]}`}>{statusLabel[p.status]}</span>
 </td>
 <td className="px-4 py-3">{p.status === "PENDING" && (
  <button onClick={() => approveSupplierPayout(p.id)} className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#22C55E" }}>Giải ngân</button>)}
 {p.status !== "PENDING" && <span className="text-xs text-[#8f9294]">—</span>}
 </td>
 </tr>))}
 </tbody>
 </table>
 </div>)}

 {activeTab === "affiliate" && (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <div className="p-4 border-b border-[#f0f0f0] flex items-center justify-between">
 <h2 className="font-bold text-[#44494d]">Hoa hồng Đại lý & CTV — Kỳ 10/10/2024</h2>
 <button onClick={approveAllCommissions} className="px-3 py-1.5 text-sm font-semibold rounded-lg text-white" style={{ background: "var(--ap-primary)" }}>Xét duyệt tất cả</button>
 </div>
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">ĐẠI LÝ / CTV</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "类型" : "LOẠI"}</th>
 <th className="text-left px-4 py-3">SỐ TIỀN HOA HỒNG</th>
 <th className="text-left px-4 py-3">NGÀY THANH TOÁN</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
 </tr>
 </thead>
 <tbody>{commissions.map(c => { const isW = (c as any).kind === "withdrawal"; const acc = (c as any).account; const cid = (c as any).id ?? c.name; return (
 <tr key={cid} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 font-semibold text-[#44494d]">{c.name}{isW && acc && <span className="block text-xs font-normal text-[#8f9294] font-mono">{acc}</span>}</td>
 <td className="px-4 py-3">{isW
 ? <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">{lang === "zh" ? "提现" : "Rút tiền"}</span>
 : <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.role === "T1" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>{c.role === "T1" ? "Đại lý T1" : "CTV/T2"}</span>}
 </td>
 <td className={`px-4 py-3 font-bold ${isW ? "text-red-600" : "text-purple-600"}`}>{isW ? "-" : ""}{fp(c.amount)}</td>
 <td className="px-4 py-3 text-[#8f9294] text-sm">{c.date}</td>
 <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge[c.status]}`}>{statusLabel[c.status]}</span></td>
 <td className="px-4 py-3">{c.status === "PENDING" ? (
   <div className="flex gap-2">
   <button onClick={() => approveCommission(cid, c.name)} className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#22C55E" }}>{isW ? (lang === "zh" ? "批准提现" : "Duyệt rút") : (lang === "zh" ? "批准" : "Duyệt giải ngân")}</button>
   {isW && <button onClick={() => rejectWithdrawal(cid, c.name)} className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#EF4444" }}>{lang === "zh" ? "拒绝" : "Từ chối"}</button>}
   </div>
 ) : <span className="text-xs text-[#8f9294]">—</span>}
 </td>
 </tr>); })}
 </tbody>
 </table>
 </div>)}
 </div>
 </main>{/* Toast */}
 {toast && (
 <div className="fixed bottom-6 right-6 z-[100] bg-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold">✓ {toast}
 </div>)}
 </>);
}

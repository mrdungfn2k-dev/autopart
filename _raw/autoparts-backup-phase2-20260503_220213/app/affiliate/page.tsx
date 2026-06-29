"use client";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/data";
import { useState } from "react";

import SidebarControls from "@/components/SidebarControls";
import AffiliateSidebar from "@/components/AffiliateSidebar";



const affiliateWeeklyData = [
  { day: "T2", sales: 4200000 }, { day: "T3", sales: 6800000 }, { day: "T4", sales: 5100000 },
  { day: "T5", sales: 9200000 }, { day: "T6", sales: 7400000 }, { day: "T7", sales: 11500000 }, { day: "CN", sales: 8900000 },
];
const affiliateLinkData = [
  { product: "Trạm Sạc EV 7kW", link: "aparts.vn/ref/a001/yy-001", clicks: 342, conversions: 28, revenue: 112000000 },
  { product: "Bugi Iridium NGK", link: "aparts.vn/ref/a001/yy-007", clicks: 218, conversions: 67, revenue: 80400000 },
];
const ctvTeamData = [
  { name: "Minh Hoàng", sales: 12000000, commission: 1800000, status: "active" },
  { name: "Thu Thảo", sales: 8600000, commission: 1290000, status: "active" },
];



function CopyButton({ text }: { text: string }) {
 const [copied, setCopied] = useState(false);
 return (
 <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
 className="p-1.5 rounded-md transition-colors hover:bg-[#f4f4f4]">
 {"✓"}
 </button>
 );
}

export default function AffiliateDashboard() {
  const { t, fp, lang } = useLang();
  const affiliate = { id: "a001", name: "Nguyễn Đại Lý", tier: "T1", sales: 48500000, commission: 9700000, commissionPending: 2400000, ctv: 8, rank: 3 };
 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <AffiliateSidebar active="/affiliate" />
 <main className="flex-1 overflow-auto">
 {/* Top bar */}
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">Dashboard Đại Lý</h1>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "var(--ap-primary)" }}>
 Bảng xếp hạng #{affiliate.rank}
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-6">
 {/* KPI */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { label: "Doanh số tháng này", value: fp(affiliate.sales), badge: "+18%", color: "var(--ap-primary)" },
 { label: "Hoa hồng chờ duyệt", value: fp(affiliate.commissionPending), badge: "Đợt 10/10", color: "var(--ap-primary)" },
 { label: "Hoa hồng đã nhận", value: fp(affiliate.commission - affiliate.commissionPending), badge: (lang === "zh" ? "本月" : "Tháng này"), color: "var(--ap-primary)" },
 { label: "CTV quản lý", value: affiliate.ctv.toString(), badge: "8 đang hoạt động", color: "#8B5CF6" },
 ].map(({ label, value, badge, color }) => (
 <div key={label} className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide">{label}</p>
 <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{badge}</span>
 </div>
 <p className="text-2xl font-bold tracking-tight" style={{ color }}>{value}</p>
 </div>
 ))}
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 {/* Weekly chart */}
 <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-5">
 <h2 className="font-bold text-[#44494d]">Doanh số theo ngày trong tuần</h2>
 <span className="text-xs text-[#8f9294]">7 ngày qua</span>
 </div>
 <ResponsiveContainer width="100%" height={200}>
 <BarChart data={affiliateWeeklyData} barSize={28}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [fp(Number(v)), "Doanh số"]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="sales" fill="var(--ap-primary)" radius={6} background={{ fill: "#FFF7ED", radius: 6 }} />
 </BarChart>
 </ResponsiveContainer>
 </div>

 {/* Withdraw panel */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Rút hoa hồng</h2>
 <div className="rounded-xl p-4 mb-4" style={{ background: "linear-gradient(135deg, #1E293B, #0F172A)" }}>
 <p className="text-[#8f9294] text-xs mb-1">{t("availableBalance")}</p>
 <p className="text-2xl font-bold text-white">{fp(affiliate.commission - affiliate.commissionPending)}</p>
 <p className="text-[#1a4b97] text-xs mt-2">Kỳ giải ngân: 10 & 25 hàng tháng</p>
 </div>
 <div className="space-y-2 text-sm mb-4">
 <div className="flex justify-between"><span className="text-[#8f9294]">Hoa hồng bán lẻ T1</span><span className="font-semibold">{fp(10840000)}</span></div>
 <div className="flex justify-between"><span className="text-[#8f9294]">Hoa hồng thụ động CTV</span><span className="font-semibold">{fp(3800000)}</span></div>
 <div className="flex justify-between border-t border-[#f0f0f0] pt-2"><span className="font-bold text-[#44494d]">Tổng tháng này</span><span className="font-bold" style={{ color: "var(--ap-primary)" }}>{fp(affiliate.commission)}</span></div>
 </div>
 <Link href="/affiliate/withdraw" className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center" style={{ background: "var(--ap-primary)" }}>
 Yêu cầu rút tiền
 </Link>
 <p className="text-xs text-center text-[#8f9294] mt-2">Ngưỡng tối thiểu: 200,000đ</p>
 </div>
 </div>

 {/* Affiliate links */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "管理推广链接" : "Quản lý Link Affiliate"}</h2>
 <Link href="/affiliate/links" className="px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center justify-center" style={{ background: "var(--ap-primary)" }}>
 + Tạo link mới
 </Link>
 </div>
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-[#8f9294] border-b border-[#f0f0f0]">
 <th className="text-left pb-3">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
 <th className="text-left pb-3">{lang === "zh" ? "链接" : "LINK"}</th>
 <th className="text-left pb-3">LƯỢT CLICK</th>
 <th className="text-left pb-3">CHUYỂN ĐỔI</th>
 <th className="text-left pb-3">DOANH THU</th>
 </tr>
 </thead>
 <tbody>
 {affiliateLinkData.map((row, i) => (
 <tr key={i} className="border-b border-slate-50 hover:bg-[#f8f8fa] transition-colors">
 <td className="py-3 font-medium text-[#44494d]">{row.product}</td>
 <td className="py-3">
 <div className="flex items-center gap-2">
 <span className="text-xs font-mono text-[#8f9294] truncate max-w-[120px]">{row.link}</span>
 <CopyButton text={row.link} />
 </div>
 </td>
 <td className="py-3 font-semibold text-[#44494d]">{row.clicks.toLocaleString()}</td>
 <td className="py-3">
 <span className="font-semibold text-green-600">{row.conversions}</span>
 <span className="text-[#8f9294] text-xs ml-1">({((row.conversions / row.clicks) * 100).toFixed(1)}%)</span>
 </td>
 <td className="py-3 font-bold" style={{ color: "var(--ap-primary)" }}>{fp(row.revenue)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* CTV Team */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "推广团队" : "Đội nhóm CTV"}</h2>
 <Link href="/affiliate/team" className="px-4 py-2 text-sm font-semibold border border-[#e5e5e5] rounded-lg text-slate-600 hover:bg-[#f8f8fa] flex items-center justify-center">
 + Mời CTV mới
 </Link>
 </div>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 {ctvTeamData.map((ctv, i) => (
 <div key={i} className="border border-[#f0f0f0] rounded-xl p-4 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-3">
 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
 {ctv.name.charAt(0)}
 </div>
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ctv.status === "active" ? "bg-green-100 text-green-600" : "bg-[#f4f4f4] text-[#8f9294]"}`}>
 {ctv.status === "active" ? "Hoạt động" : "Tạm nghỉ"}
 </span>
 </div>
 <p className="font-semibold text-[#44494d] text-sm mb-1">{ctv.name}</p>
 <p className="text-xs text-[#8f9294] mb-2">Doanh số: <span className="text-slate-600 font-medium">{fp(ctv.sales)}</span></p>
 <p className="text-xs text-[#8f9294]">HC thụ động: <span className="font-bold" style={{ color: "var(--ap-primary)" }}>{fp(ctv.commission)}</span></p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

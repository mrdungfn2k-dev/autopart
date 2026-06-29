"use client";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/data";
import { useState, useEffect } from "react";
import { getAuth } from "@/lib/auth";

import SidebarControls from "@/components/SidebarControls";
import AffiliateSidebar from "@/components/AffiliateSidebar";



const ctvTeamData = [
  { name: "Minh Hoàng", sales: 12000000, commission: 1800000, status: "active" },
  { name: "Thu Thảo", sales: 8600000, commission: 1290000, status: "active" },
];



function CopyButton({ text }: { text: string }) {
 const [copied, setCopied] = useState(false);
 return (
 <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
 className="ap-btn px-2 py-1 rounded-md text-xs font-semibold transition-colors hover:bg-[#f4f4f4]" style={{ color: "var(--ap-primary)" }}>{copied ? "Đã chép" : "Chép"}
 </button>);
}

export default function AffiliateDashboard() {
  const { t, fp, lang } = useLang();
  const [links, setLinks] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [name, setName] = useState("Đại lý");
  useEffect(() => {
    const a = getAuth(); if (a?.name) setName(a.name);
    fetch("/api/affiliate-links").then(r => r.json()).then(d => setLinks(Array.isArray(d) ? d.map((l: any) => ({ product: l.name, link: l.url, clicks: l.clicks, conversions: l.orders, revenue: l.revenue })) : [])).catch(() => {});
    fetch("/api/payouts").then(r => r.json()).then(d => setPayouts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const affPayouts = payouts.filter((p: any) => p.type === "affiliate");
  const totalRevenue = links.reduce((s: number, l: any) => s + (l.revenue || 0), 0);
  const totalCommission = affPayouts.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const commissionPending = affPayouts.filter((p: any) => p.status !== "PAID").reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const affiliate = { id: "a001", name, tier: "T1", sales: totalRevenue, commission: totalCommission, commissionPending, ctv: ctvTeamData.length, rank: 3 };

  // ── Bộ lọc thống kê (tuần/tháng/năm/tùy chọn) — giống các phân quyền khác; số liệu từ hoa hồng THẬT ──
  const [period, setPeriod] = useState("week");
  const [cFrom, setCFrom] = useState("");
  const [cTo, setCTo] = useState("");
  const _now = new Date();
  const _parseD = (s: any): Date | null => {
    if (!s) return null;
    const m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    const d = new Date(s); return isNaN(d.getTime()) ? null : d;
  };
  const _commAmt = (fn: (d: Date) => boolean) => affPayouts.filter((p: any) => { const d = _parseD(p.date); return d ? fn(d) : false; }).reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const _sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const DOW = lang === "zh" ? ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] : ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const chartData = (() => {
    if (period === "year") return Array.from({ length: 12 }, (_, m) => ({ label: lang === "zh" ? `${m + 1}月` : `Th${m + 1}`, sales: _commAmt(d => d.getFullYear() === _now.getFullYear() && d.getMonth() === m) }));
    if (period === "month") { const dim = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate(); return Array.from({ length: dim }, (_, i) => ({ label: String(i + 1), sales: _commAmt(d => d.getFullYear() === _now.getFullYear() && d.getMonth() === _now.getMonth() && d.getDate() === i + 1) })); }
    if (period === "custom" && cFrom && cTo) {
      const from = new Date(cFrom), to = new Date(cTo); const out: { label: string; sales: number }[] = [];
      for (let d = new Date(from); d <= to && out.length < 62; d.setDate(d.getDate() + 1)) { const cur = new Date(d); out.push({ label: `${cur.getDate()}/${cur.getMonth() + 1}`, sales: _commAmt(x => _sameDay(x, cur)) }); }
      return out.length ? out : [{ label: "—", sales: 0 }];
    }
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(_now); d.setDate(_now.getDate() - (6 - i)); return { label: DOW[d.getDay()], sales: _commAmt(x => _sameDay(x, d)) }; });
  })();
  const periodLabel = period === "year" ? (lang === "en" ? "This year" : lang === "zh" ? "今年" : "Năm nay") : period === "month" ? (lang === "en" ? "This month" : lang === "zh" ? "本月" : "Tháng này") : period === "custom" ? (lang === "en" ? "Custom" : lang === "zh" ? "自定义" : "Tùy chọn") : (lang === "en" ? "Last 7 days" : lang === "zh" ? "近7天" : "7 ngày qua");
 return (
 <>
 <main className="flex-1 overflow-auto">{/* Top bar */}
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{lang === "en" ? "Affiliate Dashboard" : lang === "zh" ? "代理商控制台" : "Dashboard Đại Lý"}</h1>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "var(--ap-primary)" }}>{lang === "en" ? "Rank #" : lang === "zh" ? "排名 #" : "Bảng xếp hạng #"}{affiliate.rank}
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-6">{/* KPI */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[
 { label: "{lang === "en" ? "Sales this month" : lang === "zh" ? "本月销售额" : "Doanh số tháng này"}", value: fp(affiliate.sales), badge: "+18%", color: "var(--ap-primary)" },
 { label: "{lang === "en" ? "Pending Commission" : lang === "zh" ? "待审核佣金" : "Hoa hồng chờ duyệt"}", value: fp(affiliate.commissionPending), badge: "Đợt 10/10", color: "var(--ap-primary)" },
 { label: "{lang === "en" ? "Commission Received" : lang === "zh" ? "已收佣金" : "Hoa hồng đã nhận"}", value: fp(affiliate.commission - affiliate.commissionPending), badge: (lang === "en" ? "This month" : lang === "zh" ? "本月" : "Tháng này"), color: "var(--ap-primary)" },
 { label: "{lang === "en" ? "Managed Affiliates" : lang === "zh" ? "管理联盟" : "CTV quản lý"}", value: affiliate.ctv.toString(), badge: "8 {lang === "en" ? "active" : lang === "zh" ? "活跃" : "đang hoạt động"}", color: "#8B5CF6" },
 ].map(({ label, value, badge, color }) => (
 <div key={label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide">{label}</p>
 <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{badge}</span>
 </div>
 <p className="text-2xl font-bold tracking-tight" style={{ color }}>{value}</p>
 </div>))}
 </div>

 <div className="grid lg:grid-cols-3 gap-6">{/* Weekly chart */}
 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
 <h2 className="font-bold text-[#44494d]">{lang === "en" ? "Commission Statistics" : lang === "zh" ? "佣金统计" : "Thống kê hoa hồng"} <span className="text-xs font-normal text-[#8f9294]">· {periodLabel}</span></h2>
 <div className="flex items-center gap-2">{period === "custom" && (
   <>
   <input type="date" value={cFrom} onChange={e => setCFrom(e.target.value)} className="px-2 py-1.5 border border-[#e5e5e5] rounded-lg text-xs" />
   <span className="text-[#8f9294] text-xs">-</span>
   <input type="date" value={cTo} onChange={e => setCTo(e.target.value)} className="px-2 py-1.5 border border-[#e5e5e5] rounded-lg text-xs" />
   </>)}
 <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-xs font-medium text-slate-600">
 <option value="week">{lang === "en" ? "This week" : lang === "zh" ? "本周" : "Tuần này"}</option>
 <option value="month">{lang === "en" ? "This month" : lang === "zh" ? "本月" : "Tháng này"}</option>
 <option value="year">{lang === "en" ? "This year" : lang === "zh" ? "今年" : "Năm nay"}</option>
 <option value="custom">{lang === "en" ? "Custom" : lang === "zh" ? "自定义" : "Tùy chọn"}</option>
 </select>
 </div>
 </div>
 <ResponsiveContainer width="100%" height={200}>
 <BarChart data={chartData} barSize={period === "month" || period === "custom" ? 12 : 28}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip formatter={(v) => [fp(Number(v)), lang === "zh" ? "佣金" : "Hoa hồng"]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="sales" fill="var(--ap-primary)" radius={6} background={{ fill: "#EFF4FB", radius: 6 }} />
 </BarChart>
 </ResponsiveContainer>
 </div>{/* Withdraw panel */}
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{lang === "en" ? "Withdraw Commission" : lang === "zh" ? "提取佣金" : "Rút hoa hồng"}</h2>
 <div className="rounded-xl p-4 mb-4" style={{ background: "linear-gradient(135deg, #1E293B, #0F172A)" }}>
 <p className="text-[#8f9294] text-xs mb-1">{t("availableBalance")}</p>
 <p className="text-2xl font-bold text-white">{fp(affiliate.commission - affiliate.commissionPending)}</p>
 <p className="text-[#1a4b97] text-xs mt-2">Kỳ giải ngân: 10 & 25 hàng tháng</p>
 </div>
 <div className="space-y-2 text-sm mb-4">
 <div className="flex justify-between"><span className="text-[#8f9294]">{lang === "zh" ? "待审核佣金" : "{lang === "en" ? "Pending Commission" : lang === "zh" ? "待审核佣金" : "Hoa hồng chờ duyệt"}"}</span><span className="font-semibold">{fp(affiliate.commissionPending)}</span></div>
 <div className="flex justify-between"><span className="text-[#8f9294]">{lang === "zh" ? "已收佣金" : "{lang === "en" ? "Commission Received" : lang === "zh" ? "已收佣金" : "Hoa hồng đã nhận"}"}</span><span className="font-semibold">{fp(affiliate.commission - affiliate.commissionPending)}</span></div>
 <div className="flex justify-between border-t border-[#f0f0f0] pt-2"><span className="font-bold text-[#44494d]">{lang === "en" ? "Total this month" : lang === "zh" ? "本月总计" : "Tổng tháng này"}</span><span className="font-bold" style={{ color: "var(--ap-primary)" }}>{fp(affiliate.commission)}</span></div>
 </div>
 <Link href="/affiliate/withdraw" className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center" style={{ background: "var(--ap-primary)" }}>{lang === "en" ? "Request Withdrawal" : lang === "zh" ? "请求提款" : "Yêu cầu rút tiền"}
 </Link>
 <p className="text-xs text-center text-[#8f9294] mt-2">{lang === "en" ? "Minimum threshold: 200,000đ" : lang === "zh" ? "最低门槛：200,000đ" : "Ngưỡng tối thiểu: 200,000đ"}</p>
 </div>
 </div>{/* Affiliate links */}
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "en" ? "Manage Affiliate Links" : lang === "zh" ? "管理推广链接" : "Quản lý Link Affiliate"}</h2>
 <Link href="/affiliate/links" className="px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center justify-center" style={{ background: "var(--ap-primary)" }}>+ {lang === "en" ? "Create New Link" : lang === "zh" ? "创建新链接" : "Tạo link mới"}
 </Link>
 </div>
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-[#8f9294] border-b border-[#f0f0f0]">
 <th className="text-left pb-3">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
 <th className="text-left pb-3">{lang === "zh" ? "链接" : "LINK"}</th>
 <th className="text-left pb-3">{lang === "en" ? "CLICKS" : lang === "zh" ? "点击量" : "LƯỢT CLICK"}</th>
 <th className="text-left pb-3">{lang === "en" ? "CONVERSIONS" : lang === "zh" ? "转化量" : "CHUYỂN ĐỔI"}</th>
 <th className="text-left pb-3">{lang === "en" ? "REVENUE" : lang === "zh" ? "收入" : "DOANH THU"}</th>
 </tr>
 </thead>
 <tbody>{links.map((row: any, i: number) => (
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
 </tr>))}
 </tbody>
 </table>
 </div>{/* CTV Team */}
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "en" ? "Affiliate Team" : lang === "zh" ? "推广团队" : "Đội nhóm CTV"}</h2>
 <Link href="/affiliate/team" className="px-4 py-2 text-sm font-semibold border border-[#e5e5e5] rounded-lg text-slate-600 hover:bg-[#f8f8fa] flex items-center justify-center">+ {lang === "en" ? "Invite New Member" : lang === "zh" ? "邀请新成员" : "Mời CTV mới"}
 </Link>
 </div>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{ctvTeamData.map((ctv, i) => (
 <div key={i} className="border border-[#f0f0f0] rounded-xl p-4 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-3">
 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-sm">{ctv.name.charAt(0)}
 </div>
 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ctv.status === "active" ? "bg-green-100 text-green-600" : "bg-[#f4f4f4] text-[#8f9294]"}`}>{ctv.status === "active" ? "Hoạt động" : "Tạm nghỉ"}
 </span>
 </div>
 <p className="font-semibold text-[#44494d] text-sm mb-1">{ctv.name}</p>
 <p className="text-xs text-[#8f9294] mb-2">Doanh số: <span className="text-slate-600 font-medium">{fp(ctv.sales)}</span></p>
 <p className="text-xs text-[#8f9294]">HC thụ động: <span className="font-bold" style={{ color: "var(--ap-primary)" }}>{fp(ctv.commission)}</span></p>
 </div>))}
 </div>
 </div>
 </div>
 </main>
 </>);
}


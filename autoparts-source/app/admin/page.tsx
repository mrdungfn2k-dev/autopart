"use client";
import { useState, useEffect, useMemo } from "react";
import { getAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebarShared from "@/components/AdminSidebar";



// Tổng hợp GMV & doanh thu nền tảng (10%) từ orders thật theo mốc thời gian.
// mode: day (14 ngày) | month (12 tháng) | year (5 năm) | custom (từ–đến). Giá trị tính theo Triệu đ.
type GmvMode = "day" | "month" | "year" | "custom";
function buildGmvSeries(orders: any[], mode: GmvMode, fromStr: string, toStr: string) {
  const now = new Date();
  let start: Date, end: Date, gran: "day" | "month" | "year";
  if (mode === "custom" && fromStr && toStr) {
    start = new Date(fromStr); end = new Date(toStr);
    if (end < start) [start, end] = [end, start];
    const days = (end.getTime() - start.getTime()) / 86400000;
    gran = days <= 62 ? "day" : days <= 800 ? "month" : "year";
  } else if (mode === "day") {
    end = now; start = new Date(now); start.setDate(start.getDate() - 13); gran = "day";
  } else if (mode === "year") {
    end = now; start = new Date(now); start.setFullYear(start.getFullYear() - 4); gran = "year";
  } else {
    end = now; start = new Date(now); start.setMonth(start.getMonth() - 11); gran = "month";
  }
  const keyOf = (dt: Date) => gran === "day" ? `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`
    : gran === "month" ? `${dt.getFullYear()}-${dt.getMonth()}` : `${dt.getFullYear()}`;
  const labelOf = (dt: Date) => gran === "day" ? `${dt.getDate()}/${dt.getMonth() + 1}`
    : gran === "month" ? `T${dt.getMonth() + 1}` : `${dt.getFullYear()}`;
  const buckets: { key: string; label: string; raw: number }[] = [];
  const seen = new Set<string>();
  const cur = new Date(start); let guard = 0;
  while (cur <= end && guard < 2000) {
    const k = keyOf(cur);
    if (!seen.has(k)) { seen.add(k); buckets.push({ key: k, label: labelOf(cur), raw: 0 }); }
    if (gran === "day") cur.setDate(cur.getDate() + 1);
    else if (gran === "month") cur.setMonth(cur.getMonth() + 1);
    else cur.setFullYear(cur.getFullYear() + 1);
    guard++;
  }
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  for (const o of orders || []) {
    if (!o?.createdAt || o.status === "cancelled") continue;
    const dt = new Date(o.createdAt);
    if (isNaN(dt.getTime()) || dt < start || dt > end) continue;
    const i = idx.get(keyOf(dt));
    if (i != null) buckets[i].raw += (o.total ?? o.subtotal ?? 0);
  }
  return buckets.map(b => ({ month: b.label, gmv: +(b.raw / 1e6).toFixed(1), revenue: +(b.raw * 0.1 / 1e6).toFixed(1) }));
}
const regionData = [
  { name: "Hà Nội", value: 45, color: "var(--ap-primary)" },
  { name: "TP. HCM", value: 30, color: "#22C55E" },
  { name: "Khu vực khác", value: 25, color: "#F59E0B" },
];
const suppliers = [
  { id: "s-yy", name: "Yongye Canton", logo: "YY", products: 342, rating: 4.9, completion: 98, status: "trusted", revenue: 145200000 },
  { id: "s002", name: "AutoElec VN", logo: "AE", products: 121, rating: 4.7, completion: 95, status: "active", revenue: 32100000 },
  { id: "s003", name: "EV Parts Pro", logo: "EP", products: 88, rating: 4.5, completion: 87, status: "active", revenue: 18900000 },
];
const pendingApprovals = [
  { type: "new_supplier", title: "Yongye Canton VN", desc: "Đăng ký NCC mới", time: "2 giờ trước" },
  { type: "new_product", title: "Sạc DC 120kW...", desc: "SP mới chờ duyệt", time: "4 giờ trước" },
  { type: "payout", title: "Rút tiền: #WD9012", desc: "Đối tác yêu cầu tất toán", time: "1 ngày trước" },
];

function KPICard({ value, label, change, positive }: { value: string; label: string; change: string; positive: boolean; icon?: string }) {
 return (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide">{label}</p>
 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>{positive ? "^" : "v"} {change}
 </span>
 </div>
 <p className="text-2xl font-bold text-[#44494d] tracking-tight">{value}</p>
 </div>);
}

const RADIAN = Math.PI / 180;
const renderCustomLabel = (props: { cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; percent?: number }) => {
 const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
 const x = cx + radius * Math.cos(-midAngle * RADIAN);
 const y = cy + radius * Math.sin(-midAngle * RADIAN);
 return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
};

export default function AdminDashboard() {
  const { t, fp, lang } = useLang();

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
 const supPerf = suppliers;
 const [q, setQ] = useState("");
 const goSearch = () => { if (q.trim()) window.location.href = "/admin/orders?q=" + encodeURIComponent(q.trim()); };

 // Bộ lọc xu hướng GMV
 const [gmvMode, setGmvMode] = useState<GmvMode>("month");
 const [fromDate, setFromDate] = useState("");
 const [toDate, setToDate] = useState("");
 const gmvSeries = useMemo(() => buildGmvSeries(orders, gmvMode, fromDate, toDate), [orders, gmvMode, fromDate, toDate]);

 // Tải báo cáo: CHỈ xuất bảng hiệu suất NCC ra CSV (không in cả trang)
 const downloadSupplierReport = () => {
   const header = ["Nhà cung cấp", "Sản phẩm", "Đánh giá", "Hoàn thành (%)", "Trạng thái"];
   const rows = supPerf.map(s => [s.name, s.products, s.rating, s.completion, s.status === "trusted" ? "Tin cậy" : "Hoạt động"]);
   const csv = "﻿" + [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
   const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
   const a = document.createElement("a");
   a.href = url; a.download = "hieu-suat-nha-cung-cap.csv";
   document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
   window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Đã tải báo cáo hiệu suất NCC (CSV)", type: "success" } }));
 };

 return (
 <>

 <main className="flex-1 overflow-auto">{/* Top bar */}
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{t("systemOverview")}</h1>
 <div className="flex items-center gap-3">
 <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") goSearch(); }} placeholder={lang === "zh" ? "搜索订单数据..." : "Tìm đơn hàng, gõ Enter..."} className="w-56 px-3 py-2 rounded-lg text-sm text-[#44494d] outline-none focus:border-[#1a4b97]" style={{ background: "#f8f8fa", border: "1px solid #E2E8F0" }} />
 </div>
 </div>
 </div>

 <div className="p-6 space-y-6">{/* KPIs */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <KPICard value={`${products.reduce((s,p) => s + (p.price ?? 0) * (p.sold ?? p.reviews ?? 0), 0).toLocaleString('vi-VN')} đ`} label={lang === "zh" ? "总GMV" : "Tổng GMV"} change={`+${(products.reduce((s,p) => s + (p.rating ?? 0), 0) / Math.max(products.length, 1) * 2.8).toFixed(1)}%`} positive />
 <KPICard value={`${Math.round(products.reduce((s,p) => s + (p.price ?? 0) * (p.sold ?? p.reviews ?? 0), 0) * 0.1).toLocaleString('vi-VN')} đ`} label={lang === "zh" ? "平台营收(10%)" : "Doanh thu nền tảng (10%)"} change={`+${(products.filter(p => (p.sold ?? p.reviews ?? 0) > 100).length / Math.max(products.length, 1) * 20).toFixed(1)}%`} positive />
 <KPICard value={`${products.reduce((s,p) => s + (p.sold ?? p.reviews ?? 0), 0).toLocaleString()}`} label={lang === "zh" ? "订单" : "Đơn hàng"} change={`+${(products.reduce((s,p) => s + (p.reviewCount ?? p.reviews ?? 0), 0) / Math.max(products.length, 1) / 10).toFixed(1)}%`} positive />
 <KPICard value={`${suppliers.length}`} label={lang === "zh" ? "活跃合作伙伴" : "Đối tác hoạt động"} change={`+${(suppliers.filter(s => s.revenue > 100000000).length / Math.max(suppliers.length,1) * 10).toFixed(1)}%`} positive />
 </div>

 <div className="grid lg:grid-cols-5 gap-6">{/* Line chart */}
 <div className="lg:col-span-3 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
 <h2 className="font-bold text-[#44494d]">Xu hướng GMV & Doanh thu</h2>
 <div className="flex items-center gap-2 flex-wrap">
 <select value={gmvMode} onChange={e => setGmvMode(e.target.value as GmvMode)} className="text-xs border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:border-[#1a4b97]">
 <option value="day">{lang === "zh" ? "按天 (14天)" : "Theo ngày (14 ngày)"}</option>
 <option value="month">{lang === "zh" ? "按月 (12月)" : "Theo tháng (12 tháng)"}</option>
 <option value="year">{lang === "zh" ? "按年 (5年)" : "Theo năm (5 năm)"}</option>
 <option value="custom">{lang === "zh" ? "自定义" : "Tùy chọn (từ–đến)"}</option>
 </select>
 {gmvMode === "custom" && (
 <div className="flex items-center gap-1">
 <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="text-xs border border-[#e5e5e5] rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:border-[#1a4b97]" />
 <span className="text-xs text-[#8f9294]">→</span>
 <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="text-xs border border-[#e5e5e5] rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:border-[#1a4b97]" />
 </div>
 )}
 </div>
 </div>
 <ResponsiveContainer width="100%" height={200}>
 <LineChart data={gmvSeries}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Line type="monotone" dataKey="gmv" stroke="var(--ap-primary)" strokeWidth={2.5} dot={{ fill: "var(--ap-primary)", strokeWidth: 2, r: 4 }} connectNulls name={lang === "zh" ? "GMV（百万VND）" : "GMV (Triệu đ)"} />
 <Line type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }} connectNulls name={lang === "zh" ? "平台营收（百万VND）" : "Doanh thu nền tảng (Triệu đ)"} />
 </LineChart>
 </ResponsiveContainer>
 <div className="flex gap-4 mt-3">
 <span className="flex items-center gap-2 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--ap-primary)" }}></span>GMV (Triệu đ)</span>
 <span className="flex items-center gap-2 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#22C55E" }}></span>Doanh thu nền tảng (Triệu đ)</span>
 </div>
 </div>{/* Donut chart */}
 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Phân bố đơn hàng theo khu vực</h2>
 <div className="flex items-center justify-center">
 <PieChart width={200} height={200}>
 <Pie data={regionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>{regionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
 </Pie>
 <text x={100} y={96} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "22px", fontWeight: "bold", fill: "#44494d" }}>1.2K</text>
 <text x={100} y={115} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "10px", fill: "#8f9294" }}>TỔNG ĐƠN</text>
 </PieChart>
 </div>
 <div className="space-y-2 mt-2">{regionData.map(r => (
 <div key={r.name} className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: r.color }}></span><span className="text-slate-600">{r.name}</span></span>
 <span className="font-bold text-[#44494d]">{r.value}%</span>
 </div>))}
 </div>
 </div>
 </div>

 <div className="grid lg:grid-cols-5 gap-6">{/* Pending approvals */}
 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "待审批" : "Chờ phê duyệt"}</h2>
 <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "#FFF7ED", color: "var(--ap-primary)" }}>8 yêu cầu mới</span>
 </div>
 <div className="space-y-3">{pendingApprovals.slice(0, 5).map((item, i) => (
 <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f8fa] cursor-pointer transition-colors">
 <div className="w-1 h-8 rounded-full shrink-0" style={{ background: "var(--ap-primary)" }} />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-[#44494d] truncate">{item.title}</p>
 <p className="text-xs text-[#8f9294] truncate">{item.desc}</p>
 </div>
 </div>))}
 </div>
 <Link href="/admin/approvals" style={{ color: "var(--ap-primary)" }} className="w-full text-center text-sm font-semibold mt-4 block">{lang === "zh" ? "查看全部申请" : "Xem tất cả yêu cầu"}</Link>
 </div>{/* Supplier performance */}
 <div className="lg:col-span-3 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "供应商绩效" : "Hiệu suất Nhà cung cấp"}</h2>
 <button onClick={downloadSupplierReport} className="ap-btn text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa]">{lang === "zh" ? "下载报告 (CSV)" : "Tải báo cáo (CSV)"}</button>
 </div>
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left pb-3">{lang === "zh" ? "供应商" : "NHÀ CUNG CẤP"}</th>
 <th className="text-left pb-3">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
 <th className="text-left pb-3">{lang === "zh" ? "评分" : "ĐÁNH GIÁ"}</th>
 <th className="text-left pb-3">{lang === "zh" ? "完成率" : "HOÀN THÀNH"}</th>
 <th className="text-left pb-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
 </tr>
 </thead>
 <tbody>{supPerf.map(s => (
 <tr key={s.id} className="border-t border-slate-50">
 <td className="py-3">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: "#44494d" }}>{s.logo}</div>
 <span className="font-semibold text-[#44494d] text-sm">{s.name}</span>
 </div>
 </td>
 <td className="py-3 text-slate-600">{s.products.toLocaleString()}</td>
 <td className="py-3">
 <span className="font-semibold text-[#44494d] text-sm">{s.rating}</span>
 </td>
 <td className="py-3">
 <div>
 <div className="w-24 h-1.5 rounded-full bg-[#f4f4f4] mb-1">
 <div className="h-full rounded-full" style={{ width: `${s.completion}%`, background: s.completion >= 95 ? "#22C55E" : "var(--ap-primary)" }}></div>
 </div>
 <span className="text-xs text-[#8f9294]">{s.completion}% {lang === "zh" ? "交货率" : "tỷ lệ giao hàng"}</span>
 </div>
 </td>
 <td className="py-3">
 <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === "trusted" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{s.status === "trusted" ? (lang === "zh" ? "可信" : "TIN CẬY") : (lang === "zh" ? "活跃" : "HOẠT ĐỘNG")}
 </span>
 </td>
 </tr>))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </main>
 </>);
}

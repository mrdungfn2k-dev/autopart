"use client";
import { useState, useEffect } from "react";
import { getAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebarShared from "@/components/AdminSidebar";



const adminGMVData = [
  { month: "T1", gmv: 280, revenue: 28 }, { month: "T2", gmv: 320, revenue: 32 },
  { month: "T3", gmv: 295, revenue: 29.5 }, { month: "T4", gmv: 410, revenue: 41 },
  { month: "T5", gmv: 520, revenue: 52 }, { month: "T6", gmv: 680, revenue: 68 },
];
const regionData = [
  { name: "Hà Nội", value: 45, color: "var(--ap-primary)" },
  { name: "TP. HCM", value: 30, color: "var(--ap-primary)" },
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
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide">{label}</p>
 <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
 {positive ? "^" : "v"} {change}
 </span>
 </div>
 <p className="text-2xl font-bold text-[#44494d] tracking-tight">{value}</p>
 </div>
 );
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

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <AdminSidebarShared active="/admin" />

 <main className="flex-1 overflow-auto">
 {/* Top bar */}
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{t("systemOverview")}</h1>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#8f9294]" style={{ background: "#f8f8fa", border: "1px solid #E2E8F0" }}>
 Tìm kiếm dữ liệu...
 </div>
 <button className="p-2 rounded-lg hover:bg-[#f4f4f4] transition-colors text-[#8f9294] text-xs font-bold" title="Menu">⋯</button>
 <button className="p-2 rounded-lg hover:bg-[#f4f4f4] transition-colors text-[#8f9294] text-xs font-bold" title="Menu">⋯</button>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-6">
 {/* KPIs */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <KPICard value={`${(products.reduce((s,p) => s + (p.price ?? 0) * (p.sold ?? p.reviews ?? 0), 0) / 1e9).toFixed(1)} Tỷ đ`} label={lang === "zh" ? "总GMV" : "Tổng GMV"} change={`+${(products.reduce((s,p) => s + (p.rating ?? 0), 0) / Math.max(products.length, 1) * 2.8).toFixed(1)}%`} positive />
 <KPICard value={`${(products.reduce((s,p) => s + (p.price ?? 0) * (p.sold ?? p.reviews ?? 0), 0) / 1e7).toFixed(0)} Triệu đ`} label={lang === "zh" ? "平台营收(10%)" : "Doanh thu nền tảng (10%)"} change={`+${(products.filter(p => (p.sold ?? p.reviews ?? 0) > 100).length / Math.max(products.length, 1) * 20).toFixed(1)}%`} positive />
 <KPICard value={`${products.reduce((s,p) => s + (p.sold ?? p.reviews ?? 0), 0).toLocaleString()}`} label={lang === "zh" ? "订单" : "Đơn hàng"} change={`+${(products.reduce((s,p) => s + (p.reviewCount ?? p.reviews ?? 0), 0) / Math.max(products.length, 1) / 10).toFixed(1)}%`} positive />
 <KPICard value={`${suppliers.length}`} label={lang === "zh" ? "活跃合作伙伴" : "Đối tác hoạt động"} change={`+${(suppliers.filter(s => s.revenue > 100000000).length / Math.max(suppliers.length,1) * 10).toFixed(1)}%`} positive />
 </div>

 <div className="grid lg:grid-cols-5 gap-6">
 {/* Line chart */}
 <div className="lg:col-span-3 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-5">
 <h2 className="font-bold text-[#44494d]">Xu hướng GMV & Doanh thu</h2>
 <select className="text-xs border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-slate-600">
 <option>6 tháng qua</option>
 <option>3 tháng qua</option>
 </select>
 </div>
 <ResponsiveContainer width="100%" height={200}>
 <LineChart data={adminGMVData}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Line type="monotone" dataKey="gmv" stroke="var(--ap-primary)" strokeWidth={2.5} dot={{ fill: "var(--ap-primary)", strokeWidth: 2, r: 4 }} name={lang === "zh" ? "GMV（亿VND）" : "GMV (Tỷ VNĐ)"} />
 <Line type="monotone" dataKey="revenue" stroke="var(--ap-primary)" strokeWidth={2.5} dot={{ fill: "var(--ap-primary)", strokeWidth: 2, r: 4 }} name={lang === "zh" ? "营收（万VND）" : "Doanh thu (Triệu VNĐ)"} />
 </LineChart>
 </ResponsiveContainer>
 <div className="flex gap-4 mt-3">
 <span className="flex items-center gap-2 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--ap-primary)" }}></span>GMV (Tỷ VNĐ)</span>
 <span className="flex items-center gap-2 text-xs text-[#8f9294]"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--ap-primary)" }}></span>Doanh thu (Triệu VNĐ)</span>
 </div>
 </div>

 {/* Donut chart */}
 <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Phân bố đơn hàng theo khu vực</h2>
 <div className="flex items-center justify-center">
 <PieChart width={200} height={200}>
 <Pie data={regionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
 {regionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
 </Pie>
 <text x={100} y={96} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "22px", fontWeight: "bold", fill: "#44494d" }}>1.2K</text>
 <text x={100} y={115} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: "10px", fill: "#8f9294" }}>TỔNG ĐƠN</text>
 </PieChart>
 </div>
 <div className="space-y-2 mt-2">
 {regionData.map(r => (
 <div key={r.name} className="flex items-center justify-between text-sm">
 <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: r.color }}></span><span className="text-slate-600">{r.name}</span></span>
 <span className="font-bold text-[#44494d]">{r.value}%</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div className="grid lg:grid-cols-5 gap-6">
 {/* Pending approvals */}
 <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "待审批" : "Chờ phê duyệt"}</h2>
 <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "#FFF7ED", color: "var(--ap-primary)" }}>8 yêu cầu mới</span>
 </div>
 <div className="space-y-3">
 {pendingApprovals.slice(0, 5).map((item, i) => (
 <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8f8fa] cursor-pointer transition-colors">
 <div className="w-1 h-8 rounded-full shrink-0" style={{ background: "var(--ap-primary)" }} />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-[#44494d] truncate">{item.title}</p>
 <p className="text-xs text-[#8f9294] truncate">{item.desc}</p>
 </div>
 </div>
 ))}
 </div>
 <Link href="/admin/approvals" style={{ color: "var(--ap-primary)" }} className="w-full text-center text-sm font-semibold mt-4 block">{lang === "zh" ? "查看全部申请" : "Xem tất cả yêu cầu"}</Link>
 </div>

 {/* Supplier performance */}
 <div className="lg:col-span-3 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">{lang === "zh" ? "供应商绩效" : "Hiệu suất Nhà cung cấp"}</h2>
 <button onClick={() => alert((lang === "zh" ? "功能开发中" : "Tính năng đang phát triển"))} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa]">{lang === "zh" ? "下载报告" : "Tải báo cáo"}</button>
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
 <tbody>
 {supPerf.map(s => (
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
 <span className={`px-2 py-1 rounded text-xs font-bold ${s.status === "trusted" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
 {s.status === "trusted" ? (lang === "zh" ? "可信" : "TIN CẬY") : (lang === "zh" ? "活跃" : "HOẠT ĐỘNG")}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

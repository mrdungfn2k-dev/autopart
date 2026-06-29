"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAuth } from "@/lib/auth";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminReportsPage() {
  const { t, fp, lang } = useLang();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setAllProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const gmvData = ["T5","T6","T7","T8","T9","T10"].map((month, i) => {
  const slice = allProducts.slice(i * 2, i * 2 + 4);
  return {
    month,
    gmv: Math.round(slice.reduce((s,p) => s + p.price * p.sold, 0) / 1e6),
    orders: slice.reduce((s,p) => s + p.sold, 0),
    newUsers: Math.round(slice.reduce((s,p) => s + p.reviewCount, 0) / 3),
  };
});
  const _catCount: Record<string,number> = {};
  const _catNames: Record<string,string> = {}; // map id/slug -> tên hiển thị (Phụ kiện khác...) thay vì slug thô
allProducts.forEach(p => { _catCount[p.categoryId] = (_catCount[p.categoryId] ?? 0) + p.sold; if (p.categoryId) _catNames[p.categoryId] = p.categoryName || p.category || p.categoryId; });
const _totalSold = allProducts.reduce((s,p) => s + p.sold, 0) || 1;
const _catLabels: Record<string,string> = { brakes: "Má phanh / đĩa phanh", filters: "Lọc dầu / lọc khí", batteries: "Ắc quy / điện", lighting: "Đèn pha / hậu", ignition: "Bugi / đánh lửa" };
const _catColors = ["var(--ap-primary)", "#F59E0B", "#22C55E", "#8B5CF6", "#EF4444", "#8f9294"];
const categoryData = Object.entries(_catCount).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([id, count], i) => ({
  name: _catNames[id] || _catLabels[id] || id,
  value: Math.round(count / _totalSold * 100),
  color: _catColors[i] ?? "#8f9294",
})).concat([{ name: "Khác", value: Math.max(1, 100 - Object.entries(_catCount).sort((a,b) => b[1] - a[1]).slice(0, 5).reduce((s, [,c]) => s + Math.round(c / _totalSold * 100), 0)), color: "#8f9294" }]);
  const provinceData = [
  { name: "TP.HCM", orders: Math.round(allProducts.reduce((s,p) => s + p.sold, 0) * 0.38), revenue: Math.round(allProducts.reduce((s,p) => s + p.price * p.sold, 0) / 1e6 * 0.38) },
  { name: "Hà Nội", orders: Math.round(allProducts.reduce((s,p) => s + p.sold, 0) * 0.25), revenue: Math.round(allProducts.reduce((s,p) => s + p.price * p.sold, 0) / 1e6 * 0.25) },
  { name: "Bình Dương", orders: Math.round(allProducts.reduce((s,p) => s + p.sold, 0) * 0.12), revenue: Math.round(allProducts.reduce((s,p) => s + p.price * p.sold, 0) / 1e6 * 0.12) },
  { name: "Đà Nẵng", orders: Math.round(allProducts.reduce((s,p) => s + p.sold, 0) * 0.09), revenue: Math.round(allProducts.reduce((s,p) => s + p.price * p.sold, 0) / 1e6 * 0.09) },
  { name: "Đồng Nai", orders: Math.round(allProducts.reduce((s,p) => s + p.sold, 0) * 0.08), revenue: Math.round(allProducts.reduce((s,p) => s + p.price * p.sold, 0) / 1e6 * 0.08) },
  { name: "Cần Thơ", orders: Math.round(allProducts.reduce((s,p) => s + p.sold, 0) * 0.04), revenue: Math.round(allProducts.reduce((s,p) => s + p.price * p.sold, 0) / 1e6 * 0.04) },
];
  const topProducts = allProducts.slice().sort((a,b) => b.sold - a.sold).slice(0, 5).map(p => ({
  name: p.name,
  orders: p.sold,
  revenue: p.price * p.sold,
  trend: p.rating >= 4.7 ? "up" as const : "down" as const,
}));
 const [period, setPeriod] = useState("month");
 const [activeTab, setActiveTab] = useState<"overview" | "products" | "geography">("overview");

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{lang === "en" ? "Reports & Analytics" : lang === "zh" ? "报告与分析" : "Báo cáo & Phân tích"}</h1>
 <div className="flex items-center gap-3">
 <div className="flex rounded-lg border border-[#e5e5e5] overflow-hidden text-sm">{[["week", (lang === "zh" ? "周" : "Tuần")], ["month", "Tháng"], ["quarter", "Quý"], ["year", "Năm"]].map(([k, l]) => (
 <button key={k} onClick={() => setPeriod(k)}
 className={`px-3 py-1.5 transition-colors ${period === k ? "text-white font-semibold" : "text-slate-600 hover:bg-[#f8f8fa]"}`}
 style={period === k ? { background: "var(--ap-primary)" } : {}}>{l}
 </button>))}
 </div>
 <button className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">Xuất PDF
 </button>
 </div>
 </div>
 <div className="px-6 flex border-t border-[#f0f0f0]">{[["overview", "Tổng quan"], ["products", (lang === "zh" ? "产品" : "Sản phẩm")], ["geography", "Địa lý"]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}
 </button>))}
 </div>
 </div>

 <div className="p-6">{/* KPI summary */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{[
 { label: "GMV tháng 10", value: "2.85 Tỷ", prev: "2.28 Tỷ", change: "+25.0%", up: true, color: "var(--ap-primary)" },
 { label: "{lang === "en" ? "Number of Orders" : lang === "zh" ? "订单数" : "Số {lang === "en" ? "orders" : lang === "zh" ? "订单" : "đơn"} hàng"}", value: "1,540", prev: "1,190", change: "+29.4%", up: true, color: "#22C55E" },
 { label: "Người dùng mới", value: "221", prev: "172", change: "+28.5%", up: true, color: "var(--ap-primary)" },
 { label: "Tỷ lệ hoàn {lang === "en" ? "orders" : lang === "zh" ? "订单" : "đơn"}", value: "2.1%", prev: "2.8%", change: "-0.7%", up: true, color: "#8B5CF6" },
 ].map(s => (
 <div key={s.label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4">
 <p className="text-xs text-[#8f9294] mb-2">{s.label}</p>
 <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
 <div className="flex items-center gap-1 mt-1">{""}
 <span className={`text-xs font-bold ${s.up ? "text-green-600" : "text-red-500"}`}>{s.change}</span>
 <span className="text-xs text-[#8f9294]">vs tháng trước</span>
 </div>
 </div>))}
 </div>{activeTab === "overview" && (
 <div className="grid lg:grid-cols-2 gap-6">
 <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">GMV 6 tháng gần nhất (triệu VNĐ)</h2>
 <ResponsiveContainer width="100%" height={220}>
 <LineChart data={gmvData}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} formatter={(v) => [`${Number(v).toLocaleString("vi-VN")} Triệu`, ""]} />
 <Line type="monotone" dataKey="gmv" stroke="var(--ap-primary)" strokeWidth={3} dot={{ fill: "var(--ap-primary)", r: 5 }} connectNulls name="GMV" />
 <Line type="monotone" dataKey="orders" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 4 }} connectNulls name="Số {lang === "en" ? "orders" : lang === "zh" ? "订单" : "đơn"}" />
 </LineChart>
 </ResponsiveContainer>
 <div className="flex gap-6 mt-2 justify-center">
 <span className="flex items-center gap-1.5 text-xs text-[#8f9294]"><span className="w-3 h-1 rounded inline-block" style={{ background: "var(--ap-primary)" }}></span>GMV (triệu đ)</span>
 <span className="flex items-center gap-1.5 text-xs text-[#8f9294]"><span className="w-3 h-1 rounded inline-block" style={{ background: "#22C55E" }}></span>{lang === "en" ? "Number of Orders" : lang === "zh" ? "订单数" : "Số {lang === "en" ? "orders" : lang === "zh" ? "订单" : "đơn"} hàng"}</span>
 </div>
 </div>

 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{t("revenueByCategory")}</h2>
 <div className="flex items-center gap-4">
 <div className="shrink-0">
 <PieChart width={170} height={170}>
 <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3}>{categoryData.map((entry, index) => (
 <Cell key={index} fill={entry.color} />))}
 </Pie>
 </PieChart>
 </div>
 <div className="flex-1 space-y-2">{categoryData.map(cat => (
 <div key={cat.name} className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-1.5 min-w-0">
 <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }}></span>
 <span className="text-slate-600 truncate">{cat.name}</span>
 </div>
 <span className="font-bold text-[#44494d] ml-2 shrink-0">{cat.value}%</span>
 </div>))}
 </div>
 </div>
 </div>

 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Người dùng mới theo tháng</h2>
 <ResponsiveContainer width="100%" height={180}>
 <BarChart data={gmvData} barSize={24}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
 <YAxis hide />
 <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
 <Bar dataKey="newUsers" fill="#22C55E" radius={6} name="Người dùng mới" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>)}

 {activeTab === "products" && (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <div className="p-4 border-b border-[#f0f0f0]">
 <h2 className="font-bold text-[#44494d]">Top 5 sản phẩm bán chạy nhất tháng 10</h2>
 </div>
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">#</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
 <th className="text-left px-4 py-3">SỐ {lang === "en" ? "orders" : lang === "zh" ? "订单" : "đơn"}</th>
 <th className="text-left px-4 py-3">DOANH THU</th>
 <th className="text-left px-4 py-3">XU HƯỚNG</th>
 </tr>
 </thead>
 <tbody>{topProducts.map((p, i) => (
 <tr key={i} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3">
 <span className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-[#f4f4f4] text-slate-600" : i === 2 ? "bg-orange-100 text-orange-700" : "text-[#8f9294]"}`}>{i + 1}
 </span>
 </td>
 <td className="px-4 py-3 font-semibold text-[#44494d] text-sm max-w-xs">{p.name}</td>
 <td className="px-4 py-3 font-bold text-[#44494d]">{p.orders.toLocaleString()}</td>
 <td className="px-4 py-3 font-bold text-green-600">{fp(p.revenue)}</td>
 <td className="px-4 py-3">
 <span className={`flex items-center gap-1 text-xs font-bold ${p.trend === "up" ? "text-green-600" : "text-red-500"}`}>{""}
 {p.trend === "up" ? "{lang === "en" ? "Up" : lang === "zh" ? "上升" : "Tăng"}" : (lang === "zh" ? "减震" : "Giảm")}
 </span>
 </td>
 </tr>))}
 </tbody>
 </table>
 </div>)}

 {activeTab === "geography" && (
 <div>
 <div className="grid lg:grid-cols-2 gap-6">
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{lang === "en" ? "orders" : lang === "zh" ? "订单" : "đơn"} hàng theo tỉnh/thành</h2>
 <ResponsiveContainer width="100%" height={220}>
 <BarChart data={provinceData} layout="vertical" barSize={18}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
 <XAxis type="number" hide />
 <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} width={70} />
 <Tooltip contentStyle={{ borderRadius: "8px" }} />
 <Bar dataKey="orders" fill="var(--ap-primary)" radius={[0,6,6,0]} name="Số {lang === "en" ? "orders" : lang === "zh" ? "订单" : "đơn"}" />
 </BarChart>
 </ResponsiveContainer>
 </div>

 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">Doanh thu theo tỉnh/thành (Triệu VNĐ)</h2>
 <div className="space-y-3 mt-2">{provinceData.map((p, i) => (
 <div key={p.name}>
 <div className="flex justify-between text-sm mb-1">
 <span className="font-medium text-[#44494d]">{p.name}</span>
 <span className="font-bold text-slate-600">{p.revenue.toLocaleString("vi-VN")} Triệu</span>
 </div>
 <div className="w-full h-2 rounded-full bg-[#f4f4f4]">
 <div className="h-full rounded-full transition-all" style={{ width: `${(p.revenue / 118) * 100}%`, background: ["var(--ap-primary)","var(--ap-primary)","#22C55E","#8B5CF6","#F59E0B","#8f9294"][i] }} />
 </div>
 </div>))}
 </div>
 </div>
 </div>
 </div>)}
 </div>
 </main>
 </>);
}


"use client";
import { useState, useEffect } from "react";
import { useLang, formatPriceLang } from "@/lib/i18n";
import Link from "next/link";
import { formatPrice } from "@/lib/data";

import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";




const recommendations = [
 { name: "Performance Intake Air Filter", desc: "Tăng HP & Tiết kiệm nhiên liệu", price: 1350000 },
 { name: "High-Performance Brake Fluid", desc: "DOT 4 500ml", price: 390000 },
 { name: "LED Interior Light Kit", desc: "Đèn nội thất 7 màu", price: 280000 },
];

const supportItems = [
 { label: "Yêu cầu bảo hành", desc: "Gửi khiếu nại sản phẩm lỗi", href: "/customer/warranty" },
 { label: "Chat với chuyên gia", desc: "Phản hồi trung bình: 2 phút", href: "#" },
 { label: "Hướng dẫn lắp đặt", desc: "Video DIY từng bước", href: "#" },
];

const customerGarage = [
  { id: "v001", brand: "BYD", model: "Han EV", year: "2023", engine: "Electric 469HP", color: "#60A5FA", active: true },
  { id: "v002", brand: "Toyota", model: "Camry", year: "2021", engine: "2.5L Hybrid", color: "#34D399", active: false },
];



export default function CustomerDashboard() {
  const { t, fp, lang } = useLang();

  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // === Translated data (moved from module scope) ===
  const swatchMap: Record<string, { bg: string; color: string; label: string }> = {
    "brake-pad":      { bg: "#FEE2E2", color: "#DC2626", label: (lang === "zh" ? "制动" : "Phanh") },
    "brake-disc":     { bg: "#FEE2E2", color: "#DC2626", label: (lang === "zh" ? "碟片" : "Đĩa") },
    "oil-filter":     { bg: "#FEF9C3", color: "#92400E", label: (lang === "zh" ? "滤清" : "Lọc") },
    "cabin-filter":   { bg: "#F0FDF4", color: "#166534", label: (lang === "zh" ? "滤清" : "Lọc") },
    "spark-plug":     { bg: "#EDE9FE", color: "#6D28D9", label: (lang === "zh" ? "火花塞" : "Bugi") },
    "battery":        { bg: "#DBEAFE", color: "#1D4ED8", label: (lang === "zh" ? "蓄电池" : "Ắcquy") },
    "engine-oil":     { bg: "#44494d", color: "#8f9294", label: (lang === "zh" ? "机油" : "Nhớt") },
    "headlight":      { bg: "#FEF3C7", color: "#D97706", label: (lang === "zh" ? "车灯" : "Đèn") },
    "shock-absorber": { bg: "#D1FAE5", color: "#065F46", label: (lang === "zh" ? "减震" : "Giảm") },
    "timing-belt":    { bg: "#F3F4F6", color: "#374151", label: (lang === "zh" ? "皮带" : "Curoa") },
    "radiator":       { bg: "#E0F2FE", color: "#0369A1", label: (lang === "zh" ? "水箱" : "Két") },
    "o2-sensor":      { bg: "#FDF4FF", color: "#7E22CE", label: (lang === "zh" ? "传感" : "Cảm") },
  };
  function getSwatch(img: string) { return swatchMap[img] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" }; }



  const customerOrders = [
    { id: "APH-8821", product: "Má Phanh Akebono Toyota Vios", status: "IN_TRANSIT", via: "GHN Express", eta: "Hôm nay 17:00" },
    { id: "APH-8819", product: "Lọc Dầu Bosch F026407006", status: "PROCESSING", via: "Q5 TP.HCM", eta: "Ngày mai" },
  ];
  const products = [
    { name: "Má Phanh Akebono Toyota Vios", oemCode: "AK-VIOS-F", price: 1250000, image: "brake-pad" },
    { name: "Lọc Dầu Bosch F026407006", oemCode: "BOF026407006", price: 700000, image: "oil-filter" },
  ];

 const activeVehicle = customerGarage[0];
 
 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
 <CustomerSidebar active="/customer" />
 <main className="flex-1 overflow-auto">
 {/* Top bar */}
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">Dashboard</h1>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#8f9294]" style={{ background: "#f8f8fa", border: "1px solid #E2E8F0" }}>
 Tìm kiếm phụ tùng, đơn hàng...
 </div>
 <button onClick={() => {}} className="relative p-2 rounded-lg hover:bg-[#f4f4f4] text-[#8f9294] text-sm" title={t("settingNotification")}>TB</button>
 <div className="flex items-center gap-2">
 <div className="text-right">
 <p className="text-sm font-semibold text-[#44494d]">Alex Johnson</p>
 <p className="text-xs font-bold" style={{ color: "var(--ap-primary)" }}>GOLD MEMBER</p>
 </div>
 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a4b97] to-[#0d2d5e] flex items-center justify-center text-white font-bold text-sm">AJ</div>
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 space-y-6">
 {/* KPI Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {[
 { value: "1.250", label: "Điểm thưởng", badge: "+150 tháng này", color: "#F59E0B" },
 { value: "24", label: "Tổng đơn hàng", color: "var(--ap-primary)" },
 { value: "2", label: (lang === "zh" ? "运输中" : "Đang vận chuyển"), color: "var(--ap-primary)" },
 ].map((kpi, i) => (
 <div key={i} className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-3">
 <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide">{kpi.label}</p>
 {kpi.badge && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">{kpi.badge}</span>}
 </div>
 <p className="text-2xl font-bold tracking-tight" style={{ color: kpi.color }}>{kpi.value}</p>
 </div>
 ))}
 <div className="rounded-xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--ap-primary), #EA580C)" }}>
 <div className="flex items-center justify-between mb-3">
 <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Hạng thành viên</p>
 <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">Top 5%</span>
 </div>
 <p className="text-2xl font-bold tracking-tight">Gold</p>
 </div>
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 {/* Active orders */}
 <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">Theo dõi đơn hàng đang xử lý</h2>
 <Link href="/customer/orders" style={{ color: "var(--ap-primary)" }} className="text-sm font-semibold">{t("viewAll")}</Link>
 </div>
 <div className="space-y-3 mb-5">
 {customerOrders.map(order => (
 <div key={order.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: order.status === "IN_TRANSIT" ? "#FFF7ED" : "#EFF6FF" }}>
 {order.status === "IN_TRANSIT" ? ">" : "✓"}
 </div>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{order.product}</p>
 <p className="text-xs text-[#8f9294]">Đơn {order.id} • {order.status === "IN_TRANSIT" ? `Giao qua ${order.via}` : `Kho: ${order.via}`}</p>
 </div>
 </div>
 <div className="text-right">
 <span className={`text-xs font-bold ${order.status === "IN_TRANSIT" ? "text-[#1a4b97]" : "text-[#1a4b97]"}`}>
 {order.status === "IN_TRANSIT" ? "ĐANG GIAO" : "ĐANG XỬ LÝ"}
 </span>
 <p className="text-xs text-[#8f9294]">{order.eta}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Recent purchases */}
 <h3 className="font-bold text-[#44494d] mb-3">Lịch sử mua hàng</h3>
 <table className="w-full text-sm">
 <thead>
 <tr className="text-xs text-[#8f9294]">
 <th className="text-left pb-2">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
 <th className="text-left pb-2">NGÀY MUA</th>
 <th className="text-left pb-2">{lang === "zh" ? "价格" : "GIÁ"}</th>
 <th className="text-left pb-2">{lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
 </tr>
 </thead>
 <tbody>
 {products.slice(0, 2).map((prod, i) => (
 <tr key={i} className="border-t border-slate-50">
 <td className="py-3">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg text-xl flex items-center justify-center" style={{ background: "#f8f8fa" }}>
 <span style={{background: getSwatch(prod.image).bg, color: getSwatch(prod.image).color, fontSize: "10px", fontWeight: "bold", padding: "3px 5px", borderRadius: "4px", whiteSpace: "nowrap"}}>{getSwatch(prod.image).label}</span>
 </div>
 <div>
 <p className="font-medium text-[#44494d] text-xs">{prod.name}</p>
 <p className="text-[#8f9294] text-xs font-mono">SKU: {prod.oemCode}</p>
 </div>
 </div>
 </td>
 <td className="py-3 text-[#8f9294] text-xs">{i === 0 ? "12 tháng 10, 2023" : "28 tháng 9, 2023"}</td>
 <td className="py-3 font-bold text-[#44494d]">{fp(prod.price)}</td>
 <td className="py-3">
 <div className="flex gap-2">
 <button onClick={() => {}} className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--ap-primary)" }}>Mua lại</button>
 <button onClick={() => {}} className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600">Đánh giá</button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Right panel */}
 <div className="space-y-5">
 {/* My Garage */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-[#44494d]">Gara của tôi</h2>
 <button onClick={() => {}} className="text-xs font-semibold" style={{ color: "var(--ap-primary)" }}>+ Thêm xe</button>
 </div>
 {customerGarage.map(car => (
 <div key={car.id} className={`p-4 rounded-xl mb-3 ${car.active ? "border-2" : "border border-[#f0f0f0]"}`}
 style={car.active ? { borderColor: "var(--ap-primary)", background: "#FFF7ED" } : { background: "#f8f8fa" }}>
 {car.active && <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-[#1a4b97]">ĐANG LỌC THEO XE</span>✓</div>}
 <p className="font-bold text-[#44494d]">{car.year} {car.brand} {car.model}</p>
 <p className="text-xs text-[#8f9294] mb-2">{car.engine}</p>
 {car.active && <button onClick={() => {}} className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{ background: "var(--ap-primary)" }}>{lang === "zh" ? "查找该车配件" : "Tìm phụ tùng cho xe này"}</button>}
 {!car.active && <button onClick={() => {}} className="text-xs text-[#1a4b97] font-medium">Xem xe này &rsaquo;</button>}
 </div>
 ))}
 </div>

 {/* Recommendations */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-3">Gợi ý cho BMW của bạn</h2>
 <div className="space-y-3">
 {recommendations.map(r => (
 <div key={r.name} className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-[#8f9294] shrink-0" style={{ background: "#f8f8fa" }}>PT</div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-[#44494d] truncate">{r.name}</p>
 <p className="text-xs text-[#8f9294]">{r.desc}</p>
 </div>
 <span className="text-sm font-bold shrink-0" style={{ color: "var(--ap-primary)" }}>{fp(r.price)}</span>
 </div>
 ))}
 </div>
 <button onClick={() => {}} className="w-full mt-3 py-2 text-xs font-semibold border border-[#e5e5e5] rounded-lg text-slate-600 hover:bg-[#f8f8fa]">Xem danh mục cá nhân hóa</button>
 </div>

 {/* Support */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-3">Hỗ trợ & Trợ giúp</h2>
 <div className="space-y-2">
 {supportItems.map(({ label, desc, href }) => (
 <Link key={label} href={href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f8f8fa] transition-colors">
 <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFF7ED" }}>

 </div>
 <div>
 <p className="text-sm font-semibold text-[#44494d]">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

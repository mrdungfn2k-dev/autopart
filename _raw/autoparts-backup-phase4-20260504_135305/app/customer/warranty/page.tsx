"use client";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";





type ClaimStatus = "ACTIVE" | "PENDING" | "RESOLVED" | "REJECTED";

const warrantyItems = [
 {
 id: "W-001", orderId: "#AP-10108", product: "Bugi NGK Iridium Platinum",
 purchaseDate: "02/10/2024", warrantyEnd: "02/10/2025", status: "ACTIVE" as ClaimStatus, duration: "12 tháng"
 },
 {
 id: "W-002", orderId: "#AP-09987", product: "Bình Ắc Quy GS Maintenance Free",
 purchaseDate: "25/09/2024", warrantyEnd: "25/09/2026", status: "ACTIVE" as ClaimStatus, duration: "24 tháng"
 },
 {
 id: "W-003", orderId: "#AP-09765", product: "Lọc Cabin Toyota OEM",
 purchaseDate: "15/09/2024", warrantyEnd: "15/09/2025", status: "ACTIVE" as ClaimStatus,
 icon: "⬜", duration: "12 tháng"
 },
];

const claimHistory = [
 {
 id: "C-001", product: "Má Phanh Akebono", issue: "Phanh kêu bất thường sau 2 tuần lắp",
 filed: "10/10/2024", status: "PENDING" as ClaimStatus, orderId: "#AP-09876"
 },
];

const statusConfig: Record<ClaimStatus, { label: string; color: string; symbol: string }> = {
 ACTIVE: { label: "Còn bảo hành", color: "bg-green-100 text-green-700", symbol: "✓" },
 PENDING: { label: "Đang xem xét", color: "bg-yellow-100 text-yellow-700", symbol: "⋯" },
 RESOLVED: { label: "Đã giải quyết", color: "bg-blue-100 text-blue-700", symbol: "✓" },
 REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-700", symbol: "✕" },
};

export default function CustomerWarrantyPage() {
  const { t, fp, lang } = useLang();
 const [showClaimModal, setShowClaimModal] = useState(false);
 const [activeTab, setActiveTab] = useState<"items" | "claims">("items");

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
 <CustomerSidebar active="/customer/warranty" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">Bảo hành sản phẩm</h1>
 <button onClick={() => setShowClaimModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
 Đăng ký bảo hành
 </button>
 </div>
 <div className="px-6 flex border-t border-[#2f3336]">
 {[["items", "Sản phẩm bảo hành"], ["claims", "Yêu cầu bảo hành"]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
 {label}
 {key === "claims" && claimHistory.some(c => c.status === "PENDING") && (
 <span className="ml-1 w-4 h-4 rounded-full text-white text-xs inline-flex items-center justify-center" style={{ background: "var(--ap-primary)" }}>!</span>
 )}
 </button>
 ))}
 </div>
 </div>

 <div className="p-6">
 {/* Info banner */}
 <div className="flex items-start gap-3 p-4 rounded-xl mb-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
 !
 <div>
 <p className="text-sm font-semibold text-blue-800">Chính sách bảo hành AutoParts</p>
 <p className="text-xs text-[#1a4b97] mt-0.5">Sản phẩm OEM được bảo hành 12–24 tháng từ nhà sản xuất. Đối với sản phẩm lỗi trong 7 ngày đầu, chúng tôi đổi mới 100%. Vui lòng giữ hóa đơn và ảnh lắp đặt để hỗ trợ khiếu nại.</p>
 </div>
 </div>

 {activeTab === "items" && (
 <div className="space-y-4">
 {warrantyItems.map(item => {
 const status = statusConfig[item.status];
 // Calculate remaining days roughly
 const endDate = new Date(item.warrantyEnd.split("/").reverse().join("-"));
 const now = new Date();
 const daysLeft = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
 const progress = Math.min(100, (1 - daysLeft / 365) * 100);

 return (
 <div key={item.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <div className="flex items-start gap-4 mb-4">
 <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "#f8f8fa" }}></div>
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="font-bold text-[#44494d]">{item.product}</h3>
 <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${status.color}`}>
 {status.symbol} {status.label}
 </span>
 </div>
 <p className="text-xs text-[#8f9294] mb-2">Đơn hàng {item.orderId} • Mua ngày {item.purchaseDate}</p>
 <div className="flex items-center gap-6 text-sm">
 <div>
 <p className="text-xs text-[#8f9294]">Bảo hành</p>
 <p className="font-semibold text-[#44494d]">{item.duration}</p>
 </div>
 <div>
 <p className="text-xs text-[#8f9294]">Hết hạn</p>
 <p className="font-semibold text-[#44494d]">{item.warrantyEnd}</p>
 </div>
 <div>
 <p className="text-xs text-[#8f9294]">Còn lại</p>
 <p className="font-bold" style={{ color: daysLeft < 30 ? "#EF4444" : "#22C55E" }}>{daysLeft} ngày</p>
 </div>
 </div>
 </div>
 </div>

 {/* Progress bar */}
 <div className="mb-3">
 <div className="w-full h-2 rounded-full bg-[#f4f4f4]">
 <div className="h-full rounded-full" style={{ width: `${100 - progress}%`, background: daysLeft < 60 ? "#EF4444" : "#22C55E" }}></div>
 </div>
 </div>

 <div className="flex gap-2">
 <button onClick={() => setShowClaimModal(true)} className="px-4 py-2 text-sm font-semibold rounded-lg border border-orange-200 text-[#1a4b97] hover:bg-orange-50 transition-colors">
 Gửi khiếu nại
 </button>
 <Link href={`/customer/orders`} className="px-4 py-2 text-sm font-semibold rounded-lg border border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa] transition-colors">
 Xem đơn hàng
 </Link>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {activeTab === "claims" && (
 <div className="space-y-4">
 {claimHistory.length === 0 ? (
 <div className="text-center py-12 text-[#8f9294]">

 <p>Chưa có yêu cầu bảo hành nào</p>
 </div>
 ) : (
 claimHistory.map(claim => {
 const status = statusConfig[claim.status];
 return (
 <div key={claim.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <div className="flex items-start justify-between mb-3">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-mono text-sm font-bold text-slate-600">{claim.id}</span>
 <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${status.color}`}>
 {status.symbol} {status.label}
 </span>
 </div>
 <h3 className="font-bold text-[#44494d]">{claim.product}</h3>
 <p className="text-xs text-[#8f9294]">Đơn hàng {claim.orderId} • Gửi ngày {claim.filed}</p>
 </div>
 </div>
 <div className="p-3 rounded-xl mb-3" style={{ background: "#f8f8fa" }}>
 <p className="text-xs text-[#8f9294] mb-1 font-semibold">Mô tả sự cố:</p>
 <p className="text-sm text-[#44494d]">{claim.issue}</p>
 </div>
 {claim.status === "PENDING" && (
 <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3">

 <span>Yêu cầu đang được xem xét bởi nhà cung cấp. Thời gian phản hồi: 1–3 ngày làm việc.</span>
 </div>
 )}
 </div>
 );
 })
 )}
 </div>
 )}
 </div>

 {/* Claim modal */}
 {showClaimModal && (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
 <div className="flex items-center justify-between p-5 border-b border-[#2f3336]">
 <h3 className="font-bold text-[#44494d]">Gửi yêu cầu bảo hành</h3>
 <button onClick={() => setShowClaimModal(false)} className="text-[#8f9294]">✕</button>
 </div>
 <div className="p-5 space-y-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Sản phẩm cần bảo hành</label>
 <select className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
 {warrantyItems.map(w => <option key={w.id}>{w.product}</option>)}
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Loại vấn đề</label>
 <select className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
 <option>Sản phẩm bị lỗi kỹ thuật</option>
 <option>Sản phẩm không đúng mô tả</option>
 <option>Hỏng hóc sau thời gian sử dụng bình thường</option>
 <option>Khác</option>
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Mô tả chi tiết sự cố</label>
 <textarea rows={3} placeholder="Mô tả chi tiết vấn đề gặp phải..." className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm resize-none focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Ảnh/Video đính kèm (tùy chọn)</label>
 <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-4 text-center hover:border-orange-300 transition-colors cursor-pointer">
 <p className="text-[#8f9294] text-sm">Kéo thả hoặc click để upload ảnh</p>
 <p className="text-xs text-slate-300 mt-1">Hỗ trợ JPG, PNG, MP4</p>
 </div>
 </div>
 </div>
 <div className="flex gap-3 p-5 border-t border-[#2f3336]">
 <button onClick={() => setShowClaimModal(false)} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
 <button onClick={() => setShowClaimModal(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-white" style={{ background: "var(--ap-primary)" }}>Gửi yêu cầu</button>
 </div>
 </div>
 </div>
 )}
 </main>
 </div>
 );
}

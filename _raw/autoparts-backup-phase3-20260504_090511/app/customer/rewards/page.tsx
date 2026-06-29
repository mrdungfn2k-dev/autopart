"use client";
import { useLang, formatPriceLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";





const tiers = [
 { name: "Silver", points: 0, discount: "3%", color: "#8f9294", perks: ["Ưu tiên hỗ trợ", "Miễn phí giao hàng đơn 500k+"] },
 { name: "Gold", points: 5000, discount: "5%", color: "#F59E0B", perks: ["Tất cả ưu đãi Silver", "Flash sale sớm 1 tiếng", "Quà sinh nhật 100k"] },
 { name: "Platinum", points: 15000, discount: "8%", color: "#8B5CF6", perks: ["Tất cả ưu đãi Gold", "Thợ kỹ thuật ưu tiên", "Chiết khấu 8%", "Hotline riêng"] },
 { name: "Diamond", points: 30000, discount: "12%", color: "#06B6D4", perks: ["Tất cả ưu đãi Platinum", "Tham quan kho hàng", "Giá nhập trực tiếp", "Trải nghiệm VIP"] },
];

const currentPoints = 7340;
const currentTier = tiers[1]; // Gold
const nextTier = tiers[2]; // Platinum
const progressToNext = ((currentPoints - 5000) / (15000 - 5000)) * 100;

const transactions = [
 { date: "15/10/2024", desc: "Mua hàng #AP-10284", points: +125, type: "earn" },
 { date: "10/10/2024", desc: "Mua hàng #AP-10216", points: +89, type: "earn" },
 { date: "05/10/2024", desc: "Đổi voucher 50k", points: -500, type: "redeem" },
 { date: "02/10/2024", desc: "Mua hàng #AP-10108", points: +98, type: "earn" },
 { date: "25/09/2024", desc: "Mua hàng #AP-09987", points: +245, type: "earn" },
 { date: "20/09/2024", desc: "Đổi quà sinh nhật", points: -300, type: "redeem" },
];

const redeemableVouchers = [
 { name: "Giảm 50,000đ", points: 500, minOrder: 300000 },
 { name: "Giảm 100,000đ", points: 900, minOrder: 500000 },
 { name: "Miễn phí vận chuyển", points: 300, minOrder: 0 },
 { name: "Giảm 200,000đ", points: 1800, minOrder: 1000000 },
];

export default function CustomerRewardsPage() {
  const { t, fp, lang } = useLang();
 const [activeTab, setActiveTab] = useState<"overview" | "history" | "redeem">("overview");
 const [redeemedVoucher, setRedeemedVoucher] = useState<string | null>(null);
 const [redeemCode, setRedeemCode] = useState<string | null>(null);
 const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

 const handleRedeem = async (voucher: { name: string; points: number; minOrder: number }) => {
   if (isRedeeming) return;
   setIsRedeeming(voucher.name);
   try {
     const code = "AUTO" + Date.now().toString(36).toUpperCase();
     const res = await fetch("/api/vouchers", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         code,
         type: "fixed",
         value: voucher.points === 300 ? 0 : voucher.points <= 500 ? 50000 : voucher.points <= 900 ? 100000 : 200000,
         minOrder: voucher.minOrder,
         description: voucher.name + " (đổi từ " + voucher.points + " điểm)",
         active: true,
         usageLimit: 1,
         expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
       }),
     });
     if (res.ok) {
       setRedeemedVoucher(voucher.name);
       setRedeemCode(code);
     }
   } catch { alert("Lỗi khi đổi quà"); }
   finally { setIsRedeeming(null); }
 };

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
 <CustomerSidebar active="/customer/rewards" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">Điểm thưởng & Đặc quyền</h1>
 </div>
 <div className="px-6 flex border-t border-[#2f3336]">
 {[["overview", "Tổng quan"], ["history", (lang === "zh" ? "积分记录" : "Lịch sử điểm")], ["redeem", "Đổi quà"]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
 {label}
 </button>
 ))}
 </div>
 </div>

 <div className="p-6">
 {activeTab === "overview" && (
 <div className="space-y-5">
 {/* Points hero */}
 <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--ap-primary), #EA580C)" }}>
 <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30px, -30px)" }} />
 <div className="relative">
 <div className="flex items-start justify-between mb-4">
 <div>
 <p className="text-orange-100 text-sm mb-1">Điểm tích lũy hiện tại</p>
 <p className="text-5xl font-extrabold text-white">{currentPoints.toLocaleString()}</p>
 <p className="text-orange-200 text-sm mt-1">= {fp(Math.floor(currentPoints * 100))} quy đổi</p>
 </div>
 <div className="flex flex-col items-end">
 <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold mb-1">
  {currentTier.name}
 </span>
 <span className="text-orange-200 text-xs">Chiết khấu {currentTier.discount}</span>
 </div>
 </div>

 {/* Progress to next */}
 <div className="bg-white/20 rounded-full h-2.5 mb-2">
 <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progressToNext}%` }} />
 </div>
 <div className="flex justify-between text-xs text-orange-100">
 <span>{currentPoints.toLocaleString()} điểm (Gold)</span>
 <span>Cần {(nextTier.points - currentPoints).toLocaleString()} điểm nữa tới {nextTier.name}</span>
 </div>
 </div>
 </div>

 {/* Tiers */}
 <div>
 <h2 className="font-bold text-[#44494d] mb-3 flex items-center gap-2"> Bậc thành viên</h2>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 {tiers.map(tier => {
 const isCurrent = tier.name === currentTier.name;
 return (
 <div key={tier.name} className={`bg-white rounded-xl border-2 p-4 transition-all ${isCurrent ? "" : "border-[#f0f0f0]"}`} style={isCurrent ? { borderColor: tier.color } : {}}>
 <div className="flex items-center justify-between mb-2">
 <span className="text-2xl"></span>
 {isCurrent && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: tier.color }}>{lang === "zh" ? "当前" : "Hiện tại"}</span>}
 </div>
 <p className="font-bold text-[#44494d] mb-0.5">{tier.name}</p>
 <p className="text-xs text-[#8f9294] mb-2">{tier.points > 0 ? `${tier.points.toLocaleString()}+ điểm` : "Mặc định"}</p>
 <p className="text-sm font-bold mb-2" style={{ color: tier.color }}>CK {tier.discount}</p>
 <ul className="space-y-1">
 {tier.perks.slice(0, 2).map(p => (
 <li key={p} className="text-xs text-[#8f9294] flex items-start gap-1"><span className="text-green-500 mt-0.5">✓</span>{p}</li>
 ))}
 {tier.perks.length / 2 && <li className="text-xs text-[#8f9294]">+{tier.perks.length - 2} ưu đãi khác</li>}
 </ul>
 </div>
 );
 })}
 </div>
 </div>

 {/* How to earn */}
 <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Cách tích điểm</h2>
 <div className="grid md:grid-cols-2 gap-3">
 {[
 { action: (lang === "zh" ? "购物" : "Mua hàng"), earn: "1 điểm / 10,000đ" },
 { action: "Mua hàng OEM", earn: "Nhân 2× điểm", icon: "" },
 { action: "Viết đánh giá", earn: "+30 điểm/đánh giá" },
 { action: "Giới thiệu bạn bè", earn: "+200 điểm/người" },
 { action: "Đăng ký sinh nhật", earn: "+100 điểm" },
 { action: "Mua hàng lần đầu", earn: "+500 điểm (1 lần)" },
 ].map(item => (
 <div key={item.action} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <span className="text-2xl">{item.icon}</span>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{item.action}</p>
 <p className="text-xs font-bold" style={{ color: "var(--ap-primary)" }}>{item.earn}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {activeTab === "history" && (
 <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">{lang === "zh" ? "日期" : "NGÀY"}</th>
 <th className="text-left px-4 py-3">GIAO DỊCH</th>
 <th className="text-right px-4 py-3">ĐIỂM</th>
 </tr>
 </thead>
 <tbody>
 {transactions.map((t, i) => (
 <tr key={i} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 text-[#8f9294] text-sm">{t.date}</td>
 <td className="px-4 py-3 text-[#44494d] text-sm">{t.desc}</td>
 <td className={`px-4 py-3 text-right font-bold ${t.type === "earn" ? "text-green-600" : "text-red-500"}`}>
 {t.type === "earn" ? "+" : ""}{t.points}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {activeTab === "redeem" && (
 <div className="grid md:grid-cols-2 gap-4">
 {redeemableVouchers.map(v => {
 const canRedeem = currentPoints >= v.points;
 const redeemed = redeemedVoucher === v.name;
 return (
 <div key={v.name} className={`bg-white rounded-xl border-2 p-5 transition-all ${canRedeem ? "border-[#f0f0f0] hover:border-orange-200" : "border-[#f0f0f0] opacity-50"}`}>
 <div className="flex items-start justify-between mb-3">
 <div>
 <p className="font-bold text-[#44494d] text-lg">{v.name}</p>
 {v.minOrder / 0 && <p className="text-xs text-[#8f9294]">Đơn tối thiểu {fp(v.minOrder)}</p>}
 </div>
 <div className="text-right">
 <p className="text-2xl font-extrabold" style={{ color: "var(--ap-primary)" }}>{v.points}</p>
 <p className="text-xs text-[#8f9294]">điểm</p>
 </div>
 </div>
 <button
 onClick={() => { if (canRedeem && !redeemed) handleRedeem(v); }}
 disabled={!canRedeem || !!redeemed}
 className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
 style={canRedeem && !redeemed ? { background: "var(--ap-primary)", color: "white" } : { background: "#f8f8fa", color: "#8f9294" }}>
 {redeemed ? "✓ Đã đổi thành công!" : isRedeeming === v.name ? "Đang xử lý..." : canRedeem ? "Đổi ngay" : `Cần thêm ${v.points - currentPoints} điểm`}
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </main>
 </div>
 );
}

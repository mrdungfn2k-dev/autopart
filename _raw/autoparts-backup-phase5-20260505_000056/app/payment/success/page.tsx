"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
export default function PaymentSuccessPage() {
  const { t, fp, lang } = useLang();
 return (
 <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #F0FDF4, #DCFCE7, #F8FAFC)" }}>
 <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
 {/* Success icon */}
 <div className="relative mx-auto mb-6 w-24 h-24">
 <div className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: "#22C55E" }} />
 <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}>
 ✓
 </div>
 </div>

 <h1 className="text-2xl font-extrabold text-[#44494d] mb-2">Đặt hàng thành công! </h1>
 <p className="text-[#8f9294] text-sm mb-6">Cảm ơn bạn đã tin tưởng AutoParts. Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>

 {/* Order summary box */}
 <div className="rounded-2xl p-4 text-left mb-6" style={{ background: "#F0FDF4" }}>
 <div className="flex justify-between text-sm mb-2">
 <span className="text-[#8f9294]">{lang === "zh" ? "订单号" : "Mã đơn hàng"}</span>
 <span className="font-mono font-bold text-[#44494d]">APH-20241016-0042</span>
 </div>
 <div className="flex justify-between text-sm mb-2">
 <span className="text-[#8f9294]">Phương thức TT</span>
 <span className="font-semibold text-[#44494d]">VNPay (ATM)</span>
 </div>
 <div className="flex justify-between text-sm mb-2">
 <span className="text-[#8f9294]">{lang === "zh" ? "合计" : "Tổng thanh toán"}</span>
 <span className="font-bold text-green-700">1.950.000đ</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-[#8f9294]">Dự kiến giao hàng</span>
 <span className="font-semibold text-[#44494d]">17 – 19/10/2024</span>
 </div>
 </div>

 {/* Steps ahead */}
 <div className="text-left mb-6 space-y-2">
 {[
 ["1", "NCC đang đóng gói đơn hàng", "~2 giờ"],
 ["2", "Bàn giao cho GHN Express", (lang === "zh" ? "今天" : "Hôm nay")],
 ["3", "Giao đến địa chỉ của bạn", "17-19/10"],
 ].map(([icon, step, time]) => (
 <div key={step} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "#f8f8fa" }}>
 <span className="w-7 h-7 rounded-full bg-orange-100 text-[#1a4b97] text-xs font-bold flex items-center justify-center">{icon}</span>
 <p className="flex-1 text-sm text-slate-600">{step}</p>
 <p className="text-xs font-bold text-[#8f9294]">{time}</p>
 </div>
 ))}
 </div>

 {/* Points earned */}
 <div className="p-3 rounded-xl mb-5 flex items-center gap-3" style={{ background: "#FFF7ED" }}>
 <span className="text-xl font-bold text-[#1a4b97]">*</span>
 <div className="text-left">
 <p className="font-bold text-orange-700 text-sm">Bạn vừa tích +195 điểm thưởng!</p>
 <p className="text-xs text-[#1a4b97]">Tổng điểm: 3,045 điểm • Tier Gold</p>
 </div>
 </div>

 <div className="flex gap-3">
 <Link href="/tracking" className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: "var(--ap-primary)" }}>
 Theo dõi đơn
 </Link>
 <Link href="/" className="flex-1 py-3 rounded-xl font-bold border-2 border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa] flex items-center justify-center gap-2">
 Trang chủ
 </Link>
 </div>
 <Link href="/products" className="block mt-3 text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>
 Tiếp tục mua sắm
 </Link>
 </div>
 </div>
 );
}

"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
export default function PaymentFailPage() {
  const { t, fp, lang } = useLang();
 return (
 <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg, #FEF2F2, #FECACA, #F8FAFC)" }}>
 <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
 {/* Fail icon */}
 <div className="mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}>
 ✕
 </div>

 <h1 className="text-2xl font-extrabold text-[#44494d] mb-2">{t("paymentFail")}</h1>
 <p className="text-[#8f9294] text-sm mb-6">Giao dịch không được hoàn tất. Đơn hàng của bạn vẫn đang chờ. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>

 {/* Error detail */}
 <div className="rounded-2xl p-4 text-left mb-6" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
 <div className="flex justify-between text-sm mb-2">
 <span className="text-[#8f9294]">{lang === "zh" ? "订单号" : "Mã đơn hàng"}</span>
 <span className="font-mono text-slate-600">APH-20241016-0042</span>
 </div>
 <div className="flex justify-between text-sm mb-2">
 <span className="text-[#8f9294]">Lý do</span>
 <span className="font-semibold text-red-600">Thẻ bị từ chối (Insufficient Funds)</span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-[#8f9294]">Thời gian</span>
 <span className="text-slate-600">16/10/2024 14:32:07</span>
 </div>
 </div>

 {/* Alternative payment methods */}
 <p className="text-sm font-semibold text-slate-600 mb-3">Phương thức thanh toán khác:</p>
 <div className="grid grid-cols-2 gap-2 mb-6">
 {[
 { name: (lang === "zh" ? "VNPay QR" : "VNPay QR") },
 { name: (lang === "zh" ? "MoMo" : "MoMo") },
 { name: "COD (Tiền mặt)" },
 { name: "Chuyển khoản" },
 ].map(m => (
 <button key={m.name} className="p-3 rounded-xl border-2 border-[#f0f0f0] hover:border-[#1a4b97] text-sm font-semibold text-slate-600 hover:text-[#1a4b97] transition-all">
  {m.name}
 </button>
 ))}
 </div>

 <div className="flex gap-3">
 <Link href="/checkout" className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: "var(--ap-primary)" }}>
 Thanh toán lại
 </Link>
 <Link href="/" className="flex-1 py-3 rounded-xl font-bold border-2 border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa] flex items-center justify-center gap-2">
 Trang chủ
 </Link>
 </div>
 <a href="tel:19001234" className="mt-3 flex items-center justify-center gap-1 text-sm text-[#8f9294] hover:text-slate-600">
 Hotline hỗ trợ: 1900 1234
 </a>
 </div>
 </div>
 );
}

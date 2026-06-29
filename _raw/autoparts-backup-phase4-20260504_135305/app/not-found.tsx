import Link from "next/link";

export default function NotFoundPage() {
 return (
 <div
 className="min-h-screen flex flex-col items-center justify-center text-center p-8"
 style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}
 >
 {/* Animated car */}
 <div className="relative mb-8">
 <div className="text-9xl select-none" style={{ filter: "drop-shadow(0 0 30px rgba(249,115,22,0.4))" }}>404</div>
 <div
 className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full blur-xl opacity-40"
 style={{ background: "var(--ap-primary)" }}
 />
 </div>

 {/* Error code */}
 <div className="relative mb-4">
 <p
 className="text-[120px] font-extrabold leading-none select-none"
 style={{
 background: "linear-gradient(135deg, #fe0035, #EA580C)",
 WebkitBackgroundClip: "text",
 WebkitTextFillColor: "transparent",
 }}
 >
 404
 </p>
 <p className="absolute inset-0 flex items-center justify-center text-[120px] font-extrabold text-white/5 select-none blur-sm leading-none">
 404
 </p>
 </div>

 <h1 className="text-2xl font-bold text-white mb-2">Ồ! Phụ tùng này không tìm thấy</h1>
 <p className="text-[#8f9294] mb-8 max-w-sm">
 Trang bạn tìm kiếm có thể đã bị xóa, di chuyển, hoặc URL bị sai. Hãy quay lại trang chủ để tiếp tục mua sắm!
 </p>

 <div className="flex flex-col sm:flex-row gap-3">
 <Link
 href="/"
 className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30"
 style={{ background: "var(--ap-primary)" }}
 >
 Về trang chủ
 </Link>
 <Link
 href="/products"
 className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 border-slate-600 text-slate-300 hover:border-[#1a4b97] hover:text-white transition-all"
 >
 Tìm phụ tùng
 </Link>
 </div>

 {/* Quick links */}
 <div className="mt-10 flex flex-wrap gap-2 justify-center">
 {[
 ["Đăng nhập", "/login"],
 ["Giỏ hàng", "/cart"],
 ["Customer", "/customer"],
 ["Supplier", "/supplier"],
 ["Admin", "/admin"],
 ].map(([label, href]) => (
 <Link
 key={href}
 href={href}
 className="px-3 py-1.5 rounded-lg border border-slate-700 text-[#8f9294] text-sm hover:border-[#1a4b97] hover:text-[#1a4b97] transition-colors"
 >
 {label}
 </Link>
 ))}
 </div>
 </div>
 );
}


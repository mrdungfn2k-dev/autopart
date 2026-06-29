"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

const features = [
 { title: "Hàng chính hãng 100%", desc: "Tất cả phụ tùng đều qua kiểm định chất lượng, có mã QR truy xuất nguồn gốc và chứng nhận OEM/OES từ nhà sản xuất.", color: "#22C55E" },
 { title: "Tìm phụ tùng theo xe", desc: "Tra cứu phụ tùng tương thích theo VIN, hãng xe, đời xe. Không lo nhầm hàng, không lo mua thiếu.", color: "var(--ap-primary)" },
 { title: "Hệ sinh thái 5 vai trò", desc: "Kết nối khách hàng, nhà cung cấp, đại lý CTV, thợ kỹ thuật và quản trị trong một nền tảng thống nhất.", color: "var(--ap-primary)" },
 { title: "Bảo hành 12-24 tháng", desc: "Bảo hành sản phẩm theo chính sách nhà sản xuất. Track trực tuyến, claim dễ dàng qua app.", color: "#8B5CF6" },
 { title: "Chương trình Affiliate", desc: "Kiếm hoa hồng 10% trực tiếp + 5% thụ động từ đội nhóm CTV. Thanh toán 2 lần/tháng, không giới hạn.", color: "#EF4444" },
 { title: "Tích điểm & Nâng bậc", desc: "Silver > Gold > Platinum -> Diamond. Chiết khấu tăng dần từ 3% đến 12% theo bậc thành viên.", color: "#F59E0B" },
];

const team = [
 { name: "Nguyễn Minh Trí", role: "CEO & Co-founder", desc: "10 năm kinh nghiệm ngành phụ tùng ô tô", emoji: "" },
 { name: "Trần Thị Phương", role: "CTO", desc: "Ex-VNG, chuyên gia nền tảng TMĐT B2B", emoji: "" },
 { name: "Lê Văn Đức", role: "COO", desc: "Vận hành chuỗi cung ứng 8 tỉnh thành", emoji: "" },
];

export default function AboutPage() {
  const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===
  const stats = [
   { value: "12,000+", label: "Phụ tùng OEM, OES" },
   { value: "500+", label: "Nhà cung cấp uy tín" },
   { value: "2-4 ngày", label: "Giao hàng toàn quốc" },
   { value: "4.8 ", label: (lang === "zh" ? "平均评分" : "Đánh giá trung bình") },
  ];

 return (
 <div className="min-h-screen bg-white">
 <StorefrontHeader />

 {/* Hero */}
 <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, var(--ap-primary) 200%)" }}>
 <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, var(--ap-primary) 0%, transparent 50%)" }} />
 <div className="max-w-5xl mx-auto px-6 py-20 relative text-center">
 <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6 text-orange-300 border border-[#1a4b97]/30">
 Nền tảng phụ tùng ô tô số 1 Việt Nam
 </span>
 <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
 Về <span style={{ color: "var(--ap-primary)" }}>AutoParts</span>
 </h1>
 <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
 Chúng tôi xây dựng hệ sinh thái phụ tùng ô tô minh bạch nhất Việt Nam — kết nối nhà cung cấp, thợ kỹ thuật và người dùng xe trong một nền tảng số thống nhất.
 </p>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
 {stats.map(s => (
 <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
 <p className="text-2xl font-extrabold text-white">{s.value}</p>
 <p className="text-xs text-[#8f9294] mt-1">{s.label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Mission */}
 <div className="max-w-5xl mx-auto px-6 py-16">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-extrabold text-[#44494d] mb-4">Sứ mệnh của chúng tôi</h2>
 <p className="text-[#8f9294] max-w-2xl mx-auto">
 Xóa bỏ rào cản giữa phụ tùng chính hãng và người dùng xe tại Việt Nam. Mọi chủ xe, dù ở thành phố hay vùng xa, đều có thể tiếp cận phụ tùng đúng, đủ, giá hợp lý.
 </p>
 </div>

 {/* Features */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
 {features.map(f => (
 <div key={f.title} className="p-5 rounded-2xl border border-[#f0f0f0] hover:shadow-md transition-all">
  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: `${f.color}15` }}>
  <div className="w-5 h-5 rounded-full" style={{ background: f.color }} />
 </div>
 <h3 className="font-bold text-[#44494d] mb-2">{f.title}</h3>
 <p className="text-[#8f9294] text-sm">{f.desc}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Team */}
 <div style={{ background: "#f8f8fa" }}>
 <div className="max-w-5xl mx-auto px-6 py-16">
 <h2 className="text-3xl font-extrabold text-[#44494d] text-center mb-10">Đội ngũ sáng lập</h2>
 <div className="grid md:grid-cols-3 gap-6">
 {team.map(m => (
 <div key={m.name} className="bg-white rounded-2xl border border-[#f0f0f0] p-6 text-center hover:shadow-md transition-all">
 <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl mx-auto mb-4" style={{ background: "#FFF7ED" }}>{m.emoji}</div>
 <h3 className="font-bold text-[#44494d] mb-0.5">{m.name}</h3>
 <p className="text-sm font-semibold mb-2" style={{ color: "var(--ap-primary)" }}>{m.role}</p>
 <p className="text-xs text-[#8f9294]">{m.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Milestones */}
 <div className="max-w-5xl mx-auto px-6 py-16">
 <h2 className="text-3xl font-extrabold text-[#44494d] text-center mb-10">Hành trình phát triển</h2>
 <div className="relative">
 <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#f4f4f4] -translate-x-1/2 hidden md:block" />
 <div className="space-y-8">
 {[
 { year: "2022", title: "Thành lập", desc: "Ra mắt phiên bản đầu tiên với 50 nhà cung cấp và 2,000 sản phẩm tại TP.HCM." },
 { year: "2023", title: "Mở rộng toàn quốc", desc: "Phủ sóng 63 tỉnh thành, đạt 10,000 sản phẩm. Ra mắt Portal Thợ Pro và Affiliate." },
 { year: "2024", title: "Hệ sinh thái hoàn chỉnh", desc: "12,000+ sản phẩm, 500+ NCC, 2,000+ Thợ Pro. GMV đạt 100 tỷ/tháng." },
 ].map((m, i) => (
 <div key={m.year} className={`flex gap-6 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
 <div className="flex-1 bg-white rounded-2xl border border-[#f0f0f0] p-5 hover:shadow-md transition-all">
 <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 text-white" style={{ background: "var(--ap-primary)" }}>{m.year}</span>
 <h3 className="font-bold text-[#44494d] mb-1">{m.title}</h3>
 <p className="text-sm text-[#8f9294]">{m.desc}</p>
 </div>
 <div className="hidden md:flex items-center justify-center w-10 shrink-0">
 <div className="w-4 h-4 rounded-full border-4 border-[#1a4b97] bg-white" />
 </div>
 <div className="flex-1 hidden md:block" />
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* CTA */}
 <div className="text-center py-14 px-6" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
 <h2 className="text-3xl font-extrabold text-white mb-4">Tham gia hệ sinh thái AutoParts</h2>
 <p className="text-[#8f9294] mb-8 max-w-xl mx-auto">Dù bạn là chủ xe, thợ kỹ thuật, nhà cung cấp hay đại lý — chúng tôi đều có portal phù hợp cho bạn.</p>
 <div className="flex gap-4 justify-center flex-wrap">
 <Link href="/register" className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: "var(--ap-primary)" }}>Đăng ký ngay</Link>
 <Link href="/products" className="px-6 py-3 rounded-xl font-bold border-2 border-slate-600 text-slate-300 hover:border-[#1a4b97] hover:text-white transition-colors">Khám phá sản phẩm</Link>
 </div>
 </div>
 <StorefrontFooter />
 </div>
 );
}

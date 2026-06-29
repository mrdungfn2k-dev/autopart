"use client";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";




type ToggleProps = { checked: boolean; onChange: () => void };
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div onClick={onChange} className="relative rounded-full cursor-pointer transition-colors shrink-0" style={{ width: '44px', minWidth: '44px', height: '24px', background: checked ? 'var(--ap-primary)' : '#CBD5E1' }}>
      <div className="absolute top-[2px] bg-white rounded-full shadow transition-all" style={{ width: '20px', height: '20px', left: checked ? '22px' : '2px' }} />
    </div>
  );
}

export default function CustomerSettingsPage() {
  const { t, fp, lang } = useLang();
 const [saved, setSaved] = useState(false);
 const [notifs, setNotifs] = useState({ orderUpdate: true, promo: false, newProduct: true, reward: true, email: true, sms: false, push: true });
 const [privacy, setPrivacy] = useState({ shareProfile: false, recommendations: true, analytics: true });

 const handleSave = () => {
 setSaved(true);
 setTimeout(() => setSaved(false), 2500);
 };

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
 <CustomerSidebar active="/customer/settings" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">{lang === "zh" ? "账户设置" : "Cài đặt tài khoản"}</h1>
 <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "text-white"}`} style={saved  ? {} : { background: "var(--ap-primary)" }}>
 {saved ? <>{lang === "zh" ? "✓ 已保存！" : "✓ Đã lưu!"}</> : "Lưu cài đặt"}
 </button>
 </div>
 </div>

 <div className="p-6 max-w-2xl space-y-5">
 {/* Notifications */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Thông báo</h2>
 <div className="space-y-4">
 <div>
 <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">Loại thông báo</p>
 {[
 ["orderUpdate", "Cập nhật đơn hàng", "Mỗi khi trạng thái đơn hàng thay đổi"],
 ["promo", "Khuyến mại & Flash Sale", "Thông báo khi có ưu đãi mới"],
 ["newProduct", "Sản phẩm mới phù hợp xe của tôi", "Dựa trên xe trong gara của bạn"],
 ["reward", "Điểm thưởng & Tier", "Khi tích điểm, lên bậc hoặc điểm sắp hết hạn"],
 ].map(([key, label, desc]) => (
 <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key as keyof typeof notifs] }))} />
 </div>
 ))}
 </div>
 <div>
 <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">Kênh thông báo</p>
 {[
 ["email", "Email"],
 ["sms", "SMS"],
 ["push", "Thông báo đẩy"],
 ].map(([key, label]) => (
 <div key={key} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
 <p className="font-medium text-[#44494d] text-sm">{label}</p>
 <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key as keyof typeof notifs] }))} />
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Privacy */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Quyền riêng tư</h2>
 <div className="space-y-0">
 {[
 ["shareProfile", "Chia sẻ hồ sơ với thợ kỹ thuật", "Cho phép thợ xem lịch sử phụ tùng của xe bạn"],
 ["recommendations", "Gợi ý sản phẩm cá nhân hoá", "Dựa trên lịch sử mua hàng và xe của bạn"],
 ["analytics", "Phân tích hành vi sử dụng", "Giúp chúng tôi cải thiện trải nghiệm"],
 ].map(([key, label, desc]) => (
 <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 <Toggle checked={privacy[key as keyof typeof privacy]} onChange={() => setPrivacy(p => ({ ...p, [key]: !p[key as keyof typeof privacy] }))} />
 </div>
 ))}
 </div>
 </div>

 {/* Language & Region */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Ngôn ngữ & Khu vực</h2>
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("settingLanguage")}</label>
 <select value={lang} onChange={e => { document.cookie = `lang=${e.target.value}; path=/`; window.location.reload(); }} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]">
 <option value="vi">Tiếng Việt</option>
 <option value="en">English</option>
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Đơn vị tiền tệ</label>
 <select className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
 <option>VNĐ (₫)</option>
 </select>
 </div>
 </div>
 </div>

 {/* GDPR — Data export */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
   <h2 className="font-bold text-[#44494d] mb-2">{lang === "zh" ? "个人数据导出 (GDPR)" : "Dữ liệu cá nhân (GDPR)"}</h2>
   <p className="text-sm text-[#8f9294] mb-4">{lang === "zh" ? "下载您账户中的所有数据：个人信息、订单、车库、评价、退货、订阅。" : "Tải về toàn bộ dữ liệu chúng tôi đang lưu về bạn: hồ sơ, đơn hàng, gara, đánh giá, đổi trả, đăng ký bản tin."}</p>
   <a href="/api/auth/me/export" download className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: "var(--ap-primary)" }}>
     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
     {lang === "zh" ? "下载我的数据 (JSON)" : "Tải dữ liệu của tôi (JSON)"}
   </a>
 </div>

 {/* Danger zone */}
 <div className="bg-white rounded-2xl border border-red-100 p-5">
 <h2 className="font-bold text-red-600 mb-4 flex items-center gap-2"> Vùng nguy hiểm</h2>
 <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#FEF2F2" }}>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{t("deleteAccount")}</p>
 <p className="text-xs text-[#8f9294]">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu</p>
 </div>
 <button className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#EF4444" }}>{t("deleteAccount")}</button>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

"use client";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import AffiliateSidebar from "@/components/AffiliateSidebar";




type ToggleProps = { checked: boolean; onChange: () => void };
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div onClick={onChange} className="relative rounded-full cursor-pointer transition-colors shrink-0" style={{ width: '44px', minWidth: '44px', height: '24px', background: checked ? 'var(--ap-primary)' : '#CBD5E1' }}>
      <div className="absolute top-[2px] bg-white rounded-full shadow transition-all" style={{ width: '20px', height: '20px', left: checked ? '22px' : '2px' }} />
    </div>
  );
}

export default function AffiliateSettingsPage() {
  const { t, fp, lang } = useLang();
 const [saved, setSaved] = useState(false);
 const [profile, setProfile] = useState({ name: "Lê Văn Partner", email: "le.partner@gmail.com", phone: "0901234567", bio: "Chuyên gia phụ tùng ô tô khu vực TP.HCM. 3 năm kinh nghiệm tư vấn.", channel: "facebook" });
 const [notifs, setNotifs] = useState({ newCommission: true, teamActivity: true, payoutComplete: true, newPromo: false, weeklyReport: true });
 const [privacy, setPrivacy] = useState({ showInDirectory: true, shareEarnings: false });
 const [autoWithdraw, setAutoWithdraw] = useState(true);
 const [withdrawBank, setWithdrawBank] = useState("vietcombank");
 const [payPeriod, setPayPeriod] = useState("biweekly");

 const handleSave = () => {
 setSaved(true);
 setTimeout(() => setSaved(false), 2500);
 };

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <AffiliateSidebar active="/affiliate/settings" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "账户设置" : "Cài đặt tài khoản"}</h1>
 <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${saved ? "bg-green-500 text-white" : "text-white"}`} style={saved  ? {} : { background: "var(--ap-primary)" }}>
 {saved ? <>{lang === "zh" ? "✓ 已保存！" : "✓ Đã lưu!"}</> : "Lưu cài đặt"}
 </button>
 </div>
 </div>

 <div className="p-6 max-w-5xl space-y-5">
 {/* Profile */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{t("personalInfo")}</h2>
 <div className="grid md:grid-cols-2 gap-4">
 {[[(lang === "zh" ? "姓名" : "Họ và tên"), "name", "text"], ["Email", "email", "email"], [(lang === "zh" ? "电话号码" : "Số điện thoại"), "phone", "tel"]].map(([label, key, type]) => (
 <div key={key}>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{label}</label>
 <input type={type} value={profile[key as keyof typeof profile]} onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 ))}
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Kênh phân phối chính</label>
 <select value={profile.channel} onChange={e => setProfile(p => ({ ...p, channel: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
 {[["facebook", "Facebook / Fanpage"], ["tiktok", "TikTok Shop"], ["zalo", "Zalo OA"], ["youtube", "YouTube"], ["offline", "Cửa hàng offline"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
 </select>
 </div>
 <div className="md:col-span-2">
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Giới thiệu bản thân</label>
 <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm resize-none focus:outline-none focus:border-[#1a4b97]" />
 </div>
 </div>
 </div>

 {/* Payout config */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Cài đặt thanh toán</h2>

 <div className="flex items-center justify-between py-3 border-b border-slate-50">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">Rút tiền tự động theo kỳ</p>
 <p className="text-xs text-[#8f9294]">Hệ thống tự giải ngân định kỳ về tài khoản mặc định</p>
 </div>
 <Toggle checked={autoWithdraw} onChange={() => setAutoWithdraw(!autoWithdraw)} />
 </div>

 {autoWithdraw && (
 <>
 <div className="pt-3 pb-2">
 <label className="text-sm font-semibold text-slate-600 mb-2 block">Chu kỳ giải ngân</label>
 <div className="flex gap-2">
 {[["biweekly", "2 lần/tháng"], ["monthly", "1 lần/tháng"]].map(([v, l]) => (
 <button key={v} onClick={() => setPayPeriod(v)}
 className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${payPeriod === v ? "text-white border-transparent" : "border-[#e5e5e5] text-slate-600"}`}
 style={payPeriod === v ? { background: "var(--ap-primary)" } : {}}>
 {l}
 </button>
 ))}
 </div>
 </div>

 <div className="pt-2">
 <label className="text-sm font-semibold text-slate-600 mb-2 block">Tài khoản nhận mặc định</label>
 <div className="space-y-2">
 {[["vietcombank", "Vietcombank — ***6789"], ["techcombank", "Techcombank — ***3456"], ["momo", "MoMo — 0901234567"]].map(([v, l]) => (
 <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${withdrawBank === v ? "border-[#1a4b97]" : "border-[#e5e5e5]"}`}
 style={withdrawBank === v ? { background: "#FFF7ED" } : {}}>
 <input type="radio" name="bank" value={v} checked={withdrawBank === v} onChange={() => setWithdrawBank(v)} className="accent-orange-500" />
 <span className="font-semibold text-[#44494d] text-sm">{l}</span>
 </label>
 ))}
 </div>
 </div>
 </>
 )}
 </div>

 {/* Notifications */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Thông báo</h2>
 <div className="space-y-0">
 {[
 ["newCommission", "Hoa hồng mới được ghi nhận", "Mỗi khi có đơn hàng tạo hoa hồng"],
 ["teamActivity", "Hoạt động đội nhóm", "Khi CTV cấp dưới có đơn hàng mới"],
 ["payoutComplete", "Chuyển tiền thành công", "Khi giải ngân hoàn tất"],
 ["newPromo", "Chương trình khuyến mại mới", "Flash sale & sản phẩm hot"],
 ["weeklyReport", "Báo cáo tuần qua email", "Tổng kết hiệu suất mỗi thứ Hai"],
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
 </div>

 {/* Privacy */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Hiển thị & Quyền riêng tư</h2>
 <div className="space-y-0">
 {[
 ["showInDirectory", "Hiển thị trong thư mục đại lý", "Khách hàng có thể tìm thấy hồ sơ của bạn"],
 ["shareEarnings", "Chia sẻ thu nhập công khai", "CTV khác thấy doanh thu của bạn (motivate team)"],
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
 </div>
 </main>
 </div>
 );
}

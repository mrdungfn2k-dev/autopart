"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";
import { confirmDialog } from "@/components/ConfirmDialog";




type ToggleProps = { checked: boolean; onChange: () => void };
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div onClick={onChange} className="relative rounded-full cursor-pointer transition-colors shrink-0" style={{ width: '44px', minWidth: '44px', height: '24px', background: checked ? 'var(--ap-primary)' : '#CBD5E1' }}>
      <div className="absolute top-[2px] bg-white rounded-full shadow transition-all" style={{ width: '20px', height: '20px', left: checked ? '22px' : '2px' }} />
    </div>);
}

export default function CustomerSettingsPage() {
  const { t, fp, lang, setLang } = useLang();
 const [saved, setSaved] = useState(false);
 const [notifs, setNotifs] = useState({ orderUpdate: true, promo: false, newProduct: true, reward: true, email: true, sms: false, push: true });
 const [privacy, setPrivacy] = useState({ shareProfile: false, recommendations: true, analytics: true });

 // Nạp cài đặt đã lưu
 useEffect(() => {
   try {
     const s = JSON.parse(localStorage.getItem("ap_user_settings") || "null");
     if (s?.notifs) setNotifs(n => ({ ...n, ...s.notifs }));
     if (s?.privacy) setPrivacy(p => ({ ...p, ...s.privacy }));
   } catch {}
 }, []);

 const handleSave = () => {
 try { localStorage.setItem("ap_user_settings", JSON.stringify({ notifs, privacy })); } catch {}
 setSaved(true);
 window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Đã lưu cài đặt tài khoản", type: "success" } }));
 setTimeout(() => setSaved(false), 2500);
 };

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">{lang === "zh" ? "账户设置" : lang === "en" ? "Account Settings" : "Cài đặt tài khoản"}</h1>
 <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "text-white"}`} style={saved  ? {} : { background: "var(--ap-primary)" }}>{saved ? <>{lang === "zh" ? "✓ 已保存！" : lang === "en" ? "✓ Saved!" : "✓ Đã lưu!"}</> : (lang === "zh" ? "保存设置" : lang === "en" ? "Save settings" : "Lưu cài đặt")}
 </button>
 </div>
 </div>

 <div className="p-6 space-y-5">{/* Notifications */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2">{lang === "zh" ? "通知" : lang === "en" ? "Notifications" : "Thông báo"}</h2>
 <div className="space-y-4">
 <div>
 <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">{lang === "zh" ? "通知类型" : lang === "en" ? "Notification types" : "Loại thông báo"}</p>{[
 ["orderUpdate", (lang === "zh" ? "订单更新" : lang === "en" ? "Order updates" : "Cập nhật đơn hàng"), (lang === "zh" ? "每当订单状态变化时" : lang === "en" ? "Whenever order status changes" : "Mỗi khi trạng thái đơn hàng thay đổi")],
 ["promo", (lang === "zh" ? "促销 & 限时抢购" : lang === "en" ? "Promotions & Flash Sale" : "Khuyến mại & Flash Sale"), (lang === "zh" ? "有新优惠时通知" : lang === "en" ? "Notify on new deals" : "Thông báo khi có ưu đãi mới")],
 ["newProduct", (lang === "zh" ? "适合我车的新产品" : lang === "en" ? "New products for my vehicle" : "Sản phẩm mới phù hợp xe của tôi"), (lang === "zh" ? "基于您车库中的车辆" : lang === "en" ? "Based on vehicles in your garage" : "Dựa trên xe trong gara của bạn")],
 ["reward", (lang === "zh" ? "积分 & 等级" : lang === "en" ? "Reward points & Tier" : "Điểm thưởng & Tier"), (lang === "zh" ? "积分、升级或积分即将到期时" : lang === "en" ? "Earning points, leveling up, or points expiring" : "Khi tích điểm, lên bậc hoặc điểm sắp hết hạn")],
 ].map(([key, label, desc]) => (
 <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key as keyof typeof notifs] }))} />
 </div>))}
 </div>
 <div>
 <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">{lang === "zh" ? "通知渠道" : lang === "en" ? "Notification channels" : "Kênh thông báo"}</p>{[
 ["email", "Email"],
 ["sms", "SMS"],
 ["push", (lang === "zh" ? "推送通知" : lang === "en" ? "Push notifications" : "Thông báo đẩy")],
 ].map(([key, label]) => (
 <div key={key} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
 <p className="font-medium text-[#44494d] text-sm">{label}</p>
 <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key as keyof typeof notifs] }))} />
 </div>))}
 </div>
 </div>
 </div>{/* Privacy */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2">{lang === "zh" ? "隐私" : lang === "en" ? "Privacy" : "Quyền riêng tư"}</h2>
 <div className="space-y-0">{[
 ["shareProfile", (lang === "zh" ? "与技师共享资料" : lang === "en" ? "Share profile with technicians" : "Chia sẻ hồ sơ với thợ kỹ thuật"), (lang === "zh" ? "允许技师查看您车辆的配件历史" : lang === "en" ? "Let technicians view your vehicle's parts history" : "Cho phép thợ xem lịch sử phụ tùng của xe bạn")],
 ["recommendations", (lang === "zh" ? "个性化产品推荐" : lang === "en" ? "Personalized product suggestions" : "Gợi ý sản phẩm cá nhân hoá"), (lang === "zh" ? "基于您的购买历史和车辆" : lang === "en" ? "Based on your purchase history and vehicles" : "Dựa trên lịch sử mua hàng và xe của bạn")],
 ["analytics", (lang === "zh" ? "使用行为分析" : lang === "en" ? "Usage behavior analytics" : "Phân tích hành vi sử dụng"), (lang === "zh" ? "帮助我们改善体验" : lang === "en" ? "Help us improve the experience" : "Giúp chúng tôi cải thiện trải nghiệm")],
 ].map(([key, label, desc]) => (
 <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 <Toggle checked={privacy[key as keyof typeof privacy]} onChange={() => setPrivacy(p => ({ ...p, [key]: !p[key as keyof typeof privacy] }))} />
 </div>))}
 </div>
 </div>{/* Language & Region */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2">{lang === "zh" ? "语言 & 地区" : lang === "en" ? "Language & Region" : "Ngôn ngữ & Khu vực"}</h2>
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("settingLanguage")}</label>
 <select value={lang} onChange={e => { setLang(e.target.value as any); window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: e.target.value === "zh" ? "已切换语言" : e.target.value === "en" ? "Language changed" : "Đã đổi ngôn ngữ", type: "success" } })); }} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]">
 <option value="vi">Tiếng Việt</option>
 <option value="en">English</option>
 <option value="zh">中文</option>
 </select>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{lang === "zh" ? "货币单位" : lang === "en" ? "Currency" : "Đơn vị tiền tệ"}</label>
 <input readOnly value={lang === "zh" ? "人民币 (¥)" : lang === "en" ? "USD ($)" : "VNĐ (₫)"} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm bg-[#f8f8fa] text-[#8f9294]" />
 <p className="text-xs text-[#8f9294] mt-1">{lang === "zh" ? "货币随语言自动切换" : lang === "en" ? "Currency follows the selected language" : "Tiền tệ tự đổi theo ngôn ngữ"}</p>
 </div>
 </div>
 </div>{/* GDPR — Data export */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
   <h2 className="font-bold text-[#44494d] mb-2">{lang === "zh" ? "个人数据导出 (GDPR)" : "Dữ liệu cá nhân (GDPR)"}</h2>
   <p className="text-sm text-[#8f9294] mb-4">{lang === "zh" ? "下载您账户中的所有数据：个人信息、订单、车库、评价、退货、订阅。" : "Tải về toàn bộ dữ liệu chúng tôi đang lưu về bạn: hồ sơ, đơn hàng, gara, đánh giá, đổi trả, đăng ký bản tin."}</p>
   <a href="/api/auth/me/export" download className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: "var(--ap-primary)" }}>
     <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>{lang === "zh" ? "下载我的数据 (JSON)" : "Tải dữ liệu của tôi (JSON)"}
   </a>
 </div>{/* Danger zone */}
 <div className="bg-white rounded-2xl border border-red-100 p-5">
 <h2 className="font-bold text-red-600 mb-4 flex items-center gap-2">{lang === "zh" ? "危险区域" : lang === "en" ? "Danger zone" : "Vùng nguy hiểm"}</h2>
 <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#FEF2F2" }}>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{t("deleteAccount")}</p>
 <p className="text-xs text-[#8f9294]">{lang === "zh" ? "永久删除账户及所有数据" : lang === "en" ? "Permanently delete account and all data" : "Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu"}</p>
 </div>
 <button onClick={async () => {
   const ok = await confirmDialog(lang === "zh" ? "确定永久删除账户及所有数据吗？此操作无法撤销。" : lang === "en" ? "Permanently delete your account and all data? This cannot be undone." : "Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu? Hành động này KHÔNG thể hoàn tác.");
   if (!ok) return;
   window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "已收到账户删除请求，我们将在48小时内处理。" : lang === "en" ? "Account deletion request received; we'll process it within 48h." : "Đã ghi nhận yêu cầu xóa tài khoản. Chúng tôi sẽ xử lý trong vòng 48h.", type: "info" } }));
 }} className="px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90" style={{ background: "#EF4444" }}>{t("deleteAccount")}</button>
 </div>
 </div>
 </div>
 </main>
 </>);
}

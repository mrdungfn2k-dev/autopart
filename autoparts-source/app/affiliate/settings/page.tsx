"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import AffiliateSidebar from "@/components/AffiliateSidebar";

const KEY = "ap_affiliate_settings";

type ToggleProps = { checked: boolean; onChange: () => void };
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div onClick={onChange} className="relative rounded-full cursor-pointer transition-colors shrink-0" style={{ width: '44px', minWidth: '44px', height: '24px', background: checked ? 'var(--ap-primary)' : '#CBD5E1' }}>
      <div className="absolute top-[2px] bg-white rounded-full shadow transition-all" style={{ width: '20px', height: '20px', left: checked ? '22px' : '2px' }} />
    </div>);
}

export default function AffiliateSettingsPage() {
  const { t, lang } = useLang();
  const zh = lang === "zh";
 const [saved, setSaved] = useState(false);
 const [notifs, setNotifs] = useState({ newCommission: true, teamActivity: true, payoutComplete: true, newPromo: false, weeklyReport: true });
 const [privacy, setPrivacy] = useState({ showInDirectory: true, shareEarnings: false });
 const [autoWithdraw, setAutoWithdraw] = useState(true);
 const [withdrawBank, setWithdrawBank] = useState("vietcombank");
 const [payPeriod, setPayPeriod] = useState("biweekly");

 // Nạp cài đặt đã lưu — giữ nguyên sau khi tải lại / đổi tab. (Thông tin cá nhân nay ở trang Hồ sơ.)
 useEffect(() => {
   try {
     const s = JSON.parse(localStorage.getItem(KEY) || "null");
     if (s) {
       if (s.notifs) setNotifs(s.notifs);
       if (s.privacy) setPrivacy(s.privacy);
       if (typeof s.autoWithdraw === "boolean") setAutoWithdraw(s.autoWithdraw);
       if (s.withdrawBank) setWithdrawBank(s.withdrawBank);
       if (s.payPeriod) setPayPeriod(s.payPeriod);
     }
   } catch {}
 }, []);

 const handleSave = () => {
   // Giữ nguyên s.profile (do trang Hồ sơ quản lý) — chỉ cập nhật phần cài đặt
   try {
     const s = JSON.parse(localStorage.getItem(KEY) || "null") || {};
     localStorage.setItem(KEY, JSON.stringify({ ...s, notifs, privacy, autoWithdraw, withdrawBank, payPeriod }));
   } catch {}
   setSaved(true);
   window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: zh ? "已保存设置" : "Đã lưu cài đặt", type: "success" } }));
   setTimeout(() => setSaved(false), 2500);
 };

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{zh ? "账户设置" : "Cài đặt tài khoản"}</h1>
 <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${saved ? "bg-green-500 text-white" : "text-white"}`} style={saved ? {} : { background: "var(--ap-primary)" }}>{saved ? (zh ? "✓ 已保存！" : "✓ Đã lưu!") : t("saveSettings")}
 </button>
 </div>
 </div>

 <div className="p-6 space-y-5">{/* Payout config */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{zh ? "支付设置" : "Cài đặt thanh toán"}</h2>

 <div className="flex items-center justify-between py-3 border-b border-slate-50">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{zh ? "定期自动提现" : "Rút tiền tự động theo kỳ"}</p>
 <p className="text-xs text-[#8f9294]">{zh ? "系统定期自动打款到默认账户" : "Hệ thống tự giải ngân định kỳ về tài khoản mặc định"}</p>
 </div>
 <Toggle checked={autoWithdraw} onChange={() => setAutoWithdraw(!autoWithdraw)} />
 </div>{autoWithdraw && (
 <>
 <div className="pt-3 pb-2">
 <label className="text-sm font-semibold text-slate-600 mb-2 block">{zh ? "打款周期" : "Chu kỳ giải ngân"}</label>
 <div className="flex gap-2">{[["biweekly", zh ? "每月2次" : "2 lần/tháng"], ["monthly", zh ? "每月1次" : "1 lần/tháng"]].map(([v, l]) => (
 <button key={v} onClick={() => setPayPeriod(v)}
 className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${payPeriod === v ? "text-white border-transparent" : "border-[#e5e5e5] text-slate-600"}`}
 style={payPeriod === v ? { background: "var(--ap-primary)" } : {}}>{l}
 </button>))}
 </div>
 </div>

 <div className="pt-2">
 <label className="text-sm font-semibold text-slate-600 mb-2 block">{zh ? "默认收款账户" : "Tài khoản nhận mặc định"}</label>
 <div className="space-y-2">{[["vietcombank", "Vietcombank — ***6789"], ["techcombank", "Techcombank — ***3456"], ["momo", "MoMo — 0901234567"]].map(([v, l]) => (
 <label key={v} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${withdrawBank === v ? "border-[#1a4b97]" : "border-[#e5e5e5]"}`}
 style={withdrawBank === v ? { background: "#EFF4FB" } : {}}>
 <input type="radio" name="bank" value={v} checked={withdrawBank === v} onChange={() => setWithdrawBank(v)} className="accent-[#1a4b97]" />
 <span className="font-semibold text-[#44494d] text-sm">{l}</span>
 </label>))}
 </div>
 </div>
 </>)}
 </div>{/* Notifications */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{zh ? "通知" : "Thông báo"}</h2>
 <div className="space-y-0">{[
 ["newCommission", zh ? "记录新佣金" : "Hoa hồng mới được ghi nhận", zh ? "每当有订单产生佣金时" : "Mỗi khi có đơn hàng tạo hoa hồng"],
 ["teamActivity", zh ? "团队活动" : "Hoạt động đội nhóm", zh ? "下级推广员有新订单时" : "Khi CTV cấp dưới có đơn hàng mới"],
 ["payoutComplete", zh ? "打款成功" : "Chuyển tiền thành công", zh ? "打款完成时" : "Khi giải ngân hoàn tất"],
 ["newPromo", zh ? "新促销活动" : "Chương trình khuyến mại mới", zh ? "限时抢购和热门产品" : "Flash sale & sản phẩm hot"],
 ["weeklyReport", zh ? "每周邮件报告" : "Báo cáo tuần qua email", zh ? "每周一汇总业绩" : "Tổng kết hiệu suất mỗi thứ Hai"],
 ].map(([key, label, desc]) => (
 <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 <Toggle checked={notifs[key as keyof typeof notifs]} onChange={() => setNotifs(p => ({ ...p, [key]: !p[key as keyof typeof notifs] }))} />
 </div>))}
 </div>
 </div>{/* Privacy */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{zh ? "显示与隐私" : "Hiển thị & Quyền riêng tư"}</h2>
 <div className="space-y-0">{[
 ["showInDirectory", zh ? "在代理目录中显示" : "Hiển thị trong thư mục đại lý", zh ? "客户可以找到您的资料" : "Khách hàng có thể tìm thấy hồ sơ của bạn"],
 ["shareEarnings", zh ? "公开分享收入" : "Chia sẻ thu nhập công khai", zh ? "其他推广员可见您的收入（激励团队）" : "CTV khác thấy doanh thu của bạn (motivate team)"],
 ].map(([key, label, desc]) => (
 <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 <Toggle checked={privacy[key as keyof typeof privacy]} onChange={() => setPrivacy(p => ({ ...p, [key]: !p[key as keyof typeof privacy] }))} />
 </div>))}
 </div>
 </div>
 </div>
 </main>
 </>);
}

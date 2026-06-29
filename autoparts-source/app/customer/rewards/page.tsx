"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect, useCallback } from "react";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";

const tiers = [
 { name: "Silver", points: 0, discount: "3%", color: "#8f9294", perks: ["Ưu tiên hỗ trợ", "Miễn phí giao hàng đơn 500k+"] },
 { name: "Gold", points: 5000, discount: "5%", color: "#F59E0B", perks: ["Tất cả ưu đãi Silver", "Flash sale sớm 1 tiếng", "Quà sinh nhật 100k"] },
 { name: "Platinum", points: 15000, discount: "8%", color: "#8B5CF6", perks: ["Tất cả ưu đãi Gold", "Thợ kỹ thuật ưu tiên", "Chiết khấu 8%", "Hotline riêng"] },
 { name: "Diamond", points: 30000, discount: "12%", color: "#06B6D4", perks: ["Tất cả ưu đãi Platinum", "Tham quan kho hàng", "Giá nhập trực tiếp", "Trải nghiệm VIP"] },
];

type Reward = { id: string; name: string; nameZh?: string; pointsCost: number; voucherType: string; voucherValue: number; minOrder: number; active: boolean };

export default function CustomerRewardsPage() {
  const { fp, lang } = useLang();
 const [orders, setOrders] = useState<any[]>([]);
 const [bal, setBal] = useState({ earned: 0, spent: 0, balance: 0 });
 const [history, setHistory] = useState<any[]>([]);
 const [catalog, setCatalog] = useState<Reward[]>([]);
 const refreshBalance = useCallback(() => { fetch("/api/rewards/balance", { credentials: "include", cache: "no-store" }).then(r => r.ok ? r.json() : null).then(d => { if (d) { setBal({ earned: d.earned || 0, spent: d.spent || 0, balance: d.balance || 0 }); setHistory(Array.isArray(d.history) ? d.history : []); } }).catch(() => {}); }, []);
 useEffect(() => {
   fetch("/api/orders", { credentials: "include" }).then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
   fetch("/api/rewards").then(r => r.json()).then(d => setCatalog(Array.isArray(d) ? d.filter((x: Reward) => x.active) : [])).catch(() => {});
   refreshBalance();
 }, [refreshBalance]);

 const available = bal.balance;          // điểm khả dụng (đã trừ điểm đã đổi)
 const lifetime = bal.earned;            // điểm tích luỹ (để xét bậc)
 const curIdx = tiers.reduce((acc, tt, i) => (lifetime >= tt.points ? i : acc), 0);
 const currentTier = tiers[curIdx];
 const nextTier = tiers[curIdx + 1] || null;
 const progressToNext = nextTier ? Math.min(100, Math.max(0, ((lifetime - currentTier.points) / (nextTier.points - currentTier.points)) * 100)) : 100;
 const fmtDate = (o: any) => { const d = o.createdAt || o.date; if (!d) return ""; try { return new Date(d).toLocaleDateString(lang === "zh" ? "zh-CN" : "vi-VN"); } catch { return String(d); } };
 const validOrders = orders.filter(o => o.status !== "cancelled");
 const transactions = validOrders.slice(0, 12).map((o: any) => ({ date: fmtDate(o), desc: (lang === "zh" ? "购物 " : "Mua hàng ") + (o.id || ""), points: Math.floor((o.total || 0) / 10000), type: "earn" as const }));

 const [activeTab, setActiveTab] = useState<"overview" | "history" | "redeem">("overview");
 const [redeemCode, setRedeemCode] = useState<string | null>(null);
 const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

 const handleRedeem = async (reward: Reward) => {
   if (isRedeeming) return;
   if (available < reward.pointsCost) { window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "积分不足" : "Không đủ điểm", type: "warning" } })); return; }
   setIsRedeeming(reward.id);
   try {
     const res = await fetch("/api/rewards/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ rewardId: reward.id }) });
     const data = await res.json().catch(() => ({}));
     if (res.ok && data?.code) {
       setRedeemCode(data.code);
       setTimeout(() => setRedeemCode(null), 5000); // popup tự ẩn sau 5s — mã vẫn lưu ở "Lịch sử đổi quà"
       if (typeof data.balance === "number") setBal(b => ({ ...b, balance: data.balance, spent: b.earned - data.balance }));
       window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: (lang === "zh" ? "兑换成功！优惠码：" : "Đổi thành công! Mã: ") + data.code, type: "success" } }));
       refreshBalance();
     } else {
       window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: data?.error || (lang === "zh" ? "兑换失败" : "Đổi quà thất bại"), type: "error" } }));
     }
   } catch { window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "兑换失败" : "Lỗi khi đổi quà", type: "error" } })); }
   finally { setIsRedeeming(null); }
 };

 const rewardName = (r: Reward) => (lang === "zh" ? (r.nameZh || r.name) : r.name);

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">{lang === "zh" ? "积分与特权" : "Điểm thưởng & Đặc quyền"}</h1>
 </div>
 <div className="px-6 flex border-t border-[#2f3336]">{[["overview", lang === "zh" ? "概览" : "Tổng quan"], ["history", (lang === "zh" ? "积分记录" : "Lịch sử điểm")], ["redeem", lang === "zh" ? "兑换" : "Đổi quà"]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}
 </button>))}
 </div>
 </div>

 <div className="p-6">{activeTab === "overview" && (
 <div className="space-y-5">{/* Points hero */}
 <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--ap-primary), #EA580C)" }}>
 <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(30px, -30px)" }} />
 <div className="relative">
 <div className="flex items-start justify-between mb-4">
 <div>
 <p className="text-orange-100 text-sm mb-1">{lang === "zh" ? "可用积分" : "Điểm khả dụng"}</p>
 <p className="text-5xl font-extrabold text-white">{available.toLocaleString()}</p>
 <p className="text-orange-200 text-sm mt-1">{lang === "zh" ? "累计" : "Tích luỹ"}: {lifetime.toLocaleString()} · {lang === "zh" ? "已用" : "Đã đổi"}: {bal.spent.toLocaleString()}</p>
 </div>
 <div className="flex flex-col items-end">
 <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold mb-1">{currentTier.name}
 </span>
 <span className="text-orange-200 text-xs">{lang === "zh" ? "折扣" : "Chiết khấu"} {currentTier.discount}</span>
 </div>
 </div>{/* Progress to next */}
 <div className="bg-white/20 rounded-full h-2.5 mb-2">
 <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progressToNext}%` }} />
 </div>
 <div className="flex justify-between text-xs text-orange-100">
 <span>{lifetime.toLocaleString()} {lang === "zh" ? "积分" : "điểm"} ({currentTier.name})</span>
 <span>{nextTier ? (lang === "zh" ? `还需 ${(nextTier.points - lifetime).toLocaleString()} 积分到 ${nextTier.name}` : `Cần ${(nextTier.points - lifetime).toLocaleString()} điểm nữa tới ${nextTier.name}`) : (lang === "zh" ? "已达最高等级" : "Đã đạt bậc cao nhất")}</span>
 </div>
 </div>
 </div>{/* Tiers */}
 <div>
 <h2 className="font-bold text-[#44494d] mb-3">{lang === "zh" ? "会员等级" : "Bậc thành viên"}</h2>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{tiers.map(tier => {
 const isCurrent = tier.name === currentTier.name;
 return (
 <div key={tier.name} className={`ap-card bg-white rounded-xl border-2 p-4 transition-all ${isCurrent ? "" : "border-[#f0f0f0]"}`} style={isCurrent ? { borderColor: tier.color } : {}}>
 <div className="flex items-center justify-between mb-2">
 <span className="text-2xl"></span>{isCurrent && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: tier.color }}>{lang === "zh" ? "当前" : "Hiện tại"}</span>}
 </div>
 <p className="font-bold text-[#44494d] mb-0.5">{tier.name}</p>
 <p className="text-xs text-[#8f9294] mb-2">{tier.points > 0 ? `${tier.points.toLocaleString()}+ ${lang === "zh" ? "积分" : "điểm"}` : (lang === "zh" ? "默认" : "Mặc định")}</p>
 <p className="text-sm font-bold mb-2" style={{ color: tier.color }}>CK {tier.discount}</p>
 <ul className="space-y-1">{tier.perks.slice(0, 2).map(p => (
 <li key={p} className="text-xs text-[#8f9294] flex items-start gap-1"><span className="text-green-500 mt-0.5">✓</span>{p}</li>))}
 {tier.perks.length > 2 && <li className="text-xs text-[#8f9294]">+{tier.perks.length - 2} {lang === "zh" ? "更多优惠" : "ưu đãi khác"}</li>}
 </ul>
 </div>);
 })}
 </div>
 </div>{/* How to earn */}
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4">{lang === "zh" ? "如何赚取积分" : "Cách tích điểm"}</h2>
 <div className="grid md:grid-cols-2 gap-3">{[
 { action: (lang === "zh" ? "购物" : "Mua hàng"), earn: lang === "zh" ? "1 积分 / 10,000đ" : "1 điểm / 10,000đ" },
 { action: lang === "zh" ? "购买 OEM" : "Mua hàng OEM", earn: lang === "zh" ? "2× 积分" : "Nhân 2× điểm" },
 { action: lang === "zh" ? "写评价" : "Viết đánh giá", earn: lang === "zh" ? "+30 积分/评价" : "+30 điểm/đánh giá" },
 { action: lang === "zh" ? "推荐好友" : "Giới thiệu bạn bè", earn: lang === "zh" ? "+200 积分/人" : "+200 điểm/người" },
 ].map(item => (
 <div key={item.action} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{item.action}</p>
 <p className="text-xs font-bold" style={{ color: "var(--ap-primary)" }}>{item.earn}</p>
 </div>
 </div>))}
 </div>
 </div>
 </div>)}

 {activeTab === "history" && (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">{lang === "zh" ? "日期" : "NGÀY"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "交易" : "GIAO DỊCH"}</th>
 <th className="text-right px-4 py-3">{lang === "zh" ? "积分" : "ĐIỂM"}</th>
 </tr>
 </thead>
 <tbody>{transactions.length === 0 ? <tr><td colSpan={3} className="text-center py-8 text-[#8f9294] text-sm">{lang === "zh" ? "暂无记录" : "Chưa có giao dịch"}</td></tr> : transactions.map((t, i) => (
 <tr key={i} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 text-[#8f9294] text-sm">{t.date}</td>
 <td className="px-4 py-3 text-[#44494d] text-sm">{t.desc}</td>
 <td className="px-4 py-3 text-right font-bold text-green-600">+{t.points}</td>
 </tr>))}
 </tbody>
 </table>
 </div>)}

 {activeTab === "redeem" && (
 <>
 {redeemCode && (
 <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between flex-wrap gap-2">
 <p className="text-sm text-green-800">{lang === "zh" ? "兑换成功！您的优惠码：" : "Đổi quà thành công! Mã voucher của bạn:"} <span className="font-mono font-bold text-base">{redeemCode}</span> — {lang === "zh" ? "结账时输入即可" : "nhập khi thanh toán"}</p>
 </div>)}
 {catalog.length === 0 ? (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-10 text-center text-[#8f9294] text-sm">{lang === "zh" ? "暂无可兑换的奖励" : "Chưa có phần quà nào"}</div>
 ) : (
 <div className="grid md:grid-cols-2 gap-4">{catalog.map(r => {
 const canRedeem = available >= r.pointsCost;
 return (
 <div key={r.id} className={`ap-card bg-white rounded-xl border-2 p-5 transition-all ${canRedeem ? "border-[#f0f0f0] hover:border-orange-200" : "border-[#f0f0f0] opacity-60"}`}>
 <div className="flex items-start justify-between mb-3">
 <div>
 <p className="font-bold text-[#44494d] text-lg">{rewardName(r)}</p>{r.minOrder > 0 && <p className="text-xs text-[#8f9294]">{lang === "zh" ? "最低订单" : "Đơn tối thiểu"} {fp(r.minOrder)}</p>}
 </div>
 <div className="text-right">
 <p className="text-2xl font-extrabold" style={{ color: "var(--ap-primary)" }}>{r.pointsCost}</p>
 <p className="text-xs text-[#8f9294]">{lang === "zh" ? "积分" : "điểm"}</p>
 </div>
 </div>
 <button
 onClick={() => handleRedeem(r)}
 disabled={!canRedeem || isRedeeming === r.id}
 className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed"
 style={canRedeem ? { background: "var(--ap-primary)", color: "white" } : { background: "#f8f8fa", color: "#8f9294" }}>{isRedeeming === r.id ? (lang === "zh" ? "处理中..." : "Đang xử lý...") : canRedeem ? (lang === "zh" ? "立即兑换" : "Đổi ngay") : (lang === "zh" ? `还需 ${r.pointsCost - available} 积分` : `Cần thêm ${r.pointsCost - available} điểm`)}
 </button>
 </div>);
 })}
 </div>)}
 {/* Lịch sử đổi quà — xem lại mã voucher đã đổi để dùng sau */}
 {history.length > 0 && (
 <div className="mt-6">
 <h3 className="font-bold text-[#44494d] mb-3">{lang === "zh" ? "兑换历史" : "Lịch sử đổi quà"}</h3>
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden divide-y divide-[#f4f4f4]">{history.map((h, i) => (
 <div key={i} className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
 <div className="min-w-0">
 <p className="text-sm font-semibold text-[#44494d]">{h.reason}</p>
 <p className="text-xs text-[#8f9294]">{(() => { try { return new Date(h.ts).toLocaleString(lang === "zh" ? "zh-CN" : "vi-VN"); } catch { return ""; } })()} · −{Math.abs(h.delta)} {lang === "zh" ? "积分" : "điểm"}</p>
 </div>
 {h.code && <div className="flex items-center gap-2 shrink-0">
 <span className="font-mono font-bold text-sm bg-[#f4f4f4] px-2 py-1 rounded">{h.code}</span>
 <button onClick={() => { try { navigator.clipboard?.writeText(h.code); window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "已复制" : "Đã sao chép mã", type: "success" } })); } catch {} }} className="text-xs font-semibold text-[#1a4b97] hover:underline">{lang === "zh" ? "复制" : "Sao chép"}</button>
 </div>}
 </div>))}
 </div>
 </div>)}
 </>)}
 </div>
 </main>
 </>);
}

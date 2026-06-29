"use client";
import { useLang, formatPriceLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import AffiliateSidebar from "@/components/AffiliateSidebar";





const withdrawHistory = [
 { id: "W-2024-010", date: "14/10/2024", amount: 8500000, account: "VCB ***6789", status: "COMPLETED", note: "Tự động kỳ 1-15/10" },
 { id: "W-2024-009", date: "30/09/2024", amount: 11200000, account: "VCB ***6789", status: "COMPLETED", note: "Tự động kỳ 16-30/9" },
 { id: "W-2024-008", date: "15/09/2024", amount: 7800000, account: "Techcombank ***3456", status: "COMPLETED", note: "Tự động kỳ 1-15/9" },
 { id: "W-2024-007", date: "18/10/2024", amount: 3200000, account: "MoMo ***1234", status: "PENDING", note: "Yêu cầu thủ công" },
];

const bankAccounts = [
 { id: "b1", bank: "Vietcombank", number: "1234567891234", name: "LÊ VĂN PARTNER", default: true },
 { id: "b2", bank: "Techcombank", number: "9876543210123", name: "LÊ VĂN PARTNER", default: false },
 { id: "b3", bank: "MoMo", number: "0901234567", name: "Lê Văn Partner", default: false },
];

export default function AffiliateWithdrawPage() {
  const { t, fp, lang } = useLang();
 const [amount, setAmount] = useState("8500000");
 const [selectedBank, setSelectedBank] = useState("b1");
 const [submitted, setSubmitted] = useState(false);
 const [activeTab, setActiveTab] = useState<"request" | "history" | "banks">("request");
 const [hist, setHist] = useState<any[]>([]);
 const [available, setAvailable] = useState(0);
 const [processing, setProcessing] = useState(0);
 const [pendingCount, setPendingCount] = useState(0);
 const [totalWithdrawn, setTotalWithdrawn] = useState(0);
 // Số dư khả dụng = hoa hồng chưa trả − các yêu cầu rút đang chờ (đã KHOÁ). Tính lại từ server nên giữ nguyên sau khi tải lại.
 const loadPayouts = () => {
   fetch("/api/payouts").then(r => r.json()).then((d: any) => {
     const aff = (Array.isArray(d) ? d : []).filter((p: any) => p.type === "affiliate");
     const commissions = aff.filter((p: any) => p.kind !== "withdrawal");
     const withdrawals = aff.filter((p: any) => p.kind === "withdrawal");
     const earned = commissions.filter((p: any) => p.status !== "PAID").reduce((s: number, p: any) => s + (p.amount || 0), 0);
     // Đã rút/đang chờ rút (KHÔNG tính yêu cầu bị từ chối) — PAID giữ trừ hẳn, PENDING khoá tạm, REJECTED trả lại
     const taken = withdrawals.filter((p: any) => p.status !== "REJECTED").reduce((s: number, p: any) => s + (p.amount || 0), 0);
     const locked = withdrawals.filter((p: any) => p.status === "PENDING").reduce((s: number, p: any) => s + (p.amount || 0), 0);
     setAvailable(Math.max(0, earned - taken));
     setProcessing(locked);
     setPendingCount(withdrawals.filter((p: any) => p.status === "PENDING").length);
     setTotalWithdrawn(withdrawals.filter((p: any) => p.status === "PAID").reduce((s: number, p: any) => s + (p.amount || 0), 0));
     setHist(withdrawals.map((p: any) => ({ id: p.id, date: p.date, amount: p.amount, account: p.account || "—", status: p.status === "PAID" ? "COMPLETED" : p.status === "REJECTED" ? "REJECTED" : "PENDING", note: lang === "zh" ? "提现请求" : "Yêu cầu rút tiền" })));
   }).catch(() => {});
 };
 useEffect(() => { loadPayouts(); }, []);

 const handleSubmit = async () => {
 const amt = Number(amount) || 0;
 if (amt < 500000 || amt > available) {
   window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: amt < 500000 ? (lang === "zh" ? "最低提取 500,000đ" : "Rút tối thiểu 500.000đ") : (lang === "zh" ? "可用余额不足" : "Số dư khả dụng không đủ"), type: "warning" } }));
   return;
 }
 const bank = bankAccounts.find(b => b.id === selectedBank);
 try {
   const res = await fetch("/api/payouts", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
     body: JSON.stringify({ amount: amt, account: bank ? `${bank.bank} ${bank.number.slice(-4)}` : undefined }) });
   if (!res.ok) { window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "提交失败，请重试。" : "Gửi yêu cầu thất bại, vui lòng thử lại.", type: "error" } })); return; }
   setSubmitted(true);
   loadPayouts(); // số dư khả dụng giảm (đã khoá) + hiện trong "Đang xử lý"
   setTimeout(() => setSubmitted(false), 3000);
 } catch {
   window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "提交失败，请重试。" : "Gửi yêu cầu thất bại, vui lòng thử lại.", type: "error" } }));
 }
 };

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "提取佣金" : "Rút tiền hoa hồng"}</h1>
 </div>
 <div className="px-6 flex border-t border-[#f0f0f0]">{[["request", "Yêu cầu rút tiền"], ["history", "Lịch sử rút tiền"], ["banks", "Tài khoản ngân hàng"]].map(([key, label]) => (
 <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
 className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}
 </button>))}
 </div>
 </div>

 <div className="p-6">{/* Balance hero */}
 <div className="rounded-2xl p-6 mb-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
 <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5" style={{ background: "var(--ap-primary)", transform: "translate(30px, -30px)" }} />
 <div className="relative grid md:grid-cols-3 gap-6">
 <div>
 <p className="text-[#8f9294] text-sm mb-1">{t("availableBalance")}</p>
 <p className="text-3xl font-extrabold text-white">{fp(available)}</p>
 <p className="text-xs text-[#8f9294] mt-1">Rút tối thiểu: 500,000đ</p>
 </div>
 <div>
 <p className="text-[#8f9294] text-sm mb-1">{t("processingOrders")}</p>
 <p className="text-2xl font-bold text-yellow-400">{fp(processing)}</p>
 <p className="text-xs text-[#8f9294] mt-1">{lang === "zh" ? `${pendingCount} 个待处理请求` : `${pendingCount} yêu cầu đang chờ`}</p>
 </div>
 <div>
 <p className="text-[#8f9294] text-sm mb-1">Đã rút tổng cộng</p>
 <p className="text-2xl font-bold text-green-400">{fp(totalWithdrawn)}</p>
 <p className="text-xs text-[#8f9294] mt-1">Từ khi tham gia</p>
 </div>
 </div>
 </div>{activeTab === "request" && (
 <div className="max-w-4xl">{submitted ? (
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-10 text-center">✓
 <h3 className="text-xl font-bold text-[#44494d] mb-2">Yêu cầu đã gửi!</h3>
 <p className="text-[#8f9294] text-sm">Chúng tôi sẽ xử lý trong vòng 1-3 ngày làm việc. Bạn sẽ nhận được thông báo khi tiền được chuyển.</p>
 </div>) : (
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6 space-y-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Số tiền muốn rút (VNĐ)</label>
 <div className="relative">
 <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
 min="500000" max={available}
 className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-lg font-bold focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div className="flex gap-2 mt-2">{[1000000, 3000000, 5000000].map(amt => (
 <button key={amt} onClick={() => setAmount(amt.toString())}
 className="px-3 py-1 border border-[#e5e5e5] rounded-lg text-xs font-semibold text-slate-600 hover:border-[#1a4b97] hover:text-[#1a4b97]">{(amt / 1000000).toFixed(0)}M
 </button>))}
 <button onClick={() => setAmount(available.toString())}
 className="px-3 py-1 border border-[#e5e5e5] rounded-lg text-xs font-semibold text-[#1a4b97] border-orange-300">Toàn bộ
 </button>
 </div>
 </div>

 <div>
 <label className="text-sm font-semibold text-slate-600 mb-2 block">Tài khoản nhận</label>
 <div className="space-y-2">{bankAccounts.map(bank => (
 <label key={bank.id} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedBank === bank.id ? "border-[#1a4b97]" : "border-[#e5e5e5] hover:border-slate-300"}`}
 style={selectedBank === bank.id ? { background: "#EFF4FB" } : {}}>
 <input type="radio" name="bank" value={bank.id} checked={selectedBank === bank.id} onChange={() => setSelectedBank(bank.id)} className="accent-[#1a4b97]" />
 <div className="flex-1">
 <p className="font-semibold text-[#44494d] text-sm">{bank.bank} — {bank.number.replace(/(.{4})/g, "$1 ").trim()}</p>
 <p className="text-xs text-[#8f9294]">{bank.name}</p>
 </div>{bank.default && <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#DBEAFE", color: "#1a4b97" }}>Mặc định</span>}
 </label>))}
 </div>
 </div>

 <div className="p-4 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-[#8f9294]">Số tiền yêu cầu</span>
 <span className="font-semibold text-[#44494d]">{fp(parseInt(amount) || 0)}</span>
 </div>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-[#8f9294]">Phí rút tiền</span>
 <span className="text-green-600 font-semibold">{t("cartFreeShipping")}</span>
 </div>
 <div className="flex justify-between text-sm font-bold border-t border-[#e5e5e5] pt-2 mt-2">
 <span className="text-[#44494d]">Thực nhận</span>
 <span style={{ color: "var(--ap-primary)" }}>{fp(parseInt(amount) || 0)}</span>
 </div>
 </div>

 <button onClick={handleSubmit}
 disabled={parseInt(amount) < 500000 || parseInt(amount) > available}
 className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-50"
 style={{ background: "var(--ap-primary)" }}>Xác nhận rút tiền
 </button>
 <p className="text-xs text-center text-[#8f9294] flex items-center justify-center gap-1">! Xử lý 1-3 ngày làm việc • Chu kỳ giải ngân tự động: mỗi 15 ngày
 </p>
 </div>)}
 </div>)}

 {activeTab === "history" && (
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
 <table className="w-full">
 <thead style={{ background: "#f8f8fa" }}>
 <tr className="text-xs text-[#8f9294] font-semibold">
 <th className="text-left px-4 py-3">MÃ YÊU CẦU</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "日期" : "NGÀY"}</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "金额" : "SỐ TIỀN"}</th>
 <th className="text-left px-4 py-3">TÀI KHOẢN</th>
 <th className="text-left px-4 py-3">GHI CHÚ</th>
 <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
 </tr>
 </thead>
 <tbody>{(hist.length ? hist : withdrawHistory).map((w: any) => (
 <tr key={w.id} className="border-t border-slate-50 hover:bg-[#f8f8fa]">
 <td className="px-4 py-3 font-mono text-sm text-slate-600">{w.id}</td>
 <td className="px-4 py-3 text-[#8f9294] text-sm">{w.date}</td>
 <td className="px-4 py-3 font-bold text-[#44494d]">{fp(w.amount)}</td>
 <td className="px-4 py-3 text-[#8f9294] text-sm">{w.account}</td>
 <td className="px-4 py-3 text-[#8f9294] text-xs">{w.note}</td>
 <td className="px-4 py-3">
 <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${w.status === "COMPLETED" ? "bg-green-100 text-green-700" : w.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{w.status === "COMPLETED" ? "✓" : ""}
 {w.status === "COMPLETED" ? (lang === "zh" ? "已转账" : "Đã chuyển") : w.status === "REJECTED" ? (lang === "zh" ? "已拒绝" : "Đã từ chối") : (lang === "zh" ? "处理中" : "Đang xử lý")}
 </span>
 </td>
 </tr>))}
 </tbody>
 </table>
 </div>)}

 {activeTab === "banks" && (
 <div className="max-w-4xl space-y-3">{bankAccounts.map(bank => (
 <div key={bank.id} className={`bg-white rounded-xl border-2 p-4 flex items-center gap-4 ${bank.default ? "" : "border-[#f0f0f0]"}`} style={bank.default ? { borderColor: "var(--ap-primary)" } : {}}>
 <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
 style={{ background: bank.bank === "Vietcombank" ? "#007B5E" : bank.bank === "Techcombank" ? "#D42F43" : "#AE2070" }}>{bank.bank.substring(0, 3).toUpperCase()}
 </div>
 <div className="flex-1">
 <p className="font-bold text-[#44494d]">{bank.bank}</p>
 <p className="text-sm text-[#8f9294] font-mono">{bank.number}</p>
 <p className="text-xs text-[#8f9294]">{bank.name}</p>
 </div>{bank.default && <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: "#DBEAFE", color: "#1a4b97" }}>Mặc định</span>}
 </div>))}
 <button className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-[#8f9294] hover:border-[#1a4b97] hover:text-[#1a4b97] transition-colors w-full justify-center">+ Thêm tài khoản ngân hàng
 </button>
 </div>)}
 </div>
 </main>
 </>);
}

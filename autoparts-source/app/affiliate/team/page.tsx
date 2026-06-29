"use client";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import SidebarControls from "@/components/SidebarControls";
import AffiliateSidebar from "@/components/AffiliateSidebar";





const myTeam = [
 { id: "t1", name: "Nguyễn Văn Minh", phone: "0912345678", joinDate: "15/08/2024", tier: "T2", status: "active", monthlyOrders: 28, commission: 3200000, totalEarned: 9800000, avatar: "NM" },
 { id: "t2", name: "Trần Thị Lan", phone: "0923456789", joinDate: "22/08/2024", tier: "T2", status: "active", monthlyOrders: 19, commission: 2100000, totalEarned: 6300000, avatar: "TL" },
 { id: "t3", name: "Phạm Văn Nam", phone: "0934567890", joinDate: "05/09/2024", tier: "T2", status: "active", monthlyOrders: 12, commission: 1350000, totalEarned: 3200000, avatar: "PN" },
 { id: "t4", name: "Hoàng Thị Thu", phone: "0945678901", joinDate: "18/09/2024", tier: "T2", status: "inactive", monthlyOrders: 3, commission: 320000, totalEarned: 780000, avatar: "HT" },
 { id: "t5", name: "Vũ Minh Khoa", phone: "0956789012", joinDate: "01/10/2024", tier: "T2", status: "active", monthlyOrders: 8, commission: 870000, totalEarned: 870000, avatar: "VK" },
];

const avatarColors = ["var(--ap-primary)", "var(--ap-primary)", "#22C55E", "#8B5CF6", "#EF4444"];

export default function AffiliateTeamPage() {
  const { t, fp, lang } = useLang();
 const [search, setSearch] = useState("");
 const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
 const [copied, setCopied] = useState(false);
 const refLink = "https://autopart.vn/join?ref=LP_GOLD_2024";
 function copyRef() { navigator.clipboard?.writeText(refLink); setCopied(true); setTimeout(() => setCopied(false), 1800); }
 function shareRef() { if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: "Tham gia AutoParts", url: refLink }).catch(() => {}); else copyRef(); }

 const filtered = myTeam.filter(m =>(filterStatus === "all" || m.status === filterStatus) &&
 (search === "" || m.name.toLowerCase().includes(search.toLowerCase()))
 );

 const totalTeamCommission = myTeam.reduce((s, m) => s + m.commission, 0);
 const passiveForMe = Math.round(totalTeamCommission * 0.5); // 5% passive = 50% of what they earn at 10%

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">Đội nhóm CTV của tôi</h1>
 <button onClick={() => { copyRef(); alert("Đã sao chép link mời CTV. Gửi cho người bạn muốn mời!"); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>+ Mời CTV mới
 </button>
 </div>
 </div>

 <div className="p-6">{/* My team summary */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{[
 { label: "Tổng CTV trong nhóm", value: myTeam.length.toString(), color: "#44494d" },
 { label: "CTV đang hoạt động", value: myTeam.filter(m => m.status === "active").length.toString(), color: "#22C55E" },
 { label: "Doanh thu nhóm T10", value: `${(totalTeamCommission / 100000 * 10).toFixed(0)} Triệu`, color: "var(--ap-primary)" },
 { label: "Hoa hồng thụ động (5%)", value: fp(passiveForMe), color: "var(--ap-primary)" },
 ].map(s => (
 <div key={s.label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4">
 <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
 <p className="text-xs text-[#8f9294]">{s.label}</p>
 </div>))}
 </div>{/* Referral link */}
 <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5 mb-6">
 <h2 className="font-bold text-[#44494d] mb-3">Link giới thiệu CTV mới</h2>
 <div className="flex items-center gap-3">
 <div className="flex-1 px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-mono text-[#8f9294] truncate" style={{ background: "#f8f8fa" }}>https://autopart.vn/join?ref=LP_GOLD_2024
 </div>
 <button onClick={copyRef} className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm whitespace-nowrap" style={{ background: "var(--ap-primary)" }}>{copied ? "Đã chép ✓" : "Sao chép"}
 </button>
 <button onClick={shareRef} className="px-4 py-2.5 rounded-xl font-semibold border border-[#e5e5e5] text-slate-600 text-sm whitespace-nowrap hover:bg-[#f8f8fa]">Chia sẻ
 </button>
 </div>
 <p className="text-xs text-[#8f9294] mt-2">Mỗi CTV tham gia qua link của bạn sẽ mang lại cho bạn <span className="font-bold text-[#1a4b97]">5% hoa hồng thụ động</span> từ doanh thu của họ.</p>
 </div>{/* Filters */}
 <div className="flex gap-3 mb-4">
 <div className="relative">

 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên CTV..." className="pl-9 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a4b97] w-52" />
 </div>
 <div className="flex rounded-lg border border-[#e5e5e5] overflow-hidden bg-white text-sm">{[["all", (lang === "zh" ? "全部" : "Tất cả")], ["active", "Đang hoạt động"], ["inactive", "Không hoạt động"]].map(([k, l]) => (
 <button key={k} onClick={() => setFilterStatus(k as typeof filterStatus)}
 className={`px-3 py-2 transition-colors ${filterStatus === k ? "text-white font-semibold" : "text-slate-600 hover:bg-[#f8f8fa]"}`}
 style={filterStatus === k ? { background: "var(--ap-primary)" } : {}}>{l}
 </button>))}
 </div>
 </div>{/* Team table */}
 <div className="space-y-3">{filtered.map((member, idx) => (
 <div key={member.id} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4 flex items-center gap-4">
 <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
 style={{ background: avatarColors[idx % avatarColors.length] }}>{member.avatar}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-0.5">
 <p className="font-bold text-[#44494d]">{member.name}</p>
 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${member.status === "active" ? "bg-green-100 text-green-700" : "bg-[#f4f4f4] text-[#8f9294]"}`}>{member.status === "active" ? "Đang HĐ" : "Không HĐ"}
 </span>
 </div>
 <p className="text-xs text-[#8f9294]">{member.phone} • Tham gia {member.joinDate}</p>
 </div>
 <div className="text-center px-4">
 <p className="font-bold text-[#44494d]">{member.monthlyOrders}</p>
 <p className="text-xs text-[#8f9294]">Đơn T10</p>
 </div>
 <div className="text-center px-4">
 <p className="font-bold text-[#1a4b97]">{fp(member.commission)}</p>
 <p className="text-xs text-[#8f9294]">HH của họ</p>
 </div>
 <div className="text-center px-4">
 <p className="font-bold" style={{ color: "var(--ap-primary)" }}>{fp(Math.round(member.commission * 0.5))}</p>
 <p className="text-xs text-[#8f9294]">Bạn nhận (5%)</p>
 </div>
 <div className="text-center px-4">
 <p className="font-semibold text-[#8f9294] text-sm">{fp(member.totalEarned)}</p>
 <p className="text-xs text-[#8f9294]">Tổng HH</p>
 </div>
 </div>))}
 </div>{/* Commission calculation note */}
 <div className="mt-5 p-4 rounded-xl" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
 <p className="text-sm font-semibold text-blue-800 mb-1">Cách tính hoa hồng thụ động</p>
 <p className="text-xs text-[#1a4b97]">Khi CTV trong nhóm bạn (T2) bán được hàng, họ nhận <strong>10%</strong> hoa hồng từ đơn hàng. 
 Đồng thời bạn (T1 sponsor) nhận thêm <strong>5%</strong> trên giá trị đơn đó. 
 Ví dụ: CTV bán đơn 2,000,000đ: CTV nhận 200,000đ, bạn nhận thêm 100,000đ.
 </p>
 </div>
 </div>
 </main>
 </>);
}

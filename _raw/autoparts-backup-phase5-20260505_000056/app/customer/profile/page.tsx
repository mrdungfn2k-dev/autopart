"use client";
import { useLang } from "@/lib/i18n";
import { getAuth, setAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";




export default function CustomerProfilePage() {
  const { t, fp, lang } = useLang();
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState("");

  // Load avatar from auth state
  useEffect(() => {
    const u = getAuth();
    if (u?.avatar) setAvatar(u.avatar);
    if (u?.name) setForm(p => ({ ...p, name: u.name }));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
         setAvatar(data.url);
         const u = getAuth();
         if (u) {
           u.avatar = data.url;
           setAuth(u);
           window.dispatchEvent(new Event("storage")); // force header update
         }
      }
    } catch {}
    finally { setUploading(false); }
  };

 const [saved, setSaved] = useState(false);
 const [form, setForm] = useState({
 name: (lang === "zh" ? "客户A" : "Nguyễn Văn An"),
 phone: "0901234567",
 email: "an.nguyen@gmail.com",
 birthday: "1990-05-15",
 gender: "male",
 province: "TP. Hồ Chí Minh",
 address: "12 Nguyễn Huệ, Quận 1",
 });

 const [addresses, setAddresses] = useState([
 { id: "a1", name: (lang === "zh" ? "客户A" : "Nguyễn Văn An"), phone: "0901234567", address: "12 Nguyễn Huệ, Quận 1, TP.HCM", label: "Nhà riêng", default: true },
 { id: "a2", name: "An (Văn phòng)", phone: "0901234567", address: "45 Lê Lợi, Quận 1, TP.HCM", label: "Văn phòng", default: false },
 ]);

 const handleSave = () => {
 setSaved(true);
 const u = getAuth();
 if (u) {
   u.name = form.name;
   setAuth(u);
   window.dispatchEvent(new Event("storage"));
 }
 setTimeout(() => setSaved(false), 2500);
 };

 const provinces = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Bình Dương"];

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
 <CustomerSidebar active="/customer/profile" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">{t("profileTitle")}</h1>
 <button onClick={handleSave}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "text-white"}`}
 style={saved  ? {} : { background: "var(--ap-primary)" }}>
 {saved ? <>{lang === "zh" ? "✓ 已保存！" : "✓ Đã lưu!"}</> : (lang === "zh" ? "保存更改" : "Lưu thay đổi")}
 </button>
 </div>
 </div>

 <div className="p-6 max-w-3xl">
 {/* Avatar & tier */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5 flex items-center gap-6">
 <div className="relative">
 <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-4xl border border-gray-100" style={!avatar ? { background: "linear-gradient(135deg, var(--ap-primary), #EA580C)" } : {}}>
 {avatar ? <img loading="lazy" decoding="async" src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white font-extrabold text-2xl">{form.name.charAt(0).toUpperCase()}</span>}
 </div>
 <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-[#e5e5e5] flex items-center justify-center hover:bg-orange-50 shadow-sm cursor-pointer z-10">
   <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
   {uploading ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44494d" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
 </label>
 </div>
 <div>
 <h2 className="text-xl font-bold text-[#44494d]">{form.name}</h2>
 <div className="flex items-center gap-2 mt-1">
 <span className="px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: "#FEF9C3", color: "#A16207" }}> Gold Member</span>
 <span className="text-xs text-[#8f9294]">7,340 điểm</span>
 </div>
 <p className="text-sm text-[#8f9294] mt-1">Thành viên từ 01/2023 • 24 đơn hàng</p>
 </div>
 </div>

 {/* Personal info */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5">
 <h3 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Thông tin cá nhân</h3>
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("fullName")}</label>
 <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("phone")}</label>
 <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Email</label>
 <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Ngày sinh</label>
 <input type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Giới tính</label>
 <div className="flex gap-3">
 {[["male", "Nam"], ["female", "Nữ"], ["other", "Khác"]].map(([v, l]) => (
 <label key={v} className="flex items-center gap-1.5 cursor-pointer">
 <input type="radio" name="gender" value={v} checked={form.gender === v} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="accent-orange-500" />
 <span className="text-sm text-slate-600">{l}</span>
 </label>
 ))}
 </div>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Tỉnh/Thành phố</label>
 <select value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
 {provinces.map(p => <option key={p}>{p}</option>)}
 </select>
 </div>
 </div>
 </div>

 {/* Saved addresses */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-[#44494d] flex items-center gap-2">{t("shippingAddress")}</h3>
 <button className="text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>+ Thêm địa chỉ</button>
 </div>
 <div className="space-y-3">
 {addresses.map(addr => (
 <div key={addr.id} className={`p-4 rounded-xl border-2 ${addr.default ? "" : "border-[#f0f0f0]"}`} style={addr.default ? { borderColor: "var(--ap-primary)", background: "#FFF7ED" } : {}}>
 <div className="flex items-start justify-between mb-1">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-[#44494d]">{addr.name}</span>
 <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#f4f4f4] text-[#8f9294]">{addr.label}</span>
 {addr.default && <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "#FED7AA", color: "#C2410C" }}>Mặc định</span>}
 </div>
 <button className="text-[#8f9294] hover:text-[#1a4b97] text-xs font-bold" title={t("edit")}>✎</button>
 </div>
 <p className="text-sm text-[#8f9294]">{addr.phone}</p>
 <p className="text-sm text-slate-600">{addr.address}</p>
 {!addr.default && (
 <button onClick={() => setAddresses(prev => prev.map(a => ({ ...a, default: a.id === addr.id })))}
 className="mt-2 text-xs font-semibold" style={{ color: "var(--ap-primary)" }}>Đặt làm mặc định</button>
 )}
 </div>
 ))}
 </div>
 </div>

 {/* Account security */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
 <h3 className="font-bold text-[#44494d] mb-4 flex items-center gap-2">Bảo mật tài khoản</h3>
 <div className="space-y-3">
 {[
 { label: (lang === "zh" ? "修改密码" : "Đổi mật khẩu"), desc: "Lần đổi cuối: 3 tháng trước", btn: "Đổi ngay" },
 { label: "Xác thực hai yếu tố (2FA)", desc: "Chưa bật — Bảo vệ tài khoản tốt hơn", btn: "Bật 2FA" },
 { label: "Phiên đăng nhập", desc: "2 thiết bị đang đăng nhập", btn: "Xem tất cả" },
 ].map(sec => (
 <div key={sec.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{sec.label}</p>
 <p className="text-xs text-[#8f9294]">{sec.desc}</p>
 </div>
 <button className="px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm font-medium text-slate-600 hover:bg-white transition-colors">{sec.btn}</button>
 </div>
 ))}
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}

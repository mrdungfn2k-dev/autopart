"use client";
import { useLang } from "@/lib/i18n";
import { getAuth, setAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";
import { validateField, clampPhone, isEmail } from "@/lib/validators";
import { confirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { validateImageFile, imageError } from "@/lib/imageValidate";




export default function CustomerProfilePage() {
  const { t, fp, lang } = useLang();
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState("");

  // Nạp hồ sơ ĐÃ LƯU (auth + ap_profile) để giá trị giữ lại sau khi Lưu + tải lại trang
  useEffect(() => {
    const u = getAuth();
    if (u?.avatar) setAvatar(u.avatar);
    let prof: any = null;
    try { prof = JSON.parse(localStorage.getItem("ap_profile") || "null"); } catch {}
    setForm(p => ({
      ...p,
      name: prof?.name || u?.name || p.name,
      phone: prof?.phone || p.phone,
      email: prof?.email || (u as any)?.email || p.email,
      address: prof?.address ?? p.address,
      province: prof?.province || p.province,
    }));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const verr = validateImageFile(file); if (verr) { imageError(verr); e.target.value = ""; return; }
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
 const [err, setErr] = useState("");
 const [form, setForm] = useState({
 name: (lang === "zh" ? "客户A" : "Nguyễn Văn An"),
 phone: "0901234567",
 email: "an.nguyen@gmail.com",
 birthday: "1990-05-15",
 gender: "male",
 province: "TP. Hồ Chí Minh",
 address: "12 Nguyễn Huệ, Quận 1",
 });

 const [addresses, setAddresses] = useState<Array<{ id: string; name: string; phone: string; address: string; label: string; default: boolean }>>([]);
 // Sổ địa chỉ lưu THẬT trên server (đồng bộ với /customer/address + Thanh toán)
 const loadAddrs = () => fetch("/api/addresses", { credentials: "include", cache: "no-store" }).then(r => r.json())
   .then((d: any[]) => Array.isArray(d) ? d.map(a => ({ id: a.id, name: a.name, phone: a.phone, address: a.address, label: a.district || "Nhà riêng", default: !!a.isDefault })) : [])
   .catch(() => []);
 useEffect(() => { loadAddrs().then(setAddresses); }, []);
 const persistAddrs = (list: Array<{ id: string; name: string; phone: string; address: string; label: string; default: boolean }>) => {
   setAddresses(list);
   fetch("/api/addresses", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
     body: JSON.stringify(list.map(a => ({ id: a.id, name: a.name, phone: a.phone, address: a.address, district: a.label, isDefault: a.default }))) }).catch(() => {});
 };

 const handleSave = () => {
 const e = validateField("name", form.name) || validateField("phone", form.phone) || validateField("email", form.email) || (!form.province ? "Vui lòng chọn Tỉnh/Thành phố" : null);
 if (e) { setErr(e); window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: e, type: "warning" } })); return; }
 setErr("");
 setSaved(true);
 const u = getAuth();
 if (u) {
   u.name = form.name;
   setAuth(u);
   window.dispatchEvent(new Event("storage"));
 }
 // Lưu hồ sơ để checkout đồng bộ địa chỉ nhận hàng
 try { localStorage.setItem("ap_profile", JSON.stringify({ name: form.name, phone: form.phone, email: form.email, address: form.address, province: form.province })); } catch {}
 window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "已保存个人资料" : lang === "en" ? "Profile saved" : "Đã lưu thay đổi hồ sơ", type: "success" } }));
 setTimeout(() => setSaved(false), 2500);
 };

 // Đủ + đúng các trường bắt buộc thì mới cho lưu
 const formValid = !validateField("name", form.name) && !validateField("phone", form.phone) && !validateField("email", form.email) && !!form.province;

 // Bậc + điểm THẬT theo đơn hàng (không hard-code)
 const [orders, setOrders] = useState<{ total?: number; status?: string }[]>([]);
 useEffect(() => { fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {}); }, []);
 const _points = Math.floor(orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0) / 10000);
 const _tier = _points >= 30000 ? "Diamond" : _points >= 15000 ? "Platinum" : _points >= 5000 ? "Gold" : "Silver";
 const _tierColor = ({ Silver: "#8f9294", Gold: "#F59E0B", Platinum: "#8B5CF6", Diamond: "#06B6D4" } as Record<string, string>)[_tier];
 const deleteAddress = async (id: string) => { if (await confirmDialog("Xoá địa chỉ này?")) persistAddrs(addresses.filter(a => a.id !== id)); };

 // Bảo mật tài khoản
 const toast = useToast();

 // Thêm / Sửa địa chỉ giao hàng
 const [addrModal, setAddrModal] = useState<null | { id?: string; name: string; phone: string; address: string; label: string }>(null);
 const saveAddress = () => {
   if (!addrModal) return;
   const name = (addrModal.name || "").trim(), phone = (addrModal.phone || "").trim(), address = (addrModal.address || "").trim();
   const verr = validateField("name", name) || validateField("phone", phone) || (!address ? "Vui lòng nhập địa chỉ" : null);
   if (verr) { toast(verr, "warning"); return; }
   const next = addrModal.id
     ? addresses.map(a => a.id === addrModal.id ? { ...a, name, phone, address, label: addrModal.label } : a)
     : [...addresses, { id: "a" + Date.now(), name, phone, address, label: addrModal.label || "Nhà riêng", default: addresses.length === 0 }];
   persistAddrs(next);
   toast(addrModal.id ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ mới");
   setAddrModal(null);
 };

 const [twoFA, setTwoFA] = useState(false);
 const [showPwModal, setShowPwModal] = useState(false);
 const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });
 const savePassword = () => {
   if (!pw.cur || !pw.next) { toast("Vui lòng nhập đủ mật khẩu", "warning"); return; }
   const perr = validateField("password", pw.next);
   if (perr) { toast(perr, "warning"); return; }
   if (pw.next !== pw.confirm) { toast("Mật khẩu xác nhận không khớp", "error"); return; }
   setShowPwModal(false); setPw({ cur: "", next: "", confirm: "" });
   toast("Đổi mật khẩu thành công", "success");
 };
 // Nạp trạng thái 2FA thật từ server
 useEffect(() => { fetch("/api/auth/2fa", { credentials: "include" }).then(r => r.json()).then(d => setTwoFA(!!d?.twoFA)).catch(() => {}); }, []);
 // Luồng cài 2FA bằng app Authenticator (TOTP): bật → quét QR/nhập khoá → nhập mã 6 số xác nhận
 const [twoFASetup, setTwoFASetup] = useState<null | { secret: string; otpauth: string; code: string; err: string; saving: boolean }>(null);
 const toggle2FA = async () => {
   if (twoFA) {
     try { await fetch("/api/auth/2fa", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "disable" }) }); setTwoFA(false); toast("Đã tắt 2FA", "success"); }
     catch { toast("Lỗi tắt 2FA", "warning"); }
   } else {
     try {
       const d = await fetch("/api/auth/2fa", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "setup" }) }).then(r => r.json());
       if (d.secret) setTwoFASetup({ secret: d.secret, otpauth: d.otpauth, code: "", err: "", saving: false });
       else toast("Lỗi khởi tạo 2FA", "warning");
     } catch { toast("Lỗi khởi tạo 2FA", "warning"); }
   }
 };
 const confirm2FA = async () => {
   if (!twoFASetup) return;
   setTwoFASetup(s => s ? { ...s, saving: true, err: "" } : s);
   try {
     const r = await fetch("/api/auth/2fa", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirm", code: twoFASetup.code }) });
     const d = await r.json();
     if (r.ok && d.twoFA) { setTwoFA(true); setTwoFASetup(null); toast("Đã bật 2FA thành công! Lần đăng nhập sau sẽ cần mã từ app.", "success"); }
     else setTwoFASetup(s => s ? { ...s, saving: false, err: d.error || "Mã không đúng" } : s);
   } catch { setTwoFASetup(s => s ? { ...s, saving: false, err: "Lỗi, thử lại" } : s); }
 };

 const provinces = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Bình Dương"];

 return (
 <>
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-14">
 <h1 className="text-lg font-bold text-[#44494d]">{t("profileTitle")}</h1>
 <div className="flex items-center gap-2">
 <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">{lang === "en" ? "Home" : lang === "zh" ? "首页" : "Trang chủ"}</Link>
 <button onClick={handleSave}
 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "text-white"}`}
 style={saved  ? {} : { background: "var(--ap-primary)" }}>{saved ? <>{lang === "zh" ? "✓ 已保存！" : lang === "en" ? "✓ Saved!" : "✓ Đã lưu!"}</> : (lang === "zh" ? "保存更改" : lang === "en" ? "Save changes" : "Lưu thay đổi")}
 </button>
 </div>
 </div>
 </div>

 <div className="p-6">{/* Avatar & tier */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5 flex items-center gap-6">
 <div className="relative">
 <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-4xl border border-gray-100" style={!avatar ? { background: "linear-gradient(135deg, var(--ap-primary), #EA580C)" } : {}}>{avatar ? <img loading="lazy" decoding="async" src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white font-extrabold text-2xl">{form.name.charAt(0).toUpperCase()}</span>}
 </div>
 <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-[#e5e5e5] flex items-center justify-center hover:bg-orange-50 shadow-sm cursor-pointer z-10">
   <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />{uploading ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44494d" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
 </label>
 </div>
 <div className="min-w-0">
 <h2 className="text-xl font-bold text-[#44494d] truncate">{form.name}</h2>
 <div className="flex items-center gap-2 mt-1">
 <span className="px-3 py-0.5 rounded-full text-xs font-bold" style={{ background: `${_tierColor}22`, color: _tierColor }}>{_tier} Member</span>
 <span className="text-xs text-[#8f9294]">{_points.toLocaleString()} điểm</span>
 </div>
 <p className="text-sm text-[#8f9294] mt-1">{orders.length} đơn hàng</p>
 </div>
 </div>{/* Personal info */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5">
 <h3 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> Thông tin cá nhân</h3>
 {err && <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("fullName")}</label>
 <input maxLength={20} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("phone")}</label>
 <input type="tel" inputMode="numeric" maxLength={10} pattern="0[1-9][0-9]{8}" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: clampPhone(e.target.value) }))} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] ${form.phone && !/^0[1-9][0-9]{8}$/.test(form.phone) ? "border-red-400" : "border-[#e5e5e5]"}`} />
 {form.phone && !/^0[1-9][0-9]{8}$/.test(form.phone) && <p className="text-[11px] text-red-500 mt-1">SĐT phải gồm 10 số, bắt đầu 0 và đầu số 1-9</p>}
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Email</label>
 <input type="email" maxLength={100} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] ${form.email && !isEmail(form.email) ? "border-red-400" : "border-[#e5e5e5]"}`} />
 {form.email && !isEmail(form.email) && <p className="text-[11px] text-red-500 mt-1">Email chưa đúng định dạng (vd: ten@gmail.com)</p>}
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Ngày sinh</label>
 <input type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Giới tính</label>
 <div className="flex gap-3">{[["male", "Nam"], ["female", "Nữ"], ["other", "Khác"]].map(([v, l]) => (
 <label key={v} className="flex items-center gap-1.5 cursor-pointer">
 <input type="radio" name="gender" value={v} checked={form.gender === v} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="accent-orange-500" />
 <span className="text-sm text-slate-600">{l}</span>
 </label>))}
 </div>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">Tỉnh/Thành phố</label>
 <select value={form.province} onChange={e => setForm(p => ({ ...p, province: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">{provinces.map(p => <option key={p}>{p}</option>)}
 </select>
 </div>
 </div>
 </div>{/* Saved addresses */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-[#44494d] flex items-center gap-2">{t("shippingAddress")}</h3>
 <button onClick={() => setAddrModal({ name: form.name, phone: form.phone, address: "", label: "Nhà riêng" })} className="text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>+ Thêm địa chỉ</button>
 </div>
 <div className="space-y-3">{addresses.map(addr => (
 <div key={addr.id} className={`p-4 rounded-xl border-2 ${addr.default ? "" : "border-[#f0f0f0]"}`} style={addr.default ? { borderColor: "var(--ap-primary)", background: "#FFF7ED" } : {}}>
 <div className="flex items-start justify-between mb-1">
 <div className="flex items-center gap-2">
 <span className="font-semibold text-[#44494d]">{addr.name}</span>
 <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#f4f4f4] text-[#8f9294]">{addr.label}</span>{addr.default && <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "#FED7AA", color: "#C2410C" }}>Mặc định</span>}
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button onClick={() => setAddrModal({ id: addr.id, name: addr.name, phone: addr.phone, address: addr.address, label: addr.label })} className="text-[#8f9294] hover:text-[#1a4b97] text-xs font-bold" title={t("edit")}>✎</button>
 <button onClick={() => deleteAddress(addr.id)} className="text-red-400 hover:text-red-600 text-xs font-bold" title={t("delete")}>✕</button>
 </div>
 </div>
 <p className="text-sm text-[#8f9294]">{addr.phone}</p>
 <p className="text-sm text-slate-600 break-words">{addr.address}</p>{!addr.default && (
 <button onClick={() => persistAddrs(addresses.map(a => ({ ...a, default: a.id === addr.id })))}
 className="mt-2 text-xs font-semibold" style={{ color: "var(--ap-primary)" }}>Đặt làm mặc định</button>)}
 </div>))}
 </div>
 </div>{/* Account security */}
 <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6">
 <h3 className="font-bold text-[#44494d] mb-4 flex items-center gap-2">Bảo mật tài khoản</h3>
 <div className="space-y-3">
 <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div><p className="font-semibold text-[#44494d] text-sm">Đổi mật khẩu</p><p className="text-xs text-[#8f9294]">Đặt lại mật khẩu đăng nhập</p></div>
 <button onClick={() => setShowPwModal(true)} className="px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm font-medium text-slate-600 hover:bg-white transition-colors">Đổi ngay</button>
 </div>
 <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div><p className="font-semibold text-[#44494d] text-sm">Xác thực hai yếu tố (2FA)</p><p className="text-xs text-[#8f9294]">{twoFA ? "Đã bật — tài khoản an toàn hơn" : "Chưa bật — bảo vệ tài khoản tốt hơn"}</p></div>
 <button onClick={toggle2FA} className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: twoFA ? "#22C55E" : "var(--ap-primary)" }}>{twoFA ? "Đang bật" : "Bật 2FA"}</button>
 </div>
 <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
 <div><p className="font-semibold text-[#44494d] text-sm">Phiên đăng nhập</p><p className="text-xs text-[#8f9294]">Thiết bị này đang đăng nhập</p></div>
 <button onClick={() => toast("Hiện chỉ có thiết bị này đang đăng nhập.", "info")} className="px-3 py-1.5 border border-[#e5e5e5] rounded-lg text-sm font-medium text-slate-600 hover:bg-white transition-colors">Xem tất cả</button>
 </div>
 </div>
 </div>
 </div>
 </main>
 {showPwModal && (
 <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowPwModal(false)}>
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
 <h3 className="font-bold text-[#44494d] mb-4">Đổi mật khẩu</h3>
 <div className="space-y-3">
 <input type="password" value={pw.cur} onChange={e => setPw(p => ({ ...p, cur: e.target.value }))} placeholder="Mật khẩu hiện tại" className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 <input type="password" minLength={8} value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} placeholder="Mật khẩu mới (≥ 8 ký tự)" className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 <input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="Xác nhận mật khẩu mới" className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div className="flex gap-3 mt-5 justify-end">
 <button onClick={() => setShowPwModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">Huỷ</button>
 <button onClick={savePassword} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "var(--ap-primary)" }}>Đổi mật khẩu</button>
 </div>
 </div>
 </div>)}

 {/* Modal cài Xác thực 2 yếu tố (TOTP — Google/Microsoft Authenticator) */}
 {twoFASetup && (
 <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setTwoFASetup(null)}>
 <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
 <h3 className="font-bold text-[#44494d] text-lg mb-1">Bật xác thực 2 yếu tố</h3>
 <p className="text-xs text-[#8f9294] mb-4">Mở app <b>Google Authenticator</b> / <b>Microsoft Authenticator</b> → quét mã QR (hoặc nhập khoá), rồi nhập mã 6 số để xác nhận.</p>
 <div className="flex justify-center mb-3">
 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFASetup.otpauth)}`} alt="QR 2FA" width={180} height={180} className="rounded-lg border border-[#e5e5e5]" />
 </div>
 <p className="text-xs text-[#8f9294] text-center mb-1">Hoặc nhập khoá thủ công:</p>
 <p className="font-mono text-center text-sm font-bold text-[#44494d] bg-slate-50 border border-[#e5e5e5] rounded-lg py-2 mb-4 select-all break-all">{twoFASetup.secret}</p>
 <input value={twoFASetup.code} onChange={e => setTwoFASetup(s => s ? { ...s, code: e.target.value.replace(/\D/g, "").slice(0, 6), err: "" } : s)}
 inputMode="numeric" maxLength={6} placeholder="Nhập mã 6 số"
 className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-center text-lg font-bold tracking-widest focus:outline-none focus:border-[#1a4b97] mb-2" />
 {twoFASetup.err && <p className="text-red-500 text-xs mb-2">{twoFASetup.err}</p>}
 <div className="flex gap-3">
 <button onClick={() => setTwoFASetup(null)} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">Huỷ</button>
 <button onClick={confirm2FA} disabled={twoFASetup.code.length !== 6 || twoFASetup.saving} className="flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>{twoFASetup.saving ? "Đang xác nhận..." : "Xác nhận bật"}</button>
 </div>
 </div>
 </div>)}

 {/* Modal Thêm / Sửa địa chỉ */}
 {addrModal && (
 <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setAddrModal(null)}>
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
 <h3 className="font-bold text-[#44494d] mb-4">{addrModal.id ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
 <div className="space-y-3">
 <div><label className="text-xs font-semibold text-[#8f9294] mb-1 block">Họ tên người nhận *</label>
 <input value={addrModal.name} onChange={e => setAddrModal(m => m && ({ ...m, name: e.target.value }))} maxLength={20} className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" placeholder="Nguyễn Văn A" /></div>
 <div><label className="text-xs font-semibold text-[#8f9294] mb-1 block">Số điện thoại *</label>
 <input value={addrModal.phone} onChange={e => setAddrModal(m => m && ({ ...m, phone: clampPhone(e.target.value) }))} type="tel" inputMode="numeric" maxLength={10} className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" placeholder="09xxxxxxxx" /></div>
 <div><label className="text-xs font-semibold text-[#8f9294] mb-1 block">Địa chỉ *</label>
 <input value={addrModal.address} onChange={e => setAddrModal(m => m && ({ ...m, address: e.target.value }))} className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" /></div>
 <div><label className="text-xs font-semibold text-[#8f9294] mb-1 block">Nhãn</label>
 <select value={addrModal.label} onChange={e => setAddrModal(m => m && ({ ...m, label: e.target.value }))} className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-xl text-sm bg-white focus:outline-none focus:border-[#1a4b97]">
 <option>Nhà riêng</option><option>Văn phòng</option><option>Khác</option></select></div>
 </div>
 <div className="flex gap-3 mt-5 justify-end">
 <button onClick={() => setAddrModal(null)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">Huỷ</button>
 <button onClick={saveAddress} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: "var(--ap-primary)" }}>{addrModal.id ? "Lưu" : "Thêm địa chỉ"}</button>
 </div>
 </div>
 </div>)}
 </>);
}

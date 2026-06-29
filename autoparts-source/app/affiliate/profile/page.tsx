"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, setAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { clampPhone, validateField, FIELD_ATTRS } from "@/lib/validators";
import AffiliateSidebar from "@/components/AffiliateSidebar";

const SETTINGS_KEY = "ap_affiliate_settings";
const CHANNELS: [string, string][] = [
  ["facebook", "Facebook / Fanpage"], ["tiktok", "TikTok Shop"], ["zalo", "Zalo OA"], ["youtube", "YouTube"], ["offline", "Cửa hàng offline"],
];

export default function AffiliateProfilePage() {
  const { t, lang } = useLang();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "Đại lý", email: "", phone: "", channel: "facebook", bio: "" });
  const [avatar, setAvatar] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const u = getAuth();
    if (u) { if (u.avatar) setAvatar(u.avatar); setForm(p => ({ ...p, name: u.name || p.name, email: u.email || p.email })); }
    // Thông tin đầy đủ (SĐT, kênh, giới thiệu) lưu chung với Cài đặt
    try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null"); if (s?.profile) setForm(p => ({ ...p, ...s.profile })); } catch {}
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) { setAvatar(data.url); const u = getAuth(); if (u) { u.avatar = data.url; setAuth(u); window.dispatchEvent(new Event("storage")); } }
    } catch {}
    finally { setUploading(false); }
  };

  const handleSave = () => {
    const verr = validateField("name", form.name) || (form.email ? validateField("email", form.email) : null) || (form.phone ? validateField("phone", form.phone) : null);
    if (verr) { window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: verr, type: "warning" } })); return; }
    // Lưu thông tin đầy đủ vào ap_affiliate_settings.profile (không ghi đè notifs/privacy/payout)
    try { const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") || {}; s.profile = { ...(s.profile || {}), name: form.name, email: form.email, phone: form.phone, channel: form.channel, bio: form.bio }; localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
    // Đồng bộ tên/email vào tài khoản (sidebar + nơi khác hiển thị thống nhất)
    const u = getAuth(); if (u) { u.name = form.name; u.email = form.email; setAuth(u); window.dispatchEvent(new Event("storage")); }
    setSaved(true);
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "已保存资料" : "Đã lưu hồ sơ", type: "success" } }));
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]";

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">{t("accountProfileTitle")}</h1>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">{t("home")}</Link>
            <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "bg-[#1a4b97] text-white"}`}>{saved ? t("savedShort") : t("saveChanges")}</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Identity card */}
          <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6 flex items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-4xl border border-gray-100" style={!avatar ? { background: "linear-gradient(135deg, var(--ap-primary), #0d2d5e)" } : {}}>{avatar ? <img loading="lazy" decoding="async" src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white font-extrabold text-3xl">{(form.name || "?").charAt(0).toUpperCase()}</span>}</div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-[#e5e5e5] flex items-center justify-center hover:bg-orange-50 shadow-sm cursor-pointer z-10">
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />{uploading ? <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44494d" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}
              </label>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[#44494d] truncate">{form.name}</h2>
              <p className="text-sm text-[#8f9294] mt-1 truncate">{form.email} • {t("roleLabel")}: Affiliate</p>
            </div>
          </div>

          {/* Full personal info (gộp từ Cài đặt — đầy đủ hơn) */}
          <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-6">
            <h3 className="font-bold text-[#44494d] mb-4">{t("basicInfo")}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("fullName")}</label>
                <input {...FIELD_ATTRS.name} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("email")}</label>
                <input type="email" maxLength={100} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("phone")}</label>
                <input type="tel" inputMode="numeric" maxLength={10} pattern="0[1-9][0-9]{8}" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: clampPhone(e.target.value) }))} className={inputCls} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("distributionChannel")}</label>
                <select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} className={inputCls}>{CHANNELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("selfIntro")}</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} maxLength={300} className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${saved ? "bg-green-500 text-white" : "bg-gradient-to-r from-[#1a4b97] to-[#0d2d5e] text-white hover:opacity-90 hover:shadow-md"}`}>{saved ? t("savedShort") : t("saveChanges")}</button>
          </div>
        </div>
      </main>
    </>);
}

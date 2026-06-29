"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import SupplierSidebar from "@/components/SupplierSidebar";




type ToggleProps = { checked: boolean; onChange: () => void };
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div onClick={onChange} className="relative rounded-full cursor-pointer transition-colors shrink-0" style={{ width: '44px', minWidth: '44px', height: '24px', background: checked ? 'var(--ap-primary)' : '#CBD5E1' }}>
      <div className="absolute top-[2px] bg-white rounded-full shadow transition-all" style={{ width: '20px', height: '20px', left: checked ? '22px' : '2px' }} />
    </div>
  );
}

function SupplierAvatarUploader({ currentLogo, onUpload }: { currentLogo?: string, onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await fetch("/api/uploads/avatars/supplier-logo.png", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok) onUpload(json.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-xl border border-[#e5e5e5] overflow-hidden flex items-center justify-center bg-[#f8f8fa] shrink-0">
        {currentLogo ? <img src={currentLogo} className="w-full h-full object-cover" /> : <span className="text-[#8f9294] text-xs font-semibold">Logo</span>}
      </div>
      <div>
        <label className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-lg text-sm font-semibold text-[#44494d] cursor-pointer hover:bg-[#f8f8fa] transition-colors">
          {uploading ? "Đang tải lên..." : "Đổi Logo Cửa Hàng"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        <p className="text-xs text-[#8f9294] mt-2">JPG, PNG, WEBP. Tối đa 2MB.</p>
      </div>
    </div>
  );
}

export default function SupplierSettingsPage() {
  const { t, fp, lang } = useLang();
 const [saved, setSaved] = useState(false);
 const [shop, setShop] = useState({ name: (lang === "zh" ? "安泰配件" : "Phụ Tùng An Thái"), phone: "0901234567", email: "anthai.parts@gmail.com", address: (lang === "zh" ? "胡志明市第5区陈富街123号" : "123 Trần Phú, Q5, TP.HCM"), taxCode: "0123456789", logo: "" });
 const [notifs, setNotifs] = useState({ newOrder: true, lowStock: true, payout: true, productReview: false, promo: false });
 const [ops, setOps] = useState({ autoConfirm: false, autoShip: false, sameDay: true });
 const [commission, setCommission] = useState("11.1");

 const handleSave = () => {
 setSaved(true);
 setTimeout(() => setSaved(false), 2000);
 };

 return (
 <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
 <SupplierSidebar active="/supplier/settings" />
 <main className="flex-1 overflow-auto">
 <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
 <div className="flex items-center justify-between px-6 h-16">
 <h1 className="text-xl font-bold text-[#44494d]">{t('supplierSettings')}</h1>
 <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${saved ? "bg-green-500 text-white" : "text-white"}`} style={saved  ? {} : { background: "var(--ap-primary)" }}>
 {saved ? t('savedSuccess') : t('saveSettings')}
 </button>
 </div>
 </div>

 <div className="p-6 max-w-2xl space-y-5">
 {/* Shop info */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> {t('storeInfo')}</h2>
 <SupplierAvatarUploader currentLogo={shop.logo} onUpload={(url) => setShop(p => ({ ...p, logo: url }))} />
 <div className="grid md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('storeName')}</label>
 <input value={shop.name} onChange={e => setShop(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("phone")}</label>
 <input value={shop.phone} onChange={e => setShop(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("contactEmail")}</label>
 <input type="email" value={shop.email} onChange={e => setShop(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('taxCode')}</label>
 <input value={shop.taxCode} onChange={e => setShop(p => ({ ...p, taxCode: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 <div className="md:col-span-2">
 <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('warehouseAddress')}</label>
 <input value={shop.address} onChange={e => setShop(p => ({ ...p, address: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
 </div>
 </div>

 {/* Commission info */}
 <div className="mt-4 p-4 rounded-xl" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
 <div className="flex items-center justify-between">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{t('currentPlatformFee')}</p>
 <p className="text-xs text-[#8f9294]">{t('agreedWithPlatform')}</p>
 </div>
 <div className="text-right">
 <p className="text-2xl font-extrabold" style={{ color: "var(--ap-primary)" }}>{commission}%</p>
 <p className="text-xs text-[#8f9294]">{t('ofTotalGMV')}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Operations */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2">{t('automatedOperations')}</h2>
 <div className="space-y-0">
 {[
 ["autoConfirm", t('autoConfirmOrder'), t('autoConfirmOrderDesc')],
 ["autoShip", t('autoUpdateShipping'), t('autoUpdateShippingDesc')],
 ["sameDay", t('sameDayDelivery'), t('sameDayDeliveryDesc')],
 ].map(([key, label, desc]) => (
 <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
 <div>
 <p className="font-semibold text-[#44494d] text-sm">{label}</p>
 <p className="text-xs text-[#8f9294]">{desc}</p>
 </div>
 <Toggle checked={ops[key as keyof typeof ops]} onChange={() => setOps(p => ({ ...p, [key]: !p[key as keyof typeof ops] }))} />
 </div>
 ))}
 </div>
 </div>

 {/* Notifications */}
 <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
 <h2 className="font-bold text-[#44494d] mb-4 flex items-center gap-2"> {t('notifications')}</h2>
 <div className="space-y-0">
 {[
 ["newOrder", t('newOrder'), t('newOrderDesc')],
 ["lowStock", t('lowStockWarn'), t('lowStockWarnDesc')],
 ["payout", t('payoutAlert'), t('payoutAlertDesc')],
 ["productReview", t('productGotReview'), t('productGotReviewDesc')],
 ["promo", t('flashSalePromo'), t('flashSalePromoDesc')],
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

 {/* Danger zone */}
 <div className="bg-white rounded-2xl border border-red-100 p-5">
 <h2 className="font-bold text-red-600 mb-3 flex items-center gap-2"> {t('suspendOperations')}</h2>
 <p className="text-xs text-[#8f9294] mb-3">{t('suspendOperationsDesc')}</p>
 <button className="px-4 py-2 border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50">{t('requestSuspendStore')}</button>
 </div>
 </div>
 </main>
 </div>
 );
}

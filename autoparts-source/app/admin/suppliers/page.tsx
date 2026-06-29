"use client";
import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { validateField } from "@/lib/validators";
import Pagination from "@/components/Pagination";
import { useLang } from "@/lib/i18n";

interface Supplier {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  totalProducts?: number;
  totalOrders?: number;
  responseRate?: number;
  verified?: boolean;
  active?: boolean;
  email?: string;
  phone?: string;
}

const BLANK: Partial<Supplier> = {
  name: "", logo: "", description: "", rating: 4.8, reviewCount: 0,
  totalProducts: 0, totalOrders: 0, responseRate: 95, verified: true, active: true,
};

function SupplierModal({ sup, onClose, onSaved }: { sup: Partial<Supplier> | null; onClose: () => void; onSaved: () => void; }) {
  const [form, setForm] = useState<Partial<Supplier>>({ ...BLANK, ...sup });
  const [busy, setBusy] = useState(false);
  const { t, lang } = useLang();
  const isEdit = !!sup?.id;
  const set = (k: keyof Supplier, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    const err = validateField("name", form.name || "") || (form.email ? validateField("email", form.email) : null);
    if (err) { window.alert(err); return; }
    setBusy(true);
    try {
      const body = {
        ...form,
        rating: Number(form.rating) || 0,
        reviewCount: Number(form.reviewCount) || 0,
        totalProducts: Number(form.totalProducts) || 0,
        totalOrders: Number(form.totalOrders) || 0,
        responseRate: Number(form.responseRate) || 0,
      };
      if (isEdit) await fetch(`/api/suppliers/${sup!.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      else await fetch(`/api/suppliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: isEdit ? t("savedSuccess") : t("success"), type: "success" } }));
      onSaved(); onClose();
    } catch { window.alert(t("error")); }
    finally { setBusy(false); }
  };

  const inp = "w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]";
  const lockInp = "w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm bg-[#f4f4f4] text-[#8f9294] cursor-not-allowed";
  const lab = "block text-xs font-semibold text-[#8f9294] mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative max-h-[92vh] overflow-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-slate-600 text-xl font-bold">✕</button>
        <h2 className="text-lg font-bold text-[#44494d] mb-5">{isEdit ? t("edit") : t("add")} {t("adminSuppliers")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className={lab}>{t("userName")} <span className="text-red-500">*</span></label>
            <input value={form.name || ""} onChange={e => set("name", e.target.value)} maxLength={80} className={inp} placeholder="Phụ Tùng An Thái" /></div>
          <div className="col-span-2"><label className={lab}>Logo (URL)</label>
            <input value={form.logo || ""} onChange={e => set("logo", e.target.value)} className={inp} placeholder="https://... hoặc /ap-assets/..." /></div>
          <div className="col-span-2"><label className={lab}>{t("description")}</label>
            <input value={form.description || ""} onChange={e => set("description", e.target.value)} className={inp} placeholder="Chuyên phụ tùng chính hãng..." /></div>
          <div className="col-span-2 text-[11px] text-[#8f9294] bg-[#f8f8fa] rounded-lg px-3 py-2 -mb-1">
            🔒 <b>{t("rating")} / {t("review")} / {t("product")} / {t("order")}</b>: {t("notUpdated")}
          </div>
          <div><label className={lab}>{t("rating")} (0-5)</label>
            <input type="number" value={form.rating ?? 0} disabled readOnly className={lockInp} /></div>
          <div><label className={lab}>{t("reviewCount" as any) || t("review")}</label>
            <input type="number" value={form.reviewCount ?? 0} disabled readOnly className={lockInp} /></div>
          <div><label className={lab}>{t("totalProducts")}</label>
            <input type="number" value={form.totalProducts ?? 0} disabled readOnly className={lockInp} /></div>
          <div><label className={lab}>{t("totalOrders")}</label>
            <input type="number" value={form.totalOrders ?? 0} disabled readOnly className={lockInp} /></div>
          <div><label className={lab}>{t("responseRate" as any) || "Tỉ lệ phản hồi (%)"}</label>
            <input type="number" value={form.responseRate ?? 0} disabled readOnly className={lockInp} /></div>
          <div><label className={lab}>{t("email")}</label>
            <input type="email" value={form.email || ""} onChange={e => set("email", e.target.value)} className={inp} placeholder="supplier@email.com" /></div>
          <label className="flex items-center gap-2 text-sm text-[#44494d] cursor-pointer"><input type="checkbox" checked={!!form.verified} onChange={e => set("verified", e.target.checked)} className="accent-[#1a4b97]" /> {t("verified")}</label>
          <label className="flex items-center gap-2 text-sm text-[#44494d] cursor-pointer"><input type="checkbox" checked={form.active !== false} onChange={e => set("active", e.target.checked)} className="accent-[#1a4b97]" /> {t("active")}</label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
          <button onClick={save} disabled={busy} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--ap-primary)" }}>{busy ? t("loading") : (isEdit ? t("saveChanges") : t("add"))}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSuppliersPage() {
  const [list, setList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Supplier> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [q, setQ] = useState("");
  const { t, lang } = useLang();

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/suppliers?all=1").then(r => r.json()).then(d => setList(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleActive = async (s: Supplier) => {
    await fetch(`/api/suppliers/${s.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: s.active === false }) });
    load();
  };

  const filtered = list.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()));

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <div>
              <h1 className="text-xl font-bold text-[#44494d]">{t("adminSuppliers")} ({list.length})</h1>
              <p className="text-xs text-[#8f9294]">{t("notUpdated" as any) ? t("adminSuppliers") : "Dữ liệu hiển thị trực tiếp ở trang /suppliers"}</p>
            </div>
            <div className="flex items-center gap-2">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={t("searchGeneric")} className="w-52 px-3 py-2 rounded-lg text-sm border border-[#e5e5e5] focus:outline-none focus:border-[#1a4b97]" />
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="px-4 py-2 rounded-lg text-white text-sm font-semibold whitespace-nowrap" style={{ background: "var(--ap-primary)" }}>+ {t("adminSuppliers")}</button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
            {loading ? <div className="text-center py-16 text-[#8f9294]">{t("loading")}</div> : filtered.length === 0 ? (
              <div className="text-center py-16 text-[#8f9294]"><p className="font-semibold">{t("noData")}</p><p className="text-sm">{t("add")} {t("adminSuppliers")}</p></div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[#8f9294] border-b border-[#f0f0f0] text-xs uppercase">
                  <th className="px-4 py-3">{t("adminSuppliers")}</th><th className="px-4 py-3">{t("rating")}</th><th className="px-4 py-3">{t("product")}</th><th className="px-4 py-3">{t("order")}</th><th className="px-4 py-3">{t("status")}</th><th className="px-4 py-3">{t("status")}</th><th className="px-4 py-3 text-right">{t("action")}</th>
                </tr></thead>
                <tbody>{paged.map(s => (
                  <tr key={s.id} className="border-b border-[#f7f7f7] hover:bg-[#fafbfc]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#f0f4ff] border border-gray-100 shrink-0 flex items-center justify-center text-[#1a4b97] font-bold text-xs">{s.logo ? <img src={s.logo} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : s.name.charAt(0)}</div>
                        <div><p className="font-semibold text-[#44494d]">{s.name}</p>{s.verified && <span className="text-[10px] text-green-600 font-semibold">✓ {t("verified")}</span>}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#44494d]">★ {s.rating ?? 0} <span className="text-[#8f9294] text-xs">({s.reviewCount ?? 0})</span></td>
                    <td className="px-4 py-3 text-[#44494d]">{s.totalProducts ?? 0}</td>
                    <td className="px-4 py-3 text-[#44494d]">{s.totalOrders ?? 0}</td>
                    <td className="px-4 py-3 text-[#44494d]">{s.responseRate ?? 0}%</td>
                    <td className="px-4 py-3">{s.active === false ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#f4f4f4] text-[#8f9294]">{t("inactive")}</span> : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{t("active")}</span>}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => { setEditing(s); setShowModal(true); }} className="text-[#1a4b97] font-semibold hover:underline mr-3">{t("edit")}</button>
                      <button onClick={() => toggleActive(s)} className="text-[#8f9294] font-semibold hover:underline">{s.active === false ? t("enable") : t("disable")}</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            <Pagination page={pageSafe} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} unit={lang === "en" ? "Suppliers" : lang === "zh" ? "供应商" : "NCC"} />
          </div>
        </div>
      </main>
      {showModal && <SupplierModal sup={editing} onClose={() => setShowModal(false)} onSaved={load} />}
    </>
  );
}



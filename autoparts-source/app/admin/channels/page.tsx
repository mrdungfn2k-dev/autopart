"use client";
import { confirmDialog } from "@/components/ConfirmDialog";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";
import { useLang } from "@/lib/i18n";

const ENDPOINT = "/api/channels";

interface Item { id: string; [k: string]: any; }

export default function AdminListPage() {
  const { t, lang } = useLang();
  const [list, setList] = useState<Item[]>([]);
  const pg = usePaged(list, 12);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [toast, setToast] = useState("");

  const TITLE = lang === "en" ? "Sales Channels" : lang === "zh" ? "销售渠道" : "Kênh bán";

  const FIELDS = [
    { key: "code", label: lang === "en" ? "Code" : lang === "zh" ? "代码" : "Mã", type: "text", required: true, placeholder: "shopee" },
    { key: "name", label: lang === "en" ? "Channel Name" : lang === "zh" ? "渠道名称" : "Tên kênh", type: "text", required: true },
    { key: "type", label: lang === "en" ? "Channel Type" : lang === "zh" ? "渠道类型" : "Loại kênh", type: "select", options: [
      { value: "web", label: "Web (storefront)" },
      { value: "marketplace", label: lang === "en" ? "Marketplace" : lang === "zh" ? "电商平台" : "Sàn TMĐT" },
      { value: "social", label: lang === "en" ? "Social Media" : lang === "zh" ? "社交媒体" : "Mạng xã hội" },
      { value: "pos", label: lang === "en" ? "Physical Store (POS)" : lang === "zh" ? "实体店 (POS)" : "Cửa hàng vật lý (POS)" },
    ] },
    { key: "url", label: "URL", type: "text", placeholder: "https://..." },
    { key: "isDefault", label: lang === "en" ? "Default Channel" : lang === "zh" ? "默认渠道" : "Kênh mặc định", type: "boolean" },
    { key: "active", label: lang === "en" ? "Active" : lang === "zh" ? "活跃" : "Đang hoạt động", type: "boolean", default: true },
  ];

  function load() {
    setLoading(true);
    fetch(ENDPOINT, { credentials: "include" }).then(r => r.ok ? r.json() : []).then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);
  function showToastMsg(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function openNew() {
    const initial: Item = { id: "" };
    FIELDS.forEach((f: any) => { initial[f.key] = f.type === "boolean" ? (f.default ?? false) : f.type === "number" ? 0 : ""; });
    setEditing(initial); setShowForm(true);
  }
  function openEdit(it: Item) { setEditing({ ...it }); setShowForm(true); }

  async function handleSave() {
    if (!editing) return;
    const isEdit = !!editing.id;
    const url = isEdit ? `${ENDPOINT}/${editing.id}` : ENDPOINT;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (res.ok) { setShowForm(false); setEditing(null); load(); showToastMsg(isEdit ? t("savedSuccess") : t("success")); }
    else showToastMsg(t("error"));
  }
  async function handleDelete(id: string) {
    if (!(await confirmDialog(lang === "en" ? "Delete this item?" : lang === "zh" ? "删除此项？" : "Xoá mục này?"))) return;
    const res = await fetch(`${ENDPOINT}/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { load(); showToastMsg(lang === "en" ? "Deleted" : lang === "zh" ? "已删除" : "Đã xoá"); }
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">{TITLE} ({list.length})</h1>
          <button onClick={openNew} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ {lang === "en" ? "Create" : lang === "zh" ? "新建" : "Tạo mới"}</button>
        </div>
        <div className="p-6">{loading ? <div className="text-center py-16 text-[#8f9294]">{t("loading")}</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">{t("noData")}</div>) : (
            <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">{FIELDS.map((f: any) => <th key={f.key} className="px-4 py-3 font-semibold">{f.label}</th>)}
                  <th className="px-4 py-3 font-semibold text-right sticky right-0 bg-[#f8f8fa]">{t("action")}</th>
                </tr></thead>
                <tbody>{pg.paged.map((it, i) => (
                    <tr key={it.id} className={i % 2 ? "bg-[#fafafa]" : ""}>{FIELDS.map((f: any) => (
                        <td key={f.key} className="px-4 py-3">{f.type === "boolean" ? (it[f.key] ? "✓" : "—") :
                            f.type === "array" ? (Array.isArray(it[f.key]) ? it[f.key].join(", ") : "—") :
                            f.format === "currency" ? (it[f.key] ?? 0).toLocaleString("vi-VN") + "₫" :
                            it[f.key] ?? "—"}
                        </td>))}
                      <td className="px-4 py-3 text-right whitespace-nowrap sticky right-0 bg-white">
                        <button onClick={() => openEdit(it)} className="px-2 py-1 text-xs font-semibold border border-[#e5e5e5] rounded mr-1 hover:bg-[#f4f4f4]">{t("edit")}</button>
                        <button onClick={() => handleDelete(it.id)} className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">{t("delete")}</button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
              </div>
            </div>)}
          {list.length > 0 && <Pagination {...pg.bind} />}
        </div>{showForm && editing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-[#44494d] mb-4">{editing.id ? t("edit") : (lang === "en" ? "Create" : lang === "zh" ? "新建" : "Tạo")} {TITLE}</h2>
              <div className="space-y-3">{FIELDS.map((f: any) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}{f.required ? " *" : ""}</label>{f.type === "boolean" ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!editing[f.key]} onChange={e => setEditing({ ...editing, [f.key]: e.target.checked })} className="w-4 h-4" />
                        <span className="text-sm">{f.label}</span>
                      </label>) : f.type === "select" ? (
                      <select value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm">{(f.options || []).map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>) : f.type === "array" ? (
                      <textarea value={Array.isArray(editing[f.key]) ? editing[f.key].join("\n") : ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value.split("\n").filter(Boolean) })} rows={3} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm font-mono text-xs" placeholder={lang === "en" ? "One value per line" : lang === "zh" ? "每行一个值" : "Mỗi giá trị 1 dòng"} />) : f.type === "number" ? (
                      <input type="number" min="0" step={(f as any).step ?? "any"} value={editing[f.key] ?? 0} onChange={e => setEditing({ ...editing, [f.key]: Number(e.target.value) })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />) : (
                      <input value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" placeholder={f.placeholder ?? ""} />)}
                  </div>))}
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#e5e5e5]">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">{t("cancel")}</button>
                <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-bold text-white" style={{ background: "var(--ap-primary)" }}>{t("saveBtn")}</button>
              </div>
            </div>
          </div>)}
        {toast && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">{toast}</div>}
      </main>
    </>);
}

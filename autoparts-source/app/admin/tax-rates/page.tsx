"use client";
import { confirmDialog } from "@/components/ConfirmDialog";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";`nimport { useLang } from "@/lib/i18n";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";`nimport { useLang } from "@/lib/i18n";

const ENDPOINT = "/api/tax-rates";
const TITLE = "Loáº¡i thuáº¿";
const SLUG = "tax-rates";
const FIELDS = [
    { key: "name", label: "TÃªn thuáº¿", type: "text", required: true, placeholder: "VAT 10%" },
    { key: "rate", label: "Thuáº¿ suáº¥t (%)", type: "number", step: "0.1", required: true },
    { key: "isDefault", label: "Máº·c Ä‘á»‹nh toÃ n site", type: "boolean" },
    { key: "categoryIds", label: "Ãp dá»¥ng danh má»¥c (id, má»—i dÃ²ng 1 cÃ¡i)", type: "array" },
  ];

interface Item { id: string; [k: string]: any; }

export default function AdminListPage() {
  const { t, lang } = useLang();`n  const [list, setList] = useState<Item[]>([]);
  const pg = usePaged(list, 12);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [toast, setToast] = useState("");

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
    if (res.ok) { setShowForm(false); setEditing(null); load(); showToastMsg(isEdit ? "ÄÃ£ cáº­p nháº­t" : "ÄÃ£ táº¡o"); }
    else showToastMsg("Lá»—i");
  }
  async function handleDelete(id: string) {
    if (!(await confirmDialog("XoÃ¡ má»¥c nÃ y?"))) return;
    const res = await fetch(`${ENDPOINT}/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { load(); showToastMsg("ÄÃ£ xoÃ¡"); }
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">{TITLE} ({list.length})</h1>
          <button onClick={openNew} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ Táº¡o má»›i</button>
        </div>
        <div className="p-6">{loading ? <div className="text-center py-16 text-[#8f9294]">Äang táº£i...</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">ChÆ°a cÃ³ má»¥c nÃ o.</div>) : (
            <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">{FIELDS.map((f: any) => <th key={f.key} className="px-4 py-3 font-semibold">{f.label}</th>)}
                  <th className="px-4 py-3 font-semibold text-right">HÃ nh Ä‘á»™ng</th>
                </tr></thead>
                <tbody>{pg.paged.map((it, i) => (
                    <tr key={it.id} className={i % 2 ? "bg-[#fafafa]" : ""}>{FIELDS.map((f: any) => (
                        <td key={f.key} className="px-4 py-3">{f.type === "boolean" ? (it[f.key] ? "âœ“" : "â€”") :
                            f.type === "array" ? (Array.isArray(it[f.key]) ? it[f.key].join(", ") : "â€”") :
                            f.format === "currency" ? (it[f.key] ?? 0).toLocaleString("vi-VN") + "â‚«" :
                            it[f.key] ?? "â€”"}
                        </td>))}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(it)} className="px-2 py-1 text-xs font-semibold border border-[#e5e5e5] rounded mr-1 hover:bg-[#f4f4f4]">Sá»­a</button>
                        <button onClick={() => handleDelete(it.id)} className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">XoÃ¡</button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
          {list.length > 0 && <Pagination {...pg.bind} />}
        </div>{showForm && editing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-[#44494d] mb-4">{editing.id ? "Sá»­a" : "Táº¡o"} {TITLE}</h2>
              <div className="space-y-3">{FIELDS.map((f: any) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">{f.label}{f.required ? " *" : ""}</label>{f.type === "boolean" ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!editing[f.key]} onChange={e => setEditing({ ...editing, [f.key]: e.target.checked })} className="w-4 h-4" />
                        <span className="text-sm">{f.label}</span>
                      </label>) : f.type === "select" ? (
                      <select value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm">{(f.options || []).map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>) : f.type === "array" ? (
                      <textarea value={Array.isArray(editing[f.key]) ? editing[f.key].join("\n") : ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value.split("\n").filter(Boolean) })} rows={3} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm font-mono text-xs" placeholder="Má»—i giÃ¡ trá»‹ 1 dÃ²ng" />) : f.type === "number" ? (
                      <input type="number" min="0" step={f.step ?? "any"} value={editing[f.key] ?? 0} onChange={e => setEditing({ ...editing, [f.key]: Number(e.target.value) })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />) : (
                      <input value={editing[f.key] ?? ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" placeholder={f.placeholder ?? ""} />)}
                  </div>))}
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[#e5e5e5]">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">Huá»·</button>
                <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-bold text-white" style={{ background: "var(--ap-primary)" }}>LÆ°u</button>
              </div>
            </div>
          </div>)}
        {toast && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">{toast}</div>}
      </main>
    </>);
}


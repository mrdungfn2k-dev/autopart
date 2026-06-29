"use client";
import { useEffect, useState } from "react";

interface Synonym { id: string; term: string; synonyms: string[]; active: boolean; }

export default function AdminSynonymsPage() {
  const { t, lang } = useLang();`n  const [list, setList] = useState<Synonym[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Synonym | null>(null);
  const [toast, setToast] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/search-synonyms").then(r => r.json()).then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function showToastMsg(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function openNew() { setEditing({ id: "", term: "", synonyms: [], active: true }); setShowForm(true); }
  function openEdit(s: Synonym) { setEditing({ ...s }); setShowForm(true); }
  async function handleSave() {
    if (!editing) return;
    const isEdit = !!editing.id;
    const url = isEdit ? `/api/search-synonyms/${editing.id}` : "/api/search-synonyms";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (res.ok) { setShowForm(false); setEditing(null); load(); showToastMsg(isEdit ? "ÄÃ£ cáº­p nháº­t" : "ÄÃ£ táº¡o"); }
    else showToastMsg("Lá»—i");
  }
  async function handleDelete(id: string) {
    if (!confirm("XoÃ¡ tá»« Ä‘á»“ng nghÄ©a nÃ y?")) return;
    await fetch(`/api/search-synonyms/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">Tá»« Ä‘á»“ng nghÄ©a tÃ¬m kiáº¿m ({list.length})</h1>
          <button onClick={openNew} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ ThÃªm</button>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#8f9294] mb-4">Khi khÃ¡ch tÃ¬m 1 tá»« á»Ÿ storefront, há»‡ thá»‘ng má»Ÿ rá»™ng sang cÃ¡c tá»« Ä‘á»“ng nghÄ©a. VD: tÃ¬m "loc dau" â†’ khá»›p cáº£ "lá»c dáº§u", "oil filter".</p>
          {loading ? <div className="text-center py-16 text-[#8f9294]">Äang táº£i...</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">ChÆ°a cÃ³ tá»« Ä‘á»“ng nghÄ©a nÃ o.</div>
          ) : (
            <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">
                  <th className="px-4 py-3 font-semibold">Tá»« chÃ­nh</th>
                  <th className="px-4 py-3 font-semibold">Äá»“ng nghÄ©a</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3 font-semibold text-right">HÃ nh Ä‘á»™ng</th>
                </tr></thead>
                <tbody>
                  {list.map((s, i) => (
                    <tr key={s.id} className={i % 2 ? "bg-[#fafafa]" : ""}>
                      <td className="px-4 py-3 font-semibold">{s.term}</td>
                      <td className="px-4 py-3 text-[#8f9294]">{s.synonyms.join(", ")}</td>
                      <td className="px-4 py-3">{s.active ? "âœ“" : "â€”"}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(s)} className="px-2 py-1 text-xs font-semibold border border-[#e5e5e5] rounded mr-1 hover:bg-[#f4f4f4]">Sá»­a</button>
                        <button onClick={() => handleDelete(s.id)} className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">XoÃ¡</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {showForm && editing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-[#44494d] mb-4">{editing.id ? "Sá»­a" : "ThÃªm"} tá»« Ä‘á»“ng nghÄ©a</h2>
              <div className="space-y-3">
                <input value={editing.term} onChange={e => setEditing({ ...editing, term: e.target.value })} placeholder="Tá»« chÃ­nh (VD: lá»c dáº§u)" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
                <textarea value={editing.synonyms.join("\n")} onChange={e => setEditing({ ...editing, synonyms: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} rows={4} placeholder="Äá»“ng nghÄ©a, má»—i dÃ²ng 1 tá»«&#10;loc dau&#10;oil filter&#10;lá»c nhá»›t" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm font-mono text-xs" />
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4" />
                  <span>Äang hoáº¡t Ä‘á»™ng</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">Huá»·</button>
                <button onClick={handleSave} disabled={!editing.term} className="px-4 py-2 rounded text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>LÆ°u</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">{toast}</div>}
      </main>
    </>
  );
}


"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

interface Synonym { id: string; term: string; synonyms: string[]; active: boolean; }

export default function AdminSynonymsPage() {
  const { t, lang } = useLang();
  const [list, setList] = useState<Synonym[]>([]);
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
    if (res.ok) { setShowForm(false); setEditing(null); load(); showToastMsg(isEdit ? "Đã cập nhật" : "Đã tạo"); }
    else showToastMsg("Lỗi");
  }
  async function handleDelete(id: string) {
    if (!confirm("Xoá từ đồng nghĩa này?")) return;
    await fetch(`/api/search-synonyms/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">Từ đồng nghĩa tìm kiếm ({list.length})</h1>
          <button onClick={openNew} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ Thêm</button>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#8f9294] mb-4">Khi khách tìm 1 từ ở storefront, hệ thống mở rộng sang các từ đồng nghĩa. VD: tìm "loc dau" → khớp cả "lọc dầu", "oil filter".</p>
          {loading ? <div className="text-center py-16 text-[#8f9294]">Đang tải...</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">Chưa có từ đồng nghĩa nào.</div>
          ) : (
            <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">
                  <th className="px-4 py-3 font-semibold">Từ chính</th>
                  <th className="px-4 py-3 font-semibold">Đồng nghĩa</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3 font-semibold text-right">Hành động</th>
                </tr></thead>
                <tbody>
                  {list.map((s, i) => (
                    <tr key={s.id} className={i % 2 ? "bg-[#fafafa]" : ""}>
                      <td className="px-4 py-3 font-semibold">{s.term}</td>
                      <td className="px-4 py-3 text-[#8f9294]">{s.synonyms.join(", ")}</td>
                      <td className="px-4 py-3">{s.active ? "✓" : "—"}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(s)} className="px-2 py-1 text-xs font-semibold border border-[#e5e5e5] rounded mr-1 hover:bg-[#f4f4f4]">Sửa</button>
                        <button onClick={() => handleDelete(s.id)} className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">Xoá</button>
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
              <h2 className="text-lg font-bold text-[#44494d] mb-4">{editing.id ? "Sửa" : "Thêm"} từ đồng nghĩa</h2>
              <div className="space-y-3">
                <input value={editing.term} onChange={e => setEditing({ ...editing, term: e.target.value })} placeholder="Từ chính (VD: lọc dầu)" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
                <textarea value={editing.synonyms.join("\n")} onChange={e => setEditing({ ...editing, synonyms: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} rows={4} placeholder="Đồng nghĩa, mỗi dòng 1 từ&#10;loc dau&#10;oil filter&#10;lọc nhớt" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm font-mono text-xs" />
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={editing.active} onChange={e => setEditing({ ...editing, active: e.target.checked })} className="w-4 h-4" />
                  <span>Đang hoạt động</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">Huỷ</button>
                <button onClick={handleSave} disabled={!editing.term} className="px-4 py-2 rounded text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>Lưu</button>
              </div>
            </div>
          </div>
        )}
        {toast && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">{toast}</div>}
      </main>
    </>
  );
}


"use client";
import { confirmDialog } from "@/components/ConfirmDialog";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";`nimport { useLang } from "@/lib/i18n";

interface Attribute {
  id: string;
  name: string;
  type: "text" | "number" | "select";
  options?: string[];
  unit?: string;
}

interface AttributeSet {
  id: string;
  name: string;
  categoryId?: string;
  attributes: Attribute[];
  createdAt?: string;
}

export default function AdminAttributeSetsPage() {
  const [sets, setSets] = useState<AttributeSet[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AttributeSet | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/attribute-sets")
      .then(r => r.json())
      .then(d => { setSets(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
  }
  useEffect(() => { load(); }, []);

  function showToastMsg(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function openNew() {
    setEditing({ id: "", name: "", categoryId: undefined, attributes: [{ id: "a1", name: "", type: "text" }] });
    setShowForm(true);
  }
  function openEdit(s: AttributeSet) {
    setEditing(JSON.parse(JSON.stringify(s)));
    setShowForm(true);
  }
  async function handleSave() {
    if (!editing) return;
    const isEdit = !!editing.id;
    const url = isEdit ? `/api/attribute-sets/${editing.id}` : "/api/attribute-sets";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setShowForm(false); setEditing(null); load();
      showToastMsg(isEdit ? "ÄÃ£ cáº­p nháº­t" : "ÄÃ£ táº¡o bá»™ thuá»™c tÃ­nh");
    } else {
      showToastMsg("Lá»—i");
    }
  }
  async function handleDelete(id: string) {
    if (!(await confirmDialog("XoÃ¡ bá»™ thuá»™c tÃ­nh nÃ y?"))) return;
    const res = await fetch(`/api/attribute-sets/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) { load(); showToastMsg("ÄÃ£ xoÃ¡"); }
  }

  function addAttr() {
    if (!editing) return;
    const next = [...editing.attributes, { id: `a${editing.attributes.length + 1}`, name: "", type: "text" as const }];
    setEditing({ ...editing, attributes: next });
  }
  function rmAttr(i: number) {
    if (!editing) return;
    setEditing({ ...editing, attributes: editing.attributes.filter((_, idx) => idx !== i) });
  }
  function updateAttr(i: number, patch: Partial<Attribute>) {
    if (!editing) return;
    const next = [...editing.attributes];
    next[i] = { ...next[i], ...patch };
    setEditing({ ...editing, attributes: next });
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">Bá»™ thuá»™c tÃ­nh sáº£n pháº©m <span className="text-[#8f9294] font-normal">({sets.length})</span></h1>
            <button onClick={openNew} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ Táº¡o bá»™ thuá»™c tÃ­nh</button>
          </div>
        </div>

        <div className="p-6">{loading ? (
            <div className="text-center py-16 text-[#8f9294]">Äang táº£i...</div>) : sets.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">
              <p className="font-semibold">ChÆ°a cÃ³ bá»™ thuá»™c tÃ­nh nÃ o</p>
              <p className="text-sm mt-1">Bá»™ thuá»™c tÃ­nh giÃºp gáº¯n cÃ¡c thÃ´ng sá»‘ ká»¹ thuáº­t cho tá»«ng nhÃ³m sáº£n pháº©m.</p>
            </div>) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{sets.map(s => {
                const cat = categories.find((c: any) => c.id === s.categoryId);
                return (
                  <div key={s.id} className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-[#44494d]">{s.name}</p>{cat && <p className="text-xs text-[#8f9294]">Danh má»¥c: {cat.name}</p>}
                      </div>
                      <span className="text-xs text-[#8f9294] font-mono">{s.id}</span>
                    </div>
                    <ul className="space-y-1 mb-3">{s.attributes.map(a => (
                        <li key={a.id} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#f4f4f4] font-mono text-[10px]">{a.type}</span>
                          <span className="font-semibold">{a.name}</span>{a.unit && <span className="text-[#8f9294]">({a.unit})</span>}
                          {a.options && <span className="text-[#8f9294]">[{a.options.length} options]</span>}
                        </li>))}
                    </ul>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="px-3 py-1 rounded text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4]">Sá»­a</button>
                      <button onClick={() => handleDelete(s.id)} className="px-3 py-1 rounded text-xs font-semibold text-red-600 hover:bg-red-50">XoÃ¡</button>
                    </div>
                  </div>);
              })}
            </div>)}
        </div>{showForm && editing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditing(null); }}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-[#e5e5e5] px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#44494d]">{editing.id ? "Sá»­a" : "Táº¡o"} bá»™ thuá»™c tÃ­nh</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-2xl text-[#8f9294] hover:text-[#44494d]">Ã—</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">TÃªn bá»™ thuá»™c tÃ­nh *</label>
                  <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" placeholder="VD: Bugi Ä‘Ã¡nh lá»­a" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Ãp dá»¥ng cho danh má»¥c</label>
                  <select value={editing.categoryId || ""} onChange={e => setEditing({ ...editing, categoryId: e.target.value || undefined })} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm">
                    <option value="">â€” Báº¥t ká»³ danh má»¥c â€”</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-600">Thuá»™c tÃ­nh ({editing.attributes.length})</label>
                    <button onClick={addAttr} className="text-xs px-2 py-1 rounded bg-[#1a4b97] text-white">+ ThÃªm</button>
                  </div>
                  <div className="space-y-2">{editing.attributes.map((a, i) => (
                      <div key={i} className="border border-[#e5e5e5] rounded p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <input value={a.name} onChange={e => updateAttr(i, { name: e.target.value })} className="flex-1 px-2 py-1 border border-[#e5e5e5] rounded text-sm" placeholder="TÃªn thuá»™c tÃ­nh (VD: Khoáº£ng cÃ¡ch Ä‘iá»‡n cá»±c)" />
                          <select value={a.type} onChange={e => updateAttr(i, { type: e.target.value as any })} className="px-2 py-1 border border-[#e5e5e5] rounded text-sm">
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="select">Select</option>
                          </select>
                          <button onClick={() => rmAttr(i)} className="text-red-500 px-2">Ã—</button>
                        </div>{a.type === "number" && (
                          <input value={a.unit || ""} onChange={e => updateAttr(i, { unit: e.target.value })} className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-xs" placeholder="ÄÆ¡n vá»‹ (VD: mm, kg, %)" />)}
                        {a.type === "select" && (
                          <textarea value={(a.options || []).join("\n")} onChange={e => updateAttr(i, { options: e.target.value.split("\n").filter(Boolean) })} className="w-full px-2 py-1 border border-[#e5e5e5] rounded text-xs font-mono" rows={3} placeholder="Má»—i giÃ¡ trá»‹ 1 dÃ²ng" />)}
                      </div>))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-[#e5e5e5]">
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">Huá»·</button>
                  <button onClick={handleSave} disabled={!editing.name} className="px-4 py-2 rounded text-sm font-bold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>LÆ°u</button>
                </div>
              </div>
            </div>
          </div>)}

        {toast && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">{toast}</div>}
      </main>
    </>);
}


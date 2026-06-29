"use client";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: string;
  active: boolean;
}

interface Campaign {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "sent";
  recipients: string[];
  recipientCount: number;
  createdAt: string;
  sentAt?: string;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch { return iso; }
}

export default function AdminNewsletterPage() {
  const [tab, setTab] = useState<"subs" | "campaigns">("subs");
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [camps, setCamps] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Partial<Campaign>>({ subject: "", body: "" });
  const [toast, setToast] = useState("");

  function showToastMsg(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/newsletter", { credentials: "include" }).then(r => r.ok ? r.json() : []),
      fetch("/api/newsletter/campaigns", { credentials: "include" }).then(r => r.ok ? r.json() : []),
    ]).then(([s, c]) => {
      setSubs(Array.isArray(s) ? s : []);
      setCamps(Array.isArray(c) ? c : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleDeleteSub(email: string) {
    if (!confirm(`Xoá email ${email} khỏi danh sách?`)) return;
    await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, { method: "DELETE", credentials: "include" });
    load();
  }
  async function handleSaveCampaign() {
    if (!editing.subject || !editing.body) { showToastMsg("Cần đủ tiêu đề và nội dung"); return; }
    const res = await fetch("/api/newsletter/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ subject: editing.subject, body: editing.body }),
    });
    if (res.ok) { setShowForm(false); setEditing({ subject: "", body: "" }); load(); showToastMsg("Đã tạo chiến dịch"); }
  }
  async function handleSend(id: string) {
    if (!confirm("Gửi chiến dịch này tới toàn bộ subscribers?\n(Email gửi giả lập — chưa tích hợp SMTP thực tế.)")) return;
    const res = await fetch(`/api/newsletter/campaigns/${id}/send`, { method: "POST", credentials: "include" });
    const data = await res.json();
    if (res.ok) { load(); showToastMsg(`Đã gửi đến ${data.campaign.recipientCount} người`); }
    else { showToastMsg(data.error || "Lỗi gửi"); }
  }
  async function handleDeleteCamp(id: string) {
    if (!confirm("Xoá chiến dịch này?")) return;
    await fetch(`/api/newsletter/campaigns?id=${id}`, { method: "DELETE", credentials: "include" });
    load();
  }
  function exportCsv() {
    const csv = ["email,source,subscribedAt,active", ...subs.map(s => `${s.email},${s.source},${s.subscribedAt},${s.active}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `newsletter-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const filtered = subs.filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <AdminSidebar active="/admin/newsletter" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">Bản tin & Chiến dịch</h1>
            <div className="flex items-center gap-2">
              {tab === "subs" && <button onClick={exportCsv} disabled={subs.length === 0} className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>Xuất CSV</button>}
              {tab === "campaigns" && <button onClick={() => { setEditing({ subject: "", body: "" }); setShowForm(true); }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ Tạo chiến dịch</button>}
            </div>
          </div>
          <div className="px-6 flex gap-0 border-t border-[#f0f0f0]">
            <button onClick={() => setTab("subs")} className={`px-4 py-3 text-sm font-medium border-b-2 ${tab === "subs" ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294]"}`}>Subscribers ({subs.length})</button>
            <button onClick={() => setTab("campaigns")} className={`px-4 py-3 text-sm font-medium border-b-2 ${tab === "campaigns" ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294]"}`}>Chiến dịch ({camps.length})</button>
          </div>
        </div>

        <div className="p-6">
          {loading ? <div className="text-center py-16 text-[#8f9294]">Đang tải...</div> : (
            <>
              {tab === "subs" && (
                <>
                  <div className="mb-4 max-w-sm">
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm email..." className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white" />
                  </div>
                  {filtered.length === 0 ? (
                    <div className="text-center py-16 text-[#8f9294]"><p className="font-semibold">{subs.length === 0 ? "Chưa có người đăng ký" : "Không khớp"}</p></div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">
                          <th className="px-4 py-3 font-semibold">Email</th>
                          <th className="px-4 py-3 font-semibold">Nguồn</th>
                          <th className="px-4 py-3 font-semibold">Thời điểm</th>
                          <th className="px-4 py-3 font-semibold text-right">Hành động</th>
                        </tr></thead>
                        <tbody>
                          {filtered.map((s, i) => (
                            <tr key={s.email} className={i % 2 ? "bg-[#fafafa]" : ""}>
                              <td className="px-4 py-3 font-mono">{s.email}</td>
                              <td className="px-4 py-3 text-[#8f9294]">{s.source}</td>
                              <td className="px-4 py-3 text-[#8f9294]">{formatDate(s.subscribedAt)}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleDeleteSub(s.email)} className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">Xoá</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {tab === "campaigns" && (
                camps.length === 0 ? (
                  <div className="text-center py-16 text-[#8f9294]">
                    <p className="font-semibold mb-1">Chưa có chiến dịch nào</p>
                    <p className="text-sm">Bấm "+ Tạo chiến dịch" để soạn email gửi tới subscribers.</p>
                    <p className="text-xs mt-3">Lưu ý: Hiện hệ thống chưa tích hợp SMTP — bấm "Gửi" sẽ ghi log danh sách người nhận, chưa gửi email thực.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {camps.map(c => (
                      <div key={c.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-[#44494d]">{c.subject}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.status === "sent" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                {c.status === "sent" ? "Đã gửi" : "Nháp"}
                              </span>
                            </div>
                            <p className="text-xs text-[#8f9294]">Tạo: {formatDate(c.createdAt)}{c.sentAt && ` • Gửi: ${formatDate(c.sentAt)}`}{c.recipientCount > 0 && ` • ${c.recipientCount} người nhận`}</p>
                          </div>
                          <div className="flex gap-2">
                            {c.status === "draft" && <button onClick={() => handleSend(c.id)} className="px-3 py-1 rounded text-xs font-bold text-white" style={{ background: "#22C55E" }}>Gửi</button>}
                            <button onClick={() => handleDeleteCamp(c.id)} className="px-3 py-1 rounded text-xs font-semibold text-red-600 hover:bg-red-50">Xoá</button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">{c.body}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="border-b border-[#e5e5e5] px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#44494d]">Tạo chiến dịch mới</h2>
                <button onClick={() => setShowForm(false)} className="text-2xl text-[#8f9294]">×</button>
              </div>
              <div className="p-6 space-y-3">
                <input value={editing.subject} onChange={e => setEditing(p => ({ ...p, subject: e.target.value }))} placeholder="Tiêu đề email" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
                <textarea value={editing.body} onChange={e => setEditing(p => ({ ...p, body: e.target.value }))} rows={10} placeholder="Nội dung email (hỗ trợ {{name}}, {{email}})" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">Huỷ</button>
                  <button onClick={handleSaveCampaign} className="px-4 py-2 rounded text-sm font-bold text-white" style={{ background: "var(--ap-primary)" }}>Tạo nháp</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">{toast}</div>}
      </main>
    </div>
  );
}

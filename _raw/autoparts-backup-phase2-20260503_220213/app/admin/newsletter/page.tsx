"use client";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: string;
  active: boolean;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/newsletter", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setSubs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(email: string) {
    if (!confirm(`Xoá email ${email} khỏi danh sách?`)) return;
    await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, { method: "DELETE", credentials: "include" });
    load();
  }

  function exportCsv() {
    const csv = ["email,source,subscribedAt,active", ...subs.map(s => `${s.email},${s.source},${s.subscribedAt},${s.active}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = subs.filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <AdminSidebar active="/admin/newsletter" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">Bản tin / Đăng ký nhận tin <span className="text-[#8f9294] font-normal">({subs.length})</span></h1>
            <button
              onClick={exportCsv}
              disabled={subs.length === 0}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--ap-primary)" }}>
              Xuất CSV
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 max-w-sm">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm email..."
              className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a4b97]"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#8f9294]">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">
              <p className="font-semibold mb-1">{subs.length === 0 ? "Chưa có người đăng ký" : "Không khớp"}</p>
              {subs.length === 0 && <p className="text-sm">Form đăng ký nằm ở chân trang storefront.</p>}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}>
                  <tr className="text-left text-[#8f9294] uppercase text-xs">
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Nguồn</th>
                    <th className="px-4 py-3 font-semibold">Thời điểm</th>
                    <th className="px-4 py-3 font-semibold text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.email} className={i % 2 ? "bg-[#fafafa]" : ""}>
                      <td className="px-4 py-3 font-mono">{s.email}</td>
                      <td className="px-4 py-3 text-[#8f9294]">{s.source}</td>
                      <td className="px-4 py-3 text-[#8f9294]">{formatDate(s.subscribedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(s.email)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors">
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

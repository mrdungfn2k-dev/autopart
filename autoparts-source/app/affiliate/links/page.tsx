"use client";
import { confirmDialog } from "@/components/ConfirmDialog";
import { useLang } from "@/lib/i18n";
import { useState, useEffect, useCallback } from "react";
import AffiliateSidebar from "@/components/AffiliateSidebar";
import SidebarControls from "@/components/SidebarControls";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";

type AffLink = {
  id: string; name: string; target: string; url: string;
  clicks: number; orders: number; revenue: number; conversion: string; createdAt: string;
};

export default function AffiliateLinksPage() {
  const { t, fp, lang } = useLang();
  const [links, setLinks] = useState<AffLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkTarget, setNewLinkTarget] = useState("homepage");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadLinks = useCallback(() => {
    setLoading(true);
    fetch("/api/affiliate-links")
      .then(r => r.json())
      .then(data => { setLinks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
  };

  const handleCreate = async () => {
    if (!newLinkName.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/affiliate-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLinkName, target: newLinkTarget }),
      });
      setShowCreate(false);
      setNewLinkName("");
      setNewLinkTarget("homepage");
      loadLinks();
    } catch { alert("Lỗi khi tạo link"); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmDialog("Xoá link này?"))) return;
    setDeleting(id);
    try {
      await fetch(`/api/affiliate-links?id=${id}`, { method: "DELETE" });
      loadLinks();
    } finally { setDeleting(null); }
  };

  const totalClicks  = links.reduce((s, l) => s + l.clicks, 0);
  const totalOrders  = links.reduce((s, l) => s + l.orders, 0);
  const totalRevenue = links.reduce((s, l) => s + l.revenue, 0);
  const pgLinks = usePaged(links, 8);

  return (
    <>
      <main className="flex-1 overflow-auto">{/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "推广链接" : "Link Affiliate của tôi"}</h1>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>{lang === "zh" ? "创建链接" : "Tạo link mới"}
            </button>
          </div>
        </div>

        <div className="p-6">{/* KPI summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">{[
              { label: lang === "zh" ? "总点击量" : "Tổng lượt click", value: totalClicks.toLocaleString(), color: "var(--ap-primary)" },
              { label: lang === "zh" ? "总订单" : "Tổng đơn từ link", value: totalOrders.toString(), color: "#22C55E" },
              { label: lang === "zh" ? "创造营收" : "Doanh thu tạo ra", value: fp(totalRevenue), color: "var(--ap-primary)" },
            ].map(s => (
              <div key={s.label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "18" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={s.color}><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99l1.5 1.5z"/></svg>
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-[#8f9294]">{s.label}</p>
                </div>
              </div>))}
          </div>{/* Links list */}
          {loading && <p className="text-center text-[#8f9294] py-12 text-sm">Đang tải...</p>}
          {!loading && links.length === 0 && (
            <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-12 text-center">
              <p className="text-[#8f9294] text-sm">Chưa có link nào. Tạo link đầu tiên để bắt đầu kiếm hoa hồng!</p>
            </div>)}
          <div className="space-y-3">{pgLinks.paged.map(link => (
              <div key={link.id} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 mr-4">
                    <h3 className="font-bold text-[#44494d] mb-1">{link.name}</h3>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg max-w-lg" style={{ background: "#f8f8fa", border: "1px solid #E2E8F0" }}>
                      <p className="text-xs font-mono text-[#8f9294] truncate flex-1">{link.url}</p>
                      <button onClick={() => handleCopy(link.id, link.url)} className="shrink-0 p-1 rounded hover:bg-[#f4f4f4] text-xs text-[#8f9294]">{copied[link.id] ? "✓" : lang === "zh" ? "复制" : "Sao chép"}
                      </button>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1 rounded hover:bg-[#f4f4f4] text-xs text-[#8f9294]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#8f9294"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
                      </a>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(link.id)} disabled={deleting === link.id}
                    className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors text-sm">{deleting === link.id ? "..." : "✕"}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">{[
                    { label: lang === "zh" ? "点击" : "Lượt click", value: link.clicks.toLocaleString(), color: "var(--ap-primary)" },
                    { label: lang === "zh" ? "订单" : "Đơn hàng", value: link.orders.toString(), color: "#22C55E" },
                    { label: lang === "zh" ? "营收" : "Doanh thu", value: fp(link.revenue), color: "var(--ap-primary)" },
                    { label: lang === "zh" ? "转化率" : "Tỷ lệ CĐ", value: link.conversion, color: "#8B5CF6" },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-2.5 rounded-xl" style={{ background: "#f8f8fa" }}>
                      <p className="font-bold text-sm" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-xs text-[#8f9294]">{stat.label}</p>
                    </div>))}
                </div>
              </div>))}
          </div>
          {links.length > 0 && <Pagination {...pgLinks.bind} />}
        </div>{/* Create link modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
                <h3 className="font-bold text-[#44494d]">{lang === "zh" ? "创建推广链接" : "Tạo link affiliate mới"}</h3>
                <button onClick={() => setShowCreate(false)} className="text-[#8f9294] text-xl">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">{lang === "zh" ? "链接名称" : "Tên link (ghi nhớ nội bộ)"}</label>
                  <input value={newLinkName} onChange={e => setNewLinkName(e.target.value)}
                    placeholder="VD: Link Facebook tháng 11"
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">{lang === "zh" ? "目标页面" : "Điểm đến"}</label>
                  <select value={newLinkTarget} onChange={e => setNewLinkTarget(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
                    <option value="homepage">Trang chủ</option>
                    <option value="products">Trang sản phẩm</option>
                    <option value="flash-sale">Flash Sale</option>
                    <option value="brake-pads">Danh mục Má Phanh</option>
                    <option value="engine-oil">Danh mục Dầu động cơ</option>
                  </select>
                </div>
                <div className="p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
                  <p className="text-xs text-[#8f9294] mb-1">Xem trước link</p>
                  <p className="text-xs font-mono text-slate-600 break-all">https://autopartsvietnam.com.vn/{newLinkTarget === "homepage" ? "" : (newLinkTarget === "products" || newLinkTarget === "flash-sale") ? newLinkTarget : "products"}?ref=LP...&src={newLinkName.replace(/\s/g, "_") || "new"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t border-[#f0f0f0]">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600">{t("cancel")}</button>
                <button onClick={handleCreate} disabled={creating || !newLinkName.trim()}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:opacity-60"
                  style={{ background: "var(--ap-primary)" }}>{creating ? "Đang tạo..." : lang === "zh" ? "创建" : "Tạo link"}
                </button>
              </div>
            </div>
          </div>)}
      </main>
    </>);
}

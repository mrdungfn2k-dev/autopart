"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";

type SuspendStatus = "PENDING" | "ACCEPTED" | "REJECTED";
interface SuspensionRequest {
  id: string;
  supplierId?: string;
  shopName: string;
  submittedBy: string;
  reason: string;
  status: SuspendStatus;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSuspensionsPage() {
  const { lang } = useLang();
  const [items, setItems] = useState<SuspensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SuspendStatus>("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/suspension-requests", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => i.status === activeTab);
  const counts = {
    PENDING: items.filter(i => i.status === "PENDING").length,
    ACCEPTED: items.filter(i => i.status === "ACCEPTED").length,
    REJECTED: items.filter(i => i.status === "REJECTED").length,
  };

  const updateStatus = async (id: string, status: SuspendStatus, reopen = false) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/suspension-requests/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
        const msg = status === "ACCEPTED"
          ? (lang === "zh" ? "已接受暂停请求，店铺已暂停。" : "Đã chấp nhận — cửa hàng đã được tạm ngưng.")
          : reopen
            ? (lang === "zh" ? "已重新开店，供应商可重新登录。" : "Đã mở lại cửa hàng — nhà cung cấp đăng nhập lại được.")
            : (lang === "zh" ? "已拒绝暂停请求。" : "Đã từ chối yêu cầu tạm ngưng.");
        window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: msg, type: status === "ACCEPTED" ? "success" : "info" } }));
      }
    } finally { setActionLoading(null); }
  };

  const fd = (s: string) => { if (!s) return ""; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString(lang === "zh" ? "zh-CN" : "vi-VN"); };

  const tabLabels: [SuspendStatus, string][] = [
    ["PENDING", lang === "zh" ? "待处理" : "Chờ xử lý"],
    ["ACCEPTED", lang === "zh" ? "已接受" : "Đã chấp nhận"],
    ["REJECTED", lang === "zh" ? "已拒绝" : "Đã từ chối"],
  ];

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "店铺暂停请求" : "Yêu cầu tạm ngưng cửa hàng"}</h1>
          </div>
          <div className="px-6 flex border-t border-[#f0f0f0]">{tabLabels.map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label} <span className="ml-1 text-xs text-[#8f9294]">({counts[key]})</span>
              </button>))}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">{loading ? (
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-10 text-center text-[#8f9294]">{lang === "zh" ? "加载中..." : "Đang tải..."}</div>
            ) : filtered.length === 0 ? (
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-10 text-center text-[#8f9294]">{lang === "zh" ? "没有需要处理的请求。" : "Không có yêu cầu nào."}</div>
            ) : (
              filtered.map(item => {
                const isLoading = actionLoading === item.id;
                return (
                  <div key={item.id} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: "#FEF2F2", color: "#DC2626" }}>⏸</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#44494d] truncate">{item.shopName}</p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{lang === "zh" ? "暂停" : "Tạm ngưng"}</span>
                      </div>
                      <p className="text-sm text-[#8f9294] mb-1">{lang === "zh" ? "提交者：" : "Gửi bởi: "}<span className="font-semibold text-slate-600">{item.submittedBy}</span> • {fd(item.createdAt)}</p>
                      <p className="text-sm text-[#8f9294] truncate">{item.reason}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">{item.status === "PENDING" && (
                        <>
                          <button onClick={() => updateStatus(item.id, "ACCEPTED")} disabled={isLoading} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#DC2626" }}>✓ {lang === "zh" ? "接受暂停" : "Chấp nhận ngưng"}</button>
                          <button onClick={() => updateStatus(item.id, "REJECTED")} disabled={isLoading} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#64748B" }}>✕ {lang === "zh" ? "拒绝" : "Từ chối"}</button>
                        </>)}
                      {item.status === "ACCEPTED" && (
                        <>
                          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700">{lang === "zh" ? "已暂停" : "Đã ngưng"}</span>
                          <button onClick={() => updateStatus(item.id, "REJECTED", true)} disabled={isLoading} className="px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#16A34A" }}>↻ {lang === "zh" ? "重新开店" : "Mở lại cửa hàng"}</button>
                        </>)}
                      {item.status === "REJECTED" && <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">{lang === "zh" ? "已拒绝/已开店" : "Đã từ chối / mở lại"}</span>}
                    </div>
                  </div>);
              })
            )}
          </div>
        </div>
      </main>
    </>);
}

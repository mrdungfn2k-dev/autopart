"use client";
import { getAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";

type ApprovalType = "supplier" | "product" | "affiliate" | "mechanic";
type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  name: string;
  submittedBy: string;
  date: string;
  status: ApprovalStatus;
  details: string;
  taxCode?: string;
  province?: string;
}

export default function AdminApprovalsPage() {
  const { t, lang } = useLang();

  const typeConfig: Record<ApprovalType, { label: string; color: string; abbr: string }> = {
    supplier: { label: lang === "zh" ? "新供应商" : "NCC mới", color: "bg-blue-100 text-blue-700", abbr: "NCC" },
    product: { label: lang === "zh" ? "产品" : "Sản phẩm", color: "bg-purple-100 text-purple-700", abbr: "SP" },
    affiliate: { label: lang === "zh" ? "代理商" : "Đại lý", color: "bg-orange-100 text-orange-700", abbr: "ĐL" },
    mechanic: { label: lang === "zh" ? "专业技师" : "Thợ Pro", color: "bg-green-100 text-green-700", abbr: "TP" },
  };

  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ApprovalStatus>("PENDING");
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/approvals")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setItems(data as ApprovalItem[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => i.status === activeTab);
  const counts = {
    PENDING: items.filter((i) => i.status === "PENDING").length,
    APPROVED: items.filter((i) => i.status === "APPROVED").length,
    REJECTED: items.filter((i) => i.status === "REJECTED").length,
  };

  const updateStatus = async (id: string, status: ApprovalStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
        setSelected(null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const approve = (id: string) => updateStatus(id, "APPROVED");
  const reject = (id: string) => updateStatus(id, "REJECTED");

  const tabLabels: [ApprovalStatus, string][] = [
    ["PENDING", lang === "zh" ? "待审批" : "Chờ duyệt"],
    ["APPROVED", lang === "zh" ? "已批准" : "Đã duyệt"],
    ["REJECTED", lang === "zh" ? "已拒绝" : "Từ chối"],
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
      <AdminSidebar active="/admin/approvals" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "审批 & 审核" : "Phê duyệt & Kiểm duyệt"}</h1>
          </div>
          <div className="px-6 flex border-t border-[#f0f0f0]">
            {tabLabels.map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
                {label} <span className="ml-1 text-xs text-[#8f9294]">({counts[key]})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* KPI */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: lang === "zh" ? "待审批" : "Chờ phê duyệt", value: counts.PENDING, color: "#F59E0B", dot: "bg-amber-400" },
              { label: lang === "zh" ? "本月已批准" : "Đã duyệt tháng này", value: counts.APPROVED + 12, color: "#22C55E", dot: "bg-green-400" },
              { label: lang === "zh" ? "本月已拒绝" : "Từ chối tháng này", value: counts.REJECTED + 3, color: "#EF4444", dot: "bg-[#1a4b97]" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-[#f0f0f0] p-4 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full shrink-0 ${s.dot}`} />
                <div>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-[#8f9294] font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Items list */}
          <div className="space-y-3">
            {loading ? (
              <div className="bg-white rounded-xl border border-[#f0f0f0] p-10 text-center text-[#8f9294]">
                {lang === "zh" ? "加载中..." : "Đang tải..."}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#f0f0f0] p-10 text-center text-[#8f9294]">
                {lang === "zh" ? "没有需要处理的请求。" : "Không có yêu cầu nào cần xử lý."}
              </div>
            ) : (
              filtered.map((item) => {
                const cfg = typeConfig[item.type];
                const isLoading = actionLoading === item.id;
                return (
                  <div key={item.id} className="bg-white rounded-xl border border-[#f0f0f0] p-5 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#f8f8fa", color: "var(--ap-primary)" }}>
                      {cfg.abbr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#44494d]">{item.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-sm text-[#8f9294] mb-1">
                        {lang === "zh" ? "提交者：" : "Gửi bởi: "}
                        <span className="font-semibold text-slate-600">{item.submittedBy}</span> • {item.date}
                      </p>
                      <p className="text-sm text-[#8f9294] truncate">{item.details}</p>
                      {item.province && <p className="text-xs text-[#8f9294] mt-0.5">{item.province}</p>}
                      {item.taxCode && <p className="text-xs text-[#8f9294]">{lang === "zh" ? "税号：" : "MST: "}{item.taxCode}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setSelected(item)} className="px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-xs font-medium text-[#8f9294] hover:bg-[#f8f8fa] whitespace-nowrap">
                        {lang === "zh" ? "详情" : "Chi tiết"}
                      </button>
                      {item.status === "PENDING" && (
                        <>
                          <button onClick={() => approve(item.id)} disabled={isLoading} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#22C55E" }}>
                            ✓ {lang === "zh" ? "批准" : "Duyệt"}
                          </button>
                          <button onClick={() => reject(item.id)} disabled={isLoading} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "#EF4444" }}>
                            ✕ {lang === "zh" ? "拒绝" : "Từ chối"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail drawer */}
        {selected && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/20" onClick={() => setSelected(null)} />
            <div className="w-96 bg-white shadow-xl overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#44494d]">{lang === "zh" ? "请求详情 #" : "Chi tiết yêu cầu #"}{selected.id}</h3>
                <button onClick={() => setSelected(null)} className="text-[#8f9294] text-xl">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "#FEF3C7", color: "var(--ap-primary)" }}>
                    {typeConfig[selected.type].abbr}
                  </div>
                  <div>
                    <p className="font-bold text-[#44494d]">{selected.name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeConfig[selected.type].color}`}>{typeConfig[selected.type].label}</span>
                  </div>
                </div>
                {[
                  [lang === "zh" ? "提交者" : "Người gửi", selected.submittedBy],
                  [lang === "zh" ? "提交日期" : "Ngày gửi", selected.date],
                  ...(selected.province ? [[lang === "zh" ? "地点" : "Địa điểm", selected.province]] : []),
                  ...(selected.taxCode ? [[lang === "zh" ? "税号" : "Mã số thuế", selected.taxCode]] : []),
                  [lang === "zh" ? "描述" : "Mô tả", selected.details],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[#8f9294] text-xs font-semibold uppercase mb-0.5">{k}</p>
                    <p className="text-[#44494d] font-medium">{v}</p>
                  </div>
                ))}
              </div>
              {selected.status === "PENDING" && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => approve(selected.id)} disabled={actionLoading === selected.id} className="flex-1 py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50" style={{ background: "#22C55E" }}>
                    ✓ {lang === "zh" ? "批准" : "Phê duyệt"}
                  </button>
                  <button onClick={() => reject(selected.id)} disabled={actionLoading === selected.id} className="flex-1 py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50" style={{ background: "#EF4444" }}>
                    ✕ {lang === "zh" ? "拒绝" : "Từ chối"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

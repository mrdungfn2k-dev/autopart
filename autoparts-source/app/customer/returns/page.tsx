"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import CustomerSidebar from "@/components/CustomerSidebar";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";

interface ReturnRequest {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

const RETURN_REASONS_VI = [
  "Sản phẩm bị lỗi từ nhà sản xuất",
  "Giao nhầm sản phẩm",
  "Sản phẩm không đúng mô tả",
  "Sản phẩm bị hư hỏng khi vận chuyển",
  "Không còn nhu cầu sử dụng",
  "Khác",
];
const RETURN_REASONS_ZH = [
  "产品存在制造商缺陷",
  "收到错误产品",
  "产品与描述不符",
  "运输过程中损坏",
  "不再需要该产品",
  "其他原因",
];

const STORAGE_KEY = "ap_returns";

function loadReturns(): ReturnRequest[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveReturns(list: ReturnRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const STATUS_CONFIG = {
  pending:  { color: "bg-yellow-100 text-yellow-700", icon: "" },
  approved: { color: "bg-green-100 text-green-700",  icon: "" },
  rejected: { color: "bg-red-100 text-red-700",      icon: "" },
};

export default function ReturnsPage() {
  const { t, lang } = useLang();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const pg = usePaged(returns, 8);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", reason: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setReturns(loadReturns());
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const reasons = lang === "zh" ? RETURN_REASONS_ZH : RETURN_REASONS_VI;
  const deliveredOrders = orders.filter(o => o.status === "delivered");

  const handleSubmit = () => {
    if (!form.orderId || !form.reason || !form.description.trim()) return;
    const newReturn: ReturnRequest = {
      id: "RMA-" + Date.now(),
      orderId: form.orderId,
      reason: form.reason,
      description: form.description,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newReturn, ...returns];
    saveReturns(updated);
    setReturns(updated);
    setShowForm(false);
    setForm({ orderId: "", reason: "", description: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">{t("myReturns")}</h1>
            <button onClick={() => setShowForm(true)}
              className="ap-btn px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: "var(--ap-primary)" }}>+ {t("createReturn")}
            </button>
          </div>
        </div>

        <div className="p-6">{submitted && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">✓ {lang === "zh" ? "申请已提交，我们将在1-3个工作日内处理" : "Yêu cầu đã gửi, chúng tôi sẽ xử lý trong 1-3 ngày làm việc"}
            </div>)}

          {/* Policy note */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5">
            <p className="text-sm text-orange-700">{lang === "zh"
                ? "退换货政策：收货后7天内可申请。请提供清晰的产品图片作为证明。"
                : "Chính sách đổi trả: Yêu cầu trong vòng 7 ngày kể từ khi nhận hàng. Vui lòng cung cấp ảnh sản phẩm rõ ràng làm bằng chứng."}
            </p>
          </div>{/* Create form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5">
              <h2 className="font-bold text-[#44494d] mb-5">{t("createReturn")}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t("returnOrderId")} *</label>{deliveredOrders.length > 0 ? (
                    <select value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] bg-white">
                      <option value="">{lang === "zh" ? "选择订单" : "Chọn đơn hàng..."}</option>{deliveredOrders.map(o => (
                        <option key={o.id} value={o.id}>{o.id} — {o.items?.map((i: any) => i.name).join(", ")}</option>))}
                    </select>) : (
                    <input value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                      placeholder={lang === "zh" ? "请输入订单号" : "Nhập mã đơn hàng..."}
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />)}
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t("returnReason")} *</label>
                  <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] bg-white">
                    <option value="">{lang === "zh" ? "选择原因" : "Chọn lý do..."}</option>{reasons.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t("returnDescription")} *</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4} placeholder={lang === "zh" ? "请详细描述问题..." : "Mô tả chi tiết vấn đề gặp phải..."}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: "var(--ap-primary)" }}>{t("submitReturn")}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm border border-[#e5e5e5] text-[#44494d]">{t("cancel")}
                </button>
              </div>
            </div>)}

          {/* Returns list */}
          {returns.length === 0 && !showForm ? (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-14 text-center">
              <p className="font-semibold text-[#44494d] mb-2">{lang === "zh" ? "暂无退换货申请" : "Chưa có yêu cầu đổi trả nào"}
              </p>
            </div>) : (
            <div className="grid md:grid-cols-2 gap-3">{pg.paged.map(r => {
                const cfg = STATUS_CONFIG[r.status];
                const date = new Date(r.createdAt);
                return (
                  <div key={r.id} className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="font-mono font-bold text-[#44494d] text-sm">{r.id}</span>
                        <span className="text-[#8f9294] text-xs ml-3">{date.getDate()}/{date.getMonth()+1}/{date.getFullYear()}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.icon} {t(`return${r.status.charAt(0).toUpperCase() + r.status.slice(1)}` as any)}
                      </span>
                    </div>
                    <p className="text-sm text-[#8f9294] mb-1">{lang === "zh" ? "订单：" : "Đơn hàng: "}<span className="font-mono text-[#44494d]">{r.orderId}</span>
                    </p>
                    <p className="text-sm font-semibold text-[#44494d] mb-1">{r.reason}</p>
                    <p className="text-sm text-[#8f9294]">{r.description}</p>
                  </div>);
              })}
            </div>)}
          {returns.length > 0 && <Pagination {...pg.bind} />}
        </div>
      </main>
    </>);
}

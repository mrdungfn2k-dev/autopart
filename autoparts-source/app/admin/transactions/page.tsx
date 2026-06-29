"use client";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useLang } from "@/lib/i18n";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";

export default function AdminTransactionsPage() {
  const { t, fp, lang } = useLang();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const loc = lang === "zh" ? "zh-CN" : lang === "en" ? "en-US" : "vi-VN";
  // Định dạng thời gian giao dịch (trước hiện chuỗi ISO thô → "không hợp lệ")
  const fd = (s: string) => { if (!s) return "—"; const d = new Date(s); return isNaN(d.getTime()) ? s : d.toLocaleString(loc); };

  useEffect(() => {
    fetch("/api/transactions", { credentials: "include" }).then(r => r.ok ? r.json() : []).then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const types: Record<string, string> = {
    payment: t("txTypePayment"), refund: t("txTypeRefund"), adjustment: t("txTypeAdjustment"),
  };
  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700", success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-700", refunded: "bg-purple-100 text-purple-700",
  };
  const methodLabels: Record<string, string> = { qr: t("txMethodQr"), cod: t("txMethodCod"), momo: t("txMethodMomo"), zalopay: "ZaloPay", bank: t("txMethodBank"), card: t("txMethodCard"), paypal: "PayPal" };
  const statusLabels: Record<string, string> = { pending: t("txStatusPending"), success: t("txStatusSuccess"), failed: t("txStatusFailed"), cancelled: t("txStatusCancelled"), refunded: t("txStatusRefunded") };

  const filtered = list.filter(x => !filter || x.type === filter);
  const pg = usePaged(filtered, 12);

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">{t("adminTransactions")} ({list.length})</h1>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 border border-[#e5e5e5] rounded text-sm">
            <option value="">{t("txAllTypes")}</option>
            <option value="payment">{t("txTypePayment")}</option>
            <option value="refund">{t("txTypeRefund")}</option>
            <option value="adjustment">{t("txTypeAdjustment")}</option>
          </select>
        </div>
        <div className="p-6">{loading ? <div className="text-center py-16 text-[#8f9294]">{t("txLoading")}</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">
              <p className="font-semibold mb-1">{t("txEmpty")}</p>
              <p className="text-sm">{t("txEmptyHint")}</p>
            </div>) : (
            <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">{t("txColOrder")}</th>
                  <th className="px-4 py-3 font-semibold">{t("txColType")}</th>
                  <th className="px-4 py-3 font-semibold">{t("txColMethod")}</th>
                  <th className="px-4 py-3 font-semibold text-right">{t("txColAmount")}</th>
                  <th className="px-4 py-3 font-semibold">{t("txColStatus")}</th>
                  <th className="px-4 py-3 font-semibold">{t("txColTime")}</th>
                </tr></thead>
                <tbody>{pg.paged.map((x, i) => (
                    <tr key={x.id} className={i % 2 ? "bg-[#fafafa]" : ""}>
                      <td className="px-4 py-3 font-mono text-xs">{x.id}</td>
                      <td className="px-4 py-3 font-mono text-[#1a4b97]">{x.orderId || "—"}</td>
                      <td className="px-4 py-3">{types[x.type] || x.type}</td>
                      <td className="px-4 py-3 text-[#8f9294]">{methodLabels[x.method] || x.method || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fp(x.amount || 0)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[x.status] || "bg-gray-100 text-gray-600"}`}>{statusLabels[x.status] || x.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[#8f9294] text-xs">{fd(x.createdAt)}</td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
          {!loading && filtered.length > 0 && <Pagination {...pg.bind} />}
        </div>
      </main>
    </>);
}

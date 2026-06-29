"use client";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";
import { useLang } from "@/lib/i18n";

export default function AdminInvoicesPage() {
  const { t, lang, fp } = useLang();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/invoices", { credentials: "include" }).then(r => r.ok ? r.json() : []).then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const formatAmount = (n: number) => lang === "en" ? `$${(n / 25000).toFixed(2)}` : lang === "zh" ? `¥${Math.round(n / 3500).toLocaleString("zh-CN")}` : n.toLocaleString("vi-VN") + "₫";
  const filtered = list.filter(x => !search || (x.id + x.orderId + (x.customerName || "")).toLowerCase().includes(search.toLowerCase()));
  const pg = usePaged(filtered, 12);

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center">
          <h1 className="text-lg font-bold text-[#44494d]">{lang === "en" ? "Invoices" : lang === "zh" ? "发票" : "Hóa đơn"} ({list.length})</h1>
        </div>
        <div className="p-6">
          <div className="mb-4 max-w-sm">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "en" ? "Search by order / customer..." : lang === "zh" ? "按订单/客户搜索..." : "Tìm theo mã đơn / khách..."} className="w-full px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white" />
          </div>{loading ? <div className="text-center py-16 text-[#8f9294]">{t("loading")}</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">
              <p className="font-semibold mb-1">{lang === "en" ? "No invoices yet" : lang === "zh" ? "暂无发票" : "Chưa có hóa đơn"}</p>
              <p className="text-sm">{lang === "en" ? "Invoices are auto-created when orders are delivered." : lang === "zh" ? "订单完成后自动生成发票。" : "Hóa đơn sẽ tự động được tạo khi đơn hàng chuyển trạng thái \"\u0110ã giao\"."}</p>
            </div>) : (
            <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">
                  <th className="px-4 py-3 font-semibold">Mã HĐ</th>
                  <th className="px-4 py-3 font-semibold">Đơn hàng</th>
                  <th className="px-4 py-3 font-semibold">Khách</th>
                  <th className="px-4 py-3 font-semibold text-right">Số tiền</th>
                  <th className="px-4 py-3 font-semibold">Ngày</th>
                  <th className="px-4 py-3 font-semibold text-right">Hành động</th>
                </tr></thead>
                <tbody>{pg.paged.map((x, i) => (
                    <tr key={x.id} className={i % 2 ? "bg-[#fafafa]" : ""}>
                      <td className="px-4 py-3 font-mono">{x.id}</td>
                      <td className="px-4 py-3 font-mono text-[#1a4b97]">{x.orderId}</td>
                      <td className="px-4 py-3">{x.customerName || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatAmount(x.total || 0)}</td>
                      <td className="px-4 py-3 text-[#8f9294]">{x.issuedAt?.split("T")[0] || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <a href={`/api/invoices/${x.id}`} target="_blank" rel="noopener" className="px-3 py-1 text-xs font-semibold border border-[#e5e5e5] rounded hover:bg-[#f4f4f4]">{lang === "en" ? "View JSON" : lang === "zh" ? "查看 JSON" : "Xem JSON"}</a>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
          {filtered.length > 0 && <Pagination {...pg.bind} />}
        </div>
      </main>
    </>);
}

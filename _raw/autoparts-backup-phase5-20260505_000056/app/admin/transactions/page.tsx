"use client";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminTransactionsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const fp = (n: number) => n.toLocaleString("vi-VN") + "₫";

  useEffect(() => {
    fetch("/api/transactions", { credentials: "include" }).then(r => r.ok ? r.json() : []).then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const types: Record<string, string> = {
    payment: "Thanh toán", refund: "Hoàn tiền", adjustment: "Điều chỉnh",
  };
  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700", success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700", cancelled: "bg-gray-100 text-gray-700",
  };

  const filtered = list.filter(x => !filter || x.type === filter);

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <AdminSidebar active="/admin/transactions" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">Giao dịch ({list.length})</h1>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 border border-[#e5e5e5] rounded text-sm">
            <option value="">Tất cả loại</option>
            <option value="payment">Thanh toán</option>
            <option value="refund">Hoàn tiền</option>
            <option value="adjustment">Điều chỉnh</option>
          </select>
        </div>
        <div className="p-6">
          {loading ? <div className="text-center py-16 text-[#8f9294]">Đang tải...</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">
              <p className="font-semibold mb-1">Chưa có giao dịch</p>
              <p className="text-sm">Giao dịch sẽ được ghi tự động khi tạo đơn hàng.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Đơn hàng</th>
                  <th className="px-4 py-3 font-semibold">Loại</th>
                  <th className="px-4 py-3 font-semibold">Phương thức</th>
                  <th className="px-4 py-3 font-semibold text-right">Số tiền</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Thời gian</th>
                </tr></thead>
                <tbody>
                  {filtered.map((x, i) => (
                    <tr key={x.id} className={i % 2 ? "bg-[#fafafa]" : ""}>
                      <td className="px-4 py-3 font-mono text-xs">{x.id}</td>
                      <td className="px-4 py-3 font-mono text-[#1a4b97]">{x.orderId || "—"}</td>
                      <td className="px-4 py-3">{types[x.type] || x.type}</td>
                      <td className="px-4 py-3 text-[#8f9294]">{x.method || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fp(x.amount || 0)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[x.status] || "bg-gray-100 text-gray-600"}`}>{x.status}</span>
                      </td>
                      <td className="px-4 py-3 text-[#8f9294] text-xs">{x.createdAt}</td>
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

"use client";
import { confirmDialog } from "@/components/ConfirmDialog";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useLang } from "@/lib/i18n";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";

export default function AdminRefundsPage() {
  const { t, lang } = useLang();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orderId: "", amount: 0, reason: "", status: "pending" });
  const [toast, setToast] = useState("");
  const fp = (n: number) => n.toLocaleString("vi-VN") + "₫";
  const pg = usePaged(list, 12);

  function load() {
    setLoading(true);
    fetch("/api/refunds", { credentials: "include" }).then(r => r.ok ? r.json() : []).then(d => { setList(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  function showToastMsg(m: string) { setToast(m); setTimeout(() => setToast(""), 2500); }

  async function handleCreate() {
    if (!form.orderId || !form.amount) { showToastMsg("Cần mã đơn và số tiền"); return; }
    const res = await fetch("/api/refunds", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); setForm({ orderId: "", amount: 0, reason: "", status: "pending" }); load(); showToastMsg("Đã tạo yêu cầu hoàn tiền"); }
    else showToastMsg("Lỗi");
  }
  async function setStatus(id: string, status: string) {
    await fetch(`/api/refunds/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }
  async function handleDelete(id: string) {
    if (!(await confirmDialog("Xoá hoàn tiền này?"))) return;
    await fetch(`/api/refunds/${id}`, { method: "DELETE", credentials: "include" });
    load();
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700", approved: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700", completed: "bg-green-100 text-green-700",
  };

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#44494d]">Hoàn tiền ({list.length})</h1>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>+ Tạo yêu cầu</button>
        </div>
        <div className="p-6">{loading ? <div className="text-center py-16 text-[#8f9294]">Đang tải...</div> : list.length === 0 ? (
            <div className="text-center py-16 text-[#8f9294]">Chưa có yêu cầu hoàn tiền nào.</div>) : (
            <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <table className="w-full text-sm">
                <thead style={{ background: "#f8f8fa" }}><tr className="text-left text-[#8f9294] uppercase text-xs">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Đơn hàng</th>
                  <th className="px-4 py-3 font-semibold text-right">Số tiền</th>
                  <th className="px-4 py-3 font-semibold">Lý do</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold">Ngày</th>
                  <th className="px-4 py-3 font-semibold text-right">Hành động</th>
                </tr></thead>
                <tbody>{pg.paged.map((x, i) => (
                    <tr key={x.id} className={i % 2 ? "bg-[#fafafa]" : ""}>
                      <td className="px-4 py-3 font-mono text-xs">{x.id}</td>
                      <td className="px-4 py-3 font-mono text-[#1a4b97]">{x.orderId}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fp(x.amount)}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={x.reason}>{x.reason || "—"}</td>
                      <td className="px-4 py-3">
                        <select value={x.status} onChange={e => setStatus(x.id, e.target.value)} className={`text-xs font-bold px-2 py-1 rounded ${statusColor[x.status] || "bg-gray-100 text-gray-700"} border-0`}>
                          <option value="pending">Chờ xử lý</option>
                          <option value="approved">Duyệt</option>
                          <option value="rejected">Từ chối</option>
                          <option value="completed">Đã hoàn</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[#8f9294] text-xs">{x.createdAt?.split("T")[0]}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(x.id)} className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded">Xoá</button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
          {!loading && list.length > 0 && <Pagination {...pg.bind} />}
        </div>{showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-[#44494d] mb-4">Tạo yêu cầu hoàn tiền</h2>
              <div className="space-y-3">
                <input value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} placeholder="Mã đơn hàng (VD: AP-1001)" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
                <input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} placeholder="Số tiền (VNĐ)" className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Lý do hoàn tiền" rows={3} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e5e5e5] rounded text-sm font-semibold">Huỷ</button>
                <button onClick={handleCreate} className="px-4 py-2 rounded text-sm font-bold text-white" style={{ background: "var(--ap-primary)" }}>Tạo</button>
              </div>
            </div>
          </div>)}
        {toast && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50">{toast}</div>}
      </main>
    </>);
}


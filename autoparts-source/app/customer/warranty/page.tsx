"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import CustomerSidebar from "@/components/CustomerSidebar";

interface WItem { id: string; orderId: string; product: string; purchaseDate: string; warrantyEnd: string; duration: string; daysLeft: number; }
interface Claim { id: string; product: string; issue: string; filed: string; status: "PENDING" | "RESOLVED" | "REJECTED"; orderId: string; }

const CLAIM_KEY = "ap_warranty_claims";
const loadClaims = (): Claim[] => { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(CLAIM_KEY) || "[]"); } catch { return []; } };
const saveClaims = (l: Claim[]) => localStorage.setItem(CLAIM_KEY, JSON.stringify(l));

function monthsFor(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("ắc quy") || n.includes("battery") || n.includes("bình")) return 24;
  return 12;
}
const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

const STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Còn bảo hành", color: "bg-green-100 text-green-700" },
  PENDING: { label: "Đang xem xét", color: "bg-yellow-100 text-yellow-700" },
  RESOLVED: { label: "Đã giải quyết", color: "bg-blue-100 text-blue-700" },
  REJECTED: { label: "Từ chối", color: "bg-red-100 text-red-700" },
};

export default function CustomerWarrantyPage() {
  const { t, lang } = useLang();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<"items" | "claims">("items");
  const [items, setItems] = useState<WItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [form, setForm] = useState({ product: "", type: "Sản phẩm bị lỗi kỹ thuật", desc: "" });

  useEffect(() => {
    setClaims(loadClaims());
    fetch("/api/orders").then(r => r.json()).then((orders: any[]) => {
      if (!Array.isArray(orders)) return;
      const ws: WItem[] = [];
      orders.filter(o => ["delivered", "shipping"].includes(o.status)).forEach(o => {
        (o.items || []).forEach((it: any, idx: number) => {
          const purchase = new Date(o.createdAt);
          const months = monthsFor(it.name);
          const end = new Date(purchase); end.setMonth(end.getMonth() + months);
          const daysLeft = Math.max(0, Math.floor((end.getTime() - Date.now()) / 86400000));
          ws.push({ id: `${o.id}-${idx}`, orderId: o.id, product: it.name, purchaseDate: fmt(purchase), warrantyEnd: fmt(end), duration: `${months} tháng`, daysLeft });
        });
      });
      setItems(ws);
      if (ws[0]) setForm(f => ({ ...f, product: ws[0].product }));
    }).catch(() => {});
  }, []);

  function submit() {
    if (!form.product || !form.desc.trim()) return;
    const c: Claim = { id: "C-" + Date.now(), product: form.product, issue: form.desc, filed: fmt(new Date()), status: "PENDING", orderId: items.find(i => i.product === form.product)?.orderId || "" };
    const updated = [c, ...claims]; saveClaims(updated); setClaims(updated);
    setShowModal(false); setForm(f => ({ ...f, desc: "" })); setTab("claims");
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">Bảo hành sản phẩm</h1>
            <button onClick={() => setShowModal(true)} className="ap-btn px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>Đăng ký bảo hành
            </button>
          </div>
          <div className="px-6 flex border-t border-[#f0f0f0]">{([["items", "Sản phẩm bảo hành"], ["claims", "Yêu cầu bảo hành"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}{key === "claims" && claims.length > 0 && <span className="ml-1.5 text-xs font-bold px-1.5 rounded-full bg-[#1a4b97] text-white">{claims.length}</span>}
              </button>))}
          </div>
        </div>

        <div className="p-6">
          <div className="p-4 rounded-xl mb-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <p className="text-sm font-semibold text-blue-800">Chính sách bảo hành AutoParts</p>
            <p className="text-xs text-[#1a4b97] mt-0.5">Sản phẩm OEM được bảo hành 12–24 tháng từ nhà sản xuất. Đối với sản phẩm lỗi trong 7 ngày đầu, chúng tôi đổi mới 100%. Vui lòng giữ hóa đơn và ảnh lắp đặt để hỗ trợ khiếu nại.</p>
          </div>{tab === "items" && (
            items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-14 text-center text-[#8f9294]">
                <p className="font-semibold text-[#44494d] mb-2">Chưa có sản phẩm trong thời hạn bảo hành</p>
                <p className="text-sm">Sản phẩm sẽ tự xuất hiện ở đây sau khi đơn hàng được giao.</p>
                <Link href="/products" className="ap-btn inline-block mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>Mua sắm ngay</Link>
              </div>) : (
              <div className="grid md:grid-cols-2 gap-4">{items.map(item => {
                  const active = item.daysLeft > 0;
                  const progress = Math.min(100, Math.max(0, item.daysLeft / 365 * 100));
                  return (
                    <div key={item.id} className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#44494d] flex-1">{item.product}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? STATUS.ACTIVE.color : STATUS.REJECTED.color}`}>{active ? STATUS.ACTIVE.label : "Hết hạn"}</span>
                      </div>
                      <p className="text-xs text-[#8f9294] mb-3">Đơn hàng {item.orderId} • Mua ngày {item.purchaseDate}</p>
                      <div className="flex items-center gap-6 text-sm mb-3">
                        <div><p className="text-xs text-[#8f9294]">Bảo hành</p><p className="font-semibold text-[#44494d]">{item.duration}</p></div>
                        <div><p className="text-xs text-[#8f9294]">Hết hạn</p><p className="font-semibold text-[#44494d]">{item.warrantyEnd}</p></div>
                        <div><p className="text-xs text-[#8f9294]">Còn lại</p><p className="font-bold" style={{ color: item.daysLeft < 30 ? "#EF4444" : "#22C55E" }}>{item.daysLeft} ngày</p></div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#f4f4f4] mb-3">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: item.daysLeft < 60 ? "#EF4444" : "#22C55E" }} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setForm(f => ({ ...f, product: item.product })); setShowModal(true); }} className="ap-btn px-4 py-2 text-sm font-semibold rounded-lg text-white" style={{ background: "var(--ap-primary)" }}>Gửi khiếu nại</button>
                        <Link href="/customer/orders" className="ap-btn px-4 py-2 text-sm font-semibold rounded-lg border border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa]">Xem đơn hàng</Link>
                      </div>
                    </div>);
                })}
              </div>)
          )}

          {tab === "claims" && (
            claims.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-14 text-center text-[#8f9294]">
                <p className="font-semibold text-[#44494d]">Chưa có yêu cầu bảo hành nào</p>
              </div>) : (
              <div className="grid md:grid-cols-2 gap-4">{claims.map(claim => (
                  <div key={claim.id} className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-slate-600">{claim.id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS[claim.status].color}`}>{STATUS[claim.status].label}</span>
                    </div>
                    <h3 className="font-bold text-[#44494d]">{claim.product}</h3>
                    <p className="text-xs text-[#8f9294] mb-2">Đơn hàng {claim.orderId} • Gửi ngày {claim.filed}</p>
                    <div className="p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
                      <p className="text-xs text-[#8f9294] mb-1 font-semibold">Mô tả sự cố:</p>
                      <p className="text-sm text-[#44494d]">{claim.issue}</p>
                    </div>
                  </div>))}
              </div>)
          )}
        </div>{showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="ap-rise bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
                <h3 className="font-bold text-[#44494d]">Gửi yêu cầu bảo hành</h3>
                <button onClick={() => setShowModal(false)} className="text-[#8f9294] hover:text-[#44494d] text-lg leading-none">×</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Sản phẩm cần bảo hành</label>
                  <select value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm bg-white">{items.length === 0 ? <option value="">(Chưa có sản phẩm)</option> : items.map(w => <option key={w.id} value={w.product}>{w.product}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Loại vấn đề</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm bg-white">
                    <option>Sản phẩm bị lỗi kỹ thuật</option>
                    <option>Sản phẩm không đúng mô tả</option>
                    <option>Hỏng hóc sau thời gian sử dụng bình thường</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">Mô tả chi tiết sự cố</label>
                  <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={3} placeholder="Mô tả chi tiết vấn đề gặp phải..." className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm resize-none focus:outline-none focus:border-[#1a4b97]" />
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t border-[#f0f0f0]">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel") || "Hủy"}</button>
                <button onClick={submit} className="ap-btn flex-1 py-2.5 rounded-xl font-semibold text-white" style={{ background: "var(--ap-primary)" }}>Gửi yêu cầu</button>
              </div>
            </div>
          </div>)}
      </main>
    </>);
}

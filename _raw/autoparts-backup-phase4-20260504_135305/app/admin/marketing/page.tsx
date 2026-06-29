"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { getAuth } from "@/lib/auth";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";

// ─── Image Upload ────────────────────────────────────────────────────
function ImageUpload({ preview, onFile }: { preview: string | null; onFile: (url: string) => void }) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  function handle(file: File) {
    const rd = new FileReader();
    rd.onload = e => onFile(e.target?.result as string);
    rd.readAsDataURL(file);
  }
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600 mb-1 block">Ảnh Banner (Tỉ lệ 3:1 khuyên dùng)</label>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handle(f); }}
        onClick={() => ref.current?.click()}
        className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
        style={{ borderColor: drag ? "var(--ap-primary)" : "#CBD5E1", background: drag ? "#FFF7ED" : "#f8f8fa", minHeight: "150px" }}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FFF7ED" }}>
              <span className="text-[#1a4b97] font-bold text-xl">+</span>
            </div>
            <p className="text-sm font-semibold text-slate-600">Kéo thả hoặc click để chọn ảnh</p>
            <p className="text-xs text-[#8f9294]">JPG, PNG, WEBP — tối đa 5MB</p>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      </div>
      {preview && (
        <button onClick={() => onFile("")} className="mt-1 text-xs text-red-500 hover:text-red-600 font-medium">✕ Xóa ảnh</button>
      )}
    </div>
  );
}

const vouchersApi = {
  list: async (): Promise<Voucher[]> => { const r = await fetch("/api/vouchers"); const d = await r.json(); return Array.isArray(d) ? d : []; },
  create: async (data: Partial<Voucher>) => { await fetch("/api/vouchers", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }); },
  update: async (id: string, data: Partial<Voucher>) => { await fetch("/api/vouchers/" + id, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }); },
  remove: async (id: string) => { await fetch("/api/vouchers/" + id, { method:"DELETE" }); },
};

interface FlashSale { id: string; name: string; discount: number; startTime: string; endTime: string; active: boolean; products: any[]; }
interface Banner { id: string; title: string; subtitle: string; cta: string; href: string; startDate: string; endDate: string; status: string; clicks: number; }

const flashSalesApi = {
  list: async (): Promise<FlashSale[]> => { const r = await fetch("/api/flash-sales"); const d = await r.json(); return Array.isArray(d) ? d : []; },
  create: async (data: Partial<FlashSale>) => { await fetch("/api/flash-sales", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }); },
  update: async (id: string, data: Partial<FlashSale>) => { await fetch("/api/flash-sales/" + id, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }); },
  remove: async (id: string) => { await fetch("/api/flash-sales/" + id, { method:"DELETE" }); },
};

const bannersApi = {
  list: async (): Promise<Banner[]> => { const r = await fetch("/api/banners"); const d = await r.json(); return Array.isArray(d) ? d : []; },
  create: async (data: Partial<Banner>) => { await fetch("/api/banners", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }); },
  update: async (id: string, data: Partial<Banner>) => { await fetch("/api/banners/" + id, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) }); },
  remove: async (id: string) => { await fetch("/api/banners/" + id, { method:"DELETE" }); },
};

const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  ended: "bg-[#f4f4f4] text-[#8f9294]"
};

interface Voucher { id: string; code: string; type: "percent" | "fixed" | "shipping"; value: number; minOrder: number; limit: number; used: number; expiry: string; active: boolean; }

// ─── Voucher Tab ─────────────────────────────────────────────────────────────
function VouchersTab() {
  const { t, fp, lang } = useLang();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", minOrder: "", limit: "100", expiry: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    vouchersApi.list().then(setVouchers).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (v: Voucher) => {
    await vouchersApi.update(v.id, { active: !v.active });
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Xóa voucher này?")) return;
    await vouchersApi.remove(id); load();
  };
  const create = async () => {
    setErr("");
    if (!form.code || !form.value) { setErr("Vui lòng nhập đủ thông tin"); return; }
    setSaving(true);
    try {
      await vouchersApi.create({ ...form, type: form.type as "percent" | "fixed" | "shipping", value: Number(form.value), minOrder: Number(form.minOrder), limit: Number(form.limit) });
      setShowModal(false);
      setForm({ code: "", type: "percent", value: "", minOrder: "", limit: "100", expiry: "" });
      load();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Lỗi"); }
    finally { setSaving(false); }
  };

  const filtered = vouchers.filter(v => !search || v.code.includes(search.toUpperCase()));

  return (
    <div>
      <div className="bg-white rounded-xl border border-[#f0f0f0] p-4 mb-4 flex gap-3 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("searchVoucher")}
          className="pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] w-64" />
        <button onClick={() => setShowModal(true)}
          className="ml-auto px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
          + Tạo voucher
        </button>
      </div>
      <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
        <table className="w-full">
          <thead style={{ background: "#f8f8fa" }}>
            <tr className="text-xs text-[#8f9294] font-semibold">
              {["MÃ VOUCHER","LOẠI & GIÁ TRỊ","ĐƠN TỐI THIỂU","ĐÃ DÙNG / GIỚI HẠN","HẾT HẠN","TRẠNG THÁI","HÀNH ĐỘNG"].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-8 text-[#8f9294] text-sm">{t("loading")}</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-[#8f9294] text-sm">Không có voucher</td></tr>}
            {filtered.map(v => (
              <tr key={v.id} className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono font-bold text-[#44494d] bg-[#f4f4f4] px-2 py-0.5 rounded text-sm">{v.code}</span>
                </td>
                <td className="px-4 py-3 font-bold">
                  {v.type === "percent" ? <span className="text-[#1a4b97]">{v.value}%</span>
                    : v.type === "fixed" ? <span className="text-[#1a4b97]">{fp(v.value)}</span>
                    : <span className="text-green-600">{"Miễn ship"}</span>}
                </td>
                <td className="px-4 py-3 text-[#8f9294] text-sm">{fp(v.minOrder)}</td>
                <td className="px-4 py-3">
                  <div className="w-28">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8f9294]">{v.used} / {v.limit}</span>
                      <span className="text-[#8f9294]">{Math.round(v.used / v.limit * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#f4f4f4]">
                      <div className="h-full rounded-full" style={{ width: `${v.used / v.limit * 100}%`, background: "var(--ap-primary)" }} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#8f9294] text-sm">{v.expiry}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(v)} className="text-xs font-semibold">
                    {v.active ? <span className="text-green-600">● Bật</span> : <span className="text-[#8f9294]">○ Tắt</span>}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 text-xs font-bold">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
              <h3 className="font-bold text-[#44494d]">{"Tạo mã voucher mới"}</h3>
              <button onClick={() => setShowModal(false)} className="text-[#8f9294] hover:text-slate-600">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {err && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">Mã Voucher *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="VD: SUMMER30" className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#1a4b97]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">{"Loại giảm giá"}</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm bg-white">
                  <option value="percent">{"Phần trăm (%)"}</option>
                  <option value="fixed">{"Số tiền cố định (VNĐ)"}</option>
                  <option value="shipping">{"Miễn phí vận chuyển"}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">{"Giá trị *"}</label>
                  <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === "percent" ? "VD: 20" : "VD: 50000"} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">{"Đơn tối thiểu (đ)"}</label>
                  <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
                    placeholder="VD: 500000" className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">{"Giới hạn dùng"}</label>
                  <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600 mb-1 block">{"Ngày hết hạn"}</label>
                  <input type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-[#f0f0f0]">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
              <button onClick={create} disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>
                {saving ? "Đang lưu..." : "Tạo voucher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Flash Sale Tab ───────────────────────────────────────────────────────────
function FlashSaleTab() {
  const { t } = useLang();
  const [campaigns, setCampaigns] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", discount: "30", startTime: "", endTime: "" });
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setAllProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    flashSalesApi.list().then(setCampaigns).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (fs: FlashSale) => {
    await flashSalesApi.update(fs.id, { active: !fs.active });
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Xóa Flash Sale này?")) return;
    await flashSalesApi.remove(id); load();
  };
  const create = async () => {
    if (!form.name || !form.startTime || !form.endTime) { alert("Vui lòng điền đủ thông tin"); return; }
    setSaving(true);
    const prods = allProducts.filter(p => selectedProducts.includes(p.id)).map(p => ({
      id: p.id, name: p.name, brand: p.brand,
      price: Math.round(p.price * (1 - Number(form.discount) / 100)),
      originalPrice: p.price, discount: Number(form.discount),
      rating: p.rating, reviews: (p as { reviews?: number }).reviews ?? 0, sold: 0, stock: p.stock,
      img: p.image, oem: p.type === "OEM",
    }));
    // Convert local datetime to UTC ISO to avoid timezone mismatch with server
    const startISO = new Date(form.startTime).toISOString();
    const endISO   = new Date(form.endTime).toISOString();
    await flashSalesApi.create({ ...form, startTime: startISO, endTime: endISO, discount: Number(form.discount), products: prods });
    setSaving(false); setShowForm(false); setSelectedProducts([]);
    setForm({ name: "", discount: "30", startTime: "", endTime: "" });
    load();
  };

  const now = new Date();
  return (
    <div className="space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm" style={{ background: "var(--ap-primary)" }}>
          + Tạo Flash Sale mới
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-6">
          <h2 className="font-bold text-[#44494d] mb-4">{t("createFlashSale")}</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Tên chiến dịch *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: Flash Sale Cuối Tuần" className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("discountPercent")}</label>
              <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                min={1} max={90} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Thời gian bắt đầu *</label>
              <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Thời gian kết thúc *</label>
              <input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold text-slate-600 mb-2 block">Chọn sản phẩm tham gia ({selectedProducts.length} đã chọn)</label>
            <div className="border border-[#e5e5e5] rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
              {allProducts.slice(0, 20).map(p => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-[#f8f8fa]">
                  <input type="checkbox" checked={selectedProducts.includes(p.id)}
                    onChange={e => setSelectedProducts(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))}
                    className="accent-orange-500" />
                  <span className="text-sm text-[#44494d] flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-[#8f9294]">{p.brand}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600">{t("cancel")}</button>
            <button onClick={create} disabled={saving} className="px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>
              {saving ? "Đang lưu..." : "Lên lịch Flash Sale"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-8 text-center text-[#8f9294]">{t("loading")}</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-8 text-center text-[#8f9294]">Chưa có Flash Sale nào. Tạo chiến dịch đầu tiên!</div>
      ) : campaigns.map(fs => {
        const isActive = fs.active && new Date(fs.startTime) <= now && new Date(fs.endTime) >= now;
        const isScheduled = fs.active && new Date(fs.startTime) > now;
        return (
          <div key={fs.id} className="bg-white rounded-xl border border-[#f0f0f0] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#44494d]">{fs.name}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-green-100 text-green-700" : isScheduled ? "bg-blue-100 text-blue-700" : "bg-[#f4f4f4] text-[#8f9294]"}`}>
                    {isActive ? "Đang chạy" : isScheduled ? "Lên lịch" : fs.active ? "Tắt" : "Đã kết thúc"}
                  </span>
                </div>
                <p className="text-sm text-[#8f9294]">
                  Giảm {fs.discount}% • {fs.products.length} sản phẩm •{" "}
                  {new Date(fs.startTime).toLocaleString("vi-VN")} → {new Date(fs.endTime).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(fs)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${fs.active ? "border-[#e5e5e5] text-slate-600" : "border-orange-300 text-[#1a4b97]"}`}>
                  {fs.active ? "Tắt" : "Bật"}
                </button>
                <button onClick={() => remove(fs.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50">{t("delete")}</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Banners Tab ──────────────────────────────────────────────────────────────
function BannersTab() {
  const { t } = useLang();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", cta: "Khám phá", href: "/products", startDate: "", endDate: "", image: "" });

  const load = useCallback(() => {
    setLoading(true);
    bannersApi.list().then(setBanners).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (b: Banner) => {
    const status = b.status === "active" ? "ended" : "active";
    await bannersApi.update(b.id, { status });
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Xóa banner này?")) return;
    await bannersApi.remove(id); load();
  };
  const create = async () => {
    if (!form.title || !form.endDate) { alert("Vui lòng nhập tiêu đề và ngày kết thúc"); return; }
    setSaving(true);
    await bannersApi.create({ ...form, status: "active" });
    setSaving(false); setShowForm(false);
    setForm({ title: "", subtitle: "", cta: "Khám phá", href: "/products", startDate: "", endDate: "", image: "" });
    load();
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm" style={{ background: "var(--ap-primary)" }}>
          + Thêm banner mới
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
          <h3 className="font-bold text-[#44494d] mb-4">Tạo banner mới</h3>
          <div className="mb-4">
            <ImageUpload preview={form.image || null} onFile={url => setForm(prev => ({ ...prev, image: url }))} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Tiêu đề *", key: "title", placeholder: "VD: Flash Sale Tháng 3" },
              { label: "Phụ đề", key: "subtitle", placeholder: "VD: Giảm đến 40% phụ tùng" },
              { label: "Nút CTA", key: "cta", placeholder: "Mua ngay" },
              { label: "Đường dẫn", key: "href", placeholder: "/flash-sale" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-semibold text-slate-600 mb-1 block">{f.label}</label>
                <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
              </div>
            ))}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("bannerStartDate")}</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Ngày kết thúc *</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600">{t("cancel")}</button>
            <button onClick={create} disabled={saving} className="px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>
              {saving ? "Đang lưu..." : "Tạo banner"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-[#8f9294]">{t("loading")}</div>
      ) : banners.map(b => (
        <div key={b.id} className="bg-white rounded-xl border border-[#f0f0f0] p-5 flex items-center gap-5">
          {b.image ? (
            <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 border border-[#f0f0f0]">
               <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-32 h-20 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
              <span className="text-white font-bold text-xs text-center px-2">{b.title}</span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[#44494d]">{b.title}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[b.status]}`}>
                {b.status === "active" ? "Đang chạy" : b.status === "scheduled" ? "Lên lịch" : "Đã kết thúc"}
              </span>
            </div>
            <p className="text-sm text-[#8f9294] mb-1">{b.subtitle}</p>
            <p className="text-xs text-[#8f9294]">CTA: {b.cta} → {b.href} • {b.startDate} – {b.endDate} • {b.clicks} clicks</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggleStatus(b)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa]">
              {b.status === "active" ? "Tắt" : "Bật"}
            </button>
            <button onClick={() => remove(b.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50">{t("delete")}</button>
          </div>
        </div>
      ))}
    </div>
  );
}


// ─── Origins Tab ──────────────────────────────────────────────────────────────
function OriginsTab() {
  const [origins, setOrigins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", nameZh: "", image: "" });

  const load = () => { setLoading(true); fetch("/api/origins").then(r => r.json()).then(setOrigins).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return alert("Vui lòng nhập tên quốc gia/nguồn hàng");
    setSaving(true);
    await fetch("/api/origins", { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, active: true}) });
    setShowForm(false); setForm({ name: "", nameZh: "", image: "" });
    load(); setSaving(false);
  };
  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/origins/${id}`, { method: "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ active: !active }) }); load();
  };
  const remove = async (id: string) => { if (confirm("Xóa quốc gia này?")) { await fetch(`/api/origins/${id}`, { method: "DELETE" }); load(); } };

  return (
    <div className="space-y-4">
      {!showForm && <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#0d2d5e] text-white rounded-xl text-sm font-bold">+ Thêm gốc (Quốc gia)</button>}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-[#f0f0f0]">
           <h3 className="font-bold mb-4">Thêm nguồn mới</h3>
           <div className="grid grid-cols-2 gap-4 mb-4">
             <div><label className="block text-xs font-bold mb-1">Tên Tiếng Việt *</label><input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} className="w-full border rounded p-2 text-sm" placeholder="Hàn Quốc"/></div>
             <div><label className="block text-xs font-bold mb-1">Tên Tiếng Trung</label><input value={form.nameZh} onChange={e=>setForm(f=>({...f, nameZh:e.target.value}))} className="w-full border rounded p-2 text-sm" placeholder="韩国"/></div>
             <div className="col-span-2">
               <label className="block text-xs font-bold mb-1">Ảnh đại diện thẻ (Để trống sẽ tự động tìm cờ quốc gia)</label>
               <input value={form.image} onChange={e=>setForm(f=>({...f, image:e.target.value}))} className="w-full border rounded p-2 text-sm" placeholder="VD: /vipo-assets/01.png hoặc để trống"/>
             </div>
           </div>
           <div className="flex gap-2">
             <button onClick={()=>setShowForm(false)} className="px-4 py-2 border rounded text-sm font-bold">Hủy</button>
             <button onClick={save} disabled={saving} className="px-4 py-2 bg-[#0d2d5e] text-white rounded text-sm font-bold">{saving?"Đang lưu...":"Lưu"}</button>
           </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {origins.map(o => (
          <div key={o.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {o.image ? (
                <img src={o.image} alt={o.name} className="w-10 h-10 rounded-full border shadow-sm object-cover bg-white" />
              ) : (
                <div className="w-10 h-10 rounded-full border shadow-sm bg-gray-100 flex justify-center items-center text-lg">{o.name.substring(0,1)}</div>
              )}
              <div>
                <p className="font-bold text-sm text-slate-700">{o.name}</p>
                <p className="text-xs text-gray-500">{o.nameZh}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={()=>toggle(o.id, o.active)} className={`text-xs px-2 py-1 border rounded ${o.active?'text-slate-600':'text-red-500 border-red-200'}`}>{o.active?'Tắt':'Bật'}</button>
               <button onClick={()=>remove(o.id)} className="text-xs px-2 py-1 border rounded text-red-500 border-red-200">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HomeSections Tab ─────────────────────────────────────────────────────────
function HomeSectionsTab() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", titleZh: "", icon: "", query: "?limit=10", limit: "10" });

  const load = () => { setLoading(true); fetch("/api/home-sections").then(r => r.json()).then(setSections).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) return alert("Vui lòng nhập tiêu đề section");
    setSaving(true);
    await fetch("/api/home-sections", { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...form, limit: Number(form.limit), active: true}) });
    setShowForm(false); setForm({ title: "", titleZh: "", icon: "", query: "?limit=10", limit: "10" });
    load(); setSaving(false);
  };
  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/home-sections/${id}`, { method: "PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ active: !active }) }); load();
  };
  const remove = async (id: string) => { if (confirm("Xóa section trang chủ này?")) { await fetch(`/api/home-sections/${id}`, { method: "DELETE" }); load(); } };

  return (
    <div className="space-y-4">
      {!showForm && <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-[#0d2d5e] text-white rounded-xl text-sm font-bold">+ Thêm Section Trang Chủ</button>}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-[#f0f0f0]">
           <h3 className="font-bold mb-4">Thêm Section mới</h3>
           <div className="grid grid-cols-2 gap-4 mb-4">
             <div><label className="block text-xs font-bold mb-1">Tiêu đề (VND) *</label><input value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} className="w-full border rounded p-2 text-sm" placeholder="Phụ tùng Nhập Khẩu"/></div>
             <div><label className="block text-xs font-bold mb-1">Tiêu đề (ZH)</label><input value={form.titleZh} onChange={e=>setForm(f=>({...f, titleZh:e.target.value}))} className="w-full border rounded p-2 text-sm" placeholder="进口配件"/></div>
             <div><label className="block text-xs font-bold mb-1">Query lấy Data</label><input value={form.query} onChange={e=>setForm(f=>({...f, query:e.target.value}))} className="w-full border rounded p-2 text-sm" placeholder="?isImported=true hoặc ?category=id"/></div>
             <div><label className="block text-xs font-bold mb-1">Số lượng hiển thị (Limit)</label><input type="number" value={form.limit} onChange={e=>setForm(f=>({...f, limit:e.target.value}))} className="w-full border rounded p-2 text-sm" /></div>
             <div className="col-span-2"><label className="block text-xs font-bold mb-1">Icon Title (URL)</label><input value={form.icon} onChange={e=>setForm(f=>({...f, icon:e.target.value}))} className="w-full border rounded p-2 text-sm" placeholder="/vipo-assets/fire.svg"/></div>
           </div>
           <div className="flex gap-2">
             <button onClick={()=>setShowForm(false)} className="px-4 py-2 border rounded text-sm font-bold">Hủy</button>
             <button onClick={save} disabled={saving} className="px-4 py-2 bg-[#0d2d5e] text-white rounded text-sm font-bold">{saving?"Đang lưu...":"Lưu"}</button>
           </div>
        </div>
      )}
      <div className="flex flex-col gap-3 mt-4">
        {sections.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-xl border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {s.icon ? <img src={s.icon} className="w-8 h-8" alt=""/> : <div className="w-8 h-8 bg-slate-100 rounded-full"/>}
              <div>
                <p className="font-bold text-sm text-slate-700">{s.title} <span className="text-gray-400 font-normal">({s.titleZh})</span></p>
                <p className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded w-max mt-1">/api/products{s.query} • Hiển thị: {s.limit}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={()=>toggle(s.id, s.active)} className={`text-xs px-2 py-1 border rounded ${s.active?'text-slate-600':'text-red-500 border-red-200'}`}>{s.active?'Tắt':'Bật'}</button>
               <button onClick={()=>remove(s.id)} className="text-xs px-2 py-1 border rounded text-red-500 border-red-200">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminMarketingPage() {
  const { t, fp, lang } = useLang();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setAllProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const [form, setForm] = useState({ title: "", subtitle: "", cta: "Khám phá", href: "/products", startDate: "", endDate: "" });
  const [activeTab, setActiveTab] = useState<"vouchers" | "banners" | "flash_sale" | "origins" | "home_sections">("vouchers");

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
      <AdminSidebar active="/admin/marketing" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{t("marketingTitle")}</h1>
          </div>
          <div className="px-6 flex border-t border-[#f0f0f0]">
            {([ ["vouchers","Mã khuyến mãi"], ["banners","Banner & Quảng cáo"], ["flash_sale","Flash Sale"], ["origins","Khám phá (Quốc gia)"], ["home_sections","Cấu trúc Trang chủ"] ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {activeTab === "vouchers" && <VouchersTab />}
          {activeTab === "banners"  && <BannersTab />}
          {activeTab === "flash_sale" && <FlashSaleTab />}
          {activeTab === "origins" && <OriginsTab />}
          {activeTab === "home_sections" && <HomeSectionsTab />}
        </div>
      </main>
    </div>
  );
}

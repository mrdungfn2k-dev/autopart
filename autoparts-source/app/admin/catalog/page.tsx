"use client";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";
import { formatPrice } from "@/lib/data";
import { useLocalStorage } from "@/lib/useLocalStorage";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";
import Pagination from "@/components/Pagination";
import { usePaged } from "@/lib/usePaged";

// ─── Types ───────────────────────────────────────────────────────────
interface Category {
  id: string; name: string; desc: string; count: number; icon: string; color: string; img?: string;
  subcategories?: Category[];
}
interface Product {
  id: string; name: string; oemCode: string; categoryId: string; categoryName: string;
  type: string; price: number; rating: number; reviewCount: number; supplier: string; image: string;
  compatibleVehicles: string[];
  stock: number;
  description: string;
}

const typeColors: Record<string, string> = {
  OEM: "bg-green-100 text-green-700",
  OES: "bg-blue-100 text-blue-700",
  Generic: "bg-yellow-100 text-yellow-700",
};

// ─── Image Upload ────────────────────────────────────────────────────
function ImageUpload({ preview, onFile }: { preview: string | null; onFile: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  function handle(file: File) {
    const rd = new FileReader();
    rd.onload = e => onFile(e.target?.result as string);
    rd.readAsDataURL(file);
  }
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 mb-1 block">Ảnh</label>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handle(f); }}
        onClick={() => ref.current?.click()}
        className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
        style={{ borderColor: drag ? "var(--ap-primary)" : "#CBD5E1", background: drag ? "#FFF7ED" : "#f8f8fa", minHeight: "110px" }}
      >{preview ? (
          <img src={preview} alt="preview" className="w-full h-32 object-contain" />) : (
          <div className="flex flex-col items-center gap-1 py-5">
            <span className="text-[#1a4b97] font-bold text-2xl">+</span>
            <p className="text-xs text-[#8f9294]">{"Kéo thả hoặc click để chọn ảnh"}</p>
          </div>)}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      </div>{preview && <button onClick={() => onFile("")} className="mt-1 text-xs text-red-400 hover:text-red-600">✕ Xóa ảnh</button>}
    </div>);
}

// ─── Category Modal ──────────────────────────────────────────────────
function CategoryModal({ cat, onSave, onClose }: {
  cat: Partial<Category> | null;
  onSave: (c: Category) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [form, setForm] = useState<Partial<Category>>({
    name: "", desc: "", icon: "PT", color: "var(--ap-primary)", count: 0, ...cat,
  });
  const [img, setImg] = useState<string>(cat?.img || "");

  const set = (k: keyof Category, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!cat?.id;

  const handleSave = () => {
    if (!form.name?.trim()) return alert("Vui lòng nhập tên danh mục");
    onSave({
      id: form.id || "cat_" + Date.now(),
      name: form.name!,
      desc: form.desc || "",
      icon: form.icon || "PT",
      color: form.color || "var(--ap-primary)",
      count: Number(form.count) || 0,
      img: img || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-[#44494d] font-bold text-xl">✕</button>
        <h2 className="text-lg font-bold text-[#44494d] mb-5">{isEdit ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>
        <div className="space-y-4">
          <ImageUpload preview={img || null} onFile={url => setImg(url)} />
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Tên danh mục <span className="text-red-500">*</span></label>
            <input value={form.name || ""} onChange={e => set("name", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
              placeholder="VD: Má phanh, Lọc dầu..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">{t("description")}</label>
            <input value={form.desc || ""} onChange={e => set("desc", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
              placeholder="Mô tả ngắn về danh mục..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Ký hiệu / Icon</label>
              <input value={form.icon || ""} onChange={e => set("icon", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="VD: Phanh, Lọc, Bugi..." maxLength={6} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Màu sắc</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color || "var(--ap-primary)"} onChange={e => set("color", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-[#e5e5e5] cursor-pointer p-0.5" />
                <input value={form.color || ""} onChange={e => set("color", e.target.value)}
                  className="flex-1 px-2 py-2.5 border border-[#e5e5e5] rounded-lg text-xs focus:outline-none"
                  placeholder="var(--ap-primary)" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Số lượng phụ tùng (ước tính)</label>
            <input type="number" value={form.count || 0} onChange={e => set("count", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>{isEdit ? "Lưu thay đổi" : "Thêm danh mục"}
          </button>
        </div>
      </div>
    </div>);
}

// ─── Product Modal ────────────────────────────────────────────────────
function ProductModal({ prod, categories, onSave, onClose }: {
  prod: Partial<Product> | null;
  categories: Category[];
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [form, setForm] = useState<Partial<Product>>({
    name: "", oemCode: "", categoryId: categories[0]?.id || "", type: "OEM",
    price: 0, rating: 5, reviewCount: 0, supplier: "", image: "", compatibleVehicles: [],
    stock: 0, description: "", origin: "",
    ...prod,
  });
  const [img, setImg] = useState<string>(prod?.image || "");
  const [vehicles, setVehicles] = useState<string>(prod?.compatibleVehicles?.join("\n") || "");

  // Phase 4.1: attribute set + values, channels multi-select, warehouseStocks per warehouse
  const [attributeSets, setAttributeSets] = useState<any[]>([]);
  const [attributeSetId, setAttributeSetId] = useState<string>((prod as any)?.attributeSetId || "");
  const [attributes, setAttributes] = useState<Record<string, string | number>>(((prod as any)?.attributes as Record<string, string | number>) || {});
  const [channelsList, setChannelsList] = useState<any[]>([]);
  const [channels, setChannels] = useState<string[]>(Array.isArray((prod as any)?.channels) ? (prod as any).channels : []);
  const [warehousesList, setWarehousesList] = useState<any[]>([]);
  const [warehouseStocks, setWarehouseStocks] = useState<Record<string, number>>(((prod as any)?.warehouseStocks as Record<string, number>) || {});

  useEffect(() => {
    fetch("/api/attribute-sets").then(r => r.ok ? r.json() : []).then(d => setAttributeSets(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/channels").then(r => r.ok ? r.json() : []).then(d => setChannelsList(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/warehouses").then(r => r.ok ? r.json() : []).then(d => setWarehousesList(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const selectedSet = attributeSets.find((x: any) => x.id === attributeSetId);

  const set = (k: keyof Product, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!prod?.id;

  const handleSave = () => {
    if (!form.name?.trim()) return alert("Vui lòng nhập tên sản phẩm");
    if (!form.price || form.price <= 0) return alert("Vui lòng nhập giá hợp lệ");
    const cat = categories.find(c => c.id === form.categoryId);
    onSave({
      id: form.id || "prod_" + Date.now(),
      name: form.name!,
      oemCode: form.oemCode || "",
      categoryId: form.categoryId || "",
      categoryName: cat?.name || "",
      type: form.type || "OEM",
      price: Number(form.price) || 0,
      rating: Number(form.rating) || 5,
      reviewCount: Number(form.reviewCount) || 0,
      supplier: form.supplier || "",
      origin: form.origin || "",
      image: img || form.image || "",
      compatibleVehicles: vehicles.split("\n").map(v => v.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      description: form.description || "",
      isTrending: (form as any).isTrending ?? false,
      isHot: (form as any).isHot ?? false,
      isImported: (form as any).isImported ?? false,
      attributeSetId: attributeSetId || undefined,
      attributes,
      channels: channels.length > 0 ? channels : undefined,
      warehouseStocks: Object.keys(warehouseStocks).length > 0 ? warehouseStocks : undefined,
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0] sticky top-0 bg-white z-10">
          <h3 className="font-bold text-[#44494d] text-lg">{isEdit ? "Sửa phụ tùng" : "Thêm phụ tùng mới"}</h3>
          <button onClick={onClose} className="text-[#8f9294] hover:text-[#44494d] font-bold text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <ImageUpload preview={img || null} onFile={url => setImg(url)} />
          <div>
            <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Tên sản phẩm <span className="text-red-500">*</span></label>
            <input value={form.name || ""} onChange={e => set("name", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
              placeholder="VD: Má phanh trước Toyota Vios 2020" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">{t("oemCode")}</label>
              <input value={form.oemCode || ""} onChange={e => set("oemCode", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="04465-0D156" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Nhà cung cấp</label>
              <input value={form.supplier || ""} onChange={e => set("supplier", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="Tên NCC" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Danh mục <span className="text-red-500">*</span></label>
              <select value={form.categoryId || ""} onChange={e => set("categoryId", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] bg-white">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">{t("productType")}</label>
              <select value={form.type || "OEM"} onChange={e => set("type", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] bg-white">
                <option value="OEM">OEM – Chính hãng</option>
                <option value="OES">OES – Aftermarket</option>
                <option value="Generic">Generic – Phổ thông</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Xuất xứ</label>
              <input type="text" list="origin-list" value={form.origin || ""} onChange={e => set("origin", e.target.value)}
                placeholder="Ví dụ: Trung Quốc"
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] bg-white" />
              <datalist id="origin-list">
                <option value="Việt Nam" />
                <option value="Trung Quốc" />
                <option value="Nhật Bản" />
                <option value="Hàn Quốc" />
                <option value="Mỹ" />
                <option value="Đức" />
                <option value="Thái Lan" />
                <option value="Đài Loan" />
                <option value="Ấn Độ" />
                <option value="Indonesia" />
              </datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Giá niêm yết (VNĐ) <span className="text-red-500">*</span></label>
              <input type="number" value={form.price || ""} onChange={e => set("price", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="1250000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Tồn kho (số lượng)</label>
              <input type="number" min="0" value={form.stock ?? 0} onChange={e => set("stock", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="100" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Mô tả sản phẩm</label>
            <textarea rows={2} value={form.description || ""} onChange={e => set("description", e.target.value)}
              placeholder="Mô tả ngắn về sản phẩm..."
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm resize-none focus:outline-none focus:border-[#1a4b97]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Xe tương thích (mỗi dòng một xe)</label>
            <textarea rows={3} value={vehicles} onChange={e => setVehicles(e.target.value)}
              placeholder={"Toyota Vios 2018-2022\nToyota Yaris 2019-2023"}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm resize-none focus:outline-none focus:border-[#1a4b97]" />
          </div>{/* ── Cài đặt hiển thị trang chủ ── */}
          <div className="border border-[#f0f0f0] rounded-lg p-3 bg-[#fafafa]">
            <label className="text-xs font-semibold text-[#44494d] mb-2 block">Hiển thị trên Trang chủ</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any).isTrending ?? false}
                  onChange={e => setForm(f => ({ ...f, isTrending: e.target.checked } as any))}
                  className="accent-orange-500 w-4 h-4" />
                <span className="text-sm text-[#44494d]">Sản phẩm Trending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any).isHot ?? false}
                  onChange={e => setForm(f => ({ ...f, isHot: e.target.checked } as any))}
                  className="accent-orange-500 w-4 h-4" />
                <span className="text-sm text-[#44494d]">Phụ tùng hot bán chạy</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any).isImported ?? false}
                  onChange={e => setForm(f => ({ ...f, isImported: e.target.checked } as any))}
                  className="accent-orange-500 w-4 h-4" />
                <span className="text-sm text-[#44494d]">Phụ tùng nhập khẩu chính hãng</span>
              </label>
            </div>
          </div>
        </div>{/* ── Phase 4.1: Bộ thuộc tính kỹ thuật ── */}
          {attributeSets.length > 0 && (
            <div className="border border-[#f0f0f0] rounded-lg p-3 bg-[#fafafa]">
              <label className="text-xs font-semibold text-[#44494d] mb-2 block">Bộ thuộc tính kỹ thuật</label>
              <select value={attributeSetId} onChange={e => { setAttributeSetId(e.target.value); setAttributes({}); }} className="w-full px-3 py-2 border border-[#e5e5e5] rounded text-sm bg-white mb-2">
                <option value="">— Không gắn bộ thuộc tính —</option>{attributeSets.map((as: any) => <option key={as.id} value={as.id}>{as.name}</option>)}
              </select>{selectedSet && Array.isArray(selectedSet.attributes) && selectedSet.attributes.length > 0 && (
                <div className="space-y-2 mt-2 pt-2 border-t border-[#e5e5e5]">{selectedSet.attributes.map((attr: any) => (
                    <div key={attr.id}>
                      <label className="text-xs text-slate-600 mb-0.5 block">{attr.name}{attr.unit ? ` (${attr.unit})` : ""}</label>{attr.type === "select" ? (
                        <select value={(attributes[attr.id] as string) || ""} onChange={e => setAttributes(a => ({ ...a, [attr.id]: e.target.value }))} className="w-full px-2 py-1.5 border border-[#e5e5e5] rounded text-sm bg-white">
                          <option value="">— Chọn —</option>{(attr.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>) : attr.type === "number" ? (
                        <input type="number" step="any" value={(attributes[attr.id] as number) ?? ""} onChange={e => setAttributes(a => ({ ...a, [attr.id]: parseFloat(e.target.value) || 0 }))} className="w-full px-2 py-1.5 border border-[#e5e5e5] rounded text-sm" />) : (
                        <input value={(attributes[attr.id] as string) || ""} onChange={e => setAttributes(a => ({ ...a, [attr.id]: e.target.value }))} className="w-full px-2 py-1.5 border border-[#e5e5e5] rounded text-sm" />)}
                    </div>))}
                </div>)}
            </div>)}

          {/* ── Phase 4.1: Kênh bán ── */}
          {channelsList.length > 0 && (
            <div className="border border-[#f0f0f0] rounded-lg p-3 bg-[#fafafa]">
              <label className="text-xs font-semibold text-[#44494d] mb-2 block">Hiển thị trên kênh bán <span className="text-[#8f9294] font-normal">(bỏ trống = tất cả kênh)</span></label>
              <div className="grid grid-cols-2 gap-1.5">{channelsList.filter((c: any) => c.active).map((c: any) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={channels.includes(c.id)} onChange={e => { if (e.target.checked) setChannels(arr => [...arr, c.id]); else setChannels(arr => arr.filter(x => x !== c.id)); }} className="w-4 h-4" />
                    <span>{c.name}</span>
                  </label>))}
              </div>
            </div>)}

          {/* ── Phase 4.1: Tồn kho theo từng kho ── */}
          {warehousesList.length > 0 && (
            <div className="border border-[#f0f0f0] rounded-lg p-3 bg-[#fafafa]">
              <label className="text-xs font-semibold text-[#44494d] mb-2 block">Tồn kho theo kho hàng <span className="text-[#8f9294] font-normal">(tổng cộng tự cộng vào field "Tồn kho" ở trên)</span></label>
              <div className="space-y-1.5">{warehousesList.filter((w: any) => w.active).map((w: any) => (
                  <div key={w.id} className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 flex-1">{w.name} ({w.code}){w.isDefault ? " ★" : ""}</span>
                    <input type="number" min="0" value={warehouseStocks[w.id] ?? 0} onChange={e => setWarehouseStocks(s => ({ ...s, [w.id]: parseInt(e.target.value) || 0 }))} className="w-24 px-2 py-1 border border-[#e5e5e5] rounded text-sm text-right" />
                  </div>))}
                {Object.keys(warehouseStocks).length > 0 && (
                  <p className="text-xs text-[#1a4b97] pt-1.5 border-t border-[#e5e5e5]">Tổng: {Object.values(warehouseStocks).reduce((s, n) => s + (n || 0), 0)}</p>)}
              </div>
            </div>)}

        <div className="flex gap-3 p-5 border-t border-[#f0f0f0] sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>{isEdit ? "Lưu thay đổi" : "Thêm phụ tùng"}
          </button>
        </div>
      </div>
    </div>);
}

// ─── Delete Confirm ──────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  const { t } = useLang();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-red-500"></div>
        <h3 className="font-bold text-[#44494d] mb-2">Xác nhận xóa</h3>
        <p className="text-sm text-[#8f9294] mb-5">Bạn có chắc muốn xóa <strong>"{name}"</strong>? Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600">{t("cancel")}</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1a4b97]">{t("delete")}</button>
        </div>
      </div>
    </div>);
}


// ─── Category Row (Recursive) ─────────────────────────────────────────
function CategoryRow({ cat, path, depth, onEdit, onAddSub, onDelete }: {
  cat: Category; path: string[]; depth: number;
  onEdit: (c: Category, p: string[]) => void;
  onAddSub: (p: string[]) => void;
  onDelete: (c: Category, p: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const currentPath = [...path, cat.id];
  const hasSubs = cat.subcategories && cat.subcategories.length > 0;

  return (
    <>
      <tr className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3" style={{ paddingLeft: depth * 24 + 'px' }}>{depth > 0 && <span className="text-slate-300 ml-1">├─</span>}
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-xs font-extrabold shrink-0 cursor-pointer"
              style={{ background: cat.color + '22', color: cat.color }}
              onClick={() => setExpanded(!expanded)}
            >{cat.img ? <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" /> : <span>{cat.icon || 'PT'}</span>}
            </div>
            <div>
              <p className="font-semibold text-[#44494d] text-sm flex items-center gap-2">{cat.name}
                {hasSubs && (
                  <button onClick={() => setExpanded(!expanded)} className="text-xs text-slate-400 hover:text-slate-600 font-mono">{expanded ? '▼' : '▶'}
                  </button>)}
              </p>
              <p className="text-xs font-mono text-[#8f9294]">{cat.id}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-[#8f9294] text-sm"><span className="line-clamp-2 max-w-xs">{cat.desc}</span></td>
        <td className="px-4 py-3 text-sm font-bold" style={{ color: cat.color || 'var(--ap-primary)' }}>{cat.count?.toLocaleString() || 0}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: cat.color || 'var(--ap-primary)' }}></div>
            <span className="text-xs text-[#8f9294] font-mono">{cat.color}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1 flex-wrap w-[160px]">
            <button onClick={() => onEdit(cat, path)}
              className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-[#1a4b97] transition-colors">Sửa
            </button>
            <button onClick={() => onAddSub(currentPath)}
              className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-[#1a4b97] hover:bg-[#1a4b97] hover:text-white transition-colors">+ Mục con
            </button>
            <button onClick={() => onDelete(cat, path)}
              className="px-2 py-1 rounded-lg text-xs font-semibold border border-red-100 text-red-400 hover:bg-red-50 transition-colors">Xóa
            </button>
          </div>
        </td>
      </tr>{expanded && hasSubs && cat.subcategories!.map(sub => (
        <CategoryRow key={sub.id} cat={sub} path={currentPath} depth={depth + 1}
          onEdit={onEdit} onAddSub={onAddSub} onDelete={onDelete} />))}
    </>);
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────

export default function AdminCatalogPage() {
  const { t, fp, lang } = useLang();
  const [activeTab, setActiveTab] = useState<"products" | "categories">("categories");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Category state — fetch from API, persist edits to localStorage
  const [categories, setCategories] = useLocalStorage<Category[]>("admin_categories_v2", []);
  const [prods, setProds] = useLocalStorage<Product[]>("admin_products", []);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<{ node: Partial<Category> | null, parentPath: string[] } | null>(null);
  const [deletingCat, setDeletingCat] = useState<{ node: Category, parentPath: string[] } | null>(null);

  // Always fetch fresh from API on mount (don't rely on stale localStorage)
  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) setCategories(d);
    }).catch(() => {});
    fetch("/api/products").then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) setProds(d);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Product state
  const [showProdModal, setShowProdModal] = useState(false);
  const [editingProd, setEditingProd] = useState<Partial<Product> | null>(null);
  const [deletingProd, setDeletingProd] = useState<Product | null>(null);

  const filtered = prods.filter(p =>(catFilter === "" || p.categoryId === catFilter) &&
    (typeFilter === "" || p.type === typeFilter) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.oemCode?.toLowerCase().includes(search.toLowerCase()))
  );
  const pgCat = usePaged(filtered, 15);

  // Category handlers
    const handleSaveCat = async (cat: Category) => {
    let newCategories = [...categories];
    let topLevelNodeToSave: Category;
    
    const { parentPath } = editingCat || { parentPath: [] };
    
    if (parentPath.length === 0) {
      const idx = newCategories.findIndex(c => c.id === cat.id);
      if (idx >= 0) newCategories[idx] = cat;
      else newCategories.push(cat);
      topLevelNodeToSave = cat;
    } else {
      const topLevelId = parentPath[0];
      const topIdx = newCategories.findIndex(c => c.id === topLevelId);
      if (topIdx < 0) return;
      
      const clonedTop = JSON.parse(JSON.stringify(newCategories[topIdx]));
      let currentArr = clonedTop.subcategories;
      if (!currentArr) {
        clonedTop.subcategories = [];
        currentArr = clonedTop.subcategories;
      }
      
      for (let i = 1; i < parentPath.length; i++) {
        const nextId = parentPath[i];
        let parentNode = currentArr.find((c: any) => c.id === nextId);
        if (!parentNode) return;
        if (!parentNode.subcategories) parentNode.subcategories = [];
        currentArr = parentNode.subcategories;
      }
      
      const existingIdx = currentArr.findIndex((c: any) => c.id === cat.id);
      if (existingIdx >= 0) currentArr[existingIdx] = cat;
      else currentArr.push(cat);
      
      newCategories[topIdx] = clonedTop;
      topLevelNodeToSave = clonedTop;
    }

    const isNewTop = parentPath.length === 0 && !categories.find(c => c.id === cat.id);
    if (!isNewTop) {
      await fetch(`/api/categories/${topLevelNodeToSave.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(topLevelNodeToSave) }).catch(() => {});
    } else {
      await fetch(`/api/categories`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(topLevelNodeToSave) }).catch(() => {});
    }
    
    setCategories(newCategories);
    setShowCatModal(false);
    setEditingCat(null);
  };
    const handleDeleteCat = async (id: string, parentPath: string[]) => {
    let newCategories = [...categories];

    if (parentPath.length === 0) {
      await fetch(`/api/categories/${id}`, { method: "DELETE" }).catch(() => {});
      newCategories = newCategories.filter(c => c.id !== id);
    } else {
      const topLevelId = parentPath[0];
      const topIdx = newCategories.findIndex(c => c.id === topLevelId);
      if (topIdx < 0) return;
      
      const clonedTop = JSON.parse(JSON.stringify(newCategories[topIdx]));
      let currentArr = clonedTop.subcategories || [];
      
      let parentNode: any = null;
      for (let i = 1; i < parentPath.length; i++) {
        const nextId = parentPath[i];
        parentNode = currentArr.find((c: any) => c.id === nextId);
        if (!parentNode) break;
        currentArr = parentNode.subcategories || [];
      }
      
      const targetArr = parentNode ? parentNode.subcategories : clonedTop.subcategories;
      if (targetArr) {
        const targetIdx = targetArr.findIndex((c: any) => c.id === id);
        if (targetIdx >= 0) targetArr.splice(targetIdx, 1);
      }
      
      newCategories[topIdx] = clonedTop;
      await fetch(`/api/categories/${clonedTop.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clonedTop) }).catch(() => {});
    }

    setCategories(newCategories);
    setDeletingCat(null);
  };

  // Product handlers
  const handleSaveProd = async (p: Product) => {
    if (prods.find(x => x.id === p.id)) {
      await fetch(`/api/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }).catch(() => {});
    } else {
      await fetch(`/api/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }).catch(() => {});
    }
    setProds(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) return prev.map(x => x.id === p.id ? p : x);
      return [...prev, p];
    });
    setShowProdModal(false);
    setEditingProd(null);
  };
  const handleDeleteProd = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" }).catch(() => {});
    setProds(prev => prev.filter(p => p.id !== id));
    setDeletingProd(null);
  };

  return (
    <>
      <main className="flex-1 overflow-auto">{/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">Sản phẩm &amp; Danh mục</h1>
            <div className="flex gap-2">
                <button onClick={() => { setEditingCat({ node: null, parentPath: [] }); setShowCatModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#1a4b97] text-[#1a4b97] hover:bg-[#eff4fc]">+ Thêm danh mục
                </button>
                <button onClick={() => { setEditingProd(null); setShowProdModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>+ Thêm sản phẩm
                </button>
            </div>
          </div>{/* Sub tabs */}
          <div className="px-6 flex gap-0 border-t border-[#f0f0f0]">{[["categories", `Danh mục (${categories.length})`], ["products", `Tất cả phụ tùng (${prods.length})`]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key as "products" | "categories")}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}
              </button>))}
          </div>
        </div>

        <div className="p-6">{/* ── CATEGORIES TAB ── */}
          {activeTab === "categories" && (
            <div>{categories.length === 0 && (
                <div className="text-center py-20 text-[#8f9294]">
                  <p className="text-4xl mb-3"></p>
                  <p className="font-semibold">Chưa có danh mục nào</p>
                  <p className="text-sm">Nhấn "+ Thêm danh mục" để bắt đầu</p>
                </div>)}
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
                <table className="w-full">
                  <thead style={{ background: "#f8f8fa" }}>
                    <tr className="text-xs text-[#8f9294] font-semibold">
                      <th className="text-left px-4 py-3">DANH MỤC</th>
                      <th className="text-left px-4 py-3">MÔ TẢ</th>
                      <th className="text-left px-4 py-3">PHỤ TÙNG</th>
                      <th className="text-left px-4 py-3">MÀU SẮC</th>
                      <th className="text-left px-4 py-3">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>{categories.map(cat => (
                      <CategoryRow
                        key={cat.id}
                        cat={cat}
                        path={[]}
                        depth={0}
                        onEdit={(c, p) => { setEditingCat({ node: c, parentPath: p }); setShowCatModal(true); }}
                        onAddSub={(p) => { setEditingCat({ node: null, parentPath: p }); setShowCatModal(true); }}
                        onDelete={(c, p) => setDeletingCat({ node: c, parentPath: p })}
                      />))}
                  </tbody>
                </table>
              </div>
            </div>)}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === "products" && (
            <div>{/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-5">{[
                  { label: "Tổng phụ tùng", value: prods.length.toLocaleString(), badge: "Trong hệ thống" },
                  { label: "Hàng OEM", value: prods.filter(p => p.type === "OEM").length, badge: `${Math.round(prods.filter(p => p.type === "OEM").length / prods.length * 100)}%` },
                  { label: "Hàng OES", value: prods.filter(p => p.type === "OES").length, badge: `${Math.round(prods.filter(p => p.type === "OES").length / prods.length * 100)}%` },
                  { label: "Generic", value: prods.filter(p => p.type === "Generic").length, badge: "Phổ thông" },
                ].map(s => (
                  <div key={s.label} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4">
                    <p className="text-xs text-[#8f9294] mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-[#44494d]">{s.value}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: "var(--ap-primary)" }}>{s.badge}</p>
                  </div>))}
              </div>{/* Filters */}
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-4 mb-4 flex flex-wrap gap-3 items-center">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={lang === "zh" ? "搜索名称、OEM编码..." : "Tìm tên, mã OEM..."} className="pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] w-56" />
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 bg-white">
                  <option value="">{t("allCategories")}</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 bg-white">
                  <option value="">{t("allTypes")}</option>
                  <option value="OEM">OEM</option>
                  <option value="OES">OES</option>
                  <option value="Generic">Generic</option>
                </select>{(catFilter || typeFilter || search) && (
                  <button onClick={() => { setCatFilter(""); setTypeFilter(""); setSearch(""); }}
                    className="text-xs text-[#8f9294] hover:text-red-500 border border-[#e5e5e5] px-2 py-1.5 rounded-lg">✕ Xóa lọc</button>)}
                <span className="ml-auto text-sm text-[#8f9294]">{filtered.length} kết quả</span>
              </div>{/* Table */}
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
                <table className="w-full">
                  <thead style={{ background: "#f8f8fa" }}>
                    <tr className="text-xs text-[#8f9294] font-semibold">
                      <th className="text-left px-4 py-3">{lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
                      <th className="text-left px-4 py-3">{lang === "zh" ? "分类" : "DANH MỤC"}</th>
                      <th className="text-left px-4 py-3">{lang === "zh" ? "类型" : "LOẠI"}</th>
                      <th className="text-left px-4 py-3">{lang === "zh" ? "价格" : "GIÁ"}</th>
                      <th className="text-left px-4 py-3">ĐÁNH GIÁ</th>
                      <th className="text-left px-4 py-3">{lang === "zh" ? "供应商" : "NHÀ CUNG CẤP"}</th>
                      <th className="text-left px-4 py-3">{lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
                    </tr>
                  </thead>
                  <tbody>{filtered.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-[#8f9294] text-sm">Không tìm thấy phụ tùng</td></tr>)}
                    {pgCat.paged.map(prod => (
                      <tr key={prod.id} className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f4f4f4] flex items-center justify-center shrink-0 overflow-hidden">{prod.image && prod.image.startsWith("data:")
                                ? <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />: <span className="text-xs font-bold text-[#8f9294]">{prod.categoryName?.slice(0, 3) || "PT"}</span>}
                            </div>
                            <div>
                              <p className="font-semibold text-[#44494d] text-sm line-clamp-1 max-w-[200px]">{lang === "zh" ? ((prod as any).nameZh || prod.name) : prod.name}</p>
                              <p className="text-xs font-mono text-[#8f9294]">{prod.oemCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#8f9294] text-sm">{lang === "zh" ? ((prod as any).categoryNameZh || prod.categoryName) : prod.categoryName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${typeColors[prod.type] || "bg-[#f4f4f4] text-slate-600"}`}>{prod.type}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#44494d] text-sm">{fp(prod.price)}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-sm font-medium text-yellow-600">* {prod.rating} <span className="text-[#8f9294] text-xs">({prod.reviewCount})</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#8f9294] text-sm">{prod.supplier}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingProd(prod); setShowProdModal(true); }}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-[#1a4b97]">Sửa
                            </button>
                            <button onClick={() => setDeletingProd(prod)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-red-100 text-red-400 hover:bg-red-50">Xóa
                            </button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
                {filtered.length > 0 && <Pagination {...pgCat.bind} />}
              </div>
            </div>)}
        </div>
      </main>{/* ── MODALS ── */}
      {showCatModal && (
        <CategoryModal
          cat={editingCat?.node || null}
          onSave={handleSaveCat}
          onClose={() => { setShowCatModal(false); setEditingCat(null); }}
        />)}

      {showProdModal && (
        <ProductModal
          prod={editingProd}
          categories={categories}
          onSave={handleSaveProd}
          onClose={() => { setShowProdModal(false); setEditingProd(null); }}
        />)}

      {deletingCat && (
        <DeleteConfirm
          name={deletingCat?.node?.name || ""}
          onConfirm={() => handleDeleteCat(deletingCat!.node.id, deletingCat!.parentPath)}
          onClose={() => setDeletingCat(null)}
        />)}

      {deletingProd && (
        <DeleteConfirm
          name={deletingProd.name}
          onConfirm={() => handleDeleteProd(deletingProd.id)}
          onClose={() => setDeletingProd(null)}
        />)}
    </>);
}

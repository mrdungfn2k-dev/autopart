"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import SidebarControls from "@/components/SidebarControls";
import { useLang } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────
interface Brand {
  id: string;
  name: string;
  region: string;
  logo: string;
  source: string;
  slug: string;
}

interface WMIEntry {
  brand: string;
  brandId: string;
  country: string;
  type: string;
}

interface SampleVIN {
  vin: string;
  brand: string;
  brandId: string;
  model: string;
  year: string;
}

const REGIONS: Record<string, string> = {
  japan: "Nhật Bản",
  korea: "Hàn Quốc",
  europe: "Châu Âu",
  usa: "Mỹ",
  china: "Trung Quốc",
  vietnam: "Việt Nam",
};

const REGION_COLORS: Record<string, string> = {
  japan: "bg-red-100 text-red-700",
  korea: "bg-blue-100 text-blue-700",
  europe: "bg-indigo-100 text-indigo-700",
  usa: "bg-green-100 text-green-700",
  china: "bg-yellow-100 text-yellow-700",
  vietnam: "bg-emerald-100 text-emerald-700",
};

// ─── Brand Modal ──────────────────────────────────────────────
function BrandModal({ brand, brands, onSave, onClose }: {
  brand: Partial<Brand> | null;
  brands: Brand[];
  onSave: (b: Brand) => void;
  onClose: () => void;
}) {
  const isEdit = !!brand?.id;
  const [form, setForm] = useState<Partial<Brand>>({
    id: "", name: "", region: "japan", logo: "", source: "catcar", slug: "",
    ...brand,
  });
  const set = (k: keyof Brand, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name?.trim()) return alert("Vui lòng nhập tên hãng");
    if (!form.id?.trim()) return alert("Vui lòng nhập ID hãng");
    if (!isEdit && brands.find(b => b.id === form.id?.trim())) {
      return alert("ID hãng đã tồn tại. Vui lòng chọn ID khác.");
    }
    onSave({
      id: form.id!.trim().toLowerCase().replace(/\s+/g, "-"),
      name: form.name!.trim(),
      region: form.region || "japan",
      logo: form.logo || "",
      source: form.source || "catcar",
      slug: form.slug || form.id!.trim().toLowerCase(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.65)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-[#44494d] text-xl font-bold">✕</button>
        <h2 className="text-lg font-bold text-[#44494d] mb-5">{isEdit ? "Sửa thông tin hãng xe" : "Thêm hãng xe mới"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Tên hãng <span className="text-red-500">*</span></label>
            <input value={form.name || ""} onChange={e => set("name", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
              placeholder="Toyota, Honda, BMW..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">ID hãng (không thay đổi sau khi tạo) <span className="text-red-500">*</span>
            </label>
            <input
              value={form.id || ""}
              onChange={e => set("id", e.target.value)}
              disabled={isEdit}
              className={`w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1a4b97] ${isEdit ? "bg-[#f4f4f4] text-[#8f9294] cursor-not-allowed" : ""}`}
              placeholder="toyota, honda, bmw..."
            />{isEdit && <p className="text-xs text-amber-600 mt-1">ID bị khóa để bảo vệ link tra cứu đã nhúng</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Khu vực</label>
            <select value={form.region || "japan"} onChange={e => set("region", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a4b97]">{Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Logo URL</label>
            <input value={form.logo || ""} onChange={e => set("logo", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
              placeholder="/vipo-assets/brand-logos/toyota.png" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Slug catalog</label>
            <input value={form.slug || ""} onChange={e => set("slug", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1a4b97]"
              placeholder="toyota" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">Hủy</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>{isEdit ? "Lưu thay đổi" : "Thêm hãng"}
          </button>
        </div>
      </div>
    </div>);
}

// ─── WMI Modal ────────────────────────────────────────────────
function WMIModal({ wmiKey, entry, onSave, onClose }: {
  wmiKey: string | null;
  entry: Partial<WMIEntry> | null;
  onSave: (key: string, val: WMIEntry) => void;
  onClose: () => void;
}) {
  const isEdit = !!wmiKey;
  const [key, setKey] = useState(wmiKey || "");
  const [form, setForm] = useState<Partial<WMIEntry>>(entry || { brand: "", brandId: "", country: "", type: "Passenger" });
  const set = (k: keyof WMIEntry, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!key.trim() || key.trim().length !== 3) return alert("Mã WMI phải đúng 3 ký tự");
    if (!form.brand?.trim() || !form.brandId?.trim()) return alert("Vui lòng nhập tên và ID hãng");
    onSave(key.trim().toUpperCase(), {
      brand: form.brand!, brandId: form.brandId!,
      country: form.country || "", type: form.type || "Passenger",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.65)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-[#44494d] text-xl font-bold">✕</button>
        <h2 className="text-lg font-bold text-[#44494d] mb-5">{isEdit ? "Sửa mã WMI" : "Thêm mã WMI mới"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Mã WMI (3 ký tự) <span className="text-red-500">*</span></label>
            <input value={key} onChange={e => setKey(e.target.value)} disabled={isEdit} maxLength={3}
              className={`w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm font-mono uppercase focus:outline-none focus:border-[#1a4b97] ${isEdit ? "bg-[#f4f4f4] text-[#8f9294] cursor-not-allowed" : ""}`}
              placeholder="JTD" />{isEdit && <p className="text-xs text-amber-600 mt-1">Mã WMI bị khóa để bảo vệ link tra cứu đã nhúng</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Tên hãng <span className="text-red-500">*</span></label>
            <input value={form.brand || ""} onChange={e => set("brand", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
              placeholder="Toyota" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Brand ID <span className="text-red-500">*</span></label>
            <input value={form.brandId || ""} onChange={e => set("brandId", e.target.value)}
              className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1a4b97]"
              placeholder="toyota" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Quốc gia sản xuất</label>
              <input value={form.country || ""} onChange={e => set("country", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="Nhật Bản" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Loại xe</label>
              <select value={form.type || "Passenger"} onChange={e => set("type", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a4b97]">{["Passenger","SUV","Truck","Pickup","Van","Commercial","Compact","Luxury","Sports","Electric","Minivan","Motorcycle","Performance","Ultra Luxury"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">Hủy</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>{isEdit ? "Lưu thay đổi" : "Thêm mã WMI"}
          </button>
        </div>
      </div>
    </div>);
}

// ─── VIN Modal ────────────────────────────────────────────────
function VINModal({ vin, onSave, onClose }: {
  vin: Partial<SampleVIN> | null;
  onSave: (v: SampleVIN) => void;
  onClose: () => void;
}) {
  const isEdit = !!vin?.vin;
  const [form, setForm] = useState<Partial<SampleVIN>>({ vin: "", brand: "", brandId: "", model: "", year: new Date().getFullYear().toString(), ...vin });
  const set = (k: keyof SampleVIN, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.vin?.trim() || form.vin.trim().length !== 17) return alert("Mã VIN phải đúng 17 ký tự");
    if (!form.brand?.trim() || !form.model?.trim()) return alert("Vui lòng điền đầy đủ thông tin");
    onSave({ vin: form.vin!.trim().toUpperCase(), brand: form.brand!, brandId: form.brandId || "", model: form.model!, year: form.year || "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.65)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-[#44494d] text-xl font-bold">✕</button>
        <h2 className="text-lg font-bold text-[#44494d] mb-5">{isEdit ? "Sửa mã VIN mẫu" : "Thêm mã VIN mẫu"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8f9294] mb-1">Mã VIN (17 ký tự) <span className="text-red-500">*</span></label>
            <input value={form.vin || ""} onChange={e => set("vin", e.target.value.toUpperCase())} maxLength={17} disabled={isEdit}
              className={`w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm font-mono uppercase focus:outline-none focus:border-[#1a4b97] ${isEdit ? "bg-[#f4f4f4] text-[#8f9294] cursor-not-allowed" : ""}`}
              placeholder="JTDKN3DU5A0456789" />
            <p className="text-xs text-[#8f9294] mt-1">{(form.vin || "").length}/17 ký tự</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Hãng xe <span className="text-red-500">*</span></label>
              <input value={form.brand || ""} onChange={e => set("brand", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="Toyota" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Brand ID</label>
              <input value={form.brandId || ""} onChange={e => set("brandId", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm font-mono focus:outline-none focus:border-[#1a4b97]"
                placeholder="toyota" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Dòng xe <span className="text-red-500">*</span></label>
              <input value={form.model || ""} onChange={e => set("model", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="Camry" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Năm sản xuất</label>
              <input value={form.year || ""} onChange={e => set("year", e.target.value)} type="number" min="1990" max="2030"
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="2024" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">Hủy</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>{isEdit ? "Lưu thay đổi" : "Thêm VIN"}
          </button>
        </div>
      </div>
    </div>);
}

// ─── Delete Confirm ───────────────────────────────────────────
function DeleteConfirm({ label, onConfirm, onClose }: { label: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.65)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-red-500">!</div>
        <h3 className="font-bold text-[#44494d] mb-2">Xác nhận xóa</h3>
        <p className="text-sm text-[#8f9294] mb-5">Bạn có chắc muốn xóa <strong>"{label}"</strong>? Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500">Xóa</button>
        </div>
      </div>
    </div>);
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function AdminVehiclesPage() {
  const { t, lang } = useLang();
  const [activeTab, setActiveTab] = useState<"brands" | "wmi" | "vin">("brands");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Brands state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [regions, setRegions] = useState<Record<string, string>>({});
  const [brandSearch, setBrandSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null | undefined>(undefined);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  // WMI state
  const [wmiCodes, setWmiCodes] = useState<Record<string, WMIEntry>>({});
  const [wmiSearch, setWmiSearch] = useState("");
  const [editingWMI, setEditingWMI] = useState<{ key: string; entry: WMIEntry } | null | undefined>(undefined);
  const [deletingWMI, setDeletingWMI] = useState<string | null>(null);

  // VIN state
  const [sampleVINs, setSampleVINs] = useState<SampleVIN[]>([]);
  const [vinSearch, setVinSearch] = useState("");
  const [editingVIN, setEditingVIN] = useState<Partial<SampleVIN> | null | undefined>(undefined);
  const [deletingVIN, setDeletingVIN] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Load data
  useEffect(() => {
    fetch("/api/brands").then(r => r.json()).then(d => {
      setBrands(Array.isArray(d.brands) ? d.brands : []);
      setRegions(d.regions || {});
    });
    fetch("/api/vin-database").then(r => r.json()).then(d => {
      setWmiCodes(d.wmiCodes || {});
      setSampleVINs(Array.isArray(d.sampleVINs) ? d.sampleVINs : []);
    });
  }, []);

  // Save brands
  const saveBrands = async (newBrands: Brand[]) => {
    setSaving(true);
    await fetch("/api/brands", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brands: newBrands, regions }),
    });
    setBrands(newBrands); setSaving(false);
    showToast(lang === "en" ? "Brand list saved!" : lang === "zh" ? "品牌列表已保存！" : "Đã lưu danh sách hãng xe thành công!");
  };

  // Save VIN data
  const saveVINData = async (newWmi: Record<string, WMIEntry>, newVINs: SampleVIN[]) => {
    setSaving(true);
    await fetch("/api/vin-database", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wmiCodes: newWmi, sampleVINs: newVINs }),
    });
    setWmiCodes(newWmi); setSampleVINs(newVINs); setSaving(false);
    showToast(lang === "en" ? "VIN database saved!" : lang === "zh" ? "VIN 数据库已保存！" : "Đã lưu cơ sở dữ liệu VIN thành công!");
  };

  // Brand handlers
  const handleSaveBrand = (b: Brand) => {
    const newBrands = brands.find(x => x.id === b.id)
      ? brands.map(x => x.id === b.id ? b : x)
      : [...brands, b];
    saveBrands(newBrands);
    setEditingBrand(undefined);
  };
  const handleDeleteBrand = () => {
    if (!deletingBrand) return;
    saveBrands(brands.filter(b => b.id !== deletingBrand.id));
    setDeletingBrand(null);
  };

  // WMI handlers
  const handleSaveWMI = (key: string, entry: WMIEntry) => {
    const newWmi = { ...wmiCodes, [key]: entry };
    saveVINData(newWmi, sampleVINs);
    setEditingWMI(undefined);
  };
  const handleDeleteWMI = () => {
    if (!deletingWMI) return;
    const newWmi = { ...wmiCodes };
    delete newWmi[deletingWMI];
    saveVINData(newWmi, sampleVINs);
    setDeletingWMI(null);
  };

  // VIN handlers
  const handleSaveVIN = (v: SampleVIN) => {
    const newVINs = sampleVINs.find(x => x.vin === v.vin)
      ? sampleVINs.map(x => x.vin === v.vin ? v : x)
      : [...sampleVINs, v];
    saveVINData(wmiCodes, newVINs);
    setEditingVIN(undefined);
  };
  const handleDeleteVIN = () => {
    if (!deletingVIN) return;
    saveVINData(wmiCodes, sampleVINs.filter(v => v.vin !== deletingVIN));
    setDeletingVIN(null);
  };

  // Filtered lists
  const filteredBrands = brands.filter(b =>(!regionFilter || b.region === regionFilter) &&
    (!brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()) || b.id.includes(brandSearch.toLowerCase()))
  );
  const wmiEntries = Object.entries(wmiCodes).filter(([k, v]) =>!wmiSearch || k.toLowerCase().includes(wmiSearch.toLowerCase()) || v.brand.toLowerCase().includes(wmiSearch.toLowerCase())
  );
  const filteredVINs = sampleVINs.filter(v =>!vinSearch || v.vin.includes(vinSearch.toUpperCase()) || v.brand.toLowerCase().includes(vinSearch.toLowerCase()) || v.model.toLowerCase().includes(vinSearch.toLowerCase())
  );

  return (
    <>
      <main className="flex-1 overflow-auto">{/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#44494d]">Quản lý Hãng xe & VIN</h1>{saving && <span className="text-xs text-[#8f9294] animate-pulse">Đang lưu...</span>}
            </div>
            <div>{activeTab === "brands" && (
                <button onClick={() => setEditingBrand(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>+ {lang === "en" ? "Add Brand" : lang === "zh" ? "添加品牌" : "Thêm hãng xe"}
                </button>)}
              {activeTab === "wmi" && (
                <button onClick={() => setEditingWMI(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>+ {lang === "en" ? "Add WMI" : lang === "zh" ? "添加WMI" : "Thêm mã WMI"}
                </button>)}
              {activeTab === "vin" && (
                <button onClick={() => setEditingVIN(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>+ {lang === "en" ? "Add Sample VIN" : lang === "zh" ? "添加VIN样本" : "Thêm VIN mẫu"}
                </button>)}
            </div>
          </div>{/* Tabs */}
          <div className="px-6 flex gap-0 border-t border-[#f0f0f0]">{[
              ["brands", `${lang === "en" ? "Brands" : lang === "zh" ? "品牌" : "Hãng xe"} (${brands.length})`],
              ["wmi", `${lang === "en" ? "WMI Codes" : lang === "zh" ? "WMI 代码" : "Mã WMI"} (${Object.keys(wmiCodes).length})`],
              ["vin", `${lang === "en" ? "Sample VINs" : lang === "zh" ? "VIN 样本" : "VIN mẫu"} (${sampleVINs.length})`],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key as "brands" | "wmi" | "vin")}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{label}
              </button>))}
          </div>
        </div>

        <div className="p-6">{/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
            <p className="text-sm text-blue-700">
              <strong>Lưu ý an toàn:</strong> ID hãng và mã WMI bị khóa sau khi tạo. Điều này bảo vệ các link tra cứu đã nhúng (QR code, liên kết Affiliate) không bị gãy khi cập nhật dữ liệu.
            </p>
          </div>{/* ── BRANDS TAB ── */}
          {activeTab === "brands" && (
            <div>
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                <input value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
                  placeholder="Tìm tên hãng hoặc ID..."
                  className="px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] w-48" />
                <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
                  className="px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white">
                  <option value="">Tất cả khu vực</option>{Object.entries(REGIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>{(brandSearch || regionFilter) && (
                  <button onClick={() => { setBrandSearch(""); setRegionFilter(""); }}
                    className="text-xs text-[#8f9294] hover:text-red-500 border border-[#e5e5e5] px-2 py-1.5 rounded-lg">✕ Xóa lọc</button>)}
                <span className="ml-auto text-sm text-[#8f9294]">{filteredBrands.length}/{brands.length} hãng</span>
              </div>
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
                <table className="w-full">
                  <thead style={{ background: "#f8f8fa" }}>
                    <tr className="text-xs text-[#8f9294] font-semibold">
                      <th className="text-left px-4 py-3">LOGO</th>
                      <th className="text-left px-4 py-3">TÊN HÃNG</th>
                      <th className="text-left px-4 py-3">ID (ĐÃ KH‌ÓA)</th>
                      <th className="text-left px-4 py-3">KHU VỰC</th>
                      <th className="text-left px-4 py-3">SLUG</th>
                      <th className="text-left px-4 py-3">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>{filteredBrands.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-[#8f9294] text-sm">Không tìm thấy hãng xe nào</td></tr>)}
                    {filteredBrands.map(b => (
                      <tr key={b.id} className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 rounded-lg bg-[#f4f4f4] flex items-center justify-center overflow-hidden border border-[#f0f0f0]">{b.logo ? <img src={b.logo} alt={b.name} className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <span className="text-xs font-bold text-[#8f9294]">{b.id.slice(0,2).toUpperCase()}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#44494d] text-sm">{b.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-[#f4f4f4] text-[#8f9294] px-2 py-1 rounded-md flex items-center gap-1 w-fit">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>{b.id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REGION_COLORS[b.region] || "bg-[#f4f4f4] text-[#8f9294]"}`}>{REGIONS[b.region] || b.region}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#8f9294]">{b.slug}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setEditingBrand(b)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-[#1a4b97]">Sửa</button>
                            <button onClick={() => setDeletingBrand(b)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-red-100 text-red-400 hover:bg-red-50">Xóa</button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>)}

          {/* ── WMI TAB ── */}
          {activeTab === "wmi" && (
            <div>
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                <input value={wmiSearch} onChange={e => setWmiSearch(e.target.value)}
                  placeholder="Tìm mã WMI hoặc tên hãng..."
                  className="px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] w-56" />{wmiSearch && <button onClick={() => setWmiSearch("")} className="text-xs text-[#8f9294] hover:text-red-500 border border-[#e5e5e5] px-2 py-1.5 rounded-lg">✕ Xóa</button>}
                <span className="ml-auto text-sm text-[#8f9294]">{wmiEntries.length}/{Object.keys(wmiCodes).length} mã WMI</span>
              </div>
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
                <table className="w-full">
                  <thead style={{ background: "#f8f8fa" }}>
                    <tr className="text-xs text-[#8f9294] font-semibold">
                      <th className="text-left px-4 py-3">MÃ WMI</th>
                      <th className="text-left px-4 py-3">HÃNG XE</th>
                      <th className="text-left px-4 py-3">BRAND ID</th>
                      <th className="text-left px-4 py-3">QUỐC GIA SX</th>
                      <th className="text-left px-4 py-3">LOẠI XE</th>
                      <th className="text-left px-4 py-3">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>{wmiEntries.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-[#8f9294] text-sm">Không tìm thấy mã WMI</td></tr>)}
                    {wmiEntries.map(([k, v]) => (
                      <tr key={k} className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-[#1a4b97] bg-blue-50 px-2 py-1 rounded-md text-sm">{k}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#44494d] text-sm">{v.brand}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#8f9294]">{v.brandId}</td>
                        <td className="px-4 py-3 text-sm text-[#8f9294]">{v.country}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f4f4f4] text-[#44494d] font-medium">{v.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setEditingWMI({ key: k, entry: v })}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-[#1a4b97]">Sửa</button>
                            <button onClick={() => setDeletingWMI(k)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-red-100 text-red-400 hover:bg-red-50">Xóa</button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>)}

          {/* ── VIN TAB ── */}
          {activeTab === "vin" && (
            <div>
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                <input value={vinSearch} onChange={e => setVinSearch(e.target.value)}
                  placeholder="Tìm mã VIN, hãng, dòng xe..."
                  className="px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] w-64" />{vinSearch && <button onClick={() => setVinSearch("")} className="text-xs text-[#8f9294] hover:text-red-500 border border-[#e5e5e5] px-2 py-1.5 rounded-lg">✕ Xóa</button>}
                <span className="ml-auto text-sm text-[#8f9294]">{filteredVINs.length}/{sampleVINs.length} VIN mẫu</span>
              </div>
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
                <table className="w-full">
                  <thead style={{ background: "#f8f8fa" }}>
                    <tr className="text-xs text-[#8f9294] font-semibold">
                      <th className="text-left px-4 py-3">MÃ VIN (17 KÝ TỰ)</th>
                      <th className="text-left px-4 py-3">HÃNG XE</th>
                      <th className="text-left px-4 py-3">DÒNG XE</th>
                      <th className="text-left px-4 py-3">NĂM SX</th>
                      <th className="text-left px-4 py-3">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>{filteredVINs.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-[#8f9294] text-sm">Không tìm thấy VIN mẫu</td></tr>)}
                    {filteredVINs.map(v => (
                      <tr key={v.vin} className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs tracking-widest text-[#44494d] bg-[#f4f4f4] px-2 py-1.5 rounded-md">{v.vin}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#44494d] text-sm">{v.brand}</td>
                        <td className="px-4 py-3 text-sm text-[#44494d]">{v.model}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">{v.year}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setEditingVIN(v)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-orange-50 hover:border-orange-300 hover:text-[#1a4b97]">Sửa</button>
                            <button onClick={() => setDeletingVIN(v.vin)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold border border-red-100 text-red-400 hover:bg-red-50">Xóa</button>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>)}
        </div>
      </main>{/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>{toast}
        </div>)}

      {/* Modals */}
      {editingBrand !== undefined && (
        <BrandModal
          brand={editingBrand}
          brands={brands}
          onSave={handleSaveBrand}
          onClose={() => setEditingBrand(undefined)}
        />)}
      {editingWMI !== undefined && (
        <WMIModal
          wmiKey={editingWMI?.key || null}
          entry={editingWMI?.entry || null}
          onSave={handleSaveWMI}
          onClose={() => setEditingWMI(undefined)}
        />)}
      {editingVIN !== undefined && (
        <VINModal
          vin={editingVIN}
          onSave={handleSaveVIN}
          onClose={() => setEditingVIN(undefined)}
        />)}
      {deletingBrand && (
        <DeleteConfirm label={deletingBrand.name} onConfirm={handleDeleteBrand} onClose={() => setDeletingBrand(null)} />)}
      {deletingWMI && (
        <DeleteConfirm label={`WMI: ${deletingWMI}`} onConfirm={handleDeleteWMI} onClose={() => setDeletingWMI(null)} />)}
      {deletingVIN && (
        <DeleteConfirm label={`VIN: ${deletingVIN}`} onConfirm={handleDeleteVIN} onClose={() => setDeletingVIN(null)} />)}
    </>);
}

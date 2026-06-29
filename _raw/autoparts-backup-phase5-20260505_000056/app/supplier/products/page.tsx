"use client";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import SidebarControls from "@/components/SidebarControls";
import SupplierSidebar from "@/components/SupplierSidebar";

// ─── Searchable Select (Autocomplete Combobox) ─────────────────────────
interface SSOption { value: string; label: string; icon?: string }
function SearchableSelect({ label, value, onChange, options, placeholder = "Tìm kiếm...", disabled = false }: {
  label: string; value: string; onChange: (v: string) => void;
  options: SSOption[]; placeholder?: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);
  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setHighlight(0); }, [query]);

  const pick = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && filtered[highlight]) { e.preventDefault(); pick(filtered[highlight].value); }
    else if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-semibold text-slate-500 mb-1 block">{label}</label>
      <div
        onClick={() => { if (!disabled) { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); } }}
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-white flex items-center gap-2 cursor-pointer transition-colors ${
          open ? "border-[#1a4b97] ring-2 ring-[#1a4b97]/10" : "border-[#e5e5e5] hover:border-[#c5cdd8]"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
      >
        {selected?.icon && <img src={selected.icon} alt="" className="w-5 h-5 object-contain shrink-0" />}
        <span className={selected ? "text-[#44494d]" : "text-[#8f9294]"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className="w-3.5 h-3.5 ml-auto text-[#8f9294] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-xl max-h-56 overflow-hidden" style={{ minWidth: "100%" }}>
          {/* Search input */}
          <div className="p-2 border-b border-[#f0f0f0] sticky top-0 bg-white">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#f8f8fa] rounded-lg">
              <svg className="w-3.5 h-3.5 text-[#8f9294] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder={placeholder}
                className="w-full bg-transparent text-sm outline-none text-[#44494d] placeholder:text-[#8f9294]"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[#8f9294] hover:text-[#44494d] text-xs">✕</button>
              )}
            </div>
          </div>
          {/* Options list */}
          <div className="overflow-auto max-h-44">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#8f9294] text-center">Không tìm thấy kết quả</div>
            ) : (
              filtered.map((opt, i) => (
                <div
                  key={opt.value + i}
                  onClick={() => pick(opt.value)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition-colors ${
                    i === highlight ? "bg-[#f0f4ff] text-[#1a4b97]" :
                    opt.value === value ? "bg-[#fafbfc] text-[#1a4b97] font-semibold" : "text-[#44494d] hover:bg-[#f8f8fa]"
                  }`}
                >
                  {opt.icon && <img src={opt.icon} alt="" className="w-5 h-5 object-contain shrink-0 rounded" />}
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && (
                    <svg className="w-4 h-4 ml-auto text-[#1a4b97] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  )}
                </div>
              ))
            )}
          </div>
          {/* Clear button */}
          {value && (
            <div className="border-t border-[#f0f0f0] p-1.5">
              <button
                onClick={() => pick("")}
                className="w-full text-xs text-[#8f9294] hover:text-red-500 py-1 rounded hover:bg-red-50 transition-colors"
              >✕ Bỏ chọn</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const typeColors: Record<string, string> = {
  OEM: "bg-green-100 text-green-700",
  OES: "bg-blue-100 text-blue-700",
  Generic: "bg-yellow-100 text-yellow-700",
};

const swatchMapBase: Record<string, { bg: string; color: string }> = {
  "brake-pad":      { bg: "#FEE2E2", color: "#DC2626" },
  "brake-disc":     { bg: "#FEE2E2", color: "#DC2626" },
  "oil-filter":     { bg: "#FEF9C3", color: "#92400E" },
  "cabin-filter":   { bg: "#F0FDF4", color: "#166534" },
  "spark-plug":     { bg: "#EDE9FE", color: "#6D28D9" },
  "battery":        { bg: "#DBEAFE", color: "#1D4ED8" },
  "engine-oil":     { bg: "#44494d", color: "#8f9294" },
  "headlight":      { bg: "#FEF3C7", color: "#D97706" },
  "shock-absorber": { bg: "#D1FAE5", color: "#065F46" },
  "timing-belt":    { bg: "#F3F4F6", color: "#374151" },
  "radiator":       { bg: "#E0F2FE", color: "#0369A1" },
  "o2-sensor":      { bg: "#FDF4FF", color: "#7E22CE" },
};

function getSwatch(img: string) {
  return swatchMapBase[img] ?? { bg: "var(--ap-page-bg)", color: "#475569" };
}

// ─── Country Flag Emoji Map ──────────────────────────────────────────
const countryFlags: Record<string, string> = {
  "Nhật Bản": "🇯🇵", "Japan": "🇯🇵",
  "Hàn Quốc": "🇰🇷", "Korea": "🇰🇷",
  "Đức": "🇩🇪", "Germany": "🇩🇪",
  "Mỹ": "🇺🇸", "USA": "🇺🇸",
  "Trung Quốc": "🇨🇳", "China": "🇨🇳",
  "Thái Lan": "🇹🇭", "Thailand": "🇹🇭",
  "Việt Nam": "🇻🇳", "Vietnam": "🇻🇳",
  "Ý": "🇮🇹", "Italy": "🇮🇹",
  "Anh": "🇬🇧", "UK": "🇬🇧",
  "Pháp": "🇫🇷", "France": "🇫🇷",
  "Indonesia": "🇮🇩",
  "Đài Loan": "🇹🇼", "Taiwan": "🇹🇼",
  "Canada": "🇨🇦",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "Ấn Độ": "🇮🇳", "India": "🇮🇳",
  "Thụy Điển": "🇸🇪", "Sweden": "🇸🇪",
  "Séc": "🇨🇿", "Czech": "🇨🇿",
  "Hungary": "🇭🇺",
  "Đức/Anh": "🇩🇪",
  "USA/Canada": "🇺🇸",
};
function getFlag(country: string) { return countryFlags[country] || "🌍"; }

// ─── VIN types (data loaded from /api/vin-database) ──────────────────
type WMIEntry = { brand: string; brandId: string; country: string; type?: string };
type VINSample = { vin: string; brand: string; brandId: string; model: string; year: string };
let _wmiCache: Record<string, WMIEntry> = {};
let _vinCache: VINSample[] = [];
let _vinLoaded = false;
async function loadVinDB() {
  if (_vinLoaded) return;
  try {
    const res = await fetch("/api/vin-database");
    const data = await res.json();
    if (data.wmiCodes) _wmiCache = data.wmiCodes;
    if (data.sampleVINs) _vinCache = data.sampleVINs;
    _vinLoaded = true;
  } catch {}
}
function decodeVIN(vin: string) {
  if (vin.length < 3) return null;
  const wmi = vin.substring(0, 3).toUpperCase();
  return _wmiCache[wmi] || null;
}

function VinInput({ value, onChange, brands, selectedBrand }: {
  value: string;
  onChange: (vin: string, detectedBrand?: string) => void;
  brands: { id: string; name: string; logo: string }[];
  selectedBrand?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const vin = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  const decoded = decodeVIN(vin);
  const isValid = vin.length === 17;
  const isPartial = vin.length > 0 && vin.length < 17;
  const brandLogo = decoded ? brands.find(b => b.id === decoded.brandId)?.logo : undefined;

  useEffect(() => { loadVinDB(); }, []);

  // Filter suggestions by selected brand first, then by VIN code only
  const brandFiltered = selectedBrand
    ? _vinCache.filter(s => s.brandId === selectedBrand)
    : _vinCache;
  const suggestions = vin.length > 0
    ? brandFiltered.filter(s => s.vin.includes(vin))
    : brandFiltered.slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-semibold text-slate-500 mb-1 block">Số VIN</label>
      <div className={`relative w-full border rounded-lg transition-colors ${
        focused ? "border-[#1a4b97] ring-2 ring-[#1a4b97]/10" :
        isValid ? "border-green-400" : isPartial ? "border-amber-300" : "border-[#e5e5e5]"
      }`}>
        <input
          value={vin}
          onChange={e => {
            const v = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
            const d = decodeVIN(v);
            onChange(v, d?.brandId);
            setShowSuggestions(true);
          }}
          onFocus={() => { setFocused(true); setShowSuggestions(true); }}
          onBlur={() => setFocused(false)}
          placeholder="Gõ VIN hoặc tên hãng/model..."
          className="w-full px-3 py-2 bg-transparent text-sm focus:outline-none font-mono uppercase tracking-wider"
          maxLength={17}
        />
        {vin.length > 0 && (
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
            isValid ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-600"
          }`}>
            {vin.length}/17
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && !isValid && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-xl max-h-52 overflow-hidden">
          <div className="px-3 py-1.5 bg-[#f8f8fa] border-b border-[#f0f0f0]">
            <span className="text-[10px] font-semibold text-[#8f9294] uppercase">Đề xuất mã VIN</span>
          </div>
          <div className="overflow-auto max-h-44">
            {suggestions.slice(0, 10).map((s, i) => {
              const logo = brands.find(b => b.id === s.brandId)?.logo;
              return (
                <div
                  key={s.vin}
                  onMouseDown={() => {
                    onChange(s.vin, s.brandId);
                    setShowSuggestions(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm hover:bg-[#f0f4ff] transition-colors border-b border-[#f8f8fa] last:border-0"
                >
                  {logo && <img src={logo} alt="" className="w-5 h-5 object-contain shrink-0 rounded" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-[#44494d] tracking-wider truncate">{s.vin}</p>
                    <p className="text-[10px] text-[#8f9294]">{s.brand} {s.model} • {s.year}</p>
                  </div>
                  <span className="text-[10px] bg-[#f0f4ff] text-[#1a4b97] px-1.5 py-0.5 rounded font-semibold shrink-0">{s.year}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decoded info */}
      {decoded && vin.length >= 3 && (
        <div className="mt-1.5 flex items-center gap-2 px-2.5 py-1.5 bg-[#f0f9f0] border border-green-200 rounded-lg">
          {brandLogo && <img src={brandLogo} alt="" className="w-5 h-5 object-contain" />}
          <span className="text-xs font-semibold text-green-800">{decoded.brand}</span>
          <span className="text-[10px] text-green-600">{getFlag(decoded.country)} {decoded.country}</span>
          {isValid && <span className="text-[10px] text-green-500 ml-auto">✓ VIN hợp lệ</span>}
        </div>
      )}
      {vin.length >= 3 && !decoded && (
        <p className="mt-1 text-[10px] text-amber-500">⚠ Không nhận dạng được hãng từ mã VIN</p>
      )}
    </div>
  );
}

// ─── Image Upload ────────────────────────────────────────────────────
function ImageUpload({ preview, onFile }: { preview: string | null; onFile: (url: string) => void }) {
  const { t } = useLang();
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  function handle(file: File) {
    const rd = new FileReader();
    rd.onload = e => onFile(e.target?.result as string);
    rd.readAsDataURL(file);
  }
  return (
    <div>
      <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('productImage')}</label>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handle(f); }}
        onClick={() => ref.current?.click()}
        className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
        style={{ borderColor: drag ? "var(--ap-primary)" : "#CBD5E1", background: drag ? "#FFF7ED" : "#f8f8fa", minHeight: "150px" }}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-40 object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#FFF7ED" }}>
              <span className="text-[#1a4b97] font-bold text-xl">+</span>
            </div>
            <p className="text-sm font-semibold text-slate-600">{t('dragDropImage')}</p>
            <p className="text-xs text-[#8f9294]">{t('imageFormat')}</p>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      </div>
      {preview && (
        <button onClick={() => onFile("")} className="mt-1 text-xs text-red-400 hover:text-red-600">✕ {t('removeImage')}</button>
      )}
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────
interface ProdForm {
  id?: string;
  name: string;
  oemCode: string;
  price: number | string;
  stock: number | string;
  categoryId: string;
  description: string;
  image: string;
  supplierId: string;
  origin?: string;
  originClass?: string;
  brand?: string;
  carModel?: string;
  vinCode?: string;
  yearFrom?: string;
  yearTo?: string;
  countryOfOrigin?: string;
  isTrending: boolean;
  isHot: boolean;
}

function ProductFormModal({
  initial,
  categories,
  brands,
  onSave,
  onClose,
}: {
  initial: Partial<ProdForm> | null;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string; logo: string; region: string }[];
  onSave: (p: ProdForm) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useLang();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<ProdForm>({
    name: "",
    oemCode: "",
    price: "",
    stock: "",
    categoryId: categories[0]?.id || "",
    categoryName: categories[0]?.name || "",
    description: "",
    image: "",
    supplierId: "s001",
    originClass: "domestic",
    brand: "",
    carModel: "",
    vinCode: "",
    yearFrom: "",
    yearTo: "",
    countryOfOrigin: "Nhật Bản",
    isTrending: false,
    isHot: false,
    ...initial,
  });
  const [imgPreview, setImgPreview] = useState<string | null>(initial?.image?.startsWith("data:") ? initial.image : null);
  const [saving, setSaving] = useState(false);
  const [carModels, setCarModels] = useState<string[]>([]);

  const set = (k: keyof ProdForm, v: string | number) => {
    if (k === "categoryId") {
      const cat = categories.find(c => c.id === v as string);
      setForm(f => ({ ...f, categoryId: v as string, categoryName: cat?.name || "" }));
    } else if (k === "brand") {
      setForm(f => ({ ...f, brand: v as string, carModel: "" }));
      // Load models for selected brand
      if (v) {
        fetch(`/api/catalog/${v}`).then(r => r.json()).then(d => {
          setCarModels((d.models || []).filter((m: any) => m.type === "model").map((m: any) => m.name));
        }).catch(() => setCarModels([]));
      } else {
        setCarModels([]);
      }
    } else {
      setForm(f => ({ ...f, [k]: v }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert(t('productNameLabel'));
    if (!form.price || Number(form.price) <= 0) return alert(t('priceLabel'));
    setSaving(true);
    await onSave({ ...form, image: imgPreview || form.image || "" });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0] sticky top-0 bg-white z-10">
          <h3 className="font-bold text-[#44494d] text-lg">{isEdit ? t('edit') + ' ' + t('product') : t('addNewProduct')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f4f4f4] text-[#8f9294] font-bold text-lg">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <ImageUpload preview={imgPreview} onFile={url => setImgPreview(url || null)} />

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('productNameLabel')} <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              placeholder="VD: Má phanh trước Toyota Vios 2018–2022"
              className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('oemCode')}</label>
              <input
                value={form.oemCode}
                onChange={e => set("oemCode", e.target.value)}
                placeholder="VD: 04465-0D156"
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('priceLabel')} <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="VD: 1250000"
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('stockLabel')} <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={form.stock}
                onChange={e => set("stock", e.target.value)}
                placeholder="VD: 100"
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('typeLabel')}</label>
              <select
                value={form.type}
                onChange={e => set("type", e.target.value)}
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm bg-white focus:outline-none focus:border-[#1a4b97]"
              >
                <option value="OEM">OEM – Chính hãng</option>
                <option value="OES">OES – Aftermarket</option>
                <option value="Generic">Generic – Phổ thông</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('origin') || "Phân loại nguồn gốc"}</label>
              <select
                value={(form as any).originClass || "domestic"}
                onChange={e => set("originClass", e.target.value)}
                className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] bg-white"
              >
                <option value="imported">Nhập khẩu chính hãng</option>
                <option value="domestic">Sản xuất trong nước</option>
                <option value="other">Loại khác</option>
              </select>
            </div>
          </div>

          {/* ── Thông tin xe tương thích ── */}
          <div className="border border-[#e0e7f1] rounded-xl p-3 bg-[#f8faff]">
            <label className="text-sm font-semibold text-[#1a4b97] mb-2 block">Thông tin xe tương thích</label>
            <div className="grid grid-cols-2 gap-3">
              <SearchableSelect
                label="Thương hiệu xe"
                value={(form as any).brand || ""}
                onChange={v => set("brand" as any, v)}
                options={brands.map(b => ({ value: b.id, label: b.name, icon: b.logo }))}
                placeholder="Gõ để tìm thương hiệu..."
              />
              <SearchableSelect
                label="Dòng xe / Model"
                value={(form as any).carModel || ""}
                onChange={v => set("carModel" as any, v)}
                options={carModels.map(m => ({ value: m, label: m }))}
                placeholder={form.brand ? "Gõ để tìm dòng xe..." : "Chọn thương hiệu trước"}
                disabled={!form.brand}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <VinInput
                value={(form as any).vinCode || ""}
                onChange={(vin, detectedBrand) => {
                  set("vinCode" as any, vin);
                  if (detectedBrand && !form.brand) set("brand" as any, detectedBrand);
                }}
                brands={brands}
                selectedBrand={(form as any).brand || ""}
              />
              <SearchableSelect
                label="Xuất xứ sản phẩm"
                value={(form as any).countryOfOrigin || ""}
                onChange={v => set("countryOfOrigin" as any, v)}
                options={[
                  { value: "Nhật Bản", label: "Nhật Bản" },
                  { value: "Hàn Quốc", label: "Hàn Quốc" },
                  { value: "Đức", label: "Đức" },
                  { value: "Mỹ", label: "Mỹ" },
                  { value: "Trung Quốc", label: "Trung Quốc" },
                  { value: "Thái Lan", label: "Thái Lan" },
                  { value: "Việt Nam", label: "Việt Nam" },
                  { value: "Ý", label: "Ý" },
                  { value: "Anh", label: "Anh" },
                  { value: "Pháp", label: "Pháp" },
                  { value: "Indonesia", label: "Indonesia" },
                  { value: "Đài Loan", label: "Đài Loan" },
                  { value: "Canada", label: "Canada" },
                  { value: "Mexico", label: "Mexico" },
                  { value: "Ấn Độ", label: "Ấn Độ" },
                  { value: "Thụy Điển", label: "Thụy Điển" },
                  { value: "Brazil", label: "Brazil" },
                  { value: "Séc", label: "Séc" },
                  { value: "Hungary", label: "Hungary" },
                  { value: "Khác", label: "Khác" },
                ]}
                placeholder="Gõ để tìm xuất xứ..."
              />
            </div>

            {/* Year range */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Phù hợp từ năm</label>
                <select
                  value={(form as any).yearFrom || ""}
                  onChange={e => set("yearFrom" as any, e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a4b97]"
                >
                  <option value="">-- Từ năm --</option>
                  {Array.from({ length: 36 }, (_, i) => 2025 - i).map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Phù hợp đến năm</label>
                <select
                  value={(form as any).yearTo || ""}
                  onChange={e => set("yearTo" as any, e.target.value)}
                  className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1a4b97]"
                >
                  <option value="">-- Đến năm --</option>
                  {Array.from({ length: 36 }, (_, i) => 2025 - i).map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            {(form as any).yearFrom && (form as any).yearTo && (
              <p className="text-xs text-[#1a4b97] mt-1.5 font-medium">
                Tương thích xe đời {(form as any).yearFrom} – {(form as any).yearTo}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('categoryLabel')}</label>
            <select
              value={form.categoryId}
              onChange={e => set("categoryId", e.target.value)}
              className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm bg-white focus:outline-none focus:border-[#1a4b97]"
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-1 block">{t('description')}</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Mô tả ngắn về sản phẩm..."
              className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm resize-none focus:outline-none focus:border-[#1a4b97]"
            />
          </div>

          {/* ── Cài đặt hiển thị trang chủ ── */}
          <div className="border border-[#f0f0f0] rounded-xl p-3 bg-[#fafafa]">
            <label className="text-sm font-semibold text-[#44494d] mb-2 block">Hiển thị trên Trang chủ</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isTrending}
                  onChange={e => setForm(f => ({ ...f, isTrending: e.target.checked }))}
                  className="accent-orange-500 w-4 h-4" />
                <span className="text-sm text-[#44494d]">Sản phẩm Trending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isHot}
                  onChange={e => setForm(f => ({ ...f, isHot: e.target.checked }))}
                  className="accent-orange-500 w-4 h-4" />
                <span className="text-sm text-[#44494d]">Phụ tùng hot bán chạy</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-[#f0f0f0] sticky bottom-0 bg-white">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600 hover:bg-[#f8f8fa] text-sm">
            {t("cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60"
            style={{ background: "var(--ap-primary)" }}
          >
            {saving ? t('saving') : isEdit ? t('update') : t('addNewProduct')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ──────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.6)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-xl font-bold text-red-500">⚠</div>
        <h3 className="font-bold text-[#44494d] mb-2">Xác nhận xóa</h3>
        <p className="text-sm text-[#8f9294] mb-5">Bạn có chắc muốn xóa <strong>"{name}"</strong>? Hành động này không thể hoàn tác.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1a4b97] hover:bg-[#0d2d5e]">Xóa</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────
export default function SupplierProductsPage() {
  const { t, fp, lang } = useLang();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<{id:string;name:string;logo:string;region:string}[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then(r => r.json()).catch(() => []),
      fetch("/api/categories").then(r => r.json()).catch(() => []),
    ]).then(([prods, cats]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    }).catch(() => {}).finally(() => setLoading(false));
    // Load brands separately
    fetch("/api/brands").then(r => r.json()).then(d => {
      if (d?.brands) setBrands(d.brands);
    }).catch(() => {});
  }, []);

  const myProducts = products.filter(p => !p.supplierId || p.supplierId === "s001");

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("table");
  const [showModal, setShowModal] = useState(false);
  const [editingProd, setEditingProd] = useState<any | null>(null);
  const [deletingProd, setDeletingProd] = useState<any | null>(null);

  const filtered = myProducts.filter(p =>
    search === "" ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.oemCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats from real data
  const stats = [
    { label: t('totalProducts'), value: myProducts.length, color: "var(--ap-primary)" },
    { label: t('onSale'), value: myProducts.filter(p => p.active !== false).length, color: "#22C55E" },
    { label: t('outOfStock'), value: myProducts.filter(p => p.stock === 0).length, color: "#EF4444" },
    { label: t('inStock'), value: myProducts.filter(p => (p.stock ?? 0) > 0).length, color: "var(--ap-primary)" },
  ];

  // ── Handlers ──
  const handleSave = async (p: any) => {
    if (p.id && myProducts.find((x: any) => x.id === p.id)) {
      // Edit
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, price: Number(p.price), stock: Number(p.stock) }),
      }).catch(() => null);
      if (res?.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(x => x.id === updated.id ? updated : x));
      }
    } else {
      // Create
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, price: Number(p.price), stock: Number(p.stock), supplierId: "s001" }),
      }).catch(() => null);
      if (res?.ok) {
        const created = await res.json();
        setProducts(prev => [...prev, created]);
      }
    }
    setShowModal(false);
    setEditingProd(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" }).catch(() => {});
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeletingProd(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
      <SupplierSidebar active="/supplier/products" />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{t("manageProducts")}</h1>
            <button
              onClick={() => { setEditingProd(null); setShowModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "var(--ap-primary)" }}
            >
              + {t('addNewProduct')}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-[#f0f0f0] p-4">
                <p className="text-[#8f9294] text-xs mb-1">{label}</p>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-4 mb-4 flex items-center gap-3 flex-wrap">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === "zh" ? "搜索名称、OEM编码..." : "Tìm tên, mã OEM..."}
              className="pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] w-64"
            />
            <span className="ml-auto text-sm text-[#8f9294]">{filtered.length} {t('product')}</span>
            <div className="flex items-center gap-1 rounded-lg border border-[#e5e5e5] overflow-hidden">
              <button onClick={() => setView("table")} className={`p-2 transition-colors ${view === "table" ? "bg-orange-50" : "hover:bg-[#f8f8fa]"}`}>☰</button>
              <button onClick={() => setView("grid")} className={`p-2 transition-colors ${view === "grid" ? "bg-orange-50" : "hover:bg-[#f8f8fa]"}`}>⊞</button>
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden">
            {loading ? (
              <div className="text-center py-16 text-[#8f9294]">{t('loading')}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-[#8f9294]">
                <p className="text-3xl mb-2">📦</p>
                <p className="font-semibold">{t('noData')}</p>
                <p className="text-sm">{lang === 'zh' ? '点击"+ 添加产品"开始' : 'Nhấn "+ Thêm sản phẩm" để bắt đầu'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead style={{ background: "#f8f8fa" }}>
                  <tr className="text-xs text-[#8f9294] font-semibold">
                    <th className="text-left px-4 py-3">{t('product').toUpperCase()}</th>
                    <th className="text-left px-4 py-3">{t('oemCode')}</th>
                    <th className="text-left px-4 py-3">{t('productType').toUpperCase()}</th>
                    <th className="text-left px-4 py-3">{t('price').toUpperCase()}</th>
                    <th className="text-left px-4 py-3">{t('stock').toUpperCase()}</th>
                    <th className="text-left px-4 py-3">{t('sold').toUpperCase()}</th>
                    <th className="text-left px-4 py-3">{t('action').toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((prod) => (
                    <tr key={prod.id} className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                            style={{ background: getSwatch(prod.image).bg }}>
                            {prod.image?.startsWith("data:")
                              ? <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                              : <span style={{ color: getSwatch(prod.image).color, fontSize: "10px", fontWeight: "bold" }}>
                                  {prod.categoryName?.slice(0, 3) || "PT"}
                                </span>
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-[#44494d] text-sm line-clamp-1 max-w-[180px]">{lang === "zh" ? ((prod as any).nameZh || prod.name) : prod.name}</p>
                            <p className="text-xs text-[#8f9294]">{lang === "zh" ? ((prod as any).categoryNameZh || prod.categoryName) : prod.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#8f9294] text-xs">{prod.oemCode}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${typeColors[prod.type] || "bg-[#f4f4f4] text-slate-600"}`}>{prod.type}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-[#44494d] text-sm">{fp(prod.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${
                          (prod.stock ?? 0) === 0 ? "text-red-500" :
                          (prod.stock ?? 0) < 10 ? "text-yellow-500" : "text-green-600"
                        }`}>
                          {prod.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{prod.sold ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingProd(prod); setShowModal(true); }}
                            className="p-1.5 rounded-lg hover:bg-orange-50 text-[#1a4b97] text-xs font-bold border border-orange-100"
                            title="Sửa"
                          >✎</button>
                          <button
                            onClick={() => setDeletingProd(prod)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 text-xs font-bold border border-red-100"
                            title="Xóa"
                          >✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filtered.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0] text-sm text-[#8f9294]">
                <span>{t('showing')} {filtered.length} / {myProducts.length} {t('product')}</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <ProductFormModal
          initial={editingProd}
          categories={categories}
          brands={brands}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProd(null); }}
        />
      )}

      {deletingProd && (
        <DeleteConfirm
          name={deletingProd.name}
          onConfirm={() => handleDelete(deletingProd.id)}
          onClose={() => setDeletingProd(null)}
        />
      )}
    </div>
  );
}

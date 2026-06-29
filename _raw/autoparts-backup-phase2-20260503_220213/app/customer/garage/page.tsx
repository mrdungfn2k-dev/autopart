"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import SidebarControls from "@/components/SidebarControls";
import CustomerSidebar from "@/components/CustomerSidebar";

interface Vehicle {
  id: string;
  userId?: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color: string;
  nextService: string;
  lastOilChange: string;
  mileage: number;
  fuelType: string;
  transmission: string;
}

const brandOptions = ["Toyota", "Honda", "Ford", "Kia", "Mazda", "Mitsubishi", "Mercedes-Benz", "BMW", "Audi", "Hyundai", "Nissan", "Suzuki", "Volkswagen"];

export default function CustomerGaragePage() {
  const { t, lang } = useLang();
  const [garage, setGarage] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { brand: "", model: "", year: "2024", licensePlate: "", color: "", nickname: "", fuelType: "Xăng", transmission: "Số tự động" };
  const [form, setForm] = useState(emptyForm);

  // --- Fetch from API ---
  useEffect(() => {
    fetch("/api/garage")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setGarage(data as Vehicle[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addVehicle = async () => {
    if (!form.brand || !form.model) return;
    setSaving(true);
    try {
      const res = await fetch("/api/garage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const v = await res.json() as Vehicle;
        setGarage((prev) => [...prev, v]);
        setShowAddModal(false);
        setForm(emptyForm);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editingVehicle) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/garage/${editingVehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVehicle),
      });
      if (res.ok) {
        const updated = await res.json() as Vehicle;
        setGarage((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        setEditingVehicle(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    const res = await fetch(`/api/garage/${id}`, { method: "DELETE" });
    if (res.ok) setGarage((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <CustomerSidebar active="/customer/garage" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">
              {lang === "zh" ? "我的车库" : "Gara của tôi"} ({garage.length} {lang === "zh" ? "辆" : "xe"})
            </h1>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
              + {lang === "zh" ? "添加车辆" : "Thêm xe"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-[#8f9294]">
              {lang === "zh" ? "加载中..." : "Đang tải..."}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                {garage.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden hover:shadow-lg transition-all">
                    {/* Vehicle header */}
                    <div className="p-5 pb-4" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--ap-primary)" }}>{vehicle.brand.slice(0, 1)}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{vehicle.nickname}</h3>
                            <p className="text-slate-300 text-sm">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingVehicle(vehicle)} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-semibold">
                            {lang === "zh" ? "编辑" : "Sửa"}
                          </button>
                          <button onClick={() => deleteVehicle(vehicle.id)} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-[#1a4b97]/30 transition-colors text-red-300 text-xs font-semibold">
                            {lang === "zh" ? "删除" : "Xóa"}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-mono font-bold">{vehicle.licensePlate}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-xs">{vehicle.color}</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 text-xs">{vehicle.fuelType}</span>
                      </div>
                    </div>

                    {/* Vehicle stats */}
                    <div className="p-5 pt-4">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: lang === "zh" ? "里程" : "Số km", value: vehicle.mileage.toLocaleString(), unit: "km" },
                          { label: lang === "zh" ? "上次换油" : "Thay dầu cuối", value: vehicle.lastOilChange },
                          { label: lang === "zh" ? "下次保养" : "Bảo dưỡng tiếp", value: vehicle.nextService },
                        ].map((s) => (
                          <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: "#f8f8fa" }}>
                            <p className="text-xs text-[#8f9294] mb-0.5">{s.label}</p>
                            <p className="font-bold text-[#44494d] text-sm">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/products?q=${vehicle.brand}+${vehicle.model}+${vehicle.year}`}
                          className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: "var(--ap-primary)" }}>
                          {lang === "zh" ? "适配配件" : "Phụ tùng phù hợp"}
                        </Link>
                        <button className="px-4 py-2.5 rounded-xl border border-[#e5e5e5] text-slate-600 text-sm hover:bg-[#f8f8fa]">
                          {lang === "zh" ? "历史" : "Lịch sử"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add new car card */}
                <button onClick={() => setShowAddModal(true)}
                  className="border-2 border-dashed border-[#e5e5e5] rounded-2xl flex flex-col items-center justify-center p-10 text-[#8f9294] hover:border-orange-300 hover:text-[#1a4b97] transition-colors min-h-[250px]">
                  <span className="text-4xl mb-3 font-light">+</span>
                  <p className="font-semibold">{lang === "zh" ? "添加新车辆" : "Thêm xe mới vào gara"}</p>
                  <p className="text-xs mt-1">{lang === "zh" ? "在一个账户中管理多辆车" : "Quản lý nhiều xe trong một tài khoản"}</p>
                </button>
              </div>

              {/* Service reminder */}
              {garage.length > 0 && (
                <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
                  <h2 className="font-bold text-[#44494d] mb-3 flex items-center gap-2">
                    ⚠ {lang === "zh" ? "保养提醒" : "Nhắc lịch bảo dưỡng"}
                  </h2>
                  <div className="space-y-3">
                    {garage.map((v) => (
                      <div key={v.id} className="flex items-center gap-4 p-3 rounded-xl border border-[#f0f0f0]">
                        <span className="text-2xl"><span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--ap-primary)" }}>{v.brand.slice(0, 1)}</span></span>
                        <div className="flex-1">
                          <p className="font-semibold text-[#44494d] text-sm">{v.nickname} — {v.brand} {v.model}</p>
                          <p className="text-xs text-[#8f9294]">
                            {lang === "zh" ? "下次保养：" : "Bảo dưỡng định kỳ tiếp theo: "}
                            <span className="font-bold text-[#1a4b97]">{v.nextService}</span>
                          </p>
                        </div>
                        <Link href="/products" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "var(--ap-primary)" }}>
                          {lang === "zh" ? "订购配件" : "Đặt phụ tùng"}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5]">
                <h3 className="font-bold text-[#44494d]">{lang === "zh" ? "添加车辆" : "Thêm xe vào gara"}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-[#8f9294]">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{lang === "zh" ? "昵称（可选）" : "Tên gọi (tùy chọn)"}</label>
                    <input value={form.nickname} onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))} placeholder={lang === "zh" ? "例如：家用车" : "VD: Xe nhà, Xe vợ..."} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("vehicleBrand")}</label>
                    <select value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
                      <option value="">{lang === "zh" ? "选择品牌" : "Chọn hãng"}</option>
                      {brandOptions.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("vehicleModel")}</label>
                    <input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} placeholder="VD: Vios, City..." className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{t("vehicleYear")}</label>
                    <select value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm">
                      {Array.from({ length: 20 }, (_, i) => 2025 - i).map((y) => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{lang === "zh" ? "颜色" : "Màu xe"}</label>
                    <input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} placeholder={lang === "zh" ? "例如：珍珠白" : "VD: Trắng ngọc trai"} className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{lang === "zh" ? "车牌号" : "Biển số xe"}</label>
                    <input value={form.licensePlate} onChange={(e) => setForm((p) => ({ ...p, licensePlate: e.target.value }))} placeholder="VD: 51A-123.45" className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a4b97]" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t border-[#e5e5e5]">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
                <button onClick={addVehicle} disabled={saving || !form.brand || !form.model} className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>
                  {saving ? "..." : t("addVehicle")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {editingVehicle && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5]">
                <h3 className="font-bold text-[#44494d]">{lang === "zh" ? "编辑车辆" : "Sửa thông tin xe"}</h3>
                <button onClick={() => setEditingVehicle(null)} className="text-[#8f9294]">✕</button>
              </div>
              <div className="p-5 space-y-3">
                {([
                  { key: "nickname", label: lang === "zh" ? "昵称" : "Tên gọi" },
                  { key: "licensePlate", label: lang === "zh" ? "车牌" : "Biển số" },
                  { key: "color", label: lang === "zh" ? "颜色" : "Màu xe" },
                  { key: "mileage", label: lang === "zh" ? "里程 (km)" : "Số km", type: "number" },
                  { key: "lastOilChange", label: lang === "zh" ? "上次换油" : "Thay dầu cuối" },
                  { key: "nextService", label: lang === "zh" ? "下次保养" : "Bảo dưỡng tiếp" },
                ] as const).map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold text-slate-600 mb-1 block">{label}</label>
                    <input
                      type={type ?? "text"}
                      value={String(editingVehicle[key as keyof Vehicle] ?? "")}
                      onChange={(e) => setEditingVehicle((v) => v ? { ...v, [key]: type === "number" ? Number(e.target.value) : e.target.value } : v)}
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 p-5 border-t border-[#e5e5e5]">
                <button onClick={() => setEditingVehicle(null)} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
                <button onClick={saveEdit} disabled={saving} className="flex-1 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>
                  {saving ? "..." : (lang === "zh" ? "保存" : "Lưu")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

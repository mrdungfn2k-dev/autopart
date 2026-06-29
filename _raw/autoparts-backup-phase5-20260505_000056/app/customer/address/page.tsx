"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import CustomerSidebar from "@/components/CustomerSidebar";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}

const STORAGE_KEY = "ap_addresses";

function loadAddresses(): Address[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveAddresses(list: Address[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function genId() { return "addr_" + Date.now(); }

const CITIES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Khác"];

export default function AddressPage() {
  const { t, lang } = useLang();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "Hà Nội", district: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setAddresses(loadAddresses()); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", phone: "", address: "", city: "Hà Nội", district: "" });
    setShowForm(true);
  };
  const openEdit = (a: Address) => {
    setEditing(a);
    setForm({ name: a.name, phone: a.phone, address: a.address, city: a.city, district: a.district });
    setShowForm(true);
  };
  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) return;
    let updated: Address[];
    if (editing) {
      updated = addresses.map(a => a.id === editing.id ? { ...a, ...form } : a);
    } else {
      const newAddr: Address = { id: genId(), ...form, isDefault: addresses.length === 0 };
      updated = [...addresses, newAddr];
    }
    saveAddresses(updated);
    setAddresses(updated);
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    if (addresses.find(a => a.id === id)?.isDefault && updated.length > 0) updated[0].isDefault = true;
    saveAddresses(updated);
    setAddresses(updated);
    setDeleteConfirm(null);
  };
  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated);
    setAddresses(updated);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <CustomerSidebar active="/customer/address" />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">{t("addressBook")}</h1>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: "var(--ap-primary)" }}>
              + {t("addAddress")}
            </button>
          </div>
        </div>

        <div className="p-6 max-w-2xl">
          {saved && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
              ✓ {lang === "zh" ? "保存成功" : "Đã lưu địa chỉ"}
            </div>
          )}

          {addresses.length === 0 && !showForm && (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-14 text-center">
              <div className="text-5xl mb-4">📍</div>
              <p className="font-semibold text-[#44494d] mb-2">{t("noAddresses")}</p>
              <button onClick={openAdd}
                className="mt-3 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: "var(--ap-primary)" }}>
                + {t("addAddress")}
              </button>
            </div>
          )}

          {/* Address list */}
          <div className="space-y-3 mb-4">
            {addresses.map(a => (
              <div key={a.id} className={`bg-white rounded-2xl border-2 p-5 ${a.isDefault ? "" : "border-[#f0f0f0]"}`}
                style={a.isDefault ? { borderColor: "var(--ap-primary)" } : {}}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#44494d]">{a.name}</span>
                      <span className="text-sm text-[#8f9294]">· {a.phone}</span>
                      {a.isDefault && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--ap-primary)" }}>
                          {t("defaultAddress")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#44494d]">{a.address}</p>
                    <p className="text-sm text-[#8f9294]">{a.district ? `${a.district}, ` : ""}{a.city}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button onClick={() => openEdit(a)} className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">
                      {t("edit")}
                    </button>
                    <button onClick={() => setDeleteConfirm(a.id)} className="text-sm font-semibold px-3 py-1.5 rounded-lg border border-[#fecaca] text-red-500 hover:bg-red-50">
                      {t("delete")}
                    </button>
                  </div>
                </div>
                {!a.isDefault && (
                  <button onClick={() => handleSetDefault(a.id)}
                    className="mt-3 text-xs font-semibold" style={{ color: "var(--ap-primary)" }}>
                    {t("setDefault")}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
              <h2 className="font-bold text-[#44494d] mb-5">{editing ? t("editAddress") : t("addAddress")}</h2>
              <div className="space-y-4">
                {[
                  { label: t("recipientName"), key: "name", placeholder: lang === "zh" ? "张三" : "Nguyễn Văn A" },
                  { label: t("recipientPhone"), key: "phone", placeholder: lang === "zh" ? "138..." : "0912..." },
                  { label: t("addressDetail"), key: "address", placeholder: lang === "zh" ? "门牌号、街道" : "Số nhà, tên đường..." },
                  { label: lang === "zh" ? "区/县" : "Quận/Huyện", key: "district", placeholder: lang === "zh" ? "Cầu Giấy" : "Cầu Giấy" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{label}</label>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t("city")}</label>
                  <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] bg-white">
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: "var(--ap-primary)" }}>
                  {t("saveBtn")}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm border border-[#e5e5e5] text-[#44494d]">
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-[#44494d] mb-2">{t("confirmDeleteAddress")}</h3>
            <p className="text-sm text-[#8f9294] mb-5">
              {lang === "zh" ? "此操作无法撤销" : "Hành động này không thể hoàn tác"}
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-red-500 hover:bg-red-600">
                {t("delete")}
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-[#e5e5e5] text-[#44494d]">
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

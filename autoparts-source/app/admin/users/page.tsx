"use client";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";
import { validateField, clampPhone } from "@/lib/validators";
import { confirmDialog } from "@/components/ConfirmDialog";

// Helpers
// TYPES & DATA
// Local storage
type UserStatus = "active" | "pending" | "suspended";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: UserStatus;
  joined: string;
  sales: number;
  avatar: string;
}

// Danh sách vai trò có thể thêm/sửa/xóa
interface RoleDef { key: string; label: string; color: string; }
const DEFAULT_ROLES: RoleDef[] = [
  { key: "admin",     label: "Admin",         color: "bg-purple-100 text-purple-700" },
  { key: "supplier",  label: "Nhà cung cấp",  color: "bg-indigo-100 text-indigo-700" },
  { key: "affiliate", label: "Cộng tác viên", color: "bg-orange-100 text-orange-700" },
  { key: "customer",  label: "Khách hàng",    color: "bg-green-100 text-green-700" },
];

const COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-700",
  "bg-yellow-100 text-yellow-700",
  "bg-green-100 text-green-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-teal-100 text-teal-700",
  "bg-[#f4f4f4] text-[#44494d]",
];

const statusConfig: Record<UserStatus, { label: string; color: string }> = {
  active:    { label: "Hoạt động", color: "bg-green-100 text-green-700" },
  pending:   { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-700" },
  suspended: { label: "Tạm khóa",  color: "bg-red-100 text-red-700" },
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  supplier: "Nhà cung cấp",
  affiliate: "Cộng tác viên",
  customer: "Khách hàng",
};

function roleLabel(key: string, fallback?: string) {
  return ROLE_LABELS[key] || fallback || key;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
}

// Modal thêm/sửa user

// Modal quản lý vai trò

// Page
export default function AdminUsersPage() {
  const { t, fp, lang } = useLang();

  // === Translated data (moved from module scope) ===

  function UserModal({ user, roles, onSave, onClose }: {
    user: Partial<UserRecord> | null;
    roles: RoleDef[];
    onSave: (u: UserRecord) => void;
    onClose: () => void;
  }) {
    const [form, setForm] = useState<Partial<UserRecord>>({
      name: "", email: "", phone: "", role: roles[0]?.key || "customer", status: "active", sales: 0, joined: new Date().toLocaleDateString("vi-VN"),
      ...user,
    });
  
    const set = (k: keyof UserRecord, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  
    const handleSave = () => {
      if (!form.name?.trim() || !form.email?.trim()) return alert("Vui lòng nhập đầy đủ Tên và Email");
      const verr = validateField("name", form.name) || validateField("email", form.email) || (form.phone ? validateField("phone", form.phone) : null);
      if (verr) return alert(verr);
      const saved: UserRecord = {
        id: form.id || "u" + Date.now(),
        name: form.name!,
        email: form.email!,
        phone: form.phone || "",
        role: form.role || "customer",
        status: (form.status as UserStatus) || "active",
        joined: form.joined || new Date().toLocaleDateString("vi-VN"),
        sales: form.sales || 0,
        avatar: getInitials(form.name!),
      };
      onSave(saved);
    };
  
    const isEdit = !!user?.id;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.55)" }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-slate-600 text-xl font-bold">×</button>
          <h2 className="text-lg font-bold text-[#44494d] mb-5">{isEdit ? "Sửa người dùng" : "Thêm người dùng mới"}</h2>
  
          {isEdit && (
            <div className="text-[11px] text-[#8f9294] bg-[#f8f8fa] rounded-lg px-3 py-2 mb-4">
              Admin chỉ được sửa <b>Vai trò</b> và <b>Trạng thái</b>. Thông tin cá nhân (tên, email, SĐT) do người dùng tự quản lý.
            </div>
          )}
          {(() => {
            const lockCls = "w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
              + (isEdit ? " bg-[#f4f4f4] text-[#8f9294] cursor-not-allowed" : "");
            const isAdminAcct = form.role === "admin";
            return (
          <div className="space-y-4">{/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input value={form.name || ""} onChange={e => set("name", e.target.value)} maxLength={20} disabled={isEdit} readOnly={isEdit}
                className={lockCls}
                placeholder="Nguyễn Văn A" />
            </div>{/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Email <span className="text-red-500">*</span></label>
              <input value={form.email || ""} onChange={e => set("email", e.target.value)} type="email" maxLength={100} disabled={isEdit} readOnly={isEdit}
                className={lockCls}
                placeholder="example@email.com" />
            </div>{/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">{t("phone")}</label>
              <input value={form.phone || ""} onChange={e => set("phone", clampPhone(e.target.value))} type="tel" inputMode="numeric" maxLength={10} pattern="0[1-9][0-9]{8}" disabled={isEdit} readOnly={isEdit}
                className={lockCls}
                placeholder="09xxxxxxxx" />
            </div>{/* Role dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Vai trò <span className="text-red-500">*</span></label>
              <select value={form.role || ""} onChange={e => set("role", e.target.value)} disabled={isEdit && isAdminAcct}
                className={"w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] bg-white" + (isEdit && isAdminAcct ? " bg-[#f4f4f4] text-[#8f9294] cursor-not-allowed" : "")}>{roles.map(r => <option key={r.key} value={r.key}>{roleLabel(r.key, r.label)}</option>)}
              </select>
            </div>{/* Status dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">{t("status")}</label>
              <select value={form.status || "active"} onChange={e => set("status", e.target.value)} disabled={isAdminAcct}
                className={"w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] bg-white" + (isAdminAcct ? " bg-[#f4f4f4] text-[#8f9294] cursor-not-allowed" : "")}>
                <option value="active">Hoạt động</option>
                {/* Chỉ giữ lựa chọn chờ duyệt khi tài khoản đang ở trạng thái đó. */}
                {user?.status === "pending" && <option value="pending">Chờ duyệt</option>}
                <option value="suspended">Tạm khóa</option>
              </select>
              {isAdminAcct && <p className="text-[11px] text-[#8f9294] mt-1">Tài khoản admin không thể bị khóa.</p>}
            </div>
          </div>);
          })()}
  
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>{isEdit ? "Lưu thay đổi" : "Thêm người dùng"}
            </button>
          </div>
        </div>
      </div>);
  }
  function RoleManagerModal({ roles, onSave, onClose }: {
    roles: RoleDef[];
    onSave: (roles: RoleDef[]) => void;
    onClose: () => void;
  }) {
    const [list, setList] = useState<RoleDef[]>(roles);
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState(COLORS[5]);
    const [editIdx, setEditIdx] = useState<number | null>(null);
    const [editLabel, setEditLabel] = useState("");
  
    const addRole = () => {
      if (!newLabel.trim()) return;
      const key = newLabel.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
      setList(l => [...l, { key, label: newLabel.trim(), color: newColor }]);
      setNewLabel("");
    };
  
    const deleteRole = (idx: number) => {
      setList(l => l.filter((_, i) => i !== idx));
    };
  
    const startEdit = (idx: number) => {
      setEditIdx(idx);
      setEditLabel(list[idx].label);
    };
  
    const saveEdit = () => {
      if (editIdx === null || !editLabel.trim()) return;
      setList(l => l.map((r, i) => i === editIdx ? { ...r, label: editLabel.trim() } : r));
      setEditIdx(null);
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.55)" }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-slate-600 text-xl font-bold">×</button>
          <h2 className="text-lg font-bold text-[#44494d] mb-1">{t("manageRoles")}</h2>
          <p className="text-xs text-[#8f9294] mb-5">Thêm, sửa, xóa danh sách vai trò trong hệ thống</p>{/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">{list.map((role, idx) => (
              <div key={role.key} className="flex items-center gap-3 p-3 rounded-xl border border-[#f0f0f0] hover:border-[#e5e5e5] transition-colors">{editIdx === idx ? (
                  <>
                    <input value={editLabel} onChange={e => setEditLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()}
                      className="flex-1 px-2 py-1 border border-orange-300 rounded-lg text-sm focus:outline-none" autoFocus />
                    <button onClick={saveEdit} className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: "var(--ap-primary)" }}>{t("save")}</button>
                    <button onClick={() => setEditIdx(null)} className="text-xs font-bold text-[#8f9294] px-2 py-1.5 rounded-lg border border-[#e5e5e5]">{t("cancel")}</button>
                  </>) : (
                  <>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${role.color}`}>{role.label}</span>
                    <span className="flex-1 text-xs text-[#8f9294] font-mono">{role.key}</span>
                    <button onClick={() => startEdit(idx)} className="text-xs text-[#8f9294] hover:text-[#1a4b97] px-2 py-1 rounded hover:bg-orange-50 transition-colors">{t("edit")}</button>
                    <button onClick={() => deleteRole(idx)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors">{t("delete")}</button>
                  </>)}
              </div>))}
          </div>{/* Add new role */}
          <div className="border-t border-[#f0f0f0] pt-4">
            <p className="text-xs font-semibold text-[#8f9294] mb-2">Thêm vai trò mới</p>
            <div className="flex gap-2">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addRole()}
                placeholder="Tên vai trò..." className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
              <select value={newColor} onChange={e => setNewColor(e.target.value)}
                className="px-2 py-2 border border-[#e5e5e5] rounded-lg text-xs focus:outline-none bg-white">{COLORS.map((c, i) => <option key={c} value={c}>Màu {i + 1}</option>)}
              </select>
              <button onClick={addRole} className="px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-1" style={{ background: "var(--ap-primary)" }}>+ Thêm
              </button>
            </div>
          </div>
  
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
            <button onClick={() => { onSave(list); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>Lưu danh sách vai trò
            </button>
          </div>
        </div>
      </div>);
  }
  const INIT_USERS: UserRecord[] = [
    { id: "u001", name: "Trịnh Quang Admin",        email: "admin@autoparts.vn",     phone: "0900 000 000", role: "admin",     status: "active",    joined: "01/01/2023", sales: 0,        avatar: "TQ" },
    { id: "u002", name: "Trần Thị Bé",              email: "be@gmail.com",           phone: "0902 345 678", role: "customer",  status: "active",    joined: "12/09/2023", sales: 0,        avatar: "TB" },
    { id: "u003", name: "Công ty Phụ Tùng An Thái", email: "anthai@autoparts.vn",    phone: "0903 456 789", role: "supplier",  status: "active",    joined: "01/08/2023", sales: 45200000, avatar: "AT" },
    { id: "u004", name: "Hệ thống Hà Thành Parts",  email: "hathanh@autoparts.vn",   phone: "0904 567 890", role: "supplier",  status: "active",    joined: "05/08/2023", sales: 32100000, avatar: "HT" },
    { id: "u005", name: "Lê Văn Cường",             email: "cuongle@gmail.com",      phone: "0905 678 901", role: "affiliate", status: "active",    joined: "20/07/2023", sales: 73200000, avatar: "LC" },
    { id: "u006", name: "Phụ Tùng Nam Phát",        email: "namphat@gmail.com",      phone: "0906 789 012", role: "supplier",  status: "pending",   joined: "12/10/2023", sales: 0,        avatar: "NP" },
    { id: "u007", name: "Trần Nam Sơn",             email: "sontran@gmail.com",      phone: "0907 890 123", role: "affiliate", status: "active",    joined: "25/09/2023", sales: 12300000, avatar: "TS" },
    { id: "u008", name: "Võ Thị Lan",               email: "lan@gmail.com",          phone: "0908 901 234", role: "customer",  status: "suspended", joined: "10/08/2023", sales: 0,        avatar: "VL" },
  ];

  const [users, setUsers] = useLocalStorage<UserRecord[]>("admin_users_v4", INIT_USERS);
  const [roles, setRoles] = useLocalStorage<RoleDef[]>("admin_roles_v2", DEFAULT_ROLES);

  // Nguồn thật: tài khoản đăng ký từ users.json và doanh nghiệp NCC từ suppliers.json.
  // Tài khoản mới đăng ký hiển thị ngay, không dùng cứng danh sách seed.
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/suppliers?all=1").then(r => r.json()).catch(() => []),
    ]).then(([realUsers, sups]) => {
      const userRecords: UserRecord[] = (Array.isArray(realUsers) ? realUsers : []).map((u: { id: string; name?: string; email?: string; phone?: string; role?: string; status?: string; joined?: string; sales?: number }) => ({
        id: u.id,
        name: u.name || "—",
        email: u.email || "",
        phone: (u.phone || "").toString(),
        role: u.role || "customer",
        status: (u.status as UserStatus) || "active",
        joined: u.joined || "",
        sales: u.sales || 0,
        avatar: getInitials(u.name || "?"),
      }));
      const supRecords: UserRecord[] = (Array.isArray(sups) ? sups : []).map((s: { id: string; name?: string; email?: string; phone?: string; active?: boolean; joinedAt?: string }) => ({
        id: s.id,
        name: s.name || "NCC",
        email: s.email || `${s.id}@autoparts.vn`,
        phone: (s.phone || "").toString(),
        role: "supplier",
        status: (s.active === false ? "suspended" : "active") as UserStatus,
        joined: s.joinedAt ? new Date(s.joinedAt).toLocaleDateString("vi-VN") : "",
        sales: 0,
        avatar: getInitials(s.name || "NCC"),
      }));
      if (userRecords.length === 0 && supRecords.length === 0) return;
      setUsers(prev => {
        const byId = new Map<string, UserRecord>();
        for (const u of userRecords) byId.set(u.id, u);   // tài khoản thật
        for (const s of supRecords) byId.set(s.id, s);     // doanh nghiệp NCC
        // Giữ user admin tự thêm trong phiên nếu chưa có trong API.
        for (const u of prev) if (!byId.has(u.id) && /^u\d{12,}$/.test(u.id)) byId.set(u.id, u);
        return Array.from(byId.values());
      });
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserRecord> | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const toast = (message: string, type = "success") =>
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));

  const getRoleConfig = (key: string) => {
    const found = roles.find(r => r.key === key);
    return found
      ? { ...found, label: roleLabel(found.key, found.label) }
      : { label: roleLabel(key), color: "bg-[#f4f4f4] text-[#44494d]" };
  };

  const filtered = users.filter(u =>(roleFilter === "all" || u.role === roleFilter) &&
    (search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Phân trang thật
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  // Dãy số trang gọn: 1 ... (p-1) p (p+1) ... N
  const pageNumbers: (number | string)[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const s = new Set<number>([1, 2, totalPages - 1, totalPages, pageSafe - 1, pageSafe, pageSafe + 1]);
    const arr = [...s].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out: (number | string)[] = [];
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i]);
      if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push("...");
    }
    return out;
  })();

  const isSupplierId = (id: string) => /^s\d/.test(id);

  // Lưu trạng thái thật vào users.json hoặc suppliers.json với NCC.
  const persistStatus = async (u: UserRecord, status: UserStatus): Promise<boolean> => {
    try {
      if (isSupplierId(u.id)) {
        await fetch(`/api/suppliers/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: status === "active" }) });
        return true;
      }
      const r = await fetch(`/api/admin/users/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); toast(d.error || "Không lưu được thay đổi", "warning"); return false; }
      return true;
    } catch { toast("Lỗi kết nối khi lưu thay đổi", "warning"); return false; }
  };

  const handleSaveUser = async (u: UserRecord) => {
    const existing = users.find(x => x.id === u.id);
    if (existing) {
      // Sửa: chỉ lưu vai trò và trạng thái, thông tin cá nhân bị khóa.
      if (isSupplierId(u.id)) {
        await fetch(`/api/suppliers/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: u.status === "active" }) });
      } else {
        const r = await fetch(`/api/admin/users/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: u.role, status: u.status }) });
        if (!r.ok) { const d = await r.json().catch(() => ({})); toast(d.error || "Không lưu được", "warning"); return; }
      }
    }
    setUsers(prev => {
      const idx = prev.findIndex(x => x.id === u.id);
      if (idx >= 0) return prev.map(x => x.id === u.id ? u : x);
      return [...prev, u];
    });
    setShowUserModal(false);
    setEditingUser(null);
    toast(existing ? "Đã lưu thay đổi người dùng" : "Đã thêm người dùng");
  };

  // Khóa tài khoản sau khi xác nhận.
  const askLock = async (u: UserRecord) => {
    if (u.role === "admin") { toast("Không thể khóa tài khoản admin", "warning"); return; }
    if (!(await confirmDialog(`Khóa tài khoản "${u.name}"? Người dùng sẽ không đăng nhập được cho tới khi mở khóa.`, { confirmText: "Khóa", danger: true }))) return;
    if (await persistStatus(u, "suspended")) {
      setUsers(p => p.map(x => x.id === u.id ? { ...x, status: "suspended" } : x));
      toast(`Đã khóa tài khoản "${u.name}"`, "warning");
    }
  };
  // Mở khóa hoặc duyệt: chuyển sang hoạt động.
  const setActive = async (u: UserRecord, okMsg: string) => {
    if (await persistStatus(u, "active")) {
      setUsers(p => p.map(x => x.id === u.id ? { ...x, status: "active" } : x));
      toast(okMsg);
    }
  };
  // Xóa tài khoản sau khi xác nhận.
  const askDelete = async (u: UserRecord) => {
    if (u.role === "admin") { toast("Không thể xóa tài khoản admin", "warning"); return; }
    if (!(await confirmDialog(`Xóa người dùng "${u.name}"? Hành động này không thể hoàn tác.`, { confirmText: "Xóa", danger: true }))) return;
    if (!isSupplierId(u.id)) {
      try { const r = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" }); if (!r.ok) { const d = await r.json().catch(() => ({})); toast(d.error || "Không xóa được", "warning"); return; } }
      catch { toast("Lỗi kết nối khi xóa", "warning"); return; }
    }
    setUsers(prev => prev.filter(x => x.id !== u.id));
    toast(`Đã xóa người dùng "${u.name}"`, "warning");
  };

  const openAdd = () => { setEditingUser(null); setShowUserModal(true); };
  const openEdit = (u: UserRecord) => { setEditingUser(u); setShowUserModal(true); };

  // Role filter tabs with counts
  const roleTabs = [
    { key: "all", label: (lang === "zh" ? "全部" : lang === "en" ? "All" : "Tất cả"), count: users.length },
    ...roles.map(r => ({ key: r.key, label: roleLabel(r.key, r.label), count: users.filter(u => u.role === r.key).length })),
  ];

  // Stats cards
  const statsCards = [
    { label: lang === "en" ? "Total users" : lang === "zh" ? "用户总数" : "Tổng người dùng", value: users.length, color: "#44494d" },
    ...roles.slice(0, 5).map(r => ({ label: roleLabel(r.key, r.label), value: users.filter(u => u.role === r.key).length, color: "var(--ap-primary)" })),
  ];

  return (
    <>
      <main className="flex-1 overflow-auto">{/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{lang === "en" ? "Partners & Customers" : lang === "zh" ? "合作伙伴与客户" : "Đối tác & Khách hàng"}</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">{lang === "en" ? "Manage roles" : lang === "zh" ? "管理角色" : "Quản lý vai trò"}
              </button>
              <button onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>+ {lang === "en" ? "Add user" : lang === "zh" ? "添加用户" : "Thêm người dùng"}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">{/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">{statsCards.map((s, i) => (
              <div key={i} className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: i === 0 ? "#44494d" : "var(--ap-primary)" }}>{s.value.toLocaleString()}</p>
                <p className="text-xs text-[#8f9294]">{s.label}</p>
              </div>))}
          </div>{/* Role filter tabs */}
          <div className="bg-white border-b border-[#f0f0f0] rounded-t-xl flex overflow-x-auto">{roleTabs.map(f => (
              <button key={f.key} onClick={() => setRoleFilter(f.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${roleFilter === f.key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{f.label} <span className="text-xs text-[#8f9294] ml-1">({f.count})</span>
              </button>))}
          </div>{/* Table */}
          <div className="bg-white rounded-b-xl border border-[#f0f0f0] border-t-0">
            <div className="p-4 border-b border-slate-50">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "en" ? "Search name, email..." : lang === "zh" ? "搜索姓名、邮箱..." : "Tìm tên, email..."}
                className="w-80 pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
            <table className="w-full">
              <thead style={{ background: "#f8f8fa" }}>
                <tr className="text-xs text-[#8f9294] font-semibold">
                  <th className="text-left px-4 py-3">{lang === "en" ? "USER" : lang === "zh" ? "用户" : "NGƯỜI DÙNG"}</th>
                  <th className="text-left px-4 py-3">{lang === "en" ? "ROLE" : lang === "zh" ? "角色" : "VAI TRÒ"}</th>
                  <th className="text-left px-4 py-3">{lang === "en" ? "CONTACT" : lang === "zh" ? "联系" : "LIÊN HỆ"}</th>
                  <th className="text-left px-4 py-3">{lang === "en" ? "JOINED" : lang === "zh" ? "加入时间" : "THAM GIA"}</th>
                  <th className="text-left px-4 py-3">{lang === "en" ? "SALES" : lang === "zh" ? "销售额" : "DOANH SỐ"}</th>
                  <th className="text-left px-4 py-3">{lang === "en" ? "STATUS" : lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
                  <th className="text-left px-4 py-3">{lang === "en" ? "ACTIONS" : lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
                </tr>
              </thead>
              <tbody>{filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-[#8f9294] text-sm">{lang === "en" ? "No users found" : lang === "zh" ? "未找到用户" : "Không tìm thấy người dùng"}</td></tr>)}
                {paged.map(user => {
                  const role = getRoleConfig(user.role);
                  const status = statusConfig[user.status];
                  return (
                    <tr key={user.id} className="border-t border-slate-50 hover:bg-[#f8f8fa] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{user.avatar}</div>
                          <div>
                            <p className="font-semibold text-[#44494d] text-sm">{user.name}</p>
                            <p className="text-xs text-[#8f9294]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${role.color}`}>{role.label}</span>
                      </td>
                      <td className="px-4 py-3 text-[#8f9294] text-xs">{user.phone || "—"}</td>
                      <td className="px-4 py-3 text-[#8f9294] text-sm">{user.joined}</td>
                      <td className="px-4 py-3 font-semibold text-[#44494d] text-sm">{user.sales > 0 ? (user.sales / 1000000).toFixed(1) + "M" : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(user)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4]">{lang === "en" ? "Edit" : lang === "zh" ? "编辑" : "Sửa"}
                          </button>{user.status === "pending" && (
                            <button onClick={() => setActive(user, `Đã duyệt tài khoản "${user.name}"`)}
                              className="px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#22C55E" }}>{t("approve")}</button>)}
                          {user.status === "active" && user.role !== "admin" && (
                            <button onClick={() => askLock(user)}
                              className="px-2 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50">{lang === "en" ? "Lock" : lang === "zh" ? "锁定" : "Khóa"}</button>)}
                          {user.status === "suspended" && (
                            <button onClick={() => setActive(user, `Đã mở khóa "${user.name}"`)}
                              className="px-2 py-1 rounded-lg text-xs font-bold border border-green-200 text-green-500 hover:bg-green-50">{lang === "en" ? "Unlock" : lang === "zh" ? "解锁" : "Mở khóa"}</button>)}
                          {user.role !== "admin" && (
                            <button onClick={() => askDelete(user)}
                              className="px-2 py-1 rounded-lg text-xs font-bold border border-red-100 text-red-400 hover:bg-red-50">{t("delete")}</button>)}
                        </div>
                      </td>
                    </tr>);
                })}
              </tbody>
            </table>
            <div className="relative flex items-center justify-center px-4 py-3 border-t border-[#f0f0f0]">
              <span className="absolute left-4 text-sm text-[#8f9294] hidden md:block">
                {filtered.length === 0 ? "0" : `${(pageSafe - 1) * PAGE_SIZE + 1}–${Math.min(pageSafe * PAGE_SIZE, filtered.length)}`} / {filtered.length} {lang === "en" ? "users" : lang === "zh" ? "用户" : "người dùng"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={pageSafe <= 1}
                  className="w-8 h-8 rounded-lg text-base flex items-center justify-center border border-[#e5e5e5] text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f4f4f4]">&lt;</button>
                {pageNumbers.map((p, i) => p === "..." ? (
                  <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">...</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === pageSafe ? "text-white" : "border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4]"}`}
                    style={p === pageSafe ? { background: "var(--ap-primary)" } : {}}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages}
                  className="w-8 h-8 rounded-lg text-base flex items-center justify-center border border-[#e5e5e5] text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f4f4f4]">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </main>{/* USER MODAL */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          roles={roles}
          onSave={handleSaveUser}
          onClose={() => { setShowUserModal(false); setEditingUser(null); }}
        />)}

      {/* ROLE MANAGER MODAL */}
      {showRoleModal && (
        <RoleManagerModal
          roles={roles}
          onSave={setRoles}
          onClose={() => setShowRoleModal(false)}
        />)}
    </>);
}


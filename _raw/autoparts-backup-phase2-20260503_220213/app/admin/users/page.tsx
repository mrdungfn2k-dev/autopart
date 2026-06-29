"use client";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import SidebarControls from "@/components/SidebarControls";
import AdminSidebar from "@/components/AdminSidebar";

// ────────────────────────────────────────────────────────────
// TYPES & DATA
// ────────────────────────────────────────────────────────────
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

// Danh sách vai trò — có thể thêm/sửa/xóa
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

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
}

// ────────────────────────────────────────────────────────────
// MODAL: THÊM / SỬA USER
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// MODAL: QUẢN LÝ VAI TRÒ
// ────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────
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
          <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-slate-600 text-xl font-bold">✕</button>
          <h2 className="text-lg font-bold text-[#44494d] mb-5">{isEdit ? "Sửa người dùng" : "Thêm người dùng mới"}</h2>
  
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input value={form.name || ""} onChange={e => set("name", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="Nguyễn Văn A" />
            </div>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Email <span className="text-red-500">*</span></label>
              <input value={form.email || ""} onChange={e => set("email", e.target.value)} type="email"
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="example@email.com" />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">{t("phone")}</label>
              <input value={form.phone || ""} onChange={e => set("phone", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]"
                placeholder="09xx xxx xxx" />
            </div>
            {/* Role dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">Vai trò <span className="text-red-500">*</span></label>
              <select value={form.role || ""} onChange={e => set("role", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] bg-white">
                {roles.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
            {/* Status dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#8f9294] mb-1">{t("status")}</label>
              <select value={form.status || "active"} onChange={e => set("status", e.target.value)}
                className="w-full px-3 py-2.5 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97] bg-white">
                <option value="active">Hoạt động</option>
                <option value="pending">{t("pendingApprovals")}</option>
                <option value="suspended">Tạm khóa</option>
              </select>
            </div>
          </div>
  
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>
              {isEdit ? "Lưu thay đổi" : "Thêm người dùng"}
            </button>
          </div>
        </div>
      </div>
    );
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
          <button onClick={onClose} className="absolute top-4 right-4 text-[#8f9294] hover:text-slate-600 text-xl font-bold">✕</button>
          <h2 className="text-lg font-bold text-[#44494d] mb-1">{t("manageRoles")}</h2>
          <p className="text-xs text-[#8f9294] mb-5">Thêm, sửa, xóa danh sách vai trò trong hệ thống</p>
  
          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {list.map((role, idx) => (
              <div key={role.key} className="flex items-center gap-3 p-3 rounded-xl border border-[#f0f0f0] hover:border-[#e5e5e5] transition-colors">
                {editIdx === idx ? (
                  <>
                    <input value={editLabel} onChange={e => setEditLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && saveEdit()}
                      className="flex-1 px-2 py-1 border border-orange-300 rounded-lg text-sm focus:outline-none" autoFocus />
                    <button onClick={saveEdit} className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: "var(--ap-primary)" }}>{t("save")}</button>
                    <button onClick={() => setEditIdx(null)} className="text-xs font-bold text-[#8f9294] px-2 py-1.5 rounded-lg border border-[#e5e5e5]">{t("cancel")}</button>
                  </>
                ) : (
                  <>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${role.color}`}>{role.label}</span>
                    <span className="flex-1 text-xs text-[#8f9294] font-mono">{role.key}</span>
                    <button onClick={() => startEdit(idx)} className="text-xs text-[#8f9294] hover:text-[#1a4b97] px-2 py-1 rounded hover:bg-orange-50 transition-colors">{t("edit")}</button>
                    <button onClick={() => deleteRole(idx)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors">{t("delete")}</button>
                  </>
                )}
              </div>
            ))}
          </div>
  
          {/* Add new role */}
          <div className="border-t border-[#f0f0f0] pt-4">
            <p className="text-xs font-semibold text-[#8f9294] mb-2">Thêm vai trò mới</p>
            <div className="flex gap-2">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addRole()}
                placeholder="Tên vai trò..." className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
              <select value={newColor} onChange={e => setNewColor(e.target.value)}
                className="px-2 py-2 border border-[#e5e5e5] rounded-lg text-xs focus:outline-none bg-white">
                {COLORS.map((c, i) => <option key={c} value={c}>Màu {i + 1}</option>)}
              </select>
              <button onClick={addRole} className="px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-1" style={{ background: "var(--ap-primary)" }}>
                + Thêm
              </button>
            </div>
          </div>
  
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa]">{t("cancel")}</button>
            <button onClick={() => { onSave(list); onClose(); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--ap-primary)" }}>
              Lưu danh sách vai trò
            </button>
          </div>
        </div>
      </div>
    );
  }
  const INIT_USERS: UserRecord[] = [
    { id: "u001", name: "Trịnh Quang Admin",        email: "admin@autoparts.vn",     phone: "0900 000 000", role: "admin",     status: "active",    joined: "01/01/2023", sales: 0,        avatar: "TQ" },
    { id: "u002", name: "Trần Thị Bé",             email: "be@gmail.com",           phone: "0902 345 678", role: "customer",  status: "active",    joined: "12/09/2023", sales: 0,        avatar: "TB" },
    { id: "u003", name: "Công ty Phụ Tùng An Thái",email: "anthai@autoparts.vn",    phone: "0903 456 789", role: "supplier",  status: "active",    joined: "01/08/2023", sales: 45200000, avatar: "AT" },
    { id: "u004", name: "Hệ thống Hà Thành Parts", email: "hathanh@autoparts.vn",   phone: "0904 567 890", role: "supplier",  status: "active",    joined: "05/08/2023", sales: 32100000, avatar: "HT" },
    { id: "u005", name: "Lê Văn Cường",            email: "cuongle@gmail.com",      phone: "0905 678 901", role: "affiliate", status: "active",    joined: "20/07/2023", sales: 73200000, avatar: "LC" },
    { id: "u006", name: "Phụ Tùng Nam Phát",       email: "namphat@gmail.com",      phone: "0906 789 012", role: "supplier",  status: "pending",   joined: "12/10/2023", sales: 0,        avatar: "NP" },
    { id: "u007", name: "Trần Nam Sơn",            email: "sontran@gmail.com",      phone: "0907 890 123", role: "affiliate", status: "active",    joined: "25/09/2023", sales: 12300000, avatar: "TS" },
    { id: "u008", name: "Võ Thị Lan",              email: "lan@gmail.com",          phone: "0908 901 234", role: "customer",  status: "suspended", joined: "10/08/2023", sales: 0,        avatar: "VL" },
  ];

  const [users, setUsers] = useLocalStorage<UserRecord[]>("admin_users_v4", INIT_USERS);
  const [roles, setRoles] = useLocalStorage<RoleDef[]>("admin_roles_v2", DEFAULT_ROLES);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserRecord> | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getRoleConfig = (key: string) => roles.find(r => r.key === key) || { label: key, color: "bg-[#f4f4f4] text-[#44494d]" };

  const filtered = users.filter(u =>
    (roleFilter === "all" || u.role === roleFilter) &&
    (search === "" || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search))
  );

  const handleSaveUser = (u: UserRecord) => {
    setUsers(prev => {
      const idx = prev.findIndex(x => x.id === u.id);
      if (idx >= 0) return prev.map(x => x.id === u.id ? u : x);
      return [...prev, u];
    });
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setDeleteConfirm(null);
  };

  const openAdd = () => { setEditingUser(null); setShowUserModal(true); };
  const openEdit = (u: UserRecord) => { setEditingUser(u); setShowUserModal(true); };

  // Role filter tabs with counts
  const roleTabs = [
    { key: "all", label: (lang === "zh" ? "全部" : "Tất cả"), count: users.length },
    ...roles.map(r => ({ key: r.key, label: r.label, count: users.filter(u => u.role === r.key).length })),
  ];

  // Stats cards
  const statsCards = [
    { label: "Tổng người dùng", value: users.length, color: "#44494d" },
    ...roles.slice(0, 5).map(r => ({ label: r.label, value: users.filter(u => u.role === r.key).length, color: "var(--ap-primary)" })),
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
      <AdminSidebar active="/admin/users" />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">Quản lý người dùng</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowRoleModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#e5e5e5] rounded-lg text-sm text-slate-600 hover:bg-[#f8f8fa]">
                Quản lý vai trò
              </button>
              <button onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>
                + Thêm người dùng
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
            {statsCards.map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#f0f0f0] p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: i === 0 ? "#44494d" : "var(--ap-primary)" }}>{s.value.toLocaleString()}</p>
                <p className="text-xs text-[#8f9294]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Role filter tabs */}
          <div className="bg-white border-b border-[#f0f0f0] rounded-t-xl flex overflow-x-auto">
            {roleTabs.map(f => (
              <button key={f.key} onClick={() => setRoleFilter(f.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${roleFilter === f.key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>
                {f.label} <span className="text-xs text-[#8f9294] ml-1">({f.count})</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-b-xl border border-[#f0f0f0] border-t-0">
            <div className="p-4 border-b border-slate-50">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email..."
                className="w-80 pl-4 pr-4 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:border-[#1a4b97]" />
            </div>
            <table className="w-full">
              <thead style={{ background: "#f8f8fa" }}>
                <tr className="text-xs text-[#8f9294] font-semibold">
                  <th className="text-left px-4 py-3">NGƯỜI DÙNG</th>
                  <th className="text-left px-4 py-3">{lang === "zh" ? "角色" : "VAI TRÒ"}</th>
                  <th className="text-left px-4 py-3">LIÊN HỆ</th>
                  <th className="text-left px-4 py-3">THAM GIA</th>
                  <th className="text-left px-4 py-3">DOANH SỐ</th>
                  <th className="text-left px-4 py-3">{lang === "zh" ? "状态" : "TRẠNG THÁI"}</th>
                  <th className="text-left px-4 py-3">{lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-[#8f9294] text-sm">Không tìm thấy người dùng</td></tr>
                )}
                {filtered.map(user => {
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
                      <td className="px-4 py-3 font-semibold text-[#44494d] text-sm">
                        {user.sales > 0 ? (user.sales / 1000000).toFixed(1) + "M" : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(user)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4]">
                            Sửa
                          </button>
                          {user.status === "pending" && (
                            <button onClick={() => setUsers(p => p.map(u => u.id === user.id ? { ...u, status: "active" } : u))}
                              className="px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#22C55E" }}>{t("approve")}</button>
                          )}
                          {user.status === "active" && (
                            <button onClick={() => setUsers(p => p.map(u => u.id === user.id ? { ...u, status: "suspended" } : u))}
                              className="px-2 py-1 rounded-lg text-xs font-bold border border-red-200 text-red-500">Khóa</button>
                          )}
                          {user.status === "suspended" && (
                            <button onClick={() => setUsers(p => p.map(u => u.id === user.id ? { ...u, status: "active" } : u))}
                              className="px-2 py-1 rounded-lg text-xs font-bold border border-green-200 text-green-500">Mở khóa</button>
                          )}
                          <button onClick={() => setDeleteConfirm(user.id)}
                            className="px-2 py-1 rounded-lg text-xs font-bold border border-red-100 text-red-400 hover:bg-red-50">{t("delete")}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f0f0] text-sm text-[#8f9294]">
              <span>Hiển thị {filtered.length} / {users.length} người dùng</span>
              <div className="flex gap-1">
                {[1, 2, 3, "...", Math.ceil(users.length / 20)].map((p, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === 1 ? "text-white" : "hover:bg-[#f4f4f4] text-slate-600"}`}
                    style={p === 1 ? { background: "var(--ap-primary)" } : {}}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* USER MODAL */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          roles={roles}
          onSave={handleSaveUser}
          onClose={() => { setShowUserModal(false); setEditingUser(null); }}
        />
      )}

      {/* ROLE MANAGER MODAL */}
      {showRoleModal && (
        <RoleManagerModal
          roles={roles}
          onSave={setRoles}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(15,23,42,0.55)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-xl">⚠</div>
            <h3 className="text-center font-bold text-[#44494d] mb-2">Xác nhận xóa</h3>
            <p className="text-center text-sm text-[#8f9294] mb-5">
              Bạn có chắc muốn xóa người dùng <strong>{users.find(u => u.id === deleteConfirm)?.name}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600">{t("cancel")}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1a4b97]">Xóa người dùng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

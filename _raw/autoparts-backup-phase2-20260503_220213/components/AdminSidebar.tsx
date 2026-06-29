"use client";
import { useLang } from "@/lib/i18n";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { useState, useEffect } from "react";
import SidebarControls from "@/components/SidebarControls";
import LogoImage from "@/components/LogoImage";

export default function AdminSidebar({
 active = "/admin" }: { active?: string }) {
  const { t } = useLang();
  const [user, setUser] = useState<{name?: string, email?: string, avatar?: string} | null>(null);
  useEffect(() => {
    setUser(getAuth());
    const handler = () => setUser(getAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const menuItems = [
    { label: t("adminDashboard"), href: "/admin",
      icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { label: "QUẢN LÝ", section: true },
    { label: t("adminUsers"), href: "/admin/users",
      icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
    { label: t("adminCatalog"), href: "/admin/catalog",
      icon: "M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" },
    { label: "Hãng xe & VIN", href: "/admin/vehicles",
      icon: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zm-8-1h2v-2h-2v2zm-4 0h2v-2H7v2zm8 0h2v-2h-2v2z" },
    { label: t("adminOrders"), href: "/admin/orders",
      icon: "M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm-7 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z" },
    { label: t("inventoryManage"), href: "/admin/inventory",
      icon: "M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 12H4V9h16v10zM4 3h16v2H4z" },
    { label: "VẬN HÀNH", section: true },
    { label: t("adminFinance"), href: "/admin/finance",
      icon: "M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" },
    { label: t("adminMarketing"), href: "/admin/marketing",
      icon: "M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.55.8-1.1 1.2-1.65-.99-.74-2.24-1.68-3.2-2.4-.4.55-.8 1.1-1.2 1.66zM20.4 5.05c-.4-.55-.8-1.1-1.2-1.65-.99.74-2.24 1.68-3.2 2.4.4.55.8 1.1 1.2 1.65.96-.71 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" },
    { label: t("adminApprovals"), href: "/admin/approvals",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
    { label: t("adminReports"), href: "/admin/reports",
      icon: "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" },
    { label: "CMS Nội dung", href: "/admin/cms",
      icon: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" },
    { label: "Nhập / Xuất dữ liệu", href: "/admin/import-export",
      icon: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" },
    { label: t("adminSettings"), href: "/admin/settings",
      icon: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13-.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" },
    { label: "Bản tin", href: "/admin/newsletter",
      icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" },
    { label: "Hồ sơ cá nhân", href: "/admin/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

  return (
    <aside className="w-[220px] shrink-0 min-h-screen flex flex-col" style={{ background: "var(--ap-sidebar-bg)" }}>
      <div className="h-16 flex items-center px-5 border-b border-[#2f3336]">
        <Link href="/" className="flex items-center">
          <div className="bg-white px-3 py-1.5 rounded-[6px] shadow-sm inline-flex items-center justify-center"><LogoImage className="h-[18px] w-auto object-contain" /></div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-0.5 overflow-auto">
        {menuItems.map((item, i) => {
          if (item.section) {
            return <p key={i} className="text-[#8f9294] text-xs font-semibold uppercase px-2 py-2 mt-3">{item.label}</p>;
          }
          
          const isActive = item.href === active || (item.href !== "/admin" && active.startsWith(item.href || " "));
          
          return (
            <Link key={i} href={item.href || "#"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white" : "text-[#8f9294] hover:text-white hover:bg-slate-800"}`}
              style={isActive ? { background: "var(--ap-primary)" } : {}}>
              {item.icon && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 opacity-90">
                  <path d={item.icon} />
                </svg>
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#2f3336]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-600 bg-gradient-to-br from-[#1a4b97] to-[#0d2d5e] flex flex-shrink-0 items-center justify-center text-white text-sm font-bold shadow-sm">{user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : (user?.name?.charAt(0).toUpperCase() || "A")}</div>
          <div className="min-w-0">
            <p className="text-white text-[13px] font-medium truncate">{user?.name || "User"}</p>
            <p className="text-[#8f9294] text-[11px] truncate">{user?.email || "user@autopart.vn"}</p>
          </div>
        </div>
      </div>
      <SidebarControls />
    </aside>
  );
}

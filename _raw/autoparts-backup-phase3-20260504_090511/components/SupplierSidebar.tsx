"use client";
import { useLang } from "@/lib/i18n";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { useState, useEffect } from "react";
import SidebarControls from "@/components/SidebarControls";
import LogoImage from "@/components/LogoImage";

const NAV_ICON: Record<string, string> = {
  "/supplier":           "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  "/supplier/orders":    "M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm-7 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z",
  "/supplier/products":  "M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z",
  "/supplier/inventory": "M20 7l-9-5-9 5v11l9 5 9-5V7zm-9 13l-7-3.88V8.12L11 12v8zm2 0V12l7-3.88v8.12L13 20zm-2-10L4.06 7 11 3.12 17.94 7 11 10z",
  "/supplier/finance":   "M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
  "/supplier/analytics": "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
  "/supplier/settings":  "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
};

export default function SupplierSidebar({
 active }: { active: string }) {
  const { t, lang } = useLang();
  const menuItems = [
    { label: t("supplierDashboard"), href: "/supplier" },
    { label: t("supplierOrders"),    href: "/supplier/orders" },
    { label: t("supplierProducts"),  href: "/supplier/products" },
    { label: t("supplierInventory"), href: "/supplier/inventory" },
    { label: t("supplierFinance"),   href: "/supplier/finance" },
    { label: lang === "zh" ? "分析" : "Phân tích", href: "/supplier/analytics" },
    { label: t("supplierSettings"), href: "/supplier/settings" },
    { label: "Hồ sơ cá nhân", href: "/supplier/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

  const [user, setUser] = useState<{name?: string, email?: string, avatar?: string} | null>(null);
  useEffect(() => {
    setUser(getAuth());
    const handler = () => setUser(getAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return (
    <aside className="w-[220px] shrink-0 min-h-screen flex flex-col" style={{ background: "var(--ap-sidebar-bg)" }}>
      <div className="h-16 flex items-center px-5 border-b border-[#2f3336]">
        <Link href="/" className="flex items-center">
          <div className="bg-white px-3 py-1.5 rounded-[6px] shadow-sm inline-flex items-center justify-center"><LogoImage className="h-[18px] w-auto object-contain" /></div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-0.5 overflow-auto">
        {menuItems.map((item, i) => {
          const isActive = item.href === active;
          const icon = NAV_ICON[item.href];
          const [user, setUser] = useState<{name?: string, email?: string, avatar?: string} | null>(null);
  useEffect(() => {
    setUser(getAuth());
    const handler = () => setUser(getAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  return (
            <Link key={i} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white" : "text-[#8f9294] hover:text-white hover:bg-slate-800"}`}
              style={isActive ? { background: "var(--ap-primary)" } : {}}>
              {icon && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 opacity-90">
                  <path d={icon} />
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
          <div>
            <p className="text-white text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-[#1a4b97] text-xs">Supplier Portal</p>
          </div>
        </div>
      </div>
      <SidebarControls />
    </aside>
  );
}

"use client";
import { getAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SidebarControls from "@/components/SidebarControls";
import LogoImage from "@/components/LogoImage";

const NAV_ICON: Record<string, string> = {
  "/affiliate":              "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  "/affiliate/commissions":  "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  "/affiliate/links":        "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  "/affiliate/team":         "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  "/affiliate/withdraw":     "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
  "/affiliate/settings":     "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
};

export default function AffiliateSidebar({
 active }: { active?: string }) {
  const { t, lang } = useLang();
  const pathname = usePathname();
  const cur = active || pathname || "/affiliate";
  const [user, setUser] = useState<{name?: string, email?: string, avatar?: string} | null>(null);
  useEffect(() => {
    setUser(getAuth());
    const handler = () => setUser(getAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  const menuItems = [
    { label: t("affiliateDashboard"),    href: "/affiliate" },
    { label: t("affiliateCommissions"),  href: "/affiliate/commissions" },
    { label: t("affiliateLinks"),        href: "/affiliate/links" },
    { label: t("affiliateTeam"),         href: "/affiliate/team" },
    { label: t("affiliateWithdraw"),     href: "/affiliate/withdraw" },
    { label: t("affiliateSettings"),     href: "/affiliate/settings" },
    { label: "Hồ sơ cá nhân", href: "/affiliate/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

  return (
    <aside className="w-[220px] shrink-0 min-h-screen flex flex-col" style={{ background: "var(--ap-sidebar-bg)" }}>
      <div className="h-16 flex items-center px-5 border-b border-[#2f3336]">
        <Link href="/" className="flex items-center">
          <div className="bg-white px-3 py-1.5 rounded-[6px] shadow-sm inline-flex items-center justify-center"><LogoImage className="h-[18px] w-auto object-contain" /></div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-0.5 overflow-auto" ref={(el) => { if (!el) return; const s = sessionStorage.getItem("ap-sidebar-scroll"); if (s) el.scrollTop = +s; el.onscroll = () => sessionStorage.setItem("ap-sidebar-scroll", String(el.scrollTop)); }}>
        {menuItems.map((item, i) => {
          const isActive = item.href === cur;
          return (
            <Link key={i} href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white" : "text-[#8f9294] hover:text-white hover:bg-slate-800"}`}
              style={isActive ? { background: "var(--ap-primary)" } : {}}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#2f3336]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-600 bg-gradient-to-br from-[#1a4b97] to-[#0d2d5e] flex flex-shrink-0 items-center justify-center text-white text-sm font-bold shadow-sm">{user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : (user?.name?.charAt(0).toUpperCase() || "A")}</div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || "Đại lý"}</p>
            <p className="text-xs font-bold truncate" style={{ color: "var(--ap-primary)" }}>{lang === "zh" ? "推广员门户" : lang === "en" ? "Affiliate Portal" : "Cổng cộng tác viên"}</p>
          </div>
        </div>
      </div>
      <SidebarControls />
    </aside>
  );
}

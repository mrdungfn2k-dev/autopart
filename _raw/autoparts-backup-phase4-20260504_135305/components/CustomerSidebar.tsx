"use client";
import { getAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useState, useEffect } from "react";
import SidebarControls from "@/components/SidebarControls";
import LogoImage from "@/components/LogoImage";

const NAV_ICON: Record<string, string> = {
  "/customer":               "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  "/customer/orders":        "M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z",
  "/customer/wishlist":      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  "/customer/address":       "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  "/customer/garage":        "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
  "/customer/rewards":       "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  "/customer/reviews":       "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z",
  "/customer/returns":       "M19 7l-8 5-8-5V5l8 5 8-5v2zm0 0v12H5V7",
  "/customer/warranty":      "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
  "/customer/profile":       "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  "/customer/settings":      "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
};

export default function CustomerSidebar({
 active }: { active: string }) {
  const { t } = useLang();
  const [user, setUser] = useState<{name?: string, email?: string, avatar?: string} | null>(null);
  useEffect(() => {
    setUser(getAuth());
    const handler = () => setUser(getAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  const menuItems = [
    { label: t("customerDashboard"), href: "/customer" },
    { label: t("customerOrders"),    href: "/customer/orders" },
    { label: t("wishlist"),          href: "/customer/wishlist" },
    { label: t("addressBook"),       href: "/customer/address" },
    { label: t("customerGarage"),    href: "/customer/garage" },
    { label: t("customerRewards"),   href: "/customer/rewards" },
    { label: t("customerReviews"),   href: "/customer/reviews" },
    { label: t("myReturns"),         href: "/customer/returns" },
    { label: t("customerWarranty"),  href: "/customer/warranty" },
    { label: t("customerProfile"),   href: "/customer/profile" },
    { label: t("customerSettings"),  href: "/customer/settings" },
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
          const isActive = item.href === active;
          const icon = NAV_ICON[item.href];
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
        <Link href="/customer/profile" className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ background: "var(--ap-primary)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          {t('contactSupport')}
        </Link>
      </div>
      <SidebarControls />
    </aside>
  );
}

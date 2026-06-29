"use client";
import { useLang } from "@/lib/i18n";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SidebarControls from "@/components/SidebarControls";
import LogoImage from "@/components/LogoImage";

export default function SupplierSidebar({ active }: { active?: string }) {
  const { t, lang } = useLang();
  const pathname = usePathname();
  const cur = active || pathname || "/supplier";
  const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string; supplierId?: string } | null>(null);
  const [shopName, setShopName] = useState<string>(""); // tên công khai (suppliers.json) — đồng bộ với phía khách
  useEffect(() => {
    setUser(getAuth());
    const handler = () => setUser(getAuth());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);
  // Lấy supplierId từ server (đọc lại users.json theo cookie) → hiện TÊN CÔNG KHAI (suppliers.json),
  // đồng bộ với phía khách. Chạy được cả với phiên đăng nhập cũ (không cần đăng nhập lại).
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const sid = d?.user?.supplierId;
        if (!sid) return;
        return fetch(`/api/suppliers/${sid}`).then(r => r.ok ? r.json() : null).then(s => { if (s?.name) setShopName(s.name); });
      }).catch(() => {});
  }, []);
  const displayName = shopName || user?.name || "User";

  const menuItems = [
    { label: t("supplierDashboard"), href: "/supplier" },
    { label: t("supplierOrders"), href: "/supplier/orders" },
    { label: lang === "zh" ? "消息" : "Tin nhắn", href: "/supplier/messages" },
    { label: t("supplierProducts"), href: "/supplier/products" },
    { label: t("supplierInventory"), href: "/supplier/inventory" },
    { label: t("supplierFinance"), href: "/supplier/finance" },
    { label: lang === "zh" ? "分析" : "Phân tích", href: "/supplier/analytics" },
    { label: t("supplierSettings"), href: "/supplier/settings" },
    { label: lang === "zh" ? "个人资料" : "Hồ sơ cá nhân", href: "/supplier/profile" },
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
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-600 bg-gradient-to-br from-[#1a4b97] to-[#0d2d5e] flex flex-shrink-0 items-center justify-center text-white text-sm font-bold shadow-sm">{user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (displayName.charAt(0).toUpperCase() || "A")}</div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{displayName}</p>
            <p className="text-[#1a4b97] text-xs">{lang === "en" ? "Supplier Portal" : "Cổng nhà cung cấp"}</p>
          </div>
        </div>
      </div>
      <SidebarControls />
    </aside>
  );
}

"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAuth } from "@/lib/auth";

/** Chế độ bảo trì: khi admin bật ở Cài đặt → Tính năng, khách thấy trang bảo trì.
 *  Admin + các trang /admin, /login, /register vẫn vào được để tắt bảo trì. */
export default function MaintenanceGate() {
  const pathname = usePathname() || "";
  const [maint, setMaint] = useState(false);
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    const check = () => {
      try { setRole(getAuth()?.role); } catch { setRole(undefined); }
      fetch("/api/settings", { cache: "no-store" })
        .then(r => r.json())
        .then(d => setMaint(!!d?.features?.maintenanceMode))
        .catch(() => {});
    };
    check();
    const t = setInterval(check, 30000); // tắt bảo trì xong khách được vào lại trong ~30s
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, [pathname]);

  const bypass = pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register");
  if (!maint || bypass || role === "admin") return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "var(--ap-sidebar-bg, #0d1f3b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 56, marginBottom: 18 }}>🛠️</div>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 14 }}>Website đang bảo trì</h1>
      <p style={{ maxWidth: 480, opacity: 0.85, lineHeight: 1.6 }}>
        AutoParts đang được nâng cấp để phục vụ bạn tốt hơn.<br />Vui lòng quay lại sau ít phút. Xin cảm ơn!
      </p>
    </div>
  );
}

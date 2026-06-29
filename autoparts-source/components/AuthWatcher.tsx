"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";

// Theo dõi phiên đăng nhập: nếu admin KHÓA tài khoản trong lúc người dùng đang online
// → popup thông báo + đăng xuất + đưa về /login (poll mỗi 20s + khi đổi trang).
export default function AuthWatcher() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (!getAuth()) return;
    if (/^\/(login|register)(\/|$)/.test(pathname)) return;
    let stopped = false;

    const check = async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const d = await r.json();
        if (stopped || !getAuth()) return;
        if (d.user === null || d.active === false) {
          const msg = d.active === false
            ? "Tài khoản của bạn đã bị khóa. Bạn sẽ được đăng xuất."
            : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: msg, type: "warning" } }));
          clearAuth();
          document.cookie = "ap_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setTimeout(() => { window.location.href = "/login"; }, 1600);
        }
      } catch { /* bỏ qua lỗi mạng tạm thời */ }
    };

    check();
    const t = setInterval(check, 20000);
    return () => { stopped = true; clearInterval(t); };
  }, [pathname]);

  return null;
}

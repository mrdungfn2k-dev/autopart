"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getAuth } from "@/lib/auth";

/**
 * ScrollRestoration — Cross-device scroll sync
 *
 * - User đã đăng nhập → lưu/lấy scroll position từ server API (/api/scroll)
 *   → hoạt động đồng bộ giữa mọi thiết bị với cùng tài khoản
 * - Chưa đăng nhập → dùng sessionStorage (chỉ trong tab hiện tại)
 *
 * Khi deploy thực tế: chỉ cần swap storage trong app/api/scroll/route.ts
 */
export default function ScrollRestoration() {
  const pathname = usePathname();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Khôi phục scroll khi vào trang ────────────────────────────────────────
  useEffect(() => {
    const user = getAuth();

    if (user?.email) {
      // User đã đăng nhập → lấy từ server
      fetch(`/api/scroll?email=${encodeURIComponent(user.email)}&path=${encodeURIComponent(pathname)}`)
        .then(r => r.ok ? r.json() : null)
        .then((data: { scrollY: number | null } | null) => {
          if (data?.scrollY != null) {
            const restore = () => window.scrollTo({ top: data.scrollY!, behavior: "instant" });
            restore();
            setTimeout(restore, 150); // retry sau khi lazy content load
          }
        })
        .catch(() => {
          // fallback: sessionStorage
          const saved = sessionStorage.getItem(`scroll_${pathname}`);
          if (saved) window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
        });
    } else {
      // Chưa đăng nhập → sessionStorage
      const saved = sessionStorage.getItem(`scroll_${pathname}`);
      if (saved) {
        const restore = () => window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
        restore();
        setTimeout(restore, 150);
      }
    }
  }, [pathname]);

  // ─── Lưu scroll khi user cuộn ───────────────────────────────────────────────
  useEffect(() => {
    const user = getAuth();

    const saveScroll = () => {
      const y = Math.round(window.scrollY);

      if (user?.email) {
        // Debounce: không gửi API liên tục khi đang cuộn
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          fetch("/api/scroll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, path: pathname, scrollY: y }),
          }).catch(() => {
            // Fallback: sessionStorage nếu server không phản hồi
            sessionStorage.setItem(`scroll_${pathname}`, String(y));
          });
        }, 800);
      } else {
        sessionStorage.setItem(`scroll_${pathname}`, String(y));
      }
    };

    // Lưu khi scroll
    window.addEventListener("scroll", saveScroll, { passive: true });
    // Lưu định kỳ mỗi 10s (tránh mất dữ liệu nếu đột ngột đóng tab)
    intervalRef.current = setInterval(saveScroll, 10_000);
    // Lưu ngay trước khi reload / đóng tab
    window.addEventListener("beforeunload", saveScroll);

    return () => {
      window.removeEventListener("scroll", saveScroll);
      window.removeEventListener("beforeunload", saveScroll);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      // Lưu ngay khi navigate sang trang khác
      saveScroll();
    };
  }, [pathname]);

  return null;
}

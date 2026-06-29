"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REF_KEY = "ap_aff_ref";        // mã ref đang theo dõi (để gán đơn hàng sau)
const REF_TS_KEY = "ap_aff_ref_ts";  // thời điểm bắt đầu theo dõi

/**
 * Theo dõi lượt click affiliate THẬT.
 * Khi khách mở 1 URL có ?ref=CODE: ghi nhận +1 click (1 lần/phiên/ref) và lưu ref
 * vào localStorage để gán đơn hàng nếu khách mua trong 30 ngày (xem app/checkout).
 * Không hiển thị gì — chỉ chạy ngầm.
 */
export default function AffiliateRefTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === "undefined") return;
    let ref = "";
    try { ref = new URLSearchParams(window.location.search).get("ref") || ""; } catch { return; }
    if (!ref || !/^[A-Za-z0-9_]{2,40}$/.test(ref)) return;

    // Lưu ref cho việc gán đơn hàng (ghi đè bằng ref mới nhất khách bấm vào)
    try {
      localStorage.setItem(REF_KEY, ref);
      localStorage.setItem(REF_TS_KEY, String(Date.now()));
    } catch {}

    // Chỉ tính 1 click/phiên/ref để tránh đếm trùng khi chuyển trang
    const seenKey = "ap_aff_click_" + ref;
    try { if (sessionStorage.getItem(seenKey)) return; } catch {}
    fetch("/api/affiliate-links/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, type: "click" }),
    }).then(() => { try { sessionStorage.setItem(seenKey, "1"); } catch {} }).catch(() => {});
  }, [pathname]);

  return null;
}

"use client";
import { useEffect } from "react";

// Khung cố định 100%. Người dùng chỉ được zoom trong khoảng 80%–120%.
// Chặn zoom của trình duyệt qua Ctrl+lăn chuột / Ctrl +/-/0, áp zoom tuỳ biến đã kẹp [0.8, 1.2].
export default function ZoomGuard() {
  useEffect(() => {
    const MIN = 0.8, MAX = 1.2, STEP = 0.1;
    let zoom = 1;
    const round2 = (z: number) => Math.round(z * 100) / 100;
    const clamp = (z: number) => Math.min(MAX, Math.max(MIN, round2(z)));
    const apply = () => { (document.documentElement.style as any).zoom = zoom === 1 ? "" : String(zoom); };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;       // chỉ can thiệp khi đang zoom (Ctrl + lăn / pinch trackpad)
      e.preventDefault();
      zoom = clamp(zoom + (e.deltaY < 0 ? STEP : -STEP));
      apply();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "+" || e.key === "=") { e.preventDefault(); zoom = clamp(zoom + STEP); apply(); }
      else if (e.key === "-" || e.key === "_") { e.preventDefault(); zoom = clamp(zoom - STEP); apply(); }
      else if (e.key === "0") { e.preventDefault(); zoom = 1; apply(); }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}

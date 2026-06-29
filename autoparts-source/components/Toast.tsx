"use client";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

// Hook cho code mới: const toast = useToast(); toast("Đã lưu!", "success")
export function useToast() {
  return (message: string, type: ToastType = "info") => {
    if (typeof window !== "undefined")
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
  };
}

function guessType(msg: string): ToastType {
  const m = (msg || "").toLowerCase();
  if (/(thành công|đã lưu|đã xóa|đã thêm|cập nhật|hoàn tất|success|✓)/.test(m)) return "success";
  if (/(lỗi|thất bại|error|fail|không thể|không đúng|sai |sai$)/.test(m)) return "error";
  if (/(vui lòng|chưa |thiếu|bắt buộc|cảnh báo|warning|phải |tối thiểu)/.test(m)) return "warning";
  return "info";
}

interface Item { id: number; message: string; type: ToastType; }
const STYLE: Record<ToastType, { bar: string; icon: string }> = {
  success: { bar: "#22C55E", icon: "✓" },
  error:   { bar: "#EF4444", icon: "✕" },
  warning: { bar: "#F59E0B", icon: "!" },
  info:    { bar: "var(--ap-primary)", icon: "i" },
};

export default function Toaster() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let n = 0;
    const push = (message: string, type: ToastType) => {
      if (!message) return;
      const id = ++n;
      setItems(s => [...s, { id, message, type }]);
      // Tự ẩn sau 5s (áp dụng toàn hệ thống)
      setTimeout(() => setItems(s => s.filter(x => x.id !== id)), 5000);
    };
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      push(String(d.message ?? ""), (d.type as ToastType) || "info");
    };
    window.addEventListener("app-toast", handler);
    // Chuyển mọi alert() mặc định của trình duyệt thành thông báo nổi đồng bộ
    const orig = window.alert;
    window.alert = (msg?: unknown) => push(String(msg ?? ""), guessType(String(msg ?? "")));
    return () => {
      window.removeEventListener("app-toast", handler);
      window.alert = orig;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
      {items.map(it => {
        const s = STYLE[it.type];
        return (
          <div
            key={it.id}
            className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[#f0f0f0] pl-3 pr-3 py-3 flex items-center gap-3 min-w-[280px] max-w-[380px]"
            style={{ borderLeft: `4px solid ${s.bar}`, animation: "apToastIn .25s ease" }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ background: s.bar }}>{s.icon}</div>
            <p className="text-sm text-[#44494d] font-medium flex-1 leading-snug">{it.message}</p>
            <button onClick={() => setItems(s2 => s2.filter(x => x.id !== it.id))} className="text-[#b3b3b3] hover:text-[#44494d] shrink-0 text-lg leading-none">×</button>
          </div>
        );
      })}
      <style jsx global>{`@keyframes apToastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}

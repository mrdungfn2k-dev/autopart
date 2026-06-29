"use client";
import { useEffect, useState } from "react";

type Opts = { title?: string; confirmText?: string; cancelText?: string; danger?: boolean };
let resolver: ((v: boolean) => void) | null = null;

// Popup xác nhận tuỳ biến (thay confirm() của trình duyệt).
// Dùng: confirmDialog("Xoá mục này?").then(ok => { if (ok) ... })  hoặc  if (await confirmDialog("..."))
export function confirmDialog(message: string, opts: Opts = {}): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise((resolve) => {
    resolver = resolve;
    window.dispatchEvent(new CustomEvent("app-confirm", { detail: { message, ...opts } }));
  });
}

export default function ConfirmHost() {
  const [state, setState] = useState<({ message: string } & Opts) | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setState((e as CustomEvent).detail);
    window.addEventListener("app-confirm", handler);
    return () => window.removeEventListener("app-confirm", handler);
  }, []);

  const close = (v: boolean) => {
    setState(null);
    if (resolver) { resolver(v); resolver = null; }
  };

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4" onClick={() => close(false)}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-[#44494d] text-base mb-2">{state.title || "Xác nhận"}</h3>
        <p className="text-sm text-[#607080] mb-5 leading-relaxed">{state.message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => close(false)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">{state.cancelText || "Huỷ"}</button>
          <button onClick={() => close(true)} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: state.danger === false ? "var(--ap-primary)" : "#EF4444" }}>{state.confirmText || "Đồng ý"}</button>
        </div>
      </div>
    </div>
  );
}

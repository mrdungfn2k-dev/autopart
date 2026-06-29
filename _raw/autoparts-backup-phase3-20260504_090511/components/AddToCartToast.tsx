"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

interface ToastInfo { name: string; image?: string; }

// Global event-based toast: dispatch "add-to-cart-toast" CustomEvent with detail { name, image }
export function useAddToCartToast() {
  return (name: string, image?: string) => {
    window.dispatchEvent(new CustomEvent("add-to-cart-toast", { detail: { name, image } }));
  };
}

export default function AddToCartToast() {
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastInfo>).detail;
      setToast(detail);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(t);
    };
    window.addEventListener("add-to-cart-toast", handler);
    return () => window.removeEventListener("add-to-cart-toast", handler);
  }, []);

  if (!toast) return null;

  return (
    <div
      className="fixed top-20 right-4 z-[999] transition-all duration-300"
      style={{
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 20px))",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-[#f0f0f0] p-4 flex items-center gap-3 min-w-[300px] max-w-[340px]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--ap-primary)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h14v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-green-600 mb-0.5">✓ {t('addToCart')}</p>
          <p className="text-sm text-[#44494d] font-medium truncate">{toast.name}</p>
        </div>
        <Link
          href="/cart"
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
          style={{ background: "var(--ap-primary)" }}
        >
          {t('cart')}
        </Link>
      </div>
    </div>
  );
}

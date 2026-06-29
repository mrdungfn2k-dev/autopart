"use client";

import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; flag: string; label: string; native: string }[] = [
  { code: "vi", flag: "VN", label: "Tiếng Việt", native: "VI" },
  { code: "en", flag: "GB", label: "English", native: "EN" },
  { code: "zh", flag: "CN", label: "简体中文", native: "中文" },
];

export default function LangSwitcher({ dropUp = false }: { dropUp?: boolean }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" data-no-translate style={{ zIndex: 100 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all select-none"
        style={{
          background: open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          whiteSpace: "nowrap",
        }}
        title="Chọn ngôn ngữ"
      >
        <span className="text-[11px] font-bold leading-none">{current.flag}</span>
        <span className="font-semibold text-xs">{current.native}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          style={{ opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute ${dropUp ? "bottom-full mb-1.5 left-0" : "top-full mt-1.5 right-0"} min-w-[160px] rounded-xl overflow-hidden shadow-xl`}
          style={{
            background: "var(--ap-sidebar-bg)",
            border: "1px solid rgba(255,255,255,0.12)",
            animation: "fadeInDown 0.15s ease",
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left"
              style={{
                color: l.code === lang ? "var(--ap-primary)" : "#CBD5E1",
                background: l.code === lang ? "rgba(249,115,22,0.08)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (l.code !== lang) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (l.code !== lang) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span className="text-[11px] font-bold min-w-5">{l.flag}</span>
              <div>
                <div className="font-semibold text-xs leading-tight">{l.native}</div>
                <div className="text-xs opacity-60 leading-tight">{l.label}</div>
              </div>
              {l.code === lang && (
                <svg className="ml-auto" width="12" height="12" viewBox="0 0 12 12" fill="var(--ap-primary)">
                  <path d="M2 6l3 3 5-5" stroke="var(--ap-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { clearAuth } from "@/lib/auth";
import LangSwitcher from "@/components/LangSwitcher";
import { useLang } from "@/lib/i18n";

/** Logout + LangSwitcher — place at the bottom of any portal sidebar */
export default function SidebarControls() {
  const { t } = useLang();
  return (
    <div className="p-4 border-t border-[#2f3336] flex items-center gap-2">
      <LangSwitcher dropUp />
      <button
        onClick={() => {
          clearAuth();
          document.cookie = "ap_token=; path=/; max-age=0";
          window.location.href = "/login";
        }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EF4444"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)"; (e.currentTarget as HTMLElement).style.color = "#F87171"; }}
      >
        {t('logout')}
      </button>
    </div>
  );
}

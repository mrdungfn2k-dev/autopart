"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Bộ MXH chuẩn — icon LẤY THEO TÊN (không phụ thuộc path lưu cũ có thể 404).
// Admin chỉ chỉnh URL ở /admin/settings → tab Chân trang.
const STANDARD = [
  { name: "Facebook",  icon: "/ap-assets/icon_fb.svg",     bg: "#1877F2", def: "https://www.facebook.com/" },
  { name: "YouTube",   icon: "/ap-assets/icon_utube.svg",  bg: "#FF0000", def: "https://www.youtube.com/" },
  { name: "TikTok",    icon: "/ap-assets/icon_tiktok.svg", bg: "#111111", def: "https://www.tiktok.com/" },
  { name: "Zalo",      icon: "/ap-assets/icon_zalo.svg",   bg: "#0068FF", def: "https://zalo.me/" },
  { name: "Instagram", icon: "/ap-assets/icon_ig.svg",     bg: "#E4405F", def: "https://www.instagram.com/" },
];

export default function SocialBar() {
  const pathname = usePathname() || "";
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then(r => r.json()).catch(() => null),
      fetch("/api/channels").then(r => r.json()).catch(() => []),
    ]).then(([d, channels]) => {
      const map: Record<string, string> = {};
      // 1) Link MXH ở Cài đặt → Chân trang
      const links = d?.footer?.socialLinks;
      if (Array.isArray(links)) for (const l of links) if (l && l.name && l.url) map[l.name] = l.url;
      // 2) Kênh bán (Marketing → Kênh bán) — URL kênh MXH ưu tiên ghi đè theo tên/mã
      if (Array.isArray(channels)) for (const c of channels) {
        if (!c || !c.url) continue;
        const hay = (String(c.name || "") + " " + String(c.code || "")).toLowerCase();
        const match = STANDARD.find(s => hay.includes(s.name.toLowerCase()));
        if (match) map[match.name] = c.url;
      }
      setUrls(map);
    }).catch(() => {});
  }, []);

  // Ẩn thanh MXH ở khu đăng nhập (admin/customer/supplier/affiliate) — chỉ hiện ở storefront
  if (/^\/(admin|customer|supplier|affiliate)(\/|$)/.test(pathname)) return null;

  const base = "w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white font-bold transition-transform hover:scale-110 hover:-translate-x-0.5";

  return (
    <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-2">
      {STANDARD.map((s) => {
        // URL admin đặt; nếu chưa đặt thì dùng URL mặc định -> icon luôn rõ + bấm được
        const url = (urls[s.name] || "").trim() || s.def;
        return (
          <a key={s.name} href={url} target="_blank" rel="noopener noreferrer" title={s.name} aria-label={s.name}
            className={base} style={{ background: s.bg }}>
            <img src={s.icon} alt={s.name} className="w-6 h-6 object-contain"
              onError={(e) => { const img = e.currentTarget; img.style.display = "none"; const sib = img.nextElementSibling as HTMLElement | null; if (sib) sib.style.display = "block"; }} />
            <span style={{ display: "none" }}>{s.name.charAt(0)}</span>
          </a>
        );
      })}
    </div>
  );
}

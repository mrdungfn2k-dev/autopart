"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { getAuth } from "@/lib/auth";

type Notif = { id: string; type: string; title: string; time: string; link: string };
const SEEN_KEY = "ap_notif_seen";

/** Chuông thông báo dùng chung cho cả 4 phân quyền (admin/customer/supplier/affiliate).
 *  Gom thông báo THẬT từ /api/notifications (tin nhắn, đơn hàng, phê duyệt) + popup khi có cái mới. */
export default function NotificationBell({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname() || "";
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string>("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [authed, setAuthed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const knownIds = useRef<Set<string> | null>(null); // null = chưa load lần đầu

  useEffect(() => { setAuthed(!!getAuth()); }, [pathname]);
  // inline = nhúng vào header storefront (khách đang mua sắm vẫn thấy chuông); else = nổi cố định ở khu phân quyền
  const show = inline ? authed : /^\/(admin|customer|supplier|affiliate)(\/|$)/.test(pathname);

  useEffect(() => {
    try {
      setSeen(localStorage.getItem(SEEN_KEY) || "");
      const del = JSON.parse(localStorage.getItem("ap_notif_deleted") || "[]");
      setDeletedIds(new Set(del));
    } catch {}
  }, [pathname]);

  useEffect(() => {
    if (!show || !getAuth()) return;
    const load = () => fetch("/api/notifications", { credentials: "include", cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const list: Notif[] = Array.isArray(d?.items) ? d.items : [];
        setItems(list);
        // Popup khi có thông báo MỚI (sau lần load đầu)
        if (knownIds.current) {
          const fresh = list.filter(n => !knownIds.current!.has(n.id));
          if (fresh.length) {
            const msg = fresh.length === 1 ? fresh[0].title : `Bạn có ${fresh.length} thông báo mới`;
            try { window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "🔔 " + msg, type: "info" } })); } catch {}
          }
        }
        knownIds.current = new Set(list.map(n => n.id));
      }).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, [show, pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!show) return null;

  const activeItems = items.filter(n => !deletedIds.has(n.id));
  const unread = activeItems.filter(n => (n.time || "") > seen).length;
  
  const markSeen = () => { const now = new Date().toISOString(); try { localStorage.setItem(SEEN_KEY, now); } catch {} setSeen(now); };
  const toggle = () => setOpen(o => !o);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const next = new Set(deletedIds);
    next.add(id);
    setDeletedIds(next);
    try { localStorage.setItem("ap_notif_deleted", JSON.stringify(Array.from(next))); } catch {}
  };

  const rel = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso); if (isNaN(d.getTime())) return "";
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return d.toLocaleDateString("vi-VN");
  };
  const ICON: Record<string, string> = { message: "💬", order: "🛒", approval: "✅", info: "🔔" };

  return (
    <div ref={ref} className={inline ? "relative inline-flex" : "fixed top-3 right-4 z-[60]"}>
      <button onClick={toggle} aria-label="Thông báo" title="Thông báo"
        className="relative w-9 h-9 rounded-full bg-white shadow-md border border-[#e5e5e5] flex items-center justify-center hover:bg-[#f8f8fa] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8f9294" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-auto bg-white rounded-xl shadow-2xl border border-[#e5e5e5]">
          <div className="px-4 py-3 border-b border-[#f0f0f0] font-bold text-[#44494d] text-sm flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <span>Thông báo</span>
              {activeItems.length > 0 && <span className="text-xs font-normal text-[#8f9294]">{activeItems.length} mục</span>}
            </div>
            {activeItems.length > 0 && (
              <button onClick={(e) => { e.preventDefault(); markSeen(); }} className="text-xs font-semibold text-[#1a4b97] hover:underline">
                Đọc tất cả
              </button>
            )}
          </div>
          {activeItems.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#8f9294]">Chưa có thông báo nào</div>
          ) : activeItems.map(n => (
            <a key={n.id} href={n.link} onClick={() => setOpen(false)}
              className="group flex gap-3 px-4 py-3 border-b border-[#f7f7f7] hover:bg-[#f8f8fa] transition-colors last:border-0 items-center relative">
              <span className="text-lg shrink-0">{ICON[n.type] || "🔔"}</span>
              <div className="min-w-0 flex-1 pr-6">
                <p className="text-sm text-[#44494d] leading-snug break-words">{n.title}</p>
                <p className="text-xs text-[#8f9294] mt-0.5">{rel(n.time)}</p>
              </div>
              <button onClick={(e) => handleDelete(e, n.id)}
                className="absolute right-4 p-1.5 rounded-md text-[#b3b3b3] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Xóa thông báo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

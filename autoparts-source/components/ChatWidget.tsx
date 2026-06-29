"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { getAuth } from "@/lib/auth";

type Msg = { from: "user" | "peer"; text: string; at: string; image?: string };
type Conv = {
  id: string; peerType: "admin" | "supplier"; peerId: string; peerName: string;
  messages: Msg[]; unreadForUser: number; updatedAt: string;
};

// Box chat nổi góc phải cho KHÁCH: nhắn với "Hỗ trợ AutoParts" (admin) hoặc với NCC (qua nút Chat Ngay).
export default function ChatWidget() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState<{ role?: string } | null>(null);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [pendingPeer, setPendingPeer] = useState<{ peerType: "admin" | "supplier"; peerId: string; peerName: string } | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const loggedIn = !!auth;
  useEffect(() => { setAuth(getAuth()); }, [pathname]);

  // Ẩn ở khu quản trị + trang đăng nhập/đăng ký; cũng ẩn nếu đang đăng nhập vai trò admin/NCC/đại lý (họ có hộp thư riêng)
  const hidden = /^\/(admin|supplier|affiliate|login|register)(\/|$)/.test(pathname)
    || (!!auth && auth.role !== "customer");

  const load = useCallback(async () => {
    if (!getAuth()) return;
    try {
      const r = await fetch("/api/messages", { cache: "no-store" });
      if (r.ok) { const d = await r.json(); setConvs(Array.isArray(d) ? d : []); }
    } catch { /* ignore */ }
  }, []);

  // Mở chat từ nút "Chat Ngay"
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      if (!getAuth()) {
        window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Vui lòng đăng nhập để nhắn tin.", type: "info" } }));
        setTimeout(() => { window.location.href = "/login?from=" + encodeURIComponent(location.pathname); }, 800);
        return;
      }
      setActive(null);
      setPendingPeer({ peerType: d.peerType === "supplier" ? "supplier" : "admin", peerId: (d.peerId || "admin").toString(), peerName: (d.peerName || "Hỗ trợ AutoParts").toString() });
      setOpen(true);
    };
    window.addEventListener("open-chat", handler as EventListener);
    return () => window.removeEventListener("open-chat", handler as EventListener);
  }, []);

  // Nạp + poll khi mở
  useEffect(() => {
    if (!open || !getAuth()) return;
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [open, load]);

  // Gắn pendingPeer vào hội thoại có sẵn (nếu có)
  useEffect(() => {
    if (!pendingPeer) return;
    const ex = convs.find(c => c.peerType === pendingPeer.peerType && c.peerId === pendingPeer.peerId);
    if (ex) { setActive(ex); setPendingPeer(null); }
  }, [pendingPeer, convs]);

  // Đồng bộ active với dữ liệu mới khi poll
  useEffect(() => {
    if (!active) return;
    const fresh = convs.find(c => c.id === active.id);
    if (fresh && fresh.messages.length !== active.messages.length) setActive(fresh);
  }, [convs, active]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages?.length, open]);

  if (hidden) return null;

  const totalUnread = convs.reduce((a, c) => a + (c.unreadForUser || 0), 0);

  const send = async (overrideText?: string, imgBase64?: string) => {
    const text = overrideText ?? draft.trim();
    if (!text && !imgBase64) return;
    if (!getAuth()) { window.location.href = "/login"; return; }
    const payload = active ? { conversationId: active.id }
      : pendingPeer ? { peerType: pendingPeer.peerType, peerId: pendingPeer.peerId, peerName: pendingPeer.peerName }
      : { peerType: "admin" as const };
    if (!overrideText) setDraft("");
    try {
      const r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, text, image: imgBase64 }) });
      if (r.ok) { const c = await r.json(); setActive(c); setPendingPeer(null); load(); }
    } catch { /* ignore */ }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      send("[Hình ảnh]", b64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const startAdmin = () => {
    const a = convs.find(c => c.peerType === "admin");
    if (a) setActive(a);
    else setPendingPeer({ peerType: "admin", peerId: "admin", peerName: "Hỗ trợ AutoParts" });
  };

  const thread = active ? active.messages : [];
  const header = active ? active.peerName : pendingPeer ? pendingPeer.peerName : "Tin nhắn";

  return (
    <>
      {/* Nút nổi */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Mở chat"
          className="fixed z-[1000] bottom-5 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
          style={{ background: "var(--ap-primary)" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
          {totalUnread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">{totalUnread}</span>}
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed z-[1000] bottom-5 right-5 w-[92vw] max-w-[360px] h-[520px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-[#e5e5e5] flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 text-white shrink-0" style={{ background: "var(--ap-primary)" }}>
            {(active || pendingPeer) && (
              <button onClick={() => { setActive(null); setPendingPeer(null); }} className="hover:opacity-80" aria-label="Quay lại">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            )}
            <span className="font-bold text-sm flex-1 truncate">{header}</span>
            <button onClick={() => setOpen(false)} className="hover:opacity-80 text-xl leading-none" aria-label="Đóng">×</button>
          </div>

          {!loggedIn ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-[#8f9294]">Đăng nhập để nhắn tin với hỗ trợ và nhà cung cấp.</p>
              <a href={"/login?from=" + encodeURIComponent(pathname)} className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>Đăng nhập</a>
            </div>
          ) : (active || pendingPeer) ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#f8f8fa]">
                {thread.length === 0 && <p className="text-center text-xs text-[#8f9294] mt-4">Hãy gửi tin nhắn đầu tiên 👋</p>}
                {thread.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${m.from === "user" ? "text-white rounded-br-sm" : "bg-white border border-[#eee] text-[#44494d] rounded-bl-sm"}`}
                      style={m.from === "user" ? { background: "var(--ap-primary)" } : {}}>
                      {m.image && <img src={m.image} alt="uploaded" className="max-w-full rounded-md mb-1 cursor-pointer" />}
                      {m.text}
                    </div>
                  </div>
                ))}
                {(() => {
                  const last = thread[thread.length - 1];
                  if (!last || last.from !== "user" || !active) return null;
                  const seen = (((active as any).unreadForPeer) ?? 1) === 0;
                  return <div className="text-right text-[10px] text-[#8f9294] pr-1">{seen ? "✓✓ Đã xem" : "✓ Đã nhận"}</div>;
                })()}
                <div ref={endRef} />
              </div>
              <div className="p-2.5 border-t border-[#f0f0f0] flex items-center gap-2 shrink-0">
                <label className="w-9 h-9 flex items-center justify-center text-[#8f9294] cursor-pointer hover:text-[#1a4b97]">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </label>
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                  placeholder="Nhập tin nhắn..." className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-full text-sm focus:outline-none focus:border-[#1a4b97]" />
                <button onClick={() => send()} className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: "var(--ap-primary)" }} aria-label="Gửi">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <button onClick={startAdmin} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f8fa] border-b border-[#f0f0f0] text-left">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: "var(--ap-primary)" }}>AP</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-[#44494d] text-sm">Hỗ trợ AutoParts</p><p className="text-xs text-[#8f9294] truncate">Đội ngũ CSKH · phản hồi nhanh</p></div>
              </button>
              {convs.filter(c => c.peerType === "supplier").map(c => (
                <button key={c.id} onClick={() => setActive(c)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f8fa] border-b border-[#f0f0f0] text-left">
                  <div className="w-10 h-10 rounded-full bg-[#eef2ff] text-[#1a4b97] flex items-center justify-center font-bold shrink-0">{c.peerName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#44494d] text-sm truncate">{c.peerName}</p>
                    <p className="text-xs text-[#8f9294] truncate">{c.messages[c.messages.length - 1]?.text || ""}</p>
                  </div>
                  {c.unreadForUser > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{c.unreadForUser}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

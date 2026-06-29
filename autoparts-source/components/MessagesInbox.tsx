"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/lib/i18n";

type Msg = { from: "user" | "peer"; text: string; at: string; image?: string };
type Conv = {
  id: string; userName: string; userEmail?: string; peerName: string;
  messages: Msg[]; unreadForPeer: number; updatedAt: string;
};

// Hộp thư dùng chung cho admin & NCC: đọc + trả lời tin nhắn của khách.
export default function MessagesInbox({ title }: { title: string }) {
  const { lang } = useLang();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try { const r = await fetch("/api/messages", { cache: "no-store" }); if (r.ok) { const d = await r.json(); setConvs(Array.isArray(d) ? d : []); } } catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeId, convs]);

  const active = convs.find(c => c.id === activeId) || null;

  const send = async (overrideText?: string, imgBase64?: string) => {
    const text = overrideText ?? draft.trim(); if (!text && !imgBase64 || !active) return;
    if (!overrideText) setDraft("");
    try { const r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: active.id, text, image: imgBase64 }) }); if (r.ok) load(); } catch { /* ignore */ }
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

  return (
    <main className="flex-1 overflow-hidden flex flex-col">
      <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10 px-6 h-16 flex items-center shrink-0">
        <h1 className="text-xl font-bold text-[#44494d]">{lang === "zh" ? "客户消息" : lang === "en" ? "Customer messages" : title}</h1>
        <span className="ml-3 text-xs text-[#8f9294]">{convs.length} {lang === "zh" ? "个对话" : lang === "en" ? "conversations" : "hội thoại"}</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Danh sách hội thoại */}
        <div className="w-[300px] border-r border-[#f0f0f0] overflow-y-auto bg-white shrink-0">
          {convs.length === 0 && <p className="p-6 text-sm text-[#8f9294] text-center">{lang === "zh" ? "暂无消息。" : lang === "en" ? "No messages yet." : "Chưa có tin nhắn nào."}</p>}
          {convs.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-[#f5f5f5] hover:bg-[#f8f8fa] transition-colors ${activeId === c.id ? "bg-[#eef2ff]" : ""}`}>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#44494d] text-sm flex-1 truncate">{c.userName}</p>
                {c.unreadForPeer > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{c.unreadForPeer}</span>}
              </div>
              <p className="text-xs text-[#8f9294] truncate mt-0.5">{c.messages[c.messages.length - 1]?.text || ""}</p>
            </button>
          ))}
        </div>
        {/* Khung trò chuyện */}
        <div className="flex-1 flex flex-col bg-[#f8f8fa] min-w-0">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-[#8f9294] text-sm">{lang === "zh" ? "选择一个对话查看并回复" : lang === "en" ? "Select a conversation to view & reply" : "Chọn một hội thoại để xem & trả lời"}</div>
          ) : (
            <>
              <div className="px-5 py-3 bg-white border-b border-[#f0f0f0] shrink-0">
                <p className="font-bold text-[#44494d]">{active.userName}</p>
                <p className="text-xs text-[#8f9294]">{active.userEmail}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {active.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "peer" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.from === "peer" ? "text-white rounded-br-sm" : "bg-white border border-[#eee] text-[#44494d] rounded-bl-sm"}`}
                      style={m.from === "peer" ? { background: "var(--ap-primary)" } : {}}>
                      {m.image && <img src={m.image} alt="uploaded" className="max-w-full rounded-md mb-1 cursor-pointer" />}
                      {m.text}
                    </div>
                  </div>
                ))}
                {(() => {
                  const msgs = active.messages; const last = msgs[msgs.length - 1];
                  if (!last || last.from !== "peer") return null;
                  const seen = (((active as any).unreadForUser) ?? 1) === 0;
                  return <div className="text-right text-[10px] text-[#8f9294] pr-1">{seen ? (lang === "zh" ? "✓✓ 客户已读" : "✓✓ Khách đã xem") : (lang === "zh" ? "✓ 已发送" : "✓ Đã gửi")}</div>;
                })()}
                <div ref={endRef} />
              </div>
              <div className="p-3 border-t border-[#f0f0f0] bg-white flex items-center gap-2 shrink-0">
                <label className="w-9 h-9 flex items-center justify-center text-[#8f9294] cursor-pointer hover:text-[#1a4b97]">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </label>
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                  placeholder={lang === "zh" ? "输入回复..." : lang === "en" ? "Type a reply..." : "Nhập trả lời..."} className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-full text-sm focus:outline-none focus:border-[#1a4b97]" />
                <button onClick={() => send()} className="px-5 py-2 rounded-full text-white text-sm font-semibold" style={{ background: "var(--ap-primary)" }}>{lang === "zh" ? "发送" : lang === "en" ? "Send" : "Gửi"}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

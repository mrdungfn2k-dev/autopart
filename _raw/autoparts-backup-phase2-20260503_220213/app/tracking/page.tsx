"use client";
import { useState } from "react";
import Link from "next/link";
import LangSwitcher from "@/components/LangSwitcher";
import { useLang } from "@/lib/i18n";
import LogoImage from "@/components/LogoImage";

type OrderStep = { label: string; time: string; done: boolean };

interface TrackingOrder {
  id: string;
  status: string;
  shipping?: { name?: string; phone?: string; city?: string; address?: string; method?: string };
  tracking?: string;
  items?: Array<{ name: string; qty: number; price: number }>;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

function buildSteps(order: TrackingOrder, lang: string, t: (k: string) => string): OrderStep[] {
  const statusOrder = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
  const statusIdx = statusOrder.indexOf(order.status);
  const fmt = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };
  const created = fmt(order.createdAt);
  const updated = fmt(order.updatedAt);

  const steps: OrderStep[] = [
    { label: t('orderSuccess'),       time: created,                        done: statusIdx >= 0 },
    { label: t('supplierConfirmed'),   time: statusIdx >= 1 ? updated : "", done: statusIdx >= 1 },
    { label: t('packing'),             time: statusIdx >= 1 ? updated : "", done: statusIdx >= 1 },
    { label: t('handedOver'),          time: statusIdx >= 2 ? updated : "", done: statusIdx >= 2 },
    { label: t('shipping'),            time: statusIdx >= 2 ? updated : "", done: statusIdx >= 2 },
    { label: t('delivered'),           time: statusIdx >= 3 ? updated : "", done: statusIdx >= 3 },
  ];

  if (order.status === "cancelled") {
    return [
      { label: t('orderSuccess'),   time: created, done: true },
      { label: t('orderCancelled'), time: updated, done: true },
    ];
  }
  return steps;
}

const STATUS_LABEL: Record<string, { vi: string; zh: string; color: string }> = {
  pending:   { vi: "Chờ xác nhận", zh: "待确认",    color: "#F59E0B" },
  confirmed: { vi: "Đã xác nhận",  zh: "已确认",    color: "var(--ap-primary)" },
  shipping:  { vi: "Đang giao",    zh: "配送中",    color: "var(--ap-primary)" },
  delivered: { vi: "Đã giao",      zh: "已送达",    color: "#22C55E" },
  cancelled: { vi: "Đã huỷ",       zh: "已取消",    color: "#EF4444" },
};

export default function TrackingPage() {
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${query.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError(t('orderNotFound'));
      }
    } catch {
      setError(t('systemError'));
    } finally { setLoading(false); }
  };

  const steps = order ? buildSteps(order, lang, t) : [];
  const statusInfo = order ? (STATUS_LABEL[order.status] ?? { vi: order.status, zh: order.status, color: "#8f9294" }) : null;
  const currentStepIdx = steps.findLastIndex(s => s.done);

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e5] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoImage className="h-[18px] w-auto object-contain" />
          </Link>
          <Link href="/customer/orders" className="text-sm text-[#8f9294] hover:text-[#1a4b97]">
            {"< "} {t('myOrders')}
          </Link>
          <LangSwitcher />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search form */}
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-6">
          <h1 className="font-bold text-[#44494d] text-lg mb-1">
            {t('trackOrder')}
          </h1>
          <p className="text-[#8f9294] text-sm mb-4">
            {t('trackOrderDesc')}
          </p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder={t('orderCodePlaceholder')}
              className="flex-1 px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]"
            />
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
              style={{ background: "var(--ap-primary)" }}>
              {loading ? "..." : t('lookUp')}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {order && statusInfo && (
          <>
            {/* Order header */}
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5 mb-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-[#8f9294] mb-0.5">{t('orderCode')}</p>
                  <p className="font-mono font-bold text-[#44494d]">{order.id}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: statusInfo.color + "18", color: statusInfo.color }}>
                  {lang === "zh" ? statusInfo.zh : statusInfo.vi}
                </div>
              </div>
              {order.tracking && (
                <div className="flex gap-4 text-sm">
                  <span className="text-[#8f9294]">{t('trackingCode')}: <span className="font-mono font-semibold text-[#44494d]">{order.tracking}</span></span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-[1fr_300px] gap-5">
              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6">
                <h2 className="font-bold text-[#44494d] mb-5">{t('orderJourney')}</h2>
                <div className="relative">
                  <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-[#f4f4f4]" />
                  <div className="space-y-0">
                    {steps.map((step, i) => {
                      const isActive = i === currentStepIdx;
                      const isPast = i < currentStepIdx;
                      return (
                        <div key={i} className="flex gap-4 pb-5 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done ? "text-white" : "bg-white border-2 border-[#e5e5e5]"}`}
                            style={step.done ? { background: "var(--ap-primary)" } : {}}>
                            {step.done ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            ) : (
                              <span className="text-xs text-slate-300 font-bold">{i + 1}</span>
                            )}
                          </div>
                          <div className={`flex-1 pt-1.5 ${isActive ? "opacity-100" : isPast || step.done ? "opacity-70" : "opacity-30"}`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`font-bold text-sm ${step.done ? "text-[#44494d]" : "text-[#8f9294]"}`}>{step.label}</p>
                              {isActive && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white animate-pulse" style={{ background: "var(--ap-primary)" }}>{t('current')}</span>}
                            </div>
                            {step.time && <p className="text-xs text-[#8f9294]">{step.time}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="space-y-4">
                {/* Delivery info */}
                <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
                  <h3 className="font-bold text-[#44494d] mb-3 text-sm">{t('shippingAddress')}</h3>
                  {order.shipping && (
                    <>
                      <p className="font-semibold text-[#44494d]">{order.shipping.name}</p>
                      <p className="text-sm text-[#8f9294]">{order.shipping.phone}</p>
                      <p className="text-sm text-[#8f9294] mt-1">{order.shipping.address}{order.shipping.city ? `, ${order.shipping.city}` : ""}</p>
                    </>
                  )}
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
                    <h3 className="font-bold text-[#44494d] mb-3 text-sm">{t('product')}</h3>
                    <div className="space-y-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-[#8f9294] shrink-0" style={{ background: "#f8f8fa" }}>SP</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#44494d] truncate">{item.name}</p>
                            <p className="text-xs text-[#8f9294]">x{item.qty}</p>
                          </div>
                          <p className="text-sm font-bold text-[#44494d] shrink-0">{(item.price * item.qty).toLocaleString()}đ</p>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-[#f0f0f0] pt-3 mt-2">
                        <span className="font-bold text-[#44494d] text-sm">{t('total')}</span>
                        <span className="font-extrabold" style={{ color: "var(--ap-primary)" }}>{(order.total ?? 0).toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Link href="/customer/orders"
                    className="w-full py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-slate-600 hover:bg-[#f8f8fa] flex items-center justify-center">{t('viewAllOrders')}</Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!order && !loading && !error && (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--ap-primary)"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            </div>
            <p className="text-[#8f9294] text-sm">{t('enterOrderCodeToTrack')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

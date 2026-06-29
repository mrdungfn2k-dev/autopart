"use client";
import { useState, useEffect } from "react";
import type { Voucher } from "@/lib/api";

interface VoucherSelectorModalProps {
  onClose: () => void;
  onApply: (freeship: string | null, discount: string | null) => void;
  initialFreeship: string | null;
  initialDiscount: string | null;
  subtotal: number;
}

export default function VoucherSelectorModal({ onClose, onApply, initialFreeship, initialDiscount, subtotal }: VoucherSelectorModalProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [freeshipCode, setFreeshipCode] = useState<string | null>(initialFreeship);
  const [discountCode, setDiscountCode] = useState<string | null>(initialDiscount);

  useEffect(() => {
    fetch("/api/vouchers")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          // Filter out inactive vouchers and out of stock ones
          setVouchers(d.filter(v => v.active && v.used < v.limit));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const shippingVouchers = vouchers.filter(v => v.type === "shipping");
  const discountVouchers = vouchers.filter(v => v.type !== "shipping");

  const formatPrice = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  const renderVoucherList = (list: Voucher[], selectedCode: string | null, onSelect: (code: string | null) => void, emptyMsg: string) => {
    if (list.length === 0) return <p className="text-sm text-[#8f9294] py-2">{emptyMsg}</p>;

    return (
      <div className="space-y-3">
        {list.map(v => {
          const eligible = subtotal >= v.minOrder;
          return (
            <label
              key={v.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer select-none 
                ${!eligible ? "opacity-50 border-[#f0f0f0] bg-[#f8f8fa]" : 
                  selectedCode === v.code ? "border-orange-500 bg-orange-50 shadow-sm" : "border-[#e5e5e5] hover:border-slate-300"}`}
            >
              {/* Type Icon */}
              <div className={`w-12 h-12 shrink-0 rounded-lg flex flex-col items-center justify-center text-white
                ${v.type === "shipping" ? "bg-green-500" : "bg-orange-500"}`}
              >
                <span className="text-[10px] font-bold uppercase leading-none">{v.type === "shipping" ? "FREE" : "GIÁM"}</span>
                <span className="text-xs font-bold leading-none">{v.type === "shipping" ? "SHIP" : "GIÁ"}</span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="font-bold text-[#44494d] text-sm">
                  {v.type === "percent" ? `Giảm ${v.value}%` : v.type === "fixed" ? `Giảm ${formatPrice(v.value)}` : "Miễn phí vận chuyển (Tối đa 35k)"}
                </p>
                <p className="text-[#8f9294] text-xs mt-0.5">Đơn tối thiểu {formatPrice(v.minOrder)}</p>
                {!eligible && <p className="text-red-500 text-[11px] font-bold mt-1">Chưa đạt điều kiện</p>}
                {eligible && v.expiry && <p className="text-[#8f9294] text-[11px] mt-1">HSD: {v.expiry}</p>}
              </div>

              {/* Selection Radio */}
              <div className="shrink-0 pl-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                  ${selectedCode === v.code ? "border-orange-500" : "border-[#cbd5e1]"}`}
                >
                  {selectedCode === v.code && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                </div>
                {/* Hidden real radio for accessibility/form compliance */}
                <input 
                  type="radio" 
                  name={v.type === "shipping" ? "freeship" : "discount"}
                  value={v.code} 
                  checked={selectedCode === v.code}
                  onChange={(e) => {
                    // Togglable radio behavior
                    if (selectedCode === v.code) onSelect(null);
                    else onSelect(v.code);
                  }}
                  onClick={(e) => {
                    if (!eligible) { e.preventDefault(); return; }
                    if (selectedCode === v.code) { e.preventDefault(); onSelect(null); }
                  }}
                  disabled={!eligible}
                  className="hidden" 
                />
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-lg flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
          <h2 className="text-xl font-bold text-[#44494d]">Chọn Autoparts Voucher</h2>
          <button onClick={onClose} className="text-[#8f9294] hover:text-red-500 text-xl leading-none">✕</button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-[#8f9294]">Đang tải voucher...</div>
          ) : (
            <>
              {/* Shipping Vouchers */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-6 bg-green-500 rounded-sm"></span>
                  <h3 className="font-bold text-[#44494d] text-base">Mã Miễn Phí Vận Chuyển</h3>
                  <span className="ml-auto text-xs text-[#8f9294]">Có thể chọn 1</span>
                </div>
                {renderVoucherList(shippingVouchers, freeshipCode, setFreeshipCode, "Không có mã miễn phí vận chuyển.")}
              </section>

              {/* Discount Vouchers */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-6 bg-orange-500 rounded-sm"></span>
                  <h3 className="font-bold text-[#44494d] text-base">Mã Giảm Giá / Hoàn Xu</h3>
                  <span className="ml-auto text-xs text-[#8f9294]">Có thể chọn 1</span>
                </div>
                {renderVoucherList(discountVouchers, discountCode, setDiscountCode, "Không có mã giảm giá.")}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#f0f0f0] bg-white flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-[#8f9294] hover:bg-[#f8f8fa] border border-[#e5e5e5]">Trở lại</button>
          <button 
            onClick={() => onApply(freeshipCode, discountCode)}
            className="px-8 py-2.5 rounded-xl font-bold text-white shadow-md hover:opacity-90"
            style={{ background: "var(--ap-primary)" }}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}

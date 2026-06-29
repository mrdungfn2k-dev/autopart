"use client";
import { useState, useEffect } from "react";

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

export const DEFAULT_CURRENCY: Currency = { code: "VND", symbol: "₫", rate: 1 };

export function getCurrentCurrency(): Currency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const raw = localStorage.getItem("ap_currency");
    if (raw) {
      const c = JSON.parse(raw);
      if (c && c.code && typeof c.rate === "number" && c.rate > 0) return c;
    }
  } catch {}
  return DEFAULT_CURRENCY;
}

export function formatCurrencyAware(vndAmount: number): string {
  const cur = getCurrentCurrency();
  if (cur.code === "VND" || cur.rate === 1) {
    return Math.round(vndAmount).toLocaleString("vi-VN") + cur.symbol;
  }
  const converted = vndAmount / cur.rate;
  const formatted = converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formatted} ${cur.symbol}`;
}

export default function CurrencySwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Currency>(DEFAULT_CURRENCY);
  const [supported, setSupported] = useState<Currency[]>([DEFAULT_CURRENCY]);

  useEffect(() => {
    setCurrent(getCurrentCurrency());
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        const list = d?.currency?.supported;
        if (Array.isArray(list) && list.length > 0) setSupported(list);
      })
      .catch(() => {});
  }, []);

  function pick(c: Currency) {
    localStorage.setItem("ap_currency", JSON.stringify(c));
    setCurrent(c);
    setOpen(false);
    window.dispatchEvent(new Event("currency-update"));
    setTimeout(() => window.location.reload(), 100);
  }

  if (supported.length <= 1) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#e5e5e5] hover:bg-[#f4f4f4] flex items-center gap-1">
        {current.code} {current.symbol}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-[#e5e5e5] rounded-lg shadow-lg z-50 min-w-[120px]">
          {supported.map(c => (
            <button
              key={c.code}
              onClick={() => pick(c)}
              className={`w-full px-3 py-2 text-left text-xs hover:bg-[#f4f4f4] ${current.code === c.code ? "font-bold text-[#1a4b97]" : "text-[#44494d]"}`}>
              {c.code} {c.symbol} {c.rate > 1 && <span className="text-[#8f9294]">(1{c.code} = {c.rate.toLocaleString("vi-VN")}₫)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export type Rates = { VND: number; USD: number; CNY: number };
const FALLBACK: Rates = { VND: 1, USD: 25400, CNY: 3500 };

let cache: Rates | null = null;
let inflight: Promise<Rates> | null = null;

// Lấy tỉ giá thật (đã cache theo ngày ở /api/exchange-rates) — chỉ fetch 1 lần / phiên
export function fetchRates(): Promise<Rates> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/exchange-rates")
      .then(r => r.json())
      .then(d => {
        const rt = d && d.rates ? d.rates : FALLBACK;
        cache = { VND: 1, USD: rt.USD || FALLBACK.USD, CNY: rt.CNY || FALLBACK.CNY };
        return cache;
      })
      .catch(() => FALLBACK);
  }
  return inflight;
}

export function useRates(): Rates {
  const [rates, setRates] = useState<Rates>(cache || FALLBACK);
  useEffect(() => { fetchRates().then(setRates); }, []);
  return rates;
}

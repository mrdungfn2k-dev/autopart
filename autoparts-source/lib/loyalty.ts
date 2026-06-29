import { readJson, writeJson } from "@/lib/fileStore";

// Điểm thưởng THẬT: tích theo đơn hàng đã đặt − điểm đã đổi quà.
const ORDERS = "orders.json";
const LEDGER = "loyalty.json"; // { [userId]: { spent, history:[{ts,delta,reason,refId}] } }

export const POINTS_PER_VND = 10000; // 1 điểm / 10.000đ chi tiêu

type HistoryItem = { ts: string; delta: number; reason: string; refId?: string; code?: string };
type LedgerEntry = { spent: number; history: HistoryItem[] };
type Ledger = Record<string, LedgerEntry>;

function readLedger(): Ledger {
  const l = readJson<Ledger>(LEDGER, {});
  return l && typeof l === "object" && !Array.isArray(l) ? l : {};
}

export function earnedPoints(userId: string): number {
  const orders = readJson<Array<{ userId?: string; status?: string; total?: number }>>(ORDERS, []);
  return (Array.isArray(orders) ? orders : [])
    .filter(o => o.userId === userId && o.status !== "cancelled")
    .reduce((s, o) => s + Math.floor((o.total || 0) / POINTS_PER_VND), 0);
}

export function spentPoints(userId: string): number {
  return readLedger()[userId]?.spent || 0;
}

export function balanceFor(userId: string) {
  const earned = earnedPoints(userId);
  const spent = spentPoints(userId);
  return { earned, spent, balance: Math.max(0, earned - spent) };
}

// Ghi nhận đổi điểm (trừ điểm) — không cho âm số dư (gọi sau khi đã kiểm tra đủ điểm)
export function recordRedemption(userId: string, cost: number, reason: string, refId?: string, code?: string) {
  const l = readLedger();
  if (!l[userId]) l[userId] = { spent: 0, history: [] };
  l[userId].spent += cost;
  l[userId].history.push({ ts: new Date().toISOString(), delta: -cost, reason, refId, code });
  writeJson(LEDGER, l);
  return l[userId];
}

// Lịch sử đổi quà (mới nhất trước) — để khách xem lại mã voucher đã đổi
export function redemptionHistory(userId: string): HistoryItem[] {
  const h = readLedger()[userId]?.history || [];
  return [...h].reverse();
}

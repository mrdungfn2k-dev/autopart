"use client";
import { useLang } from "@/lib/i18n";

// Thanh phân trang dùng chung toàn hệ thống — tránh trang dài lê thê.
// Dùng: const [page,setPage]=useState(1); const paged = list.slice((page-1)*SIZE, page*SIZE);
//       <Pagination page={page} totalPages={Math.ceil(list.length/SIZE)} onChange={setPage} totalItems={list.length} pageSize={SIZE} />
export default function Pagination({
  page, totalPages, onChange, totalItems, pageSize, unit,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
  totalItems?: number;
  pageSize?: number;
  unit?: string;
}) {
  const { lang } = useLang();
  if (totalPages <= 1) return null;

  const pageNumbers: (number | string)[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const s = new Set<number>([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1]);
    const arr = [...s].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out: (number | string)[] = [];
    let prev = 0;
    for (const n of arr) { if (n - prev > 1) out.push("…"); out.push(n); prev = n; }
    return out;
  })();

  const showLabel = typeof totalItems === "number" && typeof pageSize === "number";
  const unitLabel = unit || (lang === "zh" ? "项" : lang === "en" ? "items" : "mục");

  return (
    <div className="flex flex-col items-center gap-2 mt-5">
      <div className="flex items-center justify-center gap-1.5">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1}
          aria-label={lang === "zh" ? "上一页" : lang === "en" ? "Previous" : "Trang trước"}
          className="w-8 h-8 rounded-lg border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">‹</button>
        {pageNumbers.map((p, i) => p === "…" ? (
          <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? "text-white" : "border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4]"}`}
            style={p === page ? { background: "var(--ap-primary)" } : {}}>{p}</button>
        ))}
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
          aria-label={lang === "zh" ? "下一页" : lang === "en" ? "Next" : "Trang sau"}
          className="w-8 h-8 rounded-lg border border-[#e5e5e5] text-slate-600 hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">›</button>
      </div>
      {showLabel && (
        <span className="text-xs text-[#8f9294]">
          {totalItems === 0 ? "0" : `${(page - 1) * pageSize! + 1}–${Math.min(page * pageSize!, totalItems!)}`} / {totalItems} {unitLabel}
        </span>
      )}
    </div>
  );
}

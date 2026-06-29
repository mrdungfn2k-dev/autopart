"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { categories } from "@/lib/data";
import { useLang } from "@/lib/i18n";

// ── Types (inferred from data) ───────────────────────────────────────────
type SubSub = { id: string; name: string; nameZh?: string };
type Sub = { id: string; name: string; nameZh?: string; subcategories?: SubSub[] };
type Cat = typeof categories[0] & { subcategories?: Sub[] };

export default function CategoryNav() {
  const { lang } = useLang();
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const n = (item: { name: string; nameZh?: string }) =>
    lang === "zh" ? (item.nameZh || item.name) : item.name;

  const hoverCat = (id: string) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setHoveredCat(id);
    setHoveredSub(null);
  };
  const leaveCat = () => {
    leaveTimerRef.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSub(null);
    }, 200);
  };
  const enterPanel = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
  };
  const leavePanel = () => {
    leaveTimerRef.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSub(null);
    }, 200);
  };

  const hoverSub = (id: string) => {
    if (subLeaveTimerRef.current) clearTimeout(subLeaveTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current); // Keep parent alive
    setHoveredSub(id);
  };
  const leaveSubItem = () => {
    subLeaveTimerRef.current = setTimeout(() => setHoveredSub(null), 200);
  };
  const enterSubPanel = () => {
    if (subLeaveTimerRef.current) clearTimeout(subLeaveTimerRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current); // Stay alive
  };
  const leaveSubPanel = () => {
    subLeaveTimerRef.current = setTimeout(() => setHoveredSub(null), 200);
    leaveTimerRef.current = setTimeout(() => {
      setHoveredCat(null);
      setHoveredSub(null);
    }, 200);
  };

  const activeCat = (categories as Cat[]).find(c => c.id === hoveredCat);
  const activeSub = activeCat?.subcategories?.find(s => s.id === hoveredSub);

  return (
    <div className="relative flex" style={{ userSelect: "none" }}>
      {/* ── Left sidebar ── */}
      <div
        className="w-full bg-white border border-[#e5e5e5] rounded-xl shadow-sm overflow-hidden"
        onMouseLeave={leaveCat}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#f0f0f0]">
          <h3 className="font-bold text-sm" style={{ color: "#0891B2" }}>
            {lang === "zh" ? "产品分类" : "Danh mục sản phẩm"}
          </h3>
        </div>

        {/* Category list */}
        <ul className="py-1">
          {(categories as Cat[]).map(cat => {
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const isHovered = hoveredCat === cat.id;
            return (
              <li key={cat.id}>
                {hasSubs ? (
                  <button
                    onMouseEnter={() => hoverCat(cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                      isHovered
                        ? "text-[#1a4b97] font-semibold"
                        : "text-[#44494d] hover:text-[#1a4b97]"
                    }`}
                    style={isHovered ? { background: "#FFF7ED" } : {}}
                  >
                    <span>{n(cat)}</span>
                    <span className="text-[#8f9294] text-xs">›</span>
                  </button>
                ) : (
                  <Link
                    href={`/products?category=${cat.id}`}
                    scroll={false}
                    onMouseEnter={() => { setHoveredCat(null); setHoveredSub(null); }}
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-[#44494d] hover:text-[#1a4b97] transition-colors"
                    style={{ display: "flex" }}
                  >
                    <span>{n(cat)}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Sub-category flyout (L2) ── */}
      {activeCat && activeCat.subcategories && (
        <div
          className="absolute left-[100%] ml-1 top-0 w-[240px] bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-50 overflow-hidden"
          onMouseEnter={enterPanel}
          onMouseLeave={leavePanel}
        >
          {/* Background image hint */}
          {activeCat.img && (
            <div
              className="h-[80px] w-full relative overflow-hidden"
              style={{ background: "var(--ap-page-bg)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeCat.img} alt={n(activeCat)}
                className="w-full h-full object-cover opacity-60"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
            </div>
          )}
          <ul className="py-1">
            {activeCat.subcategories.map(sub => {
              const hasSubs2 = sub.subcategories && sub.subcategories.length > 0;
              const isHov = hoveredSub === sub.id;
              return (
                <li key={sub.id}>
                  {hasSubs2 ? (
                    <button
                      onMouseEnter={() => hoverSub(sub.id)}
                      onMouseLeave={leaveSubItem}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                        isHov ? "text-[#1a4b97] font-semibold" : "text-[#44494d] hover:text-[#1a4b97]"
                      }`}
                      style={isHov ? { background: "#FFF7ED" } : {}}
                    >
                      <span>{n(sub)}</span>
                      <span className="text-[#8f9294] text-xs">›</span>
                    </button>
                  ) : (
                    <Link
                      href={`/products?category=${activeCat.id}&sub=${sub.id}`}
                      scroll={false}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-[#44494d] hover:text-[#1a4b97] transition-colors"
                    >
                      <span>{n(sub)}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Sub-sub flyout (L3) ── */}
      {activeSub && activeSub.subcategories && (
        <div
          className="absolute z-[60] w-[220px] bg-white border border-[#e5e5e5] rounded-xl shadow-lg overflow-hidden"
          style={{ top: "0", left: "calc(100% + 248px)" }}
          onMouseEnter={enterSubPanel}
          onMouseLeave={leaveSubPanel}
        >
          <ul className="py-1">
            {activeSub.subcategories.map(ss => (
              <li key={ss.id}>
                <Link
                  href={`/products?category=${activeCat!.id}&sub=${activeSub.id}&subsub=${ss.id}`}
                  scroll={false}
                  className="flex items-center px-4 py-2.5 text-sm text-[#44494d] hover:text-[#1a4b97] transition-colors"
                >
                  {n(ss)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

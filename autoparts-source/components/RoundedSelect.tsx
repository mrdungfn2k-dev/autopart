"use client";
import { useState, useRef, useEffect } from "react";

// Select tuỳ biến: khung bo tròn cả khi đóng VÀ khi mở (native select không bo được phần mở)
export default function RoundedSelect({
  value, onChange, options, placeholder, className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 bg-[#f8f8fa] text-[#44494d] border border-gray-200 rounded-[12px] px-3 py-2 outline-none focus:border-[#1a4b97] hover:border-[#1a4b97] text-[13.5px] transition-colors cursor-pointer">
        <span className={`truncate ${selected ? "" : "text-[#8f9294]"}`}>{selected ? selected.label : placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" stroke="#8f9294" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-[60] top-full left-0 right-0 mt-1.5 bg-white border border-[#e5e5e5] rounded-[12px] shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#f4f7fc] ${!value ? "font-semibold text-[#1a4b97]" : "text-[#8f9294]"}`}>
              {placeholder}
            </button>
            {options.map(o => (
              <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#f4f7fc] ${o.value === value ? "font-semibold text-[#1a4b97] bg-[#f4f7fc]" : "text-[#44494d]"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

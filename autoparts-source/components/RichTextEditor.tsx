"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Trình soạn thảo WYSIWYG kiểu Microsoft Word (#11).
 * - In đậm / nghiêng / gạch chân / gạch ngang
 * - Tiêu đề H1–H6, đoạn văn
 * - Cỡ chữ, màu chữ
 * - Danh sách, căn lề, chèn link, chèn ảnh (URL hoặc tải lên)
 * Lưu nội dung dưới dạng HTML. Không cần thư viện ngoài (dùng contentEditable + execCommand).
 */
export default function RichTextEditor({
  value,
  onChange,
  minHeight = 420,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, force] = useState(0);

  // Nạp nội dung ban đầu (không controlled để con trỏ không bị nhảy)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = () => { if (ref.current) onChange(ref.current.innerHTML); };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    try { document.execCommand(cmd, false, arg); } catch {}
    emit();
    force(n => n + 1);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { exec("insertImage", String(reader.result)); };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const insertImageByUrl = () => {
    const url = window.prompt("Dán đường dẫn ảnh (https://...)");
    if (url) exec("insertImage", url);
  };

  const insertLink = () => {
    const url = window.prompt("Dán đường dẫn liên kết (https://...)");
    if (url) exec("createLink", url);
  };

  const Btn = ({ cmd, arg, label, title }: { cmd?: string; arg?: string; label: React.ReactNode; title: string; }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => e.preventDefault()}
      onClick={() => cmd && exec(cmd, arg)}
      className="min-w-[30px] h-8 px-2 rounded-md text-sm font-semibold text-[#44494d] border border-[#e5e5e5] bg-white hover:border-[#1a4b97] hover:text-[#1a4b97] transition-colors"
    >
      {label}
    </button>
  );

  return (
    <div className="rte">
      {/* Thanh công cụ */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-[#f0f0f0] bg-[#fafbfc]">
        {/* Khối tiêu đề */}
        <select
          title="Định dạng đoạn"
          onMouseDown={e => e.stopPropagation()}
          onChange={e => { exec("formatBlock", e.target.value); e.target.selectedIndex = 0; }}
          className="h-8 px-2 rounded-md text-sm border border-[#e5e5e5] bg-white text-[#44494d] cursor-pointer">
          <option value="">Đoạn văn ▾</option>
          <option value="H1">Tiêu đề 1 (H1)</option>
          <option value="H2">Tiêu đề 2 (H2)</option>
          <option value="H3">Tiêu đề 3 (H3)</option>
          <option value="H4">Tiêu đề 4 (H4)</option>
          <option value="H5">Tiêu đề 5 (H5)</option>
          <option value="H6">Tiêu đề 6 (H6)</option>
          <option value="P">Văn bản thường</option>
          <option value="PRE">Khối mã (code)</option>
          <option value="BLOCKQUOTE">Trích dẫn</option>
        </select>

        {/* Cỡ chữ */}
        <select
          title="Cỡ chữ"
          onMouseDown={e => e.stopPropagation()}
          onChange={e => { exec("fontSize", e.target.value); e.target.selectedIndex = 0; }}
          className="h-8 px-2 rounded-md text-sm border border-[#e5e5e5] bg-white text-[#44494d] cursor-pointer">
          <option value="">Cỡ chữ ▾</option>
          <option value="1">Rất nhỏ</option>
          <option value="2">Nhỏ</option>
          <option value="3">Thường</option>
          <option value="4">Hơi lớn</option>
          <option value="5">Lớn</option>
          <option value="6">Rất lớn</option>
          <option value="7">Khổng lồ</option>
        </select>

        <span className="w-px h-6 bg-[#e5e5e5] mx-0.5" />
        <Btn cmd="bold" label={<b>B</b>} title="In đậm (Ctrl+B)" />
        <Btn cmd="italic" label={<i>I</i>} title="In nghiêng (Ctrl+I)" />
        <Btn cmd="underline" label={<u>U</u>} title="Gạch chân (Ctrl+U)" />
        <Btn cmd="strikeThrough" label={<s>S</s>} title="Gạch ngang" />

        <span className="w-px h-6 bg-[#e5e5e5] mx-0.5" />
        {/* Màu chữ */}
        <label title="Màu chữ" className="h-8 px-2 inline-flex items-center gap-1 rounded-md text-sm border border-[#e5e5e5] bg-white cursor-pointer">
          <span className="font-bold text-[#44494d]">A</span>
          <input type="color" defaultValue="#1a4b97" onChange={e => exec("foreColor", e.target.value)} className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer" />
        </label>
        {/* Màu nền chữ */}
        <label title="Màu nền chữ" className="h-8 px-2 inline-flex items-center gap-1 rounded-md text-sm border border-[#e5e5e5] bg-white cursor-pointer">
          <span className="text-[#44494d]">🖍</span>
          <input type="color" defaultValue="#fff59d" onChange={e => exec("hiliteColor", e.target.value)} className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer" />
        </label>

        <span className="w-px h-6 bg-[#e5e5e5] mx-0.5" />
        <Btn cmd="insertUnorderedList" label="• Danh sách" title="Danh sách dấu chấm" />
        <Btn cmd="insertOrderedList" label="1. Đánh số" title="Danh sách đánh số" />

        <span className="w-px h-6 bg-[#e5e5e5] mx-0.5" />
        <Btn cmd="justifyLeft" label="⯇" title="Căn trái" />
        <Btn cmd="justifyCenter" label="≡" title="Căn giữa" />
        <Btn cmd="justifyRight" label="⯈" title="Căn phải" />

        <span className="w-px h-6 bg-[#e5e5e5] mx-0.5" />
        <button type="button" title="Chèn liên kết" onMouseDown={e => e.preventDefault()} onClick={insertLink}
          className="h-8 px-2 rounded-md text-sm font-semibold text-[#44494d] border border-[#e5e5e5] bg-white hover:border-[#1a4b97] hover:text-[#1a4b97] transition-colors">🔗 Link</button>
        <button type="button" title="Chèn ảnh từ URL" onMouseDown={e => e.preventDefault()} onClick={insertImageByUrl}
          className="h-8 px-2 rounded-md text-sm font-semibold text-[#44494d] border border-[#e5e5e5] bg-white hover:border-[#1a4b97] hover:text-[#1a4b97] transition-colors">🖼 Ảnh URL</button>
        <button type="button" title="Tải ảnh lên" onMouseDown={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
          className="h-8 px-2 rounded-md text-sm font-semibold text-[#44494d] border border-[#e5e5e5] bg-white hover:border-[#1a4b97] hover:text-[#1a4b97] transition-colors">⬆ Tải ảnh</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />

        <span className="w-px h-6 bg-[#e5e5e5] mx-0.5" />
        <Btn cmd="removeFormat" label="Xoá định dạng" title="Xoá định dạng vùng chọn" />
        <Btn cmd="undo" label="↶" title="Hoàn tác" />
        <Btn cmd="redo" label="↷" title="Làm lại" />
      </div>

      {/* Vùng soạn thảo */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder="Nhập nội dung tại đây…"
        className="rte-area p-6 text-[15px] leading-relaxed text-[#44494d] focus:outline-none"
        style={{ minHeight }}
      />

      <style jsx global>{`
        .rte-area:empty:before { content: attr(data-placeholder); color: #9aa0a6; }
        .rte-area h1 { font-size: 1.8rem; font-weight: 800; margin: .8em 0 .4em; }
        .rte-area h2 { font-size: 1.45rem; font-weight: 700; margin: .8em 0 .4em; }
        .rte-area h3 { font-size: 1.2rem; font-weight: 700; margin: .7em 0 .35em; }
        .rte-area h4 { font-size: 1.05rem; font-weight: 700; margin: .6em 0 .3em; }
        .rte-area h5 { font-size: .95rem; font-weight: 700; margin: .6em 0 .3em; }
        .rte-area h6 { font-size: .85rem; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; margin: .6em 0 .3em; }
        .rte-area p { margin: .5em 0; }
        .rte-area ul { list-style: disc; padding-left: 1.4em; margin: .5em 0; }
        .rte-area ol { list-style: decimal; padding-left: 1.4em; margin: .5em 0; }
        .rte-area a { color: #1a4b97; text-decoration: underline; }
        .rte-area img { max-width: 100%; height: auto; border-radius: 10px; margin: .5em 0; }
        .rte-area blockquote { border-left: 3px solid #1a4b97; padding-left: 1em; color: #607080; margin: .6em 0; }
        .rte-area pre { background: #0d1f3b; color: #e6edf3; padding: 1em; border-radius: 10px; overflow:auto; font-family: monospace; }
      `}</style>
    </div>
  );
}

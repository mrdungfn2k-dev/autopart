"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useLang } from "@/lib/i18n";
import RichTextEditor from "@/components/RichTextEditor";
import { confirmDialog } from "@/components/ConfirmDialog";

const looksHtml = (s: string) => /<\w+[^>]*>/.test(s);
// Chuyển Markdown (nội dung cũ) -> HTML để dùng trong trình soạn thảo WYSIWYG
function mdToHtml(md: string): string {
  if (looksHtml(md)) return md;
  const inline = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) { closeList(); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); }
    else if ((m = line.match(/^-\s+(.*)$/))) { if (list !== "ul") { closeList(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = line.match(/^\d+\.\s+(.*)$/))) { if (list !== "ol") { closeList(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inline(m[1])}</li>`); }
    else if (line === "") { closeList(); }
    else { closeList(); out.push(`<p>${inline(line)}</p>`); }
  }
  closeList();
  return out.join("\n");
}

const DEFAULT_PAGES = [
  {
    id: "about",
    title: "Về AutoParts",
    slug: "/about",
    content: `# Về AutoParts Vietnam

AutoParts Vietnam là nền tảng TMĐT chuyên ngành phụ tùng ô tô hàng đầu Việt Nam.

## Sứ mệnh
Kết nối người dùng xe với nhà cung cấp phụ tùng chính hãng, minh bạch, uy tín.

## Giá trị cốt lõi
- **Chính hãng 100%**: Tất cả sản phẩm đều qua kiểm định, có mã QR truy xuất nguồn gốc
- **Tra cứu thông minh**: Tìm phụ tùng theo VIN, hãng xe, đời xe
- **Hệ sinh thái 5 vai trò**: Khách hàng, NCC, CTV, Thợ, Admin
- **Bảo hành toàn quốc**: 12–24 tháng, claim online

## Liên hệ
Email: cskh@autoparts.vn | Hotline: 19008095`,
  },
  {
    id: "policy",
    title: "Chính sách",
    slug: "/policy",
    content: `# Chính sách AutoParts

## Chính sách vận chuyển
Giao hàng toàn quốc qua GHTK, GHN, Viettel Post trong 2–5 ngày làm việc.
Miễn phí vận chuyển cho đơn hàng từ 2.000.000đ.

## Chính sách đổi trả
Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện:
- Sản phẩm chưa qua sử dụng
- Còn nguyên tem, nhãn mác
- Có hóa đơn mua hàng

## Chính sách bảo hành
Bảo hành 12–24 tháng tùy sản phẩm.
Claim bảo hành online tại: autopartsvietnam.com.vn/customer/warranty

## Hàng cấm & hạn chế
Không kinh doanh các mặt hàng giả, nhái, không rõ nguồn gốc.`,
  },
  {
    id: "privacy",
    title: "Chính sách bảo mật",
    slug: "/privacy",
    content: `# Chính sách bảo mật thông tin

## Thu thập thông tin
AutoParts thu thập thông tin khi bạn đăng ký tài khoản, đặt hàng và liên hệ hỗ trợ.

## Sử dụng thông tin
- Xử lý đơn hàng và giao hàng
- Gửi thông báo về đơn hàng và khuyến mãi
- Cải thiện dịch vụ và trải nghiệm người dùng

## Bảo mật dữ liệu
Dữ liệu được mã hóa SSL/TLS. Không chia sẻ thông tin cho bên thứ ba ngoài mục đích vận hành.

## Quyền của người dùng
Bạn có thể yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân bằng cách liên hệ cskh@autoparts.vn.`,
  },
  {
    id: "support",
    title: "Trung tâm hỗ trợ",
    slug: "/support",
    content: `# Trung tâm hỗ trợ AutoParts

## Hướng dẫn đặt hàng
1. Chọn sản phẩm → Thêm vào giỏ → Thanh toán
2. Nhập địa chỉ giao hàng chính xác
3. Chọn phương thức thanh toán
4. Xác nhận đơn hàng

## Hướng dẫn tra cứu VIN
Nhập 17 ký tự VIN từ cửa sổ xe hoặc giấy đăng ký tại trang /vin-lookup.

## Liên hệ hỗ trợ
- Hotline: **19008095** (8:00–22:00, 7 ngày/tuần)
- Email: cskh@autoparts.vn
- Live chat: góc dưới phải màn hình

## Ước tính chi phí vận chuyển
GHTK: ~35.000đ | GHN: ~25.000đ | Viettel Post: ~30.000đ
Miễn phí vận chuyển đơn hàng từ 2.000.000đ.`,
  },
];

export default function AdminCMSPage() {
  const { t, lang } = useLang();
  const [pages, setPages] = useState(() => DEFAULT_PAGES.map(p => ({ ...p, content: mdToHtml(p.content) })));
  const [activeId, setActiveId] = useState("about");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const activePage = pages.find(p => p.id === activeId)!;
  const plainText = activePage.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // Nạp từ SERVER (data/cms-pages.json) — fallback localStorage cũ → defaults
  useEffect(() => {
    fetch("/api/cms-pages", { cache: "no-store" }).then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) {
        setPages(d.map((p: { content: string }) => ({ ...p, content: mdToHtml(p.content || "") })));
        return;
      }
      try {
        const stored = localStorage.getItem("ap_cms_pages");
        if (stored) setPages(JSON.parse(stored).map((p: { content: string }) => ({ ...p, content: mdToHtml(p.content) })));
      } catch {}
    }).catch(() => {});
  }, []);

  // Lưu THẬT lên server — mọi admin/khách đều thấy bản mới
  const handleSave = async () => {
    try {
      const r = await fetch("/api/cms-pages", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pages) });
      if (!r.ok) throw new Error("save-failed");
      try { localStorage.setItem("ap_cms_pages", JSON.stringify(pages)); } catch {}
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Không lưu được. Vui lòng đăng nhập lại admin rồi thử lại.", type: "warning" } }));
    }
  };

  // Thêm trang tĩnh mới (slug /p/<ten-trang>, xem được ngay ở storefront)
  const addPage = () => {
    const title = "Trang mới";
    const id = "p" + Date.now();
    const slug = "/p/trang-moi-" + String(Date.now()).slice(-5);
    setPages(ps => [...ps, { id, title, slug, content: "<h1>Trang mới</h1><p>Nhập nội dung tại đây...</p>", custom: true } as any]);
    setActiveId(id);
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Đã thêm trang mới — đổi tiêu đề, soạn nội dung rồi bấm Lưu thay đổi", type: "success" } }));
  };

  // Xóa trang tự thêm (4 trang gốc gắn với giao diện cố định nên không xóa)
  const deletePage = async (id: string) => {
    const pg = pages.find(p => p.id === id);
    if (!pg) return;
    if (!(pg as any).custom) { window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Trang mặc định của hệ thống không thể xóa", type: "warning" } })); return; }
    if (!(await confirmDialog(`Xóa trang "${pg.title}"? Khách sẽ không truy cập được ${pg.slug} nữa.`, { confirmText: "Xóa", danger: true }))) return;
    const next = pages.filter(p => p.id !== id);
    setPages(next);
    if (activeId === id) setActiveId(next[0]?.id || "about");
    try {
      await fetch("/api/cms-pages", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: `Đã xóa trang "${pg.title}"`, type: "info" } }));
    } catch {}
  };

  const updateContent = (content: string) => {
    setPages(ps => ps.map(p => p.id === activeId ? { ...p, content } : p));
  };

  const updateTitle = (title: string) => {
    setPages(ps => ps.map(p => p.id === activeId ? { ...p, title } : p));
  };

  return (
    <>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">{/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#44494d]">Quản lý nội dung (CMS)</h1>
              <p className="text-sm text-[#8f9294] mt-0.5">Chỉnh sửa nội dung các trang tĩnh của website</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreview(v => !v)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm border transition-colors ${preview ? "border-[#1a4b97] text-[#1a4b97] bg-blue-50" : "border-[#e5e5e5] text-[#8f9294] hover:border-slate-300"}`}>{preview ? "Chỉnh sửa" : "Xem trước"}
              </button>
              <button onClick={handleSave}
                className="px-5 py-2 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: saved ? "#22C55E" : "var(--ap-primary)" }}>{saved ? "✓ Đã lưu" : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-5">{/* Page List */}
            <div className="lg:col-span-1">
              <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-3 space-y-1">
                <p className="text-xs font-bold text-[#8f9294] px-2 py-1 uppercase">Trang nội dung</p>{pages.map(p => (
                  <div key={p.id} onClick={() => setActiveId(p.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-start gap-2 ${activeId === p.id
                      ? "font-bold text-white"
                      : "text-[#44494d] hover:bg-[#f8f8fa]"
                    }`}
                    style={activeId === p.id ? { background: "var(--ap-primary)" } : {}}>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs mb-0.5 truncate">{p.title}</div>
                      <div className="text-[10px] opacity-70 font-mono truncate">{p.slug}</div>
                    </div>
                    {(p as any).custom && (
                      <button onClick={e => { e.stopPropagation(); deletePage(p.id); }} title="Xóa trang"
                        className={`shrink-0 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-red-500 hover:text-white transition-colors ${activeId === p.id ? "text-white/80" : "text-red-400"}`}>✕</button>
                    )}
                  </div>))}
                <button onClick={addPage}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  style={{ background: "var(--ap-primary)" }}>+ Thêm trang mới
                </button>
                <p className="text-[11px] text-[#8f9294] mt-1.5 px-1">Trang tự thêm có nút ✕ để xóa. 4 trang mặc định không xóa được.</p>
              </div>{/* Page stats */}
              <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-4 mt-4 space-y-3">
                <p className="text-xs font-bold text-[#8f9294] uppercase">Thống kê</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8f9294]">Tổng ký tự</span>
                    <span className="font-bold text-[#44494d]">{plainText.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8f9294]">Số từ</span>
                    <span className="font-bold text-[#44494d]">{plainText.split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>
              </div>
            </div>{/* Editor */}
            <div className="lg:col-span-3 space-y-4">{/* Title */}
              <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-4">
                <label className="text-xs font-bold text-[#8f9294] uppercase mb-2 block">Tiêu đề trang</label>
                <input value={activePage.title} onChange={e => updateTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#44494d] focus:outline-none focus:border-[#1a4b97]" />
              </div>{/* Content */}
              <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
                {preview ? (
                  <div className="rte-area p-6 text-[15px] leading-relaxed text-[#44494d]" style={{ minHeight: 420 }}
                    dangerouslySetInnerHTML={{ __html: activePage.content }} />
                ) : (
                  <RichTextEditor key={activeId} value={activePage.content} onChange={updateContent} />
                )}
              </div>{/* URL info */}
              <div className="ap-card bg-white rounded-2xl border border-[#f0f0f0] p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#8f9294] uppercase">URL trang:</span>
                  <a href={activePage.slug} target="_blank" rel="noreferrer"
                    className="text-sm font-mono text-[#1a4b97] hover:underline flex items-center gap-1">autopartsvietnam.com.vn{activePage.slug}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
                <p className="text-xs text-[#8f9294] mt-2">Nội dung được lưu trên server (data/cms-pages.json). Trang tự thêm có địa chỉ dạng <span className="font-mono">/p/ten-trang</span> và xem được ngay sau khi Lưu; có thể xóa bằng nút ✕. 4 trang mặc định gắn với giao diện cố định nên không xóa được.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>);
}

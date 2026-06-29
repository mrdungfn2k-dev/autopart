"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { useLang } from "@/lib/i18n";

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
  const [pages, setPages] = useState(DEFAULT_PAGES);
  const [activeId, setActiveId] = useState("about");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const activePage = pages.find(p => p.id === activeId)!;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ap_cms_pages");
      if (stored) setPages(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem("ap_cms_pages", JSON.stringify(pages));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateContent = (content: string) => {
    setPages(ps => ps.map(p => p.id === activeId ? { ...p, content } : p));
  };

  const updateTitle = (title: string) => {
    setPages(ps => ps.map(p => p.id === activeId ? { ...p, title } : p));
  };

  // Simple markdown-to-HTML for preview
  const renderMarkdown = (md: string) =>
    md
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-slate-800 mb-3 mt-6">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-slate-700 mb-2 mt-5">$2</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-600 text-sm">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-slate-600 text-sm">$2</li>')
      .replace(/\n\n/g, '<br/><br/>');

  return (
    <div className="flex min-h-screen" style={{ background: "var(--ap-page-bg)" }}>
      <AdminSidebar active="/admin/cms" />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#44494d]">Quản lý nội dung (CMS)</h1>
              <p className="text-sm text-[#8f9294] mt-0.5">Chỉnh sửa nội dung các trang tĩnh của website</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreview(v => !v)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm border transition-colors ${preview ? "border-[#1a4b97] text-[#1a4b97] bg-blue-50" : "border-[#e5e5e5] text-[#8f9294] hover:border-slate-300"}`}>
                {preview ? "Chỉnh sửa" : "Xem trước"}
              </button>
              <button onClick={handleSave}
                className="px-5 py-2 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: saved ? "#22C55E" : "var(--ap-primary)" }}>
                {saved ? "✓ Đã lưu" : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-5">
            {/* Page List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-3 space-y-1">
                <p className="text-xs font-bold text-[#8f9294] px-2 py-1 uppercase">Trang nội dung</p>
                {pages.map(p => (
                  <button key={p.id} onClick={() => setActiveId(p.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${activeId === p.id
                      ? "font-bold text-white"
                      : "text-[#44494d] hover:bg-[#f8f8fa]"
                    }`}
                    style={activeId === p.id ? { background: "var(--ap-primary)" } : {}}>
                    <div className="font-semibold text-xs mb-0.5">{p.title}</div>
                    <div className="text-[10px] opacity-70 font-mono">{p.slug}</div>
                  </button>
                ))}
              </div>

              {/* Page stats */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-4 mt-4 space-y-3">
                <p className="text-xs font-bold text-[#8f9294] uppercase">Thống kê</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8f9294]">Tổng ký tự</span>
                    <span className="font-bold text-[#44494d]">{activePage.content.length.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8f9294]">Số dòng</span>
                    <span className="font-bold text-[#44494d]">{activePage.content.split("\n").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8f9294]">Số từ</span>
                    <span className="font-bold text-[#44494d]">{activePage.content.split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-3 space-y-4">
              {/* Title */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-4">
                <label className="text-xs font-bold text-[#8f9294] uppercase mb-2 block">Tiêu đề trang</label>
                <input value={activePage.title} onChange={e => updateTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm font-semibold text-[#44494d] focus:outline-none focus:border-[#1a4b97]" />
              </div>

              {/* Content */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
                <div className="border-b border-[#f0f0f0] px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#44494d]">Nội dung (Markdown)</span>
                  <div className="flex gap-1">
                    {["**B**", "*I*", "# H1", "## H2", "- List"].map(tag => (
                      <button key={tag}
                        onClick={() => {
                          const insertion = tag === "**B**" ? "**văn bản**" : tag === "*I*" ? "*văn bản*" : tag === "# H1" ? "\n# Tiêu đề" : tag === "## H2" ? "\n## Tiêu đề phụ" : "\n- Mục";
                          updateContent(activePage.content + insertion);
                        }}
                        className="px-2 py-1 rounded-lg text-xs font-mono border border-[#e5e5e5] text-[#8f9294] hover:border-[#1a4b97] hover:text-[#1a4b97] transition-colors">
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {preview ? (
                  <div className="p-6 min-h-[400px] prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(activePage.content) }} />
                ) : (
                  <textarea
                    value={activePage.content}
                    onChange={e => updateContent(e.target.value)}
                    className="w-full p-5 font-mono text-sm text-[#44494d] focus:outline-none resize-none leading-relaxed"
                    style={{ minHeight: "400px", background: "#f9fafb" }}
                    placeholder="Nhập nội dung Markdown...&#10;&#10;# Tiêu đề lớn&#10;## Tiêu đề phụ&#10;&#10;Nội dung văn bản..."
                  />
                )}
              </div>

              {/* URL info */}
              <div className="bg-white rounded-2xl border border-[#f0f0f0] p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#8f9294] uppercase">URL trang:</span>
                  <a href={activePage.slug} target="_blank" rel="noreferrer"
                    className="text-sm font-mono text-[#1a4b97] hover:underline flex items-center gap-1">
                    autopartsvietnam.com.vn{activePage.slug}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                </div>
                <p className="text-xs text-[#8f9294] mt-2">
                  Lưu ý: Nội dung CMS được lưu vào localStorage của admin. Để cập nhật lên production, cần tích hợp API backend.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

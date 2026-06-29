"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect, useCallback, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { notifyLogoChanged } from "@/components/LogoImage";
import { validateImageFile, imageError, IMG_ACCEPT, detectQrCode, fileToDataUrl } from "@/lib/imageValidate";

type ToggleProps = { checked: boolean; onChange: () => void };
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <div onClick={onChange} className="relative rounded-full cursor-pointer transition-colors shrink-0" style={{ width: '44px', minWidth: '44px', height: '24px', background: checked ? 'var(--ap-primary)' : '#CBD5E1' }}>
      <div className="absolute top-[2px] bg-white rounded-full shadow transition-all" style={{ width: '20px', height: '20px', left: checked ? '22px' : '2px' }} />
    </div>);
}

const TABS = [
  { key: "branding", label: "Thương hiệu" },
  { key: "colors", label: "Màu sắc" },
  { key: "commitments", label: "Thanh cam kết" },
  { key: "footer", label: "Chân trang" },
  { key: "features", label: "Tính năng" },
  { key: "security", label: "Bảo mật" },
  { key: "payment", label: "Thanh toán & QR" },
  { key: "emailTemplates", label: "Mẫu email" },
  { key: "tax", label: "Thuế" },
  { key: "customCode", label: "Tùy biến mã" },
  { key: "seo", label: "SEO" },
  { key: "currency", label: "Tiền tệ" },
] as const;

const DEFAULT_EMAIL_TEMPLATES = [
  { key: "welcome", label: "Chào mừng đăng ký", subject: "Chào mừng đến AutoParts!", body: "Xin chào {{name}},\n\nCảm ơn bạn đã đăng ký tài khoản tại AutoParts. Chúng tôi rất vui được phục vụ bạn." },
  { key: "order_confirmed", label: "Xác nhận đơn hàng", subject: "Xác nhận đơn hàng {{orderId}}", body: "Xin chào {{name}},\n\nĐơn hàng {{orderId}} của bạn đã được xác nhận và sẽ sớm được xử lý." },
  { key: "order_shipped", label: "Đơn hàng đang giao", subject: "Đơn hàng {{orderId}} đang được giao", body: "Đơn hàng {{orderId}} đang trên đường đến bạn. Mã vận đơn: {{tracking}}" },
  { key: "order_delivered", label: "Đơn hàng đã giao", subject: "Đơn hàng {{orderId}} đã giao thành công", body: "Đơn hàng {{orderId}} đã được giao. Cảm ơn bạn đã mua sắm tại AutoParts!" },
  { key: "return_approved", label: "Duyệt đổi trả", subject: "Yêu cầu đổi trả {{returnId}} được duyệt", body: "Yêu cầu đổi trả {{returnId}} của bạn đã được duyệt. Vui lòng làm theo hướng dẫn để hoàn tất." },
  { key: "refund_processed", label: "Hoàn tiền", subject: "Hoàn tiền đơn {{orderId}}", body: "Đơn hàng {{orderId}} đã được hoàn tiền {{amount}}. Vui lòng kiểm tra tài khoản trong 3-5 ngày làm việc." },
];

type TabKey = typeof TABS[number]["key"];

// ── Logo Uploader with client-side background removal ──────────────────────
function LogoUploader({ cardCls, currentLogo }: { cardCls: string, currentLogo?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [threshold, setThreshold] = useState(240); // bg-removal threshold
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const removeBackground = (dataUrl: string, thr: number): Promise<string> =>new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i+1], b = d[i+2];
          // Make near-white pixels transparent
          if (r >= thr && g >= thr && b >= thr) d[i+3] = 0;
        }
        ctx.putImageData(id, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = dataUrl;
    });

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const raw = e.target?.result as string;
      setOriginal(raw);
      const processed = await removeBackground(raw, threshold);
      setPreview(processed);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    setStatus("idle");

    try {
      // Convert dataURL back to Blob
      const res = await fetch(preview);
      const blob = await res.blob();
      const fd = new FormData();
      fd.append("logo", blob, "logo.png");
      const up = await fetch("/api/upload-logo", { method: "POST", body: fd });
      const json = await up.json();
      if (json.ok) {
        setStatus("ok");
        notifyLogoChanged(json.url); // instantly swap logo everywhere on page
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    } finally {
      setUploading(false);
    }
  };

  const reprocess = async () => {
    if (!original) return;
    const processed = await removeBackground(original, threshold);
    setPreview(processed);
  };

  return (
    <div className="space-y-4">{/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-[var(--ap-primary)]"
        style={{ borderColor: preview ? "var(--ap-primary)" : "#e5e5e5", background: "#fafafa" }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />{preview ? (
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-xs text-[#8f9294] mb-1">Gốc</p>
              <img src={original!} alt="Gốc" className="h-12 object-contain" style={{ background: "#e5e5e5" }} />
            </div>
            <svg width="20" height="20" fill="none" stroke="var(--ap-primary)" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div className="text-center">
              <p className="text-xs text-[#8f9294] mb-1">Sau xóa nền</p>
              <img src={preview} alt="Đã xử lý" className="h-12 object-contain" style={{ background: "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 10px 10px" }} />
            </div>
          </div>) : (
          <div className="py-4">{currentLogo ? (
              <div className="mb-4">
                <p className="text-xs font-semibold text-green-600 mb-2">Logo đang sử dụng:</p>
                <img src={currentLogo} alt="Current Logo" className="mx-auto h-16 object-contain p-2 rounded-lg" style={{ background: "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 10px 10px" }} />
              </div>) : (
              <svg className="mx-auto mb-2 text-[#8f9294]" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 20M6 8a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>)}
            <p className="text-sm text-[#44494d] font-medium">{currentLogo ? "Kéo thả hoặc click để thay đổi logo" : "Kéo thả hoặc click để chọn ảnh logo"}</p>
            <p className="text-xs text-[#8f9294] mt-1">PNG, JPG, SVG – nền trắng sẽ tự động được xóa</p>
          </div>)}
      </div>{/* Threshold control */}
      {preview && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Mức xóa nền:</label>
          <input type="range" min={180} max={255} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            onMouseUp={reprocess} onTouchEnd={reprocess}
            className="flex-1 accent-[#1a4b97]" />
          <span className="text-xs text-[#8f9294] w-8 shrink-0">{threshold}</span>
        </div>)}

      {/* Actions */}
      {preview && (
        <div className="flex items-center gap-3">
          <button onClick={handleUpload} disabled={uploading}
            className="px-5 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
            style={{ background: "var(--ap-primary)" }}>{uploading ? "Đang lưu..." : "✓ Áp dụng logo này"}
          </button>
          <button onClick={() => { setPreview(null); setOriginal(null); setStatus("idle"); if (fileRef.current) fileRef.current.value = ""; }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#8f9294] hover:text-[#44494d] border border-[#e5e5e5]">Chọn lại
          </button>{status === "ok" && <span className="text-green-600 text-sm font-medium">✓ Logo đã cập nhật toàn hệ thống!</span>}
          {status === "err" && <span className="text-red-500 text-sm font-medium">✕ Lỗi khi tải lên. Thử lại!</span>}
        </div>)}
    </div>);
}

function FaviconUploader({ currentFavicon }: { currentFavicon?: string }) {
  const [preview, setPreview] = (function(){ const r = require("react"); return r.useState<string | null>(null); })();
  const [uploading, setUploading] = (function(){ const r = require("react"); return r.useState(false); })();
  const [status, setStatus] = (function(){ const r = require("react"); return r.useState<"idle" | "ok" | "err">("idle"); })();
  const ref = (function(){ const r = require("react"); return r.useRef<HTMLInputElement>(null); })();

  function handleFile(file: File) {
    const rd = new FileReader();
    rd.onload = e => setPreview(e.target?.result as string);
    rd.readAsDataURL(file);
  }
  async function handleUpload() {
    const f = ref.current?.files?.[0];
    if (!f) return;
    setUploading(true); setStatus("idle");
    try {
      const fd = new FormData();
      fd.append("favicon", f);
      const res = await fetch("/api/upload-favicon", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error("upload failed");
      setStatus("ok");
    } catch {
      setStatus("err");
    } finally { setUploading(false); }
  }

  return (
    <div>{currentFavicon && !preview && (
        <div className="mb-3 flex items-center gap-3 p-2 border border-[#e5e5e5] rounded">
          <img src={currentFavicon} alt="favicon" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span className="text-xs text-[#8f9294]">Favicon hiện tại</span>
        </div>)}
      {preview && (
        <div className="mb-3 flex items-center gap-3 p-2 border border-[#1a4b97] rounded">
          <img src={preview} alt="preview" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span className="text-xs text-[#1a4b97]">Xem trước</span>
        </div>)}
      <input id="favicon-upload-input" ref={ref} type="file" accept=".png,.ico,.jpg,.jpeg,.svg" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        className="block w-full text-sm text-[#44494d] file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-[#1a4b97] file:text-white file:font-semibold" />{preview && (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={handleUpload} disabled={uploading} className="px-4 py-1.5 rounded text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>{uploading ? "Đang lưu..." : "Áp dụng favicon"}
          </button>{status === "ok" && <span className="text-green-600 text-xs">✓ Đã cập nhật</span>}
          {status === "err" && <span className="text-red-500 text-xs">✕ Lỗi tải lên</span>}
        </div>)}
    </div>);
}

export default function AdminSettingsPage() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<TabKey>("branding");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // All settings state
  const [branding, setBranding] = useState({
    brandName: "AutoParts", brandShort: "AP", greeting: "AutoParts xin chào!",
    hotline: "19008095", tagline: "Nền tảng mua phụ tùng\nô tô chính hãng hàng đầu\nViệt Nam",
  });
  const [commitments, setCommitments] = useState([
    { text: "Được vận hành bởi AutoParts" },
    { text: "Thanh toán hoàn toàn bằng VND" },
    { text: "Theo dõi hành trình qua web" },
    { text: "Order trực tiếp và nhanh chóng" },
  ]);
  const [footer, setFooter] = useState({
    companyName: "CÔNG TY CỔ PHẦN AUTOPARTS",
    registrationNo: "0104093672",
    issuedBy: "do Phòng đăng ký kinh doanh - Sở Kế hoạch và Đầu tư TP Hà Nội cấp ngày 03/07/2009",
    manager: "Nguyễn Tuấn Anh",
    address: "Tòa nhà AutoParts, Ngõ 15 Duy Tân, Cầu Giấy, Hà Nội",
    email: "cskh@autoparts.vn", phone: "19008095",
    newsletterTitle: "Đăng ký nhận khuyến mãi", newsletterSubtitle: "Nhận Flash Sale & ưu đãi độc quyền sớm nhất", newsletterPromo: "Mã GIAMGIA10 — giảm 10% cho đơn đầu tiên",
    supportLinks: ["Trung tâm hỗ trợ","Hướng dẫn đặt hàng","Hướng dẫn ký hợp đồng điện tử","Hướng dẫn sử dụng","Ước tính chi phí vận chuyển"],
    policyLinks: ["Chính sách vận chuyển","Chính sách bảo mật thông tin cá nhân","Chính sách trả hàng hoàn tiền","Hàng cấm, hàng gửi có điều kiện"],
    aboutLinks: ["Giới thiệu","Điều khoản dịch vụ","Quy chế hoạt động sàn","Giao dịch TMĐT","Kinh nghiệm AutoParts"],
    socialLinks: [
      { name: "Facebook", icon: "/ap-assets/icon_fb.svg", url: "https://www.facebook.com/" },
      { name: "YouTube", icon: "/ap-assets/icon_utube.svg", url: "https://www.youtube.com/" },
      { name: "TikTok", icon: "/ap-assets/icon_tiktok.svg", url: "https://www.tiktok.com/" },
      { name: "Zalo", icon: "/ap-assets/icon_zalo.svg", url: "https://zalo.me/" },
      { name: "Instagram", icon: "/ap-assets/icon_ig.svg", url: "https://www.instagram.com/" },
    ] as { name: string; icon: string; url: string }[],
  });
  const [general, setGeneral] = useState({
    siteName: "AutoParts", supportEmail: "support@autoparts.vn", supportPhone: "1900 1234",
    minWithdraw: "500000", platformFeeDefault: "11.1", affiliateT1: "10", affiliatePassive: "5",
    vatPercent: "0",
  });
  const [customCss, setCustomCss] = useState("");
  const [customJs, setCustomJs] = useState("");
  const [seoMeta, setSeoMeta] = useState<Record<string, { title: string; description: string }>>({
    home: { title: "", description: "" },
    about: { title: "", description: "" },
    policy: { title: "", description: "" },
    privacy: { title: "", description: "" },
    license: { title: "", description: "" },
    support: { title: "", description: "" },
  });
  const [currency, setCurrency] = useState<{ default: string; supported: Array<{ code: string; symbol: string; rate: number }> }>({
    default: "VND",
    supported: [
      { code: "VND", symbol: "₫", rate: 1 },
      { code: "USD", symbol: "$", rate: 24500 },
    ],
  });
  const [features, setFeatures] = useState({
    flashSale: true, voucherSystem: true, mechanicPortal: true,
    affiliatePortal: true, warrantyTracking: true, vinLookup: false, maintenanceMode: false,
  });
  const [security, setSecurity] = useState({
    twoFARequired: false, sessionTimeout: "60", loginAttempts: "5",
  });
  const [payment, setPayment] = useState({
    qrImage: "", bankName: "Vietcombank", bankAccount: "0011004095896",
    bankHolder: "CONG TY CO PHAN AUTOPARTS",
    note: "Quét mã QR hoặc chuyển khoản theo thông tin bên dưới. Ghi nội dung: TT + mã đơn.",
  });
  const [emailTemplates, setEmailTemplates] = useState(DEFAULT_EMAIL_TEMPLATES.map(t => ({ ...t })));
  const [theme, setTheme] = useState({
    primary: "#1a4b97", primaryDark: "#113264",
    sidebarBg: "#1b1d1f", sidebarBorder: "#2f3336", sidebarText: "#8f9294",
    headerBg: "#ffffff", textPrimary: "#44494d", textMuted: "#8f9294",
    linkColor: "#1a4b97", pageBg: "#f4f4f4", cardBg: "#ffffff",
    accentRed: "#ee0033", borderColor: "#e5e5e5",
    topBarBg: "#1b1d1f", topBarText: "#ffffff", buttonRadius: "8",
  });

  // Load from API
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.branding) setBranding(b => ({ ...b, ...d.branding }));
      if (Array.isArray(d.commitments)) setCommitments(d.commitments);
      if (d.footer) setFooter(f => ({ ...f, ...d.footer }));
      if (d.general) setGeneral(g => ({ ...g, ...d.general }));
      if (d.features) setFeatures(f => ({ ...f, ...d.features }));
      if (d.security) setSecurity(s => ({ ...s, ...d.security }));
      if (d.payment) setPayment(p => ({ ...p, ...d.payment }));
      if (Array.isArray(d.emailTemplates) && d.emailTemplates.length > 0) setEmailTemplates(d.emailTemplates);
      if (typeof d.customCss === "string") setCustomCss(d.customCss);
      if (typeof d.customJs === "string") setCustomJs(d.customJs);
      if (d.seoMeta && typeof d.seoMeta === "object") setSeoMeta(prev => ({ ...prev, ...d.seoMeta }));
      if (d.currency && Array.isArray(d.currency.supported)) setCurrency(d.currency);
      if (d.theme) setTheme(t => ({ ...t, ...d.theme }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ branding, commitments, footer, general, features, security, payment, theme, emailTemplates, customCss, customJs, seoMeta, currency }),
    });
    // Áp dụng màu/nút NGAY trên toàn site (ThemeProvider lắng nghe sự kiện này)
    try { window.dispatchEvent(new CustomEvent("ap-theme-updated", { detail: theme })); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]";
  const labelCls = "text-sm font-semibold text-slate-600 mb-1 block";
  const cardCls = "ap-card bg-white rounded-2xl border border-[#f0f0f0] p-5";

  return (
  <>
  <main className="flex-1 overflow-auto">
  <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
    <div className="flex items-center justify-between px-6 h-14">
      <h1 className="text-lg font-bold text-[#44494d]">Cài đặt hệ thống</h1>
      <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-sm font-semibold ${saved ? "bg-green-500 text-white" : "text-white"}`} style={saved ? {} : { background: "var(--ap-primary)" }}>{saved ? "✓ Đã lưu!" : "Lưu cài đặt"}
      </button>
    </div>
    <div className="px-6 flex border-t border-[#f0f0f0]">{TABS.map(t => (
        <button key={t.key} onClick={() => setTab(t.key)}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t.key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{t.label}
        </button>))}
    </div>
  </div>

  <div className="p-6 max-w-3xl space-y-5">{loading && <div className="text-center py-12 text-[#8f9294]">Đang tải...</div>}

  {/* ── BRANDING ── */}
  {!loading && tab === "branding" && (
    <>{/* Logo Upload Card */}
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1">Logo hệ thống</h2>
      <p className="text-xs text-[#8f9294] mb-4">Tải lên logo mới. Hệ thống sẽ <strong>tự động xóa nền trắng</strong> trước khi lưu.</p>
      <LogoUploader cardCls={cardCls} currentLogo={(branding as any).logoUrl} />
    </div>

    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Thông tin thương hiệu</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Tên thương hiệu</label>
          <input value={branding.brandName} onChange={e => setBranding(b => ({ ...b, brandName: e.target.value }))} className={inputCls} placeholder="AutoParts" />
        </div>
        <div>
          <label className={labelCls}>Ký hiệu viết tắt (Logo)</label>
          <input value={branding.brandShort} onChange={e => setBranding(b => ({ ...b, brandShort: e.target.value }))} className={inputCls} placeholder="AP" maxLength={4} />
        </div>
        <div>
          <label className={labelCls}>Lời chào Top Bar</label>
          <input value={branding.greeting} onChange={e => setBranding(b => ({ ...b, greeting: e.target.value }))} className={inputCls} placeholder="AutoParts xin chào!" />
        </div>
        <div>
          <label className={labelCls}>Hotline</label>
          <input value={branding.hotline} onChange={e => setBranding(b => ({ ...b, hotline: e.target.value }))} className={inputCls} placeholder="19008095" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Tagline (mỗi dòng xuống hàng)</label>
          <textarea rows={3} value={branding.tagline} onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))} className={inputCls + " resize-none"} placeholder="Nền tảng mua phụ tùng&#10;ô tô chính hãng" />
        </div>
      </div>
      <div className="mt-4 p-3 rounded-xl text-xs text-blue-700" style={{ background: "#EFF6FF" }}>Thay đổi sẽ cập nhật trực tiếp trên Header, Footer và toàn bộ trang chủ sau khi nhấn &quot;Lưu cài đặt&quot;.
      </div>
    </div>
    </>)}

  {/* ── COLORS ── */}
  {!loading && tab === "branding" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-3">Favicon</h2>
      <p className="text-sm text-[#8f9294] mb-3">Icon hiển thị trên tab trình duyệt. Khuyến nghị PNG/ICO 32×32 hoặc 48×48 px.</p>
      <FaviconUploader currentFavicon={branding.faviconUrl as string | undefined} />
    </div>)}

  {!loading && tab === "colors" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1">Bảng phối màu hệ thống</h2>
      <p className="text-xs text-[#8f9294] mb-5">Thay đổi bất kỳ màu nào bên dưới. Nhấn "Lưu cài đặt" và tải lại trang để áp dụng toàn bộ.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[
          ["primary", "Màu chính (nút, active)"],
          ["primaryDark", "Màu chính đậm"],
          ["accentRed", "Màu nhấn (sale, giảm giá)"],
          ["sidebarBg", "Nền Sidebar"],
          ["sidebarBorder", "Viền Sidebar"],
          ["sidebarText", "Chữ Sidebar"],
          ["topBarBg", "Nền Top Bar"],
          ["topBarText", "Chữ Top Bar"],
          ["headerBg", "Nền Header"],
          ["textPrimary", "Màu chữ chính"],
          ["textMuted", "Màu chữ phụ"],
          ["linkColor", "Màu link"],
          ["pageBg", "Nền trang"],
          ["cardBg", "Nền thẻ/card"],
          ["borderColor", "Viền/đường kẻ"],
        ].map(([key, label]) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">{lang === "en" ? {primary: "Primary Color", primaryDark: "Primary Dark", accentRed: "Accent Red", sidebarBg: "Sidebar BG", sidebarBorder: "Sidebar Border", sidebarText: "Sidebar Text", topBarBg: "Top Bar BG", topBarText: "Top Bar Text", headerBg: "Header BG", textPrimary: "Text Primary", textMuted: "Text Muted", linkColor: "Link Color", pageBg: "Page BG", cardBg: "Card BG", borderColor: "Border Color"}[key] : lang === "zh" ? {primary: "主色", primaryDark: "深主色", accentRed: "强调红", sidebarBg: "侧边栏背景", sidebarBorder: "侧边栏边框", sidebarText: "侧边栏文字", topBarBg: "顶栏背景", topBarText: "顶栏文字", headerBg: "页眉背景", textPrimary: "主要文字", textMuted: "次要文字", linkColor: "链接颜色", pageBg: "页面背景", cardBg: "卡片背景", borderColor: "边框颜色"}[key] : label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(theme as Record<string,string>)[key] || "#000000"}
                onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-[#e5e5e5] cursor-pointer p-0.5"
                style={{ WebkitAppearance: "none" }}
              />
              <input
                type="text"
                value={(theme as Record<string,string>)[key] || ""}
                onChange={e => setTheme(t => ({ ...t, [key]: e.target.value }))}
                className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg text-xs font-mono focus:outline-none focus:border-[#1a4b97]"
                placeholder="#hex"
              />
            </div>
          </div>))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">Bo góc nút (px):</label>
        <input
          type="range" min={0} max={24}
          value={Number(theme.buttonRadius) || 8}
          onChange={e => setTheme(t => ({ ...t, buttonRadius: e.target.value }))}
          className="flex-1 accent-[#1a4b97]"
        />
        <span className="text-xs text-[#8f9294] w-8">{theme.buttonRadius}px</span>
      </div>{/* Live preview */}
      <div className="mt-5 p-4 rounded-xl border border-[#e5e5e5]" style={{ background: theme.pageBg }}>
        <p className="text-xs font-semibold text-slate-500 mb-3">Xem trước</p>
        <div className="flex items-center gap-3 mb-3">
          <button className="px-4 py-2 text-white text-sm font-semibold" style={{ background: theme.primary, borderRadius: theme.buttonRadius + "px" }}>Nút chính</button>
          <button className="px-4 py-2 text-white text-sm font-semibold" style={{ background: theme.primaryDark, borderRadius: theme.buttonRadius + "px" }}>Nút tối</button>
          <span className="text-sm" style={{ color: theme.linkColor }}>Link mẫu</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-lg" style={{ background: theme.sidebarBg, color: theme.sidebarText }}>
            <p className="text-xs font-medium">Sidebar mẫu</p>
          </div>
          <div className="px-4 py-3 rounded-lg border" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Tiêu đề</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>Mô tả phụ</p>
          </div>
          <div className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ background: theme.accentRed }}>-20%</div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl text-xs text-blue-700" style={{ background: "#EFF6FF" }}>Sau khi lưu, mọi trang đều tự động áp dụng bảng màu mới. Nếu không thấy thay đổi, nhấn Ctrl+F5 để xóa cache trình duyệt.
      </div>
    </div>)}

  {/* ── COMMITMENTS ── */}
  {!loading && tab === "commitments" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Thanh cam kết (Black Bar)</h2>
      <p className="text-xs text-[#8f9294] mb-4">4 dòng cam kết hiển thị trên thanh nền đen phía dưới Header.</p>
      <div className="space-y-3">{commitments.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-[#8f9294] w-6 shrink-0">#{i+1}</span>
            <input value={c.text} onChange={e => {
              const arr = [...commitments]; arr[i] = { text: e.target.value }; setCommitments(arr);
            }} className={inputCls} placeholder={`Cam kết #${i+1}`} />{commitments.length > 1 && (
              <button onClick={() => setCommitments(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm font-bold shrink-0">✕</button>)}
          </div>))}
      </div>{commitments.length < 6 && (
        <button onClick={() => setCommitments(prev => [...prev, { text: "" }])} className="mt-3 text-sm text-[#1a4b97] font-semibold hover:opacity-80">+ Thêm cam kết</button>)}
    </div>)}

  {/* ── FOOTER ── */}
  {!loading && tab === "footer" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Thông tin công ty (chân trang)</h2>
      <div className="grid md:grid-cols-2 gap-4">{[
          ["Tên công ty", "companyName", "CÔNG TY CỔ PHẦN..."],
          ["Mã số doanh nghiệp", "registrationNo", "0104093672"],
          ["Người quản lý", "manager", "Nguyễn Tuấn Anh"],
          ["Địa chỉ", "address", "Tòa nhà AutoPart..."],
          [lang === "en" ? "Email" : lang === "zh" ? "电子邮件" : "Email", "email", "cskh@autoparts.vn"],
          ["Số điện thoại", "phone", "19008095"],
        ].map(([label, key, ph]) => (
          <div key={key}>
            <label className={labelCls}>{lang === "en" ? {primary: "Primary Color", primaryDark: "Primary Dark", accentRed: "Accent Red", sidebarBg: "Sidebar BG", sidebarBorder: "Sidebar Border", sidebarText: "Sidebar Text", topBarBg: "Top Bar BG", topBarText: "Top Bar Text", headerBg: "Header BG", textPrimary: "Text Primary", textMuted: "Text Muted", linkColor: "Link Color", pageBg: "Page BG", cardBg: "Card BG", borderColor: "Border Color"}[key] : lang === "zh" ? {primary: "主色", primaryDark: "深主色", accentRed: "强调红", sidebarBg: "侧边栏背景", sidebarBorder: "侧边栏边框", sidebarText: "侧边栏文字", topBarBg: "顶栏背景", topBarText: "顶栏文字", headerBg: "页眉背景", textPrimary: "主要文字", textMuted: "次要文字", linkColor: "链接颜色", pageBg: "页面背景", cardBg: "卡片背景", borderColor: "边框颜色"}[key] : label}</label>
            <input value={(footer as any)[key] || ""} onChange={e => setFooter(f => ({ ...f, [key]: e.target.value }))} className={inputCls} placeholder={ph} />
          </div>))}
        <div className="md:col-span-2">
          <label className={labelCls}>Cơ quan cấp giấy phép</label>
          <input value={footer.issuedBy} onChange={e => setFooter(f => ({ ...f, issuedBy: e.target.value }))} className={inputCls} />
        </div>
      </div>
    </div>{/* Footer link groups */}
    {[
      ["Liên kết Hỗ trợ khách hàng", "supportLinks"],
      ["Liên kết Chính sách", "policyLinks"],
      ["Liên kết Về chúng tôi", "aboutLinks"],
    ].map(([title, key]) => (
      <div key={key} className={cardCls}>
        <h2 className="font-bold text-[#44494d] mb-3 text-sm">{title}</h2>
        <div className="space-y-2">{((footer as any)[key] || []).map((link: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input value={link} onChange={e => {
                const arr = [...(footer as any)[key]]; arr[i] = e.target.value;
                setFooter(f => ({ ...f, [key]: arr }));
              }} className={inputCls} />
              <button onClick={() => {
                const arr = (footer as any)[key].filter((_: string, j: number) => j !== i);
                setFooter(f => ({ ...f, [key]: arr }));
              }} className="text-red-400 hover:text-red-600 text-sm font-bold shrink-0">✕</button>
            </div>))}
        </div>
        <button onClick={() => setFooter(f => ({ ...f, [key]: [...(f as any)[key], ""] }))} className="mt-2 text-sm text-[#1a4b97] font-semibold hover:opacity-80">+ Thêm liên kết</button>
      </div>))}
    {/* Đăng ký nhận khuyến mãi (newsletter) */}
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1 text-sm">Đăng ký nhận khuyến mãi (chân trang)</h2>
      <p className="text-xs text-[#8f9294] mb-3">Tiêu đề, mô tả và ưu đãi hiển thị ở ô "Đăng ký nhận khuyến mãi" dưới chân trang. Người dùng phải đăng nhập + email đúng định dạng mới nhận được.</p>
      <div className="space-y-3">
        <div><label className={labelCls}>Tiêu đề</label><input value={(footer as any).newsletterTitle || ""} onChange={e => setFooter(f => ({ ...f, newsletterTitle: e.target.value }))} className={inputCls} placeholder="Đăng ký nhận khuyến mãi" /></div>
        <div><label className={labelCls}>Mô tả</label><input value={(footer as any).newsletterSubtitle || ""} onChange={e => setFooter(f => ({ ...f, newsletterSubtitle: e.target.value }))} className={inputCls} placeholder="Nhận Flash Sale & ưu đãi..." /></div>
        <div><label className={labelCls}>Ưu đãi (hiện sau khi đăng ký thành công)</label><input value={(footer as any).newsletterPromo || ""} onChange={e => setFooter(f => ({ ...f, newsletterPromo: e.target.value }))} className={inputCls} placeholder="VD: Mã GIAMGIA10 — giảm 10% đơn đầu" /></div>
      </div>
    </div>
    {/* Liên kết mạng xã hội — hiện trên thanh nổi góc phải + chân trang */}
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1 text-sm">Liên kết mạng xã hội</h2>
      <p className="text-xs text-[#8f9294] mb-3">URL hiển thị ở thanh nổi góc phải màn hình và chân trang. Để trống = icon vẫn hiện nhưng KHÔNG bấm được (tĩnh).</p>
      <div className="space-y-2">{(["Facebook","YouTube","TikTok","Zalo","Instagram"] as const).map(name => {
          const iconFile: Record<string, string> = { Facebook: "fb", YouTube: "utube", TikTok: "tiktok", Zalo: "zalo", Instagram: "ig" };
          const cur = (footer.socialLinks || []).find(x => x.name === name);
          return (
            <div key={name} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-sm font-semibold text-[#44494d]">{name}</span>
              <input value={cur?.url || ""} onChange={e => {
                const arr = (footer.socialLinks || []).filter(x => x.name !== name);
                arr.push({ name, icon: `/ap-assets/icon_${iconFile[name]}.svg`, url: e.target.value });
                setFooter(f => ({ ...f, socialLinks: arr }));
              }} className={inputCls} placeholder="https://..." />
            </div>
          );
        })}
      </div>
    </div>
    </>)}

  {/* ── FEATURES ── */}
  {!loading && tab === "features" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Bật/Tắt tính năng</h2>
      <div className="space-y-0">{[
        ["flashSale", "Flash Sale & Countdown", "Bật section flash sale trên trang chủ"],
        ["voucherSystem", "Hệ thống Voucher & Mã giảm giá", "Cho phép khách nhập mã giảm giá"],
        ["mechanicPortal", "Portal Thợ Pro", "Bật tính năng đặt phụ tùng cho thợ"],
        ["affiliatePortal", "Portal Đại Lý / CTV", "Cho phép đăng ký và quản lý affiliate"],
        ["warrantyTracking", "Theo dõi bảo hành", "Khách hàng track bảo hành trực tuyến"],
        ["vinLookup", "VIN Lookup (API)", "Tra cứu xe qua mã VIN thực tế"],
        ["maintenanceMode", "Chế độ bảo trì", "Tạm ngưng hoạt động, hiện trang thông báo"],
      ].map(([key, label, desc]) => (
        <div key={key} className={`flex items-center justify-between py-3 border-b border-slate-50 last:border-0 ${key === "maintenanceMode" ? "rounded-xl px-3 mt-2" : ""}`}
          style={key === "maintenanceMode" ? { background: features.maintenanceMode ? "#FEF2F2" : "transparent" } : {}}>
          <div>
            <p className={`font-semibold text-sm ${key === "maintenanceMode" ? "text-red-600" : "text-[#44494d]"}`}>{label}</p>
            <p className="text-xs text-[#8f9294]">{desc}</p>
          </div>
          <Toggle checked={features[key as keyof typeof features]} onChange={() => setFeatures(p => ({ ...p, [key]: !p[key as keyof typeof features] }))} />
        </div>))}
      </div>
    </div>)}

  {/* ── SECURITY ── */}
  {!loading && tab === "emailTemplates" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Mẫu email và thông báo</h2>
      <p className="text-sm text-[#8f9294] mb-4">Cấu hình các mẫu email gửi tự động. Hỗ trợ biến: <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{name}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{orderId}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{tracking}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{amount}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{returnId}}`}</code></p>
      <div className="space-y-4">{emailTemplates.map((tpl, idx) => (
          <div key={tpl.key} className="border border-[#e5e5e5] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-[#44494d]">{tpl.label} <span className="text-xs text-[#8f9294] font-normal ml-2">({tpl.key})</span></p>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Tiêu đề</label>
                <input value={tpl.subject} onChange={e => { const ns = [...emailTemplates]; ns[idx] = { ...ns[idx], subject: e.target.value }; setEmailTemplates(ns); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nội dung</label>
                <textarea value={tpl.body} onChange={e => { const ns = [...emailTemplates]; ns[idx] = { ...ns[idx], body: e.target.value }; setEmailTemplates(ns); }} rows={4} className={inputCls + " font-mono text-xs"} />
              </div>
            </div>
          </div>))}
      </div>
      <p className="text-xs text-[#8f9294] mt-4">Lưu ý: Hệ thống chưa tích hợp gửi email tự động. Đây là phần lưu trữ template để chuẩn bị tích hợp sau (SendGrid/SMTP).</p>
    </div>)}

  {!loading && tab === "tax" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-3">Thuế VAT</h2>
      <p className="text-sm text-[#8f9294] mb-4">Đặt 0 để tắt VAT. Khi &gt; 0, VAT sẽ được tính trên (tạm tính - voucher giảm) và cộng vào tổng thanh toán tại checkout.</p>
      <div className="max-w-xs">
        <label className={labelCls}>Thuế suất VAT (%)</label>
        <input type="number" min="0" max="100" step="0.1" value={general.vatPercent} onChange={e => setGeneral(p => ({ ...p, vatPercent: e.target.value }))} className={inputCls} />
      </div>
    </div>)}

  {!loading && tab === "customCode" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-2">CSS tùy biến</h2>
      <p className="text-xs text-[#8f9294] mb-3">Inject vào &lt;head&gt; của tất cả trang. Cẩn thận với selector toàn cục.</p>
      <textarea value={customCss} onChange={e => setCustomCss(e.target.value)} rows={10} placeholder="/* Ví dụ: .ap-container { max-width: 1280px; } */" className={inputCls + " font-mono text-xs"} />
    </div>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-2">JavaScript tùy biến</h2>
      <p className="text-xs text-[#8f9294] mb-3">Inject vào cuối &lt;body&gt;. Dùng cho analytics, tracking, chat widget. <span className="text-red-500 font-semibold">Không paste mã không tin cậy.</span></p>
      <textarea value={customJs} onChange={e => setCustomJs(e.target.value)} rows={10} placeholder="// Ví dụ: window.addEventListener('load', () => console.log('loaded'));" className={inputCls + " font-mono text-xs"} />
    </div>
    </>)}

  {!loading && tab === "seo" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-2">{lang === "en" ? "SEO Meta per page" : lang === "zh" ? "每页的SEO元数据" : "SEO Meta theo trang"}</h2>
      <p className="text-xs text-[#8f9294] mb-4">Cấu hình &lt;title&gt; và &lt;meta name=&quot;description&quot;&gt; cho từng trang nội dung. Bỏ trống để dùng giá trị mặc định.</p>
      <div className="space-y-4">{Object.entries(seoMeta).map(([slug, meta]) => (
          <div key={slug} className="border border-[#e5e5e5] rounded-xl p-3">
            <p className="font-semibold text-[#44494d] mb-2">/{slug === "home" ? "" : slug}</p>
            <div className="space-y-2">
              <input value={meta.title} onChange={e => setSeoMeta(prev => ({ ...prev, [slug]: { ...prev[slug], title: e.target.value } }))} placeholder="Title (50-60 ký tự)" className={inputCls} />
              <textarea value={meta.description} onChange={e => setSeoMeta(prev => ({ ...prev, [slug]: { ...prev[slug], description: e.target.value } }))} placeholder="Description (150-160 ký tự)" rows={2} className={inputCls} />
            </div>
          </div>))}
      </div>
    </div>)}

  {!loading && tab === "currency" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-3">Tiền tệ và tỷ giá</h2>
      <p className="text-sm text-[#8f9294] mb-4">Cấu hình các đơn vị tiền tệ. Tỷ giá là <strong>1 đơn vị = X VNĐ</strong>. Khách hàng chọn được trong header storefront.</p>
      <div className="space-y-3">{currency.supported.map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-3 border border-[#e5e5e5] rounded">
            <input value={c.code} onChange={e => { const next = [...currency.supported]; next[i] = { ...next[i], code: e.target.value.toUpperCase() }; setCurrency({ ...currency, supported: next }); }} placeholder="Code (VD: USD)" className="w-20 px-2 py-1 border border-[#e5e5e5] rounded text-sm font-mono" maxLength={5} />
            <input value={c.symbol} onChange={e => { const next = [...currency.supported]; next[i] = { ...next[i], symbol: e.target.value }; setCurrency({ ...currency, supported: next }); }} placeholder="$" className="w-16 px-2 py-1 border border-[#e5e5e5] rounded text-sm" maxLength={3} />
            <input type="number" min="1" step="any" value={c.rate} onChange={e => { const next = [...currency.supported]; next[i] = { ...next[i], rate: Number(e.target.value) || 1 }; setCurrency({ ...currency, supported: next }); }} placeholder="24500" className="flex-1 px-2 py-1 border border-[#e5e5e5] rounded text-sm" />
            <span className="text-xs text-[#8f9294] min-w-[80px]">VNĐ / 1 {c.code}</span>
            <button onClick={() => setCurrency({ ...currency, supported: currency.supported.filter((_, idx) => idx !== i) })} className="text-red-500 px-2" disabled={c.code === "VND"}>×</button>
          </div>))}
        <button onClick={() => setCurrency({ ...currency, supported: [...currency.supported, { code: "EUR", symbol: "€", rate: 26800 }] })} className="px-3 py-1.5 rounded bg-[#1a4b97] text-white text-xs font-semibold">+ Thêm đơn vị</button>
      </div>
      <p className="text-xs text-[#8f9294] mt-4">Lưu ý: VND luôn là tiền tệ gốc (rate=1), không xoá được. Đổi rate USD/EUR theo tỷ giá thị trường.</p>
    </div>)}

  {!loading && tab === "security" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Thông tin chung</h2>
      <div className="grid md:grid-cols-2 gap-4">{[
        ["Tên nền tảng", "siteName"],
        ["Email hỗ trợ", "supportEmail"],
        [lang === "en" ? "Hotline" : lang === "zh" ? "热线" : "Hotline", "supportPhone"],
        ["Phí nền tảng mặc định (%)", "platformFeeDefault"],
        ["Rút tiền tối thiểu (VNĐ)", "minWithdraw"],
      ].map(([label, key]) => (
        <div key={key}>
          <label className={labelCls}>{lang === "en" ? {primary: "Primary Color", primaryDark: "Primary Dark", accentRed: "Accent Red", sidebarBg: "Sidebar BG", sidebarBorder: "Sidebar Border", sidebarText: "Sidebar Text", topBarBg: "Top Bar BG", topBarText: "Top Bar Text", headerBg: "Header BG", textPrimary: "Text Primary", textMuted: "Text Muted", linkColor: "Link Color", pageBg: "Page BG", cardBg: "Card BG", borderColor: "Border Color"}[key] : lang === "zh" ? {primary: "主色", primaryDark: "深主色", accentRed: "强调红", sidebarBg: "侧边栏背景", sidebarBorder: "侧边栏边框", sidebarText: "侧边栏文字", topBarBg: "顶栏背景", topBarText: "顶栏文字", headerBg: "页眉背景", textPrimary: "主要文字", textMuted: "次要文字", linkColor: "链接颜色", pageBg: "页面背景", cardBg: "卡片背景", borderColor: "边框颜色"}[key] : label}</label>
          <input value={general[key as keyof typeof general]} onChange={e => setGeneral(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
        </div>))}
      </div>
    </div>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Bảo mật & Phiên đăng nhập</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>Timeout phiên (phút)</label>
          <input value={security.sessionTimeout} onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))} type="number" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Số lần đăng nhập sai tối đa</label>
          <input value={security.loginAttempts} onChange={e => setSecurity(p => ({ ...p, loginAttempts: e.target.value }))} type="number" className={inputCls} />
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
        <div>
          <p className="font-semibold text-[#44494d] text-sm">Bắt buộc 2FA cho Admin</p>
          <p className="text-xs text-[#8f9294]">Tất cả tài khoản Admin phải bật xác thực 2 bước</p>
        </div>
        <Toggle checked={security.twoFARequired} onChange={() => setSecurity(p => ({ ...p, twoFARequired: !p.twoFARequired }))} />
      </div>
    </div>
    </>)}

  {!loading && tab === "payment" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1">Mã QR thanh toán</h2>
      <p className="text-xs text-[#8f9294] mb-4">Với <b>Chuyển khoản ngân hàng</b>: chỉ cần nhập đúng <b>Ngân hàng + Số tài khoản + Chủ tài khoản</b> bên dưới — hệ thống tự tạo <b>mã VietQR thật</b> (kèm số tiền + nội dung đơn) cho khách quét. Ô tải ảnh QR dưới đây dành cho <b>MoMo / ZaloPay</b> (tải QR ví của bạn); để trống sẽ dùng QR minh hoạ.</p>
      <div className="flex items-center gap-5 flex-wrap">
        <div className="w-[150px] h-[150px] rounded-xl border-2 border-dashed border-[#e5e5e5] flex items-center justify-center overflow-hidden bg-[#f8f8fa] shrink-0">
          {payment.qrImage ? <img src={payment.qrImage} alt="QR" className="w-full h-full object-contain" /> : <span className="text-xs text-[#8f9294] text-center px-2">Chưa có QR</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer inline-block w-fit" style={{ background: "var(--ap-primary)" }}>
            Tải ảnh QR
            <input type="file" accept={IMG_ACCEPT} className="hidden" onChange={async e => {
              const f = e.target.files?.[0]; if (!f) return;
              const verr = validateImageFile(f); if (verr) { imageError(verr); e.target.value = ""; return; }
              window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Đang kiểm tra mã QR…", type: "info" } }));
              const dataUrl = await fileToDataUrl(f);
              const isQr = await detectQrCode(dataUrl);
              if (isQr === false) {
                window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Ảnh không phải mã QR hợp lệ — không lưu. Vui lòng tải đúng ảnh mã QR ngân hàng.", type: "error" } }));
                e.target.value = ""; return;
              }
              setPayment(p => ({ ...p, qrImage: dataUrl }));
              window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: isQr === null ? "Trình duyệt không kiểm tra được mã QR — hãy đảm bảo ảnh đúng là mã QR." : "Đã nhận diện mã QR hợp lệ.", type: isQr === null ? "warning" : "success" } }));
              e.target.value = "";
            }} />
          </label>
          {payment.qrImage && <button onClick={() => setPayment(p => ({ ...p, qrImage: "" }))} className="text-xs text-red-500 hover:text-red-600 font-medium text-left">✕ Xoá QR</button>}
          <p className="text-[11px] text-[#8f9294] max-w-[260px]">Khuyến nghị ảnh vuông, rõ nét.</p>
        </div>
      </div>
    </div>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Thông tin chuyển khoản</h2>
      <div className="grid md:grid-cols-2 gap-4">{([
        ["Ngân hàng", "bankName"],
        ["Số tài khoản", "bankAccount"],
        ["Chủ tài khoản", "bankHolder"],
      ] as [string, "bankName" | "bankAccount" | "bankHolder"][]).map(([label, key]) => (
        <div key={key}>
          <label className={labelCls}>{lang === "en" ? {primary: "Primary Color", primaryDark: "Primary Dark", accentRed: "Accent Red", sidebarBg: "Sidebar BG", sidebarBorder: "Sidebar Border", sidebarText: "Sidebar Text", topBarBg: "Top Bar BG", topBarText: "Top Bar Text", headerBg: "Header BG", textPrimary: "Text Primary", textMuted: "Text Muted", linkColor: "Link Color", pageBg: "Page BG", cardBg: "Card BG", borderColor: "Border Color"}[key] : lang === "zh" ? {primary: "主色", primaryDark: "深主色", accentRed: "强调红", sidebarBg: "侧边栏背景", sidebarBorder: "侧边栏边框", sidebarText: "侧边栏文字", topBarBg: "顶栏背景", topBarText: "顶栏文字", headerBg: "页眉背景", textPrimary: "主要文字", textMuted: "次要文字", linkColor: "链接颜色", pageBg: "页面背景", cardBg: "卡片背景", borderColor: "边框颜色"}[key] : label}</label>
          <input value={payment[key]} onChange={e => setPayment(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
        </div>))}
      </div>
      <div className="mt-4">
        <label className={labelCls}>Ghi chú hướng dẫn thanh toán</label>
        <textarea rows={2} value={payment.note} onChange={e => setPayment(p => ({ ...p, note: e.target.value }))} className={inputCls + " resize-none"} />
      </div>
      <div className="mt-4 p-3 rounded-xl text-xs text-blue-700" style={{ background: "#EFF6FF" }}>Mã QR + thông tin này hiển thị ở bước thanh toán của khách. Nhấn &quot;Lưu cài đặt&quot; để áp dụng.</div>
    </div>
    </>)}

  </div>
  </main>
  </>);
}



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
  { key: "branding", label: "ThÆ°Æ¡ng hiá»‡u" },
  { key: "colors", label: "MÃ u sáº¯c" },
  { key: "commitments", label: "Thanh cam káº¿t" },
  { key: "footer", label: "ChÃ¢n trang" },
  { key: "features", label: "TÃ­nh nÄƒng" },
  { key: "security", label: "Báº£o máº­t" },
  { key: "payment", label: "Thanh toÃ¡n & QR" },
  { key: "emailTemplates", label: "Máº«u email" },
  { key: "tax", label: "Thuáº¿" },
  { key: "customCode", label: "TÃ¹y biáº¿n mÃ£" },
  { key: "seo", label: "SEO" },
  { key: "currency", label: "Tiá»n tá»‡" },
] as const;

const DEFAULT_EMAIL_TEMPLATES = [
  { key: "welcome", label: "ChÃ o má»«ng Ä‘Äƒng kÃ½", subject: "ChÃ o má»«ng Ä‘áº¿n AutoParts!", body: "Xin chÃ o {{name}},\n\nCáº£m Æ¡n báº¡n Ä‘Ã£ Ä‘Äƒng kÃ½ tÃ i khoáº£n táº¡i AutoParts. ChÃºng tÃ´i ráº¥t vui Ä‘Æ°á»£c phá»¥c vá»¥ báº¡n." },
  { key: "order_confirmed", label: "XÃ¡c nháº­n Ä‘Æ¡n hÃ ng", subject: "XÃ¡c nháº­n Ä‘Æ¡n hÃ ng {{orderId}}", body: "Xin chÃ o {{name}},\n\nÄÆ¡n hÃ ng {{orderId}} cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c nháº­n vÃ  sáº½ sá»›m Ä‘Æ°á»£c xá»­ lÃ½." },
  { key: "order_shipped", label: "ÄÆ¡n hÃ ng Ä‘ang giao", subject: "ÄÆ¡n hÃ ng {{orderId}} Ä‘ang Ä‘Æ°á»£c giao", body: "ÄÆ¡n hÃ ng {{orderId}} Ä‘ang trÃªn Ä‘Æ°á»ng Ä‘áº¿n báº¡n. MÃ£ váº­n Ä‘Æ¡n: {{tracking}}" },
  { key: "order_delivered", label: "ÄÆ¡n hÃ ng Ä‘Ã£ giao", subject: "ÄÆ¡n hÃ ng {{orderId}} Ä‘Ã£ giao thÃ nh cÃ´ng", body: "ÄÆ¡n hÃ ng {{orderId}} Ä‘Ã£ Ä‘Æ°á»£c giao. Cáº£m Æ¡n báº¡n Ä‘Ã£ mua sáº¯m táº¡i AutoParts!" },
  { key: "return_approved", label: "Duyá»‡t Ä‘á»•i tráº£", subject: "YÃªu cáº§u Ä‘á»•i tráº£ {{returnId}} Ä‘Æ°á»£c duyá»‡t", body: "YÃªu cáº§u Ä‘á»•i tráº£ {{returnId}} cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t. Vui lÃ²ng lÃ m theo hÆ°á»›ng dáº«n Ä‘á»ƒ hoÃ n táº¥t." },
  { key: "refund_processed", label: "HoÃ n tiá»n", subject: "HoÃ n tiá»n Ä‘Æ¡n {{orderId}}", body: "ÄÆ¡n hÃ ng {{orderId}} Ä‘Ã£ Ä‘Æ°á»£c hoÃ n tiá»n {{amount}}. Vui lÃ²ng kiá»ƒm tra tÃ i khoáº£n trong 3-5 ngÃ y lÃ m viá»‡c." },
];

type TabKey = typeof TABS[number]["key"];

// â”€â”€ Logo Uploader with client-side background removal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              <p className="text-xs text-[#8f9294] mb-1">Gá»‘c</p>
              <img src={original!} alt="Gá»‘c" className="h-12 object-contain" style={{ background: "#e5e5e5" }} />
            </div>
            <svg width="20" height="20" fill="none" stroke="var(--ap-primary)" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <div className="text-center">
              <p className="text-xs text-[#8f9294] mb-1">Sau xÃ³a ná»n</p>
              <img src={preview} alt="ÄÃ£ xá»­ lÃ½" className="h-12 object-contain" style={{ background: "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 10px 10px" }} />
            </div>
          </div>) : (
          <div className="py-4">{currentLogo ? (
              <div className="mb-4">
                <p className="text-xs font-semibold text-green-600 mb-2">Logo Ä‘ang sá»­ dá»¥ng:</p>
                <img src={currentLogo} alt="Current Logo" className="mx-auto h-16 object-contain p-2 rounded-lg" style={{ background: "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 10px 10px" }} />
              </div>) : (
              <svg className="mx-auto mb-2 text-[#8f9294]" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 20M6 8a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>)}
            <p className="text-sm text-[#44494d] font-medium">{currentLogo ? "KÃ©o tháº£ hoáº·c click Ä‘á»ƒ thay Ä‘á»•i logo" : "KÃ©o tháº£ hoáº·c click Ä‘á»ƒ chá»n áº£nh logo"}</p>
            <p className="text-xs text-[#8f9294] mt-1">PNG, JPG, SVG â€“ ná»n tráº¯ng sáº½ tá»± Ä‘á»™ng Ä‘Æ°á»£c xÃ³a</p>
          </div>)}
      </div>{/* Threshold control */}
      {preview && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Má»©c xÃ³a ná»n:</label>
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
            style={{ background: "var(--ap-primary)" }}>{uploading ? "Äang lÆ°u..." : "âœ“ Ãp dá»¥ng logo nÃ y"}
          </button>
          <button onClick={() => { setPreview(null); setOriginal(null); setStatus("idle"); if (fileRef.current) fileRef.current.value = ""; }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#8f9294] hover:text-[#44494d] border border-[#e5e5e5]">Chá»n láº¡i
          </button>{status === "ok" && <span className="text-green-600 text-sm font-medium">âœ“ Logo Ä‘Ã£ cáº­p nháº­t toÃ n há»‡ thá»‘ng!</span>}
          {status === "err" && <span className="text-red-500 text-sm font-medium">âœ• Lá»—i khi táº£i lÃªn. Thá»­ láº¡i!</span>}
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
          <span className="text-xs text-[#8f9294]">Favicon hiá»‡n táº¡i</span>
        </div>)}
      {preview && (
        <div className="mb-3 flex items-center gap-3 p-2 border border-[#1a4b97] rounded">
          <img src={preview} alt="preview" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span className="text-xs text-[#1a4b97]">Xem trÆ°á»›c</span>
        </div>)}
      <input id="favicon-upload-input" ref={ref} type="file" accept=".png,.ico,.jpg,.jpeg,.svg" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        className="block w-full text-sm text-[#44494d] file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-[#1a4b97] file:text-white file:font-semibold" />{preview && (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={handleUpload} disabled={uploading} className="px-4 py-1.5 rounded text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--ap-primary)" }}>{uploading ? "Äang lÆ°u..." : "Ãp dá»¥ng favicon"}
          </button>{status === "ok" && <span className="text-green-600 text-xs">âœ“ ÄÃ£ cáº­p nháº­t</span>}
          {status === "err" && <span className="text-red-500 text-xs">âœ• Lá»—i táº£i lÃªn</span>}
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
    brandName: "AutoParts", brandShort: "AP", greeting: "AutoParts xin chÃ o!",
    hotline: "19008095", tagline: "Ná»n táº£ng mua phá»¥ tÃ¹ng\nÃ´ tÃ´ chÃ­nh hÃ£ng hÃ ng Ä‘áº§u\nViá»‡t Nam",
  });
  const [commitments, setCommitments] = useState([
    { text: "ÄÆ°á»£c váº­n hÃ nh bá»Ÿi AutoParts" },
    { text: "Thanh toÃ¡n hoÃ n toÃ n báº±ng VND" },
    { text: "Theo dÃµi hÃ nh trÃ¬nh qua web" },
    { text: "Order trá»±c tiáº¿p vÃ  nhanh chÃ³ng" },
  ]);
  const [footer, setFooter] = useState({
    companyName: "CÃ”NG TY Cá»” PHáº¦N AUTOPARTS",
    registrationNo: "0104093672",
    issuedBy: "do PhÃ²ng Ä‘Äƒng kÃ½ kinh doanh - Sá»Ÿ Káº¿ hoáº¡ch vÃ  Äáº§u tÆ° TP HÃ  Ná»™i cáº¥p ngÃ y 03/07/2009",
    manager: "Nguyá»…n Tuáº¥n Anh",
    address: "TÃ²a nhÃ  AutoParts, NgÃµ 15 Duy TÃ¢n, Cáº§u Giáº¥y, HÃ  Ná»™i",
    email: "cskh@autoparts.vn", phone: "19008095",
    newsletterTitle: "ÄÄƒng kÃ½ nháº­n khuyáº¿n mÃ£i", newsletterSubtitle: "Nháº­n Flash Sale & Æ°u Ä‘Ã£i Ä‘á»™c quyá»n sá»›m nháº¥t", newsletterPromo: "MÃ£ GIAMGIA10 â€” giáº£m 10% cho Ä‘Æ¡n Ä‘áº§u tiÃªn",
    supportLinks: ["Trung tÃ¢m há»— trá»£","HÆ°á»›ng dáº«n Ä‘áº·t hÃ ng","HÆ°á»›ng dáº«n kÃ½ há»£p Ä‘á»“ng Ä‘iá»‡n tá»­","HÆ°á»›ng dáº«n sá»­ dá»¥ng","Æ¯á»›c tÃ­nh chi phÃ­ váº­n chuyá»ƒn"],
    policyLinks: ["ChÃ­nh sÃ¡ch váº­n chuyá»ƒn","ChÃ­nh sÃ¡ch báº£o máº­t thÃ´ng tin cÃ¡ nhÃ¢n","ChÃ­nh sÃ¡ch tráº£ hÃ ng hoÃ n tiá»n","HÃ ng cáº¥m, hÃ ng gá»­i cÃ³ Ä‘iá»u kiá»‡n"],
    aboutLinks: ["Giá»›i thiá»‡u","Äiá»u khoáº£n dá»‹ch vá»¥","Quy cháº¿ hoáº¡t Ä‘á»™ng sÃ n","Giao dá»‹ch TMÄT","Kinh nghiá»‡m AutoParts"],
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
      { code: "VND", symbol: "â‚«", rate: 1 },
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
    note: "QuÃ©t mÃ£ QR hoáº·c chuyá»ƒn khoáº£n theo thÃ´ng tin bÃªn dÆ°á»›i. Ghi ná»™i dung: TT + mÃ£ Ä‘Æ¡n.",
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
    // Ãp dá»¥ng mÃ u/nÃºt NGAY trÃªn toÃ n site (ThemeProvider láº¯ng nghe sá»± kiá»‡n nÃ y)
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
      <h1 className="text-lg font-bold text-[#44494d]">CÃ i Ä‘áº·t há»‡ thá»‘ng</h1>
      <button onClick={handleSave} className={`px-4 py-2 rounded-lg text-sm font-semibold ${saved ? "bg-green-500 text-white" : "text-white"}`} style={saved ? {} : { background: "var(--ap-primary)" }}>{saved ? "âœ“ ÄÃ£ lÆ°u!" : "LÆ°u cÃ i Ä‘áº·t"}
      </button>
    </div>
    <div className="px-6 flex border-t border-[#f0f0f0]">{TABS.map(t => (
        <button key={t.key} onClick={() => setTab(t.key)}
          className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t.key ? "border-[#1a4b97] text-[#1a4b97]" : "border-transparent text-[#8f9294] hover:text-[#44494d]"}`}>{t.label}
        </button>))}
    </div>
  </div>

  <div className="p-6 max-w-3xl space-y-5">{loading && <div className="text-center py-12 text-[#8f9294]">Äang táº£i...</div>}

  {/* â”€â”€ BRANDING â”€â”€ */}
  {!loading && tab === "branding" && (
    <>{/* Logo Upload Card */}
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1">Logo há»‡ thá»‘ng</h2>
      <p className="text-xs text-[#8f9294] mb-4">Táº£i lÃªn logo má»›i. Há»‡ thá»‘ng sáº½ <strong>tá»± Ä‘á»™ng xÃ³a ná»n tráº¯ng</strong> trÆ°á»›c khi lÆ°u.</p>
      <LogoUploader cardCls={cardCls} currentLogo={(branding as any).logoUrl} />
    </div>

    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">ThÃ´ng tin thÆ°Æ¡ng hiá»‡u</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>TÃªn thÆ°Æ¡ng hiá»‡u</label>
          <input value={branding.brandName} onChange={e => setBranding(b => ({ ...b, brandName: e.target.value }))} className={inputCls} placeholder="AutoParts" />
        </div>
        <div>
          <label className={labelCls}>KÃ½ hiá»‡u viáº¿t táº¯t (Logo)</label>
          <input value={branding.brandShort} onChange={e => setBranding(b => ({ ...b, brandShort: e.target.value }))} className={inputCls} placeholder="AP" maxLength={4} />
        </div>
        <div>
          <label className={labelCls}>Lá»i chÃ o Top Bar</label>
          <input value={branding.greeting} onChange={e => setBranding(b => ({ ...b, greeting: e.target.value }))} className={inputCls} placeholder="AutoParts xin chÃ o!" />
        </div>
        <div>
          <label className={labelCls}>Hotline</label>
          <input value={branding.hotline} onChange={e => setBranding(b => ({ ...b, hotline: e.target.value }))} className={inputCls} placeholder="19008095" />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Tagline (má»—i dÃ²ng xuá»‘ng hÃ ng)</label>
          <textarea rows={3} value={branding.tagline} onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))} className={inputCls + " resize-none"} placeholder="Ná»n táº£ng mua phá»¥ tÃ¹ng&#10;Ã´ tÃ´ chÃ­nh hÃ£ng" />
        </div>
      </div>
      <div className="mt-4 p-3 rounded-xl text-xs text-blue-700" style={{ background: "#EFF6FF" }}>Thay Ä‘á»•i sáº½ cáº­p nháº­t trá»±c tiáº¿p trÃªn Header, Footer vÃ  toÃ n bá»™ trang chá»§ sau khi nháº¥n &quot;LÆ°u cÃ i Ä‘áº·t&quot;.
      </div>
    </div>
    </>)}

  {/* â”€â”€ COLORS â”€â”€ */}
  {!loading && tab === "branding" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-3">Favicon</h2>
      <p className="text-sm text-[#8f9294] mb-3">Icon hiá»ƒn thá»‹ trÃªn tab trÃ¬nh duyá»‡t. Khuyáº¿n nghá»‹ PNG/ICO 32Ã—32 hoáº·c 48Ã—48 px.</p>
      <FaviconUploader currentFavicon={branding.faviconUrl as string | undefined} />
    </div>)}

  {!loading && tab === "colors" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1">Báº£ng phá»‘i mÃ u há»‡ thá»‘ng</h2>
      <p className="text-xs text-[#8f9294] mb-5">Thay Ä‘á»•i báº¥t ká»³ mÃ u nÃ o bÃªn dÆ°á»›i. Nháº¥n "LÆ°u cÃ i Ä‘áº·t" vÃ  táº£i láº¡i trang Ä‘á»ƒ Ã¡p dá»¥ng toÃ n bá»™.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[
          ["primary", "MÃ u chÃ­nh (nÃºt, active)"],
          ["primaryDark", "MÃ u chÃ­nh Ä‘áº­m"],
          ["accentRed", "MÃ u nháº¥n (sale, giáº£m giÃ¡)"],
          ["sidebarBg", "Ná»n Sidebar"],
          ["sidebarBorder", "Viá»n Sidebar"],
          ["sidebarText", "Chá»¯ Sidebar"],
          ["topBarBg", "Ná»n Top Bar"],
          ["topBarText", "Chá»¯ Top Bar"],
          ["headerBg", "Ná»n Header"],
          ["textPrimary", "MÃ u chá»¯ chÃ­nh"],
          ["textMuted", "MÃ u chá»¯ phá»¥"],
          ["linkColor", "MÃ u link"],
          ["pageBg", "Ná»n trang"],
          ["cardBg", "Ná»n tháº»/card"],
          ["borderColor", "Viá»n/Ä‘Æ°á»ng káº»"],
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
        <label className="text-xs font-semibold text-slate-600">Bo gÃ³c nÃºt (px):</label>
        <input
          type="range" min={0} max={24}
          value={Number(theme.buttonRadius) || 8}
          onChange={e => setTheme(t => ({ ...t, buttonRadius: e.target.value }))}
          className="flex-1 accent-[#1a4b97]"
        />
        <span className="text-xs text-[#8f9294] w-8">{theme.buttonRadius}px</span>
      </div>{/* Live preview */}
      <div className="mt-5 p-4 rounded-xl border border-[#e5e5e5]" style={{ background: theme.pageBg }}>
        <p className="text-xs font-semibold text-slate-500 mb-3">Xem trÆ°á»›c</p>
        <div className="flex items-center gap-3 mb-3">
          <button className="px-4 py-2 text-white text-sm font-semibold" style={{ background: theme.primary, borderRadius: theme.buttonRadius + "px" }}>NÃºt chÃ­nh</button>
          <button className="px-4 py-2 text-white text-sm font-semibold" style={{ background: theme.primaryDark, borderRadius: theme.buttonRadius + "px" }}>NÃºt tá»‘i</button>
          <span className="text-sm" style={{ color: theme.linkColor }}>Link máº«u</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-lg" style={{ background: theme.sidebarBg, color: theme.sidebarText }}>
            <p className="text-xs font-medium">Sidebar máº«u</p>
          </div>
          <div className="px-4 py-3 rounded-lg border" style={{ background: theme.cardBg, borderColor: theme.borderColor }}>
            <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>TiÃªu Ä‘á»</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>MÃ´ táº£ phá»¥</p>
          </div>
          <div className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ background: theme.accentRed }}>-20%</div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl text-xs text-blue-700" style={{ background: "#EFF6FF" }}>Sau khi lÆ°u, má»i trang Ä‘á»u tá»± Ä‘á»™ng Ã¡p dá»¥ng báº£ng mÃ u má»›i. Náº¿u khÃ´ng tháº¥y thay Ä‘á»•i, nháº¥n Ctrl+F5 Ä‘á»ƒ xÃ³a cache trÃ¬nh duyá»‡t.
      </div>
    </div>)}

  {/* â”€â”€ COMMITMENTS â”€â”€ */}
  {!loading && tab === "commitments" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Thanh cam káº¿t (Black Bar)</h2>
      <p className="text-xs text-[#8f9294] mb-4">4 dÃ²ng cam káº¿t hiá»ƒn thá»‹ trÃªn thanh ná»n Ä‘en phÃ­a dÆ°á»›i Header.</p>
      <div className="space-y-3">{commitments.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-[#8f9294] w-6 shrink-0">#{i+1}</span>
            <input value={c.text} onChange={e => {
              const arr = [...commitments]; arr[i] = { text: e.target.value }; setCommitments(arr);
            }} className={inputCls} placeholder={`Cam káº¿t #${i+1}`} />{commitments.length > 1 && (
              <button onClick={() => setCommitments(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm font-bold shrink-0">âœ•</button>)}
          </div>))}
      </div>{commitments.length < 6 && (
        <button onClick={() => setCommitments(prev => [...prev, { text: "" }])} className="mt-3 text-sm text-[#1a4b97] font-semibold hover:opacity-80">+ ThÃªm cam káº¿t</button>)}
    </div>)}

  {/* â”€â”€ FOOTER â”€â”€ */}
  {!loading && tab === "footer" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">ThÃ´ng tin cÃ´ng ty (chÃ¢n trang)</h2>
      <div className="grid md:grid-cols-2 gap-4">{[
          ["TÃªn cÃ´ng ty", "companyName", "CÃ”NG TY Cá»” PHáº¦N..."],
          ["MÃ£ sá»‘ doanh nghiá»‡p", "registrationNo", "0104093672"],
          ["NgÆ°á»i quáº£n lÃ½", "manager", "Nguyá»…n Tuáº¥n Anh"],
          ["Äá»‹a chá»‰", "address", "TÃ²a nhÃ  AutoPart..."],
          [lang === "en" ? "Email" : lang === "zh" ? "电子邮件" : "Email", "email", "cskh@autoparts.vn"],
          ["Sá»‘ Ä‘iá»‡n thoáº¡i", "phone", "19008095"],
        ].map(([label, key, ph]) => (
          <div key={key}>
            <label className={labelCls}>{lang === "en" ? {primary: "Primary Color", primaryDark: "Primary Dark", accentRed: "Accent Red", sidebarBg: "Sidebar BG", sidebarBorder: "Sidebar Border", sidebarText: "Sidebar Text", topBarBg: "Top Bar BG", topBarText: "Top Bar Text", headerBg: "Header BG", textPrimary: "Text Primary", textMuted: "Text Muted", linkColor: "Link Color", pageBg: "Page BG", cardBg: "Card BG", borderColor: "Border Color"}[key] : lang === "zh" ? {primary: "主色", primaryDark: "深主色", accentRed: "强调红", sidebarBg: "侧边栏背景", sidebarBorder: "侧边栏边框", sidebarText: "侧边栏文字", topBarBg: "顶栏背景", topBarText: "顶栏文字", headerBg: "页眉背景", textPrimary: "主要文字", textMuted: "次要文字", linkColor: "链接颜色", pageBg: "页面背景", cardBg: "卡片背景", borderColor: "边框颜色"}[key] : label}</label>
            <input value={(footer as any)[key] || ""} onChange={e => setFooter(f => ({ ...f, [key]: e.target.value }))} className={inputCls} placeholder={ph} />
          </div>))}
        <div className="md:col-span-2">
          <label className={labelCls}>CÆ¡ quan cáº¥p giáº¥y phÃ©p</label>
          <input value={footer.issuedBy} onChange={e => setFooter(f => ({ ...f, issuedBy: e.target.value }))} className={inputCls} />
        </div>
      </div>
    </div>{/* Footer link groups */}
    {[
      ["LiÃªn káº¿t Há»— trá»£ khÃ¡ch hÃ ng", "supportLinks"],
      ["LiÃªn káº¿t ChÃ­nh sÃ¡ch", "policyLinks"],
      ["LiÃªn káº¿t Vá» chÃºng tÃ´i", "aboutLinks"],
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
              }} className="text-red-400 hover:text-red-600 text-sm font-bold shrink-0">âœ•</button>
            </div>))}
        </div>
        <button onClick={() => setFooter(f => ({ ...f, [key]: [...(f as any)[key], ""] }))} className="mt-2 text-sm text-[#1a4b97] font-semibold hover:opacity-80">+ ThÃªm liÃªn káº¿t</button>
      </div>))}
    {/* ÄÄƒng kÃ½ nháº­n khuyáº¿n mÃ£i (newsletter) */}
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1 text-sm">ÄÄƒng kÃ½ nháº­n khuyáº¿n mÃ£i (chÃ¢n trang)</h2>
      <p className="text-xs text-[#8f9294] mb-3">TiÃªu Ä‘á», mÃ´ táº£ vÃ  Æ°u Ä‘Ã£i hiá»ƒn thá»‹ á»Ÿ Ã´ "ÄÄƒng kÃ½ nháº­n khuyáº¿n mÃ£i" dÆ°á»›i chÃ¢n trang. NgÆ°á»i dÃ¹ng pháº£i Ä‘Äƒng nháº­p + email Ä‘Ãºng Ä‘á»‹nh dáº¡ng má»›i nháº­n Ä‘Æ°á»£c.</p>
      <div className="space-y-3">
        <div><label className={labelCls}>TiÃªu Ä‘á»</label><input value={(footer as any).newsletterTitle || ""} onChange={e => setFooter(f => ({ ...f, newsletterTitle: e.target.value }))} className={inputCls} placeholder="ÄÄƒng kÃ½ nháº­n khuyáº¿n mÃ£i" /></div>
        <div><label className={labelCls}>MÃ´ táº£</label><input value={(footer as any).newsletterSubtitle || ""} onChange={e => setFooter(f => ({ ...f, newsletterSubtitle: e.target.value }))} className={inputCls} placeholder="Nháº­n Flash Sale & Æ°u Ä‘Ã£i..." /></div>
        <div><label className={labelCls}>Æ¯u Ä‘Ã£i (hiá»‡n sau khi Ä‘Äƒng kÃ½ thÃ nh cÃ´ng)</label><input value={(footer as any).newsletterPromo || ""} onChange={e => setFooter(f => ({ ...f, newsletterPromo: e.target.value }))} className={inputCls} placeholder="VD: MÃ£ GIAMGIA10 â€” giáº£m 10% Ä‘Æ¡n Ä‘áº§u" /></div>
      </div>
    </div>
    {/* LiÃªn káº¿t máº¡ng xÃ£ há»™i â€” hiá»‡n trÃªn thanh ná»•i gÃ³c pháº£i + chÃ¢n trang */}
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1 text-sm">LiÃªn káº¿t máº¡ng xÃ£ há»™i</h2>
      <p className="text-xs text-[#8f9294] mb-3">URL hiá»ƒn thá»‹ á»Ÿ thanh ná»•i gÃ³c pháº£i mÃ n hÃ¬nh vÃ  chÃ¢n trang. Äá»ƒ trá»‘ng = icon váº«n hiá»‡n nhÆ°ng KHÃ”NG báº¥m Ä‘Æ°á»£c (tÄ©nh).</p>
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

  {/* â”€â”€ FEATURES â”€â”€ */}
  {!loading && tab === "features" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Báº­t/Táº¯t tÃ­nh nÄƒng</h2>
      <div className="space-y-0">{[
        ["flashSale", "Flash Sale & Countdown", "Báº­t section flash sale trÃªn trang chá»§"],
        ["voucherSystem", "Há»‡ thá»‘ng Voucher & MÃ£ giáº£m giÃ¡", "Cho phÃ©p khÃ¡ch nháº­p mÃ£ giáº£m giÃ¡"],
        ["mechanicPortal", "Portal Thá»£ Pro", "Báº­t tÃ­nh nÄƒng Ä‘áº·t phá»¥ tÃ¹ng cho thá»£"],
        ["affiliatePortal", "Portal Äáº¡i LÃ½ / CTV", "Cho phÃ©p Ä‘Äƒng kÃ½ vÃ  quáº£n lÃ½ affiliate"],
        ["warrantyTracking", "Theo dÃµi báº£o hÃ nh", "KhÃ¡ch hÃ ng track báº£o hÃ nh trá»±c tuyáº¿n"],
        ["vinLookup", "VIN Lookup (API)", "Tra cá»©u xe qua mÃ£ VIN thá»±c táº¿"],
        ["maintenanceMode", "Cháº¿ Ä‘á»™ báº£o trÃ¬", "Táº¡m ngÆ°ng hoáº¡t Ä‘á»™ng, hiá»‡n trang thÃ´ng bÃ¡o"],
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

  {/* â”€â”€ SECURITY â”€â”€ */}
  {!loading && tab === "emailTemplates" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Máº«u email vÃ  thÃ´ng bÃ¡o</h2>
      <p className="text-sm text-[#8f9294] mb-4">Cáº¥u hÃ¬nh cÃ¡c máº«u email gá»­i tá»± Ä‘á»™ng. Há»— trá»£ biáº¿n: <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{name}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{orderId}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{tracking}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{amount}}`}</code> <code className="bg-[#f4f4f4] px-1.5 py-0.5 rounded text-xs">{`{{returnId}}`}</code></p>
      <div className="space-y-4">{emailTemplates.map((tpl, idx) => (
          <div key={tpl.key} className="border border-[#e5e5e5] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-[#44494d]">{tpl.label} <span className="text-xs text-[#8f9294] font-normal ml-2">({tpl.key})</span></p>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>TiÃªu Ä‘á»</label>
                <input value={tpl.subject} onChange={e => { const ns = [...emailTemplates]; ns[idx] = { ...ns[idx], subject: e.target.value }; setEmailTemplates(ns); }} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ná»™i dung</label>
                <textarea value={tpl.body} onChange={e => { const ns = [...emailTemplates]; ns[idx] = { ...ns[idx], body: e.target.value }; setEmailTemplates(ns); }} rows={4} className={inputCls + " font-mono text-xs"} />
              </div>
            </div>
          </div>))}
      </div>
      <p className="text-xs text-[#8f9294] mt-4">LÆ°u Ã½: Há»‡ thá»‘ng chÆ°a tÃ­ch há»£p gá»­i email tá»± Ä‘á»™ng. ÄÃ¢y lÃ  pháº§n lÆ°u trá»¯ template Ä‘á»ƒ chuáº©n bá»‹ tÃ­ch há»£p sau (SendGrid/SMTP).</p>
    </div>)}

  {!loading && tab === "tax" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-3">Thuáº¿ VAT</h2>
      <p className="text-sm text-[#8f9294] mb-4">Äáº·t 0 Ä‘á»ƒ táº¯t VAT. Khi &gt; 0, VAT sáº½ Ä‘Æ°á»£c tÃ­nh trÃªn (táº¡m tÃ­nh - voucher giáº£m) vÃ  cá»™ng vÃ o tá»•ng thanh toÃ¡n táº¡i checkout.</p>
      <div className="max-w-xs">
        <label className={labelCls}>Thuáº¿ suáº¥t VAT (%)</label>
        <input type="number" min="0" max="100" step="0.1" value={general.vatPercent} onChange={e => setGeneral(p => ({ ...p, vatPercent: e.target.value }))} className={inputCls} />
      </div>
    </div>)}

  {!loading && tab === "customCode" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-2">CSS tÃ¹y biáº¿n</h2>
      <p className="text-xs text-[#8f9294] mb-3">Inject vÃ o &lt;head&gt; cá»§a táº¥t cáº£ trang. Cáº©n tháº­n vá»›i selector toÃ n cá»¥c.</p>
      <textarea value={customCss} onChange={e => setCustomCss(e.target.value)} rows={10} placeholder="/* VÃ­ dá»¥: .ap-container { max-width: 1280px; } */" className={inputCls + " font-mono text-xs"} />
    </div>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-2">JavaScript tÃ¹y biáº¿n</h2>
      <p className="text-xs text-[#8f9294] mb-3">Inject vÃ o cuá»‘i &lt;body&gt;. DÃ¹ng cho analytics, tracking, chat widget. <span className="text-red-500 font-semibold">KhÃ´ng paste mÃ£ khÃ´ng tin cáº­y.</span></p>
      <textarea value={customJs} onChange={e => setCustomJs(e.target.value)} rows={10} placeholder="// VÃ­ dá»¥: window.addEventListener('load', () => console.log('loaded'));" className={inputCls + " font-mono text-xs"} />
    </div>
    </>)}

  {!loading && tab === "seo" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-2">{lang === "en" ? "SEO Meta per page" : lang === "zh" ? "每页的SEO元数据" : "SEO Meta theo trang"}</h2>
      <p className="text-xs text-[#8f9294] mb-4">Cáº¥u hÃ¬nh &lt;title&gt; vÃ  &lt;meta name=&quot;description&quot;&gt; cho tá»«ng trang ná»™i dung. Bá» trá»‘ng Ä‘á»ƒ dÃ¹ng giÃ¡ trá»‹ máº·c Ä‘á»‹nh.</p>
      <div className="space-y-4">{Object.entries(seoMeta).map(([slug, meta]) => (
          <div key={slug} className="border border-[#e5e5e5] rounded-xl p-3">
            <p className="font-semibold text-[#44494d] mb-2">/{slug === "home" ? "" : slug}</p>
            <div className="space-y-2">
              <input value={meta.title} onChange={e => setSeoMeta(prev => ({ ...prev, [slug]: { ...prev[slug], title: e.target.value } }))} placeholder="Title (50-60 kÃ½ tá»±)" className={inputCls} />
              <textarea value={meta.description} onChange={e => setSeoMeta(prev => ({ ...prev, [slug]: { ...prev[slug], description: e.target.value } }))} placeholder="Description (150-160 kÃ½ tá»±)" rows={2} className={inputCls} />
            </div>
          </div>))}
      </div>
    </div>)}

  {!loading && tab === "currency" && (
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-3">Tiá»n tá»‡ vÃ  tá»· giÃ¡</h2>
      <p className="text-sm text-[#8f9294] mb-4">Cáº¥u hÃ¬nh cÃ¡c Ä‘Æ¡n vá»‹ tiá»n tá»‡. Tá»· giÃ¡ lÃ  <strong>1 Ä‘Æ¡n vá»‹ = X VNÄ</strong>. KhÃ¡ch hÃ ng chá»n Ä‘Æ°á»£c trong header storefront.</p>
      <div className="space-y-3">{currency.supported.map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-3 border border-[#e5e5e5] rounded">
            <input value={c.code} onChange={e => { const next = [...currency.supported]; next[i] = { ...next[i], code: e.target.value.toUpperCase() }; setCurrency({ ...currency, supported: next }); }} placeholder="Code (VD: USD)" className="w-20 px-2 py-1 border border-[#e5e5e5] rounded text-sm font-mono" maxLength={5} />
            <input value={c.symbol} onChange={e => { const next = [...currency.supported]; next[i] = { ...next[i], symbol: e.target.value }; setCurrency({ ...currency, supported: next }); }} placeholder="$" className="w-16 px-2 py-1 border border-[#e5e5e5] rounded text-sm" maxLength={3} />
            <input type="number" min="1" step="any" value={c.rate} onChange={e => { const next = [...currency.supported]; next[i] = { ...next[i], rate: Number(e.target.value) || 1 }; setCurrency({ ...currency, supported: next }); }} placeholder="24500" className="flex-1 px-2 py-1 border border-[#e5e5e5] rounded text-sm" />
            <span className="text-xs text-[#8f9294] min-w-[80px]">VNÄ / 1 {c.code}</span>
            <button onClick={() => setCurrency({ ...currency, supported: currency.supported.filter((_, idx) => idx !== i) })} className="text-red-500 px-2" disabled={c.code === "VND"}>Ã—</button>
          </div>))}
        <button onClick={() => setCurrency({ ...currency, supported: [...currency.supported, { code: "EUR", symbol: "â‚¬", rate: 26800 }] })} className="px-3 py-1.5 rounded bg-[#1a4b97] text-white text-xs font-semibold">+ ThÃªm Ä‘Æ¡n vá»‹</button>
      </div>
      <p className="text-xs text-[#8f9294] mt-4">LÆ°u Ã½: VND luÃ´n lÃ  tiá»n tá»‡ gá»‘c (rate=1), khÃ´ng xoÃ¡ Ä‘Æ°á»£c. Äá»•i rate USD/EUR theo tá»· giÃ¡ thá»‹ trÆ°á»ng.</p>
    </div>)}

  {!loading && tab === "security" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">ThÃ´ng tin chung</h2>
      <div className="grid md:grid-cols-2 gap-4">{[
        ["TÃªn ná»n táº£ng", "siteName"],
        ["Email há»— trá»£", "supportEmail"],
        [lang === "en" ? "Hotline" : lang === "zh" ? "热线" : "Hotline", "supportPhone"],
        ["PhÃ­ ná»n táº£ng máº·c Ä‘á»‹nh (%)", "platformFeeDefault"],
        ["RÃºt tiá»n tá»‘i thiá»ƒu (VNÄ)", "minWithdraw"],
      ].map(([label, key]) => (
        <div key={key}>
          <label className={labelCls}>{lang === "en" ? {primary: "Primary Color", primaryDark: "Primary Dark", accentRed: "Accent Red", sidebarBg: "Sidebar BG", sidebarBorder: "Sidebar Border", sidebarText: "Sidebar Text", topBarBg: "Top Bar BG", topBarText: "Top Bar Text", headerBg: "Header BG", textPrimary: "Text Primary", textMuted: "Text Muted", linkColor: "Link Color", pageBg: "Page BG", cardBg: "Card BG", borderColor: "Border Color"}[key] : lang === "zh" ? {primary: "主色", primaryDark: "深主色", accentRed: "强调红", sidebarBg: "侧边栏背景", sidebarBorder: "侧边栏边框", sidebarText: "侧边栏文字", topBarBg: "顶栏背景", topBarText: "顶栏文字", headerBg: "页眉背景", textPrimary: "主要文字", textMuted: "次要文字", linkColor: "链接颜色", pageBg: "页面背景", cardBg: "卡片背景", borderColor: "边框颜色"}[key] : label}</label>
          <input value={general[key as keyof typeof general]} onChange={e => setGeneral(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
        </div>))}
      </div>
    </div>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">Báº£o máº­t & PhiÃªn Ä‘Äƒng nháº­p</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>Timeout phiÃªn (phÃºt)</label>
          <input value={security.sessionTimeout} onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))} type="number" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sá»‘ láº§n Ä‘Äƒng nháº­p sai tá»‘i Ä‘a</label>
          <input value={security.loginAttempts} onChange={e => setSecurity(p => ({ ...p, loginAttempts: e.target.value }))} type="number" className={inputCls} />
        </div>
      </div>
      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8f8fa" }}>
        <div>
          <p className="font-semibold text-[#44494d] text-sm">Báº¯t buá»™c 2FA cho Admin</p>
          <p className="text-xs text-[#8f9294]">Táº¥t cáº£ tÃ i khoáº£n Admin pháº£i báº­t xÃ¡c thá»±c 2 bÆ°á»›c</p>
        </div>
        <Toggle checked={security.twoFARequired} onChange={() => setSecurity(p => ({ ...p, twoFARequired: !p.twoFARequired }))} />
      </div>
    </div>
    </>)}

  {!loading && tab === "payment" && (
    <>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-1">MÃ£ QR thanh toÃ¡n</h2>
      <p className="text-xs text-[#8f9294] mb-4">Vá»›i <b>Chuyá»ƒn khoáº£n ngÃ¢n hÃ ng</b>: chá»‰ cáº§n nháº­p Ä‘Ãºng <b>NgÃ¢n hÃ ng + Sá»‘ tÃ i khoáº£n + Chá»§ tÃ i khoáº£n</b> bÃªn dÆ°á»›i â€” há»‡ thá»‘ng tá»± táº¡o <b>mÃ£ VietQR tháº­t</b> (kÃ¨m sá»‘ tiá»n + ná»™i dung Ä‘Æ¡n) cho khÃ¡ch quÃ©t. Ã” táº£i áº£nh QR dÆ°á»›i Ä‘Ã¢y dÃ nh cho <b>MoMo / ZaloPay</b> (táº£i QR vÃ­ cá»§a báº¡n); Ä‘á»ƒ trá»‘ng sáº½ dÃ¹ng QR minh hoáº¡.</p>
      <div className="flex items-center gap-5 flex-wrap">
        <div className="w-[150px] h-[150px] rounded-xl border-2 border-dashed border-[#e5e5e5] flex items-center justify-center overflow-hidden bg-[#f8f8fa] shrink-0">
          {payment.qrImage ? <img src={payment.qrImage} alt="QR" className="w-full h-full object-contain" /> : <span className="text-xs text-[#8f9294] text-center px-2">ChÆ°a cÃ³ QR</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer inline-block w-fit" style={{ background: "var(--ap-primary)" }}>
            Táº£i áº£nh QR
            <input type="file" accept={IMG_ACCEPT} className="hidden" onChange={async e => {
              const f = e.target.files?.[0]; if (!f) return;
              const verr = validateImageFile(f); if (verr) { imageError(verr); e.target.value = ""; return; }
              window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Äang kiá»ƒm tra mÃ£ QRâ€¦", type: "info" } }));
              const dataUrl = await fileToDataUrl(f);
              const isQr = await detectQrCode(dataUrl);
              if (isQr === false) {
                window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "áº¢nh khÃ´ng pháº£i mÃ£ QR há»£p lá»‡ â€” khÃ´ng lÆ°u. Vui lÃ²ng táº£i Ä‘Ãºng áº£nh mÃ£ QR ngÃ¢n hÃ ng.", type: "error" } }));
                e.target.value = ""; return;
              }
              setPayment(p => ({ ...p, qrImage: dataUrl }));
              window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: isQr === null ? "TrÃ¬nh duyá»‡t khÃ´ng kiá»ƒm tra Ä‘Æ°á»£c mÃ£ QR â€” hÃ£y Ä‘áº£m báº£o áº£nh Ä‘Ãºng lÃ  mÃ£ QR." : "ÄÃ£ nháº­n diá»‡n mÃ£ QR há»£p lá»‡.", type: isQr === null ? "warning" : "success" } }));
              e.target.value = "";
            }} />
          </label>
          {payment.qrImage && <button onClick={() => setPayment(p => ({ ...p, qrImage: "" }))} className="text-xs text-red-500 hover:text-red-600 font-medium text-left">âœ• XoÃ¡ QR</button>}
          <p className="text-[11px] text-[#8f9294] max-w-[260px]">Khuyáº¿n nghá»‹ áº£nh vuÃ´ng, rÃµ nÃ©t.</p>
        </div>
      </div>
    </div>
    <div className={cardCls}>
      <h2 className="font-bold text-[#44494d] mb-4">ThÃ´ng tin chuyá»ƒn khoáº£n</h2>
      <div className="grid md:grid-cols-2 gap-4">{([
        ["NgÃ¢n hÃ ng", "bankName"],
        ["Sá»‘ tÃ i khoáº£n", "bankAccount"],
        ["Chá»§ tÃ i khoáº£n", "bankHolder"],
      ] as [string, "bankName" | "bankAccount" | "bankHolder"][]).map(([label, key]) => (
        <div key={key}>
          <label className={labelCls}>{lang === "en" ? {primary: "Primary Color", primaryDark: "Primary Dark", accentRed: "Accent Red", sidebarBg: "Sidebar BG", sidebarBorder: "Sidebar Border", sidebarText: "Sidebar Text", topBarBg: "Top Bar BG", topBarText: "Top Bar Text", headerBg: "Header BG", textPrimary: "Text Primary", textMuted: "Text Muted", linkColor: "Link Color", pageBg: "Page BG", cardBg: "Card BG", borderColor: "Border Color"}[key] : lang === "zh" ? {primary: "主色", primaryDark: "深主色", accentRed: "强调红", sidebarBg: "侧边栏背景", sidebarBorder: "侧边栏边框", sidebarText: "侧边栏文字", topBarBg: "顶栏背景", topBarText: "顶栏文字", headerBg: "页眉背景", textPrimary: "主要文字", textMuted: "次要文字", linkColor: "链接颜色", pageBg: "页面背景", cardBg: "卡片背景", borderColor: "边框颜色"}[key] : label}</label>
          <input value={payment[key]} onChange={e => setPayment(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
        </div>))}
      </div>
      <div className="mt-4">
        <label className={labelCls}>Ghi chÃº hÆ°á»›ng dáº«n thanh toÃ¡n</label>
        <textarea rows={2} value={payment.note} onChange={e => setPayment(p => ({ ...p, note: e.target.value }))} className={inputCls + " resize-none"} />
      </div>
      <div className="mt-4 p-3 rounded-xl text-xs text-blue-700" style={{ background: "#EFF6FF" }}>MÃ£ QR + thÃ´ng tin nÃ y hiá»ƒn thá»‹ á»Ÿ bÆ°á»›c thanh toÃ¡n cá»§a khÃ¡ch. Nháº¥n &quot;LÆ°u cÃ i Ä‘áº·t&quot; Ä‘á»ƒ Ã¡p dá»¥ng.</div>
    </div>
    </>)}

  </div>
  </main>
  </>);
}



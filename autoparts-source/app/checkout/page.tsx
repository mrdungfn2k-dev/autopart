"use client";
import { useLang } from "@/lib/i18n";
import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/data";
import { getCart, getSelectedIds, getSelectedVouchers, saveSelectedVouchers, removeFromCart, saveSelectedIds } from "@/lib/cartStore";
import VoucherSelectorModal from "@/components/VoucherSelectorModal";
import LogoImage from "@/components/LogoImage";
import AddressModal, { AddressData } from "@/components/AddressModal";
import { useSearchParams } from "next/navigation";
import { getAuth, BUYER_ROLES } from "@/lib/auth";
import { clampPhone, validateField } from "@/lib/validators";

// Chỉ 2 phương thức: Thanh toán QR (mã QR admin cấu hình) + Thanh toán khi nhận hàng (COD)
const PAYMENT_METHODS = [
  {
    id: "qr", label: "Thanh toán QR",
    logo: "QR", color: "#1a4b97", bg: "#EFF4FB",
    desc: "Quét mã QR do cửa hàng cấu hình để chuyển khoản",
    group: "qr",
  },
  {
    id: "cod", label: "Thanh toán khi nhận hàng (COD)",
    logo: "COD", color: "#16A34A", bg: "#F0FDF4",
    desc: "Trả tiền mặt khi nhận hàng — không cần thẻ hay ví điện tử",
    group: "cash",
  },
];

const BANK_INFO = {
  bank: "Vietcombank",
  account: "1234 5678 9012 3456",
  name: "CONG TY AUTOPARTS VN",
  branch: "CN TP. Hồ Chí Minh",
};

// Mã ngân hàng theo chuẩn VietQR (napas247) — để tạo QR THẬT quét được bằng app ngân hàng.
const VIETQR_BANK_CODES: Record<string, string> = {
  vietcombank: "VCB", vcb: "VCB",
  techcombank: "TCB", tcb: "TCB",
  bidv: "BIDV",
  vietinbank: "ICB", icb: "ICB", vietin: "ICB",
  agribank: "VBA", vba: "VBA",
  mbbank: "MB", "mb bank": "MB", mb: "MB",
  acb: "ACB",
  vpbank: "VPB", vpb: "VPB",
  sacombank: "STB", stb: "STB",
  tpbank: "TPB", tpb: "TPB",
  hdbank: "HDB", hdb: "HDB",
  vib: "VIB",
  shb: "SHB",
  ocb: "OCB",
  msb: "MSB",
  scb: "SCB",
  eximbank: "EIB", eib: "EIB",
  pvcombank: "PVCB",
  seabank: "SEAB", seabank247: "SEAB",
  namabank: "NAB", "nam a bank": "NAB",
  bacabank: "BAB", "bac a bank": "BAB",
  lienvietpostbank: "LPB", lpbank: "LPB", lpb: "LPB",
  "ban viet": "BVB", bvbank: "BVB", vietcapitalbank: "BVB",
  abbank: "ABB", abb: "ABB",
  vietabank: "VAB",
};

/** Tạo URL ảnh VietQR THẬT (img.vietqr.io) từ thông tin NH admin cấu hình + số tiền + nội dung đơn.
 *  Trả null nếu không nhận diện được mã NH → fallback ảnh QR admin tự tải lên. */
function vietQrImage(bankName: string, account: string, holder: string, amount: number, content: string): string | null {
  const key = (bankName || "").toLowerCase().trim().replace(/\s+/g, " ");
  const code = VIETQR_BANK_CODES[key] || VIETQR_BANK_CODES[key.replace(/\s+/g, "")] || null;
  const acc = (account || "").replace(/[^0-9]/g, "");
  if (!code || !acc) return null;
  const params = new URLSearchParams();
  if (amount > 0) params.set("amount", String(Math.round(amount)));
  if (content) params.set("addInfo", content);
  if (holder) params.set("accountName", holder);
  return `https://img.vietqr.io/image/${code}-${acc}-qr_only.png?${params.toString()}`;
}

const MOCK_ADDRESSES: AddressData[] = [
  { id: '1', name: 'Nguyễn Văn An', phone: '0901 234 567', city: 'Hà Nội', address: '123 Trần Hưng Đạo, Phường Cửa Nam, Quận Hoàn Kiếm', isDefault: true, type: 'Nhà riêng' },
  { id: '2', name: 'Trần Thị Bình', phone: '0912 345 678', city: 'TP. Hồ Chí Minh', address: '456 Lê Lợi, Phường Bến Nghé, Quận 1', isDefault: false, type: 'Văn phòng' }
];

function QRBlock({ size = 120, content, image }: { size?: number; content: string; image?: string }) {
  // Nếu admin đã cấu hình ảnh QR thật → hiển thị ảnh đó (quét được); nếu chưa/lỗi thì vẽ QR minh hoạ.
  const [imgError, setImgError] = useState(false);
  if (image && !imgError) {
    return (
      <div className="rounded-xl overflow-hidden border border-[#f0f0f0] inline-block bg-white" style={{ padding: 8 }}>
        <img src={image} alt="QR thanh toán" onError={() => setImgError(true)} style={{ display: "block", width: size, height: size, objectFit: "contain" }} />
      </div>
    );
  }
  return (
    <div className="rounded-xl overflow-hidden border border-[#f0f0f0] inline-block text-center" style={{ padding: 8, background: "white" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
        <rect width="100" height="100" fill="white" />
        {[[5,5],[65,5],[5,65]].map(([x,y],i) => (
          <g key={i}>
            <rect x={x} y={y} width="30" height="30" fill="var(--ap-sidebar-bg)" rx="3" />
            <rect x={x+5} y={y+5} width="20" height="20" fill="white" rx="1" />
            <rect x={x+9} y={y+9} width="12" height="12" fill="var(--ap-sidebar-bg)" rx="1" />
          </g>
        ))}
        {Array.from({ length: 18 }, (_, i) => {
          const code = content.charCodeAt(i % content.length);
          return code % 3 === 0 ? (
            <rect key={i} x={40 + (i % 4) * 10} y={40 + Math.floor(i / 4) * 10} width="8" height="8" fill="var(--ap-sidebar-bg)" rx="1" />
          ) : null;
        })}
        <text x="50" y="95" textAnchor="middle" fontSize="7" fill="#8f9294">{content.slice(0, 12)}</text>
      </svg>
      <p className="text-[9px] text-[#8f9294] mt-1 leading-tight">Mã minh hoạ — dùng thông tin chuyển khoản bên dưới</p>
    </div>
  );
}

// Panel thanh toán QR — hiển thị mã QR admin cấu hình (settings.payment.qrImage)
function QRPanel({ orderId, amount, fp, qrImage, bank }: { orderId: string; amount: number; fp: (n: number) => string; qrImage?: string; bank?: { bankName?: string; bankAccount?: string; bankHolder?: string } }) {
  const hasQr = !!qrImage;
  return (
    <div className="mt-1 p-5 rounded-2xl border-2" style={{ borderColor: "#1a4b97", background: "#EFF4FB" }}>
      <p className="font-bold text-[#44494d] text-center mb-1">Quét mã QR để thanh toán</p>
      <p className="text-center text-xs text-[#8f9294] mb-3">Số tiền: <b className="text-[#1a4b97]">{fp(amount)}</b> · Mã đơn: <b className="font-mono">{orderId}</b></p>
      <div className="flex justify-center">
        {hasQr
          ? <div className="rounded-xl border border-[#e5e5e5] bg-white p-2 inline-block"><img src={qrImage} alt="Mã QR thanh toán" style={{ width: 200, height: 200, objectFit: "contain" }} /></div>
          : <div className="text-center text-sm text-[#8f9294] py-6 px-4 bg-white rounded-xl">Cửa hàng chưa cấu hình mã QR. Vui lòng chọn <b>Thanh toán khi nhận hàng</b> hoặc liên hệ hỗ trợ.</div>}
      </div>
      {hasQr && (bank?.bankName || bank?.bankAccount) && (
        <div className="mt-3 text-xs text-[#44494d] bg-white rounded-lg p-3 space-y-0.5">
          {bank?.bankName && <p>Ngân hàng: <b>{bank.bankName}</b></p>}
          {bank?.bankAccount && <p>Số TK: <b className="font-mono">{bank.bankAccount}</b></p>}
          {bank?.bankHolder && <p>Chủ TK: <b>{bank.bankHolder}</b></p>}
          <p className="text-[#8f9294] mt-1">Nội dung CK: TT {orderId}</p>
        </div>
      )}
      <p className="text-center text-xs text-[#8f9294] mt-3">Sau khi chuyển khoản, bấm "Xác nhận đã thanh toán" bên dưới.</p>
    </div>
  );
}

function MoMoPanel({ orderId, amount, fp, qrImage }: { orderId: string; amount: number; fp: (n: number) => string; qrImage?: string }) {
  return (
    <div className="mt-4 p-5 rounded-2xl border-2" style={{ borderColor: "#ae2070", background: "#FDF2F8" }}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg mb-3" style={{ background: "#ae2070" }}>M</div>
        <p className="font-bold text-[#44494d] mb-1">Quét QR để thanh toán MoMo</p>
        <p className="text-sm text-[#8f9294] mb-4">Mở app MoMo → Quét mã → Xác nhận</p>
        <QRBlock size={140} content={`MOMO|${orderId}|${amount}`} image={qrImage} />
        <div className="mt-4 w-full bg-white rounded-xl p-3 text-sm">
          <div className="flex justify-between mb-1"><span className="text-[#8f9294]">Số tiền:</span><span className="font-bold" style={{ color: "#ae2070" }}>{fp(amount)}</span></div>
          <div className="flex justify-between"><span className="text-[#8f9294]">Mã đơn:</span><span className="font-mono font-bold text-[#44494d]">{orderId}</span></div>
        </div>
      </div>
    </div>
  );
}

function ZaloPayPanel({ orderId, amount, fp, qrImage }: { orderId: string; amount: number; fp: (n: number) => string; qrImage?: string }) {
  return (
    <div className="mt-4 p-5 rounded-2xl border-2" style={{ borderColor: "#0068ff", background: "#EFF6FF" }}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg mb-3" style={{ background: "#0068ff" }}>Z</div>
        <p className="font-bold text-[#44494d] mb-1">Quét QR để thanh toán ZaloPay</p>
        <p className="text-sm text-[#8f9294] mb-4">Mở app ZaloPay → Quét mã → Xác nhận</p>
        <QRBlock size={140} content={`ZALOPAY|${orderId}|${amount}`} image={qrImage} />
        <div className="mt-4 w-full bg-white rounded-xl p-3 text-sm">
          <div className="flex justify-between mb-1"><span className="text-[#8f9294]">Số tiền:</span><span className="font-bold" style={{ color: "#0068ff" }}>{fp(amount)}</span></div>
          <div className="flex justify-between"><span className="text-[#8f9294]">Mã đơn:</span><span className="font-mono font-bold text-[#44494d]">{orderId}</span></div>
        </div>
      </div>
    </div>
  );
}

function PayPalPanel({ amount, fp }: { amount: number; fp: (n: number) => string }) {
  const usd = (amount / 25000).toFixed(2);
  return (
    <div className="mt-4 p-5 rounded-2xl border-2" style={{ borderColor: "#003087", background: "#EEF4FF" }}>
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-sm mb-3" style={{ background: "linear-gradient(135deg, #003087, #009cde)" }}>PayPal</div>
        <p className="font-bold text-[#44494d] mb-1">Thanh toán qua PayPal</p>
        <p className="text-sm text-[#8f9294] mb-4">Số tiền: <span className="font-bold text-blue-700">${usd} USD</span> (≈ {fp(amount)})</p>
        <a href="https://paypal.com" target="_blank" rel="noreferrer"
          className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #009cde, #003087)" }}>
          Tiếp tục với PayPal →
        </a>
      </div>
    </div>
  );
}

function CardPanel() {
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const formatCard = (v: string) => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})/, "$1/").slice(0, 5);

  return (
    <div className="mt-4 p-5 rounded-2xl border border-[#e5e5e5] bg-[#f8f8fa]">
      <p className="font-bold text-[#44494d] mb-4 flex items-center gap-2">
        <span className="text-[#8f9294]">Thẻ Visa / Mastercard / JCB</span>
        <span className="flex gap-1">
          {["VISA", "MC", "JCB"].map(b => (
            <span key={b} className="text-[10px] bg-white border border-[#e5e5e5] rounded px-1 font-bold text-[#8f9294]">{b}</span>
          ))}
        </span>
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-[#8f9294] mb-1 block">SỐ THẺ</label>
          <input value={card.number} onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))}
            placeholder="1234 5678 9012 3456" maxLength={19}
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm font-mono focus:outline-none focus:border-[#1a4b97] bg-white" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#8f9294] mb-1 block">TÊN CHỦ THẺ</label>
          <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
            placeholder="NGUYEN VAN AN"
            className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm uppercase focus:outline-none focus:border-[#1a4b97] bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#8f9294] mb-1 block">NGÀY HẾT HẠN</label>
            <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
              placeholder="MM/YY" maxLength={5}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#8f9294] mb-1 block">CVV / CVC</label>
            <input type="password" value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              placeholder="***" maxLength={4}
              className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BankPanel({ orderId, amount, fp, qrImage, bank }: { orderId: string; amount: number; fp: (n: number) => string; qrImage?: string; bank?: { bankName?: string; bankAccount?: string; bankHolder?: string } }) {
  const [copied, setCopy] = useState("");
  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopy(key); setTimeout(() => setCopy(""), 2000); };
  const bankName = bank?.bankName || BANK_INFO.bank;
  const bankAcc = bank?.bankAccount || BANK_INFO.account;
  const bankHolder = bank?.bankHolder || BANK_INFO.name;
  // QR THẬT: tạo VietQR từ NH + STK + số tiền + nội dung "TT <mã đơn>". Không nhận diện được NH → dùng ảnh admin tải lên.
  const realQr = vietQrImage(bankName, bankAcc, bankHolder, amount, `TT ${orderId}`) || qrImage;
  return (
    <div className="mt-4 p-5 rounded-2xl border-2 border-green-200 bg-green-50">
      <p className="font-bold text-[#44494d] mb-4">Thông tin chuyển khoản ngân hàng</p>
      <div className="flex gap-4">
        <QRBlock size={120} content={`${bankAcc}|${amount}|${orderId}`} image={realQr} />
        <div className="flex-1 space-y-2 text-sm">
          {[
            { label: "Ngân hàng", value: bankName, key: "bank" },
            { label: "Số tài khoản", value: bankAcc, key: "acc" },
            { label: "Chủ tài khoản", value: bankHolder, key: "name" },
            { label: "Số tiền", value: fp(amount), key: "amt" },
            { label: "Nội dung CK", value: `TT ${orderId}`, key: "desc" },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
              <div>
                <p className="text-xs text-[#8f9294]">{label}</p>
                <p className="font-semibold text-[#44494d] text-xs">{value}</p>
              </div>
              <button onClick={() => copy(value, key)} className="text-xs px-2 py-1 rounded-lg ml-2 shrink-0 transition-colors"
                style={{ background: copied === key ? "#DCFCE7" : "var(--ap-page-bg)", color: copied === key ? "#16A34A" : "#8f9294" }}>
                {copied === key ? "✓" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckoutInner() {
  const { t, fp, lang } = useLang();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get("guest") === "1";

  // ── Role-based checkout gate ──────────────────────────────────────────
  const authUser = getAuth();
  const userRole = authUser?.role;
  const canBuy = isGuest || !userRole || BUYER_ROLES.includes(userRole);

  if (!canBuy) {
    const roleLabels: Record<string, { vi: string; zh: string; icon: React.ReactNode; color: string }> = {
      admin:    { 
        vi: "Quản trị viên", zh: "管理员", color: "#DC2626",
        icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 
      },
      supplier: { 
        vi: "Nhà cung cấp", zh: "供应商", color: "#D97706",
        icon: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M13 18h1"/><path d="M9 18h1"/></svg>
      },
    };
    const info = roleLabels[userRole!] || roleLabels.admin;
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#f5f5f5" }}>
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-10 text-center max-w-lg w-full shadow-lg">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#FEF2F2" }}>{info.icon}</div>
          <h2 className="text-2xl font-bold text-[#44494d] mb-3">
            {lang === "zh" ? "无法购买" : "Không thể đặt hàng"}
          </h2>
          <p className="text-[#8f9294] mb-2">
            {lang === "zh"
              ? `您当前以「${info.zh}」角色登录，该角色不允许直接购买商品。`
              : `Bạn đang đăng nhập với vai trò「${info.vi}」— vai trò này không được phép mua hàng trực tiếp.`}
          </p>
          <p className="text-sm text-[#8f9294] mb-6">
            {lang === "zh"
              ? "请注销并使用「客户」或「推广员」账号登录来购物。"
              : "Vui lòng đăng xuất và đăng nhập bằng tài khoản「Khách hàng」hoặc「Cộng tác viên」để mua hàng."}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: "var(--ap-primary)" }}>
              {lang === "zh" ? "返回首页" : "Về trang chủ"}
            </Link>
            <Link href={userRole === "admin" ? "/admin" : "/supplier"}
              className="flex-1 py-3 rounded-xl font-bold border-2 border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa] transition-colors">
              {lang === "zh" ? "管理面板" : (userRole === "admin" ? "Bảng điều khiển" : "Quản lý NCC")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guest info state
  const [guestInfo, setGuestInfo] = useState({ name: "", phone: "", email: "", address: "", city: "" });
  const [guestStep, setGuestStep] = useState<"info" | "payment">(isGuest ? "info" : "payment");
  const [guestErr, setGuestErr] = useState("");

  const handleGuestContinue = () => {
    const err = validateField("name", guestInfo.name)
      || validateField("phone", guestInfo.phone)
      || (guestInfo.email ? validateField("email", guestInfo.email) : null)
      || (!guestInfo.city ? "Vui lòng nhập thành phố" : null)
      || (!guestInfo.address ? "Vui lòng nhập địa chỉ giao hàng" : null);
    if (err) { setGuestErr(err); return; }
    setGuestErr("");
    setGuestStep("payment");
  };

  const [products, setProducts] = useState<any[]>([]);
  const checkoutItems = getCart()
    .filter(c => getSelectedIds().includes(c.id))
    .map(c2 => { const p = products.find((x: any) => x.id === c2.id); return p ? { ...p, qty: c2.qty } : null; }).filter(Boolean) as Array<any & { qty: number }>;
  
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const swatchMap: Record<string, { bg: string; color: string; label: string }> = {
    "brake-pad":      { bg: "#FEE2E2", color: "#DC2626", label: (lang === "zh" ? "制动" : "Phanh") },
    "oil-filter":     { bg: "#FEF9C3", color: "#92400E", label: (lang === "zh" ? "滤清" : "Lọc") },
    "spark-plug":     { bg: "#EDE9FE", color: "#6D28D9", label: (lang === "zh" ? "火花塞" : "Bugi") },
    "battery":        { bg: "#DBEAFE", color: "#1D4ED8", label: (lang === "zh" ? "蓄电池" : "Ắcquy") },
    "engine-oil":     { bg: "#44494d", color: "#8f9294", label: (lang === "zh" ? "机油" : "Nhớt") },
  };
  function getSwatch(img: string) { return swatchMap[img] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" }; }

  // New states for Unified Checkout
  const [addressId, setAddressId] = useState('1');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  // Đồng bộ địa chỉ nhận hàng từ SỔ ĐỊA CHỈ thật trên server (đồng bộ với /customer/address)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/addresses", { credentials: "include", cache: "no-store" });
        const d = await r.json();
        if (Array.isArray(d) && d.length) {
          const mapped: AddressData[] = d.map((a: any) => ({
            id: a.id, name: a.name, phone: (a.phone || "").trim() || "—",
            city: a.city || "", address: a.address || "",
            isDefault: !!a.isDefault, type: a.district || "Địa chỉ",
          }));
          setAddresses(mapped);
          setAddressId((mapped.find(a => a.isDefault) || mapped[0]).id);
          return;
        }
      } catch {}
      // Chưa có sổ địa chỉ → lấy tạm từ Hồ sơ cá nhân
      try {
        const auth = getAuth();
        const prof = JSON.parse(localStorage.getItem("ap_profile") || "null");
        const name = prof?.name || auth?.name;
        if (name && (prof?.address || prof?.phone)) {
          setAddresses([{ id: "profile", name, phone: (prof?.phone || "").trim() || "—", city: prof?.province || "", address: prof?.address || "", isDefault: true, type: "Hồ sơ cá nhân" }]);
          setAddressId("profile");
        }
      } catch {}
    })();
  }, []);
  const EMPTY_ADDR: AddressData = { id: "", name: "", phone: "", city: "", address: "", isDefault: false, type: "" };
  const selectedAddress = addresses.find(a => a.id === addressId) || addresses[0] || EMPTY_ADDR;

  const [shipping, setShipping] = useState("ghtk");
  // Đơn vị vận chuyển lấy từ admin (Đơn vị vận chuyển) — admin thêm là khách thấy ngay
  const [shippingOptions, setShippingOptions] = useState<Array<{ id: string; label: string; fee: number; eta: string }>>([
    { id: "ghtk", label: "GHTK – Giao thường", fee: 35000, eta: "3–5 ngày" },
    { id: "ghn", label: "GHN – Giao hàng nhanh", fee: 25000, eta: "2–3 ngày" },
    { id: "vtp", label: "Viettel Post", fee: 30000, eta: "3–4 ngày" },
  ]);
  const [payment, setPayment] = useState("qr");
  const [orderId, setOrderId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [placing, startPlacing] = useTransition();

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedFreeshipCode, setSelectedFreeshipCode] = useState<string | null>(null);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<string | null>(null);
  const [allVouchers, setAllVouchers] = useState<any[]>([]);

  useEffect(() => {
    const sv = getSelectedVouchers();
    setSelectedFreeshipCode(sv.freeship);
    setSelectedDiscountCode(sv.discount);
    fetch("/api/vouchers").then(r => r.json()).then(setAllVouchers).catch(() => {});
    fetch("/api/settings").then(r => r.json()).then(d => { const v = parseFloat(d?.general?.vatPercent ?? "0"); if (!isNaN(v) && v > 0) (window as any).__APP_VAT__ = v; if (d?.payment) setPayCfg(d.payment); }).catch(() => {});
    // Đơn vị vận chuyển ĐANG HOẠT ĐỘNG do admin cấu hình
    fetch("/api/carriers").then(r => r.json()).then((d: any[]) => {
      if (Array.isArray(d)) {
        const act = d.filter(c => c && c.active).map(c => ({ id: c.code || c.id, label: `${c.name}${c.estimatedDays ? " – " + c.estimatedDays : ""}`, fee: Number(c.baseFee) || 0, eta: c.estimatedDays || "" }));
        if (act.length) { setShippingOptions(act); setShipping(s => act.some(o => o.id === s) ? s : act[0].id); }
      }
    }).catch(() => {});
  }, []);

  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
  const baseShippingFee = shippingOptions.find(o => o.id === shipping)?.fee ?? 35000;
  const discount = 0; 

  let freeshipDiscountValue = 0;
  let voucherDiscountValue = 0;

  if (selectedFreeshipCode) {
    const v = allVouchers.find(x => x.code === selectedFreeshipCode);
    if (v && subtotal >= v.minOrder) freeshipDiscountValue = baseShippingFee; 
  }
  if (selectedDiscountCode) {
    const v = allVouchers.find(x => x.code === selectedDiscountCode);
    if (v && subtotal >= v.minOrder) {
      voucherDiscountValue = v.type === "percent" ? Math.round(subtotal * v.value / 100) : v.value;
    }
  }

  const shippingFee = Math.max(0, baseShippingFee - freeshipDiscountValue);
  const taxableBase = Math.max(0, subtotal - voucherDiscountValue);
  const vatPercent = (typeof window !== "undefined" && (window as any).__APP_VAT__) ?? 0;
  const vatAmount = Math.round(taxableBase * vatPercent / 100);
  const total = subtotal - discount + shippingFee - voucherDiscountValue + vatAmount;

  const handleApplyVouchers = (fs: string | null, d: string | null) => {
    setSelectedFreeshipCode(fs);
    setSelectedDiscountCode(d);
    saveSelectedVouchers({ freeship: fs, discount: d });
    setShowVoucherModal(false);
  };

  const [showPayModal, setShowPayModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState("");
  // Cấu hình thanh toán (QR + tài khoản NH) do admin đặt ở Cài đặt
  const [payCfg, setPayCfg] = useState<{ qrImage?: string; bankName?: string; bankAccount?: string; bankHolder?: string; note?: string }>({});

  const submitOrder = (oid: string) => {
    startPlacing(async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items: checkoutItems.map(i => ({ id: i.id, name: i.name, nameZh: i.nameZh, qty: i.qty, price: i.price })),
            shipping: {
              name: selectedAddress.name,
              phone: selectedAddress.phone,
              city: selectedAddress.city,
              address: selectedAddress.address,
              method: shipping,
              fee: shippingFee
            },
            paymentMethod: payment,
            subtotal, discount, total,
          }),
        });
        if (!res.ok) throw new Error("order failed");
        const data = await res.json();
        if (!data?.id) throw new Error("order failed");
        setOrderId(data.id);
        setShowPayModal(false);
        setIsSuccess(true);
        // Gán đơn hàng THẬT cho link affiliate nếu khách đến từ ?ref=... trong vòng 30 ngày
        try {
          const aref = localStorage.getItem("ap_aff_ref") || "";
          const ats = Number(localStorage.getItem("ap_aff_ref_ts") || "0");
          if (aref && /^[A-Za-z0-9_]{2,40}$/.test(aref) && ats && Date.now() - ats < 30 * 864e5) {
            fetch("/api/affiliate-links/track", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ref: aref, type: "order", amount: total }),
            }).catch(() => {});
          }
          localStorage.removeItem("ap_aff_ref"); localStorage.removeItem("ap_aff_ref_ts");
        } catch {}
        // Đặt hàng xong: XOÁ các sản phẩm đã mua khỏi giỏ + bỏ chọn
        try { checkoutItems.forEach(it => removeFromCart(it.id)); saveSelectedIds([]); } catch {}
      } catch {
        // KHÔNG báo thành công giả: giữ nguyên giỏ hàng + báo lỗi để khách thử lại
        setShowPayModal(false);
        window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Đặt hàng chưa thành công — vui lòng kiểm tra kết nối mạng và thử lại. Giỏ hàng của bạn vẫn được giữ nguyên.", type: "error" } }));
      }
    });
  };

  // Bấm "Đặt hàng": COD đặt luôn; phương thức QR/thẻ -> mở popup thanh toán trước rồi mới tạo đơn
  const handlePlaceOrderClick = () => {
    if (checkoutItems.length === 0) {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Giỏ hàng trống — hãy chọn sản phẩm trước khi thanh toán.", type: "warning" } }));
      setTimeout(() => { window.location.href = "/products"; }, 1200);
      return;
    }
    // Bắt buộc có địa chỉ nhận hàng (tài khoản đã đăng nhập)
    if (!isGuest && (!selectedAddress.name || !selectedAddress.address)) {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Vui lòng thêm địa chỉ nhận hàng trong mục 'Sổ địa chỉ' trước khi đặt hàng.", type: "warning" } }));
      setTimeout(() => { window.location.href = "/customer/address"; }, 1400);
      return;
    }
    const oid = `AP-${Date.now().toString().slice(-9)}`;
    setPendingOrderId(oid);
    if (payment === "cod") submitOrder(oid);
    else setShowPayModal(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f5]">
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-10 text-center max-w-lg w-full shadow-lg">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl" style={{ background: "#DCFCE7", color: "#16A34A" }}>✓</div>
          <h2 className="text-3xl font-bold text-[#44494d] mb-3">Đặt hàng thành công!</h2>
          <p className="text-[#8f9294] mb-2 text-lg">Mã đơn hàng của bạn:</p>
          <p className="font-mono font-extrabold text-2xl text-[#44494d] mb-4 bg-slate-50 py-3 rounded-xl border border-[#e5e5e5]">{orderId}</p>
          
          {payment === "bank" && <p className="text-sm text-blue-700 font-medium mb-6 bg-blue-50 py-3 rounded-lg">Đơn hàng đang chờ đối soát thanh toán chuyển khoản ngân hàng</p>}
          {payment === "cod"  && <p className="text-sm text-green-700 font-medium mb-6 bg-green-50 py-3 rounded-lg">Đơn sẽ được giao trong 2–5 ngày làm việc</p>}
          {(payment === "momo" || payment === "zalopay" || payment === "paypal") &&
            <p className="text-sm text-blue-700 font-medium mb-6 bg-blue-50 py-3 rounded-lg">Đang chờ xác nhận thanh toán từ {PAYMENT_METHODS.find(m => m.id === payment)?.label}</p>}
          
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/customer/orders" className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-md transition-opacity hover:opacity-90" style={{ background: "var(--ap-primary)" }}>{t("viewOrder")}</Link>
            <Link href="/" className="flex-1 py-3.5 rounded-xl font-bold border-2 border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa] transition-colors">{t("cartContinueShopping")}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <header className="bg-white border-b border-[#f0f0f0] sticky top-0 z-50">
        <div className="ap-container flex items-center h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 border-r border-[#e5e5e5] pr-4">
            <LogoImage className="h-[28px] w-auto object-contain" />
          </Link>
          <h1 className="font-bold text-[#1a4b97] text-xl">Thanh toán</h1>
          <Link href="/" className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa]">← Trang chủ</Link>
        </div>
      </header>

      <div className="ap-container py-6 space-y-4">

        {/* ===== GUEST INFO FORM ===== */}
        {isGuest && guestStep === "info" && (
          <div className="bg-white rounded-md shadow-sm border-t-[3px] border-[#1a4b97] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#1a4b97] mb-1">Thông tin đặt hàng (Khách vãng lai)</h2>
              <p className="text-sm text-[#8f9294]">Không cần đăng ký — nhập thông tin giao hàng để tiếp tục</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Họ và tên *", key: "name", placeholder: "Nguyễn Văn An", type: "text" },
                { label: "Số điện thoại *", key: "phone", placeholder: "0901 234 567", type: "tel" },
                { label: "Email (nhận xác nhận đơn)", key: "email", placeholder: "email@example.com", type: "email" },
                { label: "Thành phố *", key: "city", placeholder: "Hà Nội", type: "text" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-[#8f9294] mb-1 block">{label}</label>
                  <input type={type} value={(guestInfo as any)[key]}
                    inputMode={key === "phone" ? "numeric" : undefined}
                    maxLength={key === "name" ? 20 : key === "phone" ? 10 : key === "email" ? 100 : 50}
                    pattern={key === "phone" ? "0[0-9]{9}" : undefined}
                    onChange={e => setGuestInfo(g => ({ ...g, [key]: key === "phone" ? clampPhone(e.target.value) : e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-[#8f9294] mb-1 block">Địa chỉ giao hàng *</label>
                <input type="text" value={guestInfo.address}
                  onChange={e => setGuestInfo(g => ({ ...g, address: e.target.value }))}
                  placeholder="Số nhà, tên đường, quận/huyện..."
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
              </div>
            </div>
            {guestErr && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{guestErr}</p>}
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleGuestContinue}
                className="flex-1 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90"
                style={{ background: "var(--ap-primary)" }}>
                Tiếp tục thanh toán →
              </button>
              <Link href="/login?from=/checkout"
                className="px-5 py-3 rounded-xl font-semibold text-sm border-2 border-[#e5e5e5] text-[#44494d] hover:border-[#1a4b97] transition-colors text-center">
                Đăng nhập
              </Link>
            </div>
          </div>
        )}

        {/* Show rest of checkout only if not in guest info step */}
        {!(isGuest && guestStep === "info") && (
          <>
        {/* Address Block */}
        {!isGuest && (
        <div className="bg-white rounded-md shadow-sm border-t-[3px] border-orange-500 p-6 relative overflow-hidden">
           {/* Decor stripe */}
           <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundImage: "repeating-linear-gradient(45deg, #1a4b97, #1a4b97 33px, transparent 0, transparent 41px, #f97316 0, #f97316 74px, transparent 0, transparent 82px)", backgroundPositionX: "-30px", backgroundSize: "116px 3px" }} />
           
           <div className="flex items-center justify-between mb-4 mt-2">
             <h2 className="text-lg font-bold text-[#1a4b97] flex items-center gap-2">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a4b97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Địa Chỉ Nhận Hàng
             </h2>
             <button onClick={() => setShowAddressModal(true)} className="text-[#1a4b97] font-semibold hover:underline text-sm uppercase">Thay Đổi</button>
           </div>
           
           <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-6 text-[#44494d]">
             <div className="font-bold whitespace-nowrap text-base">{selectedAddress.name} (+84) {selectedAddress.phone.replace(/^0/, '')}</div>
             <div className="text-sm">{selectedAddress.address}, {selectedAddress.city}</div>
             {selectedAddress.isDefault && <div className="border border-orange-500 text-orange-500 px-2 py-0.5 rounded-sm text-xs font-bold shrink-0">Mặc định</div>}
           </div>
        </div>
        )}

        {/* Guest: show address summary */}
        {isGuest && guestStep === "payment" && (
          <div className="bg-white rounded-md shadow-sm border-t-[3px] border-[#1a4b97] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[#44494d] text-sm">{guestInfo.name} — {guestInfo.phone}</p>
                <p className="text-xs text-[#8f9294]">{guestInfo.address}, {guestInfo.city}</p>
              </div>
              <button onClick={() => setGuestStep("info")} className="text-xs text-[#1a4b97] font-semibold hover:underline">Sửa</button>
            </div>
          </div>
        )}

        {/* Products Block */}
        <div className="bg-white rounded-md shadow-sm p-6">
           <h2 className="text-lg font-bold text-[#44494d] mb-4">Sản Phẩm</h2>
           <div className="space-y-4">
              {checkoutItems.map(item => (
                 <div key={item.id} className="flex gap-4 items-center border-b border-[#f0f0f0] pb-4 last:border-0 last:pb-0">
                    <div className="w-14 h-14 rounded-md flex items-center justify-center shrink-0 border border-[#e5e5e5]" style={{ background: "#f8f8fa" }}>
                       <span style={{ background: getSwatch(item.image).bg, color: getSwatch(item.image).color, fontSize: "11px", fontWeight: "700", padding: "4px 7px", borderRadius: "5px" }}>
                         {getSwatch(item.image).label}
                       </span>
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-base text-[#44494d] line-clamp-1">{lang === "zh" ? (item.nameZh || item.name) : item.name}</p>
                    </div>
                    <p className="text-[#8f9294] w-24 text-center">Đơn giá: {fp(item.price)}</p>
                    <p className="text-[#8f9294] w-16 text-center">Số lượng: {item.qty}</p>
                    <p className="text-base font-bold text-[#44494d] w-32 text-right">Thành tiền: {fp(item.price * item.qty)}</p>
                 </div>
              ))}
           </div>
           
           <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#f0f0f0]">
             {/* Note & Shipping side by side */}
             <div>
                <label className="text-sm text-[#44494d] mb-2 block">Lời nhắn cho người bán:</label>
                <input placeholder="Lưu ý cho người bán..." className="w-full px-4 py-2 border border-[#e5e5e5] rounded-md text-sm focus:outline-none focus:border-[#1a4b97]" />
             </div>
             <div>
                <label className="text-sm font-bold text-[#44494d] mb-2 block">Đơn vị vận chuyển:</label>
                <div className="space-y-2">
                  {shippingOptions.map(opt => (
                    <label key={opt.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${shipping === opt.id ? "border-[#1a4b97] bg-[#f8fcfd]" : "border-[#e5e5e5] hover:border-slate-300"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" checked={shipping === opt.id} onChange={() => setShipping(opt.id)} className="accent-[#1a4b97]" />
                        <div>
                          <p className="font-semibold text-[#44494d] text-sm">{opt.label}</p>
                          <p className="text-xs text-[#8f9294]">Nhận hàng: {opt.eta}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#44494d] text-sm">{fp(opt.fee)}</span>
                    </label>
                  ))}
                </div>
             </div>
           </div>
        </div>

        {/* Voucher Inline Row */}
        <div className="bg-white rounded-md shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a4b97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
             <span className="text-base font-medium text-[#44494d]">Autoparts Voucher</span>
           </div>
           
           <div className="flex items-center gap-3">
             {(selectedFreeshipCode || selectedDiscountCode) ? (
               <span className="text-[#1a4b97] font-bold">
                 Đã chọn {(selectedFreeshipCode ? 1 : 0) + (selectedDiscountCode ? 1 : 0)} mã giảm giá
               </span>
             ) : (
               <span className="text-[#8f9294]">Không có mã nào được chọn</span>
             )}
             <button onClick={() => setShowVoucherModal(true)} className="text-[#1a4b97] font-semibold text-sm uppercase hover:underline">
               Chọn Voucher
             </button>
           </div>
        </div>

        {/* Payment Block */}
        <div className="bg-white rounded-md shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#44494d] mb-4">Phương thức thanh toán</h2>
          
          {/* Payment Tabs/Cards Layout */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setPayment(m.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all text-center gap-2
                 ${payment === m.id ? "border-[#1a4b97] relative" : "border-[#e5e5e5] hover:border-[#9bb4d8]"}`}
              >
                {payment === m.id && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-l-[20px] border-t-[#1a4b97] border-l-transparent">
                    <span className="absolute -top-[18px] right-[2px] text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
                <div className="w-10 h-10 shrink-0 rounded-md flex items-center justify-center text-white font-bold text-xs" style={{ background: m.color }}>
                  {m.logo}
                </div>
                <span className="text-xs font-semibold text-[#44494d] leading-tight h-8 flex items-center">{m.label.split("(")[0]}</span>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[#e5e5e5] bg-slate-50 p-4 text-sm text-[#44494d]">
            {payment === "cod"
              ? <span>Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. Nhấn <b>Đặt hàng</b> để hoàn tất.</span>
              : <span>Bạn sẽ quét <b>mã QR</b> của cửa hàng để chuyển khoản. Nhấn <b>Đặt hàng</b> để hiển thị mã QR thanh toán.</span>}
          </div>
        </div>

        </>
        )}

      </div>

      {/* Sticky Bottom Bar — only show when not on guest info step */}
      {!(isGuest && guestStep === "info") && (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#e5e5e5] shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-[60]">
        <div className="ap-container py-4 flex flex-col md:flex-row items-center justify-end gap-6 md:gap-8 border-t border-dashed border-[#e5e5e5] mt-[-1px]">
          
          <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-col gap-x-4 gap-y-1 text-sm md:text-right">
            <div className="text-[#8f9294]">Tổng tiền hàng:</div>
            <div className="text-right">{fp(subtotal)}</div>
            
            <div className="text-[#8f9294]">Tổng phí vận chuyển:</div>
            <div className="text-right">{fp(baseShippingFee)}</div>

            {(freeshipDiscountValue > 0 || voucherDiscountValue > 0) && (
              <>
                <div className="text-[#8f9294]">Giảm giá phí vận chuyển:</div>
                <div className="text-right text-green-600">-{fp(freeshipDiscountValue)}</div>
                <div className="text-[#8f9294]">Autoparts Voucher giảm:</div>
                <div className="text-right text-green-600">-{fp(voucherDiscountValue)}</div>
              </>
            )}
            {vatAmount > 0 && (
              <>
                <div className="text-[#8f9294]">Thuế VAT ({vatPercent}%):</div>
                <div className="text-right">+{fp(vatAmount)}</div>
              </>
            )}
          </div>

          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
            <div className="text-left md:text-right">
              <span className="text-[#44494d] text-base">Tổng thanh toán: </span>
              <span className="text-2xl md:text-3xl font-bold text-orange-500 block md:inline mt-1 md:mt-0 ml-0 md:ml-3 leading-none">{fp(total)}</span>
            </div>
            <button
              onClick={handlePlaceOrderClick}
              disabled={placing}
              className="px-10 py-3.5 rounded-sm font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-60 uppercase text-lg"
              style={{ background: "#f97316" }}>
              {placing ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </div>
      )}

      {showVoucherModal && (
        <VoucherSelectorModal 
          onClose={() => setShowVoucherModal(false)}
          onApply={handleApplyVouchers}
          initialFreeship={selectedFreeshipCode}
          initialDiscount={selectedDiscountCode}
          subtotal={subtotal}
        />
      )}

      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onApply={(id) => { setAddressId(id); setShowAddressModal(false); }}
          addresses={addresses}
          selectedId={addressId}
        />
      )}

      {/* ===== Popup thanh toán (hiện khi bấm Đặt hàng với phương thức QR/thẻ) ===== */}
      {showPayModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => !placing && setShowPayModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0] sticky top-0 bg-white">
              <h3 className="font-bold text-[#44494d]">Thanh toán — {PAYMENT_METHODS.find(m => m.id === payment)?.label}</h3>
              <button onClick={() => !placing && setShowPayModal(false)} className="w-8 h-8 rounded-lg text-[#8f9294] hover:bg-[#f0f0f0] text-xl leading-none">×</button>
            </div>
            <div className="p-5">
              {payment === "qr" && <QRPanel orderId={pendingOrderId} amount={total} fp={fp} qrImage={payCfg.qrImage} bank={payCfg} />}
              <button
                onClick={() => submitOrder(pendingOrderId)}
                disabled={placing}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--ap-primary)" }}>
                {placing ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
              </button>
              <p className="text-center text-xs text-[#8f9294] mt-3">Tổng thanh toán: <b className="text-[#44494d]">{fp(total)}</b> · Mã đơn: <b className="font-mono">{pendingOrderId}</b></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#8f9294]">Đang tải...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}

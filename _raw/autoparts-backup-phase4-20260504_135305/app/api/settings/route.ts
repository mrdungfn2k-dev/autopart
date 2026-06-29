import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/jwt";
import { readJson, writeJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

const FILE = "settings.json";

const DEFAULTS: Record<string, unknown> = {
  general: {
    siteName: "AutoParts",
    supportEmail: "support@autoparts.vn",
    supportPhone: "1900 1234",
    minWithdraw: "500000",
    platformFeeDefault: "11.1",
    affiliateT1: "10",
    affiliatePassive: "5",
  },
  branding: {
    brandName: "AutoParts",
    brandShort: "AP",
    greeting: "AutoParts xin chào!",
    hotline: "19008095",
    tagline: "Nền tảng mua phụ tùng\nô tô chính hãng hàng đầu\nViệt Nam",
  },
  commitments: [
    { text: "Được vận hành bởi AutoParts" },
    { text: "Thanh toán hoàn toàn bằng VND" },
    { text: "Theo dõi hành trình qua web" },
    { text: "Order trực tiếp và nhanh chóng" },
  ],
  footer: {
    companyName: "CÔNG TY CỔ PHẦN AUTOPARTS",
    registrationNo: "0104093672",
    issuedBy: "do Phòng đăng ký kinh doanh - Sở Kế hoạch và Đầu tư TP Hà Nội cấp ngày 03/07/2009",
    manager: "Nguyễn Tuấn Anh",
    address: "Tòa nhà AutoParts, Ngõ 15 Duy Tân, Cầu Giấy, Hà Nội",
    email: "cskh@autoparts.vn",
    phone: "19008095",
    socialLinks: [
      { name: "Instagram", icon: "/vipo-assets/icon_ig.svg" },
      { name: "Facebook", icon: "/vipo-assets/icon_fb.svg" },
      { name: "YouTube", icon: "/vipo-assets/icon_utube.svg" },
      { name: "TikTok", icon: "/vipo-assets/icon_tiktok.svg" },
    ],
    supportLinks: [
      "Trung tâm hỗ trợ",
      "Hướng dẫn đặt hàng",
      "Hướng dẫn ký hợp đồng điện tử",
      "Hướng dẫn sử dụng",
      "Ước tính chi phí vận chuyển",
    ],
    policyLinks: [
      "Chính sách vận chuyển",
      "Chính sách bảo mật thông tin cá nhân",
      "Chính sách trả hàng hoàn tiền",
      "Hàng cấm, hàng gửi có điều kiện",
    ],
    aboutLinks: [
      "Giới thiệu",
      "Điều khoản dịch vụ",
      "Quy chế hoạt động sàn",
      "Giao dịch TMĐT",
      "Kinh nghiệm AutoParts",
    ],
  },
  features: {
    flashSale: true,
    voucherSystem: true,
    mechanicPortal: true,
    affiliatePortal: true,
    warrantyTracking: true,
    vinLookup: false,
    maintenanceMode: false,
  },
  security: {
    twoFARequired: false,
    sessionTimeout: "60",
    loginAttempts: "5",
  },
  theme: {
    primary: "#1a4b97",
    primaryDark: "#113264",
    sidebarBg: "#0d1f3b",
    sidebarBorder: "#1a3258",
    sidebarText: "#a5c0e1",
    headerBg: "#ffffff",
    textPrimary: "#24292e",
    textMuted: "#6a737d",
    linkColor: "#2188ff",
    pageBg: "#f6f8fa",
    cardBg: "#ffffff",
    accentRed: "#5C4DB1",
    borderColor: "#e1e4e8",
    topBarBg: "#04142d",
    topBarText: "#ffffff",
    buttonRadius: "6",
  },
};

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && typeof target[key] === "object" && !Array.isArray(target[key])) {
      out[key] = deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

export async function GET() {
  const saved = readJson<Record<string, unknown>>(FILE);
  const merged = deepMerge(DEFAULTS, saved);
  return NextResponse.json(merged, {
    headers: { "Cache-Control": "no-store, max-age=0" }
  });
}

export async function PUT(req: NextRequest) {
  const __auth = requireRole(req, ["admin"]);
  if (__auth instanceof NextResponse) return __auth;

  const body = await req.json();
  const current = readJson<Record<string, unknown>>(FILE);
  const merged = deepMerge(current, body);
  writeJson(FILE, merged);
  return NextResponse.json({ ok: true, data: merged });
}

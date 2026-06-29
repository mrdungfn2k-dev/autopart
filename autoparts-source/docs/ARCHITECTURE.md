# Kiến trúc tổng thể — AutoParts (autopartsvietnam.com.vn)

> Sàn TMĐT phụ tùng ô tô đa nhà bán (marketplace): Khách hàng · Nhà cung cấp · Đại lý/CTV · Admin.
> Đọc file này là hiểu toàn bộ hệ thống.

## 1. Tech stack (+ lý do chọn)
| Lớp | Công nghệ | Lý do |
|---|---|---|
| Framework | **Next.js 16.1.6 (App Router)** | Full-stack 1 codebase: SSR storefront + API routes backend trong cùng project |
| UI | **React 19.2.3 + TypeScript 5** | Component hoá, type-safe |
| CSS | **TailwindCSS 4** (CSS-first, `@import "tailwindcss"`) | Tiện ích; biến thương hiệu qua CSS vars (`--ap-primary`) |
| Backend | **Next.js Route Handlers** (`app/api/**/route.ts`) | Không cần server riêng; chạy trên Node runtime |
| "Database" | **File JSON** qua `lib/fileStore.ts` đọc/ghi `data/*.json` | KHÔNG dùng SQL/ORM — dữ liệu là các file JSON. Xem `DATABASE.md` |
| Auth | **JWT tự ký HMAC-SHA256** (`lib/jwt.ts`) + cookie `ap_token`; mật khẩu hash **scrypt** | Không phụ thuộc package ngoài |
| i18n | `lib/i18n.ts` (VI / ZH) | Đa ngôn ngữ Việt–Trung |
| Charts | `recharts` | Biểu đồ dashboard NCC/Admin |
| Hosting | **VPS Ubuntu 22.04 + Nginx (reverse proxy) + PM2** | `next start` cổng **3008**, domain autopartsvietnam.com.vn |

## 2. Sơ đồ cấu trúc thư mục
```
autoparts/                  (= /var/www/autoparts trên VPS)
├── app/
│   ├── page.tsx            ← Trang chủ storefront (tra cứu theo xe/VIN, flash sale...)
│   ├── products/ catalog/ search/ flash-sale/ cart/ checkout/   ← Mua hàng
│   ├── suppliers/ vin-lookup/ tracking/ support/ help/ ...       ← Storefront phụ
│   ├── login/ register/                                          ← Xác thực
│   ├── admin/      ← Portal Admin (orders, users, catalog, finance, inventory, cms, tax...)
│   ├── supplier/   ← Portal Nhà cung cấp (products, orders, inventory, finance, analytics)
│   ├── affiliate/  ← Portal Đại lý/CTV (commissions, links, team, withdraw)
│   ├── customer/   ← Khu khách hàng (orders, garage, wishlist, address, reviews...)
│   ├── api/        ← BACKEND: route handlers REST (auth, products, orders, garage...)
│   ├── layout.tsx  ← Root layout (font, ThemeProvider, LangProvider, inject custom CSS/JS)
│   └── globals.css ← Tailwind 4 + biến thương hiệu
├── components/     ← Sidebars (Admin/Supplier/Affiliate/Customer), StorefrontHeader/Footer, modals, MathCaptcha...
├── lib/            ← fileStore, data, auth, jwt, i18n, cartStore, api, useLocalStorage
├── data/           ← *.json — TOÀN BỘ DỮ LIỆU (xem DATABASE.md)
├── docs/           ← Tài liệu dự án (file này)
├── middleware.ts   ← Bảo vệ route theo role
├── next.config.ts  tsconfig.json  postcss.config.mjs  package.json
└── RULES.md  DESIGN.md  CLAUDE.md  .cursorrules  .gemini/
```

## 3. Sơ đồ luồng dữ liệu tổng thể
```
[Trình duyệt]
   │  (1) Trang storefront/portal — React Server/Client Component
   │  (2) fetch JSON
   ▼
[Next.js Route Handler  app/api/**/route.ts]   ← BACKEND
   │  verifyToken(cookie ap_token) → kiểm tra role
   │  readJson / writeJson
   ▼
[lib/fileStore.ts]  ──>  data/*.json   (đọc/ghi file, KHÔNG SQL)
   │
   └─ side-effect: tự tạo invoice / transaction khi đơn delivered (xem CRITICAL_PATHS.md)

Bảo vệ truy cập: middleware.ts chặn /admin /supplier /affiliate /customer theo role trong JWT.
State client: cart + auth user lưu localStorage (lib/cartStore.ts, lib/auth.ts).
```

## 4. Service bên ngoài
- **Không** tích hợp cổng thanh toán/email/SMS thật (momo/bank/cod/zalopay chỉ là nhãn trạng thái mô phỏng).
- Font Google (Roboto) + CDN SF Pro Display; cờ quốc gia từ `flagcdn.com`.
- Biến môi trường liên quan: `JWT_SECRET` (BẮT BUỘC — dùng ký/verify token).

## 5. Quy ước chung
- **Đặt tên:** route folder kebab-case; component PascalCase; lib camelCase.
- **Xử lý lỗi API:** trả `NextResponse.json({ error }, { status })` với 400/401/403/404/500.
- **Tiền tệ:** lưu số nguyên VND; format hiển thị qua `fp()` / `formatPrice()`.
- **Thời gian:** lưu ISO string (UTC) ở `createdAt/updatedAt`.
- **Auth client:** `getAuth()` đọc localStorage; **nguồn sự thật về quyền = middleware.ts + verifyToken trong API**.

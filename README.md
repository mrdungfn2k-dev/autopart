# AutoParts — Backup & Khôi phục (11/06/2026)

## Nội dung thư mục
```
autopart-backup/
├─ README.md                                  ← file này
├─ DOI-CHIEU-VNS-vs-AUTOPART-da-kiem-tra-lai.md ← bảng đối chiếu Excel đã kiểm tra lại trên code
├─ _raw/                                       ← 7 snapshot gốc tải từ server + file .tar.gz
│   ├─ autoparts_code_backup.tar.gz
│   ├─ autoparts-backup-20260503_085536/      (62 files, có thư mục api/)
│   ├─ autoparts-backup-phase1..phase5/        (155→206 files, phase5 đầy đủ nhất)
│   └─ autoparts-backup-responsive-20260505_120912/ (20 component + globals.css, mới nhất)
└─ autoparts-source/                          ← BẢN GHÉP TỐT NHẤT (phase5 + overlay responsive)
    ├─ app/        (toàn bộ route: admin, customer, supplier, affiliate, api, storefront)
    ├─ components/ (StorefrontHeader, sidebars, CompareBar, MathCaptcha, ...)
    ├─ lib/        (fileStore, data, auth, jwt, i18n, cartStore, api)
    ├─ data/       (27 file JSON: products, orders, users, categories, ... — DB dạng file)
    ├─ middleware.ts
    └─ package.json
```

## Nguồn gốc
- Server: **45.119.83.233** (Ubuntu 22.04, nginx + PM2). App `autoparts` chạy Next.js 16 / React 19 / TS / Tailwind 4, cổng 3008.
- Mã nguồn deploy gốc `/var/www/autoparts` **đã bị xóa khỏi đĩa** — chỉ còn các snapshot trong `/root/autoparts-backup-*` (đã tải về đây).
- Đây là DB dạng **file JSON** (không phải SQL).

## ⚠️ Cảnh báo
1. App production đang chạy **từ RAM** (thư mục code đã xóa). Restart/reboot = mất hết. Cần xử lý sớm.
2. `autoparts-source/` là snapshot **05/05**, cũ hơn bản deploy (~20/05) khoảng 2 tuần và **thiếu file config** (`next.config`, `tsconfig.json`, `postcss.config`, `tailwind.config`) + thư mục `public/`. Cần dựng lại các file này trước khi chạy `npm install && npm run dev` ở local.

## Cách chạy thử ở local (sau khi bổ sung config)
```
cd autopart-backup/autoparts-source
# (tạo next.config.ts, tsconfig.json, postcss.config.mjs, public/ — xem README)
npm install
npm run dev   # http://localhost:3000
```

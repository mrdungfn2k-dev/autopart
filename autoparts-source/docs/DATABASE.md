# Cơ sở dữ liệu — AutoParts

> ⚠️ Hệ thống **KHÔNG dùng SQL**. "Database" = các file **JSON** trong `data/`, đọc/ghi qua `lib/fileStore.ts`
> (`readJson(file)`, `writeJson(file, data)`). Mỗi file `.json` = 1 "bảng". ĐỌC TRƯỚC khi thêm/sửa cấu trúc dữ liệu.

## 0. Cơ chế lưu trữ
- `data/*.json`: mảng object (bản ghi) **hoặc** object cấu hình.
- ID: chuỗi (vd `u004`, `AP-1001`, `yy-007`, `v001`). Sinh ID mới: `nextId(prefix)` → `prefix_<timestamp>_<rand>`.
- Không có transaction/khoá ghi → ghi cả file mỗi lần. Cẩn trọng khi nhiều ghi đồng thời.
- Thời gian: ISO string UTC. Tiền: số nguyên VND.

## 1. Danh sách bảng (file JSON)

### `users.json` — Tài khoản (4 vai trò)
| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | string | PK | vd `u004` |
| name | string | NOT NULL | |
| email | string | UNIQUE, NOT NULL | dùng đăng nhập |
| passwordHash | string | NOT NULL | định dạng `scrypt$N$salt$hash` (xem `lib/jwt.ts`) |
| phone | string | | |
| role | enum | `admin\|supplier\|affiliate\|customer` | quyết định portal + quyền |
| supplierId | string? | FK → suppliers.id | chỉ với role=supplier |
| active | bool | | false = khoá đăng nhập |
| createdAt | ISO | | |

### `products.json` — Sản phẩm phụ tùng (n=27)
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | string PK | vd `yy-007` |
| name / nameZh | string | tên VI / ZH |
| brand | string | hãng tương thích |
| categoryId / categoryName(Zh) | FK → categories.id | danh mục |
| price / originalPrice | int VND | giá bán / giá gốc (giảm giá) |
| oemCode | string | mã OEM |
| description / descriptionZh | string | |
| rating / reviews | number | đánh giá |
| stock / sold | int | tồn kho / đã bán |
| origin | string | nguồn hàng (Hàn/Trung/Việt/Nhật...) |
| supplierId | FK → suppliers.id | nhà bán |
| active / isTrending / isHot / isImported | bool | cờ hiển thị |

### `orders.json` — Đơn hàng
| Cột | Kiểu | Mô tả |
|---|---|---|
| id | string PK | vd `AP-1001` |
| userId | FK → users.id | `"guest"` nếu khách vãng lai |
| items | array | `[{ id(FK→products), name, qty, price }]` (nhúng) |
| shipping | object | `{ name, phone, city, address, method, fee }` |
| payment | object | `{ method, status: pending\|paid\|failed }` |
| subtotal / discount / total | int VND | |
| status | enum | `pending\|confirmed\|shipping\|delivered\|cancelled` |
| tracking / note | string | |
| createdAt / updatedAt | ISO | |

### `garage.json` — Gara xe của khách
`id(PK)`, `userId(FK→users)`, `nickname`, `brand`, `model`, `year`, `licensePlate`, `vin`, `color`, `nextService`, `lastOilChange`, `mileage`, `fuelType`, `transmission`, `createdAt`.

### `suppliers.json` — Nhà cung cấp (n=6)
`id(PK)`, `name/nameZh`, `logo/banner`, `description`, `address/phone/email/taxCode`, `rating/reviewCount`, `totalProducts/totalOrders`, `responseRate/responseTime`, `verified/active`, `tags`, `categories`.

### `categories.json` — Danh mục (n=14, có `subcategories`)
`id(PK)`, `name/nameZh`, `icon`, `desc/descZh`, `count`, `color`, `img`, `subcategories[]`.

### `vouchers.json` — Mã giảm giá
`id(PK)`, `code(UNIQUE)`, `type` (freeship/discount), `value`, `minOrder`, `limit/used`, `expiry`, `active`.

### Bảng vận hành / tài chính
| File | Vai trò | Quan hệ |
|---|---|---|
| `invoices.json` | Hoá đơn | tự tạo khi order→delivered, `orderId` FK → orders |
| `transactions.json` | Giao dịch thanh toán | tự tạo khi tạo order, `orderId` FK |
| `refunds.json` | Hoàn tiền | `orderId` FK |
| `payouts.json` | Giải ngân NCC / rút tiền đại lý | `type`, `amount/fee/net`, `status` |
| `approvals.json` | Duyệt NCC / sản phẩm mới | `type`, `status` |
| `affiliate-links.json` | Link tiếp thị đại lý | `clicks/orders/revenue/conversion` |

### Bảng cấu hình / danh mục phụ
`carriers.json` (đơn vị vận chuyển), `tax-rates.json` (thuế suất), `channels.json` (kênh bán), `warehouses.json` (kho), `origins.json` (nguồn hàng), `attribute-sets.json` (bộ thuộc tính), `banners.json`, `flash-sales.json`, `home-sections.json`, `brands-catalog.json`, `vin-database.json` (WMI/VIN mẫu), `newsletter(.json/-campaigns.json)`, `scroll-store.json` (vị trí scroll theo user), `settings.json` (1 object: branding, footer, features, security, theme, emailTemplates, customCss/Js, seoMeta, currency).

## 2. Sơ đồ quan hệ
```
users 1───N orders          (orders.userId)
users 1───N garage          (garage.userId)
users(supplier) 1──1 suppliers   (users.supplierId)
suppliers 1───N products    (products.supplierId)
categories 1───N products   (products.categoryId)
orders 1───N items (nhúng) ──> products (items[].id)
orders 1──1 invoices        (invoices.orderId)   ← tạo khi delivered
orders 1──1 transactions    (transactions.orderId) ← tạo khi đặt
categories 1───N attribute-sets (attribute-sets.categoryId)
```

## 3. Quy tắc thay đổi dữ liệu (thay cho "migration")
- Đổi cấu trúc field → cập nhật **đồng thời**: file `data/*.json`, type/interface trong route handler tương ứng, và `DATABASE.md` này.
- KHÔNG đổi tên/format ID của bản ghi đã tồn tại (đang được tham chiếu).
- Trước khi sửa hàng loạt `data/*.json` → **backup file đó** (copy `.bak`).

## 4. Lưu ý dữ liệu
- `passwordHash`: **scrypt** (per-user salt) — KHÔNG plaintext. Hash cũ HMAC sẽ tự nâng cấp khi user đăng nhập.
- Xoá: **hard-delete** (lọc khỏi mảng) — cân nhắc giữ lại đơn/giao dịch để đối soát.
- `data/*.json` chứa dữ liệu thật → thuộc nhóm PROTECTED (xem `CRITICAL_PATHS.md`).

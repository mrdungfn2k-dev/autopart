# API Contracts — AutoParts

> Backend = Next.js Route Handlers tại `app/api/**/route.ts`. Mọi endpoint + method + auth dưới đây.

## Quy ước chung (THỰC TẾ của dự án)
- Base URL: `/api`. Định dạng JSON.
- **Thành công:** trả thẳng dữ liệu — mảng `[...]` hoặc object bản ghi (KHÔNG bọc `{success,data}`).
- **Lỗi:** `{ "error": "..." }` + HTTP status: `400` (thiếu/sai input) · `401` (chưa đăng nhập) · `403` (sai quyền) · `404` · `500`.
- **Auth:** cookie **`ap_token`** (JWT, HttpOnly, set khi login). Không dùng header Bearer. `verifyToken()` đọc cookie; `requireRole(req, [roles])` chặn quyền.
- Phân quyền role: `admin` · `supplier` · `affiliate` · `customer`.

---

## Auth
### POST `/api/auth/login` — Đăng nhập
- Auth: Không
- Request: `{ "email": "kh@autopart.vn", "password": "Customer@123" }`
- Response 200: `{ ok:true, token, user:{ id,name,email,role }, redirect }` + Set-Cookie `ap_token`
  - `redirect`: admin→`/admin`, supplier→`/supplier`, affiliate→`/affiliate`, **customer→`/`**.
- Lỗi: 400 thiếu trường · 401 email không tồn tại / sai mật khẩu.

### POST `/api/auth/register` — Đăng ký (mặc định role customer)
### POST `/api/auth/logout` — Xoá cookie phiên
### GET `/api/auth/me` — Lấy user hiện tại từ token → `{ user | null }`
### GET `/api/auth/me/export` — Xuất dữ liệu cá nhân (GDPR)

## Sản phẩm / Danh mục (storefront — public đọc)
| Method · Endpoint | Auth | Mô tả |
|---|---|---|
| GET `/api/products` | Public | Danh sách sản phẩm |
| POST `/api/products` | admin/supplier | Tạo sản phẩm |
| GET/PUT/DELETE `/api/products/[id]` | đọc public · sửa admin/supplier | Chi tiết / cập nhật / xoá |
| GET `/api/categories` · `/api/categories/[id]` | Public / admin | Danh mục |
| GET `/api/brands` · `/api/catalog/[brand]` | Public | Hãng & lọc theo hãng |
| GET `/api/suppliers` · `/api/suppliers/[id]` | Public | Nhà bán |
| GET `/api/origins` · `/api/banners` · `/api/flash-sales` · `/api/home-sections` | Public | Khối storefront |
| GET `/api/vin/[vin]` · `/api/vin-database` | Public | Tra cứu VIN |

## Đơn hàng & Mua hàng
| Method · Endpoint | Auth | Mô tả |
|---|---|---|
| GET `/api/orders` | có token | admin/supplier xem tất cả; user xem đơn của mình (lọc `userId`) |
| POST `/api/orders` | public/customer | Tạo đơn (guest cho phép) → tự ghi 1 `transaction` |
| GET `/api/orders/[id]` | — | Chi tiết đơn |
| PUT `/api/orders/[id]` | admin/supplier **hoặc chủ đơn** | Cập nhật trạng thái. Chủ đơn CHỈ được `shipping→delivered` (xác nhận nhận hàng). delivered → tự tạo `invoice` + cập nhật `transaction` |
| DELETE `/api/orders/[id]` | admin | Xoá đơn |
| GET/POST `/api/vouchers` · POST `/api/vouchers/validate` | đọc public · validate khi checkout | Mã giảm giá |
| GET/POST `/api/garage` · GET/PUT/DELETE `/api/garage/[id]` | có token (của chính user) | Gara xe khách |

## Khuyến mãi / Cấu hình (CRUD admin)
`banners`, `flash-sales`, `home-sections`, `origins`, `attribute-sets`, `carriers`, `channels`, `tax-rates`, `warehouses`, `vouchers` — đều theo mẫu:
- `GET /api/<res>` (list) · `POST /api/<res>` (tạo) · `GET|PUT|DELETE /api/<res>/[id]`.
- Đọc thường public; tạo/sửa/xoá yêu cầu **admin**.

## Tài chính / Vận hành
| Endpoint | Auth | Mô tả |
|---|---|---|
| GET `/api/invoices` · `/api/invoices/[id]` | admin/supplier | Hoá đơn |
| GET `/api/transactions` | admin | Giao dịch |
| GET `/api/refunds` · `/api/refunds/[id]` | admin | Hoàn tiền |
| GET `/api/payouts` | admin | Giải ngân / rút tiền |
| GET `/api/inventory` · POST `/api/inventory/restock` | admin/supplier | Tồn kho |
| GET `/api/affiliate-links` | affiliate/admin | Link tiếp thị |
| `/api/newsletter`, `/api/newsletter/campaigns[/id][/send]` | admin | Bản tin |

## Admin / Tiện ích
| Endpoint | Auth | Mô tả |
|---|---|---|
| GET `/api/admin/data-export` | admin | Xuất toàn bộ data |
| POST `/api/admin/data-import` | admin | Nhập data |
| POST `/api/admin/impersonate` | admin | Đăng nhập thay khách |
| GET `/api/settings` · PUT | đọc public · sửa admin | Cấu hình hệ thống |
| POST `/api/upload-logo` · `/api/upload-favicon` · `/api/upload-avatar` | admin/user | Upload ảnh → `public/uploads` |
| POST `/api/translate` · `/api/admin/migrate-translations` | admin | Dịch VI↔ZH |
| GET/POST `/api/scroll` | có token | Lưu vị trí scroll theo user |

> Khi thêm endpoint mới: cập nhật bảng này + thêm validate input + kiểm tra role (xem `SECURITY.md`).

# Luồng nghiệp vụ quan trọng — AutoParts

> ⚠️ CÁC LUỒNG KHÔNG ĐƯỢC PHÁ. ĐỌC TRƯỚC khi sửa bất kỳ file backend (`app/api/**`, `lib/**`, `middleware.ts`).
> Sửa file thuộc luồng dưới → PHẢI báo user + liệt kê thay đổi + chờ xác nhận.

## 🔒 PROTECTED FILES (sửa = phải xin phép)
| File | Vai trò | Vì sao nhạy cảm |
|---|---|---|
| `lib/jwt.ts` | Ký/verify JWT, hash mật khẩu (scrypt) | Sai = lộ tài khoản / hỏng đăng nhập toàn hệ thống |
| `lib/auth.ts` | Helper auth client + bảng `routeRoles` | Sai = render nhầm quyền |
| `middleware.ts` | Chặn `/admin /supplier /affiliate /customer` theo role | Sai = lộ portal/API private |
| `lib/fileStore.ts` | Đọc/ghi mọi `data/*.json` | Sai = hỏng/ mất toàn bộ dữ liệu |
| `app/api/auth/**` | Login / register / me / logout | Sai = lỗ hổng xác thực |
| `app/api/orders/**` | Tạo/cập nhật đơn, sinh invoice/transaction | Sai = hỏng nghiệp vụ / sai tiền |
| `data/*.json` | Dữ liệu thật (users, orders, products...) | Sửa tay = phải backup trước |
| `.env` (JWT_SECRET) | Bí mật ký token | Lộ = giả mạo token |

---

## Luồng 1: Đăng nhập & Phân quyền
**Mục tiêu:** xác thực user, cấp JWT, điều hướng đúng portal, chặn truy cập trái quyền.
**File liên quan:** `app/api/auth/login/route.ts`, `lib/jwt.ts`, `lib/auth.ts`, `middleware.ts`, `app/login/page.tsx`.
**Các bước:**
1. Client POST `/api/auth/login {email,password}` (sau khi qua MathCaptcha phía client).
2. Tìm user trong `users.json`; `verifyPassword(password, passwordHash)` (scrypt; tự nâng cấp hash HMAC cũ).
3. `signToken({id,name,email,role})` → set cookie HttpOnly `ap_token` (24h).
4. Trả `redirect` theo role (customer → `/`, còn lại → portal).
5. Mỗi request vào `/admin|/supplier|/affiliate|/customer`: `middleware.ts` decode token, sai/thiếu → `/login?from=`, sai role → portal của role đó.
**Ràng buộc KHÔNG được phá:** customer login → `/` (trang chủ); nguồn sự thật quyền = middleware + verifyToken (KHÔNG tin localStorage); không bỏ verify chữ ký token.

## Luồng 2: Đặt hàng → Giao dịch → Hoá đơn
**Mục tiêu:** tạo đơn đúng tiền, sinh bản ghi tài chính nhất quán.
**File liên quan:** `app/cart/page.tsx`, `app/checkout/page.tsx`, `lib/cartStore.ts`, `app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/vouchers/validate/route.ts`.
**Các bước:**
1. Giỏ hàng (localStorage `autopart_cart`) → checkout nhập shipping + voucher.
2. `validate` voucher (minOrder, expiry, limit) → tính `discount`.
3. POST `/api/orders` → tạo đơn `status=pending` + **tự ghi 1 `transaction`** (cùng `orderId`).
4. Admin/supplier cập nhật `PUT /api/orders/[id] {status}`; **chủ đơn chỉ được `shipping→delivered`**.
5. Khi chuyển **delivered** lần đầu → **tự tạo `invoice` (INV-<orderId>)** + cập nhật transaction = success.
**Ràng buộc KHÔNG được phá:** `total = subtotal - discount + shipping.fee`; không tạo trùng invoice/transaction cho cùng đơn; không cho customer sửa đơn của người khác / sửa sang trạng thái khác `delivered`.

## Luồng 3: Đăng nhập thay khách (impersonate)
**File:** `app/api/admin/impersonate/route.ts`. Chỉ **admin**. Cấp token tạm cho user khác để hỗ trợ — không lộ mật khẩu. Giữ kiểm tra role admin nghiêm ngặt.

## Luồng 4: Đăng ký NCC / Sản phẩm → Duyệt
**File:** `app/api/suppliers`, `app/admin/approvals`, `approvals.json`. NCC/sản phẩm mới vào `approvals` (status=pending) → admin duyệt mới `active=true`. Không hiển thị sản phẩm chưa duyệt ra storefront.

> Khi thêm luồng cốt lõi mới → cập nhật file này + thêm file vào PROTECTED nếu cần.

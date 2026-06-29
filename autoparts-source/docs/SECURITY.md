# Quy Tắc Bảo Mật — AutoParts

> Mô tả **thực trạng** + **bắt buộc** khi code. (✅ = đã có, ⚠️ = khuyến nghị nên bổ sung)

## 1. Input Validation
- ⚠️ Hiện nhiều route chưa có schema validation chặt → **MỌI route handler mới PHẢI validate đầu vào TRƯỚC khi xử lý** (kiểm tra tồn tại field, kiểu, độ dài; từ chối thừa field nhạy cảm như `role`, `passwordHash`).
- Không tin dữ liệu client cho `role`, `userId`, `price` — luôn lấy từ token/`data` phía server.
- Giới hạn độ dài text (≤255) / textarea (≤10000).

## 2. Authentication & Authorization ✅
- JWT **HMAC-SHA256** tự ký (`lib/jwt.ts`), cookie **`ap_token`** HttpOnly, SameSite=Lax, hạn **24h**.
- Mật khẩu: **scrypt** (N=16384, salt riêng mỗi user). Hash HMAC cũ tự nâng cấp khi đăng nhập.
- Mọi API private kiểm tra `verifyToken` / `requireRole(req,[...])`. Route portal chặn bởi `middleware.ts`.
- Phân quyền: `admin / supplier / affiliate / customer`. Customer chỉ thao tác dữ liệu của chính mình (vd đơn hàng lọc theo `userId`).
- ⚠️ Khuyến nghị: thêm refresh token ngắn hạn; xoay `JWT_SECRET` định kỳ.

## 3. Dữ liệu (KHÔNG có SQL)
- "DB" = `data/*.json` qua `lib/fileStore.ts`. **TUYỆT ĐỐI không** tự `fs` đọc/ghi file data ngoài `fileStore`, và **không** ghép đường dẫn file từ input người dùng (chống path traversal). Tên file luôn là hằng cố định.
- ⚠️ Ghi cả file mỗi lần, không khoá → tránh thao tác ghi song song nặng; backup `data/` trước thay đổi lớn.
- `passwordHash` không bao giờ trả ra API (chỉ trả `{id,name,email,role}`).

## 4. API Security
- ⚠️ Chưa có rate limiting → nên thêm cho `/api/auth/login` (vd 10 req/phút/IP) chống brute-force.
- Không expose stack trace: lỗi trả `{error:"..."}` chung, log chi tiết phía server.
- Upload (`/api/upload-*`): giới hạn loại file (ảnh) + kích thước; lưu `public/uploads`.

## 5. Hạ tầng ✅/⚠️
- ✅ SSL/HTTPS qua Nginx (Let's Encrypt, domain autopartsvietnam.com.vn).
- ⚠️ Firewall: chỉ mở 80/443/22; nên bật **SSH key-only** (tắt password auth).
- Secrets trong `.env` (đặc biệt `JWT_SECRET`) — **KHÔNG commit git**, không hardcode trong code.
- PM2 chạy `next start` (production), không expose cổng 3008 ra ngoài (chỉ Nginx proxy).

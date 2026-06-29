# Project Rules — AutoParts (autopartsvietnam.com.vn)
> Quy tắc làm việc cho AI Agent. Nên đọc trước khi code.
> **Chế độ: AUTONOMOUS ("tự làm hết, báo khi xong")** — AI chủ động làm trọn vẹn, KHÔNG xin phép từng bước; bù lại PHẢI tuân thủ "Lưới an toàn" bên dưới.

---

## ✅ CÁCH LÀM VIỆC (autonomous)
1. Tự thực hiện trọn vẹn yêu cầu (sửa code, fix bug, nối dữ liệu, viết lại file...) — **không dừng hỏi từng file**.
2. Thấy code lỗi/thiếu trong phạm vi → **sửa luôn**, rồi nêu trong báo cáo cuối (không chỉ "báo rồi để đó").
3. Báo cáo **SAU khi xong**: liệt kê file đã sửa + đã verify những gì.
4. **Chỉ DỪNG HỎI khi**: thao tác khó đảo ngược ngoài code (xoá dữ liệu thật, đổi DNS/hạ tầng, deploy production, gửi ra ngoài), hoặc phạm vi yêu cầu mơ hồ.

## 🛡️ LƯỚI AN TOÀN (bắt buộc — KHÔNG nới)
1. **Backup trước thay đổi lớn:** copy file / `data/*.json` (`.bak`) trước khi sửa hàng loạt hoặc đụng vùng nhạy cảm.
2. **Verify sau khi sửa:** `npm run build` OK **+ thử luồng chính** trước khi báo "xong".
3. **Không hardcode** credentials / tokens / secrets — để trong `.env` (`JWT_SECRET`).
4. **Validate đầu vào** ở mọi route `app/api/**`; không tin `role` / `userId` / `price` gửi từ client (lấy từ token/server).
5. **Dữ liệu:** chỉ đọc/ghi qua `lib/fileStore.ts`; không ghép đường dẫn file từ input người dùng. (Dự án dùng **file JSON**, không SQL/ORM.)
6. **Giữ giao diện AutoParts hiện có** (`--ap-primary #1a4b97`); KHÔNG áp navy+gold của `DESIGN.md` lên UI đang chạy.
7. **Cập nhật `docs/CHANGELOG.md`** sau mỗi session (đã sửa file nào, còn gì dang dở).

## 🔶 VÙNG NHẠY CẢM (được sửa, nhưng cẩn trọng hơn + nêu rõ trong báo cáo)
- `lib/jwt.ts`, `lib/auth.ts`, `middleware.ts`, `lib/fileStore.ts` — lõi auth / dữ liệu.
- `app/api/auth/**`, `app/api/orders/**` — xác thực + đơn hàng / hoá đơn / giao dịch.
- `data/*.json` — dữ liệu thật (backup trước khi sửa).
- `.env`, `next.config.ts`, cấu hình nginx / hạ tầng.
> Khi đụng các file này: **backup → sửa → verify kỹ** (đăng nhập + đặt hàng vẫn chạy) → **ghi rõ thay đổi** trong báo cáo + CHANGELOG.

## 📖 NÊN ĐỌC TRƯỚC KHI CODE (để hiểu đúng, theo thứ tự)
1. `RULES.md` (file này) → 2. `docs/ARCHITECTURE.md` → 3. `docs/CRITICAL_PATHS.md` (nếu đụng backend) → 4. `docs/DATABASE.md` (nếu đụng dữ liệu) → 5. `DESIGN.md` (nếu làm UI mới).

## 📝 SAU MỖI SESSION
- Cập nhật `docs/CHANGELOG.md`. Nếu thêm file quan trọng mới → ghi vào mục **VÙNG NHẠY CẢM** ở trên.

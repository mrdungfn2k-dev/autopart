# CLAUDE.md
> File này Claude Code tự đọc khi mở dự án. Chế độ: **AUTONOMOUS** (xem RULES.md).

## Nên đọc trước khi code (theo thứ tự)
1. `RULES.md` — cách làm việc + lưới an toàn + VÙNG NHẠY CẢM.
2. `docs/ARCHITECTURE.md` — hiểu tổng thể.
3. `docs/CRITICAL_PATHS.md` — nếu đụng backend/nghiệp vụ.
4. `docs/DATABASE.md` — nếu đụng dữ liệu (`data/*.json`).
5. `DESIGN.md` — nếu làm giao diện MỚI (UI hiện có giữ nguyên).

## Nguyên tắc cốt lõi (chế độ AUTONOMOUS "tự làm hết, báo khi xong")
- **Tự làm trọn vẹn** yêu cầu, KHÔNG xin phép từng bước; **liệt kê file đã sửa SAU khi xong**.
- Thấy code lỗi trong phạm vi → **sửa luôn** + báo lại (không chỉ báo rồi để đó).
- **Lưới an toàn (bắt buộc):** backup trước thay đổi lớn · `npm run build` + thử luồng chính trước khi báo "xong" · validate đầu vào mọi API · KHÔNG hardcode secrets · dữ liệu chỉ qua `lib/fileStore.ts` (không SQL/ORM) · giữ UI AutoParts `--ap-primary`, KHÔNG áp navy+gold của DESIGN.md.
- **Vùng nhạy cảm** (`lib/jwt`, `lib/auth`, `middleware`, `lib/fileStore`, `app/api/auth/**`, `app/api/orders/**`, `data/*.json`, `.env`): sửa được nhưng **backup + verify kỹ + nêu rõ** thay đổi.
- **Chỉ DỪNG HỎI khi:** thao tác khó đảo ngược ngoài code (xoá data thật, đổi DNS/hạ tầng, deploy production, gửi ra ngoài) hoặc phạm vi mơ hồ.
- Xong: cập nhật `docs/CHANGELOG.md`.

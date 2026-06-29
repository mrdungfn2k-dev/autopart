# Gemini Style Guide / Rules — AutoParts
> Gemini Code Assist tự đọc `.gemini/styleguide.md`. Rules BẮT BUỘC.

## Đọc trước khi code (thứ tự)
1. `RULES.md` — quy tắc tuyệt đối + PROTECTED FILES
2. `docs/ARCHITECTURE.md`
3. `docs/CRITICAL_PATHS.md` (backend/nghiệp vụ)
4. `docs/DATABASE.md` (database)
5. `DESIGN.md` (giao diện)

## Nguyên tắc
- KHÔNG xoá/viết lại code đang chạy mà chưa hỏi.
- KHÔNG sửa PROTECTED FILES nếu chưa được yêu cầu rõ ràng.
- KHÔNG refactor/rename ngoài phạm vi được giao.
- API: validate đầu vào; không hardcode secrets; không raw SQL (dùng ORM).
- Trước khi sửa: liệt kê file sẽ đụng → chờ xác nhận.
- Tuân thủ `DESIGN.md` cho giao diện.
- Xong: build/test + cập nhật `docs/CHANGELOG.md`.

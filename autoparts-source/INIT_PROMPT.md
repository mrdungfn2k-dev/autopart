# 🚀 Prompt khởi tạo dự án (dành cho AI Agent)
> Copy nguyên khối dưới đây, điền `[...]`, rồi dán cho AI Agent khi bắt đầu dự án mới.

```
Dự án: AutoParts
File Usecase: [paste hoặc đính kèm file Usecase]
File Mockup: [link hoặc mô tả design]

Hãy thực hiện Technical Design cho dự án này:

1. Tạo file docs/ARCHITECTURE.md:
   - Tech stack đề xuất + lý do chọn
   - Sơ đồ cấu trúc thư mục
   - Sơ đồ luồng dữ liệu tổng thể
   - Các service bên ngoài (nếu có)

2. Tạo file docs/DATABASE.md:
   - Toàn bộ bảng dữ liệu từ Usecase
   - Mỗi bảng: tên cột, type, constraint, mô tả
   - Sơ đồ quan hệ (1-1, 1-N, N-N)
   - Quy tắc migration

3. Tạo file docs/API_CONTRACTS.md:
   - Mọi endpoint cần thiết
   - Method (GET/POST/PUT/DELETE)
   - Request body + Response body mẫu
   - Authentication requirement

4. Tạo file docs/CRITICAL_PATHS.md:
   - Các luồng nghiệp vụ quan trọng nhất
   - Mỗi luồng: file liên quan + flow từng bước
   - Đánh dấu file PROTECTED

5. Tạo file RULES.md theo template chuẩn (đã có sẵn — điền tên dự án + protected files)

6. Tạo file docs/SECURITY.md theo template chuẩn (đã có sẵn)

7. Đề xuất thứ tự triển khai module (dependency order)

Yêu cầu: Chi tiết, đầy đủ, có thể đọc độc lập mà hiểu toàn bộ dự án.
Tuân thủ RULES.md và DESIGN.md (giao diện) trong suốt quá trình.
```

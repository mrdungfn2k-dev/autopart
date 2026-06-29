# Đối chiếu lại VNS vs AutoParts — kiểm tra trên CODE THỰC TẾ

> Nguồn kiểm tra: source khôi phục **autoparts-backup-phase5 (05/05/2026)** — bản đầy đủ nhất cứu được từ server (xem mục "Tình trạng" bên dưới). Bản deploy thực tế (≈20/05) còn **mới hơn**, nên các mục đánh "ĐÃ CÓ" gần như chắc chắn vẫn còn; chỉ các mục "THIẾU/MỘT PHẦN" là có thể đã được bổ sung trong 2 tuần chênh lệch mà bản snapshot chưa có.

## ⚠️ Tình trạng nghiêm trọng cần biết trước
- Thư mục mã nguồn deploy `/var/www/autoparts` trên server **45.119.83.233 đã bị XÓA khỏi ổ đĩa**.
- App Next.js vẫn chạy (PM2 `autoparts`, cổng 3008) **chỉ vì tiến trình còn giữ file trong RAM**. API trả dữ liệu thật, nhưng static asset (CSS/JS) đã trả lỗi 500 (mất khỏi đĩa).
- **Nếu tiến trình restart hoặc server reboot → toàn bộ mã nguồn + dữ liệu trong RAM mất vĩnh viễn.**
- Bản cứu được tốt nhất là các snapshot trong `/root/autoparts-backup-*` (mới nhất 05/05), đã tải về `htdocs/autopart-backup/`.
- Domain `autopartsvietnam.com.vn` hiện trỏ DNS về **103.97.134.164** (server KHÁC) — có thể là nơi production thật.

## Kết luận tổng quát
Bảng Excel ghi rất nhiều mục **"Chưa thấy"**, nhưng kiểm tra trên code thì **phần lớn ĐÃ CÓ** (route + trang + API + đã gắn vào menu). Bảng Excel được làm bằng cách **duyệt UI bản cũ**, không phản ánh đúng code.

---

## A. ADMIN — đối chiếu lại

| Excel | Mục | Excel nói | Code thực tế | Kết luận |
|---|---|---|---|---|
| R7 | Bộ thuộc tính | Chưa thấy | `app/admin/attribute-sets/page.tsx` + API + menu | ✅ ĐÃ CÓ |
| R8 | Thuộc tính SP | Chưa thấy | Trong attribute-sets | ✅ ĐÃ CÓ |
| R9 | Tìm kiếm | Chưa thấy | Storefront `/search` có; **trang admin từ đồng nghĩa: link menu có nhưng CHƯA có page** | ⚠️ MỘT PHẦN |
| R10 | Tối ưu SEO | Chưa thấy | Có meta cơ bản theo trang + vài cấu hình trong settings; **chưa có module SEO riêng** | ⚠️ MỘT PHẦN |
| R11 | Trang chi tiết SP | Chưa thấy | `app/products/[id]` có (gallery, đánh giá, liên quan); chưa có trang admin cấu hình PDP | ⚠️ MỘT PHẦN |
| R12 | So sánh SP | Chưa thấy | `components/CompareBar.tsx` + `/products` | ✅ ĐÃ CÓ |
| R13 | Danh sách yêu thích | Chưa thấy | `app/customer/wishlist` + menu | ✅ ĐÃ CÓ |
| R14 | Đánh giá SP | Chưa thấy | Khách viết được (`customer/reviews`); **CHƯA có trang admin duyệt đánh giá** | ⚠️ MỘT PHẦN |
| R15-16 | Đơn hàng / trạng thái | Một phần | `app/admin/orders` đầy đủ trạng thái + API | ✅ ĐÃ CÓ |
| R17 | Tạo đơn tại admin | Chưa thấy | Admin chỉ quản lý đơn có sẵn; **chưa có nút tạo đơn thủ công** | ❌ THIẾU |
| R18 | Hóa đơn | Chưa thấy | `app/admin/invoices` + API + menu | ✅ ĐÃ CÓ |
| R19 | Giao hàng | Chưa thấy | `app/admin/carriers` (đơn vị VC) + trạng thái giao trong đơn | ✅ ĐÃ CÓ |
| R20 | Hoàn tiền | Chưa thấy | `app/admin/refunds` + API + menu | ✅ ĐÃ CÓ |
| R21 | Giao dịch | Chưa thấy | `app/admin/transactions` + menu | ✅ ĐÃ CÓ |
| R22 | Mua lại đơn | Chưa thấy | Có ở `customer/orders` (mua lại) | ✅ ĐÃ CÓ |
| R23 | Trang giỏ hàng | Chưa thấy | `app/cart` (storefront) | ✅ ĐÃ CÓ (storefront) |
| R24 | Giỏ hàng mini | Chưa thấy | Có trong `StorefrontHeader` | ✅ ĐÃ CÓ |
| R25 | Thanh toán khách vãng lai | Chưa thấy | `checkout` + `api/orders` hỗ trợ guest | ✅ ĐÃ CÓ |
| R26 | Mua ngay | Chưa thấy | Nút trong `products/[id]` | ✅ ĐÃ CÓ |
| R27 | Gợi ý mua kèm | Chưa thấy | Sản phẩm liên quan trong PDP | ✅ ĐÃ CÓ (cơ bản) |
| R28 | Ước tính phí VC | Chưa thấy | Có cấu hình carrier; ước tính tại checkout chưa rõ | ⚠️ MỘT PHẦN |
| R29 | Quản lý KH | Một phần | `app/admin/users` (vai trò, nhóm, khóa/mở) | ✅ ĐÃ CÓ |
| R30 | Địa chỉ KH | Chưa thấy | `app/customer/address` + menu | ✅ ĐÃ CÓ |
| R31 | Đăng nhập thay khách | Chưa thấy | `api/admin/impersonate/route.ts` | ✅ ĐÃ CÓ |
| R32 | GDPR | Chưa thấy | `api/auth/me/export` (xuất dữ liệu cá nhân) + `/privacy` | ✅ ĐÃ CÓ (cơ bản) |
| R33 | CAPTCHA | Chưa thấy | `components/MathCaptcha.tsx` | ✅ ĐÃ CÓ |
| R34 | Bản tin | Chưa thấy | `app/admin/newsletter` + campaigns + send API | ✅ ĐÃ CÓ |
| R35 | Mẫu email & thông báo | Chưa thấy | Chỉ có cấu hình rời trong settings; **chưa có trình quản lý mẫu email** | ⚠️ MỘT PHẦN |
| R36-40 | Đối tác/NCC/Đại lý/Duyệt/Giải ngân | Có (auto hơn VNS) | Có đủ supplier/affiliate/approvals/payouts | ✅ ĐÃ CÓ |
| R41 | Phân quyền | Một phần | Có vai trò + nhóm; chưa chi tiết theo hành động | ⚠️ MỘT PHẦN |
| R42-45 | Khuyến mãi/CTQC | Một phần | `marketing` (voucher, banner, flash sale) | ✅ ĐÃ CÓ (cơ bản) |
| R43 | Quy tắc giỏ hàng | Chưa thấy | **Không có cart price rule** | ❌ THIẾU |
| R44 | Quy tắc danh mục | Chưa thấy | Chỉ có promo trong marketing; chưa có catalog price rule riêng | ⚠️ MỘT PHẦN |
| R46-48 | CMS / trang / khối | Chưa thấy | `app/admin/cms` + `home-sections` | ✅ ĐÃ CÓ |
| R49 | Mã tùy biến | Chưa thấy | Có inject custom code trong settings + layout | ✅ ĐÃ CÓ |
| R50-52 | Giao diện/logo/màu | Một phần | `settings` + upload logo/favicon + theme | ✅ ĐÃ CÓ |
| R53-55 | Kho/nguồn/đặt trước | Chưa thấy | `app/admin/inventory` + `warehouses` + restock API | ✅ ĐÃ CÓ |
| R56-58 | Thuế/loại/suất | Chưa thấy | `app/admin/tax-rates` + API | ✅ ĐÃ CÓ |
| R59 | Tiền tệ | Chưa thấy | Có CurrencySwitcher + xử lý tiền tệ; quản lý tỷ giá ở admin chưa rõ | ⚠️ MỘT PHẦN |
| R60 | Ngôn ngữ | Chưa thấy | `lib/i18n.ts` + LangSwitcher (VI/EN) | ✅ ĐÃ CÓ |
| R61-62 | Kênh bán / nhiều cửa hàng | Chưa thấy | `app/admin/channels` + API | ✅ ĐÃ CÓ (cơ bản) |
| R63-65 | Nhập/xuất/chuyển dữ liệu | Chưa thấy | `app/admin/import-export` + data-import/export API | ✅ ĐÃ CÓ |
| R67 | Đổi trả | Chưa thấy | `app/customer/returns` (khách); admin RMA chưa có trang riêng | ⚠️ MỘT PHẦN |
| R68 | Vận chuyển | Chưa thấy | `app/admin/carriers` | ✅ ĐÃ CÓ |

## B. KHU VỰC KHÁCH HÀNG (R86-R100)

| Excel | Mục | Excel nói | Code thực tế | Kết luận |
|---|---|---|---|---|
| R90 | Danh sách yêu thích | Chưa thấy | `customer/wishlist` + **đã gắn menu** | ✅ ĐÃ CÓ |
| R91 | Đánh giá đã viết | Chưa thấy | `customer/reviews` + **đã gắn menu** | ✅ ĐÃ CÓ |
| R92 | Đổi trả / RMA | Chưa thấy | `customer/returns` + **đã gắn menu** | ✅ ĐÃ CÓ |
| R93 | Sổ địa chỉ | Chưa thấy | `customer/address` + **đã gắn menu** | ✅ ĐÃ CÓ |
| R95-99 | Gara/Điểm thưởng/Bảo hành/Cài đặt/Hỗ trợ | Có | Đều có route + menu | ✅ ĐÃ CÓ |

→ **Toàn bộ 4 mục "Chưa thấy" của khu vực khách hàng đều đã có sẵn và đã nằm trong menu** (xác minh trong `CustomerSidebar.tsx`).

---

## C. DANH SÁCH THỰC SỰ CÒN THIẾU / MỎNG (việc cần làm thật)
Dựa trên snapshot 05/05 (cần xác nhận lại với bản deploy mới hơn):

1. **Trang admin "Từ đồng nghĩa / tìm kiếm"** (R9) — menu có link `/admin/search-synonyms` nhưng **chưa có page** (link chết).
2. **Trang admin duyệt/quản lý đánh giá** (R14) — khách viết được nhưng admin chưa có nơi duyệt.
3. **Quy tắc giá giỏ hàng (cart price rules)** (R43) — chưa có.
4. **Tạo đơn thủ công tại admin** (R17) — chưa có.
5. **Module SEO riêng** (R10) — mới có meta cơ bản, chưa có quản lý từ khóa/URL rewrite/synonym tập trung.
6. **Trình quản lý mẫu email** (R35) — mới có cấu hình rời.
7. **Quy tắc giá theo danh mục (catalog price rules)** (R44) — mới có promo rời trong marketing.
8. *(Mỏng)* Ước tính phí VC tại checkout (R28); quản lý tỷ giá tiền tệ ở admin (R59); trang admin RMA đổi trả (R67); phân quyền chi tiết theo hành động (R41).

> Các mục còn lại trong Excel: **đã có sẵn trong code**, không cần làm lại (làm lại sẽ trùng).

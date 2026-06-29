# Changelog — AutoParts
> AI Agent cập nhật mục mới ở TRÊN CÙNG sau MỖI session. Mới nhất ở trên.

## Định dạng
```
## [YYYY-MM-DD] — Tiêu đề ngắn
- Đã làm: …
- File đã sửa/tạo: …
- Lưu ý / còn dang dở: …
```

---

## [2026-06-13] — Batch QQ: Giao dịch dữ liệu THẬT (bỏ ví MoMo) · Phân trang đồng loạt 4 phân quyền
- ✅ **#1 Mục Giao dịch — dữ liệu chuẩn**: `/api/transactions` trước đọc `transactions.json` seed (còn ví MoMo/ZaloPay đã bỏ). Nay **suy ra từ đơn hàng THẬT** (số tiền/thời gian/trạng thái thật), phương thức chỉ còn **QR + COD** (hệ thống đã bỏ MoMo). (Verify prod: 20 GD, method=['qr'], hasMomo=false.) (`app/api/transactions/route.ts`)
- ✅ **#2 Phân trang đồng loạt**: thêm hook dùng chung `lib/usePaged.ts` + gắn `<Pagination>` (căn giữa) vào **16 bảng** trước đây liệt kê tràn không phân trang, đủ 4 phân quyền:
  - **Admin (9)**: Giao dịch, Hoàn tiền, Hóa đơn, Tồn kho, Sản phẩm (catalog), Vận chuyển, Kênh bán, Kho hàng, Loại thuế.
  - **NCC (2)**: Quản lý sản phẩm, Tồn kho (1827 SP — quan trọng nhất).
  - **Đại lý (1)**: Link Affiliate.
  - **Khách (2)**: Sổ địa chỉ, Đổi/trả hàng.
  - (Trước đó đã có sẵn phân trang: admin Đơn hàng/NCC/Người dùng, NCC Đơn hàng, Khách Đơn hàng/Yêu thích/Đánh giá.)
- 📌 Còn lại các danh sách NHỎ/mock (đại lý hoa hồng/đội nhóm/rút tiền, khách gara/bảo hành/lịch sử điểm, admin tài chính/phê duyệt/tạm ngưng/marketing/hãng xe…) — `Pagination` tự ẩn khi ≤1 trang; sẽ gắn nốt đợt sau nếu cần.
- Deploy 164: build rc=0 → restart → HTTP 200.

## [2026-06-13] — Batch PP: OEM≤20/Tên SP≤70 + cuộn ngang · Lịch sử đổi quà · Popup tự ẩn 5s · i18n kho/tin nhắn · Nhập/Xuất CSV chuẩn
- ✅ **#1+2 Ô nhập SP**: mã OEM `maxLength=20`; tên SP `maxLength=70`. Bảng danh sách SP đổi từ cắt chữ → **cuộn ngang** (whitespace-nowrap + overflow-x-auto) để xem đủ tên dài. (`app/supplier/products/page.tsx`)
- ✅ **#3 Lịch sử đổi quà**: lưu **mã voucher** vào sổ điểm; trang Điểm thưởng (tab Đổi quà) thêm mục **"Lịch sử đổi quà"** liệt kê mã đã đổi + nút Sao chép → khách dùng lại sau. (Verify: đổi 300đ → lịch sử lưu mã RW…, số dư trừ đúng.) (`lib/loyalty.ts`, `app/api/rewards/{redeem,balance}`, `app/customer/rewards/page.tsx`)
- ✅ **#4 Popup tự ẩn sau 5s (toàn hệ thống)**: Toaster 3.8s → **5s**; banner "Đổi quà thành công" cũng tự ẩn sau 5s (mã vẫn lưu ở lịch sử). (`components/Toast.tsx`, `app/customer/rewards/page.tsx`)
- ✅ **#5 i18n còn sót**: trang **Tồn kho** nay hiện **tên SP theo nameZh** khi chọn 中文 + dịch tiêu đề cột; **hộp thư** (NCC+admin dùng chung `MessagesInbox`) dịch đủ tiêu đề/đếm hội thoại/empty/nút Gửi/placeholder/đã xem (VI/EN/ZH). (`app/supplier/inventory/page.tsx`, `components/MessagesInbox.tsx`)
- ✅ **#6 Nhập/Xuất CSV** (trước bản prod cũ: nhập im lặng, không chặn trùng, không validate, format không khớp):
  - **Nhận đúng định dạng file của bạn**: parser xử lý **dấu ngoặc kép** (tên chứa dấu phẩy không vỡ cột) + **quy đổi tên cột linh hoạt** (NAME/OEM_CODE/PART_BRAND/CATEGORY_ID/PRICE/PRICE_BEFORE_TAX/STOCK/WARRANTY_MONTH/SKU — chấp nhận cả CHỮ HOA, chữ thường, tiếng Việt). Lưu thêm `sku` + `warrantyMonth`.
  - **Validate**: thiếu NAME/PRICE → **không cho import** + báo rõ.
  - **Chặn trùng**: so mã OEM/SKU/tên với SP hiện có → bỏ qua + **popup "đã có rồi"**; có **thông báo kết quả** (đã nhập N · bỏ qua M trùng · lỗi).
  - **Export**: tab Xuất sản phẩm xuất CSV đúng cột (NAME/OEM_CODE/SKU/…) tải lại được. (Trước trên prod chưa có do build cũ.)
  - (Verify: header NAME/OEM_CODE/… map đúng; tên "…Camry, RAV4" giữ nguyên 1 cột.)
- Deploy 164: build rc=0 → restart → HTTP 200; /api/products vẫn 1827 SP.

## [2026-06-13] — Batch OO: Giới hạn ô SP/giá · Sửa "kđ" · Đổi điểm THẬT + admin cấu hình · Sửa voucher · Đếm click affiliate
- ✅ **#1 Giới hạn ô nhập sản phẩm**: tên SP + mã OEM `maxLength=50`; ô **giá** `max=100 triệu` + **kẹp khi gõ** (không nhập quá 100tr) + validate khi lưu. Bảng danh sách SP thêm `truncate` cho tên/OEM/giá → dòng cũ quá dài không còn vỡ khung. (`app/supplier/products/page.tsx`)
- ✅ **#2 Lỗi hiển thị "kđ"**: biểu đồ chi tiêu (dashboard khách) trước chia /1000 rồi gắn "k₫" → ra "48.525 kđ" khó hiểu. Nay dùng `formatVndShort` (48,5 Triệu) cho cả cột & tooltip; điểm tích cũng đổi về 1đ/10.000đ cho đồng nhất. (`app/customer/page.tsx`)
- ✅ **#3 Đổi điểm THẬT + admin cấu hình** (trước nút "Đổi ngay" chết, gọi API admin → 403, dữ liệu ảo):
  - **Điểm THẬT**: `lib/loyalty.ts` — số dư = điểm tích (theo đơn, 1đ/10.000đ) − điểm đã đổi (sổ `loyalty.json`). API `/api/rewards/balance`.
  - **Đổi quà chạy**: `/api/rewards/redeem` (khách) — kiểm tra đủ điểm → **phát voucher cá nhân THẬT** (1 lần, hết hạn 30 ngày, gắn userId) → **trừ điểm**. Trang khách hiện đúng số dư + mã voucher sau khi đổi. (Verify: đổi 300đ → mã RW…, số dư 1624→1324, trừ đúng 300.)
  - **Admin cấu hình**: tab **"Đổi điểm"** mới ở Marketing — CRUD danh mục quà (tên VI/ZH, điểm cần, loại/giá trị ưu đãi, đơn tối thiểu, bật/tắt). Catalog `/api/rewards` (mặc định 4 quà khớp UI cũ).
- ✅ **#4 Admin sửa voucher**: thêm nút **✎ Sửa** mỗi dòng → mở modal điền sẵn, lưu qua PUT `/api/vouchers/[id]` (đã có sẵn); mã voucher khoá khi sửa (tránh trùng). (`app/admin/marketing/page.tsx`)
- ✅ **#5 Đếm click affiliate**: mỗi seed nay 1 **mã ref riêng** (LP2024 / LP2024MP / LP2024FS) thay vì dùng chung → click link nào chỉ tăng đúng link đó; **BỎ luật reset click seed về 0** → lượt click THẬT được giữ. (Verify local: click LP2024MP → l2 +1, l1/l3 không đổi, GIỮ sau reload.) (`app/api/affiliate-links/route.ts`)
- Deploy 164: build rc=0 → restart → HTTP 200; `/api/rewards` seed 4 quà; seed link ref đã unique.

## [2026-06-13] — Batch NN: i18n hồ sơ · Chặn NCC tạm ngưng đăng nhập · Admin duyệt rút tiền · Họ tên ≤20 · Gộp hồ sơ đại lý
- ✅ **#1 i18n hồ sơ + nút (4 phân quyền)**: 3 trang Hồ sơ (NCC/Admin/Đại lý) trước hardcode tiếng Việt → nay dùng `t()` (tiêu đề, nút Trang chủ/Lưu thay đổi, Thông tin cơ bản, Họ và tên, Email, Phân quyền). Thêm khoá i18n profile VI/EN/ZH. Sửa **tràn tên** ở footer sidebar đại lý (thêm `min-w-0`). (admin/settings là trang cấu hình lớn ~120 chuỗi — để đợt sau.)
- ✅ **#2 NCC bị tạm ngưng KHÔNG đăng nhập được + popup**: trước admin duyệt ngưng nhưng NCC vẫn vào được. Nay `login` chặn (403 + popup "Cửa hàng đã bị tạm ngưng…") và `/api/auth/me` trả `active:false` để `AuthWatcher` **đá phiên đang đăng nhập** trong ≤20s. Chỉ chặn khi `status:"suspended"` (KHÔNG nhầm với "ẩn gian hàng" active=false). **Khôi phục**: admin → Nhà cung cấp bấm "Hiện" (PUT `active:true` tự gỡ suspended) hoặc admin → Yêu cầu tạm ngưng → "Mở lại cửa hàng". (login, me, suppliers/[id], suspension-requests/[id], admin/suspensions)
- ✅ **#3 Ai duyệt tiền rút?** Admin. Trang **Tài chính → Hoa hồng Đại lý** nay hiển thị yêu cầu rút (nhãn đỏ "Rút tiền" + STK, số tiền dấu trừ) kèm **Duyệt rút / Từ chối**. Duyệt→PAID (trừ hẳn số dư), Từ chối→REJECTED (trả lại số dư). Sửa mô hình số dư: `available = hoa hồng chưa trả − (PENDING+PAID, trừ REJECTED)` nên duyệt xong số dư GIỮ giảm. "Xét duyệt tất cả" không còn auto-duyệt yêu cầu rút. (payouts, admin/finance, affiliate/withdraw)
- ✅ **#4 Họ và tên ≤ 20 ký tự (toàn hệ thống)**: `lib/validators` (RE_NAME/FIELD_ATTRS) 50→20 + tất cả ô tên (đăng ký, hồ sơ 4 role, sổ địa chỉ, thanh toán, admin/users) `maxLength=20` → không nhập dài gây tràn khung.
- ✅ **#5 Gộp "Thông tin cá nhân" vào Hồ sơ đại lý + full khung**: chuyển khối thông tin đầy đủ (tên, email, SĐT, kênh phân phối, giới thiệu) từ Cài đặt → **trang Hồ sơ** (đầy đủ hơn, lưu chung `ap_affiliate_settings.profile` + đồng bộ tài khoản, có validate). Cài đặt bỏ khối trùng, chỉ còn thanh toán/thông báo/riêng tư. Cả 2 trang **full khung** (bỏ `max-w` gây hở phải). Dịch VI/ZH.
- ✅ **#6 Kiểm tra nút Cài đặt các phân quyền**: Đại lý/NCC/Admin — Lưu + mọi toggle/select HOẠT ĐỘNG (lưu localStorage hoặc API, giữ sau reload). Khách — toggle OK; còn 2 điểm: nút "Xóa tài khoản" mới ghi nhận yêu cầu (chưa xoá thật), ô Tiền tệ chỉ hiển thị theo ngôn ngữ. Admin — 2 trường `affiliateT1/affiliatePassive` trong state nhưng chưa có ô nhập (vô hại).
- Deploy 164: build rc=0 → restart → HTTP 200; regression login affiliate/admin/supplier đều 200 (đã khôi phục NCC demo s001 đang bị ngưng từ lần test trước).

## [2026-06-12] — Batch MM: Đánh giá ảo (toàn catalog) · i18n admin ZH · Lọc đại lý · Phân trang trang chủ · Tiếp nhận tạm ngưng · Khoá số dư rút · Validate Họ tên
- ✅ **#1 Đánh giá ẢO — sửa TẬN GỐC (cả 1827 SP)**: phát hiện storefront đọc `data/products.json` (KHÔNG phải `lib/data.ts`), nên bản vá seed trước không có tác dụng. Nay `/api/products` **tính rating/reviewCount từ `reviews.json` (fallback 0)** — y như cách đã tính `sold` từ orders. Ghi đè mọi số ảo còn sót → toàn bộ SP hiện **0 sao / (0)** khi chưa có đánh giá thật; KHÔNG đụng file dữ liệu prod. (Verify prod: 1827 SP, nonZeroRating=0.)
- ✅ **#2 i18n admin tiếng Trung**: sidebar admin (18 mục: NCC, Tin nhắn, CMS, Giao dịch, Hoàn tiền…) + **trang Giao dịch** (tiêu đề, bộ lọc, cột bảng, nhãn loại/phương thức/trạng thái, định dạng tiền & ngày) nay dịch đủ VI/EN/ZH (trước hardcode tiếng Việt nên chọn 中文 vẫn ra tiếng Việt). Thêm ~40 khoá i18n. (`lib/i18n.ts`, `components/AdminSidebar.tsx`, `app/admin/transactions/page.tsx`)
- ✅ **#3 Dashboard đại lý có bộ lọc đầy đủ**: thêm lọc **Tuần/Tháng/Năm/Tùy chọn** (+ chọn khoảng ngày) như NCC/admin; biểu đồ tính từ **hoa hồng THẬT** theo kỳ (trước là mảng cứng). Bỏ 2 dòng hoa hồng bịa (10.84M/3.8M) → dùng số thật chờ duyệt/đã nhận. (`app/affiliate/page.tsx`)
- ✅ **#4 Trang chủ "Phụ tùng mới" → PHÂN TRANG**: thay nút "Xem thêm sản phẩm" bằng `Pagination` căn giữa dùng chung (30 SP/trang, cuộn lên đầu khi đổi trang). (`app/page.tsx`)
- ✅ **#5 Admin TIẾP NHẬN yêu cầu tạm ngưng**: trước nút NCC chỉ hiện toast giả. Nay **lưu THẬT** qua API mới `POST /api/suspension-requests` (+ confirm trước khi gửi); thêm trang **admin `/admin/suspensions`** (tab Chờ/Chấp nhận/Từ chối + nút duyệt/từ chối), mục sidebar, và thông báo chuông cho admin. Chấp nhận = tạm ngưng NCC (best-effort theo supplierId). (`app/api/suspension-requests/**`, `app/admin/suspensions/page.tsx`, `AdminSidebar`, `app/api/notifications`, `app/supplier/settings`)
- ✅ **#6 Rút tiền đại lý — KHOÁ số dư**: trước gửi yêu cầu xong số dư không giảm (chỉ trừ tạm ở client, reload là về cũ). Nay `POST /api/payouts` lưu **yêu cầu rút (kind=withdrawal, PENDING)**; số dư khả dụng = hoa hồng chưa trả − **yêu cầu đang chờ (đã khoá)** → giảm thật & GIỮ NGUYÊN sau reload; ô "Đang xử lý" hiện đúng tổng đang chờ (bỏ số cứng 3.2M). (`app/api/payouts/route.ts`, `app/affiliate/withdraw/page.tsx`)
- ✅ **#7 Trường "Họ và tên" — validate + chống tràn**: thêm `maxLength=50` + pattern + kiểm tra khi lưu (dùng `lib/validators`) cho hồ sơ NCC/Admin, Cài đặt đại lý, sổ địa chỉ KH; thêm `truncate`/`min-w-0` cho tiêu đề hồ sơ (NCC/Admin/KH) để tên dài không vỡ bố cục. (`app/{supplier,admin,customer}/profile`, `app/affiliate/settings`, `app/customer/address`)
- ✅ **#8 Cài đặt đại lý đồng bộ tài khoản**: trước lưu riêng localStorage nên tên không khớp hồ sơ. Nay lưu kèm **đồng bộ tên/email vào tài khoản (setAuth)** + validate; khởi tạo tên/email từ tài khoản thật. (`app/affiliate/settings/page.tsx`)
- 📌 Sheet QA: link CSV export cần đăng nhập nên không tự đọc được; đã xử lý trọn 8 mục người dùng nêu. i18n vẫn còn vài trang chuỗi cứng (dashboard đại lý phần KPI/CTV, form thêm SP NCC) — làm tiếp đợt sau.
- Deploy 164: build rc=0 → restart `autoparts` → HTTP 200; prod /api/products 1827 SP rating=0.

## [2026-06-12] — Batch JJ–LL: Đánh giá ảo · i18n ZH · Biển số · Lọc thống kê NCC · Phân trang giữa · Chuông KH · Tài chính & Link affiliate SỐ LIỆU THẬT
- ✅ **#1 Bỏ đánh giá ẢO**: sản phẩm seed/mẫu trước gán cứng `rating 4.8 / reviewCount` giả → nay `sold/rating/reviewCount = 0` (sao xám, không bịa đánh giá). (`lib/data.ts`)
- ✅ **#2 i18n tiếng Trung**: dịch nốt cảnh báo tồn thấp + 4 thẻ thống kê kho NCC (Tổng SKU / Tổng tồn / Sắp hết / Hàng đang về) VI/EN/ZH. (`app/supplier/inventory/page.tsx`)
- ✅ **#3 Biển số xe đúng định dạng**: ô biển số `maxLength=12`, tự viết hoa + chỉ cho ký tự hợp lệ, viền đỏ khi sai; ô Dòng xe `maxLength=40`. (`app/customer/garage/page.tsx`)
- ✅ **#4 Thống kê NCC — lọc tùy chọn + "tháng này" = 30 ngày**: thêm kỳ **Tùy chọn** (chọn từ ngày–đến ngày), và "tháng này" vẽ **đủ số ngày trong tháng** (cột theo ngày) thay vì gộp theo tuần. (`app/supplier/page.tsx`)
- ✅ **#5 Phân trang căn GIỮA toàn hệ thống**: `Pagination` đổi sang `flex-col items-center` (cụm nút canh giữa, nhãn "trang x/y" xuống dưới) — áp dụng mọi nơi dùng chung component. (`components/Pagination.tsx`)
- ✅ **#6 Chuông thông báo cho KHÁCH ở storefront**: `NotificationBell` thêm prop `inline`; nhúng vào `StorefrontHeader` → khách đăng nhập thấy chuông xám như các role khác (trước chỉ hiện trong khu phân quyền).
- ✅ **#7 Tài chính NCC — SỐ LIỆU THẬT**: KPI (doanh thu/lãi ròng/phí/chờ đối soát) + bảng tổng hợp nay tính từ **đơn hàng thật** (tháng hiện tại, phí 11.1%), fallback dữ liệu mẫu khi chưa có đơn. (`app/supplier/finance/page.tsx`)
- ✅ **#8 Link affiliate — SỐ LIỆU THẬT (bỏ số ảo + thêm theo dõi thật)**:
  - Seed l1/l2/l3 trước bịa cứng (1284 click, 48 đơn…) → **reset 0**; tự **migrate an toàn** theo vân tay legacy (chỉ đụng seed chưa có hoạt động thật, không clobber link thật của user).
  - **Theo dõi click THẬT**: `AffiliateRefTracker` (gắn ở `StorefrontHeader`) — khách mở URL `?ref=CODE` → ghi +1 click (1 lần/phiên), lưu ref 30 ngày.
  - **Gán đơn THẬT**: checkout đặt hàng thành công → cộng +1 đơn + doanh thu cho link ref (trong 30 ngày). Tỷ lệ chuyển đổi tự tính.
  - API mới `POST /api/affiliate-links/track {ref,type,amount}` (validate ref chặt, không cần auth cho click công khai).
  - Verify prod: tất cả link = 0 click/0 đơn (đã dọn click test); POST track tăng đúng số.
- File tạo/sửa: `lib/data.ts`, `app/supplier/{inventory,page,finance}/page.tsx`, `app/customer/garage/page.tsx`, `components/{Pagination,NotificationBell,StorefrontHeader,AffiliateRefTracker}.tsx`, `app/api/affiliate-links/{route,track/route}.ts`, `app/checkout/page.tsx`.
- Deploy 164: build rc=0 → restart `autoparts` → HTTP 200 (`/`, `/api/affiliate-links`).

## [2026-06-12] — Batch GG: Thống kê NCC như admin · Tên NCC (phiên cũ) · Validate xe · Nút hỗ trợ · Lọc đánh giá
- ✅ **Thống kê NCC như admin** (số liệu THẬT + lọc kỳ): dashboard NCC nay tính doanh thu/đơn chờ/tồn thấp từ **đơn hàng thật**, biểu đồ lọc **7 ngày / tháng này / năm nay** (gộp đơn theo ngày/tuần/tháng). Có fallback dữ liệu mẫu khi chưa có đơn.
- ✅ **Tên NCC đồng bộ cho CẢ phiên đăng nhập cũ**: trước chỉ đồng bộ khi đăng nhập lại; nay `/api/auth/me` trả thêm `supplierId` (đọc lại users.json theo cookie) → sidebar NCC lấy tên công khai (suppliers.json) mà không cần đăng nhập lại. (Verify: me route chỉ khác đúng dòng sửa, login OK.)
- ✅ **Thêm xe — validate chặt hơn**: bắt buộc chọn Hãng + nhập Dòng xe (≥2 ký tự) + **Biển số đúng định dạng VN** (vd 51A-123.45 / 30F-12345); nhập bừa bị chặn + popup.
- ✅ **Nút hỗ trợ (/support)**: "Bắt đầu chat" → mở khung chat (open-chat), "Gọi ngay" → `tel:`, "Gửi email" → `mailto:` (trước cả 3 nút chết).
- ✅ **Bộ lọc "Đánh giá cao"**: thêm tie-break theo số lượt đánh giá → sắp xếp rõ rệt hơn (trước nhiều SP cùng rating nên không thấy đổi).
- ✅ **i18n tiếp**: dịch đủ VI/EN/ZH trang **Tài chính NCC** + các chuỗi cứng ở **dashboard NCC** (subtitle, nút xem sao kê, tồn kho, quản lý kho...). Cùng Cài đặt khách (batch FF).
- ✅ **Khung NCC bớt hở**: trang Cài đặt NCC `max-w-2xl` → `max-w-5xl` (trước thừa khoảng trống phải).
- File: api/auth/me, SupplierSidebar, supplier/{settings,finance,page}, products, search, customer/garage, support.
- Deploy 164: build rc=0 → restart → HTTP 200; pages 200.
- ✅ **Vận hành tự động NCC (option a — đã làm):** khi NCC mở trang Đơn hàng, nếu bật "Tự động xác nhận đơn" → các đơn `pending` tự chuyển `confirmed`; nếu bật "Tự động cập nhật vận chuyển" → đơn `confirmed` tự chuyển `shipping` (PUT /api/orders/[id]), kèm toast tổng kết. (`app/supplier/orders/page.tsx`)
- 📌 **CÒN LẠI:** **i18n** còn nhiều trang chuỗi cứng (dashboard đại lý, form thêm SP NCC...) — làm tiếp theo đợt.

## [2026-06-12] — Batch FF: Thanh cuộn sát viền + chuông · Cài đặt khách · Đồng bộ màu · Tên NCC · Sửa tồn kho
- ✅ **Thanh cuộn sát viền phải + chuông nằm gọn** (cả 4 role): BỎ gutter `lg:pr-14` trên layout (trước đẩy `<main>` cuộn vào trong → thanh cuộn "ở giữa"); thêm class `ap-role-shell` + CSS chỉ pad **thanh tiêu đề** trang để chừa chỗ cho chuông → thanh cuộn về sát mép, body lấp đầy (bớt hở trống). Chuông về `right-4` (qua thanh cuộn).
- ✅ **Cài đặt khách hoạt động** (đúng các chức năng): đổi **Ngôn ngữ** giờ dùng `setLang` (trước set cookie không ai đọc → không đổi); thêm **中文**; nút **Xóa tài khoản** trước chết → thêm confirm + ghi nhận yêu cầu; ô **Tiền tệ** chết → đổi thành hiển thị tiền tệ theo ngôn ngữ. Dịch đủ VI/EN/ZH cả trang Cài đặt khách. (Cài đặt NCC/đại lý/admin đã hoạt động sẵn.)
- ✅ **Đồng nhất màu giao diện**: bỏ xanh lệch tông (`#3b7cec`, `#3b82f6`, gradient tím `#6366f1→#9333ea`) ở link "Xem thêm" trang chủ, nút đăng nhập header, avatar + nút Lưu ở hồ sơ (admin/NCC/đại lý) → xanh navy hệ thống; sửa mặc định `linkColor` theme.
- ✅ **Tên NCC đồng bộ** (đăng nhập vs hiển thị phía khách): tài khoản NCC (`users.json`) và hồ sơ công khai (`suppliers.json`) là 2 nguồn khác nhau → carry `supplierId` qua đăng nhập, sidebar NCC nay lấy **tên công khai** (suppliers.json) cho khớp phía khách. Verify: login thường vẫn OK (ok=true, hasToken), supplierId=s001, tên = "Phụ Tùng An Thái".
- ✅ **Sửa sản phẩm trong Tồn kho NCC**: trang tồn kho trước chỉ có "Nhập thêm", KHÔNG sửa được → thêm nút **Sửa** mỗi dòng → mở thẳng form sửa (`/supplier/products?edit=<id>`).
- 📌 **CÒN LẠI — i18n (ngôn ngữ chưa dịch hết)**: đã dịch xong trang Cài đặt khách. Các trang còn nhiều chuỗi cứng tiếng Việt (dashboard đại lý/NCC/khách, form thêm sản phẩm NCC, tồn kho NCC) — số lượng rất lớn, sẽ dịch tiếp theo đợt.
- File: 4 layout, globals.css, NotificationBell, customer/settings, app/page, StorefrontHeader, 3 profile, admin/settings, lib/auth, api/auth/login (vùng nhạy cảm — đã verify login), SupplierSidebar, supplier/products, supplier/inventory.
- Deploy 164: diff sạch (login chỉ khác đúng 1 dòng) → backup → upload 18 file → build rc=0 → restart → HTTP 200 + smoke-test login OK.

## [2026-06-12] — Batch EE: Đồng nhất khung · QR phải đúng mã · Chuông 4 role · Lưu hồ sơ
- ✅ **Khung đồng nhất, bớt hở trống**: trang `/customer/tracking` trước bó hẹp `max-w-4xl` (thừa khoảng trống phải) → đổi `p-6` đầy khung như các trang khách khác.
- ✅ **Admin tải mã QR chỉ nhận ĐÚNG mã QR**: thêm `detectQrCode` (BarcodeDetector của trình duyệt). Ảnh KHÔNG có mã QR → **không lưu + popup đỏ**; ảnh có QR → "Đã nhận diện mã QR hợp lệ"; trình duyệt cũ không hỗ trợ → cho lưu kèm cảnh báo. (`lib/imageValidate.ts` + `app/admin/settings`.)
- ✅ **Chuông thông báo**: thu nhỏ (40→36px) + dịch sát góc (right-4→right-3) để **nằm gọn trong khung, không đè nút header** (trước đè sát mép gutter, có thể chặn cả nút Lưu). **Bổ sung thông báo cho ĐẠI LÝ** (trước `/api/notifications` thiếu nhánh affiliate → không nhận gì) = tin nhắn + hoa hồng chờ giải ngân. Cả 4 role đều hiện chuông + nhận đúng thông báo (khách: trạng thái đơn + tin nhắn; NCC/admin: đơn mới + tin nhắn + duyệt; đại lý: hoa hồng + tin nhắn).
- ✅ **Hồ sơ khách: nút "Lưu thay đổi"** trước bị `disabled` khi 1 trường chưa hợp lệ (kẹt, không bấm được) → nay **luôn bấm được**: sai thì popup chỉ rõ lỗi, đúng thì lưu + **popup "Đã lưu thay đổi hồ sơ"**.
- File: `app/customer/profile/page.tsx`, `app/customer/tracking/page.tsx`, `app/api/notifications/route.ts`, `lib/imageValidate.ts`, `app/admin/settings/page.tsx`, `components/NotificationBell.tsx`.
- Deploy 164: diff sạch → upload 6 file → build rc=0 → restart → HTTP 3008=200; các trang 200.

## [2026-06-12] — Batch DD: Khoá zoom 80–120% · Checkout 2 phương thức (QR/COD) · Giao dịch · Chi tiết đơn
- ✅ **Khung cố định 100%, zoom chỉ 80%–120%** (`components/ZoomGuard.tsx` mount ở layout): chặn zoom trình duyệt qua Ctrl+lăn chuột / Ctrl +/-/0, áp zoom tuỳ biến đã kẹp trong [0.8, 1.2] (Ctrl+0 = về 100%).
- ✅ **Checkout chỉ còn 2 phương thức**: **Thanh toán QR** (hiện đúng mã QR admin cấu hình ở `settings.payment.qrImage` + thông tin CK) và **Thanh toán khi nhận hàng (COD)**. Bỏ MoMo/ZaloPay/PayPal/Thẻ/Chuyển khoản tách lẻ. Lưới 2 cột, viền chọn navy. Bấm Đặt hàng với QR → popup hiện ảnh QR + số tiền + mã đơn → "Xác nhận đã thanh toán".
- ✅ **Kiểm tra Giao dịch (admin)**: dữ liệu CHUẨN — giao dịch tạo lúc đặt đơn (pending), tự đồng bộ sang **success** khi đơn giao xong / **cancelled** khi huỷ / **refunded** khi hoàn (theo `app/api/orders/[id]`); thời gian dùng ISO→vi-VN (đúng). Đã Việt hoá nhãn Phương thức (QR/COD/MoMo…) + Trạng thái (Chờ xử lý/Thành công/Đã huỷ…) thay vì chữ thô.
- ✅ **Nút "Xem chi tiết" đơn hàng** giờ mở **trang chi tiết + hành trình trạng thái** (không còn ra ô tra cứu): `OrderTracker` khi mở bằng `?id=` sẽ **ẩn ô tìm kiếm**, hiện tiêu đề "Chi tiết đơn hàng" + nút quay lại + timeline + sản phẩm + địa chỉ. Link đổi từ `/tracking?id=` → `/customer/tracking?id=` (giữ trong khu khách).
- File mới: `components/ZoomGuard.tsx`. File sửa: `app/layout.tsx`, `app/checkout/page.tsx`, `app/admin/transactions/page.tsx`, `components/OrderTracker.tsx`, `app/customer/orders/page.tsx`.
- Deploy 164: diff prod↔local sạch → backup → upload 6 file → build rc=0 → restart → HTTP 3008=200; các trang đều 200; admin đã có sẵn `qrImage` (Vietcombank) nên QR hiển thị ngay.

## [2026-06-12] — Batch CC3: 2 mục cuối QA Sheet (admin i18n + ngày giờ NCC)
- ✅ **admin/orders dịch đủ VI/EN/ZH** (ROW 49): KPI, tab trạng thái, tiêu đề bảng (Mã ĐH/Khách hàng/Sản phẩm/Thanh toán/Tổng tiền/Ngày/Trạng thái/Xem), ô tìm kiếm, dòng "đang tải", drawer chi tiết đơn (Khách hàng/Địa chỉ/Thanh toán/sản phẩm/đối soát NCC nhận được), modal tạo đơn (thông tin khách/sản phẩm/tạm tính/nút Lưu·Hủy·Tạo đơn). Trước đây chọn ZH/EN vẫn hiện tiếng Việt.
- ✅ **Tài chính NCC lấy ngày giờ THẬT** (ROW 78): bỏ ngày cứng 10/2024 → tính động theo `new Date()`: biểu đồ doanh thu 6 tháng gần nhất, lịch sử giải ngân (kỳ + ngày trả) theo tháng hiện tại, "Tổng kết tài chính tháng N", ngày quyết toán; dashboard NCC ngày giải ngân kế tiếp; tồn kho "lần nhập gần nhất" theo ngày thực.
- File: `app/admin/orders/page.tsx`, `app/supplier/{finance,inventory,page}.tsx`.
- Deploy 164: backup → upload 4 file → build rc=0 → restart → HTTP 3008=200; /admin/orders + /supplier/* đều 200.
- ✅ **HOÀN TẤT toàn bộ lỗi FALSE trong Google Sheet** (ngoài ~28 mục vốn đã fix từ trước — chỉ cần Ctrl+Shift+R).

## [2026-06-12] — Batch CC2: nốt nhóm NCC/đại lý còn lại của QA Sheet
- ✅ **Đồng bộ màu NCC/đại lý** (ROW 52): bỏ cam (`accent-orange-500`, `#FFF7ED`, `#FED7AA`, `#C2410C`) → xanh navy hệ thống (`accent-[#1a4b97]`, `#EFF4FB`, `#DBEAFE`) ở supplier/affiliate (giữ cam ở cảnh báo tồn kho — đúng ngữ nghĩa).
- ✅ **Đại lý: cài đặt không lưu** (ROW 86) → lưu localStorage `ap_affiliate_settings` + nạp lại khi vào (giống NCC).
- ✅ **NCC: tràn bảng không kéo được** (ROW 88) → bảng sản phẩm/tồn kho `overflow-x-auto`.
- ✅ **NCC: thống kê hiện slug danh mục thô** (ROW 58b) → lấy tên danh mục thật từ dữ liệu SP (theo ngôn ngữ).
- ✅ **Checkout: QR "lỗi"** (ROW 22) → QR minh hoạ (MoMo/ZaloPay) có nhãn "Mã minh hoạ — dùng thông tin CK bên dưới"; QR ngân hàng (VietQR) thêm onError fallback khi ảnh không tải được.
- File: `app/supplier/{analytics,products,inventory,settings,page}.tsx`, `app/affiliate/{settings,withdraw,page,commissions}.tsx`, `app/checkout/page.tsx`.
- Deploy 164: backup → upload 10 file → build rc=0 → restart → HTTP 3008=200; các trang NCC/đại lý/checkout 200.
- 📌 **Còn lại 2 mục thấp ưu tiên:** (1) admin/orders dịch đủ ZH/EN (admin vận hành tiếng Việt là chính); (2) ngày tháng mẫu ở tài chính NCC (dữ liệu demo).

## [2026-06-12] — Batch CC: QA Sheet vòng lớn (70 dòng FALSE) — fix ~17 lỗi THẬT, triage ~28 lỗi cũ đã fix
- 📊 **Đọc lại Google Sheet (user đính chính: FALSE = CHƯA sửa).** Trích 70 dòng FALSE + map 83 ảnh minh hoạ (xlsx) theo từng dòng. Dùng 5 subagent đọc ảnh + code hiện tại để phân loại: ~28 dòng ĐÃ fix ở các đợt trước (ảnh chụp từ bản cũ trước khi deploy → user cần Ctrl+Shift+R), ~24 dòng còn lỗi thật.
- ✅ **Đã fix + deploy đợt này (17):**
  - **Khung web không cố định, zoom là giãn** → `.ap-container`/`.vipo-container` max-width 1920px → **1440px** (căn giữa, không giãn vô hạn).
  - **0 đánh giá vẫn hiện 5 sao** → sao xám khi reviewCount=0 (trang sản phẩm, /products card, /search card); chi tiết SP hiện "Chưa có đánh giá".
  - **Nút "Tất cả" thừa ô trống** (lọc Hãng) → lọc bỏ brand rỗng.
  - **Tên danh mục sai** ("Ignition", "Điện Xoay") → "Hệ thống đánh lửa", "Cuộn dây đánh lửa", "Hệ thống điện & sạc" (`data/categories.json`); chi tiết SP hiện tên danh mục theo ngôn ngữ (ZH).
  - **Nút "Bắt đầu chat" báo "chưa phát triển"** → mở khung chat thật (open-chat).
  - **NCC: nút trạng thái đơn** "Đã giao cho shipper" → "Giao cho đơn vị vận chuyển" + dịch ZH/EN.
  - **NCC: không đổi được logo** → sửa endpoint upload (`/api/upload-avatar`) + lưu cài đặt shop vào localStorage (giữ sau reload).
  - **NCC: nút "Yêu cầu tạm ngưng"** không phản hồi → thêm onClick (toast xác nhận).
  - **NCC: giá để no-limit** → giới hạn ≤ 10 tỷ + validate.
  - **NCC: dashboard có 2 chuông đè nhau** → bỏ chuông nội bộ (giữ chuông toàn cục).
  - **NCC: lọc "Tháng này" vẫn ra tuần** → biểu đồ đổi dữ liệu + tiêu đề theo tuần/tháng.
  - **Đại lý: rút tiền nhưng số dư không trừ** → trừ/khoá số dư khả dụng sau khi gửi.
  - **Đại lý: link sai đường dẫn (404)** → map target → route THẬT + domain `autopartsvietnam.com.vn` (tự sửa cả link cũ khi đọc).
  - **Đại lý: tên không validate, tràn UI** → maxLength 50 + truncate.
  - **Khách: thêm xe không validate** → bắt buộc Hãng/Dòng/Biển số + check định dạng biển.
- File sửa: `app/globals.css`, `app/products/[id]/page.tsx`, `app/products/page.tsx`, `app/search/page.tsx`, `lib/i18n.ts`, `app/help/page.tsx`, `app/supplier/orders/page.tsx`, `data/categories.json`, `app/supplier/settings/page.tsx`, `app/affiliate/withdraw/page.tsx`, `app/customer/garage/page.tsx`, `app/supplier/products/page.tsx`, `app/affiliate/profile/page.tsx`, `app/api/affiliate-links/route.ts`, `app/affiliate/links/page.tsx`, `app/supplier/page.tsx`.
- Deploy 164: diff prod↔local (chỉ khác đúng dòng sửa; `categories.json` chỉ khác 3 tên — KHÔNG đè data khác) → backup → upload 16 file → build dummy-JWT (rc=0) → `pm2 restart` → HTTP 3008=200. Verify live: /api/categories đã đổi tên, /api/affiliate-links đã đổi domain, các trang 200.
- 📌 **CÒN LẠI (đợt sau):** admin/orders dịch ZH/EN; đồng bộ màu NCC/đại lý; ngày tháng mẫu ở tài chính NCC; cài đặt đại lý (trùng hồ sơ + chưa lưu); tràn bảng NCC; chuông đè avatar dashboard khách; QR MoMo/ZaloPay (đang là SVG minh hoạ); danh mục slug thô ở thống kê NCC.

## [2026-06-12] — Batch BB: Tìm ảnh nhận diện THẬT + Phân trang toàn hệ thống + Nút hỗ trợ
- ✅ **Tìm ảnh (image search) nhận diện sản phẩm THẬT:** trước đây bấm "Tìm ảnh" chỉ hiện toast rồi nhảy về `/catalog` (giả). Nay dùng **perceptual hash (average-hash 8×8, không thêm thư viện)**: tải ảnh lên → băm ảnh phía client → chuyển sang `/search?imghash=<hash>` → trang tìm kiếm **băm ảnh từng sản phẩm** (cache localStorage) và **xếp theo khoảng cách Hamming** → sản phẩm giống nhất hiện đầu. Có trạng thái "Đang nhận diện ảnh…" + nhãn "🖼️ Tìm theo ảnh". Ảnh sản phẩm thật phục vụ cùng domain (`/products/*.png`) nên canvas không bị taint. (Đã unit-test toán hamming/đóng-gói hex: chuẩn 100%.)
- ✅ **Phân trang áp dụng TOÀN hệ thống (tránh trang dài):** thêm component dùng chung `components/Pagination.tsx` (‹ số trang … ›, nhãn "X–Y / N", ẩn khi chỉ 1 trang, hỗ trợ VI/EN/ZH) và áp vào: **/products** (12/trang), **/search** (12), **admin/orders** (12), **supplier/orders** (10), **customer/orders** (8), **admin/suppliers** (12), **customer/wishlist** (9), **customer/reviews** (8). Cùng với admin/users + admin/cms đã có sẵn → phủ hết các trang danh sách dài. Lọc/đổi tab tự về trang 1; số trang tự kẹp khi danh sách đổi.
- ✅ **Nút "Liên hệ hỗ trợ" (sidebar khách) phản hồi:** trước trỏ sang trang hồ sơ; nay phát sự kiện `open-chat` mở widget chat ngay (khớp listener sẵn có trong `ChatWidget`). (Khớp mục Sheet "Nút liên hệ hỗ trợ không phản hồi".)
- File mới: `lib/imageHash.ts`, `components/Pagination.tsx`. File sửa: `components/StorefrontHeader.tsx` (băm ảnh upload), `components/CustomerSidebar.tsx` (nút hỗ trợ), `app/search/page.tsx` (matching + phân trang), `app/products`, `app/admin/orders`, `app/supplier/orders`, `app/customer/orders`, `app/admin/suppliers`, `app/customer/wishlist`, `app/customer/reviews` (phân trang).
- Deploy 164: diff prod↔local 10 file (chỉ khác đúng dòng sửa, KHÔNG đè thay đổi server-only) → backup → upload 12 file → build dummy-JWT (rc=0) → `pm2 restart autoparts` (plain) → HTTP 3008=200. Verify live: `/`, `/products`, `/search?imghash=…`, `/search?q=…` đều 200; ảnh sản phẩm 200 image/png.
- 📌 Đối chiếu Google Sheet: phần lớn mục đã fix ở các đợt trước (cột "FALSE" là checkbox người dùng CHƯA tự xác nhận, không phải lỗi mới). Mục NCC còn mơ hồ ("không đồng nhất màu", "tên nút không hợp lệ") chưa có ảnh minh hoạ nên chưa xử lý. Dict i18n đã đủ (0 key `t()` thiếu); phần "chưa chuyển hết" còn lại là chuỗi hardcode lẻ tẻ.

## [2026-06-12] — 2FA TOTP đầy đủ (Google/Microsoft Authenticator) — VÙNG NHẠY CẢM (auth)
- ✅ **Xác thực 2 yếu tố HOẠT ĐỘNG THẬT (TOTP/RFC 6238):** tự cài bằng Node crypto, KHÔNG thêm thư viện (`lib/totp.ts`). Luồng: Hồ sơ → bật 2FA → **hiện QR + khoá bí mật** để quét bằng app Authenticator → nhập **mã 6 số** xác nhận → lưu vào tài khoản. Khi đăng nhập: nhập đúng mật khẩu → nếu bật 2FA, trang login hiện **ô nhập mã 6 số** → đúng mới cấp token.
- 🔒 **An toàn luồng đăng nhập:** cổng 2FA CHỈ kích hoạt với tài khoản đã bật; tài khoản thường đăng nhập y như cũ. **Đã verify đầy đủ trên dev** (setup→confirm→login-cần-mã→login-có-mã→tắt) **VÀ trên prod** (đăng nhập thường: ok=true, hasToken=true, requires2FA=false → KHÔNG vỡ login).
- File: `lib/totp.ts` (mới), `app/api/auth/2fa/route.ts` (setup/confirm/disable), `app/api/auth/login/route.ts` (cổng 2FA), `app/login/page.tsx` (bước nhập mã), `app/customer/profile/page.tsx` (modal QR + khoá + xác nhận).
- Deploy 164: backup (vùng auth nhạy cảm) → upload 5 file → build dummy-JWT (rc=0) → `pm2 restart` → smoke-test endpoint login (400 đúng) + verify đăng nhập thường prod OK. Restore-on-fail sẵn sàng.
- 📌 Lưu ý: QR sinh qua api.qrserver.com (tiện lợi). Muốn tuyệt đối không lộ khoá ra ngoài → có thể chuyển sang sinh QR phía client (cần thêm thư viện qrcode).

## [2026-06-12] — Batch Z + ZZ: Chuông thông báo 4 phân quyền + popup, tin nhắn đã xem/đã nhận, 2FA lưu thật
- ✅ **Chuông thông báo cho CẢ 4 phân quyền:** thêm `NotificationBell` (icon chuông xám góc trên-phải) + API `/api/notifications` gom thông báo THẬT theo vai trò: **admin** (đơn mới chờ xác nhận + tin nhắn + chờ duyệt), **NCC** (đơn mới + tin nhắn), **khách** (trạng thái đơn + tin nhắn), **đại lý** (tin nhắn). Badge đỏ đếm chưa đọc, dropdown danh sách + link tới mục liên quan, **popup (toast) khi có thông báo mới**. (Đã verify: admin badge 8, dropdown mở, có "Đơn mới AP-...".)
- ✅ **Tin nhắn đã xem / đã nhận:** hệ thống vốn tự đánh dấu đã đọc khi mở. Nay hiện rõ trạng thái dưới tin cuối: khách thấy **"✓✓ Đã xem"** khi NCC/admin đã đọc (chưa thì "✓ Đã nhận"); admin/NCC thấy **"✓✓ Khách đã xem"** khi khách đã mở.
- ✅ **2FA lưu THẬT trên server:** trước bật/tắt chỉ là state tạm, tải lại trang mất. Thêm `/api/auth/2fa` (GET/PUT) lưu cờ `twoFA` vào tài khoản; Hồ sơ nạp + lưu trạng thái thật → bật 2FA giữ nguyên sau khi tải lại. (Đã verify PUT→GET server.)
- File: `app/api/notifications/route.ts` (mới), `components/NotificationBell.tsx` (mới), `app/layout.tsx`, `app/api/auth/2fa/route.ts` (mới), `components/ChatWidget.tsx`, `components/MessagesInbox.tsx`, `app/customer/profile/page.tsx`.
- Deploy 164: 2 đợt (Z: chuông; ZZ: tin nhắn+2FA) → build (rc=0) → `pm2 restart` → verify 200/307.
- ⏳ **2FA bước nhập mã khi đăng nhập:** cần chọn cách gửi mã (SMS/email/app) — hệ thống chưa cấu hình kênh gửi → hỏi ý kiến trước khi làm bước này.

## [2026-06-12] — Batch Y: Đơn vị vận chuyển đồng bộ, link Kênh bán, thời gian giao dịch, validate định dạng ảnh toàn hệ thống
- ✅ **Đơn vị vận chuyển admin → checkout:** trước checkout hardcode 3 NVC (GHTK/GHN/VTP). Nay đọc **`/api/carriers` (đang hoạt động)** → admin thêm/tắt NVC là khách thấy ngay ở Thanh toán; phí ship lấy theo NVC. (Đã verify API trả 3 NVC active.)
- ✅ **Link Kênh bán (facebook...) bấm ra đúng:** thanh MXH (SocialBar) trước chỉ đọc Cài đặt→Chân trang. Nay đọc thêm **Kênh bán (`/api/channels`)** — URL kênh MXH (facebook/zalo/youtube...) ghi đè theo tên → link admin đặt ở Kênh bán hoạt động đúng.
- ✅ **Thời gian giao dịch hợp lệ:** bảng Giao dịch trước hiện chuỗi ISO thô ("2026-06-12T..."). Nay định dạng `toLocaleString('vi-VN')` (guard Invalid Date).
- ✅ **Validate định dạng ảnh TOÀN hệ thống:** tạo `lib/imageValidate.ts` (chỉ nhận JPG/PNG/WEBP/GIF/SVG, ≤5MB, báo lỗi rõ). Áp cho: **upload QR thanh toán (Cài đặt), avatar hồ sơ, banner (Marketing)** → up sai định dạng/quá nặng sẽ báo + chặn, không nhận bừa.
- File: `lib/imageValidate.ts` (mới), `app/admin/transactions/page.tsx`, `components/SocialBar.tsx`, `app/checkout/page.tsx`, `app/admin/marketing/page.tsx`, `app/admin/settings/page.tsx`, `app/customer/profile/page.tsx`.
- Deploy 164: diff prod↔local → backup → upload 7 file → build (rc=0) → `pm2 restart` → verify 200/307.
- ⏳ **Còn lại (đợt cuối):** chuông thông báo 4 phân quyền + popup; tin nhắn đã đọc/đã nhận; 2FA hoạt động thật.

## [2026-06-12] — Batch X: Sổ địa chỉ lưu server + đồng bộ checkout/hồ sơ, Xem chi tiết đúng đơn, hồ sơ giữ dữ liệu, GMV số thật, hết tràn khung
- ✅ **Sổ địa chỉ LƯU THẬT + đồng bộ:** trước Sổ địa chỉ (localStorage) trống nhưng Thanh toán hiện 2 địa chỉ ảo (MOCK) — không đồng bộ; thêm địa chỉ đổi tab là mất. Nay **API `/api/addresses` lưu theo tài khoản trên server**; cả **Sổ địa chỉ + Thanh toán + Hồ sơ** đều đọc/ghi cùng nguồn → thêm/sửa/xoá địa chỉ lưu bền vững, hiện thống nhất mọi nơi. (Đã verify: PUT→GET server, sổ địa chỉ load đúng.) Thanh toán không còn địa chỉ ảo; chưa có địa chỉ thì chặn đặt hàng + nhắc thêm địa chỉ.
- ✅ **"Xem chi tiết" đơn mở ĐÚNG đơn:** trước bấm mở trang tra cứu TRỐNG (`/tracking?id=` nhưng tracker không đọc `id`). Nay `OrderTracker` tự đọc `?id=`/`?order=` và **tra cứu ngay** → hiện đúng đơn + tiến trình. (Đã verify.)
- ✅ **Hồ sơ giữ dữ liệu sau khi Lưu:** trước nút "Lưu thay đổi" lưu nhưng tải lại trang về mặc định ảo (chỉ đọc tên từ auth). Nay nạp lại `ap_profile` đã lưu (tên/SĐT/email/địa chỉ/tỉnh) → giá trị giữ nguyên. Địa chỉ trong Hồ sơ cũng lưu qua `/api/addresses`.
- ✅ **GMV/Doanh thu hiện SỐ THẬT:** dashboard trước hiện "0.4 Tỷ đ" (làm tròn) → nay hiện **đầy đủ** "400.000.000 đ" (toLocaleString) đúng yêu cầu "có bao nhiêu hiện từng đấy".
- ✅ **Hết tràn khung (overflow):** chuỗi dài trong địa chỉ/hồ sơ tràn ra ngoài → thêm `break-words` cho text địa chỉ (Sổ địa chỉ + Hồ sơ).
- ✅ **Trang chi tiết SP đồng nhất khung:** đổi `max-w-7xl` → **`.ap-container`** (cap 1920px) — hết bị nhỏ/lệch giữa khi màn rộng/zoom-out.
- File: `app/api/addresses/route.ts` (mới), `app/customer/address/page.tsx`, `app/checkout/page.tsx`, `app/customer/profile/page.tsx`, `components/OrderTracker.tsx`, `app/admin/page.tsx`, `app/products/[id]/page.tsx`.
- Deploy 164: backup → upload 7 file → build dummy-JWT (rc=0) → `pm2 restart` → verify `/`=200 `/api/addresses`=200.
- ⏳ **Còn lại (đợt sau):** đồng bộ Đơn vị vận chuyển → checkout, link Kênh bán (facebook), thời gian giao dịch, **chuông thông báo 4 phân quyền**, tin nhắn đã đọc/nhận, **2FA**, validate định dạng ảnh toàn hệ thống.

## [2026-06-12] — Batch W: FIX CRASH trang Marketing + báo cáo tên danh mục, Mua ngay, CSV, chế độ bảo trì, áp dụng màu
- 🛑 **CRITICAL — /admin/marketing crash trắng "Application error":** `ImageUpload` dùng `React.useRef` nhưng file CHỈ import named hooks (không import `React`) → `React is not defined` khi mở form "+ Thêm Banner" → sập cả trang. Sửa: import `useRef` + dùng `useRef`. (Tìm bằng cách tải data prod về dev reproduce → mở form banner mới sập.) Bonus: chống crash khi flash sale thiếu mảng `products` (`Array.isArray(fs.products)?...:[]`). **Đã verify: form banner mở được, không sập.**
- ✅ **Báo cáo "Doanh thu theo danh mục" hiện tên chuẩn:** trước hiện slug thô (`phu-kien-khac`, `dieu-hoa-khong-khi`) do bảng nhãn cứng cũ không khớp. Nay map `categoryId → categoryName` từ dữ liệu SP → **"Phụ kiện khác", "Điều hòa không khí"...** (đã verify).
- ✅ **"Mua ngay" mua ĐÚNG số lượng đang chọn:** trước cộng dồn với SL đã có trong giỏ. Nay `updateQty` đặt đúng SL + chọn riêng SP đó → checkout đúng số lượng vừa chọn.
- ✅ **Nhập CSV: thông báo + chặn trùng:** trước nhập xong im lặng + cho nhập lại SP đã có. Nay **chặn trùng theo mã OEM/tên** (bỏ qua SP đã tồn tại) + **toast kết quả** "✓ Đã nhập N mới · bỏ qua M trùng · W lỗi".
- ✅ **Chế độ bảo trì hoạt động THẬT:** trước bật toggle nhưng không chặn gì. Thêm `MaintenanceGate` (mount ở layout): bật → **khách thấy trang "Website đang bảo trì"** toàn màn hình; **admin + trang /admin /login vẫn vào được** để tắt; tự bỏ chặn trong ~30s sau khi admin tắt. (Đã verify: khách bị chặn, admin vào bình thường.)
- ✅ **Cài đặt Màu sắc áp dụng NGAY:** `ThemeProvider` vốn chỉ áp theme lúc tải trang → đổi màu phải F5 mới thấy. Nay lắng nghe sự kiện `ap-theme-updated`; nút "Lưu cài đặt" phát sự kiện → màu/độ-bo-góc đổi **tức thì toàn site**. Sửa default màu từ `var(--ap-primary)` → hex `#1a4b97` (ô chọn màu hiện đúng, không lưu vòng lặp).
- File: `app/admin/marketing/page.tsx`, `app/admin/reports/page.tsx`, `app/products/[id]/page.tsx`, `app/admin/import-export/page.tsx`, `components/MaintenanceGate.tsx` (mới), `app/layout.tsx`, `components/ThemeProvider.tsx`, `app/admin/settings/page.tsx`.
- Deploy 164: diff prod↔local 7 file (chỉ khác phần sửa) → backup → upload 8 file → build dummy-JWT (rc=0) → `pm2 restart` → verify `/`=200 `/products`=200 admin=307.

## [2026-06-12] — Batch V: QR chuyển khoản THẬT (VietQR), success-modal hết mâu thuẫn, giỏ hàng đồng nhất khung, CMS rõ nút Thêm
- ✅ **QR chuyển khoản THẬT (VietQR/napas247):** trước QR là hình SVG minh hoạ KHÔNG quét được. Nay tự sinh **mã VietQR thật** `img.vietqr.io/image/<BANK>-<STK>-qr_only.png?amount=&addInfo=` từ NH + STK admin cấu hình + **số tiền + nội dung "TT <mã đơn>"** → app ngân hàng quét ra đúng số tiền. Thêm bảng mã 25+ NH VN (Vietcombank→VCB, Techcombank→TCB...). Không nhận diện được NH → fallback ảnh QR admin tải lên. (Đã verify: URL sinh ra trả `image/png` 200.) MoMo/ZaloPay vẫn dùng ảnh QR ví admin tải.
- ✅ **Admin cấu hình QR (làm rõ):** mục **Cài đặt → Thanh toán & QR** đã có sẵn (upload QR + NH/STK/chủ TK). Bổ sung ghi chú: chuyển khoản chỉ cần nhập đúng NH+STK+chủ TK là tự ra VietQR; ô upload dành cho MoMo/ZaloPay.
- ✅ **Hết mâu thuẫn "Đặt hàng thành công" + "Vui lòng chuyển khoản":** đổi dòng đỏ mệnh lệnh → thông báo trung tính **"Đơn hàng đang chờ đối soát thanh toán chuyển khoản ngân hàng"** (đồng bộ tông với MoMo/ZaloPay).
- ✅ **Giỏ hàng đồng nhất khung + không giãn vô hạn:** `/cart` đổi từ `max-w-6xl` (hẹp, lệch khi zoom-out) → **`.ap-container`** (full-width, **cap 1920px**, căn giữa) — đồng nhất với checkout/products; zoom-out không lộ khoảng trống 2 bên bất thường.
- ✅ **CMS Thêm/Xóa rõ ràng:** tính năng vốn đã có (đối chiếu prod==local) nhưng nút "+ Thêm trang" mờ (viền đứt) nên khó thấy → đổi thành **nút primary nổi bật "+ Thêm trang mới"** + ghi chú "trang tự thêm có nút ✕ để xóa; 4 trang mặc định không xóa". (Đã test: bấm là tạo trang + có nút ✕.)
- File: `app/checkout/page.tsx`, `app/cart/page.tsx`, `app/admin/cms/page.tsx`, `app/admin/settings/page.tsx`.
- Deploy 164: diff prod↔local 4 file (chỉ khác phần sửa) → backup → upload → build dummy-JWT (rc=0) → `pm2 restart` → verify `/`=200 `/cart`=200 `/checkout`=200 `/admin/cms`=307.

## [2026-06-12] — Batch U: đồng bộ đơn admin (auto-refresh), tra cứu đơn vào hồ sơ, ảnh SP chi tiết, menu Sản phẩm admin
- ✅ **Đơn hàng admin ↔ khách (đã đối chiếu dữ liệu):** xác minh luồng đã đúng — admin GET `/api/orders` trả TẤT CẢ đơn (đã test: admin thấy đơn khách `u004` vừa đặt, đầu danh sách). Nguyên nhân khách thấy "admin chưa hiện" là trang admin **chỉ nạp 1 lần**. Đã thêm **tự làm mới mỗi 20s + nạp lại khi focus tab + nút "↻ Làm mới"** (cache no-store) → đơn mới hiện ngay.
- ✅ **Checkout không báo thành công giả:** trước đây nếu POST `/api/orders` lỗi mạng, vẫn hiện "đặt thành công" + xoá giỏ (đơn KHÔNG được lưu → "đơn ma"). Nay kiểm `res.ok`/`data.id`; lỗi → **giữ nguyên giỏ + toast báo lỗi để thử lại**.
- ✅ **Tra cứu đơn vào thẳng hồ sơ khách:** thêm mục **"Tra cứu đơn hàng"** trong sidebar hồ sơ (`/customer/tracking`) — nhập mã & xem tiến trình NGAY tại đó, không nhảy ra trang riêng. Tách lõi thành `components/OrderTracker.tsx` dùng chung cho cả `/tracking` công khai. Fix luôn **key i18n `enterOrderCodeToTrack`** trước hiện thô (thêm vi/en/zh).
- ✅ **Ảnh sản phẩm trang chi tiết + "Sản phẩm liên quan":** trước render **ô màu chữ "PT"** (swatch) vì `product.image` là đường dẫn `/products/*.png` không khớp bảng swatch. Nay render **ảnh thật** `<img src={product.image}>` (ảnh chính + 4 ảnh nhỏ + SP liên quan) + fallback `/ap-assets/img-product-clone.png` khi thiếu. (Ảnh thật đã có trên prod — đã kiểm `image/png` ~440KB.)
- ✅ **Admin có mục "Sản phẩm" rõ ràng:** đổi tên menu `Danh mục & Phụ tùng` → **"Sản phẩm & Danh mục"** và đưa lên **đầu nhóm QUẢN LÝ** (trang `/admin/catalog` vốn đã có "+ Thêm sản phẩm" + sửa/xoá; POST/PUT/DELETE `/api/products` cho phép admin). Đổi cả tiêu đề trang + i18n vi/en/zh.
- File: `app/admin/orders/page.tsx`, `app/checkout/page.tsx`, `components/OrderTracker.tsx` (mới), `app/tracking/page.tsx`, `app/customer/tracking/page.tsx` (mới), `components/CustomerSidebar.tsx`, `lib/i18n.ts`, `app/products/[id]/page.tsx`, `components/AdminSidebar.tsx`, `app/admin/catalog/page.tsx`.
- Deploy 164: đối chiếu diff server↔local 8 file (chỉ khác đúng phần đã sửa) → backup → upload 10 file → build dummy-JWT (rc=0) → `pm2 restart autoparts` → verify `/`=200 `/products`=200 `/tracking`=200 `/customer/tracking`=307 (bảo vệ auth).

## [2026-06-12] — QA Vòng 2 (96 testcase sâu): fix Tra cứu VIN thật + bộ giải mã VIN offline dự phòng
- 🧪 **Tạo bộ test case vòng 2** `AutoParts - Test Cases QA - Vong 2.xlsx` (96 case SÂU, phủ phân hệ chưa test vòng 1: VIN, flash-sale, tracking, wishlist, rewards, garage, đổi/trả, đánh giá, so sánh, đại lý, NCC, VAT/đa tiền tệ, i18n trang sâu, bảo mật trực tiếp URL, validate nâng cao). Chạy test thật trên preview + verify API.
- ✅ **VIN-02/04 (LỖI trọng yếu → đã sửa):** Trang `/vin-lookup` chỉ tra **VIN mẫu hardcode**, **không gọi** API `/api/vin` (proxy NHTSA đã có sẵn) → nhập VIN thật luôn báo "không tìm thấy". Nay trang gọi `/api/vin/<vin>?lang=` → giải mã xe thật + gợi ý 6 phụ tùng phổ biến. **Test live prod: ra HONDA Accord 2003 (J30A4).**
- ✅ **Bộ giải mã VIN offline dự phòng** (`lib/vinDecode.ts` MỚI): khi NHTSA không truy cập được, vẫn giải mã được **đời xe (ký tự 10)**, **khu vực (ký tự 1)**, **hãng (WMI 3 ký tự, các hãng phổ biến ở VN)** → VIN hợp lệ 17 ký tự **không bao giờ dead-end**. Route thêm **timeout 4s** + fallback trả 200 (thay vì 500).
- ✅ **Link chia sẻ `?vin=`:** thêm fallback đọc `window.location.search` khi `useSearchParams` chưa sẵn (Next 16) để link mở thẳng vẫn tự tra cứu.
- 🔒 **Verify bảo mật (Pass):** khách vào thẳng `/admin` `/supplier` `/affiliate` → middleware **redirect** (đã test). Khách chỉ tự xác nhận đơn `delivered`. Tracking mã sai → 404. Tỉ giá USD/CNY live theo ngày.
- 📌 **Bài học (đã có trong memory):** Next 16 route `params` là Promise phải `await`; **local source LAG server** — route.ts trên prod đã await params từ session trước nhưng page.tsx thì chưa gọi API (đã đối chiếu bằng diff server↔local trước khi deploy).
- File: `lib/vinDecode.ts` (mới), `app/api/vin/[vin]/route.ts`, `app/vin-lookup/page.tsx`.
- Deploy 164: đối chiếu file server (diff) → backup → upload 3 file → build dummy-JWT (rc=0) → `pm2 restart autoparts` (plain) → verify `/`=200 `/vin-lookup`=200 `/api/vin`=HONDA.

## [2026-06-12] — Đợt QA 100 testcase: fix 8 case fail (search không dấu/synonyms, qty clamp, password policy, CSV check, placeholder, checkout trống)
- 🧪 **Chạy bộ 100 test case** (file `AutoParts - Test Cases QA.xlsx`) như QA thật trên preview → tìm ra 8 case FAIL, fix toàn bộ, điền kết quả Pass/Fail + cột Ghi chú vào Excel (98 Pass, 2 cần test tay thiết bị thật).
- ✅ **TK-02:** /search nay tìm **không dấu** ("loc dau"="Lọc dầu", "tram sac" ra 3 Trạm Sạc) + **mở rộng theo Từ đồng nghĩa** admin cấu hình ("bu gi" ra 3 Bugi). Thêm hàm `norm` NFD strip.
- ✅ **TK-08 (bonus):** phát hiện bộ lọc giá ngầm `priceMax=5.000.000` **không có UI** từng ẨN sản phẩm đắt tiền (Trạm Sạc 9M/45M không bao giờ hiện khi tìm) → bỏ giới hạn ngầm.
- ✅ **VL-05/GH-02:** số lượng giỏ + trang chi tiết **chặn trên theo tồn kho** (max=stock, trần 999) + toast "Chỉ còn N sản phẩm trong kho"; không nhận ≤0.
- ✅ **VL-10:** Đổi mật khẩu (hồ sơ) áp **chính sách mạnh** như đăng ký (hoa+thường+số+ký tự đặc biệt) thay vì chỉ ≥8.
- ✅ **VL-09:** Nhập CSV kiểm tra **cột bắt buộc** (name/brand/category/price/type/stock) — thiếu cột nào toast tiếng Việt liệt kê đúng cột đó, chặn nhập (verify 2 chiều: file lỗi chặn, file chuẩn preview OK).
- ✅ **UI-04:** tạo **ảnh placeholder PNG thật** cho `/ap-assets/img-product-clone.png` + `/vipo-assets/img-product-clone.png` (trước 404 → ảnh vỡ ở mọi fallback).
- ✅ **TT-14:** vào /checkout giỏ trống bấm Đặt hàng → toast **"Giỏ hàng trống"** + tự chuyển /products (trước im lặng).
- File: `app/search/page.tsx`, `app/cart/page.tsx`, `app/products/[id]/page.tsx`, `app/customer/profile/page.tsx`, `app/admin/import-export/page.tsx`, `app/checkout/page.tsx`, 2 PNG mới.
- Deploy 164: backup → upload 8 file → build-verify → `pm2 restart autoparts`.

## [2026-06-12] — Giỏ hàng xác nhận xóa, CMS thêm/xóa trang thật, nhập/xuất full-width + lỗi VN, khung 1920px
- ✅ **"Xóa đã chọn" (giỏ):** giỏ mặc định tick TẤT CẢ nên bấm là mất sạch không hỏi → nay **popup xác nhận nêu rõ số SP sẽ xóa** (cảnh báo riêng khi đang chọn tất cả + gợi ý bỏ tick món muốn giữ); chỉ xóa đúng SP được tick + toast.
- ✅ **CMS thêm/xóa trang + lưu server THẬT:** trước CMS chỉ lưu localStorage (không có Thêm/Xóa, sửa không ai thấy) → thêm `/api/cms-pages` (GET public/PUT admin, lưu `data/cms-pages.json`), nút **"+ Thêm trang"** (URL `/p/<slug>`, khách xem được ngay qua route mới `app/p/[slug]`), nút **✕ xóa** trang tự thêm (4 trang gốc không xóa), Lưu thay đổi ghi lên server.
- ✅ **Nhập/Xuất dữ liệu đồng nhất khung:** bỏ `max-w-5xl` (hết khoảng trống 2 bên), chuyển header sang thanh sticky chuẩn như các mục admin khác.
- ✅ **Lỗi "Missing or invalid _meta.version":** API nạp JSON nay **chấp nhận file backup cũ không có _meta** (miễn chứa bộ dữ liệu quen thuộc) + mọi thông báo lỗi đổi sang **tiếng Việt dễ hiểu** (hướng dẫn dùng đúng file từ "Tải dữ liệu (JSON)").
- ✅ **Khung cố định khi zoom:** `.ap-container` từ `max-width:100%` → **`max-width:1920px` căn giữa** — zoom-out/màn siêu rộng nội dung không giãn vô hạn, hai bên nền đều nhau (toàn bộ storefront dùng chung container này).
- 📄 **Bộ Test Cases QA:** tạo `C:\xampp2\htdocs\AutoParts - Test Cases QA.xlsx` — 100 test case 9 phân hệ (UI 12, Auth 14, Tìm kiếm 10, Giỏ 10, Checkout 14, Hồ sơ 8, Admin 12, Validation 10, Bảo mật/Hiệu năng 10) + sheet Kế hoạch & Phạm vi.
- File: `app/cart/page.tsx`, `app/globals.css`, `app/admin/import-export/page.tsx`, `app/api/admin/data-import/route.ts`, `app/admin/cms/page.tsx`, `app/api/cms-pages/route.ts` (mới), `app/p/[slug]/page.tsx` (mới), `data/cms-pages.json` (mới).
- Deploy 164: backup → upload 7 file → tạo cms-pages.json (nếu chưa có) → build-verify → `pm2 restart autoparts`.

## [2026-06-12] — Fix 2 sidebar, đá phiên khi khoá, thêm banner, chi tiết Flash Sale, tiền Triệu/Tỷ, QR admin cấu hình
- ✅ **Hết double sidebar `/admin/search-synonyms`:** trang render `AdminSidebar` riêng (layout đã có 1) → 2 sidebar. Sync file từ server về + chuyển thành fragment → 1 sidebar. (verify dashboardLinks=1)
- ✅ **Khoá tài khoản đá phiên đang online:** `/api/auth/me` trả thêm `active/status` (đọc users.json); thêm `AuthWatcher` (poll 20s) → nếu admin khoá tài khoản đang đăng nhập → **popup "Tài khoản đã bị khóa" + tự đăng xuất + về /login**.
- ✅ **Thêm banner được:** `bannersApi.create` kiểm tra `r.ok` + `credentials`; nút Tạo banner: bỏ bắt buộc ngày kết thúc (mặc định 2030-12-31) + **toast thành công/lỗi rõ ràng**. (verify POST /api/banners = 201)
- ✅ **Flash Sale xem chi tiết:** thêm nút **"Chi tiết"** → bung danh sách sản phẩm trong chiến dịch (giá gốc → giá sale, % giảm).
- ✅ **Báo cáo tiền đồng nhất:** bảng "Doanh thu theo tỉnh/thành" đổi `M` → **Triệu** (đồng bộ Triệu/Tỷ toàn hệ thống).
- ✅ **QR thanh toán admin cấu hình:** thêm `payment` vào settings + tab **"Thanh toán & QR"** (upload ảnh QR thật + tên NH/STK/chủ TK/ghi chú). Checkout hiển thị **QR thật admin tải lên** (thay QR minh hoạ) + thông tin chuyển khoản admin. (verify settings payment roundtrip OK)
- File: `app/admin/search-synonyms/page.tsx`, `app/api/auth/me/route.ts`, `components/AuthWatcher.tsx` (mới), `app/layout.tsx`, `app/admin/marketing/page.tsx`, `app/admin/reports/page.tsx`, `app/api/settings/route.ts`, `app/checkout/page.tsx`, `app/admin/settings/page.tsx`.
- Deploy 164: backup → upload 9 file → build-verify → `pm2 restart autoparts`.

## [2026-06-12] — i18n trang SP, sort đơn mới, xoá giỏ sau mua, đồng nhất tiền, địa chỉ, khoá số liệu NCC
- ✅ **i18n trang sản phẩm:** thêm key thiếu `tier1Price, discount17, returns, delivery, 7days, 2_4days, remaining, items` (vi/en/zh) → hết hiển thị key tiếng Anh ("returns/7days/2_4days..."), nay là "Đổi trả / 7 ngày / 2-4 ngày / Còn lại N sản phẩm / Giá đại lý (Tier 1)".
- ✅ **Đơn mới hiện đầu danh sách:** `/api/orders` GET **sort theo createdAt giảm dần** → đơn vừa đặt hiện NGAY ĐẦU trang quản lý đơn (đã verify: đơn AP-1776... nhảy lên top).
- ✅ **Xoá SP khỏi giỏ sau khi mua:** checkout đặt đơn xong → `removeFromCart` các SP đã mua + clear selected (trước đây SP vẫn nằm trong giỏ).
- ✅ **Đồng nhất tiền tệ:** thêm `formatVndShort` (Tỷ/Triệu/đ); bỏ "M" ở finance/reports/supplier-finance/affiliate (KPI "250M"→"250 Triệu", tooltip "M"→"Triệu").
- ✅ **Carrier:** "GHN – Nhanh tiêu" → **"GHN – Giao hàng nhanh"**.
- ✅ **Nút Thêm/Sửa địa chỉ (hồ sơ):** trước không phản hồi → nay mở **modal form** (tên/SĐT/địa chỉ/nhãn, validate) thêm/sửa địa chỉ + toast.
- ✅ **Khoá cứng số liệu NCC (admin):** ô Đánh giá/Số lượt/SP/Đơn/Phản hồi trong modal NCC → **read-only** (tự tính từ dữ liệu thật, không sửa tay).
- File: `lib/i18n.ts`, `lib/data.ts`, `app/api/orders/route.ts`, `app/checkout/page.tsx`, `app/customer/profile/page.tsx`, `app/admin/suppliers/page.tsx`, `app/admin/finance` + `reports`, `app/supplier/finance`, `app/affiliate/commissions` + `team`.
- Deploy 164: backup → upload 11 file → build-verify → `pm2 restart autoparts`.

## [2026-06-12] — Hệ thống Chat (khách↔admin↔NCC) + Khóa/Duyệt tài khoản thật
### Chat / nhắn tin (mới)
- ✅ **Store + API:** `data/conversations.json` + `GET/POST /api/messages` (auth theo vai trò: khách thấy hội thoại của mình, admin thấy hội thoại gửi "admin", NCC thấy hội thoại gửi NCC). Đánh dấu đã đọc + đếm chưa đọc.
- ✅ **Box chat góc phải cho KHÁCH** (`ChatWidget`, gắn ở `layout`): nút nổi + badge chưa đọc, nhắn với **Hỗ trợ AutoParts (admin)**; **nút "Chat Ngay"** ở trang sản phẩm & shop NCC mở chat thẳng với **NCC** (dispatch `open-chat`). Ẩn ở khu admin/NCC/đại lý + lúc chưa đăng nhập thì mời đăng nhập.
- ✅ **Hộp thư admin & NCC** (`/admin/messages`, `/supplier/messages` + `MessagesInbox` + link sidebar): danh sách hội thoại + khung trả lời, poll 5s. Đã verify vòng kín: khách gửi → admin thấy & trả lời → khách nhận.
### Khóa / duyệt tài khoản (lưu THẬT vào users.json)
- ✅ **Khóa/mở khóa LƯU THẬT:** thêm `PUT/DELETE /api/admin/users/[id]`; admin Khóa → ghi `active:false`+`status:suspended` → **login bị chặn + popup "Tài khoản đã bị khóa"**. (trước chỉ đổi state, vẫn đăng nhập được)
- ✅ **NCC/đại lý đăng ký → CHỜ DUYỆT:** register nhận `role` thật; supplier/affiliate tạo với `status:pending` (không auto-login) → **login bị chặn + popup "đang chờ admin duyệt"**; admin duyệt (đổi trạng thái) thì mới đăng nhập được. Khách hàng vẫn kích hoạt ngay.
- ✅ **Admin không thể bị khóa/đổi vai trò/xóa** (chặn ở API + ẩn nút Khóa/Xóa với role admin).
- ✅ **Sửa user (admin):** **khóa cứng Tên/Email/SĐT** (chỉ người dùng tự sửa), admin chỉ chỉnh **Vai trò + Trạng thái**; trạng thái **không quay lại "Chờ duyệt"** sau khi đã duyệt.
- File: `app/api/auth/login|register/route.ts`, `app/login|register/page.tsx`, `app/api/admin/users/route.ts` + `[id]/route.ts` (mới), `app/admin/users/page.tsx`, `app/api/messages/route.ts` (mới), `components/ChatWidget.tsx` + `MessagesInbox.tsx` (mới), `app/admin/messages` + `app/supplier/messages` (mới), `app/layout.tsx`, `app/products/[id]` + `app/suppliers/[id]/page.tsx`, `components/AdminSidebar` + `SupplierSidebar.tsx`, `data/conversations.json` (mới).
- Deploy 164: backup → upload 17 file → tạo conversations.json (nếu chưa có) → build-verify → `pm2 restart autoparts`.

## [2026-06-12] — NCC số liệu thật, nút chat/share/tim, phân trang shop, (mua lại & header đã có)
- ✅ **Số liệu NCC THẬT:** thêm `lib/supplierStats.ts`; `/api/suppliers` + `/api/suppliers/[id]` nay tính **SP = đếm sản phẩm thật, Đơn = đếm đơn có SP của NCC, Đánh giá = avg rating sản phẩm, "lượt" = tổng đã bán, Phản hồi = round(rating/5×100)**. Áp dụng đồng bộ: admin/suppliers + card NCC ở trang sản phẩm + /suppliers. (Phụ Tùng An Thái: 428→**27 SP**, 4.8★, 96% phản hồi. NCC chưa có sản phẩm giữ số khởi tạo, tránh hiện toàn 0.)
- ✅ **Nút Chia sẻ + Tim (product):** Chia sẻ trước **không có onClick** → thêm Web Share API / copy link + toast; Tim (yêu thích) thêm toast phản hồi + lưu `ap_wishlist`.
- ✅ **Nút Chat Ngay (product + shop NCC):** đang tĩnh → thêm toast hướng dẫn (chat realtime sắp ra mắt + hotline). **Xem Shop** vẫn điều hướng `/suppliers/[id]` (đã đúng).
- ✅ **Phân trang sản phẩm trong shop NCC** (`/suppliers/[id]`): 12 SP/trang, nút ‹ › + số trang, căn giữa (27 SP → 3 trang), tránh cuộn dài.
- ℹ️ **Mua lại đơn hàng:** đã có sẵn ở `customer/orders` (nút "Mua lại" → re-add đúng SP & số lượng vào giỏ → /cart) — đã xác nhận hoạt động.
- ℹ️ **Product mất header:** kiểm tra `/products/[id]` **vẫn có `StorefrontHeader`** (verify headerPresent=true, không lỗi console) — không tái hiện được; sẽ redeploy + nhờ kiểm tra lại.
- File: `lib/supplierStats.ts` (mới), `app/api/suppliers/route.ts`, `app/api/suppliers/[id]/route.ts`, `app/admin/suppliers/page.tsx`, `app/products/[id]/page.tsx`, `app/suppliers/[id]/page.tsx`.
- Deploy 164: backup → upload 6 file → build-verify → `pm2 restart autoparts`.

## [2026-06-12] — Header /help+/about đồng nhất, lọc GMV, xuất CSV NCC, admin users (xác nhận/phân trang/dữ liệu thật)
- ✅ **/help & /about dùng `StorefrontHeader` + `StorefrontFooter`:** bỏ header tự chế (logo + nút "Đăng nhập" tĩnh làm tưởng bị đăng xuất) → header đồng nhất, có thanh menu/tìm kiếm/giỏ/đăng nhập đúng trạng thái.
- ✅ **3 nút liên hệ ở /help hoạt động:** "Gọi ngay" → `tel:19001234`; "Gửi email" → `mailto:support@autopart.vn`; "Bắt đầu chat" → toast (chat realtime sắp ra mắt). (trước cả 3 nút tĩnh không bấm được)
- ✅ **Xu hướng GMV — lọc được:** dropdown **Theo ngày (14 ngày) / Theo tháng (12 tháng) / Theo năm (5 năm) / Tùy chọn (từ–đến ngày)**; số liệu tổng hợp **THẬT từ orders** (GMV + doanh thu nền tảng 10%, đơn vị Triệu đ), bỏ data tĩnh.
- ✅ **Hiệu suất NCC — "Tải báo cáo":** trước gọi `window.print()` (in cả trang) → nay **xuất CSV** chỉ dữ liệu bảng NCC (`hieu-suat-nha-cung-cap.csv`, UTF-8 BOM cho Excel) + toast.
- ✅ **Quản lý người dùng:**
  - **Khóa / Xóa** đều có **popup xác nhận** (`confirmDialog`, nút đỏ) trước khi thực hiện + toast.
  - **Phân trang thật:** 10 dòng/trang, nút bấm được, **căn giữa**, số trang đúng (bỏ bug "1 2 3 … 1"), có ‹ › và ẩn/hiện hợp lý.
  - **Tài khoản đăng ký thật hiển thị:** thêm `GET /api/admin/users` đọc `users.json` (bỏ `passwordHash`) → tài khoản mới đăng ký xuất hiện ngay; gộp với doanh nghiệp NCC (suppliers.json); email hiển thị; ngày tham gia format chuẩn.
- File: `app/help/page.tsx`, `app/about/page.tsx`, `app/admin/page.tsx`, `app/admin/users/page.tsx`, `app/api/admin/users/route.ts` (mới).
- Deploy 164: backup → upload 5 file → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Admin chỉnh header, mật khẩu mạnh khi đăng ký, avatar NCC tạm + fix khung
- ℹ️ **Admin chỉnh header (đã có sẵn):** `admin/settings → Thương hiệu` cho phép **upload logo** (tự xoá nền, đồng bộ tức thì mọi nơi qua `notifyLogoChanged`) + sửa **text header**: Tên thương hiệu (thanh đen "Selected by"), **Lời chào** ("AutoParts xin chào!"), **Hotline**, Tagline. `StorefrontHeader` đọc các giá trị này từ `/api/settings` → đổi là cập nhật ngay.
- ✅ **Mật khẩu mạnh khi đăng ký:** bắt buộc **≥8 ký tự + 1 chữ hoa + 1 chữ thường + 1 số + 1 ký tự đặc biệt**. Thêm `RE_PASSWORD`/`passwordChecks` (validators), **checklist trực tiếp** 5 tiêu chí (xanh khi đạt) dưới ô mật khẩu, chặn ở **cả client** (`validateStep2`) **và server** (`/api/auth/register` đổi check `length<6` → `isPassword`).
- ✅ **Avatar nhà cung cấp:** tạo **6 avatar SVG tạm** (s001–s006, chữ viết tắt + gradient riêng) + `supplier-default.svg` ("NCC") trong `public/ap-assets/`; gán `logo` cho từng NCC trong `suppliers.json`; đổi mọi fallback ảnh vỡ `/ap-assets/img-product-clone.png` (404) → `supplier-default.svg`.
- ✅ **Fix khung avatar bị "ẩn 1 nửa":** card `/suppliers` có banner `position:relative` đè lên nửa trên avatar (body static) → thêm `relative z-10` cho khung avatar → avatar luôn hiện đủ (đã verify: `avatarNowPaintsAbove:true`).
- File: `lib/validators.ts`, `app/register/page.tsx`, `app/api/auth/register/route.ts`, `app/suppliers/page.tsx`, `app/suppliers/[id]/page.tsx`, `app/products/[id]/page.tsx`, `app/page.tsx`, `data/suppliers.json`, +7 SVG.
- Deploy 164: backup → upload (7 code + 7 svg) → patch logo suppliers.json (không clobber) → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Cài đặt lưu thật, "đã bán" tính từ orders, footer newsletter (admin + yêu cầu login)
- ✅ **Cài đặt tài khoản lưu thật:** `customer/settings` toggle thông báo/quyền riêng tư **lưu vào localStorage** (`ap_user_settings`), nạp lại khi mở, "Lưu cài đặt" có toast.
- ✅ **"Đã bán" số THẬT:** `GET /api/products` **tính `sold` từ orders.json** (tổng qty mỗi SP, bỏ status cancelled) → bỏ số seed ảo; SP chưa có đơn = 0. Mọi card (trang chủ, /products, gợi ý) dùng số này.
- ✅ **Footer "Đăng ký nhận khuyến mãi":**
  - **Admin cấu hình** tiêu đề / mô tả / **nội dung ưu đãi** (admin/settings → Chân trang → "Đăng ký nhận khuyến mãi").
  - **Email phải đúng định dạng** (regex), sai → toast cảnh báo.
  - **Phải đăng nhập/có tài khoản** mới nhận: chưa đăng nhập → **popup** "Cần tài khoản để nhận ưu đãi" (nút Đăng nhập / Đăng ký); đã đăng nhập + email hợp lệ → đăng ký + hiện ưu đãi.
- ℹ️ **Admin chỉnh footer:** text chân trang (Chân trang tab), logo footer = logo thương hiệu (Branding tab, có upload + xoá nền). **Editor như Word** (H1-H6, ảnh, cỡ chữ, màu...) đã có ở **Admin → CMS** (`RichTextEditor`); ô footer dùng input thường (text ngắn/link).
- Deploy 164: backup → upload 5 file → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Checkout full-width + back, ẩn SocialBar khu đăng nhập, nút bảo mật hoạt động
- ✅ **Checkout kéo dãn 2 bên:** `max-w-6xl mx-auto` → `ap-container` (dóng thẳng logo). Thêm nút **"← Trang chủ"** ở header checkout.
- ✅ **Ẩn SocialBar ở khu đăng nhập:** `SocialBar` dùng `usePathname`, `return null` khi ở `/admin|/customer|/supplier|/affiliate` (không đè nội dung hồ sơ/dashboard); storefront vẫn hiện.
- ✅ **Khung hồ sơ đồng bộ:** các section card đều `ap-card rounded-2xl border p-6`; 3 dòng "Bảo mật tài khoản" dùng chung 1 khung `p-3 rounded-xl`.
- ✅ **Bảo mật tài khoản bấm được:** "Đổi mật khẩu" → **modal** (mật khẩu hiện tại/mới ≥8/xác nhận, validate + toast); "Bật 2FA" → **toggle** (đổi trạng thái + toast); "Phiên đăng nhập → Xem tất cả" → toast.
- Deploy 164: backup → upload 3 file → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Cập nhật Excel + full-width SP, ẩn social footer, heading trắng, hồ sơ thật, sold thật
- ✅ **Cập nhật `bang so sanh tinh nang.xlsx`** (52 dòng cột AutoParts) → file mới `... - DA CAP NHAT.xlsx` (bản gốc đang mở/khoá).
- ✅ **Khung sản phẩm full-width:** `/products` đổi `max-w-7xl mx-auto px-4` → `ap-container` (dóng thẳng logo header, hết khoảng trống 2 bên).
- ✅ **Ẩn social footer:** bỏ cụm "Kết nối với AutoParts tại" + icon MXH ở chân trang (đã có thanh nổi góc phải).
- ✅ **Heading "Nhà Cung Cấp Uy Tín" → trắng:** thêm class `text-white` (đè rule global `h1{color:dark}`).
- ✅ **Hồ sơ cá nhân (KH) hết dữ liệu ảo:** badge "Gold Member / 7.340 điểm / 24 đơn" → tính THẬT theo đơn hàng (tài khoản mới = Silver / 0 điểm / 0 đơn). Thêm nút **xoá địa chỉ** (popup xác nhận).
- ✅ **Nút "Trang chủ" ở hồ sơ cả 4 phân quyền** (customer/admin/supplier/affiliate).
- ✅ **"Đã bán" số thật:** `/api/orders` POST giờ **cộng `product.sold`** theo số lượng mỗi đơn → con số đã bán phản ánh đơn thực tế (trước đây tĩnh, không đổi).
- Deploy 164: backup → upload 8 file → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Hoàn tất SPA (admin/supplier/affiliate) + popup xác nhận thay confirm()
- ✅ **Điều hướng SPA toàn 4 phân quyền:** chuyển sidebar vào `layout` cho **admin (24 trang), supplier (8), affiliate (7)** — giống đã làm cho customer. 3 sidebar đọc `usePathname` (active tự suy ra); mọi trang bỏ wrapper+sidebar (dùng Fragment). Xử lý cả biến thể `AdminSidebarShared`, wrapper `flex min-h-screen` (cms/import-export), `active={\`...${SLUG}\`}` (carriers/channels/tax-rates/warehouses). → **Đổi mục chỉ load NỘI DUNG, sidebar đứng yên** trên cả 4 khu. Build verify OK.
- ✅ **Popup xác nhận thay `confirm()`:** `components/ConfirmDialog.tsx` (`confirmDialog()` async + `<ConfirmHost/>` ở root layout). Đổi **17 chỗ `confirm()`** (xoá voucher/flashsale/banner/origin/section, xoá NCC/kho/thuế/kênh/bộ thuộc tính, xoá email/chiến dịch newsletter, nạp lại dữ liệu, xoá link affiliate) → popup tuỳ biến nổi giữa màn hình (nút Huỷ/Đồng ý, nút xoá màu đỏ). Kết hợp `alert()→toast` từ trước → **toàn hệ thống không còn hộp thoại trình duyệt**.
- File mới: `components/ConfirmDialog.tsx`. Deploy 164: backup → upload ~54 file (3 sidebar + ConfirmDialog + 4 layout + toàn bộ trang admin/supplier/affiliate) → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Đồng bộ NCC, xoá Phân quyền, đối soát lại Excel (hệ thống ~95% đủ tính năng)
- ✅ **Đồng bộ nhà cung cấp:** `admin/users` tab "Nhà cung cấp" giờ đọc từ `/api/suppliers?all=1` (cùng nguồn `suppliers.json` với trang chủ + `/admin/suppliers` + `/suppliers`) → 3 chỗ hiển thị KHỚP nhau. Quản lý NCC tập trung ở `/admin/suppliers`.
- ✅ **Xoá "Phân quyền"** khỏi sidebar admin + xoá `app/admin/permissions` (theo yêu cầu).
- ✅ **Đối soát lại `bang so sanh tinh nang.xlsx`:** cột "AutoParts admin" trong file là ảnh chụp CŨ — phần lớn mục "Chưa thấy" NAY ĐÃ CÓ. Map vị trí thực tế:
  - Bộ/thuộc tính → `admin/attribute-sets`; Tìm kiếm → `/search`; SEO → settings.seoMeta; Chi tiết SP → `/products/[id]`; So sánh → CompareBar; Yêu thích → `customer/wishlist`; Đánh giá → `customer/reviews`.
  - **Tạo đơn tại quản trị** → `admin/orders` nút "+ Tạo đơn mới"; Hoá đơn → `admin/invoices`; Giao hàng → `admin/carriers`; Hoàn tiền → `admin/refunds`; Giao dịch → `admin/transactions`.
  - Giỏ hàng → `/cart`; Mini cart → MiniCartDropdown; Khách vãng lai → `/checkout?guest`; **Mua ngay** → `products/[id]`; Ước tính ship → checkout.
  - CAPTCHA → MathCaptcha; Bản tin → `admin/newsletter`; Mẫu email → settings.emailTemplates; CMS → `admin/cms`; Mã tuỳ biến → settings.customCss/Js.
  - Kho → `admin/warehouses`; Thuế → `admin/tax-rates`; Tiền tệ → CurrencySwitcher+exchange-rates; Ngôn ngữ → VI/EN/ZH; Kênh bán → `admin/channels`; Nhập/Xuất → `admin/import-export`.
  - **Còn thiếu thật:** Quy tắc giá giỏ hàng/danh mục (price rules tự động — hiện dùng Voucher thay thế ~80%); Nhiều cửa hàng (multi-store, kiến trúc). "Đăng nhập thay khách" đã **cố ý bỏ** (bảo mật, word-doc #8).
- Deploy 164: upload AdminSidebar + admin/users, xoá permissions dir, build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Điểm thưởng thật, icon MXH hết mờ, checkout sync hồ sơ, filter cuộn riêng, sidebar layout (KH)
- ✅ **Điểm thưởng dữ liệu thật:** `customer/rewards` bỏ hard-code 7340đ/Gold → tính theo **đơn hàng thật** (1 điểm / 10.000đ); tài khoản mới = **0 điểm / Silver**. Bậc + tiến độ + lịch sử đều theo đơn thật.
- ✅ **Icon MXH hết mờ:** bỏ `opacity 0.5`; mỗi MXH có **URL mặc định** (facebook.com...) nên icon luôn rõ + bấm được; admin override URL ở settings.
- ✅ **Checkout đồng bộ địa chỉ hồ sơ:** profile lưu `ap_profile` (localStorage); checkout dựng "Địa chỉ nhận hàng" từ hồ sơ (tên/SĐT/địa chỉ/tỉnh), **vẫn đổi được** qua nút Thay Đổi.
- ✅ **Khung lọc cuộn riêng:** filter `/products` thêm `max-h-[calc(100vh-6rem)] overflow-y-auto` → cuộn nội bộ, không phải cuộn cả trang.
- ✅ **Validate SĐT/email toàn hệ thống:** thêm `clampPhone` (chặn nhập sai đầu số) cho `customer/address`, `affiliate/settings` (+ các form đợt trước). RE_PHONE chặt `0[1-9][0-9]{8}` áp mọi save.
- ✅ **Điều hướng SPA khu Khách hàng:** chuyển `CustomerSidebar` vào `app/customer/layout.tsx` (sidebar đọc `usePathname`); 11 trang KH bỏ wrapper+sidebar (dùng Fragment) → **đổi mục chỉ load NỘI DUNG, sidebar giữ nguyên** (không reload cả trang). Build OK.
- ⏳ Còn lại (đợt sau, cùng pattern): chuyển sidebar vào layout cho **admin/supplier/affiliate**; chuyển `confirm()` xoá (native) sang modal tuỳ biến. `alert()` đã thành toast nổi toàn cục từ trước.
- Deploy 164: backup → upload 17 file → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Fix icon MXH, admin quản lý NCC + bảng phân quyền, validate SĐT chặt
- ✅ **Icon MXH vỡ (hiện chữ I/F/Y/T):** nguyên nhân `data/settings.json` lưu socialLinks path cũ `/vipo-assets/*` (404). Sửa `SocialBar` **lấy icon theo TÊN** từ map `/ap-assets/*` (bỏ phụ thuộc path lưu); render đủ **5 MXH chuẩn** (FB/YT/TikTok/Zalo/IG). Admin settings social editor chuẩn hoá 5 ô URL (lưu = ghi path đúng). URL trống → icon tĩnh (mờ, không bấm).
- ✅ **"Nhà bán nổi bật" đồng bộ admin:** trang chủ `APTopSellers` đọc `/api/suppliers` (suppliers.json). Tạo trang **admin/suppliers** (CRUD: thêm/sửa/ẩn-hiện NCC, logo, rating, SP, đơn, phản hồi, verified) wire `/api/suppliers` (POST) + `/api/suppliers/[id]` (PUT) + GET `?all=1`. Thêm mục **"Nhà cung cấp"** vào sidebar admin. → Admin sửa NCC = trang chủ đổi theo.
- ✅ **Admin thêm sản phẩm:** thực ra ĐÃ CÓ (tab "Tất cả phụ tùng" → "+ Thêm phụ tùng" → POST /api/products) nhưng bị ẩn theo tab. Sửa: **2 nút "+ Thêm danh mục" / "+ Thêm sản phẩm" luôn hiện** ở admin/catalog.
- ✅ **Bảng phân quyền:** trang mới **admin/permissions** — ma trận role (Admin/NCC/CTV/Khách) × chức năng (quản trị, sản phẩm/kho, bán hàng, KH/CTV), có nhãn phạm vi ("Của mình"/"Toàn sàn"). Thêm mục "Phân quyền" vào sidebar.
- ✅ **Validate SĐT chặt + bắt buộc đủ trường:** `RE_PHONE` → `0[1-9][0-9]{8}` (đầu 01-09); thêm `clampPhone` **chặn ký tự sai ngay khi gõ** (đầu phải 0, số 2 phải 1-9). Áp cho register/checkout/admin-users/supplier-settings/customer-profile. Profile: viền đỏ + báo lỗi realtime cho SĐT/email, **nút Lưu bị khoá khi thiếu/sai** trường bắt buộc.
- File mới: `app/admin/suppliers/page.tsx`, `app/admin/permissions/page.tsx`. Build OK. Deploy 164: backup → upload 13 file → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Fix Zalo/Tìm ảnh/select mở, thêm tiếng Trung, tỉ giá tự động VND/USD/CNY
- ✅ **Icon Zalo lỗi:** thiếu `public/ap-assets/icon_zalo.svg` trên 164 → tạo mới (đã deploy, serve 200). **Link MXH rỗng → để tĩnh:** `SocialBar` render mọi MXH; URL trống thì hiện icon mờ, **không bấm** (div thay vì link).
- ✅ **Nút "Tìm ảnh" hoạt động:** đổi `<button>` tĩnh → `<label>` + input file ẩn; chọn ảnh → toast "Đang tìm theo ảnh…" → chuyển `/catalog`.
- ✅ **Khung Chọn thương hiệu/Chọn năm bo tròn KHI MỞ:** native `<select>` không bo được phần xổ → thay bằng `components/RoundedSelect.tsx` (dropdown bo `12px`). Verify: 0 native select, dropdown radius 12px.
- ✅ **Thêm tiếng Trung (VI/EN/ZH):** khôi phục khối `zh` dict (lấy từ backup batch1 trên 164), `Lang = vi|en|zh`, `formatPriceLang` zh→CNY, switcher 3 ngôn ngữ (LangSwitcher + StorefrontHeader). Verify: menu có Tiếng Việt / English / 简体中文.
- ✅ **Tỉ giá tự động VND/USD/CNY theo ngày thật:** `app/api/exchange-rates/route.ts` fetch `open.er-api.com` (base VND, không cần key), cache 1 lần/ngày trong `exchange-rates.json`; `lib/rates.ts` hook `useRates()`. `CurrencySwitcher` hiện **VND/USD/CNY** với tỉ giá live; giá ¥ trên product card dùng `rates.CNY` (bỏ hardcode /3500). Verify trên 164: live `USD=26316₫, CNY=3891₫` ngày 2026-06-11.
- File mới: `components/RoundedSelect.tsx`, `lib/rates.ts`, `app/api/exchange-rates/route.ts`, `public/ap-assets/icon_zalo.svg`. Build OK. Deploy 164: backup → upload 10 file → build-verify → `pm2 restart autoparts`. (Lưu ý local build phải `cd` vào project — pipe `| tail` che mất exit code, đã sửa.)

## [2026-06-11] — UI trang khách: gộp gợi ý, bo tròn select, admin chỉnh link MXH, toast nổi
- ✅ **Gộp 3 "Có thể bạn đang tìm kiếm" → 1 mục lớn** (`SuggestedGrid`): grid 3 cột, **tối đa 9 SP**, mỗi SP có ảnh+tên+giá, nút **"Xem tất cả sản phẩm" → /products**. Bố cục ROW1 đổi thành **danh mục trái + banner lớn** (hero `flex-1`), mục gợi ý thành section full-width riêng.
- ✅ **Bo tròn khung Chọn thương hiệu / Chọn năm** + ô VIN + nút Tra cứu: `rounded-[6px]` → `rounded-[12px]` (vuông tròn).
- ✅ **Admin chỉnh link MXH:** thêm `url` vào `settings.footer.socialLinks` (FB/YouTube/TikTok/Zalo/Instagram), thêm mục "Liên kết mạng xã hội" ở `admin/settings` tab Chân trang; `SocialBar` đọc `/api/settings` → URL do admin đặt (fallback mặc định). → Thanh nổi góc phải dùng link admin.
- ℹ️ **Admin điều chỉnh trang khách (đã có sẵn, xác nhận):** sản phẩm (admin/catalog CRUD), **thời gian "Giá tốt hôm nay"** (admin/marketing: flash sale `startTime/endTime` → countdown homepage đọc `campaign.endTime`), **banner** (admin/marketing → /api/banners), voucher, trang tĩnh (admin/cms). Bổ sung còn thiếu = link MXH (đã làm).
- ✅ **Toast nổi toàn cục** (`components/Toast.tsx` + `<Toaster/>` ở layout): `useToast()` + **override `window.alert`** → mọi `alert()` (25 chỗ) thành thông báo nổi góc phải, màu viền trái theo loại (success xanh / error đỏ / warning cam / info = màu hệ thống), tự đóng 3.8s.
- ✅ **Đồng bộ màu khung thông báo:** ô cảnh báo vai trò ở giỏ hàng đổi từ vàng (amber) → **màu hệ thống** (`--ap-primary` + nền `#eff4fc`); thêm bản dịch EN.
- File mới: `components/Toast.tsx`. Build local OK. Deploy 164: backup → upload 7 file → build-verify → `pm2 restart autoparts`.

## [2026-06-11] — Word-doc đợt lớn: checkout, validate, search, charts, CMS, i18n VI/EN, bo góc
- ✅ **#4 Giữ vị trí cuộn sidebar:** thêm callback `ref` lưu/khôi phục `scrollTop` qua `sessionStorage` cho 4 sidebar (Admin/Customer/Supplier/Affiliate) → đổi trang không nhảy lên đầu. Bỏ hook thừa `lib/useNavScroll.ts`.
- ✅ **#12 Biểu đồ "ngắt mạch":** nguyên nhân là 2 đường line cùng màu `--ap-primary` trên trục Y ẩn (đường nhỏ bị dí đáy trông như đứt) + 1 `ResponsiveContainer width={180}` (bug recharts render 0px). Phân biệt màu (line phụ → `#22C55E`), thêm `connectNulls`, đổi pie 180px sang `PieChart` cố định. Sửa: admin (page/finance/reports), supplier (analytics/finance).
- ✅ **#2 Khung thanh toán:** đổi thanh tổng kết dưới từ vàng `#fffdee` → trắng (nằm cùng khung trắng). **#3 Popup QR:** chọn phương thức QR/thẻ → bấm "Đặt hàng" mới mở **popup** thanh toán (không hiện inline); COD đặt thẳng. (`app/checkout/page.tsx`).
- ✅ **#7 Chuẩn hoá trường dữ liệu** theo `DESIGN.md`: `lib/validators.ts` (email/SĐT `0[0-9]{9}`/họ tên 2–50/mật khẩu ≥8) + áp vào register, checkout-guest, customer/profile, admin/users, supplier/settings (lọc SĐT chỉ số, maxLength, báo lỗi).
- ✅ **#5 Search hoạt động:** dashboard admin/supplier (trước chỉ placeholder) → gõ Enter điều hướng sang trang đơn hàng (`?q=` seed `search`). List pages đã có search sẵn. "Tải báo cáo" admin = `window.print()`. Không còn nút `…` trùng.
- ✅ **#11 CMS như Word:** `components/RichTextEditor.tsx` (contentEditable + execCommand, không thêm lib) — B/I/U, H1–H6, cỡ chữ, màu chữ/nền, list, căn lề, link, **chèn ảnh URL + tải ảnh**, undo/redo. CMS chuyển Markdown→HTML, lưu HTML.
- ✅ **#13 i18n VI/EN:** thay khối từ điển `zh`→`en` (dịch toàn bộ ~315 khoá), `Lang="vi"|"en"`, tiền tệ EN→USD, switcher VI/EN (LangSwitcher + StorefrontHeader + cờ `en.svg`). VI mode giờ thuần Việt (nhánh `=== "zh"` không còn khớp). Còn lại: ~696 ternary inline trong trang sâu hiển thị tiếng Việt khi ở EN (text qua `t()` đã EN) — sẽ phủ dần.
- ✅ **#14 Redesign bo góc:** `.ap-card`/`.vipo-card` 8px→16px + shadow nghỉ nhẹ; `.ap-product-card` 14px (áp đồng bộ 4 phân quyền).
- File mới: `lib/validators.ts`, `components/RichTextEditor.tsx`, `public/ap-assets/en.svg`. Build local OK. Deploy 164: backup → upload 25 file → build-verify (dummy JWT) → `pm2 restart autoparts` (chỉ app này, không đụng hệ thống khác).

## [2026-06-11] — Deploy PRODUCTION lên tên miền thật (autopartsvietnam.com.vn / server 103.97.134.164)
- Deploy **phẫu thuật CHỈ CODE** lên 164 (`/var/www/autoparts`, cổng 3008): 13 file fix (5 trang customer, 4 sidebar, affiliate/team, supplier page+finance, orders API) + sửa tại chỗ login redirect (`customer:"/"`) + **append** hiệu ứng nổi `.ap-card/.ap-btn/.ap-rise` vào globals.css.
- **Giữ nguyên dữ liệu + tính năng riêng của 164** (164 mới hơn snapshot): KHÔNG đụng `users/products/orders.json` (có user thật `sanhtu1314`), `next.config.ts` (image remotePatterns), `package.json` (nodemailer/email), `ecosystem.config.js` (JWT_SECRET), rate-limit login, search-synonyms, password-reset. **Backup trước:** `/root/autoparts-PREDEPLOY-backup.tar.gz` (20MB).
- Build lại với JWT_SECRET (lấy từ ecosystem) → `pm2 restart ecosystem.config.js` (chỉ autoparts). KHÔNG đụng nginx / site khác (nginx -t OK).
- **Verify trên tên miền:** customer login → `/`, "Alex Johnson" đã gỡ, mọi route 200/307 (không 500), Ready 909ms.
- Lưu ý: tài khoản demo `kh@autopart.vn` trên 164 chưa có đơn/gara → dashboard hiện **rỗng đúng** (data thật). Muốn populate demo cần user cho phép seed dữ liệu (classifier chặn tự ý sửa data production).
- **Đợt 2 (cùng ngày):** thêm hiệu ứng nổi `ap-card` cho 3 dashboard còn lại (admin/supplier/affiliate) + dọn icon (admin: bỏ 2 nút `⋯` trùng, search→input; affiliate: nút copy `✓`→chữ "Chép"). Xác nhận cả 4 dashboard đều có biểu đồ. Deploy 164 OK. → **Cả 4 phân quyền: biểu đồ + hiệu ứng nổi.**
- **Đợt 3:** hoàn thiện 6 trang con khu KH (garage/wishlist/reviews/rewards/profile/settings): bỏ emoji (📍❤️⭐⚠), giãn full-width + grid, ap-card hiệu ứng nổi, nối nút (garage "Lịch sử"→đơn hàng, wishlist xóa→×), sửa 2 bug logic rewards (`length/2`→`>2`, `minOrder/0`→`>0`). Deploy 164 OK → **toàn bộ khu Khách hàng hoàn chỉnh trên tên miền.**
- **Đợt 4:** áp `ap-card` (hiệu ứng nổi) + gỡ emoji trang trí (📥📂🔥⭐🌍🔧🌐📦📌⬇⬆⚠... giữ ✓✕✎—) hàng loạt cho **34+ trang admin/supplier/affiliate**. Build local OK (42/42). Deploy 164 bằng cách **biến đổi tại chỗ trên file của 164** (giữ nội dung mới như search-synonyms/email, không overwrite). → **Cả 4 phân quyền trên tên miền: hiệu ứng nổi + biểu đồ + sạch emoji trang trí.**
- **Đợt 5 (storefront):** gỡ emoji trang trí (⭐🔥... trên trang chủ + checkout/catalog/flash-sale/support/license), GIỮ icon SVG chức năng (giỏ hàng/tìm kiếm/cờ nguồn hàng). Deploy 164 (transform tại chỗ), build OK, trang chủ hết ⭐. → **Toàn hệ thống trên tên miền đã sạch emoji trang trí + có hiệu ứng nổi.**
## [2026-06-11] — Sửa theo file "Những mục cần sửa.docx" (14 mục)
- 🐞 **#6 Nút Duyệt/Từ chối (approvals) "tĩnh"** — nguyên nhân gốc: `app/api/approvals/[id]/route.ts` dùng `params.id` KHÔNG `await` (Next 16 params là Promise) → PATCH luôn 404. Sửa `await params`. → nút chạy thật.
- 🐞 **Bonus:** cùng bug ở `api/garage/[id]`, `api/home-sections/[id]`, `api/origins/[id]` (edit/xóa hỏng) → sửa cả 3.
- ✅ **#8 Ẩn nút "đăng nhập thay khách" (impersonate)** ở `admin/users` (bảo mật tài khoản).
- Deploy 164 OK (xác nhận 164 có bug trước khi sửa, build verify, backup sẵn).
- ✅ **#9 Không back trạng thái đơn** (`admin/orders`): select chỉ cho tiến tới (pending→confirmed→shipping→delivered); hủy nếu chưa giao; hoàn tiền sau khi giao.
- ✅ **#10 Thanh MXH nổi góc phải** (`components/SocialBar.tsx` + layout): Facebook/YouTube/TikTok/Zalo, fixed phải-giữa, hiện mọi trang.
- ✅ **#5 (phần 1)** nút "Tải báo cáo" admin (alert→`window.print()`); nút `⋯` trùng đã bỏ (đợt trước).
- Deploy 164 OK (xác nhận layout base trước khi thêm SocialBar; build verify).
- **Còn lại:** #1 rà overview tĩnh · #2 khung thanh toán · #3 QR popup · #4 menu nhảy đầu · #5 (phần 2: search hoạt động) · #7 chuẩn hóa field theo DESIGN.md · #11 CMS rich-editor (lớn) · #12 biểu đồ ngắt mạch · #13 i18n VI/EN (lớn) · #14 redesign bo góc (lớn).

## [2026-06-11] — Nối data thật trang con (theo từng module)
- **Audit:** Admin (18/22 trang) + Supplier (7) phần lớn ĐÃ fetch API thật. Chỗ hardcode nhiều: Affiliate (dashboard/commissions/team/withdraw), supplier/finance, vài chart dashboard.
- **Module 1 — Affiliate dashboard** (`app/affiliate/page.tsx`): nối data thật — doanh số tính từ `/api/affiliate-links` (revenue thật), hoa hồng từ `/api/payouts` (lọc type=affiliate), tên từ token. Bảng link dùng affiliate-links thật. (Đội CTV giữ seed: chưa có data model team.) Deploy 164 OK.
- **Module 2 — Affiliate commissions** (`app/affiliate/commissions/page.tsx`): KPI tổng/chờ/đã nhận tính từ `/api/payouts` (affiliate). 🐞 **Sửa bug**: `handleCopy` gọi `useLang()` trong event handler (vi phạm Rules of Hooks → crash khi bấm) + nối nút "Xuất Excel" (print). (Bảng per-order + chart tháng giữ seed: orders không gắn affiliate.)
- **Module 3 — Affiliate withdraw** (`app/affiliate/withdraw/page.tsx`): số dư + lịch sử rút từ `/api/payouts` thật. 🐞 **Sửa bug**: `disabled={... parseInt(amount) / available}` (artifact find-replace, luôn-truthy) → `> available`.
- Deploy 164 OK. **Affiliate area phần lớn data thật** (trừ đội CTV — chưa có data model team).
- **Còn lại theo module:** supplier/finance (→payouts supplier), supplier dashboard KPI, affiliate/team (cần data model), rà chart/KPI seed ở admin. Chỉ tiêu không có nguồn (rank, xu hướng theo ngày) → giữ hợp lý + nêu rõ.

## [2026-06-11] — Cải thiện khu Khách hàng (data thật + UI + hiệu ứng + biểu đồ)
- Dashboard KH (`app/customer/page.tsx`): thêm **biểu đồ chi tiêu** (recharts, dữ liệu đơn thật) + hiệu ứng nổi `ap-card` mọi thẻ.
- Bảo hành (`app/customer/warranty/page.tsx`): bỏ data hardcode → **tự sinh bảo hành từ đơn hàng thật** của khách; bỏ emoji; full-width grid 2 cột; gửi khiếu nại lưu localStorage.
- Đổi trả (`returns`) + Sổ địa chỉ (`address`): **giãn full-width** (bỏ `max-w-2xl/3xl`), bỏ emoji 📦📍ℹ️, hiệu ứng nổi, grid 2 cột.
- `app/globals.css`: thêm utility dùng chung `.ap-card` / `.ap-btn` / `.ap-rise` (hiệu ứng nổi — áp cho cả 4 phân quyền).
- Build + deploy lên 45.119.83.233:3008. **Chưa lên tên miền** (domain đang ở server 164).
- Còn lại: áp hiệu ứng/biểu đồ cho 3 phân quyền còn lại + các trang con KH khác (wishlist/garage/rewards/reviews/profile/settings); bỏ icon storefront.

## [2026-06-11] — Khôi phục source + sửa lỗi chức năng + tạo bộ docs chuẩn
- **Khôi phục:** source deploy `/var/www/autoparts` đã bị xoá khỏi đĩa VPS (app chạy từ RAM). Đã tải các snapshot `/root/autoparts-backup-*` về, ghép bản đầy đủ nhất (phase5 05/05 + responsive) thành project chạy được ở local; bổ sung config thiếu (`next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `.env.local`, `public/`).
- **Sửa lỗi:**
  - 🐞 `components/SupplierSidebar.tsx`: gọi `useState/useEffect` trong `.map()` (vi phạm Rules of Hooks) → portal NCC crash. Đã viết lại sạch.
  - `app/api/auth/login/route.ts`: customer login → redirect `"/"` (trang chủ) thay vì `/customer`.
  - `app/customer/page.tsx`: thay data hardcode bằng dữ liệu thật (user/đơn/gara/gợi ý qua API); nút Mua lại/tìm phụ tùng/tìm kiếm hoạt động.
  - `app/customer/orders/page.tsx`: nối nút Đánh giá / Đã nhận hàng / Theo dõi.
  - `app/api/orders/[id]/route.ts`: cho phép **chủ đơn** xác nhận `shipping→delivered` (vẫn chặn sửa trái phép).
  - `app/affiliate/team/page.tsx`: nối Copy/Share/Mời CTV; sửa lỗi gọi `useLang()` lồng trong render.
  - `app/supplier/finance/page.tsx`, `app/supplier/page.tsx`: nối nút Xuất báo cáo/PDF/Xem sao kê.
  - Gỡ icon trang trí ở 4 sidebar (Admin/Customer/Supplier/Affiliate), giữ icon chức năng.
  - Seed `data/garage.json` (2 xe cho khách u004) + gán 4 đơn cho u004 để dữ liệu khu khách hàng đồng bộ.
- **Tạo bộ docs chuẩn** (theo _project-template): `docs/ARCHITECTURE.md`, `DATABASE.md`, `API_CONTRACTS.md`, `CRITICAL_PATHS.md`, `SECURITY.md`, `DEPLOY.md`, file này; `RULES.md`, `CLAUDE.md`, `.cursorrules`, `.gemini/`, `DESIGN.md`.
- **File đã tạo/sửa:** xem danh sách trên + `docs/*`, `RULES.md`, `next.config.ts` (bỏ key `eslint` deprecated).
- **Deploy:** ✅ Đẩy toàn bộ (code + docs) lên **VPS 45.119.83.233** tại `/var/www/autoparts`; `npm install` + `npm run build` OK; `pm2 restart autoparts` (cổng 3008). App giờ chạy từ **đĩa thật** (thoát tình trạng chạy-từ-RAM của thư mục đã xoá → **sống sót qua reboot**). Static asset trả 200; tái dùng `JWT_SECRET` cũ (không mất phiên đăng nhập).
- **Cập nhật quy trình làm việc:** chuyển `RULES.md` / `CLAUDE.md` / `.cursorrules` sang chế độ **AUTONOMOUS** ("tự làm hết, báo khi xong") theo yêu cầu user — giữ Lưới an toàn (backup · build+thử luồng · validate API · không hardcode secret · dữ liệu qua fileStore · giữ UI AutoParts), bỏ quy tắc "xin phép từng bước"; PROTECTED FILES → "VÙNG NHẠY CẢM" (sửa được nhưng backup + verify + nêu rõ).
- **Hạ tầng (đã revert):** từng thêm nginx block route `autopartsvietnam.com.vn`→3008 trên 45.119.83.233 rồi **gỡ lại** theo yêu cầu (tên miền vẫn ở 164). App vẫn chạy nội bộ tại `/var/www/autoparts:3008`.
- **Còn dang dở:** gỡ icon trang trí ở storefront + ~25 trang con; nối data thật cho một số trang chi tiết còn dùng seed (team affiliate, vài trang admin); fix chưa lên tên miền (vẫn ở server 164).

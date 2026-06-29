# DESIGN.md — Hệ thống thiết kế (Design System)

> File quy chuẩn giao diện để **tái sử dụng cho các dự án sau**. Tổng hợp từ hệ thống CoolingSystem (chủ yếu khu admin).
> Cách dùng: copy nguyên khối CSS ở mục **1 (Tokens)** vào dự án mới → các mục sau đều dựa trên các biến (`var(--…)`) này.
> Nguyên tắc: **Inter** cho chữ, **navy + gold** làm màu thương hiệu, bo góc nhỏ, hiệu ứng mượt (`cubic-bezier(.4,0,.2,1)`), focus có viền + vầng sáng.

---

## ⚙️ Cách áp dụng cho dự án khác (chọn-lọc / modular)

File này là **bản quy chuẩn tham khảo, KHÔNG phải code chạy sẵn** → bạn **chỉ lấy phần nào dự án CẦN, phần nào không có thì bỏ qua thoải mái**. Mỗi mục độc lập, không ràng buộc nhau.

- **Bắt buộc (nền tảng):** chỉ **Mục 1 — Tokens** (khối `:root`). Vì mọi mục khác đều tham chiếu biến `var(--navy)`, `var(--ease)`... → copy khối này TRƯỚC. (Không cần thì đổi giá trị màu cho hợp thương hiệu dự án mới.)
- **Tùy chọn — lấy cái nào dùng cái đó:** Buttons · Form · Validation · Popup · Bảng · Animation · Layout...
  - Dự án không có bảng → bỏ mục **Tables**.
  - Không có biểu đồ → bỏ phần **Chart** trong mục Animation.
  - Không có hóa đơn/định danh → bỏ **CCCD / Hộ chiếu** trong Validation.
  - Chỉ cần nút + form → lấy **Mục 1 + 3 + 4 + 5** là đủ.
- **Đổi màu thương hiệu:** chỉ sửa `--navy` / `--gold` ở Mục 1 → toàn bộ nút, focus, badge, popup **tự đổi theo**.
- **Khác công nghệ:** HTML/CSS/JS dùng được cho **mọi stack** (PHP, Node/React, HTML thuần...). Riêng các đoạn **PHP** (`flash()`, `e()`, render server) chỉ là minh họa — dịch sang backend của bạn; phần **validation HTML** (`pattern`, `maxlength`, `required`) thì copy dùng nguyên.

> Tóm lại: **đúng** — ném file vào, giữ Mục 1, rồi nhặt đúng những thành phần dự án có. Không có phần nào thì cứ bỏ, không ảnh hưởng phần khác.

---

## 0. Quy ước nhanh (TL;DR)

| Hạng mục | Quy chuẩn |
|---|---|
| Font chữ | `Inter` (chính) · `Playfair Display` (tiêu đề serif) · `JetBrains Mono` (số/mã) |
| Cỡ chữ gốc | `14px`, line-height `1.55` |
| Màu chính | Navy `#1a3258` · Vàng `#c9a14a / #d4a548` |
| Bo góc | Button `2px`, Input `3px` (cổ điển) hoặc `8–10px` (hiện đại), Card/Panel `12–14px` |
| Focus input | Viền `--gold-warm` + vầng sáng `0 0 0 3px var(--gold-soft)` |
| Hiệu ứng | `transition: all .3s var(--ease)`; hover nút nhấc `translateY(-1px)` + đổ bóng |
| SĐT | bắt đầu `0`, đúng `10` số → `pattern="0[0-9]{9}"` |
| Email | `pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"` |
| Họ tên | chỉ chữ cái + khoảng trắng (có dấu tiếng Việt), `2–50` ký tự |
| Mật khẩu | tối thiểu `8` ký tự (form người dùng admin); `6` ký tự (form công khai) |

---

## 1. Tokens (CSS biến gốc) — copy nguyên khối

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Navy (màu thương hiệu chính) */
  --navy: #1a3258;
  --navy-dark: #0f2342;
  --navy-mid: #2a4570;
  --navy-soft: #f0f4fa;
  --navy-line: #dde4f0;
  /* Gold (màu nhấn) */
  --gold: #c9a14a;
  --gold-warm: #d4a548;
  --gold-light: #e8c476;
  --gold-soft: #f9efd2;
  --gold-deep: #a8853a;
  /* Mực / chữ */
  --ink: #1a1a1a;
  --ink-2: #4a4a4a;
  --ink-3: #767676;
  --ink-4: #a3a3a3;
  /* Đường kẻ / nền */
  --line: #e5e5e5;
  --line-2: #f0f0f0;
  --bg: #ffffff;
  --bg-soft: #f7f8fb;
  --bg-2: #fafbfc;
  /* Trạng thái */
  --green: #15803d;  --green-soft: #f0fdf4;
  --red: #c62828;    --red-soft: #fef2f2;
  --orange: #d97706; --orange-soft: #fff7ed;
  /* Đổ bóng + easing */
  --shadow-sm: 0 1px 2px rgba(15,35,66,0.04);
  --shadow:    0 2px 12px rgba(15,35,66,0.08);
  --shadow-lg: 0 12px 32px rgba(15,35,66,0.12);
  --shadow-gold: 0 6px 20px rgba(201,161,74,0.25);
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  /* Bo góc chuẩn */
  --r-sm: 3px; --r: 8px; --r-md: 12px; --r-lg: 14px; --r-pill: 999px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg); color: var(--ink);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px; line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
input, textarea, select { font-family: inherit; }
::selection { background: var(--navy); color: #fff; }
```

> **Bảng màu hiện đại (tùy chọn)** dùng cho dashboard/biểu đồ thế hệ mới: navy đậm `#16243f`, xanh dương `#3b82f6`, xanh lá `#22c55e`, cam `#f59e0b`, tím `#8b5cf6`, đỏ `#ef4444`, ngọc `#14b8a6`, xám `#94a3b8`; bóng card nhẹ `0 1px 4px rgba(20,40,80,.06)`.

---

## 2. Typography (Chữ)

- **Font chính:** `Inter` — dùng cho mọi nội dung, nút, form, **kể cả tiêu đề** (khu admin chuẩn hóa toàn bộ tiêu đề về Inter, KHÔNG nghiêng).
- **Font serif:** `Playfair Display` — chỉ cho tiêu đề trang trí lớn (class `.serif`). Public/marketing.
- **Font số/mã:** `JetBrains Mono` — số tiền, mã đơn, SKU (class `.mono` / `.num`).

```css
.serif { font-family: 'Playfair Display', Georgia, serif; }
.mono  { font-family: 'JetBrains Mono', 'Courier New', monospace; }
```

**Thang cỡ chữ & độ đậm**

| Vai trò | Cỡ | Đậm | Ghi chú |
|---|---|---|---|
| Body | 14px | 400 | line-height 1.55 |
| Nhãn input (label) | 12px | 600 | letter-spacing .03em |
| Caption / phụ | 11–12px | 500 | màu `--ink-3` |
| H1 trang | 22–28px | 800 | admin: Inter; public: Playfair |
| H2 mục | 18px | 700 | tiêu đề khối/panel |
| H3 | 15–16px | 700 | đầu panel |
| Số liệu lớn (KPI) | 21–24px | 800 | màu `--navy`/`#16243f` |

> **Quy tắc tiêu đề admin:** tiêu đề `h1–h4` trong khu quản trị **luôn Inter, không in nghiêng**, không gắn `font-size` inline (để 1 nơi quản lý tập trung). Tiêu đề mục public chuẩn hóa **18px, IN HOA, màu navy**.

---

## 3. Buttons (Nút bấm)

**Đặc trưng:** IN HOA, `letter-spacing .1em`, bo góc nhỏ (`2px`), hover **nhấc lên 1px + đổ bóng**.

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  padding: 13px 28px; font-size: 12px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  border: 1px solid transparent; border-radius: 2px; white-space: nowrap;
  cursor: pointer; font-family: 'Inter', sans-serif;
  transition: all 0.3s var(--ease);
}
/* Chính (navy đặc) */
.btn-navy { background: var(--navy); color: #fff; border-color: var(--navy); }
.btn-navy:hover { background: var(--navy-dark); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(15,35,66,0.3); }
/* Nhấn (gradient vàng) */
.btn-gold { background: linear-gradient(135deg, var(--gold-warm) 0%, var(--gold-deep) 100%); color: var(--navy-dark); font-weight: 700; }
.btn-gold:hover { transform: translateY(-1px); box-shadow: var(--shadow-gold); }
/* Viền */
.btn-outline-navy  { background: transparent; color: var(--navy); border-color: var(--navy); }
.btn-outline-navy:hover  { background: var(--navy); color: #fff; }
.btn-outline-gold  { background: transparent; color: var(--gold-warm); border-color: var(--gold-warm); }
.btn-outline-gold:hover  { background: var(--gold-warm); color: var(--navy-dark); }
/* Nguy hiểm */
.btn-danger { background: var(--red); color: #fff; border-color: var(--red); }
.btn-danger:hover { background: #a51e1e; }
/* Kích cỡ + tiện ích */
.btn-sm { padding: 9px 18px; font-size: 11px; }
.btn-lg { padding: 16px 36px; font-size: 13px; }
.btn-block { width: 100%; }
.btn[disabled] { opacity: 0.5; cursor: not-allowed; }
```

**Quy tắc dùng:**
- **Hành động chính** trên 1 màn hình → 1 nút `btn-gold` hoặc `btn-navy` (đừng để 2 nút "primary" cạnh nhau).
- **Hủy / phụ** → `btn-outline-navy`.
- **Xóa / nguy hiểm** → `btn-danger` + luôn có hộp xác nhận (modal, không dùng `confirm()` mặc định trình duyệt).
- Nút bảng/hàng nhỏ → thêm `btn-sm`.

---

## 4. Form & Input

```css
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 12px; color: var(--ink-2); margin-bottom: 6px; font-weight: 600; letter-spacing: 0.03em; }
.form-group label .req { color: var(--red); }          /* dấu * bắt buộc */

.form-control,
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 11px 14px;
  border: 1px solid var(--line); border-radius: 3px;
  font-size: 14px; font-family: inherit; background: #fff; color: var(--ink);
  transition: border 0.2s;
}
.form-group textarea { resize: vertical; min-height: 80px; }

/* Focus: viền vàng + vầng sáng */
.form-control:focus,
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none; border-color: var(--gold-warm); box-shadow: 0 0 0 3px var(--gold-soft);
}

.form-row { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 12px; } /* 2 cột, tự xuống 1 cột mobile */
.form-help  { font-size: 11px; color: var(--ink-3); margin-top: 4px; }
.form-error { font-size: 12px; color: var(--red);  margin-top: 4px; }
```

**Biến thể "hiện đại" (bo tròn, focus navy)** — dùng cho trang khách hàng/checkout/hồ sơ:

```css
.form-modern input, .form-modern select, .form-modern textarea {
  border-radius: 10px; border: 1px solid #d6deea; padding: 12px 14px;
}
.form-modern input:focus, .form-modern select:focus, .form-modern textarea:focus {
  border-color: var(--navy); box-shadow: 0 0 0 3px rgba(26,50,88,.12);
}
/* select có mũi tên tùy biến: appearance:none + background-image caret */
.form-modern select { appearance: none; min-width: 0; }
```

**Quy tắc form:**
- Mỗi trường bọc trong `.form-group`; nhãn rõ ràng + dấu `*` (`.req`) cho trường bắt buộc.
- 2 trường cùng hàng → `.form-row` (tự co về 1 cột trên mobile nhờ `minmax(0,1fr)` + media query).
- `select` mở danh sách không style được bằng CSS thuần → khi cần style danh sách, **thay bằng dropdown tùy biến** (div + JS), không cố style `<option>`.
- `<input type="date">` mặc định xấu/định dạng mm/dd → khuyến nghị **bộ chọn ngày tùy biến** (lịch tự vẽ), giữ input gốc ẩn để form vẫn submit `yyyy-mm-dd`.

---

## 5. Quy chuẩn các trường dữ liệu (Validation)

> Dùng kèm cả HTML (`pattern`, `required`, `maxlength`) **và** kiểm tra lại ở server. `pattern` HTML chỉ là lớp UX đầu tiên.

### 5.1 Họ và tên
- Chỉ **chữ cái + khoảng trắng** (có dấu tiếng Việt), 2–50 ký tự.
```html
<input type="text" name="full_name" required minlength="2" maxlength="50"
  pattern="[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ ]{2,50}"
  title="Họ và tên chỉ được chứa chữ cái và khoảng trắng"
  placeholder="Nguyễn Văn A"
  oninput="this.value=this.value.replace(/[0-9!@#$%^&*()_+=\[\]{}|;:,.<>?/~`]/g,'')">
```
> Cách gọn hơn (Unicode): `pattern="^[\p{L}\s]+$"` (cần `\p{L}` — không phải mọi trình duyệt hỗ trợ, nên giữ bản liệt kê ở trên cho chắc).

### 5.2 Email
```html
<input type="email" name="email" required maxlength="100"
  pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
  title="Email đúng định dạng, ví dụ: ten@gmail.com"
  placeholder="email@gmail.com">
```

### 5.3 Số điện thoại (Việt Nam)
- Bắt đầu bằng `0`, **đúng 10 số**, chỉ nhập số.
```html
<input type="tel" name="phone" required minlength="10" maxlength="10"
  pattern="0[0-9]{9}"
  title="Số điện thoại phải bắt đầu từ 0 và có đúng 10 số"
  placeholder="0xxxxxxxxx"
  oninput="this.value=this.value.replace(/[^0-9]/g,'')">
```
> Chặt hơn (đầu số hợp lệ): `pattern="^0[1-9][0-9]{8}$"`.
> ⚠ Khi **xuất CSV/Excel**, bọc SĐT/CCCD/số tài khoản dạng `="0398680700"` để Excel hiển thị đúng (không thành `3.99E+08`).

### 5.4 Mật khẩu
- Form tạo người dùng (admin): **tối thiểu 8 ký tự**. Form công khai (đăng ký/đăng nhập): tối thiểu 6.
```html
<input type="password" name="password" required minlength="8" placeholder="Tối thiểu 8 ký tự">
```
- Luôn **hash** (bcrypt/`password_hash`) ở server, không bao giờ hiển thị lại; chỉ cho "cấp lại mật khẩu".

### 5.5 CCCD / Hộ chiếu
```html
<input type="text" name="id_number" maxlength="12" placeholder="Nhập số CCCD/CMND (12 số)" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
<input type="text" name="passport"  maxlength="8"  placeholder="VD: B1234567">
```

### 5.6 Địa chỉ / ghi chú
- `maxlength="100"` (địa chỉ), `maxlength="500"` (lý do/ghi chú). Lọc ký tự đặc biệt nguy hiểm nếu cần.

---

## 6. Phản hồi & trạng thái (Alerts / Badges)

```css
.alert { padding: 12px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 16px; border-left: 3px solid; }
.alert-success { background: var(--green-soft);  color: var(--green);  border-color: var(--green); }
.alert-error   { background: var(--red-soft);    color: var(--red);    border-color: var(--red); }
.alert-warn    { background: var(--orange-soft); color: var(--orange); border-color: var(--orange); }
.alert-info    { background: var(--navy-soft);   color: var(--navy);   border-color: var(--navy); }

/* Nhãn trạng thái (đơn hàng, tài khoản…) */
.badge-status { display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 700; border-radius: 12px; letter-spacing: 0.03em; }
.badge-status.active, .badge-status.completed, .badge-status.success { background: var(--green-soft); color: var(--green); }
.badge-status.pending  { background: var(--orange-soft); color: var(--orange); }
.badge-status.cancelled, .badge-status.locked, .badge-status.refunded { background: var(--red-soft); color: var(--red); }
.badge-status.processing, .badge-status.shipping { background: var(--navy-soft); color: var(--navy); }
.badge-status.draft, .badge-status.unpaid { background: var(--bg-soft); color: var(--ink-3); }
```
**Quy tắc màu trạng thái:** xanh lá = thành công/hoạt động · cam = chờ xử lý · đỏ = hủy/khóa/lỗi · navy = đang vận hành · xám = nháp/không hoạt động.

---

## 6B. Popup / Modal / Thông báo (CHUẨN) ⭐

Hệ thống dùng **4 kiểu chuẩn** dưới đây. **TUYỆT ĐỐI không dùng `alert()` / `confirm()` mặc định của trình duyệt** (xấu, chặn luồng, không đồng bộ giao diện).

### a) Hộp xác nhận — `csConfirm()` (thay cho `confirm()`)
Popup giữa màn hình, 2 nút **Hủy / Xác nhận**. Dùng cho mọi hành động cần xác nhận (xóa, hủy đơn, thu hồi quyền…). Đặt **1 lần** ở cuối trang (footer) là gọi được khắp nơi.

```html
<!-- Đặt 1 lần ở footer toàn site -->
<div id="csConfirmModal" style="display:none;position:fixed;inset:0;z-index:99999;background:rgba(10,25,47,0.5);align-items:center;justify-content:center;padding:16px">
  <div style="background:#fff;border-radius:14px;max-width:380px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.3);padding:24px 22px;text-align:center">
    <div style="font-size:16px;font-weight:700;color:#0a192f;margin-bottom:8px">Xác nhận</div>
    <p id="csConfirmMsg" style="font-size:13.5px;color:#555;margin:0 0 20px;line-height:1.5"></p>
    <div style="display:flex;gap:10px">
      <button type="button" id="csConfirmCancel" style="flex:1;padding:11px;background:#eef2f7;color:#0a192f;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px">Hủy</button>
      <button type="button" id="csConfirmOk" style="flex:1;padding:11px;background:#ef4444;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px">Xác nhận</button>
    </div>
  </div>
</div>
<script>
(function(){
  var _ok=null,_cancel=null,bound=false;
  function close(){_ok=null;_cancel=null;var m=document.getElementById('csConfirmModal');if(m)m.style.display='none';}
  function bind(){ if(bound)return; var m=document.getElementById('csConfirmModal'); if(!m)return; bound=true;
    document.getElementById('csConfirmOk').addEventListener('click',function(){var f=_ok;close();if(typeof f==='function')f();});
    document.getElementById('csConfirmCancel').addEventListener('click',function(){var f=_cancel;close();if(typeof f==='function')f();});
    m.addEventListener('click',function(ev){if(ev.target===m){var f=_cancel;close();if(typeof f==='function')f();}}); // click nền = hủy
  }
  window.csConfirm=function(message,onOk,onCancel){ var m=document.getElementById('csConfirmModal');
    if(!m){ if(window.confirm(message)){if(onOk)onOk();}else{if(onCancel)onCancel();} return; }   // fallback nếu thiếu modal
    bind(); document.getElementById('csConfirmMsg').textContent=message||'Bạn có chắc chắn?'; _ok=onOk; _cancel=onCancel; m.style.display='flex'; };
  window.csConfirmAsync=function(message){ return new Promise(function(res){ csConfirm(message,function(){res(true);},function(){res(false);}); }); };
  window.csConfirmForm=function(form,message){ csConfirm(message,function(){ form.submit(); }); return false; };
  window.csConfirmBtn=function(btn,message){ csConfirm(message,function(){ var f=btn.form; if(f){ if(f.requestSubmit)f.requestSubmit(btn); else f.submit(); } }); return false; };
})();
</script>
```
**Cách gọi:**
```html
<!-- Trong form -->     <form onsubmit="return csConfirmForm(this,'Xóa vĩnh viễn tài khoản này?')">
<!-- Nút trong form --> <button onclick="return csConfirmBtn(this,'Chắc chắn chứ?')">Xóa</button>
<!-- Tự do (callback)--> <a onclick="csConfirm('Hủy đơn này?', function(){ doCancel(); })">Hủy đơn</a>
<!-- Async/await -->     if (await csConfirmAsync('Chắc chắn chứ?')) { ... }
```

### b) Thông báo nhanh — `coolToast()` (thay cho `alert()`)
Popup giữa màn, có **icon (emoji) + nút OK**, tự ẩn sau 5s, có hiệu ứng scale+fade. Đã **override `window.alert`** nên `alert('...')` cũ vẫn chạy ra popup đẹp.

```html
<div id="coolToast" style="display:none;position:fixed;inset:0;z-index:999999;pointer-events:none">
  <div id="coolToastBox" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);background:#fff;border-radius:16px;padding:28px 32px;max-width:400px;width:90%;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,0.3);pointer-events:auto;opacity:0;transition:all 0.25s ease">
    <div id="coolToastIcon" style="font-size:40px;margin-bottom:10px">ℹ️</div>
    <div id="coolToastMsg" style="color:#1a3258;font-size:14px;line-height:1.6;margin-bottom:18px;word-break:break-word"></div>
    <button onclick="coolToastHide()" style="padding:10px 32px;background:linear-gradient(135deg,#c8a951,#b8860b);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;min-width:100px">OK</button>
  </div>
  <div onclick="coolToastHide()" style="position:absolute;inset:0;background:rgba(0,0,0,0.4);z-index:-1;pointer-events:auto"></div>
</div>
<script>
function coolToastShow(msg,icon){
  var t=document.getElementById('coolToast'),b=document.getElementById('coolToastBox');
  document.getElementById('coolToastMsg').innerHTML=msg;
  document.getElementById('coolToastIcon').textContent=icon||'ℹ️';
  t.style.display='block';
  setTimeout(function(){b.style.opacity='1';b.style.transform='translate(-50%,-50%) scale(1)';},10);
  if(window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout=setTimeout(coolToastHide,5000);
}
function coolToastHide(){
  var t=document.getElementById('coolToast'),b=document.getElementById('coolToastBox');
  b.style.opacity='0';b.style.transform='translate(-50%,-50%) scale(0.9)';
  setTimeout(function(){t.style.display='none';},250);
}
window.alert=function(msg){coolToastShow(msg);};   // override alert mặc định
</script>
```
**Cách gọi:** `coolToastShow('Đã thêm vào giỏ hàng!','🛒')` · `coolToastShow('Không thể kết nối','❌')` · hoặc cứ `alert('...')`.
Quy ước icon: `✅` thành công · `❌` lỗi · `⚠️` cảnh báo · `🛒` giỏ hàng · `ℹ️` mặc định.

### c) Flash message (server-side — sau khi submit/redirect)
Trượt vào **góc trên-phải**, theo loại `success / error / warning / info`. Dùng cho phản hồi sau khi POST + redirect.

```css
.flash-stack { position: fixed; top: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; max-width: 360px; }
.flash { padding: 14px 18px; background: #fff; border-radius: 4px; box-shadow: var(--shadow-lg); font-size: 13px; border-left: 3px solid; animation: slideIn 0.3s ease; }
.flash.success { border-color: var(--green);  color: var(--green); }
.flash.error   { border-color: var(--red);    color: var(--red); }
.flash.warning { border-color: var(--orange); color: var(--orange); background:#fff3e6; }
.flash.info    { border-color: var(--navy);   color: var(--navy); }
@keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
```
```html
<!-- Render ở header, đọc từ session flash -->
<div class="flash-stack">
  <?php foreach (($flash ?? []) as $f): ?>
    <div class="flash <?= e($f['type']) ?>"><?= e($f['message']) ?></div>
  <?php endforeach; ?>
</div>
```
Phía server (PHP): `flash('success','Đã lưu thành công!');` rồi `redirect(...)`.

### d) Modal khung tùy biến (form/nội dung trong popup)
Mẫu dùng chung cho các popup chứa form (ngưng tài khoản, đổi mật khẩu, nhập lý do…).

```css
.modal-overlay { display:none; position:fixed; inset:0; background:rgba(10,25,47,0.5); z-index:1000; align-items:center; justify-content:center; padding:16px; }
.modal-overlay.open { display:flex; }
.modal-box { background:#fff; border-radius:12px; padding:24px 28px; max-width:440px; width:100%; box-shadow:0 24px 60px rgba(0,0,0,0.25); }
.modal-box h3 { margin:0 0 16px; color:var(--navy); font-size:18px; }
.modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; }
```
```html
<div class="modal-overlay" id="myModal" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="modal-box">
    <h3>Tiêu đề</h3>
    <form method="post" action="...">
      <div class="form-group"><label>Trường</label><input name="x"></div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline-navy" onclick="document.getElementById('myModal').classList.remove('open')">Hủy</button>
        <button type="submit" class="btn btn-navy">Xác nhận</button>
      </div>
    </form>
  </div>
</div>
<script>function openMyModal(){document.getElementById('myModal').classList.add('open');}</script>
```

**Quy tắc chọn loại popup:**
| Tình huống | Dùng |
|---|---|
| Hỏi "có chắc không?" trước hành động | **`csConfirm`** (a) |
| Báo kết quả ngay trên trang (AJAX) | **`coolToast`** (b) |
| Báo kết quả sau khi submit + chuyển trang | **flash** (c) |
| Cần nhập thêm dữ liệu trong popup | **modal khung** (d) |

> Tất cả popup: nền mờ `rgba(10,25,47,.5)`, hộp trắng bo `12–16px`, bóng `0 24px 60px rgba(0,0,0,.3)`, **click ra nền = đóng**, `z-index` cao (modal 1000 / confirm 99999 / toast 999999).

---

## 7. Bảng (Tables)

```css
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th, .tbl td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--line-2); }
.tbl th { background: var(--bg-soft); font-weight: 700; color: var(--ink-2); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
.tbl tr:hover td { background: var(--bg-2); }
.tbl .right { text-align: right; } .tbl .center { text-align: center; }
.tbl .num { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
```
- Bảng nhiều cột → bọc trong `div` cuộn ngang (`overflow-x:auto`) trên mobile.
- Cột số tiền/SL → căn phải + dùng `.num`.

---

## 8. Hiệu ứng CSS & Animation

**Nguyên tắc:** mượt, tinh tế, có mục đích. Mọi transition dùng chung `--ease`. Hover khối nổi → nhấc lên + đổ bóng đậm hơn.

```css
/* Transition chuẩn */
.card, .panel, .btn, .interactive { transition: transform .24s var(--ease), box-shadow .24s var(--ease); }

/* Hover nhấc khối (card/panel) */
.card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

/* Xuất hiện dần khi tải trang (entrance) — có so le (stagger) */
@keyframes fadeUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
.animate-in { animation: fadeUp .5s var(--ease) backwards; }   /* 'backwards' để hover transform vẫn dùng được sau khi chạy xong */
.animate-in:nth-child(1){animation-delay:.04s} .animate-in:nth-child(2){animation-delay:.10s}
.animate-in:nth-child(3){animation-delay:.16s} .animate-in:nth-child(4){animation-delay:.22s}

/* Thanh tiến độ "mọc" từ trái */
@keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.bar > i { transform-origin: left center; animation: barGrow .9s var(--ease) backwards; }

/* Tôn trọng người dùng tắt hiệu ứng (accessibility) */
@media (prefers-reduced-motion: reduce) { .animate-in, .bar > i { animation: none; } }
```

**Đếm số tăng dần (count-up) cho thẻ KPI** — đọc text đã render, chạy 0 → giá trị:
```js
document.querySelectorAll('.count-up').forEach(function(el){
  var m = el.textContent.trim().match(/^([\d.]+)(.*)$/); if(!m) return;
  var target = parseInt(m[1].replace(/\./g,''),10); if(!target) return;
  var suffix = m[2], start = null;
  function fmt(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); } // thêm dấu chấm hàng nghìn
  function step(t){ if(!start)start=t; var p=Math.min((t-start)/950,1); var e=1-Math.pow(1-p,3);
    el.textContent = fmt(Math.floor(e*target)) + suffix; if(p<1) requestAnimationFrame(step); }
  requestAnimationFrame(step);
});
```

**Biểu đồ (Chart.js)** — để hiệu ứng LUÔN thấy rõ:
- **Đường/Cột:** tạo biểu đồ với data = `0`, rồi `setTimeout(()=>{ chart.data.datasets[0].data = realData; chart.update(); }, 80)` → cột/đường "mọc" lên (chắc ăn hơn animation khởi tạo mặc định).
- **Tròn (doughnut):** `options.animation = { animateRotate:true, animateScale:true, duration:1400, easing:'easeOutQuart' }` → xoay + nở từ tâm.
- Nếu khối chứa biểu đồ có hiệu ứng fade-in, **hoãn tạo biểu đồ ~300–600ms** để hiệu ứng không bị che khi khối còn mờ.

---

## 9. Bố cục, khoảng cách, đổ bóng

- **Container:** `max-width: 1280–1400px; margin: 0 auto; padding: 0 24px`.
- **Card/Panel:** nền trắng, bo `12–14px`, viền `1px var(--line)` (hoặc `#eef1f6`), bóng nhẹ `var(--shadow)`/`0 1px 4px rgba(20,40,80,.06)`, padding `16–20px`.
- **Lưới thẻ thống kê:** `display:grid; gap:14–16px; grid-template-columns: repeat(6,1fr)` → co về `repeat(3,1fr)` (≤1500px) → `repeat(2,1fr)` (≤760px).
- **Khoảng cách dọc giữa khối:** `16–24px`.
- **Thang bo góc:** nút `2px` · input `3–10px` · card `12–14px` · pill/nhãn `999px/12px`.
- **Thang đổ bóng:** `--shadow-sm` (viền nhẹ) · `--shadow` (mặc định) · `--shadow-lg` (hover/nổi).

---

## 10. Responsive (Điểm gãy)

| Breakpoint | Ý nghĩa |
|---|---|
| `≤ 1500px` | lưới 6 cột → 3 cột |
| `≤ 1150px` | bố cục 3 cột nội dung → 1 cột |
| `≤ 760px` | mobile: lưới → 2 cột; `.form-row` → 1 cột; bảng cuộn ngang |

```css
@media (max-width: 760px) {
  .form-row { grid-template-columns: 1fr; }
  .form-group { min-width: 0; }     /* tránh select/input bị tràn khung trên mobile */
}
```
> Bẫy thường gặp: `select` trong grid `1fr` bị giãn theo option dài nhất → thêm `min-width:0` cho `.form-group`.

---

## 11. Ghi chú riêng cho dự án tiếng Việt

- **Định dạng tiền:** chấm hàng nghìn + "₫" → `number_format($n, 0, ',', '.') . ' ₫'` (PHP) / `n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.')` (JS).
- **Ngày giờ:** hiển thị `dd/mm/yyyy HH:mm` (đừng để ISO `2026-06-06T...Z`). Quy ước: lưu giờ **cùng một múi** ở mọi bảng (VN +7) để tránh lệch; nếu lưu UTC thì quy đổi khi hiển thị.
- **Thời gian tương đối:** `vừa xong` (<1 phút) → `X phút trước` → `X giờ trước` → `X ngày trước` → `dd/mm/yyyy`.
- **Xác nhận hành động nguy hiểm:** dùng **modal tùy biến**, không dùng `confirm()`/`alert()` mặc định trình duyệt.
- **Tên ảnh upload:** đặt theo tên gốc đã bỏ dấu + slug (SEO), không random `uniqid()`.

---

*Tổng hợp từ hệ thống CoolingSystem. Copy mục 1 trước, các mục sau kế thừa biến CSS. Điều chỉnh màu thương hiệu (navy/gold) cho phù hợp từng dự án.*

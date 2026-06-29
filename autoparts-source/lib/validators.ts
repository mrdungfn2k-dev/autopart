// Chuẩn hoá các trường dữ liệu theo DESIGN.md (mục 5: Họ tên, Email, SĐT, Mật khẩu)
// Dùng chung cho mọi form: đăng ký, hồ sơ, địa chỉ, checkout...

export const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const RE_PHONE = /^0[1-9][0-9]{8}$/;       // 0 + đầu số 1-9 + 8 số = 10 số (01x..09x)
export const RE_NAME = /^[\p{L}\s]{2,20}$/u;      // 2–20 ký tự, chỉ chữ + khoảng trắng (giới hạn 20 chống tràn khung)
// Mật khẩu mạnh: ≥8 ký tự, có ít nhất 1 chữ thường, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
export const RE_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const isEmail = (v: string) => RE_EMAIL.test((v || "").trim());
export const isPhone = (v: string) => RE_PHONE.test((v || "").trim());
export const isName = (v: string) => RE_NAME.test((v || "").trim());
export const isPassword = (v: string) => RE_PASSWORD.test(v || "");

// Trả về từng tiêu chí của mật khẩu — để hiển thị checklist trực tiếp khi gõ
export function passwordChecks(v: string) {
  const s = v || "";
  return {
    len: s.length >= 8,
    lower: /[a-z]/.test(s),
    upper: /[A-Z]/.test(s),
    digit: /\d/.test(s),
    special: /[^A-Za-z0-9]/.test(s),
  };
}

// Chỉ giữ chữ số, cắt tối đa `max` ký tự — dùng cho mã số / CCCD
export const onlyDigits = (v: string, max = 10) => (v || "").replace(/\D/g, "").slice(0, max);

// Mặt nạ nhập SĐT: chặn ký tự sai NGAY khi gõ — đầu phải 0, số thứ 2 phải 1-9, tối đa 10 số.
export function clampPhone(v: string): string {
  const d = (v || "").replace(/\D/g, "");
  let out = "";
  for (let i = 0; i < d.length && out.length < 10; i++) {
    const ch = d[i];
    if (out.length === 0) { if (ch === "0") out += ch; }        // ký tự đầu BẮT BUỘC là 0
    else if (out.length === 1) { if (ch !== "0") out += ch; }   // ký tự thứ 2 phải 1-9 (chặn 00)
    else out += ch;
  }
  return out;
}

// Ràng buộc HTML đồng bộ với DESIGN.md (đính kèm vào input)
export const FIELD_ATTRS = {
  name: { maxLength: 20, pattern: "[\\p{L}\\s]{2,20}", title: "Họ tên 2–20 ký tự, chỉ gồm chữ và khoảng trắng" },
  email: { type: "email" as const, maxLength: 100, pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}", title: "Email đúng định dạng, ví dụ: ten@gmail.com" },
  phone: { type: "tel" as const, inputMode: "numeric" as const, maxLength: 10, pattern: "0[0-9]{9}", title: "Số điện thoại 10 số, bắt đầu bằng 0" },
  password: { type: "password" as const, minLength: 8, title: "Mật khẩu ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt" },
};

// Trả về thông báo lỗi tiếng Việt, hoặc null nếu hợp lệ
export function validateField(kind: "name" | "email" | "phone" | "password", v: string): string | null {
  switch (kind) {
    case "name": return isName(v) ? null : "Họ tên phải 2–20 ký tự, chỉ gồm chữ và khoảng trắng";
    case "email": return isEmail(v) ? null : "Email không đúng định dạng (vd: ten@gmail.com)";
    case "phone": return isPhone(v) ? null : "Số điện thoại phải gồm 10 số, bắt đầu bằng 0";
    case "password": return isPassword(v) ? null : "Mật khẩu cần ≥8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
    default: return null;
  }
}

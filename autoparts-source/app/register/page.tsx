"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { setAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import LogoImage from "@/components/LogoImage";
import MathCaptcha from "@/components/MathCaptcha";
import { validateField, clampPhone, passwordChecks } from "@/lib/validators";

export default function RegisterPage() {
  const { t, lang } = useLang();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<"customer" | "supplier" | "affiliate">("customer");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "",
    businessName: "", taxCode: "", province: "",
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [captchaOk, setCaptchaOk] = useState(false);

  const roleConfig = {
    customer:  {
      label: t("roleCustomer"),
      desc: lang === "zh" ? "购买配件，赚取积分" : "Mua phụ tùng, tích điểm thưởng",
      color: "#44494d",
      iconPath: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    },
    supplier:  {
      label: t("roleSupplier"),
      desc: lang === "zh" ? "销售配件，管理库存" : "Bán phụ tùng, quản lý kho hàng",
      color: "var(--ap-primary)",
      iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    },
    affiliate: {
      label: t("roleAffiliate"),
      desc: lang === "zh" ? "赚取10%直接佣金" : "Kiếm hoa hồng 10% trực tiếp",
      color: "var(--ap-primary)",
      iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    },
  };

  const provinces = ["An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh","Bến Tre","Bình Định","Bình Dương","Bình Phước","Bình Thuận","Cà Mau","Cần Thơ","Cao Bằng","Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh","Hải Dương","Hải Phòng","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang","TP. Hồ Chí Minh","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"];

  // Kiểm tra các trường ở Bước 2 theo DESIGN.md — trả về thông báo lỗi hoặc null
  const validateStep2 = (): string | null => {
    return validateField("name", form.name)
      || (form.phone ? validateField("phone", form.phone) : null)
      || validateField("email", form.email)
      || validateField("password", form.password);
  };

  const handleRegister = () => {
    const stepErr = validateStep2();
    if (stepErr) { setError(stepErr); return; }
    if (!captchaOk) { setError(lang === "zh" ? "请先完成验证码" : "Vui lòng xác minh CAPTCHA"); return; }
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, role }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? (lang === "zh" ? "注册失败" : "Đăng ký thất bại")); return; }
        // NCC/đại lý: chờ admin duyệt → KHÔNG auto-login, báo + chuyển về trang đăng nhập
        if (data.pending) {
          window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: data.message || "Đăng ký thành công! Tài khoản đang chờ duyệt.", type: "success" } }));
          setTimeout(() => { window.location.href = "/login"; }, 2200);
          return;
        }
        if (data.token) {
          const exp = new Date(Date.now() + 864e5).toUTCString();
          document.cookie = `ap_token=${data.token}; path=/; SameSite=Lax; expires=${exp}`;
        }
        if (data.user) setAuth(data.user);
        window.location.href = data.redirect ?? "/customer";
      } catch { setError(lang === "zh" ? "连接错误。请重试。" : "Lỗi kết nối. Vui lòng thử lại."); }
    });
  };

  const inputClass = "w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm text-[#44494d] placeholder-[#b3b3b3] outline-none bg-white transition-all";
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = "var(--ap-primary)";
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.target.style.borderColor = "#e5e5e5";

  const stepLabels = [
    lang === "zh" ? "账户类型" : "Loại tài khoản",
    lang === "zh" ? "个人信息" : "Thông tin",
    lang === "zh" ? "确认" : "Xác nhận"
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ap-page-bg)" }}>
      {/* Left red panel – hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[38%] relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, var(--ap-primary) 0%, var(--ap-primary-dark) 60%, var(--ap-primary-dark) 100%)" }}>
        <div className="absolute top-[-60px] right-[-60px] w-[220px] h-[220px] rounded-full bg-white/10" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[180px] h-[180px] rounded-full bg-white/10" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-14">
            <div className="bg-white px-3 py-1.5 rounded-[6px] shadow-sm inline-flex items-center justify-center"><LogoImage className="h-[32px] w-auto object-contain" /></div>
          </Link>

          <h1 className="text-3xl font-extrabold text-white leading-tight mb-4 whitespace-pre-wrap">
            {t('registerTitle')}
          </h1>
          <p className="text-white/65 text-sm leading-relaxed mb-10">
            {t('registerSubtitle')}
          </p>

          <div className="space-y-4">
            {[
              ["M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", t('roleSupplier'), lang === "zh" ? "直接对接韩、中、日工厂" : "Liên kết trực tiếp nhà máy Hàn, Trung, Nhật"],
              ["M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", t('roleAffiliate'), lang === "zh" ? "介绍每单赚10%佣金" : "Hoa hồng 10% mỗi đơn hàng giới thiệu"],
              ["M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z", t('roleCustomer'), lang === "zh" ? "每日限时特卖，积分换好礼" : "Flash Sale mỗi ngày, tích điểm đổi quà"],
            ].map(([iconPath, title, desc]) => (
              <div key={title} className="flex items-start gap-4 bg-white/10 rounded-xl p-4 transition-colors hover:bg-white/15">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/70 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs relative z-10">© 2024 AutoParts</p>
      </div>

      {/* Right: register form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:py-8 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <div className="bg-white px-3 py-1.5 rounded-[6px] shadow-sm inline-flex items-center justify-center"><LogoImage className="h-[32px] w-auto object-contain" /></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] overflow-hidden">
            {/* Header & Steps */}
            <div className="px-8 pt-8 pb-6 border-b border-[#f0f0f0]">
              {/* Step indicator */}
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0"
                      style={{
                        background: s < step ? "#22C55E" : s === step ? "var(--ap-primary)" : "var(--ap-page-bg)",
                        color: s <= step ? "#fff" : "#8f9294",
                      }}>
                      {s < step ? "✓" : s}
                    </div>
                    {s < 3 && (
                      <div className="flex-1 h-0.5 mx-2 rounded-full transition-all"
                        style={{ background: s < step ? "#22C55E" : "#e5e5e5" }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#1b1d1f]">
                    {step === 1 ? t("selectRole") : step === 2 ? (lang === "zh" ? "个人信息" : "Thông tin cá nhân") : (lang === "zh" ? "确认并创建账户" : "Xác nhận & Tạo tài khoản")}
                  </h2>
                  <p className="text-[#8f9294] text-sm mt-0.5">
                    {lang === "zh" ? "步骤" : "Bước"} {step}/3 — {stepLabels[step - 1]}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6">
              {error && (
                <div className="bg-[#fff0f2] border border-[#ffd0da] rounded-xl px-4 py-3 mb-5 text-sm text-[#1a4b97] flex items-center gap-2">
                  <span className="font-bold">✕</span> {error}
                </div>
              )}

              {/* Step 1: Role selection */}
              {step === 1 && (
                <div className="space-y-3">
                  {(Object.entries(roleConfig) as [typeof role, typeof roleConfig[typeof role]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setRole(key)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor: role === key ? cfg.color : "#e5e5e5",
                        background: role === key ? `${cfg.color}08` : "#fff",
                      }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        style={{ background: role === key ? cfg.color : "#f8f8fa" }}>
                        <svg className="w-5 h-5 transition-colors" style={{ color: role === key ? "#fff" : "#8f9294" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={cfg.iconPath} />
                        </svg>
                      </div>
                      <div className="flex-1 ml-2">
                        <p className="font-bold text-[#1b1d1f] text-sm">{cfg.label}</p>
                        <p className="text-xs text-[#8f9294] mt-0.5">{cfg.desc}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: role === key ? cfg.color : "#d0d0d0" }}>
                        {role === key && <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Personal info */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t('fullName')} *</label>
                    <input
                      maxLength={20}
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={lang === "zh" ? "客户A" : "Nguyễn Văn An"}
                      className={inputClass}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t('phone')}</label>
                    <input
                      type="tel" inputMode="numeric" maxLength={10} pattern="0[1-9][0-9]{8}"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: clampPhone(e.target.value) }))}
                      placeholder="09xxxxxxxx"
                      className={inputClass}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{lang === "zh" ? "省/市" : "Tỉnh / Thành phố"}</label>
                    <select
                      value={form.province}
                      onChange={e => setForm(p => ({ ...p, province: e.target.value }))}
                      className={inputClass}
                      onFocus={onFocus} onBlur={onBlur}>
                      <option value="">{lang === "zh" ? "选择省份..." : "Chọn tỉnh..."}</option>
                      {provinces.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  {(role === "supplier" || role === "affiliate") && (
                    <>
                      <div>
                        <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{lang === "zh" ? "企业名称" : "Tên doanh nghiệp"}</label>
                        <input
                          value={form.businessName}
                          onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))}
                          placeholder={lang === "zh" ? "输入企业名称..." : "Công ty TNHH..."}
                          className={inputClass}
                          onFocus={onFocus} onBlur={onBlur}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">
                          {lang === "zh" ? "税号" : "Mã số thuế"}
                        </label>
                        <input
                          value={form.taxCode}
                          onChange={e => setForm(p => ({ ...p, taxCode: e.target.value }))}
                          placeholder="0123456789"
                          className={inputClass + " font-mono"}
                          onFocus={onFocus} onBlur={onBlur}
                        />
                      </div>
                    </>
                  )}
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">Email *</label>
                    <input
                      type="email" maxLength={100}
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      className={inputClass}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t('passwordLabel')} *</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"} minLength={8}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder={lang === "zh" ? "至少8个字符" : "Ít nhất 8 ký tự"}
                        className={inputClass + " pr-14"}
                        onFocus={onFocus} onBlur={onBlur}
                      />
                      <button onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8f9294] hover:text-[#44494d] font-medium">
                        {showPass ? t('hidePassword') : t('showPassword')}
                      </button>
                    </div>
                    {/* Checklist mật khẩu mạnh — bắt buộc đủ mới đăng ký được */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                      {(() => {
                        const c = passwordChecks(form.password);
                        const items: [boolean, string][] = [
                          [c.len, lang === "zh" ? "至少8个字符" : "Tối thiểu 8 ký tự"],
                          [c.upper, lang === "zh" ? "1个大写字母" : "1 chữ in hoa (A-Z)"],
                          [c.lower, lang === "zh" ? "1个小写字母" : "1 chữ thường (a-z)"],
                          [c.digit, lang === "zh" ? "1个数字" : "1 chữ số (0-9)"],
                          [c.special, lang === "zh" ? "1个特殊字符" : "1 ký tự đặc biệt (!@#…)"],
                        ];
                        return items.map(([ok, label]) => (
                          <span key={label} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${ok ? "text-green-600" : "text-slate-400"}`}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              {ok ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /> : <circle cx="12" cy="12" r="8" strokeWidth="2" />}
                            </svg>
                            {label}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-5 rounded-xl border border-[#e5e5e5] bg-[#f8f8fa]">
                    <p className="text-xs font-bold text-[#8f9294] mb-4 uppercase tracking-wide">{lang === "zh" ? "确认信息" : "Xác nhận thông tin"}</p>
                    <div className="space-y-3">
                      {([
                        [lang === "zh" ? "账户类型" : "Loại tài khoản", roleConfig[role].label],
                        [t('fullName'), form.name || "—"],
                        [lang === "zh" ? "电话" : "SĐT", form.phone || "—"],
                        ["Email", form.email || "—"],
                        ...(form.businessName ? [[lang === "zh" ? "企业名称" : "Doanh nghiệp", form.businessName]] : []),
                        [lang === "zh" ? "省/市" : "Tỉnh/TP", form.province || "—"],
                      ] as [string, string][]).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-sm text-[#8f9294]">{k}</span>
                          <span className="text-sm font-semibold text-[#44494d]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 rounded accent-[#1a4b97] shrink-0"
                      style={{ accentColor: "var(--ap-primary)" }}
                    />
                    <span className="text-sm text-[#8f9294] leading-relaxed">
                      {t('agreeTerms')}{" "}
                      <Link href="/help" className="font-semibold hover:underline" style={{ color: "var(--ap-primary)" }}>{t('termsOfService')}</Link>
                      {" "}{t('and')}{" "}
                      <Link href="/help" className="font-semibold hover:underline" style={{ color: "var(--ap-primary)" }}>{t('privacyPolicy')}</Link>
                    </span>
                  </label>
                  <MathCaptcha onVerified={setCaptchaOk} />
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-8 pb-7 flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="px-6 py-3 border border-[#e5e5e5] rounded-xl font-semibold text-[#44494d] hover:bg-[#f8f8fa] transition-colors text-sm">
                  ← {t('back')}
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 2) { const err = validateStep2(); if (err) { setError(err); return; } setError(""); }
                  step < 3 ? setStep(s => s + 1) : handleRegister();
                }}
                disabled={isPending || (step === 3 && !captchaOk)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-60 text-sm"
                style={{ background: roleConfig[role].color }}
                onMouseEnter={e => !isPending && ((e.target as HTMLElement).style.filter = "brightness(0.9)")}
                onMouseLeave={e => !isPending && ((e.target as HTMLElement).style.filter = "")}>
                {isPending
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('loading')}</>
                  : step === 3 ? t('registerBtn') : t('next') + " →"}
              </button>
            </div>

            <div className="px-8 pb-6 text-center border-t border-[#f0f0f0] pt-4">
              <p className="text-sm text-[#8f9294]">
                {t('haveAccount')}{" "}
                <Link href="/login" className="font-bold hover:underline" style={{ color: "var(--ap-primary)" }}>{t('loginNow')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

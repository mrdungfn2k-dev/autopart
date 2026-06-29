"use client";
import { useState } from "react";
import Link from "next/link";
import { setAuth } from "@/lib/auth";
import LangSwitcher from "@/components/LangSwitcher";
import { useLang } from "@/lib/i18n";
import LogoImage from "@/components/LogoImage";
import MathCaptcha from "@/components/MathCaptcha";

export default function LoginPage() {
  const { t, lang } = useLang();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(false);
  const [code, setCode] = useState("");

  const fromUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("from") ?? ""
    : "";
  const errorParam = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("error") ?? ""
    : "";
  const errorMsg: Record<string, string> = {
    email: lang === "zh" ? "邮箱不存在" : "Email không tồn tại",
    password: lang === "zh" ? "密码错误" : "Mật khẩu không đúng",
    empty: lang === "zh" ? "请填写完整信息" : "Vui lòng nhập đầy đủ thông tin",
  };

  const demoAccounts = [
    { email: "admin@autopart.vn",  pw: "Admin@123",     label: "Admin",      color: "var(--ap-sidebar-bg)" },
    { email: "ncc@autopro.vn",     pw: "Supplier@123",  label: lang === "zh" ? "供应商" : "NCC",        color: "var(--ap-primary)" },
    { email: "daily@autopart.vn",  pw: "Affiliate@123", label: lang === "zh" ? "代理商" : "Affiliate",  color: "var(--ap-primary)" },
    { email: "kh@autopart.vn",     pw: "Customer@123",  label: lang === "zh" ? "客户" : "Khách hàng", color: "#44494d" },
  ];

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Vui lòng nhập đầy đủ thông tin"); return; }
    if (!captchaOk) { setError(lang === "zh" ? "请先完成验证码" : "Vui lòng xác minh mã CAPTCHA"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email: email.trim(), password, code: twoFAStep ? code.trim() : undefined }),
      });
      const data = await res.json();
      // Xác thực 2 yếu tố: cần nhập mã 6 số từ app Authenticator
      if (data.requires2FA) {
        setTwoFAStep(true);
        setError(!res.ok ? (data.error || "Mã không đúng") : "");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const msg = data.error ?? "Đăng nhập thất bại";
        setError(msg);
        // popup nổi (đặc biệt cho tài khoản bị khóa / chờ duyệt)
        window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: msg, type: data.code === "pending" ? "info" : "warning" } }));
        setLoading(false); return;
      }
      if (data.token) {
        const expires = new Date(Date.now() + 24 * 3600 * 1000).toUTCString();
        document.cookie = `ap_token=${data.token}; path=/; SameSite=Lax; expires=${expires}`;
      }
      if (data.user) setAuth(data.user);
      const dest = fromUrl && fromUrl.startsWith("/") ? fromUrl : (data.redirect ?? "/");
      window.location.href = dest;
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--ap-page-bg)" }}>
      {/* Left: Vipo Red branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[44%] relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, var(--ap-primary) 0%, var(--ap-primary-dark) 60%, var(--ap-primary-dark) 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "#fff" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full opacity-10"
          style={{ background: "#fff" }} />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-14">
            <div className="bg-white px-3 py-1.5 rounded-[6px] shadow-sm inline-flex items-center justify-center"><LogoImage className="h-[32px] w-auto object-contain" /></div>
          </Link>

          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight whitespace-pre-wrap">
            {t('platformTagline')}
          </h1>
          <p className="text-white/70 text-base mb-10 leading-relaxed">
            {t('platformDesc')}
          </p>

          <div className="space-y-4">
            {[
              t('featureOEM'),
              t('featureFlashSale'),
              t('featureVIN'),
              t('featureWarranty'),
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-bold shrink-0">✓</div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-xs relative z-10">{t('copyright')}</p>
      </div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="bg-white px-3 py-1.5 rounded-[6px] shadow-sm inline-flex items-center justify-center"><LogoImage className="h-[32px] w-auto object-contain" /></div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-8">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1b1d1f]">{t('loginTitle')}</h2>
                <p className="text-[#8f9294] text-sm mt-1">
                  {t('loginWelcome')}
                </p>
              </div>
              <LangSwitcher />
            </div>

            {(error || errorParam) && (
              <div className="bg-[#fff0f2] border border-[#ffd0da] rounded-xl px-4 py-3 mb-5 text-sm text-[#1a4b97] flex items-center gap-2">
                <span className="font-bold">✕</span>
                {error || errorMsg[errorParam] || (lang === 'zh' ? '登录失败' : 'Đăng nhập thất bại')}
              </div>
            )}

            {/* Quick demo fill buttons */}
            <div className="mb-6 p-4 bg-[#f8f8fa] rounded-xl border border-[#f0f0f0]">
              <p className="text-xs text-[#8f9294] mb-3 font-semibold uppercase tracking-wide">{t('demoAccounts')}</p>
              <div className="grid grid-cols-4 gap-2">
                {demoAccounts.map(a => (
                  <button key={a.label} type="button"
                    onClick={() => { setEmail(a.email); setPassword(a.pw); setError(""); }}
                    className="py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80 active:scale-95"
                    style={{ background: a.color }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t('emailLabel')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm text-[#44494d] placeholder-[#b3b3b3] outline-none transition-all"
                  style={{ background: "#fff" }}
                  onFocus={e => e.target.style.borderColor = "var(--ap-primary)"}
                  onBlur={e => e.target.style.borderColor = "#e5e5e5"}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t('passwordLabel')}</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder={lang === 'zh' ? '输入密码' : 'Nhập mật khẩu'}
                    className="w-full px-4 py-3 border border-[#e5e5e5] rounded-xl text-sm text-[#44494d] placeholder-[#b3b3b3] outline-none pr-16 transition-all"
                    style={{ background: "#fff" }}
                    onFocus={e => e.target.style.borderColor = "var(--ap-primary)"}
                    onBlur={e => e.target.style.borderColor = "#e5e5e5"}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8f9294] hover:text-[#44494d] font-medium">
                    {showPass ? t('hidePassword') : t('showPassword')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <MathCaptcha onVerified={setCaptchaOk} />
            </div>

            {twoFAStep && (
              <div className="mt-4">
                <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">Mã xác thực 2 yếu tố</label>
                <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric" maxLength={6} placeholder="Nhập mã 6 số" autoFocus
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-center text-lg font-bold tracking-widest focus:outline-none focus:border-[#1a4b97]" />
                <p className="text-xs text-[#8f9294] mt-1">Mở app Authenticator (Google/Microsoft) và nhập mã 6 số đang hiển thị.</p>
              </div>
            )}

            <button type="button" onClick={handleLogin} disabled={loading || !captchaOk || (twoFAStep && code.length !== 6)}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-white text-base transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "var(--ap-primary)" }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = "var(--ap-primary-dark)")}
              onMouseLeave={e => !loading && ((e.target as HTMLElement).style.background = "var(--ap-primary)")}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('checkingLogin')}</>
                : twoFAStep ? "Xác nhận đăng nhập" : t('loginBtn')}
            </button>

            <div className="mt-5 text-center">
              <Link href="/register" className="text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>
                {t('noAccount')} <span className="underline underline-offset-2">{t('registerNow')}</span>
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-[#b3b3b3] mt-4">
            {lang === 'zh' ? '登录即表示您同意 ' : 'Bằng cách đăng nhập bạn đồng ý với '}
            <Link href="/help" className="hover:text-[#1a4b97] transition-colors">{lang === 'zh' ? '服务条款' : 'Điều khoản sử dụng'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

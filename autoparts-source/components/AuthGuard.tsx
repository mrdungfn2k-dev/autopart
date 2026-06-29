"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth, clearAuth, routeRoles, type UserRole } from "@/lib/auth";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import LogoImage from "@/components/LogoImage";

export default function AuthGuard({
  children,
  requiredRoles,
}: {
  children: React.ReactNode;
  requiredRoles: UserRole[];
}) {
  const { t, fp, lang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    const user = getAuth();
    if (!user) {
      // Not logged in — redirect to login with return url
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!requiredRoles.includes(user.role)) {
      setStatus("denied");
      return;
    }
    setStatus("ok");
  }, [pathname, requiredRoles, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ap-page-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <LogoImage className="h-[20px] w-auto object-contain" />
          <div className="w-6 h-6 border-2 border-[#1a4b97] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8f9294] text-sm">{t('checkingLogin')}</p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--ap-page-bg)" }}>
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-10 max-w-sm w-full text-center shadow-lg">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEF2F2" }}>
            <span className="text-2xl font-bold text-red-500">✕</span>
          </div>
          <h2 className="text-xl font-bold text-[#44494d] mb-2">{t('accessDenied')}</h2>
          <p className="text-[#8f9294] text-sm mb-6">{t('accessDeniedDesc')}</p>
          <div className="flex gap-3">
            <Link href="/login"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white text-center"
              style={{ background: "var(--ap-primary)" }}>
              {t('loginAgain')}
            </Link>
            <Link href="/"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#e5e5e5] text-[#44494d] hover:bg-[#f8f8fa] text-center">
              {t('goHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


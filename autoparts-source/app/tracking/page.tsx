"use client";
import Link from "next/link";
import LangSwitcher from "@/components/LangSwitcher";
import { useLang } from "@/lib/i18n";
import LogoImage from "@/components/LogoImage";
import OrderTracker from "@/components/OrderTracker";

export default function TrackingPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e5] sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoImage className="h-[18px] w-auto object-contain" />
          </Link>
          <Link href="/customer/orders" className="text-sm text-[#8f9294] hover:text-[#1a4b97]">
            {"< "} {t('myOrders')}
          </Link>
          <LangSwitcher />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <OrderTracker />
      </div>
    </div>
  );
}

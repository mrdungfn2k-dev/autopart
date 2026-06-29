"use client";
import { useLang } from "@/lib/i18n";
import OrderTracker from "@/components/OrderTracker";

export default function CustomerTrackingPage() {
  const { t } = useLang();
  return (
    <main className="flex-1 overflow-auto">
      <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
        <div className="flex items-center px-6 h-14">
          <h1 className="text-lg font-bold text-[#44494d]">{t('trackOrder')}</h1>
        </div>
      </div>
      <div className="p-6">
        <OrderTracker />
      </div>
    </main>
  );
}

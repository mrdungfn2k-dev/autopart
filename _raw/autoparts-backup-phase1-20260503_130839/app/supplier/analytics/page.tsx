"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import SidebarControls from "@/components/SidebarControls";
import SupplierSidebar from "@/components/SupplierSidebar";

export default function SupplierAnalyticsPage() {
  const { t, fp, lang } = useLang();

  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const salesChartData = [
    { day: "T2", revenue: 22000000 }, { day: "T3", revenue: 38000000 },
    { day: "T4", revenue: 29000000 }, { day: "T5", revenue: 51000000 },
    { day: "T6", revenue: 33000000 }, { day: "T7", revenue: 47000000 }, { day: "CN", revenue: 41000000 },
  ];

  const conversionData = ["T10","T11","T12","T1","T2","T3"].map((month, i) => {
    const slice = products.slice(i * 2, i * 2 + 3);
    return {
      month,
      rate: Math.round(60 + slice.reduce((s: number, p: any) => s + p.rating, 0) / Math.max(slice.length, 1) * 4),
      orders: slice.reduce((s: number, p: any) => s + Math.round(p.sold / 6), 0),
    };
  });

  const _cl: Record<string, string> = {
    brakes: (lang === "zh" ? "制动" : "Phanh"),
    filters: "Nhớt + Lọc",
    ignition: (lang === "zh" ? "火花塞" : "Bugi"),
    batteries: (lang === "zh" ? "蓄电池" : "Ắcquy"),
  };
  const _sc: Record<string, number> = {};
  products.forEach((p: any) => { _sc[p.categoryId] = (_sc[p.categoryId] ?? 0) + p.sold; });
  const _st = Math.max(products.reduce((s: number, p: any) => s + p.sold, 0), 1);
  const _cc = ["var(--ap-primary)", "var(--ap-primary)", "#8B5CF6", "#22C55E", "#8f9294"];
  const categoryData = Object.entries(_sc).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([id, count], i) => ({
    name: _cl[id] ?? id,
    value: Math.round(count / _st * 100),
    color: _cc[i],
  })).concat([{
    name: "Khác",
    value: Math.max(1, 100 - Object.entries(_sc).sort((a, b) => b[1] - a[1]).slice(0, 4).reduce((s, [, cv]) => s + Math.round(cv / _st * 100), 0)),
    color: "#8f9294",
  }]);

  const topProducts = products.slice().sort((a: any, b: any) => b.sold - a.sold).slice(0, 5).map((p: any) => ({
    name: p.name,
    sku: p.oemCode,
    sold: p.sold,
    revenue: p.price * p.sold,
    trend: p.rating >= 4.7 ? `+${Math.round(p.rating * 4)}%` : `-${Math.round((5 - p.rating) * 2)}%`,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
      <SupplierSidebar active="/supplier/analytics" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <div>
              <h1 className="text-xl font-bold text-[#44494d]">{t('analyticsAndReports')}</h1>
              <p className="text-[#8f9294] text-xs">{t('analyticsDesc')}</p>
            </div>
            <div className="flex gap-2">
              {["7 ngày", "30 ngày", "3 tháng", "1 năm"].map(p => (
                <button key={p} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e5e5e5] text-slate-600 hover:bg-[#f8f8fa]">{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('totalRevenue'), value: fp(products.reduce((s: number, p: any) => s + p.price * p.sold, 0)), badge: `+${(products.filter((p: any) => p.sold > 100).length / Math.max(products.length, 1) * 25).toFixed(1)}%`, color: "#16A34A" },
              { label: t('successfulOrders'), value: products.reduce((s: number, p: any) => s + p.sold, 0).toLocaleString(), badge: `+${(products.reduce((s: number, p: any) => s + p.rating, 0) / Math.max(products.length, 1) * 3).toFixed(1)}%`, color: "var(--ap-primary)" },
              { label: t('conversionRate'), value: `${(products.reduce((s: number, p: any) => s + p.rating, 0) / Math.max(products.length, 1) * 17).toFixed(1)}%`, badge: "+2.1%", color: "#8B5CF6" },
              { label: t('averageRating'), value: `${(products.reduce((s: number, p: any) => s + p.rating, 0) / Math.max(products.length, 1)).toFixed(2)} / 5`, badge: "^0.1", color: "#F59E0B" },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-[#f0f0f0] p-5">
                <p className="text-xs font-semibold text-[#8f9294] uppercase mb-2">{k.label}</p>
                <p className="text-2xl font-bold text-[#44494d] mb-1">{k.value}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: k.color, background: `${k.color}18` }}>{k.badge} so tháng trước</span>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sales chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#f0f0f0] p-5">
              <h2 className="font-bold text-[#44494d] mb-4">{t('revenueByDay')}</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => [fp(Number(v)), t('revenue')]} contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                  <Bar dataKey="revenue" fill="var(--ap-primary)" radius={6} background={{ fill: "#FFF7ED" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
              <h2 className="font-bold text-[#44494d] mb-4">{t('byCategory')}</h2>
              <div className="space-y-3">
                {categoryData.map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#44494d]">{c.name}</span>
                      <span className="font-bold" style={{ color: c.color }}>{c.value}%</span>
                    </div>
                    <div className="h-2 bg-[#f4f4f4] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversion rate chart */}
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
            <h2 className="font-bold text-[#44494d] mb-4">{t('conversionRate6Months')}</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ap-page-bg)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8f9294" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                <Line type="monotone" dataKey="rate" stroke="var(--ap-primary)" strokeWidth={2} dot={{ fill: "var(--ap-primary)", r: 4 }} name={t('conversionRate')} />
                <Line type="monotone" dataKey="orders" stroke="var(--ap-primary)" strokeWidth={2} dot={{ fill: "var(--ap-primary)", r: 4 }} name={t('ordersCount')} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#44494d]">{t('top5SellingProducts')}</h2>
              <Link href="/supplier/products" className="text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>{t("viewAll")}</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-xs text-[#8f9294] font-semibold">
                  {[t('product').toUpperCase(), "SKU", t('sold').toUpperCase(), t('revenue').toUpperCase(), t('vsLastMonth').toUpperCase()].map(h => (
                    <th key={h} className="text-left py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-[#f8f8fa]">
                    <td className="py-3 font-medium text-[#44494d]">{p.name}</td>
                    <td className="py-3 font-mono text-xs text-[#8f9294]">{p.sku}</td>
                    <td className="py-3 font-bold text-[#44494d]">{p.sold}</td>
                    <td className="py-3 font-bold" style={{ color: "var(--ap-primary)" }}>{fp(p.revenue)}</td>
                    <td className="py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.trend.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{p.trend}</span>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-[#8f9294] text-sm">{t('noData')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
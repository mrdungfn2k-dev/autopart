"use client";
import { useState, useEffect, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { addToCart } from "@/lib/cartStore";
import { formatVndShort } from "@/lib/data";
import CustomerSidebar from "@/components/CustomerSidebar";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface OrderItem { id: string; name: string; qty: number; price: number; }
interface Order { id: string; userId: string; items: OrderItem[]; total: number; status: string; createdAt: string; tracking?: string; shipping?: { method?: string; city?: string }; }
interface Vehicle { id: string; brand: string; model: string; year: number; engine?: string; fuelType?: string; nickname?: string; }

const STATUS: Record<string, { vi: string; zh: string; color: string; bg: string }> = {
  pending:   { vi: "Chờ xác nhận", zh: "待确认", color: "#92400E", bg: "#FEF9C3" },
  confirmed: { vi: "Đã xác nhận", zh: "已确认", color: "#1D4ED8", bg: "#DBEAFE" },
  shipping:  { vi: "Đang giao",   zh: "运输中", color: "#C2410C", bg: "#FFF7ED" },
  delivered: { vi: "Đã giao",     zh: "已送达", color: "#166534", bg: "#F0FDF4" },
  cancelled: { vi: "Đã hủy",      zh: "已取消", color: "#991B1B", bg: "#FEE2E2" },
};

export default function CustomerDashboard() {
  const { t, fp, lang } = useLang();
  const router = useRouter();

  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [garage, setGarage] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getAuth());
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {});
    Promise.all([
      fetch("/api/orders").then(r => r.json()).catch(() => []),
      fetch("/api/garage").then(r => r.json()).catch(() => []),
      fetch("/api/products").then(r => r.json()).catch(() => []),
    ]).then(([o, g, p]) => {
      setOrders(Array.isArray(o) ? o : []);
      setGarage(Array.isArray(g) ? g : []);
      setProducts(Array.isArray(p) ? p : (p?.products ?? []));
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const valid = orders.filter(o => o.status !== "cancelled");
    const totalSpent = valid.reduce((s, o) => s + (o.total || 0), 0);
    const inTransit = orders.filter(o => o.status === "shipping").length;
    const tier = totalSpent >= 50_000_000 ? "Gold" : totalSpent >= 20_000_000 ? "Silver" : "Bronze";
    return { totalOrders: orders.length, inTransit, points: Math.floor(totalSpent / 10000), totalSpent, tier };
  }, [orders]);

  const activeOrders = orders.filter(o => ["pending", "confirmed", "shipping"].includes(o.status)).slice(0, 4);
  const history = orders.filter(o => o.status === "delivered").slice(0, 5);
  const recommend = products.slice(0, 3);
  const activeVehicle = garage[0];
  const chartData = orders.slice(0, 6).reverse().map(o => ({ name: o.id.replace(/^AP-?/, "#"), "Chi tiêu": (o.total || 0) }));

  function reorder(order: Order) {
    order.items.forEach(it => addToCart(it.id, it.qty, { id: it.id, name: it.name, price: it.price }));
    router.push("/cart");
  }
  function findParts(v: Vehicle) {
    router.push(`/search?q=${encodeURIComponent(`${v.brand} ${v.model}`)}`);
  }
  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  }

  const name = user?.name || (lang === "en" ? "Customer" : lang === "zh" ? "客户" : "Khách hàng");
  const initials = name.split(" ").map(w => w[0]).filter(Boolean).slice(-2).join("").toUpperCase() || "KH";

  return (
    <>
      <main className="flex-1 overflow-auto">{/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-xl font-bold text-[#44494d]">{t("customerDashboard") || "Tổng quan"}</h1>
            <div className="flex items-center gap-3">
              <form onSubmit={doSearch} className="hidden md:block">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang === "en" ? "Search parts, orders..." : lang === "zh" ? "搜索配件、订单..." : "Tìm kiếm phụ tùng, đơn hàng..."}
                  className="w-64 px-4 py-2 rounded-lg text-sm text-[#44494d] outline-none"
                  style={{ background: "#f8f8fa", border: "1px solid #E2E8F0" }}
                />
              </form>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#44494d]">{name}</p>
                  <p className="text-xs font-bold" style={{ color: "var(--ap-primary)" }}>{stats.tier.toUpperCase()} MEMBER</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a4b97] to-[#0d2d5e] flex items-center justify-center text-white font-bold text-sm">{initials}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">{/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
              <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide mb-3">{t("customerRewards") || "Điểm thưởng"}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: "#F59E0B" }}>{stats.points.toLocaleString("vi-VN")}</p>
            </div>
            <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
              <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide mb-3">{lang === "en" ? "Total Orders" : lang === "zh" ? "总订单" : "Tổng đơn hàng"}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--ap-primary)" }}>{stats.totalOrders}</p>
            </div>
            <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
              <p className="text-xs font-semibold text-[#8f9294] uppercase tracking-wide mb-3">{lang === "en" ? "In Transit" : lang === "zh" ? "运输中" : "Đang vận chuyển"}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--ap-primary)" }}>{stats.inTransit}</p>
            </div>
            <div className="rounded-xl p-5 text-white" style={{ background: "linear-gradient(135deg, var(--ap-primary), #EA580C)" }}>
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wide mb-3">{lang === "en" ? "Membership Tier" : lang === "zh" ? "会员等级" : "Hạng thành viên"}</p>
              <p className="text-2xl font-bold tracking-tight">{stats.tier}</p>
            </div>
          </div>{chartData.length > 0 && (
            <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
              <h2 className="font-bold text-[#44494d] mb-4">{lang === "en" ? "Spend Overview" : lang === "zh" ? "支出概览" : "Chi tiêu theo đơn hàng"}</h2>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8f9294" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#8f9294" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v: any) => formatVndShort(Number(v))} />
                    <Tooltip cursor={{ fill: "rgba(26,75,151,.06)" }} formatter={(v: any) => [formatVndShort(Number(v)), "Chi tiêu"]} />
                    <Bar dataKey="Chi tiêu" fill="var(--ap-primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>)}

          <div className="grid lg:grid-cols-3 gap-6">{/* Active orders + history */}
            <div className="lg:col-span-2 ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#44494d]">{lang === "en" ? "Active Orders" : lang === "zh" ? "处理中的订单" : "Theo dõi đơn hàng đang xử lý"}</h2>
                <Link href="/customer/orders" style={{ color: "var(--ap-primary)" }} className="text-sm font-semibold">{t("viewAll") || "Xem tất cả"}</Link>
              </div>{activeOrders.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#8f9294]">{lang === "en" ? "No active orders" : lang === "zh" ? "暂无处理中的订单" : "Chưa có đơn hàng đang xử lý"}
                  <div className="mt-3"><Link href="/products" className="px-4 py-2 rounded-lg text-xs font-semibold text-white inline-block" style={{ background: "var(--ap-primary)" }}>{lang === "en" ? "Shop Now" : lang === "zh" ? "去购物" : "Mua sắm ngay"}</Link></div>
                </div>) : (
                <div className="space-y-3 mb-5">{activeOrders.map(order => {
                    const st = STATUS[order.status] ?? STATUS.pending;
                    return (
                      <Link key={order.id} href="/customer/orders" className="flex items-center justify-between p-4 rounded-xl hover:brightness-95 transition" style={{ background: "#f8f8fa" }}>
                        <div>
                          <p className="font-semibold text-[#44494d] text-sm">{order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}</p>
                          <p className="text-xs text-[#8f9294]">{lang === "en" ? "Order" : lang === "zh" ? "订单" : "Đơn"} {order.id} • {order.shipping?.city || order.tracking || ""}</p>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>{lang === "zh" ? st.zh : st.vi}</span>
                      </Link>);
                  })}
                </div>)}

              <h3 className="font-bold text-[#44494d] mb-3">{lang === "en" ? "Purchase History" : lang === "zh" ? "购买记录" : "Lịch sử mua hàng"}</h3>{history.length === 0 ? (
                <p className="text-sm text-[#8f9294] py-4">{lang === "en" ? "No completed orders" : lang === "zh" ? "暂无已完成订单" : "Chưa có đơn đã hoàn thành"}</p>) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[#8f9294]">
                      <th className="text-left pb-2">{lang === "en" ? "PRODUCT" : lang === "zh" ? "产品" : "SẢN PHẨM"}</th>
                      <th className="text-left pb-2">{lang === "en" ? "DATE" : lang === "zh" ? "日期" : "NGÀY MUA"}</th>
                      <th className="text-left pb-2">{lang === "en" ? "PRICE" : lang === "zh" ? "价格" : "GIÁ"}</th>
                      <th className="text-left pb-2">{lang === "en" ? "ACTION" : lang === "zh" ? "操作" : "HÀNH ĐỘNG"}</th>
                    </tr>
                  </thead>
                  <tbody>{history.map(order => (
                      <tr key={order.id} className="border-t border-slate-50">
                        <td className="py-3">
                          <p className="font-medium text-[#44494d] text-xs">{order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ""}</p>
                          <p className="text-[#8f9294] text-xs font-mono">{order.id}</p>
                        </td>
                        <td className="py-3 text-[#8f9294] text-xs">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="py-3 font-bold text-[#44494d]">{fp(order.total)}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button onClick={() => reorder(order)} className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--ap-primary)" }}>{lang === "en" ? "Reorder" : lang === "zh" ? "再次购买" : "Mua lại"}</button>
                            <Link href="/customer/reviews" className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#e5e5e5] text-slate-600">{lang === "en" ? "Review" : lang === "zh" ? "评价" : "Đánh giá"}</Link>
                          </div>
                        </td>
                      </tr>))}
                  </tbody>
                </table>)}
            </div>{/* Right panel */}
            <div className="space-y-5">{/* My Garage */}
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#44494d]">{t("customerGarage") || "Gara của tôi"}</h2>
                  <Link href="/customer/garage" className="text-xs font-semibold" style={{ color: "var(--ap-primary)" }}>+ {lang === "en" ? "Add Vehicle" : lang === "zh" ? "添加车辆" : "Thêm xe"}</Link>
                </div>{garage.length === 0 ? (
                  <p className="text-sm text-[#8f9294] py-2">{lang === "en" ? "No vehicles in garage" : lang === "zh" ? "尚未添加车辆" : "Chưa có xe nào trong gara"}</p>) : garage.map((car, i) => (
                  <div key={car.id} className={`p-4 rounded-xl mb-3 ${i === 0 ? "border-2" : "border border-[#f0f0f0]"}`}
                    style={i === 0 ? { borderColor: "var(--ap-primary)", background: "#FFF7ED" } : { background: "#f8f8fa" }}>{i === 0 && <p className="text-xs font-bold text-[#1a4b97] mb-2">{lang === "en" ? "FILTERING BY VEHICLE" : lang === "zh" ? "当前筛选车辆" : "ĐANG LỌC THEO XE"}</p>}
                    <p className="font-bold text-[#44494d]">{car.year} {car.brand} {car.model}</p>
                    <p className="text-xs text-[#8f9294] mb-2">{car.engine || car.fuelType || ""}</p>{i === 0
                      ? <button onClick={() => findParts(car)} className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{ background: "var(--ap-primary)" }}>{lang === "en" ? "Find parts for this vehicle" : lang === "zh" ? "查找该车配件" : "Tìm phụ tùng cho xe này"}</button>: <button onClick={() => findParts(car)} className="text-xs text-[#1a4b97] font-medium">{lang === "en" ? "View this vehicle" : lang === "zh" ? "查看该车" : "Xem xe này"} &rsaquo;</button>}
                  </div>))}
              </div>{/* Recommendations from real products */}
              {recommend.length > 0 && (
                <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
                  <h2 className="font-bold text-[#44494d] mb-3">{lang === "en" ? "Recommended for you" : lang === "zh" ? "为您推荐" : "Gợi ý cho bạn"}</h2>
                  <div className="space-y-3">{recommend.map(r => (
                      <Link key={r.id} href={`/products/${r.id}`} className="flex items-center gap-3 hover:bg-[#f8f8fa] p-1.5 rounded-lg transition">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-[#8f9294] shrink-0" style={{ background: "#f8f8fa" }}>PT</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#44494d] truncate">{lang === "zh" ? (r.nameZh ?? r.name) : r.name}</p>
                          <p className="text-xs text-[#8f9294] truncate">{lang === "zh" ? (r.descZh ?? r.desc ?? "") : (r.desc ?? "")}</p>
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color: "var(--ap-primary)" }}>{fp(r.price)}</span>
                      </Link>))}
                  </div>
                  <Link href="/products" className="block text-center w-full mt-3 py-2 text-xs font-semibold border border-[#e5e5e5] rounded-lg text-slate-600 hover:bg-[#f8f8fa]">{lang === "en" ? "View all products" : lang === "zh" ? "查看全部" : "Xem tất cả sản phẩm"}</Link>
                </div>)}

              {/* Support */}
              <div className="ap-card bg-white rounded-xl border border-[#f0f0f0] p-5">
                <h2 className="font-bold text-[#44494d] mb-3">{lang === "en" ? "Support & Help" : lang === "zh" ? "支持与帮助" : "Hỗ trợ & Trợ giúp"}</h2>
                <div className="space-y-1">
                  <Link href="/customer/warranty" className="block p-2.5 rounded-xl hover:bg-[#f8f8fa] transition-colors">
                    <p className="text-sm font-semibold text-[#44494d]">{lang === "en" ? "Warranty Claim" : lang === "zh" ? "保修申请" : "Yêu cầu bảo hành"}</p>
                    <p className="text-xs text-[#8f9294]">{lang === "en" ? "Submit defective product claim" : lang === "zh" ? "提交产品故障投诉" : "Gửi khiếu nại sản phẩm lỗi"}</p>
                  </Link>
                  <Link href="/support" className="block p-2.5 rounded-xl hover:bg-[#f8f8fa] transition-colors">
                    <p className="text-sm font-semibold text-[#44494d]">{lang === "en" ? "Contact Support" : lang === "zh" ? "联系支持" : "Liên hệ hỗ trợ"}</p>
                    <p className="text-xs text-[#8f9294]">{lang === "en" ? "Avg response: 2 mins" : lang === "zh" ? "平均响应：2分钟" : "Phản hồi trung bình: 2 phút"}</p>
                  </Link>
                  <Link href="/help" className="block p-2.5 rounded-xl hover:bg-[#f8f8fa] transition-colors">
                    <p className="text-sm font-semibold text-[#44494d]">{lang === "en" ? "Installation Guide" : lang === "zh" ? "安装指南" : "Hướng dẫn lắp đặt"}</p>
                    <p className="text-xs text-[#8f9294]">{lang === "en" ? "Step-by-step DIY video" : lang === "zh" ? "分步 DIY 视频" : "Video DIY từng bước"}</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>);
}


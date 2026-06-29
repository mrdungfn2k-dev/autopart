"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import CustomerSidebar from "@/components/CustomerSidebar";

interface Review {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const STORAGE_KEY = "ap_reviews_customer";

function loadReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`text-2xl transition-colors ${(hover || value) >= star ? "text-yellow-400" : "text-gray-200"}`}>
          ★
        </button>
      ))}
    </div>
  );
}

const STATUS_CONFIG = {
  pending:  { color: "bg-yellow-100 text-yellow-700" },
  approved: { color: "bg-green-100 text-green-700"  },
  rejected: { color: "bg-red-100 text-red-700"      },
};

export default function CustomerReviewsPage() {
  const { t, lang } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: "", productName: "", rating: 5, title: "", content: "" });
  const [orders, setOrders] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setReviews(loadReviews());
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const deliveredOrders = orders.filter(o => o.status === "delivered");
  // Get unique products from delivered orders
  const purchasedProducts: { id: string; name: string }[] = [];
  deliveredOrders.forEach(o => {
    (o.items || []).forEach((item: any) => {
      if (!purchasedProducts.find(p => p.id === item.id)) {
        purchasedProducts.push({ id: item.id || item.name, name: item.name });
      }
    });
  });

  const handleSubmit = () => {
    if (!form.productName.trim() || !form.content.trim() || form.rating < 1) return;
    const review: Review = {
      id: "REV-" + Date.now(),
      productId: form.productId || form.productName,
      productName: form.productName,
      rating: form.rating,
      title: form.title,
      content: form.content,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [review, ...reviews];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setReviews(updated);
    setShowForm(false);
    setForm({ productId: "", productName: "", rating: 5, title: "", content: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
      <CustomerSidebar active="/customer/reviews" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-[#e5e5e5] z-10">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-lg font-bold text-[#44494d]">{t("customerReviews")}</h1>
            <button onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: "var(--ap-primary)" }}>
              + {t("writeReview")}
            </button>
          </div>
        </div>

        <div className="p-6 max-w-3xl">
          {submitted && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
              ✓ {lang === "zh" ? "评价已提交，审核通过后将公开显示" : "Đánh giá đã gửi, sẽ hiển thị sau khi được duyệt"}
            </div>
          )}

          {/* Write review form */}
          {showForm && (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mb-5">
              <h2 className="font-bold text-[#44494d] mb-5">{t("writeReview")}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">
                    {lang === "zh" ? "选择产品 *" : "Sản phẩm đã mua *"}
                  </label>
                  {purchasedProducts.length > 0 ? (
                    <select value={form.productId}
                      onChange={e => {
                        const prod = purchasedProducts.find(p => p.id === e.target.value);
                        setForm(f => ({ ...f, productId: e.target.value, productName: prod?.name || "" }));
                      }}
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] bg-white">
                      <option value="">{lang === "zh" ? "选择产品..." : "Chọn sản phẩm..."}</option>
                      {purchasedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  ) : (
                    <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                      placeholder={lang === "zh" ? "输入产品名称..." : "Nhập tên sản phẩm..."}
                      className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-2 block">
                    {lang === "zh" ? "评分 *" : "Đánh giá sao *"}
                  </label>
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t("reviewTitle")}</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={lang === "zh" ? "用一句话描述您的评价..." : "Tóm tắt đánh giá của bạn..."}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97]" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#44494d] mb-1.5 block">{t("reviewContent")} *</label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={4} placeholder={lang === "zh" ? "分享您对产品质量、使用体验的看法..." : "Chia sẻ trải nghiệm sử dụng sản phẩm, chất lượng, lắp đặt..."}
                    className="w-full px-4 py-2.5 border border-[#e5e5e5] rounded-xl text-sm focus:outline-none focus:border-[#1a4b97] resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
                  style={{ background: "var(--ap-primary)" }}>
                  {t("submitReview")}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm border border-[#e5e5e5] text-[#44494d]">
                  {t("cancel")}
                </button>
              </div>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 && !showForm ? (
            <div className="bg-white rounded-2xl border border-[#f0f0f0] p-14 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <p className="font-semibold text-[#44494d] mb-2">
                {lang === "zh" ? "您还没有提交过评价" : "Bạn chưa có đánh giá nào"}
              </p>
              <p className="text-sm text-[#8f9294]">
                {lang === "zh" ? "购买产品后分享您的使用体验" : "Sau khi mua hàng, hãy chia sẻ trải nghiệm của bạn"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => {
                const cfg = STATUS_CONFIG[r.status];
                const d = new Date(r.createdAt);
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-[#f0f0f0] p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#44494d] text-sm">{r.productName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                          <span className="text-xs text-[#8f9294]">{d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
                        {t(`review${r.status.charAt(0).toUpperCase() + r.status.slice(1)}` as any)}
                      </span>
                    </div>
                    {r.title && <p className="font-semibold text-[#44494d] text-sm mb-1">{r.title}</p>}
                    <p className="text-sm text-[#44494d] leading-relaxed">{r.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

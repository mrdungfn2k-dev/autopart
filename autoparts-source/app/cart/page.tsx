"use client";
import { useLang } from "@/lib/i18n";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getCart } from "@/lib/cartStore";
import StorefrontHeader from "@/components/StorefrontHeader";
import LogoImage from "@/components/LogoImage";
import VoucherSelectorModal from "@/components/VoucherSelectorModal";
import { saveSelectedIds, saveSelectedVouchers, getSelectedVouchers } from "@/lib/cartStore";
import { getAuth, BUYER_ROLES } from "@/lib/auth";
import { confirmDialog } from "@/components/ConfirmDialog";

export default function CartPage() {
  const { t, fp, lang } = useLang();

  // ── Role check ──────────────────────────────────────────────────────
  const authUser = getAuth();
  const userRole = authUser?.role;
  const canBuy = !userRole || BUYER_ROLES.includes(userRole);
  const roleLabel = userRole === "admin" ? (lang === "zh" ? "管理员" : "Quản trị viên") : (lang === "zh" ? "供应商" : "Nhà cung cấp");

  const [cart, setCart] = useState<Array<any & { qty: number }>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Load cart ──────────────────────────────────────────────────────
  useEffect(() => {
    const stored = getCart();
    
    // Load previously selected vouchers if any
    const sv = getSelectedVouchers();
    setSelectedFreeshipCode(sv.freeship);
    setSelectedDiscountCode(sv.discount);

    // Fetch vouchers for local processing
    fetch("/api/vouchers").then(r => r.json()).then(setAllVouchers).catch(() => {});

    if (stored.length === 0) return;

    const hasFullData = stored.every((item: any) => item.name && item.price);
    if (hasFullData) {
      setCart(stored as Array<any & { qty: number }>);
      setSelectedIds(new Set(stored.map((i: any) => i.id)));
    } else {
      fetch("/api/products")
        .then(r => r.json())
        .then(prods => {
          if (!Array.isArray(prods)) return;
          const items = stored.map((c: any) => {
            if (c.name && c.price) return c;
            const prod = prods.find((p: any) => p.id === c.id);
            return prod ? { ...prod, qty: c.qty } : null;
          }).filter(Boolean) as Array<any & { qty: number }>;
          setCart(items);
          setSelectedIds(new Set(items.map(i => i.id)));
          localStorage.setItem("autopart_cart", JSON.stringify(items));
        })
        .catch(() => {
          setCart(stored as Array<any & { qty: number }>);
          setSelectedIds(new Set(stored.map((i: any) => i.id)));
        });
    }
  }, []);

  // ── Selection helpers ──────────────────────────────────────────────
  const isAllSelected = cart.length > 0 && cart.every(i => selectedIds.has(i.id));
  const isNoneSelected = cart.every(i => !selectedIds.has(i.id));

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cart.map(i => i.id)));
    }
  };

  // ── Voucher ────────────────────────────────────────────────────────
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedFreeshipCode, setSelectedFreeshipCode] = useState<string | null>(null);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<string | null>(null);
  const [allVouchers, setAllVouchers] = useState<any[]>([]);

  const discount = 0;
  const shippingFee = 35000;
  const userTier = "";

  // Calculate from SELECTED items only (Shopee-style)
  const selectedItems = cart.filter(i => selectedIds.has(i.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price ?? 0) * item.qty, 0);
  const discountAmount = Math.round(subtotal * discount);

  let freeshipDiscountValue = 0;
  let voucherDiscountValue = 0;

  if (selectedFreeshipCode) {
    const v = allVouchers.find(x => x.code === selectedFreeshipCode);
    if (v && subtotal >= v.minOrder) freeshipDiscountValue = shippingFee; // Max 35k
  }
  if (selectedDiscountCode) {
    const v = allVouchers.find(x => x.code === selectedDiscountCode);
    if (v && subtotal >= v.minOrder) {
      voucherDiscountValue = v.type === "percent" ? Math.round(subtotal * v.value / 100) : v.value;
    }
  }

  const calculatedShippingFee = Math.max(0, shippingFee - freeshipDiscountValue);
  const total = subtotal - discountAmount - voucherDiscountValue + calculatedShippingFee;

  const handleApplyVouchers = (fs: string | null, d: string | null) => {
    setSelectedFreeshipCode(fs);
    setSelectedDiscountCode(d);
    setShowVoucherModal(false);
  };
  
  const proceedToCheckout = () => {
    // Save to sync with checkout logic
    saveSelectedIds(Array.from(selectedIds));
    saveSelectedVouchers({ freeship: selectedFreeshipCode, discount: selectedDiscountCode });
  };

  // ── Cart mutation helpers ──────────────────────────────────────────
  const CART_KEY = "autopart_cart";

  const changeQty = (id: string, delta: number) => {
    setCart(prev => {
      const next = prev.map(i => {
        if (i.id !== id) return i;
        // Chặn trên theo tồn kho (nếu biết), trần an toàn 999; chặn dưới 1
        const maxQty = typeof i.stock === "number" && i.stock > 0 ? i.stock : 999;
        const wanted = i.qty + delta;
        if (wanted > maxQty) {
          window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: `Chỉ còn ${maxQty} sản phẩm trong kho`, type: "warning" } }));
          return { ...i, qty: maxQty };
        }
        return { ...i, qty: Math.max(1, wanted) };
      });
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      setTimeout(() => window.dispatchEvent(new Event("cart-update")), 0);
      return next;
    });
  };

  const remove = (id: string) => {
    setCart(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      setTimeout(() => window.dispatchEvent(new Event("cart-update")), 0);
      return next;
    });
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  // Xóa đã chọn — CHỈ xóa items đang được tick, hỏi xác nhận trước (mặc định giỏ đang tick tất cả)
  const removeSelected = async () => {
    const n = selectedIds.size;
    if (n === 0) return;
    const ok = await confirmDialog(
      n === cart.length
        ? `Xóa TẤT CẢ ${n} sản phẩm khỏi giỏ hàng? (Nếu chỉ muốn xóa một vài món, hãy bỏ tick các món muốn giữ lại trước)`
        : `Xóa ${n} sản phẩm đã chọn khỏi giỏ hàng?`,
      { confirmText: "Xóa", danger: true }
    );
    if (!ok) return;
    setCart(prev => {
      const next = prev.filter(item => !selectedIds.has(item.id));
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      setTimeout(() => window.dispatchEvent(new Event("cart-update")), 0);
      return next;
    });
    setSelectedIds(new Set());
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: `Đã xóa ${n} sản phẩm khỏi giỏ`, type: "info" } }));
  };

  // ── Utilities ──────────────────────────────────────────────────────
  const getSwatch = (img: string) => {
    const m: Record<string, { bg: string; color: string; label: string }> = {
      "brake-pad":  { bg: "#FEE2E2", color: "#DC2626", label: "Phanh" },
      "oil-filter": { bg: "#FEF9C3", color: "#92400E", label: "Lọc" },
      "spark-plug": { bg: "#EDE9FE", color: "#6D28D9", label: "Bugi" },
      "battery":    { bg: "#DBEAFE", color: "#1D4ED8", label: "Pin" },
      "engine-oil": { bg: "#44494d", color: "#8f9294", label: "Nhớt" },
    };
    return m[img] ?? { bg: "var(--ap-page-bg)", color: "#475569", label: "PT" };
  };

  const typeColors: Record<string, string> = {
    OEM: "bg-green-100 text-green-700",
    OES: "bg-blue-100 text-blue-700",
    Generic: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />

      <div className="ap-container py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/" className="text-[#8f9294] hover:text-[#1a4b97]">Trang chủ</Link>
          /
          <span className="text-[#44494d] font-medium">Giỏ hàng</span>
        </div>

        <h1 className="text-2xl font-bold text-[#44494d] mb-6">{t("cartTitle")}</h1>

        {/* Role restriction warning */}
        {!canBuy && (
          <div className="mb-4 p-4 rounded-xl border-2 flex items-start gap-3" style={{ borderColor: "var(--ap-primary)", background: "#eff4fc" }}>
            <span className="mt-1" style={{ color: "var(--ap-primary)" }}>
              {userRole === "admin" ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M13 18h1"/><path d="M9 18h1"/></svg>
              )}
            </span>
            <div>
              <p className="font-bold text-[#44494d] text-sm">
                {lang === "en"
                  ? `You are logged in as「${roleLabel}」— cannot checkout`
                  : `Bạn đang đăng nhập với vai trò「${roleLabel}」— không thể thanh toán`}
              </p>
              <p className="text-xs text-[#607080] mt-1">
                {lang === "en"
                  ? "Please log out and use a Customer or Affiliate account to shop."
                  : "Vui lòng đăng xuất và sử dụng tài khoản Khách hàng hoặc Cộng tác viên để mua hàng."}
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Cart items */}
          <div className="lg:col-span-2 space-y-3">

            {/* Select-all header */}
            {cart.length > 0 && (
              <div className="bg-white rounded-xl px-4 py-3 border border-[#e5e5e5] flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                  {lang === "zh"
                    ? `全选 (${selectedIds.size}/${cart.length} 件)`
                    : `Chọn tất cả (${selectedIds.size}/${cart.length} sản phẩm)`}
                </label>
                <button
                  onClick={removeSelected}
                  disabled={isNoneSelected}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {lang === "zh" ? "删除已选" : "Xóa đã chọn"}
                </button>
              </div>
            )}

            {/* Empty state */}
            {cart.length === 0 && (
              <div className="bg-white rounded-xl border border-[#e5e5e5] p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                </div>
                <p className="font-semibold text-slate-600 mb-2">{lang === "zh" ? "购物车为空" : "Giỏ hàng trống"}</p>
                <Link href="/products" className="text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>
                  {lang === "zh" ? "继续购物 →" : "Tiếp tục mua sắm →"}
                </Link>
              </div>
            )}

            {/* Items */}
            {cart.map(item => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4 transition-all ${isSelected ? "border-[#e5e5e5]" : "border-[#f0f0f0] opacity-60"}`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1 w-4 h-4 accent-orange-500 cursor-pointer shrink-0"
                    />
                    {/* Image placeholder */}
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#f8f8fa" }}>
                      <span style={{ background: getSwatch(item.image).bg, color: getSwatch(item.image).color, fontSize: "10px", fontWeight: "bold", padding: "3px 5px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                        {getSwatch(item.image).label}
                      </span>
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[#44494d] text-sm mb-1 truncate">{lang === "zh" ? (item.nameZh || item.name) : item.name ?? "—"}</h3>
                          <p className="text-xs font-mono text-[#8f9294] mb-2">Mã OEM: {item.oemCode ?? "—"}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${typeColors[item.type] ?? "bg-[#f4f4f4] text-slate-600"}`}>
                            {item.type === "OEM" ? "HÀNG CHÍNH HÃNG" : item.type === "OES" ? "TƯƠNG THÍCH HOÀN TOÀN" : (lang === "zh" ? "副厂" : "AFTERMARKET")}
                          </span>
                        </div>
                        <button
                          onClick={() => remove(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors shrink-0 text-lg leading-none ml-2"
                          title="Xóa sản phẩm"
                        >✕</button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        {/* Qty */}
                        <div className="flex items-center border border-[#e5e5e5] rounded-lg overflow-hidden">
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            className="px-3 py-1.5 hover:bg-[#f4f4f4] transition-colors text-slate-600 font-bold"
                          >−</button>
                          <span className="px-4 py-1.5 text-sm font-semibold text-[#44494d] border-x border-[#e5e5e5]">{item.qty}</span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            className="px-3 py-1.5 hover:bg-[#f4f4f4] transition-colors text-slate-600 font-bold"
                          >+</button>
                        </div>
                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-bold" style={{ color: "var(--ap-primary)" }}>
                            {fp((item.price ?? 0) * item.qty)}
                          </div>
                          {item.originalPrice && (
                            <div className="text-xs text-[#8f9294] line-through">{fp(item.originalPrice * item.qty)}</div>
                          )}
                          {item.originalPrice && item.price && (
                            <div className="text-xs" style={{ color: "var(--ap-primary)" }}>
                              -{((1 - item.price / item.originalPrice) * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#e5e5e5] p-5 sticky top-20">
              <h2 className="font-bold text-[#44494d] mb-4">{t("orderSummary")}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8f9294]">
                    {lang === "zh" ? `已选 ${selectedIds.size} 件` : `Đã chọn ${selectedIds.size} sản phẩm`}
                  </span>
                  <span className="font-medium">{fp(subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Chiết khấu Đại lý ({userTier})</span>
                  <span className="font-semibold">-{fp(discountAmount)}</span>
                </div>
                {freeshipDiscountValue > 0 && selectedIds.size > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{lang === "zh" ? "免运费" : "Miễn phí vận chuyển"}</span>
                    <span>-{fp(freeshipDiscountValue)}</span>
                  </div>
                )}
                {voucherDiscountValue > 0 && selectedIds.size > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{lang === "zh" ? "优惠券" : "Autoparts Voucher"}</span>
                    <span>-{fp(voucherDiscountValue)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#8f9294]">{lang === "zh" ? "运费" : "Phí vận chuyển"}</span>
                  <span>{selectedIds.size > 0 ? (calculatedShippingFee === 0 ? "Miễn phí" : fp(calculatedShippingFee)) : fp(0)}</span>
                </div>
              </div>

              {/* Voucher Selector (Shopee Style) */}
              <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                <button 
                  onClick={() => setShowVoucherModal(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[#e5e5e5] hover:border-[#1a4b97] hover:bg-[#f8f8fa] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a4b97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                    <span className="text-sm font-semibold text-[#44494d]">Autoparts Voucher</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#8f9294]">
                    {(selectedFreeshipCode || selectedDiscountCode) 
                      ? <span className="text-orange-500 font-bold">Đã chọn {(selectedFreeshipCode ? 1 : 0) + (selectedDiscountCode ? 1 : 0)} mã</span> 
                      : <span>Chọn hoặc nhập mã</span>
                    }
                    <span>→</span>
                  </div>
                </button>
              </div>

              {/* Total */}
              <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[#8f9294]">TỔNG THANH TOÁN</p>
                    <p className="text-xs text-[#8f9294]">(Đã bao gồm VAT)</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: "var(--ap-primary)" }}>{fp(total)}</span>
                </div>
              </div>

              {canBuy ? (
                <Link
                  href="/checkout"
                  onClick={proceedToCheckout}
                  className={`block w-full mt-4 py-3.5 rounded-xl text-white font-bold text-base shadow-lg text-center transition-all ${selectedIds.size > 0 ? "hover:opacity-90" : "opacity-50 pointer-events-none"}`}
                  style={{ background: "var(--ap-primary)" }}
                >
                  {`THANH TOÁN ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""} →`}
                </Link>
              ) : (
                <div className="mt-4">
                  <div
                    className="block w-full py-3.5 rounded-xl text-white font-bold text-base text-center opacity-50 cursor-not-allowed"
                    style={{ background: "#9CA3AF" }}
                  >
                    {lang === "zh" ? "无法结算" : "KHÔNG THỂ THANH TOÁN"}
                  </div>
                  <p className="text-center text-xs text-amber-600 mt-2 font-medium">
                    {lang === "zh" ? `「${roleLabel}」角色不允许购买` : `Vai trò「${roleLabel}」không được phép mua hàng`}
                  </p>
                </div>
              )}
              <p className="text-center text-xs text-[#8f9294] mt-2">Thanh toán an toàn &amp; bảo mật</p>
            </div>

            {/* Garage */}
            <div className="bg-white rounded-xl border border-orange-200 p-4">
              <span className="text-sm font-semibold text-[#44494d]">Gara: Toyota Vios 2021</span>
              <p className="text-xs text-[#8f9294] mt-1">Sản phẩm đã xác nhận tương thích với xe đã đăng ký.</p>
            </div>
          </div>
        </div>
      </div>

      {showVoucherModal && (
        <VoucherSelectorModal 
          onClose={() => setShowVoucherModal(false)}
          onApply={handleApplyVouchers}
          initialFreeship={selectedFreeshipCode}
          initialDiscount={selectedDiscountCode}
          subtotal={subtotal}
        />
      )}

      {/* Footer */}
      <footer style={{ background: "var(--ap-sidebar-bg)" }} className="mt-12 py-8 text-center text-[#8f9294] text-xs">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LogoImage className="h-[18px] w-auto object-contain" />
        </div>
        <p className="mt-2">© 2024 Phụ Tùng Ô Tô Professional. All rights reserved.</p>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BatteryCharging,
  Cpu,
  Disc,
  Droplets,
  Fan,
  Filter,
  LayoutGrid,
  Leaf,
  Lightbulb,
  MoreHorizontal,
  Package,
  Settings2,
  ShoppingCart,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { useLang, type Lang } from "@/lib/i18n";
import { cartCount as getCartCount } from "@/lib/cartStore";
import { getAuth, AuthUser, roleRedirects } from "@/lib/auth";
import LogoImage from "@/components/LogoImage";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import NotificationBell from "@/components/NotificationBell";
import AffiliateRefTracker from "@/components/AffiliateRefTracker";

const A = "/ap-assets";

const LANG_OPTIONS: { code: Lang; label: string; short: string; flag: string }[] = [
  { code: "vi", label: "Tiếng Việt", short: "VI", flag: `${A}/vi.svg` },
  { code: "en", label: "English", short: "EN", flag: `${A}/en.svg` },
  { code: "zh", label: "简体中文", short: "中文", flag: `${A}/zh.svg` },
];

function MiniCartDropdown({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem("autopart_cart");
        setItems(raw ? JSON.parse(raw) : []);
      } catch {
        setItems([]);
      }
    }

    load();
    window.addEventListener("cart-update", load);
    return () => window.removeEventListener("cart-update", load);
  }, []);

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.qty || 1), 0);
  const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg flex items-center" aria-label="Giỏ hàng">
        <ShoppingCart className="w-6 h-6 text-[#44494d]" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </Link>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-50">
          <div className="px-4 py-3 border-b border-[#f0f0f0]">
            <p className="font-bold text-[#44494d] text-sm">Sản phẩm trong giỏ ({count})</p>
          </div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#8f9294]">Giỏ hàng trống</div>
          ) : (
            <>
              <div className="max-h-72 overflow-y-auto">
                {items.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 px-4 py-2 hover:bg-[#f8f8fa]">
                    <div className="w-10 h-10 rounded bg-[#f4f4f4] flex items-center justify-center text-xs text-[#8f9294]">
                      {(item.name || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#44494d] truncate">{item.name}</p>
                      <p className="text-xs text-[#8f9294]">x{item.qty} · {formatVnd((item.price || 0) * (item.qty || 1))}</p>
                    </div>
                  </div>
                ))}
                {items.length > 5 && <p className="px-4 py-2 text-xs text-[#8f9294]">và {items.length - 5} mục khác...</p>}
              </div>
              <div className="px-4 py-3 border-t border-[#f0f0f0]">
                <span className="text-sm font-semibold text-[#44494d]">Tạm tính: <span className="text-orange-500">{formatVnd(subtotal)}</span></span>
              </div>
              <div className="px-4 pb-3 flex gap-2">
                <Link href="/cart" className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-center border border-[#e5e5e5] text-[#44494d] hover:bg-[#f4f4f4]">Xem giỏ</Link>
                <Link href="/checkout" className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-center text-white" style={{ background: "var(--ap-primary)" }}>Thanh toán</Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function StorefrontHeader() {
  const { t, lang, setLang } = useLang();
  const [searchQ, setSearchQ] = useState("");
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [brand, setBrand] = useState({ brandName: "AutoParts", brandShort: "AP", greeting: "AutoParts xin chào!", hotline: "19008095" });
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [commitments, setCommitments] = useState([
    { text: "Được vận hành bởi AutoParts" },
    { text: "Thanh toán hoàn toàn bằng VND" },
    { text: "Theo dõi hành trình qua web" },
    { text: "Order trực tiếp và nhanh chóng" },
  ]);
  const navRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && event.target instanceof Node && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const refreshCart = () => setCount(getCartCount());
    refreshCart();
    setUser(getAuth());
    window.addEventListener("cart-update", refreshCart);
    window.addEventListener("storage", refreshCart);
    return () => {
      window.removeEventListener("cart-update", refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.branding) setBrand((current) => ({ ...current, ...data.branding }));
        if (Array.isArray(data.commitments) && data.commitments.length > 0) setCommitments(data.commitments);
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setApiCategories(data);
      })
      .catch(() => {});
  }, []);

  const scrollNav = (direction: "left" | "right") => {
    navRef.current?.scrollBy({ left: direction === "right" ? 300 : -300, behavior: "smooth" });
  };

  const runSearch = () => {
    const q = searchQ.trim();
    if (q) window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  const uploadImage = (file: File | undefined, input: HTMLInputElement) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: "Vui lòng chọn tệp ảnh hợp lệ.", type: "warning" } }));
      input.value = "";
      return;
    }
    window.dispatchEvent(new CustomEvent("app-toast", {
      detail: { message: lang === "zh" ? "正在按图片识别..." : lang === "en" ? "Recognizing image..." : "Đang nhận diện ảnh...", type: "info" },
    }));
    const reader = new FileReader();
    reader.onload = async (event) => {
      const { aHashFromSrc } = await import("@/lib/imageHash");
      const hash = await aHashFromSrc(event.target?.result as string);
      window.location.href = hash ? `/search?imghash=${hash}` : "/products";
    };
    reader.readAsDataURL(file);
  };

  const getCategoryIcon = (id: string, color?: string) => {
    const c = color || "var(--ap-primary)";
    switch (id) {
      case "dieu-hoa-khong-khi": return <Wind size={16} color={c} />;
      case "ignition": return <Zap size={16} color={c} />;
      case "dien-xoay": return <BatteryCharging size={16} color={c} />;
      case "loc": return <Filter size={16} color={c} />;
      case "quat-dong-co": return <Fan size={16} color={c} />;
      case "cam-bien-o-to": return <Activity size={16} color={c} />;
      case "phu-kien-khac": return <Package size={16} color={c} />;
      case "chieu-sang": return <Lightbulb size={16} color={c} />;
      case "he-thong-phanh": return <Disc size={16} color={c} />;
      case "truyen": return <Settings2 size={16} color={c} />;
      case "he-thong-quan-ly-dong-co": return <Cpu size={16} color={c} />;
      case "luoi-gat-nuoc": return <Droplets size={16} color={c} />;
      case "may-nen-hybrid": return <Leaf size={16} color={c} />;
      case "khong-duoc-nhom": return <MoreHorizontal size={16} color={c} />;
      default: return <Wrench size={16} color={c} />;
    }
  };

  const currentLang = LANG_OPTIONS.find((item) => item.code === lang) ?? LANG_OPTIONS[0];
  const commitIcons = [
    `${A}/delivery-time-new.svg`,
    `${A}/money-time-new.svg`,
    `${A}/time-new.svg`,
    `${A}/truck-fast-new.svg`,
  ];

  return (
    <header className="bg-white w-full shadow-sm sticky top-0 z-50 transition-all">
      <AffiliateRefTracker />

      <div className="hidden md:block bg-[#f5f5f5] text-[#838688] text-[12px] border-b border-gray-100 relative z-20">
        <div className="ap-container flex justify-between items-center gap-4 py-[8px] min-h-[34px]">
          <div className="flex items-center gap-[24px] min-w-0">
            <span className="truncate">{brand.greeting}</span>
            <div className="flex items-center gap-[6px] shrink-0">
              <img src={`${A}/phone-fill2.png`} alt="" className="w-[14px] h-[14px] object-contain" />
              <span>Hotline: {brand.hotline}</span>
            </div>
          </div>
          <div className="relative shrink-0" ref={langMenuRef} data-no-translate>
            <button
              className="flex items-center gap-[6px] cursor-pointer hover:text-[#1a4b97] transition-colors py-1"
              onClick={() => setShowLangMenu((open) => !open)}
            >
              <img src={currentLang.flag} alt={currentLang.short} className="w-[20px] h-[14px] object-contain rounded-sm" />
              <span className="font-medium text-[#44494d] uppercase leading-none">{currentLang.short}</span>
              <img src={`${A}/btn_dropdown.svg`} alt="" className={`w-[10px] h-[10px] transition-transform ${showLangMenu ? "rotate-180" : ""}`} />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 top-full mt-1 w-[150px] bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 z-[60] py-1">
                {LANG_OPTIONS.map((item) => (
                  <button
                    key={item.code}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f8f9fa] cursor-pointer transition-colors text-left"
                    onClick={() => {
                      setLang(item.code);
                      setShowLangMenu(false);
                    }}
                  >
                    <img src={item.flag} alt={item.short} className="w-[24px] h-[16px] object-cover rounded shadow-[0_0_2px_rgba(0,0,0,0.2)]" />
                    <span className={`text-[13px] ${lang === item.code ? "font-bold text-[#1a4b97]" : "font-medium text-[#44494d]"}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ap-container min-h-[54px] relative flex items-center gap-3 py-2">
        <Link href="/" className="flex-shrink-0 flex items-center z-10">
          <LogoImage className="h-[32px] w-auto object-contain" />
        </Link>

        <div className="hidden md:flex flex-1 min-w-0 max-w-[760px] flex-row items-center gap-[6px] z-0 mx-2">
          <div className="flex items-center flex-1 min-w-0 h-[38px] border border-gray-300 hover:border-[#1a4b97] focus-within:border-[#1a4b97] transition-colors rounded-full overflow-hidden bg-white pl-3 pr-[2px]">
            <img src={`${A}/search_placeholder.svg`} alt="" className="w-[15px] h-[15px] mr-1.5 opacity-50" />
            <input
              type="text"
              value={searchQ}
              onChange={(event) => setSearchQ(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && runSearch()}
              placeholder={t("searchPlaceholder")}
              className="flex-1 h-full outline-none text-[13px] text-[#44494d] min-w-0"
            />
            <button
              onClick={runSearch}
              className="text-white px-4 lg:px-5 h-[34px] rounded-full font-medium text-[13px] hover:opacity-90 transition-colors shrink-0"
              style={{ background: "var(--ap-primary)" }}
            >
              {t("search")}
            </button>
          </div>

          <label className="hidden 2xl:flex bg-[#e8f0fd] text-[#1a4b97] px-[12px] h-[38px] rounded-full font-medium text-[13px] items-center justify-center gap-1.5 hover:bg-[#dbeafe] border border-[#bfdbfe] transition-colors shrink-0 cursor-pointer">
            <img src={`${A}/image-search-blue.svg`} alt="" className="w-[15px] h-[15px]" />
            {lang === "zh" ? "图片搜索" : lang === "en" ? "Search by image" : "Tìm ảnh"}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0], event.currentTarget)} />
          </label>
        </div>

        <div className="flex items-center shrink-0 z-10 ml-auto gap-1.5 lg:gap-3">
          <CurrencySwitcher />
          <MiniCartDropdown count={count} />
          <NotificationBell inline />

          {user ? (
            <Link href={roleRedirects[user.role] || "/admin"} className="flex items-center gap-2 pl-1 md:pl-2 rounded-full hover:opacity-80 transition-opacity group min-w-0">
              <span className="text-[14px] font-semibold text-[#44494d] hidden lg:block max-w-[120px] truncate leading-tight text-right">{user.name}</span>
              <div className="w-[36px] h-[36px] rounded-full overflow-hidden border-2 border-white bg-gradient-to-tr from-[#1a4b97] to-[#0d2d5e] text-white flex flex-shrink-0 items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-[6px] bg-gradient-to-r from-[#1a4b97] to-[#0d2d5e] text-white px-3 lg:px-5 py-[7px] rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <svg className="w-[15px] h-[15px] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[13px] font-semibold tracking-wide hidden lg:block">{t("login")}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="hidden md:block ap-container relative group">
        <div ref={navRef} className="flex h-[32px] items-center text-[13px] text-[#44494d] overflow-x-auto whitespace-nowrap hide-scrollbar gap-[20px] py-0.5">
          <Link href="/products" className="flex items-center gap-[6px] font-medium cursor-pointer hover:text-[#1a4b97] pr-2 flex-shrink-0">
            <LayoutGrid size={16} color="var(--ap-primary)" />
            {lang === "zh" ? "全部配件" : lang === "en" ? "All parts" : "Tất cả phụ tùng"}
          </Link>
          {apiCategories.map((cat) => (
            <Link href={`/products?category=${cat.id}`} key={cat.id} className="flex items-center gap-[4px] hover:text-[#1a4b97] cursor-pointer transition-colors flex-shrink-0">
              {getCategoryIcon(cat.id, cat.color)}
              <span>{lang === "zh" ? (cat.nameZh || cat.name) : cat.name}</span>
            </Link>
          ))}
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-[50px] bg-gradient-to-r from-white via-white/90 to-transparent flex items-center justify-start pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => scrollNav("left")} className="w-7 h-7 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-gray-50 hover:shadow-md transition ml-1" aria-label="Scroll categories left">
            <span className="text-slate-500 text-lg leading-none">‹</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-[50px] bg-gradient-to-l from-white via-white/90 to-transparent flex items-center justify-end pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => scrollNav("right")} className="w-7 h-7 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-gray-50 hover:shadow-md transition mr-1" aria-label="Scroll categories right">
            <span className="text-slate-500 text-lg leading-none">›</span>
          </button>
        </div>
      </div>

      <div className="bg-[#181a1b] text-[#b5b5b5] text-[12px] hidden md:block overflow-hidden relative">
        <div className="ap-container h-[36px] flex items-center">
          <div className="flex items-center gap-[8px] shrink-0 pr-[40px] z-10 bg-[#181a1b] relative">
            <span className="text-[12px] text-[#a2b0c3]">Selected by</span>
            <span className="text-white font-bold text-[13px] tracking-tight">{brand.brandName}</span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-default whitespace-nowrap">
              {[0, 1, 2, 3].map((setIndex) => (
                <div key={setIndex} className="flex items-center gap-[40px] pr-[40px] shrink-0">
                  {commitments.map((commitment, index) => (
                    <div key={`${setIndex}-${index}`} className="flex items-center gap-[8px] font-medium text-[#a1a1aa] shrink-0">
                      <img src={commitIcons[index % commitIcons.length]} alt="" className="w-[15px] h-[15px] brightness-0 invert opacity-70" />
                      {commitment.text}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden px-4 pb-3 pt-3">
        <div className="flex border border-gray-300 focus-within:border-[#1a4b97] rounded-full overflow-hidden h-[40px] transition-colors">
          <input
            type="text"
            value={searchQ}
            onChange={(event) => setSearchQ(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && runSearch()}
            placeholder={t("searchGeneric")}
            className="flex-1 px-4 outline-none text-[14px] min-w-0"
          />
          <button onClick={runSearch} className="bg-ap-red text-white px-4 font-medium">
            {t("search")}
          </button>
        </div>
      </div>
    </header>
  );
}

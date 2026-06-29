"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { cartCount as getCartCount } from "@/lib/cartStore";
import { getAuth, AuthUser, roleRedirects } from "@/lib/auth";
import LogoImage from "@/components/LogoImage";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { 
  Wind, Zap, BatteryCharging, Filter, Fan, Activity, 
  Package, Lightbulb, Disc, Settings2, Cpu, 
  Droplets, Leaf, MoreHorizontal, Wrench, LayoutGrid, ShoppingCart
} from "lucide-react";

const A = "/ap-assets";


function MiniCartDropdown({ count }: { count: number }) {
  const { useState, useEffect } = require("react");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem("autopart_cart");
        setItems(raw ? JSON.parse(raw) : []);
      } catch { setItems([]); }
    }
    load();
    const handler = () => load();
    window.addEventListener("cart-update", handler);
    return () => window.removeEventListener("cart-update", handler);
  }, []);
  const subtotal = items.reduce((s: number, it: any) => s + (it.price || 0) * (it.qty || 1), 0);
  const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "₫";
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg flex items-center" aria-label="Giỏ hàng">
        <ShoppingCart className="w-6 h-6 text-[#44494d]" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{count}</span>
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
                {items.slice(0, 5).map((it: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2 hover:bg-[#f8f8fa]">
                    <div className="w-10 h-10 rounded bg-[#f4f4f4] flex items-center justify-center text-xs text-[#8f9294]">{(it.name || "?").charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#44494d] truncate">{it.name}</p>
                      <p className="text-xs text-[#8f9294]">x{it.qty} · {formatVnd((it.price || 0) * (it.qty || 1))}</p>
                    </div>
                  </div>
                ))}
                {items.length > 5 && <p className="px-4 py-2 text-xs text-[#8f9294]">và {items.length - 5} mục khác...</p>}
              </div>
              <div className="px-4 py-3 border-t border-[#f0f0f0] flex items-center justify-between">
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
  const [searchQ, setSearchQ] = useState("");
  const [count, setCount] = useState(0);
  const { t, lang, setLang } = useLang();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (langMenuRef.current && event.target instanceof Node && !langMenuRef.current.contains(event.target)) {
          setShowLangMenu(false);
        }
      } catch (e) {}
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: direction === 'right' ? 300 : -300, behavior: 'smooth' });
    }
  };

  // Settings from admin
  const [brand, setBrand] = useState({ brandName: "AutoParts", brandShort: "AP", greeting: "AutoParts xin chào!", hotline: "19008095" });
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [commitments, setCommitments] = useState([
    { text: "Được vận hành bởi AutoParts" },
    { text: "Thanh toán hoàn toàn bằng VND" },
    { text: "Theo dõi hành trình qua web" },
    { text: "Order trực tiếp và nhanh chóng" },
  ]);

  useEffect(() => {
    setCount(getCartCount());
    setUser(getAuth());
    const handler = () => setCount(getCartCount());
    window.addEventListener("cart-update", handler);
    window.addEventListener("storage", handler);
    return () => { window.removeEventListener("cart-update", handler); window.removeEventListener("storage", handler); };
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d.branding) setBrand(b => ({ ...b, ...d.branding }));
        if (Array.isArray(d.commitments) && d.commitments.length > 0) setCommitments(d.commitments);
      })
      .catch(() => {});
      
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setApiCategories(d);
      })
      .catch(() => {});
  }, []);



  const brandMain = brand.brandName;

  const commitIcons = [
    `${A}/delivery-time-new.svg`,
    `${A}/money-time-new.svg`,
    `${A}/time-new.svg`,
    `${A}/truck-fast-new.svg`,
  ];

  const getCategoryIcon = (id: string, color?: string) => {
    const c = color || "var(--ap-primary)";
    switch (id) {
      case 'dieu-hoa-khong-khi': return <Wind size={16} color={c} />;
      case 'ignition': return <Zap size={16} color={c} />;
      case 'dien-xoay': return <BatteryCharging size={16} color={c} />;
      case 'loc': return <Filter size={16} color={c} />;
      case 'quat-dong-co': return <Fan size={16} color={c} />;
      case 'cam-bien-o-to': return <Activity size={16} color={c} />;
      case 'phu-kien-khac': return <Package size={16} color={c} />;
      case 'chieu-sang': return <Lightbulb size={16} color={c} />;
      case 'he-thong-phanh': return <Disc size={16} color={c} />;
      case 'truyen': return <Settings2 size={16} color={c} />;
      case 'he-thong-quan-ly-dong-co': return <Cpu size={16} color={c} />;
      case 'luoi-gat-nuoc': return <Droplets size={16} color={c} />;
      case 'may-nen-hybrid': return <Leaf size={16} color={c} />;
      case 'khong-duoc-nhom': return <MoreHorizontal size={16} color={c} />;
      default: return <Wrench size={16} color={c} />;
    }
  };

  return (
    <header className="bg-white w-full shadow-sm sticky top-0 z-50 transition-all">
      {/* 1. Top Navbar */}
      <div className="hidden md:block bg-[#f5f5f5] text-[#838688] text-[12px] border-b border-gray-100 relative z-20">
        <div className="ap-container flex justify-between items-center py-[8px] min-h-[34px]">
          <div className="flex items-center gap-[24px]">
            <span>{brand.greeting}</span>
            <div className="flex items-center gap-[6px]">
               <img src={`${A}/phone-fill2.png`} alt="" className="w-[14px] h-[14px] object-contain" />
               <span>Hotline: {brand.hotline}</span>
            </div>
          </div>
          <div className="flex items-center gap-[20px]">
            <div className="relative" ref={langMenuRef}>
              <div 
                className="flex items-center gap-[6px] cursor-pointer hover:text-[#1a4b97] transition-colors py-1"
                onClick={() => setShowLangMenu(!showLangMenu)}
              >
                <img src={lang === 'zh' ? `${A}/zh.svg` : `${A}/vi.svg`} alt={(lang || 'vi').toUpperCase()} className="w-[20px] h-[14px] object-contain rounded-sm" />
                <span className="font-medium text-[#44494d] uppercase z-10 leading-none">{lang || 'vi'}</span>
                <img src={`${A}/btn_dropdown.svg`} alt="" className={`w-[10px] h-[10px] transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
              </div>

              {showLangMenu && (
                <div className="absolute right-0 top-full mt-1 w-[130px] bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 z-[60] py-1">
                  <div 
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                    onClick={() => { setLang('vi'); setShowLangMenu(false); }}
                  >
                    <img src={`${A}/vi.svg`} alt="VI" className="w-[24px] h-[16px] object-cover rounded shadow-[0_0_2px_rgba(0,0,0,0.2)]" />
                    <span className={`text-[13px] ${lang === 'vi' ? 'font-bold text-[#1a4b97]' : 'font-medium text-[#44494d]'}`}>Tiếng Việt</span>
                  </div>
                  <div 
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#f8f9fa] cursor-pointer transition-colors"
                    onClick={() => { setLang('zh'); setShowLangMenu(false); }}
                  >
                    <img src={`${A}/zh.svg`} alt="ZH" className="w-[24px] h-[16px] object-cover rounded shadow-[0_0_2px_rgba(0,0,0,0.2)]" />
                    <span className={`text-[13px] ${lang === 'zh' ? 'font-bold text-[#1a4b97]' : 'font-medium text-[#44494d]'}`}>中文</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="ap-container h-[54px] relative flex items-center justify-between">
        <Link href="/" className="flex-shrink-0 flex items-center z-10">
          <LogoImage className="h-[32px] w-auto object-contain" />
        </Link>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[760px] flex-row items-center gap-[6px] z-0 px-4">
          <div className="flex items-center flex-1 h-[38px] border border-gray-300 hover:border-[#1a4b97] focus-within:border-[#1a4b97] transition-colors rounded-full overflow-hidden bg-white pl-3 pr-[2px]">
             <img src={`${A}/search_placeholder.svg`} alt="" className="w-[15px] h-[15px] mr-1.5 opacity-50" />
             <input 
               type="text" 
               value={searchQ}
               onChange={e => setSearchQ(e.target.value)}
               onKeyDown={e => e.key === "Enter" && searchQ && (window.location.href = `/search?q=${encodeURIComponent(searchQ)}`)}
               placeholder={t('searchPlaceholder')}
               className="flex-1 h-full outline-none text-[13px] text-[#44494d]"
             />
             <button 
               onClick={() => searchQ && (window.location.href = `/search?q=${encodeURIComponent(searchQ)}`)}
               className="text-white px-[20px] h-[34px] rounded-full font-medium text-[13px] hover:opacity-90 transition-colors shrink-0" style={{ background: "var(--ap-primary)" }}
             >
              {t('search')}
             </button>
          </div>
          <button className="bg-[#e8f0fd] text-[#1a4b97] px-[12px] h-[38px] rounded-full font-medium text-[13px] flex items-center justify-center gap-1.5 hover:bg-[#dbeafe] border border-[#bfdbfe] transition-colors shrink-0">
            <img src={`${A}/image-search-blue.svg`} alt="" className="w-[15px] h-[15px]" />
            {lang === "zh" ? "图片搜索" : "Tìm ảnh"}
          </button>
        </div>

        <div className="flex items-center shrink-0 z-10 pl-4 gap-[16px]">
          <CurrencySwitcher />
            <MiniCartDropdown count={count} />

          {user ? (
            <Link href={roleRedirects[user.role] || "/admin"} className="flex items-center gap-2 pl-2 rounded-full hover:opacity-80 transition-opacity group">
              <span className="text-[14px] font-semibold text-[#44494d] hidden md:block max-w-[120px] truncate leading-tight text-right">{user.name}</span>
              <div className="w-[36px] h-[36px] rounded-full overflow-hidden border-2 border-white bg-gradient-to-tr from-[#1a4b97] to-[#3b82f6] text-white flex flex-shrink-0 items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
                {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-[6px] bg-gradient-to-r from-[#6366f1] to-[#9333ea] text-white px-5 py-[7px] rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
              <svg className="w-[15px] h-[15px] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-[13px] font-semibold tracking-wide hidden md:block">{t('login')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 3. Categories Nav */}
      <div className="hidden md:block ap-container relative group">
        <div ref={navRef} className="flex h-[32px] items-center text-[13px] text-[#44494d] overflow-x-auto whitespace-nowrap hide-scrollbar gap-[20px] py-0.5">
           <Link href="/products" className="flex items-center gap-[6px] font-medium cursor-pointer hover:text-[#1a4b97] pr-2 flex-shrink-0">
              <LayoutGrid size={16} color="var(--ap-primary)" />
              {lang === "zh" ? "全部配件" : "Tất cả phụ tùng"}
           </Link>
           {apiCategories.map(cat => (
             <Link href={`/products?category=${cat.id}`} key={cat.id} className="flex items-center gap-[4px] hover:text-[#1a4b97] cursor-pointer transition-colors flex-shrink-0">
                {getCategoryIcon(cat.id, cat.color)}
                <span>{lang === "zh" ? (cat.nameZh || cat.name) : cat.name}</span>
             </Link>
           ))}
        </div>
        
        <div className="absolute left-0 top-0 bottom-0 w-[50px] bg-gradient-to-r from-white via-white/90 to-transparent flex items-center justify-start pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => scrollNav('left')} className="w-7 h-7 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-gray-50 hover:shadow-md transition ml-1">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#888" className="w-4 h-4 mr-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
           </button>
        </div>
        
        <div className="absolute right-0 top-0 bottom-0 w-[50px] bg-gradient-to-l from-white via-white/90 to-transparent flex items-center justify-end pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => scrollNav('right')} className="w-7 h-7 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-gray-50 hover:shadow-md transition mr-1">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#888" className="w-4 h-4 ml-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
           </button>
        </div>
      </div>

      {/* 4. Black Bar – from admin settings */}
      <div className="bg-[#181a1b] text-[#b5b5b5] text-[12px] hidden md:block overflow-hidden relative">
         <div className="ap-container h-[36px] flex items-center">
            {/* Static Left Part */}
            <div className="flex items-center gap-[8px] shrink-0 pr-[40px] z-10 bg-[#181a1b] relative">
               <span className="text-[12px] text-[#a2b0c3]">Selected by</span>
               <span className="text-white font-bold text-[13px] tracking-tight">
                 {brandMain}
               </span>
            </div>

            {/* Scrolling Right Part */}
            <div className="flex-1 overflow-hidden relative">
               <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-default whitespace-nowrap">
                  {[0, 1, 2, 3].map((setIndex) => (
                    <div key={setIndex} className="flex items-center gap-[40px] pr-[40px] shrink-0">
                      {commitments.map((c, i) => (
                        <div key={i} className="flex items-center gap-[8px] font-medium text-[#a1a1aa] shrink-0">
                           <img src={commitIcons[i % commitIcons.length]} alt="" className="w-[15px] h-[15px] brightness-0 invert opacity-70" />
                           {c.text}
                        </div>
                      ))}
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="sm:hidden px-4 pb-3 pt-3">
        <div className="flex border border-gray-300 focus-within:border-[#1a4b97] rounded-full overflow-hidden h-[40px] transition-colors">
          <input 
            type="text" 
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchQ && (window.location.href = `/search?q=${encodeURIComponent(searchQ)}`)}
            placeholder={t('searchGeneric')}
            className="flex-1 px-4 outline-none text-[14px]"
          />
          <button 
            onClick={() => searchQ && (window.location.href = `/search?q=${encodeURIComponent(searchQ)}`)}
            className="bg-ap-red text-white px-4 font-medium"
          >
            {t('search')}
          </button>
        </div>
      </div>
    </header>
  );
}

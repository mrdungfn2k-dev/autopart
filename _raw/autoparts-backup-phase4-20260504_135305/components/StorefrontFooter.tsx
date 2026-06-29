"use client";
import { useState, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import LogoImage from "@/components/LogoImage";

export default function StorefrontFooter() {
  const { lang, t } = useLang();
  const [ft, setFt] = useState<any>(null);
  const [br, setBr] = useState<any>(null);
  const [newsletter, setNewsletter] = useState("");
  const [newsletterDone, setNewsletterDone] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d.footer) setFt(d.footer);
        if (d.branding) setBr(d.branding);
      })
      .catch(() => {});
  }, []);

  const footer = ft || {
    companyName: "CÔNG TY CỔ PHẦN AUTOPARTS",
    registrationNo: "0104093672",
    issuedBy: "do Phòng đăng ký kinh doanh - Sở Kế hoạch và Đầu tư TP Hà Nội cấp ngày 03/07/2009",
    manager: "Nguyễn Tuấn Anh",
    address: "Tòa nhà AutoParts, Ngõ 15 Duy Tân, Cầu Giấy, Hà Nội",
    email: "cskh@autoparts.vn",
    phone: "19008095",
    socialLinks: [
      { name: "Instagram", icon: "/ap-assets/icon_ig.svg" },
      { name: "Facebook", icon: "/ap-assets/icon_fb.svg" },
      { name: "YouTube", icon: "/ap-assets/icon_utube.svg" },
      { name: "TikTok", icon: "/ap-assets/icon_tiktok.svg" },
    ],
    supportLinks: ["Trung tâm hỗ trợ","Hướng dẫn đặt hàng","Hướng dẫn ký hợp đồng điện tử","Hướng dẫn sử dụng","Ước tính chi phí vận chuyển"],
    policyLinks: ["Chính sách vận chuyển","Chính sách bảo mật thông tin cá nhân","Chính sách trả hàng hoàn tiền","Hàng cấm, hàng gửi có điều kiện"],
    aboutLinks: ["Giới thiệu","Điều khoản dịch vụ","Quy chế hoạt động sàn","Giao dịch TMĐT","Kinh nghiệm AutoParts"],
  };
  const brand = br || { brandName: "AutoParts", brandShort: "AP", tagline: "Nền tảng mua phụ tùng\nô tô chính hãng hàng đầu\nViệt Nam" };
  const brandMain = brand.brandName;

  const defaultTaglineVi = "Nền tảng mua phụ tùng\nô tô chính hãng hàng đầu\nViệt Nam";
  const displayTagline = (lang === "zh" && (!brand.tagline || brand.tagline === defaultTaglineVi))
    ? "越南领先的正宗汽车\n零部件采购平台"
    : (brand.tagline || "");

  const tLink = (text: string) => {
    if (lang !== "zh") return text;
    const map: Record<string, string> = {
      "Trung tâm hỗ trợ": "帮助中心", "Hướng dẫn đặt hàng": "订购指南", "Hướng dẫn ký hợp đồng điện tử": "电子合同签署指南", "Hướng dẫn sử dụng": "使用说明",
      "Ước tính chi phí vận chuyển": "预估运费", "Chính sách vận chuyển": "运输政策", "Chính sách bảo mật thông tin cá nhân": "个人隐私政策",
      "Chính sách trả hàng hoàn tiền": "退换货政策", "Hàng cấm, hàng gửi có điều kiện": "违禁品及受限物品",
      "Giới thiệu": "关于我们", "Điều khoản dịch vụ": "服务条款", "Quy chế hoạt động sàn": "平台运营规则", "Giao dịch TMĐT": "电子商务交易", "Kinh nghiệm AutoParts": "AutoParts经验"
    };
    return map[text] || text;
  };

  // Map each support/policy link to its proper URL with anchor
  const supportLinkMap: Record<string, string> = {
    "Trung tâm hỗ trợ": "/help",
    "Hướng dẫn đặt hàng": "/support#order-guide",
    "Hướng dẫn ký hợp đồng điện tử": "/support#contract-guide",
    "Hướng dẫn sử dụng": "/support#usage-guide",
    "Ước tính chi phí vận chuyển": "/support#shipping-estimate",
  };
  const policyLinkMap: Record<string, string> = {
    "Chính sách vận chuyển": "/policy#shipping-policy",
    "Chính sách bảo mật thông tin cá nhân": "/policy#privacy-info",
    "Chính sách trả hàng hoàn tiền": "/policy#return-policy",
    "Hàng cấm, hàng gửi có điều kiện": "/policy#prohibited",
  };
  const aboutLinkMap: Record<string, string> = {
    "Giới thiệu": "/about",
    "Điều khoản dịch vụ": "/policy",
    "Quy chế hoạt động sàn": "/policy",
    "Giao dịch TMĐT": "/policy",
    "Kinh nghiệm AutoParts": "/about",
  };
  const fCompany = lang === "zh" ? "AutoParts 股份公司" : footer.companyName;
  const fIssuedBy = lang === "zh" ? "由河内市计划投资局营业登记处颁发，日期：2009年07月03日" : footer.issuedBy;
  const fAddress = lang === "zh" ? "河内市，纸桥区，维新巷15号，AutoParts大厦" : footer.address;

  return (
    <footer className="bg-[#17212d] text-[#8391a3] text-[14px] font-sans w-full">
      <div className="ap-container py-[40px] flex flex-col md:flex-row gap-8 justify-between mx-auto max-w-7xl px-6">
        {/* Brand Info */}
        <div className="flex-1 md:max-w-[300px]">
          <div className="mb-[12px] flex items-center gap-2">
            <div className="bg-white px-4 py-2 rounded-[6px] inline-flex items-center justify-center shadow-sm"><LogoImage className="h-[24px] w-auto object-contain" /></div>
          </div>
          <div className="text-[14px] text-white leading-relaxed mt-[20px] font-medium opacity-90">
            {displayTagline.split("\n").map((line: string, i: number) => <span key={i}>{line}<br/></span>)}
          </div>
          <div className="mt-[20px]">
            <div className="text-[13px] text-white opacity-80 mb-2">{lang === "zh" ? "关注 " + brandMain : `Kết nối với ${brandMain} tại`}</div>
            <div className="flex items-center gap-[10px] mb-4">
              {(footer.socialLinks || []).map((s: any, i: number) => (
                <img loading="lazy" decoding="async" key={i} src={s.icon} alt={s.name} className="w-[28px] h-[28px] cursor-pointer hover:opacity-80" />
              ))}
            </div>
          </div>
        </div>

        {/* Support Links */}
        <div className="flex-1">
          <div className="font-semibold text-white mb-6">{lang === "zh" ? "客户服务" : "Hỗ trợ khách hàng"}</div>
          <ul className="space-y-[14px]">
            {(footer.supportLinks || []).map((link: string, i: number) => (
              <li key={i}><a href={supportLinkMap[link] || "/support"} className="hover:text-white transition-colors">{tLink(link)}</a></li>
            ))}
          </ul>
        </div>

        {/* Policy Links */}
        <div className="flex-1">
          <div className="font-semibold text-white mb-6">{lang === "zh" ? `${brandMain}政策` : `Chính sách ${brandMain}`}</div>
          <ul className="space-y-[14px]">
            {(footer.policyLinks || []).map((link: string, i: number) => (
              <li key={i}><a href={policyLinkMap[link] || "/policy"} className="hover:text-white transition-colors">{tLink(link)}</a></li>
            ))}
          </ul>
        </div>

        {/* About Links */}
        <div className="flex-1">
          <div className="font-semibold text-white mb-6">{lang === "zh" ? `关于${brandMain}` : `Về ${brandMain}`}</div>
          <ul className="space-y-[14px]">
            {(footer.aboutLinks || []).map((link: string, i: number) => (
              <li key={i}><a href={aboutLinkMap[link] || "/about"} className="hover:text-white transition-colors">{tLink(link)}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-[#1a2738] border-t border-gray-700/50 py-6 w-full">
        <div className="ap-container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm mb-0.5">
                {lang === "zh" ? "订阅促销信息" : "Đăng ký nhận khuyến mãi"}
              </p>
              <p className="text-[#8391a3] text-xs">
                {lang === "zh" ? "第一时间获取Flash Sale和专属优惠" : "Nhận Flash Sale & ưu đãi độc quyền sớm nhất"}
              </p>
            </div>
            {newsletterDone ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-900/40 border border-green-700/40 text-green-400 text-sm font-semibold">
                <span>✓</span>
                {lang === "zh" ? "订阅成功！感谢您的关注" : "Đăng ký thành công! Cảm ơn bạn"}
              </div>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  value={newsletter}
                  onChange={e => setNewsletter(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && newsletter.includes("@")) {
                      fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newsletter, source: "footer" }) })
                        .then(() => setNewsletterDone(true))
                        .catch(() => setNewsletterDone(true));
                    }
                  }}
                  placeholder={lang === "zh" ? "输入您的邮箱地址..." : "Nhập email của bạn..."}
                  className="flex-1 md:w-72 px-4 py-2.5 rounded-xl bg-[#0f172a] border border-gray-600 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#1a4b97]"
                />
                <button
                  onClick={() => {
                    if (!newsletter.includes("@")) return;
                    fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newsletter, source: "footer" }) })
                      .then(() => setNewsletterDone(true))
                      .catch(() => setNewsletterDone(true));
                  }}
                  className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 shrink-0"
                  style={{ background: "var(--ap-primary)" }}>
                  {lang === "zh" ? "订阅" : "Đăng ký"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#0f172a] text-[#8391a3] border-t border-gray-800 py-6 w-full">
        <div className="ap-container mx-auto px-6 max-w-7xl text-center text-[13px] opacity-80 space-y-2">
          <div className="flex justify-center gap-6 mb-4">
            <a href="/privacy" className="hover:text-white transition-colors">{lang === "zh" ? "隐私政策" : "Chính sách bảo mật"}</a>
            <span className="opacity-50">|</span>
            <a href="/license" className="hover:text-white transition-colors">{lang === "zh" ? "邮政许可" : "Giấy phép bưu chính"}</a>
          </div>
          <div className="font-semibold text-white uppercase mb-2">{fCompany}</div>
          <div className="opacity-60">{lang === "zh" ? "企业登记号： " : "Số giấy chứng nhận đăng ký doanh nghiệp: "}{footer.registrationNo}</div>
          <div className="opacity-60">{fIssuedBy}</div>
          <div className="opacity-60 mt-1">{lang === "zh" ? "负责人： " : "Người chịu trách nhiệm quản lý: "}{footer.manager}</div>
          <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6 text-[12px]">
            <div className="flex items-center gap-1 hover:text-white cursor-pointer opacity-60"><img loading="lazy" decoding="async" src="/ap-assets/local-icon.svg" alt="" className="w-[14px] brightness-200" /> {fAddress}</div>
            <div className="flex items-center gap-1 hover:text-white cursor-pointer opacity-60"><img loading="lazy" decoding="async" src="/ap-assets/gmail.svg" alt="" className="w-[14px] brightness-200" /> {footer.email}</div>
            <div className="flex items-center gap-1 font-semibold text-white"><img loading="lazy" decoding="async" src="/ap-assets/multimedia-audio.svg" alt="" className="w-[14px] brightness-200" /> {footer.phone}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

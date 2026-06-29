"use client";
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
type FAQ = { q: string; a: string };
type FAQSection = { category: string; icon?: string; items: FAQ[] };

const getFaqs = (lang: string): FAQSection[] => [
  {
    category: lang === "zh" ? "订单与支付" : "Đặt hàng & Thanh toán",
    items: [
      { q: lang === "zh" ? "我该如何下订单？" : "Tôi có thể đặt hàng như thế nào?", a: lang === "zh" ? "您可以直接在网站上下单：搜索产品 > 添加到购物车 > 填写地址 -> 选择支付方式。第一次购买不需要账号，但创建账号可以帮助您跟踪订单和赚取奖励积分。" : "Bạn có thể đặt hàng trực tiếp trên website: tìm sản phẩm > thêm vào giỏ > điền địa chỉ -> chọn thanh toán. Không cần tài khoản cho lần đầu tiên, nhưng tạo tài khoản giúp bạn theo dõi đơn và tích điểm thưởng." },
      { q: lang === "zh" ? "AutoParts 支持哪些付款方式？" : "AutoParts hỗ trợ những phương thức thanh toán nào?", a: lang === "zh" ? "我们支持：VNPay (ATM/QR)、MoMo、ZaloPay、银行转账和货到付款 (COD)（限500万及以下订单）。" : "Chúng tôi hỗ trợ: VNPay (ATM/QR), MoMo, ZaloPay, chuyển khoản ngân hàng, và thanh toán tiền mặt khi nhận hàng (COD) cho đơn dưới 5 triệu." },
      { q: lang === "zh" ? "下订单后可以取消吗？" : "Tôi có thể hủy đơn hàng sau khi đặt không?", a: lang === "zh" ? "您可以在下订单后30分钟内取消。如果供应商尚未移交发货，管理员也可以协助。请致电热线 1900 1234。" : "Bạn có thể hủy đơn trong vòng 30 phút sau khi đặt. Sau đó, nếu NCC chưa bàn giao cho shipper, admin có thể hỗ trợ hủy. Vui lòng liên hệ hotline 1900 1234." },
      { q: lang === "zh" ? "闪购商品可以退货吗？" : "Sản phẩm Flash Sale có thể hoàn trả không?", a: lang === "zh" ? "如因制造商缺陷，闪购产品可在3天内退货。自愿退货不适用于闪购。" : "Sản phẩm Flash Sale được hoàn trả trong 3 ngày nếu lỗi do nhà sản xuất. Hoàn trả theo ý muốn không áp dụng cho Flash Sale." },
    ],
  },
  {
    category: lang === "zh" ? "运输和交付" : "Vận chuyển & Giao hàng",
    items: [
      { q: lang === "zh" ? "交货时间多久？" : "Thời gian giao hàng là bao lâu?", a: lang === "zh" ? "胡志明市和河内：1-2个工作日。其余省市：2-4工作日。偏远地区：4-7天。可在 /tracking 实时追踪订单。" : "TP.HCM và Hà Nội: 1-2 ngày làm việc. Các tỉnh thành khác: 2-4 ngày làm việc. Vùng sâu vùng xa: 4-7 ngày. Bạn có thể theo dõi đơn hàng theo thời gian thực tại trang /tracking." },
      { q: lang === "zh" ? "运费如何计算？" : "Phí vận chuyển được tính như thế nào?", a: lang === "zh" ? "超过50万免运费。50万以下：费用在3万到5万，具体取决于距离。输入地址时将自动计算运费。" : "Miễn phí ship cho đơn từ 500.000đ. Đơn dưới 500.000đ: phí 30.000đ–50.000đ tùy khoảng cách. Tính phí tự động khi nhập địa chỉ." },
      { q: lang === "zh" ? "收到损坏的货，该怎么办？" : "Tôi nhận được hàng nhưng bị hư hỏng, phải làm gì?", a: lang === "zh" ? "收货24小时内拍照发到 support@autopart.vn 或拨打 1900 1234 投诉。换货需要3-5天处理。" : "Vui lòng chụp ảnh sản phẩm và bao bì trong vòng 24h sau khi nhận hàng, gửi về email support@autopart.vn hoặc gọi hotline 1900 1234. Chúng tôi sẽ xử lý đổi hàng trong 3-5 ngày." },
    ],
  },
  {
    category: lang === "zh" ? "产品和质量" : "Sản phẩm & Chất lượng",
    items: [
      { q: lang === "zh" ? "AutoParts 上的零件是正品吗？" : "Phụ tùng trên AutoParts có phải hàng chính hãng không?", a: lang === "zh" ? "所有OEM标签零件均为厂家正品。OES/售后均来自博世、NGK等知名品牌，配有认证。可以扫描二维码验证。" : "Tất cả sản phẩm gắn nhãn OEM là phụ tùng chính hãng từ nhà sản xuất gốc. Sản phẩm OES/Aftermarket đều từ thương hiệu uy tín (Bosch, Akebono, NGK...) và có giấy tờ xác nhận. Bạn có thể quét mã QR trên sản phẩm để xác thực." },
      { q: lang === "zh" ? "如何知道哪些零件适合我的车？" : "Làm thế nào để biết phụ tùng nào phù hợp với xe của tôi?", a: lang === "zh" ? "使用 /vin-lookup 的 VIN 查询功能，输入17位VIN码，获得100%匹配的配件清单。也可依品类及车型筛选。" : "Sử dụng tính năng Tra cứu VIN tại /vin-lookup để nhập mã VIN 17 ký tự và nhận danh sách phụ tùng 100% tương thích. Hoặc bạn có thể lọc theo hãng xe, đời xe, và model trên trang tìm kiếm." },
      { q: lang === "zh" ? "保修政策如何？" : "Chính sách bảo hành sản phẩm như thế nào?", a: lang === "zh" ? "按厂家政策OEM保修12-24个月。售后保修6-12个月。购买自动激活并在 /customer/warranty 跟踪。" : "Bảo hành OEM 12-24 tháng theo chính sách nhà sản xuất. Hàng Aftermarket 6-12 tháng. Bảo hành được kích hoạt tự động khi mua hàng và quản lý tại trang /customer/warranty." },
    ],
  },
  {
    category: lang === "zh" ? "账户及积分" : "Tài khoản & Điểm thưởng", icon: "",
    items: [
      { q: lang === "zh" ? "奖励积分计划如何运作？" : "Chương trình điểm thưởng hoạt động như thế nào?", a: lang === "zh" ? "每购买1万即可积1分。可换取优惠券或礼品。不同等级享受对应折扣等级。" : "Bạn nhận 1 điểm cho mỗi 10.000đ mua hàng. Điểm có thể đổi thành voucher giảm giá hoặc quà tặng. Tích đủ điểm để lên bậc: Silver (0-500đ), Gold (501-2000đ), Platinum (2001-5000đ), Diamond (5001+đ). Mỗi bậc có chiết khấu riêng." },
      { q: lang === "zh" ? "如何注册为经销商/附属公司？" : "Làm thế nào để đăng ký làm đại lý/CTV affiliate?", a: lang === "zh" ? "注册时选择'经销商/附属公司'，填写企业信息，并等待批准1-2工作日。佣金分T1/T2等层级。" : "Chọn 'Đại lý / CTV' khi đăng ký tài khoản tại /register, điền thông tin doanh nghiệp và chờ admin phê duyệt (1-2 ngày làm việc). Hoa hồng T1/T2: 10% trực tiếp, 5% thụ động từ nhóm." },
      { q: lang === "zh" ? "忘记密码怎么办？" : "Tôi quên mật khẩu, phải làm gì?", a: lang === "zh" ? "进入登录页选择“忘记密码”，输入电子邮件地址即可获取重置密码连结。没看到注意检查垃圾邮件。" : "Truy cập /login > nhấn 'Quên mật khẩu' -> nhập email đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu trong vòng 5 phút. Kiểm tra cả hộp thư spam nếu không thấy." },
    ],
  },
];

export default function HelpPage() {
  const { t, fp, lang } = useLang();
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState((lang === "zh" ? "全部" : "Tất cả"));

  const faqs = getFaqs(lang);
  const categories = [(lang === "zh" ? "全部" : "Tất cả"), ...faqs.map(f => f.category)];

  const filtered = faqs.map(section => ({
    ...section,
    items: section.items.filter(item =>
      search === "" || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section =>
    (activeCategory === (lang === "zh" ? "全部" : "Tất cả") || section.category === activeCategory) && section.items.length > 0
  );

  const totalResults = filtered.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />

      {/* Hero */}
      <div className="py-14 px-6 text-center" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
        <h1 className="text-3xl font-extrabold text-white mb-3">{t("helpTitle")}</h1>
        <p className="text-[#8f9294] mb-6">{lang === "zh" ? "快速查找答案或联系支持团队" : "Tìm câu trả lời nhanh hoặc liên hệ đội hỗ trợ của chúng tôi"}</p>
        <div className="relative max-w-xl mx-auto">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "zh" ? "搜索问题..." : "Tìm kiếm câu hỏi..."} className="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4b97]" />
        </div>
        {search && <p className="text-[#8f9294] text-sm mt-2">{totalResults} {lang === "zh" ? "结果关于" : "kết quả cho"} "{search}"</p>}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${activeCategory === c ? "text-white border-transparent" : "border-[#e5e5e5] text-slate-600 bg-white hover:border-orange-300"}`}
              style={activeCategory === c ? { background: "var(--ap-primary)" } : {}}>
              {c}
            </button>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-5">
          {filtered.map(section => (
            <div key={section.category} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="font-bold text-[#44494d]">{section.category}</h2>
                <span className="text-xs text-[#8f9294] ml-1">({section.items.length} {lang === "zh" ? "点" : "câu hỏi"})</span>
              </div>
              <div>
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={i} className="border-b border-slate-50 last:border-0">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#f8f8fa] transition-colors">
                        <span className="font-bold text-xs mt-0.5 shrink-0" style={{ color: "var(--ap-primary)" }}>Q</span>
                        <p className="flex-1 font-semibold text-[#44494d] text-sm leading-relaxed">{item.q}</p>
                        {isOpen ? "▴" : "▾"}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <div className="ml-5 text-sm text-slate-600 leading-relaxed p-4 rounded-xl" style={{ background: "#F0FDF4", borderLeft: "3px solid #22C55E" }}>
                            {item.a}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact support */}
        <div className="mt-8 bg-white rounded-2xl border border-[#f0f0f0] p-6">
          <h2 className="font-bold text-[#44494d] text-center mb-6">{lang === "zh" ? "仍未找到答案吗？" : "Vẫn chưa tìm được câu trả lời?"}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: (lang === "zh" ? "在线聊天" : "Chat trực tiếp"), desc: (lang === "zh" ? "每天 8:00–22:00" : "Hỗ trợ 8h-22h, T2-CN"), action: (lang === "zh" ? "开始聊天" : "Bắt đầu chat"), color: "var(--ap-primary)", href: "" },
              { title: "Hotline", desc: "1900 1234 — 24/7", action: (lang === "zh" ? "现在拨打" : "Gọi ngay"), color: "#22C55E", href: "tel:19001234" },
              { title: "Email", desc: "support@autopart.vn", action: (lang === "zh" ? "发电子邮件" : "Gửi email"), color: "var(--ap-primary)", href: "mailto:support@autopart.vn?subject=Yêu cầu hỗ trợ AutoParts" },
            ].map(c => (
              <div key={c.title} className="text-center p-5 rounded-2xl border-2 border-[#f0f0f0] hover:border-[#e5e5e5] transition-all">
                <h3 className="font-bold text-[#44494d] mb-1">{c.title}</h3>
                <p className="text-[#8f9294] text-sm mb-3">{c.desc}</p>
                {c.href ? (
                  <a href={c.href} className="inline-block px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: c.color }}>
                    {c.action}
                  </a>
                ) : (
                  <button
                    onClick={() => { window.dispatchEvent(new CustomEvent("open-chat")); window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "正在打开在线客服…" : "Đang mở khung chat hỗ trợ…", type: "info" } })); }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: c.color }}>
                    {c.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <StorefrontFooter />
    </div>
  );
}

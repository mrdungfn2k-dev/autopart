"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

interface SupportSection {
  id: string;
  icon: string;
  vi: { title: string; lines: string[] };
  zh: { title: string; lines: string[] };
}

const SECTIONS: SupportSection[] = [
  {
    id: "order-guide",
    icon: "",
    vi: {
      title: "Hướng dẫn đặt hàng",
      lines: [
        "Bước 1: Tìm kiếm sản phẩm theo tên, danh mục hoặc dùng tính năng tra cứu theo xe hoặc số VIN.",
        "Bước 2: Thêm sản phẩm vào giỏ hàng.",
        "Bước 3: Xem lại giỏ hàng và nhấn Thanh toán.",
        "Bước 4: Điền thông tin giao hàng và chọn phương thức thanh toán.",
        "Bước 5: Xác nhận đơn hàng và theo dõi tại trang /tracking.",
      ],
    },
    zh: {
      title: "订购指南",
      lines: [
        "第1步：按名称、类别或使用VIN查询功能搜索产品。",
        "第2步：将产品添加到购物车。",
        "第3步：查看购物车并点击结算。",
        "第4步：填写收货信息并选择支付方式。",
        "第5步：确认订单并在 /tracking 页面追踪。",
      ],
    },
  },
  {
    id: "contract-guide",
    icon: "",
    vi: {
      title: "Hướng dẫn ký hợp đồng điện tử",
      lines: [
        "Với các đơn hàng lớn hoặc giao dịch thương mại, AutoParts hỗ trợ ký hợp đồng điện tử theo quy định pháp luật.",
        "",
        "1. Đăng nhập tài khoản và vào mục Đơn hàng.",
        "2. Chọn đơn hàng cần ký hợp đồng.",
        "3. Nhấn Ký hợp đồng điện tử và làm theo hướng dẫn từ hệ thống.",
        "4. Hợp đồng sẽ được lưu trong tài khoản của bạn sau khi ký xong.",
      ],
    },
    zh: {
      title: "电子合同签署指南",
      lines: [
        "对于大额订单或商业交易，AutoParts 支持符合法规的电子合同签署。",
        "",
        "1. 登录账户后进入订单管理。",
        "2. 选择需要签署合同的订单。",
        "3. 点击签署电子合同并按照系统提示操作。",
        "4. 签署完成后，合同将保存在您的账户中。",
      ],
    },
  },
  {
    id: "usage-guide",
    icon: "📖",
    vi: {
      title: "Hướng dẫn sử dụng",
      lines: [
        "Hệ thống AutoParts hỗ trợ 5 loại tài khoản: Khách hàng, Nhà cung cấp, Đại lý/CTV, Thợ Kỹ thuật và Quản trị viên.",
        "",
        "• Khách hàng: Tìm kiếm và mua phụ tùng, quản lý xe, theo dõi đơn hàng và bảo hành.",
        "• Nhà cung cấp: Đăng sản phẩm, quản lý đơn và kho hàng, theo dõi tài chính.",
        "• Đại lý/CTV: Tạo link affiliate, theo dõi hoa hồng và quản lý đội nhóm.",
        "• Thợ kỹ thuật: Đặt phụ tùng theo xe khách, nhận hỗ trợ kỹ thuật.",
        "• Admin: Quản lý toàn bộ hệ thống.",
      ],
    },
    zh: {
      title: "使用说明",
      lines: [
        "AutoParts 系统支持5种账户类型：客户、供应商、经销商/推广员、技师和管理员。",
        "",
        "• 客户：搜索购买配件、管理车辆、跟踪订单和质保。",
        "• 供应商：发布产品、管理订单和库存、跟踪财务。",
        "• 经销商/推广员：创建推广链接、跟踪佣金、管理团队。",
        "• 技师：按客户车型订购配件、获取技术支持。",
        "• 管理员：管理整个平台。",
      ],
    },
  },
  {
    id: "shipping-estimate",
    icon: "🚚",
    vi: {
      title: "Ước tính chi phí vận chuyển",
      lines: [
        "Phí vận chuyển được tính tự động dựa vào địa chỉ giao hàng và trọng lượng sản phẩm.",
        "",
        "Miễn phí vận chuyển cho đơn từ 500.000đ.",
        "",
        "Phí chung cho đơn dưới 500.000đ:",
        "• Nội thành (cùng tỉnh/thành phố): 25.000đ – 35.000đ",
        "• Liên tỉnh: 35.000đ – 50.000đ",
        "• Vùng sâu, vùng xa, hải đảo: 50.000đ – 80.000đ",
        "",
        "Phí chính xác sẽ hiển thị khi bạn nhập địa chỉ tại trang thanh toán.",
      ],
    },
    zh: {
      title: "预估运费",
      lines: [
        "运费根据收货地址和产品重量自动计算。",
        "",
        "500,000越南盾以上免运费。",
        "",
        "500,000越南盾以下的一般费用：",
        "• 同城（同省/市）：25,000–35,000越南盾",
        "• 跨省：35,000–50,000越南盾",
        "• 偏远地区、海岛：50,000–80,000越南盾",
        "",
        "在结算页填写地址时将显示精确费用。",
      ],
    },
  },
];

export default function SupportPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />

      {/* Hero */}
      <div className="py-14 px-6 text-center" style={{ background: "linear-gradient(135deg, #0F172A, #1E3A6E)" }}>
        <h1 className="text-3xl font-extrabold text-white mb-3">
          {lang === "zh" ? "客户服务中心" : "Trung Tâm Hỗ Trợ Khách Hàng"}
        </h1>
        <p className="text-[#94a3b8] mb-6">
          {lang === "zh" ? "我们随时为您提供帮助" : "Chúng tôi luôn sẵn sàng hỗ trợ bạn"}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20">
              {s.icon} {lang === "zh" ? s.zh.title : s.vi.title}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Guide Cards */}
        {SECTIONS.map(s => {
          const content = lang === "zh" ? s.zh : s.vi;
          return (
            <div key={s.id} id={s.id} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden scroll-mt-20">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0f0f0]" style={{ background: "linear-gradient(90deg,#f0f6ff,#fff)" }}>
                <span className="text-2xl">{s.icon}</span>
                <h2 className="font-bold text-[#1a4b97] text-lg">{content.title}</h2>
              </div>
              <div className="px-6 py-5">
                {content.lines.map((line, i) => (
                  <p key={i} className={`text-[#44494d] text-sm leading-relaxed ${line === "" ? "mt-3" : "mt-1"}`}>
                    {line || "\u00a0"}
                  </p>
                ))}
              </div>
            </div>
          );
        })}

        {/* Contact block */}
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 mt-4">
          <h2 className="font-bold text-[#44494d] text-center mb-6 text-xl">
            {lang === "zh" ? "仍需帮助？联系我们" : "Vẫn cần hỗ trợ thêm? Liên hệ chúng tôi"}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: "💬",
                title: lang === "zh" ? "在线聊天" : "Chat trực tiếp",
                desc: lang === "zh" ? "8:00–22:00 每天" : "8h–22h hàng ngày",
                action: lang === "zh" ? "开始聊天" : "Bắt đầu chat",
                href: "",
              },
              { icon: "📞", title: "Hotline", desc: "1900 8095", action: lang === "zh" ? "现在拨打" : "Gọi ngay", href: "tel:19008095" },
              {
                icon: "✉️",
                title: "Email",
                desc: "cskh@autoparts.vn",
                action: lang === "zh" ? "发送邮件" : "Gửi email",
                href: "mailto:cskh@autoparts.vn?subject=Yêu cầu hỗ trợ AutoParts",
              },
            ].map(c => (
              <div key={c.title} className="text-center p-5 rounded-2xl border-2 border-[#f0f0f0] hover:border-[#1a4b97]/30 transition-all">
                <div className="text-3xl mb-2">{c.icon}</div>
                <h3 className="font-bold text-[#44494d] mb-1">{c.title}</h3>
                <p className="text-[#8f9294] text-sm mb-3">{c.desc}</p>
                {c.href ? (
                  <a href={c.href} className="inline-block px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "var(--ap-primary)" }}>{c.action}</a>
                ) : (
                  <button onClick={() => { window.dispatchEvent(new CustomEvent("open-chat")); window.dispatchEvent(new CustomEvent("app-toast", { detail: { message: lang === "zh" ? "正在打开在线客服…" : "Đang mở khung chat hỗ trợ…", type: "info" } })); }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "var(--ap-primary)" }}>{c.action}</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Also see */}
        <div className="text-center py-4">
          <Link href="/help" className="text-[#1a4b97] text-sm font-semibold hover:underline">
            {lang === "zh" ? "→ 查看常见问题解答" : "→ Xem thêm câu hỏi thường gặp tại /help"}
          </Link>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}

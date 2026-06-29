"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

interface PrivacySection {
  title: string;
  lines: string[];
}
interface PrivacyContent {
  title: string;
  subtitle: string;
  sections: PrivacySection[];
}

const viContent: PrivacyContent = {
  title: "Chính Sách Bảo Mật",
  subtitle: "Cập nhật lần cuối: 01/01/2025",
  sections: [
    {
      title: "1. Thông tin chúng tôi thu thập",
      lines: [
        "Khi bạn sử dụng dịch vụ AutoParts, chúng tôi có thể thu thập các thông tin sau:",
        "",
        "• Thông tin định danh: Họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng.",
        "• Thông tin thanh toán: Được xử lý qua các cổng thanh toán bảo mật (VNPay, MoMo, ZaloPay). AutoParts không lưu trữ thông tin thẻ tín dụng.",
        "• Thông tin thiết bị và truy cập: Địa chỉ IP, loại trình duyệt, trang đã xem — dùng để cải thiện trải nghiệm.",
        "• Thông tin xe: Hãng xe, đời xe, số VIN — dùng để gợi ý phụ tùng phù hợp.",
      ],
    },
    {
      title: "2. Cách chúng tôi sử dụng thông tin",
      lines: [
        "• Xử lý và giao hàng đơn hàng của bạn.",
        "• Gửi thông báo về trạng thái đơn hàng và bảo hành.",
        "• Cải thiện chất lượng sản phẩm và dịch vụ.",
        "• Gửi thông tin khuyến mãi (chỉ khi bạn đồng ý).",
        "• Phát hiện và ngăn chặn gian lận.",
        "• Tuân thủ nghĩa vụ pháp lý.",
      ],
    },
    {
      title: "3. Chia sẻ thông tin",
      lines: [
        "AutoParts không bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn với bên thứ ba vì mục đích thương mại.",
        "",
        "Chúng tôi chỉ chia sẻ thông tin với:",
        "• Đơn vị vận chuyển (GHN, GHTK, Viettel Post) để giao hàng.",
        "• Nhà cung cấp xử lý đơn hàng của bạn.",
        "• Cơ quan nhà nước khi được yêu cầu theo quy định pháp luật.",
      ],
    },
    {
      title: "4. Bảo mật dữ liệu",
      lines: [
        "Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức tiêu chuẩn ngành:",
        "",
        "• Mã hóa SSL/TLS cho mọi kết nối.",
        "• Mật khẩu được băm bằng bcrypt — chúng tôi không thể xem mật khẩu của bạn.",
        "• Kiểm soát truy cập theo vai trò (Role-Based Access Control).",
        "• Giám sát hệ thống 24/7 để phát hiện xâm nhập.",
      ],
    },
    {
      title: "5. Cookie và theo dõi",
      lines: [
        "Chúng tôi sử dụng cookie cần thiết để duy trì phiên đăng nhập và giỏ hàng. Không sử dụng cookie theo dõi của bên thứ ba mà không có sự đồng ý của bạn.",
        "",
        "Bạn có thể tắt cookie trong trình duyệt, nhưng điều này có thể ảnh hưởng đến một số chức năng của trang web.",
      ],
    },
    {
      title: "6. Quyền của bạn",
      lines: [
        "Bạn có quyền:",
        "• Yêu cầu xem thông tin cá nhân chúng tôi đang lưu về bạn.",
        "• Yêu cầu chỉnh sửa thông tin không chính xác.",
        "• Yêu cầu xóa tài khoản và dữ liệu liên quan.",
        "• Từ chối nhận email marketing bất kỳ lúc nào.",
        "",
        "Liên hệ: cskh@autoparts.vn để thực hiện các quyền trên.",
      ],
    },
    {
      title: "7. Liên hệ",
      lines: [
        "Nếu có bất kỳ câu hỏi hoặc khiếu nại về chính sách bảo mật:",
        "",
        "• Email: cskh@autoparts.vn",
        "• Hotline: 1900 8095",
        "• Địa chỉ: Tòa nhà AutoParts, Ngõ 15 Duy Tân, Cầu Giấy, Hà Nội",
      ],
    },
  ],
};

const zhContent: PrivacyContent = {
  title: "隐私政策",
  subtitle: "最后更新：2025年01月01日",
  sections: [
    {
      title: "1. 我们收集的信息",
      lines: [
        "当您使用 AutoParts 服务时，我们可能收集以下信息：",
        "",
        "• 身份信息：姓名、邮箱、手机号、收货地址。",
        "• 支付信息：通过安全支付网关处理（VNPay、MoMo、ZaloPay）。AutoParts 不存储信用卡信息。",
        "• 设备和访问信息：IP地址、浏览器类型、已浏览页面——用于改善用户体验。",
        "• 车辆信息：品牌、年份、VIN码——用于推荐合适配件。",
      ],
    },
    {
      title: "2. 信息使用方式",
      lines: [
        "• 处理和配送您的订单。",
        "• 发送订单状态和质保通知。",
        "• 改善产品和服务质量。",
        "• 发送促销信息（仅在您同意的情况下）。",
        "• 检测和防止欺诈。",
        "• 履行法律义务。",
      ],
    },
    {
      title: "3. 信息共享",
      lines: [
        "AutoParts 不会为商业目的向第三方出售、出租或交换您的个人信息。",
        "",
        "我们仅与以下方共享：",
        "• 物流公司（GHN、GHTK、Viettel Post）用于配送。",
        "• 处理您订单的供应商。",
        "• 依法律要求向政府机关提供。",
      ],
    },
    {
      title: "4. 数据安全",
      lines: [
        "我们采用行业标准的技术和组织安全措施：",
        "",
        "• 所有连接采用 SSL/TLS 加密。",
        "• 密码使用 bcrypt 哈希——我们无法查看您的密码。",
        "• 基于角色的访问控制 (RBAC)。",
        "• 24/7 系统监控，检测入侵行为。",
      ],
    },
    {
      title: "5. Cookie 和追踪",
      lines: [
        "我们使用必要的 Cookie 来维持登录会话和购物车。未经您同意，不使用第三方追踪 Cookie。",
        "",
        "您可以在浏览器中禁用 Cookie，但这可能影响某些网站功能。",
      ],
    },
    {
      title: "6. 您的权利",
      lines: [
        "您有权：",
        "• 请求查看我们存储的您的个人信息。",
        "• 请求更正不准确的信息。",
        "• 请求删除账户及相关数据。",
        "• 随时退订营销邮件。",
        "",
        "联系方式：cskh@autoparts.vn",
      ],
    },
    {
      title: "7. 联系方式",
      lines: [
        "如有任何关于隐私政策的问题或投诉：",
        "",
        "• 邮箱：cskh@autoparts.vn",
        "• 热线：1900 8095",
        "• 地址：河内市，纸桥区，维新巷15号，AutoParts大厦",
      ],
    },
  ],
};

export default function PrivacyPage() {
  const { lang } = useLang();
  const c = lang === "zh" ? zhContent : viContent;

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />

      {/* Hero */}
      <div className="py-14 px-6 text-center" style={{ background: "linear-gradient(135deg, #0F172A, #1E3A6E)" }}>
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-3xl font-extrabold text-white mb-2">{c.title}</h1>
        <p className="text-[#94a3b8] text-sm">{c.subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {c.sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f0f0f0]" style={{ background: "linear-gradient(90deg,#f0f6ff,#fff)" }}>
              <h2 className="font-bold text-[#1a4b97]">{sec.title}</h2>
            </div>
            <div className="px-6 py-5">
              {sec.lines.map((line, j) => (
                <p key={j} className={`text-sm leading-relaxed text-[#44494d] ${line === "" ? "mt-3" : "mt-1"}`}>
                  {line || "\u00a0"}
                </p>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center py-4">
          <Link href="/policy" className="text-[#1a4b97] text-sm font-semibold hover:underline mr-6">
            {lang === "zh" ? "← Xem Chính sách khác" : "← Xem chính sách khác"}
          </Link>
          <Link href="/support" className="text-[#1a4b97] text-sm font-semibold hover:underline">
            {lang === "zh" ? "Liên hệ hỗ trợ →" : "Liên hệ hỗ trợ →"}
          </Link>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}

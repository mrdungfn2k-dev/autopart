"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

interface PolicySection {
  heading: string;
  lines: string[];
}
interface PolicyContent {
  title: string;
  sections: PolicySection[];
}
interface Policy {
  id: string;
  icon: string;
  vi: PolicyContent;
  zh: PolicyContent;
}

const POLICIES: Policy[] = [
  {
    id: "shipping-policy",
    icon: "🚚",
    vi: {
      title: "Chính Sách Vận Chuyển",
      sections: [
        { heading: "Phạm vi giao hàng", lines: ["AutoParts giao hàng trên toàn quốc 63 tỉnh thành thông qua các đơn vị vận chuyển uy tín: GHN, GHTK, Viettel Post."] },
        { heading: "Thời gian giao hàng", lines: ["• TP.HCM & Hà Nội: 1–2 ngày làm việc", "• Tỉnh thành khác: 2–4 ngày làm việc", "• Vùng sâu, vùng xa, đảo: 4–7 ngày"] },
        { heading: "Phí vận chuyển", lines: ["Miễn phí cho đơn hàng từ 500.000đ. Đơn dưới 500.000đ: phí từ 25.000đ–80.000đ tùy địa điểm."] },
        { heading: "Theo dõi đơn hàng", lines: ["Khách hàng có thể theo dõi đơn hàng theo thời gian thực tại trang /tracking bằng mã đơn hàng."] },
      ],
    },
    zh: {
      title: "配送政策",
      sections: [
        { heading: "配送范围", lines: ["AutoParts 通过 GHN、GHTK、Viettel Post 等知名快递公司向越南全国63个省市配送。"] },
        { heading: "配送时间", lines: ["• 胡志明市和河内：1–2 个工作日", "• 其他省市：2–4 个工作日", "• 偏远地区和海岛：4–7 天"] },
        { heading: "运费", lines: ["500,000越南盾以上免运费。500,000以下：根据地区收取 25,000–80,000越南盾。"] },
        { heading: "订单追踪", lines: ["客户可以在 /tracking 页面使用订单号实时追踪订单状态。"] },
      ],
    },
  },
  {
    id: "privacy-info",
    icon: "🔒",
    vi: {
      title: "Chính Sách Bảo Mật Thông Tin Cá Nhân",
      sections: [
        { heading: "Thu thập thông tin", lines: ["AutoParts thu thập các thông tin bạn cung cấp khi đăng ký, đặt hàng và sử dụng dịch vụ, bao gồm: tên, email, số điện thoại, địa chỉ giao hàng và thông tin thanh toán (được mã hóa)."] },
        { heading: "Mục đích sử dụng", lines: ["Thông tin được dùng để: xử lý đơn hàng, liên lạc về giao hàng, cải thiện dịch vụ, gửi thông báo khuyến mãi (nếu bạn đồng ý) và tuân thủ quy định pháp luật."] },
        { heading: "Chia sẻ thông tin", lines: ["AutoParts không bán thông tin cá nhân. Chúng tôi chỉ chia sẻ với đơn vị vận chuyển và đối tác thanh toán để hoàn tất đơn hàng."] },
        { heading: "Bảo mật dữ liệu", lines: ["Hệ thống sử dụng mã hóa SSL/TLS. Mật khẩu được mã hóa bcrypt. Dữ liệu nhạy cảm không bao giờ được lưu dưới dạng văn bản thô."] },
        { heading: "Quyền của bạn", lines: ["Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào bằng cách liên hệ cskh@autoparts.vn."] },
      ],
    },
    zh: {
      title: "个人信息保护政策",
      sections: [
        { heading: "信息收集", lines: ["AutoParts 收集您注册、下单和使用服务时提供的信息，包括：姓名、邮箱、手机号、收货地址和支付信息（已加密）。"] },
        { heading: "使用目的", lines: ["信息用于：处理订单、配送通知、改善服务、发送促销通知（如您同意）以及遵守法规要求。"] },
        { heading: "信息共享", lines: ["AutoParts 不出售个人信息。我们仅与物流公司和支付合作伙伴共享以完成订单。"] },
        { heading: "数据安全", lines: ["系统使用 SSL/TLS 加密。密码经 bcrypt 加密。敏感数据绝不以明文形式存储。"] },
        { heading: "您的权利", lines: ["您随时可以通过联系 cskh@autoparts.vn 查看、修改或删除个人信息。"] },
      ],
    },
  },
  {
    id: "return-policy",
    icon: "↩️",
    vi: {
      title: "Chính Sách Trả Hàng & Hoàn Tiền",
      sections: [
        { heading: "Điều kiện trả hàng", lines: ["Chấp nhận trả hàng trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi do nhà sản xuất, giao nhầm sản phẩm, hoặc sản phẩm không đúng mô tả."] },
        { heading: "Quy trình đổi trả", lines: ["1. Liên hệ hỗ trợ qua email hoặc hotline.", "2. Cung cấp ảnh/video làm bằng chứng.", "3. Gửi sản phẩm về kho (AutoParts hỗ trợ phí vận chuyển nếu lỗi từ chúng tôi).", "4. Hoàn tiền hoặc đổi hàng trong 3–5 ngày làm việc."] },
        { heading: "Hoàn tiền", lines: ["Hoàn tiền về phương thức thanh toán gốc trong 5–10 ngày làm việc (tùy ngân hàng/ví điện tử)."] },
        { heading: "Trường hợp không áp dụng", lines: ["Không áp dụng cho sản phẩm đã qua sử dụng, hàng Flash Sale (trừ lỗi sản xuất), và sản phẩm bị hư hỏng do người dùng."] },
      ],
    },
    zh: {
      title: "退换货与退款政策",
      sections: [
        { heading: "退货条件", lines: ["收货后7天内可退货：产品存在制造商缺陷、发错产品或产品与描述不符。"] },
        { heading: "退换货流程", lines: ["1. 通过邮件或热线联系客服。", "2. 提供照片/视频作为证据。", "3. 将产品寄回仓库（如为我方原因，AutoParts 承担运费）。", "4. 3–5个工作日内完成退款或换货。"] },
        { heading: "退款", lines: ["退款将在5–10个工作日内退回原支付方式（具体取决于银行/电子钱包）。"] },
        { heading: "不适用情况", lines: ["已使用产品、限时特卖（制造缺陷除外）以及用户损坏的产品不适用退货政策。"] },
      ],
    },
  },
  {
    id: "prohibited",
    icon: "🚫",
    vi: {
      title: "Hàng Cấm & Hàng Gửi Có Điều Kiện",
      sections: [
        { heading: "Hàng cấm lưu thông", lines: ["AutoParts không cho phép kinh doanh: phụ tùng giả, phụ tùng không rõ nguồn gốc, hàng hóa vi phạm sở hữu trí tuệ, chất nguy hiểm, và bất kỳ mặt hàng nào bị cấm theo quy định pháp luật Việt Nam."] },
        { heading: "Hàng gửi có điều kiện", lines: ["Một số phụ tùng đặc biệt (ví dụ: túi khí, pháo hiệu, hóa chất ô tô) yêu cầu giấy phép kinh doanh phù hợp và tuân thủ điều kiện vận chuyển đặc biệt theo quy định của đơn vị vận chuyển."] },
        { heading: "Quy định về nhà cung cấp", lines: ["Nhà cung cấp phải cung cấp đầy đủ chứng từ nguồn gốc hàng hóa và chịu trách nhiệm pháp lý về tính hợp pháp của sản phẩm đăng bán."] },
      ],
    },
    zh: {
      title: "违禁品及受限物品",
      sections: [
        { heading: "违禁品", lines: ["AutoParts 不允许销售：假冒配件、来源不明的配件、侵犯知识产权的商品、危险物质以及越南法律规定的任何违禁商品。"] },
        { heading: "受限物品", lines: ["某些特殊配件（如安全气囊、信号弹、汽车化学品）需要相应营业执照，并须遵守快递公司的特殊运输要求。"] },
        { heading: "供应商规定", lines: ["供应商必须提供完整的商品来源证明，并对其发布产品的合法性承担法律责任。"] },
      ],
    },
  },
];

export default function PolicyPage() {
  const { lang } = useLang();

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />

      {/* Hero */}
      <div className="py-14 px-6 text-center" style={{ background: "linear-gradient(135deg, #0F172A, #1E3A6E)" }}>
        <h1 className="text-3xl font-extrabold text-white mb-3">
          {lang === "zh" ? "AutoParts 政策中心" : "Chính Sách AutoParts"}
        </h1>
        <p className="text-[#94a3b8] mb-6">
          {lang === "zh" ? "透明、公平、负责任的平台运营政策" : "Chính sách vận hành nền tảng minh bạch, công bằng và có trách nhiệm"}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {POLICIES.map(p => (
            <a key={p.id} href={`#${p.id}`}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20">
              {p.icon} {lang === "zh" ? p.zh.title : p.vi.title}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {POLICIES.map(pol => {
          const content = lang === "zh" ? pol.zh : pol.vi;
          return (
            <div key={pol.id} id={pol.id} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden scroll-mt-20">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-[#f0f0f0]" style={{ background: "linear-gradient(90deg,#f0f6ff,#fff)" }}>
                <span className="text-2xl">{pol.icon}</span>
                <h2 className="font-bold text-[#1a4b97] text-xl">{content.title}</h2>
              </div>
              <div className="px-6 py-6 space-y-5">
                {content.sections.map((sec, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-[#44494d] mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-5 rounded-full inline-block" style={{ background: "var(--ap-primary)" }} />
                      {sec.heading}
                    </h3>
                    {sec.lines.map((line, j) => (
                      <p key={j} className="text-[#44494d] text-sm leading-relaxed mt-1 ml-3">{line}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer note */}
        <div className="text-center text-sm text-[#8f9294] py-4">
          {lang === "zh"
            ? "如有疑问，请联系 cskh@autoparts.vn 或拨打 1900 8095"
            : "Nếu có thắc mắc, vui lòng liên hệ cskh@autoparts.vn hoặc gọi 1900 8095"}
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}

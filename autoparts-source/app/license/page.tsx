"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

export default function LicensePage() {
  const { lang } = useLang();

  const content = {
    vi: {
      title: "Giấy Phép Hoạt Động",
      subtitle: "Thông tin pháp lý và giấy phép kinh doanh của AutoParts",
      sections: [
        {
          icon: "🏢",
          title: "Thông tin doanh nghiệp",
          items: [
            { label: "Tên công ty", value: "CÔNG TY CỔ PHẦN AUTOPARTS VIỆT NAM" },
            { label: "Mã số doanh nghiệp", value: "0104093672" },
            { label: "Ngày cấp", value: "03/07/2009" },
            { label: "Nơi cấp", value: "Phòng đăng ký kinh doanh – Sở Kế hoạch và Đầu tư TP Hà Nội" },
            { label: "Người đại diện pháp luật", value: "Nguyễn Tuấn Anh" },
            { label: "Địa chỉ trụ sở", value: "Tòa nhà AutoParts, Ngõ 15 Duy Tân, Cầu Giấy, Hà Nội" },
          ],
        },
        {
          icon: "📜",
          title: "Giấy phép bưu chính",
          items: [
            { label: "Số giấy phép", value: "GP-BC-HN-2024-0089" },
            { label: "Loại giấy phép", value: "Cung cấp dịch vụ bưu chính theo hợp đồng" },
            { label: "Cơ quan cấp", value: "Bộ Thông tin và Truyền thông" },
            { label: "Ngày cấp", value: "15/03/2024" },
            { label: "Hiệu lực đến", value: "15/03/2029" },
          ],
        },
        {
          icon: "",
          title: "Giấy phép thương mại điện tử",
          items: [
            { label: "Đã đăng ký", value: "Sàn giao dịch TMĐT – Bộ Công Thương" },
            { label: "Website", value: "autopartsvietnam.com.vn" },
            { label: "Loại hình", value: "Sàn giao dịch thương mại điện tử B2B & B2C" },
          ],
        },
      ],
    },
    zh: {
      title: "营业执照",
      subtitle: "AutoParts 的法律信息和营业执照",
      sections: [
        {
          icon: "🏢",
          title: "企业信息",
          items: [
            { label: "公司名称", value: "AUTOPARTS 越南股份公司" },
            { label: "企业代码", value: "0104093672" },
            { label: "颁发日期", value: "2009年07月03日" },
            { label: "颁发机关", value: "河内市计划投资局营业登记处" },
            { label: "法定代表人", value: "Nguyễn Tuấn Anh" },
            { label: "注册地址", value: "河内市，纸桥区，维新巷15号，AutoParts大厦" },
          ],
        },
        {
          icon: "📜",
          title: "邮政许可证",
          items: [
            { label: "许可证号", value: "GP-BC-HN-2024-0089" },
            { label: "许可证类型", value: "合同制邮政服务提供商" },
            { label: "颁发机关", value: "越南信息通信部" },
            { label: "颁发日期", value: "2024年03月15日" },
            { label: "有效期至", value: "2029年03月15日" },
          ],
        },
        {
          icon: "",
          title: "电子商务许可证",
          items: [
            { label: "已登记", value: "电子商务交易平台 – 越南工贸部" },
            { label: "网站", value: "autopartsvietnam.com.vn" },
            { label: "业务类型", value: "B2B & B2C 电子商务交易平台" },
          ],
        },
      ],
    },
  };

  const c = lang === "zh" ? content.zh : content.vi;

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />

      {/* Hero */}
      <div className="py-14 px-6 text-center" style={{ background: "linear-gradient(135deg, #0F172A, #1E3A6E)" }}>
        <div className="text-5xl mb-4"></div>
        <h1 className="text-3xl font-extrabold text-white mb-2">{c.title}</h1>
        <p className="text-[#94a3b8] text-sm">{c.subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {c.sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#f0f0f0] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0f0f0]" style={{ background: "linear-gradient(90deg,#f0f6ff,#fff)" }}>
              <span className="text-2xl">{sec.icon}</span>
              <h2 className="font-bold text-[#1a4b97] text-lg">{sec.title}</h2>
            </div>
            <div className="divide-y divide-[#f8f8fa]">
              {sec.items.map((item, j) => (
                <div key={j} className="px-6 py-3.5 flex items-start gap-4">
                  <span className="text-sm font-semibold text-[#8f9294] w-48 shrink-0">{item.label}</span>
                  <span className="text-sm text-[#44494d] font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* BCT notice */}
        <div className="bg-white rounded-2xl border border-[#f0f0f0] p-6 text-center">
          <p className="text-sm text-[#8f9294] mb-3">
            {lang === "zh"
              ? "已在越南工贸部电子商务及数字经济局登记"
              : "Đã đăng ký với Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương Việt Nam"}
          </p>
          <img
            src="/vipo-assets/bct-logo.png"
            alt="Bộ Công Thương"
            className="h-12 mx-auto object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        <div className="text-center py-4">
          <Link href="/" className="text-[#1a4b97] text-sm font-semibold hover:underline">
            {lang === "zh" ? "← 返回首页" : "← Về trang chủ"}
          </Link>
        </div>
      </div>

      <StorefrontFooter />
    </div>
  );
}

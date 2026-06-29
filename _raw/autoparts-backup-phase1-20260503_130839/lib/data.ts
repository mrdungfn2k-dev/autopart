// =====================================================================
// DATA — Yongye Canton Auto Parts (Guangzhou Yongye Auto Parts Co., Ltd.)
// Source: https://yongyecanton.en.alibaba.com
// =====================================================================
import type { Lang } from "@/lib/i18n";

/** Helper to get localized field */
export function getLocalized<T extends {
  nameZh?: string; descZh?: string; name?: string; desc?: string; categoryNameZh?: string; categoryName?: string
}>(item: T, lang: Lang) {
  return {
    ...item,
    name: lang === "zh" ? (item.nameZh ?? item.name ?? "") : (item.name ?? ""),
    desc: lang === "zh" ? (item.descZh ?? item.desc ?? "") : (item.desc ?? ""),
    categoryName: lang === "zh" ? (item.categoryNameZh ?? item.categoryName ?? "") : (item.categoryName ?? ""),
  };
}

export function getFlagUrl(originName?: string, img?: string) {
  if (img && img.trim() !== '') return img;
  if (!originName) return null;
  const cleanName = originName.toLowerCase().replace(/\s*\(coming\)\s*/i, '').replace(/coming/i, '').trim();
  const map: Record<string, string> = {
    "việt nam": "vn", "trung quốc": "cn", "nhật bản": "jp", "hàn quốc": "kr", 
    "mỹ": "us", "đức": "de", "thái lan": "th", "đài loan": "tw", "ấn độ": "in", "indonesia": "id",
    "hàn": "kr", "trung": "cn", "việt": "vn", "nhật": "jp", "úc": "au", "australia": "au", "nga": "ru",
    "pháp": "fr", "ý": "it", "anh": "gb", "canada": "ca", "mexico": "mx", "brazil": "br", "séc": "cz",
    "thụy điển": "se", "tây ban nha": "es", "hungary": "hu", "malaysia": "my", "singapore": "sg", "philippines": "ph"
  };
  const code = map[cleanName];
  if (code) return `https://flagcdn.com/w20/${code}.png`;
  
  for (const [key, val] of Object.entries(map)) {
     if (cleanName.includes(key)) return `https://flagcdn.com/w20/${val}.png`;
  }
  return null;
}

// ─── Brands carried by Yongye Canton ──────────────────────────────────
export const brands = [
  "Toyota", "Honda", "BYD", "Tesla", "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Volkswagen", "Audi",
  "Geely", "SAIC", "Great Wall", "Chery", "NIO"
];

export const models: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "RAV4", "Fortuner", "Hilux", "Land Cruiser", "bZ4X"],
  Honda: ["Civic", "City", "CR-V", "e:NS1", "Accord", "HR-V"],
  BYD: ["Han", "Tang", "Seal", "Dolphin", "Atto 3", "Song Plus", "Yuan Plus"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  Hyundai: ["Ioniq 5", "Ioniq 6", "Kona Electric", "Tucson", "Santa Fe"],
  Kia: ["EV6", "EV9", "Niro EV", "Sportage", "Sorento"],
  BMW: ["i3", "i4", "iX", "3 Series", "5 Series", "X5"],
  "Mercedes-Benz": ["EQA", "EQB", "EQC", "EQS", "C-Class", "E-Class"],
  Volkswagen: ["ID.4", "ID.3", "Tiguan", "Passat", "Golf"],
  Audi: ["e-tron", "Q4 e-tron", "A6", "A4", "Q5"],
  Geely: ["Zeekr 001", "Zeekr X", "Geometry C", "Coolray"],
  SAIC: ["MG4 Electric", "MG ZS EV", "Roewe RX5"],
  "Great Wall": ["Ora Good Cat", "Tank 300", "Haval H6"],
  Chery: ["Tiggo 8", "Exeed TXL", "OMODA 5"],
  NIO: ["ET7", "ET5", "ES6", "ES8", "EC6"],
};

export const years = Array.from({ length: 16 }, (_, i) => (2025 - i).toString());

// ─── CATEGORIES ────────────────────────────────────────────────────────
export const categories = [
  {
    id: "dieu-hoa-khong-khi",
    name: "Điều hòa không khí",
    nameZh: "汽车空调部件",
    icon: "AC",
    desc: "Máy nén, dàn nóng, van giãn nở, gas lạnh R134a",
    descZh: "压缩机、冷凝器、膨胀阀、R134a冷媒",
    count: 156,
    color: "#3B82F6",
    img: "/products/ac-compressor.png",
    subcategories: [
      { id: "ly-hop-may-nen",   name: "Ly hợp máy nén",           nameZh: "压缩机离合器" },
      { id: "may-nen-ac",       name: "Máy nén",                  nameZh: "压缩机",
        subcategories: [
          { id: "may-nen-dien",   name: "Máy nén điện (EV/Hybrid)", nameZh: "电动压缩机" },
          { id: "may-nen-co",     name: "Máy nén cơ (đai curoa)",   nameZh: "机械压缩机" },
        ]
      },
      { id: "thiet-bi-bay-hoi", name: "Thiết bị bay hơi",         nameZh: "蒸发器" },
      { id: "ac-binh-ngung",    name: "A/C bình ngưng",           nameZh: "冷凝器" },
      { id: "cong-tac-ap-suat", name: "Công tắc áp suất & cảm biến", nameZh: "压力开关与传感器" },
      { id: "bo-tan-nhiet",     name: "Bộ tản nhiệt làm mát",    nameZh: "散热器" },
      { id: "quat-thoi-cabin",  name: "Quạt thổi cabin",          nameZh: "鼓风机" },
      { id: "may-say-thu",      name: "Máy sấy thu",              nameZh: "储液干燥器" },
      { id: "loi-lo-suoi",      name: "Lõi lò sưởi",             nameZh: "暖风芯体" },
    ]
  },
  {
    id: "ignition",
    name: "Hệ thống đánh lửa",
    nameZh: "点火系统",
    icon: "IGN",
    desc: "Bugi, cuộn đánh lửa, bộ dây cao áp, cảm biến đánh lửa",
    descZh: "火花塞、点火线圈、高压线、点火传感器",
    count: 210,
    color: "#F59E0B",
    img: "/products/spark-plug-iridium.png",
    subcategories: [
      { id: "bugi", name: "Bugi", nameZh: "火花塞",
        subcategories: [
          { id: "bugi-iridium",  name: "Bugi Iridium",  nameZh: "铱金火花塞" },
          { id: "bugi-platinum", name: "Bugi Platinum",  nameZh: "铂金火花塞" },
          { id: "bugi-standard", name: "Bugi Standard",  nameZh: "标准火花塞" },
        ]
      },
      { id: "cuon-day-ignition", name: "Cuộn dây Ignition", nameZh: "点火线圈" },
    ]
  },
  {
    id: "dien-xoay",
    name: "Điện Xoay",
    nameZh: "交流电气系统",
    icon: "AC~",
    desc: "Máy phát điện, bộ chỉnh lưu, dây curoa alternator",
    descZh: "发电机、整流器、发电机皮带",
    count: 98,
    color: "#8B5CF6",
    img: "/products/car-charger-usb.png",
    subcategories: [
      { id: "may-phat-dien",  name: "Máy phát điện",  nameZh: "发电机" },
      { id: "bo-khoi-dong",   name: "Bộ khởi động",   nameZh: "启动机" },
    ]
  },

  {
    id: "loc",
    name: "Lọc",
    nameZh: "过滤器系统",
    icon: "FLT",
    desc: "Lọc dầu, lọc gió, lọc nhiên liệu, lọc cabin",
    descZh: "机油滤清器、空气滤清器、燃油滤清器、空调滤芯",
    count: 312,
    color: "#22C55E",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "quat-dong-co",
    name: "Quạt động cơ",
    nameZh: "发动机风扇",
    icon: "FAN",
    desc: "Quạt làm mát động cơ, quạt điện, cụm quạt két nước",
    descZh: "发动机冷却风扇、电动风扇、水箱风扇总成",
    count: 74,
    color: "#06B6D4",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "cam-bien-o-to",
    name: "Cảm biến ô tô",
    nameZh: "汽车传感器",
    icon: "SNS",
    desc: "Cảm biến oxy, cảm biến nhiệt độ, cảm biến áp suất, cảm biến ABS",
    descZh: "氧传感器、温度传感器、压力传感器、ABS传感器",
    count: 189,
    color: "#EF4444",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "phu-kien-khac",
    name: "Phụ kiện khác",
    nameZh: "其他配件",
    icon: "PKK",
    desc: "Các phụ kiện ô tô tổng hợp không thuộc danh mục riêng",
    descZh: "其他汽车配件",
    count: 430,
    color: "#94A3B8",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "chieu-sang",
    name: "Chiếu sáng",
    nameZh: "照明系统",
    icon: "LED",
    desc: "Đèn pha LED, HID xenon, đèn hậu, đèn ban ngày DRL",
    descZh: "LED大灯、氙气灯、尾灯、日行灯",
    count: 135,
    color: "#F97316",
    img: "/products/ev-charger-7kw.png"
  },
  {
    id: "he-thong-phanh",
    name: "Hệ thống phanh",
    nameZh: "制动系统",
    icon: "BRK",
    desc: "Má phanh, đĩa phanh, bơm phanh, dầu phanh, kẹp phanh",
    descZh: "刹车片、刹车盘、制动泵、制动液、卡钳",
    count: 278,
    color: "#DC2626",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "truyen",
    name: "Truyền",
    nameZh: "传动系统",
    icon: "TRN",
    desc: "Hộp số, trục các đăng, khớp nối, dầu hộp số",
    descZh: "变速箱、传动轴、万向节、变速箱油",
    count: 142,
    color: "#7C3AED",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "he-thong-quan-ly-dong-co",
    name: "Hệ thống quản lý động cơ",
    nameZh: "发动机管理系统",
    icon: "EMS",
    desc: "ECU, kim phun nhiên liệu, bướm ga, van EGR, thanh ngang RAM",
    descZh: "ECU、喷油嘴、节气门、EGR阀、进气歧管",
    count: 96,
    color: "#0EA5E9",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "luoi-gat-nuoc",
    name: "Lưỡi gạt nước",
    nameZh: "雨刮片",
    icon: "WPR",
    desc: "Gạt mưa frameless, gạt có khung, lưỡi gạt silicon",
    descZh: "无骨雨刮片、有骨雨刮片、硅胶雨刮片",
    count: 88,
    color: "#10B981",
    img: "/products/car-charger-usb.png"
  },
  {
    id: "may-nen-hybrid",
    name: "Máy nén Hybrid",
    nameZh: "混合动力压缩机",
    icon: "HYB",
    desc: "Máy nén điều hòa điện cho xe hybrid và xe điện",
    descZh: "混合动力及纯电动汽车专用电动压缩机",
    count: 45,
    color: "#6366F1",
    img: "/products/ac-compressor.png"
  },
  {
    id: "khong-duoc-nhom",
    name: "Không được nhóm",
    nameZh: "未分类",
    icon: "N/A",
    desc: "Sản phẩm chưa được phân vào danh mục cụ thể",
    descZh: "未归类产品",
    count: 0,
    color: "#CBD5E1",
    img: ""
  },
];


export type Product = {
  id: string;
  name: string;
  nameZh?: string;
  oemCode: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  categoryNameZh?: string;
  type: "OEM" | "OES" | "Generic";
  price: number;         // VNĐ
  priceUSD: number;      // USD (for reference, from Alibaba)
  originalPrice?: number;
  discountPct?: number;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  supplier: string;
  supplierId: string;
  compatibleVehicles: string[];
  description: string;
  descZh?: string;
  warranty: string;
  image: string;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  isTrending?: boolean;
  isHot?: boolean;
  isImported?: boolean;
};

// Price note: 1 USD ≈ 25,000 VNĐ (rounded to nearest 100,000)
export const products: Product[] = [
  // ── EV CHARGER ───────────────────────────────────────────────────────
  {
    id: "yy-001",
    name: "Trạm Sạc EV Gia Đình 7kW Level 2 (AC)",
    nameZh: "7kW交流家用电动汽车充电桩 Level 2",
    oemCode: "YY-EVAC-7KW",
    brand: "Yongye Canton",
    categoryId: "phu-kien-khac",
    categoryName: "Phụ kiện khác",
    categoryNameZh: "其他配件",
    type: "OES",
    price: 4000000,
    priceUSD: 160,
    originalPrice: 5000000,
    discountPct: 20,
    stock: 35,
    sold: 182,
    rating: 4.8,
    reviewCount: 94,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Tesla Model 3/Y", "BYD Seal/Han/Tang", "Hyundai Ioniq 5/6", "VinFast VF8", "Tất cả xe điện cổng Type 2/J1772"],
    description: "Trạm sạc AC 7kW Level 2 dùng cho gia đình, sạc đầy pin xe điện chỉ 6-8 tiếng. Chuẩn Type 2, chống nước IP65, WiFi/App control.",
    descZh: "7kW交流家用充电桩，6-8小时充满电动车，Type 2接口，IP65防水，支持WiFi/APP控制。",
    warranty: "24 tháng",
    image: "/products/ev-charger-7kw.png",
    isFeatured: true,
    isFlashSale: true,
    isTrending: true,
    isHot: true,
  },
  {
    id: "yy-002",
    name: "Trạm Sạc EV 22kW AC 3 Pha Thương Mại",
    nameZh: "22kW三相交流商用充电桩",
    oemCode: "YY-EVAC-22KW",
    brand: "Yongye Canton",
    categoryId: "phu-kien-khac",
    categoryName: "Phụ kiện khác",
    categoryNameZh: "其他配件",
    type: "OES",
    price: 9000000,
    priceUSD: 360,
    originalPrice: 11000000,
    discountPct: 18,
    stock: 18,
    sold: 67,
    rating: 4.9,
    reviewCount: 38,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Tesla Model S/X", "BMW i4/iX", "Mercedes EQS", "Audi e-tron", "Tất cả xe điện Type 2"],
    description: "Trạm sạc AC 22kW 3 pha dành cho bãi đỗ xe, tòa nhà, khách sạn. Sạc đầy xe điện chỉ 2-3 tiếng, màn hình LCD, thanh toán RFID.",
    descZh: "22kW三相商用充电桩，适合停车场、酒店、办公楼，2-3小时充满，LCD屏，RFID刷卡支付。",
    warranty: "36 tháng",
    image: "/products/ev-charger-7kw.png",
    isFeatured: true,
    isFlashSale: false,
    isTrending: true,
    isImported: true,
  },
  {
    id: "yy-003",
    name: "Trạm Sạc Nhanh DC 60kW (CCS+CHAdeMO)",
    nameZh: "60kW直流快充站 (CCS+CHAdeMO)",
    oemCode: "YY-EVDC-60KW",
    brand: "Yongye Canton",
    categoryId: "phu-kien-khac",
    categoryName: "Phụ kiện khác",
    categoryNameZh: "其他配件",
    type: "OES",
    price: 45000000,
    priceUSD: 1800,
    stock: 8,
    sold: 24,
    rating: 4.7,
    reviewCount: 17,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Tesla (CCS Adapter)", "BYD Han/Tang", "Hyundai Ioniq 5/6", "Kia EV6/EV9", "BMW i4/iX"],
    description: "Trạm sạc nhanh DC 60kW sạc đầy xe điện chỉ 30-45 phút, hỗ trợ CCS1/CCS2/CHAdeMO, màn hình 7 inch, quản lý từ xa qua cloud.",
    descZh: "60kW直流快充桩，30-45分钟快速充满，支持CCS1/CCS2/CHAdeMO，7寸屏，云端远程管理。",
    warranty: "36 tháng",
    image: "/products/ev-charger-dc.png",
    isFeatured: true,
    isFlashSale: true,
    isTrending: true,
    isImported: true,
  },

  // ── AC PARTS ─────────────────────────────────────────────────────────
  {
    id: "yy-004",
    name: "Máy Nén Điều Hòa Toyota Camry/RAV4 2018-2023",
    nameZh: "丰田凯美瑞/RAV4 2018-2023空调压缩机",
    oemCode: "88310-06200",
    brand: "DENSO / Toyota OEM",
    categoryId: "dieu-hoa-khong-khi",
    categoryName: "Điều hòa không khí",
    categoryNameZh: "汽车空调部件",
    type: "OEM",
    price: 7000000,
    priceUSD: 280,
    originalPrice: 8500000,
    discountPct: 18,
    stock: 22,
    sold: 89,
    rating: 4.9,
    reviewCount: 46,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Toyota Camry 2018-2023", "Toyota RAV4 2019-2023", "Toyota Vios 2014-2022"],
    description: "Máy nén điều hòa chính hãng DENSO/Toyota, làm lạnh nhanh, êm, bền, bảo hành 24 tháng.",
    descZh: "DENSO/丰田原厂空调压缩机，制冷快，运行平稳，24个月质保。",
    warranty: "24 tháng",
    image: "/products/ac-compressor.png",
    isFeatured: true,
    isFlashSale: true,
    isTrending: true,
    isHot: true,
    isImported: true,
  },
  {
    id: "yy-005",
    name: "Dàn Nóng (Condenser) Honda Civic/CR-V 2016-2022",
    nameZh: "本田思域/CR-V 2016-2022冷凝器",
    oemCode: "80110-TBA-A01",
    brand: "Honda Genuine",
    categoryId: "dieu-hoa-khong-khi",
    categoryName: "Điều hòa không khí",
    categoryNameZh: "汽车空调部件",
    type: "OEM",
    price: 3500000,
    priceUSD: 140,
    stock: 30,
    sold: 54,
    rating: 4.7,
    reviewCount: 28,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Honda Civic 2016-2022", "Honda CR-V 2017-2022", "Honda HR-V 2016-2021"],
    description: "Dàn nóng nhôm nguyên khối chính hãng Honda, tăng hiệu suất điều hòa, chống han gỉ vượt trội.",
    descZh: "本田原厂全铝冷凝器，提升空调效率，超强防锈处理。",
    warranty: "12 tháng",
    image: "/products/ac-condenser.png",
    isFeatured: false,
    isFlashSale: false,
    isHot: true,
    isImported: true,
  },
  {
    id: "yy-006",
    name: "Bộ Van Giãn Nở + Gas Lạnh R134a Kit",
    nameZh: "膨胀阀+R134a冷媒套装",
    oemCode: "YY-ACKIT-R134",
    brand: "Yongye Canton",
    categoryId: "dieu-hoa-khong-khi",
    categoryName: "Điều hòa không khí",
    categoryNameZh: "汽车空调部件",
    type: "Generic",
    price: 1200000,
    priceUSD: 48,
    originalPrice: 1500000,
    discountPct: 20,
    stock: 60,
    sold: 143,
    rating: 4.6,
    reviewCount: 71,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Tất cả xe dùng điều hòa R134a"],
    description: "Bộ van giãn nở chất lượng cao kèm gas lạnh R134a 500g, phù hợp hầu hết xe hơi sản xuất từ 1994-2019.",
    descZh: "高品质膨胀阀+500g R134a制冷剂套装，适合1994-2019年大多数车型。",
    warranty: "6 tháng",
    image: "/products/ac-condenser.png",
    isFeatured: false,
    isFlashSale: true,
    isHot: true,
    isImported: true,
  },

  // ── SPARK PLUG ───────────────────────────────────────────────────────
  {
    id: "yy-007",
    name: "Bugi Iridium NGK ILTR5A-13G (Set 4) Toyota/Lexus",
    nameZh: "NGK铱金火花塞ILTR5A-13G 4支装 丰田/雷克萨斯",
    oemCode: "NGK-ILTR5A-13G",
    brand: "NGK",
    categoryId: "ignition",
    categoryName: "Ignition",
    categoryNameZh: "点火系统",
    type: "OES",
    price: 1200000,
    priceUSD: 48,
    originalPrice: 1500000,
    discountPct: 20,
    stock: 120,
    sold: 367,
    rating: 4.9,
    reviewCount: 188,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Toyota Camry 2.5L 2018-2023", "Toyota RAV4 2019-2023", "Lexus ES 250/300h", "Toyota Corolla 2019+"],
    description: "Bugi Iridium NGK chính hãng bộ 4 cái, tuổi thọ 100.000km, đánh lửa ổn định, tiết kiệm xăng 5-8%.",
    descZh: "NGK原装铱金火花塞4支装，使用寿命100,000公里，点火稳定，节省燃油5-8%。",
    warranty: "24 tháng",
    image: "/products/spark-plug-iridium.png",
    isFeatured: true,
    isFlashSale: true,
    isTrending: true,
    isHot: true,
    isImported: true,
  },
  {
    id: "yy-008",
    name: "Bugi Platinum Bosch FR7KPP33+ (Set 4) BMW/Mercedes",
    nameZh: "博世铂金火花塞FR7KPP33+ 4支装 宝马/奔驰",
    oemCode: "BOSCH-FR7KPP33",
    brand: "Bosch",
    categoryId: "ignition",
    categoryName: "Ignition",
    categoryNameZh: "点火系统",
    type: "OES",
    price: 1000000,
    priceUSD: 40,
    stock: 85,
    sold: 213,
    rating: 4.8,
    reviewCount: 107,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["BMW 3/5 Series 2.0T", "BMW X3/X5 3.0T", "Mercedes C/E Class 1.5T-2.0T"],
    description: "Bugi Platinum Bosch bộ 4, công nghệ điện cực kép Platinum, tuổi thọ 60.000km, phù hợp động cơ turbocharged.",
    descZh: "博世铂金火花塞4支装，双铂金电极技术，使用寿命60,000公里，适用于涡轮增压发动机。",
    warranty: "12 tháng",
    image: "/products/spark-plug-iridium.png",
    isFeatured: true,
    isFlashSale: false,
    isHot: true,
    isImported: true,
  },
  {
    id: "yy-009",
    name: "Bugi Iridium Denso SK20R11 (Set 4) Honda/Mazda",
    nameZh: "Denso铱金火花塞SK20R11 4支装 本田/马自达",
    oemCode: "DENSO-SK20R11",
    brand: "Denso",
    categoryId: "ignition",
    categoryName: "Ignition",
    categoryNameZh: "点火系统",
    type: "OES",
    price: 1100000,
    priceUSD: 44,
    originalPrice: 1400000,
    discountPct: 21,
    stock: 95,
    sold: 178,
    rating: 4.8,
    reviewCount: 89,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Honda Civic/City 1.5L", "Honda CR-V 1.5T", "Mazda CX-5/Mazda 3 2.0L", "Honda Jazz"],
    description: "Bugi Iridium Denso bộ 4, đầu điện cực iridium siêu cứng (2300 HV), tuổi thọ 100.000km.",
    descZh: "Denso铱金火花塞4支装，超硬铱金电极（2300HV），使用寿命100,000公里。",
    warranty: "24 tháng",
    image: "/products/spark-plug-iridium.png",
    isFeatured: false,
    isFlashSale: true,
    isTrending: true,
    isImported: true,
  },

  // ── ELECTRIC AUTO PARTS ──────────────────────────────────────────────
  {
    id: "yy-010",
    name: "Bộ Sạc Xe Hơi 65W PD USB-C + USB-A Dual Port",
    nameZh: "65W PD USB-C+USB-A 车载双口快速充电器",
    oemCode: "YY-CC-65W-PDCA",
    brand: "Yongye Canton",
    categoryId: "phu-kien-khac",
    categoryName: "Phụ kiện khác",
    categoryNameZh: "其他配件",
    type: "Generic",
    price: 500000,
    priceUSD: 20,
    originalPrice: 700000,
    discountPct: 29,
    stock: 250,
    sold: 892,
    rating: 4.7,
    reviewCount: 447,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Tất cả xe có cổng 12V/cổng sạc USB"],
    description: "Bộ sạc xe 65W PD, sạc nhanh Type-C (65W) + USB-A (18W), chip tản nhiệt thông minh, tương thích iPhone/Samsung/iPad/Laptop.",
    descZh: "65W PD车载充电器，USB-C(65W)+USB-A(18W)双口快充，智能散热芯片，兼容苹果/三星/iPad/笔记本。",
    warranty: "12 tháng",
    image: "/products/car-charger-usb.png",
    isFeatured: true,
    isFlashSale: true,
    isTrending: true,
    isHot: true,
  },
  {
    id: "yy-011",
    name: "Máy Đọc Lỗi OBD2 Bluetooth ELM327 V2.1",
    nameZh: "ELM327 V2.1 蓝牙OBD2故障码读取器",
    oemCode: "YY-OBD2-BT327",
    brand: "Yongye Canton",
    categoryId: "he-thong-quan-ly-dong-co",
    categoryName: "Hệ thống quản lý động cơ",
    categoryNameZh: "发动机管理系统",
    type: "Generic",
    price: 300000,
    priceUSD: 12,
    stock: 180,
    sold: 743,
    rating: 4.6,
    reviewCount: 371,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Tất cả xe từ 1996+ có cổng OBD2"],
    description: "Máy đọc lỗi OBD2 Bluetooth ELM327, kết nối điện thoại qua Torque/OBD Fusion app, đọc/xóa lỗi, xem thông số xe real-time.",
    descZh: "蓝牙OBD2诊断仪ELM327，手机连接Torque/OBD Fusion APP，读取/清除故障码，实时查看车辆参数。",
    warranty: "12 tháng",
    image: "/products/car-charger-usb.png",
    isFeatured: false,
    isFlashSale: true,
    isHot: true,
  },
  {
    id: "yy-012",
    name: "Cảm Biến Bãi Đỗ Xe 4 Điểm + Màn Hình LCD",
    nameZh: "4探头倒车雷达+LCD显示屏套装",
    oemCode: "YY-PDC-4LCD",
    brand: "Yongye Canton",
    categoryId: "cam-bien-o-to",
    categoryName: "Cảm biến ô tô",
    categoryNameZh: "汽车传感器",
    type: "Generic",
    price: 600000,
    priceUSD: 24,
    originalPrice: 800000,
    discountPct: 25,
    stock: 140,
    sold: 524,
    rating: 4.5,
    reviewCount: 262,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: "Trung Quốc",
    compatibleVehicles: ["Tất cả xe hơi (lắp thêm)"],
    description: "Bộ cảm biến đỗ xe 4 đầu dò 22mm, màn hình LCD hiển thị khoảng cách, cảnh báo âm thanh, lắp đặt dễ dàng.",
    descZh: "4探头22mm倒车雷达+LCD距离显示屏，声音报警，安装简便。",
    warranty: "12 tháng",
    image: "/products/car-charger-usb.png",
    isFeatured: false,
    isFlashSale: false,
    isHot: true,
  },
  // ── MORE PRODUCTS (MOCK) ──
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `yy-mock-${i + 13}`,
    name: `Phụ Tùng Ô Tô Nhập Khẩu Mẫu ${i + 1}`,
    nameZh: `进口汽车配件样品 ${i + 1}`,
    oemCode: `OEM-MOCK-${i + 13}`,
    brand: i % 2 === 0 ? "Toyota OEM" : "Honda Genuine",
    categoryId: i % 3 === 0 ? "dieu-hoa-khong-khi" : i % 3 === 1 ? "phu-kien-khac" : "he-thong-phanh",
    categoryName: i % 3 === 0 ? "Điều hòa không khí" : i % 3 === 1 ? "Phụ kiện khác" : "Hệ thống phanh",
    type: "OEM" as const,
    price: 1500000 + (i * 100000),
    priceUSD: 60 + (i * 4),
    stock: 50 + i,
    sold: 10 * i,
    rating: 4.8,
    reviewCount: i * 5,
    supplier: "Yongye Canton",
    supplierId: "s-yy",
    origin: i % 2 === 0 ? "Trung Quốc" : "Nhật Bản",
    compatibleVehicles: ["Tất cả dòng xe"],
    description: "Sản phẩm mẫu bổ sung vào database để Homepage đủ lượng ảnh không bị trùng lặp.",
    descZh: "添加到数据库中的示例产品，以便主页有足够的图像而不会重复。",
    warranty: "12 tháng",
    image: [
      "/products/ac-compressor.png", 
      "/products/ac-condenser.png", 
      "/products/ev-charger-7kw.png", 
      "/products/ev-charger-dc.png", 
      "/products/spark-plug-iridium.png", 
      "/products/car-charger-usb.png"
    ][i % 6],
    isFeatured: i % 4 === 0,
    isFlashSale: i % 5 === 0,
    isTrending: i % 3 === 0,
    isHot: true,
    isImported: true,
  }))
];

export const featuredProducts = products.filter(p => p.isFeatured);

// ─── Orders ───────────────────────────────────────────────────────────
export type Order = {
  id: string; customer: string; customerId: string; date: string;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED" | "RETURN_REQUESTED";
  total: number; items: number; tracking?: string;
};

export const orders: Order[] = [
  { id: "#ORD-2841", customer: "Nguyễn Văn An", customerId: "c001", date: "Hôm nay, 14:20", status: "CONFIRMED", total: 4000000, items: 1, tracking: "GHTK123456" },
  { id: "#ORD-2839", customer: "Trần Thị Bé", customerId: "c002", date: "Hôm nay, 10:15", status: "PROCESSING", total: 1200000, items: 2 },
  { id: "#ORD-2835", customer: "Lê Minh Tuấn", customerId: "c003", date: "Hôm qua, 18:45", status: "DELIVERED", total: 9000000, items: 1, tracking: "GHN789012" },
  { id: "#ORD-2830", customer: "Phạm Hoàng Nam", customerId: "c004", date: "Hôm qua, 09:30", status: "SHIPPED", total: 7000000, items: 1, tracking: "VTP345678" },
  { id: "#ORD-2827", customer: "Võ Thị Lan", customerId: "c005", date: "2 ngày trước", status: "COMPLETED", total: 500000, items: 2 },
  { id: "#ORD-2820", customer: "Đỗ Văn Hùng", customerId: "c006", date: "3 ngày trước", status: "COMPLETED", total: 45000000, items: 1 },
  { id: "#ORD-2815", customer: "Bùi Thị Mai", customerId: "c007", date: "4 ngày trước", status: "RETURN_REQUESTED", total: 1200000, items: 1 },
];

export const suppliers = [
  { id: "s-yy",  name: "Yongye Canton",    logo: "YY", email: "sales@yongyecanton.com", products: 342, rating: 4.9, completion: 98, status: "trusted" as const, revenue: 145200000, pendingPayout: 28200000, nextPayoutDate: "10 Tháng 10, 2025" },
  { id: "s002",  name: "AutoElec VN",      logo: "AE", email: "autoelec@parts.vn",       products: 121, rating: 4.7, completion: 95, status: "active"  as const, revenue: 32100000,  pendingPayout: 5600000,  nextPayoutDate: "10 Tháng 10, 2025" },
  { id: "s003",  name: "EV Parts Pro",     logo: "EP", email: "evparts@pro.vn",           products: 88,  rating: 4.5, completion: 87, status: "active"  as const, revenue: 18900000,  pendingPayout: 3200000,  nextPayoutDate: "10 Tháng 10, 2025" },
  { id: "s004",  name: "Canton Spare",     logo: "CS", email: "canton@spare.vn",          products: 56,  rating: 4.4, completion: 92, status: "active"  as const, revenue: 22400000,  pendingPayout: 4100000,  nextPayoutDate: "10 Tháng 10, 2025" },
];

export const affiliates = [
  { id: "a001", name: "Nguyễn Đại Lý",   tier: "T1", sales: 48500000, commission: 9700000,  commissionPending: 2400000, ctv: 8,  rank: 3 },
  { id: "a002", name: "Trần CTV Pro",     tier: "T2", sales: 12300000, commission: 1845000,  commissionPending: 650000,  ctv: 0,  rank: 12 },
  { id: "a003", name: "Lê Partner Gold", tier: "T1", sales: 73200000, commission: 14640000, commissionPending: 3800000, ctv: 15, rank: 1 },
];

export const salesChartData = [
  { day: "T2", revenue: 22000000 }, { day: "T3", revenue: 38000000 },
  { day: "T4", revenue: 29000000 }, { day: "T5", revenue: 51000000 },
  { day: "T6", revenue: 33000000 }, { day: "T7", revenue: 47000000 }, { day: "CN", revenue: 41000000 },
];

export const adminGMVData = [
  { month: "Tháng 1", monthZh: "一月", gmv: 280, revenue: 28 },
  { month: "Tháng 2", monthZh: "二月", gmv: 320, revenue: 32 },
  { month: "Tháng 3", monthZh: "三月", gmv: 295, revenue: 29.5 },
  { month: "Tháng 4", monthZh: "四月", gmv: 410, revenue: 41 },
  { month: "Tháng 5", monthZh: "五月", gmv: 520, revenue: 52 },
  { month: "Tháng 6", monthZh: "六月", gmv: 680, revenue: 68 },
];

export const regionData = [
  { name: "Hà Nội",      nameZh: "河内",    value: 45, color: "#F97316" },
  { name: "TP. HCM",     nameZh: "胡志明市", value: 30, color: "#3B82F6" },
  { name: "Khu vực khác", nameZh: "其他地区", value: 25, color: "#F59E0B" },
];

export const affiliateWeeklyData = [
  { day: "T2", sales: 4200000 }, { day: "T3", sales: 6800000 }, { day: "T4", sales: 5100000 },
  { day: "T5", sales: 9200000 }, { day: "T6", sales: 7400000 }, { day: "T7", sales: 11500000 }, { day: "CN", sales: 8900000 },
];

export const affiliateLinkData = [
  { product: "Trạm Sạc EV 7kW",        productZh: "7kW家用充电桩",     link: "aparts.vn/ref/a001/yy-001", clicks: 342, conversions: 28, revenue: 112000000 },
  { product: "Bugi Iridium NGK Set 4",  productZh: "NGK铱金火花塞4支",  link: "aparts.vn/ref/a001/yy-007", clicks: 218, conversions: 67, revenue: 80400000 },
  { product: "Máy Nén ĐH Toyota",       productZh: "丰田空调压缩机",    link: "aparts.vn/ref/a001/yy-004", clicks: 156, conversions: 19, revenue: 133000000 },
];

export const ctvTeamData = [
  { name: "Minh Hoàng", sales: 12000000, commission: 1800000, status: "active" },
  { name: "Thu Thảo",   sales: 8600000,  commission: 1290000, status: "active" },
  { name: "Văn Đức",    sales: 4100000,  commission: 615000,  status: "inactive" },
  { name: "Lan Anh",    sales: 9900000,  commission: 1485000, status: "active" },
];

export const customerGarage = [
  { id: "v001", brand: "BYD",   model: "Han EV",  year: "2023", engine: "Electric 469HP", color: "#60A5FA", active: true },
  { id: "v002", brand: "Toyota", model: "Camry",  year: "2021", engine: "2.5L Hybrid",    color: "#34D399", active: false },
];

export const customerOrders = [
  { id: "#AP-88421", product: "Trạm Sạc EV 7kW Yongye Canton", productZh: "永野广州7kW家用充电桩", status: "IN_TRANSIT", eta: "24 Tháng 10", via: "GHTK" },
  { id: "#AP-88502", product: "Bugi NGK Iridium Set 4 + Máy Nén ĐH", productZh: "NGK铱金火花塞4支+空调压缩机", status: "PROCESSING", eta: "Đã xác nhận 22/10", via: "Kho Hà Nội" },
];

export const pendingApprovals = [
  { type: "new_supplier", icon: "🏭", title: "Yongye Canton VN",  titleZh: "永野广州越南区",   desc: "Đăng ký Nhà cung cấp mới",  descZh: "新供应商注册审核", time: "2 giờ trước" },
  { type: "new_product",  icon: "📦", title: "Sạc DC 120kW...",   titleZh: "120kW直流快充桩...", desc: "Sản phẩm mới chờ duyệt",    descZh: "新产品待审",       time: "4 giờ trước" },
  { type: "payout",       icon: "💳", title: "Rút tiền: #WD9012", titleZh: "提现: #WD9012",     desc: "Đối tác yêu cầu tất toán",  descZh: "合作商申请提现",   time: "1 ngày trước" },
  { type: "new_supplier", icon: "🏭", title: "EV Parts Pro",       titleZh: "EV配件专业商",      desc: "Đăng ký Nhà cung cấp mới",  descZh: "新供应商注册审核", time: "1 ngày trước" },
  { type: "return",       icon: "🔄", title: "Hoàn trả #ORD-2815", titleZh: "退货 #ORD-2815",   desc: "Khách yêu cầu đổi hàng",    descZh: "客户申请换货",     time: "2 ngày trước" },
];

/** @deprecated use useLang().fp() for localized price */
export function formatPrice(p: number) {
  return p.toLocaleString("vi-VN") + "đ";
}

export function getStatusBadge(status: Order["status"], lang?: "vi" | "zh") {
  const map: Record<string, { label: string; labelZh: string; color: string }> = {
    PENDING:          { label: "Chờ xác nhận", labelZh: "待确认",   color: "bg-yellow-100 text-yellow-700" },
    CONFIRMED:        { label: "Đã xác nhận",  labelZh: "已确认",   color: "bg-blue-100 text-blue-700" },
    PROCESSING:       { label: "Chờ xử lý",    labelZh: "处理中",   color: "bg-orange-100 text-orange-700" },
    SHIPPED:          { label: "Đang giao",     labelZh: "配送中",   color: "bg-indigo-100 text-indigo-700" },
    DELIVERED:        { label: "Đã giao",       labelZh: "已送达",   color: "bg-green-100 text-green-700" },
    COMPLETED:        { label: "Hoàn thành",    labelZh: "已完成",   color: "bg-green-200 text-green-800" },
    CANCELLED:        { label: "Đã hủy",        labelZh: "已取消",   color: "bg-red-100 text-red-700" },
    RETURN_REQUESTED: { label: "Yêu cầu trả",  labelZh: "申请退货", color: "bg-pink-100 text-pink-700" },
  };
  const entry = map[status] ?? { label: status, labelZh: status, color: "bg-gray-100 text-gray-700" };
  return { label: lang === "zh" ? entry.labelZh : entry.label, color: entry.color };
}


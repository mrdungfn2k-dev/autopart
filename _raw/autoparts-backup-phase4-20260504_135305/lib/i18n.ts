"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import React from "react";

export type Lang = "vi" | "zh";

// ──────────────── CURRENCY ────────────────
// 1 CNY ≈ 3,500 VNĐ (demo exchange rate)
export function formatPriceLang(vndAmount: number, lang: Lang): string {
 // Multi-currency: explicit selection in localStorage takes precedence over lang default
 if (typeof window !== "undefined") {
   try {
     const raw = localStorage.getItem("ap_currency");
     if (raw) {
       const c = JSON.parse(raw);
       if (c && c.code && c.symbol && typeof c.rate === "number" && c.rate > 0 && c.code !== "VND") {
         const conv = vndAmount / c.rate;
         if (c.code === "CNY") return `¥${Math.round(conv).toLocaleString("zh-CN")}`;
         return `${conv.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${c.symbol}`;
       }
     }
   } catch {}
 }
 if (lang === "zh") {
  const cny = Math.round(vndAmount / 3500);
  return `¥${cny.toLocaleString("zh-CN")}`;
 }
 return `${vndAmount.toLocaleString("vi-VN")} ₫`;
}

// ──────────────── DICTIONARY ────────────────
const dict = {
 vi: {
  // Nav
  products: "Sản phẩm", flashSale: "Flash Sale", vin: "VIN", login: "Đăng nhập", logout: "Đăng xuất",
  register: "Đăng ký", cart: "Giỏ hàng", search: "Tìm kiếm", searchBtn: "Tìm",
  searchPlaceholder: "Tìm kiếm phụ tùng (VD: Má phanh, Lọc dầu...)",
  vinPlaceholder: "Nhập 17 ký tự số VIN (VD: 1HGBH41JXMN109186)", vinBtn: "Tra cứu",
  // Homepage
  findByVehicle: "Tìm phụ tùng theo xe của bạn", selectBrand: "Chọn thương hiệu",
  selectModel: "Chọn dòng xe", selectYear: "Chọn năm", searchHero: "Tra cứu",
  vinQuickSearch: "Tra cứu nhanh bằng số VIN", heroTitle1: "Phụ Tùng Chính Hãng",
  heroTitle2: "Uy Tín Toàn Quốc",
  heroDesc: "Nền tảng số hóa chuỗi cung ứng phụ tùng ô tô — từ kho NCC đến tay thợ sửa và chủ xe với đầy đủ minh bạch về nguồn gốc, giá cả và bảo hành.",
  shopNow: "Mua ngay", viewFlashSale: "Xem Flash Sale", categoryTitle: "Danh mục sản phẩm",
  categorySubtitle: "Tìm chính xác phụ tùng bạn cần cho xe của mình", flashSaleEnds: "Kết thúc sau:",
  addToCart: "Thêm vào giỏ", featuredProducts: "Sản phẩm nổi bật",
  featuredSubtitle: "Phụ tùng chính hãng bán chạy nhất tháng",
  whyChooseUs: "Tại sao chọn AutoParts?", proSeries: "PRO SERIES", itemCount: "sản phẩm",
  // Common UI
  viewAll: "Xem tất cả", close: "Đóng", save: "Lưu", cancel: "Hủy", confirm: "Xác nhận",
  submit: "Gửi", back: "Quay lại", next: "Tiếp theo", loading: "Đang tải...",
  add: "Thêm", edit: "Sửa", delete: "Xóa", filter: "Lọc", export: "Xuất",
  status: "Trạng thái", action: "Hành động", price: "Giá", total: "Tổng",
  quantity: "Số lượng", order: "Đơn hàng", orders: "Đơn hàng", product: "Sản phẩm",
  customer: "Khách hàng", date: "Ngày", note: "Ghi chú", payment: "Thanh toán",
  shipping: "Vận chuyển", warranty: "Bảo hành", discount: "Giảm giá", stock: "Tồn kho",
  brand: "Hãng", category: "Danh mục", description: "Mô tả", rating: "Đánh giá", review: "Nhận xét",
  all: "Tất cả", detail: "Chi tiết", update: "Cập nhật", create: "Tạo mới",
  noData: "Không có dữ liệu", searchGeneric: "Tìm kiếm...",
  showing: "Hiển thị", of: "của", page: "Trang", previous: "Trước",
  active: "Đang hoạt động", inactive: "Không hoạt động", enable: "Bật", disable: "Tắt",
  yes: "Có", no: "Không", success: "Thành công", error: "Lỗi", warning: "Cảnh báo", info: "Thông tin",
  // Login
  loginTitle: "Đăng nhập", loginSubtitle: "Chào mừng trở lại! Nhập thông tin tài khoản của bạn.",
  loginWelcome: "Chào mừng quay trở lại",
  emailLabel: "Email / Số điện thoại", emailPlaceholder: "your@email.com hoặc 09xxxxx",
  passwordLabel: "Mật khẩu", forgotPassword: "Quên mật khẩu?", rememberMe: "Ghi nhớ đăng nhập",
  loginBtn: "Đăng nhập →", orContinueWith: "hoặc tiếp tục với",
  noAccount: "Chưa có tài khoản?", registerNow: "Đăng ký ngay",
  demoAccounts: "TÀI KHOẢN DEMO:", showPassword: "Hiện", hidePassword: "Ẩn", email: "Email",
  // Generic UI utilities
  save: "Tiết kiệm", saveBtn: "Lưu", cancel: "Hủy", edit: "Sửa", delete: "Xóa", confirm: "Xác nhận",
  note: "Ghi chú", noData: "Không có dữ liệu", addToCart: "Thêm vào giỏ",
  // Register
  registerTitle: "Tạo tài khoản mới", registerSubtitle: "Tham gia nền tảng phụ tùng ô tô số 1 Việt Nam",
  fullName: "Họ và tên", fullNamePlaceholder: "Nguyễn Văn A",
  phone: "Số điện thoại", phonePlaceholder: "0912345678",
  passwordConfirm: "Xác nhận mật khẩu", selectRole: "Chọn loại tài khoản",
  roleCustomer: "Khách hàng", roleSupplier: "Nhà cung cấp", roleAffiliate: "Cộng tác viên",
  agreeTerms: "Tôi đồng ý với", termsOfService: "Điều khoản dịch vụ",
  and: "và", privacyPolicy: "Chính sách bảo mật",
  registerBtn: "Tạo tài khoản →", haveAccount: "Đã có tài khoản?", loginNow: "Đăng nhập ngay",
  // Cart/Checkout
  cartTitle: "Giỏ hàng của bạn", cartEmpty: "Giỏ hàng trống",
  cartContinueShopping: "Tiếp tục mua sắm", cartCheckout: "Thanh toán",
  cartSubtotal: "Tạm tính", cartShipping: "Phí vận chuyển", cartTotal: "Tổng cộng",
  cartFreeShipping: "Miễn phí", cartRemove: "Xóa",
  checkoutTitle: "Thanh toán đơn hàng", shippingInfo: "Thông tin giao hàng",
  paymentMethod: "Phương thức thanh toán", orderSummary: "Tóm tắt đơn hàng",
  placeOrder: "Đặt hàng", cod: "Thanh toán khi nhận hàng (COD)",
  bankTransfer: "Chuyển khoản ngân hàng", eWallet: "Ví điện tử",
  address: "Địa chỉ", city: "Thành phố", district: "Quận/Huyện", ward: "Phường/Xã",
  addressDetail: "Số nhà, tên đường", voucherCode: "Mã giảm giá", apply: "Áp dụng",
  // Products
  productsTitle: "Danh mục phụ tùng", productsSortBy: "Sắp xếp", productsFilter: "Lọc sản phẩm",
  productsInStock: "Còn hàng", productsAll: "Tất cả", productsNoResult: "Không tìm thấy sản phẩm",
  productsAddCart: "Thêm vào giỏ", productsBuyNow: "Mua ngay",
  productsOriginalPrice: "Giá niêm yết", productsYourPrice: "Giá của bạn",
  productDetail: "Chi tiết sản phẩm", specifications: "Thông số kỹ thuật",
  compatibility: "Tương thích", reviews: "Đánh giá", relatedProducts: "Sản phẩm liên quan",
  oemCode: "Mã OEM", inStock: "Còn hàng", outOfStock: "Hết hàng", sold: "Đã bán",
  genericParts: "Phổ thông",
  // Admin sidebar
  adminDashboard: "Bảng điều khiển", adminUsers: "Đối tác & Khách hàng",
  adminCatalog: "Danh mục & Phụ tùng", adminOrders: "Đơn hàng",
  adminFinance: "Tài chính & Hoa hồng", adminMarketing: "Marketing & Voucher",
  adminApprovals: "Phê duyệt", adminReports: "Báo cáo", adminSettings: "Cài đặt hệ thống",
  groupManage: "QUẢN LÝ", groupOperations: "VẬN HÀNH",
  // Admin content
  dashboardTitle: "Bảng điều khiển", totalRevenue: "Tổng doanh thu",
  totalOrders: "Tổng đơn hàng", totalProducts: "Tổng sản phẩm", totalUsers: "Tổng người dùng",
  newOrders: "Đơn mới", pendingApprovals: "Chờ duyệt", monthlyRevenue: "Doanh thu tháng",
  recentOrders: "Đơn hàng gần đây", topProducts: "Sản phẩm bán chạy",
  systemOverview: "Tổng quan hệ thống", quickActions: "Thao tác nhanh",
  viewAllOrders: "Xem tất cả đơn", growth: "Tăng trưởng", comparedLastMonth: "so với tháng trước",
  today: "Hôm nay", thisWeek: "Tuần này", thisMonth: "Tháng này", thisYear: "Năm nay",
  // Admin Users
  usersTitle: "Quản lý đối tác & khách hàng", addUser: "Thêm người dùng",
  userName: "Tên", userEmail: "Email", userRole: "Vai trò", userStatus: "Trạng thái",
  userJoined: "Ngày tham gia", userActions: "Hành động", editUser: "Sửa người dùng",
  deleteUser: "Xóa người dùng", confirmDelete: "Bạn có chắc muốn xóa?",
  roleAdmin: "Admin", roleSupplier2: "Nhà cung cấp", roleCustomer2: "Khách hàng",
  roleAffiliate2: "Cộng tác viên", manageRoles: "Quản lý vai trò",
  roleName: "Tên vai trò", roleColor: "Màu", searchUsers: "Tìm theo tên, email...",
  verified: "Đã xác minh", unverified: "Chưa xác minh",
  // Admin Catalog
  catalogTitle: "Danh mục & Phụ tùng", addProduct: "Thêm sản phẩm",
  categoryName: "Tên danh mục", productName: "Tên sản phẩm", productPrice: "Giá bán",
  productStock: "Tồn kho", productType: "Loại hàng", productBrand: "Thương hiệu",
  productCategory: "Danh mục", searchProducts: "Tìm sản phẩm...",
  allCategories: "Tất cả danh mục", allTypes: "Tất cả loại",
  // Admin Orders
  ordersTitle: "Quản lý đơn hàng", orderDate: "Ngày đặt", orderCustomer: "Khách hàng",
  orderTotal: "Tổng tiền", orderStatus: "Trạng thái", orderDetail: "Chi tiết đơn hàng",
  orderId: "Mã đơn", orderItems: "Sản phẩm", shippingAddress: "Địa chỉ giao hàng",
  trackingNumber: "Mã vận đơn", statusPending: "Chờ xử lý", statusConfirmed: "Đã xác nhận",
  statusShipping: "Đang giao", statusDelivered: "Đã giao", statusCancelled: "Đã hủy",
  statusReturned: "Đã trả hàng", searchOrders: "Tìm đơn hàng...", allStatuses: "Tất cả trạng thái",
  exportExcel: "Xuất Excel", totalAmount: "Tổng tiền hàng", shippingFee: "Phí vận chuyển",
  discountAmount: "Giảm giá", finalTotal: "Thành tiền",
  // Admin Finance
  financeTitle: "Tài chính & Hoa hồng", revenue: "Doanh thu", commission: "Hoa hồng",
  profit: "Lợi nhuận", payout: "Chi trả", pendingPayout: "Chờ thanh toán",
  completedPayout: "Đã thanh toán", transactionHistory: "Lịch sử giao dịch",
  transactionDate: "Ngày", transactionType: "Loại", transactionAmount: "Số tiền",
  transactionStatus: "Trạng thái", withdrawRequest: "Yêu cầu rút tiền",
  // Supplier Settings
  storeInfo: "Thông tin cửa hàng", storeName: "Tên cửa hàng",
  taxCode: "Mã số thuế", warehouseAddress: "Địa chỉ kho hàng",
  currentPlatformFee: "Phí nền tảng hiện tại", agreedWithPlatform: "Theo thỏa thuận với nền tảng",
  ofTotalGMV: "trên tổng GMV",
  automatedOperations: "Vận hành tự động",
  autoConfirmOrder: "Tự động xác nhận đơn", autoConfirmOrderDesc: "Hệ thống tự động duyệt đơn khi khách thanh toán xong",
  autoUpdateShipping: "Tự động cập nhật vận chuyển", autoUpdateShippingDesc: "Tự động đồng bộ trạng thái từ đối tác vận chuyển",
  sameDayDelivery: "Giao hàng trong ngày", sameDayDeliveryDesc: "Áp dụng cho các đơn hàng trong cùng tỉnh/thành",
  notifications: "Thông báo",
  newOrder: "Đơn hàng mới", newOrderDesc: "Nhận thông báo khi có đơn hàng mới",
  lowStockWarn: "Cảnh báo sắp hết hàng", lowStockWarnDesc: "Nhắc nhở khi tồn kho dưới mức tối thiểu",
  payoutAlert: "Thông báo đối soát", payoutAlertDesc: "Nhận tin nhắn khi có đợt thanh toán từ nền tảng",
  productGotReview: "Sản phẩm có đánh giá", productGotReviewDesc: "Báo ngay khi khách hàng để lại review",
  flashSalePromo: "Chương trình Flash Sale", flashSalePromoDesc: "Thông báo tham gia các đợt sale lớn",
  suspendOperations: "Tạm ngưng hoạt động", suspendOperationsDesc: "Cửa hàng của bạn sẽ tạm thời bị ẩn khỏi hệ thống. Khách hàng sẽ không thể đặt mua sản phẩm.",
  requestSuspendStore: "Yêu cầu tạm ngưng", savedSuccess: "Đã lưu thành công!",
  // Admin Marketing
  marketingTitle: "Marketing & Voucher", createVoucher: "Tạo voucher",
  voucherCodeLabel: "Mã voucher", voucherType: "Loại", voucherValue: "Giá trị",
  voucherMinOrder: "Đơn tối thiểu", voucherUsed: "Đã dùng", voucherLimit: "Giới hạn",
  voucherExpiry: "Hết hạn", voucherStatus: "Trạng thái", voucherActions: "Hành động",
  typePercent: "Phần trăm (%)", typeFixed: "Số tiền cố định (VNĐ)", typeFreeShipping: "Miễn phí vận chuyển",
  searchVoucher: "Tìm mã voucher...", promoCode: "Mã khuyến mãi", bannerAds: "Banner & Quảng cáo",
  flashSaleManage: "Flash Sale", createFlashSale: "Tạo Flash Sale mới",
  campaignName: "Tên chiến dịch", discountPercent: "Giảm giá (%)",
  startTime: "Thời gian bắt đầu", endTime: "Thời gian kết thúc",
  selectProductsLabel: "Chọn sản phẩm", selected: "đã chọn",
  scheduleFlashSale: "Lên lịch Flash Sale", running: "Đang chạy", scheduled: "Lên lịch",
  ended: "Đã kết thúc", addBanner: "Thêm banner mới", bannerTitle: "Tiêu đề",
  bannerSubtitle: "Phụ đề", bannerCTA: "Nút CTA", bannerLink: "Đường dẫn",
  bannerStartDate: "Ngày bắt đầu", bannerEndDate: "Ngày kết thúc", clicks: "lượt click",
  deleteVoucher: "Xóa voucher này?", deleteFlashSale: "Xóa Flash Sale này?",
  deleteBanner: "Xóa banner này?", createVoucherTitle: "Tạo mã voucher mới",
  fillRequired: "Vui lòng nhập đủ thông tin", saving: "Đang lưu...",
  discountType: "Loại giảm giá", valueStar: "Giá trị *",
  minOrderLabel: "Đơn tối thiểu (đ)", usageLimit: "Giới hạn dùng", expiryDate: "Ngày hết hạn",
  createBanner: "Tạo banner", freeShip: "Miễn ship",
  // Admin Approvals
  approvalsTitle: "Phê duyệt", approve: "Duyệt", reject: "Từ chối",
  pendingReview: "Chờ xem xét", approved: "Đã duyệt", rejected: "Đã từ chối",
  supplierApproval: "Duyệt nhà cung cấp", productApproval: "Duyệt sản phẩm",
  requestDate: "Ngày yêu cầu", reviewNote: "Ghi chú xét duyệt",
  // Admin Reports
  reportsTitle: "Báo cáo", salesReport: "Báo cáo bán hàng", revenueReport: "Báo cáo doanh thu",
  productReport: "Báo cáo sản phẩm", userReport: "Báo cáo người dùng",
  exportPDF: "Xuất PDF", exportCSV: "Xuất CSV", dateRange: "Khoảng thời gian",
  from: "Từ", to: "Đến", chart: "Biểu đồ", table: "Bảng",
  // Admin Settings
  settingsTitle: "Cài đặt hệ thống", generalSettings: "Cài đặt chung",
  siteName: "Tên website", siteDescription: "Mô tả website",
  contactEmail: "Email liên hệ", contactPhone: "Số điện thoại", socialMedia: "Mạng xã hội",
  shippingSettings: "Cài đặt vận chuyển", paymentSettings: "Cài đặt thanh toán",
  notificationSettings: "Cài đặt thông báo", securitySettings: "Bảo mật", saveSettings: "Lưu cài đặt",
  // Supplier sidebar
  supplierDashboard: "Dashboard", supplierOrders: "Đơn hàng", supplierProducts: "Sản phẩm",
  supplierInventory: "Kho hàng", supplierFinance: "Tài chính", supplierSettings: "Cài đặt",
  groupMain: "CHÍNH",
  // Supplier content
  supplierDashTitle: "Tổng quan nhà cung cấp", pendingOrders: "Đơn chờ xử lý",
  processingOrders: "Đang xử lý", completedOrders: "Đã hoàn thành", cancelledOrders: "Đã hủy",
  lowStock: "Sắp hết hàng", monthlyIncome: "Thu nhập tháng", ordersToday: "Đơn hôm nay",
  productsActive: "Sản phẩm đang bán", manageProducts: "Quản lý sản phẩm",
  addNewProduct: "Thêm sản phẩm", productImage: "Ảnh sản phẩm",
  dragDropImage: "Kéo thả hoặc click để chọn ảnh", imageFormat: "JPG, PNG, WEBP — tối đa 5MB",
  removeImage: "Xóa ảnh", productNameLabel: "Tên sản phẩm *", oemCodeLabel: "Mã OEM *",
  priceLabel: "Giá bán (VNĐ) *", stockLabel: "Số lượng kho *", categoryLabel: "Danh mục",
  typeLabel: "Loại hàng", compatibleVehicles: "Xe tương thích (mỗi dòng một loại)",
  saveProduct: "Lưu sản phẩm", onSale: "Đang bán", hidden: "Tạm ẩn", view: "Xem",
  // Supplier Orders
  supplierOrderTitle: "Quản lý đơn hàng",
  advanceStatus: "Chuyển trạng thái", saveTracking: "Lưu mã vận đơn",
  noOrderSelected: "Chọn đơn hàng để xem chi tiết", orderInfo: "Thông tin đơn hàng",
  // Supplier Inventory
  inventoryTitle: "Quản lý kho hàng", warehouseName: "Tên kho",
  stockIn: "Nhập kho", stockOut: "Xuất kho", adjustStock: "Điều chỉnh",
  currentStock: "Tồn hiện tại", minStock: "Tồn tối thiểu",
  stockAlert: "Cảnh báo tồn kho", importHistory: "Lịch sử nhập/xuất",
  // Supplier Finance
  supplierFinanceTitle: "Tài chính nhà cung cấp", availableBalance: "Số dư khả dụng",
  totalSales: "Tổng bán hàng", pendingPayment: "Chờ thanh toán", withdrawMoney: "Rút tiền",
  // Supplier Analytics
  analyticsTitle: "Phân tích & Thống kê", salesChart: "Biểu đồ bán hàng",
  topSellingProducts: "Sản phẩm bán chạy", revenueByCategory: "Doanh thu theo danh mục",
  orderTrend: "Xu hướng đơn hàng",
  // Affiliate sidebar
  affiliateDashboard: "Dashboard", affiliateLinks: "Link Affiliate",
  affiliateTeam: "Đội nhóm CTV", affiliateCommissions: "Hoa hồng",
  affiliateWithdraw: "Rút tiền", affiliateSettings: "Cài đặt",
  // Affiliate content
  affiliateDashTitle: "Tổng quan CTV", totalCommission: "Tổng hoa hồng",
  pendingCommission: "Hoa hồng chờ", paidCommission: "Đã thanh toán",
  totalClicks: "Tổng click", totalConversions: "Tổng chuyển đổi",
  conversionRate: "Tỷ lệ chuyển đổi", myLinks: "Link của tôi", createLink: "Tạo link mới",
  linkURL: "Đường dẫn", linkClicks: "Lượt click", linkOrders: "Đơn hàng",
  linkCommission: "Hoa hồng", copyLink: "Sao chép", shareLink: "Chia sẻ",
  teamMembers: "Thành viên đội nhóm", inviteTeam: "Mời thêm",
  memberName: "Tên", memberJoined: "Ngày tham gia", memberOrders: "Đơn hàng",
  memberCommission: "Hoa hồng", commissionHistory: "Lịch sử hoa hồng",
  withdrawHistory: "Lịch sử rút tiền", withdrawAmount: "Số tiền rút",
  bankAccount: "Tài khoản ngân hàng", bankName: "Ngân hàng",
  accountNumber: "Số tài khoản", accountHolder: "Chủ tài khoản",
  requestWithdraw: "Yêu cầu rút tiền",
  // Customer sidebar
  customerDashboard: "Tổng quan", customerOrders: "Đơn hàng", customerGarage: "Gara của tôi",
  customerRewards: "Điểm thưởng", customerWarranty: "Bảo hành",
  customerProfile: "Hồ sơ", customerSettings: "Cài đặt",
  // Customer content
  customerDashTitle: "Tổng quan khách hàng", myOrders: "Đơn hàng của tôi",
  recentPurchases: "Mua gần đây", totalSpent: "Tổng chi tiêu",
  rewardPoints: "Điểm thưởng", pointsAvailable: "Điểm khả dụng",
  pointsUsed: "Điểm đã dùng", pointsEarned: "Điểm đã tích", redeemPoints: "Đổi điểm",
  myGarage: "Gara xe của tôi", addVehicle: "Thêm xe", vehicleBrand: "Hãng xe",
  vehicleModel: "Dòng xe", vehicleYear: "Năm sản xuất", vehiclePlate: "Biển số",
  vehicleVIN: "Số VIN", warrantyTitle: "Quản lý bảo hành", warrantyProduct: "Sản phẩm",
  warrantyStartDate: "Ngày bắt đầu", warrantyEndDate: "Ngày hết hạn",
  warrantyStatus: "Trạng thái", warrantyClaim: "Yêu cầu bảo hành",
  profileTitle: "Hồ sơ cá nhân", personalInfo: "Thông tin cá nhân",
  changePassword: "Đổi mật khẩu", currentPassword: "Mật khẩu hiện tại",
  newPassword: "Mật khẩu mới", confirmNewPassword: "Xác nhận mật khẩu mới",
  // Settings shared
  settingLanguage: "Ngôn ngữ", settingNotification: "Thông báo",
  settingPrivacy: "Quyền riêng tư", settingAccount: "Tài khoản",
  deleteAccount: "Xóa tài khoản", settingSaved: "Đã lưu cài đặt",
  // About
  aboutTitle: "Về AutoParts", aboutDesc: "Nền tảng phụ tùng ô tô trực tuyến số 1 Việt Nam",
  ourMission: "Sứ mệnh", ourVision: "Tầm nhìn", ourTeam: "Đội ngũ", contactUs: "Liên hệ",
  // Help
  helpTitle: "Trung tâm trợ giúp", faq: "Câu hỏi thường gặp",
  contactSupport: "Liên hệ hỗ trợ", guides: "Hướng dẫn sử dụng", askQuestion: "Bạn cần giúp gì?",
  // Tracking
  trackingTitle: "Theo dõi đơn hàng", enterOrderId: "Nhập mã đơn hàng",
  trackBtn: "Theo dõi", trackingResult: "Kết quả tra cứu", shipmentStatus: "Trạng thái vận chuyển",
  trackOrder: "Tra cứu đơn hàng",
  trackOrderDesc: "Nhập mã đơn hàng để xem trạng thái vận chuyển và thông tin giao hàng của bạn.",
  orderCodePlaceholder: "Nhập mã đơn hàng (VD: AP-2024-001)...",
  lookUp: "Tra cứu",
  orderNotFound: "Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn.",
  systemError: "Lỗi hệ thống. Vui lòng thử lại sau.",
  orderSuccess: "Đặt hàng thành công",
  supplierConfirmed: "Nhà cung cấp xác nhận",
  packing: "Đóng gói hàng hóa",
  handedOver: "Bàn giao cho vận chuyển",
  delivered: "Giao hàng thành công",
  orderCancelled: "Đơn hàng đã hủy",
  orderJourney: "Hành trình đơn hàng",
  trackingCode: "Mã vận đơn",
  current: "Hiện tại",
  // VIN
  vinLookupTitle: "Tra cứu VIN",
  vinLookupDesc: "Nhập mã VIN 17 ký tự để tìm thông tin xe và phụ tùng tương thích",
  vinResult: "Kết quả tra cứu", vehicleInfo: "Thông tin xe", compatibleParts: "Phụ tùng tương thích",
  // Payment
  paymentSuccess: "Thanh toán thành công!",
  paymentSuccessDesc: "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.",
  paymentFail: "Thanh toán thất bại",
  paymentFailDesc: "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.",
  returnHome: "Về trang chủ", retryPayment: "Thử lại", viewOrder: "Xem đơn hàng",
  // Flash Sale
  flashSaleTitle: "Flash Sale — Giảm Sốc", flashSaleCountdown: "Kết thúc sau",
  hours: "Giờ", minutes: "Phút", seconds: "Giây",
  // System
  dropshippingSystem: "Hệ thống Dropshipping", supplierGold: "Nhà cung cấp Gold",
  checkingLogin: "Đang kiểm tra đăng nhập...", accessDenied: "Không có quyền truy cập",
  accessDeniedDesc: "Tài khoản của bạn không có quyền vào trang này.",
  loginAgain: "Đăng nhập lại", goHome: "Về trang chủ",
  // Homepage features
  featureOEM: "Phụ tùng OEM & OES chính hãng", featureFlashSale: "Flash Sale hàng ngày đến -40%",
  featureVIN: "Tra cứu VIN tương thích tức thì", featureWarranty: "Bảo hành toàn quốc qua hệ thống",
  platformTagline: "Nền tảng phụ tùng chính hãng số 1 Việt Nam",
  platformDesc: "Quản lý toàn bộ chuỗi cung ứng phụ tùng ô tô từ một nơi.",
  copyright: "© 2024 AutoParts. Hệ thống phân phối phụ tùng chuyên nghiệp.",
  // Mechanic sidebar
  mechanicDashboard: "Tổng quan", mechanicOrder: "Đặt phụ tùng",
  mechanicServices: "Dịch vụ sửa chữa", mechanicPoints: "Điểm kỹ thuật viên",
  mechanicProfile: "Hồ sơ", mechanicSettings: "Cài đặt",
  // Address Book
  addressBook: "Sổ địa chỉ", addAddress: "Thêm địa chỉ", editAddress: "Sửa địa chỉ",
  deleteAddress: "Xóa địa chỉ", setDefault: "Đặt mặc định", defaultAddress: "Địa chỉ mặc định",
  recipientName: "Tên người nhận", recipientPhone: "SĐT người nhận",
  noAddresses: "Bạn chưa có địa chỉ nào", confirmDeleteAddress: "Xóa địa chỉ này?",
  // Wishlist
  wishlist: "Yêu thích", wishlistEmpty: "Danh sách yêu thích trống",
  removeFromWishlist: "Bỏ yêu thích", addedToWishlist: "Đã thêm vào yêu thích",
  // Reviews
  writeReview: "Viết đánh giá", reviewTitle: "Tiêu đề đánh giá", reviewContent: "Nội dung đánh giá",
  submitReview: "Gửi đánh giá", reviewPending: "Chờ duyệt", reviewApproved: "Đã duyệt",
  reviewRejected: "Bị từ chối", customerReviews: "Đánh giá của tôi", reviewsSection: "Đánh giá từ khách hàng",
  // Returns / RMA
  myReturns: "Đổi trả hàng", createReturn: "Tạo yêu cầu đổi trả", returnReason: "Lý do đổi trả",
  returnStatus: "Trạng thái", returnPending: "Đang xử lý", returnApproved: "Đã duyệt",
  returnRejected: "Từ chối", returnOrderId: "Mã đơn hàng", returnDescription: "Mô tả vấn đề",
  returnImages: "Ảnh minh chứng", submitReturn: "Gửi yêu cầu",
  // Admin Inventory
  inventoryManage: "Quản lý kho hàng", stockAdjust: "Điều chỉnh tồn kho",
  stockHistory: "Lịch sử tồn kho", lowStockAlert: "Cảnh báo sắp hết", totalProducts: "Tổng sản phẩm",
 },
 zh: {
  // Nav
  products: "产品", flashSale: "限时特卖", vin: "VIN查询", login: "登录", logout: "退出",
  register: "注册", cart: "购物车", search: "搜索", searchBtn: "搜索",
  searchPlaceholder: "搜索配件（如：刹车片、机油滤清器...）",
  vinPlaceholder: "输入17位VIN码（示例：1HGBH41JXMN109186）", vinBtn: "查询",
  // Homepage
  findByVehicle: "按车型查找配件", selectBrand: "选择品牌",
  selectModel: "选择车型", selectYear: "选择年份", findParts: "查找配件",
  vinQuickSearch: "VIN快速查询", heroTitle1: "正品汽车配件", heroTitle2: "全国信赖之选",
  heroDesc: "数字化汽车配件供应链平台——从供应商仓库直达维修师傅和车主，来源、价格和保修信息全透明。",
  shopNow: "立即购买", viewFlashSale: "查看特卖", categoryTitle: "产品分类",
  categorySubtitle: "精准找到您爱车所需配件", flashSaleEnds: "结束倒计时：",
  addToCart: "加入购物车", featuredProducts: "热门推荐",
  featuredSubtitle: "本月最畅销正品配件", whyChooseUs: "为什么选择 AutoParts？",
  proSeries: "旗舰系列", itemCount: "件商品",
  // Common UI
  viewAll: "查看全部", close: "关闭", save: "保存", cancel: "取消", confirm: "确认",
  submit: "提交", back: "返回", next: "下一步", loading: "加载中...",
  add: "添加", edit: "编辑", delete: "删除", filter: "筛选", export: "导出",
  status: "状态", action: "操作", price: "价格", total: "合计",
  quantity: "数量", order: "订单", orders: "订单", product: "产品",
  customer: "客户", date: "日期", note: "备注", payment: "支付",
  shipping: "配送", warranty: "质保", discount: "折扣", stock: "库存",
  brand: "品牌", category: "分类", description: "描述", rating: "评分", review: "评价",
  all: "全部", detail: "详情", update: "更新", create: "新建",
  noData: "暂无数据", searchGeneric: "搜索...",
  showing: "显示", of: "共", page: "页", previous: "上一页",
  active: "活跃", inactive: "停用", enable: "启用", disable: "停用",
  yes: "是", no: "否", success: "成功", error: "错误", warning: "警告", info: "信息",
  // Login
  loginTitle: "登录", loginSubtitle: "欢迎回来！请输入您的账户信息。",
  loginWelcome: "欢迎回来",
  emailLabel: "邮箱 / 手机号", emailPlaceholder: "your@email.com 或手机号",
  passwordLabel: "密码", forgotPassword: "忘记密码？", rememberMe: "记住登录状态",
  loginBtn: "登录 →", orContinueWith: "或继续使用",
  noAccount: "还没有账户？", registerNow: "立即注册",
  demoAccounts: "演示账户：", showPassword: "显示", hidePassword: "隐藏", email: "邮箱",
  // Register
  registerTitle: "创建新账户", registerSubtitle: "加入越南第一汽车配件平台",
  fullName: "姓名", fullNamePlaceholder: "张三",
  phone: "手机号", phonePlaceholder: "13800138000",
  passwordConfirm: "确认密码", selectRole: "选择账户类型",
  roleCustomer: "客户", roleSupplier: "供应商", roleAffiliate: "推广员",
  agreeTerms: "我同意", termsOfService: "服务条款",
  and: "和", privacyPolicy: "隐私政策",
  registerBtn: "创建账户 →", haveAccount: "已有账户？", loginNow: "立即登录",
  // Generic UI utilities
  save: "节省", saveBtn: "保存", cancel: "取消", edit: "编辑", delete: "删除", confirm: "确认",
  note: "备注", noData: "暂无数据", addToCart: "加入购物车",
  // Cart/Checkout
  cartTitle: "您的购物车", cartEmpty: "购物车为空",
  cartContinueShopping: "继续购物", cartCheckout: "结算",
  cartSubtotal: "小计", cartShipping: "运费", cartTotal: "总计",
  cartFreeShipping: "免费", cartRemove: "删除",
  checkoutTitle: "订单结算", shippingInfo: "收货信息",
  paymentMethod: "支付方式", orderSummary: "订单摘要",
  placeOrder: "提交订单", cod: "货到付款",
  bankTransfer: "银行转账", eWallet: "电子钱包",
  address: "地址", city: "城市", district: "区/县", ward: "街道/乡",
  addressDetail: "门牌号、街道名", voucherCode: "优惠码", apply: "使用",
  // Products
  productsTitle: "配件目录", productsSortBy: "排序", productsFilter: "筛选产品",
  productsInStock: "有货", productsAll: "全部", productsNoResult: "未找到产品",
  productsAddCart: "加入购物车", productsBuyNow: "立即购买",
  productsOriginalPrice: "标价", productsYourPrice: "您的价格",
  productDetail: "产品详情", specifications: "产品参数",
  compatibility: "兼容车型", reviews: "评价", relatedProducts: "相关产品",
  oemCode: "OEM编码", inStock: "有货", outOfStock: "缺货", sold: "已售",
  genericParts: "通用零件",
  // Admin sidebar
  adminDashboard: "控制台", adminUsers: "合作伙伴与客户",
  adminCatalog: "分类与配件", adminOrders: "订单",
  adminFinance: "财务与佣金", adminMarketing: "营销与优惠券",
  adminApprovals: "审批", adminReports: "报告", adminSettings: "系统设置",
  groupManage: "管理", groupOperations: "运营",
  // Admin content
  dashboardTitle: "控制台", totalRevenue: "总营收",
  totalOrders: "总订单", totalProducts: "总产品", totalUsers: "总用户",
  newOrders: "新订单", pendingApprovals: "待审批", monthlyRevenue: "月营收",
  recentOrders: "最近订单", topProducts: "畅销产品",
  systemOverview: "系统概览", quickActions: "快捷操作",
  viewAllOrders: "查看全部订单", growth: "增长", comparedLastMonth: "较上月",
  today: "今天", thisWeek: "本周", thisMonth: "本月", thisYear: "本年",
  // Admin Users
  usersTitle: "管理合作伙伴与客户", addUser: "添加用户",
  userName: "姓名", userEmail: "邮箱", userRole: "角色", userStatus: "状态",
  userJoined: "加入日期", userActions: "操作", editUser: "编辑用户",
  deleteUser: "删除用户", confirmDelete: "确定要删除吗？",
  roleAdmin: "管理员", roleSupplier2: "供应商", roleCustomer2: "客户",
  roleAffiliate2: "推广员", manageRoles: "管理角色",
  roleName: "角色名称", roleColor: "颜色", searchUsers: "按名称、邮箱搜索...",
  verified: "已验证", unverified: "未验证",
  // Admin Catalog
  catalogTitle: "分类与配件", addProduct: "添加产品",
  categoryName: "分类名称", productName: "产品名称", productPrice: "售价",
  productStock: "库存", productType: "类型", productBrand: "品牌",
  productCategory: "分类", searchProducts: "搜索产品...",
  allCategories: "全部分类", allTypes: "全部类型",
  // Admin Orders
  ordersTitle: "订单管理", orderDate: "下单日期", orderCustomer: "客户",
  orderTotal: "总金额", orderStatus: "状态", orderDetail: "订单详情",
  orderId: "订单号", orderItems: "商品", shippingAddress: "收货地址",
  trackingNumber: "物流单号", statusPending: "待处理", statusConfirmed: "已确认",
  statusShipping: "配送中", statusDelivered: "已送达", statusCancelled: "已取消",
  statusReturned: "已退货", searchOrders: "搜索订单...", allStatuses: "全部状态",
  exportExcel: "导出Excel", totalAmount: "商品总额", shippingFee: "运费",
  discountAmount: "折扣", finalTotal: "实付金额",
  // Admin Finance
  financeTitle: "财务与佣金", revenue: "营收", commission: "佣金",
  profit: "利润", payout: "支出", pendingPayout: "待支付",
  completedPayout: "已支付", transactionHistory: "交易记录",
  transactionDate: "日期", transactionType: "类型", transactionAmount: "金额",
  transactionStatus: "状态", withdrawRequest: "提现申请",
  // Supplier Settings
  storeInfo: "店铺信息", storeName: "店铺名称",
  taxCode: "税号", warehouseAddress: "仓库地址",
  currentPlatformFee: "当前平台费率", agreedWithPlatform: "与平台协议",
  ofTotalGMV: "占总GMV",
  automatedOperations: "自动化运营",
  autoConfirmOrder: "自动确认订单", autoConfirmOrderDesc: "客户付款后系统自动审核订单",
  autoUpdateShipping: "自动更新物流", autoUpdateShippingDesc: "自动同步物流合作伙伴状态",
  sameDayDelivery: "同城当日达", sameDayDeliveryDesc: "适用于同省市订单",
  notifications: "通知设置",
  newOrder: "新订单通知", newOrderDesc: "有新订单时接收提醒",
  lowStockWarn: "低库存警告", lowStockWarnDesc: "库存低于最低水平时提醒",
  payoutAlert: "结算通知", payoutAlertDesc: "收到平台结算时提醒",
  productGotReview: "产品收到评价", productGotReviewDesc: "客户留评时立即通知",
  flashSalePromo: "限时抢购活动", flashSalePromoDesc: "受邀参加大型促销时提醒",
  suspendOperations: "暂停营业", suspendOperationsDesc: "您的店铺将暂时从系统隐藏，客户无法下单。",
  requestSuspendStore: "申请暂停", savedSuccess: "保存成功！",
  // Admin Marketing
  marketingTitle: "营销与优惠券", createVoucher: "创建优惠券",
  voucherCodeLabel: "优惠码", voucherType: "类型", voucherValue: "面值",
  voucherMinOrder: "最低消费", voucherUsed: "已用", voucherLimit: "限量",
  voucherExpiry: "过期时间", voucherStatus: "状态", voucherActions: "操作",
  typePercent: "百分比", typeFixed: "固定金额", typeFreeShipping: "免运费",
  searchVoucher: "搜索优惠码...", promoCode: "优惠码", bannerAds: "广告横幅",
  flashSaleManage: "限时特卖", createFlashSale: "创建限时特卖",
  campaignName: "活动名称", discountPercent: "折扣(%)",
  startTime: "开始时间", endTime: "结束时间",
  selectProductsLabel: "选择商品", selected: "已选",
  scheduleFlashSale: "安排特卖", running: "进行中", scheduled: "已安排",
  ended: "已结束", addBanner: "添加横幅", bannerTitle: "标题",
  bannerSubtitle: "副标题", bannerCTA: "CTA按钮", bannerLink: "链接",
  bannerStartDate: "开始日期", bannerEndDate: "结束日期", clicks: "点击量",
  deleteVoucher: "确定删除该优惠券？", deleteFlashSale: "确定删除该活动？",
  deleteBanner: "确定删除该横幅？", createVoucherTitle: "创建新优惠券",
  fillRequired: "请填写完整信息", saving: "保存中...",
  discountType: "折扣类型", valueStar: "面值 *",
  minOrderLabel: "最低消费", usageLimit: "使用限额", expiryDate: "过期日期",
  createBanner: "创建横幅", freeShip: "免运费",
  // Admin Approvals
  approvalsTitle: "审批管理", approve: "批准", reject: "拒绝",
  pendingReview: "待审核", approved: "已批准", rejected: "已拒绝",
  supplierApproval: "供应商审批", productApproval: "产品审批",
  requestDate: "申请日期", reviewNote: "审批备注",
  // Admin Reports
  reportsTitle: "报告中心", salesReport: "销售报告", revenueReport: "营收报告",
  productReport: "产品报告", userReport: "用户报告",
  exportPDF: "导出PDF", exportCSV: "导出CSV", dateRange: "时间范围",
  from: "从", to: "到", chart: "图表", table: "表格",
  // Admin Settings
  settingsTitle: "系统设置", generalSettings: "常规设置",
  siteName: "网站名称", siteDescription: "网站描述",
  contactEmail: "联系邮箱", contactPhone: "联系电话", socialMedia: "社交媒体",
  shippingSettings: "配送设置", paymentSettings: "支付设置",
  notificationSettings: "通知设置", securitySettings: "安全设置", saveSettings: "保存设置",
  // Supplier sidebar
  supplierDashboard: "仪表板", supplierOrders: "订单", supplierProducts: "产品",
  supplierInventory: "库存", supplierFinance: "财务", supplierSettings: "设置",
  groupMain: "主要",
  // Supplier content
  supplierDashTitle: "供应商概览", pendingOrders: "待处理",
  processingOrders: "处理中", completedOrders: "已完成", cancelledOrders: "已取消",
  lowStock: "库存不足", monthlyIncome: "月收入", ordersToday: "今日订单",
  productsActive: "在售商品", manageProducts: "管理产品",
  addNewProduct: "添加产品", productImage: "产品图片",
  dragDropImage: "拖放或点击选择图片", imageFormat: "JPG, PNG, WEBP — 最大5MB",
  removeImage: "删除图片", productNameLabel: "产品名称 *", oemCodeLabel: "OEM编码 *",
  priceLabel: "售价 *", stockLabel: "库存数量 *", categoryLabel: "分类",
  typeLabel: "类型", compatibleVehicles: "兼容车型（每行一个）",
  saveProduct: "保存产品", onSale: "在售", hidden: "隐藏", view: "查看",
  // Supplier Orders
  supplierOrderTitle: "订单管理",
  advanceStatus: "推进状态", saveTracking: "保存物流单号",
  noOrderSelected: "选择订单查看详情", orderInfo: "订单信息",
  // Supplier Inventory
  inventoryTitle: "库存管理", warehouseName: "仓库名称",
  stockIn: "入库", stockOut: "出库", adjustStock: "调整",
  currentStock: "当前库存", minStock: "最低库存",
  stockAlert: "库存预警", importHistory: "出入库记录",
  // Supplier Finance
  supplierFinanceTitle: "供应商财务", availableBalance: "可用余额",
  totalSales: "总销售额", pendingPayment: "待结算", withdrawMoney: "提现",
  // Supplier Analytics
  analyticsTitle: "分析与统计", salesChart: "销售图表",
  topSellingProducts: "畅销产品", revenueByCategory: "分类营收",
  orderTrend: "订单趋势",
  // Affiliate sidebar
  affiliateDashboard: "仪表板", affiliateLinks: "推广链接",
  affiliateTeam: "团队", affiliateCommissions: "佣金",
  affiliateWithdraw: "提现", affiliateSettings: "设置",
  // Affiliate content
  affiliateDashTitle: "推广员概览", totalCommission: "总佣金",
  pendingCommission: "待结算", paidCommission: "已结算",
  totalClicks: "总点击", totalConversions: "总转化",
  conversionRate: "转化率", myLinks: "我的链接", createLink: "创建链接",
  linkURL: "链接地址", linkClicks: "点击量", linkOrders: "订单数",
  linkCommission: "佣金", copyLink: "复制", shareLink: "分享",
  teamMembers: "团队成员", inviteTeam: "邀请",
  memberName: "姓名", memberJoined: "加入日期", memberOrders: "订单",
  memberCommission: "佣金", commissionHistory: "佣金记录",
  withdrawHistory: "提现记录", withdrawAmount: "提现金额",
  bankAccount: "银行账户", bankName: "银行名称",
  accountNumber: "账号", accountHolder: "持卡人",
  requestWithdraw: "申请提现",
  // Customer sidebar
  customerDashboard: "总览", customerOrders: "我的订单", customerGarage: "我的车库",
  customerRewards: "积分", customerWarranty: "质保",
  customerProfile: "个人资料", customerSettings: "设置",
  // Customer content
  customerDashTitle: "客户概览", myOrders: "我的订单",
  recentPurchases: "最近购买", totalSpent: "总消费",
  rewardPoints: "积分", pointsAvailable: "可用积分",
  pointsUsed: "已用积分", pointsEarned: "已获积分", redeemPoints: "兑换积分",
  myGarage: "我的车库", addVehicle: "添加车辆", vehicleBrand: "品牌",
  vehicleModel: "车型", vehicleYear: "年份", vehiclePlate: "车牌号",
  vehicleVIN: "VIN码", warrantyTitle: "质保管理", warrantyProduct: "产品",
  warrantyStartDate: "开始日期", warrantyEndDate: "到期日期",
  warrantyStatus: "状态", warrantyClaim: "申请质保",
  profileTitle: "个人资料", personalInfo: "基本信息",
  changePassword: "修改密码", currentPassword: "当前密码",
  newPassword: "新密码", confirmNewPassword: "确认新密码",
  // Settings shared
  settingLanguage: "语言", settingNotification: "通知",
  settingPrivacy: "隐私", settingAccount: "账户",
  deleteAccount: "注销账户", settingSaved: "设置已保存",
  // About
  aboutTitle: "关于 AutoParts", aboutDesc: "越南第一在线汽车配件平台",
  ourMission: "我们的使命", ourVision: "我们的愿景", ourTeam: "我们的团队", contactUs: "联系我们",
  // Help
  helpTitle: "帮助中心", faq: "常见问题",
  contactSupport: "联系客服", guides: "使用指南", askQuestion: "您需要什么帮助？",
  // Tracking
  trackingTitle: "订单追踪", enterOrderId: "输入订单号",
  trackBtn: "追踪", trackingResult: "查询结果", shipmentStatus: "物流状态",
  trackOrder: "查询订单",
  trackOrderDesc: "输入订单号查看配送状态和收货信息。",
  orderCodePlaceholder: "输入订单号（如：AP-2024-001）...",
  lookUp: "查询",
  orderNotFound: "未找到该订单，请检查订单号是否正确。",
  systemError: "系统错误，请稍后重试。",
  orderSuccess: "下单成功",
  supplierConfirmed: "供应商已确认",
  packing: "打包中",
  handedOver: "已交运",
  delivered: "已送达",
  orderCancelled: "订单已取消",
  orderJourney: "订单进度",
  trackingCode: "物流单号",
  current: "当前",
  // VIN
  vinLookupTitle: "VIN查询",
  vinLookupDesc: "输入17位VIN码查找车辆信息及兼容配件",
  vinResult: "查询结果", vehicleInfo: "车辆信息", compatibleParts: "兼容配件",
  // Payment
  paymentSuccess: "支付成功！", paymentSuccessDesc: "感谢购买，您的订单正在处理中。",
  paymentFail: "支付失败", paymentFailDesc: "支付过程中出现错误，请重试。",
  returnHome: "返回首页", retryPayment: "重试", viewOrder: "查看订单",
  // Flash Sale
  flashSaleTitle: "限时特卖", flashSaleCountdown: "结束倒计时",
  hours: "时", minutes: "分", seconds: "秒",
  // System
  dropshippingSystem: "代发系统", supplierGold: "金牌供应商",
  checkingLogin: "正在检查登录...", accessDenied: "无访问权限",
  accessDeniedDesc: "您的账户无权访问此页面。",
  loginAgain: "重新登录", goHome: "返回首页",
  // Homepage features
  featureOEM: "OEM和OES正品配件", featureFlashSale: "每日特卖低至6折",
  featureVIN: "VIN智能匹配", featureWarranty: "全国联保体系",
  platformTagline: "越南第一正品配件平台",
  platformDesc: "一站式管理汽车配件供应链。",
  copyright: "© 2024 AutoParts. 专业配件分销系统。",
  // Mechanic sidebar
  mechanicDashboard: "总览", mechanicOrder: "订购配件",
  mechanicServices: "维修服务", mechanicPoints: "技师积分",
  mechanicProfile: "个人资料", mechanicSettings: "设置",
  // Address Book
  addressBook: "地址簿", addAddress: "添加地址", editAddress: "编辑地址",
  deleteAddress: "删除地址", setDefault: "设为默认", defaultAddress: "默认地址",
  recipientName: "收件人姓名", recipientPhone: "收件人电话",
  noAddresses: "暂无地址", confirmDeleteAddress: "确定删除此地址？",
  // Wishlist
  wishlist: "收藏夹", wishlistEmpty: "收藏夹为空",
  removeFromWishlist: "取消收藏", addedToWishlist: "已添加到收藏",
  // Reviews
  writeReview: "写评价", reviewTitle: "评价标题", reviewContent: "评价内容",
  submitReview: "提交评价", reviewPending: "待审核", reviewApproved: "已通过",
  reviewRejected: "已拒绝", customerReviews: "我的评价", reviewsSection: "客户评价",
  // Returns / RMA
  myReturns: "退换货", createReturn: "创建退换货申请", returnReason: "退换原因",
  returnStatus: "状态", returnPending: "处理中", returnApproved: "已批准",
  returnRejected: "已拒绝", returnOrderId: "订单号", returnDescription: "问题描述",
  returnImages: "证明图片", submitReturn: "提交申请",
  // Admin Inventory
  inventoryManage: "库存管理", stockAdjust: "调整库存",
  stockHistory: "库存记录", lowStockAlert: "低库存预警", totalProducts: "产品总数",
 },
} as const;

export type TransKey = keyof typeof dict.vi;

// ──────────────── CONTEXT ────────────────
const LangContext = createContext<{
 lang: Lang;
 setLang: (l: Lang) => void;
 t: (key: TransKey) => string;
 fp: (vnd: number) => string;
}>({
 lang: "vi",
 setLang: () => {},
 t: (key) => dict.vi[key],
 fp: (vnd) => formatPriceLang(vnd, "vi"),
});

export function LangProvider({ children }: { children: ReactNode }) {
 const [lang, setLangState] = useState<Lang>("vi");

 useEffect(() => {
  const saved = localStorage.getItem("lang") as Lang | null;
  if (saved === "vi" || saved === "zh") setLangState(saved);
 }, []);

 const setLang = (l: Lang) => {
  setLangState(l);
  localStorage.setItem("lang", l);
  document.documentElement.lang = l === "zh" ? "zh-CN" : "vi";
 };

 // Fallback to vi if zh translation is missing
 const t = (key: TransKey): string => (dict[lang][key] ?? dict.vi[key] ?? key) as string;
 const fp = (vnd: number): string => formatPriceLang(vnd, lang);

 return React.createElement(LangContext.Provider, { value: { lang, setLang, t, fp } }, children);
}

export function useLang() {
 return useContext(LangContext);
}

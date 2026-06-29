import AuthGuard from "@/components/AuthGuard";
import CustomerSidebar from "@/components/CustomerSidebar";

// Sidebar nằm ở layout dùng chung -> điều hướng giữa các mục chỉ load lại NỘI DUNG, sidebar giữ nguyên
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={["customer", "admin"]}>
      <div className="ap-role-shell flex h-screen w-full overflow-hidden" style={{ background: "#f8f8fa" }}>
        <CustomerSidebar />
        {children}
      </div>
    </AuthGuard>
  );
}

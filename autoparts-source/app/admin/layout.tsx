import AuthGuard from "@/components/AuthGuard";
import AdminSidebar from "@/components/AdminSidebar";

// Sidebar ở layout dùng chung -> đổi mục chỉ load NỘI DUNG, sidebar giữ nguyên
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="ap-role-shell flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
        <AdminSidebar />
        {children}
      </div>
    </AuthGuard>
  );
}

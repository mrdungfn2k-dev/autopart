import AuthGuard from "@/components/AuthGuard";
import SupplierSidebar from "@/components/SupplierSidebar";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={["supplier", "admin"]}>
      <div className="ap-role-shell flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
        <SupplierSidebar />
        {children}
      </div>
    </AuthGuard>
  );
}

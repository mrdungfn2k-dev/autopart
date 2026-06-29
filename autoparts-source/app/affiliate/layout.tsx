import AuthGuard from "@/components/AuthGuard";
import AffiliateSidebar from "@/components/AffiliateSidebar";

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={["affiliate", "admin"]}>
      <div className="ap-role-shell flex h-screen w-full overflow-hidden" style={{ background: "var(--ap-page-bg)" }}>
        <AffiliateSidebar />
        {children}
      </div>
    </AuthGuard>
  );
}

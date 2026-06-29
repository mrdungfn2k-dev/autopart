import AuthGuard from "@/components/AuthGuard";
export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRoles={["supplier", "admin"]}>{children}</AuthGuard>;
}

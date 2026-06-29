import AuthGuard from "@/components/AuthGuard";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRoles={["admin"]}>{children}</AuthGuard>;
}

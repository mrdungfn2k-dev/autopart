import AuthGuard from "@/components/AuthGuard";
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRoles={["customer", "admin"]}>{children}</AuthGuard>;
}

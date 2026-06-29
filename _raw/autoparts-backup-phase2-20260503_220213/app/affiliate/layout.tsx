import AuthGuard from "@/components/AuthGuard";
export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard requiredRoles={["affiliate", "admin"]}>{children}</AuthGuard>;
}

import type { Metadata } from "next";
import { readJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = 'Chính sách AutoParts';
  const fallbackDesc = 'Chính sách vận chuyển, bảo mật, đổi trả và quy chế hoạt động sàn AutoParts.';
  try {
    const settings = readJson<any>("settings.json") || {};
    const meta = settings?.seoMeta?.['policy'];
    return {
      title: (meta?.title && meta.title.trim()) || fallbackTitle,
      description: (meta?.description && meta.description.trim()) || fallbackDesc,
    };
  } catch {
    return { title: fallbackTitle, description: fallbackDesc };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

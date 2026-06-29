import type { Metadata } from "next";
import { readJson } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const fallbackTitle = 'Trung tâm hỗ trợ';
  const fallbackDesc = 'Hỗ trợ đặt hàng, vận chuyển, đổi trả và sử dụng AutoParts.';
  try {
    const settings = readJson<any>("settings.json") || {};
    const meta = settings?.seoMeta?.['support'];
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

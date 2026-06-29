"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";

// Trang tĩnh TỰ THÊM từ Admin → CMS (slug dạng /p/<slug>), nội dung đọc từ /api/cms-pages
export default function CmsCustomPage() {
  const params = useParams() as { slug?: string };
  const slug = "/p/" + (params?.slug || "");
  const [page, setPage] = useState<{ title: string; content: string } | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/cms-pages", { cache: "no-store" })
      .then(r => r.json())
      .then((pages) => {
        const p = Array.isArray(pages) ? pages.find((x: any) => x.slug === slug) : null;
        setPage(p ? { title: p.title, content: p.content } : null);
      })
      .catch(() => setPage(null));
  }, [slug]);

  return (
    <div className="min-h-screen" style={{ background: "#f8f8fa" }}>
      <StorefrontHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {page === undefined ? (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-10 animate-pulse h-64" />
        ) : page === null ? (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-10 text-center">
            <p className="text-xl font-bold text-[#44494d] mb-2">Không tìm thấy trang</p>
            <p className="text-sm text-[#8f9294] mb-4">Trang này không tồn tại hoặc đã bị xóa.</p>
            <Link href="/" className="text-sm font-semibold" style={{ color: "var(--ap-primary)" }}>← Về trang chủ</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#f0f0f0] p-8 md:p-10 cms-content"
            dangerouslySetInnerHTML={{ __html: page.content }} />
        )}
      </div>
      <StorefrontFooter />
    </div>
  );
}

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import ScrollRestoration from "@/components/ScrollRestoration";
import ThemeProvider from "@/components/ThemeProvider";
import { readJson } from "@/lib/fileStore";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["vietnamese", "latin"],
  display: "swap",
  variable: "--font-roboto",
});

function getSettings(): any {
  try {
    return readJson<any>("settings.json") || {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = "https://autopartsvietnam.com.vn";
  const settings = getSettings();
  const branding = settings?.branding ?? {};

  let logoUrl = `${SITE_URL}/icon.png`;
  if (branding.logoUrl) {
    const raw = branding.logoUrl as string;
    logoUrl = raw.startsWith("http") ? raw : `${SITE_URL}${raw}`;
  }

  const faviconUrl = branding.faviconUrl || "/favicon.ico";
  const siteName = branding.brandName || "AutoParts";

  return {
    title: settings?.seoMeta?.home?.title?.trim() || `${siteName} — Phụ Tùng Ô Tô Chính Hãng`,
    description: settings?.seoMeta?.home?.description?.trim() || "Nền tảng mua bán phụ tùng ô tô chính hãng, aftermarket đa dạng. Tra cứu theo hãng xe, đời xe, mã OEM hoặc số VIN.",
    keywords: "phụ tùng ô tô, spare parts, OEM, aftermarket, Toyota, Honda, Mazda",
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: "/icon.png",
    },
    openGraph: {
      title: `${siteName} — Phụ Tùng Ô Tô Chính Hãng`,
      description: "Nền tảng mua bán phụ tùng ô tô chính hãng, aftermarket đa dạng. Tra cứu theo hãng xe, đời xe, mã OEM hoặc số VIN.",
      url: `${SITE_URL}/`,
      siteName,
      images: [{ url: logoUrl, width: 1200, height: 630, alt: `${siteName} — Phụ Tùng Ô Tô Chính Hãng` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} — Phụ Tùng Ô Tô Chính Hãng`,
      description: "Nền tảng mua bán phụ tùng ô tô chính hãng, aftermarket đa dạng.",
      images: [logoUrl],
    },
  };
}

import ScrollToTopButton from "@/components/ScrollToTopButton";
import SocialBar from "@/components/SocialBar";
import Toaster from "@/components/Toast";
import ConfirmHost from "@/components/ConfirmDialog";
import ChatWidget from "@/components/ChatWidget";
import AuthWatcher from "@/components/AuthWatcher";
import MaintenanceGate from "@/components/MaintenanceGate";
import NotificationBell from "@/components/NotificationBell";
import ZoomGuard from "@/components/ZoomGuard";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const customCss: string = (settings?.customCss as string) || "";
  const customJs: string = (settings?.customJs as string) || "";

  return (
    <html lang="vi" className={`${roboto.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
      </head>
      <body className={`antialiased font-sans ${roboto.className}`}>
        <ThemeProvider />
        <ZoomGuard />
        <ScrollRestoration />
        <LangProvider>{children}</LangProvider>
        <ScrollToTopButton />
        <SocialBar />
        <ChatWidget />
        <Toaster />
        <ConfirmHost />
        <AuthWatcher />
        <MaintenanceGate />
        <NotificationBell />
        {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}
      </body>
    </html>
  );
}

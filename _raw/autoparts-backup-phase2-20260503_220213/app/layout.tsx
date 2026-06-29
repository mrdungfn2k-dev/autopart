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

export async function generateMetadata(): Promise<Metadata> {
  const SITE_URL = "https://autopartsvietnam.com.vn";
  let logoUrl = `${SITE_URL}/icon.png`;
  try {
    const settings = readJson<any>("settings.json");
    if (settings?.branding?.logoUrl) {
      // Ensure absolute URL for OG tags
      const raw = settings.branding.logoUrl as string;
      logoUrl = raw.startsWith("http") ? raw : `${SITE_URL}${raw}`;
    }
  } catch {}

  return {
   title: "AutoParts — Phụ Tùng Ô Tô Chính Hãng",
   description: "Nền tảng mua bán phụ tùng ô tô chính hãng, aftermarket đa dạng. Tra cứu theo hãng xe, đời xe, mã OEM hoặc số VIN.",
   keywords: "phụ tùng ô tô, spare parts, OEM, aftermarket, Toyota, Honda, Mazda",
   icons: {
     icon: "/favicon.ico",
     shortcut: "/favicon.ico",
     apple: "/icon.png",
   },
   openGraph: {
    title: "AutoParts — Phụ Tùng Ô Tô Chính Hãng",
    description: "Nền tảng mua bán phụ tùng ô tô chính hãng, aftermarket đa dạng. Tra cứu theo hãng xe, đời xe, mã OEM hoặc số VIN.",
    url: `${SITE_URL}/`,
    siteName: "AutoParts",
    images: [{ url: logoUrl, width: 1200, height: 630, alt: "AutoParts — Phụ Tùng Ô Tô Chính Hãng" }],
    type: "website",
   },
   twitter: {
    card: "summary_large_image",
    title: "AutoParts — Phụ Tùng Ô Tô Chính Hãng",
    description: "Nền tảng mua bán phụ tùng ô tô chính hãng, aftermarket đa dạng.",
    images: [logoUrl],
   },
  };
}

import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
  <html lang="vi" className={`${roboto.variable}`}>
  <head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
   <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
  </head>
  <body className={`antialiased font-sans ${roboto.className}`}>
   <ThemeProvider />
   <ScrollRestoration />
   <LangProvider>{children}</LangProvider>
   <ScrollToTopButton />
  </body>
  </html>
 );
}

import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/lib/seo";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl(process.env)),
  title: { default: "Kerd · เกิด: เดือนเกิดนี้ ได้อะไรบ้าง?", template: "%s · Kerd เกิด" },
  description: "รวมโปรวันเกิดและเดือนเกิดจากแบรนด์ดัง พร้อมวิธีใช้สิทธิ์ แหล่งที่มา และวันที่ตรวจล่าสุด",
  openGraph: { type: "website", siteName: "Kerd · เกิด", locale: "th_TH" },
  twitter: { card: "summary_large_image" },
  appleWebApp: { title: "Kerd", statusBarStyle: "default" },
};

// สีแถบสถานะ/แถบที่อยู่ = --bg ของแต่ละธีม (docs/branding.md)
export const viewport: Viewport = {
  viewportFit: "cover", // ให้แถบล่างใช้ env(safe-area-inset-bottom) บน iPhone
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1320" },
  ],
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: THEME_SCRIPT ตั้ง data-theme ก่อน React hydrate
    <html lang="th" className={`${plexThai.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans max-md:pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <a
          href="#main"
          className="sr-only rounded-md bg-card px-4 py-2 font-medium shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          ข้ามไปเนื้อหาหลัก
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 outline-none">{children}</main>
        <SiteFooter />
        <BottomNav />
        {modal}
      </body>
    </html>
  );
}

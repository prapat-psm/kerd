import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Kerd · เกิด: เดือนเกิดนี้ ได้อะไรบ้าง?", template: "%s · Kerd เกิด" },
  description: "รวมโปรวันเกิดและเดือนเกิดจากแบรนด์ดัง พร้อมวิธีใช้สิทธิ์ แหล่งที่มา และวันที่ตรวจล่าสุด",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: THEME_SCRIPT ตั้ง data-theme ก่อน React hydrate
    <html lang="th" className={`${plexThai.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only rounded-md bg-card px-4 py-2 font-medium shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          ข้ามไปเนื้อหาหลัก
        </a>
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
          <Link href="/" className="flex items-baseline gap-2 rounded-md" aria-label="Kerd เกิด หน้าแรก">
            <Logo className="size-7 self-center" />
            <span className="text-2xl font-semibold">kerd</span>
            <span className="text-sm text-muted-foreground">เกิด</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/brand" className="rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
              แบรนด์
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 outline-none">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

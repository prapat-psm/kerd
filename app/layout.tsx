import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Thai } from "next/font/google";
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
        <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
          <Link href="/" className="flex items-baseline gap-2" aria-label="Kerd เกิด หน้าแรก">
            <span className="text-2xl font-semibold text-primary">kerd</span>
            <span className="text-sm text-muted-foreground">เกิด</span>
          </Link>
          <ThemeToggle />
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16">{children}</main>
        <footer className="mx-auto w-full max-w-3xl px-4 py-8 text-xs text-muted-foreground">
          ข้อมูลรวบรวมจากหน้าเว็บทางการของแต่ละแบรนด์ เงื่อนไขอาจเปลี่ยนได้ กรุณาตรวจสิทธิ์ที่ต้นทางก่อนใช้ทุกครั้ง
        </footer>
      </body>
    </html>
  );
}

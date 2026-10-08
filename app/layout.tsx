import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Thai } from "next/font/google";
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
    <html lang="th" className={`${plexThai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="mx-auto flex w-full max-w-3xl items-baseline gap-2 px-4 py-5">
          <Link href="/" className="text-2xl font-semibold text-brand">
            kerd
          </Link>
          <span className="text-sm text-muted">เกิด</span>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16">{children}</main>
        <footer className="mx-auto w-full max-w-3xl px-4 py-8 text-xs text-muted">
          ข้อมูลรวบรวมจากหน้าเว็บทางการของแต่ละแบรนด์ เงื่อนไขอาจเปลี่ยนได้ กรุณาตรวจสิทธิ์ที่ต้นทางก่อนใช้ทุกครั้ง
        </footer>
      </body>
    </html>
  );
}

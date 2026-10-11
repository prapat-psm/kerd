import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5">
      <Link href="/" className="group flex items-baseline gap-2 rounded-md" aria-label="Kerd เกิด หน้าแรก">
        {/* ลายเซ็น "เปลวเทียนไหว" เฉพาะอุปกรณ์ที่ hover ได้ (Tailwind v4 ห่อ hover ด้วย @media (hover: hover)) */}
        <Logo className="size-7 origin-bottom self-center motion-safe:group-hover:animate-flicker" />
        <span className="text-2xl font-semibold">kerd</span>
        <span className="text-sm text-muted-foreground">เกิด</span>
      </Link>
      <nav aria-label="เมนูหลัก (จอใหญ่)" className="flex items-center gap-4 max-md:hidden">
        <Link href="/brand" className="rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
          แบรนด์
        </Link>
        <Link href="/submit" className="rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
          แจ้งโปร
        </Link>
      </nav>
    </header>
  );
}

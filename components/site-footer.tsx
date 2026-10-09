import Link from "next/link";

const LINKS = [
  { href: "/brand", label: "แบรนด์ทั้งหมด" },
  { href: "/submit", label: "แจ้งโปรที่ยังไม่มี" },
  { href: "/privacy", label: "ความเป็นส่วนตัวและคุกกี้" },
  { href: "/terms", label: "ข้อกำหนดการใช้งาน" },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-3xl flex-col gap-3 border-t px-4 py-8 text-xs text-muted-foreground">
      <nav aria-label="ลิงก์ท้ายเว็บ">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-foreground hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p>ข้อมูลรวบรวมจากหน้าเว็บทางการของแต่ละแบรนด์ เงื่อนไขอาจเปลี่ยนได้ กรุณาตรวจสิทธิ์ที่ต้นทางก่อนใช้ทุกครั้ง</p>
    </footer>
  );
}

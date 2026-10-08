import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MONTHS } from "@/lib/months";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <section>
        <h1 className="text-3xl font-semibold text-foreground">เดือนเกิดนี้ ได้อะไรบ้าง?</h1>
        <p className="mt-2 text-muted-foreground">เลือกเดือนเกิดของคุณ ดูโปรที่ใช้ได้ พร้อมวิธีใช้สิทธิ์และวันที่ตรวจล่าสุด</p>
      </section>

      <nav aria-label="เลือกเดือนเกิด">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MONTHS.map((m) => (
            <li key={m.slug}>
              <Button asChild variant="outline" size="lg" className="w-full bg-card text-base">
                <Link href={`/birthday/${m.slug}`} prefetch={true}>
                  {m.th}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

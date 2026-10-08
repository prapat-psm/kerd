import Link from "next/link";
import { MONTHS } from "@/lib/months";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pt-6">
      <section>
        <h1 className="text-3xl font-semibold text-ink">เดือนเกิดนี้ ได้อะไรบ้าง?</h1>
        <p className="mt-2 text-muted">เลือกเดือนเกิดของคุณ ดูโปรที่ใช้ได้ พร้อมวิธีใช้สิทธิ์และวันที่ตรวจล่าสุด</p>
      </section>

      <nav aria-label="เลือกเดือนเกิด">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {MONTHS.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/birthday/${m.slug}`}
                prefetch={true}
                className="block rounded-xl bg-surface px-4 py-3 text-center font-medium text-ink ring-1 ring-ink/10 hover:ring-brand"
              >
                {m.th}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

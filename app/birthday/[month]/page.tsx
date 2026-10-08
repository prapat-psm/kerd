import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PromoCard } from "@/components/promo-card";
import { HeadingSkeleton, PromoListSkeleton } from "@/components/promo-card-skeleton";
import { MONTHS, monthFromSlug } from "@/lib/months";
import { stagger } from "@/lib/motion";
import { getPromosForMonth } from "@/lib/promos/queries";

export function generateStaticParams() {
  return MONTHS.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/birthday/[month]">): Promise<Metadata> {
  const n = monthFromSlug((await params).month);
  if (!n) return {};
  const th = MONTHS[n - 1].th;
  return {
    title: `โปรวันเกิดเดือน${th}`,
    description: `เกิดเดือน${th} ได้อะไรบ้าง รวมโปรวันเกิดและเดือนเกิด พร้อมวิธีใช้สิทธิ์และลิงก์ตรวจสิทธิ์ที่ต้นทาง`,
  };
}

async function MonthPromos({ params }: Pick<PageProps<"/birthday/[month]">, "params">) {
  const n = monthFromSlug((await params).month);
  if (!n) notFound();
  const promos = await getPromosForMonth(n);

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground">โปรวันเกิดเดือน{MONTHS[n - 1].th}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{promos.length} โปรที่ตรวจแล้ว</p>
      {promos.length === 0 ? (
        <p className="mt-6 text-muted-foreground">ยังไม่มีโปรที่ตรวจแล้วสำหรับเดือนนี้</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {promos.map((p, i) => (
            <div key={p.id} className="animate-fade-up stagger" style={stagger(i)}>
              <PromoCard promo={p} linkBrand />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function MonthPage({ params }: PageProps<"/birthday/[month]">) {
  return (
    <div className="pt-4">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← เลือกเดือนอื่น
      </Link>
      <div className="mt-3">
        <Suspense
          fallback={
            <div className="flex flex-col gap-6">
              <HeadingSkeleton />
              <PromoListSkeleton />
            </div>
          }
        >
          <MonthPromos params={params} />
        </Suspense>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { FilteredPromoList } from "@/components/filtered-promo-list";
import { HeadingSkeleton, PromoListSkeleton } from "@/components/promo-card-skeleton";
import { lineRemindersOn } from "@/lib/features";
import { MONTHS, monthFromSlug } from "@/lib/months";
import { getPromosForMonth } from "@/lib/promos/queries";
import { breadcrumbJsonLd, monthListJsonLd, pageOpenGraph, siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return MONTHS.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[month]">): Promise<Metadata> {
  const n = monthFromSlug((await params).month);
  if (!n) return {};
  const { th, slug } = MONTHS[n - 1];
  const title = `โปรวันเกิดเดือน${th}`;
  const description = `เกิดเดือน${th} ได้อะไรบ้าง รวมโปรวันเกิดและเดือนเกิด พร้อมวิธีใช้สิทธิ์และลิงก์ตรวจสิทธิ์ที่ต้นทาง`;
  return { title, description, alternates: { canonical: `/${slug}` }, openGraph: pageOpenGraph(title, description, `/${slug}`) };
}

async function MonthPromos({ params }: Pick<PageProps<"/[month]">, "params">) {
  const n = monthFromSlug((await params).month);
  if (!n) notFound();
  const promos = await getPromosForMonth(n);
  const { th, slug } = MONTHS[n - 1];
  const base = siteUrl(process.env);
  const brands = [...new Map(promos.map((p) => [p.brand.slug, { name: p.brand.name, slug: p.brand.slug }])).values()];

  return (
    <>
      <JsonLd data={monthListJsonLd(base, th, brands)} />
      <JsonLd data={breadcrumbJsonLd(base, [{ name: "หน้าแรก", path: "/" }, { name: `โปรวันเกิดเดือน${th}`, path: `/${slug}` }])} />
      <h1 className="text-2xl font-semibold text-foreground">โปรวันเกิดเดือน{th}</h1>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{promos.length} โปรที่ตรวจแล้ว</p>
        {lineRemindersOn(process.env) && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/remind?month=${n}`}>
              <span aria-hidden>🔔</span> เตือนฉันก่อนเดือนเกิด
            </Link>
          </Button>
        )}
      </div>
      {promos.length === 0 ? (
        <p className="mt-6 text-muted-foreground">ยังไม่มีโปรที่ตรวจแล้วสำหรับเดือนนี้</p>
      ) : (
        <div className="mt-6">
          <FilteredPromoList promos={promos} />
        </div>
      )}
    </>
  );
}

export default function MonthPage({ params }: PageProps<"/[month]">) {
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

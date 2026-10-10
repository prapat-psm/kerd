import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandMark } from "@/components/brand-mark";
import { JsonLd } from "@/components/json-ld";
import { PromoCard } from "@/components/promo-card";
import { HeadingSkeleton, PromoListSkeleton } from "@/components/promo-card-skeleton";
import { stagger } from "@/lib/motion";
import { getBrandSlugs, getBrandWithPromos } from "@/lib/promos/queries";
import { breadcrumbJsonLd, pageOpenGraph, siteUrl } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getBrandSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/brand/[slug]">): Promise<Metadata> {
  const brand = await getBrandWithPromos((await params).slug);
  if (!brand) return {};
  const title = `โปรวันเกิด ${brand.name}`;
  const description = `สิทธิ์วันเกิดของ ${brand.name} วิธีใช้สิทธิ์ เงื่อนไข และลิงก์ตรวจสิทธิ์ที่หน้าเว็บทางการ`;
  const url = `/brand/${brand.slug}`;
  return { title, description, alternates: { canonical: url }, openGraph: pageOpenGraph(title, description, url) };
}

async function BrandPromos({ params }: Pick<PageProps<"/brand/[slug]">, "params">) {
  const brand = await getBrandWithPromos((await params).slug);
  if (!brand) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(siteUrl(process.env), [
          { name: "หน้าแรก", path: "/" },
          { name: "แบรนด์ทั้งหมด", path: "/brand" },
          { name: brand.name, path: `/brand/${brand.slug}` },
        ])}
      />
      <div className="flex items-center gap-3">
        <BrandMark name={brand.name} slug={brand.slug} className="size-12 text-base" />
        <h1 className="text-2xl font-semibold text-foreground">โปรวันเกิด {brand.name}</h1>
      </div>
      {brand.promos.length === 0 ? (
        <p className="mt-6 text-muted-foreground">ยังไม่มีโปรที่ตรวจแล้วของแบรนด์นี้</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {brand.promos.map((p, i) => (
            <div key={p.id} className="animate-fade-up stagger" style={stagger(i)}>
              <PromoCard promo={p} expanded />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function BrandPage({ params }: PageProps<"/brand/[slug]">) {
  return (
    <div className="pt-4">
      <Link href="/brand" className="text-sm text-muted-foreground hover:underline">
        ← แบรนด์ทั้งหมด
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
          <BrandPromos params={params} />
        </Suspense>
      </div>
    </div>
  );
}

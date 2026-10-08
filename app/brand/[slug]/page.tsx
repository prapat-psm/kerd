import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PromoCard } from "@/components/promo-card";
import { getBrandSlugs, getBrandWithPromos } from "@/lib/promos/queries";

export async function generateStaticParams() {
  return (await getBrandSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/brand/[slug]">): Promise<Metadata> {
  const brand = await getBrandWithPromos((await params).slug);
  if (!brand) return {};
  return {
    title: `โปรวันเกิด ${brand.name}`,
    description: `สิทธิ์วันเกิดของ ${brand.name} วิธีใช้สิทธิ์ เงื่อนไข และลิงก์ตรวจสิทธิ์ที่หน้าเว็บทางการ`,
  };
}

async function BrandPromos({ params }: Pick<PageProps<"/brand/[slug]">, "params">) {
  const brand = await getBrandWithPromos((await params).slug);
  if (!brand) notFound();

  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">โปรวันเกิด {brand.name}</h1>
      {brand.promos.length === 0 ? (
        <p className="mt-6 text-muted">ยังไม่มีโปรที่ตรวจแล้วของแบรนด์นี้</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {brand.promos.map((p) => (
            <PromoCard key={p.id} promo={p} />
          ))}
        </div>
      )}
    </>
  );
}

export default function BrandPage({ params }: PageProps<"/brand/[slug]">) {
  return (
    <div className="pt-4">
      <Link href="/" className="text-sm text-muted hover:underline">
        ← หน้าแรก
      </Link>
      <div className="mt-3">
        <Suspense fallback={<p className="text-muted">กำลังโหลด…</p>}>
          <BrandPromos params={params} />
        </Suspense>
      </div>
    </div>
  );
}

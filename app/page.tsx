import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeIntro } from "@/components/home-intro";
import { FilteredPromoList } from "@/components/filtered-promo-list";
import { JsonLd } from "@/components/json-ld";
import { PromoListSkeleton } from "@/components/promo-card-skeleton";
import { getCurrentPromos } from "@/lib/promos/queries";
import { promoListJsonLd, siteUrl } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

async function AllPromos() {
  const promos = await getCurrentPromos();
  const brands = [...new Map(promos.map((p) => [p.brand.slug, { name: p.brand.name, slug: p.brand.slug }])).values()];

  return (
    <>
      <JsonLd data={promoListJsonLd(siteUrl(process.env), brands)} />
      <p className="text-sm text-muted-foreground">
        {promos.length} โปรจาก {brands.length} แบรนด์ ตรวจกับหน้าเว็บทางการแล้ว
      </p>
      {promos.length === 0 ? (
        <p className="mt-6 text-muted-foreground">ยังไม่มีโปรที่ตรวจแล้ว</p>
      ) : (
        <div className="mt-4">
          <FilteredPromoList promos={promos} />
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-2 pt-6">
      <HomeIntro />
      <div>
        <Suspense fallback={<PromoListSkeleton />}>
          <AllPromos />
        </Suspense>
      </div>
    </div>
  );
}

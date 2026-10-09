import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandDirectory } from "@/components/brand-directory";
import { HeadingSkeleton, PromoListSkeleton } from "@/components/promo-card-skeleton";
import { getBrandsWithPublishedPromos } from "@/lib/promos/queries";

export const metadata: Metadata = {
  title: "แบรนด์ทั้งหมด",
  description: "รวมแบรนด์ที่มีโปรวันเกิดและเดือนเกิด เลือกตามหมวด อาหาร ธนาคาร ช้อปปิ้ง ความงาม และอื่นๆ",
};

async function Brands() {
  const brands = await getBrandsWithPublishedPromos();
  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground">แบรนด์ทั้งหมด</h1>
      <p className="mt-1 text-sm text-muted-foreground">{brands.length} แบรนด์ที่มีโปรตรวจแล้ว</p>
      <div className="mt-6">
        {brands.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีแบรนด์ที่มีโปรตรวจแล้ว</p>
        ) : (
          <BrandDirectory brands={brands} />
        )}
      </div>
    </>
  );
}

export default function BrandsPage() {
  return (
    <div className="pt-4">
      <Suspense
        fallback={
          <div className="flex flex-col gap-6">
            <HeadingSkeleton />
            <PromoListSkeleton />
          </div>
        }
      >
        <Brands />
      </Suspense>
    </div>
  );
}

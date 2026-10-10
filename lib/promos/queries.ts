"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";
import { DOWNVOTE_WINDOW_DAYS } from "@/lib/freshness";
import { isCurrent, toCardData, type PromoCardData } from "./view";

// ข้อมูลเปลี่ยนวันละไม่กี่ครั้ง: cache ไว้ระดับชั่วโมง และล้างได้ทันทีด้วย revalidateTag("promos", "max")
const TAG = "promos";

const promoSelect = {
  id: true,
  title: true,
  benefit: true,
  window: true,
  windowDaysBefore: true,
  windowDaysAfter: true,
  tiers: true,
  requiresMembership: true,
  membershipName: true,
  requiredTier: true,
  conditions: true,
  howToRedeem: true,
  sourceUrl: true,
  validFrom: true,
  validUntil: true,
  lastVerifiedAt: true,
  brand: { select: { name: true, slug: true, category: true } },
} as const;

function recentFeedback(now: Date) {
  const since = new Date(now.getTime() - DOWNVOTE_WINDOW_DAYS * 86_400_000);
  return { where: { createdAt: { gte: since } }, select: { stillValid: true, createdAt: true } };
}

/** โปรที่เปิดแสดงและยังไม่หมดอายุ ทุกแบรนด์ (โปรส่วนใหญ่ใช้ได้ทุกเดือน จึงไม่แยกตามเดือนเกิด) */
export async function getCurrentPromos(): Promise<PromoCardData[]> {
  cacheTag(TAG);
  cacheLife("hours");
  const now = new Date();
  const rows = await prisma.promotion.findMany({
    where: { status: "published" },
    select: { ...promoSelect, feedback: recentFeedback(now) },
    orderBy: { brand: { name: "asc" } },
  });
  return rows.filter((r) => isCurrent(r, now)).map((r) => toCardData(r, now));
}

export async function getBrandWithPromos(slug: string) {
  cacheTag(TAG);
  cacheLife("hours");
  const now = new Date();
  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      category: true,
      promotions: { where: { status: "published" }, select: { ...promoSelect, feedback: recentFeedback(now) } },
    },
  });
  if (!brand) return null;
  const { promotions, ...info } = brand;
  return { ...info, promos: promotions.filter((r) => isCurrent(r, now)).map((r) => toCardData(r, now)) };
}

export async function getBrandSlugs(): Promise<string[]> {
  cacheTag(TAG);
  cacheLife("hours");
  const brands = await prisma.brand.findMany({ select: { slug: true }, orderBy: { slug: "asc" } });
  return brands.map((b) => b.slug);
}

/** แบรนด์ที่มีโปรเผยแพร่แล้วอย่างน้อย 1 รายการ สำหรับหน้า /brand */
export async function getBrandsWithPublishedPromos(): Promise<{ slug: string; name: string; category: string; promoCount: number }[]> {
  cacheTag(TAG);
  cacheLife("hours");
  const brands = await prisma.brand.findMany({
    where: { promotions: { some: { status: "published" } } },
    select: { slug: true, name: true, category: true, _count: { select: { promotions: { where: { status: "published" } } } } },
    orderBy: { name: "asc" },
  });
  return brands.map(({ _count, ...b }) => ({ ...b, promoCount: _count.promotions }));
}

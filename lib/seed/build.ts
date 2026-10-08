import { parsePocBrands, type ParseResult } from "./poc";
import type { PromotionInput } from "@/lib/schemas/promotion";

type PocRecord = Parameters<typeof parsePocBrands>[0][number];

export type SeedRow = {
  brand: { slug: string; name: string; category: string };
  promotion: Omit<PromotionInput, "brandSlug" | "tiers"> & {
    tiers?: NonNullable<PromotionInput["tiers"]>;
    status: "draft";
    lastVerifiedAt: null;
  };
};

/** เตรียมข้อมูล seed จากไฟล์ POC: โปรเป็น draft เสมอ ต้องให้คนตรวจที่ต้นทางก่อน publish */
export function buildPocSeed(records: PocRecord[]): { rows: SeedRow[]; skipped: ParseResult["skipped"] } {
  const { valid, skipped } = parsePocBrands(records);
  const bySlug = new Map(records.map((r) => [r.slug, r]));

  const rows = valid.map(({ brandSlug, tiers, ...rest }) => {
    const src = bySlug.get(brandSlug)!;
    return {
      brand: { slug: brandSlug, name: String(src.brand), category: String(src.category) },
      promotion: { ...rest, ...(tiers ? { tiers } : {}), status: "draft" as const, lastVerifiedAt: null },
    };
  });

  return { rows, skipped };
}

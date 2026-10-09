import { parsePocBrands, type ParseResult } from "./poc";
import type { PromotionInput } from "@/lib/schemas/promotion";

type PocRecord = Parameters<typeof parsePocBrands>[0][number];

export type SeedRow = {
  brand: { slug: string; name: string; category: string };
  promotion: Omit<PromotionInput, "brandSlug" | "tiers"> & {
    tiers?: NonNullable<PromotionInput["tiers"]>;
    status: "draft" | "published";
    lastVerifiedAt: Date | null;
  };
};

/** คนอนุมัติแล้ว (publish: true) และข้อมูลชัด (confidence high) เท่านั้นที่เผยแพร่ได้ */
function isApproved(r: PocRecord): boolean {
  return r.publish === true && r.confidence === "high" && typeof r.source_checked_at === "string";
}

/** เตรียมข้อมูล seed จากไฟล์ POC: โปรเป็น draft เว้นแต่คนอนุมัติให้เผยแพร่ */
export function buildPocSeed(records: PocRecord[]): { rows: SeedRow[]; skipped: ParseResult["skipped"] } {
  const { valid, skipped } = parsePocBrands(records);
  const bySlug = new Map(records.map((r) => [r.slug, r]));

  const rows = valid.map(({ brandSlug, tiers, ...rest }) => {
    const src = bySlug.get(brandSlug)!;
    return {
      brand: { slug: brandSlug, name: String(src.brand), category: String(src.category) },
      promotion: {
        ...rest,
        ...(tiers ? { tiers } : {}),
        ...(isApproved(src)
          ? { status: "published" as const, lastVerifiedAt: new Date(String(src.source_checked_at)) }
          : { status: "draft" as const, lastVerifiedAt: null }),
      },
    };
  });

  return { rows, skipped };
}

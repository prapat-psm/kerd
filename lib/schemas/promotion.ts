import { z } from "zod";

const isoDate = z.coerce.date();

export const PromotionInput = z
  .object({
    brandSlug: z.string().min(1),
    title: z.string().min(1),
    benefit: z.string().min(1),
    benefitType: z.enum(["free_item", "discount_percent", "discount_amount", "points", "free_entry", "other"]),
    window: z.enum(["day", "week", "month"]),
    windowDaysBefore: z.number().int().min(0).default(0),
    windowDaysAfter: z.number().int().min(0).default(0),
    tiers: z
      .array(z.object({ tier: z.string().min(1), benefit: z.string().min(1), conditions: z.array(z.string()).default([]) }))
      .nullable()
      .default(null),
    requiresMembership: z.boolean().default(false),
    membershipName: z.string().nullable().default(null),
    requiredTier: z.string().min(1).nullable().default(null),
    conditions: z.array(z.string()).default([]),
    channels: z.array(z.enum(["in_store", "online", "app"])).default([]),
    // หลักการ 3: ทุกโปรต้องมีแหล่งที่มาและวิธีใช้สิทธิ์
    sourceUrl: z.url({ protocol: /^https$/ }),
    howToRedeem: z.array(z.string().min(1)).min(1),
    requiredDocs: z.array(z.string()).default([]),
    verifyMethod: z.enum(["auto", "manual"]),
    validFrom: isoDate.nullable().default(null),
    validUntil: isoDate.nullable().default(null),
  })
  .refine((p) => !p.validFrom || !p.validUntil || p.validFrom <= p.validUntil, {
    message: "validFrom must be on or before validUntil",
    path: ["validFrom"],
  });

export type PromotionInput = z.infer<typeof PromotionInput>;

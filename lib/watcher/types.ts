export type WatchTarget = {
  promotionId: string;
  brandName: string;
  sourceUrl: string;
  /** hash ล่าสุดที่ดึงสำเร็จ (null = ยังไม่เคยดึง) */
  lastHash: string | null;
};

export type CheckResult = {
  promotionId: string;
  brandName: string;
  sourceUrl: string;
  kind: "baseline" | "unchanged" | "changed" | "error";
  reason?: string;
  hash?: string;
};

export type FetchResult = { ok: true; status: number; body: string } | { ok: false; reason: string; status?: number };

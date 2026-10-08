import { contentHash, pageToText } from "./normalize";
import { robotsAllows } from "./robots";
import type { CheckResult, FetchResult, WatchTarget } from "./types";

export const BOT_TOKEN = "KerdBot";

export type SnapshotInput = {
  promotionId: string;
  contentHash: string;
  httpStatus: number | null;
  diffDetected: boolean;
};

export type WatcherDeps = {
  targets: WatchTarget[];
  /** คืนเนื้อหา robots.txt ของ origin ("" = ไม่มีไฟล์) */
  getRobots: (origin: string) => Promise<string>;
  fetchPage: (url: string) => Promise<FetchResult>;
  /** เขียนได้แค่ source_snapshots เท่านั้น ห้ามแก้ promotion เอง (ต้องให้คน verify) */
  saveSnapshot: (s: SnapshotInput) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  delayMs?: number;
};

export async function runWatcher(deps: WatcherDeps): Promise<CheckResult[]> {
  const robotsCache = new Map<string, Promise<string>>();
  const results: CheckResult[] = [];

  for (const [i, t] of deps.targets.entries()) {
    if (i > 0) await deps.sleep(deps.delayMs ?? 3_000);
    const base = { promotionId: t.promotionId, brandName: t.brandName, sourceUrl: t.sourceUrl };

    try {
      const url = new URL(t.sourceUrl);
      if (!robotsCache.has(url.origin)) robotsCache.set(url.origin, deps.getRobots(url.origin));
      if (!robotsAllows(await robotsCache.get(url.origin)!, url.pathname + url.search, BOT_TOKEN)) {
        results.push({ ...base, kind: "error", reason: "blocked_by_robots" });
        continue;
      }

      const page = await deps.fetchPage(t.sourceUrl);
      if (!page.ok) {
        await deps.saveSnapshot({ promotionId: t.promotionId, contentHash: "", httpStatus: page.status ?? null, diffDetected: false });
        results.push({ ...base, kind: "error", reason: page.reason });
        continue;
      }

      const hash = contentHash(pageToText(page.body));
      const kind = t.lastHash === null ? "baseline" : t.lastHash === hash ? "unchanged" : "changed";
      await deps.saveSnapshot({ promotionId: t.promotionId, contentHash: hash, httpStatus: page.status, diffDetected: kind === "changed" });
      results.push({ ...base, kind, hash });
    } catch {
      // ไม่ log ข้อความ error ดิบ เผื่อมี connection string หลุด
      results.push({ ...base, kind: "error", reason: "unexpected" });
    }
  }
  return results;
}

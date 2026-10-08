import { describe, expect, it, vi } from "vitest";
import { runWatcher, type WatcherDeps } from "./run";
import type { WatchTarget } from "./types";

const target = (over: Partial<WatchTarget> = {}): WatchTarget => ({
  promotionId: "p1",
  brandName: "Sizzler",
  sourceUrl: "https://www.sizzler.co.th/faq",
  lastHash: null,
  ...over,
});

function deps(over: Partial<WatcherDeps> = {}): WatcherDeps {
  return {
    targets: [target()],
    getRobots: vi.fn(async () => ""),
    fetchPage: vi.fn(async () => ({ ok: true as const, status: 200, body: "<p>ฟรี 1 แก้ว</p>" })),
    saveSnapshot: vi.fn(async () => {}),
    sleep: vi.fn(async () => {}),
    ...over,
  };
}

describe("runWatcher", () => {
  it("ครั้งแรก (ยังไม่มี hash) บันทึก snapshot แต่ไม่นับว่าเปลี่ยน", async () => {
    const d = deps();
    const [r] = await runWatcher(d);
    expect(r.kind).toBe("baseline");
    expect(d.saveSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ promotionId: "p1", httpStatus: 200, diffDetected: false }),
    );
  });

  it("hash ต่างจากครั้งก่อน = changed และ diffDetected", async () => {
    const d = deps({ targets: [target({ lastHash: "old" })] });
    const [r] = await runWatcher(d);
    expect(r.kind).toBe("changed");
    expect(d.saveSnapshot).toHaveBeenCalledWith(expect.objectContaining({ diffDetected: true }));
  });

  it("hash เท่าเดิม = unchanged", async () => {
    const first = await runWatcher(deps());
    const hash = first[0].hash!;
    const [r] = await runWatcher(deps({ targets: [target({ lastHash: hash })] }));
    expect(r.kind).toBe("unchanged");
  });

  it("robots.txt ห้าม = ไม่ยิงหน้า และรายงาน blocked_by_robots", async () => {
    const d = deps({ getRobots: vi.fn(async () => "User-agent: *\nDisallow: /") });
    const [r] = await runWatcher(d);
    expect(r).toMatchObject({ kind: "error", reason: "blocked_by_robots" });
    expect(d.fetchPage).not.toHaveBeenCalled();
    expect(d.saveSnapshot).not.toHaveBeenCalled();
  });

  it("fetch ผิดพลาด = error และบันทึก httpStatus ไว้ดู link เสีย", async () => {
    const d = deps({ fetchPage: vi.fn(async () => ({ ok: false as const, reason: "http_404", status: 404 })) });
    const [r] = await runWatcher(d);
    expect(r).toMatchObject({ kind: "error", reason: "http_404" });
    expect(d.saveSnapshot).toHaveBeenCalledWith(expect.objectContaining({ httpStatus: 404, contentHash: "" }));
  });

  it("แบรนด์หนึ่งพังไม่ทำให้ทั้งรอบพัง และเว้นจังหวะระหว่าง request", async () => {
    const d = deps({
      targets: [target(), target({ promotionId: "p2" })],
      fetchPage: vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce({ ok: true, status: 200, body: "x" }),
    });
    const results = await runWatcher(d);
    expect(results.map((r) => r.kind)).toEqual(["error", "baseline"]);
    expect(d.sleep).toHaveBeenCalledTimes(1);
  });
});

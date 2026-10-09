import { describe, expect, it } from "vitest";
import { NOTE_RETENTION_DAYS, noteRetentionCutoff } from "./retention";

describe("noteRetentionCutoff", () => {
  it("ลบรายละเอียดที่ผู้ใช้พิมพ์เมื่อเก่ากว่า 180 วัน", () => {
    expect(NOTE_RETENTION_DAYS).toBe(180);
    expect(noteRetentionCutoff(new Date("2026-10-09T00:00:00Z"))).toEqual(new Date("2026-04-12T00:00:00Z"));
  });
});

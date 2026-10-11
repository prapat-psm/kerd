import { describe, expect, it } from "vitest";
import { ALL } from "./categories";
import { filterByWindow, windowOptions, windowSegments } from "./windows";

const items = [{ window: "month" }, { window: "day" }, { window: "month" }, { window: "week" }, { window: "month" }] as const;

describe("windowOptions", () => {
  it("เรียง วันเกิด → สัปดาห์ → ทั้งเดือน (ตามความสั้นของช่วง) พร้อมจำนวน", () => {
    expect(windowOptions([...items])).toEqual([
      { value: ALL, label: "ทั้งหมด", count: 5 },
      { value: "day", label: "วันเกิด", count: 1 },
      { value: "week", label: "สัปดาห์วันเกิด", count: 1 },
      { value: "month", label: "ทั้งเดือนเกิด", count: 3 },
    ]);
  });

  it("ไม่แสดงช่วงที่ไม่มีโปร", () => {
    expect(windowOptions([{ window: "month" }]).map((o) => o.value)).toEqual([ALL, "month"]);
  });
});

describe("filterByWindow", () => {
  it("ทั้งหมด คืนทุกโปร", () => {
    expect(filterByWindow([...items], ALL)).toHaveLength(5);
  });

  it("กรองเฉพาะช่วงที่เลือก", () => {
    expect(filterByWindow([...items], "month")).toHaveLength(3);
  });
});

describe("windowSegments", () => {
  it("ครบ 4 ช่องเสมอ ป้ายสั้น ไม่มีจำนวน ช่วงที่ไม่มีโปรกดไม่ได้", () => {
    expect(windowSegments([{ window: "month" }, { window: "day" }, { window: "month" }])).toEqual([
      { value: ALL, label: "ทั้งหมด", disabled: false },
      { value: "day", label: "วันเกิด", disabled: false },
      { value: "week", label: "สัปดาห์", disabled: true },
      { value: "month", label: "ทั้งเดือน", disabled: false },
    ]);
  });
});

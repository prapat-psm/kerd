// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Segmented, type SegmentOption } from "./segmented";

afterEach(cleanup);

const options: SegmentOption[] = [
  { value: "all", label: "ทั้งหมด", disabled: false },
  { value: "day", label: "วันเกิด", disabled: false },
  { value: "week", label: "สัปดาห์", disabled: true },
  { value: "month", label: "ทั้งเดือน", disabled: false },
];

function Harness() {
  const [value, setValue] = useState("all");
  return <Segmented label="กรองตามช่วงที่ใช้ได้" options={options} value={value} onChange={setValue} />;
}

const radios = () => screen.getAllByRole("radio");
const checked = () => radios().find((r) => r.getAttribute("aria-checked") === "true")?.textContent;

describe("Segmented", () => {
  it("เป็น radiogroup มีชื่อ และช่องที่เลือกมี aria-checked", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "กรองตามช่วงที่ใช้ได้" })).toBeTruthy();
    expect(radios()).toHaveLength(4);
    expect(checked()).toBe("ทั้งหมด");
  });

  it("ไม่มีตัวเลขจำนวนในช่อง", () => {
    render(<Harness />);
    radios().forEach((r) => expect(r.textContent).not.toMatch(/\d/));
  });

  it("คลิกเลือกช่องได้ ช่องที่ไม่มีโปรกดไม่ได้", () => {
    render(<Harness />);
    fireEvent.click(radios()[3]);
    expect(checked()).toBe("ทั้งเดือน");
    expect(radios()[2].hasAttribute("disabled")).toBe(true);
  });

  it("ลูกศรขวา/ซ้ายย้ายไปช่องถัดไปที่กดได้ (ข้ามช่องที่ปิด) และย้ายโฟกัสตาม", () => {
    render(<Harness />);
    radios()[0].focus();
    fireEvent.keyDown(radios()[0], { key: "ArrowRight" });
    expect(checked()).toBe("วันเกิด");
    fireEvent.keyDown(radios()[1], { key: "ArrowRight" });
    expect(checked()).toBe("ทั้งเดือน");
    expect(document.activeElement).toBe(radios()[3]);
    fireEvent.keyDown(radios()[3], { key: "ArrowRight" });
    expect(checked()).toBe("ทั้งหมด");
    fireEvent.keyDown(radios()[0], { key: "ArrowLeft" });
    expect(checked()).toBe("ทั้งเดือน");
  });

  it("กด Tab เข้ามาได้เฉพาะช่องที่เลือก (roving tabindex)", () => {
    render(<Harness />);
    expect(radios().map((r) => r.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it("พื้นช่องที่เลือกเลื่อนตามตำแหน่ง (--i)", () => {
    const { container } = render(<Harness />);
    fireEvent.click(radios()[3]);
    const thumb = container.querySelector("[data-thumb]") as HTMLElement;
    expect(thumb.style.getPropertyValue("--i")).toBe("3");
    expect(thumb.className).toContain("translate-x-[calc(100%*var(--i))]");
  });
});

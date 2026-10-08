// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Logo } from "./logo";

afterEach(cleanup);

describe("Logo", () => {
  it("เป็นภาพตกแต่ง ซ่อนจาก screen reader (ชื่อเว็บอยู่ในข้อความข้างๆ)", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

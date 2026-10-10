// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendSubmission } from "@/app/actions/submission";
import { SubmissionForm } from "./submission-form";

vi.mock("@/app/actions/submission", () => ({ sendSubmission: vi.fn() }));
const action = vi.mocked(sendSubmission);

beforeEach(() => action.mockReset().mockResolvedValue({ status: "ok" }));
afterEach(cleanup);

function fill() {
  fireEvent.change(screen.getByLabelText("ชื่อแบรนด์"), { target: { value: "MK" } });
  fireEvent.change(screen.getByLabelText(/ลิงก์หน้าเว็บทางการ/), { target: { value: "https://www.mkrestaurant.com/member" } });
  fireEvent.change(screen.getByLabelText("ได้สิทธิ์อะไร"), { target: { value: "เป็ดย่างฟรี" } });
}

describe("SubmissionForm", () => {
  it("ช่องบังคับครบ และบอกว่าไม่รับลิงก์โซเชียล", () => {
    render(<SubmissionForm />);
    expect(screen.getByLabelText("ชื่อแบรนด์").hasAttribute("required")).toBe(true);
    const url = screen.getByLabelText(/ลิงก์หน้าเว็บทางการ/);
    expect(url.getAttribute("type")).toBe("url");
    expect(url.getAttribute("pattern")).toBe("https://.*");
    expect(document.getElementById(url.getAttribute("aria-describedby")!)?.textContent).toContain("ไม่ใช่ Facebook");
    expect(screen.getByLabelText(/วิธีใช้สิทธิ์/).hasAttribute("required")).toBe(false);
  });

  it("ไม่มีช่องชื่อ อีเมล หรือเบอร์โทรของผู้แจ้ง", () => {
    render(<SubmissionForm />);
    expect(screen.queryByLabelText(/อีเมล|เบอร์|ชื่อของคุณ/)).toBeNull();
  });

  it("ส่งแล้วขอบคุณ และบอกว่าทีมจะตรวจก่อนเผยแพร่", async () => {
    render(<SubmissionForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "ส่งให้ทีมตรวจ" }));
    expect((await screen.findByRole("status")).textContent).toContain("ตรวจกับหน้าเว็บทางการก่อน");
    expect(Object.fromEntries(action.mock.calls[0][1] as FormData)).toEqual({
      brandName: "MK",
      sourceUrl: "https://www.mkrestaurant.com/member",
      benefit: "เป็ดย่างฟรี",
      howToRedeem: "",
      website: "",
    });
  });

  it.each([
    ["invalid", "ลิงก์หน้าเว็บทางการ"],
    ["rate_limited", "ลองใหม่ภายหลัง"],
  ] as const)("ผล %s แจ้ง error", async (status, text) => {
    action.mockResolvedValue({ status });
    render(<SubmissionForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "ส่งให้ทีมตรวจ" }));
    expect((await screen.findByRole("alert")).textContent).toContain(text);
  });

  it("ช่องกรอกใช้ตัวอักษร 16px ขึ้นไป เพื่อไม่ให้ iOS/LINE ซูมจอเองตอนแตะ", () => {
    render(<SubmissionForm />);
    for (const field of [screen.getByLabelText("ชื่อแบรนด์"), screen.getByLabelText(/ลิงก์หน้าเว็บทางการ/), screen.getByLabelText(/วิธีใช้สิทธิ์/)]) {
      expect(field.className).toContain("text-base");
      expect(field.className).not.toMatch(/\btext-(xs|sm)\b/);
    }
  });
});

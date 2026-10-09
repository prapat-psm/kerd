// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PrivacyPage from "./privacy/page";
import TermsPage from "./terms/page";

afterEach(cleanup);

describe("หน้านโยบายความเป็นส่วนตัว", () => {
  it("มีหัวข้อที่ PDPA ต้องการ: ข้อมูลที่เก็บ คุกกี้ ผู้ให้บริการ/ประเทศ สิทธิ์", () => {
    render(<PrivacyPage />);
    for (const name of ["ข้อมูลที่เราเก็บตอนนี้", "คุกกี้", "ผู้ให้บริการและประเทศที่เก็บข้อมูล", "สิทธิ์ของคุณ"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeTruthy();
    }
  });

  it("บอกว่าไม่เก็บปีเกิด และมีช่องทางติดต่อ", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/ไม่เก็บปีเกิด/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "kerd.app@gmail.com" }).getAttribute("href")).toBe("mailto:kerd.app@gmail.com");
  });
});

describe("หน้านโยบาย: การแจ้งโปรไม่ถูกต้อง", () => {
  it("บอกว่าเก็บอะไร ไม่เก็บ IP ลบรายละเอียดใน 180 วัน และส่ง email ผ่าน Resend", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { level: 2, name: "เมื่อคุณกด 👍 หรือ 👎" })).toBeTruthy();
    expect(screen.getByText(/ไม่ผูกกับตัวคุณ/)).toBeTruthy();
    expect(screen.getByText(/180 วัน/)).toBeTruthy();
    expect(screen.getByText(/Resend \(สหรัฐอเมริกา\)/)).toBeTruthy();
  });
});

describe("หน้านโยบาย: ฟอร์มแจ้งโปร", () => {
  it("บอกว่าไม่เก็บชื่อหรือช่องทางติดต่อของผู้แจ้ง", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(/แจ้งโปรผ่านฟอร์ม.*ไม่ถามชื่อหรือช่องทางติดต่อ/)).toBeTruthy();
  });
});

describe("หน้าข้อกำหนดการใช้งาน", () => {
  it("บอกว่าเงื่อนไขของแบรนด์เป็นที่สุด และขอนำข้อมูลออกได้ภายใน 48 ชั่วโมง", () => {
    render(<TermsPage />);
    expect(screen.getByText(/เงื่อนไขของแบรนด์เป็นที่สุด/)).toBeTruthy();
    expect(screen.getByText(/48 ชั่วโมง/)).toBeTruthy();
  });
});

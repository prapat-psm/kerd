import { describe, expect, it, vi } from "vitest";
import { CONSENT_VERSION } from "./consent";
import { deleteAccount, getAccount, saveReminder, type AccountDeps } from "./service";

const line = "U1234567890abcdef";

function deps(over: Partial<AccountDeps> = {}): AccountDeps {
  return {
    findUser: vi.fn().mockResolvedValue(null),
    upsertUser: vi.fn().mockResolvedValue({ id: "user-1" }),
    addConsent: vi.fn().mockResolvedValue(undefined),
    deleteUser: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
}

describe("saveReminder", () => {
  it("ผู้ใช้ใหม่ + ยินยอม: สร้าง user และบันทึก consent", async () => {
    const d = deps();
    expect(await saveReminder(line, { birthMonth: "10", birthDay: "9", marketingConsent: "on" }, d)).toEqual({ status: "saved" });
    expect(d.upsertUser).toHaveBeenCalledWith(line, { birthMonth: 10, birthDay: 9 });
    expect(d.addConsent).toHaveBeenCalledWith("user-1", { purpose: "marketing_line", granted: true, version: CONSENT_VERSION });
  });

  it("ไม่ติ๊กยินยอม: เก็บเดือนเกิดได้ แต่ไม่ส่งข้อความ", async () => {
    const d = deps();
    await saveReminder(line, { birthMonth: "3" }, d);
    expect(d.upsertUser).toHaveBeenCalledWith(line, { birthMonth: 3, birthDay: null });
    expect(d.addConsent).not.toHaveBeenCalled();
  });

  it("ถอนความยินยอม: บันทึก granted=false", async () => {
    const d = deps({ findUser: vi.fn().mockResolvedValue({ id: "user-1", birthMonth: 3, birthDay: null, marketingConsent: true }) });
    await saveReminder(line, { birthMonth: "3" }, d);
    expect(d.addConsent).toHaveBeenCalledWith("user-1", expect.objectContaining({ granted: false }));
  });

  it("ข้อมูลไม่ผ่าน: ไม่บันทึกอะไร", async () => {
    const d = deps();
    expect(await saveReminder(line, { birthMonth: "13" }, d)).toEqual({ status: "invalid" });
    expect(d.upsertUser).not.toHaveBeenCalled();
  });

  it("ไม่มี LINE userId: ต้อง login ก่อน", async () => {
    const d = deps();
    expect(await saveReminder(null, { birthMonth: "3" }, d)).toEqual({ status: "unauthenticated" });
    expect(d.findUser).not.toHaveBeenCalled();
  });
});

describe("getAccount / deleteAccount", () => {
  it("คืนข้อมูลที่เก็บไว้ หรือ null", async () => {
    const user = { id: "user-1", birthMonth: 3, birthDay: 1, marketingConsent: true };
    expect(await getAccount(line, deps({ findUser: vi.fn().mockResolvedValue(user) }))).toEqual(user);
    expect(await getAccount(null, deps())).toBeNull();
  });

  it("ลบบัญชีและ consent log ทั้งหมด (cascade)", async () => {
    const d = deps();
    expect(await deleteAccount(line, d)).toEqual({ status: "deleted" });
    expect(d.deleteUser).toHaveBeenCalledWith(line);
    expect(await deleteAccount(null, d)).toEqual({ status: "unauthenticated" });
  });
});

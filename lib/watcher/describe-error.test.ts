import { describe, expect, it } from "vitest";
import { describeError } from "./describe-error";

describe("describeError", () => {
  it("แสดงชื่อ + Prisma code + สาเหตุจาก driver", () => {
    const e = Object.assign(new Error("raw message"), {
      name: "PrismaClientKnownRequestError",
      code: "P2010",
      meta: { modelName: "Promotion", driverAdapterError: { cause: { kind: "postgres", originalCode: "42501", originalMessage: "permission denied for table Promotion" } } },
    });
    expect(describeError(e)).toBe(
      "PrismaClientKnownRequestError P2010 model=Promotion pg=42501 permission denied for table Promotion",
    );
  });

  it("ปิดบัง connection string ถ้าหลุดมาในข้อความ", () => {
    const e = Object.assign(new Error("x"), {
      code: "P1001",
      meta: { driverAdapterError: { cause: { message: "can't reach postgres://kerd_watcher.ref:s3cret@host:6543/postgres" } } },
    });
    const out = describeError(e);
    expect(out).not.toContain("s3cret");
    expect(out).toContain("postgres://***");
  });

  it("error ทั่วไปแสดงแค่ชื่อ ไม่แสดง message", () => {
    expect(describeError(new TypeError("token=abc"))).toBe("TypeError");
    expect(describeError("boom")).toBe("unknown");
  });
});

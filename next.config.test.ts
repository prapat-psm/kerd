import { describe, expect, it } from "vitest";
import config from "./next.config";

describe("next.config redirects", () => {
  it("ลิงก์เก่า /birthday/:month ย้ายถาวรไป /:month", async () => {
    const redirects = await config.redirects!();
    expect(redirects).toContainEqual({ source: "/birthday/:month", destination: "/:month", permanent: true });
  });
});

import { describe, expect, it } from "vitest";
import { checkSourceUrl, isPrivateAddress } from "./url-guard";

const allow = ["www.sizzler.co.th", "majorcineplex.com"];

describe("checkSourceUrl", () => {
  it("รับ https ที่ host อยู่ใน allowlist", () => {
    const r = checkSourceUrl("https://www.sizzler.co.th/faq", allow);
    expect(r).toEqual({ ok: true, url: new URL("https://www.sizzler.co.th/faq") });
  });

  it.each([
    ["http://www.sizzler.co.th/faq", "not_https"],
    ["https://evil.example.com/", "host_not_allowed"],
    ["https://www.sizzler.co.th.evil.com/", "host_not_allowed"],
    ["https://user:pass@www.sizzler.co.th/", "has_credentials"],
    ["https://www.sizzler.co.th:8443/", "bad_port"],
    ["https://127.0.0.1/", "ip_literal"],
    ["https://[::1]/", "ip_literal"],
    ["javascript:alert(1)", "not_https"],
    ["not a url", "invalid_url"],
  ])("ปฏิเสธ %s (%s)", (input, reason) => {
    expect(checkSourceUrl(input, allow)).toEqual({ ok: false, reason });
  });

  it("เทียบ host แบบไม่สนตัวพิมพ์", () => {
    expect(checkSourceUrl("https://MajorCineplex.com/x", allow).ok).toBe(true);
  });
});

describe("isPrivateAddress", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "0.0.0.0", "100.64.0.1", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1"])(
    "%s เป็น private",
    (ip) => expect(isPrivateAddress(ip)).toBe(true),
  );

  it.each(["8.8.8.8", "203.150.1.1", "2606:4700::1111"])("%s เป็น public", (ip) => {
    expect(isPrivateAddress(ip)).toBe(false);
  });
});

import { describe, expect, it, vi } from "vitest";
import { fetchSource, type FetchDeps } from "./fetch-source";

const allow = ["www.sizzler.co.th"];

function deps(overrides: Partial<FetchDeps> = {}): FetchDeps {
  return {
    allowedHosts: allow,
    lookup: vi.fn(async () => ["203.150.1.1"]),
    fetch: vi.fn(async () => new Response("<p>โปร</p>", { status: 200, headers: { "content-type": "text/html; charset=utf-8" } })),
    maxBytes: 1_000_000,
    timeoutMs: 5_000,
    ...overrides,
  };
}

describe("fetchSource", () => {
  it("ดึงหน้า html ได้", async () => {
    const r = await fetchSource("https://www.sizzler.co.th/faq", deps());
    expect(r).toEqual({ ok: true, status: 200, body: "<p>โปร</p>" });
  });

  it("ส่ง User-Agent ของเรา และไม่ follow redirect เอง", async () => {
    const d = deps();
    await fetchSource("https://www.sizzler.co.th/faq", d);
    const init = vi.mocked(d.fetch).mock.calls[0][1]!;
    expect(new Headers(init.headers).get("user-agent")).toMatch(/^KerdBot\//);
    expect(init.redirect).toBe("manual");
  });

  it("ปฏิเสธ URL นอก allowlist โดยไม่ยิง request", async () => {
    const d = deps();
    expect(await fetchSource("https://evil.example.com/", d)).toEqual({ ok: false, reason: "host_not_allowed" });
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it("ปฏิเสธเมื่อ DNS ชี้ไป IP ภายใน (SSRF)", async () => {
    const d = deps({ lookup: vi.fn(async () => ["169.254.169.254"]) });
    expect(await fetchSource("https://www.sizzler.co.th/faq", d)).toEqual({ ok: false, reason: "private_address" });
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it("ตาม redirect ได้ไม่เกิน 3 ครั้ง และตรวจ URL ใหม่ทุกครั้ง", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { location: "https://evil.example.com/" } }));
    expect(await fetchSource("https://www.sizzler.co.th/faq", deps({ fetch }))).toEqual({
      ok: false,
      reason: "host_not_allowed",
    });

    const loop = vi.fn(async () => new Response(null, { status: 302, headers: { location: "/faq" } }));
    expect(await fetchSource("https://www.sizzler.co.th/faq", deps({ fetch: loop }))).toEqual({
      ok: false,
      reason: "too_many_redirects",
    });
    expect(loop).toHaveBeenCalledTimes(4);
  });

  it("ปฏิเสธ content-type ที่ไม่ใช่ html/text", async () => {
    const fetch = vi.fn(async () => new Response("x", { status: 200, headers: { "content-type": "application/pdf" } }));
    expect(await fetchSource("https://www.sizzler.co.th/faq", deps({ fetch }))).toEqual({
      ok: false,
      reason: "bad_content_type",
    });
  });

  it("ตัดเมื่อ body ใหญ่เกิน maxBytes", async () => {
    const fetch = vi.fn(async () => new Response("x".repeat(100), { status: 200, headers: { "content-type": "text/html" } }));
    expect(await fetchSource("https://www.sizzler.co.th/faq", deps({ fetch, maxBytes: 10 }))).toEqual({
      ok: false,
      reason: "too_large",
    });
  });

  it("แปลง HTTP error เป็น reason", async () => {
    const fetch = vi.fn(async () => new Response("", { status: 404, headers: { "content-type": "text/html" } }));
    expect(await fetchSource("https://www.sizzler.co.th/faq", deps({ fetch }))).toEqual({
      ok: false,
      reason: "http_404",
      status: 404,
    });
  });

  it("timeout คืน reason timeout", async () => {
    const fetch = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) =>
          init!.signal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))),
        ),
    );
    expect(await fetchSource("https://www.sizzler.co.th/faq", deps({ fetch, timeoutMs: 10 }))).toEqual({
      ok: false,
      reason: "timeout",
    });
  });
});

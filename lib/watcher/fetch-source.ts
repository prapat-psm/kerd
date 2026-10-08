import type { FetchResult } from "./types";
import { checkSourceUrl, isPrivateAddress } from "./url-guard";

export const USER_AGENT = "KerdBot/0.1 (+https://kerd.app/bot)";
const MAX_REDIRECTS = 3;
const ALLOWED_TYPES = /^(text\/html|text\/plain|application\/xhtml\+xml)\b/i;

export type FetchDeps = {
  allowedHosts: readonly string[];
  /** คืน IP ทั้งหมดของ host (ฉีดได้เพื่อ test) */
  lookup: (host: string) => Promise<string[]>;
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  maxBytes: number;
  timeoutMs: number;
};

async function readLimited(res: Response, maxBytes: number): Promise<string | null> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder("utf-8").decode(Buffer.concat(chunks));
}

/** ดึงหน้าเว็บทางการแบบปลอดภัย: allowlist + กัน IP ภายใน + redirect จำกัด + timeout + จำกัดขนาด */
export async function fetchSource(input: string, deps: FetchDeps): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), deps.timeoutMs);
  try {
    let current = input;
    for (let hop = 0; ; hop++) {
      const check = checkSourceUrl(current, deps.allowedHosts);
      if (!check.ok) return { ok: false, reason: check.reason };

      const ips = await deps.lookup(check.url.hostname);
      if (ips.length === 0 || ips.some(isPrivateAddress)) return { ok: false, reason: "private_address" };

      const res = await deps.fetch(check.url.href, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": USER_AGENT, accept: "text/html,text/plain;q=0.9" },
      });

      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        if (hop >= MAX_REDIRECTS) return { ok: false, reason: "too_many_redirects" };
        current = new URL(location, check.url).href;
        continue;
      }
      if (!res.ok) return { ok: false, reason: `http_${res.status}`, status: res.status };
      if (!ALLOWED_TYPES.test(res.headers.get("content-type") ?? "")) return { ok: false, reason: "bad_content_type" };

      const body = await readLimited(res, deps.maxBytes);
      if (body === null) return { ok: false, reason: "too_large" };
      return { ok: true, status: res.status, body };
    }
  } catch (e) {
    if (controller.signal.aborted || (e instanceof Error && e.name === "AbortError")) return { ok: false, reason: "timeout" };
    return { ok: false, reason: "network_error" };
  } finally {
    clearTimeout(timer);
  }
}

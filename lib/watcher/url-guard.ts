import { isIP, isIPv4 } from "node:net";

export type UrlCheck =
  | { ok: true; url: URL }
  | { ok: false; reason: "invalid_url" | "not_https" | "has_credentials" | "bad_port" | "ip_literal" | "host_not_allowed" };

/** ด่านแรกกัน SSRF: ยิงได้เฉพาะ https บน host ที่อยู่ใน allowlist (ไฟล์ในโค้ด ผ่าน PR review) */
export function checkSourceUrl(input: string, allowedHosts: readonly string[]): UrlCheck {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }
  if (url.protocol !== "https:") return { ok: false, reason: "not_https" };
  if (url.username || url.password) return { ok: false, reason: "has_credentials" };
  if (url.port !== "") return { ok: false, reason: "bad_port" };
  if (isIP(url.hostname.replace(/^\[|\]$/g, ""))) return { ok: false, reason: "ip_literal" };
  const host = url.hostname.toLowerCase();
  if (!allowedHosts.some((h) => h.toLowerCase() === host)) return { ok: false, reason: "host_not_allowed" };
  return { ok: true, url };
}

const PRIVATE_V4: [number, number][] = [
  // [network, prefix]
  [0x00000000, 8], // 0.0.0.0/8
  [0x0a000000, 8], // 10/8
  [0x64400000, 10], // 100.64/10 CGNAT
  [0x7f000000, 8], // loopback
  [0xa9fe0000, 16], // link-local + cloud metadata 169.254.169.254
  [0xac100000, 12], // 172.16/12
  [0xc0000000, 24], // 192.0.0/24
  [0xc0a80000, 16], // 192.168/16
  [0xc6120000, 15], // 198.18/15 benchmark
  [0xe0000000, 3], // multicast + reserved 224/3
];

function v4ToInt(ip: string): number {
  return ip.split(".").reduce((n, o) => (n << 8) + Number(o), 0) >>> 0;
}

/** ด่านสองกัน SSRF: IP หลัง DNS lookup ต้องไม่ใช่วงภายใน */
export function isPrivateAddress(ip: string): boolean {
  if (isIPv4(ip)) {
    const n = v4ToInt(ip);
    return PRIVATE_V4.some(([net, prefix]) => (n & (~0 << (32 - prefix))) >>> 0 === net);
  }
  const v6 = ip.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return /^(fc|fd|fe[89ab]|ff)/.test(v6);
}

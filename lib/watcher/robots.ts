type Rule = { allow: boolean; pattern: string };

function toRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split("*")
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/** อ่าน robots.txt ตาม RFC 9309 แบบย่อ: เลือกกลุ่มที่ตรงชื่อ bot ก่อน `*`, rule ที่ยาวที่สุดชนะ */
export function robotsAllows(robotsTxt: string, path: string, userAgent: string): boolean {
  const groups = new Map<string, Rule[]>();
  let agents: string[] = [];
  let inRules = false;

  for (const raw of robotsTxt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (key === "user-agent") {
      if (inRules) agents = [];
      inRules = false;
      agents.push(value.toLowerCase());
      for (const a of agents) if (!groups.has(a)) groups.set(a, []);
    } else if (key === "allow" || key === "disallow") {
      inRules = true;
      if (!value) continue;
      for (const a of agents) groups.get(a)!.push({ allow: key === "allow", pattern: value });
    }
  }

  const rules = groups.get(userAgent.toLowerCase()) ?? groups.get("*") ?? [];
  let best: Rule | undefined;
  for (const r of rules) {
    if (!toRegex(r.pattern).test(path)) continue;
    if (!best || r.pattern.length > best.pattern.length || (r.pattern.length === best.pattern.length && r.allow)) best = r;
  }
  return best ? best.allow : true;
}

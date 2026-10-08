import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// production ต้อง deploy ผ่าน GitHub Actions หลัง CI ผ่านเท่านั้น (.github/workflows/deploy.yml)
describe("การตั้งค่า deploy", () => {
  const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
  const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");

  it("Vercel ไม่ deploy main เองจาก git push", () => {
    expect(vercel.git.deploymentEnabled.main).toBe(false);
  });

  it("function อยู่ region สิงคโปร์ ใกล้ Supabase", () => {
    expect(vercel.regions).toEqual(["sin1"]);
  });

  it("deploy หลัง CI บน main ผ่านเท่านั้น", () => {
    expect(workflow).toMatch(/workflow_run:\s*\n\s*workflows: \[CI\]/);
    expect(workflow).toMatch(/branches: \[main\]/);
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(workflow).toContain("ref: ${{ github.event.workflow_run.head_sha || github.sha }}");
  });
});

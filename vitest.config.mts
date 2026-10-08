import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "generated/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "html"],
      // logic + component ที่ unit test ได้; หน้า app/ และไฟล์ที่ยิง DB ตรวจด้วย e2e แทน
      include: ["lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "lib/db.ts", "lib/promos/queries.ts", "lib/**/types.ts"],
      // CI ล้มถ้า coverage ต่ำกว่านี้ (function เป็นตัวหลัก)
      thresholds: { functions: 95, lines: 90, statements: 90, branches: 85 },
    },
  },
});

import type { NextConfig } from "next";
import { MONTHS } from "./lib/months";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // เลิกแยกหน้าตามเดือน (โปรเกือบทั้งหมดใช้ได้ทุกเดือน) ลิงก์เก่า /october และ /birthday/october ไปหน้าแรก
  async redirects() {
    const months = MONTHS.map((m) => m.slug).join("|");
    return [
      { source: "/birthday/:month", destination: "/", permanent: true },
      { source: `/:month(${months})`, destination: "/", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

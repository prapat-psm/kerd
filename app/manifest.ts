import type { MetadataRoute } from "next";

// ติดตั้งลงหน้าจอหลักแบบ PWA ไฟล์ไอคอนสร้างจาก app/icon.svg ด้วย `npm run icons`
const BG = "#FFF8F5"; // --bg โหมดสว่าง (docs/branding.md)

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kerd · เกิด: โปรวันเกิดและเดือนเกิด",
    short_name: "Kerd",
    description: "รวมโปรวันเกิดและเดือนเกิด พร้อมวิธีใช้สิทธิ์และวันที่ตรวจล่าสุด",
    lang: "th",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BG,
    theme_color: BG,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

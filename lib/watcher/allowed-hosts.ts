/**
 * host ที่ watcher ยิงได้ แก้ผ่าน PR เท่านั้น (ไม่อ่านจาก DB)
 * ถ้า DB ถูกแก้ sourceUrl ไปชี้ที่อื่น watcher ก็จะไม่ยิง
 * ห้ามใส่ Facebook/Instagram/LINE/TikTok/Lemon8
 */
export const ALLOWED_HOSTS: readonly string[] = [
  "www.mkrestaurant.com",
  "www.majorcineplex.com",
  "www.sizzler.co.th",
  "www.gsb.or.th",
  "www.watsons.co.th",
  "barbqplaza.com",
  "www.pizzahut.co.th",
  "www.snp1344.com",
  "www.bangchakgreenmiles.com",
  "www.cutepress.com",
  "www.aeon.co.th",
  "www.dreamworld.co.th",
];

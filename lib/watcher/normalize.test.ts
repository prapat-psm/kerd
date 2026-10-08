import { describe, expect, it } from "vitest";
import { contentHash, pageToText } from "./normalize";

describe("pageToText", () => {
  it("ตัด script/style/comment/tag และยุบช่องว่าง", () => {
    const html = `<html><head><style>.a{}</style><script>alert("x")</script></head>
      <body><!-- ad --><h1>โปร  วันเกิด</h1><p>ลด&nbsp;50%&amp;ฟรี</p></body></html>`;
    expect(pageToText(html)).toBe("โปร วันเกิด ลด 50%&ฟรี");
  });

  it("ไม่สนส่วนที่เปลี่ยนทุกครั้ง เช่น nonce/csrf ใน attribute", () => {
    const a = `<p data-nonce="111">สมาชิกรับฟรี 1 แก้ว</p>`;
    const b = `<p data-nonce="999">สมาชิกรับฟรี 1 แก้ว</p>`;
    expect(pageToText(a)).toBe(pageToText(b));
  });

  it("ตัด noscript, svg และ template", () => {
    expect(pageToText("<noscript>x</noscript><svg><text>y</text></svg><template>z</template>ok")).toBe("ok");
  });
});

describe("contentHash", () => {
  it("sha256 hex ที่คงที่", () => {
    expect(contentHash("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

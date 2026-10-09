// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./json-ld";

describe("JsonLd", () => {
  it("render script ld+json ที่ escape แล้ว", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "<b>" }} />);
    const s = container.querySelector('script[type="application/ld+json"]')!;
    expect(s.innerHTML).toBe('{"@type":"Thing","name":"\\u003cb>"}');
  });
});

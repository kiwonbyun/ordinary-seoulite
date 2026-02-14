import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layout = readFileSync("src/app/layout.tsx", "utf-8");

describe("RootLayout base shell", () => {
  it("keeps only global html/body wrapper", () => {
    expect(layout).toMatch(/<html/);
    expect(layout).toMatch(/<body/);
    expect(layout).not.toMatch(/site-shell/);
  });
});

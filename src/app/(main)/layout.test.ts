import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layout = readFileSync("src/app/(main)/layout.tsx", "utf-8");

describe("MainLayout theme shell", () => {
  it("renders a themed main shell wrapper", () => {
    expect(layout).toMatch(/data-testid="site-shell"/);
    expect(layout).toMatch(/theme-surface/);
  });
});

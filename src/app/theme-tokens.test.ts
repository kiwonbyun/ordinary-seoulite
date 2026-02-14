import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf-8");

describe("sunset theme tokens", () => {
  it("defines core sunset tokens", () => {
    expect(css).toMatch(/--bg-base:/);
    expect(css).toMatch(/--bg-surface:/);
    expect(css).toMatch(/--text-primary:/);
    expect(css).toMatch(/--accent-warm:/);
    expect(css).toMatch(/--accent-rose:/);
    expect(css).toMatch(/--accent-deep:/);
  });

  it("defines reduced-motion handling", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  });
});

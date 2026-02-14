import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf-8");

describe("landing hero image styles", () => {
  it("defines desktop and mobile hero image classes", () => {
    expect(css).toMatch(/\.landing-hero-media/);
    expect(css).toMatch(/main-image\.webp/);
    expect(css).toMatch(/jong-ro\.webp/);
  });
});

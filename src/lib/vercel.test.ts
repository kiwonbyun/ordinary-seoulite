import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync("vercel.json", "utf-8"));

describe("vercel config", () => {
  it("sets function region to iad1", () => {
    expect(JSON.stringify(config)).toMatch(/iad1/);
  });
});

import { describe, expect, it } from "vitest";
import { tipPresets } from "./stripe";

describe("tip presets", () => {
  it("includes three tiers", () => {
    expect(tipPresets.length).toBe(3);
  });
});

import { describe, expect, it } from "vitest";
import { getPublicEnv } from "./env";

describe("getPublicEnv", () => {
  it("throws when required env is missing", () => {
    expect(() => getPublicEnv({})).toThrow("Missing Supabase public env");
  });

  it("returns parsed values", () => {
    expect(getPublicEnv({ VITE_SUPABASE_URL: "x", VITE_SUPABASE_ANON_KEY: "y" })).toEqual({
      url: "x",
      anon: "y",
    });
  });
});


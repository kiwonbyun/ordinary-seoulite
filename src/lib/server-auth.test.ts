import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined),
  })),
}));

import { getSessionUserFromCookies } from "./server-auth";

describe("getSessionUserFromCookies", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("returns null without throwing when access token cookie is missing", async () => {
    await expect(getSessionUserFromCookies()).resolves.toBeNull();
  });
});

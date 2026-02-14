import { describe, expect, it } from "vitest";
import { validatePublicEnv, validateServerEnv, validateSupabaseServerEnv } from "./env";

describe("validateEnv", () => {
  it("throws when required server env vars are missing", () => {
    expect(() => validateServerEnv({})).toThrow(/Missing env:/);
  });

  it("returns normalized env when required vars exist", () => {
    const server = validateServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_123",
      SUPABASE_SECRET_KEY: "sb_secret_123",
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
    expect(server.supabaseUrl).toBe("https://example.supabase.co");
    expect(server.supabaseSecretKey).toBe("sb_secret_123");

    const client = validatePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_123",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
    expect(client.supabasePublishableKey).toBe("sb_publishable_123");

    const supabaseServer = validateSupabaseServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "sb_secret_123",
    });
    expect(supabaseServer.supabaseUrl).toBe("https://example.supabase.co");
  });
});

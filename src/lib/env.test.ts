import { describe, expect, it } from "vitest";
import { validatePublicEnv, validateServerEnv } from "./env";

describe("validateEnv", () => {
  it("throws when required server env vars are missing", () => {
    expect(() => validateServerEnv({})).toThrow(/Missing env:/);
  });

  it("returns normalized env when required vars exist", () => {
    const server = validateServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      SUPABASE_SERVICE_ROLE_KEY: "service",
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_123",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
    expect(server.supabaseUrl).toBe("https://example.supabase.co");

    const client = validatePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
    expect(client.supabaseAnonKey).toBe("anon");
  });
});

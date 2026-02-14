import { describe, expect, it } from "vitest";
import { resolveRedirectTarget } from "@/lib/auth-redirect";

describe("login redirect defaults", () => {
  it("defaults to root for direct /login entry", () => {
    expect(resolveRedirectTarget(undefined, "/")).toBe("/");
  });
});

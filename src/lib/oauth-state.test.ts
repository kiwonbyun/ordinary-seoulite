import { describe, expect, it } from "vitest";
import { OAUTH_STATE_COOKIE, createOAuthState, verifyOAuthState } from "./oauth-state";

describe("oauth-state", () => {
  it("creates a non-empty state value", () => {
    const state = createOAuthState();
    expect(state.length).toBeGreaterThanOrEqual(32);
  });

  it("verifies equal states", () => {
    const state = "abc123";
    expect(verifyOAuthState(state, state)).toBe(true);
  });

  it("rejects missing or different states", () => {
    expect(verifyOAuthState("", "abc")).toBe(false);
    expect(verifyOAuthState("abc", "")).toBe(false);
    expect(verifyOAuthState("abc", "xyz")).toBe(false);
  });

  it("exports stable cookie metadata", () => {
    expect(OAUTH_STATE_COOKIE).toBe("os-oauth-state");
  });
});

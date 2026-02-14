import { randomBytes, timingSafeEqual } from "node:crypto";

export const OAUTH_STATE_COOKIE = "os-oauth-state";
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

export function createOAuthState() {
  return randomBytes(24).toString("base64url");
}

export function verifyOAuthState(expected: string | null, actual: string | null) {
  if (!expected || !actual) return false;

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

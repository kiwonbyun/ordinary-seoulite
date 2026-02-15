import { createHash, randomBytes } from "node:crypto";

export function generatePkceCodeVerifier() {
  return randomBytes(32).toString("base64url");
}

export function generatePkceCodeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

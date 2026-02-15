import { describe, expect, it } from "vitest";
import { generatePkceCodeChallenge, generatePkceCodeVerifier } from "./pkce";

describe("pkce", () => {
  it("creates a verifier with enough entropy", () => {
    const verifier = generatePkceCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
  });

  it("creates a deterministic challenge for a verifier", () => {
    const challenge = generatePkceCodeChallenge("abc123");
    expect(challenge).toBe("bKE9UspwyIPg8LsQHkJaiehiTeUdstI5JZOvaoQRgJA");
  });
});

import { describe, expect, it } from "vitest";
import { boardPostSchema } from "./schemas";

describe("boardPostSchema", () => {
  it("rejects short title", () => {
    const result = boardPostSchema.safeParse({
      type: "question",
      title: "abc",
      body: "x".repeat(40),
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid payload", () => {
    const result = boardPostSchema.safeParse({
      type: "review",
      title: "Hongdae food spots worth visiting",
      body: "x".repeat(60),
      locationTag: "Hongdae",
    });

    expect(result.success).toBe(true);
  });
});


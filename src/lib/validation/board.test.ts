import { describe, expect, it } from "vitest";
import { boardPostSchema } from "./board";

describe("boardPostSchema", () => {
  it("rejects empty title/body", () => {
    const result = boardPostSchema.safeParse({ title: "", body: "" });
    expect(result.success).toBe(false);
  });
});
